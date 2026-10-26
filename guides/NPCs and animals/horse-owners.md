---
title: Give a horse an owner
description: Make a horse a player's own, decide who may ride it, wake it from a knockout, and choose whether it leaves with its owner or waits for them to come back.
sidebar:
  label: Horse owners
  order: 54
---

A horse can belong to a player. Every client then treats it as that player's
horse in the game's own terms, so riding it is never horse theft and a blow
knocks it out rather than killing it. By default it is removed when its owner
disconnects.

```ts
const horse = Horse.spawn(player.position, player.rotation, "pebbles", `${player.nickname}'s horse`);
horse.giveTo(player);
```

## Give a horse away

```ts
horse.giveTo(target); // target owns it now
horse.giveTo(null);   // nobody does

horse.owner;          // the Player it belongs to, or null
horse.ownerId;        // that player's id, or 0
```

`giveTo` throws when `target` is not a connected player, and
`horseOwnerChanged` fires after it. A spawned horse belongs to nobody until
you give it to someone. The owner is not necessarily the rider: read
`horse.rider` for who is in the saddle.

## Decide who may ride it

Owning a horse does not stop anyone else riding it. To make that the rule,
refuse the mount in `horseMounting`:

```ts
Events.on("horseMounting", (horse, rider) => {
  if (horse.owner && horse.owner.id !== rider.id) {
    Chat.sendToPlayer(rider, `That is ${horse.owner.nickname}'s horse.`);
    return false;
  }
});
```

The player's game has already started climbing on, so a refusal plays the
get-off. Ownerless horses stay free for anyone here.

## Knocked out, not killed

As in single player, a player's own horse cannot die: once `giveTo` makes a
horse someone's, every client keeps it alive. A blow that would kill it leaves
it at 1 health and knocks it out instead: it lies where it fell on every
client, `alive` stays `true` and no `horseDeath` follows. It gets up by itself
when the knockout wears off, some minutes later, or at once with `wake`:

```ts
if (horse.unconscious) {
  horse.wake();                    // up on every client a moment later
  horse.health = horse.maxHealth;  // wake leaves its health as it is
}
```

| Member | What it does |
| --- | --- |
| [`unconscious`](../../reference/server/classes/Horse.md#unconscious) | `true` while the client running the horse reports it knocked out. `false` for a dead horse, and before any client has run it. |
| [`wake()`](../../reference/server/classes/Horse.md#wake) | Ends the knockout on that client. Returns `false` when the horse is not knocked out, is dead, or no client runs it. |

`unconscious` stays `true` until the client reports the horse up, so check it
again later rather than straight after `wake`. No event fires when a horse goes
down or gets up; read `unconscious` when you need to know, for example when a
player asks to tend it.

## When the owner leaves

`destroyWithOwner` decides what happens to the horse when its owner
disconnects:

| `destroyWithOwner` | On disconnect |
| --- | --- |
| `true` (default) | The horse is removed: `horseDestroy` fires, with the owner still readable. |
| `false` | The horse stays where it is, ownerless: `horseOwnerChanged` fires with `null`. |

A removed horse's rider is taken off first, with `horseDismount`. Keeping horses across a
server restart is up to you: nothing about them is saved.

## Example: a stable that remembers

`/stable` gives each player one horse. It stays in the world when they leave
and becomes theirs again when they come back.

```ts title="src/server/stable.ts"
const stabled = new Map<string, number>(); // nickname -> horse id

Events.on("playerCommand", (player, command) => {
  if (command !== "stable") return;
  if (!player.ready) {
    Chat.sendToPlayer(player, "Wait until you have spawned.");
    return;
  }

  const old = stabled.get(player.nickname);
  if (old !== undefined) Horse.getById(old)?.destroy();

  const horse = Horse.spawn(player.position, player.rotation, undefined, `${player.nickname}'s horse`);
  horse.destroyWithOwner = false; // wait for them instead
  horse.giveTo(player);
  stabled.set(player.nickname, horse.id);
});

Events.on("playerSpawned", (player) => {
  const id = stabled.get(player.nickname);
  const horse = id === undefined ? null : Horse.getById(id);
  if (horse) horse.giveTo(player);
  else stabled.delete(player.nickname);
});

Events.on("horseMounting", (horse, rider) => {
  // A waiting horse has no owner, so only its stable entry says whose it is.
  for (const [nickname, id] of stabled) {
    if (id === horse.id && nickname !== rider.nickname) return false;
  }
});
```

The map holds ids, not handles, because the horse can be killed and removed
in the meantime; `getById` then returns `null`. Nicknames are not accounts,
so a real server keys this on whatever identifies its players.

## Owner events

| Event | Arguments | When |
| --- | --- | --- |
| `horseOwnerChanged` | `horse`, `player` | After `giveTo`, or when the owner left a horse with `destroyWithOwner` off. `player` is `null` for no owner. |
| `horseDestroy` | `horse` | While a horse is removed, including with its owner. `owner` still reads. |

```ts
Events.on("horseOwnerChanged", (horse, owner) => {
  console.log(`${horse.name || horse.id} now belongs to ${owner?.nickname ?? "nobody"}`);
});
```

:::tip[Try it]
The default gamemode's `/horse give [player id]` hands the horse you are at
to someone, or to you with no id, and `/horse info` shows its owner.
:::

## Related

- [Spawn and manage horses](../horses/): spawning, gear, buffs, riders and the other horse events
- [Dog companions](../dogs/): the other animal a player can own, with the same `giveTo`
- [Chat and /commands](../../players/chat/): the `playerCommand` event used above
