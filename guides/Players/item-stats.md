---
title: Change weapon and armour stats
description: Rewrite the attack, defense, requirements and other combat numbers of a weapon, armour or ammunition class for every player, and read back what you changed.
sidebar:
  label: Item stats
  order: 34.2
---

The game keeps combat numbers on the item class, not on each item: every
`longswordBroad` shares one row, which the hit calculation reads on every
swing. [`Inventory.setItemStats`](../../reference/server/variables/Inventory.md#setitemstats)
rewrites that row on every player's game, now and for whoever joins later,
until the server stops.

```ts
// Every broad longsword hits harder, for everyone.
Inventory.setItemStats("longswordBroad", { attack: 120, attackModSlash: 1.5 });

Inventory.getItemStats("longswordBroad");       // { attack: 120, attackModSlash: 1.5 }
Inventory.setItemStats("longswordBroad", null); // the game's own numbers again
```

## Choose the stats

`item` is a class GUID or its exact table name. Which stats a class takes
depends on its table element, the groups [Item classes](../../resources/items/)
lists them under:

| Element | Stats |
| --- | --- |
| `MeleeWeapon` | `attack`, `attackModStab`, `attackModSlash`, `attackModSmash`, `defense`, `strReq`, `agiReq` |
| `Armor`, `Helmet`, `Hood` | `defenseStab`, `defenseSlash`, `defenseSmash`, `noise`, `strReq` |
| `MissileWeapon` | `power`, `limbResistance`, `defense`, `strReq`, `agiReq` |
| `Ammo` | `attackStab`, `attackSlash`, `attackSmash`, `powerMod` |

- A change reaches every copy of the class at once and applies from the next
  hit. Nobody has to re-equip anything.
- Stats you leave out stay as the game authored them, and each call replaces
  the class's previous set whole, so pass everything you want changed.
  `null` hands the class its authored numbers back.
- Values are finite and within 100000 of zero. `strReq` and `agiReq` are
  whole stat levels, rounded, and cannot be negative.
- Classes that a running resource's [KCD2 mod](../../core-concepts/kcd2-mods/)
  adds take changes like the game's own.
- Nothing is saved. Set your changes in your resource's startup code.

`setItemStats` returns `true` once the numbers are written.
`Inventory.getItemStats(item)` returns your changes by stat name, or `null`
for a class you left alone. It cannot show the authored numbers: the server
does not carry the game's tables.

## When a call throws

| Cause | Example |
| --- | --- |
| Unknown class | A misspelled name. |
| The class carries none of these stats | Food, a herb, a document. |
| A name that is not a stat, or one the element lacks | `noise` on a sword. |
| A value that is not a finite number within 100000 of zero | `attack: Infinity` |
| A negative requirement | `strReq: -1` |
| Stats that are neither an object nor `null` | `setItemStats("longswordBroad")` |

Catch it when the class or the numbers come from a player or a config file.

## Change one player instead

These numbers belong to the class, so one player's sword cannot differ from
another's. For one body, register a [custom buff](../custom-buffs/) with
`weaponAttack`, `weaponDefense` or `attackSpeed` and put it on them. Swing
speed has no column in the item tables, so `attackSpeed` is the only way to
change it.

```ts
const frenzy = Buffs.register("arena:frenzy", {
  name: "Frenzy",
  visual: "potion_marigold_decoction",
  duration: 60,
  modifiers: {
    attackSpeed: { operation: "multiply", value: 1.2 },
    weaponAttack: { operation: "multiply", value: 1.25 },
  },
});

player.addBuff(frenzy);
```

:::caution[Blows between players]
The server prices a melee swing from one player at another itself, from the
game's own item tables and the game's own buffs and perks. A class change and
a custom buff's `weaponAttack` or `weaponDefense` are not part of that price,
so such a swing takes what the authored numbers give. To change it, scale
`hit.modifiers` or set `hit.damage` in a
[`playerHit`](../../core-concepts/events/) handler: changes made there take
effect from a handler in any resource, and each handler sees what the ones
before it set. Blows that the victim's game works out, such as NPC melee and
arrows, use the new numbers.
:::

## Rename a class and read its price

Two other class-wide calls sit beside these:

```ts
Inventory.setItemName("longswordBroad", "Guild blade"); // every player's game; returns the GUIDs renamed
const price = Inventory.getItemPrice("longswordBroad"); // { pristine, current } or null
```

`setItemName` renames every class the game shows under the same name (every
kite shield is a Kite Shield), up to 128 bytes, untranslated, until the server
stops; `null` gives the game's name back. `getItemPrice` works a unit's worth
out the way the game does, at full and at current health; pass a row's
`metadata` to price that row.

## Related

- [Items: give, take and drop](../items/)
- [Custom buffs](../custom-buffs/): per-body attack, defense and swing speed
- [NPC combat](../../npcs-and-animals/npc-combat/): `playerHit` for NPC blows
- [Inventory reference](../../reference/server/variables/Inventory.md)
