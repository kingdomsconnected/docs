---
title: Create custom inventory items
description: Register your own item types with a borrowed look or their own model and icon, personalize individual rows, and decide what happens when players use them.
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
| `visual` | Existing item GUID or exact table name whose model, material and icon the type borrows. Required unless you give `model` and `icon`. |
| `model` | Your own model, a path relative to `Objects/`. See [below](#bring-your-own-model-and-icon). |
| `material` | A material path in the same form. Only with `model`. |
| `icon` | Your own inventory icon, a PNG as base64 text. |
| `weight` | Required finite weight from 0 to 1,000,000. |
| `price` | Whole-number base price, 0 to 2,147,483,583; defaults to 0. |
| `stackable` | Defaults to `true`. `false` creates a separate row per unit. |
| `usable` | Defaults to `false`. Enables the custom use action. |
| `useLabel` | Action text, up to 64 bytes; defaults to `Use`. |

IDs use letters, digits and `:_-.`, up to 128 bytes. Display strings cannot
contain control characters. A server can register up to 4096 types.

Choose a `visual` from the game's MiscItem, Misc, CraftingMaterial or
Document categories. The custom type borrows its model, material and icon,
and any of `model`, `material` or `icon` you also give replaces that part.
Either way it is a miscellaneous item: choosing a letter does not give it
vanilla reading behavior, and choosing a crafting material does not add a
recipe. [Custom recipes](../custom-recipes/) cannot use custom items either.
This API does not define new weapons, armor or native consumables.

Registration also works after players join. You can call `Inventory.add` immediately
afterward; clients receive the definitions before displaying the items.

## Bring your own model and icon

```ts
declare function readPng(file: string): string; // the file as base64 text; see below

const crate = Items.register("village:crate", {
  name: "Supply crate",
  model: "kcdc/village-items/crate.cgf",
  icon: readPng("icons/crate.png"),
  weight: 8,
  price: 30,
});

GroundItem.spawn(crate, player.position); // drawn with your model
```

Without `visual`, both `model` and `icon` are required.

- **`model`** draws the item on the ground, in the hand and in the inventory
  preview. Write the path relative to `Objects/`, as the game's item tables
  do: the game adds `Objects/` itself, and `.cgf` when there is no extension,
  so a path starting with `objects/` throws. A model the resource streams as
  `stream/objects/kcdc/village-items/crate.cgf` is
  `kcdc/village-items/crate.cgf`; see [Custom assets](../../core-concepts/custom-assets/).
- **The model needs a physics proxy**, as the game's own item models have.
  Without one the item shows on the ground but nobody can pick it up.
- **`material`** is a material path in the same form, allowed only with
  `model`. Without it the model's own material is used.
- **`icon`** is a PNG of at most 256 KiB and 4096x4096 pixels, as base64
  text. Each player's game scales it to the stock 64x64 icon, keeping its
  proportions, so make it square with the item reaching the edges.

Server scripts read the file with Node's `fs` module, for example
`fs.readFileSync(path.join(__dirname, file)).toString("base64")`. An `icon`
that is not a PNG, is cut short or breaks the limits throws when you register. The
server does not decode the pixels, so a picture a player's game cannot read
still registers; that player sees the `visual`'s icon, or a stock one, and
their game logs a warning. Registering a new icon under an existing id
throws like any other change: use a new id, or restart the server.
The [custom item icons tutorial](../../tutorials/custom-item-icons/) walks
through a borrowed look, a borrowed model with your icon, and both your own.

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
