---
title: Server vs client authority
description: Which machine owns each piece of game state, and why a verb on a player is a request to their client rather than a write.
sidebar:
  order: 20
---

Kingdom Come: Deliverance II keeps a player's whole state on their own machine:
health, stamina, skills, inventory, clothes, buffs and where they are standing.
The server does not have those tables. So the owning client is authoritative
for its player's body, and the server is authoritative for everything between
players. Almost every odd-looking corner of the API follows from that split.

```ts
// server
Events.on("playerCommand", (player, command) => {
  if (command !== "lift") return;

  const above = player.position.clone();
  above.z += 20;

  const sent = player.teleport(above);
  // `sent` says the request went out. `player.position` still reads the old
  // spot here: the new one arrives with the player's next update.
  Chat.sendToPlayer(player, sent ? "Up you go." : "Your client could not be reached.");
});
```

## Who owns what

| Thing | Authority | What that means for you |
| --- | --- | --- |
| A player's body: pose, health, stamina, stats, skills, inventory, appearance, buffs | Their own client | You read what it last reported and send it requests. |
| A horse standing idle | The server | Created and moved by the server. |
| A horse with a rider | The rider's client | Handed over on `horseMount`, handed back on `horseDismount`. |
| An NPC | The server, simulated by a nearby client | Identity, orders and health live on the server. A client only runs the body. |
| Props, markers, particle effects, ground items, stashes, quests | The server | Spawn, change and destroy them directly. |
| World clock and weather | The server | Every client adopts the server's time. |
| Entity state bags | The server | Only the server writes; clients read. See [Entity state bags](../state/). |

## Reading a player is reading a snapshot

Everything you can read about a player is the number their client last
published. [`player.health`](../../reference/server/classes/Player.md#health)
is what their game reported, not a value the server keeps. Until the client
has reported anything, the fields hold placeholders: `health` reads 0 and
`position` is the world origin.

[`player.ready`](../../reference/server/classes/Player.md#ready) tells you when
the first pose and character state have arrived. Check it before you use a
player's position for anything that matters:

```ts
// server
function nearEnough(a: Player, b: Player, metres: number): boolean {
  if (!a.ready || !b.ready) return false;
  return a.position.distance(b.position) <= metres;
}
```

## Verbs on a player are requests

Everything you can **do** to a player is a request sent to their client. The
return value says whether the request went out, not whether it worked. The
effect shows up a moment later, when their client has applied it and reported
back.

| Verb | Returns | How you learn it happened |
| --- | --- | --- |
| `teleport`, `spawn` | `true` when sent | `player.position` changes on a later update. |
| `setAppearance` | `true` when sent | `player.appearance` reads back the new look once it is on. |
| `giveItem` | `true` when sent | The item is in their inventory on their machine. |
| `addBuff`, `removeBuff` | `true` when sent | `playerBuffAdded` and `playerBuffRemoved` fire. `hasBuff` straight after `addBuff` still says `false`. |
| `revive` | `true` when sent | The player stands up. |
| `takeItem` | A `Promise` | The one verb that waits: it resolves with how many were really removed. |

The game on the other end can still say no. It refuses a buff that conflicts
with one already there, for example, and `setAppearance` refuses a beard the
face was never modelled with. Treat `true` as "asked", and listen for the event
or read the value back when you need to know.

```ts
// server
Events.on("playerCommand", (player, command, args) => {
  if (command !== "buff" || !args[0]) return;

  const info = Buffs.find(args[0]);
  if (!info) {
    Chat.sendToPlayer(player, `No buff called ${args[0]}.`);
    return;
  }
  player.addBuff(info.name);
  // player.hasBuff(info.name) is still false here. Wait for the event.
});

Events.on("playerBuffAdded", (player, buff, source) => {
  if (source === "server") Chat.sendToPlayer(player, `${buff} is on.`);
});
```

<details>
<summary>Why is there no setter for health or stamina?</summary>

A server-side write would be overwritten by the owner's next report a frame
later. The API leaves the setter out rather than offering one that silently
does nothing. The same goes for assigning `player.position`: the property is
inherited from [`Entity`](../../reference/server/classes/Entity.md), but the
owner's next pose replaces whatever you wrote. Use `teleport`.

</details>

## Writes on things the server owns

Anything the server owns changes when you tell it to. `Npc.teleport` moves the
body outright, whoever is simulating it: the server bumps the body's epoch, so
a pose the simulating client had already sent cannot put it back.
`npc.setAppearance` is a write for the same reason, since nobody owns an NPC's
body but the server. Assigning `horse.name` renames the horse on every client.

NPCs are the interesting middle case. The server holds who the NPC is, what it
was told to do and how much health it has left. The nearest client runs the
body, and that job moves between clients as players walk around
(`npcSimulatorChange`). Nothing about the NPC changes when it moves: the new
simulator picks up from the server's copy. See
[NPCs](../../server-scripting/npcs-horses-and-dogs/npcs/).

## What the server checks for you

Some events start on a client. The ones that could be abused are checked
against what the server already knows before they reach your handler:

- `markerEnter` is detected by the client and confirmed against the position
  the server replicates, so a claim it disagrees with never arrives.
- `npcInteract` is confirmed against the distance the server sees.
- `npcDamage` is resolved by the attacker's client and agreed to by the server,
  so `amount` is what was really taken.
- `groundItemPickup` reports a pickup the server has already granted.

A few are simply reported, because the decision is the client's to make.
`questTrackingChanged` fires when a player follows or unfollows a quest in
their journal; you can react but not refuse. Buffs the game applies on its own,
a potion they drank, arrive as `playerBuffAdded` with `source` set to
`"native"`. If you need to overrule those, `Buffs.claim` turns them into
`playerBuffBlocked` events for you to decide on.

Your own events are the exception. A payload that arrives through
`Events.onClient` is whatever a client chose to send, and nothing has checked
it. [Send data between server and client](../networking/#validate-everything-a-client-sends)
shows how to treat it.

## A habit that follows from all this

Decide on the server, and let the client do what it is told. If a round ends,
the server decides that and asks each client to teleport. If a shop sells a
sword, the server checks the price and calls `giveItem`. A client resource is
for input, UI and effects on that one machine; it should never be the place a
rule is enforced, because the player controls it.

## Related

- [Teleport, kick and other player actions](../../server-scripting/players/actions/)
- [Player health, stats and skills](../../server-scripting/players/reading/)
- [Horses](../../server-scripting/npcs-horses-and-dogs/horses/)
- [Send data between server and client](../networking/)
