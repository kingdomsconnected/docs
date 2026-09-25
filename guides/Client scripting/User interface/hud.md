---
title: HUD messages, nametags and compass
description: Show the game's own notifications and toasts, control nametags and labels above heads, and hide the compass, from a client script.
sidebar:
  order: 82
---

Before you build a web view, check whether the game already draws what you
want. [`Hud`](../../../reference/client/variables/Hud.md) puts messages in the
game's own notification slots, toasts and info line, so they look native and
cost nothing. [`Nametags`](../../../reference/client/variables/Nametags.md)
controls the names over other players' heads, and
[`Compass`](../../../reference/client/variables/Compass.md) the strip along the
top of the screen.

All three act on this machine only. Nothing here is replicated: a message every
player should see is one the server sends to every client, and each client
shows it.

## A notification from the server

The usual shape is a server event that a small client handler turns into a HUD
call:

```ts
// server
player.emit("my-mode:notify", JSON.stringify({ text: "The gates open at dawn." }));
```

```ts
Events.on("my-mode:notify", (payload) => {
    if (typeof payload !== "object" || payload === null) return;
    const text = (payload as { text?: unknown }).text;
    if (typeof text === "string") Hud.showNotification(text);
});
```

Every `Hud` call answers `true` when the HUD took it and `false` when there is
no HUD to take it, which is the case in the main menu and during a level load.
Nothing is queued for later, so a message sent while the player is loading is
lost. If it matters, send it again after they spawn.

## What the HUD can show

| Call | What the player sees |
| --- | --- |
| `showNotification(message)` | One plain line, no icon |
| `showInfoText(message, durationMs?, priority?)` | The single info line above the HUD; 3000 ms by default |
| `hideInfoText()` | Takes the info line down early |
| `showPerkGained(iconName, name)` | The toast the game plays when a perk is earned |
| `showPerkUsed(iconName, name)` | The perk-used toast |
| `showComboLearned(iconName, name)` | The combo-learned toast |
| `showXpGain(stat, statName, type?)` | The experience toast against a stat's bar |
| `showReputationChanged(eventId, message)` | A reputation message |
| `showRandomEventResult(type, result, name)` | The random-event result panel |
| `showTutorial(name)`, `hideTutorial(name)`, `hideCurrentTutorial()` | One of the game's tutorials, by its table name |
| `hideCodexActionHint()` | Takes the codex hint down |
| `clearNotifications()` | Empties the queue of notifications still waiting |

The text arguments are shown as written; they are not translated. The others
are identifiers from the game's own data: `iconName` is an icon from the game's
atlas (`perk_alchemist`), `stat` is a stat's unique name (`str`), and a tutorial
name is a row in the game's tables (`OB_O20_Inventory`).

```ts
Hud.showInfoText("Round starts in 10 seconds", 5000);
Hud.showPerkGained("perk_alchemist", "Master of the Market");
Hud.showXpGain("str", "Strength");
```

The HUD is one-shot. Apart from `clearNotifications`, there is no way to read
back or cancel what you showed, so keep your own state if you need it.

## Is the player talking?

`Hud.isInDialogue()` is true while any conversation owns the screen: one a
server resource opened through `Dialogue`, or one the game started with a real
NPC. Check it before you pop something up over the player's face:

```ts
function announce(text: string): void {
    if (Hud.isInDialogue()) {
        Hud.showInfoText(text);
    } else {
        Hud.showNotification(text);
    }
}
```

## Nametags

A nametag has two owners, and they stack.

The **server** decides what each player's tag says and whether others see it.
These are methods on the server's
[`Player`](../../../reference/server/classes/Player.md#setnametagtext) and apply
for everyone:

```ts
// server
player.setNametagText("[Guard] Hans");
player.setNametagColor(0xffc9a227); // 0xAARRGGBB
player.setNametagHealthVisible(false);
player.setNametagVisible(true);
```

Calling `setNametagText()` with no argument (or an empty string) puts the
player's own name back.

Each **client** then decides what it draws for itself. `Nametags.setVisible(false)`
hides every tag for this player only, and `setHealthVisible(false)` keeps the
names but drops the bars. A player the server hid stays hidden either way.

```ts
Nametags.setVisible(false);        // a clean screenshot
Nametags.setHealthVisible(false);  // names, no bars
```

A client can read the server's settings off any player handle with
`isNametagVisible()`, `isNametagHealthVisible()`, `getNametagText()` and
`getNametagColor()`.

### Labels above a tag

`Nametags.setLabel` hangs a short, temporary line above an entity's name: a
speech line, an emote, a status. It follows the body, fades with distance and
hides behind cover like the name does. It is local, so to show one to everyone,
have the server tell every client.

```ts
declare const speakerId: number; // the server-side player.id

Nametags.setLabel(speakerId, "Stand aside!", 4000, 0xffffffff);
Nametags.setLabel(speakerId, "Line one\nLine two");  // 6000 ms, tag colour
Nametags.clearLabel(speakerId);
Nametags.clearLabels();
```

`durationMs` of 0 or less holds the label until you clear it. A colour of 0
uses the tag's own colour. An empty text clears the label, and a player who
turned nametags off sees no labels either.

:::note
Nametag colours are `0xAARRGGBB`, with alpha first. Chat colours are
`0xRRGGBBAA`, with alpha last. Write the alpha byte out (`0xff...`) so you can
see which one you meant.
:::

## The compass

KCD2 has no minimap; the compass strip is the closest thing. `Compass.visible`
shows or hides the whole strip, the same way a cutscene does, and
`Compass.markCount` says how many marks it carried at the last tick, the game's
own included.

```ts
Compass.visible = false;
```

Your change is released when the session ends. The flag only reads your own
change back, so if the game hid the compass for a cutscene, `visible` can still
say `true`. Marks on the compass are
[blips](../map/#blips-on-the-compass).

## Related

- [Map markers and blips](../map/)
- [Chat box on the client](../chat/)
- [Teleport, kick and other player actions](../../../server-scripting/players/actions/): the server-side
  nametag controls in context.
