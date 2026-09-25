---
title: Teleport, kick and other player actions
description: Move, revive, kick, slow down, relabel and message a player, and why most of these calls are requests rather than writes.
sidebar:
  order: 33
---

The verbs on [`Player`](../../../reference/server/classes/Player.md) fall into
two groups. Verbs about the **body** (moving it, dressing it, giving it items)
are requests to the player's own client. Verbs about the **connection**
(kicking, messaging, nametags) act on the server straight away.

```ts
Events.on("playerCommand", (player, command) => {
  if (command !== "home") return;

  if (!player.teleport({ x: -1423.5, y: 2871.2, z: 118.0 }, "Home")) {
    Chat.sendToPlayer(player, "Could not reach your client to move you.");
  }
});
```

## Requests, not writes

:::note[Authority]
Each player's client owns its own body: its pose, its inventory, what it
looks like. The server does not simulate bodies, so it cannot move one itself.
`teleport`, `spawn`, `revive`, `setAppearance`, `setMovementMode`, `giveItem`,
`takeItem` and `addBuff` all send an instruction to that client, and the change
happens when their game carries it out, a frame or so later. The result comes
back with the player's next update.
:::

Two consequences to plan around:

- A `true` return means the request went out. `false` means it was refused
  before sending: the player has no connection, or the arguments failed a check
  the client would also have failed.
- Reading right after the call still gives the old value. `player.position`
  after `teleport` is where they were, not where they are going.

[Server vs client authority](../../../core-concepts/authority/) explains the model for the
whole mod.

## Moving

| Call | Use it for |
| --- | --- |
| `player.spawn(position, rotation?)` | Anywhere the ground may not be loaded on their machine yet. Holds the body until there is ground under it. |
| `player.teleport(position, label?)` | Short hops. Uses your height exactly. The label shows in their own teleport panel. |

Both are covered in [Spawn points and respawning](../spawning/). Writing
`player.position` directly is not the way to move a player: use one of these.

The default gamemode's `/tp` lands the caller two metres in front of the
target rather than on top of them, because two bodies in one spot get shoved
apart in a random direction. A shorter version of the same idea:

```ts
function moveNextTo(player: Player, target: Player): boolean {
  if (!target.ready) return false; // their position has not arrived yet

  const look = target.lookDirection;
  const flat = Math.hypot(look.x, look.y) || 1;
  const destination = new Vector3(
    target.position.x + (look.x / flat) * 2,
    target.position.y + (look.y / flat) * 2,
    target.position.z,
  );
  return player.teleport(destination, target.nickname);
}
```

## Reviving

[`player.revive()`](../../../reference/server/classes/Player.md#revive) is only
meaningful after `playerDied`. It returns `false` if they are disconnected, have
not died, or a revival is already on its way. See [Death and
revival](../spawning/#death-and-revival).

## Taking someone off a horse

`player.dismount()` takes the player out of whatever saddle they are in, on
every client, and returns the [`Horse`](../../../reference/server/classes/Horse.md)
(or `null` if they were on foot). There is no verb to put a player in a saddle:
mounting starts on the player's own client. [Horses](../../npcs-horses-and-dogs/horses/)
has the rest.

## Walking pace

[`player.setMovementMode(mode)`](../../../reference/server/classes/Player.md#setmovementmode)
puts a pace rule on one player. It has two independent switches:

- `walkByDefault` makes walking the pace they come back to. Their own walk
  toggle still works, and after a sprint they return to a walk.
- `walkEnforced` forbids running and sprinting outright. It holds the engine's
  own run and sprint permissions (the same ones the game clears while you carry
  a body), so no key gets around it. Lifting it hands back what the body had.

```ts
// Inside the town walls: nobody runs.
player.setMovementMode({ walkEnforced: true });

// Leaving town: lift the rule.
player.setMovementMode({});
```

:::caution
Each call states the whole rule. A key you leave out is **off**, because the
server keeps no copy of what the player is currently under. So
`setMovementMode({ walkByDefault: true })` also lifts any enforcement.
:::

Nothing about the rule goes out to other players. Everyone else sees the pace
this body's own animation reports, so a walking player already looks like one.
On a gamepad the stick's deflection decides pace, and `walkByDefault` does not
override it.

## Kicking

```ts
player.kick("Idling too long");
```

`kick` disconnects the player at once, with an optional reason shown to them.
`playerDisconnect` fires for them as usual, so your cleanup runs. It is safe to
call from any handler, including `playerSpawning`.

## Nametags

The name over a player's head is controlled per player, for everyone else:

```ts
player.setNametagText("[Guard] " + player.nickname);
player.setNametagColor(0xFFD4A017); // 0xAARRGGBB: opaque gold
player.setNametagHealthVisible(false); // hide the health bar, keep the name
player.setNametagVisible(true);
```

`setNametagText()` with no argument (or `""`) goes back to their own name.
The matching getters are `getNametagText()`, `getNametagColor()`,
`isNametagVisible()` and `isNametagHealthVisible()`. Each player can still
hide all nametags on their own screen.

:::caution
Nametag colours are packed `0xAARRGGBB`, alpha first. Chat colours are packed
the other way round, `0xRRGGBBAA` (see [Chat messages and /commands](../chat/)). The same
number gives two different colours in the two places.
:::

## Sending events to their client

`player.emit(name, json?)` sends a named event to that player's client
resource. The payload is a JSON **string**, and the client receives it parsed:

```ts
player.emit("my-mode:round.start", JSON.stringify({ round: 3, seconds: 180 }));
```

A payload that is not valid JSON is dropped on the client with an error in its
log. [Send data between server and client](../../../core-concepts/networking/) covers
both directions and how to validate what comes back.

## Also on every player

`player` is also an [`Entity`](../../../reference/server/classes/Entity.md), so
`player.state` (per-player data, see [Entity state bags](../../../core-concepts/state/))
and `player.setVirtualWorld(world)` (see [Virtual
worlds](../../../core-concepts/virtual-worlds/)) work on it too.

## Related

- [Player health, stats and skills](../reading/)
- [Appearance](../appearance/)
- [Give and take items](../inventory/)
- [Buffs](../buffs/)
