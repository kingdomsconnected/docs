---
title: Discord Rich Presence
description: Show what a player is doing on your server in their Discord profile with the client's Discord global.
sidebar:
  label: Discord presence
  order: 75
---

Discord Rich Presence is the activity Discord shows on a player's profile while
they play. The client's
[`Discord`](../../reference/client/variables/Discord.md) global lets your
resource publish it: what the player is doing, their party status, a timer and
a party size.

```ts
Discord.setPresence({
  details: "Hunting in the Trosky woods",
  state: "Blue team",
  startTimestamp: Math.floor(Date.now() / 1000),
});
```

`Discord` only exists on the client, so the server decides what a player is
doing and tells their client, which publishes it. Kingdoms Connected does not
publish a presence of its own, so nothing is shown until your code publishes
something.

## Stage fields, then publish

Every setter only stages a value. Nothing reaches Discord until you publish:

- `update()` publishes everything staged so far.
- `setPresence(options)` stages a batch of fields and publishes in the same
  call. The fields it does not name keep their staged value.

```ts
Discord.setDetails("Round 3 of 5");
Discord.setState("Waiting for players");
Discord.setPartySize(3, 8);
Discord.update();

// Later, only the state changes. Details and party size are still staged.
Discord.setState("In a match");
Discord.update();
```

The fields Discord displays are:

| Field | Setter | What Discord uses it for |
| --- | --- | --- |
| `details` | `setDetails` | what the player is currently doing |
| `state` | `setState` | the player's current party status |
| `startTimestamp` | `setStartTimestamp` | an elapsed timer, counting from that moment |
| `endTimestamp` | `setEndTimestamp` | a remaining timer, counting down to that moment |
| `party.size` | `setPartySize(current, max)` | the party's current and maximum size |
| `largeImage`, `largeText`, `smallImage`, `smallText` | `setAssets` or one setter each | two images and their hover text |

Timestamps are Unix times in **seconds**, not the milliseconds `Date.now()`
returns.

`name` and `type` can be staged but change nothing: Discord treats the
application name as read-only and discards the activity type sent by a game.
The join and spectate `secrets` drive Discord's invites, Ask to Join and
Spectate, but Kingdoms Connected does not listen for the events Discord sends
when a player uses them, so leave them out.

:::caution[Images]
An image field names an art asset uploaded to the Kingdoms Connected
application in the Discord Developer Portal, by its key. Leave the image fields
out unless you know a key the application has.
:::

## Clear or reset the presence

- `clear()` removes the presence from Discord and empties the staged fields.
- `reset()` empties the staged fields but leaves Discord showing the last
  published presence, so you can build the next one from scratch.

Leaving a server stops its client resources, but it neither clears the
presence nor empties the staged fields. Clear it when your resource stops, or a
player who disconnects keeps advertising your round until they close the game,
and the next server's first `update()` publishes your leftover fields along
with its own:

```ts
const RESOURCE = "my-mode";

Events.on("resourceStop", (name) => {
  if (name === RESOURCE) Discord.clear();
});
```

:::note[One presence per player]
Every client resource shares the same staged fields. If two resources set
presence, each publish sends whatever the other staged too, and the last one to
publish wins. Keep presence in one resource, usually your gamemode.
:::

## When Discord is unavailable

Presence only shows while the Discord app is running. The game connects to
Discord once, at startup, and `isAvailable()` tells you whether that worked. The setters are safe to call either way, and `update`,
`setPresence` and `clear` return `false` instead of throwing, so you rarely need
to check first. A `true` only means the update was handed to Discord: if
Discord rejects it, your script is not told.

A player can also hide their activity in Discord's settings, in which case
nothing you publish is visible.

`getUserId()` returns the player's Discord user ID, or an empty string until
Discord has reported who is signed in. The client sends the same ID to the
server when it joins, where it is
[`player.discordId`](../../reference/server/classes/Player.md#discordid). The
server only checks that it is made of digits, not that the player owns that
Discord account, so do not use it to grant anything.

## Publish on change, not every frame

Discord allows five presence updates every twenty seconds, and Kingdoms
Connected does not queue or retry the ones over that limit. Publish when
something changes (a round starts, a player joins a team), never from a
per-frame or per-second loop. The timestamps exist so the timer ticks on
Discord's side without you sending anything.

## Drive the presence from the server

The server knows the round and the team, so it tells each client what to show.
The client only turns that into a presence:

```ts title="src/server/presence.ts"
const RESOURCE = "my-mode";
const MAX_PLAYERS = 32;

// Call when a round starts.
export function announceRound(round: number, endsAt: number) {
  const players = Player.all();
  for (const player of players) {
    player.emit(
      `${RESOURCE}:presence`,
      JSON.stringify({
        details: `Round ${round}`,
        state: `${player.nickname} on the battlefield`,
        endTimestamp: Math.floor(endsAt / 1000),
        players: players.length,
        max: MAX_PLAYERS,
      }),
    );
  }
}
```

```ts title="src/client/presence.ts"
const RESOURCE = "my-mode";

Events.on(`${RESOURCE}:presence`, (payload) => {
  if (typeof payload !== "object" || payload === null) return;
  const p = payload as { details?: string; state?: string; endTimestamp?: number; players?: number; max?: number };

  Discord.setPresence({
    details: p.details ?? "",
    state: p.state ?? "",
    endTimestamp: p.endTimestamp,
    party: { size: [p.players ?? 0, p.max ?? 0] },
  });
});

Events.on("resourceStop", (name) => {
  if (name === RESOURCE) Discord.clear();
});
```

[Send data between server and client](../../core-concepts/networking/) covers
the events used here, including why a client that just joined should ask the
server for its state rather than wait to be told.

## Related

- [Send data between server and client](../../core-concepts/networking/), for the presence event
- [Resource manifest and lifecycle](../../core-concepts/resources/), for `resourceStop`
- [Sounds and voice chat](../sound-and-voice/), the other client-only player features
