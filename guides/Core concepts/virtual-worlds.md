---
title: Virtual worlds (dimensions)
description: Split players and entities into separate dimensions on one map, send them back to the global world, and show an entity to one player only.
sidebar:
  label: Virtual worlds
  order: 26
---

A virtual world is a number every entity carries. Players only see entities in
their own world, so a duel arena, a tutorial or a private build area can share
the map without seeing each other. Other mods call it a dimension or routing
bucket.

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

World `4294967295` is **global**: whatever is in it is visible from every
world, and a player in it sees every world. Every player starts there, as does
everything spawned without a world. Moving entities into a numbered world
hides nothing from players who are still global: to separate people, move the
players.

| Player's world | Entity's world | Visible? |
| --- | --- | --- |
| same number | same number | Yes |
| any | global | Yes |
| global | any | Yes |
| `1` | `2` | No |

Visibility is symmetric, and distance rules still apply. Keep
`const GLOBAL_WORLD = 4294967295;` somewhere shared: you need it to send a
player back.

## Move an entity between worlds

[`setVirtualWorld`](../../reference/server/classes/Entity.md#setvirtualworld)
works on any entity, and
[`virtualWorld`](../../reference/server/classes/Entity.md#virtualworld) reads it
back. Clients that can no longer see it drop it; clients that now can receive
it, state bag included. A player's horse and dog stay behind unless you move
them too.

## Spawn into a world

| Spawn with a world as last argument | List or clear by world |
| --- | --- |
| `Prop.spawn(..., virtualWorld)` | `Prop.destroyAll(world)` |
| `Vfx.spawn(..., virtualWorld)`, `Vfx.burst(..., virtualWorld)` | `Vfx.all(world)`, `Vfx.destroyAll(world)` |
| `Marker.place(..., virtualWorld)` | `Marker.all(world)`, `Marker.removeAll(world)` |
| `Npc.create({ virtualWorld })` | `Npc.all(world)`, `Npc.removeAll(world)` |
| `GroundItem.spawn(..., virtualWorld)` | `GroundItem.destroyAll(world)` |
| `Stash.spawn(..., virtualWorld)` | `Stash.destroyAll(world)` |
| `Quest.give(..., virtualWorld)` | `Quest.all(world)`, `Quest.find(key, world)`, `Quest.removeAll(world)` |

- Leaving the world out of a spawn uses the global world; out of a list or
  clear, it covers every world.
- `Horse.spawn` and `Dog.spawn` take no world: spawn, then `setVirtualWorld`.
- Lookups about one place (`Door.find`, `Gate.nearest`,
  `World.replicasInRadius`) search the global world by default. Pass the
  player's world when answering for a player, as in
  `Prop.spawn(..., player.virtualWorld)`.

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

## Show an entity to one player

[`setVisibleTo(player)`](../../reference/server/classes/Entity.md#setvisibleto)
restricts an entity to one player's client. For that player, worlds are
ignored (distance still applies). Pass `null` to lift it. Use it for a
waypoint, a quest target or a preview.

```ts
// server
const hint = Marker.place("materials/special/collision_proxy_counterfeiters_barrier", player.position, { shape: "chevron" });
hint.setVisibleTo(player);
```

## What worlds do not split

A world decides which entities a client receives, nothing else.

| Not split | What to do |
| --- | --- |
| Chat | `Chat.sendToAll` reaches everyone. Filter by `player.virtualWorld` and use `Chat.sendToPlayer`. |
| Events | `playerChat`, `markerEnter` and the rest fire as usual. Check the world in the handler. |
| The level | Doors, weather and clock are the same in every world. |
| NPC simulation | Only a client that can see an NPC runs it. One nobody can see stays dormant. |

## Related

- [State bags](../state/): delivered along with the entity
- [Markers and trigger zones](../../world/markers/): the materials and shapes used above
- [Spawn props and objects](../../world/props/): spawning with a world
- [Build a team capture-zone mode](../../tutorials/team-rounds/): worlds in a full mode
