---
title: Decide food, potion and poison effects
description: Refuse consumption, replace native effects, approve drying, smoking and cooking, and observe confirmed meals and stat changes.
sidebar:
  label: Food and potions
  order: 35.3
---

Eating food, drinking potions and taking meals from stew pots require server approval.
Server resources can refuse the serving or replace its effects.

This server script replaces Marigold's native effects with a single heal:

```ts
const MARIGOLD = "b38c34b7-6016-4f64-9ba2-65e1ce31d4a1";

Events.on("playerConsumptionEffects", (_player, consumption) => {
  if (consumption.item === MARIGOLD) return false;
});
Events.on("playerConsumed", (player, consumption) => {
  if (consumption.item === MARIGOLD && !consumption.nativeEffects) {
    player.setHealth(Math.min(player.maxHealth, player.health + 15));
  }
});
```

## Choose the right event

| Event | When it runs | Returning false |
| --- | --- | --- |
| `playerConsuming(player, consumption)` | Before reserving the serving. | Refuses use and preserves the item or portion. |
| `playerConsumptionEffects(player, consumption)` | After use is allowed. | Allows consumption but suppresses the native effect bundle. |
| `playerConsumed(player, consumption)` | Once the client confirms successful use. | Has no cancellation effect. Apply replacement effects here. |
| `playerPoisonAbsorbing(player, consumption, buff)` | Before applying added pot poison on a successful meal. | Blocks that added poison while keeping the meal. |

Handlers that return `false` must do so synchronously; an async function cannot cancel
the serving or its effects. Wait for `playerConsumed` before granting replacement
effects because the native action can still fail. If no handler returns `false`, the
game applies its normal food and potion effects.

Suppressing native effects blocks nutrition, energy, alcohol, potion buffs, spoilage
effects and added pot poison together. In that case, `playerPoisonAbsorbing` does not
run. An item's own poison or potion buff is also part of these effects; use
[buff claims](../buffs/) for policies covering effects from other sources too.

## Inspect the serving

| `Consumption` field | Meaning |
| --- | --- |
| `source` | `inventory` or `cookPot`. |
| `item`, `kind` | Item class GUID and native classification, `food` or `potion`. |
| `rowId`, `potGuid` | Inventory row or pot identity, null when not applicable. |
| `metadata` | Server-held item properties. |
| `poison` | Additional pot poison, or null. |
| `baseEffects` | Native table buff and health, energy, nourishment and alcohol inputs, or null. |
| `nativeEffects` | The final effect decision in `playerConsumed`. |

These are snapshots. Changing the object does not change the serving. `baseEffects`
gives values before item condition, perks and soul modifiers are applied. The final
stat changes may differ, and healing can happen over time. Changing the inventory,
body, world, or relevant pot during a decision can invalidate that serving.

## Observe the result

```ts
Events.on("playerStatsChanged", (player, changes) => {
  for (const change of changes) {
    if (change.stat === "poisoning") {
      console.log(`${player.nickname}: poisoning ${change.previous} -> ${change.current}`);
    }
  }
});
```

Stat changes are grouped by server tick. The first report for a body sets the
baseline. Later events may combine several changes and do not identify what caused
them. The event cannot be cancelled. Stat setters remain asynchronous requests to the
owning client. Native effect timers also run there; the server does not simulate the
game's RPG calculations.

## Understand reservations and refunds

The server reserves one food or potion unit before replying. If the client reports
that the native action was refused, the server refunds an item with the original class
and properties. If the inventory is full, the refund waits for space. Restoring an
inventory replaces its state and discards pending reservations and refunds.

If the client never confirms the result, or takes more than ten seconds to reply, the
server does not refund the item: it cannot tell whether it was used. A late approval
does not run on a replacement body or in another world. Successful inventory uses also
raise `playerItemUsed`.

## Approve drying, smoking and cooking

A drying rack dries herbs and food, a smokehouse smokes food, and a fire
cooks food. The player picks items in the game's own screen and, when the
animation ends, their game converts them at once. The server checks that the
player can act within 4 metres of a station of that kind and that every row
converts that way, then raises `playerPreparing(player, preparation)`. This
handler makes smoking take an hour:

```ts
Events.on("playerPreparing", (player, preparation) => {
  if (preparation.kind !== "smoke") return; // drying and cooking go through
  const units = preparation.items.map(({ id, amount }) => ({ id, amount }));
  if (!Inventory.remove(player, { units }).ok) return false;

  const id = player.id;
  setTimeout(() => {
    const owner = Player.getById(id); // gone? keep the meat for them yourself
    for (const { product, amount } of preparation.items) {
      if (owner) Inventory.add(owner, { item: product, amount });
    }
  }, 60 * 60 * 1000);
  return false; // the game's own conversion does not happen
});
```

| `Preparation` field | Meaning |
| --- | --- |
| `kind` | `dry`, `smoke` or `cook`. |
| `station` | The rack, smokehouse or fire, as `<level>:<guid>`, the same on every machine and across restarts. A fire's guid is its cook pot's, as `CookPot.get` takes it. |
| `items` | Each row about to be taken: `amount` units of class `item` from row `id`, which become class `product`. |

- Return `false` synchronously to refuse: the rows stay as they were and the
  player's game puts the items back. Every handler runs, and an async handler
  cannot refuse. The payload is frozen: refuse it, do not change it.
- Accepted, the rows are taken and the products given as one `dry`, `smoke`
  or `cook` inventory change. A herb comes out at full health; food keeps the
  health it had.
- Only an accepted conversion earns the game's survival XP per unit: 0.5
  dried, 3 smoked, 1 cooked. The server grants it as `player.addXp` does, so
  the player's own multipliers apply and `playerXpGaining`, XP rates, budgets,
  level caps and `setNativeXp(false)` do not. Grant it yourself for a
  conversion you refused and finished later.
- Racks and smokehouses are the level's own, unless a level edit took one out
  of the player's world, and any placed with
  [smart objects](../../world/smart-objects/). Fires are the level's cook pot
  fireplaces. A rack on a quest layer the player's game has not loaded cannot
  be used.
- The game lights a fire a player cooks at. Whether a fire a script put out
  with `CookPot.setFireLit` may still cook is yours to decide: read
  `CookPot.get(guid, player.virtualWorld)?.fireLit` and refuse.

## Related

- [Stew pots and recipes](../../world/cook-pots/)
- [Inventories](../inventory/): the `dry`, `smoke` and `cook` changes
- [Set and restore stats](../restoring-stats/)
- [Consumption reference](../../reference/server/interfaces/Consumption.md)
