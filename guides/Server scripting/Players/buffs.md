---
title: Buffs and status effects
description: Put status effects on players, clear them by family, watch them come and go, and take over whole kinds of effect such as alcohol.
sidebar:
  order: 36
---

A buff is one of the game's named status effects: a potion, a poison, an
injury, a hangover. You can add and remove them on a player, read which ones
they carry, and take over whole kinds of effect so that your gamemode decides
what happens when, say, someone drinks.

```ts
Events.on("playerSpawned", (player) => {
  player.addBuff("potion_marigold_decoction");
});

Events.on("playerBuffAdded", (player, buff, source) => {
  console.log(`${player.nickname} now has ${buff} (${source})`);
});
```

## Naming a buff

Every buff verb takes the exact name from the game's buff tables, or the
buff's GUID. [`Buffs.find`](../../../reference/server/variables/Buffs.md#find)
resolves either and tells you what the effect is, or returns `null` for a name
the tables do not have:

```ts
const info = Buffs.find("hangover");
if (info) {
  console.log(`${info.name}: ${info.class}, family ${info.aiTag ?? "none"}, ${info.duration}s`);
}
```

A [`BuffInfo`](../../../reference/server/interfaces/BuffInfo.md) has the
`name`, its `class` (the kind of effect: `potion`, `poison`, `alcohol`,
`injury`...), its `aiTag` (the family `clearBuffs` removes it with, or `null`
for most), and its `duration` in real seconds, negative for one with no end.

## Adding and removing

| Call | What it does |
| --- | --- |
| `player.addBuff(buff)` | Asks their client to put the effect on. |
| `player.removeBuff(buff)` | Asks their client to take every instance of that effect off. |
| `player.clearBuffs(tag)` | Clears a whole family at once, for example all poisons. |
| `player.hasBuff(buff)` | Whether their last report carried that effect. |

The three verbs return `true` when the instruction went out, and `false` for
an unknown buff or tag, or a player with no connection.

:::note[Authority]
Effects run on each player's own machine: their timers advance with that
client's frame time, and the server runs none of its own. So `addBuff` is a
request, and `hasBuff` right after it still says `false`. Wait for
`playerBuffAdded` to know the effect is really on. The game may also refuse an
effect that conflicts with one already there, and a second drink folds into the
first rather than stacking.
:::

`clearBuffs` takes one of the game's effect families, listed in
[`Buffs.tags`](../../../reference/server/variables/Buffs.md#tags): `poison`,
`bleed`, `alcohol_drunk`, `unconscious`, `injury` and more. It is the easy way
to write a cure:

```ts
function cure(player: Player): void {
  player.clearBuffs("poison");
  player.clearBuffs("bleed");
  player.clearBuffs("food_poison");
}
```

:::tip
`World.setTime` does not fast-forward effects: their time runs off each
client's frame delta and never reads the clock. A scripted "sleep until
morning" has to clear the effects it means to end, for example with
`clearBuffs("alcohol_drunk")` and `clearBuffs("alcohol_hangover")`.
:::

## Reading what a player has

`player.buffs` lists the named effects on the body as a
[`BuffState[]`](../../../reference/server/interfaces/BuffState.md): everything
`BuffInfo` has, plus `since` (seconds it has been on) and `source` (`"server"`
if this server added it, `"native"` if the game did). `duration - since` is
roughly what is left.

```ts
const potions = player.buffs.filter((buff) => buff.class === "potion");
```

The list is empty until the player's client sends its first report, shortly
after they connect. Perks and equipment effects are not in it.

For "how drunk, poisoned or hurt is this player", read the live numbers
instead (`drunkenness`, `poisoning`, `bleeding`, `consciousness`, `hunger`,
`exhaust`, see [Player health, stats and skills](../reading/)). They need no effect names.

## Events

| Event | Arguments | When |
| --- | --- | --- |
| `playerBuffAdded` | `player, buff, source` | An effect appears. `source` is `"server"` or `"native"`. Fires for everything already on the body at the first report. |
| `playerBuffRemoved` | `player, buff, reason` | An effect goes. `reason` is `"server"` when you removed it, `"expired"` for anything else (ran out, or the game replaced it). |
| `playerBuffBlocked` | `player, buff` | The game tried to apply an effect of a kind you claimed, and the client refused it. |

`buff` in all three is the effect's name.

## Taking over a kind of effect

[`Buffs.claim(classNames)`](../../../reference/server/variables/Buffs.md#claim)
tells every client to refuse effects of those kinds when the game itself tries
to apply them, and to raise `playerBuffBlocked` instead. Your handler then
decides what really happens, usually by calling `player.addBuff` under your
own rule. Effects the server adds with `addBuff` are not blocked.

This limits each player to three drinks' worth of alcohol per ten minutes:

```ts title="src/server/drinking.ts"
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 3;
const drinks = new Map<number, number[]>();

Buffs.claim(["alcohol"]);

Events.on("playerBuffBlocked", (player, buff) => {
  const now = Date.now();
  const recent = (drinks.get(player.id) ?? []).filter((time) => now - time < WINDOW_MS);

  if (recent.length >= LIMIT) {
    Chat.sendToPlayer(player, "The innkeeper waves you off. Come back later.");
  } else {
    recent.push(now);
    player.addBuff(buff); // let this one through
  }
  drinks.set(player.id, recent);
});

Events.on("playerDisconnect", (player) => drinks.delete(player.id));
```

Things to plan around:

- **A claim nothing handles removes the gameplay.** The drink is still drunk
  and the item still consumed; only the effect is gone.
- **Follow-on effects are refused too.** Claiming `alcohol` also stops the six
  `alcoholism_level*` steps, so your resource owns the whole progression.
- **Effects have no strength.** You can block an effect, swap it for another,
  or let it through, but not make it half as strong.
- **A claim replaces the previous one.** `Buffs.claim(["alcohol", "poison"])`
  claims both; `Buffs.claim([])` hands everything back. It reaches every
  connected client at once, and every client that joins later.
- Only the kinds in [`Buffs.classes`](../../../reference/server/variables/Buffs.md#classes)
  can be claimed (`potion`, `poison`, `injury`, `alcohol`, `hangover`,
  `unconsciousness`, `plague` and a few more). Anything else throws.
- `playerBuffBlocked` repeats for the same effect are limited to twice a
  second per player.

## Related

- [Player health, stats and skills](../reading/)
- [Give and take items](../inventory/)
- [Time of day and weather](../../world-and-objects/clock-and-weather/)
