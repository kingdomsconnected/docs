---
title: Map markers and blips
description: Put your own marks on the compass, read and move the player's map marker, react to the map screen, and read fast travel.
sidebar:
  order: 84
---

Four pieces cover the map side of the game, all on the client:

- [`Blip`](../../../reference/client/classes/Blip.md): a mark your resource
  puts on this player's compass.
- [`WorldMap`](../../../reference/client/variables/WorldMap.md): the map
  screen, the marker the player drops on it, and which categories of marks are
  shown.
- The `map*` and `poiDiscovered` events, for when the player uses the map.
- [`Travel`](../../../reference/client/variables/Travel.md): the player's fast
  travel, read-only.

As with the HUD, nothing here is replicated. A mark every player should see is
one the server tells every client to make.

## Blips on the compass

`Blip.create` puts a mark on this client's compass and keeps it there. The
compass recomputes bearing and distance from the position every frame, so the
player sees the mark swing round as they turn.

```ts
const camp = Blip.create({
    position: new Vector3(-420.5, 812.0, 31.0),
    type: "Checkpoint",
    label: "bandit-camp",
});

if (camp === null) {
    console.log("blip limit reached");
}
```

| Option | Default | Meaning |
| --- | --- | --- |
| `position` | required | World position in metres |
| `type` | `"GeneralPoi"` | Which of the game's compass icons to draw: `Checkpoint`, `QuestGiver`, `Shop`, `GeneralPoi` and the rest. An unknown name is rejected rather than guessed |
| `state` | `0` | Passed to the compass as-is; 0 is what a fresh mark uses |
| `label` | none | A name for your own bookkeeping. A compass mark has no text, so it is not drawn |

`create` returns `null` at the blip limit.

A blip is a handle you keep. Assign to `position` to move it (cheap, no
rebuild) or to `type` to change its icon, and call `remove()` to take it away:

```ts
declare const camp: Blip;

camp.position = new Vector3(-400.0, 800.0, 30.0);
camp.type = "QuestGiver";
camp.remove();
```

The game empties the compass on a level load. Your blips survive it: `live`
goes false for a moment and the mod puts the mark back on the next tick. `valid`
goes false only once the blip is removed.

`Blip.all()` lists every blip your client owns, `Blip.getById(id)` finds one,
and `Blip.removeAll()` clears yours while leaving the game's own marks alone.

### A blip for everyone

The server decides; each client draws. Send the position with the event and
build the blip on arrival:

```ts
// server
Events.emitAllClients("my-mode:objective", { x: -420.5, y: 812.0, z: 31.0 });
```

```ts
let objective: Blip | null = null;

Events.on("my-mode:objective", (payload) => {
    if (typeof payload !== "object" || payload === null) return;
    const { x, y, z } = payload as { x?: unknown; y?: unknown; z?: unknown };
    if (typeof x !== "number" || typeof y !== "number" || typeof z !== "number") return;

    objective?.remove();
    objective = Blip.create({ position: new Vector3(x, y, z), type: "Checkpoint" });
});
```

## The map screen

`WorldMap.isOpen` tells you whether the map is up, and the `mapOpened` and
`mapClosed` events fire as it comes and goes. A web view you draw over the
game is a good thing to hide while the map is open:

```ts
declare const hudView: number;

Events.on("mapOpened", () => Web.hideView(hudView));
Events.on("mapClosed", () => Web.showView(hudView));
```

### The player's marker

The player can drop one marker per map. Read it with `getWaypoint()`, which
answers `{ position, mapId }` or `null`. The position's `z` is the terrain
height under the point.

Two events report changes:

| Event | Arguments | Fires when |
| --- | --- | --- |
| `mapWaypointSet` | `position`, `mapId`, `moved` | The player drops a marker (`moved` false) or drags the existing one (`moved` true) |
| `mapWaypointCleared` | `position`, `mapId` | The marker is taken off, by the player or by `clearWaypoint()`. It carries where the marker was |

`mapId` travels with the position because the game's maps reuse one coordinate
range, so a position alone does not say which map it is on.

Sharing a marker with the rest of a party is a matter of forwarding it:

```ts
Events.on("mapWaypointSet", (position, mapId) => {
    Events.emitServer("my-mode:waypoint", {
        x: position.x,
        y: position.y,
        z: position.z,
        mapId,
    });
});
```

`WorldMap.moveWaypoint(position)` moves a marker the player has already
dropped, and answers `false` when there is none: a script cannot create the
player's marker. It does not snap the position to the terrain.
`clearWaypoint()` removes it and raises `mapWaypointCleared` as if the player
had.

### Categories of marks

`setCategoryVisible(type, visible)` shows or hides a whole category of the
game's own marks (every shop, every quest giver) on the compass and in the map
legend, through the same switch the legend rows use. `type` is one of the
compass mark names a blip accepts.

```ts
WorldMap.setCategoryVisible("Shop", false);
WorldMap.isCategoryVisible("Shop"); // false
```

It answers `false` when there is no map page to take it, which is the case in
the main menu and during a level load.

## Discovered places

`poiDiscovered` fires when the player discovers a point of interest. Its one
argument is the place's
[`LocationId`](../../../reference/client/interfaces/LocationId.md): the four
fields of the game's GUID. A string is easier to compare and to send to the
server:

```ts
function guid(id: LocationId): string {
    const hex = (value: number, width: number) => value.toString(16).padStart(width, "0");
    const bytes = Array.from(id.data4, (byte) => hex(byte, 2)).join("");
    return `${hex(id.data1, 8)}-${hex(id.data2, 4)}-${hex(id.data3, 4)}-${bytes.slice(0, 4)}-${bytes.slice(4)}`;
}

Events.on("poiDiscovered", (poiId) => {
    Events.emitServer("my-mode:discovered", guid(poiId));
});
```

It only fires for an actual change: a place that was already discovered raises
nothing.

## Fast travel

`Travel` is deliberately read-only. Starting a fast travel moves the player,
advances the world clock and can trigger a random event, which in a shared
world is the server's decision, not a client script's.

```ts
if (Travel.active) {
    const where = Travel.position;
    console.log(`travelling, now at ${where.x.toFixed(0)}, ${where.y.toFixed(0)}`);
}

const refusal = Travel.canStart(); // 0 means it could start now
```

`position` is zero while no travel is running, so check `active` first.
`canStart()` answers the game's own refusal code, or `null` before the player
is set up. Only 0 has a known meaning (yes); treat anything else as no.

## Related

- [HUD messages, nametags and compass](../hud/): hiding the compass strip itself.
- [Send data between server and client](../../../core-concepts/networking/)
- [Positions, rotations and vectors](../../../core-concepts/math/)
