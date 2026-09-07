---
title: Getting started
sidebar:
  order: 10
---

A resource is a folder under the server's `resources/` directory with a
`package.json` that names its entry points.

## A minimal resource

```
resources/
  my-gamemode/
    package.json
    server/main.js
```

```json
{
  "name": "my-gamemode",
  "version": "1.0.0",
  "mafiahub": {
    "serverScripts": ["server/main.js"],
    "priority": 10
  }
}
```

```js
// server/main.js
console.log("my-gamemode starting");

Events.on("playerConnect", (player) => {
  Chat.sendToAll(`${player.nickname} joined.`);
});

Events.on("playerDisconnect", (player) => {
  Chat.sendToAll(`${player.nickname} left.`);
});
```

Start the server. The resource is discovered, its entry point runs, and
`resourceStart` fires once it is live.

## Adding a client half

Client scripts are listed the same way and run on each connected machine:

```json
{
  "mafiahub": {
    "serverScripts": ["server/main.js"],
    "clientScripts": ["client/main.js"]
  }
}
```

Client scripting starts on connect, not on game launch, so a client script
cannot assume a body exists the moment it runs.

## Talking between the two halves

The server sends to one player's client with `player.emit`, which takes a JSON
string:

```js
// server
player.emit("mygm:welcome", JSON.stringify({ text: `Welcome, ${player.nickname}` }));
```

```js
// client
Events.on("mygm:welcome", (payload) => {
  console.log(payload.text);
});
```

The payload is parsed on the client, so handlers receive an object rather than
the string.

## Ordering

`priority` in the manifest decides which resource starts first. A library
resource that others import should sit above them.
