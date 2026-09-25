---
title: Introduction
description: What a Kingdoms Connected resource is, where it runs, and which guide to read first.
sidebar:
  order: 1
---

Kingdoms Connected (KCDC) puts other players into Kingdom Come: Deliverance
II's own world. Everything that makes a server feel like *your* server, from
where people spawn to what `/help` prints, lives in **resources**: folders of
JavaScript or TypeScript that the server loads at startup.

A resource can run code in two places:

| | Server half | Client half |
| --- | --- | --- |
| Runs on | The dedicated server, in Node.js | Every connected player's game, in a sandboxed V8 |
| Owns | Everything shared: who is connected, horses, NPCs, props, quests, the clock | Nothing shared. It reads what this machine can see and draws UI |
| Typical jobs | Spawn points, commands, game rules, economy, persistence | Menus, HUD, key binds, placement previews |
| Reference | [Server API](../reference/server/index.md) | [Client API](../reference/client/index.md) |

The server that ships with KCDC answers no commands on its own. Every `/`
command you have seen in game (`/horse`, `/give`, `/tp`, `/world`...) comes
from the **default gamemode**, a resource written against the same public API
you use. It is the best example code there is, and the guides point into it
often.

## Where to start

:::tip[New to KCDC scripting?]
Read **Getting started** in order. It takes you from an empty machine to a
running server with the default gamemode, then to your own resource in plain
JavaScript, then to a TypeScript setup that can grow.
:::

The sidebar is split by where your code runs:

| Section | What is in it |
| --- | --- |
| **Getting started** | Tools, running the default gamemode, your first resource, TypeScript, debugging |
| **Core concepts** | Ideas every page relies on: authority, events, networking, state, positions |
| **Server scripting** | Everything a gamemode does on the server, grouped by what it acts on |
| **Client scripting** | Code that runs in each player's game: input, camera, and the user interface |
| **Tutorials** | Complete features built end to end |
| **Hosting a server** | Running, configuring and opening a server to players |

Right under this page, [List your server in the server
browser](../publish-on-masterlist/) covers getting a public server into the
in-game browser.

## Find it fast

Most gamemode work happens on the server. If you know what you want to do,
this is where it lives:

| I want to... | Page |
| --- | --- |
| Greet players, track who is online | [Player join and leave events](../server-scripting/players/lifecycle/) |
| Choose where players spawn, respawn after death | [Spawn points and respawning](../server-scripting/players/spawning/) |
| Read health, stamina, stats or skills | [Player health, stats and skills](../server-scripting/players/reading/) |
| Teleport, kick, revive or rename a player | [Teleport, kick and other player actions](../server-scripting/players/actions/) |
| Give or take items, read equipment | [Give and take items](../server-scripting/players/inventory/) |
| Change a face, hair or body | [Player appearance](../server-scripting/players/appearance/) |
| Add `/commands` or send chat messages | [Chat messages and /commands](../server-scripting/players/chat/) |
| Store a team, a score or a role on a player | [Entity state bags](../core-concepts/state/) |
| Change the time or the weather | [Time of day and weather](../server-scripting/world-and-objects/clock-and-weather/) |
| Place objects in the world | [Spawn props and objects](../server-scripting/world-and-objects/props/) |
| Mark a spot, detect players entering an area | [Markers and trigger zones](../server-scripting/world-and-objects/markers/) |
| Lock a door, open a castle gate | [Lock doors, open gates](../server-scripting/world-and-objects/doors-and-gates/) |
| Spawn horses or dogs | [Horses](../server-scripting/npcs-horses-and-dogs/horses/), [Dogs](../server-scripting/npcs-horses-and-dogs/dogs/) |
| Spawn NPCs and make them walk, follow or patrol | [Spawn NPCs](../server-scripting/npcs-horses-and-dogs/npcs/), [Move NPCs](../server-scripting/npcs-horses-and-dogs/npc-orders/) |
| Add a quest to the journal | [Quests in the journal](../server-scripting/quests-dialogue-and-shops/quests/) |
| Show dialogue choices | [Dialogue choices](../server-scripting/quests-dialogue-and-shops/dialogue/) |
| Open a shop | [Shops (vendors)](../server-scripting/quests-dialogue-and-shops/vendors/) |
| React to any game event | [Events and handlers](../core-concepts/events/) (the full list) |
| Send data to a player's client and back | [Send data between server and client](../core-concepts/networking/) |
| Bind a key, show a menu or a HUD message | [Key binds](../client-scripting/input/), [HTML pages](../client-scripting/user-interface/web-views/), [HUD messages](../client-scripting/user-interface/hud/) |
| Get my server listed in the in-game server browser | [List your server in the server browser](../publish-on-masterlist/) |
| Understand why a verb returns before anything happened | [Server vs client authority](../core-concepts/authority/) |

## A taste

Two files are a complete resource. The server half greets people and hands
out a horse on request:

```js title="server/main.js"
Events.on("playerSpawned", (player) => {
  Chat.sendToPlayer(player, `Welcome, ${player.nickname}. Type /horse for a ride.`);
});

Events.on("playerCommand", (player, command) => {
  if (command !== "horse" || !player.ready) return;
  Horse.spawn(player.position, undefined, undefined, `${player.nickname}'s horse`);
});
```

The client half shows the player their own health whenever they press F8:

```js title="client/main.js"
Key.bind("f8", "down", () => {
  const me = LocalPlayer;
  if (me) Hud.showInfoText(`${Math.round(me.health)} / ${Math.round(me.maxHealth)} health`);
});
```

[Write your first resource](../getting-started/first-resource/) builds exactly this, step by
step.

## One rule explains most of the API

Kingdom Come keeps a player's whole state (health, skills, what they wear,
where they stand) on their own machine. So the owning client is the authority
for its player's body, and the server is the authority for everything between
players. Reading `player.health` on the server gives you the last number their
game reported; calling `player.teleport(...)` sends their game a request.

That is why there is no `player.health = 100`, and why most verbs return
whether a request *went out* rather than whether it *worked*.
[Server vs client authority](../core-concepts/authority/) walks through it properly.

## Where the reference comes from

Every function, property and event in the API reference is generated from the
mod's own binding registrations. When the runtime installs `player.teleport`,
it records the name, signature and description in the same call, so the
reference cannot drift from the code. The same declarations power
autocomplete and type checking in your editor; [Use
TypeScript](../getting-started/typescript/) shows how to get them.

When a guide and the reference disagree, the reference is right. Please
[open an issue](https://github.com/kingdomsconnected/docs/issues) so the
guide gets fixed.
