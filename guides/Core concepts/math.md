---
title: Positions, rotations and vectors
description: Work with the world's Z-up axes, Vector3 and Quaternion, turn a facing into a heading, and place things in front of a player.
sidebar:
  label: Positions and vectors
  order: 25
---

Positions are [`Vector3`](../../reference/server/classes/Vector3.md) values in
metres; rotations are [`Quaternion`](../../reference/server/classes/Quaternion.md)
values. The world is CryEngine's: **Z is up**, X and Y lie on the ground, and
an entity with the identity rotation faces **+Y**.

```ts
// server
Events.on("playerCommand", (player, command) => {
  if (command !== "where") return;
  const { x, y, z } = player.position;
  Chat.sendToPlayer(player, `${x.toFixed(1)}, ${y.toFixed(1)}, height ${z.toFixed(1)}`);
});
```

## Work with Vector3

`new Vector3(x, y, z)` makes one. Anywhere the API takes a position it also
accepts any `{ x, y, z }` object, handy for coordinates in a config file.

| Members | Behaviour |
| --- | --- |
| `add`, `sub`, `mul`, `div`, `normalize`, `cross`, `lerp`, `set` | Change the vector **in place** and return it. `clone()` first to keep the original. |
| `dot`, `distance` | Return a number; change nothing. |
| `length`, `lengthSquared` | Read-only properties. |

```ts
// server
const ahead = player.position.clone().add(new Vector3(0, 5, 0));
```

:::caution
`Vector3.up()` returns `(0, 1, 0)` and `Vector3.forward()` returns `(0, 0, 1)`,
following a generic Y-up convention. Here `(0, 0, 1)` is up and `(0, 1, 0)` is
the identity facing. Write the vectors out instead.
:::

## Measure distance on the ground

`a.distance(b)` is straight-line. For reach checks you usually want ground
distance, so a player on a roof is not "far" from someone below:

```ts
// server
function within(a: Vector3, b: Vector3, metres: number): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy <= metres * metres; // no square root needed
}
```

## Pass a rotation

Everything that takes a rotation (`player.spawn`, `Horse.spawn`, `Prop.spawn`,
`npc.teleport`...) accepts either:

- a `Quaternion`, or
- a `Vector3` of Euler angles **in degrees**. On flat ground only `z` matters:
  `new Vector3(0, 0, 90)` turns 90 degrees counterclockwise seen from above,
  facing -X.

Reading `entity.rotation` gives a `Quaternion`, but it is declared
`Quaternion | Vector3` because you may assign either. Cast the read:
`player.rotation as Quaternion`.

| Quaternion API | Notes |
| --- | --- |
| `new Quaternion(w, x, y, z)` | Scalar first. `new Quaternion(1, 0, 0, 0)` and `Quaternion.identity()` are the identity. Works in **radians**. |
| `Quaternion.fromAxisAngle(new Vector3(0, 0, 1), radians)` | Turns an entity on the spot. |
| `q.rotateVector(v)` | Returns a new rotated vector. On `(0, 1, 0)` it gives the facing. |
| `q.mul(other)`, `q.slerp(other, t)` | Compose in place; blend toward another. |
| `q.toEuler()` | The heading is in its `z` component. |

:::caution[fromEuler]
`Quaternion.fromEuler(pitch, yaw, roll)` names angles for a Y-up world: `yaw`
turns about Y, which is horizontal here. Use `fromAxisAngle` about Z instead.
:::

For where a player is looking rather than where their body faces, read
`player.lookDirection`: a world-space direction, zero until their client
reports one.

## Place something in front of a player

The default gamemode keeps these helpers in `src/server/place.ts` and uses them
for every command that puts something down. Copy them whole:

```ts title="src/server/place.ts"
/** The entity's facing flattened onto the ground, so looking up or down does not shorten it. */
export function groundForward(rotation: Quaternion): Vector3 {
  const facing = rotation.rotateVector(new Vector3(0, 1, 0));
  const length = Math.sqrt(facing.x * facing.x + facing.y * facing.y);
  return length < 1e-4 ? new Vector3(0, 1, 0) : new Vector3(facing.x / length, facing.y / length, 0);
}

/** The yaw-only rotation whose entity forward is this direction on the ground. */
export function yawTowards(directionX: number, directionY: number): Quaternion {
  return Quaternion.fromAxisAngle(new Vector3(0, 0, 1), Math.atan2(-directionX, directionY));
}

export interface Placement {
  position: Vector3;
  rotation: Quaternion;
}

/** `distance` metres in front of the player, turned back towards them. `lift` raises it off the ground. */
export function inFrontOf(player: Player, distance: number, lift: number = 0): Placement {
  const ahead = groundForward(player.rotation as Quaternion);
  const from = player.position;
  return {
    position: new Vector3(from.x + ahead.x * distance, from.y + ahead.y * distance, from.z + lift),
    rotation: yawTowards(-ahead.x, -ahead.y),
  };
}
```

`Math.atan2(-x, y)` is a ground direction's heading in radians, from +Y
counterclockwise: the inverse of rotating `(0, 1, 0)` about Z.

```ts title="src/server/horse.ts"
import { inFrontOf } from "./place.js";

Events.on("playerCommand", (player, command) => {
  if (command !== "horse") return;
  if (!player.ready) return; // position is still the world origin
  const spot = inFrontOf(player, 3);
  Horse.spawn(spot.position, spot.rotation);
});
```

## Related

- [Server vs client authority](../authority/): why a position lags a teleport
- [Spawn props and objects](../../world/props/): positions and rotations in use
- [Raycasts and nearby entities](../../world/raycasts/): find the ground under a point
- [Let players place objects](../../client-scripting/placement/): let the player pick the spot
