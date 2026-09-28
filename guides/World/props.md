---
title: Spawn props and objects
description: Spawn meshes from the game's object catalog, move, scale and remove them, and clean them up per virtual world.
sidebar:
  label: Props
  order: 41
---

A prop is a static mesh from the game's object catalog (a barrel, a fence, a
whole house) that the server spawns and every nearby client builds, late
joiners included. Use props for arenas, barricades, decoration and build modes.

```ts
const at = player.position;
const barrel = Prop.spawn("barrel_a", new Vector3(at.x + 2, at.y, at.z));
console.log(`spawned ${barrel}`);
```

That is a barrel two metres east of the player, with default rotation, scale
and physics, in the global virtual world.

## Spawn a prop

[`Prop.spawn`](../../reference/server/classes/Prop.md#spawn) takes the model,
then optional positional arguments:

```ts
const crate = Prop.spawn(
  "objects/manmade/barrels/barrel_a.cgf", // model: full path or file stem
  new Vector3(1024, 512, 40),              // position
  new Vector3(0, 0, 90),                   // rotation: Euler degrees, or a Quaternion
  1.5,                                     // scale, 0.01 to 100
  "rigid",                                 // physics: "static", "rigid" or "none"
  player.virtualWorld,                     // virtual world
);
```

- **Model.** A full catalog path or its file stem (`barrel_a`). A stem shared
  by several meshes resolves to the first, so use the full path when it
  matters. The catalog has about 8,500 meshes and the server cannot list them;
  the client's map editor (F7) browses it and shows each path.
- **Rotation.** A `Vector3` is Euler angles in **degrees**, but
  `Quaternion.fromEuler` and `Quaternion.fromAxisAngle` take **radians**.
  Mixing the two is the usual cause of a strange angle. See
  [Positions, rotations and vectors](../../core-concepts/math/) (Z is up).
- **Facing the player.** The default gamemode's `src/server/place.ts` has an
  `inFrontOf` helper returning a position and a yaw-only quaternion.

After spawning, `prop.model` is the full path, `prop.modelName` the stem and
`prop.modelGroup` its browsing bucket (`manmade/structures`).

| Physics | Behaviour |
| --- | --- |
| `static` (default) | Collides, never moves. |
| `rigid` | Falls and can be pushed. |
| `none` | No collision: decoration you can walk through. |

:::caution[Rigid props are not synchronised]
Each client simulates a `rigid` prop on its own. A knocked-over barrel can end
up somewhere different on every screen, while the server's `position` still
says where it spawned. Use `rigid` for scenery only.
:::

## Move or change a prop

`position` and `rotation` are writable, and assigning moves the prop on every
client. `physics` and `scale` are writable too, but assigning either
**rebuilds** the prop everywhere: fine for an editor, not every tick. `scale`
is clamped into `0.01` to `100`. `model` is read-only; to change the mesh,
destroy the prop and spawn another.

```ts
const prop = Prop.getById(42);
if (prop) {
  prop.position = new Vector3(prop.position.x, prop.position.y, prop.position.z + 1);
  prop.scale = 2; // rebuilds it everywhere
}
```

## Remove props

```ts
const barrel = Prop.spawn("barrel_a", player.position);

Prop.all();                 // every live prop, any virtual world, any resource
Prop.getById(barrel.id);    // one prop, or null
barrel.destroy();           // just this one
Prop.destroyAll(3);         // every prop in virtual world 3; returns the count
Prop.destroyAll();          // every prop on the server
```

`Prop.all()` takes no virtual world; filter with
`Prop.all().filter((p) => p.virtualWorld === world)`.

### Clean up when your resource stops

Stopping or reloading a resource does not despawn its props, and
`Prop.destroyAll()` removes other resources' props too. Track your own ids:

```ts title="src/server/arena.ts"
const RESOURCE = "my-mode";
const mine = new Set<number>();

export function place(model: string, at: Vector3, world: number): Prop {
  const prop = Prop.spawn(model, at, undefined, undefined, undefined, world);
  mine.add(prop.id);
  return prop;
}

Events.on("resourceStop", (name) => {
  if (name !== RESOURCE) return;
  for (const id of mine) Prop.getById(id)?.destroy();
  mine.clear();
});
```

## React to events

| Event | Arguments | When |
| --- | --- | --- |
| `propSpawn` | `prop` | Right after a prop is created and replicated, by any resource or command. |
| `propDestroy` | `prop` | While a prop is despawned. The handle still reads `model` and `position`. |

`destroyAll` raises `propDestroy` once per prop.

## When a call fails

| Call | Fails when | Result |
| --- | --- | --- |
| `Prop.spawn` | The model is not in the catalog. | **Throws.** Catch it when the name came from a player. |
| `Prop.spawn` | The physics word is not one of the three. | Check the word yourself before calling, as the gamemode does. |
| `Prop.spawn`, `prop.scale` | Scale outside `0.01` to `100`. | Clamped, not refused. |

There is no count limit. Every prop is geometry each nearby client builds, so
budget them.

:::tip[Try it]
The default gamemode's `/prop <model> [scale] [rigid|static|none]` spawns a
prop five metres ahead (`src/server/commands/prop.ts`). `/prop list`,
`/prop remove <id>` and `/prop clear` cover the rest.
:::

## Related

- [Let players place objects](../../client-scripting/placement/), a client preview before the server spawns
- [Build a placement mode](../../tutorials/build-mode/), the full build-mode tutorial
- [Virtual worlds](../../core-concepts/virtual-worlds/), how worlds partition what players see
- [Raycasts and nearby entities](../raycasts/), to find the ground before placing
- [Prop reference](../../reference/server/classes/Prop.md)
