---
title: Player join and leave events
description: The events a player's connection goes through, from the first handle to the last, and how to keep track of players safely.
sidebar:
  order: 30
---

Every connection raises the same short run of events: the player's body comes
into existence, gets somewhere to stand, lands, and eventually leaves. Most
gamemode code hangs off one of these four moments, so it pays to know what is
true at each of them.

```ts title="src/server/index.ts"
Events.on("playerConnect", (player) => {
  console.log(`${player.nickname} connected as entity ${player.id}`);
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
| `playerSpawning` | Their client is waiting behind its loading screen for a place to stand. | Choosing the spawn point, synchronously |
| `playerSpawned` | They are standing in the world and the ground under them has loaded. | Welcome lines, starting kit, markers |
| `playerDisconnect` | They are leaving. The handle still reads. | Cleaning up anything keyed on the player |

[Spawn points and respawning](../spawning/) covers `playerSpawning` in
detail. The full list of server events is in [Events](../../../core-concepts/events/)
and in [EventMap](../../../reference/server/interfaces/EventMap.md).

:::caution
Anything the player should see belongs in `playerSpawned`, not
`playerConnect`. A chat line sent from `playerConnect` arrives while they are
still looking at a loading screen.
:::

## `ready`: when a player is worth reading

`playerConnect` fires as soon as the body can be resolved to a handle, which is
before its owner has reported a pose or a character. Until then position,
health, stats and skills all read as zero. [`player.ready`](../../../reference/server/classes/Player.md#ready)
turns true once both have arrived, which is also what every other client waits
for before drawing that player.

There is no event for `ready` itself. In practice `playerSpawned` is the first
moment you can rely on it, and anything that runs on a timer or on a command
should check it:

```ts
for (const other of Player.all()) {
  if (!other.ready) continue; // still loading, position is meaningless
  console.log(`${other.nickname} is at ${other.position}`);
}
```

## Listing and finding players

[`Player.all()`](../../../reference/server/classes/Player.md#all) returns one
handle per connected player, in no particular order, and includes players who
are not `ready` yet. [`Player.getById(id)`](../../../reference/server/classes/Player.md#getbyid)
looks one up by network entity id and returns `null` when nobody has it.

Two identifiers are worth knowing apart:

- `player.id` is the network entity id. It is unique for as long as the body
  exists, and it is what `getById` takes.
- `player.playerIndex` is the connection slot, a small number (65535 while
  none is assigned). It is stable for the session and reused by the next
  person to join, so
  it is handy for short commands (`/tp 3`) and wrong for anything stored.

`player.nickname` is the name they connected under. It is not unique and not
authenticated. For something that survives a reconnect, use `player.steamId`
(empty when it is unavailable).

## Store ids, not handles

A `Player` is a thin handle: every read resolves the live body again. That is
why a handle to someone who has left reads as gone (empty `nickname`, zeroed
stats) instead of crashing. It also means a handle kept in a long-lived
structure keeps "working" long after the player it named has gone, and quietly
gives you wrong answers.

Keep the id, and resolve it when you need the player:

```ts title="src/server/afk.ts"
const lastActive = new Map<number, number>();

Events.on("playerSpawned", (player) => {
  lastActive.set(player.id, Date.now());
});

Events.on("playerChat", (player) => {
  lastActive.set(player.id, Date.now());
});

// The only notice a dropped connection gives: clean up here.
Events.on("playerDisconnect", (player) => {
  lastActive.delete(player.id);
});

setInterval(() => {
  for (const [id, seen] of lastActive) {
    const player = Player.getById(id);
    if (player && Date.now() - seen > 15 * 60 * 1000) {
      player.kick("Idle for fifteen minutes");
    }
  }
}, 60 * 1000);
```

The same rule applies across an `await`. A player can leave while your handler
waits on something, so resolve the id again afterwards:

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

## Leaving

`playerDisconnect` runs before the body is destroyed, so `player.nickname`,
`player.position` and the rest still answer inside the handler. There is no
separate event for a timeout, a crash or a kick: all of them come through here,
and it is the only place to release anything keyed on that player.

The server also cleans up after a leaving player on its own: a rider is taken
out of the saddle (you get `horseDismount`), an open dialogue closes with
reason 3, and an open vendor closes with reason 4.

## Related

- [Spawn points and respawning](../spawning/)
- [Player health, stats and skills](../reading/)
- [Teleport, kick and other player actions](../actions/)
- [Entity state bags](../../../core-concepts/state/), for data attached to a player
