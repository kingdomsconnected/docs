---
title: Sounds and voice chat
description: Play the game's own sounds with Audio, tune proximity voice chat on the client, and enforce who hears whom on the server.
sidebar:
  label: Sound and voice
  order: 74
---

[`Audio`](../../reference/client/variables/Audio.md) plays the game's own sound
triggers on this machine. [`Voice`](../../reference/client/variables/Voice.md)
is the built-in proximity voice chat: player settings on the client, rules on
the server.

```ts
const TRIGGER = "your_trigger_name"; // as the game's audio data spells it

if (Audio.hasTrigger(TRIGGER)) {
  Audio.play(TRIGGER);
} else {
  console.log(`${TRIGGER} is not a trigger this install knows`);
}
```

## Play a sound

A trigger is a name from the game's audio data, not display text. A patch or
another mod can change which exist, so `Audio.hasTrigger` lets you fail early.
It also answers `false` while the audio system is not up. Triggers a server
ships in a resource's `stream/` folder work like the game's own once they
arrive; see [Custom assets](../../core-concepts/custom-assets/).

| Call | Heard | Can stop it? |
| --- | --- | --- |
| `play(trigger)` | everywhere at full volume, like a UI cue | no |
| `playAt(trigger, position)` | from a point in the world, until it ends | no |
| `playOnEntity(trigger, entityId)` | from an entity, following it | yes, `stopOnEntity(trigger, entityId)` |

`play` and `playAt` do not check occlusion: a wall does not muffle them.

## Play a sound on a player or prop

`playOnEntity` takes an engine entity id, such as a player's `entityId`:

```ts
function ringOn(target: Player, trigger: string): boolean {
  if (target.entityId === 0) {
    return false; // no body right now
  }
  return Audio.playOnEntity(trigger, target.entityId);
}
```

- `stopAllOnEntity(entityId)` silences everything the entity plays, the game's
  own sounds included. Prefer `stopOnEntity` when you know the trigger.
- `setEntityParameter(entityId, parameter, value)` and
  `setEntitySwitch(entityId, switchName, state)` feed the game's sound events
  for one entity: parameters such as `horse_speed` or `player_stamina`,
  switches such as `sword_mat`. They affect sounds already playing too.

:::note
Nothing here is replicated. For a sound everyone near a spot should hear, the
server sends the position to every client (for example with
`Events.emitAllClients`) and each calls `playAt`.
:::

## Play a sound file

`Audio.playFile(file, entityId, purpose?)` plays an `.ogg` on an entity, with
no trigger needed. It is placed and faded like the game's own spoken lines and
follows the same volume settings. The path is from the game's root, with or
without `.ogg`; for a file a server streams, it is `sounds/kcdc/<resource>/<name>`.
It returns `false` when the entity is not there to take it.

```ts
const LINE = "sounds/kcdc/my-assets/greeting";
const me = LocalPlayer;

if (me && Assets.has(`${LINE}.ogg`)) {
  Audio.playFile(LINE, me.entityId, "20"); // heard up to about 20 m
}
```

`purpose` picks which of the game's voice channels carries it: `10`, `20`,
`35`, `50` (the default), `100` or `200` for a line heard up to that many
metres, or `inner`, `sfp_dialog`, `sfp_cutscene` or `sfp_music`. An entity takes one
file every 0.1 seconds.

## Voice chat settings (client)

The server relays a player's voice only to players within range, and playback
fades with distance. Push-to-talk is on `v` by default. The client side is the
player's own settings:

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

Each setter has a getter (`isEnabled`, `getVolume`, `getPushToTalkKey`, ...).
`Voice.getRange()` reads the server's range, and `Voice.isTalking()` whether
the local player is sending now.

:::note[Authority]
These are preferences the player controls. Who hears whom is decided on the
server: a client cannot widen its range or unmute itself. See
[Server vs client authority](../../core-concepts/authority/).
:::

## Voice chat rules (server)

The server's `Voice` sets ranges and mutes. Ranges are in metres, 25 by
default.

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

| Server call | Effect |
| --- | --- |
| `setPlayerMuted(player, muted)` | nobody hears this player |
| `setPlayerDeaf(player, deaf)` | this player hears nobody |
| `setLocalMute(listener, target, muted)` | one player stops hearing one other, enforced by the server |
| `getPlayerRange(player)` | the range with the default resolved |
| `isPlayerVoiceEnabled(player)` | whether they left voice on in their settings |
| `isPlayerTalking(player)` | whether their voice is reaching the server now |

Each setter has an `is...` reader to match.

## React to someone talking

| Side | Events | Follows |
| --- | --- | --- |
| client | `voiceStart`, `voiceStop` | the local player sending |
| server | `playerVoiceStart`, `playerVoiceStop` (with the player) | actual speech; silence is dropped before the server |

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
These four events are not in the declarations' `EventMap` yet, so their
arguments arrive as `unknown` in TypeScript. Cast the player as above.
:::

## Voice while a UI has focus

Push-to-talk is blocked while a web view has input focus or controls are locked.
Players can still hear others, and voice activation still transmits speech. If a menu
should mute voice chat, your game mode must do that separately.

## Related

- [Discord Rich Presence](../discord-presence/), for the player's Discord status
- [Particle effects](../../world/effects/), for the visual half
- [Custom assets](../../core-concepts/custom-assets/), to ship sounds, triggers and FMOD banks
- [Send data between server and client](../../core-concepts/networking/)
- [Entity state bags](../../core-concepts/state/)
