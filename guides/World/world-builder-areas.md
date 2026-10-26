---
title: Draw and edit gameplay areas
description: Shape and group areas in World Builder, give them stable IDs, and use the exported zones in server scripts.
sidebar:
  label: World Builder areas
  order: 48.6
---

Draw an area around a yard, checkpoint or hunting ground in World Builder.
Give it an ID your server resource can use for entry rules and NPC behavior.

## Create an area

In **Areas**, choose **+ Box**, **+ Shape** or **+ Sphere**. Draw it in the
world, select it, and set its ID and name in the inspector. Use IDs such as
`village.yard`, keeping them unique across your exports and scripts.

By default, an area is a region for scripts to test. Enable **Collision** to
add invisible walls around it. Drawing an area does not
spawn an NPC or make native AI enforce a gameplay rule. Labels and metadata let your
game mode describe its purpose. A virtual-world setting can restrict it to
one world; leaving that unset makes it available in every world.

## Edit the shape

| Select | Edit |
| --- | --- |
| Polygon point | Drag its arrows or choose **Point 1**, **Point 2**, etc. in the inspector. |
| Polygon edge or midpoint | Drag to move both endpoints together. |
| Polygon edge | Double-click to insert a point, or use **Split selected edge** for its midpoint. |
| Sphere **Radius** handle | Drag the arrow to resize the sphere. |
| **Box face** handle | Move one face while its opposite stays fixed. |
| Polygon **Height** handle | Raise or lower the ceiling. |

**Delete** removes a selected point or both ends of a selected edge. If
fewer than three polygon points would remain, it removes the entire area.
**Escape** or **Move whole area** returns to the whole-area gizmo.

Translation snap applies to new areas, whole-area moves and handles. Hold
**Shift** while dragging to put a whole area's bottom on the ground; points
and edges snap directly to the surface. **Shift** while clicking **+ Box**,
**+ Shape** or **+ Sphere** grounds the new area. Ground snapping takes
precedence over the vertical grid step and ignores the area's own collision.
If no ground is found, the translation stays where you moved it.
Keep the vertical bounds high enough to include a
standing body, and test entry from both sides of the boundary.

## Make an invisible boundary

Select an authored area and enable **Collision**. Boxes, polygons and spheres
block crossing from either side while leaving their interior empty. Turn on
**Show collision**, beside **Show drawn areas**, to shade what the selected
areas build, then press **F7** and walk against the boundary to check it.

Boxes and polygons get side walls only unless you add a plate:

| Setting | Effect |
| --- | --- |
| **Floor** | Adds a plate across the whole inside, at the bottom. Off by default. |
| **Ceiling** | Adds a plate across the whole inside, at the top. Off by default. |
| **Wall thickness** | 0.2 metres by default, from 0.05 to 2, centred on the drawn outline. Plates use it too. |

Turn on a floor or ceiling only when players must not get under or over the
walls. A plate is flat, so over sloping ground it can sit just above the
ground in one place and within reach overhead in another. Spheres are always
one closed shell, so the two options do nothing for them. A very large
sphere is too detailed to shade; its outline still shows.

:::caution[Keep a ceiling above head height]
Collision is solid to the game's combat checks as well as to movement. A
ceiling less than about 2 metres above where a player stands blocks the
overhead attack directions, and the Areas tab warns about this while
**Ceiling** is on. The ceiling is the area's top (a polygon's **Height** or
a box's top face), and its underside sits half the wall thickness lower. A
wall only gets in the way of attacks within about a metre of it.
:::

Collision starts disabled on new areas and existing projects. Areas saved,
exported or created by scripts before **1.7.1** read as walls only, with
0.2 metre walls; earlier builds also closed the floor and ceiling, so turn
those on to get a plate back. Players and the server must update together,
because an older client still builds both plates.

Moving or reshaping the area updates its collision; undo restores the
settings. Turning off **Enabled** disables both the trigger and collision.
The settings survive project saves, blueprints, world exports and copied
API calls.

Box dimensions and sphere radii must exceed the wall thickness. Polygons
need a height above it and a simple outline without crossing or repeated
edges; concave outlines are supported. Their floor and ceiling remain
horizontal. Spheres use a polygon mesh, which becomes coarser on very large
spheres.

Enabling or moving a wall does not move a player already intersecting it
to a chosen side. Test boundaries before opening the area to players.

Server scripts can create and change the same boundary:

```ts
const boundary = Area.create({
  id: "courtyard.boundary",
  type: "box",
  position: new Vector3(2500, 1500, 100),
  min: new Vector3(-10, -10, 0),
  max: new Vector3(10, 10, 8),
  collision: true,
  collisionThickness: 0.5,
});

boundary.collision = false; // Keep the area, remove its physical boundary.
boundary.collision = true;
boundary.collisionCeiling = true; // Also close the top.
```

| Property | Default | Meaning |
| --- | --- | --- |
| `collision` | `false` | Builds the boundary. |
| `collisionFloor` | `false` | Box and polygon only: closes the bottom with a plate. |
| `collisionCeiling` | `false` | Box and polygon only: closes the top with a plate. |
| `collisionThickness` | `0.2` | Thickness in metres, from 0.05 to 2. |

Each works in the [`AreaDefinition`](../../reference/server/interfaces/AreaDefinition.md)
and as a property of an [`Area`](../../reference/server/classes/Area.md).
Invalid shapes and options are rejected: `Area.create` throws, and an
assignment throws and leaves the area as it was. `area.enabled = false`
disables the boundary until re-enabled; `area.toJSON()` includes all four
settings. Level areas are read-only, so make an editable copy before adding
collision. Server boundaries follow the area's virtual world and reach later
joiners. They disappear when the area is destroyed or its world resource
unloads.

MCP's `wb_area_create` and `wb_area_update` accept the same four fields
inside the area definition.

## Group and reuse areas

**Shift-click** an outline or list row to add or remove an area from the
selection. Move and rotate selected areas together; scaling a selection
preserves its proportions. Select one area to edit its individual handles.

Enter a **Group name**, then choose **Group selected**. **Area group**
filters the list and **Select group** selects its members. **Ungroup
selected** only removes the selected areas from their groups.
**Duplicate selected** or **Ctrl+D** copies drawn areas.

Use **Copy selected definitions**, **Copy group definitions** or **Copy all
definitions** with **Paste definitions** to reuse them. Pasting gives
colliding IDs a free suffix, so check IDs before connecting scripts.
The corresponding **as API calls** buttons copy `Area.create(...)` calls.
Groups organize the editor and stay in the project; exports and API calls
omit them.

With one drawn area selected, **Select objects inside this area** selects
the objects within its shape that the
[selection filter](../world-builder-selection/#filter-what-the-tools-take)
lets through.

## Copy a game area

The tab can show the level's trigger areas, unions and smart areas.
Choose **Create editable copy** to make a custom polygon at the same place
with its name, labels and vertical bounds. A union becomes separate polygons
for its members. Shapes outside custom-area limits, including those with
more than 256 corners, are skipped with a notice.

The original area stays unchanged. A copied outline does not transfer the
original game's ownership, quests or crime behavior to your new zone.

## Export and use it

Save the project, export its `.world.json`, configure it and restart the
server as described in [World Builder](../world-builder/).
Look up the area once [world resources are ready](../world-resources/):

```ts
function findYard(): void {
  const yard = WorldResource.find("village")?.areas
    .find(area => area.id === "village.yard");
  if (!yard) {
    console.log("Export village.yard from the village project first.");
    return;
  }
  console.log(`${yard.name}: ${yard.players.length} players inside`);
}
if (WorldResource.ready) findYard();
else Events.once("worldResourcesReady", findYard);
```

`containsPlayer` tests a body's position and world. `contains(position)`
tests geometry alone. Crossing events can include bodies from other worlds;
check `matchingVirtualWorld` when handling them. See
[Markers and trigger zones](../markers/) for events and queries, and
[Gathering](../gathering/) to list, remove or respawn the herbs inside an
area.

Build [a guard for an exported yard](../../tutorials/world-builder-sentry/)
to combine the area with a patrol route and NPC combat.
