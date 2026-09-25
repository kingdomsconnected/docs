---
title: Let players place objects
description: Let a player choose where something goes with PropPlacer, draw your own previews with PropGhost, and let the server decide what gets built.
sidebar:
  order: 73
---

[`PropPlacer`](../../reference/client/variables/PropPlacer.md) lets a player
choose where something goes. It puts a translucent preview of a mesh under the
crosshair, tints it for whether the spot is allowed, and tells you when they
click. The loop runs natively with the game's frame, so your resource writes no
tick at all.

```ts
PropPlacer.on("confirm", (pose) => {
  if (pose) {
    Events.emitServer("my-mode:build", { position: pose.position, rotation: pose.rotation });
  }
});

PropPlacer.begin({ model: "barrel_a" });
```

That is a working build tool. Left click places, right click ends the session,
and the mouse wheel turns the preview.

## The preview is a hint, not a decision

The preview is drawn on one machine, from what that machine can see. Two players
aiming at the same patch of ground both see green. What actually gets built is
the server's call, made again from the pose the client sent.

:::note[Authority]
A client that saw green is making a request. The server re-measures the pose,
applies its own rules and spawns the prop, or refuses.
:::

```ts
// server
function readNumbers(value: unknown, keys: string[]): number[] | null {
  if (typeof value !== "object" || value === null) return null;
  const numbers = keys.map((key) => (value as Record<string, unknown>)[key]);
  return numbers.every((n) => typeof n === "number" && Number.isFinite(n)) ? (numbers as number[]) : null;
}

Events.onClient("my-mode:build", (sender, payload) => {
  const player = sender as Player;
  const body = typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : {};
  const p = readNumbers(body.position, ["x", "y", "z"]);
  const q = readNumbers(body.rotation, ["w", "x", "y", "z"]);
  if (!player.ready || !p || !q) return;

  // Measured against where the server thinks the player is.
  const position = new Vector3(p[0], p[1], p[2]);
  if (player.position.distance(position) > 40) return;

  Prop.spawn("barrel_a", position, new Quaternion(q[0], q[1], q[2], q[3]), 1, "static", player.virtualWorld);
});
```

The default gamemode's `/build` command is this loop end to end:
`src/client/build.ts` for the preview and `src/server/build.ts` for the
decision. It also keeps a session per player on the server, so a client that
was never asked to build cannot place anything. [Build mode](../../tutorials/build-mode/)
walks through it.

## Starting a session

`begin` takes one options object and returns whether the session started:

```ts
const started = PropPlacer.begin({
  model: "barrel_a",

  validTint: new Color(0.25, 0.95, 0.4, 0.35), // alpha below 1 makes it see-through
  invalidTint: new Color(1, 0.2, 0.15, 0.35),

  range: 40,               // how far the aim ray reaches, metres (up to 512)
  fallbackDistance: 6,     // where it sits when the ray reaches nothing
  scale: 1,
  verticalOffset: 0,       // lift or sink it
  yaw: 0,                  // a fixed turn; the wheel adds to it

  alignToSurface: false,   // stand it on the slope instead of upright
  faceAwayFromPlayer: true, // what a wall or a tower wants (default)
  keepOpen: true,          // stay in the mode after a confirm (default)
});
```

`model` takes a full catalog path or a file stem: `barrel_a` and its full
`objects/.../barrel_a.cgf` path name the same mesh, and the same string works
for `Prop.spawn` on the server.

`begin` returns `false` when a session is already running, when this client has
no world or camera yet, or when another part of the mod holds the controls. It
**throws** for a mesh the shared prop catalog does not carry, which is the one
failure worth naming back to the player:

```ts
function startBuilding(model: string): void {
  try {
    if (!PropPlacer.begin({ model })) {
      Hud.showInfoText("Cannot start building right now.");
    }
  } catch {
    Hud.showInfoText(`${model} is not a mesh this build knows.`);
  }
}
```

## The events

`PropPlacer.on(event, handler)` subscribes and returns a function that removes
the subscription. The handler gets a
[PlacementPose](../../reference/client/interfaces/PlacementPose.md) (or `null`)
and whether the spot is accepted.

| Event | When | Pose |
| --- | --- | --- |
| `move` | the aim moved far enough to report, or validity flipped | yes |
| `confirm` | a click the rules accepted: send this one to the server | yes |
| `rejected` | a click the rules refused; the session stays up | yes |
| `cancel` | the player backed out | `null` |
| `end` | the session stopped, for any reason; always last | `null` |

`move` is throttled on purpose, so do not use it as a tick.

Listen for `end` and tell the server. It fires however the session stopped
(a right click, `PropPlacer.end()`, a level load, the mod taking the controls),
so it is the one place that reliably closes the loop:

```ts
PropPlacer.on("rejected", (pose) => {
  const why = pose && !pose.onSurface ? "there is nothing there to build on" : "that spot is refused";
  Hud.showInfoText(`Cannot build here: ${why}.`);
});

PropPlacer.on("end", () => {
  Events.emitServer("my-mode:build.ended");
});
```

A pose carries `position`, `rotation`, the surface `normal` and `surface` name,
the `distance` from the camera, and `onSurface`, which is `false` when the
preview hangs in mid-air at the fallback distance. `getPose()` reads it at any
moment, `rotate(degrees)` turns the preview like the wheel, and `end()` stops
the session.

## Rules

`rules` decides the tint. Every rule is off unless you name it, except
`requireSurface`, which is on by default.

```ts
const rules = {
  maxSlope: 35,                        // degrees the ground may lean
  surfaces: ["mat_dirt", "mat_grass"], // allowed surface names
  minDistance: 2,                      // metres from the player
  maxDistance: 35,
  clearance: 1.5,                      // metres that must be free of other entities
  clearanceClasses: ["NPC_NAI"],       // narrow the clearance test
  requireSurface: true,                // refuse a spot the ray never reached
};

PropPlacer.begin({ model: "barrel_a", rules });
```

These are the questions the engine can answer from the ray it already traced,
which is why they cost the loop nothing. `clearance` looks at entities, not
static geometry: it refuses a spot next to a cart and allows one inside a wall.
The server has the last word either way.

Anything else, like what the player can afford or what the server already
refused, goes through a latch instead of a callback:

```ts
Events.on("my-mode:funds", (payload) => {
  const gold = typeof payload === "number" ? payload : 0;
  PropPlacer.setVeto(gold < 100); // every spot refused until cleared
});
```

There is deliberately no per-frame hook into the placement loop.

## What it takes from the player

While a session is up, the game's attack and block actions are filtered out,
so the clicks do not swing a sword or raise a guard. Mouse look and movement
carry on: you cannot aim a preview you cannot turn towards. Ending the session
gives everything back.

One session runs at a time, and it belongs to the resource that started it. A
resource that stops takes its session, its handlers and its previews with it.

## A preview on its own

[`PropGhost`](../../reference/client/classes/PropGhost.md) is the same geometry
without the mode: no rules, no input, no loop. Use it for a preview you drive
yourself, such as a turntable in a build menu or an outline of a zone the server
told you about.

```ts
const me = LocalPlayer;
const ghost = me
  ? PropGhost.create({ model: "barrel_a", position: me.position, tint: new Color(0.25, 0.95, 0.4, 0.35) })
  : null;

if (ghost) {
  ghost.setPose(new Vector3(100, 200, 30), new Quaternion(1, 0, 0, 0), 1.5);
  ghost.setTint(new Color(1, 0.2, 0.15, 0.35));
  ghost.setTint(); // back to the mesh's own materials
  ghost.setHidden(true);
  const bounds = ghost.getBounds(); // { min, max, centre, size }, or null
  ghost.destroy();
}
```

`create` returns `null` when this client has no world, at the ghost limit, or
when none of the meshes would load, and throws for a path outside the catalog.
`setPose` and `setTint` are cheap enough to call every frame. After `destroy`,
or a level load, `ghost.valid` reads `false` and every call answers `false`.

A blueprint of several meshes uses parallel arrays, lined up by index. The
offsets are in the ghost's own frame, so the whole thing turns and scales as
one. `PropPlacer.begin` takes `models`, `offsets` and `rotations` the same way.

```ts
function scaffoldGhost(at: Vector3): PropGhost | null {
  return PropGhost.create({
    models: ["scaffolding_floor_only_a", "scaffolding_main_beam_c"],
    offsets: [new Vector3(0, 0, 0), new Vector3(0, 0, 2.2)],
    position: at,
  });
}
```

:::caution[A ghost is not a prop]
Nobody else can see it, nothing about it is replicated, it has no collision, and
a level load destroys every one. A preview everyone should see is a
[prop](../../server-scripting/world-and-objects/props/) the server spawned.
:::

Each client can hold 64 ghosts of up to 32 meshes each; past that, `create`
returns `null`. `PropGhost.destroyAll()` removes every ghost on this client,
other resources' included, so prefer destroying your own.

## Related

- [Camera and raycasts](../camera/), to aim at something yourself
- [Props](../../server-scripting/world-and-objects/props/), the server half
- [Build a placement mode](../../tutorials/build-mode/)
