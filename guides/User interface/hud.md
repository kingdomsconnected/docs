---
title: HUD messages, nametags and compass
description: Show the game's own notifications and toasts, control nametags and labels above heads, and hide the compass, from a client script.
sidebar:
  label: HUD and nametags
  order: 82
---

Before you build a web view, check whether the game already draws what you
want. [`Hud`](../../reference/client/variables/Hud.md) uses the game's own
notifications, toasts and info line,
[`Nametags`](../../reference/client/variables/Nametags.md) the names over heads,
and [`Compass`](../../reference/client/variables/Compass.md) the strip at the top
of the screen. All three act on this machine only: to show something to every
player, have the server tell every client.

## Show a notification

A server event that a small client handler turns into a HUD call:

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

Every `Hud` call answers `false` when there is no HUD, in the main menu and
during a level load. Nothing is queued, so resend anything important after the
player spawns. The HUD is one-shot: apart from `clearNotifications`, you cannot
read back or cancel what you showed.

## Show info text and toasts

| Call | What the player sees |
| --- | --- |
| `showNotification(message)` | One plain line, no icon |
| `showInfoText(message, durationMs?, priority?)` | The single info line above the HUD; 3000 ms by default |
| `hideInfoText()` | Takes the info line down early |
| `showPerkGained(iconName, name)` | The perk-earned toast |
| `showPerkUsed(iconName, name)` | The perk-used toast |
| `showComboLearned(iconName, name)` | The combo-learned toast |
| `showXpGain(stat, statName, type?)` | The experience toast against a stat's bar |
| `showReputationChanged(eventId, message)` | A reputation message |
| `showRandomEventResult(type, result, name)` | The random-event result panel |
| `showTutorial(name)`, `hideTutorial(name)`, `hideCurrentTutorial()` | One of the game's tutorials, by table name |
| `hideCodexActionHint()` | Takes the codex hint down |
| `clearNotifications()` | Empties the queue of waiting notifications |

```ts
Hud.showInfoText("Round starts in 10 seconds", 5000);
Hud.showPerkGained("perk_alchemist", "Master of the Market");
Hud.showXpGain("str", "Strength");
```

Text is shown as written, not translated. The other arguments are game data
ids: `iconName` from the icon atlas (`perk_alchemist`), `stat` a stat's unique
name (`str`), a tutorial name a table row (`OB_O20_Inventory`).

## Check whether the player is in a conversation

`Hud.isInDialogue()` is true while any conversation owns the screen, whether a
server resource opened it through `Dialogue` or the game started it with an NPC.
Avoid popping things up over it:

```ts
function announce(text: string): void {
    if (Hud.isInDialogue()) {
        Hud.showInfoText(text);
    } else {
        Hud.showNotification(text);
    }
}
```

## Set a player's nametag

The **server** decides what each tag says and whether others see it, for
everyone, with methods on
[`Player`](../../reference/server/classes/Player.md#setnametagtext):

```ts
// server
player.setNametagText("[Guard] Hans"); // no argument or "" restores the name
player.setNametagColor(0xffc9a227);    // 0xAARRGGBB
player.setNametagHealthVisible(false);
player.setNametagVisible(true);
```

Each **client** then decides what it draws for itself. A player the server hid
stays hidden either way.

```ts
Nametags.setVisible(false);        // hide every tag, for this player only
Nametags.setHealthVisible(false);  // names, no health bars
```

A client reads the server's settings off any player handle with
`isNametagVisible()`, `isNametagHealthVisible()`, `getNametagText()` and
`getNametagColor()`.

## Show a label above a head

`Nametags.setLabel` hangs a short, temporary line above an entity's name: a
speech line, an emote, a status. It follows the body, fades with distance and
hides behind cover like the name. It is local, like everything here.

```ts
declare const speakerId: number; // the server-side player.id

Nametags.setLabel(speakerId, "Stand aside!", 4000, 0xffffffff);
Nametags.setLabel(speakerId, "Line one\nLine two"); // 6000 ms, tag colour
Nametags.clearLabel(speakerId);
Nametags.clearLabels();
```

- A duration of 0 or less holds the label until you clear it.
- A colour of 0 uses the tag's own colour. An empty text clears the label.
- A player who turned nametags off sees no labels either.

:::note
Nametag colours are `0xAARRGGBB`, alpha first. Chat colours are `0xRRGGBBAA`,
alpha last. Write the alpha byte out (`0xff...`) so the intent is visible.
:::

## Hide the compass

KCD2 has no minimap; the compass strip is the closest thing.

```ts
Compass.visible = false;
```

This hides the whole strip, the same way a cutscene does, and is released when
the session ends. `visible` reads back only your own change, so it can say
`true` while the game hides the compass for a cutscene. `Compass.markCount` is
how many marks the compass carried at the last tick, the game's included. To
add marks, use [blips](../map/#put-a-blip-on-the-compass).

## Related

- [Map markers and blips](../map/): your own marks on the compass and map.
- [Chat and /commands](../../players/chat/): messages in the chat box instead of the HUD.
- [Teleport, kick and other player actions](../../players/actions/): the server-side nametag controls in context.
- [Show an HTML page (web views)](../web-views/): when the game has nothing that fits.
