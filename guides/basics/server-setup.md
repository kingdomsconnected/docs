---
title: Server setup
sidebar:
  order: 11
---

The dedicated server is `KCDCServer` — `KCDCServer.exe` on Windows, `KCDCServer`
on Linux. It listens on **27015** for the game session and **27016** for its
HTTP endpoints, loads every resource under `resources/`, and holds 10 players.

Ten is compiled into the build, not merely a default: a `maxplayers` asking for
more is clamped back down at boot with a warning.

## Configuration

Settings live in the framework's `server.json` beside the binary, written with
every key the build understands the first time the server starts. Framework
keys (`host`, `port`, `apihost`, `apiport`, `maxplayers`, `server-token`) sit at
the top level, and KCDC's own — the level clients load and the DLCs they must
own — sit under `mod`. The **server.json** page lists every key and what it
accepts.

## Built-in commands

The server answers a few commands itself, before they reach `playerCommand`, so
that spawning, streaming and replication can be exercised with no resources
loaded at all:

| Command | Effect |
| --- | --- |
| `/horse [soul]` | Spawns a horse in front of you |
| `/horse name [text]` | Renames the horse you are riding, or the nearest one |
| `/horse info` | Prints that horse's name, capacity, soul and rider |
| `/prop <model> [scale] [rigid\|static\|none]` | Places a mesh from the catalog |
| `/prop list\|remove <id>\|clear` | Lists, removes or clears placed props |
| `/drop <item> [amount]` | Lays a stack on the ground within reach |
| `/drop list\|remove <id>\|clear` | Lists, removes or clears dropped stacks |
| `/stash` | Puts an empty container in front of you |
| `/stash clear\|info` | Empties that container, or prints what it holds |
| `/tp <player\|slot>` | Teleports you next to another player |
| `/tp list` | Lists who is connected and the slot each holds |
| `/give <GUID\|"item name"> [amount]` | Grants items into your inventory |
| `/door [near]`, `/door lock\|unlock [guid]`, `/door list` | Sets a door's lock state |
| `/gate [toggle]`, `/gate open\|close [guid]`, `/gate list` | Drives an animated gate |
| `/world info` | Prints the day, hour, scale, weather and rain |
| `/world hour 0..<24`, `/world day <day> <hour>` | Moves the world clock |
| `/world scale 0..200` | Sets how fast world time runs |
| `/world weather <native-preset> [game-seconds 0..21600]` | Blends to a weather preset |
| `/world rain 0..1 [amount 0..1]` | Sets rain |

A command a resource wants to own should not collide with these: a built-in
claims the line first, and `playerCommand` never sees it.

## Chat relay

By default the server echoes every plain chat line back to everyone. A gamemode
that wants to own delivery — teams, proximity, moderation — turns that off and
answers `playerChat` itself:

```js
Chat.setDefaultRelay(false);

Events.on("playerChat", (player, text) => {
  for (const other of Player.all()) {
    if (other.position.distance(player.position) < 30) {
      Chat.sendToPlayer(other, text, { author: player.nickname });
    }
  }
});
```
