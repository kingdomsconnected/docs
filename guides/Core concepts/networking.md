---
title: Send data between server and client
description: Send named events from the server to one client or all of them and back, know what a payload can carry, and validate what a client sends.
sidebar:
  label: Server and client messages
  order: 23
---

Server and client scripts talk by sending named events. The server sends to
one player or to everyone; a client sends only to the server. Events arrive
reliably and in order while the connection holds.

A client asks for the scoreboard when its script starts, and the server
answers that player. Asking from the client avoids a race: at `playerConnect`
the client scripts may not be running yet. This is your gamemode's own
scoreboard: the built-in **Tab** player list is a server setting, [`mod.scoreboard`](../../hosting-a-server/server-json/#modscoreboard).

```ts title="src/client/scores.ts"
const RESOURCE = "my-mode";

Events.on(`${RESOURCE}:scores`, (payload) => {
  if (!Array.isArray(payload)) return;
  for (const row of payload) console.log(JSON.stringify(row));
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

## Pick the call

| Direction | Send with | Payload | Receive with |
| --- | --- | --- | --- |
| Server to one client | `player.emit(name, jsonText)` | A JSON **string**, or nothing | client `Events.on(name, (payload) => ...)` |
| Server to every client | `Events.emitAllClients(name, payload)` | Any value | client `Events.on(name, (payload) => ...)` |
| Client to server | `Events.emitServer(name, payload)` | Any value | server `Events.onClient(name, (sender, payload) => ...)` |

:::caution
Server-to-client events land in the `Events.on` table every client resource
shares. Prefix every name with your resource name.
:::

## What a payload can carry

Payloads cross the wire as JSON and arrive parsed, typed `unknown`.

| You send | They receive |
| --- | --- |
| Objects, arrays, strings, numbers, booleans, `null` | The same |
| A class instance, such as a `Vector3` | A plain object (`{ x, y, z }`), no methods |
| Functions, `undefined` fields | Nothing |
| A player, horse or NPC | Do not: send its `id` and use `getById` on the other side |

`emitAllClients` and `emitServer` JSON-encode anything but a string. A string
is sent as is, so it must itself be JSON: `Events.emitServer("x", "hello")` is
dropped with a "malformed JSON payload" warning. Wrap it as `{ text: "hello" }`.
`player.emit` likewise needs `JSON.stringify(value)`; a non-JSON string is
dropped with an error in the client log.

## Validate everything a client sends

The player controls their client, so anything reaching `Events.onClient` may
be forged. Check:

| Check | How |
| --- | --- |
| Who | The `sender` is the connection it came from and cannot be faked. Never trust a player id in the payload. |
| Whether they may | Check your own state: is this player really in a shop, a build session, a round? |
| Shape | Read each field and check its type. Reject non-finite numbers. |
| Sense | Compare positions with where the server sees the player. |

```ts title="src/server/flare.ts"
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

`Events.onClient` handlers live in their own table. A client reaches only the
handlers you registered there, never a native event like `playerDied` or
another resource's custom event.

## Keep traffic down

Nothing limits how often a client may send. Keep `onClient` handlers cheap and
throttle expensive ones per player:

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

From the server side:

- Send only while someone is looking (a panel that is open, for example).
- Send what changed, not the whole snapshot, when it is large.
- For data about one entity (team, role, a score over a head), use a
  [state bag](../state/): sent only to clients that see the entity, batched
  per tick, and re-sent to anyone who comes into range.

## Related

- [Events](../events/): the bus these calls share
- [Server vs client authority](../authority/): why the server decides
- [State bags](../state/): per-entity data without events
- [Page data bridge](../../user-interface/page-bridge/): the hop from a client script to its web view
