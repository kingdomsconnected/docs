---
title: "Action hints: \"Press [key] to ...\""
description: Put the game's own "Press [key] to ..." and hold-to-confirm hints on the HUD from a client script, and run code when the player presses the key.
sidebar:
  label: Action hints
  order: 85
---

[`ActionHint`](../../reference/client/variables/ActionHint.md) draws a hint
beside the game's own ones, with the glyph of whatever the player has bound to
that control, and runs your handler when they press it.

```ts
let presses = 0;

ActionHint.create({ key: "companion_interaction", text: "Count" }, (hint) => {
  presses += 1;
  ActionHint.setText(hint, `Count (${presses})`);
});
```

A hint is client-only and local: the player at this machine sees it. To show
one because of something on the server, have the server send an event and
create the hint in the client's handler.

## Pick a key

A hint names a game control, never a physical key. The glyph follows the
player's binding, keyboard or pad, and changes when they rebind it.

The controls are `primary_action` (the interact key), `attack_special`,
`torch`, `companion_interaction`, `distract` and `jump`. `ActionHint.keys()`
returns the list this build accepts, and any other `key` throws.

## Press or hold

```ts
ActionHint.create({ key: "attack_special", text: "Ring the bell", mode: "hold", holdDuration: 1.5 }, () => {
  Events.emitServer("my-mode:bell");
});
```

| Option | Default | What it does |
| --- | --- | --- |
| `key` | required | One of `keys()` |
| `text` | required | Written beside the key, as given (not translated), at most 256 bytes |
| `mode` | `"press"` | `"press"` fires on the press. `"hold"` draws the game's ring and fires once it fills |
| `holdDuration` | 1 | Seconds a hold takes to fill, 0.2 to 10 |
| `enabled` | true | False draws the hint greyed out and keeps its handler from running |

`create` returns the hint's id, which the handler also receives. An option out
of range throws.

## Change or remove a hint

| Call | What it does | Returns false when |
| --- | --- | --- |
| `setText(hint, text)` | Rewrites the text in place | The hint is gone or the text is over 256 bytes |
| `setEnabled(hint, enabled)` | Greys it out, or brings it back | The hint is gone |
| `remove(hint)` | Takes it down for good | It was already gone |

Hints go when the resource that made them stops, so there is nothing to clean
up on stop.

## When hints show

- **Only while the player controls their character**, on foot or in the
  saddle. The game takes hints down in dialogue, minigames and menus, and puts
  them back afterwards.
- **Hints on one key stack.** The newest is drawn and gets the press. Removing
  it brings back the one under it.
- **The game's own action still runs.** A hint on `primary_action` does not
  stop the player interacting with whatever they look at. Prefer a control the
  game is not using at that spot, or a [key bind](../../client-scripting/input/)
  that takes the input.

## Example: a lock toggle

The `kcdc-action-hints-demo` resource puts up two hints: one counts presses, a
second greys the first out while it is locked.

```ts
let enabled = true;

const counter = ActionHint.create({ key: "companion_interaction", text: "Count" }, () => {
  Hud.showNotification("Counted");
});

ActionHint.create({ key: "attack_special", text: "Lock the counter", mode: "hold", holdDuration: 1.5 }, (hint) => {
  enabled = !enabled;
  ActionHint.setEnabled(counter, enabled);
  ActionHint.setText(hint, enabled ? "Lock the counter" : "Unlock the counter");
});
```

## Related

- [Key binds and controls](../../client-scripting/input/): your own keys, without a hint.
- [HUD messages, nametags and compass](../hud/): other game-drawn HUD pieces.
- [Game-native UI screens](../native-ui/): whole screens in the game's own style.
