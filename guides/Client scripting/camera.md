---
title: Camera and raycasts
description: Find out where the player is looking with Camera, and ask the client's World what a ray hits, what is underfoot and what is nearby.
sidebar:
  order: 72
---

[`Camera`](../../reference/client/variables/Camera.md) describes the view this
client is drawing through. The client's
[`World`](../../reference/client/variables/World.md) answers questions about
the level around it: what a ray meets, how high the ground is, which entities
are inside a sphere. Together they answer "what is the player looking at".

```ts
function lookedAt(range = 40): WorldRayHit | null {
  const ray = Camera.screenRay({ range });
  if (!ray) {
    return null;
  }
  return World.raycast(ray.origin, ray.target, { mode: "anything" });
}

Key.bind("e", () => {
  const hit = lookedAt();
  if (hit) {
    Hud.showInfoText(`${hit.entityClass ?? "ground"} (${hit.surface}), ${hit.distance.toFixed(1)} m`);
  }
});
```

## The camera

`Camera.getPose()` returns a [CameraPose](../../reference/client/interfaces/CameraPose.md):
the eye `position`, the unit vectors `forward`, `right` and `up`, the vertical
`fov` in degrees and the `aspectRatio`. The basis is read off the camera itself,
so it carries roll.

This is the game's camera, whichever one the game has right now: behind the
player, in a dialogue, in a cutscene, or a [free flight](../noclip/). It is not a
camera of the mod's own, and there is no way to move it from here. `NoClip` is
what takes it over.

`Camera.screenRay({ x, y, range })` turns a point on screen into a
[CameraRay](../../reference/client/interfaces/CameraRay.md): `origin` (the eye),
a unit `direction`, and `target`, which is `origin` plus `direction` times
`range`. `x` and `y` are normalized device coordinates, from -1 at the left and
bottom to +1 at the right and top, so the default `(0, 0)` is the centre of the
screen where the crosshair is. `range` is 100 metres by default and at most
4096.

Coordinates are normalized rather than pixels because the mod does not own the
size of the back buffer. To aim through a pixel from a web view, divide by the
screen size first.

:::caution
Both return `null` in the main menu and across a level load, when there is no
active view. Check before you use the result.
:::

## Casting a ray

`World.raycast(from, to, options?)` traces the segment between two points and
returns the first [WorldRayHit](../../reference/client/interfaces/WorldRayHit.md),
or `null` when it met nothing. The segment can be up to 4096 metres long; a ray
of no length is refused.

`mode` picks which of the game's three traces runs:

| Mode | Sees | Use it for |
| --- | --- | --- |
| `cover` (default) | static geometry, props, doors; not bodies | line of sight |
| `anything` | everything, bodies included | picking what the player aims at |
| `ground` | only surfaces a player could stand on | placing things |

`ignoreSelf` is on by default and lets the ray pass through the local player's
own body. The camera sits where the player stands, so a ray from the camera
would otherwise mostly hit them.

A hit carries more than a position:

| Field | Meaning |
| --- | --- |
| `position`, `normal`, `distance` | where it hit, the surface normal, metres along the ray |
| `surface` | the material name, such as `mat_wood`, `mat_stone`, `mat_water` |
| `terrain` | `true` when the ground itself was hit |
| `entityGuid` | the level's own id for what was hit, the same on every machine; `null` for terrain, static geometry and anything the session spawned |
| `entityName`, `entityClass` | the level's name and the engine class (`AnimDoor`, `NPC_NAI`, `GeomEntity`) |
| `entityId` | this machine's own handle; not a network id and not portable |

To tell the server what the player picked, send `entityGuid`. It is what the
server's GUID lookups such as `Door.find` take, and it means the same thing on
the server as here. `entityId` does not.

```ts
Key.bind("f", () => {
  const ray = Camera.screenRay({ range: 4 });
  const hit = ray ? World.raycast(ray.origin, ray.target, { mode: "anything" }) : null;
  if (hit?.entityClass === "AnimDoor" && hit.entityGuid) {
    Events.emitServer("my-mode:door.knock", { guid: hit.entityGuid });
  }
});
```

`World.raycastAll(from, to, options?)` returns every solid hit along the ray,
nearest first, up to `maxHits` (8 at most). Each is found by tracing again past
the one before, so a window does not hide the wall it is set in.

## The ground under a point

`World.getGroundZ(position)` returns the height of whatever is underfoot, or
`null` when the probe found nothing. It is a trace rather than a heightmap read,
so it stands on a bridge, a floor or a roof rather than the terrain beneath it.
`World.resolveGround(position)` runs the same probe and returns the whole hit,
slope and surface included.

```ts
function groundBelow(point: Vector3): Vector3 | null {
  const z = World.getGroundZ(point, { up: 5, down: 50 });
  return z === null ? null : new Vector3(point.x, point.y, z);
}
```

The probe starts `up` metres above the point (5 by default, so a point slightly
underground still resolves) and reaches `down` metres below it (200 by
default). Both go up to 512.

## Entities nearby

`World.entitiesInRadius(centre, radius, options?)` lists what the engine has
inside a sphere of up to 256 metres, nearest first, as
[WorldNearbyEntity](../../reference/client/interfaces/WorldNearbyEntity.md)
entries. `class` narrows it to one engine class, `max` caps the count (64 at
most), and `physicalOnly` skips entities with no physics.

```ts
const me = LocalPlayer;
if (me) {
  const doors = World.entitiesInRadius(me.position, 10, { class: "AnimDoor", max: 5 });
  for (const door of doors) {
    console.log(`${door.name || "door"} ${door.distance.toFixed(1)} m away, guid ${door.guid}`);
  }
}
```

A class name the engine does not know matches nothing rather than everything.

## None of this is authority

Every answer here describes what one client has streamed in at one moment. A
point far from the player has not been streamed and answers nothing. And a
client can lie about what its ray hit.

:::note[Authority]
Use these queries to aim, preview and decide what to ask for. When a decision
matters (whether a player may open that door, whether a spot is inside a zone)
the server decides, from its own data. The server's `World` can ask a client
the same questions itself; see [Raycasts and nearby entities](../../server-scripting/world-and-objects/raycasts/).
:::

## Related

- [Let players place objects](../placement/), which does its own aiming
- [Free camera (noclip)](../noclip/)
- [Positions, rotations and vectors](../../core-concepts/math/)
