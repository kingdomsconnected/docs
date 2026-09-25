---
title: Send data between server and client
description: Sending named events from the server to one client or all of them and back, what a payload can carry, and how to validate what a client sends.
sidebar:
  order: 23
---

Your server script and your client script run on different machines, so they
talk by sending named events. The server can send to one player or to
everyone; a client can only send to the server. Events arrive reliably and in
the order they were sent, for as long as the connection holds.

| Direction | Send with | Receive with |
| --- | --- | --- |
| Server to one client | `player.emit(name, jsonText)` | client `Events.on(name, (payload) => ...)` |
| Server to every client | `Events.emitAllClients(name, payload)` | client `Events.on(name, (payload) => ...)` |
| Client to server | `Events.emitServer(name, payload)` | server `Events.onClient(name, (sender, payload) => ...)` |

`emitAllClients` and `emitServer` are real but missing from the declarations.
A TypeScript resource declares them in `types/runtime.d.ts`, as shown in
[Use TypeScript](../../getting-started/typescript/).

## A round trip

A client asks for the scoreboard when its script starts, and the server answers
that one player. Asking from the client side avoids a race: when the server
sends something at `playerConnect`, the player's client scripts may not be
running yet.

```ts title="src/client/scores.ts"
const RESOURCE = "my-mode";

Events.on(`${RESOURCE}:scores`, (payload) => {
  if (!Array.isArray(payload)) return;
  for (const row of payload) {
    console.log(JSON.stringify(row));
  }
});

Events.on("resourceStart", (name) => {
  if (name === RESOURCE) Events.emitServer(`${RESOURCE}:scores.ask`);
});
```

```ts title="src/server/scores.ts"
const RESOURCE = "my-mode";
const scores = new Map<number, number>();

Events.onClient(`${RESOURCE}:scores.ask`, (sender) => {
  const player = sender as Player;
  const rows = Player.all().map((p) => ({ name: p.nickname, score: scores.get(p.id) ?? 0 }));
  player.emit(`${RESOURCE}:scores`, JSON.stringify(rows));
});
```

The same client handler also works when the server pushes to everyone:
`Events.emitAllClients("my-mode:scores", rows)`.

## What a payload can carry

Every payload crosses the wire as JSON text and is parsed on arrival. Plain
objects, arrays, strings, numbers, booleans and `null` survive. Class
instances arrive as plain objects: a `Vector3` becomes `{ x, y, z }` without
its methods. Functions and `undefined` fields disappear. To refer to a player,
horse or NPC, send its `id` and look it up with `getById` on the other side.

How you hand the payload over depends on the call:

- **`player.emit`** takes a string that already is JSON. Pass
  `JSON.stringify(value)`, or leave the payload out for an event that carries
  nothing. A string that is not valid JSON, like `"hello"`, is dropped by the
  client with an error in its log.
- **`Events.emitAllClients`** and **`Events.emitServer`** take any value.
  Anything but a string is JSON-encoded for you. A string is sent as it is,
  which means it must itself be JSON text: `Events.emitServer("x", "hello")` is
  dropped with a "malformed JSON payload" warning in the server log. Pass
  objects, and wrap a bare string as `{ text: "hello" }`.

The receiver always gets the parsed value, typed as `unknown`.

:::caution
Server-to-client events land in the same `Events.on` table that every client
resource shares. Any client resource that listens for `"scores"` would hear
yours. Prefix every name with your resource name.
:::

## Validate everything a client sends

The player controls their client. Anything that arrives through
`Events.onClient` could have been written by hand, so check it the way the
default gamemode's `src/server/build.ts` does before it spawns a prop where a
client asked:

- **Who**: the sender is the connection the packet came from, and a client
  cannot fake it. Cast it with `sender as Player`, and never trust a player id
  inside the payload.
- **Whether they may**: check your own state, not the client's claim. Is this
  player actually in a build session, a shop, a round?
- **Shape**: read each field and check its type. Reject numbers that are not
  finite.
- **Sense**: compare positions with where the server thinks the player is.

```ts title="src/server/throw.ts"
const MAX_REACH = 30;

function readPosition(payload: unknown): Vector3 | null {
  if (typeof payload !== "object" || payload === null) return null;
  const { x, y, z } = payload as Record<string, unknown>;
  if (typeof x !== "number" || typeof y !== "number" || typeof z !== "number") return null;
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;
  return new Vector3(x, y, z);
}

Events.onClient("my-mode:flare", (sender, payload) => {
  const player = sender as Player;
  const target = readPosition(payload);
  if (!target || !player.ready) return;
  if (player.position.distance(target) > MAX_REACH) return;

  Vfx.burst("WH_Particels.fires.campfire_a", target);
});
```

:::note
`Events.onClient` handlers live in their own table, separate from `Events.on`.
A client can only reach the handlers you registered for it, and never a native
event like `playerDied` or another resource's custom event.
:::

## Keeping traffic down

Nothing in the framework limits how often a client may send, so a modified
client can call your `onClient` handler as fast as its connection allows.
Keep those handlers cheap, and throttle anything expensive per player:

```ts
// server
const lastAsk = new Map<number, number>();

Events.onClient("my-mode:scores.ask", (sender) => {
  const player = sender as Player;
  const now = Date.now();
  if (now - (lastAsk.get(player.id) ?? 0) < 500) return;
  lastAsk.set(player.id, now);
  // ... answer
});

Events.on("playerDisconnect", (player) => lastAsk.delete(player.id));
```

Going the other way, a few habits keep the server from flooding its players:

- Send only while someone is looking. The default gamemode's debug panel polls
  the server twice a second, and only while the panel is open.
- Send what changed, not everything, when the whole snapshot is large.
- For data attached to one entity (a team, a role, a score shown over a head),
  use a [state bag](../state/) instead. It is sent only to clients that can see
  the entity, batched once per tick, and delivered again to anyone who comes
  into range.

## Related

- [Events](../events/)
- [Server vs client authority](../authority/)
- [Send data to and from a page](../../client-scripting/user-interface/page-bridge/), for the hop from a client
  script to its web view
