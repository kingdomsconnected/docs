---
title: Guard a World Builder yard
description: Combine an exported patrol and area so a guard challenges players inside a yard and returns to rounds when they leave.
sidebar:
  label: World Builder sentry
  order: 97
---

Create a guard who patrols an authored route, fights players inside an
authored yard, and resumes patrol when they leave. Moving the yard or route
in World Builder changes the encounter without changing its coordinates in code.

## Before you start

Complete [the village patrol](../world-builder-patrol/) and read
[NPC combat](../../npcs-and-animals/npc-combat/). Use a test server: this
example treats every active player inside the yard as an intruder.
Stop `village-patrol` while trying it so only the sentry is present.

## What you will learn

- Use an exported `Area` as a combat boundary.
- Retain one target instead of replacing the attack every tick.
- Return to a named patrol and delay retries after movement failures.
- Keep cleanup limited to the resource's own NPC and timer.

```text
village-sentry/
  package.json
  tsconfig.json          server configuration from Use TypeScript
  src/server/scene.ts
  src/server/index.ts
```

## 1. Draw the guarded yard

Open the village project from the patrol tutorial. In **Areas**, draw a box
or polygon around the yard, with enough height for standing players.
Set its ID to `village.yard` and leave its virtual-world restriction unset.
Keep every `village.guard` waypoint inside the yard and leave a clear exit.

Save the project, export `village.world.json`, replace the server's copy
and restart. The area is a rule boundary, not a physical barrier. Props
and level walls supply the visible yard.

## 2. Create the resource

Copy the server `tsconfig.json` from [Use TypeScript](../../getting-started/typescript/#2-the-server-program).

```json title="package.json"
{
  "name": "village-sentry",
  "version": "1.0.0",
  "scripts": { "build": "tsc -p tsconfig.json" },
  "devDependencies": {
    "@kingdomsconnected/types": "latest",
    "typescript": "^5.9.2"
  },
  "mafiahub": { "serverScripts": ["dist/server/index.js"] }
}
```

```ts title="src/server/scene.ts"
export function readYard(): { yard: Area; route: PatrolRoute; start: Vector3 } | null {
  const world = WorldResource.find("village");
  const yard = world?.areas.find(area => area.id === "village.yard");
  const route = world?.patrolRoutes.find(route => route.id === "village.guard");
  const first = route?.toJSON()?.points[0];
  if (!yard || !route || !first || !Navigation.ready) {
    console.log("Load village.yard, village.guard and the level navigation mesh.");
    return null;
  }
  return { yard, route, start: first.position };
}
```

## 3. Switch between patrol and combat

This example owns one guard in world 0. Global players can see him too,
so they are eligible targets. Players in other numbered worlds are excluded.
The scan checks current positions, including players already inside when
the resource starts.

```ts title="src/server/index.ts"
import { readYard } from "./scene.js";

const RESOURCE = "village-sentry";
const GLOBAL_WORLD = 4294967295;
let scene: ReturnType<typeof readYard> = null;
let guardId: number | null = null;
let targetId: number | null = null;
let retryAt = 0;
let mode: "idle" | "patrol" | "fight" = "idle";

function resume(guard: Npc): void {
  targetId = null;
  mode = "idle";
  guard.hold();
  if (scene && guard.patrol(scene.route, { pathfinding: "server" })) mode = "patrol";
  else retryAt = Date.now() + 3000;
}

function start(): void {
  scene = readYard();
  if (!scene) return;
  const guard = Npc.create({
    soul: "guard", name: "Yard guard", position: scene.start,
    virtualWorld: 0, interactable: false,
  });
  const valid = Navigation.validatePatrol(scene.route, { actor: guard });
  const armed = guard.wear([...guard.wearing, "c164f346-0463-4116-b790-094b11274e5e"]);
  if (!valid.complete || !armed || !scene.yard.containsPlayer(guard)) {
    guard.remove();
    console.log("Check the guard's route, weapon and first waypoint inside the yard.");
    return;
  }
  guardId = guard.id;
  resume(guard);
}

const timer = setInterval(() => {
  const guard = guardId === null ? null : Npc.getById(guardId);
  if (!scene || !guard || !guard.alive || Date.now() < retryAt) return;
  const eligible = (player: Player): boolean => player.ready && player.canAct
    && (player.virtualWorld === guard.virtualWorld || player.virtualWorld === GLOBAL_WORLD)
    && scene!.yard.enabled && scene!.yard.containsPlayer(player)
    && scene!.yard.containsPlayer(guard)
    && player.position.distance(guard.position) <= 30;
  const current = targetId === null ? null : Player.getById(targetId);
  if (current && eligible(current) && guard.intent === "attack"
      && guard.status !== "blocked" && guard.status !== "failed") return;

  if (mode === "fight") {
    resume(guard);
    retryAt = Date.now() + 3000;
    return;
  }
  const candidate = Player.all().filter(eligible)
    .sort((a, b) => a.position.distance(guard.position) - b.position.distance(guard.position))[0];
  if (candidate && guard.attack(candidate)) {
    targetId = candidate.id;
    mode = "fight";
  } else if (mode === "idle") resume(guard);
}, 500);

Events.on("patrolFinished", (guard, info) => {
  if (guard.id !== guardId || info.status !== "failed") return;
  mode = "idle";
  retryAt = Date.now() + 3000;
});

Events.on("resourceStop", name => {
  if (name !== RESOURCE) return;
  clearInterval(timer);
  const id = guardId;
  guardId = null;
  if (id !== null) Npc.getById(id)?.remove();
});

if (WorldResource.ready) start();
else Events.once("worldResourcesReady", start);
```

The 30-metre detection distance, half-second scan and three-second retry
are this encounter's rules. A lost, dead, out-of-world or out-of-area target
ends pursuit. The guard also stops attacking when he leaves the area.
This is checked twice per second, so the boundary is not a physical stop.

`attack` replaces the patrol. On return, `patrol` starts a fresh copy of the
route at waypoint zero; it does not resume the interrupted waypoint. The
return can still fail if a door locks or an obstacle blocks the path.

## Try it

1. Run `pnpm install` and `pnpm build`, then `ensure village-sentry` in the
   server console. Join in world 0 or the default global world.
2. Stay outside the yard. The guard patrols.
3. Enter the yard within 30 metres. The guard draws his weapon and attacks.
4. Leave the yard. Within the next scan he stops pursuing and returns to
   his route. Re-enter after the short retry delay to start another encounter.
5. Run `ensure village-sentry` again. Exactly one new guard replaces the old
   one; the area and route are still available.

The guard can die. His corpse stays until this resource stops or reloads;
there is no automatic respawn in this example. Test with two players so
target retention and damage are visible from both sides.

## Next steps

Add a faction or permission check to `eligible` for guards who admit
residents. Use a wider second area as a pursuit boundary. For predators,
switch to a wolf soul, remove human equipment and follow
[Animal populations](../../npcs-and-animals/animals/) for respawn policy.
