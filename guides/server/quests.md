---
title: Quests
sidebar:
  order: 32
---

A quest you write from a script appears in the game's own journal. Its row in
the log, its diary page, the objectives in the HUD tracker and the
quest-updated toast are all the game's own UI, reading a real quest node the
client builds with the game's own constructor. There is no interface to draw.

```js
Quest.give("errand", "The Miller's Errand", {
  description: "Hans wants a letter taken to Rattay.",
  type: "side",
  objectives: ["Find Hans at the mill", "Deliver the letter in Rattay"],
});
```

That is the whole of it. Every player in the world now has the quest in their
journal, including anyone who connects an hour later.

## A quest is state, not a notification

A quest is a replicated entity. It exists until something removes it, so a
player who joins late, walks out of range or reconnects still opens their log
and finds it there. This is what a quest needs and what a one-shot message
cannot give you.

The toast that says *something just changed* is the opposite: an event, sent
once, to whoever was connected at the time. Keeping the two apart is deliberate
— a returning player is not told again about every quest they already had.

## Writing one

```js
const quest = Quest.give(
  "errand",                    // the key: its identity, and the node name the game files it under
  "The Miller's Errand",       // the line the journal row shows
  {
    description: "Hans wants a letter taken to Rattay.",
    type: "side",              // which section of the journal it files under
    objectives: ["Find Hans at the mill"],
    player: somePlayer.id,     // omit to give it to everyone in the world
    announce: true,            // omit to raise the toast; false writes it in silence
  },
  0,                           // virtual world; omitted uses the global one
);
```

Only `key` and `title` are required. `type` is one of `main`, `side`,
`activity`, `event`, `micro` or `racing`, and defaults to `side`.

A key is up to 64 letters, digits, underscores or dashes, and is **unique per
recipient rather than per world**. Handing every player in a world their own
`errand` is the ordinary case, and each of them only ever receives their own
copy.

> **Note:** `type` is read-only afterwards. Which section of the journal a
> quest belongs to is decided when it is given, because the game's own
> tracking limits are counted per section.

## Reading

```js
quest.key             // its identity, and the node name the game files it under
quest.title           // the line the journal row shows
quest.description     // the diary page
quest.type            // "main", "side", "activity", "event", "micro" or "racing"
quest.progress        // "active", "done" or "failed"
quest.player          // the id of the one player it belongs to, or 0 for everyone
quest.objectiveCount  // how many lines it carries, up to eight
quest.id              // the network entity id
```

`key`, `type` and `player` are read-only: all three are part of what the quest
*is*, decided when it is given.

## Objectives

At most eight, which is what the journal shows.

```js
quest.setObjectives([
  "Find Hans at the mill",
  { text: "Deliver the letter in Rattay", progress: "active" },
  { text: "Return for your pay", optional: true },
]);

quest.setObjective(0, { text: "Find Hans at the mill", progress: "done" });

quest.objectives();
// [{ text: "...", progress: "done", optional: false }, ...]
```

A plain string is shorthand for an active, non-optional line. An index past the
end of the list is ignored rather than growing it.

Each write raises the game's quest-updated notification naming the line that
changed. Pass `false` as the last argument when you are correcting something
the player should not be told about:

```js
quest.setObjective(0, "Find Hans at the mill", false);
```

> **Note:** an objective left at `none` is hidden rather than shown greyed out.
> That is the game's own mechanism for a step that is not relevant yet, and
> it is why there is no `none` in the list `setProgress` accepts.

## Moving it on

```js
quest.progress = "done";                 // announces
quest.setProgress("failed", false);      // silent

quest.title = "The Miller's Real Errand"; // assignment is always silent
quest.description = "It was never about the letter.";
```

`progress` is `active`, `done` or `failed`. There is no way back to unstarted: a
quest nobody should see any more is removed, not reset.

```js
quest.remove();              // out of every journal it was written into
Quest.removeAll(0);          // everything in one virtual world; returns how many
```

## Finding one again

Do not hold a handle across events. Store the key or the id and resolve it
again, exactly as with players and horses:

```js
Quest.find("errand");                    // first match in any world
Quest.find("errand", 0);                 // in virtual world 0
Quest.find("errand", 0, somePlayer.id);  // that player's copy
Quest.getById(id);
Quest.all(0);                            // every quest in a world
```

Because keys are unique per recipient, `Quest.find("errand", world)` returns the
first match — which is what a world-wide quest wants. Pass the player id to name
one player's copy.

## Following a quest

Following a quest — the track button in the journal — is the one part of this
that is **not** yours to decide. The player chooses it, the game also does it on
its own when a quest turns active, and it un-follows a quest when it is finished
or failed. The server cannot refuse any of that.

So it is reported rather than controlled, and both environments raise an event:

```js
// Server
Events.on("questTrackingChanged", (quest, player, tracked) => {
  console.log(`${player.nickname} ${tracked ? "is following" : "dropped"} ${quest.key}`);
});
```

```js
// Client
Events.on("questTrackingChanged", (questKey, tracked) => {
  // Raised on this machine before the server has heard anything.
});
```

The client's fires first, on the machine the player pressed track on. Both fire
only on an actual change, and the server only ever hears about a quest that
player was actually given.

> **Note:** there is no `quest.track()`. The game counts tracked quests per
> journal section and refuses past its own limit with its own dialog, so a
> server-side request would be one the game could reject without telling you.

## What the player sees

| You write | They get |
| --- | --- |
| `Quest.give(...)` | a new row in the journal, and the quest-started toast |
| `quest.setObjective(...)` | the line changes, and a notification naming it |
| `quest.progress = "done"` | the row moves to completed, and the completed toast |
| `quest.remove()` | the row disappears, silently |

Quests carry no position and are not bound to a place, so they stream to
everyone in their virtual world regardless of where anyone is standing.

> **Note:** a quest given to one specific player follows them if they change
> virtual world, while a world-wide quest does not. `Quest.all` and
> `Quest.find` still narrow by world, so a per-player quest can be in someone's
> journal while a world-scoped listing does not show it.
