---
title: Let players place objects
description: Let a player choose where something goes with PropPlacer, draw your own previews with PropGhost, and send the result to the server.
sidebar:
  label: Object placement
  order: 73
---

[`PropPlacer`](../../reference/client/variables/PropPlacer.md) puts a
translucent preview of a mesh under the crosshair, tints it for whether the spot
is allowed, and tells you when the player clicks. The loop runs natively, so
your resource writes no tick.

```ts
PropPlacer.on("confirm", (pose) => {
  if (pose) {
    Events.emitServer("my-mode:build", { position: pose.position, rotation: pose.rotation });
  }
});

PropPlacer.begin({ model: "barrel_a" });
```

Left click places, right click ends the session, and the mouse wheel turns the
preview. The default gamemode's `/build` command is this loop end to end
(`src/client/build.ts`, `src/server/build.ts`), and
[Build a placement mode](../../tutorials/build-mode/) walks through it, server
half included.

## Start a session

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

`model` takes a full catalog path or a file stem: `barrel_a` and its
`objects/.../barrel_a.cgf` path name the same mesh, and the same string works
for `Prop.spawn` on the server. A mesh the server streams works too, by its
full `objects/kcdc/<resource>/...cgf` path, once this player has it
(`Assets.has`); see [Custom assets](../../core-concepts/custom-assets/).

## When `begin` fails

| Case | Result |
| --- | --- |
| a session is already running | `false` |
| no world or camera yet | `false` |
| another part of the mod holds the controls | `false` |
| a mesh the shared prop catalog does not carry | throws |

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

## React to clicks: events

`PropPlacer.on(event, handler)` subscribes and returns a function that removes
the subscription. The handler gets a
[PlacementPose](../../reference/client/interfaces/PlacementPose.md) (or `null`)
and whether the spot is accepted.

| Event | When | Pose |
| --- | --- | --- |
| `move` | the aim moved far enough to report, or validity flipped (throttled, not a tick) | yes |
| `confirm` | a click the rules accepted: send this one to the server | yes |
| `rejected` | a click the rules refused; the session stays up | yes |
| `cancel` | the player backed out | `null` |
| `end` | the session stopped, for any reason; always last | `null` |

`end` fires however the session stopped (right click, `PropPlacer.end()`, a
level load, the mod taking the controls), so tell the server from there:

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
the `distance` from the camera, and `onSurface` (`false` when the preview hangs
at the fallback distance). `getPose()` reads it at any moment,
`rotate(degrees)` turns the preview like the wheel, and `end()` stops the
session.

:::note[The preview is a hint]
Green on one client is a request, not a decision. The server re-checks the pose
it receives, applies its own rules and spawns the [prop](../../world/props/) or
refuses. See [Server vs client authority](../../core-concepts/authority/).
:::

## Set placement rules

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

`clearance` looks at entities, not static geometry: it refuses a spot next to a
cart and allows one inside a wall.

For anything else (what the player can afford, what the server refused), set a
veto. There is no per-frame hook into the loop.

```ts
Events.on("my-mode:funds", (payload) => {
  const gold = typeof payload === "number" ? payload : 0;
  PropPlacer.setVeto(gold < 100); // every spot refused until cleared
});
```

## What a session takes from the player

- The game's attack and block actions are filtered out, so clicks do not swing
  a sword or raise a guard. Mouse look and movement carry on.
- Your own [key binds](../input/) still fire; check `PropPlacer.isActive()`.
- One session runs at a time and belongs to the resource that started it. A
  resource that stops takes its session, handlers and previews with it.

## Draw a preview yourself: `PropGhost`

[`PropGhost`](../../reference/client/classes/PropGhost.md) is the same geometry
without rules, input or loop: a turntable in a build menu, or the outline of a
zone the server told you about.

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

- `create` returns `null` with no world, at the limit, or when no mesh would
  load. It throws for a path outside the catalog.
- `setPose` and `setTint` are cheap enough to call every frame.
- After `destroy` or a level load, `ghost.valid` reads `false` and every call
  answers `false`.
- Each client holds up to 64 ghosts of up to 32 meshes each.
- `PropGhost.destroyAll()` removes every ghost on this client, other resources'
  included, so prefer destroying your own.

A blueprint of several meshes uses parallel arrays lined up by index, with
offsets in the ghost's own frame. `PropPlacer.begin` takes `models`, `offsets`
and `rotations` the same way.

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
Only this client sees it. It is not replicated, has no collision, and a level
load destroys it. A preview everyone should see is a prop the server spawned.
:::

## Related

- [Build a placement mode](../../tutorials/build-mode/), the full client and server loop
- [Spawn props and objects](../../world/props/), the server half
- [Camera and free camera (noclip)](../camera/), to aim at something yourself
- [Raycasts and nearby entities](../../world/raycasts/)
