---
title: Teleport, kick and other player actions
description: Move, revive, dismount, slow down, kick, relabel and message a player from the server.
sidebar:
  label: Teleport, kick, revive
  order: 32
---

The verbs on [`Player`](../../reference/server/classes/Player.md) move a
player, change their pace, kick them, relabel their nametag and send events to
their client.

```ts
Events.on("playerCommand", (player, command) => {
  if (command !== "home") return;

  if (!player.teleport({ x: -1423.5, y: 2871.2, z: 118.0 }, "Home")) {
    Chat.sendToPlayer(player, "Could not reach your client to move you.");
  }
});
```

:::note
Verbs about the body (`teleport`, `spawn`, `revive`, `setMovementMode`,
`setAppearance`, `giveItem`, `takeItem`, `addBuff`) are requests to the
player's own client: `true` means sent, `false` means refused before sending
(no connection, or bad arguments), and reads right after still show the old
value. Connection verbs (`kick`, nametags, `emit`) act at once. See
[Server vs client authority](../../core-concepts/authority/).
:::

## Move a player

| Call | Use it for |
| --- | --- |
| `player.spawn(position, rotation?)` | Anywhere the ground may not be loaded on their machine. Holds the body until there is ground under it. |
| `player.teleport(position, label?)` | Short hops. Uses your height exactly. The label shows in their teleport panel. |

Do not write `player.position` to move someone. [Join, spawn and
respawn](../join-and-spawn/#move-someone-later) has the details.

Two bodies in one spot get shoved apart in a random direction, so the default
gamemode's `/tp` lands two metres in front of the target:

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

## Revive a player

[`player.revive()`](../../reference/server/classes/Player.md#revive) only means
something after `playerDied`. It returns `false` if they are disconnected, have
not died, or a revival is already on its way. See [Respawn after a
death](../join-and-spawn/#respawn-after-a-death).

## Take someone off a horse

`player.dismount()` takes them out of the saddle on every client and returns
the [`Horse`](../../reference/server/classes/Horse.md), or `null` if they were
on foot. There is no verb to mount: that starts on the player's own client. See
[Horses](../../npcs-and-animals/horses/).

## Set walking pace

[`player.setMovementMode(mode)`](../../reference/server/classes/Player.md#setmovementmode)
has two independent switches:

| Key | Effect |
| --- | --- |
| `walkByDefault` | Walking is the pace they return to, after a sprint too. Their walk toggle still works. |
| `walkEnforced` | No running or sprinting at all. Holds the engine's own run and sprint permissions, so no key gets around it. Lifting it hands back what the body had. |

```ts
player.setMovementMode({ walkEnforced: true }); // inside the town walls
player.setMovementMode({});                     // leaving town: lift the rule
```

:::caution
Each call states the whole rule: a key you leave out is **off**. So
`setMovementMode({ walkByDefault: true })` also lifts any enforcement.
:::

Other players are not told; they see the pace this body's animation reports.
On a gamepad the stick's deflection decides pace, and `walkByDefault` does not
override it.

## Kick a player

```ts
player.kick("Idling too long");
```

`kick` disconnects at once, with an optional reason shown to them.
`playerDisconnect` still fires, so your cleanup runs. It is safe from any
handler, including `playerSpawning`.

## Change a nametag

```ts
player.setNametagText("[Guard] " + player.nickname); // no argument or "" restores their name
player.setNametagColor(0xFFD4A017);                  // 0xAARRGGBB: opaque gold
player.setNametagHealthVisible(false);               // hide the health bar, keep the name
player.setNametagVisible(true);
```

Getters: `getNametagText()`, `getNametagColor()`, `isNametagVisible()`,
`isNametagHealthVisible()`. Nametag colours are alpha **first**, the opposite
of [chat colours](../chat/). Each player can still hide all nametags on their
own screen; see [HUD and nametags](../../user-interface/hud/).

## Send an event to their client

`player.emit(name, json?)` sends a named event to that player's client
resource. The payload is a JSON **string**; the client receives it parsed, and
drops invalid JSON with an error in its log.

```ts
player.emit("my-mode:round.start", JSON.stringify({ round: 3, seconds: 180 }));
```

See [Send data between server and client](../../core-concepts/networking/).

A player is also an [`Entity`](../../reference/server/classes/Entity.md), so
`player.state` ([state bags](../../core-concepts/state/)) and
`player.setVirtualWorld(world)` ([virtual worlds](../../core-concepts/virtual-worlds/))
work too.

## Related

- [Join, spawn and respawn](../join-and-spawn/), for spawn points and death
- [Read health, stats and skills](../stats/), for what you can read back
- [Items: give, take and drop](../items/)
- [Buffs and status effects](../buffs/)
