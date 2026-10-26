---
title: Brew and forge your own recipes
description: Register a potion and a sword recipe, teach the potion with a command, then give both their own icon and the potion its own recipe book pictures.
sidebar:
  label: Custom recipes
  order: 99.6
---

A server can add its own alchemy and smithing recipes. They appear in the
game's own recipe book at the alchemy table and in the smithy's list, and
the server brews and forges them by the same rules as the game's recipes.
You will add a potion and a sword, then give both their own icon and the
potion its own recipe book pictures.

:::note[Before you start]
- A server and game on Kingdoms Connected 1.7.2 or later, with the default gamemode running for `/give`.
- [Use TypeScript](../../getting-started/typescript/).
- [Custom recipes](../../players/custom-recipes/), [Brew potions at alchemy tables](../../players/alchemy/) and [Forge items at smitheries](../../players/smithing/).
- For your own pictures, PNG files. The steps below say which sizes to use.

Difficulty: intermediate. Time: about 45 minutes.
:::

## What you will learn

- Registering an alchemy recipe, with steps written in the game's own
  condition syntax.
- Registering a smithing recipe for a smithy tab and an anvil blank.
- Teaching a recipe with `Crafting.setKnowledge`.
- Replacing a recipe's icon with your own PNG, and giving an alchemy recipe
  its own recipe book pictures.

```text
guild-recipes/
  package.json
  tsconfig.json                from Use TypeScript
  art/
    tonic_icon.png
    tonic_product.png
    tonic_recipe.png
    guild_sword_icon.png
  src/server/
    recipe.ts                  a typed helper for Crafting.registerRecipe
    tonic.ts                   the alchemy recipe
    sword.ts                   the smithing recipe
    index.ts                   registers both, and /learn
    node.d.ts                  added in step 6
    png.ts                     added in step 6
```

## 1. Write the manifest

Create `resources/guild-recipes` and copy the server `tsconfig.json` from
[Use TypeScript](../../getting-started/typescript/#2-the-server-program).

```json title="package.json"
{
  "name": "guild-recipes",
  "version": "1.0.0",
  "scripts": { "build": "tsc -p tsconfig.json" },
  "devDependencies": {
    "@kingdomsconnected/types": "latest",
    "typescript": "^5.9.2"
  },
  "mafiahub": { "serverScripts": ["dist/server/index.js"] }
}
```

## 2. Type the recipe definition

`Crafting.registerRecipe(definition)` takes a `CraftRecipeDefinition`. The
declarations type its optional fields, and those of each step, as
`T | undefined` without a `?`, so TypeScript would ask for every one of them
in an object literal. This helper names the fields every recipe needs and
leaves the rest optional, which is how the server reads them:

```ts title="src/server/recipe.ts"
type Needed = "kind" | "id" | "name" | "ingredients" | "products";

export type RecipeStep = Pick<CraftRecipeStepDefinition, "id" | "type" | "condition"> & Partial<CraftRecipeStepDefinition>;

export type Recipe = Pick<CraftRecipeDefinition, Needed> & Partial<Omit<CraftRecipeDefinition, "steps">> & { steps?: RecipeStep[] };

/** Crafting.registerRecipe, with the optional fields left out. */
export function registerRecipe(recipe: Recipe): void {
  Crafting.registerRecipe(recipe as CraftRecipeDefinition);
}
```

The cast changes nothing at runtime: the server receives the object as you
wrote it.

## 3. Register an alchemy recipe

Call `registerRecipe` when the resource starts. Players who join later
still get every recipe.

Ingredients and products are item class GUIDs of the game's items, or of a
KCD2 mod the server streams. Table names such as `herb_chamomile` are not
accepted here, so the code notes each GUID's table name in a comment.

```ts title="src/server/tonic.ts"
import { registerRecipe } from "./recipe.js";

export const TONIC = 9100;
const CHAMOMILE = "7259b9bc-dfae-487e-a8bb-c1f500894e0c"; // herb_chamomile
const HAIR_O_DOG = "7a1e8447-4449-473b-aac9-63f7a324fa0b"; // potion_hair_o_dog

export function registerTonic(): void {
  registerRecipe({
    kind: "alchemy",
    id: TONIC,
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
  });
}
```

The fields match a row of the game's `AlchemyRecipe.xml`:

- **`id`** is a whole number from 1 to 2147483647 that no game recipe, KCD2
  mod or other script uses.
- **`name`**, **`usage`** and each step's **`text`** are shown exactly as you
  write them.
- **`icon`** names one of the game's item icons. Step 6 replaces it with
  your own picture.
- **`base`** is the liquid the brew starts from: `Water`, `Wine`, `Oil` or
  `Spiritus`.
- **`products`** list 1 to 4 potions, one per grade. `threshold` is the grade
  from 1 to 4, and `maxYield` how many potions it makes, from 1 to 64.
- **`steps`** are what the recipe book checks. Each has a distinct `id` from
  1 to 28, a `type` of `Trivial`, `Easy` or `Hard` (0, 12 or 24 XP), and a
  `condition` in the game's own syntax. The first step identifies the
  recipe: a brew that fails it is not this recipe.

Conditions join terms with ` AND `. The terms are `PotionBase()`,
`IngredientCount('<item>') == n` or `>= n`, `IsMilled('<item>', 0 | 1)`,
`WeakBoilingTime('<item>', time)`, `StrongBoilingTime('<item>', time)`,
`IsBaseDistilled(0 | 1)` and `IsResultMilled(0 | 1)`. Write item GUIDs in
lower case. A condition can be at most 1024 characters. The game's own
recipes are the best examples.

## 4. Register a smithing recipe

A smithing recipe matches a row of `BlacksmithRecipes.xml`:

```ts title="src/server/sword.ts"
import { registerRecipe } from "./recipe.js";

const IRON = "92aa6120-028e-48ee-8ed1-1c5f91afaa26"; // bsmt_ironGood
const SWORD = "efa237c7-3905-4813-b9c3-a32b449c17ad"; // shortswordCommon

export function registerSword(): void {
  registerRecipe({
    kind: "smithing",
    id: "guild_sword",
    name: "Guild sword",
    description: "The sword every guild member forges once.",
    icon: "shortswordCommon",
    category: "ShortSword",
    workpiece: "sword",
    ingredients: [{ item: IRON, amount: 2 }],
    products: [{ item: SWORD, threshold: 0 }],
  });
}
```

- **`id`** is text: letters, digits, `_`, `-` and `.`, up to 128 characters.
- **`category`** is the smithy tab: `ShortSword`, `LongSword`, `Axe` or
  `Other`.
- **`workpiece`** is the blank on the anvil: `sword`, `longsword`, `axe` or
  `horseshoe`.
- **`threshold`** is the lowest workpiece quality, from 0 to 100, that makes
  that product.
- **`minSkill`** (optional) is the craftsmanship skill it takes.
- **`perk`** (optional) is the GUID of a perk that teaches the recipe.
  Without one, every smith knows it.

## 5. Register them and teach the tonic

The recipe book lists a recipe once the player knows at least one of its
steps. Brewing a recipe successfully teaches all of it, and
`Crafting.setKnowledge` teaches steps directly. For testing, add a command
that teaches the whole recipe:

```ts title="src/server/index.ts"
import { registerSword } from "./sword.js";
import { registerTonic, TONIC } from "./tonic.js";

registerTonic();
registerSword();

Events.on("playerCommand", (player, command) => {
  if (command !== "learn") return;
  Crafting.setKnowledge(player, TONIC, 536870911); // every step
  Chat.sendToPlayer(player, "You know the Chamomile tonic.");
});
```

Players do not need to know a recipe to brew it: the right ingredients,
handled the right way, make the potion either way.

Knowledge starts empty every session. To keep what players learned, save
`Crafting.knowledge(player)` and restore it with `Crafting.setKnowledge`.

## 6. Use your own icon

`iconImage` replaces `icon` with your own picture, as a PNG in base64 text.
Give one or the other, not both. It works for alchemy and smithing.

Make the icon square, with the item reaching the edges and a transparent
background. Each player's game fits it onto the game's 64×64 icon square,
keeping its proportions, and centres it.

Server scripts run in Node.js and can read files with its `fs` module, and
`__dirname` is the folder the compiled script is in. The tsconfig from Use
TypeScript loads only the Kingdoms Connected declarations, so declare the
two Node.js names this resource uses:

```ts title="src/server/node.d.ts"
declare const __dirname: string;

declare module "fs" {
  export function readFileSync(path: string): { toString(encoding: "base64"): string };
}
```

```ts title="src/server/png.ts"
import { readFileSync } from "fs";

/** A PNG in the resource folder, as base64. The compiled script runs from dist/server, two folders down. */
export function png(file: string): string {
  return readFileSync(`${__dirname}/../../${file}`).toString("base64");
}
```

Change the registration from step 4 rather than adding a second one: swap
`icon` for `iconImage`. If the server already registered the old
definition, restart the server. It refuses a different definition under an
ID it already has until it restarts.

```ts title="src/server/sword.ts" {2,13}
import { registerRecipe } from "./recipe.js";
import { png } from "./png.js";

const IRON = "92aa6120-028e-48ee-8ed1-1c5f91afaa26"; // bsmt_ironGood
const SWORD = "efa237c7-3905-4813-b9c3-a32b449c17ad"; // shortswordCommon

export function registerSword(): void {
  registerRecipe({
    kind: "smithing",
    id: "guild_sword",
    name: "Guild sword",
    description: "The sword every guild member forges once.",
    iconImage: png("art/guild_sword_icon.png"),
    category: "ShortSword",
    workpiece: "sword",
    ingredients: [{ item: IRON, amount: 2 }],
    products: [{ item: SWORD, threshold: 0 }],
  });
}
```

## 7. Add recipe book pictures

The alchemy recipe book shows two pictures for each recipe, beside the
icon in the recipe lists. An alchemy recipe can bring all three. As in step
6, change the registration from step 3 rather than adding a second one.

| Field | Where it shows | Fitted onto |
| --- | --- | --- |
| `iconImage` | The recipe's icon in the recipe lists. | 64×64 |
| `productImage` | The picture of the potion, beside the description. | 256×256 |
| `recipeImage` | The large recipe picture. | 1024×1024 |

```ts title="src/server/tonic.ts" {2,14-16}
import { registerRecipe } from "./recipe.js";
import { png } from "./png.js";

export const TONIC = 9100;
const CHAMOMILE = "7259b9bc-dfae-487e-a8bb-c1f500894e0c"; // herb_chamomile
const HAIR_O_DOG = "7a1e8447-4449-473b-aac9-63f7a324fa0b"; // potion_hair_o_dog

export function registerTonic(): void {
  registerRecipe({
    kind: "alchemy",
    id: TONIC,
    name: "Chamomile tonic",
    usage: "Calms the nerves before a duel.",
    iconImage: png("art/tonic_icon.png"),
    productImage: png("art/tonic_product.png"),
    recipeImage: png("art/tonic_recipe.png"),
    base: "Water",
    baseXP: 10,
    ingredients: [{ item: CHAMOMILE, amount: 1 }],
    products: [{ item: HAIR_O_DOG, threshold: 1, maxYield: 2 }],
    steps: [
      { id: 1, type: "Trivial", condition: `PotionBase() AND IngredientCount('${CHAMOMILE}') >= 1` },
      { id: 2, type: "Easy", text: "Grind the chamomile.", condition: `IsMilled('${CHAMOMILE}', 1)` },
    ],
  });
}
```

Each picture is scaled to fit its square with its proportions kept, and
centred on a transparent background. A PNG can be up to 4096×4096 pixels,
but **a recipe's pictures can take at most 256 KiB of PNG together**. The
1024×1024 picture is usually the largest, so save it at a smaller size or
compress it if the total is too big.

If a player's game cannot decode a picture, it shows the game's placeholder
in its place.

## Try it

1. Put the four PNGs in `art/`. Run `npm install` and `npm run build`, then
   `ensure guild-recipes` in the server console.
2. Type `/give herb_chamomile 2` and `/learn`.
3. Use an alchemy table and open the recipe book. **Chamomile tonic** is
   listed with your icon, usage text and steps, and your two pictures.
4. Brew it.
5. Type `/give bsmt_ironGood 2` and use a smithy. **Guild sword** is in the
   short sword tab, with your icon.

If registration throws, the error message gives the reason.
`Crafting.registerRecipe` throws when:

- the definition is malformed, or a field belongs to the other kind of
  recipe (for example `steps` on a smithing recipe);
- an item is not one the server knows, or is a custom item from
  `Items.register`, which recipes cannot use;
- the ID is used by the game, by a streamed mod or by another resource,
  including the game's test recipes (alchemy 1001 and 1002, smithing
  `basic_axe`, `basic_horseshoe` and `basic_longsword`);
- both `icon` and `iconImage` are given;
- the pictures add up to more than 256 KiB;
- the same ID is already registered with a different definition.

Registering the exact same definition again does nothing, so restarting your
resource is fine. A recipe stays until the server stops. To change one,
give it a new ID or restart the server.

:::caution[Limits]
- Build alchemy recipes from herbs and the game's other alchemy ingredients.
  The alchemy table may not let players put other items on it.
- A smithing product must be a melee weapon, armor that never changes
  condition, or a miscellaneous item. Quest items cannot be products.
- A recipe from a streamed KCD2 mod's table files cannot bring its own
  pictures.
:::

## Next steps

- Use the pictures of one of the game's own recipes instead of painting
  your own, with
  [Show a game recipe's book pictures for your alchemy recipe](../borrow-recipe-pictures/).
- Keep what players learn between sessions with
  [Brew potions at alchemy tables](../../players/alchemy/#keep-what-players-learn).
- Give the sword a `perk`, and the smithy lists it only for smiths who have
  that perk. `player.addPerk` teaches it; see
  [Forge items at smitheries](../../players/smithing/).
- Every field, recipes from streamed mods, and what players see are in
  [Custom recipes](../../players/custom-recipes/).
