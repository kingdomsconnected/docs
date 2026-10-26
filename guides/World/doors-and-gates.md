---
title: Lock doors, open gates
description: Lock, open and remove the level's own doors, open and close its castle gates, and store them by GUID.
sidebar:
  label: Doors and gates
  order: 43
---

The level places every house door in Bohemia and the castles' drawbridges,
portcullises and gates. The server can lock a door, open it, take it out of
the world or drive a gate, and the state holds for every player. To add a door
where the level has none, see [Hang new doors](../hang-doors/).

```ts
// Lock whatever door the player is standing at.
async function lockDoorAt(player: Player): Promise<boolean> {
  const answer = await Door.queryNearest(player);
  if (!answer.found || !answer.door) return false;
  answer.door.locked = true;
  return true;
}
```

:::note[Why doors need a client]
Every door the level places exists on the server from the moment it starts,
and [`Door.all()`](../../reference/server/classes/Door.md#all) lists them.
The server has no world to measure distances in, though, so it cannot tell
which door a player stands at.
[`Door.queryNearest(player)`](../../reference/server/classes/Door.md#querynearest)
asks that player's client, which is a round trip and returns a promise. See
[Server vs client authority](../../core-concepts/authority/).
:::

## Find the door a player is at

`Door.queryNearest(player)` always settles and never rejects. It resolves with
`found: false` and a `reason` when no door is in sight, the client is in
another level, it did not answer within five seconds, or the player left.

```ts
async function describeDoor(player: Player): Promise<void> {
  const answer = await Door.queryNearest(player);
  if (!answer.found || !answer.door) {
    Chat.sendToPlayer(player, `No door: ${answer.reason}`);
    return;
  }
  const label = answer.name || "unnamed";
  Chat.sendToPlayer(player, `${label} (${answer.guid}), ${answer.distance?.toFixed(1)} m, locked: ${answer.locked}`);
}
```

`guid`, `name`, `distance`, `open` and `locked` are only present when `found`
is true. `open` and `locked` are what that client sees now, which can be
fresher than the server's copy. There is no `Door.nearest`: only the client
standing there can say which of thousands of doors it is.

## Lock and unlock a door

A [`Door`](../../reference/server/classes/Door.md) handle has:

| Property | What it is |
| --- | --- |
| `guid` | The EntityGuid, sixteen lowercase hex digits, the same on every machine. A level door's never changes; a hung door's lasts until the server stops. |
| `locked` | Writable. Reaches every client that has the door, including one standing at it. |
| `open` | Read-only. `door.setOpen(open, fromFront?)` opens or closes it on every client, playing the game's own swing, and returns `false` when it is already that way. Opening a locked door unlocks it. |
| `stateToken` | Bumped on every durable change, to tell one change from the next. |
| `spawned` | `true` for a door a script or a World Builder export hung, `false` for a level door. |
| `model` | The leaf mesh, `objects/characters/assets/doors/...cdf`. |

## Save doors by GUID

Store `guid`, not `id`: the id is a replication handle, the GUID is the level's
identity. `Door.find(guid, world?)` takes one back, with or without an `0x`
prefix.

A level door's GUID never changes, and every level door exists from the
moment the server starts, so saved locks can be put back as soon as your
resource starts:

```ts
const saved = ["00a1b2c3d4e5f607"]; // loaded from your own storage

for (const guid of saved) {
  const door = Door.find(guid);
  if (door) door.locked = true;
}
```

`Door.find` returns `null` for a GUID the level does not place, or for a door
taken out of that world. `Door.find` and `Gate.find` search the global virtual
world unless you pass another. Each virtual world has its own copy of a level
door's state, built the first time anything there reaches it. A hung door's
GUID changes every run; save its `toJSON()` instead (see
[Hang new doors](../hang-doors/)).

## Take a level door out

[`Door.remove(guid, virtualWorld?)`](../../reference/server/classes/Door.md#remove)
takes one of the level's doors out of a virtual world, collision included.
Without a world it is taken out of the global one, and so out of every world.
`door.destroy()` on a level door does the same in that handle's world; on a
hung door it takes the door down for good.

```ts
// Take the door a player stands at out of every world.
async function removeDoorAt(player: Player): Promise<void> {
  const answer = await Door.queryNearest(player);
  if (answer.found && answer.door && !answer.door.spawned) Door.remove(answer.door.guid);
}
```

While a door is out of a world, players there and players in the global
world stop seeing it, `Door.all()` and `Door.find` leave it out, the server
refuses anyone working it, `Door.queryNearest` does not find it, and
server-spawned NPCs and navigation queries in that world treat the doorway as
open.

A removal is a [level edit](../level-edits/): it shows in `LevelEdit.all()`,
`LevelEdit.restoreAll()` puts the door back, and a level edit that swaps the
door for another mesh counts as removing it. Removing a door already out does
nothing; removing one that has a move or a swap in that world replaces that
edit. Like every level edit it is kept in memory only, and undone when the
resource that made it stops.

[`Door.removed(virtualWorld?)`](../../reference/server/classes/Door.md#removed)
lists the level doors that are out, whether a script or a World Builder
export took them out: every world when omitted, or only removals made in that
world. Each row has `guid`, `name`, `position` and `virtualWorld`.
`Door.restore(guid, virtualWorld?)` puts one back, closed and locked as the
level builds it, and returns its handle, or `null` when that world has no
such removal. A door taken out of the global world is put back only from
there.

```ts
for (const row of Door.removed()) Door.restore(row.guid, row.virtualWorld);
```

## Open and close a gate

A gate's [`kind`](../../reference/server/classes/Gate.md#kind) is
`drawbridge` or `portcullis`, which animate, or `gate`, a pair of leaves that
opens and closes at once (the Ratborsch and Nebakov fortress gates and the
Ruthard palace gate). Every gate exists from the moment the server starts, and
its position comes from the level's data, so
[`Gate.nearest`](../../reference/server/classes/Gate.md#nearest) answers on the
server with no round trip. Use a radius of tens of metres.

```ts
const gate = Gate.nearest(player.position, 60, player.virtualWorld);
if (gate) {
  const result = gate.toggle();
  Chat.sendToPlayer(player, result.accepted
    ? `The ${gate.kind} is ${result.opening ? "opening" : "closing"} (${result.seconds.toFixed(1)} s).`
    : `The ${gate.kind} ${result.reason}.`);
}
```

`toggle(true)` opens, `toggle(false)` closes, and no argument heads away from
the current end, reversing a moving gate. Every client plays the motion from
the server clock, so late arrivals see the right point. "Open" always means
passable: portcullis raised, drawbridge lowered. `Gate.find(guid, world?)`
works like `Door.find`.

| Property | What it is |
| --- | --- |
| `cycle` | `closed`, `opening`, `open` or `closing`. (Not `state`, which is the entity's state bag.) |
| `openness` | `0` shut to `1` fully open, moving during a cycle. |
| `moving` | Whether a cycle is running. |
| `openDuration`, `closeDuration` | Clip lengths in seconds. `0` means no clip that way, and always for a `gate`. |

## When a call fails

| Call | Fails when | Result |
| --- | --- | --- |
| `Door.queryNearest` | No door in sight, other level, 5 s timeout, player left. | Resolves `found: false` with a `reason`. Never rejects. |
| `Door.find`, `Gate.find`, `Gate.nearest`, `getById` | No such door or gate there, or the door is taken out of that world. | `null`. |
| `door.setOpen` | Already that way. | Returns `false`. |
| `Door.remove` | The GUID is not one of the level's doors, or names a hung door. | **Throws.** Take a hung door down with `destroy()`. |
| `Door.restore` | That world has no such removal. | `null`. |
| `gate.toggle()` | Already at that end, or no clip that way. | A [`GateToggle`](../../reference/server/interfaces/GateToggle.md) with `accepted: false`, a `reason` that reads after the gate's name (`is already open`) and `seconds: 0`. Never throws. |

Locking and opening level doors spawns nothing, so nothing needs cleanup. A
lock stays until you change it or the server restarts.

:::tip[Try it]
The default gamemode's `/door` (`src/server/commands/door.ts`) prints the door
you stand at; `/door lock`, `/door unlock`, `/door open` and `/door close`,
each with an optional GUID, change one.
`/gate` (`src/server/commands/gate.ts`) toggles the nearest gate within 60 m,
and `/gate list` prints the known ones.
:::

## Related

- [Hang new doors](../hang-doors/), doors where the level has none
- [Remove or move the level's own objects](../level-edits/), the edits behind a removed door
- [Server vs client authority](../../core-concepts/authority/), why the server asks a client
- [Raycasts and nearby entities](../raycasts/), to find doors by ray or radius
- [Virtual worlds](../../core-concepts/virtual-worlds/), per-world door state
- [Door reference](../../reference/server/classes/Door.md) and [Gate reference](../../reference/server/classes/Gate.md)
