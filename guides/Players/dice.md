---
title: Dice matches between players
description: Seat two players at one of the game's dice tables, play a match the server deals and scores, and settle what it was played for when it ends.
sidebar:
  label: Dice matches
  order: 39.5
---

Two players standing at one of the game's dice tables can play its dice
against each other, exactly as they would against an NPC, each seeing the
other's body across the table. [`Dice`](../../reference/server/variables/Dice.md)
starts the match; the server deals every throw and checks every move.

```ts
const match = Dice.start(player.id, target.id, { targetScore: 3000 });

Events.on("diceMatchEnd", (id, first, second, winner) => {
  if (id !== match) return;
  const won = winner === 0 ? first : winner === 1 ? second : null;
  if (won) Chat.sendToAll(`${won.nickname} won at dice.`);
});
```

## Start a match

`Dice.start(first, second, options?)` takes the two players' `id`s, in seat
order, and returns the match id.

- Both players must stand together, within a few metres, at a dice table.
- Neither may already be in a match.
- `targetScore` is the score that wins, banked at the end of a turn: 2000 when
  left out, at most 100000.

It throws an `Error` saying why when the match cannot start, so catch it when
a player triggered the call:

```ts
try {
  Dice.start(player.id, target.id);
} catch (error) {
  Chat.sendToPlayer(player, `No game: ${(error as Error).message}`);
}
```

Both players sit down at the table nearest them. Who throws first is drawn at
random, and `diceMatchStart` fires with the match, both players and the target
score.

## Find the tables

[`Dice.tables()`](../../reference/server/variables/Dice.md#tables) lists the
level's dice tables, in GUID order. The same tables stand in every virtual
world; who is waiting at one is your script's to track.

```ts
for (const table of Dice.tables()) {
  // table.id: the level GUID; table.position: between the two seats; table.seats: the two chairs
  Area.create({ id: `dice:${table.id}`, type: "sphere", position: table.position, radius: 3, labels: ["dice"] });
}
```

`seats` holds the two chairs' GUIDs in the table's own seat order, which is
the order `Dice.start` takes its players in. Some quest layers place the same
table twice under another id, so treat entries within a metre of each other as
one table. The list includes tables on quest layers a client may not have
loaded.

## Fair play

The server deals every throw and scores every move by the game's own rules.
Badges and dice perks are off, so a match is decided by the dice and the
players' decisions alone. A player sees a throw only once the move before it is
committed.

## End a match

A match ends on its own when someone wins or leaves. To end one from a script,
with nobody winning:

```ts
const match = Dice.matchOf(player.id); // the match the player is in, or 0
if (match !== 0) Dice.stop(match);     // false when it had already ended
```

Both tables close, and `diceMatchEnd` fires with reason `stopped`.

## Name the scoreboard seats

In **1.6.6**, supply labels when starting a match, or change them afterwards:

```ts
const match = Dice.start(player.id, target.id, {
  targetScore: 3000,
  firstName: player.nickname,
  secondName: target.nickname,
});
Dice.setNames(match, player.nickname, target.nickname);
```

Names follow the two seats passed to `Dice.start`. Each client maps them to
its own and its opponent's scoreboard columns. Labels allow at most 64 UTF-8
bytes without control characters. Empty names restore the native labels on
the next scoreboard refresh. `Dice.setNames` returns `false` after a match
ends. The default game mode uses player nicknames.

## Follow turns, rolls and accepted moves

The **1.6.6** server exposes four progress events for match logs and custom
displays. Each receives one event object:

```ts
Events.on("diceTurnStart", event => {
  console.log(`Match ${event.match}: turn ${event.turn}, player ${event.player}`);
});
Events.on("diceRoll", event => {
  console.log(`Roll ${event.roll}: ${event.faces.join(", ")} (${event.reason})`);
});
Events.on("diceMove", event => {
  console.log(`${event.reason}: ${event.points} points, mask ${event.heldMask}`);
});
Events.on("diceTurnEnd", event => {
  console.log(`Turn ended: ${event.reason}; banked total ${event.totalScore}`);
});
```

| Field | Meaning |
| --- | --- |
| `match`, `player`, `seat` | Match ID, acting player's network ID, and seat (`0` first, `1` second). |
| `turn`, `roll` | Turn starts at 1 and advances when play passes seats. Roll starts at 1 within a turn, or 0 before its first roll. |
| `faces`, `rolledMask` | Six pip values on `diceRoll`; bits 0 to 5 identify the dice rolled this time. Other dice were already scored. |
| `heldMask` | Bits 0 to 5 identify dice selected in an accepted move. |
| `points` | The selection's score in `diceMove`, or the turn's banked score in a passed or won `diceTurnEnd`. |
| `turnScore`, `totalScore` | Unbanked turn points before a pass or bust, and that seat's banked total. |
| `reason` | `rolled` or `bust` for a roll; `continue` or `pass` for a move; the ending reason for a turn. |

Events follow accepted server decisions: turn start, roll, then accepted
moves and resulting rolls. A bust emits roll, turn end, then the next turn
start. Passing emits move and turn end; play then changes seats unless the
match was won. Rejected and duplicate moves emit nothing. An early stop
also ends the open turn before `diceMatchEnd`.

These notifications can precede native animations. Use `diceMatchEnd` to
settle a wager, rather than a roll or progress notification. Calling
`Dice.stop` inside a handler is supported; already queued notifications
retain their order.

## What nearby players see

Observers see seated participants, dice throws, cups and table props without
entering the minigame. This presentation does not decide scores. Props are
removed when the report expires, the match ends, or the participant leaves
the observer's streamed world. Update both clients and server for the
**1.6.6** station and dice synchronization changes.

## Hear how it ended

`diceMatchEnd` fires once per match, after both players have been told:
`(match, first, second, winner, reason, firstScore, secondScore)`.

| `winner` | Means |
| --- | --- |
| `0` | `first` won. |
| `1` | `second` won. |
| `255` | Nobody won. |

| `reason` | When |
| --- | --- |
| `won` | A player banked the target score. |
| `gaveUp` | A player left the table. |
| `left` | A player disconnected. |
| `timedOut` | The player to throw did not move for three minutes. |
| `failed` | A client could not play the table. |
| `stopped` | A script called `Dice.stop`. |

`first` or `second` is `null` when that player has gone since, so check it.

## Play for stakes

Nothing changes hands on its own. A wager is the gamemode's: take it when the
match starts and pay it out when it ends.

```ts
const STAKE = 50;
const pot = new Map<number, number>(); // match id -> money at stake

Events.on("diceMatchStart", async (match, first, second) => {
  const paid = await Promise.all([first.takeItem("money", STAKE), second.takeItem("money", STAKE)]);
  pot.set(match, paid.reduce((sum, taken) => sum + taken.removed, 0));
});

Events.on("diceMatchEnd", (match, first, second, winner) => {
  const stake = pot.get(match) ?? 0;
  pot.delete(match);
  const won = winner === 0 ? first : winner === 1 ? second : null;
  if (won) won.giveItem("money", stake);
  else for (const p of [first, second]) p?.giveItem("money", Math.floor(stake / 2)); // no winner refunds both
});
```

Money is the game's `money` item, so `takeItem` and `giveItem` move it (see
[Give and take items](../items/)). Check both players can pay before you call
`Dice.start`, since `takeItem` removes only what they have.

The default gamemode's `src/server/dice.ts` shows a full lobby: a join hint
at each table from `Dice.tables()`, then a conversation in which the two
players agree a target score before `Dice.start`. `/dice <player> [score]`,
`/dice accept`, `/dice decline` and `/dice cancel` drive the same flow from
chat.

## Related

- [Chat and /commands](../chat/): build a challenge command.
- [Give and take items](../items/): moving the money a match is played for.
- [Events](../../core-concepts/events/): how handlers and their arguments work.
