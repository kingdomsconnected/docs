---
title: Entity state
sidebar:
  order: 21
---

Every replicated entity carries a bag of arbitrary key/value state, reached as
`entity.state`. The server writes it; every client that can see the entity
receives it. It is the way to attach gamemode data — a team, a role, a job, a
score — to a player or a horse without inventing an RPC for each one.

```js
// Server
Events.on("playerConnect", (player) => {
  player.state.set("team", "raven");
  player.state.set("score", 0);
});
```

```js
// Client
const player = LocalPlayer;
if (player?.state.get("team") === "raven") { /* ... */ }
```

The bag lives on the entity and dies with it, so a disconnecting player takes
their keys with them — unlike a `Map` of your own keyed on player id, which
still has to be cleaned up in `playerDisconnect`.

## The server is the only writer

`set` and `remove` exist on the server only. A client resource gets `get`,
`has`, `keys`, `toObject` and `onChange` — there is no client write that could
disagree with the server, and no need to validate one.

| | Server | Client |
| --- | --- | --- |
| `get`, `has`, `keys`, `toObject` | yes | yes |
| `onChange` | yes | yes |
| `set`, `remove` | yes | **no** |

## Who a key reaches

`set` takes a scope, which decides the audience:

```js
player.state.set("team", "raven");                          // broadcast (the default)
player.state.set("wanted", 3, { scope: "owner" });           // only this player's own client
player.state.set("lastSeen", Date.now(), { scope: "server" }); // never leaves the server
```

| Scope | Reaches |
| --- | --- |
| `broadcast` | Every client that can currently see the entity. The default. |
| `owner` | Only the client that owns the entity. |
| `server` | Nobody. Server-side storage that never goes on the wire. |

`server` is worth reaching for more than it looks: it gives you per-entity
storage with the same API and the same lifetime as the replicated keys, without
paying for bandwidth nobody reads.

A key's audience may shrink — `broadcast` narrowed to `owner` later — and
clients that must no longer hold it are told to drop it.

## Reacting to a change

`onChange` watches one key, or every key when passed `null`. The filter is
applied before your handler runs, so watching one key of one entity is not woken
by unrelated traffic. It returns a function that cancels the subscription, and
the subscription is dropped automatically when the resource stops.

```js
const off = player.state.onChange("team", (key, value, previous) => {
  console.log(`${previous} -> ${value}`);
});

off(); // when you want it to stop early
```

Two arguments deserve care:

- `value` is `undefined` when the key was **removed**.
- `previous` is `undefined` when the key **held nothing** before.

`null` is a value you can store, so `previous === undefined` does not
distinguish "was not set" from "was set to null" on its own. Use `has` before
the write if that distinction matters to you.

A write notifies immediately, in the tick that made it, so a resource observes
its own change through its own handler rather than a tick later.

## What travels, and what it costs

Booleans, numbers and strings travel as themselves. Anything else is serialized
as JSON, which means a value you put in as an object comes back as a plain
object — not as a class instance, and not carrying functions.

Limits are enforced per entity, and `set` throws when one is reached:

| Limit | Value |
| --- | --- |
| Key length | 64 UTF-8 bytes |
| Value size | 4096 bytes |
| Keys per entity | 128 |

They exist because every write crosses the network to every viewer of the
entity, so an unbounded bag would be a denial of service one careless resource
away.

Two things keep the traffic down for you. `set` returns `false` and sends
nothing when the value and scope already stored are the same, so re-writing an
unchanged value each tick is free. And writes are batched and flushed once per
tick rather than sent one packet per `set`.

## New viewers get the current state

A client that comes into range of an entity receives its bag along with the
entity itself — `broadcast` keys always, `owner` keys if it is the owner,
`server` keys never. There is no need to re-send state when someone streams in,
and no window where an entity exists on a client without the state it was
carrying.

The same applies when an entity changes hands: the incoming owner is seeded with
the `owner` keys it has never been sent.
