---
title: Resource manifest and lifecycle
description: Write a resource's package.json, order resources with dependencies, run code on start and stop, choose what happens on errors, and reload while the server runs.
sidebar:
  label: Resources
  order: 21
---

A resource is a folder under the server's `resources/` directory with a
`package.json` in it. The server starts every resource it finds at boot; the
default gamemode, `kcdc-gamemode`, is one.

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

The resource's name is the manifest's `name`, not the folder's. Console
commands, `resourceStart`, `Exports` and web view URLs all use it.

## Manifest fields

| Field | Default | Meaning |
| --- | --- | --- |
| `name` | required | The resource's name. If two folders share one, only one loads and the log warns. |
| `version` | `"1.0.0"` | Shown in the logs. |
| `description`, `author` | empty | Informational. |
| `mafiahub.serverScripts` | `[]` | Run on the server, in the order written. Never sent to players. |
| `mafiahub.clientScripts` | `[]` | Run on every client, in the order written. Sent to players. |
| `mafiahub.sharedScripts` | `[]` | Run on both sides, **before** that side's own scripts. Sent to players. |
| `mafiahub.files` | `[]` | Sent to clients but not run: pages, styles, images, fonts. Globs allowed. Empty means the folder of your client scripts. Models, textures, clips and sounds for the game itself go in `stream/` and `replace/` instead; see [Custom assets](../custom-assets/). |
| `mafiahub.resourceDependencies` | `[]` | Resources that must start first. See below. |
| `mafiahub.exports` | `[]` | Names this resource may `Exports.register`. See [Share code between resources](../sharing/). |
| `mafiahub.errorBehavior` | `"stop"` | After an uncaught server error: `"stop"`, `"restart"` or `"continue"`. |
| `mafiahub.priority` | `0` | Accepted but unused. It does not order anything. |

Script paths are relative to the resource folder and take no globs, so they
run exactly in the order written.

:::caution
Everything in `clientScripts`, `sharedScripts` and `files` ends up on every
player's disk. Keep secrets, admin lists and credentials in server scripts.
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

Resources start in dependency order. Between resources that do not depend on
each other, the order is not something to rely on.

```json title="resources/my-shop/package.json"
{
  "name": "my-shop",
  "mafiahub": {
    "serverScripts": ["server.js"],
    "resourceDependencies": ["my-economy", { "name": "my-discord-log", "optional": true }]
  }
}
```

A dependency is a name, or an object with `name`, `version` (recorded, not
checked) and `optional`.

| Case | Result |
| --- | --- |
| Required dependency not installed | The whole boot stops: `Resource 'my-shop' depends on missing resource 'my-economy'`. Nothing starts. |
| Required dependency installed but fails to start | Only the resources that need it fail. |
| Optional dependency missing or failing | Skipped with a warning. |
| Dependency cycle | The whole boot stops. |

## Run code on start

A starting resource runs its scripts top to bottom, then `resourceStart` fires.
It fires for every resource, so compare the name. No API tells a script its
own name; keep it in a constant.

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

The server awaits async handlers. The resource is not running, and its
dependents do not start, until every handler settles. A rejection, or more
than 30 seconds, fails the start and cleans up what it registered.

## Stop a resource

`resourceStop` fires first, for every resource, while yours can still use
everything. The server waits up to 10 seconds for async handlers, logs a
rejection or timeout, then cleans up anyway. Dependents stop first.

The framework then removes:

- event handlers (`on`, `once`, `onClient`, `onLocal`) and state bag `onChange` subscriptions
- `setTimeout` and `setInterval` timers
- message handlers and exports; pending `Messages.request` calls to or from it reject
- on the server, every entity it spawned (props, horses, NPCs, markers...)
- on a client, its web views, key binds, `Controls` holds, prop placement and native UI

Remove anything else yourself in `resourceStop`: listeners on your own
`EventEmitter` or on `process`, and timers from `require('timers')`.

## Handle errors

An event handler that throws is caught and logged; the resource keeps running.
A rejected async handler rejects the emitter's promise (see
[Events](../events/#async-handlers)). `errorBehavior` covers what nothing
catches on the server: a throw in a timer callback, or an unhandled rejection.
It is charged to the resource whose file appears in the stack.

| `errorBehavior` | After an uncaught error |
| --- | --- |
| `"stop"` | The resource is marked failed. `ensure` it to bring it back. |
| `"restart"` | The resource starts again after a second or more. |
| `"continue"` | The error is logged; nothing else happens. |

:::caution
Whatever you choose, an uncaught error marks the resource failed and despawns
its entities. Catch errors in timer callbacks and at the end of
fire-and-forget promise chains.
:::

## Reload while the server runs

| Console command | Does |
| --- | --- |
| `start <name>` | Starts a stopped resource. |
| `stop <name>` | Stops a running resource. `stop` alone shuts the server down. |
| `restart <name>` | Stops a running resource and starts it with fresh code. |
| `ensure <name>` | Starts it if stopped, restarts it if running. Use this while developing. |
| `refresh` | Rescans the folder for new resources; leaves them stopped. |
| `refreshall` | Rescans, then reloads everything that was running. |

A restart re-reads `package.json` and scripts from disk, and restarts the
dependents it stopped. Connected clients download only changed files and
restart their half in place, and a changed model, material or texture in the
resource's [asset folders](../custom-assets/#edit-and-reload) updates on
screen. There is no file watcher: rebuild, then
`ensure my-mode`.

:::note
Reloading relies on the CommonJS module cache, which a TypeScript resource
compiled to CommonJS uses. Modules loaded with dynamic `import()` are not
re-read.
:::

## Share one runtime

All server resources share one Node.js runtime; all client resources on a
machine share one script context. Modules stay separate, but `globalThis` and
the event bus are shared. Prefix event names (`"my-mode:round.start"`) and
keep things off `globalThis`.

## Related

- [Write your first resource](../../getting-started/first-resource/): a manifest in practice
- [Events](../events/): `resourceStart`, `resourceStop` and handler errors
- [Share code between resources](../sharing/): `exports` and dependencies
- [Custom assets](../custom-assets/): models, textures, clips and sounds a resource ships
- [Console commands](../../hosting-a-server/run-a-server/#console-commands): the full console list
