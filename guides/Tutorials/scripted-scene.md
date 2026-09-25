---
title: Script an NPC cutscene
description: Two NPCs play a short scene in front of one player, driven by a state machine on npcIntentDone and pinned to that player's client.
sidebar:
  order: 93
---

An NPC order like `moveTo` does not block and has no callback. The server sends it to whichever client is simulating the NPC, and some time later raises `npcIntentDone` with how it went. A scene of several steps is therefore a state machine: each step issues an order, and the event (or a timer, for steps that are just talking) moves it to the next one.

You will build `/scene`. Two townsfolk appear a few metres in front of you. Vendel walks over to Marketa, they trade a few lines, and he walks back to where he started. Both actors are pinned to your client for the length of the scene.

This is the default gamemode's `/npcdemo scene` (`startScene` and `advanceScene` in `src/server/commands/npcdemo.ts`), rewritten so that the scene is a list of steps you can edit.

```text
scripted-scene/
  package.json
  tsconfig.json
  types/runtime.d.ts
  src/server/
    index.ts
    place.ts
    steps.ts
    scene.ts
```

`tsconfig.json` and `types/runtime.d.ts` are the ones from [Use TypeScript](../../getting-started/typescript/).

## 1. The manifest

```json title="package.json"
{
  "name": "scripted-scene",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc -p tsconfig.json"
  },
  "devDependencies": {
    "typescript": "^5.9.2"
  },
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"]
  }
}
```

## 2. Placing the stage

Two helpers: a point on the ground ahead of the player, and a yaw-only rotation that faces a direction. Z is up, and an unrotated entity faces +Y.

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

## 3. The scene as a list of steps

Each step gets the cast, issues what it needs to, and says how it ends: `"walk"` means "wait for Vendel's `npcIntentDone`", and a number means "wait that many milliseconds". Reordering the scene, or adding a line or another walk, is an edit to this array and nothing else.

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

:::note[One order at a time]
An NPC holds one intent. A second order replaces the first, and the `npcIntentDone` you then get is about the second. That is why each step gives Vendel at most one order. Speech is not an intent: `say` is a one-shot, so it can go out beside any order.
:::

## 4. The machine

`scene.ts` holds the running scene and walks the list.

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
  timer: number;
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

  scene = { viewer: viewer.id, actor: actor.id, partner: partner.id, home: actor.position, step: 0, waiting: "timer", timer: -1 };
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

A few details carry the weight here.

`scene.waiting` is what keeps the machine honest. During a talking step the timer owns the scene, and an `npcIntentDone` from Vendel (his `lookAt` may well report one) must not skip ahead. The guard makes the event count only when the scene is actually waiting on a walk.

The actors are looked up by id at every step, never held. An NPC can be removed by another resource or a console command at any moment; `Npc.getById` returning null is the signal, and `npcDestroy` ends the scene early.

[`pin`](../../reference/server/classes/Npc.md#pin) is the reason the scene works at all. Without it the server gives each NPC to whichever client is nearest, and a second player walking past could take Vendel over mid-sentence, with the timing of his walk now running on a machine that is not watching. Pinned, the NPC stays with the viewer's client; if the viewer walks out of range it goes dormant rather than moving to someone else. `endScene` hands both back with `pin(null)`.

:::caution
The default `kinematic` locomotion walks in straight lines and does not path around anything. Stage a scene on open, flat ground, or Vendel will walk into a fence and report `blocked`.
:::

## 5. The command

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

Build the resource, then:

```sh title="Server console"
ensure scripted-scene
```

In game, stand on open ground and type `/scene`. Vendel walks to Marketa, three lines appear over their heads a few seconds apart, and he walks back. Run `/scene` again and the old pair is replaced by a new one. `/scene stop` removes them.

To watch the pinning, log who runs the actors. Add this to `index.ts`, then have a second player stand nearer to the actors than you while the scene plays. While the scene runs, every line names you, because the pins hold both actors on your client. Once it ends and the pins come off, they can move to the nearer player.

```ts
Events.on("npcSimulatorChange", (npc, player) => {
  console.log(`${npc.name} is now run by ${player ? player.nickname : "nobody"}`);
});
```

## Where to go next

- [Move NPCs: walk, follow, patrol](../../server-scripting/npcs-horses-and-dogs/npc-orders/) lists every intent and what `npcIntentDone` reports for each.
- [NPC damage, death and interaction](../../server-scripting/npcs-horses-and-dogs/npc-events/) covers the rest of the events an NPC raises.
- [Build an NPC shop](../market-stall/) gives an NPC a shop instead of a script.
