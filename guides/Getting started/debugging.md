---
title: Logs and debugging
description: Where each half's output goes, what happens when a script throws, and a checklist for when nothing happens at all.
sidebar:
  label: Logs and debugging
  order: 14
---

Most scripting bugs look the same in game: nothing happens. This page turns that into a log line that
says why.

## Find your output

| Written by | Appears in |
| --- | --- |
| `console.log` in a server script | The server console, and the files in `logs/` next to `KCDCServer` |
| `console.log` in a client script | The client log in `logs/` next to `KCDCLauncher.exe`, on that player's machine |
| A web page's `console.log` | The client log, and a `browserConsoleMessage` event if you want it in game |
| Runtime errors about your resource | That half's log, prefixed with your resource's name |

Every line is prefixed with the resource's name, so you can filter a busy log:

```text
[hello] hello is running
[hello] Event 'playerCommand' handler error: TypeError: Cannot read properties of null (reading 'nickname')
    at .../resources/hello/server/main.js:14:31
```

:::tip[TypeScript users]
Errors point at the compiled file in `dist/`, which stays close to your `.ts`. For exact positions, add
`"sourceMap": true` to `tsconfig.json` and read the `.map` next to each file.
:::

## Release client log name

The release client writes `KCDC.log`. Include this log and the client and server
revision numbers when reporting a problem.

## When a script throws

**Inside an event handler**, the throw is caught and logged with the event's name and a stack trace.
The next handler still runs, and your resource keeps going:

```js
Events.on("playerCommand", (player, command) => {
  if (command === "boom") throw new Error("on purpose");
});
// [hello] Event 'playerCommand' handler error: Error: on purpose
```

**Anywhere else** (a timer callback, an unawaited promise) it is a runtime error, logged as
`[<resource>] Runtime error: ...`. The resource is marked failed and its spawned entities are removed.
The `errorBehavior` field in `package.json` decides what happens next:

| `errorBehavior` | After an uncaught error |
| --- | --- |
| `"stop"` (the default) | The resource stays failed, with its handlers, timers and exports stopped. `ensure` it to bring it back. |
| `"restart"` | It starts again after 1, 2, then 4 seconds. After three restarts within five minutes it stays failed. |
| `"continue"` | The error is logged and the resource's scripts keep running. Its spawned entities are still removed. |

Since 1.6.10, a failed resource's runtime is dropped before it is cleaned up
or restarted, so nothing it registered keeps running and a restart does not
register its handlers twice. Client resources follow the same rule on the
machine of the player whose game raised the error. Catch errors yourself all
the same: search the server log for the resource's name and `Runtime error`,
fix the cause, then `ensure` it. See
[Handle errors](../../core-concepts/resources/#handle-errors).

## Check runtime versions

Both server and client scripts can read the running Framework and mod versions:

```ts
console.log(`KCDC ${ExecutionEnvironment.modVersion}, Framework ${ExecutionEnvironment.frameworkVersion}`);
```

Use these values when reporting a scripting problem. Match your declaration
package to the mod version; a type declaration alone does not add a method
to an older runtime.

## Related

- [Server vs client authority](../../core-concepts/authority/): the one idea that explains the rest of the API.
- [Events and handlers](../../core-concepts/events/): every event both halves can hear.
- [Resource manifest and lifecycle](../../core-concepts/resources/): `errorBehavior` and the other manifest fields.
- [Build a /command system](../../tutorials/command-system/): the first of the complete, end-to-end tutorials.
