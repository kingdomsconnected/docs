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

An area is a region for scripts to test. Drawing one does not create a wall,
spawn an NPC or make native AI enforce a rule. Labels and metadata let your
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

Hold **Shift** while dragging a translate gizmo to snap to ground. This also
works for points and edges. If no ground is found, the translation stays
where you moved it. Keep the vertical bounds high enough to include a
standing body, and test entry from both sides of the boundary.

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
[Markers and trigger zones](../markers/) for events and queries.

Build [a guard for an exported yard](../../tutorials/world-builder-sentry/)
to combine the area with a patrol route and NPC combat.
