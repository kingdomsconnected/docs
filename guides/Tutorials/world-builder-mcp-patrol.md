---
title: Recreate and preview a patrol with an assistant
description: Give an assistant route data, recreate it through World Builder MCP, and inspect a guard preview before saving.
sidebar:
  label: MCP patrol tutorial
  order: 98.6
---

Let an assistant turn route coordinates into an editable patrol, frame it
from above, and start a temporary guard. You can then inspect the path and
keep the route for a server project.

## Before you start

- Open your target level in offline World Builder in **1.6.6**.
- [Connect an assistant through MCP](../../world/world-builder-mcp/).
- Save your project and leave the **Default** layer visible and unlocked.
- If recreating a vanilla route, give the assistant access to the matching
  level's game data through its own file tools, or supply the route points.

This tutorial creates project data, so there is no script file tree. You
will keep an editable `.project.json`; deployment later uses a `.world.json`
and a server resource that creates the guard.

## 1. Give it the task and source

Start with this request:

> Find a vanilla patrol route in the current level's game data, recreate it
> in World Builder through MCP, position the camera top-down, and start a
> guard preview.

Add where the assistant can read the data, or attach your extracted points.
Ask it to identify the source and route before editing. World Builder MCP
can list authored routes and browse game areas, but it has no general game
archive reader or vanilla-patrol discovery tool. An assistant that only has
MCP access needs you to supply that part.

Use coordinates from the currently loaded level. Preserve their order and
check any source-specific coordinate conversion. Copying points does not
copy the original NPC's schedule, quest rules, equipment or behavior.

## 2. Create the editable route

Ask the assistant to inspect `wb_get_state` and `tools/list`, then create a
new route through `wb_patrol_create`. Choose a unique ID such as
`village.vanilla-preview`. Do not replace an existing route just because its
name matches.

The tool accepts a `route` with an `id` and `points`. Each point has a
`position` containing `x`, `y` and `z`. Optional route and point settings
include `speed` (`walk`, `jog`, `run`), `waitSeconds` and `radius`. The route's
`mode` is `once`, `loop` or `pingPong`. Choose these settings deliberately if
the source data does not specify them.

The assistant must include the current `expectedRevision` and a fresh
`idempotencyKey`, wait for completion, then read the route back with
`wb_patrol_get`. See the [HTTP tutorial](../world-builder-http/) for the
request and operation format. The route should now appear in **Patrols**.

## 3. Frame it and start a guard

Ask the assistant to save the current camera as a named view before moving
it. It can use `wb_view_save`, then `wb_camera_set` or `wb_camera_frame` to
look down over the route. Camera pitch is limited to 89 degrees in either
direction, so the overhead view is nearly vertical.

Have it query `wb_npc_roles_query` and choose a guard role returned by the
catalog. `wb_patrol_preview_start` takes the
authored route's `id` and the catalog `role`. Wait for the operation, then
use `wb_patrol_preview_get` to inspect activity, progress and the resolved
path.

The guard is a temporary offline preview. Its path can differ from straight
lines between waypoints when navigation goes around obstacles. Starting a
preview does not put a persistent NPC into the exported world resource.

## 4. Inspect the result

Watch the guard travel through the route. Check corners, doors, slopes and
waiting points. Ask the assistant to report where progress stops, then
adjust the route and preview it again. A successful request alone does not
show that the guard can complete the route.

For a screenshot, use `wb_capture_viewport` and poll its `captureId` until
ready. The result includes a PNG; `includeOverlays: false` hides the
Framework editor and browser overlays. A capture has its own frame metadata,
so let the scene settle after moving the camera before judging the image.

## 5. Stop, save and use the route

Stop the temporary guard with `wb_patrol_preview_stop`, then save the
project. MCP file paths must be under `maps` beside the client or the
editor's selected export directory. You can also save through the UI.

To deploy, export the world resource and follow the
[village patrol tutorial](../world-builder-patrol/). That tutorial creates a
server-owned NPC and assigns the exported route. Use the saved route ID,
and test it again on the server with the intended NPC and map content.
