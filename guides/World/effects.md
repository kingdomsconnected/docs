---
title: Particle effects (fire, smoke...)
description: Place lasting particle effects like fires and smoke, fire one-off bursts at a point or on an entity, and find effect names.
sidebar:
  label: Particle effects
  order: 45
---

The server can play the game's particle effects (fire, smoke, sparks, blood,
dust) for everyone near them, with the server
[`Vfx`](../../reference/server/classes/Vfx.md) class. A **placed** effect stays
and streams to whoever comes near. A **burst** plays once for whoever is there
now.

```ts
const at = player.position;
const fire = Vfx.spawn("WH_Particels.fires.campfire_a", new Vector3(at.x, at.y + 3, at.z), { prime: true });
Vfx.burst("collisions.combat.sword_sword", at);
```

`WH_Particels` is how the game spells the library. Copy names, do not retype
them.

## Find an effect name

A name is `library.group.effect`.
[`Vfx.list(prefix?)`](../../reference/server/classes/Vfx.md#list) returns the
whole vocabulary (about 600 names, the same list clients have, and listed in
[Particle effects](../../resources/effects/)), or those starting with a prefix:

```ts
for (const name of Vfx.list("WH_Particels.fires")) console.log(name);
```

A placed effect reads back as `effect`, `library` (`WH_Particels`) and `group`
(`fires`).

## Place a lasting effect

Use `Vfx.spawn` for a campfire, a torch, smoke over a burning house. It is a
replicated entity, so late arrivals see it, and it lasts until destroyed. It
streams within the effect's own draw distance, clamped to 25 to 250 m.

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

`prime: true` is almost always right for fires and plumes. Other options:

| Option | Range | Effect |
| --- | --- | --- |
| `rotation` | | Aims the emitter. |
| `speedScale` | 0 to 16 | Emission speed. |
| `timeScale` | 0.01 to 16 | The emitter's clock. |
| `strength` | -1 to 1 | Feeds the effect's strength curves; -1 means as authored. |
| `pulsePeriod` | 0 to 600 s | Restarts the emitter every so often, keeping a one-shot effect repeating. |
| `durationMs` | | Ignored by `spawn`. |

## Change a placed effect

Every tuning value is writable on the handle. Each assignment **restarts** the
effect on every client that sees it, because an emitter reads its settings
once. Out-of-range values are clamped.

## Play a one-off burst

A burst keeps nothing on the server and goes only to clients within draw
distance. Someone who walks up a second later sees nothing: right for a spark,
wrong for a campfire.

```ts
// At a point. durationMs: how long each client keeps the emitter, default 2 s, max 60 s.
const told = Vfx.burst("collisions.combat.sword_sword", player.position, { durationMs: 1000 });

// On an entity, following it: any replicated handle, or a bare network id.
Vfx.burstOn("collisions.combat.sword_sword", player, { offset: new Vector3(0, 0, 1.2) });
```

Both return how many clients were told (`0` when nobody was near). `burstOn`
takes an `offset` in the entity's space, up to 8 m, and a client that has not
streamed the entity drops it. `burst` takes an optional virtual world last;
`burstOn` uses the entity's. Bursts raise no events.

## Remove effects

```ts
const torch = Vfx.spawn("WH_Particels.fires.campfire_a", player.position, { prime: true });

Vfx.all(3);              // placed effects in virtual world 3 (omit for all)
Vfx.getById(torch.id);   // one, or null
torch.destroy();         // stop this one
Vfx.destroyAll(3);       // every placed effect in world 3; returns the count
Vfx.destroyAll();        // every placed effect on the server
```

Bursts are not listed and need no cleanup. Placed effects outlive your
resource, so destroy yours in `resourceStop` (see
[Props](../props/#clean-up-when-your-resource-stops)).

| Event | Arguments | When |
| --- | --- | --- |
| `vfxSpawn` | `vfx` | Right after an effect is placed. |
| `vfxDestroy` | `vfx` | While it is stopped. The handle still reads. |

## When a call fails

| Call | Fails when | Result |
| --- | --- | --- |
| `Vfx.spawn`, `Vfx.burst` | The name is not an effect. | **Throws.** Catch it when the name came from a player. |
| Any numeric option | Out of range. | Clamped. |
| Any effect | A client already plays 192 effects (placed, bursts and client-side, combined). | New ones do not appear. Go easy on long bursts and large `countScale`. |

## On the client

Client resources have their own `Vfx` that plays on that machine only
(`spawn`, `attach`, `stop`, `stopAll`, `isPlaying`, `has`, `list`). Nothing is
replicated, so use it for what only that player should see, like a hit marker.
Every effect it starts has a duration and stops when the session ends.

```ts
// client
const me = LocalPlayer;
if (me) {
  const handle = Vfx.spawn("collisions.combat.sword_sword", me.position, { durationMs: 1500 });
  console.log(`playing: ${Vfx.isPlaying(handle)}`);
}
```

:::tip[Try it]
The default gamemode's `/vfx <effect> [scale]` places a primed effect ahead,
`/vfx burst <effect>` fires one off, and `/vfx names <prefix>` lists names
(`src/server/commands/vfx.ts`).
:::

## Related

- [Vfx reference](../../reference/server/classes/Vfx.md), every option
- [Props](../props/), to pair a fire with a model
- [Virtual worlds](../../core-concepts/virtual-worlds/), per-world effects
- [Server vs client authority](../../core-concepts/authority/), what client-only means
