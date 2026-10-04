---
title: Carry items and bodies in the arms
description: Have players carry baskets, sacks and buckets the way the game's own people do, lay down props anyone can take up, and decide who may carry another player's body.
sidebar:
  label: Carrying
  order: 34.5
---

Players can carry an item in their arms, the way the game's own people carry
firewood, sacks and baskets: the carrying walk, no running, and the put-down
at the end. They can also lift a downed player's body onto their shoulder.
Everybody sees both, and your script decides who may carry what.

```ts
player.carryItem("basket_full_wood"); // a new basket straight into their hands

Events.on("playerCarryItem", (player, item) => {
  Chat.sendToPlayer(player, `You carry a ${item}. Drop it to put it down.`);
});

Events.on("playerPutDownItem", (player, item, groundItem) => {
  if (groundItem) console.log(`${player.nickname} put a ${item} down at ${groundItem.position}`);
});
```

A carried item never enters the inventory. Put down, it becomes a
[ground item](../items/#put-items-on-the-ground) where it falls, which anybody
can take up again with the game's pick-up prompt.

## Carry an item

[`player.carryItem(item)`](../../reference/server/classes/Player.md#carryitem)
takes an item name and puts a new one in the player's hands. Only items the
game has a carrying walk for work:

| Item names | Who |
| --- | --- |
| `basket_full_wood`, `basket_b_apples`, `stonebasket`, `eggbasket`, `shoppingbasket` | Everyone |
| `firewoodChipsHand`, `waterBucket`, `milkBucket` | Everyone |
| `sack`, `sack_miller`, `barrel`, `crate_with_silver` | Men only |

It throws for an item with no carrying walk, or none for this player's body,
so catch it when the name comes from a player. It returns `false` when the
player cannot act, is riding, already carries an item or a body, or is not
connected.

`true` means the order went out, not that the carry started. The carry stands
once their game reports it: `playerCarryItem` fires and
[`player.carriedItem`](../../reference/server/classes/Player.md#carrieditem)
names the item. Their hands have to be free: a drawn weapon or a torch makes
their game refuse, and nothing is reported.

## Put it down

```ts
if (player.carriedItem) player.putDownItem();   // the game's own put-down
player.putDownItem({ immediate: true });        // let go at once, no clip
```

[`putDownItem`](../../reference/server/classes/Player.md#putdownitem) returns
`false` when they carry nothing. Either way, `playerPutDownItem` follows once
the item leaves their hands.

## Lay out props to carry

`GroundItem.spawn` with `carryable: true` lays a prop instead of stock. The
game's pick-up prompt over it starts a carry, and it never goes into an
inventory. It has to be a single item from the table above.

```ts
const basket = GroundItem.spawn("stonebasket", player.position, new Vector3(0, 0, 0), 1, player.virtualWorld, { carryable: true });
basket.carryable;          // true; so is every prop a carry put down
player.carryItem(basket);  // have them bend down and take up this one
```

Given a `GroundItem`, `carryItem` returns `false` when the prop is not
resting within their reach or somebody else is already taking it. Once a
carry takes a prop up, `groundItemPickup` and `groundItemDestroy` fire for it
as for any pickup. A put-down prop counts against the player's stacks on the
ground; past that limit the item is simply gone, and `playerPutDownItem` hands
over `null`.

## Refuse a carry

`playerCarryingItem` asks before a carry the player started is accepted: the
pick-up prompt over a prop, or an item taken from one of the world's own
piles. Return `false` and the prop stays where it is, or the pile's item is
let go at once. Handlers run synchronously, so the answer cannot wait on
anything awaited. A carry your script ordered with `carryItem` is not asked.

```ts
Events.on("playerCarryingItem", (player, item, groundItem) => {
  if (item === "barrel" && player.virtualWorld !== 0) return false;
});
```

## Item carry events

| Event | Arguments | When |
| --- | --- | --- |
| `playerCarryingItem` | `player`, `item`, `groundItem` | The player started a carry. Return `false` to refuse. `groundItem` is `null` for a pile. |
| `playerCarryItem` | `player`, `item`, `groundItem` | The carry is accepted. `groundItem` is the prop it came from, readable now and gone a moment later, or `null`. |
| `playerPutDownItem` | `player`, `item`, `groundItem` | The carry is over: put down, `putDownItem`, into a pile, or they left. `groundItem` is the new prop, still falling, or `null`. |

`item` is always the item's name.

## Carry another player's body

A player who is down, dead or unconscious, offers the game's own "grab body"
prompt, and another player can carry them on the shoulder. A player your
script revives at once is never there to carry. The game offers the prompt
only to male carriers.

```ts
Events.on("playerCarrying", (carrier, carried) => carrier.virtualWorld === carried.virtualWorld);
Events.on("playerCarry", (carrier, carried) => Chat.sendToPlayer(carried, `${carrier.nickname} is carrying you.`));
Events.on("playerPutDown", (carrier, carried) => console.log(`${carrier.nickname} put ${carried.nickname} down`));
```

| Event | Arguments | When |
| --- | --- | --- |
| `playerCarrying` | `carrier`, `carried` | The carrier picked the body up. Return `false` and they let go at once. |
| `playerCarry` | `carrier`, `carried` | The body is on the carrier's shoulder for everyone. |
| `playerPutDown` | `carrier`, `carried` | The carry is over: dropped, `putDown`, the carried player revived, or either left. |

[`carrier.carrying`](../../reference/server/classes/Player.md#carrying) names
the carried player and
[`carried.carriedBy`](../../reference/server/classes/Player.md#carriedby) the
carrier, `null` otherwise. `carrier.putDown()` has them put the body down with
the game's own put-down, and returns `false` when they carry nobody.

:::tip[Try it]
The default gamemode's `/carry <item>`, `/carry prop <item>` and
`/carry drop [now]` try out item carrying.
:::

## Related

- [Items](../items/): ground items, which put-down props are
- [Teleport, kick and other actions](../actions/): reviving a downed player
- [Hand props](../../resources/animation-props/): the props and the hand each goes in
- [Player reference](../../reference/server/classes/Player.md)
