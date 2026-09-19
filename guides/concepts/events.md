---
title: Events
sidebar:
  order: 20
---

Native events are dispatched through `Events.on`. Every event name and its exact
argument tuple is generated from the runtime's own registrations, so the
`EventMap` in the API reference is the complete list — there are no undocumented
events.

```js
Events.on("playerConnect", (player) => { /* ... */ });
Events.once("horseSpawn", (horse) => { /* ... */ });

const off = Events.on("playerChat", handler);
off(); // or Events.off("playerChat", handler)
```

A handler may be `async`; the returned promise is awaited.

## Server events

| Event | Arguments |
| --- | --- |
| `playerConnect` | `player` |
| `playerDisconnect` | `player` |
| `playerChat` | `player`, `text` |
| `playerCommand` | `player`, `command`, `args` |
| `horseSpawn` | `horse` |
| `horseDestroy` | `horse` |
| `horseMount` | `horse`, `player \| null` |
| `horseDismount` | `horse`, `player \| null` |
| `questTrackingChanged` | `quest`, `player`, `tracked` |

Plus `resourceStart` and `resourceStop`, which both environments raise.

`questTrackingChanged` is reported by the player's own client rather than
decided here: following a quest is a choice made in the game's journal, and the
server cannot refuse it. The client raises its own `questTrackingChanged` with
`questKey` and `tracked` first, on the machine it happened on. The **Quests**
guide covers the whole feature.

## Handles are valid inside the handler

Every event hands you a live handle, and the two teardown events deliberately
fire while their subject can still be read:

- `playerDisconnect` runs **before** the body is destroyed, so `player.nickname`
  still answers. This is the only notice a dropped connection gives, so anything
  keyed on a player has to be cleaned up here.
- `horseDestroy` runs while the horse is still resolvable, so its rider and name
  can be read one last time.

Do not store a handle and use it later. Store the id and resolve it again:

```js
const seen = new Set();

Events.on("playerConnect", (player) => seen.add(player.id));
Events.on("playerDisconnect", (player) => seen.delete(player.id));

// later
for (const id of seen) {
  const player = Player.getById(id);
  if (player) Chat.sendToPlayer(player, "still here");
}
```

`Player.getById` and `Horse.getById` return `null` for an id that no longer names
anyone, which is what makes this safe.

## A player handle can arrive before the player is ready

`playerConnect` fires as soon as the body exists, which is before their client
has reported a pose or their character's state. Until then the body has no
position worth reading:

```js
Events.on("playerConnect", (player) => {
  if (!player.ready) {
    // No pose and no soul yet. Their position is the world origin.
  }
});
```

`player.ready` turns true once both have arrived, and that is what every other
client waits for before drawing them.

## Events between resources

Resource-defined events share the same bus, so a name of your own works without
registration. Prefix them, since the namespace is shared:

```js
Events.on("mygm:round-start", (round) => { /* ... */ });
```
