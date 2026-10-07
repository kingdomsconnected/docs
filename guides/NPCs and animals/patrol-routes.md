---
title: Author and run named NPC patrol routes
description: Draw and preview routes in World Builder, deploy them, validate their paths and observe an NPC's progress.
sidebar:
  label: Named patrol routes
  order: 51.2
---

Draw a guard's route in World Builder and start it by ID from a server script.
Changing the path then means editing the project and exporting again.

```ts
const route = PatrolRoute.getById("village.guard");
if (route) npc.patrol(route);
// The ID works too: npc.patrol("village.guard").
```

Wait for [world resources to load](../../world/world-resources/) before
looking up an exported route. Routes describe movement; they do not spawn NPCs.

## Draw a route

1. In [World Builder](../../world/world-builder/), open **Patrols** and aim
   at the ground. Click **New route** to place the first waypoint.
2. Give it the unique **ID** `village.guard` and a readable name.
3. Click **Add points in world**, then click each stopping point. **Esc**
   finishes placement.
4. Choose **Once**, **Loop** or **Ping pong**, plus a default speed, arrival
   radius and wait. New routes start as **Ping pong**.
5. Select a numbered waypoint to move it or override its speed, radius and
   wait. Hold **Shift** while dragging to snap it to the ground.

Double-click a route line to insert a waypoint. **Move earlier** and
**Move later** change its order. **Delete** removes the selected waypoint;
deleting the last one removes the route. **Delete route** removes it outright.

## Preview before exporting

Choose a **Preview NPC** and click **Preview**. A temporary local NPC follows
the route; the green line shows its current path. The panel reports its
waypoint and whether it is moving or waiting. It also explains a missing
navigation mesh or a failed spawn.

**Stop preview**, editing the route, closing the editor, switching projects
or leaving the level removes the preview NPC. A completed **Once** route
removes it too. Preview NPCs are never saved or exported.

:::caution[Preview doors and deployed doors]
Humanoid preview NPCs unlock and open local doors, which remain open after
preview. Server NPCs open **unlocked** doors and never unlock them. Test the
deployed route with the server's door rules. Preview uses the base navigation
mesh; server navigation overlays can change the path.
:::

Save the project, export a `.world.json`, add it to `mod.world_resources`
and restart the server. Use IDs that are unique across all exports and
script-created routes. Duplicate IDs fail loading. **Copy API call** copies
the selected route as `PatrolRoute.create(...)` for a script instead.

## Define a route in code

```ts
const route = PatrolRoute.create({
  id: "example.guard",
  name: "Guard rounds",
  mode: "pingPong",
  speed: "walk",
  waitSeconds: 2,
  points: [
    { position: new Vector3(810, 1440, 31), waitSeconds: 5 },
    { position: new Vector3(830, 1452, 31), speed: "jog", radius: 1 },
  ],
});
npc.patrol(route);
```

These coordinates illustrate the format; use points from your own level.
`PatrolRoute.all()` lists definitions. `getById()` returns null for a missing
ID. `toJSON()` returns an independent definition, or null for a removed one.
`update(changes)` replaces supplied fields together; the ID cannot change.
`destroy()` removes a definition, and `exists` checks whether its handle
still resolves. Recreating an ID does not revive an old handle.

Script-created definitions remain until explicitly destroyed or server
shutdown. Clean up your own definitions on `resourceStop`.

## Start, replace and stop

`npc.patrol(routeOrId, options?)` copies the definition when it starts.
Updating or removing that definition leaves an existing patrol alone. Call
`patrol` again to use the new definition; `hold()` stops movement.

Waypoint overrides win over call options, which win over route defaults.
`mode` and the older `loop` option cannot be supplied together. Existing
point-array patrols still work; see [Move NPCs](../npc-orders/).

## Validate on the server

```ts
const route = PatrolRoute.getById("village.guard");
if (route) {
  const result = Navigation.validatePatrol(route, { actor: npc });
  if (result.available && result.complete) npc.patrol(route);
  else console.log("The server cannot find every leg of this patrol.");
}
```

Validation requires a loaded [navigation mesh](../navigation/). It checks
all legs, including loop closure and both directions of a ping-pong route.
`legs` contains each `fromIndex`, `toIndex`, `complete` result and `path`.
Partial paths are incomplete. Validation does not move the actor or check
the approach from its current position to waypoint zero.

Passing `actor` uses that actor's door policy and virtual world. Humanoid
NPCs can open unlocked doors; animals and horses avoid doorways. Opening a
door leaves it open. A door locked after planning can still block the route.

## Read progress

`npc.patrolState` is null outside a patrol. Otherwise it contains `routeId`,
`waypointIndex`, `lap`, `direction` (1 or -1) and `phase` (`moving` or
`waiting`). Indices and laps start at zero. Point-array routes have no ID.

| Event | Outcome in `info.status` |
| --- | --- |
| `patrolWaypoint(npc, info)` | `reached`, `blocked` or `failed`. |
| `patrolFinished(npc, info)` | `completed`, `failed` or `cancelled`. |

Both carry the patrol state. Filter by your NPC's ID. Intermediate path
corners raise neither waypoint events nor `npcIntentDone`. Unreachable legs
are skipped after a delay; a full run of failed legs ends the patrol.
Removing an NPC raises `npcDestroy`, not a final event with a dead handle.

In the sample game mode, try `/patrol list`, `/patrol validate <route-id>`,
`/patrol start <route-id>`, `/patrol status` and `/patrol stop`. Start, status
and stop act on a nearby NPC. The [village patrol tutorial](../../tutorials/world-builder-patrol/)
builds a resource that starts its own guard automatically.
