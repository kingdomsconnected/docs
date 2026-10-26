---
title: Create maps with World Builder
description: Build a map offline, save an editable project, and export its objects, areas and NPC patrol routes to a multiplayer server.
sidebar:
  label: World Builder
  order: 48.5
---

World Builder lets you create maps offline and load them on a multiplayer
server. Place props, effects, lights, working doors, furniture, items and
areas, edit the level's own objects, draw NPC patrol routes, and save
reusable arrangements as blueprints.

## Start an offline project

1. Open **World Builder** from the main menu.
2. Choose Kuttenberg, Trosky or Monastery, then click **New project**.
   Monastery requires its DLC. **Open project** loads an existing project
   using the level saved in that file.
3. Once the level loads, the editor opens automatically. Press **F7** to
   switch to player control and walk around your work. Press it again to
   keep editing. Your project and placed objects stay in the world.

Offline access is always available; no server connection or script is needed.
**Return to menu** ends the offline session and offers to save unsaved changes.
**Load last project** reopens your most recently opened or saved project at
its saved camera position. If the file moved, choose it again with **Open project**.

## Place and edit objects

Use the editor's tabs to choose what to work on:

| Tab | What you can do |
| --- | --- |
| **Library** | Search the game's prop meshes, doors, interactive objects and items. Click a row to pick it up, click in the world to place it, and press **Esc** to stop placing. |
| **Effects** | Browse and place particle effects. Select an effect to adjust it in the **Object** tab. |
| **Lights** | Add point lights and set their color, intensity, radius and shadows. |
| **Level** | Select existing level objects to move or remove them. **Del** removes a selected level object; pressing it again puts it back. You can also [copy, convert, swap or restore](../world-builder-editing/#turn-a-level-object-into-a-prop) them. |
| **Areas** | Draw boxes, shapes or spheres for server scripts to use as areas. |
| **Patrols** | Draw named routes, adjust each waypoint, and preview them with a temporary NPC. |
| **Layers** | Organize placed and level objects, then hide or lock them while editing. |
| **Environment** | Preview the offline project under a chosen hour, sky and rain. |
| **MCP** | Let an AI assistant or your own local program inspect and control the offline editor. See [MCP automation](../world-builder-mcp/) or the [HTTP tutorial](../../tutorials/world-builder-http/). |
| **Keys** | Change the editor's keys. |

Select an object and use the gizmo to move, rotate or scale it. Areas define
regions; your server scripts decide what happens there. See
[Markers and trigger zones](../markers/) for area behavior and
[Level edits](../level-edits/) for scripting changes to existing objects.

Collision updates after scaling pauses, including grouped edits and undo.
Keep proportions when collision needs to match the shape: a stretched prop
uses its largest axis for collision. A model that cannot create collision
reports a placement error; choose **None** for decoration without physics.

| Control | Action |
| --- | --- |
| Hold right mouse | Fly using the game's photo-mode movement keys. Change these in the game's Controls menu. |
| Mouse wheel while flying | Change camera speed. |
| Mouse wheel otherwise | Move the camera toward or away from the point under the cursor. |
| Middle mouse drag | Pan the camera. |
| **Alt** + left mouse drag | Orbit the selection or the point where the drag began. |
| **F** | Frame the selection. |
| **1**, **2**, **3** | Move, rotate or scale with the gizmo. |
| **G** / **X** | Switch world/local axes or toggle snapping for the current gizmo. |
| **Ctrl** + click | Add an object to the selection or take it out. |
| Left mouse drag | Select by box, lasso or brush, as chosen under **Drag** on the toolbar. |
| **Ctrl+Z** / **Ctrl+Y** | Undo / redo. Each step selects what it changed. |
| Hold **Shift** while translating | Snap props, effects, areas, area handles and patrol waypoints to the ground. |

In **Camera**, name a view and click **Remember**. Selecting a saved view
moves only the camera. **Go to the player** moves the camera to the player;
**Bring the player here** moves the player to ground near the camera.
Saved views and the current camera position stay with the project.

**Esc** or right-click cancels prop/effect placement even while a search
field has focus. Release right mouse before holding it again to fly.

These are the default keys; change them in **Keys**. See
[Selecting objects](../world-builder-selection/) for box, lasso and brush
selection, [Grid, favorites and layers](../world-builder-editing/) for
alignment, layers and edits to the level's own objects, and
[Preview light and weather](../world-builder-environment/) for dusk or rain.

## Travel with the game map

In an offline session, click **Map** in the toolbar, then a point on the
map. The editor waits for collision there, then moves the player and the
camera; **Escape** cancels until then, and a wait that fails restores the
camera. Your waypoint, project, selection and the asset in hand are kept.
Travel stays in the loaded region, needs a player who is not riding, cannot
be undone and is unavailable in multiplayer. Choose an open outdoor spot:
the map does not pick an interior floor or check that a spot is walkable.

## Place doors, furniture and items

The **Library**'s `doors`, `interactive` and `items` folders hold door
leaves, seats, beds, the dice table, crafting stations and every shipped
item class. Place them like meshes; the server builds them as working doors,
furniture and stacks players pick up. See
[Set up doors, furniture and items](../world-builder-editing/#set-up-doors-furniture-and-items).

## Light a scene

In **Lights**, click **Add light in front of camera**, then move the light
with the gizmo or the **Object** tab's position fields. Both tabs set its
color, **Intensity** (0 to 100, 1 by default), **Radius (m)** (0.1 to 100,
5 by default) and **Cast shadows** (off by default). A new light is warm
orange. Point lights have no rotation or scale, and each player's game shows
at most 192 lights from the editor and scripts combined. Groups, layers,
undo, blueprints and exports include them. Scripts use [Lights](../lights/).

## Draw areas and patrol routes

Areas support point, edge, face, radius and height handles, selection groups
and editable copies of game areas. Follow [Draw and edit gameplay areas](../world-builder-areas/)
to give your scripts named regions.

In **Patrols**, author **Once**, **Loop** or **Ping pong** routes with
per-waypoint speed and waiting times. Follow [Named patrol routes](../../npcs-and-animals/patrol-routes/)
for preview controls, door behavior and deployment. Routes do not spawn NPCs
until a server script creates and assigns them.

## Save your project

In **Project**, use **Save** or **Save as** to keep an editable
`.project.json` in a folder of your choice. **Ctrl+S** saves;
**Ctrl+Shift+S** saves under another name.

The project keeps your scene, routes, groups, camera views, export settings,
layers, favorite folders, viewport preferences and preview conditions.
Keep it so you can continue editing after deployment.

| File | Purpose |
| --- | --- |
| `.project.json` | Your editable project. Open this to continue working. |
| `.world.json` | An exported world resource for the server to load. |
| `.blueprint.json` | Reusable scene content, including selected patrol routes. |

While there are unsaved changes, the editor writes a recovery copy every
30 seconds to `maps/recovery.project.json` beside `KCDCClient.dll`.
**Recover autosaved project** opens it as an unsaved project; save it under
your own name. There is only one recovery slot, shared by projects.

Use **Open project** for editable projects and **Open blueprint** for reusable
content. The older **Import an older map** section has been removed.

## Reuse groups as blueprints

1. Select props and effects with **Ctrl** + click.
2. In **Blueprints**, choose **Group selection** to move, rotate and scale
   them together. **Ungroup** leaves the objects in place.
3. Choose **Save selection as blueprint** to write a `.blueprint.json`.
4. In this or another project, choose **Open blueprint**, then
   **Place blueprint in front of camera**. Move the copy into position.

Blueprints preserve the arrangement of their props, effects and lights. They exclude
removals and moves of existing level objects, which belong to the original level.
Selected routes can be included too. If an imported route ID collides with
an existing one, it gets a numeric suffix; check it before wiring scripts.

## Export to a multiplayer server

A world resource is a `.world.json` file containing objects and areas to
create and patrol routes to register. It needs no loader script.

1. Save your project.
2. In **Project**, set **Resource name** to `test1` and choose an
   **Output directory** with **Choose export directory...**.
3. Click **Export world resource**. This writes `test1.world.json` in that
   folder. Exporting does not save your editable project.
4. Copy the export to your server folder. For a local server, you can export
   directly into that folder.
5. Merge these settings into the existing `mod` object in `server.json`:

```json title="server.json"
{
  "mod": {
    "level": "kutnohorsko",
    "world_resources": ["test1.world.json"]
  }
}
```

This example uses Kuttenberg. Set `level` to match your project:
`kutnohorsko` for Kuttenberg, `trosecko` for Trosky, or `klaster` for Monastery.
Keep your other server settings and any existing entries in `world_resources`.

Paths are relative to the server's working directory, normally the server
folder. If you copy the file into `worlds/`, use `worlds/test1.world.json`.
Restart the server after adding or replacing an export. The server creates
the content, including doors, interactive objects, items and lights, in the
global world. Props, effects and lights appear as players come within
streaming range, and every prop within 250 metres reaches a player however
densely the map is furnished. A `static` or `none` prop is drawn as far away
as the level draws the same mesh. Level edits reach every player.

To publish changes, reopen the project, edit, save, export again, copy the
updated file to the server and restart it. Server scripts can use the
exported areas and objects; changes made while the server runs are not saved
back to your project or export.
See [Use World Builder exports in scripts](../world-resources/) to wait for
loading and find its areas, objects and routes. The
[village patrol tutorial](../../tutorials/world-builder-patrol/) combines
an exported scene with a script-owned guard.

For a few objects that belong in a script, select them and choose **Copy
selection as API calls**, then paste the calls into a server resource.
This copies only the selection, as `Prop.spawn`, `Vfx.spawn`, `Light.spawn`,
`LevelEdit.apply`, `Door.spawn`, `SmartObject.spawn` and `GroundItem.spawn`
calls. **Areas** has **Copy selected areas as API calls**, and **Patrols**
has **Copy API call** for its selected route.

## Allow building in multiplayer

Access starts disabled for each multiplayer connection. In a **server
script**, call `player.setWorldBuilderEnabled(true)` for a player who may
build. They can then press **F7**. Calling
`player.setWorldBuilderEnabled(false)` revokes access and closes their editor.
Access resets when they disconnect.

The sample game mode provides `/builder` (also `/builder on`) and
`/builder off`. These are test commands available to everyone in that sample.
Your own game mode should decide who may build. The old server-wide
`mod.map_editor` setting is no longer used.

Client scripts can also call `MapEditor.open()`, which returns `"opened"`,
`"alreadyOpen"` or `"disabled"`. `MapEditor.isEnabled()` checks access,
`MapEditor.isOpen()` checks whether the editor is open, and `MapEditor.close()`
closes it. While it is open, it holds the free camera, so
[`NoClip`](../../client-scripting/camera/) cannot use it.

Editing during multiplayer changes the builder's local scene. To share
those changes with everyone, export and deploy them using the steps above.

## If something does not work

| Problem | Check |
| --- | --- |
| **F7** does nothing in multiplayer | Your server script must grant access for this connection. Close chat or other screens that hold the controls, then try from gameplay. |
| The server reports an unknown `mod.world_resources` key | Update to a server build supporting world exports, and use a compatible client. |
| The server refuses to load an export | Read the startup error. Check the path, file format and project level. Use the exported `.world.json`, not the editable project. |
| Other players cannot see your changes | Export again, copy the updated file to the configured path and restart the server. Saving a project alone does not deploy it. |

See [server.json settings](../../hosting-a-server/server-json/#modworld_resources)
for loading several exports or assigning resource names.

## Offline character vitals

Offline World Builder protects your character's vitals while you build. On a
multiplayer server, the server's rules still apply.
