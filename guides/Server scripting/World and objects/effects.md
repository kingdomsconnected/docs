---
title: Particle effects (fire, smoke...)
description: Place lasting particle effects like fires and smoke, fire one-off bursts at a point or on an entity, and find effect names.
sidebar:
  order: 46
---

The server can play any of the game's own particle effects (fire, smoke,
sparks, blood, dust) for everyone near them. There are two ways, and picking
the right one matters: a **placed** effect is an entity that stays and streams
to whoever comes near, and a **burst** is a one-off message to whoever is
there right now. Both live on the server [`Vfx`](../../../reference/server/classes/Vfx.md)
class.

```ts
const at = player.position;
const fire = Vfx.spawn("WH_Particels.fires.campfire_a", new Vector3(at.x, at.y + 3, at.z), { prime: true });
Vfx.burst("collisions.combat.sword_sword", at);
```

(`WH_Particels` is how the game itself spells the library. Copy names, do not
retype them.)

## Names

An effect name is `library.group.effect`, exactly as the game's particle
libraries spell it. [`Vfx.list(prefix?)`](../../../reference/server/classes/Vfx.md#list)
returns the whole vocabulary, about 600 names, or the ones that start with a
prefix:

```ts
for (const name of Vfx.list("WH_Particels.fires")) console.log(name);
```

The list is mined from the game at build time and is the same one clients
have. A placed effect also reads back as `effect`, `library` (`WH_Particels`)
and `group` (`fires`).

## Placed effects: `Vfx.spawn`

Use `spawn` for anything that should be there for as long as you want it: a
campfire, a torch, smoke over a burning house. It is a replicated entity, so a
player who arrives later sees it, and it lasts until you destroy it.

```ts
const smoke = Vfx.spawn(
  "WH_Particels.fires.campfire_a",
  new Vector3(1024, 512, 40),
  {
    prime: true,      // start already running, instead of growing from nothing
    scale: 1.5,       // multiplies every authored size, 0.01 to 32
    countScale: 2,    // more particles, 0.01 to 16
  },
  player.virtualWorld,
);
```

`prime: true` is almost always what you want for fires and plumes; without it
the effect visibly starts from zero. Other options: `rotation` aims the
emitter, `speedScale` (0 to 16) and `timeScale` (0.01 to 16) change emission
speed and the emitter's clock, `strength` (-1 to 1, -1 meaning "as authored")
feeds the effect's own strength curves, and `pulsePeriod` (0 to 600 s)
restarts the whole emitter every so often, which keeps a one-shot effect
repeating. `durationMs` is ignored by `spawn`.

It streams to players within the effect's own draw distance, clamped to 25 to
250 metres.

All the tuning values are also writable on the handle. Each assignment
**restarts** the effect on every client that can see it, because an emitter
reads its settings once when it starts. Values outside the ranges are
clamped.

## One-off effects: `Vfx.burst` and `Vfx.burstOn`

A burst plays once and keeps nothing on the server. It goes only to the
clients close enough to draw it (the effect's own draw distance again), so a
blood spray reaches the people standing there. Someone who walks up a second
later sees nothing, which is right for a spark and wrong for a campfire.

```ts
// At a point. durationMs: how long each client keeps the emitter, default 2 s, max 60 s.
const told = Vfx.burst("collisions.combat.sword_sword", player.position, { durationMs: 1000 });

// On an entity, following it: any replicated handle, or a bare network id.
Vfx.burstOn("collisions.combat.sword_sword", player, { offset: new Vector3(0, 0, 1.2) });
```

Both return how many clients were told, which is `0` when nobody was near.
`burstOn` takes an `offset` in the entity's own space, up to 8 m from its
origin; a client that has not streamed that entity in drops the burst rather
than play it somewhere else. `burst` takes an optional virtual world as its
last argument; `burstOn` uses the entity's.

## Lists and cleanup

```ts
const torch = Vfx.spawn("WH_Particels.fires.campfire_a", player.position, { prime: true });

Vfx.all(3);              // placed effects in virtual world 3 (omit for all)
Vfx.getById(torch.id);   // one, or null
torch.destroy();         // stop this one
Vfx.destroyAll(3);       // every placed effect in world 3; returns the count
Vfx.destroyAll();        // every placed effect on the server
```

Bursts are not in these lists; there is nothing to clean up after one. Placed
effects stay after your resource stops, so destroy yours in `resourceStop`
(see the tracking pattern on the [Props](../props/#lists-and-cleanup) page).

| Event | Arguments | When |
| --- | --- | --- |
| `vfxSpawn` | `vfx` | Right after an effect is placed. |
| `vfxDestroy` | `vfx` | While it is being stopped. The handle still reads. |

Bursts raise no events.

## What fails, and how

- `Vfx.spawn` and `Vfx.burst` **throw** for a name that is not an effect.
  Catch them when the name came from a player.
- Numeric options are clamped into range.
- Each client can play 192 effects at once across everything: placed ones in
  range, bursts, and whatever client resources start. Past that, new ones do
  not appear. Be sparing with long bursts and large `countScale`.

## On the client

Client resources have their own `Vfx` global that plays effects on that one
machine only (`spawn`, `attach`, `stop`, `has`, `list`). Nothing it starts is
replicated, so use it for things only that player should see, like a hit
marker or a UI flourish. Anything every player should see goes through the
server calls on this page.

:::tip[Try it]
The default gamemode's `/vfx <effect> [scale]` places a primed effect three
metres ahead, `/vfx burst <effect>` fires one off, and `/vfx names <prefix>`
lists names (`src/server/commands/vfx.ts`).
:::
