---
title: Write your first resource
description: Write a small resource in plain JavaScript, load it without restarting, and make its two halves talk.
sidebar:
  label: Your first resource
  order: 11
---

Build a resource called `hello` in plain JavaScript, with no build step: a welcome message, a `/roll`
command, a key that shows your health, and a question the server answers. Each step works on its own.

You need a running server from [Install and run a server](../install/). Leave the gamemode where it is;
resources live side by side.

## 1. Make the folder

A resource is a folder under the server's `resources/` with a `package.json` that says which scripts
to run.

```text
server/
  resources/
    kcdc-gamemode/
    hello/
      package.json
      server/main.js
```

```json title="resources/hello/package.json"
{
  "name": "hello",
  "version": "1.0.0",
  "mafiahub": {
    "serverScripts": ["server/main.js"]
  }
}
```

`name` identifies the resource in the console, logs and events. Keep it the same as the folder name:
lowercase, with dashes if needed.

## 2. Write the server half

```js title="resources/hello/server/main.js"
console.log("hello is running");

Events.on("playerSpawned", (player) => {
  Chat.sendToPlayer(player, `Hello, ${player.nickname}. Try /roll.`);
});

Events.on("playerCommand", (player, command, args) => {
  if (command !== "roll") return;

  const sides = Number(args[0] ?? 6);
  if (!Number.isInteger(sides) || sides < 2 || sides > 1000) {
    Chat.sendToPlayer(player, "Usage: /roll [sides], from 2 to 1000.");
    return;
  }

  const result = 1 + Math.floor(Math.random() * sides);
  Chat.sendToAll(`${player.nickname} rolls a d${sides}: ${result}`);
});
```

There is nothing to import: `Events`, `Chat`, `Player` and the rest of the
[Server API](../../reference/server/index.md) are globals.

- `playerSpawned` fires once a joining player stands in the world, the first moment a chat line
  reaches them. `playerConnect` fires earlier, on the loading screen.
- `playerCommand` fires for every chat line starting with `/`. `command` has no slash; `args` is the
  rest of the line split on spaces.

:::note
Every resource sees every command. The default gamemode replies "Unknown command" to ones it does not
know, so `/roll` gets both answers while both run.
[Structure a larger resource](../project-structure/#living-next-to-other-resources) covers this.
:::

## 3. Load it

No restart needed. Type into the **server console**:

```sh title="Server console"
refresh
start hello
```

`refresh` finds new resource folders; `start` runs one. You should see:

```text
[hello] hello is running
```

Join (or type `/roll 20` if you are in already). After every edit, reload with:

```sh title="Server console"
ensure hello
```

## 4. Add a client half

A client script runs in each player's game. It cannot change the world, but it can read what the
player sees, bind keys and draw UI.

1. Add it to the manifest. `files` lists what the server sends to players:

   ```json title="resources/hello/package.json" ins={6-7}
   {
     "name": "hello",
     "version": "1.0.0",
     "mafiahub": {
       "serverScripts": ["server/main.js"],
       "clientScripts": ["client/main.js"],
       "files": ["client/**"]
     }
   }
   ```

2. Write it:

   ```js title="resources/hello/client/main.js"
   Key.bind("f8", "down", () => {
     const me = LocalPlayer;
     if (!me) return;
     Hud.showInfoText(`${Math.round(me.health)} / ${Math.round(me.maxHealth)} health`, 3000);
   });
   ```

3. Run `ensure hello`. Connected players get the new files at once. Press **F8** in game.

`LocalPlayer` is `null` for a moment after connecting, before the body exists, so read it on each
press rather than once at the top of the file.

:::caution[Keys already in use]
F4 is the default gamemode's panel; F5, F6, F7 and F9 belong to the client. Pick other keys.
[Key binds and controls](../../client-scripting/input/) lists every key name.
:::

## 5. Make the halves talk

The client only knows what its player can see; for anything else it asks the server. Here **F10** asks
who is online, and the server answers that one player.

```js title="resources/hello/client/main.js" ins={8-15}
Key.bind("f8", "down", () => {
  const me = LocalPlayer;
  if (!me) return;
  Hud.showInfoText(`${Math.round(me.health)} / ${Math.round(me.maxHealth)} health`, 3000);
});

// Ask the server; it answers with an event of our own.
Key.bind("f10", "down", () => {
  Events.emitServer("hello:who");
});

Events.on("hello:online", (names) => {
  Hud.showInfoText(`Online: ${names.join(", ")}`, 5000);
});
```

```js title="resources/hello/server/main.js" ins={1-6}
// A client asked. The first argument is always the player who sent it.
Events.onClient("hello:who", (sender) => {
  const names = Player.all().map((player) => player.nickname);
  sender.emit("hello:online", JSON.stringify(names));
});

console.log("hello is running");
// ...the rest as before
```

Three rules hold in every resource:

- **Client events have their own handlers.** `Events.onClient` hears only what clients send with
  `Events.emitServer`. A client can never trigger a server `Events.on` handler, so it cannot fake
  `playerSpawned`.
- **`player.emit` takes a JSON string.** The client parses it, so `names` arrives as an array. A
  string that is not JSON gets the event dropped.
- **Prefix event names** with the resource name (`hello:who`). All resources share one event bus.

## What you have

```text
resources/hello/
  package.json
  server/main.js
  client/main.js
```

A command, a key bind and a round trip, reloaded without restarting the server. Every resource has
this shape, however big.

## Related

- [Use TypeScript](../typescript/): the next step; turns `hello` into a typed project so your editor catches `player.nickame`.
- [Send data between server and client](../../core-concepts/networking/): payloads, validation, broadcasting.
- [Events and handlers](../../core-concepts/events/): every event both halves can hear.
- [Resource manifest and lifecycle](../../core-concepts/resources/): every `package.json` field.
