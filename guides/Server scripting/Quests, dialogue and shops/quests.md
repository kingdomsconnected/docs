---
title: Quests in the journal
description: Write quests into the game's own journal, update their objectives, and hear when players track them.
sidebar:
  order: 60
---

A quest you write from a script appears in the game's own journal: the row in
the log, the diary page, the objectives in the HUD tracker and the
quest-updated toast are all the game's UI, reading a real quest node. There is
no interface to draw. Use quests for anything a player should be able to look
up later: an errand, a round objective, a bounty.

```ts
Quest.give("errand", "The Miller's Errand", {
  description: "Hans wants a letter taken to Rattay.",
  type: "side",
  objectives: ["Find Hans at the mill", "Deliver the letter in Rattay"],
});
```

Every player in the global world now has the quest in their journal, including
anyone who connects an hour later.

## A quest is state, not a notification

A quest is a replicated entity. It exists until something removes it, so a
player who joins late, walks out of range or reconnects still opens their log
and finds it there. A chat message or a one-off event cannot give you that.

The toast that says *something just changed* is the opposite: sent once, to
whoever was connected at the time. Keeping the two apart is deliberate. A
returning player is not told again about every quest they already had.

## Giving one

[`Quest.give`](../../../reference/server/classes/Quest.md#give) takes a key, a
title, options and a virtual world:

```ts
const errand = Quest.give(
  "errand",               // the key: its identity
  "The Miller's Errand",  // the journal row
  {
    description: "Hans wants a letter taken to Rattay.",
    type: "side",         // which journal section it files under
    objectives: ["Find Hans at the mill"],
    player: target.id,    // only this player gets it; omit for everyone
    announce: true,       // raise the toast; false writes it silently
  },
  0,                      // virtual world; omitted means the global one
);
```

Only the key and title are required. `type` is `main`, `side`, `activity`,
`event`, `micro` or `racing`, and defaults to `side`. Texts are capped at 256
characters.

A key is up to 64 letters, digits, underscores or dashes, and is unique **per
recipient** within a world. Giving every player their own `errand` is the
ordinary case, and each of them only receives their own copy.

:::caution
`Quest.give` **throws** if that recipient already has a quest under that key in
that world, or if the key is malformed. A world-wide quest counts as every
player's copy, so a world-wide `errand` also collides with any player's own
`errand`. Check with `Quest.find` first, or wrap the call in `try`.
:::

```ts
function giveErrand(to: Player): Quest | null {
  const mine = Quest.find("errand", to.virtualWorld, to.id);
  if (mine) return mine;
  try {
    return Quest.give("errand", "The Miller's Errand", { player: to.id }, to.virtualWorld);
  } catch {
    return null; // a world-wide "errand" already covers them
  }
}
```

## Reading one

```ts
quest.key;            // its identity; read-only
quest.title;          // the journal row
quest.description;    // the diary page
quest.type;           // its section; read-only
quest.progress;       // "active", "done" or "failed"
quest.player;         // the one player it belongs to, or 0 for everyone
quest.objectiveCount; // how many lines it carries, up to eight
```

`key`, `type` and `player` are fixed when the quest is given. The journal
counts tracking limits per section, so a quest cannot change section later.

## Objectives

A quest carries at most eight objectives, which is what the journal shows.

```ts
quest.setObjectives([
  "Find Hans at the mill",
  { text: "Deliver the letter in Rattay", progress: "active" },
  { text: "Return for your pay", optional: true },
]);

quest.setObjective(0, { text: "Find Hans at the mill", progress: "done" });
```

A plain string is short for an active, non-optional line. An index past the end
of the list is ignored rather than growing it, and entries past eight are
dropped.

Every write raises the game's quest-updated notification naming the line that
changed. Pass `false` as the last argument for a correction the player should
not be told about:

```ts
quest.setObjective(0, "Find Hans at the watermill", false);
```

`quest.objectives()` reads the list back. A line can read back as `none`, which
no write accepts, so map it to a real state when you rewrite the list. The
default gamemode's `/quest step` does exactly this:

```ts
const lines = quest.objectives().map((line) => ({
  text: line.text,
  optional: line.optional,
  progress: line.progress === "none" ? ("active" as const) : line.progress,
}));
quest.setObjectives([...lines, "Return for your pay"]);
```

## Moving it on

```ts
quest.progress = "done";            // announces
quest.setProgress("failed", false); // silently

quest.title = "The Miller's Real Errand"; // assignment is always silent
quest.description = "It was never about the letter.";
```

There is no way back to unstarted. A quest nobody should see any more is
removed, not reset:

```ts
quest.remove();          // out of every journal it was in
Quest.removeAll(0);      // every quest in world 0; returns how many
```

## Finding one again

Store the key or the id, not the handle, and look it up when you need it:

```ts
Quest.find("errand");                // first match in any world
Quest.find("errand", 0);             // in world 0
Quest.find("errand", 0, target.id);  // that player's copy
Quest.getById(quest.id);
Quest.all(0);                        // every quest in world 0
```

Without a player id, `find` returns the first quest under that key, which is
what a world-wide quest wants. Pass the player id to name one player's copy.

## Tracking belongs to the player

Following a quest (the track button in the journal) is the one part you do not
control. The player chooses it, the game does it on its own when a quest turns
active, and it drops tracking when a quest is finished or failed. The server
cannot refuse any of that, so there is no `quest.track()`. The game also
limits tracked quests per section with its own dialog, so a server request
could be rejected without you knowing.

It is reported instead, on both sides:

```ts
Events.on("questTrackingChanged", (quest, player, tracked) => {
  console.log(`${player.nickname} ${tracked ? "follows" : "dropped"} ${quest.key}`);
});
```

```ts
// client
Events.on("questTrackingChanged", (questKey, tracked) => {
  // Raised on this machine before the server has heard anything.
});
```

The client event fires first, on the machine where the player pressed track.
Both fire only on an actual change, and the server only hears about quests
that player was given.

## What the player sees

| You write | They get |
| --- | --- |
| `Quest.give(...)` | A new journal row, and the quest-started toast unless `announce: false`. |
| `quest.setObjective(...)` | The line changes, with a notification naming it. |
| `quest.progress = "done"` | The row moves to completed, with the completed toast. |
| `quest.remove()` | The row disappears, silently. |

Quests carry no position, so they reach everyone in their virtual world
wherever they are standing.
