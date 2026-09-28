---
title: NPC damage, death and interaction
description: Hurt, kill and revive NPCs, react to hits and deaths, and handle a player pressing the talk key at one.
sidebar:
  label: NPC damage and death
  order: 52
---

The server keeps each NPC's health. Players' hits reach it after the server
checks them, your script can change it, and events tell you when an NPC is
hurt, dies, comes back or is spoken to.

```ts
Events.on("npcDeath", (npc, attacker) => {
  const by = attacker ? attacker.nickname : "nobody";
  console.log(`${npc.name || npc.id} was killed by ${by}`);
});
```

## Read and set health

```ts
npc.health;        // current, clamped to maxHealth
npc.maxHealth;     // what it starts with and is revived to; read-only
npc.alive;         // false once health reaches zero
npc.invulnerable;  // refuse damage before it reaches the ledger

npc.health = npc.maxHealth; // heal outright
```

Pass `health` and `maxHealth` to `Npc.create` to change the starting values.

## Hurt, kill and revive

```ts
npc.damage(25, player); // takes 25, credits player
npc.kill(player);       // outright, even through invulnerable
npc.revive();           // back at full health
```

| Call | Does | Refused when |
| --- | --- | --- |
| `damage(amount, attacker?)` | Takes health, raises `npcDamage`, and `npcDeath` if it was the last. | The NPC is invulnerable or already dead. |
| `kill(attacker?)` | Same path, ignoring `invulnerable`. | |
| `revive()` | Brings a dead NPC back at full health; clients make a fresh body. | |

The attacker is an optional player handle or id, used only to fill in the
events. A dead NPC stays an entity: the corpse stays, the handle resolves, and
players can search it if `lootable` is on. `remove()` or `revive()` it when you
are done.

:::caution[Arrows only]
Player hits are resolved on the attacker's client and checked by the server, so
`amount` in `npcDamage` is what was really taken. Arrows land on NPCs; melee
does not, because these bodies never pair up for a fight and the game only
resolves melee against a paired opponent.
:::

## NPC events

| Event | Arguments | When |
| --- | --- | --- |
| `npcSpawn` | `npc` | Right after an NPC is created or adopted, by any script. |
| `npcDestroy` | `npc` | While it is being removed. The handle still reads. |
| `npcIntentDone` | `npc`, `status` | Its order ended; see [Move NPCs](../npc-orders/#hear-when-an-order-ends). |
| `npcDamage` | `npc`, `attacker`, `amount` | Health came off. |
| `npcDeath` | `npc`, `attacker` | The last of its health went. |
| `npcRevive` | `npc` | A dead NPC was brought back. |
| `npcInteract` | `npc`, `player` | A player pressed the talk key at it. |
| `npcSimulatorChange` | `npc`, `player` | The client running it changed; `player` is `null` when it went dormant. |

`attacker` and the `npcSimulatorChange` player are `Player | null`, so check
them. Every event fires for every NPC on the server, including other
resources' NPCs: keep a set of your ids and return early for the rest.

## React to a hit

An NPC never fights back or reacts on its own, so your handler does. Here a
guard's partner runs when the guard is hit:

```ts
const partners = new Map<number, number>(); // npc id -> partner's id

Events.on("npcDamage", (npc, attacker, amount) => {
  const partnerId = partners.get(npc.id);
  if (partnerId === undefined || !attacker) return;

  console.log(`${npc.name} took ${amount.toFixed(0)}, ${npc.health.toFixed(0)} left`);
  Npc.getById(partnerId)?.flee(attacker.position, { speed: "run", radius: 30 });
});
```

## Talk to an NPC

`npcInteract` fires when a player presses the talk key (T by default,
rebindable) within about three metres of an NPC while facing it. The server
checks the distance, so a far-off claim never reaches your handler. Only NPCs
with `interactable` on (the default) raise it.

```ts
Events.on("npcInteract", (npc, player) => {
  npc.lookAt(player);
  npc.say(`Well met, ${player.nickname}.`);
});
```

From here you usually open a [dialogue](../../quests-dialogue-and-shops/dialogue/)
or a [shop](../../quests-dialogue-and-shops/vendors/); the
[NPC shop tutorial](../../tutorials/market-stall/) does both.

## Watch the simulator change

```ts
Events.on("npcSimulatorChange", (npc, runner) => {
  console.log(`${npc.name || npc.id}: ${runner ? runner.nickname : "dormant"}`);
});
```

Most resources never need this. It helps with debugging, and with noticing that
a pinned actor's player walked away mid-scene. See
[Spawn NPCs](../npcs/#check-who-runs-the-body).

## Related

- [Spawn NPCs](../npcs/): options, simulation and pinning.
- [Move NPCs](../npc-orders/): orders and `npcIntentDone`.
- [Dialogue choices](../../quests-dialogue-and-shops/dialogue/): what to open on the talk key.
- [Events and handlers](../../core-concepts/events/): how `Events.on` works.
