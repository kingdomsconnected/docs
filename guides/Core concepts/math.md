---
title: Positions, rotations and vectors
description: The world's axes, working with Vector3 and Quaternion, turning a facing into a heading, and putting things in front of a player.
sidebar:
  order: 25
---

Positions are [`Vector3`](../../reference/server/classes/Vector3.md) values
in metres, and rotations are
[`Quaternion`](../../reference/server/classes/Quaternion.md) values. The
world is CryEngine's, which trips up anyone coming from a Y-up engine: **Z is
up**, X and Y lie on the ground, and an entity with the identity rotation faces
**+Y**.

```ts
// server
Events.on("playerCommand", (player, command) => {
  if (command !== "where") return;
  const { x, y, z } = player.position;
  Chat.sendToPlayer(player, `${x.toFixed(1)}, ${y.toFixed(1)}, height ${z.toFixed(1)}`);
});
```

## Vector3

`new Vector3(x, y, z)` makes one. Anywhere the API takes a position it also
accepts any object with `x`, `y` and `z`, which is handy for coordinates kept
in a config file.

The arithmetic methods (`add`, `sub`, `mul`, `div`, `normalize`, `cross`,
`lerp`, `set`) change the vector **in place** and return it for chaining. Call
`clone()` first when the original must survive:

```ts
// server
const ahead = player.position.clone().add(new Vector3(0, 5, 0));
```

`dot` and `distance` return numbers without changing anything. `length` and
`lengthSquared` are read-only properties.

:::caution
`Vector3.up()` returns `(0, 1, 0)` and `Vector3.forward()` returns
`(0, 0, 1)`. Those follow the framework's generic Y-up convention, not this
world. In Kingdom Come, `(0, 0, 1)` is up and `(0, 1, 0)` is the identity
facing. Write the vectors out instead of using the helpers.
:::

## Distances

`a.distance(b)` is the straight-line distance. For reach checks you usually
want the distance along the ground, so a player on a roof is not "far" from
someone standing below:

```ts
// server
function groundDistance(a: Vector3, b: Vector3): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function within(a: Vector3, b: Vector3, metres: number): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy <= metres * metres; // no square root needed
}
```

## Rotations

Reading `entity.rotation` gives a `Quaternion`, but the property is declared
as `Quaternion | Vector3` because you may also assign Euler angles. Cast the
read, as the default gamemode does: `player.rotation as Quaternion`.

Everything that takes a rotation (`player.spawn`, `Horse.spawn`, `Prop.spawn`,
`npc.teleport` and the rest) accepts either:

- a `Quaternion`, or
- a `Vector3` of Euler angles **in degrees**, one per axis. On flat ground
  only `z` matters: `new Vector3(0, 0, 90)` turns the entity 90 degrees
  counterclockwise seen from above, so it faces -X.

The `Quaternion` class works in **radians**, and its constructor takes the
scalar first: `new Quaternion(w, x, y, z)`. `new Quaternion(1, 0, 0, 0)` is
the identity, as is `Quaternion.identity()`.

:::caution[fromEuler]
`Quaternion.fromEuler(pitch, yaw, roll)` names its angles for a Y-up world:
`yaw` turns about Y, which is horizontal here. To turn an entity on the spot,
rotate about Z with `Quaternion.fromAxisAngle(new Vector3(0, 0, 1), radians)`.
Likewise `toEuler()` returns the heading in its `z` component.
:::

`q.rotateVector(v)` applies a rotation to a direction and returns a new
vector. Applied to `(0, 1, 0)`, it gives the way an entity is facing. `mul`
composes two rotations in place; `slerp` blends toward another.

For where a player is looking, rather than which way their body faces, read
`player.lookDirection`: a world-space direction, zero until their client has
reported one.

## In front of a player

The default gamemode keeps these helpers in `src/server/place.ts`, and uses
them for every command that puts something down. They are worth copying
whole:

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

`Math.atan2(-x, y)` is the heading of a direction on the ground, in radians,
measured from +Y and counterclockwise. It is the inverse of rotating
`(0, 1, 0)` about Z, which is why `yawTowards` round-trips with
`groundForward`.

Using it:

```ts title="src/server/horse.ts"
import { inFrontOf } from "./place.js";

Events.on("playerCommand", (player, command) => {
  if (command !== "horse") return;
  if (!player.ready) {
    Chat.sendToPlayer(player, "Your position has not reached the server yet.");
    return;
  }
  const spot = inFrontOf(player, 3);
  Horse.spawn(spot.position, spot.rotation);
});
```

The `player.ready` check matters: until a player's client has reported a pose,
their position is the world origin, and everything you place relative to them
ends up there.

## Related

- [Server vs client authority](../authority/), for why a player's position lags a
  teleport
- [Props](../../server-scripting/world-and-objects/props/)
- [Let players place objects](../../client-scripting/placement/), for letting the player choose the
  spot
