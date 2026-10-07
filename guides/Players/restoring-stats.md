---
title: Set and restore player stats
description: Set health, stamina, energy and nourishment on a ready player, and save living characters across rejoins.
sidebar:
  label: Set and restore stats
  order: 31.2
---

Server scripts can set a living player's health, stamina, energy and
nourishment. Both server and client scripts can read the latest reported
values with `getStat`.

```ts
if (player.ready && player.alive) {
  player.setStat(PlayerStat.Health, 80);
  player.setStat(PlayerStat.Exhaust, 70);
  player.setStat(PlayerStat.Hunger, 90);
  player.setStat(PlayerStat.Stamina, 50);
}
```

## Pick the writable stat

| `PlayerStat` | Meaning |
| --- | --- |
| `Health` | Current health. Zero can kill. |
| `Stamina` | Current stamina. Normal spending and regeneration continue. |
| `Exhaust` | Remaining energy. Higher means better rested. |
| `Hunger` | Nourishment. Higher means better fed. |

`player.setHealth(value)` and `setHunger(value)` are convenience methods for
the corresponding `setStat` calls. The existing property getters still work.

Set health and energy before stamina when restoring a character, since
they affect the current stamina maximum. The game clamps each value to its
native maximum. Inputs must be finite numbers from 0 to 1,000,000; that
upper bound is a protocol limit, not a gameplay maximum. Positive health
must exceed 0.00001, and positive inputs must not round to zero.

`setStat` returns false for a missing, unready or dead body and throws for
invalid arguments. True means the request was sent. Read after a later
client report to observe the result; an immediate read still shows the old
snapshot. Requests from an earlier connection or life are discarded.

## Preserve injuries or cure them

Setting health leaves buffs, poison, bleeding and injuries in place.
`player.heal()` also cures effects; `player.revive()` brings back a dead
body. Raising a dead body's health is not a substitute for revival.

Lowering health raises `playerDamage` with a null attacker. A fatal change
also raises `playerDied` with a null killer. This includes restoring a
saved value below the new body's health, so damage handlers must allow
causes other than attacks.

## Read derived values

`getDerivedStat` reads values such as charisma, dirtiness, carried weight,
noise and armor rating:

```ts
if (player.ready) {
  const weight = player.getDerivedStat(DerivedPlayerStat.CarriedWeight);
  const capacity = player.getDerivedStat(DerivedPlayerStat.InventoryCapacity);
  console.log(`${weight} carried, ${capacity} capacity`);
}
```

`DerivedPlayerStat` is read-only. There is no `setDerivedStat`, and passing
a derived stat to `setStat` throws. These are native values, not uniformly
percentages; some can be negative. Conditions follow the body as they change;
other derived stats are sampled about every 250 ms and replicated when changed.
Without a valid snapshot, getters return zero. Check `ready` first.

## Keep a living character across rejoins

This server example keeps health and nourishment while the resource stays
loaded. Replace the in-memory map with your database for server restarts.

```ts
const saved = new Map<string, { health: number; hunger: number }>();
const accounts = new Map(Player.all().map(player => [player.id, player.steamId]));

Events.on("playerConnect", player => {
  accounts.set(player.id, player.steamId);
});

Events.on("playerDisconnect", player => {
  const account = accounts.get(player.id);
  accounts.delete(player.id);
  if (!account) return;
  saved.delete(account);
  if (player.ready && player.alive) {
    saved.set(account, { health: player.health, hunger: player.hunger });
  }
});

Events.on("playerReady", player => {
  const state = saved.get(player.steamId);
  if (!state || !player.steamId || !player.ready || !player.alive) return;
  player.setHunger(state.hunger);
  player.setHealth(state.health);
});
```

Cache identity while connected: a kick may clear it before disconnect
handlers run. Use your authenticated account ID if your server has its own
accounts. A connection's network ID is not a persistent identity.

Save only ready, living players. Restoring a dead player's zero health would
kill the new body. Delete an older record when a dead or unready player leaves.

## Restore selected buffs

If your game mode saves status effects, cache their names while connected,
updating on `playerBuffAdded` and `playerBuffRemoved`. The buff snapshot is
already cleared when `playerDisconnect` runs.

Reapply selected names with `addBuff` after readiness. This starts the
effect again; it does not restore its remaining time or stacked strength.
Not every effect can be recreated by name alone. Check the named buff and
its behavior in game instead of treating an accepted request as proof.
See [Buffs and status effects](../buffs/).
