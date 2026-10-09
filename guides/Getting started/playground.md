---
title: Enable the optional development playground
description: Install the sample playground for item, location, crafting and companion experiments on a development server.
sidebar:
  label: Development playground
  order: 15
---

The optional `kcdc-playground` resource adds an **F2** window for trying items,
crafting, locations and companions. It depends on `kcdc-gamemode`.

:::caution[Choose who can use it]
By default, every player can grant items and teleport with these tools.
Before enabling the playground on a shared server, edit `config.allowed` in
`src/server/config.ts` to choose who can use it, then rebuild the resource.
:::

## Install from a bundle containing it

1. Open `resources/optional/kcdc-playground/` in a terminal.
2. Run `pnpm install --frozen-lockfile` and `pnpm run build`.
3. Move the built folder to `resources/kcdc-playground/`, beside
   `kcdc-gamemode`.
4. Start the server. Resources directly under `resources/` load automatically.

When working from source, build in the original folder so its link to the
local scripting types resolves, then copy the built resource to the test
server. Leaving it under `resources/optional/` keeps it disabled. To disable
it again, stop the server and move the folder back there.

## Open the tools

Press **F2**, or the key assigned to **Playground** in Controls. The action
hint displays that binding. Use **Escape** or **Close** to dismiss the window.

| Tool | What to try |
| --- | --- |
| Item spawner | Search equippable classes by table name or GUID, choose supported quality, and grant or drop 1 to 20 units. |
| Locations | Visit settlements and points of interest on the current level. |
| Crafting | Learn selected or listed recipes and grant ingredients for 1 to 10 batches. Native skill requirements still apply. |
| Companions | Spawn up to four test NPCs, a horse and a dog. |
| Character creator | Open the sample character-creation flow. |

To drop an item, aim at the ground within 15 metres before opening the window. The
server checks the drop position. Before teleporting, dismount and finish any crafting
or dice session. The crafting tool excludes recipes that require quest ingredients.

**Remove my test spawns** removes this playground's NPCs, horse, dog and remaining
ground drops. Items already given to players stay in their inventories. Your server's
saving rules determine whether inventory, recipe and appearance changes survive a
restart.

Each community server chooses whether to enable this optional resource. For the
custom-item sample commands, use [/customitems](../../players/custom-items/#try-it) in
the default game mode.
