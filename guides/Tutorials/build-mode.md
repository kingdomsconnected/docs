---
title: Build a placement mode
description: A placement preview on the client, a server that re-measures every confirmed spot before it spawns anything, and a veto for rules only the server can judge.
sidebar:
  order: 94
---

Building splits cleanly between the two sides. The client has the camera and the world, so it draws the preview and colours it red or green. The server has authority, so it decides what actually gets built. A client that saw green is making a request, not a decision.

You will build `/build`. It puts a translucent barrel under your crosshair; left click asks the server to build one there, right click ends the mode. The server checks the spot is within reach of where it thinks you stand, and gives each player ten pieces. When you run out, the server tells your client to veto every spot, and the preview stays red until you clear what you built.

The default gamemode's `/build` is the same design (`src/server/build.ts`, `src/server/commands/build.ts` and `src/client/build.ts`); this version adds the budget and the veto.

```text
build-mode/
  package.json
  tsconfig.json
  types/runtime.d.ts
  src/server/
    index.ts
    build.ts
  src/client/
    tsconfig.json
    index.ts
```

The config files are the ones from [Use TypeScript](../../getting-started/typescript/), with both programs.

## 1. The manifest

```json title="package.json"
{
  "name": "build-mode",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc -p tsconfig.json && tsc -p src/client/tsconfig.json"
  },
  "devDependencies": {
    "typescript": "^5.9.2"
  },
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"],
    "clientScripts": ["dist/client/index.js"],
    "files": ["dist/client/**"]
  }
}
```

## 2. The conversation between the halves

Six events, all namespaced with the resource name:

| Event | Direction | Payload |
| --- | --- | --- |
| `build-mode:begin` | server to client | `{ model, left }` |
| `build-mode:place` | client to server | `{ position, rotation }` |
| `build-mode:budget` | server to client | `{ left }` |
| `build-mode:refused` | server to client | `{ reason }` |
| `build-mode:stop` | server to client | none |
| `build-mode:ended` | client to server | none |

## 3. The server

The server keeps who is building what, and the id of every prop each player has built. Everything a client sends is checked field by field before it is used.

```ts title="src/server/build.ts"
const RESOURCE = "build-mode";

/** How far from the player a confirmed spot may be, measured where the answer counts. */
const MAX_REACH = 40;
/** Pieces per player. */
export const BUDGET = 10;

const sessions = new Map<number, { model: string }>();
const built = new Map<number, number[]>();

function piecesOf(player: Player): number[] {
  let pieces = built.get(player.id);
  if (!pieces) built.set(player.id, (pieces = []));
  return pieces;
}

function readNumbers<K extends string>(value: unknown, keys: readonly K[]): Record<K, number> | null {
  if (typeof value !== "object" || value === null) return null;
  const result = {} as Record<K, number>;
  for (const key of keys) {
    const field = (value as Record<string, unknown>)[key];
    if (typeof field !== "number" || !Number.isFinite(field)) return null;
    result[key] = field;
  }
  return result;
}

function refuse(player: Player, reason: string): void {
  player.emit(`${RESOURCE}:refused`, JSON.stringify({ reason }));
}

export function beginBuild(player: Player, model: string): void {
  sessions.set(player.id, { model });
  player.emit(`${RESOURCE}:begin`, JSON.stringify({ model, left: BUDGET - piecesOf(player).length }));
}

/** Tells a building client how many pieces it has left, which is what sets or clears its veto. */
export function sendBudget(player: Player): void {
  if (sessions.has(player.id)) player.emit(`${RESOURCE}:budget`, JSON.stringify({ left: BUDGET - piecesOf(player).length }));
}

export function stopBuild(player: Player): boolean {
  if (!sessions.delete(player.id)) return false;
  player.emit(`${RESOURCE}:stop`);
  return true;
}

/** Removes what one player built, or everything when no player is given. */
export function clearBuilt(player?: Player): number {
  const owners = player ? [player.id] : [...built.keys()];
  let removed = 0;
  for (const owner of owners) {
    for (const id of built.get(owner) ?? []) {
      Prop.getById(id)?.destroy();
      removed += 1;
    }
    built.delete(owner);
  }
  return removed;
}

export function installBuildHandlers(): void {
  Events.onClient(`${RESOURCE}:place`, (sender, payload) => {
    const player = sender as Player;
    const session = sessions.get(player.id);
    // Not building: a click that crossed a stop, or a client making things up.
    if (!session) return;

    const position = readNumbers(typeof payload === "object" && payload !== null ? (payload as { position?: unknown }).position : undefined, ["x", "y", "z"] as const);
    const rotation = readNumbers(typeof payload === "object" && payload !== null ? (payload as { rotation?: unknown }).rotation : undefined, ["w", "x", "y", "z"] as const);
    if (!position || !rotation) return refuse(player, "That placement did not carry a usable pose.");

    const pieces = piecesOf(player);
    if (pieces.length >= BUDGET) return refuse(player, "You have no pieces left.");

    const spot = new Vector3(position.x, position.y, position.z);
    if (!player.ready || player.position.distance(spot) > MAX_REACH) return refuse(player, "That spot is too far from you.");

    let prop: Prop;
    try {
      prop = Prop.spawn(session.model, spot, new Quaternion(rotation.w, rotation.x, rotation.y, rotation.z), 1, "static", player.virtualWorld);
    } catch {
      return refuse(player, `${session.model} cannot be built.`);
    }
    pieces.push(prop.id);
    sendBudget(player);
  });

  // The client left the mode by itself: right click, or the preview failed to start.
  Events.onClient(`${RESOURCE}:ended`, (sender) => {
    sessions.delete((sender as Player).id);
  });

  // A piece removed by anything else (another resource, a console command) gives the budget back.
  Events.on("propDestroy", (prop) => {
    for (const pieces of built.values()) {
      const index = pieces.indexOf(prop.id);
      if (index >= 0) pieces.splice(index, 1);
    }
  });

  // Pieces belong to their builder and leave with them.
  Events.on("playerDisconnect", (player) => {
    sessions.delete(player.id);
    clearBuilt(player);
  });
}
```

:::note[Authority]
The distance check uses `player.position`, the position the server replicates, not anything the client said about itself. Checking the pose against a player position sent in the same payload would check nothing: a modified client would send both.
:::

`player.virtualWorld` is passed to `Prop.spawn` so a builder in another [virtual world](../../core-concepts/virtual-worlds/) builds in their own world rather than the global one.

The command lives in the entry point:

```ts title="src/server/index.ts"
import { BUDGET, beginBuild, clearBuilt, installBuildHandlers, sendBudget, stopBuild } from "./build.js";

const RESOURCE = "build-mode";
const DEFAULT_MODEL = "objects/manmade/barrels/barrel_a.cgf";

installBuildHandlers();

Events.on("playerCommand", (player, command, args) => {
  if (command !== "build") return;

  if (args[0] === "stop") {
    Chat.sendToPlayer(player, stopBuild(player) ? "Stopped building." : "You are not building.");
  } else if (args[0] === "clear") {
    Chat.sendToPlayer(player, `Removed ${clearBuilt(player)} piece(s). You have ${BUDGET} again.`);
    sendBudget(player);
  } else if (!player.ready) {
    Chat.sendToPlayer(player, "Your position has not reached the server yet. Try again in a moment.");
  } else {
    beginBuild(player, args[0] ?? DEFAULT_MODEL);
    Chat.sendToPlayer(player, "Left click to build, mouse wheel to turn, right click when you are done.");
  }
});

// Props outlive the resource that spawned them.
Events.on("resourceStop", (name) => {
  if (name === RESOURCE) clearBuilt();
});
```

## 4. The client

The client does three things: run the preview, send what the player confirms, and apply what the server says. [`PropPlacer`](../../reference/client/variables/PropPlacer.md) runs the whole loop natively, so there is no per-frame script here.

```ts title="src/client/index.ts"
const RESOURCE = "build-mode";

const VALID = new Color(0.25, 0.95, 0.4, 0.35);
const INVALID = new Color(1, 0.2, 0.15, 0.35);

function fields(payload: unknown): Record<string, unknown> {
  return typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : {};
}

// Registered once. They belong to this resource and go when it stops.
PropPlacer.on("confirm", (pose) => {
  if (pose) Events.emitServer(`${RESOURCE}:place`, { position: pose.position, rotation: pose.rotation });
});
PropPlacer.on("rejected", (pose) => {
  Hud.showInfoText(pose && !pose.onSurface ? "There is nothing there to build on." : "You cannot build there.");
});
PropPlacer.on("end", () => Events.emitServer(`${RESOURCE}:ended`));

Events.on(`${RESOURCE}:begin`, (payload) => {
  const { model, left } = fields(payload);
  if (typeof model !== "string") return;

  let started = false;
  try {
    started = PropPlacer.begin({
      model,
      validTint: VALID,
      invalidTint: INVALID,
      keepOpen: true,
      rules: { maxSlope: 30, minDistance: 2, maxDistance: 30, clearance: 1 },
    });
  } catch {
    Hud.showInfoText(`${model} is not a mesh this game has.`);
  }
  if (!started) {
    Events.emitServer(`${RESOURCE}:ended`);
    return;
  }
  // Out of pieces from an earlier session: the preview is red from the start.
  PropPlacer.setVeto(left === 0);
});

Events.on(`${RESOURCE}:budget`, (payload) => {
  const { left } = fields(payload);
  if (typeof left !== "number") return;
  Hud.showInfoText(left > 0 ? `${left} piece(s) left.` : "No pieces left.");
  PropPlacer.setVeto(left <= 0);
});

Events.on(`${RESOURCE}:refused`, (payload) => {
  const { reason } = fields(payload);
  if (typeof reason === "string") Hud.showInfoText(reason);
});

Events.on(`${RESOURCE}:stop`, () => PropPlacer.end());
```

The `rules` are a hint for one screen. Two players aiming at the same patch of ground both see green, and a modified client can see green anywhere. That is fine, because none of it is trusted: the server measures again.

The veto is the other half. `rules` only covers what the engine can judge from the aim ray (slope, surface, distance, clearance). A rule that needs server knowledge, like a budget, a price or a claim on the land, goes through [`setVeto`](../../reference/client/variables/PropPlacer.md#setveto): a latch that refuses every spot until cleared, so a player is not invited to click on something the server would refuse.

:::caution
`PropPlacer.begin` throws for a mesh the shared catalog does not carry, and returns false when a session is already running or another part of the mod holds the controls. Both paths tell the server the session ended, or the server would keep a session open for a client that is not placing anything.
:::

## Try it

Build the resource, then:

```sh title="Server console"
ensure build-mode
```

In game:

1. `/build`. A green barrel follows your crosshair. Aim at a steep slope or into the sky and it turns red.
2. Left click a few times. Each click builds a barrel and the info line counts down your pieces.
3. Keep going until you run out. The preview turns red and stays red.
4. `/build clear` removes your barrels and gives you ten pieces again; if you are still building, the preview turns green again. `/build objects/manmade/barrels/barrel_a.cgf` names the mesh explicitly.
5. Right click ends the mode.

## Where to go next

- [Let players place objects](../../client-scripting/placement/) covers `PropPlacer` and `PropGhost` in full, including multi-piece blueprints.
- [Props](../../server-scripting/world-and-objects/props/) covers `Prop.spawn`, physics kinds and scale.
- [Build a team capture-zone mode](../team-rounds/) builds a whole game loop on the server.
