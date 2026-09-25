---
title: Events and handlers
description: Subscribing to native events, how async handlers behave, every event the server and client raise, and events of your own.
sidebar:
  order: 22
---

Almost everything a resource does starts in an event handler: a player
connects, a horse is mounted, a chat line arrives. You subscribe with
[`Events.on`](../../reference/server/variables/Events.md), and the arguments
are typed from the [`EventMap`](../../reference/server/interfaces/EventMap.md),
which is generated from the runtime's own registrations. If an event is not in
the tables below, the game does not raise it.

```ts
// server
Events.on("playerSpawned", (player) => {
  Chat.sendToAll(`${player.nickname} rode into town.`);
});
```

## Subscribing and unsubscribing

`Events.on` returns a function that removes that subscription. `Events.once`
removes the handler before its first call and returns nothing. `Events.off`
takes the same name and function you subscribed with.

```ts
// server
const stop = Events.on("playerChat", (player, text) => {
  console.log(`${player.nickname}: ${text}`);
});
stop();

function greet(player: Player): void {
  Chat.sendToPlayer(player, "Welcome.");
}
Events.once("playerSpawned", greet);
Events.off("playerSpawned", greet);
```

You never need to unsubscribe when your resource stops: its handlers are
removed with it. See [Resources](../resources/#stopping).

## Async handlers

A handler may be `async`. Handlers run in the order they were registered, each
one up to its first `await`, and the emitter gets a promise that settles once
all of them have. If any handler throws or rejects, that promise rejects with
an `AggregateError` holding every failure, and a synchronous throw is also
logged with its stack.

Two things follow. Work after an `await` happens later than the event, so the
world may have moved on: re-check that a player is still connected before you
act on them. And a few events need their answer synchronously.

:::caution[playerSpawning]
`playerSpawning` is raised while the joining client waits behind its loading
screen for somewhere to stand. Call `player.spawn(...)` in the handler itself.
A spawn chosen after an `await` arrives too late to count, and the player
lands on the level's default start point.
:::

On the client, some events say "handler promises are not awaited" in their
reference entry (`questTrackingChanged`, `poiDiscovered`, `noclipChanged`).
Your async handler still runs; nothing waits for it.

## Handles are valid inside the handler

Every event hands you live handles, and teardown events fire while their
subject can still be read: `playerDisconnect` before the body is destroyed,
`horseDestroy`, `npcDestroy` and the other `...Destroy` events while the handle
still resolves. That is the place to read a name one last time and clean up.

Do not keep a handle for later. Keep the id and look it up again, because
`Player.getById` returns `null` once the id no longer names anyone:

```ts
// server
const inQueue = new Set<number>();

Events.on("playerSpawned", (player) => inQueue.add(player.id));
Events.on("playerDisconnect", (player) => inQueue.delete(player.id));

function announce(text: string): void {
  for (const id of inQueue) {
    const player = Player.getById(id);
    if (player) Chat.sendToPlayer(player, text);
  }
}
```

## Server events

| Event | Arguments | Guide |
| --- | --- | --- |
| `playerConnect` | `player` | [Player join and leave events](../../server-scripting/players/lifecycle/) |
| `playerSpawning` | `player` | [Spawn points](../../server-scripting/players/spawning/) |
| `playerSpawned` | `player` | [Player join and leave events](../../server-scripting/players/lifecycle/) |
| `playerDied` | `player` | [Spawn points](../../server-scripting/players/spawning/) |
| `playerDisconnect` | `player` | [Player join and leave events](../../server-scripting/players/lifecycle/) |
| `playerChat` | `player, text` | [Chat messages and /commands](../../server-scripting/players/chat/) |
| `playerCommand` | `player, command, args` | [Chat messages and /commands](../../server-scripting/players/chat/) |
| `playerBuffAdded` | `player, buff, source` | [Buffs](../../server-scripting/players/buffs/) |
| `playerBuffRemoved` | `player, buff, reason` | [Buffs](../../server-scripting/players/buffs/) |
| `playerBuffBlocked` | `player, buff` | [Buffs](../../server-scripting/players/buffs/) |
| `horseSpawn`, `horseDestroy` | `horse` | [Horses](../../server-scripting/npcs-horses-and-dogs/horses/) |
| `horseMount`, `horseDismount` | `horse, player` | [Horses](../../server-scripting/npcs-horses-and-dogs/horses/) |
| `dogSpawn`, `dogDestroy` | `dog` | [Dogs](../../server-scripting/npcs-horses-and-dogs/dogs/) |
| `dogOwnerChanged` | `dog, player` | [Dogs](../../server-scripting/npcs-horses-and-dogs/dogs/) |
| `dogModeChanged` | `dog, mode` | [Dogs](../../server-scripting/npcs-horses-and-dogs/dogs/) |
| `npcSpawn`, `npcDestroy` | `npc` | [NPCs](../../server-scripting/npcs-horses-and-dogs/npcs/) |
| `npcIntentDone` | `npc, status` | [Move NPCs: walk, follow, patrol](../../server-scripting/npcs-horses-and-dogs/npc-orders/) |
| `npcDamage` | `npc, attacker, amount` | [NPC events](../../server-scripting/npcs-horses-and-dogs/npc-events/) |
| `npcDeath` | `npc, attacker` | [NPC events](../../server-scripting/npcs-horses-and-dogs/npc-events/) |
| `npcRevive` | `npc` | [NPC events](../../server-scripting/npcs-horses-and-dogs/npc-events/) |
| `npcInteract` | `npc, player` | [NPC events](../../server-scripting/npcs-horses-and-dogs/npc-events/) |
| `npcSimulatorChange` | `npc, player` | [NPC events](../../server-scripting/npcs-horses-and-dogs/npc-events/) |
| `worldDayChange` | `day` | [Time of day and weather](../../server-scripting/world-and-objects/clock-and-weather/) |
| `worldWeatherChange` | `preset, previous, seconds` | [Time of day and weather](../../server-scripting/world-and-objects/clock-and-weather/) |
| `groundItemSpawn`, `groundItemDestroy` | `groundItem` | [Items lying on the ground](../../server-scripting/world-and-objects/ground-items/) |
| `groundItemPickup` | `groundItem, player` | [Items lying on the ground](../../server-scripting/world-and-objects/ground-items/) |
| `propSpawn`, `propDestroy` | `prop` | [Props](../../server-scripting/world-and-objects/props/) |
| `vfxSpawn`, `vfxDestroy` | `vfx` | [Particle effects](../../server-scripting/world-and-objects/effects/) |
| `markerPlace`, `markerRemove` | `marker` | [Markers](../../server-scripting/world-and-objects/markers/) |
| `markerEnter`, `markerExit` | `marker, player` | [Markers](../../server-scripting/world-and-objects/markers/) |
| `questTrackingChanged` | `quest, player, tracked` | [Quests](../../server-scripting/quests-dialogue-and-shops/quests/) |
| `dialogueChoice` | `session, player, optionId` | [Dialogue](../../server-scripting/quests-dialogue-and-shops/dialogue/) |
| `dialogueClosed` | `session, player, reason` | [Dialogue](../../server-scripting/quests-dialogue-and-shops/dialogue/) |
| `vendorTrade` | `vendor, player, bought, sold, balance` | [Vendors](../../server-scripting/quests-dialogue-and-shops/vendors/) |
| `vendorClosed` | `vendor, player, reason` | [Vendors](../../server-scripting/quests-dialogue-and-shops/vendors/) |
| `resourceStart`, `resourceStop` | `resourceName` | [Resources](../resources/) |
| `entityStateChange` | `entity, key, value, previous` | [Entity state bags](../state/) |

Where an argument is `Player | null` (`horseMount`, `dogOwnerChanged`,
`npcDamage`, `groundItemPickup` and others), check it before use. The
[`EventMap` reference](../../reference/server/interfaces/EventMap.md) has each
event's exact types and the engineers' notes on when it fires.

## Client events

| Event | Arguments | Guide |
| --- | --- | --- |
| `resourceStart`, `resourceStop` | `resourceName` | [Resources](../resources/) |
| `entityStateChange` | `entity, key, value, previous` | [Entity state bags](../state/) |
| `questTrackingChanged` | `questKey, tracked` | [Quests](../../server-scripting/quests-dialogue-and-shops/quests/) |
| `vendorOpened` | `session, npc` | [Vendors](../../server-scripting/quests-dialogue-and-shops/vendors/) |
| `vendorClosed` | `session, reason` | [Vendors](../../server-scripting/quests-dialogue-and-shops/vendors/) |
| `poiDiscovered` | `poiId` | [Map markers and blips](../../client-scripting/user-interface/map/) |
| `mapOpened`, `mapClosed` | none | [Map markers and blips](../../client-scripting/user-interface/map/) |
| `mapWaypointSet` | `position, mapId, moved` | [Map markers and blips](../../client-scripting/user-interface/map/) |
| `mapWaypointCleared` | `position, mapId` | [Map markers and blips](../../client-scripting/user-interface/map/) |
| `noclipChanged` | `active, reason` | [Free camera (noclip)](../../client-scripting/noclip/) |
| `browserCreated`, `browserDocumentReady`, `browserLoadingStart`, `browserLoadingFailed` | `event` | [Show an HTML page (web views)](../../client-scripting/user-interface/web-views/) |
| `browserNavigate`, `browserPopup`, `browserOriginChange`, `browserResourceBlocked` | `event` | [Show an HTML page (web views)](../../client-scripting/user-interface/web-views/) |
| `browserCursorChange`, `browserTooltip`, `browserInputFocusChange`, `browserConsoleMessage` | `event` | [Send data to and from a page](../../client-scripting/user-interface/page-bridge/) |

Chat lines arriving from the server come through a reserved `chatMessage`
event that the declarations mention but do not type; see
[Chat box on the client](../../client-scripting/user-interface/chat/).

## Events of your own

Any name that is not native works as a custom event, on the same bus. Prefix
it with your resource name, because every resource shares that bus:

```ts
// server
Events.on("my-mode:round.end", (winner) => {
  if (typeof winner !== "string") return;
  Chat.sendToAll(`${winner} wins the round.`);
});

Events.emit("my-mode:round.end", "Ravens").catch((error) => {
  console.error(`a round.end handler failed: ${String(error)}`);
});
```

Custom handlers receive `unknown`: nothing checks what the emitter passed, so
narrow it. `Events.emit` returns the promise described above. `await` it to
wait for every handler, or attach a `.catch`: a rejection nobody handles counts
as an uncaught error, which triggers your
[`errorBehavior`](../resources/#errors).

:::danger
Nothing stops a script from emitting a native name. `Events.emit("playerDied",
player)` runs every resource's `playerDied` handler as if the game had raised
it. Never do it, and never emit a name you did not define.
:::

Three variations narrow who hears an event:

| Call | Reaches |
| --- | --- |
| `Events.emitTo(resourceName, name, ...args)` | Only that resource's `Events.on` handlers. |
| `Events.emitLocal(name, ...args)` | Only handlers the calling resource registered with `Events.onLocal`. Other resources cannot hear or send these. |
| `Events.listenerCount(name)` | Not an emit: counts `Events.on` and `once` handlers across all resources. |

`onLocal` has no matching `off`; its handlers live until the resource stops.

Events that cross the network use the same `Events.on` on the client, and a
separate `Events.onClient` table on the server so that a client can never
trigger a native or resource event. That is its own page:
[Send data between server and client](../networking/).
