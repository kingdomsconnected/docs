---
title: Discord Rich Presence
description: Show what a player is doing on your server in their Discord profile with the client's Discord global.
sidebar:
  order: 76
---

When a player has the Discord desktop app open, their Discord profile shows
that they are playing Kingdoms Connected. The client's
[`Discord`](../../reference/client/variables/Discord.md) global lets your
resource fill in the rest: two lines of text, a timer and a party size.

```ts
Discord.setPresence({
  details: "Hunting in the Trosky woods",
  state: "Blue team",
  startTimestamp: Math.floor(Date.now() / 1000),
});
```

`Discord` only exists on the client, so the server decides what a player is
doing and tells their client, which publishes it. Nothing is shown until your
code publishes something: Kingdoms Connected does not set a presence of its own.

## Stage, then publish

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

The fields are:

| Field | Setter | Shows as |
| --- | --- | --- |
| `details` | `setDetails` | the first line under the game name |
| `state` | `setState` | the second line |
| `startTimestamp` | `setStartTimestamp` | "00:42 elapsed", counting up from that moment |
| `endTimestamp` | `setEndTimestamp` | "01:30 left", counting down to that moment |
| `party.size` | `setPartySize(current, max)` | "(3 of 8)" after the state line |
| `largeImage`, `largeText`, `smallImage`, `smallText` | `setAssets` or one setter each | the pictures and their tooltips |

Timestamps are Unix times in **seconds**, not the milliseconds `Date.now()`
returns. Zero removes the timer.

`setPresence` also accepts `name`, `type`, `instance`, `supportedPlatforms`,
`party.id`, `party.privacy` and `secrets`, each with its own setter. Discord
shows the Kingdoms Connected application's own name and verb whatever you
stage, and no script event handles a join request, so these change nothing a
player sees today.

:::caution[Images]
`largeImage` and `smallImage` are asset keys uploaded to the Kingdoms Connected
application on Discord, not file paths or URLs. A key the application does not
have shows no picture, so leave them out unless you know the key exists.
:::

## Clearing and resetting

- `clear()` removes the presence from Discord and empties the staged fields.
- `reset()` empties the staged fields but leaves Discord showing the last
  published presence, so you can build the next one from scratch.

The presence is not cleared for you when the player leaves your server. Clear
it when your resource stops, or a player who disconnects keeps advertising
your round until they close the game:

```ts
const RESOURCE = "my-mode";

Events.on("resourceStop", (name) => {
  if (name === RESOURCE) Discord.clear();
});
```

:::note[One presence per player]
Every client resource shares the same staged fields. If two resources set
presence, each publish sends whatever the other staged too, and the last one to
publish wins. Keep presence in one resource.
:::

## When Discord is not running

Discord is connected once, when the game starts. A player who opens Discord
later, or plays without it, has no presence for that session.

`isAvailable()` tells you whether it connected. The setters are safe to call
either way, and `update`, `setPresence` and `clear` return `false` instead of
throwing, so you rarely need to check first. A `true` means the update was
handed to Discord, not that Discord accepted it.

`getUserId()` returns the player's Discord user ID, or an empty string until
Discord has reported who is signed in. On the server the same ID is on
[`player.discordId`](../../reference/server/classes/Player.md#discordid),
which is where to read it for anything that matters: a client can report
whatever it likes.

## Publish on change, not every frame

Discord throttles presence updates to a handful every twenty seconds and
drops the rest. Publish when something changes (a round starts, a player joins
a team), never from a per-frame or per-second loop. The timestamps exist so the
clock ticks on Discord's side without you sending anything.

## Driven by the server

The server knows the round and the team, so it tells each client what to show.
The client only turns that into a presence:

```ts title="src/server/presence.ts"
const RESOURCE = "my-mode";
const MAX_PLAYERS = 32;

function announceRound(round: number, endsAt: number) {
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

announceRound(1, Date.now() + 5 * 60 * 1000);
```

```ts title="src/client/presence.ts"
const RESOURCE = "my-mode";

Events.on(`${RESOURCE}:presence`, (payload) => {
  if (typeof payload !== "object" || payload === null) return;
  const p = payload as { details?: string; state?: string; endTimestamp?: number; players?: number; max?: number };

  Discord.setPresence({
    details: p.details ?? "",
    state: p.state ?? "",
    endTimestamp: p.endTimestamp ?? 0,
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
