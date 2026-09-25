---
title: Exports and messages between resources
description: Letting one resource call another with Exports and Imports, asking and answering with Messages, and structuring a library resource.
sidebar:
  order: 27
---

Resources on the same side of the wire can use each other. A library resource
exports functions; another resource reads and calls them. When you would
rather ask than call, `Messages` gives you a request and a reply. All of this
stays on one machine: server resources talk to server resources, and client
resources to client resources. Crossing the wire is
[networking](../networking/).

| Tool | Shape | Use it for |
| --- | --- | --- |
| `Exports` and `Imports` | A direct reference to another resource's value | A library you depend on and call often. |
| `Messages` | A request with a reply, or a one-way notice | A resource that might not be installed, or should stay loosely coupled. |
| `Events.emitTo` | An event for one resource's handlers | A notification. See [Events](../events/#events-of-your-own). |

## Exports

A resource offers values with
[`Exports.register`](../../reference/server/variables/Exports.md), and must
list every name in its manifest's `exports`:

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
Registering a name that is not in `mafiahub.exports` logs a warning and
returns `true`, but the value is not stored. The first `Exports.get` for it
then throws "export not found". If a register seems to do nothing, check the
manifest.
:::

Another resource reads one export with `Exports.get(resource, name)`, or all
of them at once with `Imports.get(resource)`. Both throw when the resource is
not installed, not running, or (for `Exports.get`) has no export of that name.
The value comes back as `unknown`, so give it a type where you read it:

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

The value is the real function or object, not a copy: both resources run in
one runtime. That makes calls cheap, and it means an object you export can be
changed by whoever holds it. Export functions rather than mutable state.

### Depend on what you import

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

That does three things. The library starts first, so its exports exist by the
time your scripts run. `Imports.get` stops warning about an undeclared
dependency. And when the library restarts, your resource is stopped and started
with it.

That last point matters because an export you already hold keeps pointing at
the old code after the library reloads. Reading exports at the moment you use
them, as above, is the simplest way never to hold a stale one.

`priority` in the manifest does not order anything; see
[Resources](../resources/#start-order-and-dependencies).

## Messages

[`Messages`](../../reference/server/variables/Messages.md) is a
request-and-reply channel addressed to a resource by name. The receiving
resource registers a handler per message type; registering the same type again
replaces it.

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

- It resolves with the first value the handler passes to `reply`. Later calls
  are ignored, and the reply is delivered on the next tick even when the
  handler answers at once.
- It rejects with a string when the resource has no handlers at all
  (`"Target resource not found"`) or none for that type (`"No handler for
  message type"`), and with the error when the handler throws before replying.
- If the handler never replies, it waits. There is no timeout; it only rejects
  when one of the two resources stops.

An `async` handler that throws after an `await` does not reject the request,
it just never replies. Reply from a `try`/`finally`, and put your own timeout
on requests that matter:

```ts title="my-shop/src/server/log.ts"
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

That is the case `Messages` is good at: `my-discord-log` can be missing
entirely, listed as an optional dependency or not at all, and the shop carries
on. `Messages.send(resource, type, payload)` is the one-way version. The
handler's `reply` does nothing, and a missing resource or handler is silently
ignored.

## Library resources

A library is an ordinary resource that registers exports and has no gameplay
of its own. A few habits make one pleasant to depend on:

- Register everything at the top level of the entry script, not inside
  `resourceStart`. Dependents start right after, and should find the exports
  there.
- Keep the export list in the manifest in step with the code.
- Ship a small `.d.ts` beside it describing the exports, so a TypeScript
  consumer can write `Exports.get(...) as Economy["pay"]` instead of spelling
  the type out.
- Keep state inside the library and expose functions over it, so that a reload
  of a consumer does not lose anything.

When the code only needs to run inside your own resource on both sides,
you do not need any of this: put it in `sharedScripts`, or import the same
file from your server and client entry points.

## Related

- [Resource manifest and lifecycle](../resources/)
- [Structure a larger resource](../../getting-started/project-structure/)
- [Events](../events/)
