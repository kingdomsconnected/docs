---
title: NPC damage, death and interaction
description: Health, damage, death and revival for server-owned NPCs, and the events for interaction, spawning and simulator changes.
sidebar:
  order: 54
---

The server keeps each NPC's health as a ledger. Players' hits reach it after
the server agrees to them, your script can add to or take from it, and events
tell you when an NPC is hurt, dies, comes back, or is spoken to. This page
covers all of that, plus the events for an NPC appearing, disappearing and
changing simulator.

```ts
Events.on("npcDeath", (npc, attacker) => {
  const by = attacker ? attacker.nickname : "nobody";
  console.log(`${npc.name || npc.id} was killed by ${by}`);
});
```

## Health

```ts
npc.health;        // current, clamped to maxHealth
npc.maxHealth;     // what it starts with and is revived to (set at create)
npc.alive;         // false once health reaches zero
npc.invulnerable;  // refuse damage before it reaches the ledger

npc.health = npc.maxHealth; // heal outright
```

`maxHealth` is read-only after creation; pass `maxHealth` and `health` to
`Npc.create` to change them.

## Hurting and killing

```ts
npc.damage(25, player); // takes 25, credits player
npc.kill(player);       // outright, even through invulnerable
npc.revive();           // back at full health
```

- `damage(amount, attacker?)` takes health off, raises `npcDamage`, and raises
  `npcDeath` if that was the last of it. It is refused for an invulnerable or
  already-dead NPC.
- `kill(attacker?)` goes through the same path but ignores `invulnerable`.
  That is the difference between the two.
- `revive()` brings a dead NPC back at full health. Every client makes a fresh
  body for it, because the one they have is a corpse.

The attacker is a player handle or id, and is optional. It is only used to
fill in the events.

### What players can do to an NPC

A player's hit is resolved by the attacker's own client and then checked by
the server, so the `amount` in `npcDamage` is what was actually taken, not
what the client claimed.

:::caution
Arrows land on NPCs; melee does not. These bodies never pair up for a fight
(that is how the game is stopped from starting one), and the game only
resolves a sword or a fist against a paired opponent. If your mode needs melee
against NPCs, it is not there yet.
:::

An NPC also never fights back. It keeps the game's mind but none of its
reactions, so a guard who is shot just stands there unless your script says
otherwise.

## Death

A dead NPC is still an entity. The body stays as a corpse, the handle keeps
resolving, and a player can search it if `lootable` is on. Remove it with
`npc.remove()` when you are done with it, or `revive()` it.

## Events

| Event | Arguments | When |
| --- | --- | --- |
| `npcSpawn` | `npc` | Right after an NPC is created or adopted, by any script. |
| `npcDestroy` | `npc` | While it is being removed. The handle still reads. |
| `npcIntentDone` | `npc`, `status` | Its order ended. See [Move NPCs: walk, follow, patrol](../npc-orders/#npcintentdone-hearing-back). |
| `npcDamage` | `npc`, `attacker`, `amount` | Health came off the ledger. |
| `npcDeath` | `npc`, `attacker` | The last of its health went. |
| `npcRevive` | `npc` | A dead NPC was brought back. |
| `npcInteract` | `npc`, `player` | A player pressed the talk key at it. |
| `npcSimulatorChange` | `npc`, `player` | The client running it changed. |

`attacker` is `Player | null`, and so is `player` in `npcSimulatorChange`.
Check before you use them.

Every one of these fires for every NPC on the server, including other
resources' NPCs. Keep a set of the ids you created and return early for the
rest.

### Reacting to a hit

Nothing in the game reacts for the NPC, so you do. Here the other guard at a
post runs when his partner is hit:

```ts
const partners = new Map<number, number>(); // npc id -> partner's id

Events.on("npcDamage", (npc, attacker, amount) => {
  const partnerId = partners.get(npc.id);
  if (partnerId === undefined || !attacker) return;

  console.log(`${npc.name} took ${amount.toFixed(0)}, ${npc.health.toFixed(0)} left`);
  Npc.getById(partnerId)?.flee(attacker.position, { speed: "run", radius: 30 });
});
```

## Talking to an NPC

`npcInteract` fires when a player presses the talk key (T by default, and
rebindable in the game's controls) while standing within about three metres of
an NPC and facing it. The client reports the press and the server checks the
distance against the position it already has, so a far-off claim never reaches
your handler.

Only NPCs with `interactable` on raise it. That is the default; set it to
`false` for background NPCs nobody should talk to.

```ts
Events.on("npcInteract", (npc, player) => {
  npc.lookAt(player);
  npc.say(`Well met, ${player.nickname}.`);
});
```

Turning to face the player is most of what makes an NPC feel addressed. From
here you would usually open a [dialogue](../../quests-dialogue-and-shops/dialogue/) or a
[vendor](../../quests-dialogue-and-shops/vendors/); the
[market stall tutorial](../../../tutorials/market-stall/) does both.

## Watching the simulator change

`npcSimulatorChange` fires when a different client starts running an NPC:
someone walked into range, out of it, or disconnected. `player` is `null` when
the NPC went dormant.

```ts
Events.on("npcSimulatorChange", (npc, runner) => {
  console.log(`${npc.name || npc.id}: ${runner ? runner.nickname : "dormant"}`);
});
```

Nothing about the NPC changes with it, so most resources never need this
event. It is useful for debugging, and for noticing that a pinned actor's
player walked away mid-scene. See [NPCs](../npcs/#who-runs-the-body).
