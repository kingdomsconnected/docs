---
title: Spawn points and respawning
description: Choose where joining players arrive with playerSpawning, move them later with spawn or teleport, and bring them back after a death.
sidebar:
  order: 31
---

The game has no spawn-point system. Every client asks it for the same map
start, so without a resource answering, everyone who joins arrives on the same
tile facing the same way. `playerSpawning` is where your gamemode decides
otherwise.

```ts title="src/server/index.ts"
Events.on("playerSpawning", (player) => {
  player.spawn({ x: -1423.5, y: 2871.2, z: 118.0 });
});
```

The event is raised while the joining player is still behind their loading
screen, and their client holds there until the answer comes back. So the body
is placed before anyone, including its owner, has seen it.

## Choosing where

[`player.spawn(position, rotation?)`](../../../reference/server/classes/Player.md#spawn)
takes a `Vector3` or any object with `x`, `y` and `z`. The optional rotation is
a `Quaternion`, or a `Vector3` of Euler degrees, so `new Vector3(0, 0, 90)`
turns them a quarter around the vertical axis. [Positions, rotations and vectors](../../../core-concepts/math/) explains the coordinate system.

Coordinates are the level's own, the ones the default gamemode's `/tp`
reports. There is no built-in list of points. The default
gamemode's `src/server/spawns.ts` ships an empty one with a weighted picker,
which is a good starting point:

```ts title="src/server/spawns.ts"
export interface SpawnPoint {
  name: string;
  position: Partial<Vector3>;
  yaw?: number;     // degrees around Z
  tags?: string[];  // team, faction, district...
  weight?: number;  // share of the draw; 0 keeps it listed but unused
}

export const spawnPoints: SpawnPoint[] = [
  { name: "Tavern yard", position: { x: -1423.5, y: 2871.2, z: 118.0 }, yaw: 180 },
  { name: "Mill", position: { x: -1180.0, y: 2650.0, z: 104.5 }, weight: 2 },
];

/** One point drawn by weight, limited to `tag` when given. Null when nothing matches. */
export function pickSpawnPoint(tag?: string): SpawnPoint | null {
  const candidates = tag ? spawnPoints.filter((point) => point.tags?.includes(tag)) : spawnPoints;
  const total = candidates.reduce((sum, point) => sum + Math.max(0, point.weight ?? 1), 0);
  if (total <= 0) return null;

  let remaining = Math.random() * total;
  for (const point of candidates) {
    remaining -= Math.max(0, point.weight ?? 1);
    if (remaining <= 0) return point;
  }
  return candidates[candidates.length - 1] ?? null;
}
```

```ts title="src/server/index.ts"
import { pickSpawnPoint } from "./spawns.js";

Events.on("playerSpawning", (player) => {
  const point = pickSpawnPoint();
  if (point) {
    player.spawn(point.position, new Vector3(0, 0, point.yaw ?? 0));
  }
});
```

:::caution
The coordinates above are placeholders. A guessed coordinate puts somebody
inside a hillside. Stand where you want the point, read your position, and copy
it.
:::

## Handlers run synchronously

The joining client is blocked on the answer, so the server collects it while
your handler runs and sends it the moment the handler returns. Anything decided
after that is too late:

```ts
const lastPositions = new Map<string, Vector3>();

// Works: the answer is named before the handler returns.
Events.on("playerSpawning", (player) => {
  const saved = lastPositions.get(player.steamId);
  if (saved) player.spawn(saved);
});
```

If you need to load a saved position from a database or a file, start the load
in `playerConnect` (which fires well before the level has finished loading on
their machine), keep the result in a map like `lastPositions`, and read it
synchronously here. An `async` handler that awaits first and calls `spawn`
afterwards does not choose the spawn: by then the player has already arrived
at the level start, and your `spawn` becomes a visible move.

A handler that names no placement leaves the player at the level's own start
point. So does a handler that throws: the join still completes, and the error
costs that player their spawn point rather than their session.

:::note
`playerSpawning` fires once per connection, when the player joins. A revive
does not raise it again (see [Death and revival](#death-and-revival) below).
:::

## Landing safely

A spawn destination is usually somewhere the joining client has not streamed
in yet. So `spawn` does more than move the body: the client probes for ground a
couple of metres around the height you gave, snaps onto it, and holds the body
still until there is real ground under it, for up to about three seconds. Two
things follow:

- Give it a position **on the ground**, not floating. A coordinate read off
  the map is fine; one fifty metres up is not.
- A destination with nothing under it releases after the hold runs out, and
  the body falls as it would anywhere else.

`playerSpawned` fires once the body really is standing there with its ground
loaded. That is the first moment to hand out a kit or send a welcome.

## Moving someone later

`spawn` also works outside `playerSpawning`. Then it moves a player who is
already in the world, which they see, but it keeps the ground hold. Use it
whenever the destination may not be loaded on their machine: across the map,
into a building interior, back to a base.

[`player.teleport(position, label?)`](../../../reference/server/classes/Player.md#teleport)
is the lighter move for somewhere nearby. It uses your height exactly, with no
ground probe, and takes an optional label (up to 64 characters) that the client
shows in its own teleport panel:

```ts
player.spawn({ x: -1423.5, y: 2871.2, z: 118.0 });            // far: holds for ground
player.teleport({ x: -1410.0, y: 2880.0, z: 118.2 }, "Stables"); // near: exact height
```

Both return `true` when the request went out, not when the body has moved. See
[Teleport, kick and other player actions](../actions/) for why.

## Death and revival

There is no automatic respawn. When a player's client reports a death the
server raises [`playerDied`](../../../reference/server/interfaces/EventMap.md),
and the body stays down until something calls
[`player.revive()`](../../../reference/server/classes/Player.md#revive). The
default gamemode revives on the spot:

```ts
Events.on("playerDied", (player) => {
  Chat.sendToPlayer(player, "You died. Getting you back up.");
  player.revive();
});
```

`revive` brings the body back where it fell. It returns `false` when the player
has disconnected, when no death was reported, or when a revival was already
requested for this death, so calling it twice is harmless.

To respawn somewhere else, revive and then move them. No event reports the
revive landing on their machine, so give it a moment and resolve the player
again by id, since they may have left in between:

```ts title="src/server/respawn.ts"
import { pickSpawnPoint } from "./spawns.js";

const RESPAWN_DELAY_MS = 5000;

Events.on("playerDied", (player) => {
  const id = player.id;
  Chat.sendToPlayer(player, "You will respawn in 5 seconds.");

  setTimeout(() => {
    const target = Player.getById(id);
    if (!target || !target.revive()) return;

    const point = pickSpawnPoint();
    if (point) {
      setTimeout(() => Player.getById(id)?.spawn(point.position), 500);
    }
  }, RESPAWN_DELAY_MS);
});
```

## Related

- [Player join and leave events](../lifecycle/)
- [Teleport, kick and other player actions](../actions/)
- [Virtual worlds](../../../core-concepts/virtual-worlds/), for per-world spawns
- [Build a team capture-zone mode](../../../tutorials/team-rounds/), which spawns by team
