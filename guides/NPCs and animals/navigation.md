---
title: Find paths on the navigation mesh
description: Plan walks around walls, check whether a point is reachable, snap points to the ground and scatter spawns, with the level's own navigation mesh on the server.
sidebar:
  label: Navigation mesh
  order: 56
---

[`Navigation`](../../reference/server/variables/Navigation.md) reads the
level's own navigation mesh on the server: the walkable floors, bridges and
stairs the game's NPCs use. Ask it for a path, whether a point can be reached,
or where the floor is, without asking any client.

```ts
const gate = { x: 810, y: 1440, z: 31 };

if (Navigation.ready) {
  const path = Navigation.findPath(player.position, gate);
  if (path?.complete) console.log(`${path.points.length} corners, ${Math.round(path.length)} m`);
}
```

The mesh is the game's own data and does not ship with the server. Put the
level's `recast.pak` in the server's `files/` directory, as
[server.json settings](../../hosting-a-server/server-json/#modnavmesh)
describes. Without it, `Navigation.ready` is `false`, every query returns
`null` or `false`, and the server log names the path it searched.

## Queries

Points are world positions in metres, Z up, as a `Vector3` or a plain
`{ x, y, z }`; a missing component counts as zero.

| Call | Returns |
| --- | --- |
| `closestPoint(point)` | The nearest walkable point, or `null`. |
| `floorAt(point)` | The height of the floor there, or `null`. `point.z` picks the storey. |
| `findPath(from, to)` | `{ points, complete, length }`, or `null` when an end is off the mesh. |
| `canReach(from, to)` | `true` when a complete path exists. |
| `raycast(from, to)` | `{ hit, point }`: how far a straight walk along the ground gets. |
| `randomPoint(center, radius)` | A reachable point within `radius` (up to 512 m) of `center`, or `null`. |
| `randomPoint()` | A point anywhere on the level. |

A path that cannot reach `to` still comes back, with `complete: false`, ending
at the nearest point the mesh allows. `raycast` uses only the x and y of `to`
and follows the surface; `hit` is `true` when a wall, a drop or a locked door
stops it first.

Plan when a destination changes, not every tick. A path across a village costs
a fraction of a millisecond, one across the whole level a few milliseconds.

## Put things on the ground

Snap a guessed point to the floor before you spawn something on it:

```ts
const guess = { x: 820, y: 1450, z: 40 };
const spot = Navigation.closestPoint(guess, { searchRadius: 8, searchHeight: 12 });
if (spot) Npc.create({ position: spot });
```

Scatter spawns around a camp, each one somewhere a body can walk to:

```ts
const camp = { x: 812, y: 1440, z: 31 };
for (let i = 0; i < 5; i++) {
  const point = Navigation.randomPoint(camp, 30);
  if (point) Npc.create({ position: point });
}
```

## Query options

Every query takes an options object as its last argument:

| Option | Default | What it does |
| --- | --- | --- |
| `searchRadius` | 2 m, at most 64 | How far across the ground a point may be from the mesh. |
| `searchHeight` | 4 m, at most 128 | How far up or down. Keep it under a storey's height, or a point snaps to the floor above. |
| `doors` | `"unlocked"` | Which doors the walk goes through, below. |

| `doors` | Crosses |
| --- | --- |
| `unlocked` | Every door that is not locked, open or shut. How the game's NPCs treat doors. |
| `open` | Only doors standing open. |
| `any` | Every door, locked or not. |
| `none` | No doorway at all. |

A door's state is read off the door in the global world, so
[locking a door](../../world/doors-and-gates/) changes what the next query
finds. An option of the wrong type or out of range throws.

To pass options to `randomPoint` without a centre, leave the first two
arguments `undefined`:

```ts
const anywhere = Navigation.randomPoint(undefined, undefined, { doors: "open" });
```

## Quest-state overlays

The game ships replacement pieces of the mesh for places a quest changes: a
collapsed bridge, a cleared barricade. Read the names from the level, since
each level ships its own. `Navigation.overlays` lists them by
name, and `activeOverlays` lists the enabled ones, oldest first. The level
starts on its base mesh.

```ts
console.log(Navigation.overlays.join(", ")); // what this level ships

const overlay = Navigation.overlays[0];
if (overlay && !Navigation.enableOverlay(overlay)) console.log(`${overlay} stayed off`);
```

Enabling an overlay replaces the area it covers; where two overlap, the one
enabled last wins. `disableOverlay` gives the area back to the overlay before
it, or to the base mesh. Both return `false` for a name that does not apply,
and the server log says why. Nothing enables an overlay on its own: your
script decides which quest state the world is in.

## How NPCs use it

The game's own movement steers a body straight at its target and never finds a
way around anything. With a mesh loaded, `npc.moveTo` and `npc.patrol` plan
their route here and walk it corner by corner, for NPCs a client simulates and
for dormant ones alike. Their `pathfinding` option (`auto`, `game` or
`server`) picks who plans; see
[Move NPCs](../npc-orders/#walk-around-obstacles). Human NPCs open unlocked
doors in their own virtual world and leave them open. Animals and horses
avoid doorways. Generic navigation queries still use their `doors` option.

In the default gamemode, `/npcdemo escort` spawns an NPC that follows you and
`/npcdemo stand [auto|game|server]` switches its mode, to watch the difference.

## Validate an authored patrol

`Navigation.validatePatrol(routeOrId, { actor })` checks every leg of a
[named patrol](../patrol-routes/), including loop closure and both directions
of a ping-pong route. It returns `available`, `complete` and per-leg results.
Pass the actual NPC or horse to use its door rules and virtual world.
It does not check the approach from the actor's current position to point zero.

Unridden horses now use the same mesh for their own movement orders. See
[Horse navigation](../horses/#move-an-unridden-horse).

## Related

- [Move NPCs](../npc-orders/): orders, statuses and the `pathfinding` option.
- [Raycasts and nearby entities](../../world/raycasts/): rays against what a client has loaded, bodies and props included.
- [Doors and gates](../../world/doors-and-gates/): the doors a query walks through.
