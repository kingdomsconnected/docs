---
title: "Move NPCs: walk, follow, patrol"
description: Send NPCs somewhere, have them follow, patrol, flee or look, and find out through npcIntentDone when they are done.
sidebar:
  label: Move NPCs
  order: 51
---

An NPC does what it was last told. Give it an order, and `npcIntentDone` tells
you when it is finished.

```ts
npc.moveTo({ x: 812, y: 1440, z: 31 }, { speed: "walk", radius: 2 });

Events.on("npcIntentDone", (who, status) => {
  if (who.id !== npc.id) return;
  if (status === "reached") who.say("Here I am.");
});
```

## Give an order

| Order | What it does | Finishes (`reached`) when |
| --- | --- | --- |
| `moveTo(position, { speed, radius, pathfinding })` | Walks there (default pace walk). | It is within `radius` (default 1.5 m) across the ground and within 2 m in height. |
| `patrol(points, { speed, loop, waitSeconds, pathfinding })` | Walks a route one waypoint at a time; loops by default (walk). | Each leg reports like a `moveTo`. |
| `follow(target, { speed, radius })` | Stays near a player or NPC as they move (jog). | It has caught up to within `radius` (default 3 m). |
| `flee(from, { speed, radius })` | Runs away from a point (run). | It is `radius` (default 25 m) away. |
| `lookAt(target)` | Turns its head, and its body if needed, to a player, NPC or point. | It is facing the target. |
| `hold()` | Cancels the current order and stands still. | It is in position. |

`speed` is `"walk"`, `"jog"` or `"run"`. `follow` and `lookAt` take a handle
or a network id. `npc.intent` reads back the current order (`hold`, `moveTo`,
`follow`, `flee`, `lookAt` or `attack`); a patrol shows as `moveTo`.

## One order at a time

A new order replaces the current one, and any other order cancels a patrol. So
this does not walk and then look:

```ts
npc.moveTo(player.position);
npc.lookAt(player); // replaces the moveTo; the NPC stays where it is
```

To chain orders, give the next one when the last one reports back.

## Hear when an order ends

`npcIntentDone` fires with the NPC and a status:

| Status | Means |
| --- | --- |
| `reached` | The order completed (see the table above). |
| `blocked` | It could not get there: no progress for about three seconds, or no route to the goal. |
| `failed` | The order could not be carried out, for example a target that is not a real position, or a patrol that gave up. |

The event fires once per order, when the server accepts the outcome. A
corner along the way does not raise it, and neither does the NPC passing
from one player's client to another's. A report for an order you have since
replaced is dropped. A `follow` never finishes: it reports `reached` the
first time it catches up and keeps following.

The event also fires for a dormant NPC whose walk the server finished, so a
scene written as "on `reached`, do the next step" works whether or not anyone
is watching. `npc.status` reads the same state on demand: `running` from the
moment an order is given until it ends, then the outcome (`reached`,
`blocked` or `failed`) until the next order, or `idle`.

:::note
The handler hears every NPC on the server, including other resources' NPCs, so
check the id first.
:::

## Run a two-step errand

```ts
const home = npc.position;
let step = 0;

npc.moveTo(target.position, { speed: "jog", radius: 2 });

Events.on("npcIntentDone", (who, status) => {
  if (who.id !== npc.id) return;
  if (status !== "reached") {
    who.hold();
    return;
  }
  if (step === 0) {
    step = 1;
    who.say("A message for you.");
    who.moveTo(home);
  }
});
```

The [NPC cutscene tutorial](../../tutorials/scripted-scene/) builds a whole
scene this way, with two pinned actors and a state machine.

## Patrol a route

```ts
const gate = { x: 810, y: 1440, z: 31 };
const yard = { x: 830, y: 1452, z: 31 };
const stables = { x: 845, y: 1430, z: 30 };

npc.patrol([gate, yard, stables], { loop: true, speed: "walk", waitSeconds: 6 });
```

- The route stays on the server; clients only get the current waypoint.
- `waitSeconds` is the pause at each waypoint, 0 to 3600.
- Each leg reports once. Set `loop: false` or `mode: "once"` to stop at the last point; point-array patrols loop by default.
- A leg that ends `blocked` or `failed` is skipped after at least 2 seconds.
  When every leg of a lap fails in a row, the patrol ends and its last leg
  reports `failed`.
- `patrol` returns `false` for an empty route, more than 256 waypoints, or a
  point that is not finite or lies outside the world.

:::caution
Your own `npcIntentDone` handler also sees each leg. Giving a new order there
ends the patrol.
:::

## Use a World Builder route

`npc.patrol` also takes a `PatrolRoute` handle or its ID. The route supplies
its mode, pace, arrival radius, waiting times and waypoint overrides:

```ts
const route = PatrolRoute.getById("village.guard");
if (route) npc.patrol(route, { pathfinding: "server" });
```

Wait for exports to load before finding one. See
[Named patrol routes](../patrol-routes/) for authoring, validation and
progress events, and [World exports in scripts](../../world/world-resources/)
for the readiness pattern. To order a fight, use [NPC combat](../npc-combat/).

## Walk around obstacles

The game's own movement steers a body straight at the point it is given. To
get around walls, fences and houses, the server plans a route on the level's
[navigation mesh](../navigation/) and hands the body one corner at a time. It
walks through the corners without stopping. Human NPCs open unlocked doors
in their own virtual world, pause for the swing, then continue. They never
unlock doors; doors remain open afterward. Animals avoid doorways.
A dormant NPC is walked along the same route by the server.

The server needs the game's mesh for this; a server operator installs it as
[`mod.navmesh`](../../hosting-a-server/server-json/#modnavmesh) describes, and
`Navigation.ready` says whether it loaded. `moveTo` and `patrol` pick the
planner with `pathfinding`:

| `pathfinding` | With a mesh | Without one |
| --- | --- | --- |
| `auto` (default) | The server plans the route. | Straight at the goal. |
| `game` | Straight at the goal; if that ends `blocked`, the server tries a route before reporting. A dormant NPC waits for a client. | Straight at the goal. |
| `server` | The server plans the route. | Throws, and the previous order stays. |

```ts
npc.moveTo({ x: 812, y: 1440, z: 31 }, { pathfinding: Navigation.ready ? "server" : "game" });
```

A goal the mesh cannot reach ends the move with `blocked`, and a blocked route
is not retried. `follow` and `flee` take no `pathfinding` option: they steer
straight, and when they report `blocked`, a loaded mesh lets the server try a
route first.

## Choose how it walks

`npc.locomotion` picks how the simulating client moves the body along its
route:

- `native` (the default): the game's own movement controller, with real
  footfalls, turns and gaits.
- `kinematic`: the client moves the body itself, in straight lines with one
  gait and no walk animation.

## Say, gesture or teleport

These happen once and leave the current order alone:

```ts
npc.say("Halt! Who goes there?"); // a line over its head, up to 256 characters
npc.playAnimation(12);            // a gesture from the game's emote catalog, by row
npc.teleport(player.position);    // moves the body outright; the server's position wins
```

`say` reaches clients that see the NPC now; late arrivals do not get a
replay. A `playAnimation` is state instead: a client that streams the NPC in
later plays it too, until `stopAnimation` or the next `playAnimation`.

`playAnimation("", { clip })` plays an animation clip a resource ships in its
`stream/` folder ([Custom assets](../../core-concepts/custom-assets/)). Leave
the fragment empty; `loop` and `props` work as usual:

```ts
npc.playAnimation("", { clip: "animations/kcdc/my-assets/wave.caf", loop: true });
```

`npc.frozen = true` holds the body whatever the order says and reports
nothing; set it back to `false` to carry on.

## Related

- [Spawn NPCs](../npcs/): simulation, dormancy and pinning.
- [NPC damage and death](../npc-events/): every NPC event.
- [Script an NPC cutscene](../../tutorials/scripted-scene/): orders chained into a scene.
