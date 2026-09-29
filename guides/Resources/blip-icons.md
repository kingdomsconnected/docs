---
title: Blip icons
description: Every icon a compass or map blip can be drawn with, and which of them the map screen has art for.
sidebar:
  label: Blip icons
  order: 120
---

[`Blip.create`](../../reference/server/classes/Blip.md#create) takes one of these names as `type`,
and [`Blip.types`](../../reference/server/classes/Blip.md#types) returns them.

```ts
Blip.create({ position: player.position, type: "Blacksmith", label: "Forge" });
```

The names are the game's own, misspellings included. The compass draws every icon; the map screen
only draws those it has art for, so a blip with a **Compass only** icon never appears there.
**Undiscovered art** marks the icons that also have the variant drawn for `markState: 1`.
See [Map and blips](../../user-interface/map/).

<!-- generated:icons -->

| Icon | On the map screen | Undiscovered art |
| --- | --- | --- |
| `Checkpoint` | Compass only |  |
| `Main` | Compass only |  |
| `Side` | Compass only |  |
| `Micro` | Compass only |  |
| `QuestGiver` | Yes | Yes |
| `ActivityGiver` | Yes | Yes |
| `Hub` | Yes | Yes |
| `FastTravel` | Yes | Yes |
| `FastTravelLevel` | Yes | Yes |
| `Dog` | Yes |  |
| `Dlcs` | Compass only |  |
| `Home` | Yes | Yes |
| `Shop` | Yes | Yes |
| `Blacksmith` | Yes | Yes |
| `Armourer` | Yes | Yes |
| `Weaponsmiths` | Yes | Yes |
| `Shoemaker` | Yes | Yes |
| `Tailor` | Yes | Yes |
| `Pub` | Yes | Yes |
| `Apothecary` | Yes | Yes |
| `Herbalist` | Yes | Yes |
| `Miller` | Yes | Yes |
| `HorseTrader` | Yes | Yes |
| `Saddler` | Yes | Yes |
| `Bailiff` | Compass only |  |
| `Arena` | Yes | Yes |
| `ArcheryArena` | Yes | Yes |
| `FistFight` | Compass only |  |
| `Alchemy` | Yes | Yes |
| `SharpeningWheel` | Yes | Yes |
| `Baths` | Yes | Yes |
| `HuntingSpot` | Yes | Yes |
| `HuntingSpotBoar` | Yes | Yes |
| `FishingSpot` | Yes | Yes |
| `Hive` | Yes | Yes |
| `ForestGarden` | Yes | Yes |
| `Camp` | Yes | Yes |
| `CampEnemy` | Yes | Yes |
| `MineEnrtrance` | Yes | Yes |
| `Grave` | Yes | Yes |
| `Nest` | Yes | Yes |
| `ConcCross` | Yes | Yes |
| `Shrine` | Yes | Yes |
| `Bed` | Yes | Yes |
| `GeneralPoi` | Yes | Yes |
| `Bakery` | Yes | Yes |
| `Butchery` | Yes | Yes |
| `VegetableShop` | Yes | Yes |
| `Tanner` | Yes | Yes |
| `Hunter` | Yes | Yes |
| `Scribe` | Yes | Yes |
| `Hotel` | Yes | Yes |
| `HuntingSpotRoe` | Yes | Yes |
| `HuntingSpotWolf` | Yes | Yes |
| `Smithy` | Yes | Yes |
| `SkillTeacher` | Yes | Yes |
| `FightArena` | Yes | Yes |
| `PoiTipster` | Yes | Yes |
| `SmokingFood` | Yes | Yes |
| `DryingFood` | Yes | Yes |
| `Washing` | Yes | Yes |
| `Indulgences` | Yes | Yes |
| `Gunsmith` | Yes | Yes |
| `DiceTable` | Yes | Yes |
| `FistFightArena` | Yes | Yes |
| `DLC0` | Yes |  |
| `BedPlayer` | Yes | Yes |
| `Barber` | Yes | Yes |
| `ShieldPainter` | Yes | Yes |
| `DLC1` | Yes |  |
| `DLC2` | Yes |  |
| `DLC3` | Yes |  |
| `Racing` | Compass only |  |
| `DLC2_smithing` | Yes |  |
| `DLC2_dice` | Yes |  |
| `DLC2_acquiringPackages` | Yes |  |
| `DLC2_archery` | Yes |  |
| `DLC2_donations` | Yes |  |
| `DLC2_duels` | Yes |  |
| `DLC2_stealingPackages` | Yes |  |
| `DLC2_activities` | Yes |  |
| `SellingChest` | Yes | Yes |
| `FastTravelSedlec` | Yes | Yes |

<!-- /generated:icons -->
