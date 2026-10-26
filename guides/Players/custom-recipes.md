---
title: Add custom alchemy and smithing recipes
description: Register alchemy and smithing recipes from a server script or a streamed KCD2 mod, with their own icons and recipe book pictures.
sidebar:
  label: Custom recipes
  order: 36.7
---

A server can add recipes to the game's own recipe book and smithy. The server
brews and forges them by the same rules as the game's, so the
[alchemy](../alchemy/) and [smithing](../smithing/) events, refunds and
recipe knowledge work for them unchanged.

```ts
const IRON = "92aa6120-028e-48ee-8ed1-1c5f91afaa26";  // bsmt_ironGood
const SWORD = "efa237c7-3905-4813-b9c3-a32b449c17ad"; // shortswordCommon

Crafting.registerRecipe({
  kind: "smithing",
  id: "guild_sword",
  name: "Guild sword",
  description: "The sword every guild member forges once.",
  icon: "shortswordCommon",
  category: "ShortSword",
  workpiece: "sword",
  ingredients: [{ item: IRON, amount: 2 }],
  products: [{ item: SWORD, threshold: 0 }],
} as CraftRecipeDefinition);
```

[`Crafting.registerRecipe`](../../reference/server/variables/Crafting.md#registerrecipe)
runs on the server. Call it as the resource starts: every connected player
and everyone who joins later gets the recipe, and `Crafting.recipes` lists it
with `source: "script"`.

:::note[TypeScript]
The 1.7.2 declarations type the optional fields of `CraftRecipeDefinition`
as `T | undefined`, which makes them required, so a literal that leaves them
out does not compile. Assert the type with `as CraftRecipeDefinition`, as the
samples here do. The server accepts the fields left out.
:::

## Register an alchemy recipe

```ts
const CHAMOMILE = "7259b9bc-dfae-487e-a8bb-c1f500894e0c";  // herb_chamomile
const HAIR_O_DOG = "7a1e8447-4449-473b-aac9-63f7a324fa0b"; // potion_hair_o_dog

Crafting.registerRecipe({
  kind: "alchemy",
  id: 9100,
  name: "Chamomile tonic",
  usage: "Calms the nerves before a duel.",
  icon: "potion_hair_o_dog",
  base: "Water",
  baseXP: 10,
  ingredients: [{ item: CHAMOMILE, amount: 1 }],
  products: [{ item: HAIR_O_DOG, threshold: 1, maxYield: 2 }],
  steps: [
    { id: 1, type: "Trivial", condition: `PotionBase() AND IngredientCount('${CHAMOMILE}') >= 1` },
    { id: 2, type: "Easy", text: "Grind the chamomile.", condition: `IsMilled('${CHAMOMILE}', 1)` },
  ],
} as CraftRecipeDefinition);
```

| Field | Meaning |
| --- | --- |
| `id` | A whole number from 1 to 2147483647 that nothing else uses. When two recipes would identify the same brew, the lower id wins, as in the game. |
| `base` | Required. The liquid the brew starts from: `Water`, `Wine`, `Oil` or `Spiritus`. |
| `products` | 1 to 4, one per grade. `threshold` is the grade, 1 to 4, and `maxYield` the potions it makes, 1 to 64. Not a quest item. |
| `steps` | Required, 1 to 28. Each has a distinct `id` from 1 to 28, its bit in the [knowledge](../alchemy/#keep-what-players-learn) mask. The first step identifies the recipe: a brew that fails it is not this recipe. |
| `steps[].type` | `Trivial`, `Easy` or `Hard`, worth 0, 12 or 24 XP. |
| `steps[].text`, `feedbackPriority` | The step's line in the recipe book, and the order failed steps are listed in (default 0). |
| `usage` | The recipe book's usage text. |
| `baseXP` | Brewing XP before grade multipliers and step XP. Default 0. |

A `condition` uses the game's own syntax, terms joined by ` AND `:
`PotionBase()`, `IngredientCount('<item>') == n` or `>= n`,
`IsMilled('<item>', 0 | 1)`, `WeakBoilingTime('<item>', time)`,
`StrongBoilingTime('<item>', time)`, `IsBaseDistilled(0 | 1)` and
`IsResultMilled(0 | 1)`. Item GUIDs go in lower case, a time is in the game
table's units, and a condition is at most 1024 characters. Anything else is
refused. The game's own `AlchemyRecipe.xml` rows are the best examples.

## Register a smithing recipe

| Field | Meaning |
| --- | --- |
| `id` | Letters, digits, `_`, `-` and `.`, up to 128 characters, that nothing else uses. |
| `category` | Required. The smithy tab: `ShortSword`, `LongSword`, `Axe` or `Other`. |
| `workpiece` | Required. The blank on the anvil: `sword`, `longsword`, `axe` or `horseshoe`. |
| `products` | `threshold` is the lowest workpiece quality, 0 to 100 percent, that makes it. A melee weapon, armour that never changes condition, or a miscellaneous item; not a quest item. |
| `minSkill` | The craftsmanship it takes. Default 0. |
| `perk` | The GUID of a perk that teaches it. Without one, every smith knows it. |
| `description` | The text the smithy shows. |

## Rules for both kinds

- **Items** are item class GUIDs of the game or of a streamed
  [KCD2 mod](../../core-concepts/kcd2-mods/), and the server must know each
  one when you register. Table names and [custom items](../custom-items/) are
  refused. Each of the 1 to 64 ingredients appears once with an amount of at
  least 1. A quest item ingredient must be held but is never taken.
- **Texts** (`name`, `usage`, `description`, step `text`) are shown exactly as
  written, untranslated, and are at most 256 characters.
- **Icon:** `icon` names one of the game's item icons, such as
  `potion_hair_o_dog` or `shortswordCommon`; `iconImage` brings your own.
  Give one or the other, not both.
- **`dlcId`** ties the recipe to a DLC, filtered as the game's recipes are.
  Default 0.
- **A recipe lasts until the server stops.** Registering the same definition
  again does nothing. To change one, give it a new id or restart the server.

`registerRecipe` throws, with the reason in its message, for a malformed
definition, a field of the other kind (`steps` on a smithing recipe), an item
the server does not know, an id the game, a streamed mod or another resource
uses (the game's test recipes too: alchemy 1001 and 1002, smithing
`basic_axe`, `basic_horseshoe` and `basic_longsword`), or a different
definition under an id already registered.

## Give a recipe its own pictures

| Field | Where the game shows it | Fitted onto |
| --- | --- | --- |
| `iconImage` | The recipe's icon in the recipe lists, alchemy and smithing. | 64x64 |
| `productImage` | Alchemy: the picture beside the description in the recipe book. | 256x256 |
| `recipeImage` | Alchemy: the recipe book's large recipe picture. | 1024x1024 |

```ts
declare function readPng(file: string): string; // the file as base64 text

Crafting.registerRecipe({
  kind: "smithing",
  id: "guild_sword",
  name: "Guild sword",
  iconImage: readPng("art/guild_sword_icon.png"),
  category: "ShortSword",
  workpiece: "sword",
  ingredients: [{ item: "92aa6120-028e-48ee-8ed1-1c5f91afaa26", amount: 2 }],
  products: [{ item: "efa237c7-3905-4813-b9c3-a32b449c17ad", threshold: 0 }],
} as CraftRecipeDefinition);
```

Each picture is a PNG as base64 text, which a server script reads with Node's
`fs` module: `fs.readFileSync(path.join(__dirname, file)).toString("base64")`.
Each is scaled to its square with its proportions kept and centred on a
transparent background, so a square picture whose subject reaches the edges
looks like the game's. A PNG may be up to 4096x4096 pixels, but **a recipe's
pictures take at most 256 KiB of PNG together**; more throws. A picture a
player's game cannot decode shows the game's placeholder.

An alchemy recipe can show the book pictures of one of the game's own alchemy
recipes instead: set `bookPicturesFrom` to that recipe's id, which
`Crafting.recipes` lists as `key.id`, and leave `productImage` and
`recipeImage` out. Giving them as well, using it on a smithing recipe, or
naming anything but a game alchemy recipe throws. See
[Borrow a game recipe's pictures](../../tutorials/borrow-recipe-pictures/).

## Ship recipes in a KCD2 mod

A resource that streams a [KCD2 mod](../../core-concepts/kcd2-mods/) can carry
recipe table patches in the game's own format:

```text
resources/<resource>/replace/libs/tables/minigame/alchemyrecipe__<id>.xml
resources/<resource>/replace/libs/tables/minigame/blacksmithrecipes__<id>.xml
```

The server reads them when the resource starts and drops them when it stops;
players' games load them at their next level load. A row with the id of one of
the game's recipes replaces it, as in single player. When two resources add
the same id, the resource whose name sorts first keeps it. A row the server
cannot read, or one naming an item it does not know, is left out with a
warning in the server log. These recipes list with `source: "mod"`, and cannot
bring their own pictures: a new alchemy recipe shows the game's placeholder in
the book.

## What players see

- **Smithy:** a recipe without a `perk` is listed for every smith, one with a
  perk only for those who have it (`player.addPerk` teaches it). Crafting asks
  the server, which checks skill, materials and perk.
- **Recipe book:** a recipe appears once the player knows one of its steps.
  A successful brew teaches all of it, and `Crafting.setKnowledge(player, 9100, 536870911)`
  teaches every step at once. Knowledge starts empty every session.
- **Brewing** needs no knowledge: the right ingredients, handled the right
  way, make the potion whether or not the book shows it.

## Limitations

- Build alchemy recipes from herbs and the game's other alchemy ingredients.
  The alchemy table may not let players put other items on it.
- A herb a streamed mod adds always counts as fresh when the potion's quality
  is worked out.
- A melee weapon a streamed mod adds gets the forged condition of an ordinary
  weapon, whatever its weapon class.

The [custom recipes tutorial](../../tutorials/custom-recipes/) builds both
recipes above and tries them in the game.

## Related

- [Alchemy](../alchemy/) and [Smithing](../smithing/): sessions, events and refunds
- [KCD2 mods](../../core-concepts/kcd2-mods/): streaming a mod's tables
- [Crafting reference](../../reference/server/variables/Crafting.md)
