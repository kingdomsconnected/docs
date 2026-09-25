---
title: Give and take items
description: Give items to a player, take them back with an awaited round trip, and read what they wear and hold.
sidebar:
  order: 35
---

The server has no inventory of its own. Each player's inventory lives in their
own game, so giving an item is an instruction to their client, and taking one
is a question their client has to answer. That is why
[`giveItem`](../../../reference/server/classes/Player.md#giveitem) returns a
boolean and [`takeItem`](../../../reference/server/classes/Player.md#takeitem)
returns a promise.

```ts
Events.on("playerSpawned", (player) => {
  player.giveItem("apple", 3);
  player.giveItem("longswordBroad");
});
```

## Naming an item

Both verbs take either the exact name from the game's item tables or the
item's GUID in its usual dashed form:

```ts
player.giveItem("longswordBroad");                        // exact table name
player.giveItem("3858560f-cf48-436f-8815-4426003288fb");  // the same sword by GUID
player.giveItem("CoifCap01_m01_C");                       // a coif
```

Names are case-sensitive and must match exactly; GUIDs are not
case-sensitive. There is no fuzzy lookup, so validate names that come from
players (the next section shows how `false` tells you).

## Giving

`player.giveItem(item, amount?)` grants `amount` (default 1, at most 10000)
into the player's inventory. It returns `false` for an item the tables do not
have or an amount outside 1 to 10000, and `true` once the grant went out.

:::note[Authority]
A grant always lands if it was sent, so `true` is as good as done. But it
lands on the player's client a moment later, and nothing on the server records
it. If your gamemode needs to know what a player owns, keep that record
yourself.
:::

## Taking

`player.takeItem(item, amount?)` asks the player's client to remove items and
resolves once it has answered. It removes across stacks of that item, oldest
first, and counts an item even while it is in the player's hand.

```ts
async function charge(player: Player, item: string, amount: number): Promise<boolean> {
  const result = await player.takeItem(item, amount);

  if (result.reason !== "") {
    // The client never answered, or the request was refused before sending.
    Chat.sendToPlayer(player, `Could not take ${item}: ${result.reason}`);
    return false;
  }
  if (!result.ok) {
    // They had some, but not enough. What they had is already gone.
    player.giveItem(item, result.removed); // put it back
    Chat.sendToPlayer(player, `You need ${amount} ${item}, you had ${result.removed}.`);
    return false;
  }
  return true;
}
```

The result has four fields:

| Field | Meaning |
| --- | --- |
| `removed` | Units that actually went. |
| `requested` | What you asked for. |
| `ok` | `true` only when the client answered **and** removed every unit. |
| `reason` | `""` when the client answered. Otherwise what went wrong. |

`reason` is set when the item name is unknown, the amount is outside 1 to
10000 (zero is refused, not read as "all of them"), the player has no
inventory loaded, their client does not answer within five seconds, or they
leave first. The promise always settles; it never hangs.

:::caution
A partial take is still a take. A player asked for 3 who had 1 comes back as
`removed: 1, ok: false`, and their client is already one short. Always read
`ok` before crediting the other side of a trade, and decide whether to give
back `removed` when it is false.
:::

Because it awaits, `takeItem` belongs in an `async` function; an `Events.on`
handler may be `async` too. The promise resolves even on failure (it does not
reject), so read `reason` rather than wrapping it in `try`. The default
gamemode's `src/server/commands/take.ts` is a complete `/take`.

## What they wear and hold

Three properties report what the body has on, as its own client last
published it:

```ts
player.equipment;      // item classes being worn: string[]
player.rightHandItem;  // the drawn weapon or torch, or ""
player.leftHandItem;   // a shield, a torch, or ""
```

These are what the player actually wears, not a preset, so a bare body reads
as an empty array. There is no verb to equip or unequip anything. Clothing is
inventory: to dress someone, give them the garment and let them put it on.

## Item classes

`equipment`, `rightHandItem`, `leftHandItem` and a ground item's `itemClass`
are all the same kind of value: an **item class** as 32 lowercase hex digits.
A class says *what* something is, never which one, so they compare directly:

```ts
const holding = player.rightHandItem;
const sameAsDropped = GroundItem.all().filter((item) => item.itemClass === holding);
```

:::caution
That 32-digit form is not the dashed GUID `giveItem` and `takeItem` accept,
and it is not a simple "remove the dashes" of it either: the server prints the
GUID's bytes in the engine's own order. Passing `player.rightHandItem` to
`takeItem` fails with an unknown item.
:::

<details>
<summary>Converting a dashed GUID to the 32-digit class form</summary>

To check whether a player wears or holds a particular item, convert the GUID
you know into the form the server prints, and compare. This mirrors how the
server formats a class: the first three GUID fields reversed as one number,
then the last eight bytes in reverse.

```ts
function itemClassOf(guid: string): string {
  const hex = guid.replace(/-/g, "").toLowerCase();
  const pairs = hex.slice(16).match(/../g) ?? [];
  return hex.slice(12, 16) + hex.slice(8, 12) + hex.slice(0, 8) + pairs.reverse().join("");
}

const COIF = itemClassOf("1b4b6487-72cc-409e-9296-692b53e0429e");
const wearsCoif = player.equipment.includes(COIF);
```

</details>

The server holds no display names for classes. Naming items for a UI is your
item list's job.

## On the ground

Stacks lying in the world are server-owned entities, unlike inventory
contents. [Items lying on the ground](../../world-and-objects/ground-items/) covers
`GroundItem.spawn` and the pickup events.

## Related

- [Teleport, kick and other player actions](../actions/), for the request model
- [Vendors](../../quests-dialogue-and-shops/vendors/), which move items and money in one deal
- [Build a /command system](../../../tutorials/command-system/), for async
  commands like `/take`
