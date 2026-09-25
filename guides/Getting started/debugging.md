---
title: Logs and debugging
description: Where each half's output goes, what happens when a script throws, and a checklist for when nothing happens at all.
sidebar:
  order: 15
---

Most scripting bugs look the same from inside the game: nothing happens. This
page is about turning "nothing happens" into a line in a log that says why.

## Where output goes

| Written by | Appears in |
| --- | --- |
| `console.log` in a server script | The server console, and the files in `logs/` next to `KCDCServer` |
| `console.log` in a client script | The client log in `logs/` next to `KCDCLauncher.exe`, on that player's machine |
| A web page's `console.log` | The client log too, and as a `browserConsoleMessage` event if you want it in game |
| Errors from the runtime about your resource | Wherever that half logs, prefixed with your resource's name |

Every line a resource logs is prefixed with its name, so you can filter a busy
log down to your own:

```text
[hello] hello is running
[hello] Event 'playerCommand' handler error: TypeError: Cannot read properties of null (reading 'nickname')
    at .../resources/hello/server/main.js:14:31
```

:::tip[TypeScript users]
The error points at the compiled file in `dist/`, not your `.ts`. The
compiled code stays close to what you wrote, so the line is usually easy to
find. If you want exact positions, add `"sourceMap": true` to your
`tsconfig.json` and read the `.map` next to each file.
:::

## What happens when a script throws

It depends on where the error escapes.

**Inside an event handler**, a throw is caught, logged with the event's name
and a stack trace, and the next handler still runs. Your resource keeps going:

```js
Events.on("playerCommand", (player, command) => {
  if (command === "boom") throw new Error("on purpose");
});
// [hello] Event 'playerCommand' handler error: Error: on purpose
```

**Anywhere else**, such as a timer callback or a promise nobody awaited, the
error is a *runtime error* for the resource. It is logged as
`[<resource>] Runtime error: ...`, the resource is marked as failed and the
entities it spawned are removed. The `errorBehavior` field in its
`package.json` is meant to decide what happens next:

| `errorBehavior` | Meant to |
| --- | --- |
| `"stop"` (the default) | Leave the resource stopped |
| `"restart"` | Restart it after a short delay, with a backoff if it keeps failing |
| `"continue"` | Log the error and carry on |

:::caution
Today this path is not reliable: after a runtime error, a "stopped" resource
can keep some handlers and timers running, and a restarted one can end up with
its handlers registered twice. Do not count on it. Catch errors yourself, and
if a resource starts behaving strangely, search the server log for its name
and `Runtime error`, fix the cause, then `ensure` it for a clean reload.
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

The runtime works out which resource an uncaught error belongs to from the
file path in its stack trace. That is one more reason to keep a resource's
folder name the same as the `name` in its `package.json`.

## When nothing happens

Work down this list. Each item is a real, common cause.

1. **Is the resource running?** Type `status` in the server console. A
   resource that failed to start, or stopped after an error, is listed as
   such. `ensure <name>` starts or reloads it.
2. **Is the event name right?** In plain JavaScript, `Events.on("playerSpawn",
   ...)` is a perfectly valid subscription to an event that never fires. In
   TypeScript, event names from the runtime autocomplete, and a typo in one
   of them is a compile error.
3. **Is the player ready?** A body that has just connected has no position
   yet: `player.position` reads as the world origin until `player.ready` is
   true. Spawning something "in front of" a player who is not ready puts it
   in the corner of the map.
4. **Did the client get your file?** A client script that is missing from
   `clientScripts`, or a module it imports that is not covered by `files`,
   never reaches the player. The client log says which file it could not
   load.
5. **Was the payload JSON?** `player.emit` expects a JSON string. A plain
   string such as `"hello"` is not valid JSON, and the client drops the event
   with an error in its log. Use `JSON.stringify(...)`.
6. **Was the client's event dropped?** The server drops an event whose
   payload is not valid JSON, and logs `Dropping client event`. A handler for
   it must be registered with `Events.onClient`, not `Events.on`.
7. **Did a key bind fire?** Binds do not fire while the chat box, a menu or a
   focused web view has the keyboard. Close them and try again.
8. **Are you holding an old handle?** A `Player` or `Horse` kept from an
   earlier event may describe someone who has left. Store ids and resolve
   them again with `Player.getById(id)`, which returns `null` when they are
   gone.

## See it in game

Two small tools save a lot of alt-tabbing:

- On the client, `Hud.showInfoText("...", 3000)` puts a line on screen for
  three seconds. It is the quickest way to check that a bind or an event
  arrived.
- On the server, `Chat.sendToPlayer(player, "...")` reports back to whoever
  typed the command. The default gamemode does this for every answer, and
  its F4 panel keeps a scrollback of them.

```js
// client
Events.on("resourceStart", (name) => {
  Hud.showInfoText(`${name} started`, 3000);
});
```

## Next

You have the whole beginner path. From here:

- [Server vs client authority](../../core-concepts/authority/), the one idea that explains
  the rest of the API.
- [Events](../../core-concepts/events/), every event both halves can hear.
- The [Tutorials](../../tutorials/command-system/), for complete features
  built end to end.
