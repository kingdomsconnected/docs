---
title: Organize a World Builder project
description: Use local axes, snapping, a reference grid, favorite folders and editor layers while building a scene.
sidebar:
  label: Grid, favorites and layers
  order: 48.8
---

Use snapping to align a scene, collect its assets in favorite folders, and
lock finished objects into layers. These **1.6.6** editor settings stay with
your World Builder project.

## Align objects with axes and snapping

Choose **World axes** or **Local axes** in the top toolbar, or press **G**.
Move and rotate gizmos follow that choice. Scaling always uses local axes.
Select move, rotate or scale with **1**, **2** or **3**. **X** toggles snapping
for the current tool; each tool keeps its own increment.

For example, enable movement snap at `0.5` metres to arrange a row of props.
Hold **Shift** while translating to put their bottoms on the ground. Ground
snapping also works for areas and patrol waypoints; effects and waypoints
use their position. Groups retain their relative positions. If no ground is
found, the translation stays where you moved it.

## Show a reference grid

Enable **Grid** beside **Snap**. Its horizontal lines follow the camera in
whole cells while remaining aligned to world coordinates. The grid starts
disabled and sits two metres below the camera by default.

In **Grid settings**, keep **Match move snap** on to use the translation
increment even while rotating or scaling. Turn it off to choose a separate
**Spacing (m)**. Adjust the height offset and **Line width (px)** for the
scene. Line width starts at 1.5 pixels and accepts 1 to 8 pixels.

Showing a grid does not enable snapping or change placement. Set the snap
control as well if you want objects to move in those increments.

## Keep the project's assets together

In **Library** or **Effects**, create a favorite folder such as `Market` or
`Torchlight` and make it active. Click an asset's star to add or remove it
from that folder. Choose the favorites list to place one of those assets.
Right-click a favorite to move it to another folder.

You can rename or delete custom folders. Deleting one removes its saved
favorites after confirmation; placed objects stay in the scene. The root
**Favorites** folder remains available. Prop and effect favorites have
separate folders.

Folders are saved in the project and recovery copy and participate in undo.
Opening another project switches to its favorites. **Recently placed** stays
a local library preference shared across projects.

## Put finished objects on a layer

1. Open **Layers** and create a custom layer, such as `Market stalls`.
2. Select the props, effects or level objects you want to organize.
3. Make your layer active and click **Assign selection to active layer**,
   or press **Ctrl+L**.
4. Lock the layer to leave those objects visible while preventing edits.

Selecting a custom layer lists its members. Click an editable member to
select it; **Ctrl** + click adds it to the selection. Hidden layers cannot
be selected or edited, and locked layers cannot be edited. The same rules
apply to MCP tools.

**Default** contains unassigned objects and cannot be renamed or deleted.
New props and effects start there even when a custom layer is active. Keep
Default visible and unlocked while placing, then assign the new objects.
Areas and patrol authoring also follow Default's visibility and lock state.
Copies inherit their source layer.

Deleting a custom layer moves its objects back to Default. It does not
delete them. Layer settings and membership stay in the project.

:::note[Hidden layers still export]
Visibility only controls the editor view. Hidden objects still appear in
world resource exports, and hiding a layer does not remove collision. To
remove authored content from an export, delete it. To remove an existing
level object, use the editor's level-object deletion tools.
:::

## Select an object behind overlapping decoration

**Level > Nearby > Prefer solid objects** starts enabled. It favors solid
objects such as buildings when their collision overlaps decoration bounds.
Turn it off to pick non-solid decoration in front of a wall, or select the
object directly from the nearby list. This choice stays in the project.

Continue with [areas and collision](../world-builder-areas/),
[light and weather](../world-builder-environment/), or
[exporting the project](../world-builder/#export-to-a-multiplayer-server).
