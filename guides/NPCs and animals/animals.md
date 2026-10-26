---
title: Spawn animals and build a population
description: Create animal NPCs, find authored spawnpoints, move predators and prey, and choose your own respawn rules.
sidebar:
  label: Animal populations
  order: 55.5
---

Create mammals with `Npc.create`, using an animal soul from `Npc.animals()`.
They use the same server-owned orders and events as human NPCs.

```ts
const sheep = Npc.create({
  soul: "animal_sheep_ewe",
  position: player.position,
  virtualWorld: player.virtualWorld,
  nametag: false,
  interactable: false,
});
console.log(`${sheep.id}: ${sheep.soul}`);
```

Place animals on walkable ground with enough space for their bodies. For
automated placement, use the server's [navigation mesh](../navigation/)
and handle a null result from `Navigation.closestPoint` or `randomPoint`.

## Choose an animal

```ts
const wolves = Npc.animals().filter(row => row.actorClass === "Wolf");
console.log(wolves.map(row => `${row.name}: ${row.soul}`).join("\n"));
```

Each catalog row contains `name`, `soul` and `actorClass`. Passing the name
or soul GUID selects the matching native class. A conflicting explicit
`class` is refused. Human outfits, worn items and appearance overrides are
also refused for animals.

The catalog covers sheep, cattle, pigs, boar, hares, red deer, roe deer,
wolves and wild dogs, including quest variants. Prefer generic `animal_*`
entries for ordinary populations. [Horses](../horses/) use `Horse.spawn`,
and [companion dogs](../dogs/) use `Dog`.

## Populate the world deliberately

The game's default mammal, horse and dog spawning is suppressed. Native
chicken flocks are suppressed too; there is no chicken spawning API.
Other ambient wildlife is unaffected. Your server must create the animals
it wants through `Npc`, `Horse` and `Dog`.

`Npc.animalSpawnpoints()` returns the running level's authored spawn
markers. Pass a level name, or `"*"` for all catalogued levels:

```ts
const sites = Npc.animalSpawnpoints();
for (const site of sites.slice(0, 5)) {
  console.log(`${site.guid}: ${site.name}, ${site.actorClass}, count ${site.count}`);
}
```

| Field | Use |
| --- | --- |
| `guid`, `level`, `name`, `layer` | Identify and select a placement. Keep GUIDs as strings. |
| `soul`, `actorClass`, `position` | Choose the animal and locate its authored marker. |
| `count`, `respawnDays`, `spawnInFlock` | Read the original game's configuration. These do not create multiplayer rules. |
| `spawnAreaGuid` | Find the linked area, when one is recorded. |

Markers may belong to quest layers and may sit above the ground. Their
presence in the catalog does not mean they are active or safe spawn points.
Project them onto the mesh before creating a body. Set your own population
cap and choose which sites to enable.

## Roaming and fighting

Animals accept `moveTo`, `patrol`, `follow`, `flee` and `hold` through `Npc`;
`flee` runs the game's own escape, [below](#make-an-animal-flee).
They avoid doorways. Narrow passages may still block a body, so handle failed
orders and retry after a delay rather than every frame.

```ts
const destination = Navigation.randomPoint(npc.position, 12, { doors: "none" });
if (destination) npc.moveTo(destination, { speed: "walk", pathfinding: "server" });
```

Wolves and wild dogs can use `attack(target)` for ordinary bites. Other
animals cannot attack, and animals cannot use bows. Choosing prey, protecting
teams and limiting pursuit are [game-mode decisions](../npc-combat/).
Named [World Builder patrols](../patrol-routes/) also work for animal NPCs;
validate with `{ actor: animal }` to use their door policy.

## Make an animal flee

`flee` hands an animal to the game's own escape, so it bolts the way the
game's animals do rather than steering straight away:

```ts
npc.flee(player);                          // from a player or NPC
npc.flee(player.position, { radius: 40 }); // or from a place
```

- **Pace and path are the animal's.** Its own mind picks them and runs as far
  as its kind runs: a hare about 50 metres, a boar 70 to 90. `speed` is ignored.
- **`radius` only decides `reached`.** `npcIntentDone` reports `reached` once
  the run takes it `radius` metres (default 25) clear, so a radius past what
  its kind runs may never report.
- **It must start within five seconds.** If the animal has not taken the
  escape by then, the order ends `failed`.
- **The animal keeps its own mind until the next order.** Once clear it goes
  on as the game's animals do, and a wild one may bolt again from a human it
  notices. A client that takes the animal over after `reached` holds it where
  it stands. Give `hold()` or any other order to take it back.
- A dormant animal waits for a client to run it before it flees.

`flee` returns `false` for a player or NPC that is not there. Human NPCs flee
differently; see [Move NPCs](../npc-orders/#make-an-npc-flee).

## Try the default population manager

The default game mode provides `/animals list`, `/animals start <spawnpointGuid>` and
`/animals stop`. It enables all populated sites on the current level in world 0 once
`Navigation.ready` is true. In `src/server/animals.ts`, `animalSpawnpoints: null`
selects those sites, a GUID list selects specific sites, and `[]` disables startup
sites. A command-started site uses the caller's virtual world. `/animals list` lists
sites; it does not create a population by itself.

The sample allows up to four slots per site and 256 animal bodies across all sites,
including corpses. Sites wait when that cap is reached. Animals roam within 20 metres
of home; predators acquire players within 18 metres and stop pursuing outside a
45-metre home leash.

After death, replacement waits five to six real minutes and for the corpse to be
removed. Corpses remain for at least 90 seconds, and are removed only with players at
least 60 metres away. Spawns need a ready player within 350 metres and no visible
player within 60 metres of the marker or spawn point. This is a distance test, not a
line-of-sight test. Living animals are removed when players leave the activation area
and are far enough from the body, freeing capacity for other sites. Navigation work
and spawning are spread across server ticks.

The sample prepares animal loot at spawn. Its meat and special-part chances
are game-mode settings; [Corpse loot](../npc-inventories/) explains the stock
and harvest APIs.

These limits and timers belong to the sample. They do not use the catalog's
`respawnDays` or persist across resource/server restarts. A custom population
manager should own its timers and NPC IDs, remove only its own animals on
shutdown, and save any state it needs across restarts.
