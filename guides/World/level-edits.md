---
title: Remove or move the level's own objects
description: Take the game's own walls, gates and props out of the world or move them for every player, from a World Builder map or from script.
sidebar:
  label: Level edits
  order: 48
---

The level ships thousands of objects a script did not spawn: walls, fences,
static gates that never open, rubble in a doorway. A level edit takes one of
them out of the world, moves it, or both, for every player in a virtual
world. Collision goes with it: an object taken out is neither drawn nor solid.

<!-- check: skip -->
```ts
// Take the left half of Maleshov's front gate out, collision and all.
const gate = LevelEdit.apply({
  name: "objects/manmade/structures/logistical/gate/gate_beams_a_door_left.cgf",
  at: new Vector3(490.09, 398.59, 109.8),
  hidden: true,
});
console.log(`${gate}`);
```

Every player gets the edit, including players who join later, however far
away they are. The server keeps nothing past a restart, so apply edits on
every boot. Edits usually come from a map made in the World Builder rather
than typed out by hand.

## From the World Builder to every player

The client's World Builder (F7) edits the level only on that player's
machine. To make its edits everyone's:

1. Open the World Builder, click the object, press **Del**. It is taken out;
   **Del** again puts it back. The gizmo (1 to move, 2 to rotate, 3 to scale)
   moves it instead.
2. In the **Scene** tab, save the map. It is written to `maps/<name>.json`
   beside `KCDCClient.dll`.
3. Copy that file into your resource, for example `maps/maleshov.json`.
4. Apply it on boot with `LevelEdit.applyMap`:

<!-- check: skip -->
```ts title="src/server/index.ts"
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Compiled to dist/server/, so the resource folder is two levels up.
const map = JSON.parse(readFileSync(join(__dirname, "..", "..", "maps", "maleshov.json"), "utf8"));
const edits = LevelEdit.applyMap(map);
console.log(`applied ${edits.length} level edits`);
```

`applyMap` also takes the map's JSON text instead of the parsed object.

`applyMap` reads only the map's `world` array. Its placed `objects` are
[props](../props/) for `Prop.spawn`, and its `areas` are for `Area.create`.

## What an edit looks like

Each entry of a map's `world` array is one edit, and `LevelEdit.apply` takes
the same shape:

```json
{
  "kind": "brush",
  "name": "objects/manmade/structures/logistical/gate/gate_beams_a_door_left.cgf",
  "at": [490.09, 398.59, 109.80],
  "hidden": true
}
```

| Field | Meaning |
| --- | --- |
| `kind` | `"brush"` (default) for static level geometry, `"entity"` for a level entity such as a door or a lamp. |
| `name` | A brush's mesh path; the World Builder's Level tab shows it. Required for a brush. |
| `guid` | An entity's level EntityGuid, sixteen hex digits. Required for an entity. |
| `at` | Where the level put the object. A brush has no identity of its own, so its mesh and this position, within 5 cm, are how every client finds it. |
| `hidden` | `true` takes it out of the world. |
| `position`, `rotation`, `scale` | Where it stands instead. Present, the edit is a move. |

`at` and `position` take a `Vector3` or `[x, y, z]`; `rotation` takes a
`Quaternion` or `[x, y, z, w]`.

## Apply the same edit twice

Applying an edit to an object that already has one in the same virtual world
restates it rather than adding a second, so applying a map twice changes
nothing.

## Change or undo an edit

```ts
const edit = LevelEdit.all()[0];
if (edit) {
  edit.hidden = false;                                  // back in the world, keeping any move
  edit.move(new Vector3(491, 399, 110), new Vector3(0, 0, 90)); // Euler degrees, or a Quaternion
  edit.clearMove();                                     // where the level put it again
  edit.restore();                                       // drop the edit: exactly as the level had it
}

LevelEdit.restoreAll(3); // every edit in virtual world 3; returns the count
LevelEdit.restoreAll();  // every edit on the server
```

| Member | Meaning |
| --- | --- |
| `kind`, `name`, `guid` | What the object is. Fixed. |
| `virtualWorld` | Whose players see the edit, fixed when it was applied. |
| `hidden` | Writable: takes the object out or puts it back. |
| `moved` | Whether it stands somewhere else; `move` and `clearMove` change it. |
| `exists` | False once the edit has been restored. |
| `toJSON()` | The entry `LevelEdit.apply` takes to make the edit again. |

`edit.toJSON()` writes exactly a map's `world` entry, so a script that
builds its own edits can save them and apply them again on the next boot.

## Virtual worlds

Both `apply` and `applyMap` take a virtual world as their second argument;
the global one when omitted. Only players in that world see the edit, so an
arena can have its gate open while everyone else's stays shut. See
[Virtual worlds](../../core-concepts/virtual-worlds/).

## When a call fails

| Call | Fails when | Result |
| --- | --- | --- |
| `LevelEdit.apply` | No `name` for a brush, no `guid` for an entity, no `at`, or a number that is not finite. | **Throws**, saying which. |
| `LevelEdit.applyMap` | The value is not a map, or has no `world` array. | **Throws.** |
| `LevelEdit.applyMap` | One entry is malformed. | **Throws**, naming the entry by its index. |
| `edit.move` | The edit is gone, or the pose is not finite. | Returns `false`. |

An edit whose object is not in the current level, or is not there at all,
does nothing: each client keeps it waiting and applies it if the object ever
streams in.

:::note[From far away]
Up close the object is gone. From far off, the level's baked distant view of
the area can still show it until the player comes near, the same as for an
edit made in the World Builder.
:::

## Related

- [Props](../props/), to put new objects in the gap
- [Lock doors, open gates](../doors-and-gates/), for the gates the game can animate
- [Virtual worlds](../../core-concepts/virtual-worlds/)
- [LevelEdit reference](../../reference/server/classes/LevelEdit.md)
