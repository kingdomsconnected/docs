---
title: Furnish a tavern with World Builder
description: Place seats, a bed, a dice table and an alchemy table in World Builder, export them to a server and find them again from a script.
sidebar:
  label: Furnish with World Builder
  order: 99.1
---

You will furnish a tavern corner in World Builder: a dice table, a bench, a
bed and an alchemy table. You export it as a world resource, and the server
builds it for every player. Players sit, sleep, play dice and brew there the
same way they use the level's own furniture. A short script then finds the
pieces by name.

The game calls these interactive pieces **smart objects**. World Builder
lists them in the Library's `interactive` folder.

:::note[Before you start]
- A server and game on Kingdoms Connected 1.7.2 or later, and a server you can restart, with access to its `server.json`.
- The level your server runs. Check `mod.level` in `server.json`: `kutnohorsko` is Kuttenberg, `trosecko` is Trosky and `klaster` is the Monastery. A world resource only loads on the level it was made for.
- [Use TypeScript](../../getting-started/typescript/), for the script in step 7.
- [Create maps with World Builder](../../world/world-builder/), [Smart objects](../../world/smart-objects/) and [World exports in scripts](../../world/world-resources/).

Difficulty: beginner. Time: about 30 minutes.
:::

## What you will learn

- Finding seats, beds, the dice table and crafting stations in the Library.
- Placing, turning and naming them, and taking out the level's own.
- Exporting a world resource and loading it from `server.json`.
- Finding what the export placed with [`WorldResource`](../../world/world-resources/), and placing the same pieces from a script.

```text
server/
  server.json
  worlds/tavern.world.json       exported from World Builder
  resources/tavern-furniture/
    package.json
    tsconfig.json                from Use TypeScript
    src/server/index.ts          lists the furniture by name
```

## 1. Open World Builder

In the main menu, choose **World Builder**, pick the level your server runs,
and click **New project**. The editor opens once the level has loaded.

Press **F7** at any time to walk around as your character, and **F7** again
to return to the editor. Your work stays in the world while you walk.

## 2. Find the furniture

Open the **Library** tab. The `interactive` folder holds every smart object
you can place:

| Folder | What it holds |
| --- | --- |
| `interactive/seats` | Benches, chairs and stools. |
| `interactive/beds` | Beds. |
| `interactive/games` | The dice table. |
| `interactive/stations` | Alchemy tables, the smithy, the drying rack and the smokehouse. |

You can also type `interactive/` into the search box. Search, favorites and
**Recently placed** work for these rows as they do for meshes.

## 3. Place the pieces

1. Click the dice table's row. A see-through copy follows the cursor. It is
   blue over a surface and red in the air.
2. Turn it with **Shift+mouse wheel** or **R**.
3. Left-click to put it down. Another copy stays in your hand, so you can
   place several in a row.
4. Press **Escape** to put the copy away.

Do the same for a bench, a bed and the alchemy table. Each piece stands
assembled, as players will see it.

Smart objects always keep their own size. **Ctrl+mouse wheel**, random size
and the Placement physics setting do nothing for them.

:::tip[Doors work the same way]
The Library's `doors` folder lists every door leaf the levels use. Place one
the same way, then set it up in the **Object** tab: **Locked**, **Can be
picked**, **Lock** (no lock, a bolt on one side, a bolt and a keyhole, or a
keyhole on both sides), **Own difficulty** for lockpicking, and **Key**, the
item class GUID of the key that opens it. A door is only the leaf, with no
frame or wall, so hang it in a doorway or build one around it.
:::

## 4. Move and name them

Click a placed piece to select it. Use the gizmo to move or turn it: **1**
moves and **2** rotates.

Then open the **Object** tab and fill in **Name**: `tavern-dice` for the dice
table, and `tavern-bench`, `tavern-bed` and `tavern-alchemy` for the others.
Names can be up to 64 bytes long. Scripts use the name to find a piece again,
because its ID changes every time the server starts. The Object tab does not
show Scale or Physics for smart objects, because the server decides both.

Every change is one undo step. **Ctrl+Z** undoes it and **Ctrl+Y** redoes it.

## 5. Take out the level's own furniture (optional)

To remove one of the level's own dice tables or crafting stations, click it
and press **Delete**. When the server loads your export, it takes that
station out for every player too. The station and the furniture around it
can be separate objects in the level. If something is left standing, select
it and delete it as well.

To bring it back, open **Level > Deleted**, find it in the list and click
**Restore**.

## 6. Save and export

Press **Ctrl+S**, or use **Save** in the **Project** tab. This writes a
`.project.json` file that you open again to keep editing. The server cannot
load this file; the export makes the one it can.

1. In the **Project** tab, set **Resource name** to `tavern`.
2. Click **Choose export directory...** and pick a folder.
3. Click **Export world resource**. This writes `tavern.world.json`.
4. Copy the file to your server, for example to `worlds/tavern.world.json`.
5. List it in `server.json`, merged into your existing `mod` object. Paths
   are relative to the folder the server runs in.

   ```json title="server.json"
   {
     "mod": {
       "level": "kutnohorsko",
       "world_resources": ["worlds/tavern.world.json"]
     }
   }
   ```

6. Restart the server.

The server checks the file before it finishes starting. A problem stops
startup with an error that names the file and the entry, such as
`Invalid door at doors[0]: ...`.

## 7. Find the furniture from a script

Create `resources/tavern-furniture`, copy the server `tsconfig.json` from
[Use TypeScript](../../getting-started/typescript/#2-the-server-program),
and add this manifest:

```json title="package.json"
{
  "name": "tavern-furniture",
  "version": "1.0.0",
  "scripts": { "build": "tsc -p tsconfig.json" },
  "devDependencies": {
    "@kingdomsconnected/types": "latest",
    "typescript": "^5.9.2"
  },
  "mafiahub": { "serverScripts": ["dist/server/index.js"] }
}
```

A server script reads what the export placed through `WorldResource`. The
export loads after scripts start, so wait for it:

```ts title="src/server/index.ts"
const EXPORT = "tavern";

function listTavern(): void {
  const tavern = WorldResource.find(EXPORT);
  if (!tavern) {
    console.log(`Add ${EXPORT}.world.json to mod.world_resources and restart the server.`);
    return;
  }
  for (const piece of tavern.smartObjects) {
    console.log(`${piece.name}: ${piece.kind}, station ${piece.stationId || "none"}`);
  }

  // A placed dice table joins Dice.tables() under its station ID, like one of the level's own.
  const dice = tavern.smartObjects.find((piece) => piece.name === "tavern-dice");
  const table = dice ? Dice.tables().find((candidate) => candidate.id === dice.stationId) : undefined;
  console.log(table ? `tavern-dice is dice table ${table.id}` : "The export has no tavern-dice.");
}

if (WorldResource.ready) listTavern();
else Events.once("worldResourcesReady", listTavern);
```

- `kind` is `seat`, `bed`, `dice`, `alchemy`, `smithing`, `drying` or
  `smoking`.
- `stationId` is the ID that `Dice.tables()` and `SmartObject.stations()`
  list. Seats and beds have none.
- The `WorldResource.ready` check works both when the server starts and
  when you reload the resource with `ensure`.

## 8. Place a piece from a script (optional)

`SmartObject.spawn` places the same pieces at runtime. It takes a blueprint
name such as `Table/table_dice`, and `SmartObject.blueprints()` lists them
all:

```ts
const dice = SmartObject.spawn({
  blueprint: "Table/table_dice",
  position: [3102.0, 820.5, 57.3],
  name: "tavern-dice",
});
console.log(`${dice.blueprint} placed, station ${dice.stationId}`);
```

A piece a script places belongs to that resource, and disappears when the
resource stops. A world resource rebuilds its pieces on every server start.

:::caution[What smart objects cannot do]
- There are 21 blueprints, compiled into the game and the server. You cannot
  add your own.
- Smart objects have no scale.
- Once the server has placed a piece, it cannot move. To move one placed by
  a script, destroy it and place it again.
- NPCs do not sit on, sleep in or work at placed smart objects.
- The smithy blueprints build the forge and its workplace, without the shop
  and chest the game's smithies have.
- Grindstones and cooking fires cannot be placed or removed.
- A world resource always places its pieces in the global world, which every
  player sees.
- Nothing a script places is saved. Use a world resource, or place the
  pieces again when the server starts.
:::

## Try it

1. Join the server and walk to the tavern corner.
2. Use the game's own prompt to sit on the bench or sleep in the bed. Other
   players see you sitting and lying down.
3. Look at the dice table. In the default gamemode, the **Play dice (join
   lobby)** prompt appears within about two seconds of the server starting.
   On another gamemode, dice depends on that gamemode's rules.
4. Use the alchemy table as you would one of the level's own. The server
   checks every step, as it does at the level's tables.
5. Run `npm install` and `npm run build` in `tavern-furniture`, then
   `ensure tavern-furniture` in the server console. It lists the four pieces
   by name, and the dice table's station ID.

If nothing appears in the game, check that the path in `world_resources` is
right, that `mod.level` matches the level you built on, and that you
restarted the server after copying the file. If the server stops at startup,
read the error: it names the file and the entry that is wrong. If there is
no dice prompt, remember that the default gamemode checks for new tables
every two seconds and offers a table only to players in the same world as
the table.

## Next steps

- Lay food and arrows on the ground in the same project with
  [Place items in the world](../place-items/).
- Put a stump where a tree stood with
  [Swap a level object for another mesh](../swap-level-objects/).
- Every field, the `SmartObject` and `Door` APIs, stations and virtual
  worlds are in [Smart objects](../../world/smart-objects/). The
  [World Builder MCP](../../world/world-builder-mcp/) places the same objects
  from an MCP client.
- Keep what players brew and learn at your table with
  [Brew potions at alchemy tables](../../players/alchemy/).
