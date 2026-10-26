---
title: Ship a KCD2 mod from your server
description: Stream a KCD2 mod's models, table patches and string patches to every player from a resource, and use the items and recipes it adds.
sidebar:
  label: KCD2 mods
  order: 28.5
---

Since 1.7.2, a server can carry a mod made for the single-player game and send
it to every player who joins. The mod goes in a resource, in two folders:
`replace/` for its game files and table patches, and `localization/` for its
text. Players download it with the rest of your resources.

```text
resources/better-swords/
  package.json
  replace/
    objects/weapons/swords/long_sword_a.mtl
    libs/tables/item/item__better_swords.xml
    libs/tables/minigame/blacksmithrecipes__better_swords.xml
  localization/
    english/
      text_ui_items__better_swords.xml
```

```ts
// server, in a resource that lists better-swords in resourceDependencies
Events.on("playerSpawned", (player) => {
  const result = Inventory.add(player, { item: "better_sword_steel", amount: 1 });
  if (!result.ok) console.warn(`no sword: ${result.code}`);
});
```

Kingdoms Connected no longer loads a player's own installed mods. The server's
mods are the only ones in a session.

## Lay out a mod as a resource

A KCD2 mod is a folder with a `mod.manifest`, its game files in `data/*.pak`
and its text in `localization/<Language>_xml.pak`. Each `.pak` is a zip
archive.

1. Create a folder under `resources/` with a `package.json`. The `name` must
   use only lowercase letters, digits, `-` and `_`, as for
   [custom assets](../custom-assets/#lay-out-the-folders). `"mafiahub": {}`
   is enough; the resource needs no scripts.
2. Extract every `data/*.pak` into `replace/`, keeping the paths inside it.
3. Extract the `<file>__<id>.xml` files of each `<Language>_xml.pak` into
   `localization/<language>/`, with the language in lowercase:
   `English_xml.pak` goes to `localization/english/`.
4. Delete everything in [What a server refuses](#what-a-server-refuses). One
   refused file keeps its whole folder from shipping.
5. Run `refresh`, then `start <name>` in the server console, or restart the
   server.

## What each folder carries

| Mod content | Goes in | Takes effect |
| --- | --- | --- |
| Models, materials, textures, sounds, `.adb` | `replace/`, at the mod's paths | As any [replaced file](../custom-assets/#replace-the-games-files) |
| Table patches, `libs/tables/.../<table>__<id>.xml` | `replace/`, at the mod's paths | At each player's next level load |
| String patches, `<file>__<id>.xml` | `localization/<language>/` | As soon as the player has the archive |

A table can only be patched, never replaced whole. The `<id>` in a patch's
name uses lowercase letters, digits and `_`, as the game's mod ids do. The
game's own loaders merge each patch row by row, so a mod can change items,
souls, shops, presets and AI brains as well as plain tables.

### When patches apply

Table patches are applied and removed between levels, after the old level
unloads and before the new one loads, because everything in a level points
into the tables' rows. Joining a server is such a point, so a player who joins
has every patch before the level appears. Patches from a resource started or
restarted while players are in reach each of them at their next level load.
Every database except the AI scheduler's is read again at that point.

String patches merge as soon as their archive arrives, mid-session included,
for the language the game is running in. The player's language wins, and
English is the fallback. A removed string patch is undone by reading the
game's own text again.

## What a server refuses

:::note[Subject to change]
We are still improving KCD2 mod support, so this list can change in a future
release. Check it again when you update your server.
:::

A server never runs a mod's code and cannot merge what the game reads only at
its own start:

| Mod content | Why |
| --- | --- |
| Lua scripts (`scripts/`) and `mod.cfg` | A server never runs Lua or sets console variables |
| Quests and Storm rules (`libs/storm/`) | The game merges them only when it starts |
| AI trees and UI movies | They are neither asset files nor table patches |
| Level edits (`modifies_level`) | The game cannot merge them |
| Replaced animation clips (`.caf`) | The game indexes its own clips at startup; see [Custom assets](../custom-assets/#replace-the-games-files) |

## Use the mod's items

The item classes a mod adds in `libs/tables/item/item__<id>.xml` join the
server's item catalog while the resource runs, and each player's while they
have its archive. `Inventory.add`, `Inventory.set`, `player.giveItem` and the
rest take them by GUID or by table name, like the game's own classes, and
`Inventory.classes()` lists them. See [Give and take items](../../players/items/).

- **Start order.** A resource's classes join once it has started, after its
  own scripts and `resourceStart` handlers. A resource that names them while
  it starts lists the mod in `resourceDependencies`, so the mod starts first.
- **Mid-session starts.** The server knows the classes at once, but a
  connected player's game has the rows only after their next level load.
  Start mod resources with the server.
- **Stopping** the resource takes its classes out of the server's catalog.
- **Wear and quality** follow the same rules as the game's items. A piece
  whose clothing component is one of the game's armor types that never wear
  (spurs, belts, pouches, horse tack) never changes condition.
- **The game's own classes.** A mod row for a class the game ships changes
  that item in every player's game, but the server's catalog keeps the
  game's entry for it.
- An `ItemAlias` may name a class from any running resource, or one later in
  its own file.

## Use the mod's recipes

Recipe patches, `libs/tables/minigame/alchemyrecipe__<id>.xml` and
`blacksmithrecipes__<id>.xml`, join the server's crafting when the resource
starts and leave when it stops. Players' games read them at their next level
load. A row with the id of one of the game's recipes replaces that recipe.
`Crafting.recipes` lists them with `source: "mod"`. See
[Custom recipes](../../players/custom-recipes/).

## When two resources disagree

When two resources define the same item GUID or the same recipe id, the one
whose name sorts first keeps it, on the server and on every player's game.

## Players' own mods

A game started by Kingdoms Connected finds the player's `mods/` folder and
reads `mod_order.txt`, then turns every mod off before any of it loads: no mod
archive, `mod.cfg`, Lua script or string patch runs. Nothing in `mods/` is
changed. The player's client log says:

```text
Ignoring local mods: 3 installed, 2 enabled
```

## When a mod does not show up

| Server log | Fix |
| --- | --- |
| `'X' replace: <file>: tables can only be patched, as libs/tables/.../<table>__<id>.xml; the lane is not shipped` | Ship only `__<id>` patches under `libs/tables/`, never a whole table. |
| `'X' localization: <file>: localization entries must be <language>/<file>__<id>.xml; ...` | Put each string patch directly in its language folder. |
| `'X' localization: <file>: a language folder is lowercase letters; ...` | Name the folder after the language only, such as `english`. |
| `Resource 'X': <file> keeps its replace lane from shipping (...), so none of its item classes join the catalog` | Fix or delete the file it names. |
| `Resource 'X': <file>: ...; the server will not craft it` | A recipe row names an item the catalog does not know, or cannot be read. |

A working mod logs `Resource 'X': N item class(es) from M table patch(es) join
the catalog` and `Resource 'X': N recipe(s) from its table patches join
crafting`. The other asset errors are in
[Custom assets](../custom-assets/#when-an-asset-does-not-show-up).

:::caution
Every file in the resource ends up on every player's disk. Ship only mods whose
authors allow you to redistribute them.
:::

## Related

- [Custom assets](../custom-assets/): the `stream/` and `replace/` folders, downloads and limits
- [Resource manifest and lifecycle](../resources/): `resourceDependencies` and the console commands
- [Give and take items](../../players/items/): the item catalog
- [Custom recipes](../../players/custom-recipes/): recipes from scripts and from mods
