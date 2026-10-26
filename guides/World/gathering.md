---
title: Herb gathering and regrowth
description: Refuse or watch herb picks with gatheringHarvest and gatheringHarvested, find or clear the herbs in a place, and set how fast picked plants regrow or bring them back from a script.
sidebar:
  label: Herb gathering
  order: 49
---

Players pick the level's own herbs as they do in single player, and the server
decides what each pick gives. A picked plant is gone for everyone in that
virtual world until it regrows. [`Gathering`](../../reference/server/variables/Gathering.md)
sets how long that takes, finds and clears the herbs in a place, or brings
plants back on demand.

```ts
Gathering.setRespawnTime(1, 3); // each picked plant waits 1 to 3 game hours

Events.on("gatheringHarvested", (player, event) => {
  console.log(`${player.nickname} picked ${event.amount} of ${event.item}`);
});
```

## How a pick works

The player's game plays the picking animation and asks the server. The server
checks that the player is still within reach, in the same virtual world, and
that the plant is not already picked, then gives the herb (reason `gather`) and
5 Survival XP. Same-kind plants within the player's picking radius are
harvested together, as in single player, and each of them is picked too.

Two players may animate the same plant; the first to finish gets it. A player
can pick about once a second.

## Refuse a pick

`gatheringHarvest` runs before anything is given. Return `false` to refuse: no
herb, no XP, and the plants stay.

```ts
Events.on("gatheringHarvest", (player, proposal) => {
  if (proposal.virtualWorld === 0 && !player.nickname.startsWith("[Herbalist]")) {
    Chat.sendToPlayer(player, "Only herbalists may pick here.");
    return false;
  }
});
```

The proposal is frozen: a handler can refuse it, not change the amount or the
regrowth. Every handler runs, and an async handler cannot refuse.

| Field | What it is |
| --- | --- |
| `item` | Item class GUID of the herb. |
| `amount` | How many, as the game computes it from the player's Survival level and the plants picked together. |
| `kind` | The game's pickable area id for the plant. |
| `position` | Where the plant grows, `[x, y, z]`, as the player's game reported it. |
| `virtualWorld` | The player's virtual world. |

## React to a pick

`gatheringHarvested` follows a successful pick, after the
`playerInventoryChanged` it caused. It carries the same fields plus `items`,
the inventory rows that received the herb. Use it for quest progress or a
tally:

```ts
const picked = new Map<number, number>(); // player id -> herbs picked

Events.on("gatheringHarvested", (player, event) => {
  picked.set(player.id, (picked.get(player.id) ?? 0) + event.amount);
});
```

## Set the regrowth time

By default each plant regrows in one fifth of the game's own time for its
species: 12 to 36 game hours, about 48 to 144 real minutes at the default world
speed. Times are in **game hours**, so they follow [the world clock](../clock-and-weather/).

| Call | What it does |
| --- | --- |
| `Gathering.setRespawnTime(min, max)` | Every plant waits a random time between `min` and `max` game hours. Equal bounds give a fixed time; `(0, 0)` turns timed regrowth off. `max` is at most 87600. Returns `false` for a bad range. |
| `Gathering.resetRespawnTime()` | Back to the species defaults. |
| `Gathering.respawnTime` | The current `{ minHours, maxHours }`, or `null` for the defaults. |

Both setters apply to every virtual world and restart every plant still
waiting, from now. A paused clock (`World.timeScale` of 0) freezes regrowth.

To give a time in real seconds, convert with the clock's speed:

```ts
const seconds = 90;
const hours = (seconds * World.timeScale) / 3600;
Gathering.setRespawnTime(hours, hours);
```

## Find herbs

`Gathering.getHerbs(position, radius, virtualWorld?)` lists the plants still
standing in a sphere. The server reads its own catalog of the level's herbs,
so it answers with no player nearby.

```ts
const herbs = Gathering.getHerbs(player.position, 15, player.virtualWorld);
for (const herb of herbs) {
  console.log(`${herb.item} (kind ${herb.kind}) at ${herb.position.x.toFixed(1)}, ${herb.position.y.toFixed(1)}`);
}
```

| `GatheringHerb` field | What it is |
| --- | --- |
| `kind` | The game's pickable area id for the species, as `gatheringHarvest` reports it. |
| `item` | Item class GUID of the herb it gives. |
| `position` | Where it grows, a `Vector3` in world metres. |

Picked and removed plants are left out. So are mushrooms, quest plants, and
plants that custom map assets or other mods add: the catalog holds the game's
own medicinal herbs. `radius` is an inclusive 3D distance from 0 to 100000 m,
and each position coordinate must be finite and between -100000 and 100000.

The world defaults to 0; pass `player.virtualWorld` to act where a player is.
The global world players start in, `0xFFFFFFFF`, is a bucket of its own here
and does not reach every world. Invalid arguments throw before anything
changes.

## Clear herbs from a place

`Gathering.removeHerbs(position, radius, virtualWorld?)` removes every
catalogued plant in the sphere for every player in that world, picked ones
included, and players who arrive later find them gone too. It gives no herbs
or XP, raises no harvest events, and returns how many plants it newly
removed, so repeating it returns 0.

```ts
const removed = Gathering.removeHerbs(player.position, 12, player.virtualWorld);
```

Removed plants do not regrow, whatever `setRespawnTime` says. They come back
only through the [respawn calls](#bring-plants-back) or a server restart.

To clear another shape, use an [area](../world-builder-areas/): a script's
box, sphere or polygon, or one of the level's own areas.

```ts
const clearing = Area.create({ id: "camp-clearing", type: "sphere", position: player.position, radius: 12 });
clearing.getHerbs();     // what still grows inside it
clearing.removeHerbs();  // clears it; returns how many
clearing.respawnHerbs(); // brings back picked and removed plants inside it
```

- The world defaults to the area's own, or 0 for an area in every world.
  Naming a world other than the area's own returns an empty list or 0.
- They use the area's current shape, even while `area.enabled` is false.
  Moving, reshaping, disabling or destroying the area does not bring removed
  plants back: call `respawnHerbs` first. A destroyed area returns an empty
  list or 0.
- Removal is held in server memory. To keep a clearing across restarts, save
  `area.toJSON()`, create the area again when your resource starts and call
  `removeHerbs` again.

## Bring plants back

These restore picked and removed plants at once, timed regrowth or not, for the
server and for every player's game. They never create new ones.

```ts
Gathering.respawn(player.position, 20, player.virtualWorld); // within 20 m
Gathering.respawnAll(player.virtualWorld);                   // the whole world
```

Both return how many plants came back, default to virtual world 0 and throw on
invalid arguments. With timed regrowth off, they are the only way plants return,
which suits a game mode that resets the map between rounds.

:::note
Nothing about gathering is saved. A server restart brings every plant back,
removed ones included, and forgets a `setRespawnTime`, so set it again on boot.
:::

The default gamemode's `/herbs` command (`src/server/commands/herbs.ts`) wraps
regrowth and respawning: `/herbs time <seconds>`, `/herbs defaults`,
`/herbs respawn` and `/herbs respawn-all`. It has no verb for finding or
clearing herbs.

## Related

- [Give and take items](../../players/items/): what a picked herb becomes.
- [Progression](../../players/progression/): the Survival level and XP behind a pick.
- [Clock and weather](../clock-and-weather/): the game hours regrowth counts in.
- [Virtual worlds](../../core-concepts/virtual-worlds/): each world has its own picked plants.
- [Gameplay areas](../world-builder-areas/): areas to find and clear herbs in.
