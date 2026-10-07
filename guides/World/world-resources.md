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
effects, level edits and areas, and registers its patrol definitions.
It does not spawn NPCs or decide what an area means.

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
| `world.props`, `world.effects`, `world.levelEdits` | Existing `Prop`, `Vfx` and `LevelEdit` handles. |
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
disappear from later reads. `loaded` stays true even if every object is gone.

## Keep ownership clear

The server owns loaded exports. Stopping a script leaves their objects and
route definitions in place. Your resource should remove the NPCs, timers
and other objects it creates, while leaving the exported scene available
for its next start and for other resources.

Runtime edits are held in memory. They do not update the `.world.json` or
your editable project. Loading, replacing or removing a whole export
requires changing its file or configuration and restarting the server.

Continue with [a village patrol](../../tutorials/world-builder-patrol/),
[a guarded area](../../tutorials/world-builder-sentry/) or
[an NPC walking tour](../../tutorials/world-builder-tour/).
