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

The default gamemode's `/dice <player> [target score]`, `/dice accept` and
`/dice decline` (`src/server/commands/dice.ts`) show a challenge flow.

## Related

- [Chat and /commands](../chat/): build a challenge command.
- [Give and take items](../items/): moving the money a match is played for.
- [Events](../../core-concepts/events/): how handlers and their arguments work.
