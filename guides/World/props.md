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
  "objects/manmade/common_furniture/barrels/barrel_a.cgf", // model: full path or file stem
  new Vector3(1024, 512, 40), // position
  new Vector3(0, 0, 90),      // rotation: Euler degrees, or a Quaternion
  1.5,                        // scale, 0.01 to 100
  "rigid",                    // physics: "static", "rigid" or "none"
  player.virtualWorld,        // virtual world
);
```

- **Model.** A full catalog path or its file stem (`barrel_a`). A stem shared
  by several meshes resolves to the first, so use the full path when it
  matters. The catalog has about 8,500 meshes and the server cannot list them;
  the client's [World Builder](../world-builder/)
  browses it and shows each path.
- **Your own mesh.** A `.cgf` a resource ships in its
  `stream/objects/kcdc/<resource>/` folder is named by its full path,
  `objects/kcdc/<resource>/chair.cgf`. A player whose
  game does not have the file yet sees the prop as soon as it arrives. See
  [Custom assets](../../core-concepts/custom-assets/).
- **Rotation.** A `Vector3` is Euler angles in **degrees**, but
  `Quaternion.fromEuler` and `Quaternion.fromAxisAngle` take **radians**.
  Mixing the two is the usual cause of a strange angle. See
  [Positions, rotations and vectors](../../core-concepts/math/) (Z is up).
- **Facing the player.** The default gamemode's `src/server/place.ts` has an
  `inFrontOf` helper returning a position and a yaw-only quaternion.

After spawning, `prop.model` is the full path, `prop.modelName` the stem and
`prop.modelGroup` its browsing bucket (`manmade/structures`, or
`kcdc/<resource>` for a streamed mesh).

| Physics | Behaviour |
| --- | --- |
| `static` (default) | Collides, never moves. |
| `rigid` | Falls and can be pushed. Every player sees the same motion. |
| `none` | No collision: decoration you can walk through. |

A `rigid` prop is simulated by the nearest player's client within 60 m, and
every other player sees the pose it streams. A script can push it, stop it,
put it back and hear where it comes to rest; `prop.mass` sets its mass in
kilograms. See [Push props and react to weapon hits](../prop-physics/).

Each player receives every prop within 250 m of them, up to 4096 at once. A
`static` or `none` prop is drawn as far away as the game draws the same mesh
when the level places it, so a table shows from much farther away than a
cup.

## Move or change a prop

`position` and `rotation` are writable, and assigning moves the prop on every
client. `physics`, `scale` and `mass` are writable too, but assigning any of
them **rebuilds** the prop everywhere: fine for an editor, not every tick.
`scale` is clamped into `0.01` to `100`. `model` is read-only; to change the
mesh, destroy the prop and spawn another.

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

A resource owns the props it spawns: stopping or restarting it destroys them
for every player. Props a World Builder export creates belong to the server
and stay. `Prop.destroyAll()` removes other resources' props too, so to clear
only your own while your resource keeps running, track their ids:

```ts title="src/server/arena.ts"
const mine = new Set<number>();

export function place(model: string, at: Vector3, world: number): Prop {
  const prop = Prop.spawn(model, at, undefined, undefined, undefined, world);
  mine.add(prop.id);
  return prop;
}

export function clearMine(): void {
  for (const id of mine) Prop.getById(id)?.destroy();
  mine.clear();
}
```

## React to events

| Event | Arguments | When |
| --- | --- | --- |
| `propSpawn` | `prop` | Right after a prop is created and replicated, by any resource or command. |
| `propDestroy` | `prop` | While a prop is despawned. The handle still reads `model` and `position`. |
| `propRest` | `prop`, `position`, `rotation` | A `rigid` prop stopped moving. See [Prop physics](../prop-physics/#know-where-it-stopped). |

`destroyAll` raises `propDestroy` once per prop.

## When a call fails

| Call | Fails when | Result |
| --- | --- | --- |
| `Prop.spawn` | The model is not in the catalog, and no running resource streams it. | **Throws.** Catch it when the name came from a player. |
| `Prop.spawn` | The physics word is not one of the three. | Check the word yourself before calling, as the gamemode does. |
| `Prop.spawn`, `prop.scale` | Scale outside `0.01` to `100`. | Clamped, not refused. |

The server sets no count limit, but a player receives at most 4096 props at
once, and every prop is geometry each nearby client builds, so budget them.

:::tip[Try it]
The default gamemode's `/prop <model> [scale] [rigid|static|none]` spawns a
prop five metres ahead (`src/server/commands/prop.ts`). `/prop list`,
`/prop remove <id>` and `/prop clear` cover the rest.
:::

## Related

- [Push props and react to weapon hits](../prop-physics/), moving `rigid` props from a script
- [Light the world with point lights](../lights/), lighting what you build
- [Let players place objects](../../client-scripting/placement/), a client preview before the server spawns
- [Build a placement mode](../../tutorials/build-mode/), the full build-mode tutorial
- [Virtual worlds](../../core-concepts/virtual-worlds/), how worlds partition what players see
- [Raycasts and nearby entities](../raycasts/), to find the ground before placing
- [Custom assets](../../core-concepts/custom-assets/), to ship meshes of your own
- [Prop reference](../../reference/server/classes/Prop.md)
