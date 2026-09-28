---
title: Exports and messages between resources
description: Let one resource call another with Exports and Imports, ask and answer with Messages, and structure a library resource.
sidebar:
  label: Share code between resources
  order: 27
---

Resources on the same machine can use each other: a library exports
functions, another resource calls them. All of this stays on one side; server
resources talk to server resources, client to client. Crossing the wire is
[networking](../networking/).

| Tool | Shape | Use it for |
| --- | --- | --- |
| `Exports` and `Imports` | A direct reference to another resource's value | A library you depend on and call often. |
| `Messages` | A request with a reply, or a one-way notice | A resource that may be missing, or should stay loosely coupled. |
| `Events.emitTo` | An event for one resource's handlers | A notification. See [Events](../events/#emit-your-own-events). |

## Export a function

Register with [`Exports.register`](../../reference/server/variables/Exports.md)
and list every name in the manifest's `exports`:

```json title="resources/my-economy/package.json"
{
  "name": "my-economy",
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"],
    "exports": ["balance", "pay"]
  }
}
```

```ts title="my-economy/src/server/index.ts"
const balances = new Map<number, number>();

function balance(playerId: number): number {
  return balances.get(playerId) ?? 0;
}

function pay(playerId: number, amount: number): boolean {
  const next = balance(playerId) + amount;
  if (next < 0) return false;
  balances.set(playerId, next);
  return true;
}

Exports.register("balance", balance);
Exports.register("pay", pay);
```

:::caution[Declare every export]
Registering a name missing from `mafiahub.exports` logs a warning and returns
`true`, but stores nothing. The first `Exports.get` for it then throws "export
not found".
:::

## Call another resource's export

`Exports.get(resource, name)` reads one export; `Imports.get(resource)` reads
all of them. Both throw when the resource is not installed or not running, and
`Exports.get` also when the name does not exist. The value is `unknown`, so
type it:

```ts title="my-shop/src/server/index.ts"
type Pay = (playerId: number, amount: number) => boolean;

Events.on("playerCommand", (player, command) => {
  if (command !== "buyhorse") return;

  const payFrom = Exports.get("my-economy", "pay") as Pay;
  if (!payFrom(player.id, -500)) {
    Chat.sendToPlayer(player, "You cannot afford a horse.");
    return;
  }
  Horse.spawn(player.position, undefined, undefined, `${player.nickname}'s horse`);
});
```

You get the real function or object, not a copy, since both resources share a
runtime. Calls are cheap, but an exported object can be changed by whoever
holds it: export functions, not mutable state.

Add the library to the consumer's `resourceDependencies`:

```json title="resources/my-shop/package.json"
{
  "name": "my-shop",
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"],
    "resourceDependencies": ["my-economy"]
  }
}
```

- The library starts first, so its exports exist when your scripts run.
- `Imports.get` stops warning about an undeclared dependency.
- When the library restarts, your resource restarts with it. An export you
  held keeps pointing at the old code, so read exports when you use them.

## Ask and answer with Messages

[`Messages`](../../reference/server/variables/Messages.md) is a request and
reply channel addressed to a resource by name. The receiver registers one
handler per message type; registering a type again replaces it.

```ts title="my-discord-log/src/server/index.ts"
Messages.handle("post", (payload, reply) => {
  const text = typeof payload === "object" && payload !== null ? (payload as { text?: unknown }).text : undefined;
  if (typeof text !== "string") {
    reply({ ok: false });
    return;
  }
  console.log(`[discord] ${text}`);
  reply({ ok: true });
});
```

`Messages.request(resource, type, payload)` returns a promise:

| Case | Result |
| --- | --- |
| Handler calls `reply(value)` | Resolves with the first value, on the next tick. Later replies are ignored. |
| Resource has no handlers | Rejects with `"Target resource not found"`. |
| No handler for that type | Rejects with `"No handler for message type"`. |
| Handler throws before replying | Rejects with the error. |
| Async handler throws after an `await`, or never replies | Waits forever. No timeout; rejects only if either resource stops. |

`Messages.send(resource, type, payload)` is one-way: `reply` does nothing, and
a missing resource or handler is ignored. Reply from a `try`/`finally`, and add
your own timeout when it matters:

```ts title="my-shop/src/server/timeout.ts"
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timed out")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function logSale(text: string): Promise<void> {
  try {
    await withTimeout(Messages.request("my-discord-log", "post", { text }), 2000);
  } catch {
    // Not installed, not answering, or broken. The sale still happened.
  }
}
```

Here `my-discord-log` can be missing entirely (an optional dependency, or none
at all) and the shop carries on.

## Write a library resource

- Register exports at the top level of the entry script, not in
  `resourceStart`, so dependents find them when they start.
- Keep the manifest's `exports` in step with the code.
- Ship a `.d.ts` describing the exports, so consumers can write
  `Exports.get(...) as Economy["pay"]`.
- Keep state in the library behind functions, so reloading a consumer loses
  nothing.

Code shared only by your own resource's server and client needs none of this:
use `sharedScripts`, or import the same file from both entry points.

## Related

- [Resource manifest and lifecycle](../resources/): `exports`, dependencies and start order
- [Structure a larger resource](../../getting-started/project-structure/): splitting one resource into files
- [Events](../events/): `emitTo` for notifications
