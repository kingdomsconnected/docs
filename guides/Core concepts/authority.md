---
title: Server vs client authority
description: Which machine owns each piece of game state, why a verb on a player is a request, and how to confirm that it worked.
sidebar:
  label: Server vs client
  order: 20
---

Each player's own client owns their body: health, stamina, clothes, buffs and
where they stand. The server owns everything shared between players, and each
player's inventory. So reading a player's body gives you their last report,
and most verbs on a player are requests to their client.

```ts
// server
Events.on("playerCommand", (player, command) => {
  if (command !== "lift") return;

  const above = player.position.clone();
  above.z += 20;

  const sent = player.teleport(above);
  // `sent` means the request went out. player.position still reads the old
  // spot here; the new one arrives with the player's next update.
  Chat.sendToPlayer(player, sent ? "Up you go." : "Your client could not be reached.");
});
```

## Who owns what

| Thing | Owner | What you can do |
| --- | --- | --- |
| A player's body: pose, health, stamina, stats, appearance, buffs | That player's client | Read its last report; send it requests. |
| A player's inventory | The server | Read and change it directly; their game only shows it. See [Inventories](../../players/inventory/). |
| A player's skills, XP and perks | The server rules, their client applies | Every gain is asked for and granted as an order. See [Progression](../../players/progression/). |
| A horse standing idle | The server | Spawn, move and change it directly. |
| A horse with a rider | The rider's client | Handed over on `horseMount`, back on `horseDismount`. |
| An NPC | The server; a nearby client runs the body | Identity, orders and health are the server's. Writes apply at once. |
| Props, markers, particle effects, ground items, stashes, quests | The server | Spawn, change and destroy directly. |
| World clock and weather | The server | Every client adopts the server's values. |
| Entity state bags | The server | Only the server writes; clients read. See [State bags](../state/). |

## Read a player: it is a snapshot

Every player property is the value their client last published, not one the
server keeps. Until the first report arrives, fields hold placeholders:
`health` reads 0 and `position` is the world origin.

[`player.ready`](../../reference/server/classes/Player.md#ready) turns true
once the first pose and character state have arrived. Check it before a
position matters:

```ts
// server
function nearEnough(a: Player, b: Player, metres: number): boolean {
  if (!a.ready || !b.ready) return false;
  return a.position.distance(b.position) <= metres;
}
```

## Act on a player: the return value means "sent"

A verb on a player returns whether the request went out, not whether it
worked. The effect appears a moment later, once their client has applied it
and reported back. Their game can still refuse: a buff that conflicts with one
already there, or a beard the face was never modelled with.

| Verb | Returns | How you learn it happened |
| --- | --- | --- |
| `teleport`, `spawn` | `true` when sent | `player.position` changes on a later update. |
| `setAppearance` | `true` when sent | `player.appearance` reads back the new look. |
| `addBuff`, `removeBuff` | `true` when sent | `playerBuffAdded` or `playerBuffRemoved` fires. `hasBuff` straight after `addBuff` is still `false`. |
| `heal` | `true` when sent | `player.health` rises; `playerInjuryHealed` fires per limb. |
| `revive` | `true` when sent | The player stands up and `player.alive` turns true. |
| `addXp`, `setLevel`, `addPerk` | `true` when sent | `playerXpGained`, `playerLevelUp` or `playerPerkAdded` fires. |

Item verbs are the exception. `giveItem`, `takeItem` and the `Inventory` calls
change the inventory the server holds, so their result is final: the player's
game shows it on the next tick.

<details>
<summary>Why is there no setter for health or position?</summary>

A server-side write would be overwritten by the owner's next report a frame
later, so the API leaves the setter out. `player.position` is inherited from
[`Entity`](../../reference/server/classes/Entity.md) and can be assigned, but
the owner's next pose replaces it. Use `teleport`.

</details>

## Confirm an outcome with an event

When you need to know, listen for the event, or read the value back later.

```ts
// server
Events.on("playerCommand", (player, command, args) => {
  if (command !== "buff" || !args[0]) return;
  const info = Buffs.find(args[0]);
  if (!info) return;
  player.addBuff(info.name); // hasBuff is still false here
});

Events.on("playerBuffAdded", (player, buff, source) => {
  if (source === "server") Chat.sendToPlayer(player, `${buff} is on.`);
});
```

## Write what the server owns

Writes on server-owned things apply at once. `npc.teleport` moves the body
whoever simulates it; a pose the simulating client already sent cannot put it
back. `npc.setAppearance` and assigning `horse.name` are writes too.

The client running an NPC's body changes as players move (`npcSimulatorChange`),
and the NPC does not: the new simulator picks up from the server's copy. See
[Spawn NPCs](../../npcs-and-animals/npcs/).

## What the server validates for you

| Event | Checked how |
| --- | --- |
| `markerEnter` | Client detects it; server confirms against the position it replicates. |
| `npcInteract` | Server confirms the distance. |
| `npcDamage` | Attacker's client resolves the hit; server agrees, so `amount` is what was taken. |
| `groundItemPickup` | Reports a pickup the server already granted. |
| `doorInteract` | Server has already refused what the game's rules forbid (out of reach, locked by the server). |

Some events are just reported, because the client decides: `questTrackingChanged`,
`playerDamage`, and buffs the game applies itself (`playerBuffAdded` with
`source` `"native"`). To overrule native buffs, `Buffs.claim` turns them into
`playerBuffBlocked` events for you to decide on.

:::caution
Your own events are not checked. A payload that arrives through
`Events.onClient` is whatever the client sent. See
[Validate everything a client sends](../networking/#validate-everything-a-client-sends).
:::

Decide on the server and let the client do what it is told. A client resource
is for input, UI and effects on one machine; never enforce a rule there,
because the player controls it.

## Related

- [Teleport, kick and other player actions](../../players/actions/): the verbs in the table above
- [Read health, stats and skills](../../players/stats/): what a snapshot holds
- [Spawn and manage horses](../../npcs-and-animals/horses/): authority changing hands on mount
- [Send data between server and client](../networking/): your own events, and validating them
