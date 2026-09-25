---
title: Sounds, voice chat and Discord
description: Play the game's own sounds with Audio, tune proximity voice chat on the client and enforce it on the server, and set Discord rich presence.
sidebar:
  order: 75
---

Three things live on this page. [`Audio`](../../reference/client/variables/Audio.md)
plays the game's own sound triggers on this machine.
[`Voice`](../../reference/client/variables/Voice.md) is the built-in proximity
voice chat, with player settings on the client and the rules on the server.
[`Discord`](../../reference/client/variables/Discord.md) sets the player's
Discord status.

## Playing a sound

```ts
const TRIGGER = "your_trigger_name"; // as the game's audio data spells it

if (Audio.hasTrigger(TRIGGER)) {
  Audio.play(TRIGGER);
} else {
  console.log(`${TRIGGER} is not a trigger this install knows`);
}
```

A trigger is a name out of the game's audio data. It is not display text and it
is not translated. A patch or another mod can change which triggers exist, so
`Audio.hasTrigger` lets a resource that ships names fail early instead of
playing nothing. It also answers `false` while the audio system is not up.

There are three ways to play one, and they differ in whether you can stop it:

| Call | Heard | Can stop it? |
| --- | --- | --- |
| `play(trigger)` | everywhere at full volume, like a UI cue | no |
| `playAt(trigger, position)` | from a point in the world | no |
| `playOnEntity(trigger, entityId)` | from an entity, following it | yes, `stopOnEntity(trigger, entityId)` |

`play` goes on the one global audio object every 2D sound shares, which is why
it cannot be stopped. `playAt` hands the sound to the engine and forgets it; it
plays to its end where it was put. Neither checks occlusion, so a wall between
the point and the player does not muffle it.

`playOnEntity` is what a sound attached to a body, a horse or a prop wants. It
takes an engine entity id, such as a player's `entityId`:

```ts
function ringOn(target: Player, trigger: string): boolean {
  if (target.entityId === 0) {
    return false; // no body right now
  }
  return Audio.playOnEntity(trigger, target.entityId);
}
```

`stopAllOnEntity(entityId)` silences everything the entity plays, the game's
own sounds included, so prefer `stopOnEntity` when you know the trigger.

`setEntityParameter(entityId, parameter, value)` and
`setEntitySwitch(entityId, switchName, state)` feed the game's sound events for
one entity: parameters such as `horse_speed` or `player_stamina`, switches such
as `sword_mat`. They affect what is already playing too.

:::note
Nothing here is replicated. A sound everyone near a spot should hear is one the
server asks every client to play, for example with `Events.emitAllClients` and
a position, and each client calls `playAt` itself.
:::

## Voice chat

Voice chat is proximity based: the server relays a player's voice only to
players within range, and playback fades out with distance. The player talks
with push-to-talk, on `v` by default.

The client side is the player's own settings. Build a settings panel on it:

```ts
Voice.setEnabled(true);          // off closes the mic and stops receiving
Voice.setVolume(1.5);            // playback gain, 0 to 4, 1 is unchanged
Voice.setPushToTalkKey("b");     // same names as Key.bind; unknown names throw
Voice.setPushToTalkReleaseDelay(250); // keep sending briefly after release, 0 to 2000 ms
Voice.setHearingRange(15);       // can only narrow the server's range; 0 removes the limit

if (!Voice.hasMicrophone()) {
  Hud.showInfoText("No microphone found: you can listen but not talk.");
}
```

Each setter has a matching getter (`isEnabled`, `getVolume`,
`getPushToTalkKey`, ...). `Voice.getRange()` reads the server's range, and
`Voice.isTalking()` answers whether the local player is sending right now.

These are preferences. A player can change them in their own client, so do not
build rules on them.

:::note[Authority]
Who can hear whom is decided on the server. The client can turn its own voice
off or narrow what it hears, but it cannot widen its range or unmute itself.
:::

### The server's rules

The server's `Voice` sets the range and mutes. Ranges are in world units
(metres), 25 by default.

```ts
// server
Voice.setRange(30); // for everyone without an override; clients are told

Events.onClient("my-mode:voice.mode", (sender, payload) => {
  const player = sender as Player;
  const mode = typeof payload === "object" && payload !== null ? (payload as { mode?: unknown }).mode : undefined;
  if (mode === "whisper") Voice.setPlayerRange(player, 5);
  else if (mode === "shout") Voice.setPlayerRange(player, 60);
  else Voice.setPlayerRange(player, 0); // 0 goes back to the server-wide range
});
```

```ts
const modes = ["normal", "whisper", "shout"];
let current = 0;

Key.bind("n", () => {
  current = (current + 1) % modes.length;
  Events.emitServer("my-mode:voice.mode", { mode: modes[current] });
  Hud.showInfoText(`Voice: ${modes[current]}`);
});
```

The rest of the server's `Voice`:

| Call | Effect |
| --- | --- |
| `setPlayerMuted(player, muted)` | nobody hears this player |
| `setPlayerDeaf(player, deaf)` | this player hears nobody |
| `setLocalMute(listener, target, muted)` | one player stops hearing one other, enforced by the server |
| `getPlayerRange(player)` | the range with the default resolved |
| `isPlayerVoiceEnabled(player)` | whether they left voice on in their settings |
| `isPlayerTalking(player)` | whether their voice is reaching the server now |

Each setter has an `is...` reader to match.

### Talking events

The client raises `voiceStart` and `voiceStop` when the local player starts and
stops sending. The server raises `playerVoiceStart` and `playerVoiceStop` with
the player, following actual speech rather than the key: silence is dropped
before it reaches the server.

```ts
// server
Events.on("playerVoiceStart", (who) => {
  const player = who as Player;
  player.state.set("my-mode:talking", true);
});

Events.on("playerVoiceStop", (who) => {
  const player = who as Player;
  player.state.set("my-mode:talking", false);
});
```

:::caution
These four events are not in the `EventMap` of the declarations yet, so their
arguments arrive as `unknown` in TypeScript. Cast the player as above.
:::

## Discord rich presence

`Discord` sets the activity shown on the player's Discord profile, when the
Discord app is running. Stage fields with the setters, then publish them in one
update:

```ts
if (Discord.isAvailable()) {
  Discord.setDetails("Defending Rattay");
  Discord.setState("Team Red");
  Discord.setStartTimestamp(Math.floor(Date.now() / 1000));
  Discord.setPartySize(3, 10);
  Discord.update();
}
```

Updates are rate-limited, so stage everything and call `update()` once rather
than after each field. `reset()` drops staged fields without publishing, and
`clear()` removes the published activity.

There is one presence per client, shared by every resource. If more than one
resource sets it, the last `update()` wins. Keep presence in one place, usually
your gamemode, and call `Discord.clear()` when it stops.

## Related

- [Particle effects](../../server-scripting/world-and-objects/effects/), for the visual half
- [Send data between server and client](../../core-concepts/networking/)
- [Entity state bags](../../core-concepts/state/)
