---
title: Markers and trigger zones
description: Draw decals and mesh markers in the world, animate and tint them, and turn them into zones that report players walking in and out.
sidebar:
  order: 45
---

A [`Marker`](../../../reference/server/classes/Marker.md) is something drawn in
the world to show a place: a chalk cross projected on the ground, or a
coloured cylinder, sphere or chevron standing in it. Switch its `trigger` on
and it becomes a zone that tells the server when players walk into and out of
it. Use markers for checkpoints, capture points, spawn pads and "go here"
hints.

```ts
const at = player.position;
const pad = Marker.place("materials/decals/chalk_cross", new Vector3(at.x, at.y + 4, at.z), { size: 3, trigger: true });

Events.on("markerEnter", (marker, who) => {
  if (marker.id === pad.id) Chat.sendToPlayer(who, "Checkpoint reached.");
});
```

## Decals and meshes

[`Marker.place(material, position?, options?, virtualWorld?)`](../../../reference/server/classes/Marker.md#place)
draws one of two kinds of thing, chosen by `options.shape`:

- **`decal`** (the default) projects a material onto whatever surface is under
  it, like paint. It follows the ground, but it is flat: you cannot see it
  from below a ridge, and it ignores `height`, `spin` and `bob`.
- **`cylinder`, `sphere`, `chevron`, `cube`, `plane`** are meshes standing in
  the world. They can be seen from a distance, can spin and bob, and
  `cylinder`, `chevron` and `cube` use `height`.

The two kinds take different materials. A decal takes a decal material, and
[`Marker.list(prefix?)`](../../../reference/server/classes/Marker.md#list) returns
every one the game preloads (`Marker.list("materials/decals/burglar")`). A mesh
shape needs a plain-coloured material instead; the default gamemode's
`src/server/commands/marker.ts` has a palette of ten that work, for example:

```ts
const COLOURS: Record<string, string> = {
  red: "materials/special/collision_proxy_material",
  green: "materials/special/collision_proxy_counterfeiters_barrier",
  blue: "materials/special/collision_proxy_deep_water_barrier",
  white: "materials/filters/fade_short_70",
};

const beacon = Marker.place(COLOURS.green, player.position, {
  shape: "cylinder",
  size: 2,      // width in metres, 0.25 to 64
  height: 6,    // metres, 0.25 to 64
  spin: 45,     // degrees per second, -720 to 720
  bob: 0.5,     // metres up and down, 0 to 4
});
```

`rotation` aims the marker, so the same call with a rotation lays a decal on
a wall. `material` and `shape` are read-only afterwards; to change them, place
a new marker.

## Changing a live marker

These are writable on the handle:

| Property | Range | Notes |
| --- | --- | --- |
| `size` | 0.25 to 64 m | Changed in place, and widens how far it streams. |
| `height` | 0.25 to 64 m | Mesh shapes only. |
| `spin` | -720 to 720 deg/s | Not decals. Each client runs it on its own clock, so players can see different angles. |
| `bob` | 0 to 4 m | Not decals. Same clock caveat. |
| `color` | `0xRRGGBBAA` | `0` means the material as it ships. Rebuilds the marker. |
| `trigger` | boolean | Off by default. |

Out-of-range numbers are clamped. `color` is a packed integer; build it with
multiplication rather than `<<`, which goes negative above `0x7fffffff`:

```ts
function rgba(r: number, g: number, b: number, a = 255): number {
  // Alpha 0 would pack to 0 for black, which means "untinted".
  return r * 0x1000000 + g * 0x10000 + b * 0x100 + Math.max(a, 1);
}

const beacon = Marker.place("materials/decals/chalk_cross", player.position);
beacon.color = rgba(255, 200, 0);
```

Tinting rebuilds the marker because the shipped material is shared by
everything that names it: a tint is a private copy, not a write to the
original.

## Trigger zones

With `trigger` on, each client checks its own player against the marker's
volume and reports crossings. The server checks the claim against the position
it already replicates, and drops any it does not agree with, so a handler
only sees crossings the server believes.

| Event | Arguments | When |
| --- | --- | --- |
| `markerEnter` | `marker`, `player` | A player walked in. |
| `markerExit` | `marker`, `player` | A player walked out. |

`markerExit` is **not** raised when the marker is removed, when `trigger` is
turned off, or when the player leaves the world (disconnecting, for example).
None of those is walking out. If you keep a set of "players inside", clear it in
those places yourself:

```ts
const inside = new Map<number, Set<number>>(); // marker id -> player ids

Events.on("markerEnter", (m, p) => {
  if (!inside.has(m.id)) inside.set(m.id, new Set());
  inside.get(m.id)!.add(p.id);
});
Events.on("markerExit", (m, p) => inside.get(m.id)?.delete(p.id));
Events.on("markerRemove", (m) => inside.delete(m.id));
Events.on("playerDisconnect", (p) => {
  for (const ids of inside.values()) ids.delete(p.id);
});
```

Leave `trigger` off on markers that are only decoration: a marker nobody
listens to should cost nothing but its drawing.

## Lists and cleanup

```ts
const mark = Marker.place("materials/decals/chalk_cross", player.position);

Marker.all(3);            // live markers in virtual world 3 (omit for all)
Marker.getById(mark.id);  // one, or null
mark.remove();            // just this one
Marker.removeAll(3);      // every marker in virtual world 3; returns the count
Marker.removeAll();       // every marker on the server
```

Markers use `remove` and `removeAll` where the other world entities say
`destroy`. They stream to players within 50 to 400 metres, depending on their
size. Like props, they stay after your resource stops, so remove the ones you
placed in `resourceStop`.

| Event | Arguments | When |
| --- | --- | --- |
| `markerPlace` | `marker` | Right after a marker is drawn. |
| `markerRemove` | `marker` | While it is being removed. The handle still reads. |

## What fails, and how

- `Marker.place` **throws** when the material is unknown, and also when it is
  the wrong kind for the shape (a decal name on a `cylinder`, or a plain
  material as a `decal`). Catch it when the name came from a player.
- Numeric options and properties are clamped into range, not refused.

:::tip[Try it]
The default gamemode's `/marker chalk_cross 3` places a decal four metres
ahead, and `/marker cylinder green 2 6` a mesh. `/marker trigger <id> on`,
`/marker spin <id> 90`, `/marker tint <id> 255 0 0` and `/marker names <prefix>`
exercise the rest (`src/server/commands/marker.ts`).
:::
