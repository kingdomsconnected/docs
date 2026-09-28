---
title: Join, spawn and respawn
description: Place players when they join, bring them back after a death, and keep track of who is connected without holding stale handles.
sidebar:
  label: Join, spawn, respawn
  order: 30
---

Every connection raises the same run of events, from the first handle to the
last. Hang your gamemode code off the right one.

```ts
Events.on("playerSpawning", (player) => {
  player.spawn({ x: -1423.5, y: 2871.2, z: 118.0 });
});

Events.on("playerSpawned", (player) => {
  Chat.sendToPlayer(player, `Welcome, ${player.nickname}.`);
});

Events.on("playerDisconnect", (player) => {
  console.log(`${player.nickname} left`);
});
```

## The order of events

| Event | What is true | Use it for |
| --- | --- | --- |
| `playerConnect` | The body exists. `player.ready` is false and the level is still loading on their machine. | Bookkeeping, starting async lookups |
| `playerSpawning` | Their client waits behind its loading screen for a place to stand. Fires once per connection. | Choosing the spawn point, synchronously |
| `playerSpawned` | They stand in the world and the ground under them has loaded. | Welcome lines, starting kit, markers |
| `playerDied` | Their client reported a death. The body stays down. | Reviving, respawn timers |
| `playerDisconnect` | They are leaving. The handle still reads. | Cleaning up anything keyed on the player |

Anything the player should see belongs in `playerSpawned`: a chat line sent
from `playerConnect` arrives while they still look at a loading screen. The
full list is in [Events](../../core-concepts/events/#server-events).

## Wait for `ready`

Until [`player.ready`](../../reference/server/classes/Player.md#ready) is true
the owner has not reported a pose or a character, so position, health, stats
and skills read as zero. There is no event for it; `playerSpawned` is the first
moment you can rely on it. Check it in timers and commands:

```ts
for (const other of Player.all()) {
  if (!other.ready) continue; // still loading, position is meaningless
  console.log(`${other.nickname} is at ${other.position}`);
}
```

## Choose a spawn point

The game has no spawn-point system: without a `playerSpawning` handler everyone
arrives at the level's own start. [`player.spawn(position, rotation?)`](../../reference/server/classes/Player.md#spawn)
takes a `Vector3` or any `{ x, y, z }`, and an optional `Quaternion` or `Vector3`
of Euler degrees (`new Vector3(0, 0, 90)` turns a quarter around the vertical).
See [Positions and vectors](../../core-concepts/math/).

Keep your points in one module so join and respawn share them (the default
gamemode's `src/server/spawns.ts` adds weights and tags):

```ts title="src/server/spawns.ts"
export interface SpawnPoint {
  position: Partial<Vector3>;
  yaw?: number; // degrees around Z
}

export const spawnPoints: SpawnPoint[] = [
  { position: { x: -1423.5, y: 2871.2, z: 118.0 }, yaw: 180 },
  { position: { x: -1180.0, y: 2650.0, z: 104.5 } },
];

export function pickSpawnPoint(): SpawnPoint | null {
  return spawnPoints[Math.floor(Math.random() * spawnPoints.length)] ?? null;
}
```

```ts title="src/server/index.ts"
import { pickSpawnPoint } from "./spawns.js";

Events.on("playerSpawning", (player) => {
  const point = pickSpawnPoint();
  if (point) player.spawn(point.position, new Vector3(0, 0, point.yaw ?? 0));
});
```

Rules for the handler:

- **It must answer synchronously.** The answer is sent the moment the handler
  returns. An `async` handler that awaits and then calls `spawn` is too late: the
  player has already landed at the level start and sees a move. Load saved
  positions in `playerConnect`, keep them in a map, and read the map here.
- A handler that names no placement, or throws, leaves the player at the level
  start. The join still completes.
- **Put the point on the ground.** `spawn` probes for ground a couple of metres
  around your height and holds the body still for up to about three seconds
  until the ground has loaded. A point with nothing under it falls after that.
- Coordinates are the level's own, as the default gamemode's `/tp` reports them.
  Stand where you want the point and copy your position; a guessed one puts
  somebody inside a hillside.

## Move someone later

| Call | Use it for |
| --- | --- |
| `player.spawn(position, rotation?)` | Anywhere the ground may not be loaded on their machine: across the map, into an interior. Keeps the ground hold. |
| [`player.teleport(position, label?)`](../../reference/server/classes/Player.md#teleport) | Short hops. Uses your height exactly. The label (up to 64 characters) shows in their teleport panel. |

Both return `true` when the request went out, not when the body has moved. See
[Teleport, kick and other player actions](../actions/).

## Respawn after a death

There is no automatic respawn. The body stays down after `playerDied` until
something calls [`player.revive()`](../../reference/server/classes/Player.md#revive),
which brings it back where it fell. It returns `false` when the player has left,
no death was reported, or a revival is already on its way, so calling it twice
is harmless. A revive does not raise `playerSpawning` again.

To respawn somewhere else, revive and then move them. No event reports the
revive landing, so wait a moment and resolve the player again by id:

```ts title="src/server/respawn.ts"
import { pickSpawnPoint } from "./spawns.js";

Events.on("playerDied", (player) => {
  const id = player.id;
  Chat.sendToPlayer(player, "You will respawn in 5 seconds.");

  setTimeout(() => {
    const target = Player.getById(id);
    if (!target || !target.revive()) return;

    const point = pickSpawnPoint();
    if (point) setTimeout(() => Player.getById(id)?.spawn(point.position), 500);
  }, 5000);
});
```

## Find players

| Call or property | What it gives |
| --- | --- |
| [`Player.all()`](../../reference/server/classes/Player.md#all) | Every connected player, in no order, including those not `ready`. |
| [`Player.getById(id)`](../../reference/server/classes/Player.md#getbyid) | One player by network entity id, or `null`. |
| `player.id` | Network entity id, unique while the body exists. |
| `player.playerIndex` | Connection slot (65535 while unassigned). Reused by the next joiner: fine for `/tp 3`, wrong for storage. |
| `player.nickname` | Name they connected under. Not unique, not authenticated. |
| `player.steamId` | Survives a reconnect. Empty when unavailable. |

## Store ids, not handles

A `Player` handle resolves the live body on every read. A handle to someone
who left reads as gone (empty `nickname`, zeroed stats) instead of throwing, so
a handle kept in a long-lived map quietly gives wrong answers. Keep `player.id`
and resolve it with `Player.getById` when you need the player, including after
every `await`:

```ts
async function loadProfile(steamId: string): Promise<{ welcome: string }> {
  return { welcome: `Welcome back (${steamId})` };
}

Events.on("playerConnect", async (player) => {
  const id = player.id;
  const profile = await loadProfile(player.steamId);

  const stillHere = Player.getById(id);
  if (!stillHere) return; // they left while we were waiting
  stillHere.state.set("welcome", profile.welcome, { scope: "server" });
});
```

## When a player leaves

`playerDisconnect` runs before the body is destroyed, so `nickname`,
`position` and the rest still answer. Timeouts, crashes and kicks all come
through it, and it is the only place to release anything keyed on that player.

The server also cleans up on its own: a rider leaves the saddle (you get
`horseDismount`), an open dialogue closes with reason 3, and an open vendor
closes with reason 4.

## Related

- [Teleport, kick and other player actions](../actions/), for moving and kicking
- [Read health, stats and skills](../stats/), for what `ready` unlocks
- [Entity state bags](../../core-concepts/state/), for data attached to a player
- [Virtual worlds](../../core-concepts/virtual-worlds/), for per-world spawns
- [Build a team capture-zone mode](../../tutorials/team-rounds/), which spawns by team
