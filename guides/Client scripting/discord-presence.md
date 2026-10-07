---
title: Discord Rich Presence
description: Add game-mode status to Kingdoms Connected's built-in Discord presence from a client script.
sidebar:
  label: Discord presence
  order: 75
---

Kingdoms Connected publishes a Discord presence automatically: starting up,
the main menu, joining or playing on a server, and World Builder. Your client
resource can add its own status line and small image.

```ts
Discord.setPresence({ state: "Hunting in the Trosky woods" });
```

## Choose the fields your resource controls

| Field | Who controls it |
| --- | --- |
| `state` | A client script can replace the lower status line. |
| `smallImage`, `smallText` | A client script can set the small image and its tooltip. |
| `details` | KCDC names the server or current activity. |
| Large image and tooltip | KCDC's logo and mod version. |
| Timer | KCDC tracks the menu, session or World Builder activity. |
| Other fields | Not opened to client scripts by KCDC. |

The generic `Discord` API still exposes setters for details, timestamps,
party size and secrets. KCDC's presence policy does not publish those script
fields. Use the status line for a round, role, team or activity instead.

## Stage fields, then publish

Setters stage values. `update()` publishes the staged script fields;
`setPresence(options)` stages a batch and publishes it in one call.
Fields omitted from a batch keep their staged value.

```ts
Discord.setState("Blue team, round 3");
Discord.update();

// When the round ends:
Discord.setPresence({ state: "Waiting for the next round" });
```

Image keys must name assets uploaded to the Kingdoms Connected Discord
application. Use only known keys; an arbitrary local filename is not an asset.

## Clear or reset the presence

- `clear()` removes script overrides and clears staged fields. The built-in
  KCDC activity remains visible.
- `reset()` clears staged fields without publishing. The last published
  override remains until the next update or clear.

When the session ends, script presence is cleared and the menu activity
returns. Clear your own status when your resource stops within a session:

```ts
Events.on("resourceStop", name => {
  if (name === "my-mode") Discord.clear();
});
```

Client resources share the staged script fields. Keep presence in one
resource, usually the game mode, so one resource does not clear another's
status or publish its leftover fields.

## Drive the presence from the server

Send a short game-mode status to each player. The client turns it into
an allowed presence field:

```ts title="src/server/presence.ts"
export function announceRound(round: number): void {
  for (const player of Player.all()) {
    player.emit("my-mode:presence", JSON.stringify({ state: `Round ${round}` }));
  }
}
```

```ts title="src/client/presence.ts"
Events.on("my-mode:presence", payload => {
  if (!payload || typeof payload !== "object") return;
  const state = (payload as { state?: unknown }).state;
  if (typeof state === "string") Discord.setPresence({ state });
});

Events.on("resourceStop", name => {
  if (name === "my-mode") Discord.clear();
});
```

Call `announceRound` when the round changes. Also send the current state to
newly ready clients. [Server and client messages](../../core-concepts/networking/)
shows how a client can request state when its resource starts.

## When Discord is unavailable

Presence needs the Discord desktop app and visible activity in the player's
Discord settings. `isAvailable()` reports whether the integration initialized.
`update`, `setPresence` and `clear` return false when it is unavailable.
A true result is not proof the player or their friends can see the activity.

`getUserId()` returns the signed-in Discord ID once available, otherwise an
empty string. The server receives it as `player.discordId`; do not treat that
client-reported value as account authentication.

Publish when something changes, rather than every frame. Discord rate limits
updates, and the built-in timer runs without repeated script updates.

## Related

- [Server and client messages](../../core-concepts/networking/)
- [Resource manifest and lifecycle](../../core-concepts/resources/)
- [Sounds and voice chat](../sound-and-voice/)
