---
title: Push props and react to weapon hits
description: Push, stop and reset rigid props so every player sees the same motion, learn where they come to rest, and react when a player's weapon strikes the world.
sidebar:
  label: Prop physics
  order: 41.5
---

A prop spawned with `rigid` physics falls, rolls and can be knocked over. A
server script can push it, stop it and put it back, and every player sees the
same motion. `playerWeaponHit` tells the server when a swing strikes a tree, a
wall or a prop, which is enough to fell a tree.

```ts
const BARREL = "objects/manmade/common_furniture/barrels/barrel_a.cgf";

Events.on("playerCommand", (player, command) => {
  if (command !== "kick") return;
  const p = player.position;
  const barrel = Prop.spawn(BARREL, new Vector3(p.x + 2, p.y, p.z + 0.5), undefined, undefined, "rigid", player.virtualWorld);
  barrel.mass = 40; // kilograms; set it before pushing
  // 200 kg m/s on 40 kg is 5 m/s east, with a little lift.
  if (!barrel.applyImpulse(new Vector3(200, 0, 60))) {
    Chat.sendToPlayer(player, "Nobody is close enough to move the barrel.");
  }
});
```

## Push, stop and reset a prop

These [`Prop`](../../reference/server/classes/Prop.md) methods work on a prop
whose `physics` is `rigid`. Vectors are in world space.

| Call | What it does |
| --- | --- |
| `applyImpulse(impulse, point?, angularImpulse?)` | Pushes it. `impulse` is in kg m/s, so its velocity changes by the impulse divided by its mass. Landing at `point`, off the centre of mass, the push also turns it, which is what topples a tall prop. `angularImpulse` adds a twist in kg m²/s about each world axis. |
| `setVelocity(velocity, angularVelocity?)` | Sets its velocity outright, whatever its mass: up to 200 m/s, and a spin of up to 100 rad/s about each world axis. Omitting the spin stops it turning. |
| `wake()` | Starts a resting prop simulating where it lies, so it falls if nothing holds it up. |
| `sleep()` | Stops it where it is, in mid-air if need be. It moves again when something hits it or a script pushes it. |
| `resetPhysics()` | Stops it and puts it back where it was spawned, for every player. |

### Set the mass

`prop.mass` is in kilograms. `0`, the default, takes the mass the mesh's
collision gives it, and values from 0 to 100,000 are accepted; anything else
is ignored. Assigning it rebuilds the prop on every client, so set it right
after `Prop.spawn`, before pushing. `setVelocity` moves a prop the same way
whatever it weighs; how hard an impulse pushes depends on the mass.

Some meshes carry no mass in their collision, a tree's among them. Every
client refuses to build such a prop as `rigid`, and logs an error naming the
model. Give it a mass and it builds.

## Who simulates a rigid prop

The server runs no physics. The client of the nearest player within 60 m
simulates the prop for everyone and streams where it is; every other player
sees it there, and their own copy cannot move on its own. That client keeps
the prop until its player is 90 m away, then the next nearest player's client
takes over. A player who arrives while the prop is falling sees it falling.

- With nobody within 60 m, a rigid prop stays where it last rested, and the
  push calls return `false`.
- Only the simulating player moves the prop by walking into it. To everyone
  else it is solid but still, until the stream from the simulating client
  moves it.
- When the simulating client changes while the prop is moving, the new one
  starts it from where it was, at rest, so a fall can stall for a moment.

## Know where it stopped

| Event | Arguments | When |
| --- | --- | --- |
| `propRest` | `prop`, `position`, `rotation` | A `rigid` prop stopped moving, whatever moved it: a script, a fall, or a player walking into it. Every player already sees it there. |

`sleep()` raises `propRest` as soon as the prop stops; `resetPhysics()` raises
none. The resting pose is the simulating client's word. The server checks only
that it lies within 100 m of where the prop last rested or was spawned; a prop
reported farther away is put back there and raises nothing.

To keep a prop where it landed for good, make it static once it rests:

```ts
Events.on("propRest", (prop, position) => {
  if (prop.physics !== "rigid") return;
  prop.physics = "static"; // solid, and no longer pushed about
  console.log(`${prop.modelName} came to rest at ${position.x.toFixed(1)}, ${position.y.toFixed(1)}`);
});
```

## When a call fails

| Call | Fails when | Result |
| --- | --- | --- |
| `applyImpulse`, `setVelocity`, `wake`, `sleep` | The prop is gone or not `rigid`, a value is not finite or is out of range (an impulse past 10,000,000, a velocity past 200 m/s, a spin past 100 rad/s), or no player is within 60 m. | Returns `false`; nothing happens. `true` means it was sent to the simulating client. |
| `resetPhysics` | The prop is gone or not `rigid`. | Returns `false`. |
| `prop.mass = value` | Outside 0 to 100,000. | Ignored. |
| A `rigid` prop whose mesh has no mass | `mass` is left at `0`. | Not built on any client; each logs why. |

## React to weapon hits

`playerWeaponHit` is raised on the server when a player's swing meets
something solid that is not a body: a tree, a wall, a rock, a prop, the
ground. Its `hit` is a [`WorldRayHit`](../raycasts/), named the way a trace
names it.

```ts
Events.on("playerWeaponHit", (player, hit) => {
  const what = hit.category ?? hit.kind;
  console.log(`${player.nickname} struck ${what} (${hit.surface}) ${hit.distance.toFixed(1)} m from their feet`);
});
```

| Event | Arguments | When |
| --- | --- | --- |
| `playerWeaponHit` (server) | `player`, `hit` | Once per object per attack, at the first contact, as the game counts contacts. A blade resting against a wall is not reported again until the next swing. |
| `weaponHit` (client) | `hit` | On the swinging player's own machine, before the server hears of it. Use it for local effects. `hit.entityId` and `hit.player` are filled in as for a client trace. |

- `position` is where the weapon met the surface, `normal` points out of the
  surface against the swing, and `distance` is measured from the player's
  feet.
- `category` tells a tree from a rock, `surface` says what it is made of, and
  `levelObject` names an object the level placed in the form
  [`LevelEdit.apply`](../level-edits/) takes.
- Fists and kicks are not reported, and neither are blows on players, NPCs or
  animals; `playerHit` and the damage events cover those.

The report comes from the player's client. The server checks only that the
point lies within 8 m of the player and that the client is in the server's
level, and takes at most 16 reports a second from one player. Do not hand out
anything valuable on a single report without checks of your own.

## Fell a tree

Count blows per tree, swap the tree for a stump with a
[level edit](../level-edits/), and drop a rigid copy of the tree that tips
away from the woodcutter. The game ships stumps for lindens, beeches and
pines; birches and oaks have none.

```ts
const STUMPS: Record<string, string> = {
  tilia_cordata: "objects/natural/vegetation/trees/stumps/stump_tilia_cordata_a.cgf",
  fagus_sylvatica: "objects/natural/vegetation/trees/stumps/stump_fagus_sylvatica_a.cgf",
  pinus_sylvestris: "objects/natural/vegetation/trees/stumps/stump_pinus_sylvestris_a.cgf",
};
const blows = new Map<string, number>();

Events.on("playerWeaponHit", (player, hit) => {
  const tree = hit.levelObject;
  if (hit.category !== "tree" || !tree) return;
  const species = Object.keys(STUMPS).find((name) => tree.name.includes(name));
  if (!species) return;
  const key = `${tree.name}@${tree.at.x},${tree.at.y},${tree.at.z}`;
  const count = (blows.get(key) ?? 0) + 1;
  blows.set(key, count);
  if (count < 3) return;

  LevelEdit.apply({ ...tree, model: STUMPS[species] }, player.virtualWorld);
  const cut = new Vector3(tree.at.x, tree.at.y, tree.at.z + 0.45); // on top of the stump
  const trunk = Prop.spawn(tree.name, cut, tree.rotation, tree.scale, "rigid", player.virtualWorld);
  trunk.mass = 500; // a tree's collision carries none

  // A slow turn about the base, away from the woodcutter; gravity does the rest.
  const dx = tree.at.x - player.position.x;
  const dy = tree.at.y - player.position.y;
  const length = Math.hypot(dx, dy) || 1;
  const spin = 0.3;
  trunk.setVelocity(new Vector3((dx / length) * spin * 5, (dy / length) * spin * 5, 0), new Vector3((-dy / length) * spin, (dx / length) * spin, 0));
});
```

`levelObject.at` is where the level put the tree, not where the axe struck,
so it keys the tree the same way on every blow. The copy starts on top of the
cut so that it does not start inside the stump's collision; a taller stump
needs a higher start, which a downward [raycast](../raycasts/) onto it finds.
The stump and the trunk are kept in memory only, and both belong to the
resource that made them.

:::tip[Try it]
The default gamemode fells lindens, beeches and pines after three axe blows
(`src/server/woodcutting.ts`). It also checks that the player holds an axe,
forgets old blows, makes the trunk static on `propRest` and grows the tree
back after ten minutes. `/trees` lists felled trees and `/trees regrow` brings
them all back.
:::

## Related

- [Spawn props and objects](../props/), spawning and the three physics modes
- [Remove or move the level's own objects](../level-edits/), swapping a tree for its stump
- [Raycasts and nearby entities](../raycasts/), every field of a `WorldRayHit`
- [Server vs client authority](../../core-concepts/authority/), why a client's report is not trusted
- [Prop reference](../../reference/server/classes/Prop.md)
