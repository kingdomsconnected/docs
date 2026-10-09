---
title: Build a village patrol with World Builder
description: Draw a patrol, export a village scene, and start a guard from its named route with validation and reload cleanup.
sidebar:
  label: World Builder patrol
  order: 96
---

Build a village scene in World Builder and give it a walking guard. The
route stays in the project, so moving a checkpoint needs no code changes.

## Before you start

Use the TypeScript setup from [Use TypeScript](../../getting-started/typescript/).
Install the level's [navigation mesh](../../hosting-a-server/server-json/#modnavmesh)
on the server. This tutorial uses Kuttenberg and world 0.

## What you will learn

- Author and preview a route in World Builder.
- Wait for the exported scene on startup and resource reload.
- Validate a route for a human NPC before starting it.
- Remove the guard without removing the server's exported scene.

```text
server/
  server.json
  worlds/village.world.json
  files/kutnohorsko/recast.pak
  resources/village-patrol/
    package.json
    tsconfig.json
    src/server/scene.ts
    src/server/index.ts
```

## 1. Draw the village and its route

1. Start an offline Kuttenberg project. Choose an open path near a village
   and place any props or effects you want around it. Leave walking space.
2. In **Patrols**, make a route with ID `village.guard`. Add three or more
   ground waypoints. Choose **Ping pong**, **walk**, and a two-second wait.
3. Preview it with a human NPC. Move points that cannot be reached.
4. Save `village.project.json`. Set **Resource name** to `village` and
   export `village.world.json` into the server's `worlds` folder.

Keep the project on your editing machine. The server loads the export:

```json title="server.json"
{
  "mod": {
    "level": "kutnohorsko",
    "world_resources": ["worlds/village.world.json"]
  }
}
```

Merge these settings into your existing file. Restart the server after
changing an export. Preview can unlock local doors; the server guard cannot,
so use unlocked passages or set your server's door rules explicitly.

## 2. Set up the resource

Create `resources/village-patrol`. Copy the server `tsconfig.json` from
[Use TypeScript](../../getting-started/typescript/#2-the-server-program),
then add this manifest:

```json title="package.json"
{
  "name": "village-patrol",
  "version": "1.0.0",
  "scripts": { "build": "tsc -p tsconfig.json" },
  "devDependencies": {
    "@kingdomsconnected/types": "latest",
    "typescript": "^5.9.2"
  },
  "mafiahub": { "serverScripts": ["dist/server/index.js"] }
}
```

## 3. Read the exported route

Keep the scene's names in one file. Read the route from this export rather
than creating a second definition with the same ID.

```ts title="src/server/scene.ts"
export function readPatrol(): { route: PatrolRoute; start: Vector3 } | null {
  const world = WorldResource.find("village");
  const route = world?.patrolRoutes.find(route => route.id === "village.guard");
  const first = route?.toJSON()?.points[0];
  if (!route || !first) {
    console.log("Export village.guard in village.world.json and restart the server.");
    return null;
  }
  if (!Navigation.ready) {
    console.log("Install Kuttenberg's recast.pak before starting the patrol.");
    return null;
  }
  return { route, start: first.position };
}
```

Starting at the first waypoint avoids an untested approach from a separate
spawn point. `validatePatrol` checks the route's legs, not that approach.

## 4. Spawn and own the guard

```ts title="src/server/index.ts"
import { readPatrol } from "./scene.js";

const RESOURCE = "village-patrol";
let guardId: number | null = null;

function start(): void {
  if (guardId !== null) return;
  const scene = readPatrol();
  if (!scene) return;
  const guard = Npc.create({
    soul: "guard", name: "Guard Radim", position: scene.start,
    virtualWorld: 0, invulnerable: true, interactable: false,
  });
  const validation = Navigation.validatePatrol(scene.route, { actor: guard });
  if (!validation.available || !validation.complete) {
    guard.remove();
    console.log("The guard's route has an unreachable leg. Check points and door locks.");
    return;
  }
  guardId = guard.id;
  if (!guard.patrol(scene.route, { pathfinding: "server" })) {
    guardId = null;
    guard.remove();
    console.log("The guard refused its patrol.");
  }
}

Events.on("patrolWaypoint", (actor, info) => {
  if (actor.id !== guardId) return;
  console.log(`Guard waypoint ${info.waypointIndex + 1}: ${info.status}`);
});

Events.on("patrolFinished", (actor, info) => {
  if (actor.id === guardId) console.log(`Guard patrol ended: ${info.status}`);
});

Events.on("resourceStop", name => {
  if (name !== RESOURCE) return;
  const id = guardId;
  guardId = null;
  if (id !== null) Npc.getById(id)?.remove();
});

if (WorldResource.ready) start();
else Events.once("worldResourcesReady", start);
```

The readiness check works both at server startup and after `ensure` reloads
the resource. The stop handler removes only this guard. Exported props,
areas and the route belong to the server and remain loaded.

## Try it

1. In the resource folder, run `npm install` and `npm run build`.
2. In the server console, run `ensure village-patrol`.
3. Join and walk to waypoint one. A player in world 0 or the global world
   sees Radim walk the route and wait at each point. Check the server log
   for waypoint outcomes.
4. Run `ensure village-patrol` again. The old guard disappears and one new
   guard starts. The exported scenery remains.
5. Move a waypoint in World Builder, save, export, replace the server file
   and restart. Start the resource again; the guard follows the edited path.

If no guard appears, check the export name, route ID, loaded navigation mesh,
virtual world and server messages. A valid mesh path does not prove every
placed prop leaves enough room: test the actual walk with your final scenery.
Add `village-patrol` to your server's `resources` list for automatic startup.

## Next steps

- Give the guard a protected area in [Guard a World Builder yard](../world-builder-sentry/).
- Turn a route into [an NPC walking tour](../world-builder-tour/).
- Use an animal soul and validate with that actor to patrol a field.
- Read [named patrols](../../npcs-and-animals/patrol-routes/) for route edits,
  per-waypoint settings and failure events.
