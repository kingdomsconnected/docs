---
title: Write your first resource
description: Write a small resource in plain JavaScript, load it without restarting, and make its two halves talk.
sidebar:
  order: 12
---

This page builds a resource called `hello` in plain JavaScript, with no build
step: a welcome message, a `/roll` command, a key that shows your health, and
a request from the client that the server answers. Each step works on its own,
so you can stop after any of them.

You need a server that starts, from [Run the default
gamemode](../run-the-gamemode/). Leave the gamemode where it is: resources live
side by side, and yours will not disturb it.

## 1. Make the folder

A resource is a folder under the server's `resources/` with a `package.json`
that says which scripts to run.

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

`name` is the resource's name everywhere: in the console, in logs and in the
events that mention it. Keep it the same as the folder name, lowercase, with
dashes if you need them.

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

Everything here is a global. There is nothing to import: `Events`, `Chat`,
`Player`, `Horse` and the rest of the [Server API](../../reference/server/index.md)
are simply there.

Two events do all the work:

- `playerSpawned` fires once a joining player is standing in the world, which
  is the first moment a chat line is worth sending them. The earlier
  `playerConnect` fires while they are still on the loading screen.
- `playerCommand` fires for every chat line that starts with `/`. The command
  arrives without the slash, and `args` is the rest of the line split on
  spaces.

:::note
Every resource sees every command. The default gamemode answers the ones it
knows and replies "Unknown command" to the rest, so `/roll` will get both
your answer and that message. That is expected while both run.
[Structure a larger resource](../project-structure/) shows how to share
commands between resources politely.
:::

## 3. Load it

The server looked for resources when it started, so it does not know about
`hello` yet. You do not need to restart it. Type into the **server console**:

```sh title="Server console"
refresh
start hello
```

`refresh` looks for new resource folders, and `start` runs one. You should
see:

```text
[hello] hello is running
```

Join the server (or type `/roll 20` if you are already in) and you will get
the welcome and the dice.

From now on, after every edit, one line reloads it:

```sh title="Server console"
ensure hello
```

## 4. Add a client half

A client script runs inside each player's game. It cannot change the world,
but it can read what the player sees, bind keys and draw UI.

1. Add the client script to the manifest. `files` tells the server which
   files to send to players:

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

3. Reload with `ensure hello`. Connected players receive the new files
   straight away. Press **F8** in game.

`LocalPlayer` is the player at this machine. It is `null` for a moment after
connecting, before their body exists, which is why the handler checks it on
every press instead of reading it once at the top of the file.

:::caution[Keys the client already uses]
F4 belongs to the default gamemode's panel, and F5, F6, F7 and F9 to the
client itself. Pick something else for your own binds. [Key binds and controls](../../client-scripting/input/) lists every key name.
:::

## 5. Make the halves talk

The client knows only what its player can see. For anything else, it asks the
server. Here, **F10** asks the server who is online, and the server answers
that one player.

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

Three details matter here, and they are the same in every resource:

- **Events from clients have their own handler table.** `Events.onClient`
  hears only what clients send with `Events.emitServer`. A client can never
  trigger an `Events.on` handler on the server, so it cannot fake
  `playerSpawned` or poke at another resource.
- **`player.emit` takes a JSON string.** The client parses it before your
  handler runs, so `names` arrives as an array. Sending a plain string that is
  not JSON gets the event dropped.
- **Prefix your event names** with the resource name (`hello:who`). Every
  resource shares one event bus, and a name like `update` will collide.

[Send data between server and client](../../core-concepts/networking/) covers payloads,
validation and broadcasting to everyone.

## What you have

```text
resources/hello/
  package.json
  server/main.js
  client/main.js
```

A resource with a command, a key bind and a round trip, reloaded without ever
restarting the server. That is the whole shape of every resource, however big.

## Next

Plain JavaScript is fine for a file like this. Once a resource grows past a
couple of hundred lines, types start paying for themselves: your editor
catches `player.nickame` before your players do. [Use TypeScript](../typescript/) turns `hello` into a TypeScript project.
