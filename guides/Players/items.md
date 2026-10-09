---
title: "Items: give, take and drop"
description: Give items to a player by name, take them back, read what they wear and hold, and lay item stacks on the ground.
sidebar:
  label: Items
  order: 34
---

Give items with [`giveItem`](../../reference/server/classes/Player.md#giveitem),
take them with [`takeItem`](../../reference/server/classes/Player.md#takeitem),
and lay stacks in the world with [`GroundItem`](../../reference/server/classes/GroundItem.md).
The server holds every player's inventory, so both happen at once and the
player's game shows the change a moment later.

```ts
Events.on("playerSpawned", (player) => {
  player.giveItem("apple", 3);
  player.giveItem("longswordBroad");
});
```

## Name an item

`giveItem`, `takeItem` and `GroundItem.spawn` take the exact name from the
game's item tables or the item's GUID in its dashed form:

```ts
player.giveItem("longswordBroad");                        // exact table name
player.giveItem("3858560f-cf48-436f-8815-4426003288fb");  // the same sword by GUID
```

Names are case-sensitive; GUIDs are not. There is no fuzzy lookup, so check
the result when a name comes from a player. [Item classes](../../resources/items/)
lists every name and GUID.

## Give an item

`player.giveItem(item, amount?)` adds `amount` (default 1, at most 10000) at
quality 1 and full condition. It returns `true` once the items are in the
inventory, and `false` for an unknown item, an amount outside 1 to 10000, or a
player who is not connected. To choose quality or condition, or to read what a
player owns, use [Inventories](../inventory/).

## Take an item

`player.takeItem(item, amount?)` takes units of a class across the player's
rows: every one of them, or none. It returns a promise, which is already
settled when you get it, so `await` it and read the result:

```ts
async function charge(player: Player, item: string, amount: number): Promise<boolean> {
  const result = await player.takeItem(item, amount);
  if (!result.ok) {
    Chat.sendToPlayer(player, `You need ${amount} ${item}.`); // result.reason says why
    return false;
  }
  return true;
}
```

| Field | Meaning |
| --- | --- |
| `ok` | `true` when every unit was taken. Nothing is taken otherwise. |
| `removed` | `amount` when it worked, otherwise 0. |
| `requested` | What you asked for. |
| `reason` | `""` on success. Otherwise `insufficientItems` when they do not have enough, another [inventory code](../inventory/#change-an-inventory), or a sentence for an unknown item or a player who is not connected. |

An amount of zero is refused, not read as "all of them". To move items from
one player to another, use `Inventory.transfer`, which cannot lose them half
way. The default gamemode's `src/server/commands/take.ts` is a complete `/take`.

## Read what they wear and hold

```ts
player.equipment;      // item classes being worn: string[]
player.rightHandItem;  // the drawn weapon or torch, or ""
player.leftHandItem;   // a shield, a torch, or ""
```

These report what the body actually has on, so a bare body reads as `[]`.
To dress someone, give the garment and let them put it on, or restore their
inventory with `equipped` counts, as [Inventories](../inventory/#dress-a-body) shows.

These values, and a ground item's `itemClass`, are **item classes**: 32
lowercase hex digits naming what something is, never which one. They compare
directly with each other. The server holds no display names for them.

:::caution
The 32-digit class is not the dashed GUID with the dashes removed; the bytes
come in the engine's order. Passing `player.rightHandItem` to `takeItem` fails
with an unknown item.
:::

<details>
<summary>Convert a dashed GUID to the 32-digit class form</summary>

The first three GUID fields reversed as one number, then the last eight bytes
in reverse:

```ts
function itemClassOf(guid: string): string {
  const hex = guid.replace(/-/g, "").toLowerCase();
  const pairs = hex.slice(16).match(/../g) ?? [];
  return hex.slice(12, 16) + hex.slice(8, 12) + hex.slice(0, 8) + pairs.reverse().join("");
}

const COIF = itemClassOf("1b4b6487-72cc-409e-9296-692b53e0429e");
const wearsCoif = player.equipment.includes(COIF);
```

</details>

## Put items on the ground

A stack in the world is a server-owned `GroundItem` that players pick up like
anything the game drops. Stacks players throw out of their inventory are ground
items too.

```ts
const stack = GroundItem.spawn(
  "arrow_crude",                 // item: name or GUID, as for giveItem
  new Vector3(1024, 512, 40),    // position: on the ground
  new Vector3(0, 0, 45),         // rotation: Euler degrees, or a Quaternion
  20,                            // amount, 1 to 10000
  player.virtualWorld,           // virtual world
  { quality: 1, health: 1 },     // optional condition of the item
);
```

- The stack is **placed**, not dropped: it rests exactly where you put it, so
  mid-air floats and below the terrain hides it. Take the height from a player
  standing there, or from [World.resolveGround](../../world/raycasts/) on a client.
- One stack is one entity, picked up whole. Five apples in one stack is one
  pickup; five stacks of one is five.
- `properties`: `quality` as the game grades it, `health` and `condition` from
  0 to 1. Each defaults to the class's own; missiles default to quality 1 and
  full health.

## Read a stack

| Property | What it is |
| --- | --- |
| `itemClass` | 32-hex-digit class, comparable with `player.equipment`. |
| `amount` | Units in the stack. |
| `quality`, `health`, `condition` | As spawned, or `0` / `-1` / `-1` when left to the class. |
| `resting` | Settled. A thrown stack is `false` and its `position` moves until it lands; a spawned one is always `true`. |
| `droppedById`, `droppedBy` | Who threw it (id, and handle or `null`). `0` / `null` when the server spawned it. |
| `carryable` | A prop carried in the arms rather than stock: spawned with `carryable: true`, or put down from a [carry](../carrying/). It never goes into an inventory. |

All read-only: to change a stack, destroy it and spawn another.

## React to drops and pickups

| Event | Arguments | When |
| --- | --- | --- |
| `groundItemSpawn` | `groundItem` | A stack appeared: `GroundItem.spawn`, a command, or a player dropping it. |
| `groundItemPickup` | `groundItem`, `player` | A pickup was granted. Both still read. |
| `groundItemDestroy` | `groundItem` | A stack leaves the world, including right after a pickup. Still readable. |

```ts
Events.on("groundItemPickup", (item, taker) => {
  if (taker) Chat.sendToPlayer(taker, `You picked up ${item.amount}.`);
});
```

A pickup is reported, not asked: you cannot veto it. To keep a stack from some
players, put it in a [virtual world](../../core-concepts/virtual-worlds/) they
are not in, or use `setVisibleTo`. Pickup is always followed by destroy, so put
cleanup in the destroy handler.

## Clean up

```ts
const mine = GroundItem.spawn("apple", player.position);

GroundItem.all();                 // every stack, any world, dropped ones too
GroundItem.getById(mine.id);      // one stack, or null
mine.destroy();                   // just this one
GroundItem.destroyAll(3);         // every stack in virtual world 3; returns the count
GroundItem.destroyAll();          // every stack on the server, player drops included
```

`all()` takes no world; filter on `virtualWorld`. Stacks outlive your resource:
track the ids you spawned and destroy them in `resourceStop`, as
[Props](../../world/props/) shows.

## When a call fails

| Call | Fails when | Result |
| --- | --- | --- |
| `giveItem` | Unknown item, amount outside 1 to 10000, no connection | `false` |
| `takeItem` | Not enough items, unknown item, bad amount, no connection | Resolves with `ok: false` and `reason` set |
| `GroundItem.spawn` | Unknown item, or a stack no client could build (an arrow with an impossible quality) | **Throws**: catch it for player input |

The default gamemode's `/drop <item> [amount]` (with `list`, `remove <id>` and
`clear`) is a working example; quote names with spaces.

## Custom types and crossbow ammunition

For items with your own name, weight, price and private per-instance data,
use [Custom items](../custom-items/). Register the type on the server before
giving or restoring it. A copied appearance alone does not add native use
behavior.

Players can keep bolts equipped alongside arrows. Each accepted crossbow shot spends
one bolt, and recoverable bolts can be picked up from the ground. Do not subtract
another bolt in a script reacting to a shot notification.

## Related

- [Inventories](../inventory/): rows, item quality, transfers, saving between sessions
- [Carrying](../carrying/): baskets, sacks and buckets carried in the arms
- [Shops](../../quests-dialogue-and-shops/vendors/), which move items and money in one deal
- [Build a /command system](../../tutorials/command-system/), for async commands like `/take`
- [Player appearance](../appearance/), the body under the clothes
- [Props](../../world/props/), for objects that are not items
