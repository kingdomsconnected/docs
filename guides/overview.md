---
title: Overview
sidebar:
  order: 1
---

Kingdoms Connected resources run JavaScript in one of two environments:

- **Server resources** run in Node.js and own the world every player shares — who is connected, which horses exist, who is riding what.
- **Client resources** run in a sandboxed V8 context on each player's machine and can read what that machine can see.

Use the navigation to browse the globals available in each environment. The same declarations that generate this reference can be loaded by an editor for autocomplete and type checking.

## Who decides what

Kingdom Come: Deliverance II keeps a player's whole state — health, stamina, skills, what they are wearing, where they are standing — on their own machine, in tables the server does not have. So the owning client is authoritative for its player's body, and the server is authoritative for everything between players.

That split runs through the entire API and explains most of its shape:

- Everything you can **read** about a player is a snapshot their client published. `player.health` is the number their game last reported, not a number the server maintains.
- Everything you can **do** to a player is a **request sent to their client**. `player.teleport(...)` returns whether the request went out, not whether the player has moved; the new position arrives with their next update.
- Horses are the other way round. The server creates them and owns them while they stand idle, and hands authority to whoever climbs into the saddle.

> **Note:** this is why there are no setters for health or stamina. A server-side write would be overwritten by the owner's next capture a frame later, so the API does not offer one rather than offering one that silently does nothing.

## Server example

```js
Events.on("playerConnect", (player) => {
  Chat.sendToAll(`${player.nickname} joined.`);
});

Events.on("playerCommand", (player, command) => {
  if (command !== "horse") return;

  // In front of the player, on the ground plane.
  const horse = Horse.spawn(player.position, undefined, undefined, `${player.nickname}'s horse`);
  Chat.sendToPlayer(player, `Spawned horse ${horse.id}.`);
});
```

## Client example

```js
Events.on("resourceStart", () => {
  const me = LocalPlayer;
  if (!me) return; // null until this client has a body

  console.log(`I am ${me.nickname}, ${me.health}/${me.maxHealth} health`);
});
```

`LocalPlayer` is an accessor, not a value. It reads `null` before the session spawns a body and again once the session ends, so read it fresh each time rather than holding onto it.

## Where this reference comes from

Every function, property and event on this site is generated from the mod's own binding registrations. When the runtime installs `player.teleport`, it records that name, signature and description in the same call — so the reference cannot drift from the code, and an undocumented binding is a build failure rather than a gap nobody notices.
