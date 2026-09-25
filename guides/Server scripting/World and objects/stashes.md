---
title: Stashes (containers)
description: Spawn shared containers players can open and fill, and understand the lock and what the server can see inside.
sidebar:
  order: 43
---

A [`Stash`](../../../reference/server/classes/Stash.md) is a container in the
world that players open with the game's own inventory screen and move items
in and out of. The server spawns it and keeps its contents, so what one
player leaves in it is there for the next. Use it for a shared team chest, a
drop box, or a place to leave something for later.

```ts
const at = player.position;
const chest = Stash.spawn(new Vector3(at.x, at.y + 2, at.z));
console.log(`spawned ${chest}, shared id ${chest.stashId}`);
```

## Spawning

```ts
const chest = Stash.spawn(
  new Vector3(1024, 512, 40), // position
  new Vector3(0, 0, 180),     // rotation: Euler degrees, or a Quaternion
  player.virtualWorld,        // virtual world
);
```

Every argument is optional. A stash always starts **empty**, and there is no
server call that puts items in it. That is not an oversight you can work
around: an item class inside a container is a 16-byte engine GUID that only
the game's own parser makes from text, and the server does not run the game.
Players fill a stash by opening it and moving things in.

If you need a chest that arrives already stocked, lay the items next to it as
[ground items](../ground-items/), or give them to the player directly with
`player.giveItem`.

## Two ids

A stash has two numbers and they are not the same thing:

- `id` is the replicated entity id, like every other handle. Use it with
  `Stash.getById`.
- `stashId` is the identity each client turns into the same native container.
  The server mints it, starting from 1. You rarely need it except in logs.

## What the server can see

Contents are **not** replicated. When a player opens a stash, their client
pulls the contents from the server; when they close it, the client pushes the
new contents back. In between, only that client knows what is in it.

So the server's view is small:

| Property | What it is |
| --- | --- |
| `itemCount` | How many stacks the server is holding right now. |
| `holderId` | Network id of the player who has it open, or `0`. |

There is no list of the items themselves, and no event when a stash is opened,
closed or changed. Poll `holderId` and `itemCount` if you need to notice.

## The holder lock

While a player has a stash open, the game's own lock keeps every other client
out of it. Nobody else can open it until the holder closes the screen. That is
what stops two players taking the same item, and it also means one AFK player
standing in a chest blocks it for everyone.

```ts
function openStashes(world: number): string[] {
  return Stash.all()
    .filter((s) => s.virtualWorld === world && s.holderId !== 0)
    .map((s) => `${s.id} held by ${Player.getById(s.holderId)?.nickname ?? "someone who left"}`);
}
```

## Lists and cleanup

```ts
const box = Stash.spawn(player.position);

Stash.all();               // every container, any virtual world
Stash.getById(box.id);     // one, or null
box.destroy();             // this one, and everything in it
Stash.destroyAll(3);       // every container in virtual world 3; returns the count
Stash.destroyAll();        // every container on the server
```

:::danger[Destroying a stash destroys its contents]
`destroy` and `destroyAll` forget what was inside. Nothing drops to the ground
and nothing goes back to whoever put it there. A stash with `itemCount` above
zero is holding real items that players worked for.
:::

Stashes are also not persisted: a server restart starts with none, and their
contents are gone. A resource that stops does not remove its stashes either,
so track the ones you spawned and decide what `resourceStop` should do with
them (the [Props](../props/#lists-and-cleanup) page shows the tracking
pattern).

Unlike the other world entities, stashes raise no spawn or destroy events.

## What fails, and how

`Stash.spawn` takes only a pose and a world, so there is nothing for it to
reject. The things that go wrong are the ones above: expecting to fill it from
the server, and destroying one that still has items in it.

:::tip[Try it]
The default gamemode's `/stash` puts an empty container two and a half metres
in front of you (`src/server/commands/stash.ts`). `/give` yourself something,
open the stash and put it in, then `/stash info` shows how many are open.
`/stash clear` despawns every stash in your world, contents included.
:::
