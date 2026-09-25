---
title: "Move NPCs: walk, follow, patrol"
description: Send NPCs somewhere, have them follow, patrol, flee or look, and find out when they are done through npcIntentDone.
sidebar:
  order: 53
---

An NPC does what it was last told. You give it one order at a time (walk
there, follow them, look at that), the client simulating it carries the order
out, and the server tells you through `npcIntentDone` when it is finished.

```ts
npc.moveTo({ x: 812, y: 1440, z: 31 }, { speed: "walk", radius: 2 });

Events.on("npcIntentDone", (who, status) => {
  if (who.id !== npc.id) return;
  if (status === "reached") who.say("Here I am.");
});
```

If you have not read [NPCs](../npcs/#who-runs-the-body) yet, the short version:
the server owns the order, and whichever nearby client is running the body
carries it out.

## The orders

| Call | What the NPC does | Default pace |
| --- | --- | --- |
| `moveTo(position, { speed, radius })` | Walks there. `radius` (default 1.5 m) is how close counts as arrived. | walk |
| `patrol(points, { speed, loop, waitSeconds })` | Walks a route, one waypoint at a time. Loops by default. | walk |
| `follow(target, { speed, radius })` | Stays within `radius` (default 3 m) of a player or NPC as they move. | jog |
| `flee(from, { speed, radius })` | Runs away from a point until it is `radius` (default 25 m) away. | run |
| `lookAt(target)` | Turns its head, and its body if it must, towards a player, an NPC or a point. | |
| `hold()` | Cancels whatever it was doing and stands where it is. | |

`speed` is `"walk"`, `"jog"` or `"run"`. Targets for `follow` and `lookAt`
can be a handle or a network id.

`npc.intent` reads back what it is currently doing: `hold`, `moveTo`,
`follow`, `flee` or `lookAt`. A patrol shows as `moveTo`, because each leg of
it is an ordinary move to the next waypoint.

## One order at a time

An order is held state, not a queue. A new order replaces the current one, and
any order other than the patrol's own steps cancels a patrol. So this does not
walk and then look:

```ts
npc.moveTo(player.position);
npc.lookAt(player); // replaces the moveTo; the NPC stays where it is
```

To chain orders, give the next one when the last one reports back.

## npcIntentDone: hearing back

`npcIntentDone` fires with the NPC and a status when the current order ends:

| Status | Means |
| --- | --- |
| `reached` | It arrived. For `lookAt` and `hold`, it is in position; for `flee`, it is far enough away; for `follow`, it has caught up. |
| `blocked` | It stopped making progress for about three seconds. It is stuck on something. |
| `failed` | The order could not be carried out at all, for example a target that is not a real position. |

`blocked` does not cancel the order. The client keeps trying, and if the NPC
gets there after all you hear `reached` as well. Decide in your handler
whether to wait, re-route or give up.

A report that belonged to an order you have since replaced is dropped, so a
handler never hears about the old order after you give a new one.

### Why an event, and not a promise or a poll

The server cannot know how long a walk takes. It has no ground, no obstacles,
and no animation; only the client running the body does. That client reports
back when the order ends, and the event is that report.

Polling `npc.status` from a timer would work, but it would be late by up to one
tick of your timer and it would keep running when nothing is happening. The
event arrives once, when the thing happened, and it also arrives for a dormant
NPC whose walk the server finished on its own (see
[Dormant is not broken](../npcs/#dormant-is-not-broken)). So a scene written as
"on `reached`, do the next step" behaves the same whether or not anyone is
watching.

`npc.status` is still there when you want to look: `idle`, `running`,
`reached`, `blocked` or `failed`.

### A two-step errand

```ts
const home = npc.position;

npc.moveTo(target.position, { speed: "jog", radius: 2 });
let step = 0;

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

This handler is registered for every NPC on the server, so it checks the id
first. If more than one resource spawns NPCs, leave the others alone.

The [scripted scene tutorial](../../../tutorials/scripted-scene/) builds a
whole scene this way, with two pinned actors and a state machine.

## Patrols

```ts
const gate = { x: 810, y: 1440, z: 31 };
const yard = { x: 830, y: 1452, z: 31 };
const stables = { x: 845, y: 1430, z: 30 };

npc.patrol([gate, yard, stables], { loop: true, speed: "walk", waitSeconds: 6 });
```

The route stays on the server. Only the waypoint the NPC is walking to is
sent to clients, so a player who arrives mid-patrol sees one walk, not a plan
to catch up with. `waitSeconds` is the pause at each waypoint, which is what
makes it read as a guard on rounds rather than a lap.

A patrol steps on `npcIntentDone`. When a leg reports `reached`, or `blocked`
(a guard wedged behind a cart should walk on, not grind at it), the NPC waits
and heads for the next point. Without `loop`, it stops at the last one.

:::caution
Your own `npcIntentDone` handler also sees each leg's report. Giving the NPC a
new order from there replaces the patrol, so only do that when you mean to end
it.
:::

`patrol` returns `false` for an empty route or a point that is not a finite
number.

## How it walks

`npc.locomotion` picks how the simulating client moves the body:

- `kinematic`: the client advances the pose itself, and every client animates
  it the way it animates a remote player. Predictable, one gait, and it walks
  in straight lines: it does not path around anything. Use it for authored
  routes where you chose the waypoints.
- `native`: the game's own movement controller walks the body, with real
  footfalls, turns and gaits. It still does not know about everything in the
  way. Use it for bodies out in the open.

Neither mode finds a path through a town for you. Routes are your job: put
waypoints on either side of the corner.

:::caution
The reference says `kinematic` is the default, but current builds spawn an NPC
as `native` when the option is left out. Set `locomotion` explicitly in
`Npc.create` so your NPC behaves the same on every build.
:::

## Things that are not orders

These happen once and do not touch the current order, so you can use them
alongside one:

```ts
npc.say("Halt! Who goes there?"); // a line over its head, up to 256 characters
npc.playAnimation(12);            // a gesture from the game's emote catalog, by row
npc.teleport(player.position);    // moves the body outright
```

`say` and `playAnimation` go to clients that can see the NPC right now. A
player who arrives later does not see them replayed.

`teleport` is a write, not a request: whoever is simulating the body, the
server's position wins, and a pose the simulator sent just before cannot put
it back.

`npc.frozen = true` holds the body in place whatever its order says, and
reports nothing while frozen. Set it back to `false` to let the order carry on.

## Related

- [NPCs](../npcs/): simulation, dormancy and pinning.
- [NPC damage, death and interaction](../npc-events/)
