---
title: Remove or move the level's own objects
description: Take the game's own walls, trees, gates and props out of the world, move them or swap them for another mesh, for every player, from a script or a World Builder export.
sidebar:
  label: Level edits
  order: 48
---

The level ships thousands of objects a script did not spawn: walls, fences,
trees, static gates that never open, rubble in a doorway. A level edit takes
one of them out of the world, moves it, swaps it for another mesh, or a mix
of those, for every player in a virtual world. Collision goes with it: an
object taken out is neither drawn nor solid.

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
every boot. An edit belongs to the resource that applied it, and is undone for
every player when that resource stops; edits from a World Builder export
belong to the server. Edits usually come from a map made in the World Builder
rather than typed out by hand.

## Open the World Builder

Open **World Builder** from the main menu to edit offline. **F7** switches
between editing and player control. On a multiplayer server, a server script
must grant access to each player with `player.setWorldBuilderEnabled(true)`.

See [Create maps with World Builder](../world-builder/) for placing objects,
saving projects, blueprints and multiplayer access.

## From the World Builder to every player

Select a level object and press **Del** to remove it; press **Del** again to
put it back. Use the gizmo to move, rotate or scale it.

Save the editable `.project.json`, then choose **Export world resource** in
the **Project** tab. Add the exported `.world.json` to `mod.world_resources`
in `server.json` and restart the server. It loads everything in the export,
level edits included, automatically. Follow the
[export steps](../world-builder/#export-to-a-multiplayer-server).

For individual scripted edits, select the objects and use **Copy selection
as API calls** to copy server `LevelEdit.apply` calls. Apply them from your
server resource each time it starts.

`LevelEdit.applyMap` remains useful for scripts reading older maps. It takes
a parsed map or JSON text and reads only its `world` array; it does not load
a whole world resource or an editable project.

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
| `model` | A mesh that stands in its place: a prop catalog path or a mesh this server streams. |
| `position`, `rotation`, `scale` | Where it stands instead. Present, the edit is a move. |

`at` and `position` take a `Vector3` or `[x, y, z]`; `rotation` takes a
`Quaternion` or `[x, y, z, w]`.

## Swap an object for another mesh

With `model`, the object goes out of the world, collision included, and the
mesh stands where it stood (or at `position`) as solid static scenery: a stump
where a tree was, a ruin where a house stood. The easiest way to name the
object is a trace: a hit's
[`levelObject`](../raycasts/#tell-a-tree-or-a-rock-apart) is already a
definition, so spread it and add what to do.

```ts
// Swap whatever the player looks at for a stump, in the player's world.
async function stumpLookedAt(player: Player): Promise<LevelEdit | null> {
  const look = player.lookDirection;
  const p = player.position;
  const from = new Vector3(p.x + look.x * 0.75, p.y + look.y * 0.75, p.z + 1.6 + look.z * 0.75);
  const to = new Vector3(p.x + look.x * 30, p.y + look.y * 30, p.z + 1.6 + look.z * 30);
  const trace = await World.raycast(player, from, to, { mode: "anything" });
  const object = trace.hit?.levelObject;
  if (!object) return null;
  return LevelEdit.apply({ ...object, model: "objects/natural/vegetation/trees/stumps/tree_stump_a.cgf" }, player.virtualWorld);
}
```

`levelObject` carries the level's own `rotation` and `scale`, but an edit
reads those only with a `position`, so spreading it moves nothing. Assigning
`edit.model` swaps an existing edit's mesh, and assigning `""` gives the
object back. The World Builder's **Swap for a mesh** exports the same
`model`. Grass and small plants are part of the ground and cannot be swapped.
The replacement is static; to make something fall, swap it and spawn a
`rigid` copy, as in [Fell a tree](../prop-physics/#fell-a-tree).

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
| `model` | Writable: the mesh standing in its place, or empty. |
| `exists` | False once the edit has been restored. |
| `toJSON()` | The entry `LevelEdit.apply` takes to make the edit again. |

`edit.toJSON()` writes exactly a map's `world` entry, so a script that
builds its own edits can save them and apply them again on the next boot.

## Virtual worlds

Both `apply` and `applyMap` take a virtual world as their second argument;
the global one when omitted. Only players in that world see the edit, so an
arena can have its gate open while everyone else's stays shut. See
[Virtual worlds](../../core-concepts/virtual-worlds/).

## Doors and stations

Taking out one of the level's doors with `Door.remove`, or one of its dice
tables or crafting stations with `SmartObject.remove`, makes an `entity` edit
on it. Those edits show in `LevelEdit.all()`, and `restoreAll` puts the door
or station back. An edit that swaps a level door for another mesh counts as
removing the door. A station edit takes out only the station; the furniture
around it is level geometry, which a brush edit takes out. See
[Lock doors, open gates](../doors-and-gates/#take-a-level-door-out) and
[Place seats, beds and crafting stations](../smart-objects/#take-a-level-station-out).

## When a call fails

| Call | Fails when | Result |
| --- | --- | --- |
| `LevelEdit.apply` | No `name` for a brush, no `guid` for an entity, no `at`, or a number that is not finite. | **Throws**, saying which. |
| `LevelEdit.apply`, `edit.model = path` | `model` is neither in the prop catalog nor streamed by this server. | **Throws.** |
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
- [Raycasts and nearby entities](../raycasts/), to name the object a player points at
- [Push props and react to weapon hits](../prop-physics/), felling a tree with an axe
- [Lock doors, open gates](../doors-and-gates/), for the gates the game can animate
- [Virtual worlds](../../core-concepts/virtual-worlds/)
- [LevelEdit reference](../../reference/server/classes/LevelEdit.md)
