---
title: Show a game recipe's book pictures for your alchemy recipe
description: Give a custom alchemy recipe the recipe book pictures of one of the game's own recipes with bookPicturesFrom, and list the game's recipe IDs from a script.
sidebar:
  label: Borrow recipe pictures
  order: 99.7
---

The alchemy recipe book shows two pictures for every recipe: the potion
beside the description, and a large picture of the recipe. A custom alchemy
recipe can bring its own (see
[Add custom alchemy and smithing recipes](../custom-recipes/#7-add-recipe-book-pictures)),
but painting them takes time, and they count towards the recipe's 256 KiB
picture budget.

Instead, a recipe can show the pictures of one of the game's own alchemy
recipes. Set `bookPicturesFrom` to that recipe's ID. Your recipe keeps its
own name, usage text and steps. Only the two book pictures come from the
game's recipe. You will register a Morning remedy that shows the pictures
of the game's Hair o' the Dog.

:::note[Before you start]
- A server and game on Kingdoms Connected 1.7.2 or later.
- [Add custom alchemy and smithing recipes](../custom-recipes/). This tutorial reuses its `recipe.ts` helper.
- [Custom recipes](../../players/custom-recipes/).

Difficulty: beginner. Time: about 15 minutes.
:::

## What you will learn

- Choosing one of the game's alchemy recipes by its ID.
- Listing the game's recipe IDs with `Crafting.recipes`.
- Registering a recipe with `bookPicturesFrom`, and what the server refuses.

```text
morning-remedy/
  package.json
  tsconfig.json          from Use TypeScript
  src/server/
    recipe.ts            the helper from Add custom recipes
    index.ts             the recipe, /recipeids and /remedy
```

## 1. Set up the resource

Create `resources/morning-remedy` and copy the server `tsconfig.json` from
[Use TypeScript](../../getting-started/typescript/#2-the-server-program).

```json title="package.json"
{
  "name": "morning-remedy",
  "version": "1.0.0",
  "scripts": { "build": "tsc -p tsconfig.json" },
  "devDependencies": {
    "@kingdomsconnected/types": "latest",
    "typescript": "^5.9.2"
  },
  "mafiahub": { "serverScripts": ["dist/server/index.js"] }
}
```

Copy the helper from
[step 2 of Add custom recipes](../custom-recipes/#2-type-the-recipe-definition).
It lets a recipe leave its optional fields out:

```ts title="src/server/recipe.ts"
type Needed = "kind" | "id" | "name" | "ingredients" | "products";

export type RecipeStep = Pick<CraftRecipeStepDefinition, "id" | "type" | "condition"> & Partial<CraftRecipeStepDefinition>;

export type Recipe = Pick<CraftRecipeDefinition, Needed> & Partial<Omit<CraftRecipeDefinition, "steps">> & { steps?: RecipeStep[] };

/** Crafting.registerRecipe, with the optional fields left out. */
export function registerRecipe(recipe: Recipe): void {
  Crafting.registerRecipe(recipe as CraftRecipeDefinition);
}
```

## 2. Choose a game recipe

`bookPicturesFrom` takes the ID of one of the game's alchemy recipes. These
are the IDs, with the name each has in the game's text files:

| ID | Name in the game's text files |
| --- | --- |
| 1 | `recipe_potion_hair_o_dog_name` |
| 2 | `recipe_potion_absintium_name` |
| 3 | `recipe_potion_antidote_name` |
| 4 | `recipe_potion_archer_name` |
| 5 | `recipe_potion_bane_name` |
| 6 | `recipe_potion_bard_name` |
| 12 | `recipe_potion_energy_name` |
| 13 | `recipe_potion_fever_name` |
| 14 | `recipe_potion_marigold_decoction_name` |
| 16 | `recipe_potion_hooch_name` |
| 17 | `recipe_potion_aesop_name` |
| 18 | `recipe_potion_embrocation_name` |
| 21 | `recipe_potion_nighthawk_name` |
| 22 | `recipe_potion_paralysis_name` |
| 25 | `recipe_potion_sleep_name` |
| 26 | `recipe_potion_sneak_name` |
| 27 | `recipe_potion_stamina_name` |
| 30 | `recipe_potion_vitality_name` |
| 43 | `recipe_potion_respec_name` |
| 49 | `recipe_potion_chamomile_decoction` |
| 50 | `recipe_potion_painkiller_name` |
| 51 | `recipe_potion_fevertonic_name` |
| 52 | `recipe_perfume_shortStrong_name` |
| 53 | `recipe_perfume_longWeak_name` |
| 54 | `recipe_ammo_shot_ball_name` |
| 55 | `recipe_ammo_shot_scatter_name` |
| 56 | `recipe_soap_name` |
| 57 | `recipe_maliruvLek_potion_painterMedicine_name` (DLC) |
| 58 | `recipe_morovyOblek_perfume_aetherOil_name` (DLC) |
| 59 | `recipe_recipe_antiPlaguePotion_name` (DLC) |
| 60 | `recipe_antiInflamatoryPotion_` (DLC) |

The pictures are read from each player's own game files. Recipes 57 to 60
come from DLC, so a player who does not own that DLC may not have their
pictures. Prefer a base-game recipe if your players might not own it.

To see the pictures themselves, open the recipe book at an alchemy table
and look at that recipe.

## 3. Register the recipe and list the IDs

Leave out `productImage` and `recipeImage`, and add `bookPicturesFrom`.
The same file adds two commands: `/recipeids` prints the game's alchemy
recipe IDs to the server console, and `/remedy` teaches you the new recipe.
`Crafting.recipes` needs a connected player, which is why the list is a
chat command.

```ts title="src/server/index.ts"
import { registerRecipe } from "./recipe.js";

const REMEDY = 9101;
const CHAMOMILE = "7259b9bc-dfae-487e-a8bb-c1f500894e0c"; // herb_chamomile
const HAIR_O_DOG = "7a1e8447-4449-473b-aac9-63f7a324fa0b"; // potion_hair_o_dog

registerRecipe({
  kind: "alchemy",
  id: REMEDY,
  name: "Morning remedy",
  usage: "For the morning after a long night at the tavern.",
  icon: "potion_hair_o_dog",
  bookPicturesFrom: 1, // the pictures of the game's Hair o' the Dog recipe
  base: "Water",
  ingredients: [{ item: CHAMOMILE, amount: 2 }],
  products: [{ item: HAIR_O_DOG, threshold: 1, maxYield: 2 }],
  steps: [
    { id: 1, type: "Trivial", condition: `PotionBase() AND IngredientCount('${CHAMOMILE}') >= 2` },
  ],
});

Events.on("playerCommand", (player, command) => {
  if (command === "recipeids") {
    for (const recipe of Crafting.recipes(player, "alchemy")) {
      if (recipe.source === "game") console.log(`${recipe.key.id}: ${recipe.name}`);
    }
  } else if (command === "remedy") {
    Crafting.setKnowledge(player, REMEDY, 536870911); // every step
    Chat.sendToPlayer(player, "You know the Morning remedy.");
  }
});
```

The recipe's **icon** in the recipe lists is separate from the book
pictures. Set it as usual, with `icon` for one of the game's icons or
`iconImage` for your own.

## Try it

1. Run `npm install` and `npm run build`, then `ensure morning-remedy` in
   the server console.
2. Type `/recipeids`. The server console lists the game's alchemy recipes
   by ID and name.
3. Type `/remedy`, then open the recipe book at an alchemy table.
   **Morning remedy** shows your name, usage text and steps, with the
   game's Hair o' the Dog pictures.

If `guild-recipes` from the previous tutorial runs too, a brew of two
chamomile meets the first step of both recipes. When two recipes would
identify the same brew, the lower ID wins, so it makes the Chamomile tonic.

`Crafting.registerRecipe` throws when:

- `bookPicturesFrom` is not the ID of one of the game's alchemy recipes. A
  custom recipe's ID, or a smithing recipe's, is refused.
- `productImage` or `recipeImage` is given as well. `bookPicturesFrom`
  replaces both pictures, so you cannot mix the two.
- `bookPicturesFrom` is set on a smithing recipe. The smithy has no book
  pictures.

## Next steps

- Paint your own pictures instead with
  [step 7 of Add custom recipes](../custom-recipes/#7-add-recipe-book-pictures).
- Read every recipe field in [Custom recipes](../../players/custom-recipes/).
- Keep what players learn between sessions with
  [Brew potions at alchemy tables](../../players/alchemy/#keep-what-players-learn).
