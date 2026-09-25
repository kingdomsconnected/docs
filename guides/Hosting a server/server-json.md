---
title: server.json settings
description: Every key in server.json, the level clients load, and the DLCs a server can require.
sidebar:
  order: 101
---

The server reads `server.json` from the directory it runs in (or the file
named by `--config`). If there is none, it writes one carrying every key this
build understands, with its default, so the file is also the list of what you
can set. Framework keys sit at the top level; KCDC's own sit under `mod`.

This is the file a fresh server writes:

```json title="server.json"
{
    "apihost": "0.0.0.0",
    "apiport": 27016,
    "host": "0.0.0.0",
    "map": "",
    "maxplayers": 10,
    "mod": {
        "level": "kutnohorsko",
        "required_dlc": []
    },
    "port": 27015,
    "server-token": ""
}
```

Edit it while the server is stopped; it is read once, at boot.

## Top-level keys

| Key | Default | What it does |
| --- | --- | --- |
| `host` | `"0.0.0.0"` | Address the game session binds to |
| `port` | `27015` | Game session port, UDP |
| `apihost` | `"0.0.0.0"` | Address the HTTP endpoints bind to |
| `apiport` | `27016` | HTTP port, TCP |
| `maxplayers` | `10` | Player slots. Lower it if you like; anything above 10 is clamped back to 10 with a warning, because the cap is compiled in |
| `server-token` | `""` | Masterlist token, see below |
| `map` | `""` | A framework key KCDC does not use. The level is `mod.level` |

The `--host`, `--port`, `--apihost`, `--apiport` and `--server-token`
[command-line arguments](../dedicated-server/#command-line-arguments) override
these for one run without touching the file. There is no argument for
`maxplayers` or for anything under `mod`.

### `server-token`

The in-game server browser lists servers from the MafiaHub masterlist. A
server announces itself there only when it has a token; with the default
empty value it logs `Server will not be announced to masterlist` and is
reachable by address only. Players can always join by address, see [How players connect](../players-connecting/).

[List your server in the server browser](../../publish-on-masterlist/) walks
through getting a token and checking the listing.

Treat the token as a secret. Keep it in the file rather than in a startup
command that other people can read.

## When the file is wrong

The server refuses to start rather than run with a setting nobody meant:

- a file that is not valid JSON fails at boot;
- a key with the wrong type (a string where a port number belongs) fails at
  boot;
- a `mod` value outside what it accepts fails at boot, with the reason in the
  log.

A key under `mod` that this build does not know is kept and warned about, so
a file written for a newer server still loads on an older one:

```text
server.json: 'mod.something' is not a key this build understands; keeping it
```

## Replicated settings

Both `mod` keys are **replicated**. They reach a client during the connection
handshake, which completes before the client reports a connection, so a
client knows them before it downloads anything or runs any script. They are
also published in the status document at `http://<host>:<apiport>/`, under
`mod_config`, so a tool can show them without connecting.

## `mod.level`

The level clients load when they join. A joining client has no other way to
know which one to open, and it starts loading as soon as the handshake lands.

| Value | Level |
| --- | --- |
| `kutnohorsko` | Kuttenberg and its countryside (the default) |
| `trosecko` | Trosky |
| `klaster` | The monastery |

These are the level directories the game ships under `Data/Levels`. Anything
else fails at boot, not at the first connect.

## `mod.required_dlc`

The DLCs a player must have to join, as an array of names. Empty, the
default, requires none.

```json title="server.json"
{
    "mod": {
        "level": "kutnohorsko",
        "required_dlc": ["ForgeTycoon", "MysteriaEcclesiae"]
    }
}
```

A client compares the list against its own game as soon as the handshake
lands, and refuses before it downloads anything or loads the level. The
message uses the store names, not the keys:

```text
This server requires Legacy of the Forge, Mysteria Ecclesiae.
```

The answer comes from the game's own DLC service, the same one that decides
whether a DLC's quests exist for that player. On Steam that means
*installed*, not merely purchased: a DLC the player owns but has not
downloaded counts as missing.

### Accepted names

The names are the game's own and the check is case-sensitive. Several differ
from the name the DLC is sold under.

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

Listing a free one is harmless but pointless: every install satisfies it.

A name that is not in this table fails at boot:

```text
Refusing to run: 'Nonsense' is not a DLC this build knows. Use one of the
game's own names, such as ForgeTycoon or MysteriaEcclesiae.
```

So do `TouristMode` and `Unpublished`. The game carries both, but neither has
a store product behind it, so no account can hold one and a server asking for
it could never be joined.

### What it is, and is not

The list keeps a player out of a session whose content their game cannot
match. It is **not** an ownership check the server enforces: the client
decides, and a modified client that skips the check gets in. That is
deliberate. The cost of a mismatched join falls on the player, and verifying
ownership from the server would need a store backend the mod does not have.

Requiring a DLC also does not make its content appear. Items, perks and buffs
from every DLC ship in the base game's tables, so they resolve for everyone.
What a missing DLC changes is the quests, dialogue and activities the game
gates on it. Require one because your gamemode is built around that content,
not to keep replication consistent.
