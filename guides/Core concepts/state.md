---
title: Entity state bags
description: Attaching your own key/value data to players and other entities with state bags, who receives each key, the limits, and reacting to changes.
sidebar:
  order: 24
---

Every replicated entity carries a bag of key/value state, reached as
[`entity.state`](../../reference/server/classes/StateBag.md). The server
writes it, and every client that can see the entity receives it. It is the way
to attach gamemode data (a team, a role, a job, a score) to a player, a horse
or a prop without inventing a network event for each one.

```ts
// server
Events.on("playerSpawned", (player) => {
  player.state.set("team", "ravens");
  player.state.set("score", 0);
});
```

```ts
// client
const me = LocalPlayer;
if (me && me.state.get("team") === "ravens") {
  console.log("You fight for the Ravens.");
}
```

The bag lives on the entity and goes away with it, so a player who disconnects
takes their keys along. A `Map` keyed on player id, by contrast, has to be
cleaned up in `playerDisconnect`.

## Only the server writes

`set` and `remove` exist on the server only. A client resource can read with
`get`, `has`, `keys` and `toObject`, and watch with `onChange`. There is no
client write that could disagree with the server, and so nothing to validate.
If a client needs to change a value, it asks with an event and the server
decides; see [Send data between server and client](../networking/).

## Who a key reaches

`set` takes an optional scope:

```ts
// server
player.state.set("team", "ravens");                             // broadcast, the default
player.state.set("wanted", 3, { scope: "owner" });              // only this player's own client
player.state.set("joinedAt", Date.now(), { scope: "server" });  // never leaves the server
```

| Scope | Reaches |
| --- | --- |
| `broadcast` | Every client that can currently see the entity. |
| `owner` | Only the client that owns the entity: a player's own client, or the rider of a horse. |
| `server` | Nobody. Server-side storage that never goes on the wire. |

`server` is worth reaching for more than it looks. It gives you per-entity
storage with the same API and the same lifetime as the replicated keys, and
costs no bandwidth.

A key's audience may shrink: rewrite a `broadcast` key as `owner` and the
clients that must no longer hold it are told to drop it. An unknown scope name
throws rather than silently broadcasting.

## Reading and writing

`get` returns the stored value or `undefined`. `set` returns `true` when the
value changed and `false` when the same value and scope were already stored,
in which case nothing is sent. So writing an unchanged value every tick costs
nothing. `remove` returns whether the key existed.

Booleans, numbers and strings travel as themselves. Anything else is stored as
JSON, so an object comes back as a plain object: not a class instance, and
without functions. `null` is a value you can store.

## Limits

Each entity has limits, and `set` throws when you go past one:

| Limit | Value |
| --- | --- |
| Key length | 64 UTF-8 bytes |
| Value size | 4096 bytes of string or JSON text |
| Keys per entity | 128 |

They exist because every write goes to every client that can see the entity.
An unbounded bag would be one careless resource away from flooding everyone.

## Reacting to a change

`onChange` watches one key of one entity, or every key when you pass `null`.
The filter is applied before your handler runs, so watching one key is not
woken by unrelated writes. It returns a function that cancels the
subscription, and the subscription is dropped when your resource stops.

```ts
// server
const stop = player.state.onChange("score", (key: string, value: unknown, previous: unknown) => {
  console.log(`${key}: ${String(previous)} -> ${String(value)}`);
});

stop(); // when you want it to end early
```

The handler is typed loosely in the declarations, which is why the parameters
need their types written out. Two of them deserve care:

- `value` is `undefined` when the key was **removed**.
- `previous` is `undefined` when the key **held nothing** before. A key that
  held `null` reports `null`, so the two stay distinguishable.

A write notifies at once, in the tick that made it, so a resource sees its own
change straight away. On a client, the notification comes when the write
arrives.

To watch every entity at once, use the `entityStateChange` event. It carries
the entity, the key, the new value and the previous one, on both sides:

```ts
// client
Events.on("entityStateChange", (entity, key, value) => {
  const me = LocalPlayer;
  if (!me || entity.id !== me.id || key !== "score") return;
  console.log(`Your score is now ${String(value)}`);
});
```

## Traffic and new viewers

Writes are batched and sent once per tick, not one packet per `set`. A client
that comes into range of an entity receives its bag along with the entity
itself: `broadcast` keys always, `owner` keys if it is the owner, `server` keys
never. There is no need to re-send state when someone streams in, and no
moment where a client has the entity but not its state. When an entity changes
hands, as a horse does when someone mounts it, the new owner receives the
`owner` keys it had not been sent.

## State outlives a reload

Keys belong to the entity, not to the resource that wrote them. When you
`ensure` your resource, its `onChange` subscriptions go away, but the keys it
set on players stay. A score kept in a state bag survives a reload; a score
kept in a `Map` does not.

## Related

- [Send data between server and client](../networking/)
- [Virtual worlds](../virtual-worlds/), which decide who can see an entity
- [Build a team capture-zone mode](../../tutorials/team-rounds/), which keeps teams in state bags
