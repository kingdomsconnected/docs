---
title: Map markers and blips
description: Put your own marks on the compass, read and move the player's map marker, react to the map screen, and read fast travel.
sidebar:
  label: Map and blips
  order: 83
---

Put your own marks on this player's compass with
[`Blip`](../../reference/client/classes/Blip.md), work with the map screen and
the player's marker through
[`WorldMap`](../../reference/client/variables/WorldMap.md), and read fast
travel with [`Travel`](../../reference/client/variables/Travel.md). Nothing here
is replicated: a mark every player should see is one the server tells every
client to make.

## Put a blip on the compass

```ts
const camp = Blip.create({
    position: new Vector3(-420.5, 812.0, 31.0),
    type: "Checkpoint",
});

if (camp === null) console.log("blip limit reached");
```

The compass recomputes bearing and distance every frame, so the mark swings
round as the player turns.

| Option | Default | Meaning |
| --- | --- | --- |
| `position` | required | World position in metres |
| `type` | `"GeneralPoi"` | The game's compass icon: `Checkpoint`, `QuestGiver`, `Shop`, `GeneralPoi` and the rest ([Blip icons](../../resources/blip-icons/)). An unknown name is rejected |
| `state` | `0` | Passed to the compass as-is; 0 is what a fresh mark uses |
| `label` | none | For your own bookkeeping. Compass marks have no text, so it is not drawn |

Keep the handle to change the blip later:

```ts
declare const camp: Blip;

camp.position = new Vector3(-400.0, 800.0, 30.0); // cheap, no rebuild
camp.type = "QuestGiver";
camp.remove();
```

- `Blip.all()` lists your blips, `Blip.getById(id)` finds one, and
  `Blip.removeAll()` clears yours without touching the game's marks.
- A level load empties the compass, but your blips survive: `live` goes false
  for a moment and the mark is back on the next tick. `valid` goes false only
  once the blip is removed.

## Show a blip to every player

The server decides; each client draws.

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

## React to the map opening

`WorldMap.isOpen` says whether the map is up, and `mapOpened` and `mapClosed`
fire as it comes and goes. Hide your own overlays while it is open:

```ts
declare const hudView: number;

Events.on("mapOpened", () => Web.hideView(hudView));
Events.on("mapClosed", () => Web.showView(hudView));
```

## Read and move the player's marker

The player can drop one marker per map. `WorldMap.getWaypoint()` answers
`{ position, mapId }` or `null`; `z` is the terrain height under the point.
`mapId` matters because the game's maps share one coordinate range.

| Event | Arguments | Fires when |
| --- | --- | --- |
| `mapWaypointSet` | `position`, `mapId`, `moved` | The player drops a marker (`moved` false) or drags it (`moved` true) |
| `mapWaypointCleared` | `position`, `mapId` | The marker is removed, by the player or `clearWaypoint()`; carries where it was |

Share a marker with a party by forwarding it:

```ts
Events.on("mapWaypointSet", (position, mapId) => {
    Events.emitServer("my-mode:waypoint", { x: position.x, y: position.y, z: position.z, mapId });
});
```

- `WorldMap.moveWaypoint(position)` moves an existing marker without snapping
  it to the terrain, and answers `false` when there is none. A script cannot
  create the player's marker.
- `WorldMap.clearWaypoint()` removes it and raises `mapWaypointCleared` as if
  the player had.

## Hide a category of marks

`setCategoryVisible(type, visible)` shows or hides every game mark of one type
(every shop, every quest giver) on the compass and in the map legend, like the
legend's own rows. `type` takes the same names as a blip's.

```ts
WorldMap.setCategoryVisible("Shop", false);
WorldMap.isCategoryVisible("Shop"); // false
```

It answers `false` in the main menu and during a level load, when there is no
map page.

## React to a discovered place

`poiDiscovered` fires when the player discovers a new point of interest, never
for one already discovered. Its argument is a
[`LocationId`](../../reference/client/interfaces/LocationId.md), the four fields
of the game's GUID; turn it into a string to compare or send it:

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

## Read fast travel

`Travel` is read-only: starting a trip moves the player, advances the clock and
can trigger a random event, which in a shared world is the server's call.

```ts
if (Travel.active) {
    const where = Travel.position;
    console.log(`travelling, now at ${where.x.toFixed(0)}, ${where.y.toFixed(0)}`);
}

const refusal = Travel.canStart(); // 0 means it could start now
```

`position` is zero unless `active`. `canStart()` answers the game's refusal
code, or `null` before the player is set up; only 0 (yes) has a known meaning.

## Related

- [HUD messages, nametags and compass](../hud/): hide the compass strip itself.
- [Markers and trigger zones](../../world/markers/): world markers placed by the server.
- [Send data between server and client](../../core-concepts/networking/): the events that carry a blip to every client.
- [Positions, rotations and vectors](../../core-concepts/math/): `Vector3` and world coordinates.
