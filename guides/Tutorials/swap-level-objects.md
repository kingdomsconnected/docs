---
title: Swap a level object for another mesh
description: Put a stump where a tree stood, in World Builder and from a script that traces what a player is looking at and swaps it with a level edit.
sidebar:
  label: Swap level objects
  order: 99.3
---

You can put a different mesh where something the level placed stands: a
stump where a tree was, a ruin where a house stood, a broken barrel instead
of a whole one. The original goes out of the world together with its
collision, and the new mesh stands in its place as solid scenery. Every
player sees the change, including players who join later.

You will make a swap in World Builder, which saves it into a world resource,
and then build `/swap` and `/unswap`, which do the same from a script while
the server runs.

:::note[Before you start]
- A server and game on Kingdoms Connected 1.7.2 or later.
- [Use TypeScript](../../getting-started/typescript/), and the export steps of [Furnish a tavern with World Builder](../furnish-with-world-builder/#6-save-and-export).
- [Remove or move the level's own objects](../../world/level-edits/) and [Raycasts](../../world/raycasts/).
- A replacement mesh from World Builder's asset library, which is the game's prop catalog. A script can also use a mesh your server streams.

Difficulty: intermediate. Time: about 30 minutes.
:::

## What you will learn

- Swapping a level object in World Builder, and when to convert it to a prop
  instead.
- Asking a player's game what they are looking at with `World.raycast`.
- Turning the hit's `levelObject` into a swap with `LevelEdit.apply`, and
  giving the object back with `restore`.
- Taking an object out or moving it with the same definition.

```text
swap-objects/
  package.json
  tsconfig.json          from Use TypeScript
  src/server/look.ts     what the player is looking at
  src/server/index.ts    /swap and /unswap
```

## 1. Swap an object in World Builder

1. Open World Builder and your project.
2. Click the object to replace, such as a tree, a wall or a rock.
3. In the **Object** tab, type in the **Swap for a mesh** box. It searches
   the asset library.
4. Click a result. The object disappears with its collision, and the mesh
   you chose stands in its place with the same position, rotation and
   scale.

The swap follows the object if you move it later. To undo it, press
**Ctrl+Z**, or click **Take the swap back** in the Object tab.

**Level > Deleted** lists swapped objects as **Swapped**. Click **Unswap**
on a row to give the original back.

:::tip[Swap or convert?]
The Object tab has two ways to put something else where a level object
stands:

- **Swap for a mesh** keeps the level's object as the reference, so the
  swap stays tied to that exact object. Use it to replace one thing with
  another.
- **Convert to a prop** takes the object out and puts an editable prop of
  the *same* mesh in its place. Use it when you want to move, resize or
  change the physics of the level's own object.
:::

## 2. Export the swap

Save the project, export the world resource and add it to `server.json` as
in [the furnishing tutorial](../furnish-with-world-builder/#6-save-and-export).
The export keeps each swap in its `world` list as an entry with a `model`,
and the server makes the swap for every player when it starts.

## 3. Create the resource

Create `resources/swap-objects` and copy the server `tsconfig.json` from
[Use TypeScript](../../getting-started/typescript/#2-the-server-program).

```json title="package.json"
{
  "name": "swap-objects",
  "version": "1.0.0",
  "scripts": { "build": "tsc -p tsconfig.json" },
  "devDependencies": {
    "@kingdomsconnected/types": "latest",
    "typescript": "^5.9.2"
  },
  "mafiahub": { "serverScripts": ["dist/server/index.js"] }
}
```

## 4. Find what the player is looking at

A script needs to know which object to replace. Trace a ray from the
player's eyes: the hit's `levelObject` describes the object in the form
`LevelEdit.apply` takes.

```ts title="src/server/look.ts"
/** The level object the player is looking at, or why there is none. */
export async function lookedAt(player: Player): Promise<WorldLevelObject | string> {
  const look = player.lookDirection;
  if (look.x === 0 && look.y === 0 && look.z === 0) {
    return "Your game has not reported where you are looking yet.";
  }

  // Start the ray a little in front of the eyes, so it does not meet the player's own body.
  const p = player.position;
  const eye = new Vector3(p.x, p.y, p.z + 1.6);
  const from = new Vector3(eye.x + look.x * 0.75, eye.y + look.y * 0.75, eye.z + look.z * 0.75);
  const to = new Vector3(eye.x + look.x * 30, eye.y + look.y * 30, eye.z + look.z * 30);

  const result = await World.raycast(player, from, to, { mode: "anything" });
  if (!result.answered) return `The trace did not run: ${result.reason}`;
  return result.hit?.levelObject ?? "Look at a tree, a rock, a wall or something else the level placed.";
}
```

- `World.raycast(player, from, to, options)` asks that player's game to
  trace the ray, because the server has no copy of the world. Pick a player
  near the object. The answer arrives a moment later, so the call returns a
  promise. `answered` is `false` if the player's game could not run it.
- `hit.levelObject` is `null` for the ground, for objects the server or a
  script spawned (props, players, NPCs), and for scenery the game keeps no
  record of. For a tree or a rock it holds the mesh path in `name` and the
  spot the level placed it in `at`. For a door or another level entity, it
  holds the level's `guid`.

## 5. Swap it and give it back

Spread the level object into a definition and add `model`. `/swap` replaces
whatever the player is looking at with a stump, or with the mesh path typed
after it. `/unswap` gives back the last object swapped.

```ts title="src/server/index.ts"
import { lookedAt } from "./look.js";

const DEFAULT_MESH = "objects/natural/vegetation/trees/stumps/tree_stump_a.cgf";
const swaps: LevelEdit[] = [];

async function swap(player: Player, model: string): Promise<void> {
  const object = await lookedAt(player);
  if (typeof object === "string") {
    Chat.sendToPlayer(player, object);
    return;
  }
  try {
    swaps.push(LevelEdit.apply({ ...object, model }, player.virtualWorld));
    Chat.sendToPlayer(player, `Swapped ${object.name} for ${model}`);
  } catch (error) {
    Chat.sendToPlayer(player, `Could not swap it: ${error instanceof Error ? error.message : String(error)}`);
  }
}

Events.on("playerCommand", (player, command, args) => {
  if (command === "swap") {
    swap(player, args[0] || DEFAULT_MESH).catch((error) => console.log(`/swap failed: ${String(error)}`));
  } else if (command === "unswap") {
    const edit = swaps.pop();
    if (edit) edit.restore();
    else Chat.sendToPlayer(player, "Nothing to give back.");
  }
});
```

- `LevelEdit.apply(definition, virtualWorld)` makes the change and returns a
  `LevelEdit`. Leave out `virtualWorld` to change the global world, which
  every player sees. It throws if no player's game could find the object,
  or if it could not load the `model`.
- `edit.restore()` gives the object back exactly as the level had it.
  Setting `edit.model = ""` also removes the swap.
- Applying the same edit twice does not make two of them. The second one
  restates the first.
- An edit belongs to the resource that made it. When that resource stops,
  its edits are undone.

## 6. Take an object out or move it (optional)

The same definition can take an object out or move it instead of swapping
it:

```ts
function takeOut(object: WorldLevelObject): LevelEdit {
  return LevelEdit.apply({ ...object, hidden: true }); // take it out, collision included
}

function standElsewhere(object: WorldLevelObject): LevelEdit {
  return LevelEdit.apply({ ...object, position: [3104.5, 820.0, 57.3] }); // stand it somewhere else
}
```

A resource can also stream its own meshes to players. Put the file at
`stream/objects/kcdc/<resource>/ruin.cgf` inside the resource, then use
`objects/kcdc/<resource>/ruin.cgf` as the `model`, for example
`/swap objects/kcdc/swap-objects/ruin.cgf`. See
[Custom assets](../../core-concepts/custom-assets/) for the file rules.

A script's edits are kept in memory only. To keep them, save
`edit.toJSON()` with the edit's `virtualWorld`, and call
`LevelEdit.apply(saved, virtualWorld)` again when the server starts. A
World Builder export does this for you.

:::caution[What a swap cannot do]
- The replacement stands as static scenery. It does not fall or move. To
  make something fall, use a rigid prop; see
  [Push props with the physics API](../push-props/).
- Swapping a level door out counts as removing the door.
- Grass and small plants are part of the ground and cannot be swapped.
- From far away, the game can still draw its simplified distant version of
  the original object. Up close, the swap shows.
:::

## Try it

1. Run `npm install` and `npm run build`, then `ensure swap-objects` in the
   server console.
2. Walk up to a tree, look at it and type `/swap`. The tree becomes a stump
   for every player in your world.
3. Type `/unswap`. The tree is back.
4. Look at a rock and type `/swap` followed by a mesh path from World
   Builder's asset library.
5. Swap something, then run `ensure swap-objects` again. The resource's
   edits go with it, and the original stands again.

## Next steps

- Count axe blows on a tree with `playerWeaponHit` and let a rigid copy
  fall: see [Push props with the physics API](../push-props/).
- Every field of a hit and of `levelObject` is in
  [Raycasts](../../world/raycasts/).
- Change an edit after making it, or keep it to one virtual world, with
  [Remove or move the level's own objects](../../world/level-edits/).
- The editor side of swaps is in
  [Organize a World Builder project](../../world/world-builder-editing/#swap-a-level-object-for-a-mesh).
