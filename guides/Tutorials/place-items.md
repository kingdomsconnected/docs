---
title: Place items in the world
description: Lay item stacks on the ground from World Builder, a world file and a script, and restock an arrow stall a minute after someone takes its arrows.
sidebar:
  label: Items in the world
  order: 99.2
---

In multiplayer, the level does not put any items of its own on the ground.
Only the recipe books and smithing tools that crafting stations need are
kept. To put arrows in an armoury or food on a market stall, lay them down
yourself. Players pick them up with the game's usual prompt.

You will do it three ways: in World Builder, by hand in a world resource's
`items` list, and from a server script. The script is an arrow stall that
lays a fresh stack a minute after someone takes the last one.

:::note[Before you start]
- A server and game on Kingdoms Connected 1.7.2 or later.
- [Furnish a tavern with World Builder](../furnish-with-world-builder/), which opens a project and exports it, and [Use TypeScript](../../getting-started/typescript/).
- [Items: give, take and drop](../../players/items/) and [World exports in scripts](../../world/world-resources/).

Difficulty: beginner. Time: about 30 minutes.
:::

## What you will learn

- Placing item stacks in World Builder and setting their amount, quality,
  health and condition.
- Writing a world resource's `items` list by hand.
- Laying a named stack down with `GroundItem.spawn` and finding it again by
  name.
- Restocking when `groundItemPickup` reports that a player took it.

```text
server/
  server.json
  worlds/market.world.json        exported from World Builder
  resources/arrow-stall/
    package.json
    tsconfig.json                 from Use TypeScript
    src/server/stall.ts           lays the arrows down and restocks them
    src/server/index.ts           /where, and the first stock
```

## 1. Place items in World Builder

1. Open World Builder and your project, as in
   [the furnishing tutorial](../furnish-with-world-builder/).
2. In the **Library** tab, open the `items` folder. Every item class the
   game ships is listed by the game's category. Searching `items/Food`, for
   example, lists the food. Quest items are not listed.
3. Click an item's row, then left-click in the world to put a stack down.
   Turn it with **Shift+mouse wheel** or **R** first if you like.
4. Select the stack and open the **Object** tab:
   - **Name**: what a script finds it by, up to 64 bytes.
   - **Amount**: how many units lie in the stack. Items the game does not
     stack, such as an apple, must use 1.
   - **Quality**: the game's grade, or 0 for the class's own.
   - **Own health** and **Own condition**: turn these on to set them. Off
     uses the class's own.
5. Save the project, set **Resource name** to `market`, export the world
   resource and add it to `mod.world_resources` in `server.json`, as in
   [step 6 of the furnishing tutorial](../furnish-with-world-builder/#6-save-and-export).

In the editor, most items show their own mesh. An item a character wears,
such as a hat, shows as a small box, because the editor cannot stand it up
as a mesh. Players see the real item.

Items keep their own size, so **Ctrl+mouse wheel** does nothing for them.

## 2. Or write them into the world file

An exported `<name>.world.json` keeps items in its `items` list. You can
write entries by hand too:

```json
{
  "items": [
    { "item": "arrow_crude", "amount": 12, "position": [3103.0, 818.5, 57.3], "rotation": [0, 0, 0, 1], "name": "armoury-arrows" }
  ]
}
```

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `item` | string | required | The item class, by GUID or by name such as `arrow_crude`. |
| `position` | `[x, y, z]` | required | Where it lies. The stack is placed there, not dropped, so put it on the ground. |
| `rotation` | `[x, y, z, w]` | no rotation | How it lies. |
| `amount` | whole number, 1 to 10000 | 1 | Units in the stack. An item the game does not stack must use 1. |
| `name` | string | none | Up to 64 bytes. |
| `quality` | whole number, 0 to 255 | the class's own | The game's grade. |
| `health` | number, 0 to 1 | the class's own | The item's health. |
| `condition` | number, 0 to 1 | the class's own | The item's condition. |

The server lays the items down every time it starts, in the global world,
which every player sees. Items that players picked up are back after a
restart. An unknown item class, or a stack no player's game could build,
stops the server at startup with an error naming the entry.

## 3. Create the resource

Create `resources/arrow-stall` and copy the server `tsconfig.json` from
[Use TypeScript](../../getting-started/typescript/#2-the-server-program).

```json title="package.json"
{
  "name": "arrow-stall",
  "version": "1.0.0",
  "scripts": { "build": "tsc -p tsconfig.json" },
  "devDependencies": {
    "@kingdomsconnected/types": "latest",
    "typescript": "^5.9.2"
  },
  "mafiahub": { "serverScripts": ["dist/server/index.js"] }
}
```

## 4. Lay the arrows down and restock them

`GroundItem.spawn(item, position, rotation, amount, virtualWorld, properties)`
lays one stack down and returns it. Everything after `item` is optional.
`properties` can hold `name`, `quality`, `health`, `condition` and
`carryable`.

The stall lays a stack of arrows down, and lays a fresh one a minute after
someone takes it:

```ts title="src/server/stall.ts"
/** Where the stall's arrows lie. Put your own position here; /where tells you yours. */
const STALL = {
  item: "arrow_crude",
  amount: 12,
  name: "stall-arrows",
  position: new Vector3(3103.0, 818.5, 57.3),
};

/** How long the stall stays empty after someone takes the arrows. */
const RESTOCK_MS = 60_000;

/** Lays the arrows down, unless the stall's stack is still lying there. */
export function stock(): void {
  if (GroundItem.all().some((stack) => stack.name === STALL.name)) return;
  GroundItem.spawn(STALL.item, STALL.position, undefined, STALL.amount, undefined, { name: STALL.name });
}

export function installRestock(): void {
  Events.on("groundItemPickup", (stack, player) => {
    if (stack.name !== STALL.name) return;
    console.log(`${player ? player.nickname : "Someone"} took the stall's arrows`);
    setTimeout(stock, RESTOCK_MS);
  });
}
```

- `groundItemPickup` is raised once the server has given the stack to the
  player. You can still read the stack's `name`, `itemClass` and `amount` in
  the handler.
- `GroundItem.all().find((stack) => stack.name === "stall-arrows")` finds a
  stack later by its name. `stock` checks the same way, so it never lays a
  second stack beside one that is still there.
- The name stays on the server. Players never see it.
- `GroundItem.spawn` throws when the item class is unknown, when the amount
  is more than 1 for an item the game does not stack, or when the name is
  longer than 64 bytes.

## 5. Find a position and stock the stall

Positions are in metres, with `z` up. Stand where the stack should lie and
type `/where`, or read the position in World Builder's **Object** tab. The
stack is placed exactly where you say rather than dropped, so use the height
of the ground.

```ts title="src/server/index.ts"
import { installRestock, stock } from "./stall.js";

installRestock();
stock();

Events.on("playerCommand", (player, command) => {
  if (command !== "where") return;
  const p = player.position;
  Chat.sendToPlayer(player, `You are at ${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`);
});
```

A stack a script lays down is kept in memory only, so lay it down again when
the server starts. Calling `stock()` at the top of the script does that.
Like every entity a resource creates, the stack goes when the resource
stops, so a reload lays one fresh stack where `STALL.position` now says.

## Try it

1. Run `npm install` and `npm run build`, then `ensure arrow-stall` in the
   server console.
2. Type `/where` where the stall should be, copy the numbers into
   `STALL.position`, build again and run `ensure arrow-stall`.
3. Twelve crude arrows lie at that spot. Pick them up with the game's
   prompt. The server console says who took them.
4. Wait a minute. A fresh stack lies in the same place.
5. If you exported `market.world.json`, its stacks lie where you placed
   them. Pick one up and restart the server: it is back.

## Next steps

- A custom item registered with `Items.register` can be laid down the same
  way, by the GUID that `Items.register` returns. See
  [Give a custom item its own icon and model](../custom-item-icons/).
- `carryable: true` lays down an item that players carry in their arms, such
  as a sack, instead of putting it in their inventory. See
  [Carry items and bodies in the arms](../../players/carrying/).
- `WorldResource.find("market")?.items` lists the export's stacks that nobody
  has picked up yet, each with the name the export gave it. See
  [World exports in scripts](../../world/world-resources/).
- Pickup, stacking and the other `GroundItem` calls are in
  [Items: give, take and drop](../../players/items/#put-items-on-the-ground).
