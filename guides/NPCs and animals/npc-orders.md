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
| `moveTo(position, { speed, radius })` | Walks there (default pace walk). | It is within `radius` (default 1.5 m). |
| `patrol(points, { speed, loop, waitSeconds })` | Walks a route one waypoint at a time; loops by default (walk). | Each leg reports like a `moveTo`. |
| `follow(target, { speed, radius })` | Stays near a player or NPC as they move (jog). | It has caught up to within `radius` (default 3 m). |
| `flee(from, { speed, radius })` | Runs away from a point (run). | It is `radius` (default 25 m) away. |
| `lookAt(target)` | Turns its head, and its body if needed, to a player, NPC or point. | It is facing the target. |
| `hold()` | Cancels the current order and stands still. | It is in position. |

`speed` is `"walk"`, `"jog"` or `"run"`. `follow` and `lookAt` take a handle
or a network id. `npc.intent` reads back the current order (`hold`, `moveTo`,
`follow`, `flee` or `lookAt`); a patrol shows as `moveTo`.

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
| `blocked` | No progress for about three seconds. The order is not cancelled: if it gets there later, `reached` follows. |
| `failed` | The order could not be carried out, for example a target that is not a real position. |

A report for an order you have since replaced is dropped. The event also fires
for a dormant NPC whose walk the server finished, so a scene written as "on
`reached`, do the next step" works whether or not anyone is watching.
`npc.status` reads the same state on demand: `idle`, `running`, `reached`,
`blocked` or `failed`.

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
- `waitSeconds` is the pause at each waypoint.
- A leg that reports `reached` or `blocked` moves on to the next point. Without
  `loop`, it stops at the last one.
- `patrol` returns `false` for an empty route or a non-finite point.

:::caution
Your own `npcIntentDone` handler also sees each leg. Giving a new order there
ends the patrol.
:::

## Choose how it walks

`npc.locomotion` picks how the simulating client moves the body:

- `kinematic`: the client advances the pose itself, in straight lines with one
  gait. Use it for authored routes where you chose the waypoints.
- `native`: the game's own movement controller, with real footfalls, turns and
  gaits. Use it for bodies out in the open.

Neither mode finds a path around obstacles. Put waypoints on either side of a
corner.

:::caution
The reference says `kinematic` is the default, but current builds spawn
`native` when the option is left out. Set `locomotion` explicitly in
`Npc.create`.
:::

## Say, gesture or teleport

These happen once and leave the current order alone:

```ts
npc.say("Halt! Who goes there?"); // a line over its head, up to 256 characters
npc.playAnimation(12);            // a gesture from the game's emote catalog, by row
npc.teleport(player.position);    // moves the body outright; the server's position wins
```

`say` and `playAnimation` reach clients that see the NPC now; late arrivals do
not get a replay. `npc.frozen = true` holds the body whatever the order says and
reports nothing; set it back to `false` to carry on.

## Related

- [Spawn NPCs](../npcs/): simulation, dormancy and pinning.
- [NPC damage and death](../npc-events/): every NPC event.
- [Script an NPC cutscene](../../tutorials/scripted-scene/): orders chained into a scene.
