---
title: Preview a project under different light and weather
description: Use World Builder's Environment tab to inspect a scene at dusk, hold a sky preset, and test rain before exporting.
sidebar:
  label: Preview light and weather
  order: 48.9
---

Check a courtyard at dusk or see how a route reads in rain without leaving
World Builder. The **Environment** tab in **1.6.6** keeps those preview
conditions in your project, so you can return to the same setup later.

## Inspect a scene at dusk

1. Open an offline project and choose **Environment**.
2. Under **Time of day**, choose **Dusk**, or enable **Pin the sky to one
   hour** and set the hour yourself.
3. Move through the scene and check its lighting. Press **F7** to walk around;
   the preview conditions remain active.
4. Save the project to keep the chosen conditions.

Pinning the sky changes lighting without moving the world clock. It does
not move time-based schedules to that hour. Use **Move the world clock**
only when you also want to change gameplay time.

| Control | What it changes |
| --- | --- |
| **Pin the sky to one hour** | Lighting for an hour from 0 to 24. Both endpoints mean midnight. |
| **Clock speed** | The world clock's speed. `0` stops it; **Normal (x15)** restores the game's normal rate. |
| **Set the world clock** | Gameplay time itself, backwards or forwards in this offline session. |
| **Skip ahead** | Advances gameplay time by up to 72 hours. |

If the game is already holding its clock, the tab reports that. Changing
the speed does not release the game's hold.

## Choose a sky or test rain

The preset list shows skies loaded by this level. Choose one to blend it in.
**Blend** is measured in game seconds; `0` applies it immediately. A stopped
world clock cannot advance a timed blend. **Apply again** reapplies the
chosen preset if the game has changed the sky since.

Enable **Hold this sky** to keep the chosen preset. Holding applies it at
once, regardless of the blend duration. Without a hold, the game replaces
the blended preset after six game hours and continues its weather schedule.

To test rainfall, turn off **Hold this sky**, then enable **Rain by hand**
and choose **Drizzle**, **Rain** or **Downpour**, or set the intensity.
**Dry** sets it to zero. Turning **Rain by hand** off returns rain calculation
to the game.

Holding a sky also stops the weather system from submitting rain, so held
weather and manual rain cannot both take effect. Read the tab's warning
when combining them.

**Weather profiles the level schedules** is a read-only list of the records
the game uses to choose presets. A profile name is not a sky preset name.
If a saved project asks for a preset this level does not load, choose one
from the current list.

## Return to the level's conditions

Choose **Back to the level's own conditions** to release the pinned hour,
clock speed and manual rain. A preset already blended in remains until the
weather system next changes it; resetting cannot undo that blend.

Leaving the offline session also releases the overrides. They do not carry
into a multiplayer server. **Force an update** and **Rebuild the clouds**
can refresh a sky that has not caught up with your preset.

## What gets saved or exported

Preview settings are saved with the project. They do not participate in
undo, and blueprints, world resources and copied server API calls do not
carry them. To set multiplayer weather, use a server script and
[Clock and weather](../clock-and-weather/).

The Environment controls are offline only. While connected to a server,
that server owns the clock and weather.

## Automate the preview

[MCP](../world-builder-mcp/) exposes `wb_environment_get`,
`wb_environment_update`, `wb_environment_presets_query` and
`wb_environment_action`. Query this level's presets before choosing one.
After changing settings, read back the live state and its `warnings`,
`applied`, `pendingCommands` and `lastAction` fields. A successful update
accepts the settings; the engine applies them on a later editor frame.

For example, ask an assistant to preview the yard at dusk, inspect its
warnings, let the scene settle, and capture it without editor overlays.
