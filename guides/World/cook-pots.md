---
title: Manage shared stew pots
description: Read a pot's remaining portions, refill it or disable eating, with separate supplies for each virtual world.
sidebar:
  label: Shared stew pots
  order: 49.2
---

Stew pots share finite portions between players in the same virtual world.
Stocked pots start with four portions, empty pots start empty, and neither
refills automatically. Server scripts use `CookPot` to manage the supply.

```ts
const pot = CookPot.all()[0];
if (pot) {
  CookPot.refill(pot.guid, 8); // replace the supply with eight portions
  console.log(CookPot.get(pot.guid)?.portions);
}
```

## Find a pot

`CookPot.all(virtualWorld = 0)` returns snapshots of catalogued pots on the
server's level. `CookPot.get(guid, virtualWorld = 0)` returns one or null.
Use the snapshot's GUID, which names the fireplace, rather than an ID from
the eating trigger or visible cauldron.

| Snapshot field | Meaning |
| --- | --- |
| `guid`, `position` | Stable fireplace identity and the eating position. |
| `portions`, `capacity` | Remaining meals and the size of the current refill. |
| `state` | `empty`, `half` or `full`. |
| `enabled` | Whether the server allows eating. |
| `virtualWorld` | The world whose supply was read. |

Snapshots are frozen values, not live handles. Read again after changing
stock; assigning to a snapshot does not refill a pot.

## Set the supply

| Call | Effect |
| --- | --- |
| `CookPot.refill(guid, portions = 4, world = 0)` | Replaces stock and capacity. Integer portions from 0 to 1000. |
| `CookPot.setState(guid, state, world = 0)` | `empty`, `half` or `full` means zero, two or four portions, with capacity four. |
| `CookPot.setEnabled(guid, enabled, world = 0)` | Allows or blocks eating without changing stock or appearance. |

Setters return false for an unknown pot and throw for invalid arguments.
Refilling or changing state preserves `enabled`. A pot looks half full
when at most half of its refill remains, and empty with none.

```ts
const pot = CookPot.all()[0];
if (pot) {
  CookPot.setEnabled(pot.guid, false);
  CookPot.refill(pot.guid, 12);
  CookPot.setEnabled(pot.guid, true);
}
```

`refill` replaces the count; it does not add to it. Decide in your game mode
whether cooks, purchases or a timer should replenish meals.

## Keep worlds separate

World 0 has stock from server startup. Another world gets its own supply
when a player first enters it or a setter first names one of its pots.
Before that, reading that world's pots returns an empty list or null.

```ts
const known = CookPot.all(0)[0];
if (known) CookPot.refill(known.guid, 6, 12); // supply for virtual world 12
```

Players with global visibility use world 0's stock. A player moved to a
numbered virtual world uses that world's supply. Global visibility does not
grant permission to eat from every world's pots.

## Save and restore

Stock survives disconnects and resource restarts, but ends when the server
stops. Save the fields your game mode needs in its database. At startup,
restore remaining portions with `refill` and eating permission with
`setEnabled`. There is no independent capacity setter: refilling with the
saved remainder also makes that remainder the new capacity.

The server reserves a portion before the native meal applies. A native
refusal can refund it; a disconnect or missing receipt can spend the
reservation. Do not treat disconnecting as a way to cancel a meal.

Ordinary cooking at a fire and wine barrels keep their existing behavior.
Poisoning stew pots is disabled. The catalog covers base-level pots;
unregistered stew triggers, including dynamically created pots, refuse
eating. Placing a decorative cauldron in World Builder does not register a
new `CookPot`.
