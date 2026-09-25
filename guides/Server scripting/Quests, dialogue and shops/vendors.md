---
title: Shops (vendors)
description: Sell and buy items on the game's own trade screen, at prices and with a purse the server controls.
sidebar:
  order: 62
---

A vendor is a price list and a purse that the server owns, traded on the game's
own shop screen. You create one, stock it, and open it in front of a player
from wherever your gamemode decides the counter is: an NPC's talk key, a
dialogue option, a command.

```ts
const shop = Vendor.create({ name: "Bakery", purse: 500, buys: true });
Vendor.setStock(shop, [
  { item: "bread", amount: 20, price: 30 },
  { item: "apple", amount: 30, price: 10 },
]);
Vendor.setBuyPrices(shop, [{ item: "apple", price: 4 }]);

Vendor.open(shop, player.id);
```

## The server decides every price

The trade screen is only a preview. Its prices come from the server, and when
the player presses Trade the client sends a basket that the server prices
again, settles, and moves itself. Nothing the client shows is trusted.

Prices count in **money units**: the amount of the game's `money` item, which is
also what `player.giveItem("money", 100)` hands out.

## Creating and stocking

[`Vendor.create`](../../../reference/server/variables/Vendor.md#create) returns
a vendor **id**, a plain number. There is no handle; every other call takes the
id.

| Option | Means |
| --- | --- |
| `name` | Shown in the server log only. The screen names whoever keeps the shop. |
| `purse` | Money it starts with, and all it can pay out. `undefined` means it never runs out. |
| `buys` | Whether it takes players' items at all. On by default. |

:::note[TypeScript]
The declarations make all three keys of `VendorOptions` required but allow
`undefined`. Write `Vendor.create({ name: "Bakery", purse: undefined, buys: true })`
rather than leaving a key out.
:::

A new vendor sells nothing and buys nothing. Two calls fill it in:

- `Vendor.setStock(vendor, rows)` replaces everything it **sells**. Each row is
  an item (GUID or the game's item name), how many it has, and the price of one.
  A row the players buy out disappears.
- `Vendor.setBuyPrices(vendor, rows)` replaces everything it **buys**, and what
  it pays. Anything not listed shows at no value, and a basket that tries to
  sell it is refused.

Both take at most 128 rows, with each item class once, and return `false` for a
vendor that does not exist.

A new list reaches every player who has the screen open straight away. A basket
the player priced against the old list is refused, and they see the new one.

## The purse

```ts
const shop = Vendor.create({ name: "Bakery", purse: 500, buys: true });

Vendor.setPurse(shop, 1000); // what it can pay out now
Vendor.setPurse(shop, null); // never runs out
Vendor.getPurse(shop);       // number, or null for unlimited (or no such vendor)
```

Deals keep the purse current: what players pay goes in, what the vendor pays
them comes out. A vendor with a small purse stops buying when it runs dry,
which is what makes a village trader feel like one.

## Opening the screen

```ts
const shop = Vendor.create({ name: "Bakery", purse: 500, buys: true });
const tradeSession = Vendor.open(shop, player.id, npc.id);
```

The third argument is the NPC keeping the shop; the screen shows them as the
trader. Leave it out to trade with nobody in particular. `open` returns a
session id, or `0` if the vendor or the player is gone.

A player trades at one vendor at a time. Opening another closes the first with
reason `2`.

```ts
const current = Vendor.sessionOf(player.id); // their session, or 0
const vendor = Vendor.vendorOf(current);     // the vendor it trades with, or 0
Vendor.close(current);                       // take the screen off them
Vendor.destroy(vendor);                      // close every session at it and forget it
```

The usual counter is an NPC. Open the vendor from `npcInteract`:

```ts
const stalls = new Map<number, number>(); // npc id -> vendor id

Events.on("npcInteract", (keeper, customer) => {
  const vendor = stalls.get(keeper.id);
  if (vendor === undefined) return;
  keeper.lookAt(customer);
  Vendor.open(vendor, customer.id, keeper.id);
});
```

The [market stall tutorial](../../../tutorials/market-stall/) builds the whole
thing: the NPC, a greeting in [dialogue](../dialogue/), and the vendor behind it.

## After a trade

`vendorTrade` fires once a deal has settled and everything in it has moved:

```ts
Events.on("vendorTrade", (vendor, player, bought, sold, balance) => {
  const list = (lines: VendorTradeLine[]) =>
    lines.map((line) => `${line.amount}x ${line.name}`).join(", ") || "nothing";
  console.log(`${player.nickname} bought ${list(bought)}, sold ${list(sold)}, balance ${balance}`);
});
```

Each line carries the item GUID, the game's name for it, how many changed
hands, and the unit price at settlement. `balance` is what the player came out
with in money units, positive when the vendor paid them.

What a player sells does **not** join the vendor's stock. If this vendor
resells, add it back with `setStock` in this handler.

Deals at one vendor settle one at a time. A basket that arrives while another
is still settling is refused rather than queued.

## When the screen closes

On the server, `vendorClosed` fires when a session ends, whoever ended it:

| `reason` | Means |
| --- | --- |
| `0` | The player closed the screen. |
| `1` | The server closed it (`Vendor.close` or `Vendor.destroy`). |
| `2` | Another vendor replaced it. |
| `3` | The client could not bring the screen up. |
| `4` | The player left. |

The client has its own pair, about the screen rather than the session.
`vendorOpened` fires when the screen actually comes up (a few frames after the
server asked, or never, if it failed), and exactly one `vendorClosed` follows
it, with a reason word:

```ts
// client
Events.on("vendorOpened", (session, npc) => {
  console.log(`trading in session ${session} with ${npc ?? "nobody"}`);
});

Events.on("vendorClosed", (session, reason) => {
  // "player", "server", "replaced", "levelChange" or "sessionOver"
});
```

A screen that never came up raises neither client event.

## Limits worth knowing

- The server holds no inventories, so a sold line is taken **by item class**,
  not by the stack the player dragged. A player selling one of two swords may
  lose the one they are wearing. Quality and condition are ignored both ways.
- Vendors are not removed when the resource that created them stops. Destroy
  yours in `resourceStop`.
- The default gamemode's `src/server/commands/vendor.ts` is a working example
  (`/vendor stall`, `/vendor here`).
