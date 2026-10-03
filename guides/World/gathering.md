---
title: Herb gathering and regrowth
description: Refuse or watch herb picks with gatheringHarvest and gatheringHarvested, and set how fast picked plants regrow or bring them back from a script.
sidebar:
  label: Herb gathering
  order: 49
---

Players pick the level's own herbs as they do in single player, and the server
decides what each pick gives. A picked plant is gone for everyone in that
virtual world until it regrows. [`Gathering`](../../reference/server/variables/Gathering.md)
sets how long that takes, or brings plants back on demand.

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

## Bring plants back

These restore picked plants at once, timed regrowth or not, for the server and
for every player's game. They only restore plants that were picked; they never
create new ones.

```ts
Gathering.respawn(player.position, 20, player.virtualWorld); // within 20 m
Gathering.respawnAll(player.virtualWorld);                   // the whole world
```

Both return how many plants came back, default to virtual world 0 and throw on
invalid arguments. With timed regrowth off, they are the only way plants return,
which suits a game mode that resets the map between rounds.

:::note
Nothing about gathering is saved. A server restart brings every plant back and
forgets a `setRespawnTime`, so set it again on boot.
:::

The default gamemode's `/herbs` command (`src/server/commands/herbs.ts`) wraps
all of this: `/herbs time <seconds>`, `/herbs defaults`, `/herbs respawn` and
`/herbs respawn-all`.

## Related

- [Give and take items](../../players/items/): what a picked herb becomes.
- [Progression](../../players/progression/): the Survival level and XP behind a pick.
- [Clock and weather](../clock-and-weather/): the game hours regrowth counts in.
- [Virtual worlds](../../core-concepts/virtual-worlds/): each world has its own picked plants.
