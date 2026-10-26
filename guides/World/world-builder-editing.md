---
title: Organize a World Builder project
description: Align and organize a scene, set up placed doors, furniture and items, and copy, convert or swap the level's own objects.
sidebar:
  label: Grid, favorites and layers
  order: 48.8
---

Use snapping to align a scene, collect its assets in favorite folders, and
lock finished objects into layers. These editor settings stay with your
World Builder project. The same **Object** tab also sets up placed doors,
furniture and items, and turns the level's own objects into props or swaps
them for another mesh.

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
2. Select the props, effects, lights or level objects you want to organize.
3. Make your layer active and click **Assign selection to active layer**,
   or press **Ctrl+L**.
4. Lock the layer to leave those objects visible while preventing edits.

Selecting a custom layer lists its members. Click an editable member to
select it; **Ctrl** + click adds it to the selection. Hidden layers cannot
be selected or edited, and locked layers cannot be edited. The same rules
apply to MCP tools.

**Default** contains unassigned objects and cannot be renamed or deleted.
New props, effects and lights start there even when a custom layer is
active. A hidden layer also turns its lights off. Keep
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

## Set up doors, furniture and items

The server builds what you place from the Library's `doors`, `interactive`
and `items` folders as working objects. They keep their own size, so
**Ctrl** + wheel, random size and the placement physics setting do nothing.
In hand, a door leaf or a worn item previews as a box. Once placed, a door
shows its leaf, an item its mesh (a worn item stays a small box), and an
interactive object stands assembled as players will see it.

Select one and the **Object** tab shows the settings its export carries
instead of Scale and Physics. Each change is one undo step.

| Setting | For | What it does |
| --- | --- | --- |
| **Name** | All | What a server script finds it by, up to 64 bytes. Its ID changes every time the server starts. |
| **Locked** | Doors | Whether the door starts locked. Off by default. |
| **Can be picked** | Doors | Whether players can pick the lock. On by default. |
| **Lock** | Doors | **No lock**, **Bolt on one side**, **Bolt and keyhole** (the default) or **Keyhole on both sides**. |
| **Own difficulty** | Doors | Lockpicking difficulty from 0 (easiest) to 1 (hardest). Off uses the leaf's own. |
| **Key** | Doors | The item class GUID of the key that opens it. Empty for none. |
| **Amount** | Items | Units in the stack, 1 to 10000. An item the game does not stack must use 1. |
| **Quality** | Items | The game's grade, or 0 for the class's own. |
| **Own health**, **Own condition** | Items | From 0 to 1. Off uses the class's own. |

Seats, beds, the dice table and crafting stations take only a name. A door
is only the leaf, with no frame or wall, so hang it in a doorway or build
one around it. The level's own doors and stations are level objects: delete
one like any other, and the export takes it out on the server too. The
[furnishing tutorial](../../tutorials/furnish-with-world-builder/)
and [item tutorial](../../tutorials/place-items/) take a scene through
export, and [world resources](../world-resources/) shows how scripts find
what an export placed. Scripts place the same objects with
[Hang doors](../hang-doors/), [Seats and stations](../smart-objects/) and
[Put items on the ground](../../players/items/#put-items-on-the-ground).

## Select an object behind overlapping decoration

**Level > Nearby > Prefer solid objects** starts enabled. It favors solid
objects such as buildings when their collision overlaps decoration bounds.
Turn it off to pick non-solid decoration in front of a wall, or select the
object directly from the nearby list. This choice stays in the project.

## Turn a level object into a prop

Select a level object, such as a fence, cart or tree, and use the
**Object** tab:

- **Copy as a prop** (**Ctrl+D**) places an editable static prop of the
  same mesh beside it. The copies become the selection.
- **Convert to a prop** takes every selected level object out of the world
  and puts such a prop where each one stood, in one undo step. Undo brings
  the originals back and removes the props.

Both work only for meshes in the asset library. Characters and other
objects without a library mesh are skipped, and the status line says how
many were converted. A level brush can use a different material from its
mesh's own, and the prop does not carry that change. Neither button works
on an object you deleted or swapped.

## Swap a level object for a mesh

Put a stump where a tree stood, or a ruin where a house was:

1. Select the level object.
2. In the **Object** tab, type in the **Swap for a mesh** box. It searches
   the asset library.
3. Click a result.

The object goes out of the world with its collision, and the chosen mesh
stands in its place as solid static scenery, with the object's position,
rotation and scale. The mesh follows the object if you move it. **Take the
swap back** removes it again, and **Ctrl+Z** undoes a swap like any other
edit.

The swap is saved with the project and exported as the level edit's
`model`, so a server running the export makes it for every player. From
far off, the level's simplified distant mesh can still show the original.
Grass and small plants cannot be swapped. Scripts make the same change with
[level edits](../level-edits/), and the
[swap tutorial](../../tutorials/swap-level-objects/) shows both ways.

:::tip[Swap or convert?]
Swap to replace an object with a different mesh; the swap stays tied to that
level object. Convert to get an editable prop of the same mesh that you can
move, resize or give other physics.
:::

## Restore deleted level objects

**Level > Deleted** lists removed level objects even outside the nearby
radius or after they stream out. Saved deletions return when you reopen the
project. Search by name, class or mesh; double-click a row to frame it.
**Restore** brings back that object while keeping its move. Swapped objects
are listed as **Swapped**, and **Unswap** gives one back. **Include moved
objects** also lists objects moved without deletion. **Restore all level
edits** undoes every level-object move and deletion, including filtered rows.

Continue with [selecting many objects](../world-builder-selection/),
[areas and collision](../world-builder-areas/),
[light and weather](../world-builder-environment/), or
[exporting the project](../world-builder/#export-to-a-multiplayer-server).
