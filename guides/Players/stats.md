---
title: Read and set health, stats and skills
description: Read a player's health, conditions, attributes, skills, movement, combat stance, gear and connection details.
sidebar:
  label: Health, stats, skills
  order: 31
---

Everything you read off a [`Player`](../../reference/server/classes/Player.md)
is the latest snapshot their own client published, in the game's units, a few
frames old. Server scripts can set health, stamina, energy and nourishment
with `setStat`; see [Set and restore player stats](../restoring-stats/).
Derived stats are read-only and change with equipment, buffs and native
gameplay. Levels, XP and perks are on
[Skills, XP and perks](../progression/), which can grant them.

```ts
Events.on("playerCommand", (player, command) => {
  if (command !== "status") return;

  Chat.sendToPlayer(player, `Health ${player.health.toFixed(0)}/${player.maxHealth.toFixed(0)} (${player.healthPercent.toFixed(0)}%)`);
  Chat.sendToPlayer(player, `Stamina ${player.stamina.toFixed(0)}/${player.maxStamina.toFixed(0)}`);
  Chat.sendToPlayer(player, `Strength ${player.strength}, agility ${player.agility}, vitality ${player.vitality}`);
  Chat.sendToPlayer(player, `Fencing ${player.skills.fencing}, marksmanship ${player.skills.marksmanship}`);
});
```

:::caution
Until [`player.ready`](../../reference/server/classes/Player.md#ready) is true,
health, stats and skills read 0 and the position is the world origin. Check it
in anything that does not run from `playerSpawned` or later. See [Wait for
`ready`](../join-and-spawn/#wait-for-ready).
:::

## Check alive or able to act

| Property | Meaning |
| --- | --- |
| `ready` | The body has a pose and a character. False for the first moments of a connection. |
| `alive` | Health above zero. Also false while nothing has been published. |
| `canAct` | Alive, conscious and not asleep. Use it for "can this player trade now": a knocked-out player is alive but cannot act. |

## Health and condition

| Property | What it is |
| --- | --- |
| `health`, `maxHealth` | Current health and its capacity. |
| `healthPercent` | 0 to 100, what the nametag bar draws. Survives a changing maximum. |
| `stamina`, `maxStamina` | Current stamina and capacity. `maxStamina` really drops to 0 for a tick around death. |
| `healthyStamina` | The stamina ceiling current injuries allow, at or below `maxStamina`. |
| `exhaust`, `maxExhaust` | Remaining energy and its capacity. Higher means better rested. |
| `hunger`, `maxHunger` | Nourishment and its capacity. Higher is better fed. |
| `bleeding` | How heavily the body bleeds; 0 when not. |
| `consciousness` | 0 is knocked out. |
| `sleeping` | Above 0 means asleep. |
| `drunkenness` | 0 is sober. |
| `poisoning` | Native poisoning value. A named poison can be active while this remains zero; use `hasBuff` to check that effect. |

These answer "how drunk is he" without knowing any effect's name. The named
effects are `player.buffs`, in [Buffs](../buffs/).

## Query a stat by name

```ts
if (player.ready) {
  console.log(player.getStat(PlayerStat.Stamina));
  console.log(player.getDerivedStat(DerivedPlayerStat.Dirtiness));
}
```

`PlayerStat` names `Health`, `Stamina`, `Exhaust` and `Hunger`.
`DerivedPlayerStat` covers conditions, hygiene, social and stealth values,
carrying, alcohol, combat and movement. These native units are not all
percentages. The [stat-setting guide](../restoring-stats/) explains timing,
writable values and restoring a character.

## Attributes and skills

| Property | What it is |
| --- | --- |
| `strength`, `agility`, `vitality` | The three attributes. |
| `relativeStats` | The same three as the engine's relative values, which its modifiers use. [`SoulStats`](../../reference/server/interfaces/SoulStats.md)-shaped. |
| `skills` | All nine skills at once as [`SoulSkills`](../../reference/server/interfaces/SoulSkills.md): `fencing`, `survival`, `defense`, `sword`, `heavyWeapons`, `marksmanship`, `dagger`, `largeWeapons`, `unarmed`. |
| `relativeSkills` | The relative form of `skills`. |

```ts
function bestWeaponSkill(player: Player): string {
  const { sword, dagger, heavyWeapons, largeWeapons, marksmanship, unarmed } = player.skills;
  const ranked = Object.entries({ sword, dagger, heavyWeapons, largeWeapons, marksmanship, unarmed })
    .sort((a, b) => b[1] - a[1]);
  return ranked[0]?.[0] ?? "none";
}
```

These are the live values combat uses, perks and buffs included. For the
level of every skill and stat as the character sheet shows it, read
`player.levels` (`player.levels.weapon_sword`), described on
[Skills, XP and perks](../progression/#read-a-players-progress).

## Position and movement

`position` and `rotation` come from [`Entity`](../../reference/server/classes/Entity.md).
On a player treat them as read-only and move with `spawn` or `teleport`
([Teleport, kick and other player actions](../actions/)).

| Property | What it is |
| --- | --- |
| `velocity` | Measured from successive replicated positions on the server. On the owning client, the velocity driving the body's animation. |
| `lookDirection` | World-space direction the head and eyes face. Zero until reported. |
| `inAir` | Fallen or mid-jump, debounced past stair steps. |
| `crouched` | Crouched, as their own crouch action reports it. |
| `moveSpeedTag`, `moveDirTag`, `stanceTag` | Raw animation tag ids for pace, direction and stance; 255 is unset. Good for spotting a change, not for comparing to names, which are not in the API. |
| `physicsProfile` | The ragdoll physics profile, or 255. |

A rough "is `target` in front of `player`" check with `lookDirection`:

```ts
function isFacing(player: Player, target: Player, minDot = 0.7): boolean {
  const to = new Vector3(
    target.position.x - player.position.x,
    target.position.y - player.position.y,
    target.position.z - player.position.z,
  );
  const length = Math.hypot(to.x, to.y, to.z);
  if (length === 0) return true;
  const look = player.lookDirection;
  return (look.x * to.x + look.y * to.y + look.z * to.z) / length >= minDot;
}
```

## Combat stance

| Property | What it is |
| --- | --- |
| `fistsUp` | Fists or weapon raised. Stays true after the arm comes down, as the engine holds it. |
| `guard` | Arm guard level: 0 arms down, 1 the guard a player holds. |
| `combatZone` | The combat-star direction they aim at, as a row of the game's zone table, or -1. |

## Gear, mounts and companions

| Property | What it is |
| --- | --- |
| `rightHandItem`, `leftHandItem` | Item class drawn in each hand as 32 hex digits, or `""`. See [Items](../items/#read-what-they-wear-and-hold). |
| `equipment` | Item classes being worn, as 32-hex-digit strings. |
| `mounted` | Whether they are in a saddle. |
| `horse` | The [`Horse`](../../reference/server/classes/Horse.md) they ride, or `null`. |
| `dog` | Their dog companion, or `null`. |
| `appearance` | Face, hair, beard and skin. See [Appearance](../appearance/). |

`horse` and `dog` are usually `null`, so check first:

```ts
const horse = player.horse;
if (horse) console.log(`${player.nickname} is riding horse ${horse.id}`);
```

## Connection

From [`BasePlayer`](../../reference/server/classes/BasePlayer.md):

| Property | What it is |
| --- | --- |
| `nickname` | The name they connected under. Empty once the body is gone. |
| `playerIndex` | Connection slot, reused after they leave. |
| `ping` | Round-trip latency in milliseconds, or -1. |
| `ip` | Remote address, or `""`. |
| `steamId`, `discordId`, `hardwareId` | Identifiers, each `""` when unavailable. |

## Related

- [Join, spawn and respawn](../join-and-spawn/), for when reads become valid
- [Skills, XP and perks](../progression/), for levels, XP and perks
- [Buffs and status effects](../buffs/), for named effects
- [Teleport, kick and other player actions](../actions/), for changing a player
- [Entity state bags](../../core-concepts/state/), for your own per-player data
