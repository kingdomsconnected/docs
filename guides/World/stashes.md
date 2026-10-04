---
title: Stashes (containers)
description: Spawn containers, use the level's own chests or open storage with no chest at all, fill and read them from the server, lock them, decide who may open them, and keep their contents across restarts.
sidebar:
  label: Stashes
  order: 42
---

A [`Stash`](../../reference/server/classes/Stash.md) is a container players
open with the game's own transfer screen: a chest a script spawned, one of
the chests, barrels and wardrobes the level already places, or a virtual stash
with no chest that a script opens for a player. The server holds
what each one contains, so a script can fill it, read it and save it, and what
one player leaves is there for the next.

```ts
const at = player.position;
const chest = Stash.spawn(new Vector3(at.x, at.y + 2, at.z));
chest.addItem({ item: "apple", amount: 5 });
chest.addItem({ item: "arrow_crude", amount: 20 });
```

## Spawn a stash

Every argument is optional:

```ts
const chest = Stash.spawn(
  new Vector3(1024, 512, 40), // position
  new Vector3(0, 0, 180),     // rotation: Euler degrees, or a Quaternion
  player.virtualWorld,        // virtual world
);
```

A spawned stash starts empty. `stashSpawn` fires for it, and for every level
container the first time something reaches it in a new virtual world.

## Open a stash without a chest

`Stash.createVirtual(virtualWorld?)` makes empty stock that no client sees in
the world: a bank, a personal locker, a backpack. `open(player)` shows it to
that player on the same transfer screen, from wherever they stand.

```ts
const locker = Stash.createVirtual(player.virtualWorld);
locker.addItem({ item: "bread", amount: 5 });

if (!locker.open(player)) console.log("the locker could not open");
```

Keep the handle and call `open` again to show the same contents. `open` puts
the request to `stashInteract` as `"open"`, and returns `false` for a
physical stash, a locked or busy one, a player in another world or whose
inventory is not ready yet, or a handler's refusal. `true` means the screen
was requested; the player's client lets go if it cannot show it.

A virtual stash has no position that matters and no `guid`, `levelGuid` or
`name`; `isVirtual` is true, and `stashId` is its server-minted number.
Walking away does not close it, but changing world does. To follow a player
between worlds, move it first with `locker.setVirtualWorld(player.virtualWorld)`.
It keeps its contents until `destroy()` or a restart, so destroy a player's
locker when they leave if nothing else will open it.

## Use the level's containers

The level's own containers exist from the moment the server starts, in the
global world, and start **empty**: the server never rolls the game's loot.

```ts
Stash.nearest(player.position);                         // the closest within 5 m, or null
Stash.nearest(player.position, 20, player.virtualWorld); // within 20 m, in the player's world
Stash.find("00a1b2c3d4e5f607");                         // by GUID, the same on every machine and after a restart
Stash.all();                                            // every container the server has, virtual ones included
```

`levelGuid` is the identity to store a level container under; it is empty for
one a script spawned. `guid` works for both, and `Stash.find` takes either.
`nearest` and `find` see only physical containers, and look in the global
world unless given another. `useDirection` is the way a player has to face a
container to be offered it: stand at `position - useDirection * distance`.

## Fill and read a stash

The calls take the same requests as [player inventories](../../players/inventory/):

```ts
const chest = Stash.spawn(player.position);
chest.addItem({ item: "longswordBroad", amount: 1, metadata: { quality: 3 } });
chest.setInventory({ items: [{ item: "apple", amount: 5 }] }); // replaces everything; at most 128 rows
chest.setInventory({ items: [] });                             // empties it

const contents = chest.getInventory(); // { revision, items } or null once it is gone
const first = contents?.items[0];
if (first) chest.removeItem({ units: [{ id: first.id, amount: 1 }] });
```

Each returns an `InventoryResult`: `ok`, a `code` when refused, and the rows
changed. `itemCount` is how many rows it holds. Some level containers are
linked to another one and open its contents; they read and change their
master's.

## Decide who may open it

`stashInteract` asks before anything happens. Return `false` and the prompt
does nothing:

```ts
const vault = Stash.spawn(new Vector3(1024, 512, 40));

Events.on("stashInteract", (player, stash, action) => {
  // action: "open", "unlock" (a key turned) or "lockpick" (the minigame starting)
  if (stash.id === vault.id && action === "lockpick") return false; // no picking the vault
});
```

The server has already refused what the game's own rules forbid: a player out
of reach, a container someone else has open, or opening a locked one. A
virtual stash's `open(player)` skips only the reach check. One
player at a time has a container open; `isOpen` and `holderId` say who, and
every other player's open is refused until they close it.

## Lock a stash

```ts
const chest = Stash.nearest(player.position);
if (chest) {
  chest.locked = true;        // only its key or a lockpick opens it
  chest.lockpickable = false; // and now only its key
  chest.keyItem = "e35c2069-11ca-462b-82bf-eef746746efe"; // "" restores the level's key
}
```

`keyItem` takes the key's item class GUID, from
[Item classes](../../resources/items/); a name or an unknown GUID is ignored
and logged. A container a script locks reads `lockedByServer`, and the game's
generated home and shop keys do not open it. Unlocking it by any route clears both.
`startsLocked` says whether the level builds it locked.

## React to use

| Event | Arguments | When |
| --- | --- | --- |
| `stashSpawn` | `stash` | A container now exists. Restore saved contents here. |
| `stashInteract` | `player`, `stash`, `action` | A player pressed its prompt. Return `false` to refuse. |
| `stashOpen` | `stash`, `player` | A player opened it. For a virtual stash, the server granted `open(player)`. |
| `stashClose` | `stash`, `player`, `reason` | `closed`, `lostAccess` (walked off, died, changed world), `timeout`, `disconnected` or `destroyed`. |
| `stashInventoryChanged` | `stash`, `player`, `change` | Its contents changed. `player` is `null` for a script's change. |
| `stashDestroy` | `stash` | It is about to go, after its close and its contents' removal. |

When a player moves items, `change.reason` is `deposit` or `withdraw`, and
their own inventory raises `playerInventoryChanged` too.

## Keep contents across restarts

The server keeps nothing through a restart. Save from `stashInventoryChanged`
and restore when the container exists:

```ts
const saved = new Map<string, InventoryRow[]>(); // swap for your own storage
const keyOf = (stash: Stash) => `${stash.guid}:${stash.virtualWorld}`;

const restore = (stash: Stash) => {
  const items = saved.get(keyOf(stash));
  if (items) stash.setInventory({ items });
};

const physical = (stash: Stash) => !stash.isVirtual; // virtual stock has no guid

Events.on("stashSpawn", (stash) => { if (physical(stash)) restore(stash); });         // spawned, or built in another world
Events.on("resourceStart", () => Stash.all().filter(physical).forEach(restore));     // the level's, built before you ran
Events.on("stashInventoryChanged", (stash) => {
  if (physical(stash)) saved.set(keyOf(stash), stash.getInventory()?.items ?? []);
});
```

A spawned container gets a new `guid` every time, so this brings back the
level's containers after a restart, and a spawned one only while it exists. Save
a virtual stash under a key of your own, such as its owner's account, and
`setInventory` the rows into a fresh `Stash.createVirtual` after the restart.

## Remove stashes

```ts
const box = Stash.spawn(player.position);

Stash.getById(box.id);     // one, or null
box.destroy();             // this one, and everything in it
Stash.destroyAll(3);       // every spawned and virtual stash in virtual world 3; returns the count
Stash.destroyAll();        // every spawned and virtual stash on the server
```

The level's own containers cannot be destroyed; empty one with
`setInventory({ items: [] })`.

:::danger[Destroying a stash destroys its contents]
Nothing drops to the ground and nothing goes back to whoever put it there.
Move what matters out first.
:::

A stopped resource does not remove its stashes, so track yours and decide
what `resourceStop` does with them (see the pattern on
[Props](../props/#clean-up-when-your-resource-stops)).

:::tip[Try it]
The default gamemode's `/stash` puts an empty container ahead of you
(`src/server/commands/stash.ts`). `/stash virtual` opens a virtual stash of
your own, kept until you disconnect. `/stash near` reads the level container
you are at, `/stash lock` and `/stash key` lock it, `/stash goto` stands you
at one, and `/stash clear` removes every spawned and virtual stash in your
world, contents included.
:::

## Related

- [Inventories](../../players/inventory/): the request shapes, and `player.dropInventory` for a death drop
- [Items: give, take and drop](../../players/items/): ground items, for loot lying in the open
- [Carry things](../../players/carrying/): ground items players take up in their arms instead
- [Props](../props/): the tracking pattern for cleanup
- [Virtual worlds](../../core-concepts/virtual-worlds/): separate contents per world
- [Stash reference](../../reference/server/classes/Stash.md)
