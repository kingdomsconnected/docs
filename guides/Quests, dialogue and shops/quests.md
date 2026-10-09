---
title: Quests in the journal
description: Write quests into the game's own journal, update their objectives, and complete, fail or remove them.
sidebar:
  label: Quests
  order: 60
---

A quest you give from a script appears in the game's own journal, HUD tracker
and quest toasts. There is no interface to draw. Use quests for anything a
player should be able to look up later: an errand, a round objective, a bounty.

```ts
// Give one player an errand...
const errand = Quest.give("errand", "The Miller's Errand", {
  description: "Hans wants a letter taken to Rattay.",
  objectives: ["Deliver the letter in Rattay"],
  player: player.id,
});

// ...and complete it when they get there.
errand.setObjective(0, { text: "Deliver the letter in Rattay", progress: "done" });
errand.progress = "done"; // moves to completed, with the completed toast
```

:::note
A quest is replicated state, not a message: a player who joins late or
reconnects still finds it in their log. The toast is sent once, to whoever is
connected at the time.
:::

## Give a quest

[`Quest.give`](../../reference/server/classes/Quest.md#give) takes a key, a
title, options and a virtual world. Only the key and title are required.

```ts
const errand = Quest.give(
  "errand",               // the key: its identity
  "The Miller's Errand",  // the journal row
  {
    description: "Hans wants a letter taken to Rattay.",
    type: "side",         // journal section
    objectives: ["Find Hans at the mill"],
    player: target.id,    // only this player gets it; omit for everyone
    announce: true,       // raise the toast; false writes it silently
    track: false,         // true: its recipients start following it
  },
  0,                      // virtual world; omitted means the global one
);
```

- `type` is `main`, `side` (default), `activity`, `event`, `micro` or `racing`.
- Texts are capped at 256 characters.
- A key is up to 64 letters, digits, underscores or dashes, unique **per
  recipient** within a world. Giving every player their own `errand` is normal.

:::caution[`Quest.give` throws]
It throws on a malformed key, or if that recipient already has a quest under
that key in that world. A world-wide quest counts as every player's copy, so it
collides with any player's own quest of the same key. Check with `Quest.find`
first, or wrap the call in `try`.
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

## Read a quest

```ts
quest.key;            // its identity; read-only
quest.title;          // the journal row
quest.description;    // the diary page
quest.type;           // its section; read-only
quest.progress;       // "active", "done" or "failed"
quest.player;         // the one player it belongs to, or 0 for everyone
quest.objectiveCount; // how many lines it carries, up to eight
```

`key`, `type` and `player` are fixed when the quest is given.

## Update objectives

A quest carries at most eight objectives.

```ts
quest.setObjectives([
  "Find Hans at the mill",
  { text: "Deliver the letter in Rattay", progress: "active" },
  { text: "Return for your pay", optional: true },
]);

quest.setObjective(0, { text: "Find Hans at the mill", progress: "done" });
quest.setObjective(0, "Find Hans at the watermill", false); // false: no notification
```

- A plain string is an active, non-optional line with no map marker.
- A write replaces the whole line: whatever you leave out, a `position`
  included, is gone.
- An index past the end is ignored; entries past eight are dropped.
- Every write raises the quest-updated notification unless the last argument
  is `false`.

`quest.objectives()` reads the list back. A line can read `none`, which no
write accepts, so map it when you rewrite the list (as the default gamemode's
`/quest step` does):

```ts
const lines = quest.objectives().map((line) => ({
  text: line.text,
  optional: line.optional,
  progress: line.progress === "none" ? ("active" as const) : line.progress,
  position: line.position, // keep its map marker
}));
quest.setObjectives([...lines, "Return for your pay"]);
```

## Complete, fail or remove a quest

```ts
quest.progress = "done";            // announces
quest.setProgress("failed", false); // silently

quest.title = "The Miller's Real Errand"; // assignment is always silent
quest.description = "It was never about the letter.";

quest.remove();     // out of every journal it was in, silently
Quest.removeAll(0); // every quest in world 0; returns how many
```

There is no way back to unstarted: remove a quest instead of resetting it.

## Find a quest again

Store the key or id, not the handle:

```ts
Quest.find("errand");                // first match in any world
Quest.find("errand", 0);             // in world 0
Quest.find("errand", 0, target.id);  // that player's copy
Quest.getById(quest.id);
Quest.all(0);                        // every quest in world 0
```

Without a player id, `find` returns the first quest under that key, which suits
a world-wide quest.

## Track a quest and mark it on the map

An objective can carry a world `position`, and a quest can be followed for
the player, which lists it in the HUD tracker and puts its objectives on the
map and compass:

```ts
const errand = Quest.give("errand", "The Miller's Errand", {
  objectives: [{ text: "Find Hans at the mill", position: new Vector3(-1420, 2870, 118) }],
  player: target.id,
  track: true,
});

errand.untrack(target.id); // markers off; errand.track(target.id) puts them back
```

[Track quests and mark objectives](../quest-tracking/) covers markers,
`track` and `untrack`, and the `questTrackingChanged` event.

## What the player sees

| You write | They get |
| --- | --- |
| `Quest.give(...)` | A new journal row, and the quest-started toast unless `announce: false`. |
| `quest.setObjective(...)` | The line changes, with a notification naming it. |
| `quest.progress = "done"` | The row moves to completed, with the completed toast. |
| `quest.remove()` | The row disappears, silently. |

A quest reaches everyone in its virtual world (or its one player) wherever
they are. An objective's `position` only decides where its map marker goes.

## Show objective completion and failure

Set an objective's `progress` to `"done"` or `"failed"` with
`quest.setObjective(index, { progress: "done" })`. The game marks the objective as
completed or canceled, shows its usual objective notification, and removes it from the
active list. Your script still decides when the whole quest is finished.

## Related

- [Track quests and mark objectives](../quest-tracking/): the tracker, map markers and `questTrackingChanged`.
- [Dialogue choices](../dialogue/): offer a quest from a conversation.
- [NPC damage, death and interaction](../../npcs-and-animals/npc-events/): the talk key that starts an errand.
- [Virtual worlds](../../core-concepts/virtual-worlds/): the world argument.
