---
title: Items lying on the ground
description: Lay pickable item stacks in the world, read what players drop, and react to pickups.
sidebar:
  order: 42
---

A stack lying in the world is a server-owned [`GroundItem`](../../../reference/server/classes/GroundItem.md),
unlike the contents of an inventory. Players can walk up and take it the way
they take anything the game drops. Use it for loot, rewards left at a
location, or a trail of arrows. Stacks that players throw out of their own
inventory are ground items too, so the same API reads those.

```ts
const at = player.position;
const apples = GroundItem.spawn("apple", new Vector3(at.x + 1, at.y, at.z), undefined, 5);
console.log(`laid ${apples}`);
```

## Spawning

```ts
const stack = GroundItem.spawn(
  "arrow_crude",                 // item: class name or its 32-digit GUID
  new Vector3(1024, 512, 40),    // position: put it where the ground is
  new Vector3(0, 0, 45),         // rotation: Euler degrees, or a Quaternion
  20,                            // amount, 1 to 10000
  player.virtualWorld,           // virtual world
  { quality: 1, health: 1 },     // optional condition of the item itself
);
```

The item is spelled the way `player.giveItem` spells it: a class name such as
`arrow_crude` or the GUID. See [Give and take items](../../players/inventory/)
for finding those.

The stack is **placed**, not dropped. A script-spawned stack is at rest from
the start, exactly where you put it, so a position in mid-air leaves it
floating and one below the terrain hides it. Take the height from a player
standing there, or ask a client with
[`World.resolveGround`](../raycasts/).

One stack is one entity, however many units it holds, and it is picked up
whole or not at all. Five apples in one stack is one pickup; five stacks of
one apple is five.

`properties` sets the condition of the item: `quality` as the game grades it,
`health` and `condition` from `0` to `1`. Each defaults to the class's own.
Arrows and other missiles are held to tighter bounds by the client, so when
you leave these out they get quality `1` and full health.

## Reading a stack

| Property | What it is |
| --- | --- |
| `itemClass` | The class as 32 hex digits, the same format as `player.rightHandItem` and `player.equipment`, so they compare directly. The server holds no names for classes. |
| `amount` | Units in the stack. |
| `quality`, `health`, `condition` | As spawned, or `0` / `-1` / `-1` when left to the class. |
| `resting` | Whether it has settled. Always true for a spawned stack. |
| `droppedById`, `droppedBy` | The player who threw it down (id, and the handle or `null`). `0` / `null` when the server spawned it. |

A stack a player throws starts with `resting` false: that player's own physics
is still moving it, and its `position` changes until it lands and the client
publishes the final pose. Wait for `resting` before you rely on where it is.

All of these are read-only. To change a stack, destroy it and spawn another.

## Events

| Event | Arguments | When |
| --- | --- | --- |
| `groundItemSpawn` | `groundItem` | A stack appeared: `GroundItem.spawn`, a command, or a player dropping something. |
| `groundItemPickup` | `groundItem`, `player` | A pickup was granted. Both still read. |
| `groundItemDestroy` | `groundItem` | A stack is leaving the world, including right after a pickup. Still readable. |

```ts
Events.on("groundItemSpawn", (item) => {
  const who = item.droppedBy;
  if (who) console.log(`${who.nickname} dropped ${item.amount} x ${item.itemClass}`);
});

Events.on("groundItemPickup", (item, taker) => {
  if (taker) Chat.sendToPlayer(taker, `You picked up ${item.amount}.`);
});
```

:::note[You cannot veto a pickup]
`groundItemPickup` reports a pickup, it does not ask for permission. By the
time it runs, the server has already told that client the stack is theirs.
If some players must not take an item, keep it out of their reach: put it in
a [virtual world](../../../core-concepts/virtual-worlds/) they are not in, or use
`setVisibleTo` so only one player receives it.
:::

`groundItemPickup` is always followed by `groundItemDestroy` for the same
stack, so cleanup code belongs in the destroy handler and runs however the
stack went.

## Lists and cleanup

```ts
const mine = GroundItem.spawn("apple", player.position);

GroundItem.all();                 // every stack, any world, however it got there
GroundItem.getById(mine.id);      // one stack, or null
mine.destroy();                   // just this one
GroundItem.destroyAll(3);         // every stack in virtual world 3; returns the count
GroundItem.destroyAll();          // every stack on the server
```

`all()` takes no virtual world; filter on `virtualWorld` yourself. It includes
what players dropped, so `destroyAll()` sweeps that away too. Stacks are not
removed when your resource stops: track the ids you spawned and destroy those
in `resourceStop` (the [Props](../props/#lists-and-cleanup) page shows the
pattern).

## What fails, and how

- `GroundItem.spawn` **throws** when the item is not a class in the game's
  tables, or when the stack as described is one no client could build (an
  arrow with an impossible quality, for example). Catch it when the name came
  from a player.
- `amount` runs from 1 to 10000.

:::tip[Try it]
The default gamemode's `/drop <item> [amount]` lays a stack a metre and a
half in front of you (`src/server/commands/drop.ts`), and `/drop list`,
`/drop remove <id>` and `/drop clear` cover the rest. Item names with spaces
go in quotes: `/drop "exact item name" 3`.
:::
