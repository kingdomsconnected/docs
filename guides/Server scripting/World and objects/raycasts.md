---
title: Raycasts and nearby entities
description: Trace rays, find the ground and list nearby entities from the server, by asking a client or by reading the server's own replicas.
sidebar:
  order: 47
---

The server does not load the level. It knows where its own replicated
entities are (players, horses, props and so on), but it has no terrain, no
buildings and no idea what a ray would hit. When you need to know those
things, the server asks a player's client to look, and waits for the answer.
The [`World`](../../../reference/server/variables/World.md) global has four
calls that do this and one that does not need to.

```ts
async function groundUnder(player: Player, x: number, y: number): Promise<number | null> {
  const probe = await World.resolveGround(player, new Vector3(x, y, player.position.z));
  return probe.answered && probe.hit ? probe.hit.position.z : null;
}
```

## What asking a client means

`raycast`, `raycastAll`, `resolveGround` and `entitiesInRadius` all take a
`player` first. That player's machine runs the query. Three things follow:

1. **It is a round trip.** The call returns a promise, and the answer arrives
   a network ping later. Do not call these every tick.
2. **It only covers what that client has loaded.** Pick a player near the
   point in question. A point hundreds of metres away can read as empty
   world.
3. **It is the client's word.** Fine for placing a prop or a prompt; not fine
   for anything a player gains by lying about, like "is the target behind
   cover".

The promise always settles: with the answer, after five seconds without one,
or when the player leaves. It resolves either way; check `answered` and read
`reason` when it is false.

## Rays

```ts
async function canSee(player: Player, from: Vector3, to: Vector3): Promise<boolean | null> {
  const trace = await World.raycast(player, from, to, { mode: "cover" });
  if (!trace.answered) return null; // unknown, not "yes"
  return trace.hit === null;
}
```

`mode` picks one of the game's own three traces:

| Mode | Hits | Good for |
| --- | --- | --- |
| `cover` (default) | Static geometry, props, doors. Not bodies. | Line of sight. |
| `anything` | Everything, bodies included. | Picking what a player points at. |
| `ground` | Only surfaces a player could stand on. | Placement. |

A ray can be up to 4096 m long. `raycastAll` takes the same arguments plus
`maxHits` (up to 8, the default) and reports every solid hit along the ray,
nearest first, by re-tracing past each one, so a window does not hide the
wall it sits in.

Each hit is a [`WorldRayHit`](../../../reference/server/interfaces/WorldRayHit.md):

| Field | What it is |
| --- | --- |
| `position`, `normal`, `distance` | Where it hit, the surface normal, and how far along the ray. |
| `surface` | The surface type as the game names it: `mat_wood`, `mat_stone`, `mat_water`. |
| `terrain` | Whether it hit the ground itself. Nothing lies behind terrain. |
| `entityGuid`, `entityName`, `entityClass` | The level's own identity, name and engine class for what was hit, or `null` for terrain, static geometry and anything the session spawned. |

`entityGuid` is the same GUID [`Door.find`](../doors-and-gates/) and
`Gate.find` take, so a ray with `mode: "anything"` that hits an `AnimDoor`
tells you which door it was.

## The ground

`resolveGround(player, position, options?)` traces down through a point and
reports what is underfoot in `hit`: height in `hit.position.z`, the slope in
`hit.normal`, the material in `hit.surface`. It stands on whatever is really
there (a bridge, a floor, a castle roof), not on the terrain under it.

The probe starts 5 m above the point and reaches 200 m below by default. Pass
`{ up, down }` (each up to 512) to change that; the 5 m above is what lets a
point that is already slightly underground still resolve.

This is the call to use before spawning a [ground item](../ground-items/),
which is placed exactly where you say and does not fall.

## What is nearby

Two calls, answering two different questions.

**The server's own replicas:** `World.replicasInRadius(position, radius, virtualWorld?)`
returns the handles the server already has near a point (players, horses,
dogs, props, dropped items, doors, gates and stashes), nearest first. It does
not ask anybody, so it is immediate, synchronous and authoritative.

```ts
const near = World.replicasInRadius(player.position, 10, player.virtualWorld);
// Handles come back as Entity; look one up by id to get the typed handle.
const props = near.map((e) => Prop.getById(e.id)).filter((p): p is Prop => p !== null);
```

**The level's own entities:** `World.entitiesInRadius(player, centre, radius, options?)`
asks a client's engine what it has inside a sphere of up to 256 m: doors,
level props, bodies, by engine class. It is async like the rays. Options:
`class` keeps one engine class (`AnimDoor`, `NPC_NAI`, `GeomEntity`; an unknown
class matches nothing), `max` caps the count (up to 64), and `physicalOnly`
skips entities with no physics.

```ts
async function doorsAround(player: Player): Promise<string[]> {
  const result = await World.entitiesInRadius(player, player.position, 15, { class: "AnimDoor" });
  return result.entities.filter((e) => e.guid !== null).map((e) => e.guid as string);
}
```

The two do not overlap: `entitiesInRadius` reports level entities, not the
server's replicas. Correlate them by `guid`.

## What fails, and how

| Call | Failure |
| --- | --- |
| `raycast`, `raycastAll`, `resolveGround`, `entitiesInRadius` | Resolve with `answered: false` and a `reason` when the client has no world loaded, is in another level, timed out after five seconds, or left. `hit` is `null` and the lists are empty. |
| `raycast`, `raycastAll` | A ray of zero length, one over 4096 m, or an unknown `mode` is refused. Check your inputs rather than relying on how. |
| `replicasInRadius` | Never waits and never fails; an empty array means nothing replicated is there. |

The gamemode has no command for these. Client resources have their own
synchronous raycasts against their local world; see
[Camera and raycasts](../../../client-scripting/camera/).
