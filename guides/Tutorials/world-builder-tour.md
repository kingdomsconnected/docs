---
title: Build an NPC walking tour
description: Send a guide along a World Builder route and let a player opt into native following from a client resource.
sidebar:
  label: World Builder walking tour
  order: 98
---

Draw a route through a village, put a guide at its start, and let a player
follow him. The server controls the guide's route; the client lets the
player choose whether to follow or walk on their own.

## Before you start

Complete [the village patrol](../world-builder-patrol/). Use both TypeScript
configurations from [Use TypeScript](../../getting-started/typescript/):
the root server configuration and `src/client/tsconfig.json`.
Read [Following players and NPCs](../../client-scripting/following/).

## What you will learn

- Turn a named route into a finite tour with waypoint dialogue.
- Send a guide's network ID to the player who spoke to him.
- Confirm native follow entry before starting the guide's walk.
- Handle completion, interruption and resource cleanup on both sides.

```text
village-tour/
  package.json
  tsconfig.json
  src/server/index.ts
  src/client/tsconfig.json
  src/client/index.ts
```

## 1. Author the stops

In the village project's **Patrols** tab, create `village.tour`. Give it
three points near places you want to describe. Set **Once**, **walk** and
five seconds of waiting. Preview it, then save, export and deploy the
updated `village.world.json` as in the patrol tutorial.

The first waypoint is also the guide's meeting point. Choose a place with
room for the player beside him. The sample uses world 0 and one shared tour
at a time; players in the default global world can join it too.

## 2. Create the resource

```json title="package.json"
{
  "name": "village-tour",
  "version": "1.0.0",
  "scripts": { "build": "tsc -p tsconfig.json && tsc -p src/client/tsconfig.json" },
  "devDependencies": {
    "@kingdomsconnected/types": "1.6.2",
    "typescript": "^5.9.2"
  },
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"],
    "clientScripts": ["dist/client/index.js"]
  }
}
```

## 3. Let the server own the guide

Talking to the guide offers the tour. The client sends a request after its
follow action starts. The server resolves that sender's reservation and
checks their body, world and distance before moving the guide.

```ts title="src/server/index.ts"
const RESOURCE = "village-tour";
let guideId: number | null = null;
let guestId: number | null = null;
let offeredUntil = 0;
let walking = false;
let route: PatrolRoute | null = null;
const lines = ["Come along. We start here.", "This is the village square.", "That is our last stop. Safe travels!"];

function start(): void {
  route = WorldResource.find("village")?.patrolRoutes
    .find(route => route.id === "village.tour") ?? null;
  const first = route?.toJSON()?.points[0];
  if (!route || !first || !Navigation.ready) {
    console.log("Load village.tour and the level navigation mesh first.");
    return;
  }
  const guide = Npc.create({
    soul: "townsman", name: "Village guide", position: first.position,
    virtualWorld: 0, invulnerable: true,
  });
  if (!Navigation.validatePatrol(route, { actor: guide }).complete) {
    guide.remove();
    console.log("The tour has an unreachable leg.");
    return;
  }
  guideId = guide.id;
}

Events.on("npcInteract", (guide, player) => {
  if (guide.id !== guideId || !player.canAct) return;
  if (walking || (guestId !== null && guestId !== player.id && Date.now() < offeredUntil)) {
    Chat.sendToPlayer(player, "The guide is busy. Try after this tour.");
    return;
  }
  guestId = player.id;
  offeredUntil = Date.now() + 30000;
  player.emit("village-tour:offer", JSON.stringify({ id: guide.id }));
  Chat.sendToPlayer(player, "Stand near the guide and press F8 within 30 seconds to follow.");
});

Events.onClient("village-tour:walk", sender => {
  const player = sender as Player;
  const guide = guideId === null ? null : Npc.getById(guideId);
  if (!route || !guide || walking || player.id !== guestId || Date.now() > offeredUntil) return;
  if (!player.ready || !player.canAct || player.position.distance(guide.position) > 20) return;
  if (player.virtualWorld !== guide.virtualWorld && player.virtualWorld !== 4294967295) return;
  walking = guide.patrol(route, { mode: "once", pathfinding: "server" });
  if (!walking) {
    guestId = null;
    player.emit("village-tour:end");
  }
});

Events.on("patrolWaypoint", (guide, info) => {
  if (guide.id === guideId && info.status === "reached") {
    guide.say(lines[info.waypointIndex] ?? "We continue this way.");
  }
});

Events.on("patrolFinished", (guide, info) => {
  if (guide.id !== guideId) return;
  const guest = guestId === null ? null : Player.getById(guestId);
  guestId = null;
  walking = false;
  guest?.emit("village-tour:end");
  if (guest) Chat.sendToPlayer(guest, `Tour ${info.status}.`);
});

Events.on("playerDisconnect", player => {
  if (player.id !== guestId) return;
  guestId = null;
  walking = false;
  if (guideId !== null) Npc.getById(guideId)?.hold();
});

Events.on("resourceStop", name => {
  if (name !== RESOURCE) return;
  if (guestId !== null) Player.getById(guestId)?.emit("village-tour:end");
  const id = guideId;
  guideId = null;
  if (id !== null) Npc.getById(id)?.remove();
});

if (WorldResource.ready) start();
else Events.once("worldResourcesReady", start);
```

The guide stays at his final location. Speaking to him again starts a new
tour through the authored points, including the walk back to point zero.
The approach can fail even when all authored legs validated successfully.

## 4. Let the player choose to follow

The guide is already nearby when spoken to, but the client still resolves
the ID against live streamed targets and asks the native action whether it
can start. F8 toggles only this resource's following action.

```ts title="src/client/index.ts"
let offeredGuide: number | null = null;
let expiresAt = 0;

Events.on("village-tour:offer", payload => {
  if (!payload || typeof payload !== "object") return;
  const id = (payload as { id?: unknown }).id;
  if (typeof id !== "number" || !Number.isSafeInteger(id)) return;
  offeredGuide = id;
  expiresAt = Date.now() + 30000;
});

Key.bind("f8", "down", () => {
  if (Follow.getTarget()?.id === offeredGuide || Follow.isPending()) {
    Follow.stop();
    return;
  }
  if (Date.now() > expiresAt) {
    Hud.showInfoText("Talk to the guide to request a tour.");
    return;
  }
  const target = Follow.targets().find(target => target.kind === "npc" && target.id === offeredGuide);
  if (!target || !Follow.canStart(target) || !Follow.start(target)) {
    Hud.showInfoText("Move closer to the guide and finish any other interaction, then try F8.");
  }
});

Events.on("followStarted", target => {
  if (target.id === offeredGuide) Events.emitServer("village-tour:walk");
});

Events.on("village-tour:end", () => {
  Follow.stop();
  offeredGuide = null;
  expiresAt = 0;
});
```

Movement input can interrupt following. The guide continues, so the player
can walk beside him manually. `Follow.start` returning true only means
queued; `followStarted` is what sends the walk request. Stopping this client
resource automatically releases any follow action it owns.

## Try it

1. Run `pnpm install` and `pnpm build`, then `ensure village-tour` in the
   server console.
2. Find the guide at waypoint one and press the game's talk key. Press F8
   nearby after finishing the interaction.
3. Your player starts following and the guide walks. At each stop he says
   its line and waits for the authored interval.
4. Move manually to interrupt following. Walk the rest yourself; the tour
   continues. At its end, the server reports completion and clears the offer.
5. Reload the resource. The old guide is removed and one new guide waits
   at the start. No route or exported scenery is removed.

## Next steps

Change the stop text and route together, or open a [dialogue](../../quests-dialogue-and-shops/dialogue/)
at a stop. For private tours, assign the player and their guide to the same
numbered [virtual world](../../core-concepts/virtual-worlds/) and keep one
guide per participant.
