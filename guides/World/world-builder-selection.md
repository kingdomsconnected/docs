---
title: Select objects in World Builder
description: Select many objects by box, lasso, brush, area or likeness, filter what the tools take, and change the editor's keys.
sidebar:
  label: Selecting objects
  order: 48.85
---

Select a stand of trees, every barrel in a yard or one kind of fence along a
road, then move, delete or layer them in one step. To clear one kind of tree
from a hillside:

1. Click one of the trees.
2. In the **Object** tab, click **Select similar nearby**. Every tree with
   the same mesh within 50 metres is selected.
3. Press **Delete**. One **Ctrl+Z** brings them all back.

## Pick and drag

A click always picks one object: anything you placed, or one of the level's
own brushes, plants or entities. **Ctrl** + click adds an
object to the selection or takes it out. The gizmo sits on the first object,
and the rest move, turn and scale with it.

A drag with the left mouse button selects many. Choose what it does under
**Drag** on the toolbar:

| Drag | What it selects |
| --- | --- |
| **Box** (default) | Everything whose position is inside the rectangle on screen, within **Box and lasso reach** of the camera. |
| **Lasso** | Everything inside the outline you draw, within the same reach. **L** switches between box and lasso. |
| **Brush** | Whatever the brush passes over, the first plant it passes over, and everything standing within **Brush radius** of the ground under it. **B** turns the brush on or off. |

A box or lasso replaces the selection; hold **Ctrl** to add to it instead.
A brush stroke adds, so a second stroke continues where the first stopped.
Hold **Shift** with any of them to take objects out. **Escape**, or a click
on empty ground, clears the selection.

The brush is drawn as a circle on the ground. It takes a tree by its crown,
however high above the trunk the crown is. A click on a crown does not take
the tree, so trees cannot steal clicks from what stands under them.

## Filter what the tools take

**Selection settings**, on the toolbar, holds the tools' sizes and the
filter that box, lasso, brush, **Select similar** and **Select objects
inside this area** all use.

| Setting | What it does |
| --- | --- |
| **Brush radius** | 0.25 to 50 metres, 3 by default. |
| **Box and lasso reach** | How far from the camera a box or lasso reaches, 5 to 250 metres, 150 by default. |
| **Visible only** | Leaves out objects the camera cannot see, behind a wall or under a roof. Off by default. |
| **Props**, **Effects**, **Lights**, **Brushes**, **Vegetation**, **Entities** | The kinds of object to take. The last three are the level's own. |
| **Search** | Words that must match. A word with a leading `-` must not appear. |
| **Mesh**, **Class** | An exact mesh path or entity class. **From selection** fills either in from the selected object. |
| **Group**, **Layer**, **Physics** | A placed group, a layer, or a prop's physics. |
| **Include objects taken out of the world** | Also takes level objects you deleted. Off by default. |

**Clear filter** resets it. **Select all matching within reach** selects
everything around the camera that the filter lets through.

To select only trees, leave only **Vegetation** ticked, press **B** and
paint over them. The ground, rocks and buildings you pass over stay out. To
take one kind of tree, also select one and click **From selection** beside
**Mesh**.

## Select similar objects or an area's contents

**Select similar nearby**, in the **Object** tab, selects every object with
the same mesh as the selected one within the **Radius** under **Select
similar** in **Selection settings**: 50 metres by default, up to 250. That
section's **Select similar to the selected object** does the same. A level
entity without a mesh matches by class. Hold **Ctrl** to add or **Shift** to
take out. The filter's layer, group, search words, physics and hidden
setting still apply; the selected object decides the kind, mesh and class.

In **Areas**, select one drawn area and click **Select objects inside this
area** to use its shape as the boundary, with the same filter.

## Limits

- Selection tools add up to 5000 objects.
- They find the level's own objects within 250 metres of the camera along
  each axis. A crowded stretch is searched in smaller pieces, and the status
  line says when a search was still cut short.
- Level objects a tool selected but nothing changed are let go the next time
  you use a selection tool, so they never reach the saved project.
- Grass and small plants are merged into the level's terrain detail and
  cannot be selected.

## Undo and redo select what they changed

**Ctrl+Z** and **Ctrl+Y** select the objects the step changed, when they
still exist. Undo a move and that prop is selected again, even one that is
hard to click beside something larger. Undoing a deletion selects what came
back. When nothing the step changed is left, for example after undoing a
placement, the selection stays as it was.

## Change the editor's keys

1. Open the **Keys** tab.
2. Click the key beside an action.
3. Press the new key together with any **Ctrl**, **Shift** or **Alt** it
   needs.

**Escape**, a click elsewhere, flying or leaving the tab cancels. **Clear**
unbinds a row and **Default** restores it. The **W E R** button puts the
move, rotate and scale tools on W, E and R and turns the mesh being placed
with T. **Default: 1 2 3** puts every key back.

| Action | Default | W E R |
| --- | --- | --- |
| Move tool, Rotate tool, Scale tool | **1**, **2**, **3** | **W**, **E**, **R** |
| Turn the mesh being placed | **R** | **T** |
| Local or world axes | **G** | **G** |
| Snapping | **X** | **X** |
| Frame the selection | **F** | **F** |
| Drop to the ground | **End** | **End** |
| Delete, or take the level's own out | **Del** | **Del** |
| Duplicate | **Ctrl+D** | **Ctrl+D** |
| Undo, Redo | **Ctrl+Z**, **Ctrl+Y** | **Ctrl+Z**, **Ctrl+Y** |
| Save the project, Save the project as | **Ctrl+S**, **Ctrl+Shift+S** | **Ctrl+S**, **Ctrl+Shift+S** |
| Copy the selection as API calls | **Ctrl+C** | **Ctrl+C** |
| Put the selection on the active layer | **Ctrl+L** | **Ctrl+L** |
| Brush selection on or off | **B** | **B** |
| Drag selects by box or by lasso | **L** | **L** |
| Select similar nearby | none | none |

A key without **Ctrl** or **Alt** does nothing while you fly, so the fly keys
stay free. When two actions share a key, both happen and the tab warns
about it. **Escape**, the mouse, **F7** and **Ctrl+Shift+Z** for redo cannot
be changed.

Keys are saved for you rather than for a project, in
`maps/editor.settings.json` beside `KCDCClient.dll`. The same file keeps the
gizmo tool in hand, **Keep proportions**, whether the key help shows, the
**Drag** choice, the brush radius, reach, similar radius and **Visible only**.

[MCP](../world-builder-mcp/#select-many-objects) has the same region
selection tools and can read and change the keys.
