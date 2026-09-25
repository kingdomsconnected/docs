---
title: Spawn NPCs
description: Spawn server-owned NPCs, understand which client simulates them and why, and pin one to a player for a scripted scene.
sidebar:
  order: 52
---

An NPC here is a body your resource puts in the world: a guard at a gate, a
stallholder, an actor in a scene. The server owns everything about it (its
name, health, orders and clothes), but the server has no game engine, so the
body itself is run by a nearby player's client. You create NPCs, give them
orders, and react to what happens to them.

```ts
const guard = Npc.create({
  soul: "guard",
  position: player.position,
  name: "Guard Radim",
  nametag: true,
});
guard.lookAt(player);
```

## Creating one

[`Npc.create`](../../../reference/server/classes/Npc.md#create) takes one
options object. Everything in it has a default; in practice you set `soul` and
`position`.

| Option | What it does |
| --- | --- |
| `soul` | A role name from `Npc.roles()` (`guard`, `bandit`, `townswoman`, ...) or a soul GUID from the game's tables. |
| `position`, `rotation` | Where it stands and which way it faces. |
| `name` | What clients show over it and in conversation. Empty keeps its soul's own name. |
| `outfit` | A clothing preset GUID from the game's table. |
| `wearing` | A list of item class GUIDs to dress it in instead. |
| `appearance` | Face, hair, beard and skin, as with a [player's appearance](../../players/appearance/). |
| `health`, `maxHealth` | The health ledger. `maxHealth` defaults to 100. |
| `faction` | Faction row for relationship and crime decisions; 0 is none. |
| `locomotion` | `kinematic` or `native`; see [Move NPCs: walk, follow, patrol](../npc-orders/#how-it-walks). |
| `invulnerable`, `frozen` | Refuse damage; hold the pose whatever the orders say. |
| `interactable`, `nametag` | Raise `npcInteract` on the use key; draw the name. Both on by default. |
| `lootable` | Whether the corpse keeps its inventory for whoever searches it. |
| `virtualWorld` | Which [virtual world](../../../core-concepts/virtual-worlds/) it lives in. |

A role is a real soul out of the game's own tables, so `guard` spawns a body
that already looks like a guard. Anything not in `Npc.roles()` is taken as a
soul GUID.

```ts
console.log(Npc.roles().join(", "));
```

### Adopting a level NPC

`Npc.adopt(levelGuid, options)` takes over a body the level already placed,
instead of spawning a new one. A level `EntityGuid` is the same number on every
machine, so every client finds the same body. `soul` and `class` are ignored
because the body exists already; adopting the same guid twice returns the NPC
that already has it.

## Who runs the body

This is the part that explains most of the rest of the API.

The server knows where an NPC is and what it has been told to do, but it
cannot walk a body, animate it, or find out whether it bumped into a cart. Only
a machine running the game can. So every NPC is **simulated** by one client:

- Every client near the NPC makes a body for it.
- The server **elects** one of them, the nearest, to run it. That client moves
  the body and reports the pose; everyone else draws what it reports.
- The election reruns about twice a second. A client within roughly 120 metres
  can be elected, and the incumbent keeps the NPC until it is past 160 metres
  or someone else is clearly nearer. That margin stops an NPC flapping between
  two players standing side by side.
- Each client runs a limited number of NPCs. Past that, the overflow goes to
  the next nearest player.
- With nobody in range, the NPC is **dormant**: still on the server, still
  replicated, run by nobody.

`npc.simulator` is the player currently running it, or `null` while it is
dormant. The `npcSimulatorChange` event fires whenever that changes.

```ts
const runner = npc.simulator;
console.log(runner ? `${npc.name} is run by ${runner.nickname}` : `${npc.name} is dormant`);
```

Nothing about the NPC changes when the simulator does. Its orders, health and
identity are the server's, and the new simulator picks them up from there.
That is why orders are held state on the server rather than calls into one
client: see [Move NPCs: walk, follow, patrol](../npc-orders/).

### Dormant is not broken

A dormant guard on the other side of the map has nothing to do that anyone can
see, so nobody spends a frame on it. Two things keep it honest:

- A walk it was sent on (`moveTo`, and every leg of a `patrol`) keeps
  advancing on the server, in a straight line at its walking pace. A player
  who arrives ten minutes later finds the guard where its route says, not where
  it stopped. The arrival is reported the same way a client would report it, so
  your `npcIntentDone` handlers still fire.
- The next client to be elected snaps the body to that position and carries on.

Other orders (`follow`, `flee`, `lookAt`) simply wait for a simulator.

:::note
`Npc.create` returns before any client runs the new body. A fresh NPC far from
every player is dormant from the start, which is fine.
:::

## Pinning an NPC to a player

`npc.pin(player)` makes one player's client run the NPC, whatever the
distances say. `npc.pin(null)` hands it back to the election.

You want this for a scripted scene. A scene is timed by the client that runs
the actors: it reports when a walk ends, and your script starts the next line.
If the actors migrate to whichever player happens to wander closer, the timing
belongs to someone who is not watching the scene. Pinned, the scene plays on
the machine it is being played to.

```ts
const actor = Npc.create({ soul: "townsman", position: player.position, name: "Vendel" });
actor.pin(player);
// ... run the scene, then:
actor.pin(null);
```

A pinned NPC goes dormant, rather than migrating, when its player walks out of
range, and it is unpinned automatically if that player disconnects. Unpin when
the scene ends, so the election can give the NPC to whoever is nearest again.

The full pattern, with a state machine driven by `npcIntentDone`, is in the
[scripted scene tutorial](../../../tutorials/scripted-scene/).

## What an NPC does not do on its own

These bodies keep the game's own mind (it is what lets them walk), but it
decides nothing. An NPC does not react to being shoved, does not draw a weapon,
and does not fight back. Everything it does is something your script told it.
If a guard should run when hit, your `npcDamage` handler sends it running; see
[NPC damage, death and interaction](../npc-events/).

## Changing one later

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

`setOutfit(presetGuid)` and `wear(itemClassGuids)` redress it, the same as the
`outfit` and `wearing` options.

`soul` is read-only: a different soul is a different NPC, so remove this one
and create another. The soul also fixes the body's gender, so an appearance
from the other gender's catalog is refused. Unlike a player's appearance, `setAppearance` on an NPC is
a write, not a request, because nobody owns its body but the server.

`npc.teleport(position, rotation?)` moves it outright, whoever is simulating
it. A pose the simulator had already sent cannot put it back.

## Finding and removing NPCs

```ts
Npc.all();          // every NPC; pass a virtual world to narrow it
Npc.getById(npc.id); // null once it is gone
npc.remove();        // this one, everywhere
Npc.removeAll();     // all of them; pass a virtual world to narrow it
```

Store ids, not handles, and resolve them with `getById` when you need the NPC
again. If your NPCs should go when your resource stops (a hot reload, for
instance), remove the ones you made in a `resourceStop` handler, and only
those: `Npc.removeAll()` would take every other resource's NPCs with them.

:::tip
The default gamemode's `src/server/commands/npc.ts` and `npcdemo.ts` exercise
every call on this page.
:::

## Next

- [Move NPCs: walk, follow, patrol](../npc-orders/)
- [NPC damage, death and interaction](../npc-events/)
- [Build an NPC shop](../../../tutorials/market-stall/): an NPC who trades.
