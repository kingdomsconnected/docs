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

Requires a client with the World Builder MCP integration in **1.6.6**.

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
| Edit the existing level | Browse nearby level objects, move or hide them, then inspect or restore those edits. |
| Build gameplay regions | Create boxes, polygons and spheres, copy game areas, test points, and add area collision. |
| Author patrols | Create routes, edit waypoints, choose an NPC role, and start, inspect or stop a preview. |
| Organize the editor | Set snapping and the grid, manage favorite folders, and assign or lock layers. |
| Review a scene | Move the camera, save views, preview light and weather, and capture a viewport image. |
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

For request formats, polling, errors and tool discovery, continue with the
[HTTP tutorial](../../tutorials/world-builder-http/).
