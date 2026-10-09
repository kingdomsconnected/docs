---
title: Shops (vendors)
description: Sell and buy items on the game's own trade screen, at prices and with a purse the server controls.
sidebar:
  label: Shops
  order: 63
---

A vendor is a price list and a purse the server owns, traded on the game's own
shop screen. Create one, stock it, and open it in front of a player from an
NPC's talk key, a dialogue option or a command.

```ts
const shop = Vendor.create({ name: "Bakery", purse: 500, buys: true });
Vendor.setStock(shop, [
  { item: "bread", amount: 20, price: 30 },
  { item: "apple", amount: 30, price: 10 },
]);
Vendor.setBuyPrices(shop, [{ item: "apple", price: 4 }]);

Vendor.open(shop, player.id);
```

:::note
The trade screen is only a preview. When the player presses Trade, the server
prices the basket again, settles it and moves the items itself. Prices count in
**money units**, the amount of the game's `money` item (what
`player.giveItem("money", 100)` hands out).
:::

## Create a vendor

[`Vendor.create`](../../reference/server/variables/Vendor.md#create) returns a
vendor **id**, a plain number; every other call takes it.

| Option | Means |
| --- | --- |
| `name` | Shown in the server log only. The screen names whoever keeps the shop. |
| `purse` | Money it starts with, and all it can pay out. `undefined` never runs out. |
| `buys` | Whether it takes players' items at all. On by default. |

:::note[TypeScript]
All three keys are typed as required but may be `undefined`. Write
`{ name: "Bakery", purse: undefined, buys: true }` rather than leaving one out.
:::

## Stock it

A new vendor sells and buys nothing.

- `Vendor.setStock(vendor, rows)` replaces what it **sells**: an item (GUID or
  the game's item name), how many, and the price of one. A row bought out
  disappears.
- `Vendor.setBuyPrices(vendor, rows)` replaces what it **buys** and pays.
  Anything not listed shows at no value, and a basket selling it is refused.

Both take at most 128 rows, each item class once, and return `false` for a
vendor that does not exist. Players with the screen open see a new list at
once; a basket priced against the old list is refused.

## Set its purse

```ts
const shop = Vendor.create({ name: "Bakery", purse: 500, buys: true });
Vendor.setPurse(shop, 1000); // what it can pay out now
Vendor.setPurse(shop, null); // never runs out
Vendor.getPurse(shop);       // number, or null for unlimited (or no such vendor)
```

Deals keep the purse current: what players pay goes in, what the vendor pays
comes out. A vendor with a small purse stops buying when it runs dry.

## Open the shop from an NPC

```ts
const stalls = new Map<number, number>(); // npc id -> vendor id

Events.on("npcInteract", (keeper, customer) => {
  const vendor = stalls.get(keeper.id);
  if (vendor === undefined) return;
  keeper.lookAt(customer);
  Vendor.open(vendor, customer.id, keeper.id);
});
```

The third argument of `Vendor.open` is the NPC keeping the shop, shown as the
trader; leave it out to trade with nobody in particular. `open` returns a
session id, or `0` if the vendor or player is gone. The
[NPC shop tutorial](../../tutorials/market-stall/) builds the whole stall, with
a [dialogue](../dialogue/) greeting in front.

## Close a shop

A player trades at one vendor at a time; opening another closes the first with
reason `2`.

```ts
const current = Vendor.sessionOf(player.id); // their session, or 0
const vendor = Vendor.vendorOf(current);     // the vendor it trades with, or 0
Vendor.close(current);                       // take the screen off them
Vendor.destroy(vendor);                      // close every session at it and forget it
```

Vendors are not removed when the resource that created them stops. Destroy
yours in `resourceStop`.

## React to a trade

`vendorTrade` fires once a deal has settled and everything has moved:

```ts
Events.on("vendorTrade", (vendor, player, bought, sold, balance) => {
  const list = (lines: VendorTradeLine[]) =>
    lines.map((line) => `${line.amount}x ${line.name}`).join(", ") || "nothing";
  console.log(`${player.nickname} bought ${list(bought)}, sold ${list(sold)}, balance ${balance}`);
});
```

- Each line has the item GUID, its name, the amount and the unit price at
  settlement. `balance` is positive when the vendor paid the player.
- What a player sells does **not** join the stock. To resell it, call
  `setStock` in this handler.
- Deals at one vendor settle one at a time. A basket arriving mid-settlement is
  refused, not queued.

## When the screen closes

On the server, `vendorClosed` fires when a session ends, whoever ended it:

| `reason` | Means |
| --- | --- |
| `0` | The player closed the screen. |
| `1` | The server closed it (`Vendor.close` or `Vendor.destroy`). |
| `2` | Another vendor replaced it. |
| `3` | The client could not bring the screen up. |
| `4` | The player left. |

The client has its own pair about the screen itself. `vendorOpened` fires when
the screen actually comes up (a few frames after the request, or never), and
exactly one `vendorClosed` follows it:

```ts
// client
Events.on("vendorOpened", (session, npc) => {
  console.log(`trading in session ${session} with ${npc ?? "nobody"}`);
});

Events.on("vendorClosed", (session, reason) => {
  // "player", "server", "replaced", "levelChange" or "sessionOver"
});
```

## Limits

- The server holds no inventories, so a sold line is taken **by item class**,
  not by the stack dragged. A player selling one of two swords may lose the one
  they wear. Quality and condition are ignored both ways.
- The default gamemode's `src/server/commands/vendor.ts` is a working example
  (`/vendor stall`, `/vendor here`).

## Sell custom items

Register the [custom type](../../players/custom-items/) before setting stock.
Each `Vendor.setStock` row can include `metadata`, including display overrides
and private `custom.data`. Purchases receive those properties; `vendorTrade`
lines include the metadata of the actual variant bought or sold.

Give the type a positive base price so it appears in the native shop. The
stock price alone does not make a zero-base-price custom type visible.
The native price list supports one stock row per class. Selling an item does
not automatically put that variant into the vendor's stock; implement any
resale policy in your game mode.

## Related

- [Build an NPC shop](../../tutorials/market-stall/): an NPC, a greeting and a vendor together.
- [Dialogue choices](../dialogue/): open the shop from a conversation option.
- [Items](../../players/items/): give and take money and items directly.
- [NPC damage, death and interaction](../../npcs-and-animals/npc-events/): the `npcInteract` event.
