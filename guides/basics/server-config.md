---
title: server.json
sidebar:
  order: 12
---

The server reads `server.json` from the directory it runs in, and writes one
carrying every key the build understands the first time it starts. Framework
keys sit at the top level; KCDC's own sit under `mod`.

```json
{
  "host": "0.0.0.0",
  "port": 27015,
  "apihost": "0.0.0.0",
  "apiport": 27016,
  "maxplayers": 10,
  "server-token": "",
  "mod": {
    "level": "kutnohorsko",
    "required_dlc": []
  }
}
```

A key the build does not recognise is kept and warned about, so a file written
for a newer server still loads on an older one. A key it does recognise with
the wrong type, or a value outside what it accepts, fails at boot instead — the
server refuses to run rather than start with a setting nobody meant.

Both `mod` keys are **replicated**: they reach a client during the MafiaNet
session handshake, which completes before the client reports a connection, so
they are in hand ahead of the asset download and before any script runs. They
are also published on the HTTP endpoint at `apiport`, which is how a server
browser can show them without connecting.

## `mod.level`

The level clients load when they join. A joining client has no other way to
know which one to open, and it starts loading as soon as the handshake lands.

Accepted values are the level directories the game ships under `Data/Levels`:

| Value | Level |
| --- | --- |
| `kutnohorsko` | Kuttenberg and its countryside — the default |
| `trosecko` | Trosky |
| `klaster` | The monastery |

Anything else fails at boot.

## `mod.required_dlc`

The DLCs a player must own to join, as an array of names. Empty — the default —
requires none.

```json
"required_dlc": ["ForgeTycoon", "MysteriaEcclesiae"]
```

A client compares the list against its own game as soon as the handshake lands,
and refuses before it downloads anything or loads the level. What it shows uses
the names the store uses, not the keys:

> This server requires Legacy of the Forge, Mysteria Ecclesiae.

The answer comes from the game's own DLC service, so it is the same verdict
that decides whether a DLC's quests exist for that player. On Steam it means
*installed*, not merely purchased: a DLC the player owns but has not downloaded
counts as missing.

### Accepted keys

The names are the game's own, spelled exactly as below — the check is
case-sensitive, and several differ from the name the store sells them under.

| Key | Sold as |
| --- | --- |
| `QuestForValor` | The Lion's Crest |
| `BanditCamps` | Brushes with Death |
| `ForgeTycoon` | Legacy of the Forge |
| `MysteriaEcclesiae` | Mysteria Ecclesiae |
| `SeasonPassShields` | Season pass rewards |
| `GoldEditionHuntsman` | Gold Edition rewards |
| `Barber` | Barber — free, so every install has it |
| `HorseRacing` | Horse Racing — free |
| `HardcoreMode` | Hardcore Mode — free |

Listing a free one is harmless but pointless: every install satisfies it.

A name that is not in this table fails at boot:

```
Refusing to run: 'Nonsense' is not a DLC this build knows. Use one of the
game's own names, such as ForgeTycoon or MysteriaEcclesiae.
```

So do `TouristMode` and `Unpublished`. The game carries both, but neither has a
store product behind it, so no account can hold one and a server asking for it
would be unjoinable.

### What it is, and is not

The list keeps a player out of a session whose content their game cannot match.
It is **not** an ownership check the server enforces: the client decides, and a
modified client that skips the check gets in. That is deliberate — the cost of
a mismatched join is the player's, and verifying ownership from the server
would mean a store backend the mod does not have.

Requiring a DLC also does not make its content appear. Items, perks and buffs
from every DLC ship in the base game's tables, so they resolve for everyone;
what a missing DLC changes is the quests, dialogue and activities the game
gates on it. Require one because your gamemode is built around that content,
not to keep replication consistent.
