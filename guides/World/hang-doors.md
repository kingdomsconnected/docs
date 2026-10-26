---
title: Hang new doors
description: Hang working doors where the level has none, choose their lock and key, save them between runs and take them down.
sidebar:
  label: Hang doors
  order: 43.2
---

A server script can hang a door where the level has none: a cell door in a
jail you built, a gate leaf in a new fence. Players open it, lock it and pick
it as they do the level's own doors, and the server judges every use by the
same rules.

```ts
// A locked cell door that opens to one key, which the player is given.
const JAIL_KEY = "e38a7692-c34b-4ed4-a65e-057e274931af"; // kralovskeStribro_minterJailKey

const cell = Door.spawn({
  model: "lvl3_door_prison_left",
  position: [3101.2, 815.4, 57.3],
  rotation: Quaternion.fromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2), // a quarter turn about Z
  name: "jail-cell-1",
  locked: true,
  lock: "key",
  lockDifficulty: 0.8,
  keyItem: JAIL_KEY,
}, player.virtualWorld);

player.giveItem(JAIL_KEY);
console.log(cell.model); // objects/characters/assets/doors/lvl3_door_prison_left.cdf
```

A hung door is only the leaf. It has no frame or wall, so hang it in a
doorway, or build one around it with [props](../props/).

## Choose a leaf

[`Door.models()`](../../reference/server/classes/Door.md#models) lists every
leaf mesh the shipped levels hang doors from, sorted by path. These are the
only models `Door.spawn` takes.

| Field | Meaning |
| --- | --- |
| `path` | The mesh path, `objects/characters/assets/doors/...cdf`. Matched without regard to case. |
| `name` | The file stem, such as `lvl1_door_a_left`. Must match exactly. |
| `hinge` | `left` or `right`. Which side the leaf hangs from is part of the mesh. |
| `placements` | How many doors the shipped levels hang from this mesh. |

## Hang a door

[`Door.spawn(definition, virtualWorld?)`](../../reference/server/classes/Door.md#spawn)
hangs the door, closed, for every player in the virtual world (the global one
when omitted) and returns its [`Door`](../../reference/server/classes/Door.md).
The definition is the same object a [World Builder export](../world-resources/)
stores in its `doors` array:

| Field | Meaning | Default |
| --- | --- | --- |
| `model` | Required. A leaf from `Door.models()`, by path or stem. | |
| `position` | Required. The leaf's pivot, on its hinge side, as the level's own doors stand: a `Vector3` or `[x, y, z]`, each within 16384 of the origin. | |
| `rotation` | Which way it faces: a `Quaternion`, `{ x, y, z, w }` or `[x, y, z, w]`. | No rotation. |
| `name` | What a script finds it by, up to 64 bytes of UTF-8. `door.name` reads it. | `spawned_door_<n>` |
| `locked` | Whether it is hung locked. | `false` |
| `lock` | What each side takes to get through while it is locked; see below. | `boltAndKey` |
| `lockpickable` | Whether its keyhole can be picked. | `true` |
| `lockDifficulty` | How hard the lockpicking minigame is, from 0 to 1, read in fifths from very easy to very hard. | The game's own. |
| `keyItem` | The item class GUID of a key that opens it, as `player.giveItem` takes it. | None. |

`new Quaternion(w, x, y, z)` takes `w` first, while the array form is
`[x, y, z, w]`.

The rest of the door API works on a hung door as on a level door: `locked`,
`setOpen`, `lockedByServer`, the `doorInteract` event. See
[Lock doors, open gates](../doors-and-gates/). A hung door belongs to no level
area, so its `areas` is empty, and `door.spawned` is `true`.

## Locks

| `lock` | Front | Back |
| --- | --- | --- |
| `none` | Nothing. | Nothing. |
| `bolt` | A bolt. | Nothing. |
| `boltAndKey` | A bolt. | A keyhole. Most of the level's doors are like this. |
| `key` | A keyhole. | A keyhole. |

The door's forward axis is its local +Y after `rotation`. The front is the
side that axis points away from, so the keyhole of a `boltAndKey` door is on
the side +Y points to. A locked `none` door opens only from a script, with
`door.setOpen(true)`.

A key in `keyItem`, or a lockpick, opens a door hung with `locked: true`, as
on the level's doors. Setting `door.locked = true` is the server's own lock,
which is separate: a key and a player's own unlock do not open it, and a
lockpick still does. A hung door never opens to the generated home or shop
key, and no home area locks it at night.

## Find it, save it, take it down

A hung door's GUID comes from a counter and changes every run, so find the
door by its name:

```ts
const cell = Door.all().find((door) => door.spawned && door.name === "jail-cell-1");
```

`door.toJSON()` returns the definition it was hung with, `locked` set to
whether it is locked now; it is `null` for a level door. The server keeps
nothing past a restart, so store that in your own save data and pass it to
`Door.spawn` when the server starts.

`door.destroy()` takes a hung door down for good, and drops it from its
export's `doors`. A hung door belongs to the resource that hung it and goes
when that resource stops. Doors in a World Builder export belong to the
server and are hung in the global world on every start.

## NPCs and hung doors

Server-spawned NPCs walk the level's navigation mesh, which names the door in
each of the level's doorways; an NPC opens that door as it arrives, or goes
around it while it is locked. A hung door is not in that mesh:

- Hung where the level has no doorway, NPCs never open it. Where the ground
  is walkable, their paths cross the spot as if nothing stood there, and they
  walk into the closed door.
- Hung in the doorway of a level door you [took out](../doors-and-gates/#take-a-level-door-out),
  NPCs treat the doorway as open and walk through the new door even while it
  is closed or locked.

Players are not affected.

## When a call fails

| Call | Fails when | Result |
| --- | --- | --- |
| `Door.spawn` | `model` not in `Door.models()`, `position` missing or not finite, `rotation` not a finite quaternion, `name` over 64 bytes, `lock` not one of the four, `lockpickable` not a boolean, `lockDifficulty` outside 0 to 1, or `keyItem` not an item class. | **Throws**, saying which. |
| `door.toJSON()` | A level door. | `null`. |

A hung door's model, position and lock type are fixed: to change one, destroy
the door and hang it again.

## Related

- [Lock doors, open gates](../doors-and-gates/), locking, opening and removing the level's doors
- [Place seats, beds and crafting stations](../smart-objects/), the same idea for furniture
- [Items: give, take and drop](../../players/items/), handing players the key
- [Find paths on the navigation mesh](../../npcs-and-animals/navigation/), how NPCs find their way through doors
- [Door reference](../../reference/server/classes/Door.md)
