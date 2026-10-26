---
title: "Action hints: \"Press [key] to ...\""
description: Put the game's own "Press [key] to ..." and hold-to-confirm hints on the HUD from a client script, run code when the player presses the key, and read every hint on screen.
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

The controls include `primary_action` (the interact key), `attack_primary`,
`attack_special`, `block`, `torch`, `companion_interaction`, `distract` and
`jump`. `ActionHint.keys()` returns the full list this build accepts, and any
other `key` throws.

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
  game is not using at that spot (`isKeyInUse`, below, says whether a hint is
  already on it), or a
  [key bind](../../client-scripting/input/) with the game's action
  [switched off](../../client-scripting/input/#switch-off-a-game-action).

## Read the hints on screen

`ActionHint.shown()` lists every hint the HUD draws right now, in the HUD's
order: the game's own, interaction prompts such as talking to someone or
opening a door, and every resource's. With the game's hints hidden, a resource
can draw them in its own UI, and the keys keep doing what they do:

```ts
declare const hintView: number; // your own web view

Hud.setElementVisible("Hints", false);

Events.on("actionHintsChanged", () => {
  const prompts = ActionHint.shown().filter((hint) => hint.map === "player");
  Web.emit(hintView, "hints:update", prompts);
});
```

| Field | Meaning |
| --- | --- |
| `key` | The control a resource's hint is on, or the action a game hint triggers (`talk`, `use`) |
| `map` | The action map it belongs to: `player` for the world's prompts; the game's menu screens have their own (`apse`, `apse_inventory`, `help_dialog`) |
| `text` | What the HUD writes beside the key, in the player's language. A game label made of several words is translated word by word, as the HUD does; a resource's text comes back as written |
| `mode` | `"press"` or `"hold"` |
| `enabled` | `false` for a hint drawn greyed out |
| `progress` | How far a hold ring has filled, 0 to 1; 0 while nobody holds it |
| `target` | Who the prompt is about, as the game names them (a server NPC under the name it was given), or empty for anything that is not a person or an animal |

- `ActionHint.shownKeys()` lists each control a drawn hint is on, once.
- `ActionHint.isKeyInUse(key)` says whether a drawn hint is on that control,
  any of the game's (`use`, `jump`) and not only `keys()`. It throws unless
  `key` is a string.
- All three read the game's last hint refresh, at most a frame old.
- `actionHintsChanged` fires when a hint appears or goes, changes its text, is
  greyed out, or a hold ring moves, so it fires again and again while a ring
  fills. Handler promises are not awaited.

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
