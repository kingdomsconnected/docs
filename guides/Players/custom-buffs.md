---
title: Create custom buffs
description: Register your own status effects with a name, an icon, a timer, stacking and stat modifiers, and run server code while they last.
sidebar:
  label: Custom buffs
  order: 38.5
---

A custom buff is a status effect your resource defines: its own name and
description in the game's status-effect panel, an icon borrowed from one of
the game's buffs, a timer, and stat modifiers the game applies natively.
[`Buffs.register`](../../reference/server/variables/Buffs.md#register) returns
a GUID that every [buff verb](../buffs/) takes.

```ts
const blessing = Buffs.register("chapel:blessing", {
  name: "Warrior's blessing",
  description: "Strength and stamina, and a little healing, for five minutes.",
  visual: "potion_marigold_decoction",
  duration: 300,
  tickInterval: 5,
  modifiers: { strength: 5, stamina: 20 },
});

Events.on("playerCommand", (player, command) => {
  if (command === "bless") player.addBuff(blessing);
});

Events.on("playerCustomBuffTick", (player, buff) => {
  if (buff.name === "chapel:blessing") player.setHealth(Math.min(player.maxHealth, player.health + 2));
});
```

## Define an effect

`Buffs.register(id, definition)` runs on the server. The id is 1 to 128
ASCII letters, digits, `:`, `_`, `-` or `.`; prefix it with your resource's
name. Registering the same definition again returns the same GUID, and a
different definition under an id already registered throws, as do unknown
keys, unsupported modifiers and invalid values. A server holds at most 512
definitions for its lifetime, with no way to unregister one, so register
them as the resource starts. Connected players and later joiners receive
them.

| Field | Meaning |
| --- | --- |
| `name` | Required. Display name, 1 to 256 bytes of UTF-8. |
| `description` | Text under the name, up to 4096 bytes. Empty by default. |
| `visual` | Required. A game buff's name or GUID that lends its icon and presentation, and nothing else. |
| `duration` | Real seconds, above 0 and up to seven days, or `-1` (the default) for no end. |
| `tickInterval` | Seconds between `playerCustomBuffTick` calls, 0.1 to 86400. `0`, the default, sends none. |
| `stackable` | `true` gives each application its own timer and modifiers. `false` by default. |
| `maxStacks` | Whole number from 1 to 16. Default 1. |
| `refresh` | At the stack limit, `true` (the default) replaces the oldest instance with a full-length one; `false` ignores the new application. |
| `modifiers` | Stat changes, below. |

The borrowed visual brings no gameplay: a potion's icon does not bring its
effects, family or exclusivity rules.

## Put it on a player

`player.addBuff`, `removeBuff` and `hasBuff` take the GUID or the registered
id. `removeBuff` takes off every stack. As with the game's buffs, `true`
means the order went out, so confirm with the events below.

`player.buffs` has one row per instance. For a custom effect `name` is the
registered id, `custom` is `true`, and `displayName` and `description` carry
your text; for a game buff they are `null`. `Buffs.find` answers for the id
or the GUID the same way. `playerBuffAdded` and `playerBuffRemoved` still
report the effect appearing and going, so a refresh raises no second
`playerBuffAdded`. A body already carrying 96 effects ignores a new custom
application.

## Change stats with modifiers

A number adds points. An object picks the operation:

```ts
const wellFed = Buffs.register("tavern:well_fed", {
  name: "Well fed",
  visual: "potion_marigold_decoction",
  modifiers: {
    hungerDrain: { operation: "multiply", value: 0.5 },
    energyDrain: { operation: "multiply", value: 0.5 },
    carryCapacity: 20,
  },
});
```

| Operation | Value range |
| --- | --- |
| `add` (a plain number) | -10000 to 10000 |
| `multiply` | 0 to 100 |
| `set` | 0 to 10000 |

[`Buffs.modifiers`](../../reference/server/variables/Buffs.md#modifiers)
lists every name the server accepts:

| Modifier | Changes |
| --- | --- |
| A track name (`strength`, `agility`, `vitality`, `speech`, a skill) | The effective level. Earned XP is unchanged. |
| `charisma` | Effective charisma. |
| `stamina` or `maxStamina` | Maximum stamina. Aliases: use one, not both. |
| `maxHealth` | Health capacity, kept between 1 and 1,000,000. `set` needs at least 1. |
| `healthRegeneration` | Health per second. `add` only. |
| `staminaRegeneration` | Stamina regeneration. |
| `hungerDrain`, `energyDrain` | How fast nourishment and energy drain. |
| `carryCapacity` | Inventory capacity. |
| `runSpeed`, `moveSpeed` | Base run speed, and the real move speed modifier horseshoes carry. |
| `armorRating`, `bodyArmor` | Armour rating, or base body armour. |
| `weaponAttack`, `weaponDefense` | Weapon attack and defense, as the game's hit calculation reads them. |
| `attackSpeed` | Swing speed. Item tables have no column for it, so this is the only way to change it. |
| `courage` | Whether a horse throws its rider and whether an NPC flees. |

- `multiply` scales the original base: two effects of 1.1 add 20%, not 21%.
- The game's own caps and contexts still apply; no skill passes its cap.
- Modifiers are short-term: queries the game makes for base or long-term
  values do not see them.
- Lowering `maxHealth` clamps current health. Raising it, or removing the
  effect, does not heal.
- There is no strength for the game's specialized effects, such as how
  drunk a drink makes someone. Build such behaviour from these modifiers and
  the tick event.

For changing a weapon class for everyone instead of one body, and how both
meet blows between players, see [Change weapon and armour stats](../item-stats/).

## Run code while it lasts

| Event | Arguments | When |
| --- | --- | --- |
| `playerCustomBuffApply` | `player, buff` | An instance attached, as the owner's client reported it: every application, refresh and extra stack. |
| `playerCustomBuffTick` | `player, buff` | Every `tickInterval` seconds on the server clock while the owner's last report carries the instance. At most one call per instance per server update; missed ticks are skipped. |
| `playerCustomBuffRemove` | `player, buff, reason` | One instance left: `server` (you removed it), `expired` (it ran out, or the game removed it), `refreshed` (replaced at the stack limit) or `disconnect`. |

`buff` is a [`BuffInfo`](../../reference/server/interfaces/BuffInfo.md) whose
`name` is the registered id. The effect's own timer and modifiers run on the
owner's game and its clock, pauses included; only the ticks follow the
server's clock.

## Keep in mind

- Nothing is saved. A permanent effect lasts until it is removed or the body
  or session ends. Reapply what a player should keep when they rejoin, as
  [Buffs](../buffs/#keep-effects-across-rejoins) shows.
- A definition cannot change while the server runs. Give a changed effect a
  new id, or restart the server.
- Horses take the same effects: `horse.addBuff(id)` keeps one on every copy
  of the horse until it is removed, whatever its `duration`. `runSpeed`,
  `moveSpeed`, `stamina`, `courage` and `carryCapacity` are the modifiers a
  horse uses. See [Horses](../../npcs-and-animals/horses/).

## Related

- [Buffs and status effects](../buffs/): the game's own effects, claims and buff events
- [Change weapon and armour stats](../item-stats/): class-wide combat numbers
- [Skills, XP and perks](../progression/): what track modifiers do not change
- [Buffs reference](../../reference/server/variables/Buffs.md)
