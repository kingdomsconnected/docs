---
title: Spawn and drive carts and wagons
description: Spawn the game's own carts and wagons with their horses in the shafts, seat players as driver or passenger, and react when they climb in and out.
sidebar:
  label: Carts and wagons
  order: 47
---

A cart is one of the game's own cart or wagon prefabs, built on every client
with its horses already hitched. A player climbs onto the bench and drives it
with the same keys they ride a horse with; a second player can ride in the
back.

```ts
const cart = Cart.spawn("wagon_b_covered", player.position, player.rotation);
cart.putPlayer(player, "driver");
```

## Spawn a cart

[`Cart.spawn`](../../reference/server/classes/Cart.md#spawn) takes four
optional arguments:

```ts
Cart.spawn(
  "wagon_b_covered",          // blueprint from Cart.blueprints(); omitted builds this one
  { x: 100, y: 200, z: 30 },  // where the front axle stands
  new Vector3(0, 0, 90),      // which way it faces: a Quaternion, or Euler angles in degrees
  0,                          // virtual world; omitted is the global one
);
```

- **Blueprint**: `Cart.blueprints()` names every prefab the game ships under
  `Prefabs/manmade/vehicles/`, covered wagons, open wagons, loaded ones and the
  two-wheeled `cart_b`.
- **Horses**: `cart.horseCount` says how many the chassis is harnessed for: 2
  for a wagon, 1 for the two-wheeler. `wagon_b_covered_empty` has nowhere to
  hitch one, so it can be sat in but never pulled.
- **Where**: put it on open, flat ground a few metres in front of the player,
  broadside on, so the benches face them. A cart spawned into a wall or a
  courtyard corner has nowhere to go. See [Positions and vectors](../../core-concepts/math/).

The horses belong to the cart. Nobody can mount or inspect them, and each
client hitches its own, so they are not [horses](../../npcs-and-animals/horses/)
a script can read. The `/cart` chat command comes from the default gamemode
(`src/server/commands/cart.ts`).

## Seats

A cart has two seats, the two the game animates a player's body in:

| Seat | Where | Who |
| --- | --- | --- |
| `driver` | The front bench | Holds the reins. Their client runs the cart. |
| `back` | The right rail of the bed | A passenger. |

A player gets in through the game's own prompt on the cart (the bench asks for
`driver`, the rail for `back`) or through a script:

```ts
const cart = Cart.spawn("wagon_b_covered", player.position, player.rotation);
cart.putPlayer(player, "back");    // false when it is taken or a handler refused it
cart.getOccupant("driver");        // the Player in a seat, or null
cart.seatOf(player);               // "driver", "back" or null
cart.driver;                       // the Player at the reins, or null
cart.removePlayer(player);         // they climb down; false when they are not in it
```

`putPlayer` takes a player out of any cart they were in first. Their own game
then walks them to the seat and plays the climb, and everyone else sees their
body climb in alongside them, in the same seat. The same goes for climbing
down, whether the player pressed the dismount key or a script called
`removePlayer`.

To decide who may sit where, return `false` from `cartEntering`:

```ts
Events.on("cartEntering", (cart, player, seat) => {
  if (seat === "driver" && !player.nickname.startsWith("Coachman")) return false;
});
```

## Driving

The driver steers with their horse-riding controls: forward and back to drive
on or back up, left and right to steer, and sprint to trot. They are whatever
the player has bound in the controls menu, so Z Q S D on an AZERTY keyboard and
the arrow keys work as they do on horseback. `cart.pace` reads what the driver
last asked for: `stand`, `walk`, `trot` or `reverse`.

The cart goes where a cart can go. It will not climb a step higher than about
half a metre or drive into a wall, and it pulls up at the end of the ground it
has. When the driver lets go it rolls on a couple of metres and stops, as the
game's own wagons do.

## How it works

The game only ever moves a cart along a path. So the driver's game lays a road
a metre at a time in front of the cart as the reins pull, and the cart's own
movement follows it: the game poses the wagon, turns its wheels, swings its
back half and walks its horses. The server checks every point of that road (a
step the reins could have made, no jumps) and hands it on to everyone who can
see the cart, and each of their games follows the same road at the same pace.
They are put back in step if they drift, and each comes to rest where the
driver's did.

| Who | Runs the cart |
| --- | --- |
| Nobody driving | The server. It stands where it was left. |
| A driver seated | The driver's client, until they leave the seat. |

See [Server vs client authority](../../core-concepts/authority/) for why the
driver's own client runs it.

## Move or remove a cart

```ts
const cart = Cart.spawn("cart_b", player.position, player.rotation);
cart.teleport(new Vector3(120, 340, 30));   // everyone in it goes too; false for a bad pose
Cart.getById(cart.id);                      // the same cart; null once it is gone
cart.destroy();                             // everyone in it climbs down first
Cart.destroyAll(player.virtualWorld);       // returns how many were removed
```

A cart destroyed with people in it is hidden at once, and removed once they are
off.

## Cart events

| Event | Arguments | When |
| --- | --- | --- |
| `cartSpawn` | `cart` | Right after a cart is created, by any script. |
| `cartDestroy` | `cart` | While it is being removed, after everyone is out. The handle still reads. |
| `cartEntering` | `cart`, `player`, `seat` | Before a player is seated; return `false` to refuse. Synchronous. |
| `cartEnter` | `cart`, `player`, `seat` | A player was given a seat. |
| `cartExit` | `cart`, `player`, `seat` | A player left a seat: their own climb down, `removePlayer`, a disconnect, or the cart being destroyed. |

`player` in `cartEnter` and `cartExit` is `Player | null`, so check it.

## Example: a wagon for each player

`/wagon` gives the caller a wagon in front of them with them at the reins, and
removes it when they leave.

```ts title="src/server/wagon.ts"
const owned = new Map<number, number>(); // player id -> cart id

Events.on("playerCommand", (player, command) => {
  if (command !== "wagon" || !player.ready) return;

  const previous = owned.get(player.id);
  if (previous !== undefined) Cart.getById(previous)?.destroy();

  const cart = Cart.spawn("wagon_b_covered", player.position, player.rotation, player.virtualWorld);
  owned.set(player.id, cart.id);
  cart.putPlayer(player, "driver");
});

Events.on("playerDisconnect", (player) => {
  const id = owned.get(player.id);
  if (id !== undefined) Cart.getById(id)?.destroy();
  owned.delete(player.id);
});
```

## Related

- [Spawn and manage horses](../../npcs-and-animals/horses/): a ridden horse works the same way, run by its rider.
- [Virtual worlds](../../core-concepts/virtual-worlds/): a cart only streams to players in its world.
- [Chat and /commands](../../players/chat/): the `playerCommand` event used above.
