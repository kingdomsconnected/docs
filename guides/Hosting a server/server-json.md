---
title: server.json settings
description: Set the ports, player slots, level and required DLCs in server.json.
sidebar:
  label: server.json
  order: 101
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
        "required_dlc": []
    },
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
| `server-token` | `""` | Masterlist push key. Empty means the server is not listed in the server browser |
| `map` | `""` | Unused by KCDC. The level is `mod.level` |

Get a token and check the listing with [Server browser listing](../server-browser/).
The matching [command-line arguments](../run-a-server/#command-line-arguments)
override these keys for one run; nothing overrides `maxplayers` or `mod`.

## When the file is wrong

The server refuses to start on invalid JSON, a key of the wrong type, or a
`mod` value it does not accept (the log says why). An unknown key under
`mod` is kept with a warning, so a newer file still loads on an older server:

```text
server.json: 'mod.something' is not a key this build understands; keeping it
```

Both `mod` keys are replicated: a client receives them in the connection
handshake, before it downloads or runs anything. The status document at
`http://<host>:<apiport>/` also lists them under `mod_config`.

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

## Related

- [Run a dedicated server](../run-a-server/): ports, arguments and the console.
- [Server browser listing](../server-browser/): get and use a `server-token`.
- [Let players connect](../players-connecting/): what players see when a DLC is missing.
