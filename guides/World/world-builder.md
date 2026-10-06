---
title: Create maps with World Builder
description: Build a map offline, save an editable project, and export its props, effects, level edits and areas to a multiplayer server.
sidebar:
  label: World Builder
  order: 48.5
---

World Builder lets you create maps offline and load them on a multiplayer
server. Place props, effects and areas, edit the level's own objects, and
save reusable arrangements as blueprints.

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

## Place and edit objects

Use the editor's tabs to choose what to work on:

| Tab | What you can do |
| --- | --- |
| **Library** | Search the game's prop meshes. Click a mesh to pick it up, click in the world to place it, and press **Esc** to stop placing. |
| **Effects** | Browse and place particle effects. Select an effect to adjust it in the **Object** tab. |
| **Level** | Select existing level objects to move or remove them. **Del** removes a selected level object; pressing it again puts it back. |
| **Areas** | Draw boxes, shapes or spheres for server scripts to use as areas. |

Select an object and use the gizmo to move, rotate or scale it. Areas define
regions; your server scripts decide what happens there. See
[Markers and trigger zones](../markers/) for area behavior and
[Level edits](../level-edits/) for scripting changes to existing objects.

Keep proportions when scaling props if their collision needs to match their
shape. A stretched prop uses its largest axis for collision.

| Control | Action |
| --- | --- |
| Hold right mouse | Fly using the game's photo-mode movement keys. Change these in the game's Controls menu. |
| Mouse wheel while flying | Change camera speed. |
| Mouse wheel otherwise | Move the camera toward or away from the point under the cursor. |
| Middle mouse drag | Pan the camera. |
| **Alt** + left mouse drag | Orbit the selection or the point where the drag began. |
| **F** | Frame the selection. |
| **1**, **2**, **3** | Move, rotate or scale with the gizmo. |
| **Ctrl** + click | Select several props or effects. |
| **Ctrl+Z** / **Ctrl+Y** | Undo / redo. |

The **Camera** tab also lets you save views and move between the camera and
the player. Saved views stay with the project.

## Save your project

In **Project**, use **Save** or **Save as** to keep an editable
`.project.json` in a folder of your choice. **Ctrl+S** saves;
**Ctrl+Shift+S** saves under another name.

The project keeps your scene, groups, camera views and export settings.
Keep it so you can continue editing after deployment.

| File | Purpose |
| --- | --- |
| `.project.json` | Your editable project. Open this to continue working. |
| `.world.json` | An exported world resource for the server to load. |
| `.blueprint.json` | A reusable arrangement of props and effects. |

While there are unsaved changes, the editor writes a recovery copy every
30 seconds to `maps/recovery.project.json` beside `KCDCClient.dll`.
**Recover autosaved project** opens it as an unsaved project; save it under
your own name. There is only one recovery slot, shared by projects.

For an older `maps/<name>.json` file, choose **Import an older map**, then
save the result as a project.

## Reuse groups as blueprints

1. Select props and effects with **Ctrl** + click.
2. In **Blueprints**, choose **Group selection** to move, rotate and scale
   them together. **Ungroup** leaves the objects in place.
3. Choose **Save selection as blueprint** to write a `.blueprint.json`.
4. In this or another project, choose **Open blueprint**, then
   **Place blueprint in front of camera**. Move the copy into position.

Blueprints preserve the arrangement of their props and effects. They exclude
removals and moves of existing level objects, which belong to the original level.

## Export to a multiplayer server

A world resource is a `.world.json` file containing the props, effects,
level edits and areas the server should create. It needs no loader script.

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
the content and sends its world state to joining players. Props and effects
appear as players come within streaming range; level edits reach every player.

To publish changes, reopen the project, edit, save, export again, copy the
updated file to the server and restart it. Server scripts can use the
exported areas and objects; changes made while the server runs are not saved
back to your project or export.

For a few objects that belong in a script, select them and choose **Copy
selection as API calls**, then paste the calls into a server resource.
This copies only the selection. The **Areas** tab has **Copy selected area
as API call** for an area.

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
