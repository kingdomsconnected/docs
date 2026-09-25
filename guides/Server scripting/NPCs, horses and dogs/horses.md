---
title: Spawn and manage horses
description: Spawn, name, read and remove rideable horses, and react when players mount and dismount.
sidebar:
  order: 50
---

A horse exists because a script asked for one. The server owns it while it
stands idle, and hands authority to whoever climbs into the saddle, so a ridden
horse moves under its rider's own simulation. You spawn it, name it, read who
is riding it, and remove it when you are done.

```ts
const horse = Horse.spawn(player.position, player.rotation, undefined, "Pebbles");
console.log(`Spawned ${horse.toString()}`);
```

That puts a riding horse called Pebbles where the player stands, facing the way
they face.

## Spawning

[`Horse.spawn`](../../../reference/server/classes/Horse.md#spawn) takes four
arguments, all optional:

```ts
Horse.spawn(
  { x: 100, y: 200, z: 30 },  // position: a Vector3 or a plain { x, y, z }
  new Vector3(0, 0, 0),       // rotation: a Quaternion, or Euler angles in degrees
  undefined,                  // soul GUID; omitted spawns the generic riding horse
  "Pebbles",                  // the name every client shows
);
```

- **Position.** Components you leave out default to zero, so an empty call puts
  the horse at the world origin. You almost always want a position.
- **Rotation.** A `Quaternion`, or a `Vector3` of Euler angles in degrees.
  Passing `player.rotation` makes the horse face the way the player faces. For
  "a few metres in front of the player", see
  [Positions, rotations and vectors](../../../core-concepts/math/).
- **Soul.** A soul GUID from the game's own tables decides what the animal is
  and what coat it wears. Leave it out for the generic riding horse.
- **Name.** It rides along with the spawn itself, so a player who joins later
  sees the horse already named. Passing it here is better than assigning it
  afterwards for that reason.

There is no virtual world argument. Move a fresh horse into one with
`horse.setVirtualWorld(world)`; see [Virtual worlds](../../../core-concepts/virtual-worlds/).

:::note
The `/horse` command players type in chat comes from the default gamemode
(`src/server/commands/horse.ts`), not from the server. It spawns a horse four
metres in front of the caller with the same `Horse.spawn` shown here.
:::

## Reading a horse

```ts
horse.soul;               // the GUID it was spawned against; never changes
horse.name;               // "" means the name its soul carries stands
horse.inventoryCapacity;  // 0 until a client has reported it
horse.mounted;            // whether anyone is in the saddle
horse.rider;              // the Player riding it, or null
horse.riderId;            // that player's id, or 0
horse.position;           // where it is, like any entity
```

`inventoryCapacity` is 0 until some client reports it. The engine derives it
from the animal's soul, its buffs and its saddlebags, so only a machine running
the game can answer.

From the other side, `player.horse` is the horse a player is riding, or `null`
when they are on foot.

## Renaming

```ts
horse.name = "Rocinante";
horse.name = ""; // back to the name its soul carries
```

:::caution
A rider keeps the name the horse had when they mounted, until they dismount.
Everyone else sees the new name straight away.
:::

## Taking the rider off

```ts
horse.rearAndThrowDown();       // the game's own rear, throwing the rider off
horse.pullDownRider(target);    // target drags the rider out of the saddle
const rider = horse.dismountRider(); // lifts them out; returns them, or null
```

The first two are the game's own actions, played on every client, so what
everyone watches is the real animation rather than a pose the server made up.
Both return `false` when nobody is riding.

`dismountRider()` and `player.dismount()` do the same thing from either end: take
the rider out and hand the animal back to the server. `player.dismount()`
returns the horse, or `null` if the player was on foot.

## Mounting and dismounting events

| Event | Arguments | When |
| --- | --- | --- |
| `horseSpawn` | `horse` | Right after a horse is created, by any script. |
| `horseDestroy` | `horse` | While it is being removed. The handle still reads. |
| `horseMount` | `horse`, `player` | After a player is in the saddle and their client owns the horse. |
| `horseDismount` | `horse`, `player` | After a rider leaves, including on disconnect or when the horse is destroyed. |

`player` in the last two is typed `Player | null`, so check it.

```ts
Events.on("horseMount", (horse, rider) => {
  if (rider) console.log(`${rider.nickname} is riding ${horse.name || horse.id}`);
});
```

## Finding horses again

```ts
for (const each of Horse.all()) {
  if (!each.mounted) each.destroy();
}

const again = Horse.getById(horse.id); // null once it is gone
```

Store the id, not the handle, when you need a horse later. `horse.destroy()`
removes it from every client after raising `horseDestroy`.

## Example: one horse per player

Give each player their own horse on a command, replace it if they ask again,
and remove it when they leave.

```ts title="src/server/stable.ts"
const owned = new Map<number, number>(); // player id -> horse id

function horseOf(playerId: number): Horse | null {
  const horseId = owned.get(playerId);
  return horseId === undefined ? null : Horse.getById(horseId);
}

Events.on("playerCommand", (player, command) => {
  if (command !== "stable") return;
  if (!player.ready) {
    Chat.sendToPlayer(player, "Wait until you have spawned.");
    return;
  }

  horseOf(player.id)?.destroy();
  const horse = Horse.spawn(player.position, player.rotation, undefined, `${player.nickname}'s horse`);
  owned.set(player.id, horse.id);
});

Events.on("playerDisconnect", (player) => {
  horseOf(player.id)?.destroy();
  owned.delete(player.id);
});
```

The map holds ids and resolves them on demand, because a horse can be destroyed
by something else in the meantime (another resource, or `Horse.all()` cleanup
like the one above). `getById` returns `null` for those, and the `?.` skips
them.

## Related

- [Dogs](../dogs/), the other animal a player can own.
- [Server vs client authority](../../../core-concepts/authority/), for why a ridden horse
  belongs to its rider's client.
