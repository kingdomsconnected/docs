---
title: Decide food, potion and poison effects
description: Refuse consumption, replace native effects, and observe confirmed meals and stat changes.
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

## Related

- [Stew pots and recipes](../../world/cook-pots/)
- [Set and restore stats](../restoring-stats/)
- [Consumption reference](../../reference/server/interfaces/Consumption.md)
