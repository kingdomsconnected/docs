---
title: Dialogue choices
description: Open conversations in the game's own dialogue list, move them page by page, and handle what the player picks.
sidebar:
  label: Dialogue
  order: 61
---

A conversation you open is drawn in the game's own dialogue list, walked with
the same keys as in singleplayer. You send a page of options, the player picks
one, and you get the option's id back in `dialogueChoice`.

```ts
const greeting: DialoguePage = {
  line: "What can I do for you?",
  onRight: false,
  options: [
    { id: "news", text: "Any news?", enabled: true },
    { id: "leave", text: "Nothing today.", enabled: true },
  ],
};

const open = Dialogue.open(player.id, greeting);

Events.on("dialogueChoice", (session, who, optionId) => {
  if (session !== open) return; // not our conversation
  if (optionId === "news") Chat.sendToPlayer(who, "Cumans on the north road.");
  Dialogue.close(session);
});
```

:::note
[`Dialogue.open`](../../reference/server/variables/Dialogue.md#open) takes a
player, not an NPC or a place. Nothing watches distance, line of sight or
whether the speaker is alive: if the conversation should end when the player
walks away, close it yourself.
:::

## Build a page

A [page](../../reference/server/interfaces/DialoguePage.md) is a line, the
options, and which side of the screen to draw on.

| Field | Means |
| --- | --- |
| `line` | The speaker's line. `undefined` for a list with no preamble. |
| `onRight` | Draw the list on the right instead of the left. |
| `options` | **One to eight** rows. A page with none is refused. |
| `options[].id`, `.text` | Both required and non-empty. `id` is what comes back. |
| `options[].enabled` | `false` draws the row greyed and the highlight skips it. |

Text is shown as written; it is not a localization key.

:::caution[`line` is not drawn yet]
The client receives `line` but does not display it yet, although the API
reference says it is shown above the options. Set it anyway, but put anything
the player must read into the options for now.
:::

:::note[TypeScript]
`line`, `onRight` and `enabled` are typed as required keys that may be
`undefined`. Write `line: undefined` rather than leaving one out. Typing pages
as `DialoguePage` catches the rest before the server does.
:::

## Open, update and close

```ts
const nextPage: DialoguePage = {
  line: "Anything else?",
  onRight: false,
  options: [{ id: "leave", text: "No, thank you.", enabled: true }],
};

Dialogue.update(session, nextPage); // same conversation, new page
Dialogue.close(session);            // takes the list off their screen
```

- `Dialogue.open` returns a **session id**, or `0` if the page was unusable or
  the player has gone.
- `update` keeps the session. An answer still in flight for the replaced page
  is dropped, not read as an answer to the new one.
- `update` and `close` return `false` once the session has ended.

## Handle a choice

The event gives you the option's `id`, never its index, so a conversation is a
lookup from id to next page:

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

Every handler hears every choice from every resource, so check that the
session is yours.

## Charge for an option

`enabled: false` only changes how a row is drawn. The server refuses a choice
you did not offer, but not one you drew greyed, so check and charge the cost in
your `dialogueChoice` handler, when it is picked:

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

See [Items](../../players/items/) for `takeItem`.

## When a conversation ends

`dialogueClosed` always fires, however the conversation ends, so keep your
bookkeeping there.

| `reason` | Means |
| --- | --- |
| `0` | You called `Dialogue.close`. |
| `1` | The player pressed Esc. |
| `2` | Another conversation replaced this one. |
| `3` | It was interrupted, most often by a disconnect. |

A player is in at most one conversation: opening a second closes the first
with reason `2`. `Dialogue.sessionOf(player.id)` returns their session, or `0`:

```ts
if (Dialogue.sessionOf(player.id) === 0) {
  // free to start one
}
```

On the client, `Hud.isInDialogue()` says whether any conversation owns the
screen, including one the game started with a level NPC.

## Controls

| Key | Does |
| --- | --- |
| W / S, or the arrows | Move the highlight, skipping greyed rows |
| E | Pick the highlighted option |
| Esc | Close the conversation |

While a page is up the player cannot walk or look around. The keys are the
game's, so rebound keys keep working.

The default gamemode's `src/server/commands/dialogue.ts` is a complete
four-page merchant; `/dialogue` opens it.

## Related

- [Build an NPC shop](../../tutorials/market-stall/): a conversation that leads into a shop.
- [Script an NPC cutscene](../../tutorials/scripted-scene/): NPCs acting out a scene.
- [Shops (vendors)](../vendors/): open a trade screen from an option.
- [NPC damage, death and interaction](../../npcs-and-animals/npc-events/): the talk key.
