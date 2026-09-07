---
title: Horses
sidebar:
  order: 31
---

Horses are server-owned, unlike players: one exists because a script or a
command asked for it. The server owns a horse while it stands idle and hands
authority to whoever climbs into the saddle, so a ridden horse moves under its
rider's own simulation.

## Spawning

```js
const horse = Horse.spawn(
  { x: 100, y: 200, z: 30 },     // position; a Vector3 or a plain object
  undefined,                      // rotation: a Quaternion, or Euler degrees
  undefined,                      // soul GUID; omitted spawns a riding horse
  "Pebbles",                      // name every client shows
);
```

Every argument is optional. Omitting the soul spawns `animal_horse`, the generic
riding horse of the game's tables; a different GUID from those tables spawns a
different animal, with its own coat.

The name rides the construction snapshot, so a player who joins later sees the
horse already named. Passing it to `spawn` is better than assigning afterwards
for that reason.

## Reading

```js
horse.soul               // the GUID it was spawned against — immutable
horse.name               // "" when nobody has renamed it
horse.inventoryCapacity  // 0 until a client has reported it
horse.mounted            // whether anyone is in the saddle
horse.rider              // the Player, or null
horse.riderId            // that player's id, or 0
horse.position           // world position
```

`inventoryCapacity` is 0 until some client reports it, because the engine
recomputes it from the animal's soul, its buffs and its saddlebags on every
read — only a machine running the game can answer it.

## Renaming

```js
horse.name = "Rocinante";
horse.name = "";            // back to the name its soul carries
```

> **Note:** a rider keeps the name the horse had when they mounted, until they
> dismount. The channel that carries field updates is withheld from an entity's
> owner, and the only way to push past that would warp the animal's pose.

## Acting

```js
horse.rearAndThrowDown();      // the game's own rear animation, throwing the rider
horse.pullDownRider(attacker); // attacker drags the rider out of the saddle
horse.dismountRider();         // takes the rider out, returns them or null
horse.destroy();               // despawns everywhere, after emitting horseDestroy
```

The first two are the game's own actions, played out by every client, rather
than poses stated by the server — so what everyone watches is the real
animation. Both return `false` when nobody is riding.

## Enumerating

```js
for (const horse of Horse.all()) { /* ... */ }

const horse = Horse.getById(id); // null when no live horse has that id
```

## A worked example

Give every player a horse when they are ready for one, and clean up after them:

```js
const horses = new Map(); // player id -> horse id

// getById wants a number and throws on anything else, so resolve through this
// rather than handing it whatever the map returned.
const ownedHorse = (playerId) => {
  const horseId = horses.get(playerId);
  return horseId === undefined ? null : Horse.getById(horseId);
};

Events.on("playerCommand", (player, command) => {
  if (command !== "horse" || !player.ready) return;

  ownedHorse(player.id)?.destroy();

  const horse = Horse.spawn(player.position, undefined, undefined, `${player.nickname}'s horse`);
  horses.set(player.id, horse.id);
});

Events.on("playerDisconnect", (player) => {
  ownedHorse(player.id)?.destroy();
  horses.delete(player.id);
});
```

The horse is spawned at the player's own position, which is close enough to
walk to. Placing it a couple of metres in front means rotating the player's
facing yourself; the built-in `/horse` command does exactly that.
