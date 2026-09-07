---
title: Server setup
sidebar:
  order: 11
---

The dedicated server is `KCDMPServer`. It reads `kcdmp-server.json` from its
working directory and loads every resource under `resources/`.

## Configuration

```json
{
    "host": "0.0.0.0",
    "port": 27015,
    "maxplayers": 32,
    "map": "",
    "server-token": "",
    "mod": {
        "level": "kutnohorsko"
    }
}
```

`mod.level` is replicated to joining clients, which load it before the session
opens. It has to be one of the level directories the game ships:
`kutnohorsko`, `trosecko` or `klaster`.

The server has its own configuration file rather than the framework's generic
`server.json`, so a build directory shared with another mod's server does not
hand it the wrong settings.

## Built-in commands

The server answers a few commands itself, before they reach `playerCommand`, so
that spawning, streaming and replication can be exercised with no resources
loaded at all:

| Command | Effect |
| --- | --- |
| `/horse [soul]` | Spawns a horse in front of you |
| `/horse name [text]` | Renames the horse you are riding, or the nearest one |
| `/horse info` | Prints that horse's name, capacity, soul and rider |
| `/stash` | Puts an empty container in front of you |
| `/tp <player\|slot>` | Teleports you next to another player |
| `/tp list` | Lists who is connected and the slot each holds |
| `/give <GUID\|"item name"> [amount]` | Grants items into your inventory |
| `/door lock\|unlock [guid]` | Sets a door's lock state |
| `/gate open\|close [guid]` | Drives an animated gate |

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
