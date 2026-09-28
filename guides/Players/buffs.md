---
title: Buffs and status effects
description: Put status effects on players, clear them by family, watch them come and go, and take over whole kinds of effect such as alcohol.
sidebar:
  label: Buffs
  order: 35
---

A buff is one of the game's named status effects: a potion, a poison, an
injury, a hangover. Add and remove them, read which a player carries, or take
over a whole kind of effect so your gamemode decides what drinking does.

```ts
Events.on("playerSpawned", (player) => {
  player.addBuff("potion_marigold_decoction");
});

Events.on("playerBuffAdded", (player, buff, source) => {
  console.log(`${player.nickname} now has ${buff} (${source})`);
});
```

## Name a buff

Every buff verb takes the exact name from the game's buff tables or the buff's
GUID. [`Buffs.find`](../../reference/server/variables/Buffs.md#find) resolves
either, or returns `null`:

```ts
const info = Buffs.find("hangover");
if (info) {
  console.log(`${info.name}: ${info.class}, family ${info.aiTag ?? "none"}, ${info.duration}s`);
}
```

A [`BuffInfo`](../../reference/server/interfaces/BuffInfo.md) has the `name`,
its `class` (`potion`, `poison`, `alcohol`, `injury`...), its `aiTag` (the
family `clearBuffs` removes it with, usually `null`) and `duration` in real
seconds, negative for no end.

## Add and remove buffs

| Call | What it does |
| --- | --- |
| `player.addBuff(buff)` | Asks their client to put the effect on. |
| `player.removeBuff(buff)` | Asks their client to remove every instance of it. |
| `player.clearBuffs(tag)` | Clears a whole family, for example all poisons. |
| `player.hasBuff(buff)` | Whether their last report carried it. |

The three verbs return `true` when sent, `false` for an unknown buff or tag or
no connection.

:::note
Effects run on the player's machine, timed by its frame time. So `hasBuff`
right after `addBuff` is still `false`: wait for `playerBuffAdded`. The game
may refuse an effect that conflicts with one already on, and a second drink
folds into the first rather than stacking. See
[Server vs client authority](../../core-concepts/authority/).
:::

`clearBuffs` takes a family from [`Buffs.tags`](../../reference/server/variables/Buffs.md#tags):
`poison`, `bleed`, `alcohol_drunk`, `unconscious`, `injury` and more.

```ts
function cure(player: Player): void {
  player.clearBuffs("poison");
  player.clearBuffs("bleed");
  player.clearBuffs("food_poison");
}
```

:::tip
`World.setTime` does not fast-forward effects. A scripted "sleep until
morning" must clear what it ends, such as `alcohol_drunk` and
`alcohol_hangover`.
:::

## Read what a player has

`player.buffs` is a [`BuffState[]`](../../reference/server/interfaces/BuffState.md):
`BuffInfo` plus `since` (seconds on) and `source` (`"server"` if this server
added it, `"native"` if the game did). `duration - since` is roughly what is
left.

```ts
const potions = player.buffs.filter((buff) => buff.class === "potion");
```

It is empty until the client's first report, shortly after connecting. Perks
and equipment effects are not in it. For "how drunk or poisoned", read
`drunkenness`, `poisoning`, `bleeding` and friends on
[stats](../stats/#health-and-condition) instead.

## React to buff changes

| Event | Arguments | When |
| --- | --- | --- |
| `playerBuffAdded` | `player, buff, source` | An effect appears (`"server"` or `"native"`). Fires for everything already on the body at the first report. |
| `playerBuffRemoved` | `player, buff, reason` | An effect goes: `"server"` when you removed it, `"expired"` otherwise (ran out, or replaced). |
| `playerBuffBlocked` | `player, buff` | The client refused a game-applied effect of a kind you claimed. At most twice a second per player for the same effect. |

`buff` is the effect's name in all three.

## Take over a kind of effect

[`Buffs.claim(classNames)`](../../reference/server/variables/Buffs.md#claim)
makes every client refuse game-applied effects of those kinds and raise
`playerBuffBlocked`. Your handler decides, usually by calling `addBuff`, which
is never blocked. Three drinks per ten minutes:

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

- **A claim nothing handles removes the gameplay.** The drink is still consumed;
  only the effect is gone.
- **Follow-on effects are refused too.** Claiming `alcohol` also stops the six
  `alcoholism_level*` steps.
- **Effects have no strength.** Block, swap or allow; you cannot halve one.
- **A claim replaces the previous one.** `Buffs.claim(["alcohol", "poison"])`
  claims both; `Buffs.claim([])` hands everything back. It reaches every client,
  including later joiners.
- Only kinds in [`Buffs.classes`](../../reference/server/variables/Buffs.md#classes)
  can be claimed (`potion`, `poison`, `injury`, `alcohol`, `hangover`,
  `unconsciousness`, `plague` and a few more). Anything else throws.

## Related

- [Read health, stats and skills](../stats/), for live condition numbers
- [Items: give, take and drop](../items/), for potions and food
- [Time of day and weather](../../world/clock-and-weather/), which does not advance effects
