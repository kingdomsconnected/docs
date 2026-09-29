---
title: Dog companions
description: Give a player a dog companion, set its mode, read what it is doing, and hand it to someone else.
sidebar:
  label: Dogs
  order: 54
---

A dog belongs to a player from the moment it exists, like Mutt in the
singleplayer game. Its owner's client runs it and everyone else watches what
that client reports.

```ts
if (!player.dog) {
  const dog = Dog.spawn(player, undefined, undefined, undefined, "Mutt");
  console.log(`Spawned ${dog.toString()}`);
}
```

## Spawn a dog

[`Dog.spawn`](../../reference/server/classes/Dog.md#spawn) takes the owner, then
optional arguments like a horse's:

```ts
Dog.spawn(
  player,       // the owner; required
  undefined,    // position; omitted puts the dog on its owner
  undefined,    // rotation: a Quaternion, or Euler angles in degrees
  undefined,    // soul GUID; omitted spawns the generic dog
  "Mutt",       // the name every client shows
);
```

[Dog souls](../../resources/souls/#dog-souls) lists every soul GUID the game has for a dog.

A player has one dog, as in the game. `player.dog` is their dog or `null`, so
check it first; the default gamemode's `/dog` command
(`src/server/commands/dog.ts`) refuses a second one. The owner can whistle,
pet and send the dog with the game's own controls; other players cannot.

## Set its mode

`dog.mode` is the companion mode in the game's own order. Assigning it applies
it on every client. These eight are the whole list, and what each does is the
game's own behaviour.

| Value | Mode | Value | Mode |
| --- | --- | --- | --- |
| 0 | Wait | 4 | Search |
| 1 | Follow | 5 | Hunt |
| 2 | Free | 6 | Guard |
| 3 | Aggressive | 7 | Ambush |

```ts
const MODES = ["wait", "follow", "free", "aggressive", "search", "hunt", "guard", "ambush"];

function setMode(dog: Dog, name: string): boolean {
  const mode = MODES.indexOf(name);
  if (mode < 0) return false;
  dog.mode = mode;
  return true;
}
```

## Read a dog

```ts
dog.soul;       // the GUID it was spawned against
dog.name;       // "" means the name its soul carries stands
dog.objective;  // what the owner's game has it doing right now
dog.morale;     // 0 before the first report
```

`objective` and `morale` are reported by the owner's client, so they are
read-only. Common `objective` values:

| Value | Doing | Value | Doing |
| --- | --- | --- | --- |
| 0 | Waiting | 9 | Fetching |
| 2 | Barking | 10 | Hunting |
| 4 | Following | 19 | Eating |
| 5 | At heel | 21 | Distracting |
| 7 | Searching | 22 | Being petted |
| 8 | Fighting | 25 | Idle |

The default gamemode's `dog.ts` has a fuller table.

:::note
Below the game's morale threshold a dog stops obeying commands, including the
owner's whistle. Watch `dog.morale` to see it coming.
:::

## Rename a dog

```ts
dog.name = "Pes";
dog.name = ""; // back to its soul's own name
```

## Owner

```ts
dog.owner;          // the Player it belongs to, or null
dog.ownerId;        // that player's id, or 0
dog.giveTo(target); // target now owns it
dog.giveTo(null);   // nobody does
```

On `giveTo`, every client re-attaches the dog to its new master and authority
over its body moves to the new owner's client.

## Dog events

| Event | Arguments | When |
| --- | --- | --- |
| `dogSpawn` | `dog` | Right after a dog is created. |
| `dogDestroy` | `dog` | While it is being removed. The owner and name still read. |
| `dogOwnerChanged` | `dog`, `player` | After `giveTo`. `player` is `null` for no owner. |
| `dogModeChanged` | `dog`, `mode` | After the mode actually changes. Setting the same mode raises nothing. |

## Clean up

`dog.destroy()` removes it everywhere after raising `dogDestroy`. `Dog.all()`
and `Dog.getById(id)` find dogs again.

When a player disconnects, the server destroys their dog and `dogDestroy`
fires. A masterless dog (after `giveTo(null)`) stays until you remove it, so
track those yourself.

```ts
Events.on("dogDestroy", (dog) => {
  console.log(`${dog.name || dog.id} is gone (owner ${dog.ownerId})`);
});
```

## Related

- [Spawn and manage horses](../horses/): the other animal, with the same shape of API.
- [Server vs client authority](../../core-concepts/authority/): why the owner's client runs the dog.
- [Events and handlers](../../core-concepts/events/): every server event in one list.
