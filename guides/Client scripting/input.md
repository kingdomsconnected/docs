---
title: Key binds and controls
description: Bind keys with Key, poll them, and take the player's movement or show a pointer with Controls.
sidebar:
  order: 71
---

[`Key`](../../reference/client/variables/Key.md) lets a client resource react
to a physical key or mouse button. [`Controls`](../../reference/client/variables/Controls.md)
does the opposite: it takes gameplay input away from the game, or draws a mouse
pointer, while your resource needs it. Both exist only on the client.

```ts
Key.bind("f6", () => {
  Hud.showInfoText("F6 pressed");
});
```

## Binding a key

`Key.bind(key, state, handler)` installs a handler. `state` is `"down"`,
`"up"` or `"both"`; leave it out and pass the handler second to get `"down"`.
The handler is called with the key name and the edge that actually fired, which
is how one handler serves both edges:

```ts
let aiming = false;

Key.bind("mouse2", "both", (key, state) => {
  aiming = state === "down";
});

Key.bind("e", "down", () => {
  if (Key.isDown("lshift")) {
    Events.emitServer("my-mode:interact", { alt: true });
  } else {
    Events.emitServer("my-mode:interact", { alt: false });
  }
});
```

`Key.isDown(key)` reads the live state of a key, which is what a modifier check
or your own polling loop wants.

To remove a bind, call `Key.unbind(key, state?, handler?)`. With only the key it
removes every bind your resource has on that key; pass the state and the exact
function to remove one:

```ts
const jump = (): void => {
  Events.emitServer("my-mode:jump");
};

Key.bind("space", "down", jump);
Key.unbind("space", "down", jump);
```

`unbind` only touches binds your own resource made, so it cannot remove
another resource's handler by accident.

## Key names

Names are case-insensitive. Binding a name that is not in this table throws, so
a typo fails at start-up rather than silently never firing.

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

:::caution[Keys that are already taken]
F5 to F7 and F9 belong to the client itself (F7 opens the map editor), which is
why the default gamemode puts its panel on F4. Voice push-to-talk is on `v`
unless the player moved it. Nothing stops you binding these, but both actions
will happen.
:::

There is no rebinding menu for resource binds yet: the key you ask for is the
key the player gets. If players need a choice, store it yourself and bind
whatever they picked.

## When binds fire

A bind fires only when the player could otherwise be walking around:

- the client is in a session,
- nothing is capturing typed input: the chat box, a game menu, one of the mod's
  native screens, or a focused [web view](../user-interface/web-views/), and
- the game window is in the foreground.

While any of those is false, key edges are swallowed and `isDown` answers
`false`. A key pressed while the chat box is open does not fire when it closes.
That is what keeps typing a message from triggering gameplay actions.

Binds are polled once per frame, so they detect edges at the game's frame rate.
That is fine for actions and too coarse for text entry; use a web view with a
real text field for that.

:::caution
`Controls.disable`, [placement](../placement/) and a [Free camera (noclip)](../noclip/) do
not stop your binds. A `mouse1` bind still fires on the click that confirms a
placement. Check `PropPlacer.isActive()` in a handler that should stay quiet
then.
:::

## Binds belong to the resource

When your resource stops, or is hot-reloaded, every bind it made is removed.
You do not need to unbind anything in a `resourceStop` handler; binding again at
start-up is enough.

## Taking control away: `Controls`

`Controls.disable()` stops the camera turning and the character moving, without
drawing a pointer. `Controls.enable()` gives back one hold. Holds are counted
per resource: gameplay input returns only once nothing holds it, whether that
is your resource, a focused panel, the chat line or an overlay.

```ts
Events.on("my-mode:round.countdown", () => {
  Controls.disable();
  setTimeout(() => {
    Controls.enable();
  }, 3000);
});
```

`Controls.showCursor()` draws the mod's pointer without taking input, and
`hideCursor()` gives that hold back. The pointer's shape follows the topmost
focused page, so a page's own CSS `cursor` is what the player sees.

`isEnabled()` and `isCursorVisible()` answer for everyone, not just your
resource: `isEnabled()` is `false` while anything holds input.

:::tip
Pair every `disable` with an `enable` and every `showCursor` with a
`hideCursor`. A call to `enable` your resource has no hold for does nothing, so
it cannot release someone else's. If your resource stops while holding either,
its holds are given back for it.
:::

## Related

- [Show an HTML page (web views)](../user-interface/web-views/), for focus and typed input
- [Camera and raycasts](../camera/), for what a key press is aimed at
- [Resource manifest and lifecycle](../../core-concepts/resources/)
