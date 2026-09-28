---
title: Key binds and controls
description: Bind keys and mouse buttons with Key, poll them, and take the player's movement or show a pointer with Controls.
sidebar:
  label: Key binds
  order: 71
---

[`Key`](../../reference/client/variables/Key.md) runs your code when the player
presses a key or mouse button. [`Controls`](../../reference/client/variables/Controls.md)
takes gameplay input away from the game, or draws a mouse pointer, while your
resource needs it. Both are client-only.

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

Nothing stops you binding these, but both actions will happen:

| Key | Used by |
| --- | --- |
| `f5`, `f6`, `f7`, `f9` | the client itself (`f7` opens the map editor) |
| `f4` | the default gamemode's panel |
| `v` | voice push-to-talk, unless the player moved it |

There is no rebinding menu for resource binds yet. If players need a choice,
store it yourself and bind what they picked.

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
the click that confirms a placement, so check `PropPlacer.isActive()` in a
handler that should stay quiet then.
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
- [Sounds and voice chat](../sound-and-voice/), to move push-to-talk
- [Resource manifest and lifecycle](../../core-concepts/resources/)
