---
title: Spawn and manage horses
description: Spawn, name, read, equip and remove rideable horses, and react when players mount and dismount.
sidebar:
  label: Horses
  order: 53
---

A horse exists because a script spawned it. The server owns it while it stands
idle; whoever climbs into the saddle gets authority over it, so a ridden horse
moves under its rider's own simulation.

```ts
const horse = Horse.spawn(player.position, player.rotation, undefined, "Pebbles");
console.log(`Spawned ${horse.toString()}`);
```

## Spawn a horse

[`Horse.spawn`](../../reference/server/classes/Horse.md#spawn) takes five
optional arguments:

```ts
Horse.spawn(
  { x: 100, y: 200, z: 30 },  // position: a Vector3 or a plain { x, y, z }
  new Vector3(0, 0, 0),       // rotation: a Quaternion, or Euler angles in degrees
  "pebbles",                  // breed from Horse.breeds(), or a soul GUID
  "Pebbles",                  // the name every client shows
  {},                         // gear; {} spawns it bare
);
```

- **Position**: missing components are zero, so always pass one.
- **Rotation**: `player.rotation` faces the way the player faces. For "a few
  metres in front", see [Positions and vectors](../../core-concepts/math/).
- **Soul**: decides the animal and its coat. Omitted spawns the generic riding
  horse; `Horse.breeds()` lists the named ones, and so does
  [Horse breeds](../../resources/horse-breeds/).
- **Name**: passing it here, rather than assigning later, means late joiners
  see it named.
- **Gear**: omitted, it wears the game's own tack. See [Change its gear](#change-its-gear).

There is no virtual world argument; call `horse.setVirtualWorld(world)` (see
[Virtual worlds](../../core-concepts/virtual-worlds/)). The `/horse` chat
command comes from the default gamemode (`src/server/commands/horse.ts`).

## Read a horse

```ts
horse.soul;               // the GUID it was spawned against; never changes
horse.name;               // "" means the name its soul carries stands
horse.health;             // as its client last reported; 0 before any has
horse.alive;              // false once dead; the body stays until revive or destroy
horse.stamina;            // read-only, the game runs it
horse.inventoryCapacity;  // 0 until a client has reported it
horse.gear;               // { saddle, head, torso, shoe }, item class names or null
horse.owner;              // the Player it belongs to, or null
```

`health`, `maxHealth`, `stamina`, `maxStamina` and `inventoryCapacity` come from
the client running the horse, so they read 0 until one has. Assigning `health`
sets it on that client, clamped to `maxHealth`; 0 kills. `horse.kill()` and
`horse.revive()` do the same explicitly.

## Rename a horse

```ts
horse.name = "Rocinante";
horse.name = ""; // back to the name its soul carries
```

A rider keeps the name the horse had when they mounted until they dismount.
Everyone else sees the new name straight away.

## Rider

```ts
horse.mounted;   // whether anyone is in the saddle
horse.rider;     // the Player riding it, or null
horse.riderId;   // that player's id, or 0
player.horse;    // from the other side: the horse they ride, or null
```

To take the rider off:

```ts
horse.rearAndThrowDown();            // the game's own rear, throwing the rider off
horse.pullDownRider(target);         // target drags the rider out of the saddle
const rider = horse.dismountRider(); // lifts them out; returns them, or null
```

The first two play the game's own animation on every client and return `false`
when nobody is riding. `player.dismount()` does the same as `dismountRider()`
from the rider's end and returns the horse, or `null`.

A horse can also belong to a player, who need not be its rider: see
[Give a horse an owner](../horse-owners/). To decide who may ride, return
`false` from `horseMounting`. The player's game
has already started the mount, so a refusal plays the get-off:

```ts
Events.on("horseMounting", (horse, rider) => {
  if (horse.name === "Royal Stallion" && !rider.nickname.startsWith("King")) return false;
});
```

## Change its gear

```ts
horse.setGear(Horse.gearPresets()[0] ?? {}); // a preset, or items by slot; {} is bare
horse.equipGear(Horse.gearItems("saddle")[0] ?? "");
horse.removeGear("head");
horse.gearLocked = true; // players cannot change it; scripts still can
```

`setGear` throws on an item that is not horse gear or sits in the wrong slot.
Removing the saddle removes the caparison too. [Horse gear](../../resources/horse-gear/)
lists every item by slot and what each preset puts on.

## Horse events

| Event | Arguments | When |
| --- | --- | --- |
| `horseSpawn` | `horse` | Right after a horse is created, by any script. |
| `horseDestroy` | `horse` | While it is being removed, including with its owner. The handle still reads. |
| `horseOwnerChanged` | `horse`, `player` | After `giveTo`, or when its owner left it behind. `player` is `null` for no owner. |
| `horseMounting` | `horse`, `player` | A player climbed on; return `false` to refuse. Synchronous. |
| `horseMount` | `horse`, `player` | The player is in the saddle and their client owns the horse. |
| `horseDismount` | `horse`, `player` | A rider left, including on disconnect, death, or the horse's death or removal. |
| `horseDamage` | `horse`, `attacker`, `amount`, `reason` | Health came off. |
| `horseDeath` | `horse`, `killer`, `reason` | It died, after the `horseDamage` that killed it. |
| `horseGearChanging` | `horse`, `player`, `gear` | A player changed its gear; return `false` to put it back. |
| `horseGearChanged` | `horse`, `player`, `gear` | Gear changed on every client; `player` is `null` for a script. |

The `player`, `attacker` and `killer` arguments in `horseMount`, `horseDismount`
and the damage and gear events are `Player | null`, so check them.

## Clean up

```ts
for (const each of Horse.all()) {
  if (!each.mounted) each.destroy();
}

const again = Horse.getById(horse.id); // null once it is gone
```

`horse.destroy()` removes it from every client after raising `horseDestroy`.
Store the id, not the handle.

## Example: one horse per player

Give each player one horse on `/stable` and replace it if they ask again. The
horse is theirs, so it goes when they leave without any cleanup code.

```ts title="src/server/stable.ts"
Events.on("playerCommand", (player, command) => {
  if (command !== "stable") return;
  if (!player.ready) {
    Chat.sendToPlayer(player, "Wait until you have spawned.");
    return;
  }

  for (const old of Horse.all()) {
    if (old.ownerId === player.id) old.destroy();
  }
  const horse = Horse.spawn(player.position, player.rotation, undefined, `${player.nickname}'s horse`);
  horse.giveTo(player); // destroyWithOwner is on by default
});
```

[Give a horse an owner](../horse-owners/#example-a-stable-that-remembers) has
a stable that keeps the horse for a player who comes back.

## Related

- [Give a horse an owner](../horse-owners/): ownership, who may ride, and what happens when the owner leaves.
- [Dog companions](../dogs/): the other animal a player can own.
- [Carts and wagons](../../world/carts/): the game's wagons, driven from the bench with the same keys.
- [Server vs client authority](../../core-concepts/authority/): why a ridden horse belongs to its rider.
- [Chat and /commands](../../players/chat/): the `playerCommand` event used above.
