---
title: Forge items at smitheries
description: Let players forge at the game's own smitheries with the server taking the materials and granting the product, refuse recipes or results, and decide what a failed workpiece costs.
sidebar:
  label: Smithing
  order: 36.5
---

Players forge at the game's own smitheries, with the game's own recipe screen
and anvil. The server takes the materials when a workpiece starts and grants
the product when it is done, so a modified client cannot forge something from
nothing. Smithing shares the [`Crafting`](../../reference/server/variables/Crafting.md)
API and events with [alchemy](../alchemy/); every payload says which with
`kind`.

In **1.6.6**, nearby players see the smith at the station, including players
who come into view later. Male characters show the forging loop while
working; female characters stay at the workstation without that animation.
This presentation is separate from the recipe transaction and its events.
Update both clients and server for station synchronization.

```ts
Events.on("craftingStarting", (player, proposal) => {
  if (proposal.kind !== "smithing") return;
  return player.virtualWorld === 0; // only the global world forges
});

Events.on("craftingCompleted", (player, event) => {
  if (event.kind === "smithing") Chat.sendToPlayer(player, `Forged at quality ${(event.quality * 100).toFixed(0)}%.`);
});
```

## How a workpiece goes

1. The player picks a recipe at a smithery. `craftingStarting` asks your
   handlers, with `proposal.recipe` set; one returning `false` refuses, the
   recipe screen stays open and nothing is taken.
2. The server takes the materials and `craftingStarted` fires.
3. The player works the piece. A broken workpiece fails it.
4. A finished piece is reported with its quality. `craftingCompleting` asks;
   `false` fails it.
5. The product, and any lockpicks the player's perks draw alongside it, enter
   their inventory, and `craftingCompleted` fires, then `craftingEnded`.

A smithery is held for one workpiece at a time, and another player cannot
use one somebody holds.

## Teach recipes and hand out materials

A smithing recipe is known through its `perk`, which the server checks in the
player's [progression](../progression/). Give the perk to teach it:

```ts
for (const recipe of Crafting.recipes(player, "smithing")) {
  if (recipe.perk) player.addPerk(recipe.perk);
  for (const material of recipe.ingredients) {
    if (!material.quest) player.giveItem(material.name, material.amount);
  }
}
```

`minSkill` is the craftsmanship skill the recipe needs. An ingredient with
`quest: true` is a quest item, which only its quest hands out: it is required
but never taken, and a script cannot give one, so a recipe that needs one
cannot be prepared from a script.

## Review a result

```ts
Events.on("craftingCompleting", (player, proposal) => {
  // proposal: { kind, outcome: "success", recipe, grade, product, amount, quality, xp, lockpicks, ... }
  if (proposal.kind === "smithing" && proposal.quality > 0.95) return false;
});
```

`quality` is the workpiece quality the player's game reported, 0 to 1,
`grade` the product's item quality tier, and `xp` the base craftsmanship XP
before the player's own multipliers. A refusal fails the workpiece.

## What a failure costs

`craftingEnded` carries `outcome` (`success`, `failed` or `cancelled`), a
`reason`, and `refunded`, the rows materials went back to. A failed workpiece
spends half of each material that divides, rounded down, and a coin decides a
single unit; the rest comes back.

| `reason` | Outcome | Materials |
| --- | --- | --- |
| empty | `success` | Became the product |
| `craftingFailed` | `failed` | The piece broke: failure share spent |
| `craftingCompletingRejected`, `invalidQuality`, `abandonTooLate` | `failed` | Failure share spent |
| `cancelled`, `interrupted`, `disconnected`, `timeout`, `contextInvalidated` | `cancelled` | Failure share spent |
| `abandoned` | `cancelled` | The recipe never reached the anvil: all back |
| `inventoryUnavailable` | `cancelled` | No room for the product: all back |

`craftingRefunding` runs before every workpiece that ends without a product
settles, and calling its `refund()` gives back every material instead of the
failure share. It works exactly as for
[alchemy](../alchemy/#refund-an-unfinished-batch), including the caution
about reasons the player's own client reports.

```ts
Events.on("craftingRefunding", (player, proposal, refund) => {
  if (proposal.kind === "smithing" && proposal.reason === "contextInvalidated") refund();
});
```

## Find smitheries and read sessions

```ts
const [smithery] = Crafting.stations("smithing"); // id, layer, position
if (smithery) Crafting.occupancy(smithery.id, 0);  // who works there in world 0
const session = Crafting.session(player);          // phase "working", recipe, materials taken
if (session?.kind === "smithing") Crafting.cancel(player); // fails the piece; they leave the smithery
```

`session.materials` lists the units taken for the workpiece. `cancel` returns
`false` when there was nothing to end, and `craftingEnded` follows on the next
tick.

:::tip[Try it]
The default gamemode's `/crafttest smithing` teleports you to a smithery,
gives you the materials for every recipe and teaches the recipe perks you
lack.
:::

## Related

- [Alchemy](../alchemy/): the same events at alchemy tables, and refund policy
- [Skills, XP and perks](../progression/): recipe perks and craftsmanship XP
- [Inventories](../inventory/): where materials come from and products go
- [Crafting reference](../../reference/server/variables/Crafting.md)
