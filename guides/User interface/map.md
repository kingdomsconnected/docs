---
title: Map markers and blips
description: Put your own marks on the compass and map screen, read and move the player's map marker, keep map discovery and fog of war across sessions, and read fast travel.
sidebar:
  label: Map and blips
  order: 83
---

Put your own marks on this player's compass and map screen with
[`Blip`](../../reference/client/classes/Blip.md), work with the map screen, the
player's marker and what they have discovered through
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
round as the player turns. The same blip goes on the map screen, for an icon
the map has art for.

| Option | Default | Meaning |
| --- | --- | --- |
| `position` | required | World position in metres |
| `type` | `"GeneralPoi"` | The game's compass icon: `Checkpoint`, `QuestGiver`, `Shop`, `GeneralPoi` and the rest ([Blip icons](../../resources/blip-icons/)). An unknown name is rejected |
| `state` | `0` | Passed to the compass as-is; 0 is what a fresh mark uses |
| `label` | none | The blip's name on the map screen, shown as written in place of the icon's own name. The compass has no text, so it never shows it |
| `compass` | `true` | Whether it is drawn on the compass |
| `map` | `true` | Whether it is drawn on the map screen. `Main`, `Side`, `Micro`, `Checkpoint`, `Dlcs`, `Bailiff`, `FistFight` and `Racing` have no map art and stay on the compass |
| `legend` | `true` | Whether the map legend's switch for its icon hides it, as it hides the game's own marks; see [Hide a category of marks](#hide-a-category-of-marks) |

Every option is also a property of the handle. Keep it to change the blip
later; a change on the open map is redrawn within a frame:

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

The switch never hides your blips on the compass. On the map screen it hides
them with the game's marks, unless the blip has `legend: false`, so you can
replace the game's marks with your own under the same icon:

```ts
WorldMap.setCategoryVisible("Shop", false); // the game's shops go
Blip.create({ position: new Vector3(-410.0, 805.0, 31.0), type: "Shop", label: "Market", legend: false });
```

## Keep discovery and fog of war

By default every place shows on the map and there is no fog. With
`mod.reveal_map` set to `false` in
[`server.json`](../../hosting-a-server/server-json/), the game's own discovery
runs: a place appears once the player finds it, with the game's toast and XP,
under a fog of war. Every session starts on a fresh map, so a resource that
keeps a character's discoveries stores them on the server and puts them back.

### React to a discovered place

| Event | Fires when |
| --- | --- |
| `poiDiscovered` | A point of interest becomes discovered: silently while `reveal_map` is on, through the game's discovery while it is off, and for each one `WorldMap.discover` marks. Not for a position merely made known |
| `locationDiscovered` | A location, a town or a district, becomes discovered through the game's discovery, so only while `reveal_map` is off. `WorldMap.discover` does not raise it |

Each passes a [`LocationId`](../../reference/client/interfaces/LocationId.md),
the four fields of the game's GUID; turn it into a string to compare or send
it:

```ts
function guid(id: LocationId): string {
    const hex = (value: number, width: number) => value.toString(16).padStart(width, "0");
    const bytes = Array.from(id.data4, (byte) => hex(byte, 2)).join("");
    return `${hex(id.data1, 8)}-${hex(id.data2, 4)}-${hex(id.data3, 4)}-${bytes.slice(0, 4)}-${bytes.slice(4)}`;
}

Events.on("poiDiscovered", (id) => Events.emitServer("my-mode:discovered", guid(id)));
Events.on("locationDiscovered", (id) => Events.emitServer("my-mode:discovered", guid(id)));
```

### Put discoveries back

`WorldMap.discover(id)` marks a point of interest or a location as discovered,
silently: no toast, no XP, no discovery trigger. Send the stored strings once
the level is up, for example in reply to the server's `playerSpawned`, and
turn each back into an id:

```ts
function locationId(text: string): LocationId | null {
    const match = /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/i.exec(text);
    if (!match) return null;
    const tail = match[4] + match[5];
    const data4 = new Uint8Array(8);
    for (let i = 0; i < 8; i += 1) data4[i] = parseInt(tail.slice(i * 2, i * 2 + 2), 16);
    return { data1: parseInt(match[1], 16), data2: parseInt(match[2], 16), data3: parseInt(match[3], 16), data4 };
}

Events.on("my-mode:discoveries", (payload) => {
    if (!Array.isArray(payload)) return;
    for (const text of payload) {
        const id = typeof text === "string" ? locationId(text) : null;
        if (id) WorldMap.discover(id);
    }
});
```

### Clear the fog

```ts
WorldMap.revealFog(new Vector3(-420.5, 812.0, 0)); // around one point, as walking there does
WorldMap.revealAllFog();                             // the whole level
```

| Call | What it does | Returns `false` when |
| --- | --- | --- |
| `discover(id)` | Marks a place discovered. A point of interest raises `poiDiscovered`, a location nothing. Throws for a malformed id (`data4` must be a `Uint8Array` of eight bytes) | The id names no place in the loaded level, or the level is not up |
| `revealFog(position)` | Clears the fog around a point by the game's own reveal radius. Only `x` and `y` count | The level is not up |
| `revealAllFog()` | Clears the whole level's fog, as the game's `player_revealFow` does. Places still become discovered as the player finds them | The level is not up |

- There is fog only while `reveal_map` is off.
- The fog is also what hid the names of places not yet found. After
  `revealAllFog`, the map writes a place's name only once the player knows of
  it.
- A level load brings the fog back, so clear it again after one.

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
- [server.json](../../hosting-a-server/server-json/): `mod.reveal_map` and the other session settings.
- [Positions, rotations and vectors](../../core-concepts/math/): `Vector3` and world coordinates.
