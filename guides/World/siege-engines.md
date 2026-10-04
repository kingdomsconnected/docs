---
title: Build and fire siege engines
description: Spawn trebuchets and cannons, load and fire them at a point, let players work them from the game's own hint, and react to where the shot lands.
sidebar:
  label: Siege engines
  order: 47.5
---

A [`SiegeEngine`](../../reference/server/classes/SiegeEngine.md) is a
trebuchet or a cannon the server builds, loads and fires. Every nearby player
sees it work, sees the projectile fly along the same arc, and sees where it
lands, and the blast hurts the players and NPCs it lands on.

```ts
const at = player.position;
const trebuchet = SiegeEngine.spawn("trebuchet", new Vector3(at.x, at.y + 15, at.z));
trebuchet.speed = 10; // a crew ten times the game's pace
trebuchet.load();

Events.on("siegeEngineReady", (engine) => {
  if (engine.id !== trebuchet.id) return;
  const shot = engine.fire(new Vector3(at.x, at.y + 200, at.z), player);
  if (!shot.accepted) console.log(`The ${engine.kind} ${shot.reason}`);
});
```

## Spawn an engine

`SiegeEngine.spawn(kind, position, rotation?, virtualWorld?)` builds an
unloaded engine. `kind` is `trebuchet` or `cannon`; the game ships no
catapult and no ballista. `rotation` is a Quaternion or Euler degrees, and
`fire` and `aim` turn the engine to face their target anyway.

The trebuchet is the game's own model and plays its own winch, load and fire
animations. The cannon is the game's static gun.

| Kind | Closest shot | Furthest shot | `range` | `damage` | `damageRadius` |
| --- | --- | --- | --- | --- | --- |
| `trebuchet` | 40 m | 350 m | 150 m | 150 | 6 m |
| `cannon` | 10 m | 600 m | 120 m | 120 | 4 m |

Ranges are distances along the ground, and `minRange` and `maxRange` read them
from the engine. A target whose flight would last over 30 seconds is too far
as well.

## Load and fire

`load()` starts the cycle of an idle engine; `siegeEngineReady` fires when it
can shoot. At the game's own pace (`speed` 1) a trebuchet's crew takes nearly
two minutes, and `loadDuration` says how long it takes at the engine's speed.
`speed` runs from 0.1 to 20, and changing it mid-step carries on from where the
engine has got to.

`fire(target, attacker?)` turns a loaded engine to the target and shoots.
`attacker` (a player or their id) is credited with whatever it hits, in
`playerDamage`, `npcDamage` and `siegeImpact`. The projectile leaves partway
through the shot, after `seconds`, which raises `siegeFire`.

Before firing, test a point or show where the engine will shoot:

```ts
const cannon = SiegeEngine.spawn("cannon", player.position, new Vector3(0, 0, 90), player.virtualWorld);
const target = new Vector3(player.position.x + 80, player.position.y, player.position.z);

const why = cannon.canHit(target); // "" when it can reach the point
if (why === "") cannon.aim(target); // turn without shooting
```

`load`, `fire` and `aim` return a [`SiegeResult`](../../reference/server/interfaces/SiegeResult.md):

| Field | What it is |
| --- | --- |
| `accepted` | Whether the engine did it. |
| `reason` | Empty when it did; otherwise a phrase that reads after the engine's name. |
| `seconds` | For `load` the whole load, for `fire` until the projectile is let go. 0 when nothing happened. |

`cycle` says where an engine is: `idle`, `drawing` (a trebuchet's arm being
winched down), `loading`, `ready` or `firing`. `loaded` is true while it is
`ready`.

## Let players work it

Set `usable` and every player within 12 m of the engine gets the game's own
action hint on the use key: **Load** while it is idle, **Fire** while it is
loaded, nothing while it is busy. A press raises `siegeEngineUse`, and unless a
handler returns `false` the engine loads, or fires `range` metres along the
player's facing with the player as the attacker.

```ts
const engine = SiegeEngine.spawn("trebuchet", player.position);
engine.usable = true;
engine.range = 200; // kept between minRange and maxRange

Events.on("siegeEngineUse", (user, used, action) => {
  if (action === "fire" && user.virtualWorld !== 0) return false; // no shots outside the main world
});
```

A handler that works the engine itself (to fire at a target of its own
choosing) should return `false`, so the engine is not worked twice.

## Damage and impact

`damage` is the health taken at the point of impact, where a player has 100. A
quarter of it reaches the edge of `damageRadius` (up to 100 m). Set `damage` to
0 and decide hits yourself in `siegeImpact`.

The server does not load the level, so the player nearest the target reports
where the projectile came down, and the server checks that against the arc it
was thrown on. With nobody near, it lands on the target. Walls do not break.

## React to events

| Event | Arguments | When |
| --- | --- | --- |
| `siegeEngineSpawn` | `engine` | Right after an engine is built. |
| `siegeEngineReady` | `engine` | A load finished and the engine can fire. |
| `siegeEngineUse` | `player`, `engine`, `action` | A player pressed the hint, `load` or `fire`. Return `false` to refuse. |
| `siegeFire` | `engine`, `attacker`, `target` | The projectile is let go. `attacker` may be `null`. |
| `siegeImpact` | `engine`, `position`, `attacker` | It came down. Damage is already dealt. `engine` is `null` if it was destroyed meanwhile. |
| `siegeEngineDestroy` | `engine` | While an engine is removed. The handle still reads. |

## Virtual worlds and cleanup

An engine belongs to the virtual world it was spawned in. Only players in that
world see it and its shots, can use its hint, or take its damage. See
[Virtual worlds](../../core-concepts/virtual-worlds/).

```ts
SiegeEngine.all(3);        // the engines in virtual world 3; omit for every one
SiegeEngine.getById(12);   // one engine, or null
SiegeEngine.destroyAll(3); // remove them; returns the count
```

`engine.destroy()` removes one; a projectile already in the air still lands. A
stopped resource does not remove its engines, so track yours as on
[Props](../props/#clean-up-when-your-resource-stops).

## When a call fails

| Call | Fails when | Result |
| --- | --- | --- |
| `SiegeEngine.spawn` | `kind` is not `trebuchet` or `cannon`. | **Throws.** |
| `load`, `fire`, `aim`, `canHit` | The engine has been destroyed. | **Throws.** |
| `load` | It is not idle. | `is already loaded`, `is already being loaded`, `is still firing` |
| `fire` | It is not ready, or cannot reach. | `is not loaded`, `is still loading`, `is already firing`, `cannot fire: ` and the `canHit` reason |
| `aim` | It is mid-shot. | `is firing` |
| `canHit` | The point is out of reach. | `the target is closer than the engine can throw`, `the target is further than the engine can throw`, `the target is too high for the engine's arc` |

A player who arrives in range after a shot was launched does not see that
projectile.

:::tip[Try it]
The default gamemode's `/siege trebuchet` or `/siege cannon` builds a usable
engine in front of you (`src/server/commands/siege.ts`). `/siege load`,
`/siege fire [distance]`, `/siege fire at <player id>`, `/siege speed`,
`/siege list`, `/siege remove` and `/siege clear` cover the rest.
:::

## Related

- [Props](../props/), for the tracking pattern on cleanup
- [Virtual worlds](../../core-concepts/virtual-worlds/)
- [SiegeEngine reference](../../reference/server/classes/SiegeEngine.md)
