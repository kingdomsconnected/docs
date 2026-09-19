---
title: Placing things
sidebar:
  order: 41
---

Let a player choose where something goes. `PropPlacer` puts a translucent
preview of a mesh under their crosshair, colours it for whether the spot is
allowed, and tells you when they click.

```js
PropPlacer.on("confirm", (pose) => {
  Events.emitServer("mygm:build", { position: pose.position, rotation: pose.rotation });
});

PropPlacer.begin({ model: "barrel_a" });
```

That is a working build tool. Left click places, right click ends the session,
the mouse wheel turns the preview, and the player can still look around and
walk the whole time.

## The preview is a hint, not a decision

This is the one thing to get right, and it follows the same split as the rest
of the API:

> Two players aiming at the same patch of ground **both see green**.

The preview is drawn on one machine, from what that machine can see. It is not
authority and it is not agreement. What actually gets built is the server's
call, made again from the pose the client confirmed:

```js
// client
PropPlacer.on("confirm", (pose) => {
  Events.emitServer("mygm:build", { position: pose.position, rotation: pose.rotation });
});

// server
Events.onClient("mygm:build", (player, payload) => {
  if (!player.ready) return;
  if (!canAfford(player)) return;                        // your rules
  Prop.spawn("barrel_a", payload.position, payload.rotation, 1, "static", player.virtualWorld);
});
```

Re-measure on the server rather than trusting what arrived. A client that saw
green is making a request.

## Starting a session

`begin` takes one options bag and answers whether the session started:

```js
const started = PropPlacer.begin({
  model: "watchtower_a",

  validTint: new Color(0.25, 0.95, 0.4, 0.35),   // a < 1 is what makes it see-through
  invalidTint: new Color(1, 0.2, 0.15, 0.35),

  range: 40,                 // how far the aim ray reaches, metres
  fallbackDistance: 6,       // where it sits when the ray reaches nothing
  scale: 1,
  verticalOffset: 0,         // lift or sink it along the surface normal
  yaw: 0,                    // a fixed turn; the wheel moves this while running

  alignToSurface: false,     // stand it on the slope instead of upright
  faceAwayFromPlayer: true,  // what a wall or a tower wants
  keepOpen: true,            // stay in the mode after a confirm
});
```

It answers `false` when a session is already running, when this client has no
world or camera yet, and when another part of the mod is holding input. It
**throws** for a mesh the shared prop catalog does not carry, which is the one
failure worth naming back to the player:

```js
try {
  if (!PropPlacer.begin({ model })) {
    Hud.showInfoText("Cannot start building right now.");
  }
} catch {
  Hud.showInfoText(`${model} is not a mesh this build knows.`);
}
```

`model` takes either a full catalog path or a file stem — `barrel_a` and
`objects/manmade/common_furniture/barrels/barrel_a.cgf` name the same mesh, and
so does the same string passed to `Prop.spawn` on the server.

## The events

```js
const stop = PropPlacer.on("confirm", (pose, valid) => { /* ... */ });
stop();   // unsubscribe
```

| event | when | pose |
| --- | --- | --- |
| `move` | the aim travelled far enough to report, or validity flipped | yes |
| `confirm` | a click the rules accepted — send this to the server | yes |
| `rejected` | a click the rules refused; the session stays up | yes |
| `cancel` | the player backed out | `null` |
| `end` | the session stopped, for any reason. Always last | `null` |

`move` is throttled on purpose. It is the only one that could otherwise fire
every frame, so it reports on a validity flip or once the aim has actually
moved — do not rely on it as a tick.

Listen for `end` and tell the server. It fires however the session stopped —
a right click, a level load, the mod losing input — so it is the one place that
reliably closes the loop:

```js
PropPlacer.on("end", () => Events.emitServer("mygm:build.ended"));
```

A `PlacementPose` carries where it is aimed and what it is aimed at:

```js
pose.position    // Vector3, world metres
pose.rotation    // Quaternion
pose.normal      // surface normal, a unit vector
pose.surface     // `mat_dirt`, `mat_stone`, ... empty when nothing was hit
pose.distance    // metres from the camera
pose.onSurface   // false when the ray left the level entirely
```

`PropPlacer.getPose()` reads the same thing at any moment without waiting for
an event.

## Rules

`rules` is what the preview is coloured by. **Every rule is off unless you name
it**, so a spec with no rules is green anywhere — right for a menu preview,
wrong for a watchtower.

```js
PropPlacer.begin({
  model: "watchtower_a",
  rules: {
    maxSlope: 35,                          // degrees the ground may lean
    surfaces: ["mat_dirt", "mat_grass"],   // allowed surface names
    minDistance: 2,                        // metres from the player
    maxDistance: 35,
    clearance: 1.5,                        // metres that must be free of entities
    clearanceClasses: ["NPC_NAI"],         // narrow the clearance test
    requireSurface: true,                  // refuse a spot the ray never reached
  },
});
```

These are the questions the engine can answer from the ray it has already
traced, which is why they cost the placement loop nothing.

`clearance` reads the entity grid, so it sees other entities and **not static
geometry**. It will refuse a spot beside a cart and allow one inside a wall.
Let the server have the last word either way.

## A rule the engine cannot answer

Anything else — what the player can afford, what the server has already refused
— goes through the latch instead of a callback:

```js
Events.on("mygm:funds", (gold) => {
  PropPlacer.setVeto(gold < 100);   // every spot refused until cleared
});
```

It latches until you clear it, so it costs nothing per frame. There is
deliberately no per-frame hook into the placement loop.

## What it takes from the player

While a session is up, the mode adds its own actions and switches on a filter
over the game's attack and block actions. That is the whole of what it takes:
left click stops swinging and right click stops raising a guard, while **mouse
look and movement carry on as normal**.

You do not have to restore anything. `PropPlacer.end()` turns the filter off,
and so does anything else that ends the session.

One session at a time, and it belongs to the resource that started it — a
resource that stops takes its session and its previews with it.

## A preview on its own

`PropGhost` is the same geometry without the mode: no rules, no input, no loop.
Reach for it when you want a preview you drive yourself — a turntable in a
build menu, an outline of where the server says a zone is, a marker you can see
through.

```js
const ghost = PropGhost.create({
  model: "watchtower_a",
  position: somewhere,
  tint: new Color(0.25, 0.95, 0.4, 0.35),
});

ghost.setPose(position, rotation, 1);
ghost.setTint(new Color(1, 0.2, 0.15, 0.35));
ghost.setTint();              // back to the mesh's own materials
ghost.setHidden(true);
ghost.getBounds();            // { min, max, centre, size } in world space
ghost.valid;                  // false once it is gone
ghost.destroy();
```

A blueprint of several meshes is the same call with parallel arrays, lined up
by index. The whole thing turns and scales as one, and the offsets are in its
own frame:

```js
PropGhost.create({
  models: ["scaffolding_floor_only_a", "scaffolding_main_beam_c"],
  offsets: [new Vector3(0, 0, 0), new Vector3(0, 0, 2.2)],
  position,
});
```

`PropPlacer.begin` takes `models`, `offsets` and `rotations` the same way.

**A ghost is not a prop.** Nobody else can see it, nothing about it is
replicated, it has no collision, and a level load destroys every one. A preview
everyone should see is a prop the server spawned.

## Aiming at something yourself

Placement does its own aiming, but the camera is exposed for when you want to
ask the same question:

```js
const ray = Camera.screenRay({ range: 40 });
const hit = World.raycast(ray.origin, ray.target, { mode: "ground" });
if (hit) console.log(hit.surface, hit.position);
```

`screenRay` takes a point in normalized device coordinates — `(0, 0)` is the
centre of the screen, where the crosshair is — and turns it into the two points
`World.raycast` wants. `Camera.getPose()` gives the eye position and the full
basis if you need to build something else from it.

Both read `null` in the main menu and across a level load, when there is no
active view.

## Limits

64 previews at once per client, 32 meshes in each. Past either, `create`
answers `null` rather than letting a leaking resource take the session down.
