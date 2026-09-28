---
title: Stashes (containers)
description: Spawn shared containers players can open and fill, and understand the lock and what the server can see inside.
sidebar:
  label: Stashes
  order: 42
---

A [`Stash`](../../reference/server/classes/Stash.md) is a container players
open with the game's own inventory screen. The server keeps its contents, so
what one player leaves is there for the next. Use it for a team chest, a drop
box, or a place to leave something for later.

```ts
const at = player.position;
const chest = Stash.spawn(new Vector3(at.x, at.y + 2, at.z));
console.log(`spawned ${chest}, shared id ${chest.stashId}`);
```

## Spawn a stash

Every argument is optional:

```ts
const chest = Stash.spawn(
  new Vector3(1024, 512, 40), // position
  new Vector3(0, 0, 180),     // rotation: Euler degrees, or a Quaternion
  player.virtualWorld,        // virtual world
);
```

A stash always starts **empty**, and the server cannot put items in it. Players
fill it by opening it and moving things in. For a chest that looks stocked, lay
[ground items](../../players/items/) beside it, or give items directly with
`player.giveItem`.

<details><summary>Why can't the server fill a stash?</summary>

An item class inside a container is a 16-byte engine GUID that only the game's
own parser makes from text, and the server does not run the game.

</details>

A stash has two ids. `id` is the replicated entity id, used with
`Stash.getById`. `stashId` is the identity each client maps to the same native
container; you rarely need it except in logs.

## See who has a stash open

Contents are **not** replicated. Opening a stash pulls its contents from the
server, and closing it pushes them back. In between, only that client knows
what is inside. The server sees:

| Property | What it is |
| --- | --- |
| `itemCount` | How many stacks the server is holding right now. |
| `holderId` | Network id of the player who has it open, or `0`. |

While a player has it open, nobody else can open it. That stops two players
taking the same item, but one AFK player in a chest blocks it for everyone.

There is no item list and no event for open, close or change. Poll `holderId`
and `itemCount` to notice:

```ts
function openStashes(world: number): string[] {
  return Stash.all()
    .filter((s) => s.virtualWorld === world && s.holderId !== 0)
    .map((s) => `${s.id} held by ${Player.getById(s.holderId)?.nickname ?? "someone who left"}`);
}
```

## Remove stashes

```ts
const box = Stash.spawn(player.position);

Stash.all();               // every container, any virtual world
Stash.getById(box.id);     // one, or null
box.destroy();             // this one, and everything in it
Stash.destroyAll(3);       // every container in virtual world 3; returns the count
Stash.destroyAll();        // every container on the server
```

:::danger[Destroying a stash destroys its contents]
Nothing drops to the ground and nothing goes back to whoever put it there. A
stash with `itemCount` above zero holds real items players worked for.
:::

Stashes are not persisted: a restart starts with none, contents gone. A
stopped resource does not remove its stashes, so track yours and decide what
`resourceStop` does with them (see the pattern on
[Props](../props/#clean-up-when-your-resource-stops)). Stashes raise no spawn
or destroy events.

## When a call fails

| Call | Fails when | Result |
| --- | --- | --- |
| `Stash.spawn` | Never: it takes only a pose and a world. | Always returns a stash. |
| Filling from the server | Always. | No such call exists; players fill stashes. |
| `destroy`, `destroyAll` | The stash still holds items. | Succeeds, and the items are lost. |

:::tip[Try it]
The default gamemode's `/stash` puts an empty container ahead of you
(`src/server/commands/stash.ts`). `/give` yourself something and put it in;
`/stash info` shows how many are open, and `/stash clear` despawns every stash
in your world, contents included.
:::

## Related

- [Items: give, take and drop](../../players/items/), for stocking players and the ground
- [Props](../props/), the tracking pattern for cleanup
- [Virtual worlds](../../core-concepts/virtual-worlds/), separate stashes per world
- [Stash reference](../../reference/server/classes/Stash.md)
