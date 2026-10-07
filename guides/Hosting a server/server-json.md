---
title: server.json settings
description: Set the ports, player slots, join password, level, required DLCs, player list, world resources and navigation mesh in server.json.
sidebar:
  label: server.json
  order: 102
---

The server reads `server.json` from its working directory (or the file named
by `--config`) once, at boot, so edit it while the server is stopped. If the
file is missing, the server writes one with every key and its default:

```json title="server.json"
{
    "apihost": "0.0.0.0",
    "apiport": 27016,
    "host": "0.0.0.0",
    "map": "",
    "maxplayers": 512,
    "mod": {
        "level": "kutnohorsko",
        "navmesh": "",
        "required_dlc": [],
        "scoreboard": true,
        "world_resources": []
    },
    "password": "",
    "port": 27015,
    "server-token": ""
}
```

## Top-level keys

| Key | Default | What it does |
| --- | --- | --- |
| `host` | `"0.0.0.0"` | Address the game session binds to |
| `port` | `27015` | Game session port, UDP |
| `apihost` | `"0.0.0.0"` | Address the HTTP endpoints bind to |
| `apiport` | `27016` | HTTP port, TCP |
| `maxplayers` | `512` | Player slots. Values above 512 are clamped to 512 with a warning |
| `password` | `""` | Password players must give to join. Empty lets anyone in. See [Password](#password) |
| `server-token` | `""` | Masterlist push key. Empty means the server is not listed in the server browser |
| `map` | `""` | Unused by KCDC. The level is `mod.level` |

Get a token and check the listing with [Server browser listing](../server-browser/).
The matching [command-line arguments](../run-a-server/#command-line-arguments)
override these keys for one run; nothing overrides `maxplayers` or `mod`.

## Password

Set `password` to make players type it before they can join:

```json title="server.json"
{
    "password": "correct horse battery staple"
}
```

Only change that line. Leave the rest of the file as the server wrote it.
Restart the server after changing it. The startup log shows whether a password
is set:

```text
Password:	required
```

`"password": ""`, the default, lets anyone in. The server checks the password
during the connection handshake, before the player downloads anything. A wrong
or missing password is refused with:

```text
The server refused the password.
```

Players enter it under **Connect directly** in the launcher menu, or pass it
in a [join link](../players-connecting/#join-with-a-link)
(`kcdc://host:port?password=...`). The server browser shows a padlock next to
a server with a password and asks for it before joining. The status document
at `http://<host>:<apiport>/` shows `"password_required": true`, but never the
password itself.

- **Keep it to 63 bytes.** The server accepts up to 255 bytes and refuses to
  start with a longer one. The client only accepts 63, so players cannot enter
  a longer password. Plain ASCII characters are one byte each.
- **`--password` overrides it** for one run
  ([options](../options-and-overrides/#command-line-options)). The key in the
  file is safer, because a command line shows up in process lists.
- **It is shared, not per player.** Everyone uses the same password. To stop
  someone who already knows it, change it and restart.
- It needs KCDC 1.5.1 or later. Older servers ignore the key.

## When the file is wrong

The server refuses to start on invalid JSON, a key of the wrong type, or a
`mod` value it does not accept (the log says why). An unknown key under
`mod` is kept with a warning, so a newer file still loads on an older server:

```text
server.json: 'mod.something' is not a key this build understands; keeping it
```

`level`, `required_dlc` and `scoreboard` are replicated: a client receives
them in the connection handshake, before it downloads or runs anything. The
status document at `http://<host>:<apiport>/` also lists them under
`mod_config`. `navmesh` and `world_resources` stay on the server.

## `mod.level`

The level clients load when they join. Any other value fails at boot.

| Value | Level |
| --- | --- |
| `kutnohorsko` | Kuttenberg and its countryside (the default) |
| `trosecko` | Trosky |
| `klaster` | The monastery |

These are the level directories the game ships under `Data/Levels`.

## `mod.required_dlc`

The DLCs a player must have to join. Empty, the default, requires none.

```json title="server.json"
{
    "mod": {
        "level": "kutnohorsko",
        "required_dlc": ["ForgeTycoon", "MysteriaEcclesiae"]
    }
}
```

The client checks the list right after the handshake and refuses before
downloading anything or loading the level, naming the DLCs by store name:

```text
This server requires Legacy of the Forge, Mysteria Ecclesiae.
```

The game's own DLC service answers, so on Steam a DLC must be *installed*,
not just purchased.

### Accepted names

Names are case-sensitive and several differ from the store name.

| Key | Sold as |
| --- | --- |
| `QuestForValor` | The Lion's Crest |
| `BanditCamps` | Brushes with Death |
| `ForgeTycoon` | Legacy of the Forge |
| `MysteriaEcclesiae` | Mysteria Ecclesiae |
| `SeasonPassShields` | Season pass rewards |
| `GoldEditionHuntsman` | Gold Edition rewards |
| `Barber` | Barber (free, so every install has it) |
| `HorseRacing` | Horse Racing (free) |
| `HardcoreMode` | Hardcore Mode (free) |

Listing a free one is harmless but pointless. Any other name fails at boot,
including `TouristMode` and `Unpublished`, which the game carries but no
account can own:

```text
Refusing to run: 'Nonsense' is not a DLC this build knows. Use one of the
game's own names, such as ForgeTycoon or MysteriaEcclesiae.
```

### What it does not do

- **It is not enforced by the server.** The client decides, so a modified
  client can skip the check. It protects players from a session their game
  cannot match, not you from cheaters.
- **It does not make content appear.** Items, perks and buffs from every DLC
  ship in the base game's tables and work for everyone. A missing DLC only
  removes the quests, dialogue and activities the game gates on it, so
  require one when your gamemode is built around that content.

## `mod.scoreboard`

Whether players see the player list while they hold **Tab**. `true`, the
default, shows it. Set it to `false` when your gamemode draws its own:

```json title="server.json"
{
    "mod": {
        "level": "kutnohorsko",
        "scoreboard": false
    }
}
```

The list has three columns:

| Column | What it shows |
| --- | --- |
| ID | The player's connection slot, the same number as `player.playerIndex` in a server script |
| Name | The player's nickname. Your own row is highlighted |
| Ping | The player's ping to the server |

The ID is what commands take when a name is awkward to type: the default
gamemode's `/tp 3` puts you next to the player in slot 3, and `/mute`,
`/unmute` and `/lookalike` accept a slot the same way. A slot stays with a
player for the whole session and is handed to someone else after they leave.

With it off, no client asks for the list and **Tab** goes back to the game's
own use. It needs KCDC 1.5.6 or later; a client treats an older server as on.

## `mod.world_resources`

World Builder exports to load at startup. The default is `[]`.
Each entry is a path to an exported
`.world.json`; paths are relative to the server's working directory.

```json title="server.json"
{
    "mod": {
        "level": "kutnohorsko",
        "world_resources": [
            "worlds/market.world.json",
            { "name": "village-market", "path": "village/market.world.json" }
        ]
    }
}
```

Merge these settings into your existing config. The server creates each
export's props, effects, level edits and areas, and registers its patrol
routes. Routes do not spawn NPCs. No loader
script is needed. Keep editable `.project.json` files on your editing machine;
copy the exported `.world.json` files to the server.

A resource's default name is its filename without `.world.json`. Use a
`{ "name": "...", "path": "..." }` entry to name it explicitly. Names are
case-sensitive and must be unique; listing the same file twice is rejected.
All exports must match `mod.level`. A missing, malformed or wrong-level file
stops startup with an error identifying the file.

Restart the server after changing the list or replacing an export. See
[Create maps with World Builder](../../world/world-builder/) for editing,
saving and exporting. [World exports in scripts](../../world/world-resources/)
explains `WorldResource.ready`, stable names and reading the loaded objects.
Route IDs must be unique across exports and script-created routes.

## `mod.map_editor`

This older server-wide setting is no longer used in the World Builder
workflow above. Multiplayer access is granted per player by a server script
with `player.setWorldBuilderEnabled(true)` and revoked with
`player.setWorldBuilderEnabled(false)`. Offline access is always available.
See [Allow building in multiplayer](../../world/world-builder/#allow-building-in-multiplayer)
for F7 and the sample game mode's commands.

## `mod.navmesh`

The game's navigation mesh lets the server plan routes around walls and
through buildings: NPCs walk around obstacles, and scripts can query paths
with [`Navigation`](../../npcs-and-animals/navigation/). It is the game's own
data, so it does not ship with the server. Copy it in from your installation:

1. Find `Data/Levels/<level>/recast.pak` in the game's folder, for the level
   `mod.level` names.
2. Copy it to `files/<level>/recast.pak` beside the server, keeping the name:

```text
server/
  KCDCServer.exe
  server.json
  files/
    kutnohorsko/
      recast.pak
```

3. Restart the server. Do it again after a game update.

The server searches `files/` for `recast.pak` at startup, so `navmesh` can stay
`""`. A copy under the level's own folder wins; a bare `files/recast.pak` is
tried last. To read the game's files in place during development, set
`navmesh` to the game folder, its `Data/Levels` folder, the level folder or
the pak itself. That location is checked first:

```json title="server.json"
{
    "mod": {
        "level": "kutnohorsko",
        "navmesh": "C:/Games/KingdomComeDeliverance2"
    }
}
```

Relative paths start at the server's working directory. Without a mesh the
server still runs: it logs a warning with the places it searched, NPCs walk
straight at their goals, and `Navigation.ready` is `false`.

## Related

- [Run a dedicated server](../run-a-server/): ports, arguments and the console.
- [Server browser listing](../server-browser/): get and use a `server-token`.
- [Let players connect](../players-connecting/): where players enter the password, and what they see when a DLC is missing.
