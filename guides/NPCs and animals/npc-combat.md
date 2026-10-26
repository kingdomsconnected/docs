---
title: Make NPCs fight
description: Order melee or bow attacks, choose targets in your game mode, and handle NPC attackers in combat events.
sidebar:
  label: NPC combat
  order: 52.2
---

Use `npc.attack(target)` on the server to make an NPC pursue and fight a
player or another NPC. Your game mode chooses who to attack and when to stop.

```ts
if (player.ready && player.canAct && npc.alive) {
  npc.attack(player); // melee
}
// Later, cancel pursuit and combat:
npc.hold();
```

## Equip the fighter

A role supplies a body and clothing, but does not guarantee the weapon your
encounter needs. `wear` replaces the equipped list, so preserve the clothes:

```ts
const sword = "c164f346-0463-4116-b790-094b11274e5e";
if (!npc.wear([...npc.wearing, sword])) {
  console.log("The fighter's equipment was refused.");
}
```

For an archer, equip a bow and compatible arrows before requesting bow combat:

```ts
const bow = "5c23394a-3300-4570-a8b7-ef1c11519047";
const arrows = "710e3706-8974-404b-b23a-6f51670ef1ed";
if (npc.wear([...npc.wearing, bow, arrows])) {
  npc.attack(player, { weapon: "bow" });
}
```

Bow attackers approach within 18 metres and fire native projectiles. Their
equipped arrows are replenished while shooting; this is not an inventory
ammunition economy. Use a separate game-mode rule if archers should run out.

## Choose and retain a target

The target can be a `Player`, `Npc` or network ID. It must be alive, able to
act, visible in the NPC's virtual world and within 128 metres. An invalid
target returns false and leaves the previous order alone. An accepted order
replaces movement, following or a patrol.

Issue an attack when the target changes. Calling it every tick keeps
replacing the same order. Retain the target while it remains eligible, and
use `hold()` or a new movement order when it should stop fighting.

The attack fails when its target dies, disappears or leaves range. It waits
while the NPC is dormant; no combat damage is simulated without a client
running the body. `reached` is not a victory event. Watch `npcDeath` or
`playerDied` for deaths.

Detection radius, team rules and the distance an NPC may chase from home
belong in your script. There are no `chaseRadius` or `leashRadius` options
on `attack`. The [guarded-area tutorial](../../tutorials/world-builder-sentry/)
uses a World Builder area to decide when a guard fights and returns to patrol.

## Handle NPC attackers

`playerHit` receives a `Player | Npc` attacker. `playerDamage`, `playerDied`,
`npcDamage` and `npcDeath` can also report null for an unidentified cause.
Do not assume every attacker has a player nickname or connection.

```ts
Events.on("npcDeath", (victim, attacker) => {
  const name = attacker instanceof Player ? attacker.nickname
    : attacker instanceof Npc ? attacker.name : "an unknown cause";
  console.log(`${victim.name} died: ${name}`);
});
```

For NPC melee against a player, `playerHit` runs before any health comes
off. NPC melee uses the victim's native result with `hit.priced === false`,
so `hit.damage` is the number to change. Damage and death events report
outcomes after health changes.

```ts
const trainingGuards = new Set<number>(); // add only your resource's guards
Events.on("playerHit", (_victim, attacker, hit) => {
  if (attacker instanceof Npc && trainingGuards.has(attacker.id)) {
    hit.damage = Math.min(hit.damage, 5);
  }
});
```

| In a `playerHit` handler | Effect |
| --- | --- |
| Return `false` | Refuses the blow: no health is taken and no `playerDamage` follows. |
| Set `hit.damage` | The blow takes exactly that; `0` lands it harmlessly. `modifiers` are then ignored. |
| Scale or replace `hit.modifiers` | Reworks a priced player swing. Ignored for NPC melee and arrows. |

These changes take effect from a handler in any resource, and each handler
sees what the handlers before it set. Handlers run synchronously: `hit` is
live only while they run, and one kept for later reads `damage` and
`modifiers` as `undefined` and changes nothing.

:::note[Servers before 1.7.2]
On older servers a handler's changes to `hit.damage` and `hit.modifiers` had
no effect, so a damage rule did nothing; returning `false` still refused the
blow. Update the server if a rule on this page seems to be ignored.
:::

Human NPCs support melee and bow combat. Of the [animal NPCs](../animals/),
wolves and wild dogs support ordinary melee bites. Other animals and animal
bow attacks are refused. Paired predator takedowns are not supported.

An NPC never uses a killing finisher on a player. Its ordinary blows,
knockdowns included, land as usual, and a player dies only when the server
rules a blow lethal, so a player knocked down by an NPC gets back up.

## Try the sample hunter

With the default game mode running, `/npcdemo hunter` creates a melee
hunter and `/npcdemo hunter bow` creates an archer. It looks for players
within 30 metres and returns after straying 60 metres from its last position
outside combat. These are sample rules, not the `attack` API's limits.
`/npcdemo reset` removes the demo NPCs.

Keep the IDs of NPCs your resource creates and remove those NPCs on
`resourceStop`. Stopping the script does not remove them or their orders.
