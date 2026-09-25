---
title: Dialogue choices
description: Open conversations in the game's own dialogue list, move them page by page, and handle what the player picks.
sidebar:
  order: 61
---

A conversation you open from a script is drawn in the game's own dialogue list:
the same rows, in the same place, walked with the same keys as talking to any
NPC in singleplayer. You send a page of options, the player picks one, and you
get the option's id back as an event.

```ts
const session = Dialogue.open(player.id, {
  line: "What can I do for you?",
  onRight: false,
  options: [
    { id: "trade", text: "Show me your wares.", enabled: true },
    { id: "leave", text: "Nothing today.", enabled: true },
  ],
});
```

## A conversation belongs to a player, not to a thing

[`Dialogue.open`](../../../reference/server/variables/Dialogue.md#open) takes a
**player**. It does not take an NPC, a door or a position, and there is nowhere
to put one. What a conversation is *about* lives in your own code: the variable
you captured, the map you looked the speaker up in.

That is deliberate, and it costs you something. The system watches nothing on
your behalf: not distance, not line of sight, not whether the speaker is still
alive. If your story says a conversation ends when the player walks away, you
close it.

What you get in return is a conversation you can attach to anything: a smith,
a notice board, a locked gate, a timer that fires at midnight. The system
cannot tell the difference.

## Pages

A conversation is a sequence of pages. A
[page](../../../reference/server/interfaces/DialoguePage.md) is a line, a set
of options, and which side of the screen to draw on.

- `line` is the speaker's line for this page. Leave it `undefined` for a list
  with no preamble.
- `onRight` draws the list on the right of the screen instead of the left.
- `options` holds **one to eight** rows. A page with none is refused.
- Each option needs a non-empty `id` and `text`. `enabled: false` greys it out.

Text is shown as written. It is not a localization key and is not translated.

:::caution[`line` is not drawn yet]
The line reaches the client with the page, but the client does not display it
yet: it belongs to a different part of the game's HUD than the choice list.
Set it anyway, since it will start appearing without your code changing, but
put anything the player must read into the options themselves for now. (The
API reference currently says it is shown above the options. The client source
says otherwise, and the client is what the player sees.)
:::

:::note[TypeScript]
The declarations type `line`, `onRight` and `enabled` as keys that must be
present but may be `undefined`. Write them out (`line: undefined`) even when you
mean "leave it out", or the compiler rejects the page. Typing your pages as
`DialoguePage` catches the rest (a missing `id`, an empty list) before the
server does.
:::

`Dialogue.open` returns a **session id**, or `0` if the page was unusable or the
player has gone. Every other call takes the session.

```ts
const nextPage: DialoguePage = {
  line: "Anything else?",
  onRight: false,
  options: [{ id: "leave", text: "No, thank you.", enabled: true }],
};

Dialogue.update(session, nextPage); // same conversation, new page
Dialogue.close(session);            // takes the list off their screen
```

`update` keeps the session, which is what makes a run of pages one
conversation. Each page carries a generation number, so an answer still in
flight for the page you just replaced is dropped rather than read as an answer
to the new one. `update` and `close` return `false` when the session has
already ended.

## Options come back by id

```ts
Events.on("dialogueChoice", (session, player, optionId) => {
  console.log(`${player.nickname} picked ${optionId} in session ${session}`);
});
```

The event hands you the option's `id`, never its index. A page rebuilt with a
different set of rows would break every handler written against positions; the
id survives it. That makes the natural shape of a conversation a lookup:

```ts title="src/server/merchant.ts"
const PAGES: Record<string, DialoguePage> = {
  start: {
    line: "Good morrow.",
    onRight: false,
    options: [
      { id: "news", text: "Heard anything worth hearing?", enabled: true },
      { id: "leave", text: "Nothing today.", enabled: true },
    ],
  },
  news: {
    line: "Cumans on the north road. Two carts taken this week.",
    onRight: false,
    options: [
      { id: "start", text: "Tell me something else.", enabled: true },
      { id: "leave", text: "Thank you. I will be careful.", enabled: true },
    ],
  },
};

const mine = new Map<number, number>(); // player id -> session

export function talkTo(player: Player): void {
  const page = PAGES.start;
  if (!page) return;
  const session = Dialogue.open(player.id, page);
  if (session !== 0) mine.set(player.id, session);
}

Events.on("dialogueChoice", (session, player, optionId) => {
  if (mine.get(player.id) !== session) return; // not our conversation

  const next = PAGES[optionId];
  if (optionId === "leave" || !next) {
    Dialogue.close(session);
    return;
  }
  Dialogue.update(session, next);
});

Events.on("dialogueClosed", (session, player) => {
  if (mine.get(player.id) === session) mine.delete(player.id);
});
```

Nothing tracks where the player was. The server already knows which page it
last sent, so moving on is choosing the next one by name.

The `mine` map matters once more than one resource opens conversations: every
handler hears every choice. Checking that the session is yours is the whole of
sharing this API.

## Greyed rows are a hint, not a rule

An option with `enabled: false` is drawn greyed, and the highlight skips it.
That is all it does.

:::caution
`enabled` is what the row is *drawn* as, never what the choice is *allowed*
by. The server refuses a choice you did not offer, but not one you drew as
disabled. Anything an option costs must be checked and charged in your
`dialogueChoice` handler.
:::

Check the cost when the option is picked, not when the page was built: the
player may have spent the money in between. Taking items is a round trip to the
player's client, so it is a promise:

```ts
Events.on("dialogueChoice", async (session, player, optionId) => {
  if (optionId !== "bribe") return;

  const paid = await player.takeItem("money", 100);
  if (!paid.ok) {
    if (paid.removed > 0) player.giveItem("money", paid.removed); // hand back a partial take
    Dialogue.close(session);
    return;
  }
  Dialogue.update(session, {
    line: "I saw nothing.",
    onRight: false,
    options: [{ id: "leave", text: "Good.", enabled: true }],
  });
});
```

See [Give and take items](../../players/inventory/) for `takeItem`.

## Ending

`dialogueClosed` fires however a conversation ends, including the ways you did
not ask for. It always fires, so it is the one place your bookkeeping needs to
live.

| `reason` | Means |
| --- | --- |
| `0` | Completed: you called `Dialogue.close`. |
| `1` | The player pressed Esc. |
| `2` | Another conversation replaced this one. |
| `3` | It was interrupted, most often by a disconnect. |

## One at a time

A player is in at most one conversation. Opening a second closes the first with
reason `2` rather than stacking them, because the game has a single choice list.
`Dialogue.sessionOf(player.id)` tells you which one, or `0`:

```ts
if (Dialogue.sessionOf(player.id) === 0) {
  // free to start one
}
```

On the client, `Hud.isInDialogue()` answers whether any conversation owns the
screen, including one the game started with a level NPC. A client resource that
pops something up during either kind is in the way.

## Controls

| Key | Does |
| --- | --- |
| W / S, or the arrows | Move the highlight, skipping greyed rows |
| E | Pick the highlighted option |
| Esc | Close the conversation |

While a page is up the player cannot walk or look around, as with the game's
own dialogue. The keys are the game's, so a player who rebound them keeps their
bindings.

## Related

- The default gamemode's `src/server/commands/dialogue.ts` is a complete
  four-page merchant, and `/dialogue` opens it.
- [Build an NPC shop](../../../tutorials/market-stall/) opens a conversation from an
  NPC and leads into a [vendor](../vendors/).
