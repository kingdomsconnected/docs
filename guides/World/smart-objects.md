---
title: Place seats, beds and crafting stations
description: Place benches, beds, dice tables, alchemy tables, smithies, drying racks and smokehouses that players use like the level's own, and take the level's stations out.
sidebar:
  label: Seats and stations
  order: 43.5
---

A smart object is one of the game's interactive pieces of furniture: a bench
or chair to sit on, a bed to sleep in, a dice table, or a crafting station.
A server script places one, and every player in its virtual world sits,
sleeps, plays dice and crafts at it as at the level's own, seeing each other
do it.

```ts
const at = player.position;
const table = SmartObject.spawn({ blueprint: "Table/table_dice", position: [at.x + 2, at.y, at.z], name: "tavern-dice" }, player.virtualWorld);
const bench = SmartObject.spawn({
  blueprint: "Bench/bench_2places_low",
  position: [at.x + 2, at.y + 2, at.z],
  rotation: Quaternion.fromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2), // a quarter turn about Z
  name: "tavern-bench",
}, player.virtualWorld);

console.log(`${table.kind} at station ${table.stationId}; the bench seats ${bench.seats.length}`);
```

## Place a smart object

[`SmartObject.spawn(definition, virtualWorld?)`](../../reference/server/classes/SmartObject.md#spawn)
places one for every player in the virtual world (the global one when
omitted) and returns its handle. The definition is the same object a
[World Builder export](../world-resources/) stores in its `smartObjects`
array:

| Field | Meaning |
| --- | --- |
| `blueprint` | Required. A name from the table below. Matched without regard to case. |
| `position` | Required. Where the piece's own origin goes, as the level's copies stand: a `Vector3` or `[x, y, z]`. |
| `rotation` | Which way it faces: a `Quaternion`, `{ x, y, z, w }` or `[x, y, z, w]`. No rotation when omitted. |
| `name` | What a script finds it by, up to 64 bytes of UTF-8. |

A smart object stands at its own size; there is no scale. It never moves:
assigning `position` or `rotation`, or calling `setVirtualWorld`, is put back
on the next server tick with a warning in the server log. To move one,
destroy it and place it again.

## Blueprints

[`SmartObject.blueprints()`](../../reference/server/classes/SmartObject.md#blueprints)
lists every piece `spawn` takes, with its `name`, `kind` and `seats` (how
many bodies sit or lie on it at once). The list is built into the game and
the server:

| Blueprint | Kind | Seats |
| --- | --- | --- |
| `Bed/bed_bench`, `Bed/bed_high`, `Bed/bed_low`, `Bed/bed_low_ver1`, `Bed/bed_low_ver2`, `Tent/tent_1` | `bed` | 1 |
| `Bed/bed_high_double` | `bed` | 2 |
| `Bench/bench_1place_low`, `Bench/bench_1place_low_table`, `Chair/chair_high`, `Chair/chair_low` | `seat` | 1 |
| `Bench/bench_2places_high`, `Bench/bench_2places_low`, `Bench/bench_2places_low_table` | `seat` | 2 |
| `Bench/bench_3places_low` | `seat` | 3 |
| `Table/table_dice` | `dice` | 2 |
| `profession/apothecary/alchemyTable_wip` | `alchemy` | 0 |
| `profession/blacksmith/smithy_workshop`, `profession/blacksmith/smithy_workshop_small` | `smithing` | 0 |
| `profession/butcher/butcher_dryer` | `drying` | 0 |
| `profession/butcher/butcher_smokeHouse` | `smoking` | 0 |

The smithy blueprints build the forge and its workplace, without the shop and
the chest the game's smithies carry.

## Read a placed smart object

| Member | Meaning |
| --- | --- |
| `blueprint`, `kind`, `name` | What it was placed as, and the name it was given (empty for none). |
| `stationId` | The GUID of its station, the part players work at, as `Dice.tables()` and `SmartObject.stations()` list it. Empty for a seat or a bed. |
| `seats` | The GUIDs of the places a body sits or lies on, the same GUIDs a seated player's stance and `Dice.tables()` name. |
| `destroy()` | Takes it down for every player. Anyone sitting on it or working at it is let go. |
| `toJSON()` | The definition to place it again, or `null` once it is gone. |

`SmartObject.all(virtualWorld?)` lists placed smart objects: every world when
omitted, or only those placed in exactly that world.
`SmartObject.getById(id)` takes a network id. The GUIDs change every time the
server starts, so find a piece by `name` instead:

```ts
const dice = SmartObject.all().find((piece) => piece.name === "tavern-dice");
```

## Stations

A station is the part players work at: a dice table, an alchemy table, a
smithy, a drying rack or a smokehouse. Seats and beds have none.
[`SmartObject.stations(virtualWorld?)`](../../reference/server/classes/SmartObject.md#stations)
lists every station players in one virtual world can use: the level's own,
minus any taken out of that world or the global one, and every station placed
in that world or the global one. It defaults to the global world.

| Field | Meaning |
| --- | --- |
| `id` | The station's GUID. For a level station, what `SmartObject.remove` takes. |
| `kind` | `dice`, `alchemy`, `smithing`, `drying` or `smoking`. |
| `position` | Where it stands. |
| `placed` | `true` for a station a script or a World Builder export placed. |
| `smartObject` | The placed `SmartObject` it belongs to, or `null` for a level station. |

A placed station joins the server's own lists and checks:
[`Dice.tables(virtualWorld?)`](../../players/dice/) and
[`Crafting.stations(kind?, virtualWorld?)`](../../players/alchemy/) follow the
same rule, include placed stations, and mark them `placed: true`. Both default
to the global world; pass a world without a kind as
`Crafting.stations(undefined, 5)`. A placed crafting station has an empty
`layer`. Players can brew and forge at a placed station, play dice at a
placed table, and dry or smoke food at a placed rack or smokehouse.
Destroying a placed station ends any alchemy session at it.

The listings write a station's id in two forms. `SmartObject.stations()` and
`Dice.tables()` use the GUID alone, such as `0148ef920dcb72aa`.
`Crafting.stations()`, crafting sessions and events and
`Crafting.occupancy` put the level in front, as
`kutnohorsko:0148ef920dcb72aa`. `SmartObject.remove` and `restore` take the
GUID alone, the part after the colon.

No event announces a station placed or taken out. The default gamemode's dice
lobby reads `Dice.tables()` again every two seconds to notice them.

## Take a level station out

[`SmartObject.remove(id, virtualWorld?)`](../../reference/server/classes/SmartObject.md#remove)
takes one of the level's stations out of a virtual world: the global one when
omitted, which takes it out of every world. Players there no longer see it,
it is listed nowhere, and the server refuses any new session at it. A
crafting session already running there is not ended; end it with
`Crafting.cancel(player)` if you need to.

```ts
// Take every level alchemy table out of world 5.
for (const station of SmartObject.stations(5)) {
  if (station.kind === "alchemy" && !station.placed) SmartObject.remove(station.id, 5);
}
```

Only the station entity goes. The furniture around it is the level's scenery
and stays; take that out with a [level edit](../level-edits/) or the World
Builder. A removal is itself a level edit: it shows in `LevelEdit.all()`,
`LevelEdit.restoreAll()` puts it back, and it is undone when the resource that
made it stops.

`SmartObject.removed(virtualWorld?)` lists the level stations that are out,
each with `id`, `kind`, `position` and `virtualWorld`: every world when
omitted, or only removals made in that world. `SmartObject.restore(id,
virtualWorld?)` puts one back and returns `true`, or `false` when that world
has no such removal. A station taken out of the global world is put back only
from there.

## Ownership and limits

A smart object belongs to the resource that placed it, and goes when that
resource stops. Pieces in a World Builder export belong to the server and are
placed in the global world on every start. Nothing is saved: place scripted
pieces again on boot, from their saved `toJSON()`.

- Only the 21 blueprints above can be placed; the list cannot be extended.
- NPCs do not sit on, sleep in or work at placed smart objects.
- Grindstones and cooking fires can be neither placed nor taken out.
- Players in the global world see and can use the pieces of every virtual
  world. They work at the global world's copy of each level station, so a
  station taken out only from another world still works for them.

## When a call fails

| Call | Fails when | Result |
| --- | --- | --- |
| `SmartObject.spawn` | Unknown blueprint, `position` missing or not finite, `rotation` not a finite quaternion, or `name` over 64 bytes. | **Throws.** |
| `SmartObject.remove` | The id is not a GUID, or not one of the level's stations. | **Throws.** Take a placed piece down with `destroy()`. |
| `SmartObject.restore` | That world has no such removal. | Returns `false`. |
| `SmartObject.getById`, `toJSON()` | The piece is gone. | `null`. |

## Related

- [Hang new doors](../hang-doors/), the same idea for doors
- [Dice matches between players](../../players/dice/), [Brew potions](../../players/alchemy/) and [Forge items](../../players/smithing/), what players do at a station
- [Remove or move the level's own objects](../level-edits/), for the furniture around a station
- [Use World Builder exports in scripts](../world-resources/), pieces placed from an export
- [SmartObject reference](../../reference/server/classes/SmartObject.md)
