---
title: Dialogue
sidebar:
  order: 35
---

A conversation you open from a script is drawn in the game's own dialogue list
— the same rows, in the same place, walked with the same keys as talking to any
NPC in the singleplayer game. There is no interface to build.

```js
Dialogue.open(player.id, {
  line: "What can I do for you?",
  onRight: false,
  options: [
    { id: "trade", text: "Show me your wares.", enabled: true },
    { id: "leave", text: "Nothing today.", enabled: true },
  ],
});
```

The player sees four rows of the game's own UI, moves with `W` and `S`, and
picks with `E`. Their choice arrives back as an event.

## A conversation belongs to a player, not to a thing

This is the one idea worth getting straight, because everything else follows
from it.

`Dialogue.open` takes a **player**. It does not take an NPC, a door, a chest or
a position, and there is nowhere to put one. What a conversation is *about*
lives in your own code — the variable you captured, the map you looked the
speaker up in, the closure your handler runs inside.

That is deliberate, and it costs you something worth knowing in advance. The
system watches nothing on your behalf: not distance, not line of sight, not
whether the person being spoken to is still alive or even still loaded. None of
those are knowable without a relationship it does not hold. If your fiction
says a conversation should end when the player walks away, you close it.

What you get for that is a conversation you can attach to anything. A smith, a
notice board, a locked gate, a timer that fires at midnight, a trigger volume,
or nothing at all. The system cannot tell the difference and never asks.

## Pages

A conversation is a sequence of pages. A page is a line, a set of options, and
which side of the screen to draw on.

```js
const session = Dialogue.open(player.id, page);
```

`open` returns a **session id**, or `0` if the page was unusable or the player
has gone. Keep it: every other call takes it.

To move the conversation on, replace the page:

```js
Dialogue.update(session, nextPage);
```

`update` keeps the same session, which is what makes a sequence of pages one
conversation rather than a burst of unrelated ones. It returns `false` when the
session has already ended.

```js
Dialogue.close(session);
```

`close` takes the list off the player's screen and raises `dialogueClosed`.

## Options come back by id

```js
Events.on("dialogueChoice", (session, player, optionId) => {
  if (optionId === "trade") openShopFor(player);
});
```

The event hands you the option's **`id`**, never its index. That is not a
detail: a page rebuilt with a different set of rows would break every handler
written against positions, and the id survives it.

This is what makes the natural shape of a conversation a lookup rather than a
graph:

```js
const PAGES = {
  start: {
    line: "Good morrow.",
    onRight: false,
    options: [
      { id: "wares", text: "Show me what you have.", enabled: true },
      { id: "news",  text: "Heard anything worth hearing?", enabled: true },
      { id: "leave", text: "Nothing today.", enabled: true },
    ],
  },
  wares: { /* ... */ },
  news:  { /* ... */ },
};

Events.on("dialogueChoice", (session, player, optionId) => {
  if (optionId === "leave") {
    Dialogue.close(session);
    return;
  }
  Dialogue.update(session, PAGES[optionId]);
});
```

Nothing tracks where the player was. The server already knows which page it
last sent, so advancing is choosing the next one by name.

## Greying a row out

An option with `enabled: false` draws greyed and cannot be picked. The
highlight skips over it.

```js
{ id: "bribe", text: "Perhaps we can come to an arrangement.", enabled: player.money >= 100 }
```

> **Note:** `enabled` is what the row is *drawn* as, never what the choice is
> *allowed* by. The server re-checks every answer when it arrives, so an option
> that costs something must charge it in your handler — not rely on the row
> having been greyed. A client that sends a choice you did not offer is already
> refused; one that sends a choice you drew as disabled is not.

Check the cost when the option is taken, not when the page was built. The
player may have spent the money in between:

```js
Events.on("dialogueChoice", (session, player, optionId) => {
  if (optionId === "bribe") {
    if (player.money < 100) {
      Dialogue.update(session, PAGES.tooPoor);
      return;
    }
    player.money -= 100;
  }
});
```

## Ending

`dialogueClosed` fires however a conversation ends, including the ways you did
not ask for.

```js
Events.on("dialogueClosed", (session, player, reason) => {
  // 0 completed, 1 the player cancelled, 2 replaced, 3 interrupted
});
```

| `reason` | Means |
| --- | --- |
| `0` | You called `Dialogue.close`. |
| `1` | The player pressed `Esc`. |
| `2` | Another conversation replaced this one. |
| `3` | It was interrupted — a disconnect, most often. |

Use it to drop whatever you were keeping for that conversation. It always
fires, so it is the only place that bookkeeping needs to live.

## One at a time

A player is in at most one conversation. Opening a second closes the first with
reason `2` rather than stacking them, because the game has a single choice list
and two conversations claiming it would lie about which one is live.

`Dialogue.sessionOf(player.id)` answers which one, or `0`:

```js
if (Dialogue.sessionOf(player.id) !== 0) {
  return; // already talking to somebody
}
```

If more than one resource opens conversations on your server, check the session
is yours before acting on a choice. Leaving other people's conversations alone
is the whole of sharing this API:

```js
const mine = new Map(); // player id -> session

Events.on("dialogueChoice", (session, player, optionId) => {
  if (mine.get(player.id) !== session) return;
  // ...
});
```

## Asking whether the player is busy

On the **client**, `Hud.isInDialogue()` answers whether a conversation owns the
screen right now:

```js
if (Hud.isInDialogue()) return;
```

It is true for a conversation a resource opened *and* for one the game started
by itself — a real NPC the player walked up to and talked to. Both count. A
client resource that pops something up during the game's own dialogue is as
wrong as one that does it during yours.

## Limits and shape

- A page carries **at least one and at most eight** options. A page with none
  is refused, and `open` returns `0`.
- Every option needs a non-empty `id` and a non-empty `text`.
- `line` and `onRight` are optional. `onRight` draws the list on the right of
  the screen instead of the left.
- Option text is shown **as written**. It is not a localization key and is not
  translated, so it arrives on screen exactly as your script authored it.

> **Note:** `line` is carried but not yet drawn. The line above the options
> belongs to a different piece of the game's HUD than the list does. Set it —
> it is part of the page and will start appearing without your code changing —
> but do not rely on the player reading it today. Put anything they must see in
> the options themselves.

## Controls

| Key | Does |
| --- | --- |
| `W` / `S`, or the arrows | Move the highlight, skipping greyed rows |
| `E` | Pick the highlighted option |
| `Esc` | Close the conversation |

While a page is up the player cannot move or look around: the conversation
takes input the same way the game's own dialogue does. The keys are the game's
own, so a player who has rebound them keeps their bindings.

## A worked example

The default gamemode ships one. `/dialogue` opens a four-page merchant, and its
source is the shortest complete thing to read before writing your own.
