---
title: Markers and trigger zones
description: Draw decals and mesh markers in the world, animate and tint them, and turn them into zones that report players walking in and out.
sidebar:
  label: Markers and zones
  order: 44
---

A [`Marker`](../../reference/server/classes/Marker.md) is drawn in the world
to show a place: a chalk cross on the ground, or a coloured cylinder, sphere or
chevron. Turn on `trigger` and it reports players walking in and out. Use
markers for checkpoints, capture points, spawn pads and "go here" hints.

```ts
const at = player.position;
const pad = Marker.place("materials/decals/chalk_cross", new Vector3(at.x, at.y + 4, at.z), { size: 3, trigger: true });

Events.on("markerEnter", (marker, who) => {
  if (marker.id === pad.id) Chat.sendToPlayer(who, "Checkpoint reached.");
});
```

## Place a marker

[`Marker.place(material, position?, options?, virtualWorld?)`](../../reference/server/classes/Marker.md#place)
draws one of two kinds, chosen by `options.shape`:

| Shape | What it is | Material |
| --- | --- | --- |
| `decal` (default) | Projected onto the surface below, like paint. Flat, invisible from below a ridge, ignores `height`, `spin` and `bob`. | A decal material. [`Marker.list(prefix?)`](../../reference/server/classes/Marker.md#list) returns every preloaded one. |
| `cylinder`, `sphere`, `chevron`, `cube`, `plane` | A mesh standing in the world, visible from afar, can spin and bob. `cylinder`, `chevron` and `cube` use `height`. | A plain-coloured material. |

The default gamemode's `src/server/commands/marker.ts` has a palette of ten
mesh materials that work, for example:

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

`rotation` aims the marker, so a rotated decal lies on a wall. `material` and
`shape` are read-only afterwards; place a new marker to change them.

## Change or tint a marker

| Writable property | Range | Notes |
| --- | --- | --- |
| `size` | 0.25 to 64 m | Changed in place; also widens how far it streams. |
| `height` | 0.25 to 64 m | Mesh shapes only. |
| `spin` | -720 to 720 deg/s | Not decals. Each client runs its own clock, so angles can differ between players. |
| `bob` | 0 to 4 m | Not decals. Same clock caveat. |
| `color` | `0xRRGGBBAA` | `0` means untinted. Rebuilds the marker (a tint is a private copy of the shared material). |
| `trigger` | boolean | Off by default. |

Build `color` with multiplication, not `<<`, which goes negative above
`0x7fffffff`:

```ts
function rgba(r: number, g: number, b: number, a = 255): number {
  // Alpha 0 would pack to 0 for black, which means "untinted".
  return r * 0x1000000 + g * 0x10000 + b * 0x100 + Math.max(a, 1);
}

const beacon = Marker.place("materials/decals/chalk_cross", player.position);
beacon.color = rgba(255, 200, 0);
```

## Make a trigger zone

With `trigger` on, each client checks its own player against the marker's
volume and reports crossings. The server drops any claim that disagrees with
the position it replicates, so handlers only see crossings it believes. Leave
`trigger` off on decoration.

| Event | Arguments | When |
| --- | --- | --- |
| `markerEnter` | `marker`, `player` | A player walked in. |
| `markerExit` | `marker`, `player` | A player walked out. |

`markerExit` is **not** raised when the marker is removed, `trigger` is turned
off, or the player leaves the world (disconnecting, for example). If you track
who is inside, clear it there yourself:

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

## Remove markers

Markers say `remove` where other world entities say `destroy`:

```ts
const mark = Marker.place("materials/decals/chalk_cross", player.position);

Marker.all(3);            // live markers in virtual world 3 (omit for all)
Marker.getById(mark.id);  // one, or null
mark.remove();            // just this one
Marker.removeAll(3);      // every marker in virtual world 3; returns the count
Marker.removeAll();       // every marker on the server
```

Markers stream to players within 50 to 400 m, depending on size. They outlive
your resource, so remove yours in `resourceStop` (see
[Props](../props/#clean-up-when-your-resource-stops)).

| Event | Arguments | When |
| --- | --- | --- |
| `markerPlace` | `marker` | Right after a marker is drawn. |
| `markerRemove` | `marker` | While it is removed. The handle still reads. |

## When a call fails

| Call | Fails when | Result |
| --- | --- | --- |
| `Marker.place` | The material is unknown, or the wrong kind for the shape (a decal on a `cylinder`, a plain material as a `decal`). | **Throws.** Catch it when the name came from a player. |
| `place` options, writable properties | A number is out of range. | Clamped, not refused. |

:::tip[Try it]
The default gamemode's `/marker chalk_cross 3` places a decal ahead, and
`/marker cylinder green 2 6` a mesh. `/marker trigger <id> on`,
`/marker spin <id> 90`, `/marker tint <id> 255 0 0` and
`/marker names <prefix>` cover the rest (`src/server/commands/marker.ts`).
:::

## Related

- [Build a team capture-zone mode](../../tutorials/team-rounds/), trigger zones in a full mode
- [Map markers and blips](../../user-interface/map/), to show a place on the map instead
- [Virtual worlds](../../core-concepts/virtual-worlds/), per-world markers
- [Marker reference](../../reference/server/classes/Marker.md)
