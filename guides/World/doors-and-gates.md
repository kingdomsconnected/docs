---
title: Lock doors, open gates
description: Lock and unlock the level's own doors, open and close its drawbridges and portcullises, and store them by GUID.
sidebar:
  label: Doors and gates
  order: 43
---

Doors and gates are the level's own, not spawned: every house door in
Bohemia, plus the castle drawbridge and portcullis. The server can lock a door
or drive a gate, and the state holds for every player.

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
The server does not load the level, so it learns about a door only when a
client reports it. [`Door.all()`](../../reference/server/classes/Door.md#all)
grows over a session. To reach an unreported door,
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
| `guid` | The level's EntityGuid, sixteen lowercase hex digits. Same on every machine and across restarts. |
| `locked` | Writable. Reaches every client that has the door, including one standing at it. |
| `open` | Read-only, as the last client to touch it reported. Bodies push doors open; the server cannot. |
| `stateToken` | Bumped on every durable change, to tell one change from the next. |

## Save doors by GUID

Store `guid`, not `id`: the id is a replication handle, the GUID is the level's
identity. `Door.find(guid, world?)` takes one back, with or without an `0x`
prefix.

`Door.find` returns `null` for a door not reported yet, and after a restart
none are. There is no "door reported" event, so to restore saved locks, retry
the missing GUIDs on a timer or when a player spawns:

```ts
const saved = ["00a1b2c3d4e5f607"]; // loaded from your own storage
const pending = new Set(saved);

setInterval(() => {
  for (const guid of pending) {
    const door = Door.find(guid);
    if (door) {
      door.locked = true;
      pending.delete(guid);
    }
  }
}, 5000);
```

`Door.find` and `Gate.find` search the global virtual world unless you pass
another. Each virtual world has its own copy of a door's state.

## Open and close a gate

There are two gates, one of each
[`kind`](../../reference/server/classes/Gate.md#kind): `drawbridge` and
`portcullis`. Clients report gates as players near the castles, so
`Gate.all()` fills in over a session. Because they report the position,
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
| `openDuration`, `closeDuration` | Clip lengths in seconds. `0` means no clip that way. |

## When a call fails

| Call | Fails when | Result |
| --- | --- | --- |
| `Door.queryNearest` | No door in sight, other level, 5 s timeout, player left. | Resolves `found: false` with a `reason`. Never rejects. |
| `Door.find`, `Gate.find`, `Gate.nearest`, `getById` | The server has not learned it. | `null`. |
| `gate.toggle()` | Already at that end, or no clip that way. | A [`GateToggle`](../../reference/server/interfaces/GateToggle.md) with `accepted: false`, a `reason` that reads after the gate's name (`is already open`) and `seconds: 0`. Never throws. |

Nothing is spawned, so nothing needs cleanup. A lock stays until you change it
or the server restarts.

:::tip[Try it]
The default gamemode's `/door` (`src/server/commands/door.ts`) prints the door
you stand at; `/door lock`, `/door unlock` and `/door lock <guid>` change one.
`/gate` (`src/server/commands/gate.ts`) toggles the nearest gate within 60 m,
and `/gate list` prints the known ones.
:::

## Related

- [Server vs client authority](../../core-concepts/authority/), why the server asks a client
- [Raycasts and nearby entities](../raycasts/), to find doors by ray or radius
- [Virtual worlds](../../core-concepts/virtual-worlds/), per-world door state
- [Door reference](../../reference/server/classes/Door.md) and [Gate reference](../../reference/server/classes/Gate.md)
