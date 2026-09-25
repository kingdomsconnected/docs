---
title: Resource manifest and lifecycle
description: What a resource is, every field of its package.json, the order resources start in, and what happens when one stops or reloads.
sidebar:
  order: 21
---

A resource is a folder under the server's `resources/` directory with a
`package.json` in it. Everything a server does beyond moving bodies around
comes from resources, including every `/` command: the default gamemode,
`kcdc-gamemode`, is one. The server starts every resource it finds at boot, and
you can stop, start and reload them from the console while it runs.

```json title="resources/my-mode/package.json"
{
  "name": "my-mode",
  "version": "1.0.0",
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"],
    "clientScripts": ["dist/client/index.js"],
    "files": ["ui/**"]
  }
}
```

The resource's name is the manifest's `name`, not the folder's. That is the
name the console verbs, `resourceStart`, `Exports` and web view URLs use.

## The manifest

Standard fields sit at the top level. Everything the framework reads beyond
them lives in the `mafiahub` object.

| Field | Default | Meaning |
| --- | --- | --- |
| `name` | required | The resource's name. If two folders use the same name, only one is loaded and the log warns about the other. |
| `version` | `"1.0.0"` | Shown in the logs. |
| `description`, `author` | empty | Informational. |
| `mafiahub.serverScripts` | `[]` | Run on the server, in the order written. Never sent to players. |
| `mafiahub.clientScripts` | `[]` | Run on every client, in the order written. Sent to players. |
| `mafiahub.sharedScripts` | `[]` | Run on both sides, **before** that side's own scripts. Sent to players. |
| `mafiahub.files` | `[]` | Sent to clients but not run: web pages, styles, images, fonts. Globs allowed. |
| `mafiahub.resourceDependencies` | `[]` | Resources that must start before this one. See below. |
| `mafiahub.exports` | `[]` | Names this resource may register with `Exports.register`. See [Sharing code](../sharing/). |
| `mafiahub.errorBehavior` | `"stop"` | What happens after an uncaught error on the server: `"stop"`, `"restart"` or `"continue"`. |
| `mafiahub.priority` | `0` | Accepted, but the current framework does not use it for anything. |

Script paths are relative to the resource folder and do not take globs, so the
order you write is exactly the order they run. `files` does take globs. If you
leave `files` empty, the server falls back to sending the folder your client
scripts live in.

:::caution
Anything in `clientScripts`, `sharedScripts` or `files` ends up on every
player's disk. Keep secrets, admin lists and database credentials in server
scripts only.
:::

<details>
<summary>Older manifests with <code>server</code> and <code>client</code></summary>

A manifest may still name a single entry point with `mafiahub.server` or
`mafiahub.client`, and list shipped files as `mafiahub.clientFiles`. They are
folded into `serverScripts`, `clientScripts` and `files` when the manifest is
read, with the single entry point going first. New resources should use the
lists.

</details>

## Start order and dependencies

The server starts resources in dependency order: everything in a resource's
`resourceDependencies` is started first. Between resources that do not depend
on each other, the order is not something to rely on.

```json title="resources/my-shop/package.json"
{
  "name": "my-shop",
  "mafiahub": {
    "serverScripts": ["server.js"],
    "resourceDependencies": [
      "my-economy",
      { "name": "my-discord-log", "optional": true }
    ]
  }
}
```

A dependency is a name, or an object with `name`, `version` and `optional`.
The `version` is recorded but not checked.

- A **required** dependency that is not installed stops the whole boot: the
  server logs `Failed to start resources: Resource 'my-shop' depends on missing
  resource 'my-economy'` and starts nothing at all. A dependency that is
  installed but fails to start fails only the resources that need it.
- An **optional** dependency is started first when it is there, and skipped
  with a warning when it is missing or fails.
- A dependency cycle also stops the boot.

`priority` looks like it should order resources, and the default gamemode even
sets it, but nothing reads it. Use `resourceDependencies`.

## Starting

When a resource starts, its scripts run top to bottom, then `resourceStart`
fires, and only then is the resource running. `resourceStart` goes to every
resource's handlers, not just the one starting, so compare the name. There is
no API that tells a script its own resource name; keep it in a constant, as the
default gamemode does with `RESOURCE`.

```ts
// server
const RESOURCE = "my-mode";

Events.on("resourceStart", async (name) => {
  if (name !== RESOURCE) return;
  await loadScores();
});

async function loadScores(): Promise<void> {
  // read a file, open a database, ...
}
```

Handlers may be `async`, and the server waits for them. A resource does not
count as running, and nothing that depends on it starts, until every
`resourceStart` handler has settled. If one rejects, or they take longer than
30 seconds, the start fails and everything the resource had registered is
cleaned up.

## Stopping

`resourceStop` fires first, while the resource can still use everything it
had. Like `resourceStart`, it goes to every resource. The server waits up to 10
seconds for async handlers, logs loudly if they reject or time out, and then
cleans up regardless.

When a resource stops, its dependents stop first, and the framework removes:

- its event handlers (`Events.on`, `once`, `onClient`, `onLocal`) and state
  bag `onChange` subscriptions,
- its `setTimeout` and `setInterval` timers,
- its message handlers and exports; pending `Messages.request` calls to or
  from it reject,
- on the server, the entities it spawned: props, horses, NPCs, markers and the
  rest,
- on a client, its web views, key binds, `Controls` holds, prop placement and
  native UI.

What it does not know about stays behind: listeners you added to your own
`EventEmitter` or to `process`, and timers created through `require('timers')`
instead of the globals. Remove those in `resourceStop`.

## Errors

An event handler that throws is caught: the error and its stack go to the
log, and the resource keeps running. An async handler that rejects does not
stop anything either; its error is collected into the promise the emitter gets
back (see [Events](../events/#async-handlers)).

`errorBehavior` is about the errors nothing catches, on the server: an
exception thrown from a timer callback, or a promise rejection nobody handles.
The server attributes it to the resource whose file appears in the stack.

| `errorBehavior` | After an uncaught error |
| --- | --- |
| `"stop"` | The resource is marked as failed. `ensure` it to bring it back. |
| `"restart"` | The resource is started again after a delay of a second or more. |
| `"continue"` | The error is logged and nothing else is done. |

:::caution
Whichever you choose, an uncaught error marks the resource as failed, and the
server despawns the entities it had spawned. Catch errors inside timer
callbacks and at the end of fire-and-forget promise chains rather than relying
on `errorBehavior`.
:::

## Reloading while the server runs

These console verbs work on a running server. They are covered in more detail
in [Server console commands](../../hosting-a-server/console/).

| Verb | Does |
| --- | --- |
| `start <name>` | Starts a stopped resource. |
| `stop <name>` | Stops a running resource. `stop` with no name shuts the server down. |
| `restart <name>` | Stops a running resource and starts it again with fresh code. |
| `ensure <name>` | Starts it if stopped, restarts it if running. The one to use while developing. |
| `refresh` | Rescans the resources folder for new resources, and leaves them stopped. |
| `refreshall` | Rescans, then reloads everything that was running. |

A restart re-reads `package.json` and your script files from disk, so edited
code and manifest changes both take effect. Dependents that were stopped along
with it start again afterwards. Connected players follow automatically: their
client downloads only the files that changed and restarts its half of the
resource in place.

:::note
Reloading relies on the CommonJS module cache, which is what a TypeScript
resource compiled to CommonJS uses. Modules you load with a dynamic `import()`
are not re-read on reload.
:::

There is no file watcher on a KCDC server: nothing reloads by itself when you
save. Rebuild, then type `ensure my-mode`.

## One runtime for everyone

All server resources share one Node.js runtime, and all client resources on a
machine share one script context. Each resource's modules are separate, so a
top-level `const` in one file does not leak into another resource. But
`globalThis` is shared, and so is the event bus. Prefix your event names with
your resource name (`"my-mode:round.start"`) and do not put things on
`globalThis`.

## Related

- [Write your first resource](../../getting-started/first-resource/)
- [Events](../events/)
- [Exports and messages between resources](../sharing/)
- [Show an HTML page (web views)](../../client-scripting/user-interface/web-views/)
