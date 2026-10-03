---
title: Let players design their character
description: Open the game's own character stage so a player can pick their face, hair, beard and body, then keep the look they accept on the server.
sidebar:
  label: Character creator
  order: 86
---

[`CharacterCreator`](../../reference/client/variables/CharacterCreator.md)
opens the pause screen on its character stage, where the player dresses and
turns a figure of themselves. When they accept, the client event
`characterCreatorClosed` hands you the look. Nothing is put on the body and
nothing reaches the server by itself: your resource sends the look up and the
server applies it.

```ts title="src/client/creator.ts"
CharacterCreator.open({ appearance: undefined, genders: "both", title: "Your Character" });

Events.on("characterCreatorClosed", (appearance, reason) => {
    if (appearance !== null) Events.emitServer("my-mode:look", JSON.stringify(appearance));
});
```

## Open a creator

| Option | What it does |
| --- | --- |
| `appearance` | The look the figure starts on. Left out, it starts on the first gender offered, with the player's own look for a man and the game's default for a woman. |
| `genders` | `"male"`, `"female"` or `"both"` (the default). With both, the player can switch. |
| `title` | The panel's heading, at most 64 bytes. `Character` by default. |

`open` returns `true` and puts the stage up over the next few ticks. Malformed
options throw. Opening a second creator ends the first as `replaced`.
`CharacterCreator.close()` ends the open one as `closed` (false when none was
open), and `CharacterCreator.isOpen()` is true from `open` until its
`characterCreatorClosed`.

## What the player sees

The panel has a tab per part: **Body**, **Face**, **Hair** and, for a man,
**Beard**. Each tab picks a family first (a skin tone, a face, a hair style),
then a variant within it, with hair colours shown as swatches.

- Drag the figure to turn it, as in the inventory.
- **G** switches between man and woman when both are offered.
- **R** puts on a random look; **Backspace** goes back to the look it opened on.
- The camera frames the whole figure on Body and eases in on the head for the
  other tabs.

A strip at the foot of the panel lists the keys by the names the game gives
them on the player's own keyboard layout, so an AZERTY player sees their
letters.

## Hear how it ended

`characterCreatorClosed` fires once for every creator, on this machine only:

| `reason` | `appearance` | Means |
| --- | --- | --- |
| `accepted` | The look | The player accepted. |
| `cancelled` | `null` | The player backed out. |
| `closed` | `null` | Your script called `CharacterCreator.close()`. |
| `replaced` | `null` | Another `CharacterCreator.open` took its place. |
| `unavailable` | `null` | The stage could not be put up. |
| `interrupted` | `null` | The session or the body went away under it. |

You can open the next creator straight from the handler, for example to ask
again after `unavailable`.

## Keep the look on the server

The server decides who looks like what. Let it open the creator, then accept
a look only from a player it asked, and put it on with
[`player.setAppearance`](../../players/appearance/), which checks it against the catalog
like any other look:

```ts title="src/server/creator.ts"
const asked = new Set<number>();

export function offerCreator(player: Player): void {
    asked.add(player.id);
    player.emit("my-mode:creator", JSON.stringify({ genders: "both" }));
}

Events.onClient("my-mode:look", (sender, payload) => {
    const player = sender as Player;
    if (!asked.delete(player.id) || typeof payload !== "string") return;

    let look: unknown;
    try { look = JSON.parse(payload); } catch { return; }
    if (typeof look !== "object" || look === null || !player.setAppearance(look as Partial<Appearance>)) {
        Chat.sendToPlayer(player, "That look could not be put on.");
    }
});

Events.on("playerDisconnect", (player) => asked.delete(player.id));
```

```ts title="src/client/creator.ts"
Events.on("my-mode:creator", (payload) => {
    const genders = typeof payload === "object" && payload !== null ? (payload as { genders?: unknown }).genders : undefined;
    CharacterCreator.open({
        appearance: undefined,
        genders: genders === "male" || genders === "female" ? genders : "both",
        title: "Your Character",
    });
});

Events.on("characterCreatorClosed", (appearance, reason) => {
    if (appearance !== null) {
        Events.emitServer("my-mode:look", JSON.stringify(appearance));
    } else if (reason !== "replaced") {
        Hud.showInfoText(`Character creator closed (${reason}).`);
    }
});
```

This is the place to charge for a new look, or to save it with the player's
other data before applying it.

:::tip[Try it]
The default gamemode's `/creator [male|female|both]` command does exactly
this; `/creator stop` closes it.
:::

## Related

- [Player appearance](../../players/appearance/): the `Appearance` parts and the catalog.
- [Events](../../core-concepts/events/): `Events.emitServer` and `Events.onClient`.
- [Server vs client authority](../../core-concepts/authority/): why the server applies the look.
