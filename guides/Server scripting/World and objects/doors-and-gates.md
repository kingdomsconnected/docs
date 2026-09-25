---
title: Lock doors, open gates
description: Lock and unlock the level's own doors, open and close its drawbridges and portcullises, and store them by GUID.
sidebar:
  order: 44
---

Doors and gates are not spawned. They are the level's own: every house door
in Bohemia, and the castle drawbridge and portcullis. The server can lock a
door and drive a gate through its cycle, and it keeps that state for
everybody, so a door you lock is locked for every player who walks up to it.

```ts
// Lock whatever door the player is standing at.
async function lockDoorAt(player: Player): Promise<boolean> {
  const answer = await Door.queryNearest(player);
  if (!answer.found || !answer.door) return false;
  answer.door.locked = true;
  return true;
}
```

## Why doors need a client

The server does not load the level. It has no map, no list of the level's
entities, and no way to look at a point in the world. It learns about a door
only when a client tells it: as players walk past doors, their clients report
them, and [`Door.all()`](../../../reference/server/classes/Door.md#all) grows
over a session rather than starting complete.

So to reach a door nobody has reported yet, the server has to ask a client
that is standing at it. [`Door.queryNearest(player)`](../../../reference/server/classes/Door.md#querynearest)
does exactly that: it sends the question to that player's own client, which
looks around, answers with the door in front of it, and the server adopts the
door if it had not seen it. That is a network round trip, which is why the
call returns a promise.

The promise always settles. It resolves with `found: false` and a `reason`
when there is no door in sight, the client is in another level, it did not
answer within five seconds, or the player left. It never rejects.

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

The extra fields (`guid`, `name`, `distance`, `open`, `locked`) are only
present when `found` is true. `open` and `locked` are what that client sees
right now, which can be fresher than the server's copy.

Gates are different. When a client sees a gate it reports the gate's
**position**, so the server can answer "which gate is near this point" on its
own with [`Gate.nearest`](../../../reference/server/classes/Gate.md#nearest).
No round trip, no promise. There are only two gates and they are visible from
far away, so the server has almost always been told about them already. A
house door is one of thousands, the server may never have heard of the one a
player is standing at, and only that player's client can say which door it
is. So there is no `Door.nearest`.

## Doors

A [`Door`](../../../reference/server/classes/Door.md) handle has:

| Property | What it is |
| --- | --- |
| `guid` | The level's own EntityGuid, sixteen lowercase hex digits. The same on every machine and across restarts. |
| `locked` | Writable. Assigning reaches every client that has the door, including one standing at it. |
| `open` | Read-only. Whether it stands open, as the last client to touch it reported. A door opens by a body pushing it; the server cannot ask for that. |
| `stateToken` | Bumped on every durable change. Only useful to tell one change from the next. |

**Store doors by `guid`, not by `id`.** The id is a replication handle the
server hands out when it learns a door. The GUID is the level's identity for
it. `Door.find(guid, world?)` takes one back, with or without an `0x` prefix.

:::caution[`Door.find` only knows reported doors]
`Door.find` returns `null` for a door the server has not been told about yet,
and after a server restart it has been told about none. There is no event for
"a door was reported", so a gamemode that restores saved locks on start keeps
the GUIDs it could not find yet and tries again, for example when a player
spawns or on a timer.
:::

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

`Door.find` and `Gate.find` look in the global virtual world unless you pass
another one: each virtual world has its own copy of a door's state.

## Gates

The shipped game has two gates in total, one of each
[`kind`](../../../reference/server/classes/Gate.md#kind): `drawbridge` and
`portcullis`. They are learned the same way doors are, as players come near
the castles, so `Gate.all()` fills in over a session.

```ts
const gate = Gate.nearest(player.position, 60, player.virtualWorld);
if (gate) {
  const result = gate.toggle();
  Chat.sendToPlayer(player, result.accepted
    ? `The ${gate.kind} is ${result.opening ? "opening" : "closing"} (${result.seconds.toFixed(1)} s).`
    : `The ${gate.kind} ${result.reason}.`);
}
```

Use a radius of tens of metres: castle architecture is big and seen from far
away. `Gate.find(guid, world?)` works like `Door.find`.

`toggle(open?)` starts a cycle. `true` opens, `false` closes, and no argument
heads away from whichever end the gate is at, reversing it if it is already
moving. The motion is not streamed: every client plays it from the server
clock it started on, so players who arrive mid-cycle see it at the right
point, and a reversal picks up from where it is.

"Open" always means passable: a portcullis raised, a drawbridge lowered.

| Property | What it is |
| --- | --- |
| `cycle` | `closed`, `opening`, `open` or `closing`. (Not `state`: every entity already has a `state`, its state bag.) |
| `openness` | `0` shut to `1` fully open, moving while a cycle runs. |
| `moving` | Whether a cycle is running. |
| `openDuration`, `closeDuration` | Length of each clip in seconds. `0` means the asset has no clip that way. |

## What fails, and how

- `Door.queryNearest` never rejects; check `found` and read `reason`.
- `Door.find`, `Gate.find`, `Gate.nearest` and `getById` return `null` for
  anything the server has not learned.
- `gate.toggle()` never throws. It returns a
  [`GateToggle`](../../../reference/server/interfaces/GateToggle.md): when
  `accepted` is false, `reason` is a phrase that reads after the gate's name
  (`is already open`, `has no opening animation`) and `seconds` is `0`.
- Nothing is spawned, so nothing needs cleaning up. A lock you set stays set
  until you change it or the server restarts.

:::tip[Try it]
The default gamemode's `/door` (`src/server/commands/door.ts`) prints the door
you are standing at, `/door lock` and `/door unlock` change it, and
`/door lock <guid>` reaches a door the server already knows without the round
trip. `/gate` (`src/server/commands/gate.ts`) toggles the nearest gate within
60 m, and `/gate list` prints the ones the server has learned.
:::
