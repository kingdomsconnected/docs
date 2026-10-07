---
title: Script an NPC cutscene
description: Two NPCs play a short scene in front of one player, driven by a state machine on npcIntentDone and pinned to that player's client.
sidebar:
  label: NPC cutscene
  order: 93
---

You will build `/scene`: two townsfolk appear a few metres in front of you, Vendel walks over to Marketa, they trade a few lines over their heads, and he walks back to where he started.

:::note[Before you start]
- [Write your first resource](../../getting-started/first-resource/) and [Use TypeScript](../../getting-started/typescript/).
- [Spawn NPCs](../../npcs-and-animals/npcs/) and [Move NPCs: walk, follow, patrol](../../npcs-and-animals/npc-orders/).

Difficulty: intermediate. Time: about 30 minutes.
:::

## What you will learn

- Spawning named NPCs with [`Npc.create`](../../npcs-and-animals/npcs/) and making them talk with `say`.
- Giving [orders](../../npcs-and-animals/npc-orders/) with `moveTo` and `lookAt`, and waiting for `npcIntentDone`.
- Writing a scene as an editable list of steps, run by a small state machine.
- Pinning NPCs to one player's client with [`pin`](../../reference/server/classes/Npc.md#pin).
- Ending early on [`npcDestroy`](../../npcs-and-animals/npc-events/), a disconnect or `resourceStop`.

```text
scripted-scene/
  package.json
  tsconfig.json          from Use TypeScript
  src/server/
    index.ts             /scene and cleanup
    place.ts             ground position and facing helpers
    steps.ts             the scene, one function per step
    scene.ts             the state machine
```

This is the default gamemode's `/npcdemo scene` (`startScene` and `advanceScene` in `src/server/commands/npcdemo.ts`), rewritten so the scene is a list you can edit.

## 1. Write the manifest

It is all server code.

```json title="package.json"
{
  "name": "scripted-scene",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc -p tsconfig.json"
  },
  "devDependencies": {
    "@kingdomsconnected/types": "1.6.2",
    "typescript": "^5.9.2"
  },
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"]
  }
}
```

## 2. Place the stage

Two helpers: a point on the ground ahead of the player, and a yaw-only rotation facing a direction. Z is up, and an unrotated entity faces +Y ([Positions, rotations and vectors](../../core-concepts/math/)).

```ts title="src/server/place.ts"
/** `distance` metres ahead of the player, on the ground plane. */
export function aheadOf(player: Player, distance: number): Vector3 {
  const facing = (player.rotation as Quaternion).rotateVector(new Vector3(0, 1, 0));
  const length = Math.hypot(facing.x, facing.y) || 1;
  const from = player.position;
  return new Vector3(from.x + (facing.x / length) * distance, from.y + (facing.y / length) * distance, from.z);
}

/** The rotation that faces along (x, y) on the ground. */
export function facing(x: number, y: number): Quaternion {
  return Quaternion.fromAxisAngle(new Vector3(0, 0, 1), Math.atan2(-x, y));
}
```

## 3. Write the scene as steps

NPC orders do not block and have no callback, so each step issues its orders and says how it ends: `"walk"` waits for Vendel's `npcIntentDone`, and a number waits that many milliseconds. Changing the scene is an edit to this array and nothing else.

```ts title="src/server/steps.ts"
export interface Cast {
  readonly actor: Npc;
  readonly partner: Npc;
  readonly home: Vector3;
}

export type Step = (cast: Cast) => "walk" | number;

export const STEPS: Step[] = [
  ({ actor, partner }) => {
    partner.lookAt(actor);
    actor.moveTo(partner.position, { speed: "walk", radius: 2.5 });
    return "walk";
  },
  ({ actor, partner }) => {
    actor.lookAt(partner);
    actor.say("Marketa. They say the road past the mill is not safe after dark.");
    return 4000;
  },
  ({ partner }) => {
    partner.say("Then do not walk it after dark, Vendel.");
    return 4000;
  },
  ({ actor }) => {
    actor.say("As you say. Good night to you.");
    return 2500;
  },
  ({ actor, home }) => {
    actor.moveTo(home, { speed: "walk", radius: 2 });
    return "walk";
  },
];
```

- An NPC holds one intent: a second order replaces the first, and `npcIntentDone` then reports the second. So each step gives Vendel at most one order.
- `say` is not an intent, so it can go out beside any order.

## 4. Run the steps

`scene.ts` holds the running scene, walks the list, and cleans up when an actor or the viewer goes away.

```ts title="src/server/scene.ts"
import { facing } from "./place.js";
import { STEPS } from "./steps.js";

interface Scene {
  readonly viewer: number;
  readonly actor: number;
  readonly partner: number;
  readonly home: Vector3;
  step: number;
  waiting: "walk" | "timer";
  timer: Timeout | undefined;
}

let scene: Scene | null = null;

/** Every NPC this resource made, running or not, so it can clean up after itself. */
const cast = new Set<number>();

export function isRunning(): boolean {
  return scene !== null;
}

export function startScene(viewer: Player, stage: Vector3): void {
  const actor = Npc.create({ soul: "townsman", name: "Vendel", nametag: true, position: new Vector3(stage.x - 4, stage.y, stage.z), rotation: facing(1, 0) });
  const partner = Npc.create({ soul: "townswoman", name: "Marketa", nametag: true, position: new Vector3(stage.x + 4, stage.y, stage.z), rotation: facing(-1, 0) });
  cast.add(actor.id).add(partner.id);

  // The viewer's client runs both bodies, so the timing is theirs.
  actor.pin(viewer);
  partner.pin(viewer);

  scene = { viewer: viewer.id, actor: actor.id, partner: partner.id, home: actor.position, step: 0, waiting: "timer", timer: undefined };
  next();
}

/** Runs the next step, or ends the scene when there is none. */
function next(): void {
  if (!scene) return;
  const actor = Npc.getById(scene.actor);
  const partner = Npc.getById(scene.partner);
  const step = STEPS[scene.step];
  if (!actor || !partner || !step) return endScene();

  scene.step += 1;
  const ends = step({ actor, partner, home: scene.home });
  if (ends === "walk") {
    scene.waiting = "walk";
  } else {
    scene.waiting = "timer";
    scene.timer = setTimeout(next, ends);
  }
}

/** Stops the scene and hands both actors back to the normal election. */
export function endScene(): void {
  if (!scene) return;
  clearTimeout(scene.timer);
  Npc.getById(scene.actor)?.pin(null);
  Npc.getById(scene.partner)?.pin(null);
  scene = null;
}

/** Ends the scene and removes every actor it ever spawned. */
export function clearStage(): number {
  endScene();
  let removed = 0;
  for (const id of cast) {
    const npc = Npc.getById(id);
    if (npc) {
      npc.remove();
      removed += 1;
    }
  }
  cast.clear();
  return removed;
}

export function installSceneHandlers(): void {
  Events.on("npcIntentDone", (npc, status) => {
    // Only Vendel's walks move the scene on; anything else he reports is ignored.
    if (!scene || npc.id !== scene.actor || scene.waiting !== "walk") return;
    if (status === "failed") {
      console.log(`scene: ${npc.name} could not carry out step ${scene.step}; ending it`);
      return endScene();
    }
    // "blocked" means he stopped making progress. For a scene, carrying on from where he stands is fine.
    next();
  });

  Events.on("npcDestroy", (npc) => {
    cast.delete(npc.id);
    if (scene && (npc.id === scene.actor || npc.id === scene.partner)) endScene();
  });

  Events.on("playerDisconnect", (player) => {
    if (scene?.viewer === player.id) clearStage();
  });
}
```

- `scene.waiting` stops an `npcIntentDone` from skipping ahead during a talking step (his `lookAt` may report one). The event only counts while the scene waits on a walk.
- Actors are looked up by id at every step, never held: another resource or a console command can remove an NPC at any moment.
- Without `pin`, the server gives each NPC to the nearest client, and a player walking past could take Vendel over mid-sentence. Pinned, he stays with the viewer's client, going dormant if the viewer walks out of range. `pin(null)` hands him back.

:::caution
Without the navigation mesh on the server, Vendel walks straight at each mark and does not path around anything. Stage a scene on open, flat ground, or install the mesh ([`mod.navmesh`](../../hosting-a-server/server-json/#modnavmesh)); otherwise he walks into a fence and reports `blocked`.
:::

## 5. Add the command

The entry point starts and stops the scene, and removes the actors when the resource stops.

```ts title="src/server/index.ts"
import { aheadOf } from "./place.js";
import { clearStage, installSceneHandlers, isRunning, startScene } from "./scene.js";

const RESOURCE = "scripted-scene";

installSceneHandlers();

Events.on("playerCommand", (player, command, args) => {
  if (command !== "scene") return;

  if (args[0] === "stop") {
    Chat.sendToPlayer(player, `Removed ${clearStage()} actor(s).`);
    return;
  }
  if (isRunning()) {
    Chat.sendToPlayer(player, "A scene is already running. /scene stop clears it.");
    return;
  }
  if (!player.ready) {
    Chat.sendToPlayer(player, "Your position has not reached the server yet. Try again in a moment.");
    return;
  }

  clearStage(); // Actors left standing by the last scene.
  startScene(player, aheadOf(player, 7));
  Chat.sendToPlayer(player, "Watch: Vendel is walking over to Marketa.");
});

// Timers and handlers go with the resource. NPCs do not.
Events.on("resourceStop", (name) => {
  if (name === RESOURCE) clearStage();
});
```

## Try it

Build the resource and run `ensure scripted-scene` in the server console. In game, stand on open ground and type `/scene`. Vendel walks to Marketa, three lines appear over their heads a few seconds apart, and he walks back. `/scene` again replaces the old pair with a new one, and `/scene stop` removes them.

To watch the pinning, add this to `index.ts` and have a second player stand nearer the actors than you. While the scene runs every line names you; once it ends and the pins come off, the actors can move to the nearer player.

```ts
Events.on("npcSimulatorChange", (npc, player) => {
  console.log(`${npc.name} is now run by ${player ? player.nickname : "nobody"}`);
});
```

## Next steps

- Add a step type that waits for the viewer to press use on an actor, with `npcInteract` from [NPC damage, death and interaction](../../npcs-and-animals/npc-events/).
- Swap `moveTo` for a patrol or follow order from [Move NPCs](../../npcs-and-animals/npc-orders/).
- Show a HUD line for each spoken line with [HUD messages, nametags and compass](../../user-interface/hud/).
- Give an NPC a shop instead of a script in [Build an NPC shop](../market-stall/).
