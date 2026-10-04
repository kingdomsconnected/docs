---
title: Draw debug shapes in the world (gizmos)
description: Draw lines, boxes, spheres, arrows, areas and meshes into the world on this client with Gizmos, to see zones, paths and ranges while you build.
sidebar:
  label: Debug gizmos
  order: 77
---

[`Gizmos`](../../reference/client/variables/Gizmos.md) draws debug geometry
into the world with the game's own renderer: the outline of a zone, the path an
NPC will walk, the reach of an interaction. Drawings are local to this client,
create no entities or collision, and take no input.

```ts
Gizmos.set("work-zone", {
  type: "box",
  position: { x: 100, y: 200, z: 50 },
  min: { x: -5, y: -5, z: 0 },
  max: { x: 5, y: 5, z: 3 },
}, { color: 0xffffaa00, width: 2 });

Gizmos.set("reach", { type: "sphere", position: { x: 100, y: 200, z: 51 }, radius: 3 });
```

## Draw, replace and remove

`Gizmos.set(id, shape, style?)` creates a drawing or replaces the one with that
id, even with a different shape. `remove(id)` takes one away and returns
`false` when your resource has none by that id; `clear()` takes away all of
yours. Ids are private to each resource, so two resources can both draw
`work-zone`.

A drawing stays until you remove it, its `durationMs` runs out, your resource
stops, the session ends or the player loads into another level. Reloading a
save of the same level keeps it. Redraw after a level change.

## Shapes

Positions are world metres and accept a `Vector3` or a plain `{ x, y, z }`.

| `type` | Fields |
| --- | --- |
| `line` | `from`, `to` |
| `arrow` | `from`, `to`, `headLength?` (default the smaller of 0.5 m and a quarter of the length) |
| `box` | `position?`, `rotation?`, `min?`, `max?` (local corners, default -1 and +1) |
| `sphere` | `position?`, `radius` |
| `shape` | `position?`, `rotation?`, `points` (3 to 256, closed), `height?` |
| `circle` | `position`, `radius`, `normal?` (default up), `segments?` |
| `capsule`, `cone`, `cylinder` | `from`, `to`, `radius`, `segments?` |
| `axes` | `position`, `rotation?`, `size?` (default 1 m); X red, Y green, Z blue |
| `grid` | `position`, `normal?`, `size?` (default 10 m), `divisions?` (1 to 64, default 10) |
| `polyline` | `points` (2 to 256), `closed?` |
| `mesh` | `points` (3 to 1024), `indices` (triangle triples, at most 3072), `wireframe?` (default `true`) |

`segments` is 8 to 64 (default 24). A `shape` with a `height` draws a prism up
from its lowest point; without one, the outline follows the points' own heights.

```ts
Gizmos.set("route", {
  type: "polyline",
  points: [
    { x: 100, y: 200, z: 50 },
    { x: 103, y: 202, z: 50 },
    { x: 106, y: 201, z: 51 },
  ],
}, { depthTest: false, color: 0xffffffff, durationMs: 10000 });
```

## Style a drawing

| Field | Meaning |
| --- | --- |
| `color` | Line colour, `0xAARRGGBB`; opaque green (`0xff6ee678`) by default |
| `width` | Line width in pixels, 0.5 to 8 (default 1.5) |
| `depthTest` | `true` by default, so walls and terrain hide it; `false` shows it through them |
| `fillColor` | Fills boxes, spheres, circles, capsules, cones, cylinders, arrow heads and meshes; transparent by default |
| `durationMs` | Removes it after that long, up to 3,600,000; 0 (default) keeps it |

A visible `fillColor` on a line, polyline, grid, axes or `shape` throws, since
they have no surface. To fill a polygon, send its triangles as a `mesh`.
Replacing a drawing resets every style field you leave out.

## Follow something that moves

`setTransform(id, position, rotation?)` moves a drawing without rebuilding it:
each authored point `p` is drawn at `position + rotation * p`. Author the shape
around the origin, then move it as often as you like. It returns `false` when
your resource has no drawing by that id, and `set` resets it.

```ts
Gizmos.set("marker", { type: "capsule", from: { x: 0, y: 0, z: 0 }, to: { x: 0, y: 0, z: 1.8 }, radius: 0.4 });

setInterval(() => {
  const me = LocalPlayer;
  if (me) Gizmos.setTransform("marker", me.position);
}, 16);
```

## Show a server area to a player

`set` takes what the server's `area.toJSON()` returns (and a World Builder area
export) as it is; extra fields such as `id` and `name` are ignored. Nothing is
sent automatically, so the server picks who sees it:

```ts
// server
Events.onClient("debug:areas", (sender) => {
  const player = sender as Player;
  const definition = Area.getById("market")?.toJSON();
  if (definition) player.emit("debug:area", JSON.stringify(definition));
});
```

```ts
Events.on("debug:area", (payload) => {
  const area = payload as GizmoArea & { id: string };
  Gizmos.set(area.id, area, { color: 0xff66ccff, width: 2 });
});

Key.bind("f8", () => Events.emitServer("debug:areas"));
```

## Limits and errors

- Ids are 1 to 128 UTF-8 bytes. A resource holds at most 128 drawings.
- All resources share 16,384 geometry units: a line costs 1, a triangle 3. An
  outline box is 12, a filled box 48, an outline sphere 96.
- Coordinates must be finite and within 16,384 m of the origin.
- Invalid input or a full budget throws, and the previous drawing with that id
  is kept.
- Drawings are hidden while loading and in the multiplayer menus, and have no
  handles to drag.

## Related

- [Raycasts and nearby entities](../../world/raycasts/), to find what to draw around
- [Camera and noclip](../camera/), to fly around a drawing
- [Positions, rotations and vectors](../../core-concepts/math/)
- [`Gizmos` reference](../../reference/client/variables/Gizmos.md)
