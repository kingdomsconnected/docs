---
title: Track quests and mark objectives on the map
description: Make players follow a quest, put its objectives on the map and compass with the game's own quest markers, and hear when they track or untrack it.
sidebar:
  label: Quest tracking
  order: 61
---

A quest the player **follows** is listed in the HUD tracker, and each of its
active objectives that has a position gets the game's own quest marker on the
map and the compass. Following is normally the player's choice, made with the
journal's track button; a script can start or stop it for them.

```ts
const errand = Quest.give("errand", "The Miller's Errand", {
  objectives: [{ text: "Deliver the letter in Rattay", position: new Vector3(-1210, 1515, 34) }],
  player: player.id,
  track: true, // follow it straight away: tracker, map marker, compass
});
```

## Put an objective on the map

Give an objective a `position` and it is marked while three things hold: the
quest is followed, the quest is `active`, and the objective is `active`.

```ts
quest.setObjectives([
  { text: "Find Hans at the mill", position: new Vector3(-1420, 2870, 118) },
  { text: "Deliver the letter in Rattay", position: new Vector3(-1210, 1515, 34) },
  "Return for your pay", // no position: listed, but not marked
]);
```

- Marking an objective `done` or `failed` takes its marker away, so the next
  active one is what the player sees.
- A rewrite replaces the whole line, so `setObjective` without a `position`
  removes that objective's marker. `quest.objectives()` returns `position`
  on the objectives that have one, to carry it over.
- To move a marker, rewrite the objective with its new position. Pass `false`
  last so the player is not told each time:

```ts
function moveTarget(quest: Quest, index: number, text: string, where: Vector3): void {
  quest.setObjective(index, { text, position: where }, false);
}
```

The map redraws a moved marker on its next refresh, so a target that moves
every second jumps rather than glides. For something that really moves, a
[map blip](../../user-interface/map/) attached to it suits better.

## Start and stop following a quest

```ts
quest.track();            // everyone who has the quest follows it
quest.track(player.id);   // just this player
quest.untrack(player.id); // stop: its markers leave the map and compass
```

Both return how many clients were told, `0` when that player does not have the
quest. `Quest.give` with `track: true` does the same for every recipient, and
a quest given a moment ago can be tracked at once: the client waits for it to
arrive.

:::note
`track` is an instruction, not a lock. The player can untrack the quest from
the journal, and the game untracks a quest on its own when it is finished or
failed. Watch `questTrackingChanged` for what really happened.
:::

Server quests claim a tracking slot before the game turns tracking on.
The quest title is also used for its map label, so readable server-authored
titles appear in the journal, tracker and map. Scripts do not need to create
native localization keys for these labels.

## Hear when a player tracks or untracks

The event fires on every change, however it happened: your `track` call, the
journal's button, the game tracking a quest that just turned active, or the
untrack after finishing one. It only reports: tracking cannot be refused.

```ts
Events.on("questTrackingChanged", (quest, player, tracked) => {
  console.log(`${player.nickname} ${tracked ? "follows" : "dropped"} ${quest.key}`);
});
```

The client raises its own, with the quest's key, before the server has heard:

```ts
// client
Events.on("questTrackingChanged", (questKey, tracked) => {
  if (tracked) Hud.showNotification(`Now following ${questKey}`);
});
```

Both fire only on an actual change, and the server only hears about quests
that player was given.

## Example: a bounty that leads the way

`/bounty` gives the player a tracked bounty whose objective points at a
camp. A trigger zone there completes it, and the finished quest drops out of
the tracker by itself.

```ts title="src/server/bounty.ts"
const CAMP = new Vector3(-980, 1240, 52);
const zone = Marker.place("materials/decals/chalk_cross", CAMP, { size: 6, trigger: true });

Events.on("playerCommand", (player, command) => {
  if (command !== "bounty" || Quest.find("bounty", player.virtualWorld, player.id)) return;

  Quest.give("bounty", "Wanted: the Bandit of Skalitz", {
    type: "activity",
    objectives: [{ text: "Find the bandit camp", position: CAMP }],
    player: player.id,
    track: true,
  }, player.virtualWorld);
});

Events.on("markerEnter", (marker, player) => {
  if (marker.id !== zone.id) return;
  const bounty = Quest.find("bounty", player.virtualWorld, player.id);
  if (!bounty || bounty.progress !== "active") return;

  bounty.setObjective(0, { text: "Find the bandit camp", progress: "done" });
  bounty.progress = "done";
});
```

The marker is in the global world, so this only works there; place one per
[virtual world](../../core-concepts/virtual-worlds/) you use.

## Related

- [Quests in the journal](../quests/): give, update, complete and remove quests
- [Map and blips](../../user-interface/map/): markers that are not quest objectives
- [Markers and trigger zones](../../world/markers/): detect the player reaching the spot
