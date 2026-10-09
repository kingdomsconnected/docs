---
title: Events and handlers
description: Subscribe to events, write async handlers safely, look up every event the server and client raise, and emit events of your own.
sidebar:
  label: Events
  order: 22
---

Almost everything a resource does starts in an event handler. Subscribe with
[`Events.on`](../../reference/server/variables/Events.md); the arguments are
typed from the [`EventMap`](../../reference/server/interfaces/EventMap.md). If
an event is not in the lists below, the game does not raise it.

```ts
// server
Events.on("playerSpawned", (player) => {
  Chat.sendToAll(`${player.nickname} rode into town.`);
});
```

## Subscribe and unsubscribe

| Call | Does |
| --- | --- |
| `Events.on(name, fn)` | Subscribes. Returns a function that unsubscribes. |
| `Events.once(name, fn)` | Removes the handler before its first call. Returns nothing. |
| `Events.off(name, fn)` | Unsubscribes the same name and function. |

```ts
// server
const stop = Events.on("playerChat", (player, text) => {
  console.log(`${player.nickname}: ${text}`);
});
stop();
```

Handlers are removed when your resource stops; you never need to clean up
there. See [Resources](../resources/#stop-a-resource).

## Async handlers

Handlers run in registration order, each up to its first `await`. The emitter
gets a promise that settles when all have; if any throws or rejects, it
rejects with an `AggregateError`. A synchronous throw is also logged with its
stack.

Code after an `await` runs later than the event, so re-check that a player is
still connected before acting on them. Some events need an answer in the
handler itself:

- `playerSpawning`: call `player.spawn(...)` before any `await`, or the player
  lands on the level's default start point.
- `horseMounting`, `horseGearChanging`, `playerPickpocketStart`, `doorInteract`:
  return `false` to refuse. An async handler cannot refuse.
- `playerConsuming`, `playerConsumptionEffects`, `playerPoisonAbsorbing`:
  return `false` synchronously to refuse the serving, its native effects, or
  added pot poison respectively. See [Food and potions](../../players/consumables/).

On the client, `questTrackingChanged`, `poiDiscovered` and `noclipChanged` do
not await handler promises. Your async handler still runs; nothing waits.

## Keep ids, not handles

Handles are valid inside the handler. Teardown events (`playerDisconnect`,
`npcDestroy` and the other `...Destroy` events) fire while the handle still
reads, so read a name there one last time. To use a subject later, keep its id
and look it up again: `getById` returns `null` once it is gone.

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

An argument typed `Player | null` (noted as `attacker?`, `player?` and so on)
can be `null`: check it. The
[`EventMap` reference](../../reference/server/interfaces/EventMap.md) has
exact types and every union value.

### Players

Guides: [Join and spawn](../../players/join-and-spawn/),
[Health and stats](../../players/stats/), [Buffs](../../players/buffs/),
[Chat](../../players/chat/).

| Event | Arguments | Fires when |
| --- | --- | --- |
| `playerConnect` | `player` | Their body exists, still loading. `ready` is false. |
| `playerSpawning` | `player` | Their body needs a place to stand. Answer synchronously. |
| `playerSpawned` | `player` | They are standing in the loaded world. Give kit here. |
| `playerDisconnect` | `player` | They are leaving; the handle still reads. |
| `playerHit` | `player, attacker, hit` | A player hit or NPC melee hit is about to take health. Return false to refuse; change `hit.damage` to set the amount. |
| `playerDamage` | `player, attacker?, amount, bodyPart?, reason` | Health came off them, after any `playerHit` ruling. |
| `playerInjured` | `player, bodyPart` | A limb becomes injured. |
| `playerInjuryHealed` | `player, bodyPart` | A limb injury is gone. |
| `playerDied` | `player, killer?, reason` | A death is accepted. No automatic respawn. |
| `playerChat` | `player, text` | They submit a plain chat line. |
| `playerCommand` | `player, command, args` | A `/` line no built-in command claimed. |
| `playerBuffAdded` | `player, buff, source` | An effect appears. `source` is `"server"` or `"native"`. |
| `playerBuffRemoved` | `player, buff, reason` | An effect leaves. `reason` is `"server"` or `"expired"`. |
| `playerBuffBlocked` | `player, buff` | The game tried a buff kind you `Buffs.claim`ed. |
| `playerPickpocketStart` | `thief, victim` | A Rob attempt begins. Return `false` to refuse. |
| `playerPickpocketed` | `thief, victim, items` | A theft settled; `items` is what really moved. |
| `playerPickpocketCaught` | `thief, victim` | The victim noticed. Nothing was taken. |

For `playerHit`, the attacker can be a player or NPC. The attacker/killer
in player damage and death events can also be null. Check the type before
using player-only properties. Lowering health from a script raises damage
with a null attacker; see [Set and restore stats](../../players/restoring-stats/).

### Horses and dogs

Guides: [Horses](../../npcs-and-animals/horses/), [Dogs](../../npcs-and-animals/dogs/).

| Event | Arguments | Fires when |
| --- | --- | --- |
| `horseSpawn`, `horseDestroy` | `horse` | A horse is created, or is being despawned. |
| `horseMounting` | `horse, player` | A player climbs on. Return `false` to refuse. |
| `horseMount`, `horseDismount` | `horse, player?` | A rider got on or off (including on death or disconnect). |
| `horseDamage` | `horse, attacker?, amount, reason` | Health came off a horse. |
| `horseDeath` | `horse, killer?, reason` | A horse dies. |
| `horseGearChanging` | `horse, player?, gear` | A player changes gear. Return `false` to refuse. |
| `horseIntentDone` | `horse, status` | A move or patrol leg reached, was blocked or failed. |
| `horseGearChanged` | `horse, player?, gear` | Gear changed on every client. `player` is null for a script. |
| `dogSpawn`, `dogDestroy` | `dog` | A dog is created, or is being despawned. |
| `dogOwnerChanged` | `dog, player?` | A dog is handed over or left masterless. |
| `dogModeChanged` | `dog, mode` | Its companion mode actually changes. |

### NPCs

Guides: [Spawn NPCs](../../npcs-and-animals/npcs/),
[Move NPCs](../../npcs-and-animals/npc-orders/),
[NPC damage and death](../../npcs-and-animals/npc-events/).

| Event | Arguments | Fires when |
| --- | --- | --- |
| `npcSpawn`, `npcDestroy` | `npc` | An NPC is spawned or adopted, or is being despawned. |
| `npcIntentDone` | `npc, status` | An order ends: `reached`, `blocked` or `failed`. |
| `npcDamage` | `npc, attacker?, amount` | Health came off, as agreed by the server. |
| `npcDeath` | `npc, attacker?` | Its health runs out. The corpse stays. |
| `patrolWaypoint` | `npc, info` | A waypoint was reached, blocked or failed. |
| `patrolFinished` | `npc, info` | A patrol completed, failed or was cancelled. |
| `npcRevive` | `npc` | A dead NPC is brought back. |
| `npcInteract` | `npc, player` | A player presses use on an `interactable` NPC. |
| `npcSimulatorChange` | `npc, player?` | The client running it changes. `null` means dormant. |
| `npcInventoryReady` | `npc` | Initial server-owned stock is established. |
| `npcInventoryChanged` | `npc, change` | Stock changes, including committed loot transfers. |
| `npcHarvested` | `npc, player` | Animal harvesting completes. |

NPC damage and death attackers are `Player | Npc | null`.
[Named patrol routes](../../npcs-and-animals/patrol-routes/) explains the
route ID, waypoint index and phase carried in patrol events.

### World and objects

Guides: [Time and weather](../../world/clock-and-weather/),
[Doors and gates](../../world/doors-and-gates/), [Props](../../world/props/),
[Particle effects](../../world/effects/), [Markers](../../world/markers/),
[Items](../../players/items/).

| Event | Arguments | Fires when |
| --- | --- | --- |
| `worldResourcesReady` | none | All configured exports loaded. Check `WorldResource.ready` when starting later. |
| `worldDayChange` | `day` | The clock crosses midnight. `day` is the new one. |
| `worldWeatherChange` | `preset, previous, seconds` | A weather blend starts. |
| `doorInteract` | `player, door, action, keySide` | A player works a door. Return `false` to refuse. |
| `propSpawn`, `propDestroy` | `prop` | A prop is created, or is being despawned. |
| `vfxSpawn`, `vfxDestroy` | `vfx` | An effect is placed, or is being stopped. |
| `markerPlace`, `markerRemove` | `marker` | A marker is drawn, or is being removed. |
| `markerEnter`, `markerExit` | `marker, player` | A player walks into or out of a `trigger` marker. |
| `groundItemSpawn`, `groundItemDestroy` | `groundItem` | A stack is laid down, or is being removed. |
| `groundItemPickup` | `groundItem, player?` | A pickup was granted. `groundItemDestroy` follows. |

### Quests, dialogue and shops

Guides: [Quests](../../quests-dialogue-and-shops/quests/),
[Dialogue](../../quests-dialogue-and-shops/dialogue/),
[Shops](../../quests-dialogue-and-shops/vendors/).

| Event | Arguments | Fires when |
| --- | --- | --- |
| `questTrackingChanged` | `quest, player, tracked` | A player follows or unfollows a quest. Cannot be refused. |
| `dialogueChoice` | `session, player, optionId` | A player picks an option. |
| `dialogueClosed` | `session, player, reason` | A conversation ends. |
| `vendorTrade` | `vendor, player, bought, sold, balance` | A deal has settled. |
| `vendorClosed` | `vendor, player, reason` | A trading session ends. |

### Resources and state

| Event | Arguments | Fires when |
| --- | --- | --- |
| `resourceStart` | `resourceName` | Any resource's scripts have run, just before it counts as running. See [Resources](../resources/). |
| `resourceStop` | `resourceName` | Any resource is stopping, before cleanup. |
| `entityStateChange` | `entity, key, value, previous` | A state bag key changes. See [State bags](../state/). |

## Client events

| Event | Arguments | Fires when | Guide |
| --- | --- | --- | --- |
| `resourceStart`, `resourceStop` | `resourceName` | As on the server. | [Resources](../resources/) |
| `entityStateChange` | `entity, key, value, previous` | A state write arrives. | [State bags](../state/) |
| `questTrackingChanged` | `questKey, tracked` | This player follows or unfollows a quest. | [Quests](../../quests-dialogue-and-shops/quests/) |
| `vendorOpened` | `session, npc` | The trade screen actually comes up. | [Shops](../../quests-dialogue-and-shops/vendors/) |
| `vendorClosed` | `session, reason` | That screen goes away. | [Shops](../../quests-dialogue-and-shops/vendors/) |
| `poiDiscovered` | `poiId` | A silent POI discovery is accepted. | [Map and blips](../../user-interface/map/) |
| `mapOpened`, `mapClosed` | none | The map screen opens or closes. | [Map and blips](../../user-interface/map/) |
| `mapWaypointSet` | `position, mapId, moved` | The player drops or moves their map marker. | [Map and blips](../../user-interface/map/) |
| `mapWaypointCleared` | `position, mapId` | The player removes it. | [Map and blips](../../user-interface/map/) |
| `followStarted` | `target` | A queued native follow entered. | [Following](../../client-scripting/following/) |
| `followStopped` | `target, reason` | A follow stopped or failed to enter. | [Following](../../client-scripting/following/) |
| `monologueSuppressed` | `text, textKey` | A local character remark was suppressed. | [HUD](../../user-interface/hud/#control-the-local-characters-monologue) |
| `noclipChanged` | `active, reason` | Free camera starts or ends. | [Camera and noclip](../../client-scripting/camera/) |
| `browserCreated`, `browserLoadingStart`, `browserDocumentReady`, `browserLoadingFailed` | `event` | A web view is created, loads, is ready for `Web.emit`, or fails. | [HTML pages](../../user-interface/web-views/) |
| `browserNavigate`, `browserPopup`, `browserOriginChange`, `browserResourceBlocked` | `event` | A view navigates, blocks a popup, changes origin, or blocks a request. | [HTML pages](../../user-interface/web-views/) |
| `browserCursorChange`, `browserTooltip`, `browserInputFocusChange`, `browserConsoleMessage` | `event` | A view asks for a cursor or tooltip, gains or loses text focus, or logs. | [Page data bridge](../../user-interface/page-bridge/) |

Chat lines from the server arrive through a reserved `chatMessage` event that
the declarations mention but do not type; see
[Chat and /commands](../../players/chat/).

## Inventory, consumption and books

| Side | Event | Arguments and purpose |
| --- | --- | --- |
| Server | `playerInventoryReady` | `player`: the initial inventory is displayed. |
| Server | `playerInventoryChanged` | `player, change`: a committed inventory change. |
| Server | `playerCustomItemUse` | `player, row, revision`: a validated custom use request; no automatic consumption. |
| Server | `playerConsuming` | `player, consumption`: allow or refuse the serving. |
| Server | `playerConsumptionEffects` | `player, consumption`: keep or suppress its native effects. |
| Server | `playerPoisonAbsorbing` | `player, consumption, buff`: allow or block added pot poison. |
| Server | `playerConsumed` | `player, consumption`: successful native use was confirmed. |
| Server | `playerStatsChanged` | `player, changes`: stat changes grouped by tick, with previous and current values. |
| Client | `bookOpened` | `id`: the requested book reached the player's hands. |
| Client | `bookClosed` | `id, reason`: reading ended or opening failed; promises are not awaited. |

See [Inventories](../../players/inventory/),
[Custom items](../../players/custom-items/),
[Food and potions](../../players/consumables/) and
[Books and letters](../../user-interface/books/) for timing and failure cases.

## Emit your own events

Any name that is not native is a custom event on the same bus. Every resource
shares it, so prefix names with your resource name.

```ts
// server
Events.on("my-mode:round.end", (winner) => {
  if (typeof winner !== "string") return; // custom arguments are `unknown`
  Chat.sendToAll(`${winner} wins the round.`);
});

Events.emit("my-mode:round.end", "Ravens").catch((error) => {
  console.error(`a round.end handler failed: ${String(error)}`);
});
```

`Events.emit` returns the promise described in [Async handlers](#async-handlers).
`await` it or attach a `.catch`: an unhandled rejection triggers your
[`errorBehavior`](../resources/#handle-errors).

| Call | Reaches |
| --- | --- |
| `Events.emit(name, ...args)` | Every resource's `Events.on` handlers. |
| `Events.emitTo(resourceName, name, ...args)` | Only that resource's `Events.on` handlers. |
| `Events.emitLocal(name, ...args)` | Only your own `Events.onLocal` handlers. `onLocal` has no `off`. |
| `Events.listenerCount(name)` | Not an emit: counts `on` and `once` handlers across resources. |

:::danger
Nothing stops you emitting a native name. `Events.emit("playerDied", ...)` runs
every resource's handler as if the game had raised it. Never emit a name you
did not define.
:::

Events between server and client use `Events.onClient` on the server, a
separate table a client cannot use to reach native or resource events. See
[Send data between server and client](../networking/).

## Related

- [Server vs client authority](../authority/): what an event confirms
- [Send data between server and client](../networking/): events across the wire
- [Resource manifest and lifecycle](../resources/): `resourceStart`, `resourceStop` and errors
- [EventMap reference](../../reference/server/interfaces/EventMap.md): exact types and notes
