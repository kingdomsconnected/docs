---
title: Entity state bags
description: Attach your own key/value data to players and other entities, choose who receives each key, and react when a value changes.
sidebar:
  label: State bags
  order: 24
---

Every replicated entity carries a key/value bag,
[`entity.state`](../../reference/server/classes/StateBag.md). The server
writes it and every client that can see the entity receives it. Use it for
gamemode data on a player, horse or prop (a team, a role, a score) without a
network event for each.

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

The bag goes away with its entity, so a disconnecting player takes their keys
along. A `Map` keyed on player id would need cleaning up in `playerDisconnect`.

## Read and write

| Method | Side | Returns |
| --- | --- | --- |
| `set(key, value, options?)` | Server only | `true` if the value changed; `false` if the same value and scope were stored (nothing is sent) |
| `remove(key)` | Server only | Whether the key existed |
| `get(key)` | Both | The value, or `undefined` |
| `has(key)`, `keys()`, `toObject()` | Both | Presence, key list, a plain copy |
| `onChange(key, fn)` | Both | A function that cancels the subscription |

Booleans, numbers and strings travel as themselves. Anything else is stored as
JSON and comes back as a plain object. `null` can be stored. Writing an
unchanged value every tick costs nothing.

A client cannot write. If it needs a value changed, it asks with an event and
the server decides; see [Send data between server and client](../networking/).

## Choose who receives a key

```ts
// server
player.state.set("team", "ravens");                             // broadcast, the default
player.state.set("wanted", 3, { scope: "owner" });              // only this player's own client
player.state.set("joinedAt", Date.now(), { scope: "server" });  // never leaves the server
```

| Scope | Reaches |
| --- | --- |
| `broadcast` | Every client that can currently see the entity. |
| `owner` | Only the owning client: a player's own, or a horse's rider. |
| `server` | Nobody. Per-entity server storage with the same lifetime, and no bandwidth. |

Narrowing a key's scope (say `broadcast` to `owner`) tells the clients that
lose it to drop it. An unknown scope name throws.

## Limits

`set` throws past any of these, per entity:

| Limit | Value |
| --- | --- |
| Key length | 64 UTF-8 bytes |
| Value size | 4096 bytes of string or JSON text |
| Keys per entity | 128 |

## React to a change

`onChange` watches one key of one entity, or every key when you pass `null`.
Unrelated writes do not wake it. The subscription ends when your resource
stops.

```ts
// server
const stop = player.state.onChange("score", (key: string, value: unknown, previous: unknown) => {
  console.log(`${key}: ${String(previous)} -> ${String(value)}`);
});
stop(); // to end it early
```

- `value` is `undefined` when the key was **removed**.
- `previous` is `undefined` when the key **held nothing**; a stored `null`
  reports `null`.
- The handler is loosely typed, so write the parameter types out.
- On the server it fires in the tick of the write; on a client, when the write
  arrives.

To watch every entity, use `entityStateChange` on either side:

```ts
// client
Events.on("entityStateChange", (entity, key, value) => {
  const me = LocalPlayer;
  if (!me || entity.id !== me.id || key !== "score") return;
  console.log(`Your score is now ${String(value)}`);
});
```

## How it is delivered

- Writes are batched and sent once per tick, not one packet per `set`.
- A client coming into range gets the bag with the entity: `broadcast` keys,
  `owner` keys if it is the owner, never `server` keys. No re-sending needed.
- When an entity changes hands (a horse being mounted), the new owner receives
  the `owner` keys it lacked.
- Keys belong to the entity, not the resource. After `ensure`, your `onChange`
  subscriptions are gone but the keys remain, so a score in a state bag
  survives a reload and one in a `Map` does not.

## Related

- [Send data between server and client](../networking/): when data is not tied to an entity
- [Virtual worlds](../virtual-worlds/): which clients can see an entity
- [Build a team capture-zone mode](../../tutorials/team-rounds/): teams kept in state bags
