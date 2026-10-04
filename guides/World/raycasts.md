---
title: Raycasts and nearby entities
description: Trace rays, tell what they hit down to a tree or a rock, find the ground under a point and list nearby entities, from the server by asking a client or directly in a client script.
sidebar:
  label: Raycasts
  order: 46
---

Trace a ray, find the ground under a point, or list what is nearby. A client
script does it directly against its own world. The server does it by asking a
player's client, or, for its own replicated entities, on its own.

```ts
async function groundUnder(player: Player, x: number, y: number): Promise<number | null> {
  const probe = await World.resolveGround(player, new Vector3(x, y, player.position.z));
  return probe.answered && probe.hit ? probe.hit.position.z : null;
}
```

Both sides use the same ray modes and hit fields, below.

| Mode | Hits | Good for |
| --- | --- | --- |
| `cover` (default) | Static geometry, props, doors. Not bodies. | Line of sight. |
| `anything` | Everything, bodies included. | Picking what a player points at. |
| `ground` | Only surfaces a player could stand on. | Placement. |

A [`WorldRayHit`](../../reference/server/interfaces/WorldRayHit.md) has:

| Field | What it is |
| --- | --- |
| `position`, `normal`, `distance` | Where it hit, the surface normal, metres along the ray. |
| `kind` | What it stopped on: `terrain`, `entity` (doors, props, NPCs, players), `vegetation` (trees, bushes, plants the level paints), `brush` (walls, houses, rocks, cliffs placed one by one) or `static` (anything else). |
| `terrain` | Whether it hit the ground itself, the same as `kind` being `terrain`. Nothing lies behind terrain. |
| `model` | The mesh of a `vegetation` or `brush` hit, by its path. `null` otherwise. |
| `category` | `tree`, `bush`, `plant` or `rock`, from the folder `model` lives in. `null` for anything else, man-made included. |
| `surface` | The surface type, which is how it sounds underfoot: `mat_wood`, `mat_rock`, `mat_soil`, `mat_water`. Empty only before the game's tables load. |
| `material` | The material drawn where it hit, by its path (a trunk's bark, not the whole tree). `null` for terrain and when nothing names one. |
| `entityGuid` | The level's id for what was hit, the same on every machine. `null` for terrain, static geometry and anything the session spawned. |
| `entityName`, `entityClass` | The level's name and engine class (`AnimDoor`, `NPC_NAI`, `GeomEntity`). `null` when nothing named was hit. |
| `entityId` | Client only: that machine's own handle. Not a network id; never send it to the server. |
| `player` | Client only: the player whose body it was, or `null`. |

`entityGuid` is what [`Door.find`](../doors-and-gates/) and `Gate.find` take,
so an `anything` ray that hits an `AnimDoor` tells you which door it was.

### Tell a tree or a rock apart

Trees and rocks are not entities and have no GUID. Read `kind`, `category` and
`model` instead, and use `model` with `position` as the key: the pair is the
same on every client on the same level, so a server can keep a felled tree or
a mined rock by it.

```ts
function resourceKey(hit: WorldRayHit): string | null {
  if (hit.category !== "tree" && hit.category !== "rock") return null;
  const p = hit.position;
  return `${hit.model}@${Math.round(p.x)},${Math.round(p.y)},${Math.round(p.z)}`;
}
```

`surface` says what something is made of, not what it is: a plank wall is
`mat_wood` as much as a trunk is, so tell a tree by `category`.

Rays are at most 4096 m long, and a zero-length ray is refused. `raycastAll`
reports every solid hit along the ray (up to `maxHits`, 8 at most), nearest
first, by re-tracing past each one, so a window does not hide its wall.

## On the server

`World.raycast`, `raycastAll`, `resolveGround` and `entitiesInRadius` take a
`player` first, and that player's client runs the query. They return a promise
that always settles, with the answer, after five seconds, or when the player
leaves. Check `answered` and read `reason` when it is false.

:::note[The server borrows a client's view]
The server does not load the level. These calls cover only what that client
has loaded, so pick a player near the point, and they are that client's word,
so do not trust them for anything a player gains by lying about. They are a
round trip: do not call them every tick. See
[Server vs client authority](../../core-concepts/authority/).
:::

### Trace a ray

```ts
async function canSee(player: Player, from: Vector3, to: Vector3): Promise<boolean | null> {
  const trace = await World.raycast(player, from, to, { mode: "cover" });
  if (!trace.answered) return null; // unknown, not "yes"
  return trace.hit === null;
}
```

Every server trace settles with a
[`WorldTraceResult`](../../reference/server/interfaces/WorldTraceResult.md):

| Field | What it is |
| --- | --- |
| `answered` | Whether the client ran it. |
| `reason` | Why it did not; empty when it did. |
| `hit` | The nearest hit, or `null` when the ray met nothing or nobody answered. |
| `hits` | Every hit, nearest first: one at most unless `raycastAll` asked for more with `maxHits`. |

Server hits carry every field above except the client-only `entityId` and
`player`.

### Find the ground

`resolveGround(player, position, options?)` traces down through a point: height
in `hit.position.z`, slope in `hit.normal`, material in `hit.surface`. It stands
on what is really there (a bridge, a floor, a roof), not the terrain beneath.

The probe starts `up` metres above the point (5 by default, so a point slightly
underground still resolves) and reaches `down` metres below (200 by default).
Each goes up to 512. Use it before dropping a
[ground item](../../players/items/), which stays exactly where you put it.

### List what is nearby

Two calls answer two different questions.

`World.replicasInRadius(position, radius, virtualWorld?)` returns the server's
own handles near a point (players, horses, dogs, props, dropped items, doors,
gates, stashes), nearest first. It asks nobody, so it is synchronous and
authoritative.

```ts
const near = World.replicasInRadius(player.position, 10, player.virtualWorld);
// Handles come back as Entity; look one up by id to get the typed handle.
const props = near.map((e) => Prop.getById(e.id)).filter((p): p is Prop => p !== null);
```

`World.entitiesInRadius(player, centre, radius, options?)` asks a client which
**level** entities lie inside a sphere of up to 256 m: doors, level props,
bodies. Options: `class` keeps one engine class (an unknown class matches
nothing), `max` caps the count (up to 64), `physicalOnly` skips entities with
no physics.

```ts
async function doorsAround(player: Player): Promise<string[]> {
  const result = await World.entitiesInRadius(player, player.position, 15, { class: "AnimDoor" });
  return result.entities.filter((e) => e.guid !== null).map((e) => e.guid as string);
}
```

The two do not overlap. Correlate them by `guid`.

## On the client

The client's [`World`](../../reference/client/variables/World.md) answers the
same questions synchronously, against what this machine has streamed in. Pair
it with [`Camera.screenRay`](../../client-scripting/camera/) to find what the
player is looking at.

```ts
// client
Key.bind("f", () => {
  const ray = Camera.screenRay({ range: 4 });
  const hit = ray ? World.raycast(ray.origin, ray.target, { mode: "anything" }) : null;
  if (hit?.entityClass === "AnimDoor" && hit.entityGuid) {
    Events.emitServer("my-mode:door.knock", { guid: hit.entityGuid });
  }
});
```

`World.raycast(from, to, options?)` returns the first hit or `null`.
`raycastAll` returns an array. `ignoreSelf` is on by default, so a ray from the
camera passes through the local player's own body.

To tell the server what was picked, send `entityGuid`, never `entityId`.

### Find the ground

`World.getGroundZ(position, { up, down }?)` returns the height underfoot, or
`null`. `World.resolveGround` runs the same probe and returns the whole hit.
Both take the same `up` and `down` as the server call.

```ts
// client
function groundBelow(point: Vector3): Vector3 | null {
  const z = World.getGroundZ(point, { up: 5, down: 50 });
  return z === null ? null : new Vector3(point.x, point.y, z);
}
```

### List what is nearby

`World.entitiesInRadius(centre, radius, options?)` returns
[`WorldNearbyEntity`](../../reference/client/interfaces/WorldNearbyEntity.md)
entries, nearest first, with the same options as the server call.

```ts
// client
const me = LocalPlayer;
if (me) {
  const doors = World.entitiesInRadius(me.position, 10, { class: "AnimDoor", max: 5 });
  for (const door of doors) {
    console.log(`${door.name || "door"} ${door.distance.toFixed(1)} m away, guid ${door.guid}`);
  }
}
```

Use these answers to aim and preview. When a decision matters (may this player
open that door?), let the server decide from its own data.

## When a call fails

| Call | Fails when | Result |
| --- | --- | --- |
| Server `raycast`, `raycastAll`, `resolveGround`, `entitiesInRadius` | The client has no world loaded, is in another level, timed out after 5 s, or left. | Resolves `answered: false` with a `reason`; `hit` is `null`, lists empty. |
| `raycast`, `raycastAll` (both sides) | Zero length, over 4096 m, or an unknown `mode`. | Refused. Check inputs yourself. |
| Client `raycast`, `getGroundZ`, `resolveGround` | Nothing hit, or no world loaded on this machine. | `null`. |
| `entitiesInRadius` (both sides) | Unknown `class`. | Matches nothing. |
| `replicasInRadius` | Never. | Empty array means nothing replicated is there. |
| `Camera.screenRay` | Main menu or level load. | `null`. |

## Related

- [Camera and free camera](../../client-scripting/camera/), for `Camera.screenRay` and the camera pose
- [Let players place objects](../../client-scripting/placement/), aiming built on these rays
- [Lock doors, open gates](../doors-and-gates/), what to do with a door's GUID
- [Server vs client authority](../../core-concepts/authority/), why client answers are not trusted
