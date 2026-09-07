---
title: Players
sidebar:
  order: 30
---

A `Player` handle wraps the body a connection controls. It resolves the live
entity on every read, so a handle to someone who has left reads as gone rather
than pointing at freed memory.

## Reading a player

Everything readable is a snapshot the owning client published, in the game's own
units:

```js
Events.on("playerCommand", (player, command) => {
  if (command !== "status") return;

  Chat.sendToPlayer(player, `Health ${player.health}/${player.maxHealth}`);
  Chat.sendToPlayer(player, `Stamina ${player.stamina}/${player.maxStamina}`);
  Chat.sendToPlayer(player, `Strength ${player.strength}, agility ${player.agility}`);
  Chat.sendToPlayer(player, `Fencing ${player.skills.fencing}`);
});
```

`skills` and `relativeSkills` come back as objects with all nine named skills,
because the snapshot carries them together — reading them one at a time would
suggest they can be read one at a time.

Two flags gate the rest:

- `player.ready` — the body has both a pose and a character. False for the first
  moments of a connection, and everything positional is meaningless until it is
  true.
- `player.alive` / `player.canAct` — alive is health above zero; canAct also
  requires conscious and not asleep.

## Acting on a player

Every verb is a request to the owning client, and returns whether it went out:

```js
// Somewhere in Kuttenberg, with a label the client shows in its own panel.
if (!player.teleport({ x: 100, y: 200, z: 30 }, "Kuttenberg")) {
  console.warn("teleport request could not be sent");
}

// The GUID or the exact name from the game's item tables.
player.giveItem("Sword", 1);
player.giveItem("fc0e6251-b314-4398-b83f-3a66a52961ee", 2);
```

`teleport` takes a `Vector3` or any object with `x`, `y` and `z`, so a plain
literal works.

> **Authority:** neither call writes anything server-side. The player moves, or
> the item appears, when their own game acts on the request — and the result
> comes back with their next update. A `true` return means the request was sent.

The connection-level verbs are immediate, because they are about the connection
rather than the body:

```js
player.kick("Idling too long");
player.emit("mygm:event", JSON.stringify({ ... }));
console.log(player.ping, player.ip, player.steamId);
```

## Enumerating

```js
for (const player of Player.all()) { /* ... */ }

const player = Player.getById(id); // null when nobody has that id
```

`Player.all()` includes players whose body is not `ready` yet.

## Riding

A player's mount is readable from either side of the pair:

```js
if (player.mounted) {
  console.log(`riding horse ${player.horse.id}, called ${player.horse.name}`);
  player.dismount(); // returns the horse, or null
}
```

Seating a player on a horse is not available: mounting is initiated by the
player's own client, and there is no server-to-client request for it yet.
