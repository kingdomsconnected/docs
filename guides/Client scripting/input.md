---
title: Key binds and controls
description: Bind keys, mouse buttons and the wheel with Key, poll them, and take the player's movement, switch off a game action or show a pointer with Controls.
sidebar:
  label: Key binds
  order: 71
---

[`Key`](../../reference/client/variables/Key.md) runs your code when the player
presses a key or mouse button or turns the wheel. [`Controls`](../../reference/client/variables/Controls.md)
takes gameplay input away from the game, switches off one game action, or draws
a mouse pointer, while your resource needs it. Both are client-only.

```ts
Key.bind("g", () => {
  Hud.showInfoText("G pressed");
});
```

## Bind a key

`Key.bind(key, state, handler)` takes `state` as `"down"`, `"up"` or `"both"`.
Leave it out and pass the handler second to get `"down"`. The handler receives
the key name and the edge that fired.

```ts
let aiming = false;

Key.bind("mouse2", "both", (key, state) => {
  aiming = state === "down";
});

Key.bind("e", "down", () => {
  Events.emitServer("my-mode:interact", { alt: Key.isDown("lshift") });
});
```

`Key.isDown(key)` reads the live state of a key, for a modifier check or your
own polling.

## Remove a bind

`Key.unbind(key, state?, handler?)` with only the key removes every bind your
resource has on it. Pass the state and the same function to remove one:

```ts
const jump = (): void => {
  Events.emitServer("my-mode:jump");
};

Key.bind("space", "down", jump);
Key.unbind("space", "down", jump);
```

`unbind` only touches your own resource's binds. When your resource stops or
is hot-reloaded, all its binds are removed, so no `resourceStop` cleanup is
needed.

## Key names

Names are case-insensitive. Binding a name not in this table throws, so a typo
fails at start-up.

| Group | Names |
| --- | --- |
| Letters | `a` to `z` |
| Digits | `0` to `9` |
| Function | `f1` to `f12` |
| Arrows | `up` `down` `left` `right` |
| Modifiers | `shift` `lshift` `rshift`, `ctrl` (or `control`) `lctrl` `rctrl`, `alt` `lalt` `ralt` |
| Editing | `space` `enter` (or `return`) `escape` (or `esc`) `tab` `backspace` `insert` `delete` `home` `end` `pageup` `pagedown` `capslock` |
| Numpad | `numpad0` to `numpad9` (or `num0` to `num9`) |
| Mouse | `mouse1` (left) `mouse2` (right) `mouse3` (middle) `mouse4` `mouse5` |
| Mouse wheel | `wheelup` (rolled away from you) `wheeldown` (rolled towards you) |

If the name comes from a config file or the server, catch the throw:

```ts
function bindFromConfig(name: string, handler: () => void): boolean {
  try {
    return Key.bind(name, handler);
  } catch {
    console.log(`'${name}' is not a key name`);
    return false;
  }
}
```

### Keys already in use

Nothing stops you binding these, but both actions will happen unless you
[switch the action off](#switch-off-a-game-action). The mod's own keys are
defaults the player can move under the game's Controls > Keybinds >
Multiplayer.

| Key | Used by | Action |
| --- | --- | --- |
| `f9` | the client itself: it disconnects from the server | |
| `t` | opens the chat box, and the mod's Talk to NPC | `kcdc_npc_interact` |
| `g` | the mod's emote wheel | `kcdc_emote_wheel` |
| `h` | voice push-to-talk | `kcdc_push_to_talk` |
| `y` | voice range | `kcdc_voice_tier` |
| `u` | offering to end a fight | `kcdc_end_combat` |
| `tab` | the player list | `kcdc_scoreboard` |
| `f4` | the default gamemode's panel | |

There is no rebinding menu for resource binds. If players need a choice,
store it yourself and bind what they picked.

## Bind the mouse wheel

Each notch of the wheel is a press and a release, so a `"down"` bind runs once
per notch. A fast spin runs it once for every notch, in order, even when
several land in one frame.

```ts
let zoom = 5;

Key.bind("wheelup", () => {
  zoom = Math.max(1, zoom - 1);
});

Key.bind("wheeldown", () => {
  zoom = Math.min(10, zoom + 1);
});
```

- Bind `"down"` or `"up"`, not `"both"`, which runs twice per notch.
- `Key.isDown("wheelup")` is always `false`: the wheel is never held.
- `Key.getLabel` answers `Wheel Up` and `Wheel Down`.
- `Voice.setPushToTalkKey` throws for either name, since push-to-talk needs a
  key that is held.

## Show the key's label

Key names are physical positions, named after a US keyboard: `"z"` is the key
left of `x` whatever is printed on it. `Key.getLabel(key)` gives what the
player's own layout prints there, so a prompt shows the right letter:

```ts
const KEY = "z";

Key.bind(KEY, () => {
  Events.emitServer("my-mode:ready");
});

Hud.showInfoText(`Press ${Key.getLabel(KEY)} when you are ready`, 5000);
```

On a French AZERTY keyboard that reads `Press W`. Printable keys come back in
upper case, others as an English name (`Enter`, `Left Shift`, `Mouse 1`,
`Numpad 4`). It works while a menu or page holds input, and an unknown name
throws. Ask again when you redraw a prompt, since the player can switch layout.

## When binds fire

A bind fires only while:

- the client is in a session,
- nothing captures typed input (the chat box, a game menu, one of the mod's
  native screens, a focused [web view](../../user-interface/web-views/)), and
- the game window is in the foreground.

Otherwise key edges are swallowed and `isDown` answers `false`. A key pressed
while the chat box is open does not fire when it closes. Binds are polled once
per frame: fine for actions, too coarse for text entry (use a web view).

:::caution
`Controls.disable`, [placement](../placement/) and the
[free camera](../camera/) do not stop your binds. A `mouse1` bind still fires on
the click that confirms a placement, and a wheel bind on the notches that turn
its preview, so check `PropPlacer.isActive()` in a handler that should stay
quiet then.
:::

## Freeze the player: `Controls`

`Controls.disable()` stops the camera turning and the character moving, without
a pointer. `Controls.enable()` gives back one hold.

```ts
Events.on("my-mode:round.countdown", () => {
  Controls.disable();
  setTimeout(() => {
    Controls.enable();
  }, 3000);
});
```

Holds are counted per resource. Input returns only once nothing holds it: your
resource, a focused panel, the chat line or an overlay.

## Switch off a game action

`Controls.disableAction(action)` keeps one action of the game's action maps
from doing anything, whatever key the player has it on, while that key still
reaches your `Key.bind`. Use it when your own key shares a game key, or when
your resource takes over what the action does.

```ts
let atStall = false;

Events.on("my-mode:stall", (inside) => {
  if (typeof inside !== "boolean" || inside === atStall) return;
  atStall = inside;
  if (inside) Controls.disableAction("use"); // the game's interaction stops
  else Controls.enableAction("use");
});

Key.bind("e", () => {
  if (atStall) Events.emitServer("my-mode:stall.use");
});
```

- `action` is a name from the game's action maps, such as `use`, or one of the
  mod's own from the [table above](#keys-already-in-use), such as
  `kcdc_npc_interact`. It must be 1 to 64 letters, digits or underscores, or
  the call throws. A well-formed name no map has is accepted and blocks nothing.
- Holds are counted per resource, like `disable`. `enableAction(action)` gives
  back one of yours, and the action works again once no resource holds it.
- The block survives a level load. A stopping resource's holds are given back
  for it.

## Show a mouse pointer

`Controls.showCursor()` draws the mod's pointer without taking input;
`hideCursor()` gives that hold back. The pointer's shape follows the topmost
focused page, so a page's CSS `cursor` is what the player sees.

`isEnabled()` and `isCursorVisible()` answer for everyone: `isEnabled()` is
`false` while anything holds input.

:::tip
Pair every `disable` with an `enable` and every `showCursor` with a
`hideCursor`. An `enable` your resource has no hold for does nothing, so it
cannot release someone else's. A stopping resource's holds are given back for
it.
:::

## Related

- [Show an HTML page (web views)](../../user-interface/web-views/), for focus and typed input
- [Camera and free camera (noclip)](../camera/), for what a key press is aimed at
- [Sounds and voice chat](../sound-and-voice/), for push-to-talk
- [Action hints](../../user-interface/action-hints/), for a "Press [key] to ..." prompt on one of the game's controls
- [Resource manifest and lifecycle](../../core-concepts/resources/)
