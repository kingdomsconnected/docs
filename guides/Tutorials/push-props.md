---
title: Push props with the physics API
description: Spawn a rigid barrel, kick, launch, freeze and reset it, hear where it comes to rest, and react when a player's weapon hits the world.
sidebar:
  label: Push props
  order: 99.4
---

A prop with `rigid` physics falls, rolls and can be knocked over. Server
scripts can also push it, stop it and put it back, and find out where it
came to rest. You will spawn a barrel in front of a player, kick it across
the ground with `/kick`, and then react when a player's weapon hits the
world.

:::note[Before you start]
- A server and game on Kingdoms Connected 1.7.2 or later.
- [Use TypeScript](../../getting-started/typescript/).
- [Spawn props and objects](../../world/props/), [Rigid props and weapon hits](../../world/prop-physics/), and [Raycasts](../../world/raycasts/) for the fields of a hit.

Difficulty: beginner. Time: about 25 minutes.
:::

## What you will learn

- Spawning a `rigid` prop and giving it a mass.
- Pushing it with `applyImpulse` and `setVelocity`, stopping it with
  `sleep`, letting it fall with `wake` and putting it back with
  `resetPhysics`.
- Hearing where it came to rest with `propRest`.
- Reacting to a player's weapon striking the world with `playerWeaponHit`.

```text
barrel-physics/
  package.json
  tsconfig.json            from Use TypeScript
  src/server/
    barrel.ts              spawns the barrel in front of a player
    commands.ts            /barrel, /kick, /launch, /freeze, /fall, /reset
    rest.ts                propRest
    hits.ts                playerWeaponHit
    index.ts               wiring
```

:::note[Who moves the barrel]
The server does not run physics itself. One player's game does it for
everyone: the game of the nearest player within 60 m of the prop. That
player keeps the prop until they are 90 m away, and then the next nearest
player takes over. Their game moves the prop and sends its position to the
server, and every other player sees it where that game says.

So with nobody within 60 m, a rigid prop stays where it last stopped, and
pushing it does nothing. And only the player whose game runs the prop
pushes it by walking into it. To everyone else it is solid, but does not
move until that player's game moves it.
:::

## 1. Write the manifest

Create `resources/barrel-physics` and copy the server `tsconfig.json` from
[Use TypeScript](../../getting-started/typescript/#2-the-server-program).

```json title="package.json"
{
  "name": "barrel-physics",
  "version": "1.0.0",
  "scripts": { "build": "tsc -p tsconfig.json" },
  "devDependencies": {
    "@kingdomsconnected/types": "latest",
    "typescript": "^5.9.2"
  },
  "mafiahub": { "serverScripts": ["dist/server/index.js"] }
}
```

## 2. Spawn a rigid barrel

`Prop.spawn(model, position, rotation, scale, physics, virtualWorld)`
creates a prop. Pass `"rigid"` as the physics:

```ts title="src/server/barrel.ts"
const BARREL = "objects/manmade/common_furniture/barrels/barrel_a.cgf";
let current: Prop | null = null;

export function barrel(): Prop | null {
  return current;
}

/** The direction the player is looking, flattened onto the ground, or null before their game has reported one. */
export function facing(player: Player): { x: number; y: number } | null {
  const look = player.lookDirection;
  const length = Math.hypot(look.x, look.y);
  return length > 0 ? { x: look.x / length, y: look.y / length } : null;
}

/** Replaces the barrel with a new one 2 m ahead of the player and half a metre up, so it drops to the ground. */
export function spawnBarrel(player: Player, ahead: { x: number; y: number }): Prop {
  current?.destroy();
  const p = player.position;
  const at = new Vector3(p.x + ahead.x * 2, p.y + ahead.y * 2, p.z + 0.5);
  current = Prop.spawn(BARREL, at, undefined, undefined, "rigid", player.virtualWorld);
  current.mass = 40;
  return current;
}
```

`mass` is in kilograms. A prop normally takes its mass from its collision
mesh. Setting it yourself makes the numbers below predictable, and it is
required for meshes that carry no mass, such as trees: a rigid prop without
a mass is refused. Setting `mass` rebuilds the prop for every player, so set
it straight after `Prop.spawn`, before you push it.

## 3. Push it, stop it and put it back

```ts title="src/server/commands.ts"
import { barrel, facing, spawnBarrel } from "./barrel.js";

export function onCommand(player: Player, command: string): void {
  const ahead = facing(player);
  if (command === "barrel") {
    if (ahead) spawnBarrel(player, ahead);
    return;
  }

  const prop = barrel();
  if (!prop) return;
  switch (command) {
    case "kick": {
      if (!ahead) return;
      const sent = prop.applyImpulse(new Vector3(ahead.x * 200, ahead.y * 200, 60));
      if (!sent) Chat.sendToPlayer(player, "Nobody is close enough to the barrel to move it.");
      break;
    }
    case "launch":
      prop.setVelocity(new Vector3(0, 0, 8)); // straight up at 8 m/s
      break;
    case "freeze":
      prop.sleep(); // stops it where it is, even in mid-air
      break;
    case "fall":
      prop.wake(); // lets it fall again
      break;
    case "reset":
      prop.resetPhysics(); // puts it back where it was spawned
      break;
  }
}
```

- `prop.applyImpulse(impulse, point, angularImpulse)` pushes the prop. The
  impulse is in kg·m/s, in world space. The prop's speed changes by the
  impulse divided by its mass, so 200 on a 40 kg barrel gives it 5 m/s.
  `/kick` sends the barrel rolling the way you are looking, with a little
  lift.
- Pass `point`, a position on the prop away from its centre, and the push
  also turns it. That is how you topple a tall prop.
- `prop.setVelocity(velocity, angularVelocity)` sets a speed directly,
  whatever the prop weighs.
- A prop stopped with `sleep()` starts moving again when something hits it
  or a script pushes it.

| Call | Returns `false`, and does nothing, when |
| --- | --- |
| `applyImpulse`, `setVelocity`, `wake`, `sleep` | The prop is gone, or its physics is not `rigid`. A value is not a finite number, or is too large: an impulse over 10,000,000, a velocity over 200 m/s or a spin over 100 rad/s. No player is within 60 m to run the prop. |
| `resetPhysics` | The prop is gone, or is not `rigid`. |

## 4. Find out where it stopped

The server raises `propRest` whenever a rigid prop comes to rest, however
it moved: a push, a fall, or a player walking into it.

```ts title="src/server/rest.ts"
import { barrel } from "./barrel.js";

export function installRest(): void {
  Events.on("propRest", (prop, position) => {
    if (prop.id !== barrel()?.id) return;
    console.log(`The barrel stopped at ${position.x.toFixed(1)}, ${position.y.toFixed(1)}`);
  });
}
```

`sleep()` raises it as soon as the prop stops. `resetPhysics()` does not
raise it.

To keep a prop where it landed for good, set `prop.physics = "static"` in
this handler. It then stays solid but can no longer be pushed.

## 5. React to weapon hits

When a player's swing hits something solid that is not a body (a tree, a
wall, a rock, a prop or the ground), the server raises `playerWeaponHit`.
The hit describes what was struck in the same way as a ray trace:

```ts title="src/server/hits.ts"
export function installWeaponHits(): void {
  Events.on("playerWeaponHit", (player, hit) => {
    const what = hit.category ?? hit.kind;
    console.log(`${player.nickname} hit ${what} (${hit.surface}) at ${hit.position.x.toFixed(1)}, ${hit.position.y.toFixed(1)}`);
  });
}
```

- `category` is `tree`, `bush`, `plant` or `rock` for the game's natural
  objects, and `null` for anything else.
- `surface` is what the thing is made of, such as `mat_wood` or `mat_rock`.
- `levelObject` names the object the level placed, in the form
  `LevelEdit.apply` takes. See
  [Swap a level object for another mesh](../swap-level-objects/).

Each object is reported once per swing, at the first contact. Fists and
kicks are not reported, and neither are hits on players, NPCs or animals:
`playerHit` and the damage events cover those.

The report comes from the swinging player's game. The server only checks
that the point is within 8 m of the player, and accepts at most 16 reports
a second from one player. Do not hand out anything valuable on a single
report without your own checks. A client script on the swinging player's
game receives the same hit as the `weaponHit` event first, for local effects
such as a sound.

## 6. Wire it up

```ts title="src/server/index.ts"
import { onCommand } from "./commands.js";
import { installWeaponHits } from "./hits.js";
import { installRest } from "./rest.js";

installRest();
installWeaponHits();

Events.on("playerCommand", (player, command) => onCommand(player, command));
```

The barrel is an entity this resource spawned, so it goes when the resource
stops. Props are kept in memory only: spawn them again when the server
starts, or place them in a World Builder world resource.

:::caution[Limits]
- When the player running a prop changes while it moves, the new player's
  game starts it from where it was, at rest. A fall can pause for a moment.
- The server accepts the resting position a game reports if it lies within
  100 m of where the prop last rested or was spawned. A prop reported
  farther away is put back and raises nothing.
:::

## Try it

1. Run `npm install` and `npm run build`, then `ensure barrel-physics` in
   the server console.
2. Type `/barrel`. A barrel appears 2 m in front of you, about half a metre
   above your feet, and drops to the ground.
3. Type `/kick`. The barrel rolls away the way you are looking. When it
   stops, the server console says where.
4. Type `/launch`, then `/freeze` while the barrel is in the air. It hangs
   there. `/fall` drops it again.
5. Type `/reset`. The barrel is back where it was spawned, and the console
   says nothing.
6. Draw a sword or an axe and hit a tree. The console names what you hit
   and its surface.

## Next steps

- The default gamemode fells beeches, lindens and pines after three axe
  blows. It counts `playerWeaponHit` reports per tree, swaps the tree for
  its stump with `LevelEdit.apply`, spawns a rigid copy of the tree with a
  mass of 500 kg, and tips it over with `setVelocity`. When `propRest`
  reports the trunk has landed, it makes the trunk static. Read its
  `src/server/woodcutting.ts` for the whole thing.
- Swap level objects from a script with
  [Swap a level object for another mesh](../swap-level-objects/).
- Every rule for rigid props is in
  [Rigid props and weapon hits](../../world/prop-physics/), and every call in
  the [`Prop` reference](../../reference/server/classes/Prop.md#applyimpulse).
