---
title: "Inventories: read, change and save"
description: Read and change the inventories the server holds for every player, move items between players, set item quality and condition, and keep inventories between sessions.
sidebar:
  label: Inventories
  order: 35
---

The server holds player and NPC inventory stock, and each player's game displays the
items it receives. The example below saves inventory rows, equipment and the current
outfit's quickslots. The server keeps nothing once a player leaves: save what you need
and restore it when they come back.

```ts
type SavedRow = { id: string; item: string; amount: number; metadata: Record<string, unknown>; equipped: number };
type SavedInventory = { items: SavedRow[]; quickslots: InventoryQuickslots | null };
const saved = new Map<string, SavedInventory>(); // demo storage, lost on restart

Events.on("playerConnect", (player) => {
  const inventory = saved.get(player.nickname);
  if (inventory) {
    const result = Inventory.set(player, inventory);
    if (!result.ok) console.log(`Restore refused: ${result.code}`);
  }
});

Events.on("playerDisconnect", (player) => {
  const state = Inventory.get(player);
  if (!state) return;
  saved.set(player.nickname, {
    items: state.items.map(({ id, item, amount, metadata, equipped }) => ({ id, item, amount, metadata, equipped })),
    quickslots: state.quickslots,
  });
});
```

An inventory exists from `playerConnect` until just after `playerDisconnect`,
so restoring it at `playerConnect` means the player loads in with it.
`playerInventoryReady` fires later, once their game shows it for the first
time. This example uses nicknames only to keep the sample short; use an
authenticated account ID and durable storage in a real server. For quick
gives and takes by item name, [Items](../items/) is simpler.

## Save quickslots with the inventory

`state.quickslots` describes the current native outfit, or is null when no
quickslot snapshot exists. Save it with the exact rows it references:

| Field | Saved value |
| --- | --- |
| `weapons` | Four entries, each with `primary` and `secondary` row IDs or null. A row can appear in multiple slots. |
| `items` | Four row IDs or null. |
| `activeWeapon`, `activeItem` | Selected slot indices from 0 to 3. |

Pass it back as `Inventory.set(player, { items, quickslots })`. Keep row IDs, equipped
belts and pouches so the references and slot capacity remain valid. A malformed shape
or a reference outside `items` returns `invalidQuickslots` before changing anything.
Native item eligibility and capacity still apply. If you omit `quickslots` or pass
null, normal equipment handling assigns the slots. This saves the current outfit, not
every outfit the game can hold.

Register [custom item definitions](../custom-items/) before restoring their
rows, and retain complete `metadata`, including `metadata.custom`.
For NPC stock and harvest state, see [Corpse loot](../../npcs-and-animals/npc-inventories/).

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
| `add` | Gives 1 to 10000 units of a class, by GUID or table name. `metadata.quality` asks for a higher tier, up to the best the class is made in. They join the row that already holds that class with the same properties. |
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
`staleRevision`, `inventoryCapacity`, `invalidQuality` (a tier the class is
not made in), `questItem` (only its quest hands it out) and, from `set`,
`invalidEquipment` (a row worn more times than its amount, a worn item that
cannot be equipped, or too many worn rows). The
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

A new item with no properties is quality 1 at full condition. The game can wear an
item down (a blade blunted in a fight), which arrives as a `wear` change. A player who
repairs gear with repair kits gets a `repair` change: the kits' loss and the
equipment's gain arrive together, or not at all. One repair may use up to 16 kits;
longer operations are refused. Sharpening a blade at a native grindstone can increase
its health. The server checks the station, distance and supported weapon class, then
records one `sharpen` change. Sharpening spends no repair kit. The server reverses
unapproved improvements.

### Change condition without losing metadata

`setProperties` replaces metadata. Copy what you want to keep, remove an
old absolute `health` when supplying `condition`, and use the revision you read:

```ts
const snapshot = Inventory.get(player);
const row = snapshot?.items.find(item => item.equipped > 0);
if (snapshot && row) {
  const metadata = { ...row.metadata };
  delete metadata.health;
  metadata.condition = 0.75;
  Inventory.setProperties(player, { id: row.id, metadata, revision: snapshot.revision });
}
```

Native repair kits also support selecting several pieces of equipment in one
repair operation. The server receives the repaired items and kit consumption
together; a script does not need to repair each selected item a second time.

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
`transfer` for your calls; `use`, `shot`, `wear`, `repair` and `sharpen` for the player's
game; `deposit` and `withdraw` for moves into and out of a
[container](../../world/stashes/); `trade`, `pickpocket`, `drop`, and the
ground and herb-picking reasons for the other systems.

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
