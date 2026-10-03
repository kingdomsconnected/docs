---
title: "Screen effects: drunk, hurt, dreaming"
description: Put the game's own colour grade, blur, ghosting and blood overlay on one player's picture from a client script, with fades and timed effects.
sidebar:
  label: Screen effects
  order: 76
---

[`Hud.addScreenEffect`](../../reference/client/variables/Hud.md#addscreeneffect)
puts a full-screen post effect on this player's own picture: a colour grade, a
blur, ghosting or the game's blood overlay. Use it for intoxication, injury,
poison, dreams or a place that should feel wrong.

```ts
// Ease a drunk look in over two seconds.
const grade = Hud.addScreenEffect("colorGrade", { saturation: 0.7, contrast: 0.9, yellow: 0.05 }, { fadeInMs: 2000, fadeOutMs: 3000 });
const blur = Hud.addScreenEffect("blur", { amount: 0.4 }, { fadeInMs: 2000, fadeOutMs: 3000 });

Hud.updateScreenEffect(blur, { amount: 0.6 }, { fadeMs: 2000 }); // another drink
Hud.removeScreenEffect(grade);                                    // sober up over the 3 s fade-out
```

Screen effects are presentation, not state. Nothing is replicated, nobody else
sees them, and none of them makes a player drunk or hurt. Whatever decides that,
usually the server, keeps the state and tells the client what to show. See
[Server vs client authority](../../core-concepts/authority/).

## The effects

| Effect | Parameters | What it does |
| --- | --- | --- |
| `colorGrade` | `saturation`, `brightness`, `contrast`, `cyan`, `magenta`, `yellow`, `darkness`, `hue` | Re-grades the whole picture |
| `blur` | `amount` | Blends the picture towards a blurred copy of itself |
| `ghosting` | `amount` | Earlier frames linger over the current one, leaving trails behind anything that moves |
| `screenBlood` | `amount` | Blood smears in from the edges of the screen |

| Parameter | Range | Leaves the picture alone at | Default |
| --- | --- | --- | --- |
| `saturation`, `brightness`, `contrast` | 0 to 2 | 1 | 1 |
| `cyan`, `magenta`, `yellow`, `darkness` | 0 to 1 | 0 | 0 |
| `hue` | -1 to 1 (times 180 degrees) | 0 | 0 |
| `amount` (blur, ghosting, blood) | 0 to 1 | 0 | 0.5 |

A value outside its range is clamped. A parameter you leave out takes its
default, and one the effect does not take throws. `Hud.screenEffects()` returns
the same list at runtime, with a description of every parameter.

There is no vignette: this build of the game has no parameter for one.

## Fade, time and change an effect

`addScreenEffect(effect, params?, options?)` returns a handle. Its options:

| Option | What it does |
| --- | --- |
| `fadeInMs` | Brings the effect up from nothing over that long |
| `fadeOutMs` | How long it takes to go, when its duration runs out or on `removeScreenEffect` |
| `durationMs` | Ends it on its own after that long, before the fade-out. 0, the default, keeps it until removed |

Fades are up to a minute. A fade moves each parameter towards the value where
it leaves the picture alone, so a fading grade softens rather than switching
off.

```ts
// One flash of blood for a hit: up fast, gone on its own.
Hud.addScreenEffect("screenBlood", { amount: 1 }, { fadeInMs: 80, durationMs: 250, fadeOutMs: 900 });
```

| Call | Returns |
| --- | --- |
| `updateScreenEffect(handle, params, { fadeMs })` | False when the handle is gone or another resource owns it. Parameters left out keep their value |
| `removeScreenEffect(handle, { fadeOutMs })` | False likewise. Without `fadeOutMs` it uses the one it was created with; 0 removes it at once |
| `removeAllScreenEffects()` | How many of this resource's effects it removed |
| `isScreenEffectActive(handle)` | True until it has faded out, run its duration, or been dropped |

## How several effects combine

Effects from every resource stack on top of the game's own grade, which already
drains colour as health runs low:

- `saturation`, `brightness` and `contrast` multiply.
- `cyan`, `magenta`, `yellow`, `darkness` and `hue` add.
- `blur`, `ghosting` and `screenBlood` draw the strongest one asked for.

The result does not depend on which resource asked first, and removing one
effect leaves the game's grade and every other effect as they were.

## Who owns an effect

An effect belongs to the resource that created it. Only that resource can
update or remove it, and it goes when the resource stops, when the session ends
or when the level changes. Up to 64 effects are kept across every resource;
past that, `addScreenEffect` returns 0.

:::caution
A cutscene that resets the game's post-processing clears the screen until the
effect next changes, while `isScreenEffectActive` still says true. Call
`updateScreenEffect` again after a cutscene to bring it back.
:::

## Drive it from the server

The server decides how drunk a player is and sends the client a level:

```ts
// server
player.emit("my-mode:drunk", JSON.stringify({ level: 0.6 }));
```

```ts
// client
let blur = 0;

Events.on("my-mode:drunk", (payload) => {
  const level = (payload as { level?: unknown }).level;
  if (typeof level !== "number") return;
  if (level === 0) {
    if (blur !== 0) Hud.removeScreenEffect(blur);
    blur = 0;
  } else if (blur === 0) {
    blur = Hud.addScreenEffect("blur", { amount: 0.6 * level }, { fadeInMs: 2000, fadeOutMs: 3000 });
  } else {
    Hud.updateScreenEffect(blur, { amount: 0.6 * level }, { fadeMs: 2000 });
  }
});
```

The default gamemode's `/screenfx` command (`src/client/screen.ts`) has fuller
intoxication and injury examples: `/screenfx drunk 0.8`, `/screenfx hit`,
`/screenfx clear`.

## Related

- [HUD messages, nametags and compass](../../user-interface/hud/): the rest of `Hud`.
- [Camera and free camera](../camera/): move the view itself.
- [Networking](../../core-concepts/networking/): sending the level from the server.
