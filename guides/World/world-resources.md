---
title: Use World Builder exports in scripts
description: Find exported objects, areas and patrol routes after world resources load, and use them without duplicating the scene.
sidebar:
  label: World exports in scripts
  order: 48.7
---

Build the scene in [World Builder](../world-builder/), then let a server
resource add its behavior. `WorldResource` gives your script the objects the
server already loaded from each `.world.json`.

```ts
function startScene(): void {
  const village = WorldResource.find("village");
  if (!village) {
    console.log("Add village.world.json to mod.world_resources and restart the server.");
    return;
  }
  console.log(`${village.props.length} props, ${village.areas.length} areas`);
  console.log(village.patrolRoutes.map(route => route.id).join(", "));
}

if (WorldResource.ready) startScene();
else Events.once("worldResourcesReady", startScene);
```

## Load the export

Save the editable `.project.json`, export `village.world.json`, and copy it
to the server. Merge these keys into the existing `mod` object:

```json title="server.json"
{
  "mod": {
    "level": "kutnohorsko",
    "world_resources": ["worlds/village.world.json"]
  }
}
```

The level must match the project. Paths are relative to the server's working
directory. Restart after replacing an export. The server creates its props,
lights, effects, level edits, areas, doors, seats and stations and ground
items, and registers its patrol definitions. Everything but an area bound to
a virtual world goes in the global one. It does not spawn NPCs or decide what
an area means.

The export's default name is its filename without `.world.json`. Names are
case-sensitive. To give a file another name, use an object entry:

```json
{
  "mod": {
    "world_resources": [
      { "name": "village", "path": "worlds/market-square.world.json" }
    ]
  }
}
```

## Wait for the whole scene

Exports load **after script startup**. Before all configured exports load,
`WorldResource.ready` is false, `all()` is empty and `find()` returns null.
Successful loading sets `ready` and emits `worldResourcesReady` once, even
when the configuration contains no exports.

Use the readiness check above at the top level of your resource. A resource
restarted with `ensure` sees `ready` immediately; the event is not replayed.
Do not await the event inside `resourceStart`, since that would wait for
work that starts only after scripts finish starting.

A missing file, wrong level, malformed export or duplicate route ID stops
startup. The server logs the error and does not announce readiness for a
partially loaded scene. Keep exported props and effects alive in spawn
handlers; remove unwanted contents after readiness instead.

## Find the objects your feature uses

| Read | Result |
| --- | --- |
| `WorldResource.all()` | Exports in configuration order. |
| `WorldResource.find(name)` | One export, or null. |
| `world.name`, `world.path`, `world.level`, `world.loaded` | Its name, resolved path, level and registration state. |
| `world.props`, `world.effects`, `world.levelEdits` | Existing `Prop`, `Vfx` and `LevelEdit` handles. `levelEdits` includes the level doors and stations the export takes out. |
| `world.lights` | Existing [`Light`](../lights/) handles. |
| `world.doors` | The [doors the export hangs](../hang-doors/). |
| `world.smartObjects` | The [seats, beds, tables and stations](../smart-objects/) it places. |
| `world.items` | The [ground item](../../players/items/) stacks it lays that nobody has picked up yet. |
| `world.areas` | Existing `Area` handles, including the IDs set in the editor. |
| `world.patrolRoutes` | Existing named `PatrolRoute` definitions. |

Use stable IDs for gameplay references, rather than array positions:

```ts
const village = WorldResource.find("village");
const yard = village?.areas.find(area => area.id === "village.yard");
const route = village?.patrolRoutes.find(route => route.id === "village.guard");

if (yard && route) {
  console.log(`${yard.name}: patrol ${route.name}`);
}
```

Each collection is a fresh array. Editing the array does not change the
export; operating on an object handle changes that object. Removed objects
disappear from later reads, and so do picked-up items and restored level
edits. `loaded` stays true even if every object is gone.

Placed doors and smart objects get new GUIDs on every start, so give them a
name in the editor and find them by it:

```ts
const tavern = WorldResource.find("tavern");
const dice = tavern?.smartObjects.find(piece => piece.name === "tavern-dice");
const cell = tavern?.doors.find(door => door.name === "jail-cell-1");
console.log(`${dice?.stationId ?? "no table"}, ${cell?.locked ?? "no door"}`);
```

## Doors, seats, items and lights in an export

Besides `objects`, `effects`, `world` and `areas`, an export can carry four
more arrays, each optional. Every entry is the object the matching script
call takes:

| Array | Each entry | Read back with |
| --- | --- | --- |
| `doors` | A `DoorDefinition`, as [`Door.spawn`](../hang-doors/) takes it. | `door.toJSON()` |
| `smartObjects` | A `SmartObjectDefinition`, as [`SmartObject.spawn`](../smart-objects/) takes it. | `smartObject.toJSON()` |
| `items` | One stack lying on the ground: `item`, `position`, and optionally `rotation`, `amount`, `name`, `quality`, `health` and `condition`, by the rules of [`GroundItem.spawn`](../../players/items/). | |
| `lights` | A point light: `position`, `color`, `intensity`, `radius` and `castShadows`. See [Lights](../lights/#from-world-builder). | |

```json
{
  "doors": [
    { "model": "lvl1_door_a_left", "position": [3101.2, 815.4, 57.3], "rotation": [0, 0, 0.7071, 0.7071], "name": "jail-cell-1", "locked": true, "lock": "key" }
  ],
  "smartObjects": [
    { "blueprint": "Table/table_dice", "position": [3102.0, 820.5, 57.3], "rotation": [0, 0, 0, 1], "name": "tavern-dice" }
  ],
  "items": [
    { "item": "arrow_crude", "amount": 12, "position": [3103.0, 818.5, 57.3], "rotation": [0, 0, 0, 1] }
  ]
}
```

The server checks every entry before anything spawns. A bad entry stops
startup with an error naming the file and the entry, such as
`Invalid door at doors[0]: ...`, and so does an item class the server does
not know. Each array holds at most 100,000 entries. Because the server loads
the file on every start, items come back after a restart even if players
picked them up.

The level's own doors and stations are taken out by an `entity` entry in the
`world` array, the same level edit `Door.remove` and `SmartObject.remove`
make. The door then shows in `Door.removed()`, and a script that restores it
drops the edit from `levelEdits`.

## Keep ownership clear

The server owns loaded exports. Stopping a script leaves their objects and
route definitions in place, available for the script's next start and for
other resources. What a script spawns itself, such as props, lights, doors and
smart objects, goes when its resource stops.

Runtime edits are held in memory. They do not update the `.world.json` or
your editable project. Loading, replacing or removing a whole export
requires changing its file or configuration and restarting the server.

Continue with [a village patrol](../../tutorials/world-builder-patrol/),
[a guarded area](../../tutorials/world-builder-sentry/) or
[an NPC walking tour](../../tutorials/world-builder-tour/).
