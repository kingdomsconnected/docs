---
title: Virtual worlds (dimensions)
description: Splitting players and entities into separate dimensions on the same map, the global world everything starts in, and showing an entity to one player only.
sidebar:
  order: 26
---

A virtual world is a number every entity carries. Players only see entities in
their own world, so you can run a duel arena, a tutorial or a private
building area on the same map as everyone else without them seeing each other.
It is the same idea as a dimension or routing bucket in other multiplayer mods.

```ts
// server
const ARENA = 1;

Events.on("playerCommand", (player, command) => {
  if (command !== "arena") return;
  player.setVirtualWorld(ARENA);
  Chat.sendToPlayer(player, "You are in the arena. Only people in here can see you.");
});
```

## The global world

One world is special: the **global** world, number `4294967295`. Something in
the global world is visible from every world, and a player in the global world
sees every world.

Every player starts in the global world, and so does everything spawned
without a world argument. That is why, on a server that never touches this
API, everybody sees everything. It also means that moving *entities* into a
numbered world hides nothing from players who are still global. To separate
people, move the players.

| Player's world | Entity's world | Visible? |
| --- | --- | --- |
| same number | same number | Yes |
| any | global | Yes |
| global | any | Yes |
| `1` | `2` | No |

Visibility is symmetric, and the usual distance rules still apply on top of it.

```ts
// server
const GLOBAL_WORLD = 4294967295;
```

Keep that constant somewhere shared. You need it to send a player back.

## Moving things between worlds

[`setVirtualWorld`](../../reference/server/classes/Entity.md#setvirtualworld)
works on any entity, and
[`virtualWorld`](../../reference/server/classes/Entity.md#virtualworld) reads
it back. Clients that can no longer see the entity drop it, and clients that
now can receive it, state bag included.

A player's horse and dog are entities of their own. They stay where they were
when you move the player; move them too if they should follow.

## Spawning into a world

Many spawn functions take the world as their last argument, and the matching
list and clear functions take it as a filter:

| Spawn | List or clear by world |
| --- | --- |
| `Prop.spawn(..., virtualWorld)` | `Prop.destroyAll(world)` |
| `Vfx.spawn(..., virtualWorld)`, `Vfx.burst(..., virtualWorld)` | `Vfx.all(world)`, `Vfx.destroyAll(world)` |
| `Marker.place(..., virtualWorld)` | `Marker.all(world)`, `Marker.removeAll(world)` |
| `Npc.create({ virtualWorld })` | `Npc.all(world)`, `Npc.removeAll(world)` |
| `GroundItem.spawn(..., virtualWorld)` | `GroundItem.destroyAll(world)` |
| `Stash.spawn(..., virtualWorld)` | `Stash.destroyAll(world)` |
| `Quest.give(..., virtualWorld)` | `Quest.all(world)`, `Quest.find(key, world)`, `Quest.removeAll(world)` |

Leaving the world out of a spawn puts the entity in the global world. Leaving
it out of a list or clear covers every world. `Horse.spawn` and `Dog.spawn`
take no world: spawn, then call `setVirtualWorld`.

Lookups that answer about one place, like `Door.find`, `Gate.nearest` and
`World.replicasInRadius`, look in the global world when you leave the world
out. Pass the player's world when you are answering for a player who might be
elsewhere. The default gamemode's build mode does exactly that when it spawns a
prop: `Prop.spawn(..., player.virtualWorld)`.

## An arena that cleans up after itself

```ts title="src/server/arena.ts"
const GLOBAL_WORLD = 4294967295;
let nextWorld = 1;
const arenas = new Map<number, number[]>(); // world -> player ids

export function openArena(players: Player[], centre: Vector3): number {
  const world = nextWorld++;
  for (const player of players) player.setVirtualWorld(world);
  arenas.set(world, players.map((p) => p.id));

  Prop.spawn("objects/manmade/barrels/barrel_a.cgf", centre, undefined, 1, "static", world);
  Marker.place("materials/special/collision_proxy_material", centre, { shape: "cylinder", size: 12 }, world);
  return world;
}

export function closeArena(world: number): void {
  for (const id of arenas.get(world) ?? []) {
    Player.getById(id)?.setVirtualWorld(GLOBAL_WORLD);
  }
  arenas.delete(world);
  Prop.destroyAll(world);
  Marker.removeAll(world);
}

Events.on("playerDisconnect", (player) => {
  for (const [world, ids] of arenas) {
    const left = ids.filter((id) => id !== player.id);
    if (left.length === 0) closeArena(world);
    else arenas.set(world, left);
  }
});
```

The marker materials here are the ones the default gamemode's `/marker`
command uses for its red and green shapes; [Markers](../../server-scripting/world-and-objects/markers/)
covers the rest.

## Showing an entity to one player

[`setVisibleTo(player)`](../../reference/server/classes/Entity.md#setvisibleto)
restricts an entity to one player's client. Everyone else stops receiving it.
For that one player, worlds are ignored: they see it whichever world either of
them is in, as long as they are close enough. Pass `null` to lift the
restriction.

```ts
// server
const hint = Marker.place("materials/special/collision_proxy_counterfeiters_barrier", player.position, { shape: "chevron" });
hint.setVisibleTo(player);
```

Use it for things that belong to one person: a waypoint, a quest target, a
preview.

## What worlds do not split

A virtual world decides which entities a client receives, and nothing else.

- **Chat** is not scoped. `Chat.sendToAll` reaches every player. Filter by
  `player.virtualWorld` and use `Chat.sendToPlayer` if the arena should have
  its own chat.
- **Events** are not scoped. `playerChat`, `markerEnter` and the rest fire as
  usual; check the world in your handler when it matters.
- **The level** is shared. Doors, the weather and the clock are the same in
  every world.
- **NPCs** are simulated only by a client that can see them. An NPC in a
  world nobody can see sits dormant until someone can.

## Related

- [Entity state bags](../state/)
- [Props](../../server-scripting/world-and-objects/props/)
- [Build a team capture-zone mode](../../tutorials/team-rounds/)
