---
title: Spawn props and objects
description: Spawn meshes from the game's object catalog, give them physics and scale, and clean them up per virtual world.
sidebar:
  order: 41
---

A prop is a static mesh from the game's own object catalog (a barrel, a fence,
a whole house) that the server spawns and every client builds. It is a
replicated entity, so players who come near get it streamed in and late
joiners see it too. Use props for arenas, barricades, decoration, and anything
a build mode places.

```ts
const at = player.position;
const barrel = Prop.spawn("barrel_a", new Vector3(at.x + 2, at.y, at.z));
console.log(`spawned ${barrel}`);
```

That is a barrel two metres east of the player, with default rotation, scale
and physics, in the global virtual world.

## Spawning

[`Prop.spawn`](../../../reference/server/classes/Prop.md#spawn) takes the
model and then everything else as optional positional arguments:

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

**Model.** A full catalog path (`objects/manmade/barrels/barrel_a.cgf`) or its
file stem (`barrel_a`). Several meshes can share a stem, and a stem resolves
to the first of them, so use the full path when it matters which one you get.
After spawning, `prop.model` is the full path, `prop.modelName` the stem and
`prop.modelGroup` its browsing bucket (`manmade/structures`). The catalog has
about 8,500 static meshes. The server has no function that lists them; the
client's map editor (F7) browses the same catalog and shows each path.

**Rotation.** A `Vector3` here is Euler angles in **degrees**. A `Quaternion`
also works, but `Quaternion.fromEuler` and `Quaternion.fromAxisAngle` take
**radians**. Mixing the two is the usual reason a prop comes out at a strange
angle. The default gamemode's `src/server/place.ts` has an `inFrontOf` helper
that returns a position and a yaw-only quaternion facing the player, which is
what most "put it in front of me" code wants. See
[Positions, rotations and vectors](../../../core-concepts/math/) for the axes (Z is up).

**Physics.**

| Kind | Behaviour |
| --- | --- |
| `static` (default) | Collides, never moves. |
| `rigid` | Falls and can be pushed. |
| `none` | No collision at all: decoration you can walk through. |

:::caution[Rigid props are not synchronised]
Each client simulates a `rigid` prop on its own and nothing reconciles them.
Knock a barrel over and it can end up in a different place on every screen,
and the server's `position` still says where it was spawned. Use `rigid` for
scenery only, never for something gameplay depends on.
:::

## Changing a live prop

`position` and `rotation` come from [`Entity`](../../../reference/server/classes/Entity.md)
and are writable: assignment moves the prop on every client. `physics` and
`scale` are writable too, but assigning either **rebuilds** the prop on every
client, because collision is built once from the mesh and scale at spawn.
That is fine for an editor, not for something you change every tick. `scale`
is clamped into `0.01` to `100`. `model` is read-only: to change the mesh,
destroy the prop and spawn another.

```ts
const id = 42;
const prop = Prop.getById(id);
if (prop) {
  prop.position = new Vector3(prop.position.x, prop.position.y, prop.position.z + 1);
  prop.scale = 2; // rebuilds it everywhere
}
```

## Lists and cleanup

```ts
const barrel = Prop.spawn("barrel_a", player.position);

Prop.all();                 // every live prop, any virtual world, any resource
Prop.getById(barrel.id);    // one prop, or null
barrel.destroy();           // just this one
Prop.destroyAll(3);         // every prop in virtual world 3; returns the count
Prop.destroyAll();          // every prop on the server
```

`Prop.all()` takes no virtual world, so filter it yourself:
`Prop.all().filter((p) => p.virtualWorld === world)`. See
[Virtual worlds](../../../core-concepts/virtual-worlds/) for how worlds partition
what players see.

:::caution[Props outlive your resource]
Stopping or reloading a resource does not despawn what it spawned, and
`Prop.destroyAll()` removes other resources' props as well. Keep the ids you
created and destroy those in `resourceStop`.
:::

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

## Events

| Event | Arguments | When |
| --- | --- | --- |
| `propSpawn` | `prop` | Right after a prop is created and replicated, by any resource or command. |
| `propDestroy` | `prop` | While a prop is being despawned. The handle still reads, so `model` and `position` are available one last time. |

`destroyAll` raises `propDestroy` once per prop it removes.

## What fails, and how

- `Prop.spawn` **throws** when the model is not in the catalog. Wrap it in
  `try`/`catch` when the name came from a player; the default gamemode's
  `/prop` does exactly that.
- Pass one of the three physics strings. The gamemode checks the word before
  calling rather than relying on the binding to do it.
- An out-of-range `scale` is clamped, not refused.
- There is no count limit in the API. Every prop is something every nearby
  client has to build, so budget them like you would budget any geometry.

:::tip[Try it]
The default gamemode's `/prop <model> [scale] [rigid|static|none]` spawns a
prop five metres in front of you (`src/server/commands/prop.ts`).
`/prop list`, `/prop remove <id>` and `/prop clear` cover the rest. For a
preview the player aims before the server spawns, see
[Let players place objects](../../../client-scripting/placement/) and the
[build mode tutorial](../../../tutorials/build-mode/).
:::
