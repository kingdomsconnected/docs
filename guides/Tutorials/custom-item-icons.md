---
title: Give a custom item its own icon and model
description: Register three custom items, one borrowing a game item's look, one with its own icon and one with its own streamed model, then hand them out and lay one on the ground.
sidebar:
  label: Custom item icons
  order: 99.5
---

A server can add its own kinds of items: timber for a building gamemode, a
guild token, a sealed letter. Players carry them in the inventory, drop
them, trade them and sell them like the game's items. A custom item can have
its own inventory icon, and its own model on the ground and in the hand.

You will register three items, each with a bit more of its own look:

1. timber that borrows the look of a game item;
2. a guild token that borrows a game item's model but has its own icon;
3. a supply crate with its own model and its own icon.

:::note[Before you start]
- A server and game on Kingdoms Connected 1.7.2 or later.
- [Use TypeScript](../../getting-started/typescript/).
- [Create custom inventory items](../../players/custom-items/) and [Items: give, take and drop](../../players/items/).
- For an icon, a PNG file. For a model, a `.cgf` mesh with a physics proxy.

Difficulty: intermediate. Time: about 30 minutes.
:::

## What you will learn

- Registering an item that borrows a game item's model and icon with
  `visual`.
- Reading a PNG from the resource folder and giving it as the item's `icon`.
- Streaming a mesh from the resource and using it as the item's `model`.
- Giving the items with `Inventory.add`, and laying one on the ground with
  `GroundItem.spawn`.

```text
village-items/
  package.json
  tsconfig.json                  from Use TypeScript
  icons/
    token.png
    crate.png
  stream/
    objects/
      kcdc/
        village-items/
          crate.cgf              streamed to every player
  src/server/
    node.d.ts                    the two Node.js names png.ts uses
    png.ts                       reads an icon as base64
    wood.ts                      borrows a game item's look
    token.ts                     its own icon
    crate.ts                     its own model and icon
    index.ts                     /wood, /token and /crate
```

## 1. Write the manifest

Create `resources/village-items` and copy the server `tsconfig.json` from
[Use TypeScript](../../getting-started/typescript/#2-the-server-program).

```json title="package.json"
{
  "name": "village-items",
  "version": "1.0.0",
  "scripts": { "build": "tsc -p tsconfig.json" },
  "devDependencies": {
    "@kingdomsconnected/types": "latest",
    "typescript": "^5.9.2"
  },
  "mafiahub": { "serverScripts": ["dist/server/index.js"] }
}
```

## 2. Borrow a game item's look

`Items.register(id, definition)` runs in a server script and returns the
new item's GUID. Pass that GUID to the inventory functions.

```ts title="src/server/wood.ts"
export const WOOD = Items.register("village:wood", {
  name: "Village timber",
  description: "Timber gathered for the village.",
  visual: "bsmt_woodExotic",
  weight: 2,
  price: 12,
});
```

`visual` names a game item whose model and icon the new item borrows, by
table name or GUID. It must be a miscellaneous item, a crafting material or
a document. The new item does not get that item's behavior: a borrowed
letter does not open the game's reading screen, and a borrowed crafting
material is not used in crafting.

## 3. Read a PNG from the resource

Make a PNG for the icon:

- Make it square, with the item reaching the edges and a transparent
  background. Each player's game scales it down to the game's 64×64 icon
  size, keeping its proportions, so a square picture looks like the game's
  own icons.
- Keep it at 256 KiB or smaller, and at most 4096×4096 pixels. 256×256 is
  plenty.

Put it in the resource folder as `icons/token.png`. `icon` takes the PNG as
base64 text, so the script reads the file with Node's `fs` module. Server
scripts run in Node.js, so they can use its modules, and `__dirname` is the
folder the compiled script is in. The tsconfig from Use TypeScript loads
only the Kingdoms Connected declarations, so declare the two Node.js names
this resource uses:

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

## 4. Give it your own icon

```ts title="src/server/token.ts"
import { png } from "./png.js";

export const TOKEN = Items.register("village:guild-token", {
  name: "Guild token",
  description: "Shows that you belong to the guild.",
  visual: "bsmt_woodExotic",
  icon: png("icons/token.png"),
  weight: 0.1,
  price: 5,
});
```

With `visual`, each look you give replaces only that part: the token lies on
the ground as the borrowed model, but shows your icon in the inventory.

## 5. Give it your own model

To use your own mesh, stream it from the resource. Put the file at
`stream/objects/kcdc/village-items/crate.cgf`, as in the file tree.
`stream/` holds new assets that the server sends to every player, and the
folder under `kcdc/` must be the resource's name. See
[Custom assets](../../core-concepts/custom-assets/) for the rules.

Then name the model relative to `Objects/`, the way the game's own item
tables do. Leave out the `objects/` at the front:

```ts title="src/server/crate.ts"
import { png } from "./png.js";

export const CRATE = Items.register("village:crate", {
  name: "Supply crate",
  model: "kcdc/village-items/crate.cgf",
  icon: png("icons/crate.png"),
  weight: 8,
  price: 30,
});
```

Without `visual`, both `model` and `icon` are required. `material` can name
a material in the same form; without it, the model's own material is used.

The model draws the item on the ground, in the player's hand and in the
inventory preview. It needs a physics proxy, as the game's own item models
have. Without one, the item shows on the ground but nobody can pick it up.

## 6. Give and lay down the items

Use the GUIDs with any inventory function, and with `GroundItem.spawn` to
lay an item on the ground for players to pick up:

```ts title="src/server/index.ts"
import { CRATE } from "./crate.js";
import { TOKEN } from "./token.js";
import { WOOD } from "./wood.js";

const GIFTS: Record<string, { item: string; amount: number } | undefined> = {
  wood: { item: WOOD, amount: 10 },
  token: { item: TOKEN, amount: 1 },
  crate: { item: CRATE, amount: 1 },
};

Events.on("playerCommand", (player, command) => {
  const gift = GIFTS[command];
  if (!gift) return;

  const result = Inventory.add(player, gift);
  if (!result.ok) Chat.sendToPlayer(player, `The ${command} was refused: ${result.code}`);

  // A second crate at your feet, to pick up from the ground.
  if (command === "crate" && player.ready) {
    GroundItem.spawn(CRATE, player.position, undefined, 1, player.virtualWorld);
  }
});
```

:::note[Things to know]
- **Changing an item.** Registering the same ID with the same definition
  again returns the same GUID, so restarting your resource is fine. A
  *different* definition for an ID that is already registered throws, and
  that includes a new icon. To change an item, restart the server or
  register it under a new ID.
- **A server registers at most 4096 item definitions** while it runs.
- **Recipes cannot use custom items** as ingredients or products. Use game
  items, or item classes from a streamed KCD2 mod.
- **Nothing is saved.** Register your items when the resource starts, before
  you restore saved inventories. The GUID `Items.register` returns stays the
  same across restarts, so saved inventory rows still match.
- **Shops.** Give an item you sell through the game's shop screen a price
  above 0. An item with price 0 did not show in the shop.
:::

## Try it

1. Put `token.png`, `crate.png` and `crate.cgf` where the file tree shows
   them. Run `npm install` and `npm run build`, then `ensure village-items`
   in the server console.
2. Type `/wood`. Ten pieces of Village timber arrive, drawn as the game's
   exotic wood.
3. Type `/token`. The Guild token shows your icon in the inventory. Drop it:
   it lies on the ground as the borrowed model.
4. Type `/crate`. A Supply crate arrives with your icon, and a second one
   lies at your feet in your model. Pick it up.

If registration throws, the error message gives the reason. `Items.register`
throws when:

- the ID is not letters, digits and `:_-.`, or is longer than 128 bytes;
- `name` is missing or longer than 256 bytes, or `description` is longer
  than 4096 bytes;
- `weight` is missing or outside 0 to 1,000,000, or `price` is not a whole
  number from 0 to 2,147,483,583;
- `visual` is not a miscellaneous item, crafting material or document;
- there is no `visual` and either `model` or `icon` is missing;
- `model` or `material` starts with `objects/`, or `material` is given
  without `model`;
- `icon` is not a PNG, is cut short, or is over 256 KiB or 4096×4096 pixels;
- the ID is already registered with a different definition.

The server does not decode the icon's pixels itself. If a player's game
cannot read a PNG that passed these checks, that player sees the borrowed
item's icon, or the game's generic one, and their game logs a warning.

## Next steps

- Lay the crate out on a stall that restocks itself, as in
  [Place items in the world](../place-items/).
- Personalize single items, add a use action, and save them with
  [Create custom inventory items](../../players/custom-items/).
- Make a letter players can read in
  [Make a custom letter players can read](../custom-letter/).
