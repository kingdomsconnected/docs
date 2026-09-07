---
title: Local player
sidebar:
  order: 40
---

Client resources can read the player at this machine and anyone else this client
can currently see. They cannot change either: the client API is read-only by
design.

## LocalPlayer

`LocalPlayer` is a global accessor, not a value. It reads `null` before the
session has spawned a body and again once the session ends, so read it fresh
rather than holding onto it:

```js
const me = LocalPlayer;
if (!me) return;

console.log(me.nickname, me.health, me.maxHealth);
console.log(me.position.x, me.position.y, me.position.z);
```

A resource that starts before the body exists will see `null` on its first read
and a handle a moment later, so poll it where you need it rather than caching
one at start-up.

## What a client can read

The whole readonly view of a body is the same on both sides — the same health,
stamina, conditions, attributes and skills the server sees, because both are
reading the same published snapshot. On top of that a client knows three things
the server does not:

```js
me.local        // true for the player at this machine
me.entityId     // the engine entity this body was spawned as, or 0
me.horseId      // network id of the horse being ridden, or 0
me.mounted      // whether they are in a saddle
```

`entityId` is not stable: the engine reuses entity ids, and it reads 0 across a
level load and before the puppet exists. Use `id` — the network id — for
anything you need to remember.

## Other players

The `Player` constructor takes a network id and gives a handle to anyone this
client already knows about:

```js
Events.on("mygm:highlight", (payload) => {
  const other = new Player(payload.id);
  console.log(`${other.nickname} at ${other.position.x}, ${other.position.y}`);
});
```

The constructor throws for an id this client has never seen, so wrap it when the
id came from elsewhere.

## Why there are no client-side verbs

The local player's own game is authoritative for its body, so a client-side
setter would work — which is exactly the problem. It would put the decision of
what a player may do to themselves inside a resource that player is running.

Everything that changes a player lives on the server's `Player`, where the
server can arbitrate it. A client that wants something asks for it:

```js
// client
Events.emitServer("mygm:request-horse");
```

```js
// server
Events.onClient("mygm:request-horse", (player) => {
  if (!player.ready) return;
  Horse.spawn(player.position, undefined, undefined, `${player.nickname}'s horse`);
});
```
