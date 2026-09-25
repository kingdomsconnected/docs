---
title: Dog companions
description: Give a player a dog companion, set its mode, hand it to someone else, and read what it is doing.
sidebar:
  order: 51
---

A dog is a companion that belongs to a player, the way Mutt does in the
singleplayer game. Unlike a horse, a dog is somebody's from the moment it
exists: its owner's client runs it, and everyone else watches what that client
reports. You spawn one for a player, set its mode, and can hand it over to
someone else.

```ts
if (!player.dog) {
  const dog = Dog.spawn(player, undefined, undefined, undefined, "Mutt");
  console.log(`Spawned ${dog.toString()}`);
}
```

## Spawning

[`Dog.spawn`](../../../reference/server/classes/Dog.md#spawn) takes the owner
first, then the same optional arguments as a horse:

```ts
Dog.spawn(
  player,       // the owner; required
  undefined,    // position; omitted puts the dog on its owner
  undefined,    // rotation: a Quaternion, or Euler angles in degrees
  undefined,    // soul GUID; omitted spawns the generic dog
  "Mutt",       // the name every client shows
);
```

One dog per player, as in the game. `player.dog` is the dog a player has, or
`null`, so check it before you spawn another one. The default gamemode's `/dog`
command (`src/server/commands/dog.ts`) does exactly that and refuses a second
dog.

The owner's own game treats the dog as theirs: they can whistle for it, pet it
and send it at things with the game's own controls. Other players cannot.

## Modes

`dog.mode` is the companion mode, a number in the game's own order. Assigning
it applies it on every client.

| Value | Mode |
| --- | --- |
| 0 | Wait |
| 1 | Follow |
| 2 | Free |
| 3 | Aggressive |
| 4 | Search |
| 5 | Hunt |
| 6 | Guard |
| 7 | Ambush |

```ts
const MODES = ["wait", "follow", "free", "aggressive", "search", "hunt", "guard", "ambush"];

function setMode(dog: Dog, name: string): boolean {
  const mode = MODES.indexOf(name);
  if (mode < 0) return false;
  dog.mode = mode;
  return true;
}
```

The game has no other modes, so these eight are the whole list. What each mode
makes the dog do is the game's own behaviour; the server only picks one.

`dogModeChanged` fires after the mode actually changes, with the new value.
Setting the mode a dog already has changes nothing and raises nothing.

## Reading what it is doing

```ts
dog.owner;      // the Player it belongs to, or null
dog.ownerId;    // that player's id, or 0
dog.soul;       // the GUID it was spawned against
dog.name;       // "" means the name its soul carries stands
dog.objective;  // what the owner's game has it doing right now
dog.morale;     // 0 before the first report
```

`objective` and `morale` are reported by the owner's client, so they are
read-only. `objective` is the game's own objective number. The common ones:

| Value | Doing |
| --- | --- |
| 0 | Waiting |
| 2 | Barking |
| 4 | Following |
| 5 | At heel |
| 7 | Searching |
| 8 | Fighting |
| 9 | Fetching |
| 10 | Hunting |
| 19 | Eating |
| 21 | Distracting |
| 22 | Being petted |
| 25 | Idle |

The default gamemode's `dog.ts` has a fuller table if you want to show players
a word for every value.

:::note
Below the game's own morale threshold a dog stops obeying commands, the same
as in singleplayer. That includes the owner's whistle. `dog.morale` is how you
see it coming.
:::

## Renaming

```ts
dog.name = "Pes";
dog.name = ""; // back to its soul's own name
```

## Changing owners

```ts
dog.giveTo(target); // target now owns it
dog.giveTo(null);   // nobody does
```

Every client re-attaches the dog to its new master, and authority over its
body moves to the new owner's client. `dogOwnerChanged` fires afterwards with
the new owner, or `null` when you left it masterless.

## Events

| Event | Arguments | When |
| --- | --- | --- |
| `dogSpawn` | `dog` | Right after a dog is created. |
| `dogDestroy` | `dog` | While it is being removed. The owner and name still read. |
| `dogOwnerChanged` | `dog`, `player` | After `giveTo`. `player` is `null` for no owner. |
| `dogModeChanged` | `dog`, `mode` | After the mode actually changes. |

## Cleaning up

`dog.destroy()` removes it everywhere after raising `dogDestroy`.
`Dog.all()` and `Dog.getById(id)` find dogs again, as with horses.

A dog leaves with its owner: when a player disconnects, the server destroys
the dog they had, and `dogDestroy` fires for it. A dog left masterless with
`giveTo(null)` stays until you remove it, so keep track of those yourself.

```ts
Events.on("dogDestroy", (dog) => {
  console.log(`${dog.name || dog.id} is gone (owner ${dog.ownerId})`);
});
```

## Related

- [Horses](../horses/)
- [Server vs client authority](../../../core-concepts/authority/)
