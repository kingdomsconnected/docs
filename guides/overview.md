---
title: Introduction
description: What a Kingdoms Connected resource is, where it runs, and which page to open for the task in front of you.
sidebar:
  label: Introduction
  order: 1
---

[Kingdoms Connected](https://kingdomsconnected.com/) (KCDC) puts other players into Kingdom Come: Deliverance II's own world. Everything
that makes a server yours lives in **resources**: folders of JavaScript or TypeScript the server loads.

| | Server half | Client half |
| --- | --- | --- |
| Runs on | The dedicated server | Every connected player's game |
| Owns | Everything shared: players' inventories and progression, horses, NPCs, props, quests, the clock | Nothing shared. It reads what this machine sees and draws UI |
| Typical jobs | Spawns, commands, game rules, economy, persistence | Menus, HUD, key binds, placement previews |
| Reference | [Server API](../reference/server/index.md) | [Client API](../reference/client/index.md) |

## Start here

Read **Getting started** in order:

1. [Install and run a server](../getting-started/install/): from nothing to standing in your own server, with a Steam, GOG or any other copy of the game.
2. [Write your first resource](../getting-started/first-resource/): a command, a key bind and a server round trip.
3. [Use TypeScript](../getting-started/typescript/): autocomplete and type checking for the whole API.
4. [Structure a larger resource](../getting-started/project-structure/): folders that stay easy to change.
5. [Logs and debugging](../getting-started/debugging/): find out why nothing happened.

## Find it fast

| Section | I want to... | Page |
| --- | --- | --- |
| Players | Greet players, choose where they spawn and respawn | [Join, spawn and respawn](../players/join-and-spawn/) |
| Players | Read health, stamina, stats or skills | [Read and set stats](../players/stats/) |
| Players | Set health, energy or nourishment and restore living characters | [Set and restore stats](../players/restoring-stats/) |
| Players | Grant XP, levels and perks, slow down levelling, keep a character | [Skills, XP and perks](../players/progression/) |
| Players | Teleport, kick, revive or rename a player | [Teleport, kick and other actions](../players/actions/) |
| Players | Give, take or drop items, read equipment | [Items](../players/items/) |
| Players | Carry sacks, baskets or a downed player in the arms | [Carrying](../players/carrying/) |
| Players | Register custom types and personalize their inventory rows | [Custom items](../players/custom-items/) |
| Players | Approve food and potions or replace their effects | [Food and potions](../players/consumables/) |
| Players | Read, move or save a player's inventory, set item quality | [Inventories](../players/inventory/) |
| Players | Let players brew potions, refuse or reward a batch, refund an unfinished craft | [Alchemy](../players/alchemy/) |
| Players | Let players forge at smitheries, teach recipes, decide what a failed workpiece costs | [Smithing](../players/smithing/) |
| Players | Change a face, hair or body; add a buff | [Appearance](../players/appearance/), [Buffs](../players/buffs/) |
| Players | Add `/commands` or send chat messages | [Chat and /commands](../players/chat/) |
| Players | Seat two players at a dice table, list the tables, settle what they played for | [Dice matches](../players/dice/) |
| World | Change the time or the weather | [Time of day and weather](../world/clock-and-weather/) |
| World | Place objects, fill chests, open virtual storage, or play particle effects | [Props](../world/props/), [Stashes](../world/stashes/), [Effects](../world/effects/) |
| World | Lock a door, open a castle gate | [Lock doors, open gates](../world/doors-and-gates/) |
| World | Mark a spot, detect players entering an area | [Markers and trigger zones](../world/markers/) |
| World | Trace a ray, tell what it hit (door, tree, rock), find the ground, list nearby entities | [Raycasts and nearby entities](../world/raycasts/) |
| World | Spawn a cart or wagon and let players drive it | [Carts and wagons](../world/carts/) |
| World | Build a trebuchet or cannon, fire it, let players work it | [Siege engines](../world/siege-engines/) |
| World | Create a map offline, save blueprints and export it to a server | [World Builder](../world/world-builder/) |
| World | Draw and group areas for gameplay rules | [World Builder areas](../world/world-builder-areas/) |
| World | Find exported objects, areas and routes in a server script | [World exports in scripts](../world/world-resources/) |
| World | Refill or disable a shared stew pot | [Shared stew pots](../world/cook-pots/) |
| World | Remove or move the level's own walls and gates from scripts | [Level edits](../world/level-edits/) |
| World | Let players pick herbs, refuse a pick, or change how fast plants regrow | [Herb gathering](../world/gathering/) |
| NPCs and animals | Spawn NPCs and make them walk, follow or patrol | [Spawn NPCs](../npcs-and-animals/npcs/), [Move NPCs](../npcs-and-animals/npc-orders/) |
| NPCs and animals | Route NPCs around walls, plan paths, find the floor or a random walkable spot | [Navigation mesh](../npcs-and-animals/navigation/) |
| NPCs and animals | Draw, preview and run named NPC patrols | [Named patrol routes](../npcs-and-animals/patrol-routes/) |
| NPCs and animals | Order melee and bow combat | [NPC combat](../npcs-and-animals/npc-combat/) |
| NPCs and animals | Spawn predators and prey, choose population and respawn rules | [Animal populations](../npcs-and-animals/animals/) |
| NPCs and animals | Set corpse loot and harvest animals | [Corpse loot](../npcs-and-animals/npc-inventories/) |
| NPCs and animals | React when an NPC is hit, dies or is talked to | [NPC events](../npcs-and-animals/npc-events/) |
| NPCs and animals | Spawn horses or dogs | [Horses](../npcs-and-animals/horses/), [Dogs](../npcs-and-animals/dogs/) |
| NPCs and animals | Give a player their own horse, keep it when they leave | [Horse owners](../npcs-and-animals/horse-owners/) |
| Quests, dialogue and shops | Add a quest, show dialogue choices, open a shop | [Quests](../quests-dialogue-and-shops/quests/), [Dialogue](../quests-dialogue-and-shops/dialogue/), [Shops](../quests-dialogue-and-shops/vendors/) |
| Quests, dialogue and shops | Track a quest for a player, mark objectives on the map | [Quest tracking](../quests-dialogue-and-shops/quest-tracking/) |
| Core concepts | React to any game event | [Events and handlers](../core-concepts/events/) |
| Core concepts | Send data to a player's client and back | [Send data between server and client](../core-concepts/networking/) |
| Core concepts | Store a team, a score or a role on a player | [Entity state bags](../core-concepts/state/) |
| Core concepts | Ship my own models, textures, animations, sounds or effects, or replace the game's | [Custom assets](../core-concepts/custom-assets/) |
| Client scripting | Read the local player, bind a key | [Local player](../client-scripting/local-player/), [Key binds](../client-scripting/input/) |
| Client scripting | Let a player follow another player or an NPC guide | [Following](../client-scripting/following/) |
| Client scripting | Replace an item's native inventory action | [Inventory use](../client-scripting/inventory-use/) |
| Client scripting | Cut or glide to a scripted view | [Camera shots](../client-scripting/camera-shots/) |
| Client scripting | Move the camera, fly a free camera | [Camera and noclip](../client-scripting/camera/) |
| Client scripting | Play sounds, use voice chat, set Discord status | [Sound and voice](../client-scripting/sound-and-voice/), [Discord presence](../client-scripting/discord-presence/) |
| Client scripting | Make the screen look drunk, hurt or dreamlike | [Screen effects](../client-scripting/screen-effects/) |
| Client scripting | Draw debug lines, boxes and areas in the world | [Debug gizmos](../client-scripting/gizmos/) |
| User interface | Show your own books and letters in the player's hands | [Books and letters](../user-interface/books/) |
| User interface | Show an HTML menu and talk to it | [Web views](../user-interface/web-views/), [Page data bridge](../user-interface/page-bridge/) |
| User interface | Show a HUD message, nametag or map blip | [HUD](../user-interface/hud/), [Map and blips](../user-interface/map/) |
| User interface | Show a "Press [key] to ..." hint, let a player design their look | [Action hints](../user-interface/action-hints/), [Character creator](../user-interface/character-creator/) |
| User interface | Turn off the game's own inventory, map or journal | [Native UI screens](../user-interface/native-ui/#turn-off-the-games-own-menus) |
| Tutorials | Give a personalized letter and open its pages | [Readable custom letter](../tutorials/custom-letter/) |
| Getting started | Try items, crafting and companions on a development server | [Development playground](../getting-started/playground/) |
| Tutorials | Build a complete feature end to end | [/command system](../tutorials/command-system/), [NPC shop](../tutorials/market-stall/), [Capture-zone mode](../tutorials/team-rounds/) |
| Tutorials | Connect a World Builder route to a guard | [Village patrol](../tutorials/world-builder-patrol/) |
| Tutorials | Defend a yard drawn in World Builder | [Guarded yard](../tutorials/world-builder-sentry/) |
| Tutorials | Lead a player on an authored NPC route | [Walking tour](../tutorials/world-builder-tour/) |
| Hosting a server | Run a dedicated server, change its settings, load world exports | [Run a server](../hosting-a-server/run-a-server/), [Options and overrides](../hosting-a-server/options-and-overrides/), [server.json](../hosting-a-server/server-json/) |
| Hosting a server | Run the official Docker image or a Pterodactyl egg | [Docker and panels](../hosting-a-server/containers/) |
| Hosting a server | Let players connect, list the server publicly with a logo | [Let players connect](../hosting-a-server/players-connecting/), [Server browser listing](../hosting-a-server/server-browser/) |
| Resources | Look up a face, horse breed, item, buff or effect name | [Game resources and catalogs](../resources/overview/) |

## How the sidebar is organised

| Group | What is in it | Runs on |
| --- | --- | --- |
| Getting started | Install, first resource, TypeScript, layout, debugging | Both |
| Core concepts | Authority, resources, events, networking, state, positions, virtual worlds, sharing, custom assets | Both |
| Players | Join and spawn, stats, progression, actions, items, carrying, inventories, alchemy, smithing, appearance, buffs, chat, dice | Server |
| World | Clock and weather, props, stashes, doors, markers, effects, raycasts, carts, siege engines, level edits, herb gathering, World Builder exports, stew pots | Server (raycasts: both) |
| NPCs and animals | NPCs, combat, named patrols, animal populations, horses and their owners, dogs, navigation | Server |
| Quests, dialogue and shops | Journal quests and tracking, dialogue choices, vendors | Server |
| Client scripting | Local player, key binds, camera, placement, sound, Discord, following, screen effects, debug gizmos | Client |
| User interface | Web views, page bridge, HUD, map, native screens and menus, action hints, character creator | Client |
| Tutorials | Multi-file builds of complete features | Both |
| Hosting a server | Running, command-line options and overrides, connecting, listing, the official Docker image | Server operators |
| Resources | Every name the catalogs carry: faces, beards, horse breeds and gear, souls, items, buffs, effects, markers, blips, props | Reference |

## A taste

Two files are a complete resource. The server half greets people and spawns a horse on `/horse`:

```js title="server/main.js"
Events.on("playerSpawned", (player) => {
  Chat.sendToPlayer(player, `Welcome, ${player.nickname}. Type /horse for a ride.`);
});

Events.on("playerCommand", (player, command) => {
  if (command !== "horse" || !player.ready) return;
  Horse.spawn(player.position, undefined, undefined, `${player.nickname}'s horse`);
});
```

The client half shows the player their health when they press F8:

```js title="client/main.js"
Key.bind("f8", "down", () => {
  const me = LocalPlayer;
  if (me) Hud.showInfoText(`${Math.round(me.health)} / ${Math.round(me.maxHealth)} health`);
});
```

[Write your first resource](../getting-started/first-resource/) builds one like it step by step.

## One rule explains most of the API

Each player's own game keeps their body's state (health, clothing, position) and is the authority for
it; the server is the authority for everything shared, and for each player's inventory and progression. So `player.teleport(...)` sends that game a request, and most
verbs return whether the request went out, not whether it worked. See [Server vs client
authority](../core-concepts/authority/).

## Where the reference comes from

The API reference is generated from the runtime's own bindings, so when a guide and the reference
disagree, the reference wins. Please [open an issue](https://github.com/kingdomsconnected/docs/issues)
so the guide gets fixed.
