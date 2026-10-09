---
title: Brew potions at alchemy tables
description: Let players brew at the game's own alchemy tables with the server ruling on every batch, refuse tables or results, and keep what players learn.
sidebar:
  label: Alchemy
  order: 36
---

Players brew at the game's own alchemy tables, with the game's own brewing
screen. The server checks every step against the ingredients it holds for
them and works out the result itself, so a modified client cannot brew
something from nothing. Your script decides who may use a table and whether a
result is granted.

In **1.6.6**, nearby players see the brewer at the station, including players
who come into view after brewing starts. This observer animation does not
change the crafting events or recipe rules below. Update both clients and
server for station synchronization.

```ts
Events.on("craftingStarting", (player, proposal) => {
  // Only the global world has working tables on this server.
  return proposal.virtualWorld === 0;
});

Events.on("craftingCompleted", (player, event) => {
  if (event.outcome === "success") Chat.sendToPlayer(player, `Brewed with quality ${(event.quality * 100).toFixed(0)}%.`);
});
```

Brewing uses the player's [inventory](../inventory/) and
[progression](../progression/): ingredients come out of the rows the server
holds, the potion goes back in, and the alchemy XP it earns is granted
through your progression rules.

:::note
Smithing at the game's smitheries goes through the same `Crafting` API and
events, with `kind` set to `smithing`; see [Smithing](../smithing/).
:::

## How a batch goes

1. The player uses a table. `craftingStarting` asks your handlers; one
   returning `false` refuses and the table does not open.
2. The table's opening animation finishes and `craftingStarted` fires.
3. The player brews. Each step they take (adding an ingredient, grinding,
   boiling) is checked by the server.
4. The batch finishes. The server computes the result and asks
   `craftingCompleting`; `false` makes it a failed batch.
5. The product enters their inventory and `craftingCompleted` fires, then
   `craftingEnded`.

The player keeps the table between batches, and a new batch at it raises
`craftingStarting` again with `continuationOf` set to the previous one.
Another player cannot use a table somebody holds.

## Refuse a table or a result

Both vetoes run every handler, and a handler returning literal `false`
refuses. An `async` handler cannot refuse. The payloads are frozen: read
them, do not change them.

```ts
Events.on("craftingCompleting", (player, proposal) => {
  // proposal: { outcome, recipe, grade, product, amount, quality, xp, ... }
  if (proposal.amount > 10) return false; // what was spent stays spent; nothing is granted
});
```

`outcome` is `failed` when the brew matched no recipe; the game's failed
potion is granted then. `product` is the item class GUID of the potion, and
`xp` the base alchemy XP before the player's own perks.

## React to the end of a batch

| Event | Arguments | When |
| --- | --- | --- |
| `craftingStarting` | `player`, `proposal` | A player asks to open a table. Return `false` to refuse. |
| `craftingStarted` | `player`, `event` | A batch is brewing. |
| `craftingCompleting` | `player`, `proposal` | A batch's result is computed. Return `false` to fail it. |
| `craftingCompleted` | `player`, `event` | The result is in their inventory; `event.outputs` names the rows. |
| `craftingRefunding` | `player`, `proposal`, `refund` | A batch is ending without a result. Call `refund()` to give everything back. |
| `craftingEnded` | `player`, `event` | A batch is over, for any reason. |

`craftingEnded` carries `outcome` (`success`, `failed` or `cancelled`) and a
`reason`: empty for a completed batch, otherwise `craftingCompletingRejected`,
`cancelled`, `interrupted`, `clientError`, `disconnected`, `timeout` (a batch
has 30 minutes) or `contextInvalidated` (they walked away, died or changed
world). `refunded`
names the inventory rows that got ingredients back: whole ingredients nobody
ground or mixed yet go back, everything else is spent, unless a
[refund policy](#refund-an-unfinished-batch) asks for all of it.

Crafting events fire after the `playerInventoryChanged` they caused, so the
rows they name are already there. Do not grant `outputs` again.

## Refund an unfinished batch

A batch that ends without a result keeps the game's own losses unless a
script asks otherwise. `craftingRefunding` runs once before it settles, and
calling `refund()` in it gives back every original ingredient still held,
ground and mixed ones included. The default gamemode installs no policy.

```ts
Events.on("craftingRefunding", (player, proposal, refund) => {
  if (proposal.reason === "contextInvalidated" || proposal.reason === "timeout") refund();
});
```

- Call `refund()` before the handler returns. A call after an `await` or from
  a timer does nothing, and calling it twice refunds once. The return value is
  ignored.
- Do not grant `proposal.materials` yourself. `craftingEnded` follows with the
  rows actually credited in `refunded`.
- A batch that granted a result, the failed potion included, is never asked.
- `Crafting.cancel(player)` runs this event before it returns.

| `reason` | When | Reported by |
| --- | --- | --- |
| `cancelled` | The player left the table normally, or a script called `Crafting.cancel` | Their client, unless a script cancelled |
| `interrupted` | Another action replaced the brewing, or their game tore it down | Their client |
| `clientError` | Their game could not carry on with the batch | Their client |
| `contextInvalidated`, `disconnected`, `timeout` | The server ended it | The server |
| `craftingCompletingRejected` | A `craftingCompleting` handler refused the result | Your script |

:::caution
A modified client can report `cancelled`, `interrupted` or `clientError` for
any exit. Refunding on one of them lets that client keep its ingredients
whenever it walks away, so choose such a policy only where that is fine.
:::

## Find tables and read sessions

```ts
const [table] = Crafting.stations("alchemy"); // every table in the level: id, layer, position
if (table) Crafting.occupancy(table.id, 0);    // who holds it in world 0; null for an unknown id
Crafting.session(player);                     // the player's batch, or null
Crafting.cancel(player);                      // end it as walking away would
Crafting.recipes(player, "alchemy");          // recipes with ingredients and products
```

- A station's `id` is stable, so it is what to store. Some tables sit behind
  quest layers of the level and may not be usable even when free.
- Each [virtual world](../../core-concepts/virtual-worlds/) has its own copy
  of every table.
- `recipes` lists what the game ships, not what a player knows. Its
  `ingredients` carry the item names `Inventory.add` takes, which is handy for
  handing out a kit:

```ts
const potion = Crafting.recipes(player, "alchemy")[0];
for (const ingredient of potion?.ingredients ?? []) player.giveItem(ingredient.name, ingredient.amount);
```

## Keep what players learn

The recipe book starts empty every session. `Crafting.knowledge(player)` maps
each recipe id to a mask of the steps the player knows (`536870911` is the
whole recipe), and `Crafting.setKnowledge` puts it back:

```ts
const books = new Map<string, Record<string, number>>(); // swap for your own storage

Events.on("playerInventoryReady", (player) => {
  for (const [recipe, mask] of Object.entries(books.get(player.nickname) ?? {})) {
    Crafting.setKnowledge(player, recipe, mask);
  }
});

Events.on("craftingCompleted", (player, event) => {
  if (event.knowledge) books.set(player.nickname, event.knowledge); // alchemy only
});
Events.on("playerDisconnect", (player) => books.set(player.nickname, Crafting.knowledge(player)));
```

`setKnowledge(player, recipe, 0)` forgets a recipe. A disconnecting player's
batch ends before `playerDisconnect`, so refunds are already in the inventory
you save there.

:::tip[Try it]
The default gamemode's `/crafttest alchemy` teleports you to a table and
gives you the ingredients for one batch of every recipe.
:::

## Related

- [Inventories](../inventory/): where ingredients come from and potions go
- [Skills, XP and perks](../progression/): alchemy XP and the perks that improve brewing
- [Buffs](../buffs/): what a potion does once drunk
- [Smithing](../smithing/): the same API at the smithery
- [Crafting reference](../../reference/server/variables/Crafting.md)
