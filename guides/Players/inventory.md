---
title: "Inventories: read, change and save"
description: Read and change the inventories the server holds for every player, move items between players, set item quality and condition, and keep inventories between sessions.
sidebar:
  label: Inventories
  order: 35
---

The server holds every connected player's inventory, and their game only
displays it. Nothing a player's game does can create an item, so a script can
trust what it reads. The server keeps nothing once a player leaves: save what
you need and restore it when they come back.

```ts
type SavedRow = { id: string; item: string; amount: number; metadata: Record<string, unknown>; equipped: number };
const saved = new Map<string, SavedRow[]>(); // swap for your own storage

Events.on("playerConnect", (player) => {
  const items = saved.get(player.nickname);
  if (items) Inventory.set(player, { items });
});

Events.on("playerDisconnect", (player) => {
  const state = Inventory.get(player);
  if (!state) return;
  saved.set(player.nickname, state.items.map(({ id, item, amount, metadata, equipped }) => ({ id, item, amount, metadata, equipped })));
});
```

An inventory exists from `playerConnect` until just after `playerDisconnect`,
so restoring it at `playerConnect` means the player loads in with it.
`playerInventoryReady` fires later, once their game shows it for the first
time. For quick gives and takes by item name, [Items](../items/) is simpler.

## Read an inventory

[`Inventory.get(player)`](../../reference/server/variables/Inventory.md#get),
or `player.getInventory()`, returns a copy, or `null` for a player who is not
connected:

```ts
const state = Inventory.get(player);
if (state) {
  for (const row of state.items) console.log(`${row.amount}x ${row.name} (quality ${row.quality})`);
}
```

Items come in **rows**: units of one item class with identical properties.

| Field | What it is |
| --- | --- |
| `id` | The row's identity in this inventory. Stable while the row exists; operations name rows by it. |
| `item` | Item class GUID. |
| `name` | The name in the game's item tables, not translated. |
| `amount` | Units in the row. |
| `quality`, `health`, `condition` | Copies of the same `metadata` keys, below. |
| `equipped` | Units the body wears or holds, as the player's game last reported. |
| `metadata` | Every property the server keeps. Pass it back unchanged to keep an item exactly. |

The state also carries `revision`, which goes up by one with every change,
and `ready`, which is `false` until the player's game shows the latest revision.

## Change an inventory

```ts
Inventory.add(player, { item: "longswordBroad", amount: 1, metadata: { quality: 3, condition: 0.5 } });
Inventory.remove(player, { units: [{ id: "row-id", amount: 2 }] });
Inventory.setProperties(player, { id: "row-id", metadata: { quality: 2 } });
Inventory.set(player, { items: [{ item: "apple", amount: 5 }] }); // replaces everything
Inventory.transfer(player, target, { units: [{ id: "row-id", amount: 1 }] });
```

| Call | What it does |
| --- | --- |
| `add` | Gives 1 to 10000 units of a class, by GUID or table name. They join the row that already holds that class with the same properties. |
| `remove` | Takes exact units from named rows. |
| `setProperties` | Replaces one row's properties. It replaces, not merges: carry over what you want to keep. |
| `set` | Replaces the whole inventory: a restore. Rows keep the `id` you give them and get a new one otherwise. `items: []` empties it. |
| `transfer` | Moves exact units from one player to another, properties included. Whether they may trade is for your script to decide. |

Every call happens completely, or not at all, and returns a result:

```ts
const result = Inventory.transfer(player, target, { units: [{ id: "row-id", amount: 1 }] });
if (!result.ok) console.log(`refused: ${result.code}`); // "insufficientItems", "unknownItem"...
else console.log(`landed in row ${result.items[0]?.id}`); // the target's row
```

`result.items` names the rows that received units, `result.revision` is the
revision after the call, and `code` is empty on success. The common codes are
`inventoryUnavailable` (not connected), `unknownItem` (no such row),
`invalidItem` (no such item class), `insufficientItems`, `invalidAmount`,
`staleRevision` and `inventoryCapacity`. The
[reference](../../reference/server/interfaces/InventoryResult.md) lists the rest.

### Refuse a change if the inventory moved

Pass the `revision` you read, and the call is refused with `staleRevision` if
anything changed in between. Use it when a decision depends on what you read,
such as a price check before a sale. A transfer takes `sourceRevision` and
`targetRevision`.

```ts
const state = Inventory.get(player);
const coins = state?.items.find((row) => row.name === "money");
if (state && coins && coins.amount >= 50) {
  Inventory.remove(player, { units: [{ id: coins.id, amount: 50 }], revision: state.revision });
}
```

## Item properties

| Key | What it is |
| --- | --- |
| `quality` | 1 up to the class's maximum (usually 3 for armour, 4 for weapons, 1 for consumables). |
| `health` | Absolute item health, inside the range its quality allows. |
| `condition` | Health as a fraction of that range, 0 to 1. Give `health` or `condition`, not both. |
| `poison`, `poisonCharges` | Arrows and bolts only: the poison buff GUID coating it, and uses left. |
| `onEquipBuffs` | Buff GUIDs the item applies while worn. |

A new item with no properties is quality 1 at full condition. The game can
wear an item down (a blade blunted in a fight), which arrives as a `wear`
change; a repair it tries on its own is put back.

## Dress a body

`Inventory.set` takes an `equipped` count on each row: how many of those units
the body wears or holds. Their game dresses them in it, which is how a
restored player comes back in the same clothes. Only gear can be equipped, at
most 48 rows.

```ts
Inventory.set(player, {
  items: [
    { item: "longswordBroad", amount: 1, equipped: 1 },
    { item: "apple", amount: 3 },
  ],
});
```

## React to changes

| Event | Arguments | When |
| --- | --- | --- |
| `playerInventoryChanged` | `player`, `change` | An operation changed an inventory. Raised on the next tick, in order, once per inventory it touched. |
| `playerInventoryReady` | `player` | Their game shows their inventory for the first time this session. |
| `playerItemUsed` | `player`, `item`, `kind`, `amount` | Their game ate, drank, applied or fired items: `food`, `potion`, `ointment` or `shot`. |

`change.items` lists only the rows that changed, each with `before` and
`after`: `before: null` is a new row, `after: null` an emptied one.
`change.reason` says what did it: `add`, `remove`, `properties`, `set` and
`transfer` for your calls; `use`, `shot` and `wear` for the player's game;
`trade`, `pickpocket`, `drop`, and the ground, container and herb-picking reasons
for the other systems.

Save from here if a server crash must not lose a session:

```ts
Events.on("playerInventoryChanged", (player, change) => {
  for (const row of change.items) {
    console.log(`${player.nickname} ${change.reason}: ${row.before?.amount ?? 0} -> ${row.after?.amount ?? 0} of ${row.id}`);
  }
});
```

:::caution
`playerItemUsed` is the player's game speaking. The server checked that the
units existed and were the right kind, but it did not see the meal or the
shot. A reward for using an item costs exactly that item.
:::

## Drop everything on death

`player.dropInventory()` moves the player's items into a
[container](../../world/stashes/) spawned at their body that anyone can loot:

```ts
Events.on("playerDied", (player) => {
  const drop = player.dropInventory({ keepEquipped: true }); // keep worn gear
  if (drop) console.log(`${player.nickname} dropped their pockets in stash ${drop.id}`);
});
```

It returns `null` when there was nothing to drop. At most 128 rows go. When
the container disappears is up to you: the default gamemode's
`src/server/death-drop.ts` removes it once it is empty or after thirty minutes.

## Related

- [Items](../items/): give and take by name, equipment, ground items
- [Stashes](../../world/stashes/): containers with inventories of their own
- [Shops](../../quests-dialogue-and-shops/vendors/): deals settle in one `trade` change
- [Inventory reference](../../reference/server/variables/Inventory.md)
