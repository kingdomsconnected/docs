---
title: Spawn NPCs
description: Spawn server-owned NPCs, change them, pin one to a player for a scripted scene, and remove them.
sidebar:
  label: Spawn NPCs
  order: 50
---

An NPC is a body your resource puts in the world: a guard, a stallholder, an
actor in a scene. The server owns its name, health, orders and clothes; a
nearby player's client runs the body.

```ts
const guard = Npc.create({
  soul: "guard",
  position: player.position,
  name: "Guard Radim",
  nametag: true,
});
guard.lookAt(player);
```

## Spawn an NPC

[`Npc.create`](../../reference/server/classes/Npc.md#create) takes one options
object. Everything has a default; in practice you set `soul` and `position`.

| Option | What it does |
| --- | --- |
| `soul` | A role from `Npc.roles()` (`guard`, `bandit`, `townswoman`, ...) or a soul GUID from the game's tables. |
| `position`, `rotation` | Where it stands and which way it faces. |
| `name` | Shown over it and in conversation. Empty keeps its soul's own name. |
| `outfit` | A clothing preset GUID from the game's table. |
| `wearing` | A list of item class GUIDs to dress it in instead. |
| `appearance` | Face, hair, beard and skin, as for a [player](../../players/appearance/). |
| `health`, `maxHealth` | The health ledger. `maxHealth` defaults to 100. |
| `faction` | Faction row for relationship and crime decisions; 0 is none. |
| `locomotion` | `kinematic` or `native`; see [how it walks](../npc-orders/#choose-how-it-walks). |
| `invulnerable`, `frozen` | Refuse damage; hold the pose whatever the orders say. |
| `interactable`, `nametag` | Raise `npcInteract` on the talk key; draw the name. Both on by default. |
| `lootable` | Whether the corpse keeps its inventory for whoever searches it. |
| `virtualWorld` | Which [virtual world](../../core-concepts/virtual-worlds/) it lives in. |

A role is a real soul from the game's tables, so `guard` already looks like a
guard. Anything not in `Npc.roles()` is taken as a soul GUID; [Souls](../../resources/souls/)
lists one for every look the game ships.

```ts
console.log(Npc.roles().join(", "));
```

`Npc.create` returns before any client runs the body. A new NPC far from every
player starts dormant, which is fine.

### Take over a level NPC

`Npc.adopt(levelGuid, options)` takes over a body the level already placed. A
level `EntityGuid` is the same on every machine, so every client finds the same
body. `soul` and `class` are ignored, and adopting the same guid twice returns
the NPC that already has it.

## Check who runs the body

The server cannot walk or animate a body, so one client **simulates** each NPC.
The server elects the nearest client within about 120 m, keeps it until it is
past 160 m or someone is clearly nearer, and reruns the election about twice a
second. Each client runs a limited number; the overflow goes to the next
nearest player.

With nobody in range the NPC is **dormant**: still on the server, run by
nobody. `npc.simulator` is the player running it, or `null` while dormant.

```ts
const runner = npc.simulator;
console.log(runner ? `${npc.name} is run by ${runner.nickname}` : `${npc.name} is dormant`);
```

A change of simulator changes nothing about the NPC: its orders, health and
identity stay on the server and the new simulator picks them up.

:::note[Dormant NPCs keep walking]
A dormant NPC's `moveTo` (and each `patrol` leg) keeps advancing on the server
in a straight line at walking pace, and still raises `npcIntentDone` on arrival.
The next elected client snaps the body there. `follow`, `flee` and `lookAt` wait
for a simulator.
:::

## Pin an NPC to a player

`npc.pin(player)` makes that player's client run the NPC whatever the
distances. `npc.pin(null)` hands it back to the election. Pin actors in a
scripted scene, so the scene is timed on the machine it is played to.

```ts
const actor = Npc.create({ soul: "townsman", position: player.position, name: "Vendel" });
actor.pin(player);
// ... run the scene, then:
actor.pin(null);
```

A pinned NPC goes dormant, rather than migrating, when its player walks out of
range, and is unpinned if that player disconnects. The
[NPC cutscene tutorial](../../tutorials/scripted-scene/) shows the full
pattern.

## Change an NPC

```ts
npc.name = "Guard Vaclav";
npc.nametag = true;
npc.interactable = false;
npc.invulnerable = true;
npc.frozen = true;            // holds its pose whatever its orders say
npc.faction = 3;

const hair = Appearances.options("hair", "male")[0];
if (hair) npc.setAppearance({ gender: "male", hair: hair.name }); // only what you pass changes
```

- `setOutfit(presetGuid)` and `wear(itemClassGuids)` redress it, like the
  `outfit` and `wearing` options.
- `setAppearance` is a write, not a request. The soul fixes the gender, so an
  appearance from the other gender's catalog is refused.
- `soul` is read-only. For a different soul, remove the NPC and create another.
- `npc.teleport(position, rotation?)` moves it outright; a pose the simulator
  sent just before cannot put it back.

:::note
An NPC decides nothing on its own. It does not react to being shoved, draw a
weapon or fight back. If a guard should run when hit, your `npcDamage` handler
sends it; see [NPC damage, death and interaction](../npc-events/).
:::

## Find and remove NPCs

```ts
Npc.all();           // every NPC; pass a virtual world to narrow it
Npc.getById(npc.id); // null once it is gone
npc.remove();        // this one, everywhere
Npc.removeAll();     // all of them; pass a virtual world to narrow it
```

Store ids, not handles, and resolve them with `getById`. To clean up on a hot
reload, remove the NPCs you made in a `resourceStop` handler, and only those:
`Npc.removeAll()` takes every other resource's NPCs too.

The default gamemode's `src/server/commands/npc.ts` and `npcdemo.ts` exercise
every call on this page.

## Related

- [Move NPCs](../npc-orders/): walk, follow, patrol, and hear when they are done.
- [NPC damage and death](../npc-events/): health, hits and the talk key.
- [Build an NPC shop](../../tutorials/market-stall/): an NPC who trades.
- [Script an NPC cutscene](../../tutorials/scripted-scene/): pinned actors in a scene.
