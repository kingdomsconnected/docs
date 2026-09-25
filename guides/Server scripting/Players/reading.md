---
title: Player health, stats and skills
description: Health, stamina, conditions, attributes, skills, movement, combat stance and gear, as the player's own client last published them.
sidebar:
  order: 32
---

Everything you can read off a [`Player`](../../../reference/server/classes/Player.md)
is a snapshot the player's own client published, in the game's own units. The
server does not simulate bodies, so it cannot compute any of this itself; it
keeps the latest report and hands it to you. That makes reads cheap and always
a few frames old.

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
Until [`player.ready`](../../../reference/server/classes/Player.md#ready) is
true, the body has published nothing: health, stats and skills read as 0 and
the position is the world origin. Check it in anything that is not already
running from `playerSpawned` or later. See [Player join and leave events](../lifecycle/).
:::

## Alive or not

Three flags cover most checks:

| Property | Meaning |
| --- | --- |
| `ready` | The body has a pose and a character. False for the first moments of a connection. |
| `alive` | Health is above zero. Also false while nothing has been published. |
| `canAct` | Alive, conscious and not asleep: the body can be driven at all. |

Use `canAct` rather than `alive` for things like "can this player accept a
trade right now". A knocked-out player is alive but cannot do anything.

## Health and condition

| Property | What it is |
| --- | --- |
| `health`, `maxHealth` | Current health and its capacity. |
| `healthPercent` | Health from 0 to 100, what the nametag bar draws. Survives a maximum that changes. |
| `stamina`, `maxStamina` | Current stamina and capacity. `maxStamina` drops to 0 for a tick around death, which is real. |
| `healthyStamina` | The stamina ceiling current injuries allow, at or below `maxStamina`. |
| `exhaust`, `maxExhaust` | Tiredness and its capacity. |
| `hunger`, `maxHunger` | Nourishment and its capacity. Higher is better fed. |
| `bleeding` | How heavily the body bleeds; 0 when it does not. |
| `consciousness` | 0 is knocked out. |
| `sleeping` | Above 0 means asleep. |
| `drunkenness` | 0 is sober. |
| `poisoning` | 0 is clean. |

These are live numbers, so they answer "how drunk is he" without knowing the
name of any effect. The list of named effects (a particular potion, a
particular poison) is `player.buffs`, covered in [Buffs](../buffs/).

There are no setters. Health, stamina and the rest belong to the owning client;
the server changes them indirectly, for example with a buff or an item.

## Attributes and skills

`strength`, `agility` and `vitality` are the three attributes. `relativeStats`
carries the same three as the engine's relative values, which is what its own
modifiers are expressed in. Both are
[`SoulStats`](../../../reference/server/interfaces/SoulStats.md)-shaped.

`skills` returns all nine combat and survival skills at once as a
[`SoulSkills`](../../../reference/server/interfaces/SoulSkills.md) object:
`fencing`, `survival`, `defense`, `sword`, `heavyWeapons`, `marksmanship`,
`dagger`, `largeWeapons` and `unarmed`. The snapshot carries them together, so
the API does too. `relativeSkills` is the relative form.

```ts
function bestWeaponSkill(player: Player): string {
  const { sword, dagger, heavyWeapons, largeWeapons, marksmanship, unarmed } = player.skills;
  const ranked = Object.entries({ sword, dagger, heavyWeapons, largeWeapons, marksmanship, unarmed })
    .sort((a, b) => b[1] - a[1]);
  return ranked[0]?.[0] ?? "none";
}
```

## Where they are and how they move

`position` and `rotation` come from [`Entity`](../../../reference/server/classes/Entity.md),
like on every other replicated thing. On a player, treat them as read-only and
move the body with `spawn` or `teleport` instead (see [Teleport, kick and other player actions](../actions/)).

| Property | What it is |
| --- | --- |
| `velocity` | The velocity the body's animation was driven by this frame, not what physics settled on. |
| `lookDirection` | World-space direction the head and eyes face. Zero until the body reports one. |
| `inAir` | Fallen or mid-jump, debounced past stair steps. |
| `crouched` | Crouched, as their own crouch action reports it. |
| `moveSpeedTag`, `moveDirTag`, `stanceTag` | Raw animation tag ids for pace, direction and stance. 255 means unset. |
| `physicsProfile` | The ragdoll physics profile, or 255. |

The three tag properties are raw engine ids. They are useful for telling
whether something changed, not for comparing against a named value, because
the names are not part of the API.

`lookDirection` is the one to reach for when you need "what is this player
facing". For example, a rough check that `target` is in front of `player`:

```ts
function isFacing(player: Player, target: Player, minDot = 0.7): boolean {
  const toTarget = new Vector3(
    target.position.x - player.position.x,
    target.position.y - player.position.y,
    target.position.z - player.position.z,
  );
  const length = Math.hypot(toTarget.x, toTarget.y, toTarget.z);
  if (length === 0) return true;
  const look = player.lookDirection;
  const dot = (look.x * toTarget.x + look.y * toTarget.y + look.z * toTarget.z) / length;
  return dot >= minDot;
}
```

## Combat stance

| Property | What it is |
| --- | --- |
| `fistsUp` | Fists or weapon raised. Stays true after the arm comes down, as the engine holds it. |
| `guard` | Arm guard level: 0 arms down, 1 the guard a player holds. |
| `combatZone` | The direction of the combat star they aim at, as a row of the game's zone table, or -1. |

## Gear, mounts and companions

| Property | What it is |
| --- | --- |
| `rightHandItem`, `leftHandItem` | Item class drawn in each hand as 32 hex digits, or `""`. |
| `equipment` | Item classes being worn, as an array of 32-hex-digit strings. |
| `mounted` | Whether they are in a saddle. |
| `horse` | The [`Horse`](../../../reference/server/classes/Horse.md) they ride, or `null`. |
| `dog` | Their dog companion, or `null`. |
| `appearance` | Face, hair, beard and skin. See [Appearance](../appearance/). |

`horse` and `dog` are `null` far more often than not, so always check before
you use them:

```ts
const horse = player.horse;
if (horse) {
  console.log(`${player.nickname} is riding horse ${horse.id}`);
}
```

Item classes are covered in [Give and take items](../inventory/).

## Connection

These come from the framework's [`BasePlayer`](../../../reference/server/classes/BasePlayer.md)
and describe the connection rather than the body:

| Property | What it is |
| --- | --- |
| `nickname` | The name they connected under. Empty once the body is gone. |
| `playerIndex` | Connection slot, reused after they leave. |
| `ping` | Round-trip latency in milliseconds, or -1. |
| `ip` | Remote address, or `""`. |
| `steamId`, `discordId`, `hardwareId` | Identifiers, each `""` when unavailable. |

## Related

- [Teleport, kick and other player actions](../actions/)
- [Buffs](../buffs/)
- [Entity state bags](../../../core-concepts/state/), for your own per-player data
