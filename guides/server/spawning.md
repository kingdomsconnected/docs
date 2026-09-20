---
title: Spawning
sidebar:
  order: 34
---

Kingdom Come: Deliverance II has no spawn-point system. Every client asks the
game for the identical map start, so without a resource answering, everybody
who joins arrives on the same tile facing the same way.

`playerSpawning` is where that is decided. It is raised while the joining
player is still behind their loading screen, and their client holds there
until the answer comes back — so the body is moved before anyone, including
its owner, has seen it.

```js
Events.on("playerSpawning", (player) => {
  player.spawn({ x: -1423.5, y: 2871.2, z: 118.0 });
});
```

That is the whole feature. Everything below is detail.

## Choosing where

`player.spawn(position, rotation?)` takes a `Vector3` or any object with `x`,
`y` and `z`. The optional rotation is a `Quaternion`, or a `Vector3` of Euler
degrees — so `new Vector3(0, 0, 90)` faces them a quarter-turn around Z.

```js
const spawnPoints = [
  { name: "Tavern yard",  position: { x: -1423.5, y: 2871.2, z: 118.0 }, yaw: 180 },
  { name: "Mill",         position: { x: -1180.0, y: 2650.0, z: 104.5 }, yaw: 0 },
];

Events.on("playerSpawning", (player) => {
  const point = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
  player.spawn(point.position, new Vector3(0, 0, point.yaw));
});
```

Coordinates are the level's own — the ones the client's `/tp` panel reports.
There is no built-in list of points: a list with weights, tags or per-faction
filtering is a dozen lines of JavaScript, and it belongs in the game mode that
has an opinion about factions. The default game mode ships an empty
`spawns.ts` with a weighted picker to copy.

## Handlers run synchronously

The player's client is blocked on the answer, so the choice has to be made in
the handler itself:

```js
// Works: the placement is named before the handler returns.
Events.on("playerSpawning", (player) => {
  player.spawn(pickFor(player.nickname));
});

// Does NOT decide the spawn: the handler already returned.
Events.on("playerSpawning", async (player) => {
  const point = await database.lookupLastPosition(player.nickname);
  player.spawn(point); // a visible teleport, after they have arrived
});
```

If you need to await something, do the lookup earlier — `playerConnect` fires
well before the level has finished loading — and have the handler read the
result out of a map.

A handler that names no placement leaves the player at the level's own start
point. So does a handler that throws: the join still completes, and the
failure costs that player their spawn point rather than the session.

## Landing safely

A spawn destination is usually somewhere the joining client has not streamed
in yet, so their client holds the body still until there is real ground under
it, then releases. Two things follow:

- Give it a position **on the ground**, not floating. The client snaps onto
  whatever it finds within a couple of metres, so a coordinate read off the
  map is fine, but one fifty metres up is not.
- A destination with nothing under it at all releases after about two seconds
  rather than hanging. The body then falls, as it would anywhere else.

## After they arrive

`playerSpawned` fires once the body is really standing there with its ground
loaded. That is the first moment anything is worth sending them:

```js
Events.on("playerSpawned", (player) => {
  Chat.sendToPlayer(player, `Welcome, ${player.nickname}.`);
  player.giveItem("apple", 3);
});
```

Use it rather than `playerConnect` for anything the player should see.
`playerConnect` fires while they are still loading the level — a chat line
sent there lands before there is anything to read it on.

| Event | When | Use it for |
| --- | --- | --- |
| `playerConnect` | Body exists; level still loading | Bookkeeping, async lookups |
| `playerSpawning` | Client waiting, nothing visible | Choosing the placement |
| `playerSpawned` | Standing, ground loaded | Welcome, kit, markers |

## Moving someone later

`player.spawn` works outside a `playerSpawning` handler too, and is the right
verb whenever the destination may not be loaded — it keeps the ground hold.
`player.teleport` is the lighter one for somewhere already streamed in, and
takes a display label the client shows in its own panel:

```js
player.spawn({ x: -1423.5, y: 2871.2, z: 118.0 });   // holds for ground
player.teleport({ x: 100, y: 200, z: 30 }, "Kuttenberg");
```

> **Authority:** like every other player verb, both are requests to the owning
> client — see **Players**. A `true` return means the request was sent, not
> that the body has moved.

## Death

There is no automatic respawn and no spawn hook for one. A death raises
`playerDied`; reviving is `player.revive()`, which brings the body back where
it fell. Move them afterwards if that is not what you want:

```js
Events.on("playerDied", (player) => {
  player.revive();
  player.spawn({ x: -1423.5, y: 2871.2, z: 118.0 });
});
```
