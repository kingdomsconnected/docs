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
The `errorBehavior` field in `package.json` is meant to decide what happens next:

| `errorBehavior` | Meant to |
| --- | --- |
| `"stop"` (the default) | Leave the resource stopped |
| `"restart"` | Restart it after a short delay, backing off if it keeps failing |
| `"continue"` | Log the error and carry on |

:::caution
This path is not reliable today: a "stopped" resource can keep some handlers and timers running, and a
restarted one can register its handlers twice. Catch errors yourself. If a resource misbehaves, search
the server log for its name and `Runtime error`, fix the cause, then `ensure` it for a clean reload.
:::

Catch errors where you can handle them, especially in async code:

```js
Events.on("playerSpawned", async (player) => {
  try {
    const profile = await loadProfile(player.nickname);
    Chat.sendToPlayer(player, `Welcome back, ${profile.name}.`);
  } catch (error) {
    console.error(`could not load ${player.nickname}:`, error);
  }
});

async function loadProfile(name) {
  return { name };
}
```

The runtime finds which resource an uncaught error belongs to from the file path in its stack trace,
one more reason to keep the folder name equal to the `name` in `package.json`.

## When nothing happens

Work down this list:

| Check | What to look for |
| --- | --- |
| Is the resource running? | `status` in the server console lists failed or stopped resources. `ensure <name>` starts or reloads one. |
| Is the event name right? | In JavaScript, `Events.on("playerSpawn", ...)` subscribes to an event that never fires. TypeScript makes the typo a compile error. |
| Is the player ready? | `player.position` reads as the world origin until `player.ready` is true, so spawning "in front of" them lands in the map corner. |
| Did the client get your file? | A script missing from `clientScripts`, or an import not covered by `files`, never reaches the player. The client log names the file. |
| Was the server's payload JSON? | `player.emit` needs a JSON string. A plain `"hello"` is dropped by the client with a log error. Use `JSON.stringify(...)`. |
| Was the client's event dropped? | The server drops a client payload that is not valid JSON and logs `Dropping client event`. Handle client events with `Events.onClient`, not `Events.on`. |
| Did a key bind fire? | Binds do not fire while chat, a menu or a focused web view has the keyboard. |
| Is the handle stale? | A `Player` or `Horse` kept from an earlier event may be gone. Store ids and resolve with `Player.getById(id)`, which returns `null` for someone who left. |

## Show it in game

- On the client, `Hud.showInfoText("...", 3000)` shows a line for three seconds: the quickest check
  that a bind or event arrived.
- On the server, `Chat.sendToPlayer(player, "...")` reports back to whoever typed a command. The
  default gamemode's F4 panel keeps a scrollback of these.

```js
// client
Events.on("resourceStart", (name) => {
  Hud.showInfoText(`${name} started`, 3000);
});
```

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
