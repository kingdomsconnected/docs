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
- on the server, every entity its scripts created: props, ground items,
  markers, effects, lights, NPCs, horses, doors, smart objects and the rest.
  The objects a [world export](../../world/world-resources/) loads belong to
  the server and stay.
- on a client, its web views, key binds, `Controls` holds, prop placement and native UI

On the server, the resource's [runtime](#each-server-resource-has-its-own-runtime)
goes too, with everything it left running: timers of any kind, sockets and
HTTP servers, worker threads, and files opened with `fs.open()`. On a client,
resources share one script context, so remove listeners on your own
`EventEmitter` objects yourself in `resourceStop`.

## Handle errors

An event handler that throws is caught and logged; the resource keeps running.
A rejected async handler rejects the emitter's promise (see
[Events](../events/#async-handlers)). `errorBehavior` covers what nothing
catches: a throw in a timer callback, or an unhandled rejection. On the server
it is charged to the resource whose runtime raised it. Since 1.6.10 the same
holds for client resources, on the machine of the player whose game raised it.

| `errorBehavior` | After an uncaught error |
| --- | --- |
| `"stop"` | The resource is marked failed and its runtime is dropped: its handlers, timers and exports stop. `ensure` it to bring it back. |
| `"restart"` | As `"stop"`, then the resource starts again after 1, 2, then 4 seconds. After three restarts within five minutes it stays failed. |
| `"continue"` | The error is logged; the resource keeps running. |

:::caution
Whatever you choose, an uncaught error marks the resource failed and despawns
the entities it created, as a stop does. Catch errors in timer callbacks and at the end of
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
On the server, every start runs in a fresh runtime, so every file is read
again, modules loaded with `import()` included. Client scripts are CommonJS
only; a client restart evicts the resource's modules from its cache.
:::

## Each server resource has its own runtime

Every server resource runs in a Node.js environment of its own, with its own
globals, module cache and event loop. What one resource puts on `globalThis`
is invisible to the others, and a resource that requires another's file gets
its own copy of that module. Values passed between resources through events,
exports and messages are copied; see
[What crosses between resources](../sharing/#what-crosses-between-resources).

- Every runtime runs on the server's one script thread, so a resource that
  blocks still blocks the others. Move long work to a worker thread, which
  stops with its resource.
- `process.chdir()` throws `ERR_WORKER_UNSUPPORTED_OPERATION`, since process
  state belongs to the server.
- `process.exit()` stops the resource that calls it, not the server. Handlers
  on `process.on("exit")` run only then, never when the resource is stopped:
  use `resourceStop`.

Client resources on a machine still share one script context: modules stay
separate, but `globalThis` is shared. On both sides every resource shares the
event bus, so prefix event names (`"my-mode:round.start"`).

## Use Node.js and npm packages

The server runs Node.js 26.12.1 (since 1.7.2) with its full API: `fs`, `net`,
`http`, `worker_threads` and the rest. A server script loads npm packages from
its resource's own `node_modules`, as Node does:

```json title="resources/my-mode/package.json"
{
  "name": "my-mode",
  "dependencies": { "zod": "^4.0.0" },
  "devDependencies": { "typescript": "^5.9.2", "@kingdomsconnected/types": "1.7.2" },
  "mafiahub": { "serverScripts": ["dist/server/index.js"] }
}
```

- Put what the server loads in `dependencies` and build tools in
  `devDependencies`. `npm install --omit=dev` in the resource folder installs
  only the first.
- A resource built elsewhere needs its `node_modules` copied with it. The
  [container image](../../hosting-a-server/containers/) has no Node.js or npm.
- Native addons built on Node-API load on Windows and Linux servers (on
  Windows since 1.6.10). An addon is compiled for one operating system, so
  install the packages on the same system as the server.
- Client scripts cannot load packages; see
  [Use packages from npm](../../getting-started/project-structure/#use-packages-from-npm).

## Related

- [Write your first resource](../../getting-started/first-resource/): a manifest in practice
- [Events](../events/): `resourceStart`, `resourceStop` and handler errors
- [Share code between resources](../sharing/): `exports` and dependencies
- [Custom assets](../custom-assets/): models, textures, clips and sounds a resource ships
- [Console commands](../../hosting-a-server/run-a-server/#console-commands): the full console list
