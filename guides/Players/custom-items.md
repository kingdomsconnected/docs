---
title: Create custom inventory items
description: Register your own item types, personalize individual rows, and decide what happens when players use them.
sidebar:
  label: Custom items
  order: 35.1
---

Create timber, tokens, letters or other items for your resource, with their own names,
weight and price. Register the type on the server, then use its returned GUID with the
existing inventory, stash, ground-item and shop APIs.

```ts
const timber = Items.register("village:timber", {
  name: "Village timber",
  description: "Timber reserved for village repairs.",
  visual: "bsmt_woodExotic",
  weight: 2,
  price: 12,
});

Events.on("gatheringHarvested", (player) => {
  const result = Inventory.add(player, { item: timber, amount: 1 });
  if (!result.ok) console.log(`Timber reward refused: ${result.code}`);
});
```

This example gives a bonus when a player picks an herb. It does not add a
woodcutting interaction. Your game mode chooses when and why to award items.

## Define a type

`Items.register(id, definition)` returns a stable logical GUID. Keep the ID in your
resource, such as `village:timber`, and save the definition with any persisted items.
Registering an identical definition again is safe. Changing an existing definition
before the server restarts throws.

| Definition field | Meaning |
| --- | --- |
| `name` | Required display name, up to 256 bytes. |
| `description` | Inventory description, up to 4096 bytes; empty by default. |
| `visual` | Required existing item GUID or exact table name. |
| `weight` | Required finite weight from 0 to 1,000,000. |
| `price` | Whole-number base price, 0 to 2,147,483,583; defaults to 0. |
| `stackable` | Defaults to `true`. `false` creates a separate row per unit. |
| `usable` | Defaults to `false`. Enables the custom use action. |
| `useLabel` | Action text, up to 64 bytes; defaults to `Use`. |

IDs use letters, digits and `:_-.`, up to 128 bytes. Display strings cannot
contain control characters. A server can register up to 4096 types.

Choose an appearance from the game's MiscItem, Misc, CraftingMaterial or
Document categories. The custom type borrows its model, material and icon.
It is a miscellaneous item: choosing a letter does not give it vanilla
reading behavior, and choosing a crafting material does not add a recipe.
This API does not define new weapons, armor or native consumables.

Registration also works after players join. You can call `Inventory.add` immediately
afterward; clients receive the definitions before displaying the items.

## Give each item its own text and data

```ts
const letter = Items.register("village:letter", {
  name: "Letter",
  visual: "a54ab5ef-d4a2-4929-9045-1a1efde935c5",
  weight: 0.1,
  price: 1,
  stackable: false,
  usable: true,
  useLabel: "Read",
});

function deliver(player: Player): InventoryResult {
  return Inventory.add(player, {
    item: letter,
    amount: 1,
    metadata: {
      custom: {
        name: "Letter from Anna",
        description: "A message sealed for the miller.",
        data: { mailId: "anna-001" },
      },
    },
  });
}
```

`metadata.custom.name` and `description` override this row's display text.
`metadata.custom.data` is a private server object. Clients receive the display
overrides and a value used to compare stackable variants. They do not receive the
private data. Use your own events to send only the content a player needs.

`row.name` is still the internal registration ID. Stackable items merge only
when their native and custom properties match, including private data.
Different letters can therefore use one type without losing their identity.

## Change a row

```ts
function markOpened(player: Player, row: InventoryRow, revision: number): InventoryResult {
  return Inventory.updateCustom(player, {
    id: row.id,
    name: "Opened letter",
    revision,
  });
}
```

Omitted fields stay unchanged. A null `name` or `description` restores the
type's default. Supplying `data` replaces the whole object; null clears it.
The operation changes the whole row while preserving its ID and amount.
Custom properties are limited to 16 KiB of JSON and 48 levels of nesting.
Check `result.ok`, including when a saved revision has become stale.

## Handle use on the server

```ts
Events.on("playerCustomItemUse", (player, row, revision) => {
  if (row.name !== "village:letter") return;
  console.log(`${player.nickname} reads row ${row.id} at revision ${revision}`);
});
```

The server checks ownership, revision and usability before this event. The `row`
argument is frozen. Choosing the primary use action or double-clicking requests the
custom action without running vanilla use. The action does not automatically consume
anything. For a consumable, remove a unit with `Inventory.remove` and grant the effect
only if it succeeds. After asynchronous work, recheck the row and handle a stale
revision.

A client [Inventory.onUse handler](../../client-scripting/inventory-use/)
replaces this automatic server request. Choose one flow for each item.

## Trade and save custom items

Custom properties are kept when items are transferred, deposited in or withdrawn from
a stash, dropped on the ground, or picked up. Shop stock accepts `metadata`, and
`vendorTrade` includes it on each line. Give types sold in native shops a positive
base `price`; a zero base price can hide the item even when stock has a positive sale
price. The native shop supports one stock row per class, and selling does not
automatically restock it. See [Shops](../../quests-dialogue-and-shops/vendors/).

Custom items are not saved to disk automatically. To keep them across restarts, save
the registration IDs and definitions, plus each inventory row's ID, item GUID, amount
and complete metadata. Register the definitions before restoring rows with
`Inventory.set` or `stash.setInventory`. Keep equipped counts and quickslots when
saving a player's other possessions too.

## Try it

The default game mode provides `/customitems` to grant timber and two named letters.
Read each letter, then try `/customitems rename`, `/customitems defaults` and
`/customitems vendor`. These commands belong to the default game mode; other servers
may not provide them.

Build your own version with [A readable custom letter](../../tutorials/custom-letter/).

## Related

- [Inventory transactions](../inventory/)
- [Books and letters](../../user-interface/books/)
- [Items reference](../../reference/server/variables/Items.md)
