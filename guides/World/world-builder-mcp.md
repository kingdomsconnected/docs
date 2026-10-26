---
title: Automate World Builder with MCP
description: Connect an AI assistant or a local script to World Builder to inspect projects, edit scenes and preview patrols.
sidebar:
  label: MCP automation
  order: 48.7
---

World Builder's optional MCP server lets external tools inspect and edit an
offline project. Ask an AI assistant to arrange props, review level changes,
or build a patrol route, then inspect its work in the editor.

MCP means **Model Context Protocol**. It gives a connected application a list
of tools, their arguments, and readable editor state. An AI assistant can
choose those tools from your instructions. Your own scripts and desktop
applications can call them too, without an AI model or an MCP library. See
[Control the editor over HTTP](../../tutorials/world-builder-http/).

This page describes the tools in **1.7.2**. Call `tools/list` for the
current names and arguments; discovery is the authoritative reference.

## Connect an assistant

1. Open **World Builder** from the main menu and load a project or level.
2. Open the **MCP** tab. Keep port `7781`, or choose another unused port.
3. Select **Start MCP server**.
4. Select **Copy connection configuration** and add it to your assistant's
   MCP settings. Use an HTTP connection, with this endpoint:

```json
{
  "mcpServers": {
    "worldbuilder": {
      "type": "http",
      "url": "http://127.0.0.1:7781/mcp"
    }
  }
}
```

The copied configuration uses your selected port. Configuration file shapes
vary between assistants; if yours has a connection form, enter the URL and
choose HTTP there. It must support the server's HTTP MCP transport. There
is no command to launch, API key, token or authorization header.

The server listens only on your computer. Run the connecting application on
that computer too. A hosted assistant needs a local application capable of
making the connection. World Builder itself needs no cloud service; an AI
assistant may have its own account and network requirements.

Starting remembers the port and enables automatic start the next time you
enter offline World Builder. **Stop MCP server** turns that preference off.
Leaving World Builder stops the listener. **F7** only closes the viewport,
so the connection stays available and an assistant can reopen the editor.
MCP is unavailable while connected to a multiplayer server.

## What you can ask it to do

| Task | Examples |
| --- | --- |
| Inspect a project | Read objects, areas, routes, selection, camera, project metadata and recent MCP operations. |
| Dress a location | Search props and effects, place or duplicate them, adjust transforms and physics, and organize groups. |
| Furnish and light it | Place working doors, seats, beds, crafting stations and item stacks with their settings, and point lights with color, intensity, radius and shadows. |
| Edit the existing level | Browse nearby level objects, move, hide or swap them for a library mesh, copy or convert them into props, then inspect or restore those edits. |
| Select in bulk | Select by screen rectangle, outline, radius, brush dab, area or likeness, through the editor's selection filter. |
| Build gameplay regions | Create boxes, polygons and spheres, copy game areas, test points, and add area collision with an optional floor, ceiling and wall thickness. |
| Author patrols | Create routes, edit waypoints, choose an NPC role, and start, inspect or stop a preview. |
| Organize the editor | Set snapping and the grid, manage favorite folders, assign or lock layers, and read or rebind keys. |
| Review a scene | Travel with the game map, move the camera, save views, preview light and weather, and capture a viewport image. |
| Save and export | Save or open projects, place blueprints, and export world resources or server API calls. |

For example:

> Find a vanilla patrol route in the current level's game data, recreate it
> in World Builder through MCP, position the camera top-down, and start a
> guard preview.

The agent needs separate access to the relevant game data to find that
vanilla route. MCP exposes authored patrols and game-area catalogs; it does
not provide an arbitrary game-file reader or a vanilla-patrol search tool.
The [patrol automation tutorial](../../tutorials/world-builder-mcp-patrol/)
walks through that distinction and the editor steps.

Other useful requests are "Group these market props and save a blueprint",
"Show me the level objects this project hides", or "Preview this yard at
dusk and capture it with the editor overlays hidden".

## Review and keep the result

An agent changes the same project you see in the editor. Inspect its result
and use the shared undo history for edits that support undo. Save the project
to keep it. Exporting a world resource is a separate action; it does not
deploy to a running server or save your editable project.

File tools are limited to `maps` beside the client and the export directory
you choose in World Builder. Relative paths start under `maps`. An agent
cannot grant itself another directory. Replacing a file requires the tool's
explicit overwrite option where one is available.

Layer visibility, favorite folders, viewport preferences and preview weather
are project settings. Hidden layers still export their objects, and preview
weather does not become server weather. See
[Organize a project](../world-builder-editing/) and
[Preview light and weather](../world-builder-environment/).

## Place doors, furniture and items

`wb_assets_search` with `kind: "prop"` returns doors, interactive objects
and items beside meshes. A row's `placedKind` names its kind, and its `path`
is the key to pass as `model` to `wb_props_create`, with an optional
`settings` object:

| Key | `placedKind` | `settings` fields |
| --- | --- | --- |
| `door:<leaf>` | `door` | `name`, `locked`, `lock` (`none`, `bolt`, `boltAndKey` or `key`), `lockpickable`, `lockDifficulty` (0 to 1), `keyItem` |
| `smart:<blueprint>` | `smartObject` | `name` |
| `item:<class>` | `item` | `name`, `amount`, `quality`, `health`, `condition` |

```json
{
  "model": "item:arrow_crude",
  "position": [3103.0, 818.5, 57.3],
  "settings": { "name": "armoury-arrows", "amount": 12 },
  "expectedRevision": "42",
  "idempotencyKey": "armoury-arrows-1"
}
```

A leaf is a path or file stem as `Door.models()` lists it, a blueprint is a
name from `SmartObject.blueprints()`, and an item class is a GUID or name.
These objects refuse `scale` and `physics` in `wb_props_create` and
`wb_objects_transform`, and `wb_prop_physics_set` refuses them. A field a
kind does not take is ignored; a value the server would refuse fails the
call with the reason. `wb_object_settings_update` replaces an object's
settings as one undo step, and omitted fields take their defaults.
`wb_object_get` reports `kind`, the canonical `model`, its `key`, `settings`
and `built`. `wb_document_get` pages them through the `doors`,
`smartObjects` and `items` collections.

## Place point lights

`wb_lights_create` takes a `position` and optional `color` (RGB, each 0 to
1), `intensity` (0 to 100), `radius` (0.1 to 100 metres), `castShadows`
(`false` when omitted) and `group`. Poll the operation for the light's ID.
`wb_light_update` takes that ID with `color`, `intensity` and `radius`;
omitting `castShadows` keeps its current setting. Move a light with
`wb_objects_transform` and a `position`; rotation and scale are refused.
Read lights with `wb_object_get`, `wb_objects_query` with `kind: "light"`,
or `wb_document_get` with `collection: "lights"`.

## Change level objects

`wb_level_object_update` takes `model`, a mesh path from the asset library,
to swap a level object for that mesh as one undo step; an empty string
takes the swap back, and a path outside the library is refused.
`wb_level_object_get` and `wb_object_get` report the swap as `model`.
`wb_objects_duplicate` accepts level object IDs and places an editable prop
of the same mesh beside each one. `wb_objects_convert` takes the objects out
and puts such a prop where each stood, as one undo step. Both refuse up
front when a mesh is not in the library, so nothing is left half done.

## Select many objects

| Tool | Selects |
| --- | --- |
| `wb_select_in_radius` | Objects within `radius` metres of `center`. |
| `wb_select_in_rect` | Objects inside a rectangle from `min` to `max`, in normalized device coordinates through the editor camera, within an optional `reach` in metres. |
| `wb_select_in_polygon` | Objects inside an outline of `points`, in the same coordinates. |
| `wb_select_brush` | One dab of the selection brush at `aim`, a point in the same coordinates, with an optional `radius` (0.25 to 50 metres, 3 by default). Aiming at the sky selects nothing. |
| `wb_select_in_area` | Objects inside an area definition, as `wb_area_get` returns it. |
| `wb_select_similar` | Objects with the same mesh, or class, as the object `id`, within `radius`. |

Each takes an optional `filter` with the fields of the editor's
[selection settings](../world-builder-selection/#filter-what-the-tools-take):
`kinds` (`prop`, `effect`, `light`, `brush`, `vegetation`, `entity`),
`text`, `mesh`, `className`, `layer`, `group`, `physics` and
`includeHidden`. `mode` is `replace` (the default), `add` or `remove`, and
`visibleOnly` keeps only what the camera can see. Results report `matched`,
`added`, `removed`, `total`, `truncated` and the resulting `selection`.

Region tools adopt level objects as they select them. The next region
selection lets go of those left unchanged, so a `world/...` ID a region tool
returned stays valid until then. Region tools add up to 5000 objects, and
`wb_selection_set` and the tools taking explicit IDs accept up to 5000.
`wb_history_undo` and `wb_history_redo` select what the step changed.

## Travel and keys

`wb_map_open` opens the game map for the user to click a destination.
`wb_map_travel` takes `position: [x, y]` in world metres and travels without
a click. Poll `wb_map_get` until `active` is `false`; `status` then reads
`arrived`, `cancelled` or `failed`, with a `message` on failure.
`wb_map_cancel` cancels before the player is placed. While travel is
active, other editing tools are refused.

`wb_keymap_get` lists each action's `id`, `label`, current `chord`, its
chords in the `default` and `wer` presets, and `conflicts`.
`wb_keymap_update` takes an optional `preset` (`default` or `wer`), applied
first, and `keys`, an object of action IDs to chords such as `Ctrl+D`; an
empty string unbinds. An unknown action or key changes nothing. Keys are
saved for the user, not the project.

## If the connection or an edit fails

| Problem | What to do |
| --- | --- |
| Connection refused | Load offline World Builder, start MCP, and check the port. |
| The port is already in use | Choose a free port in the MCP tab and copy its new configuration. The server does not silently choose another port. |
| The client expects an SSE URL | Use HTTP MCP at `/mcp`. Separate legacy SSE endpoints are not provided. |
| The editor is busy or an operation is pending | Stop dragging or editing a field, then let the current operation finish. |
| A revision is stale | Read the state again and reconsider the change against the current project. |
| An object cannot be changed | Check its layer's visibility and lock state. Areas and patrols follow Default. |
| A queued edit appears successful but nothing changed | Inspect its completed operation result. A queued receipt is not completion. |
| Editing tools are refused during map travel | Poll `wb_map_get` until `active` is `false`, or call `wb_map_cancel` before placement. |

For request formats, polling, errors and tool discovery, continue with the
[HTTP tutorial](../../tutorials/world-builder-http/).
