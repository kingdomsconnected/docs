---
title: Game-native UI screens
description: Compose screens inside the game's Scaleform movies with NativeUI, and drive the game's own UI elements from a client script.
sidebar:
  label: Native UI screens
  order: 84
---

`NativeUI` draws with the game's own Scaleform renderer: your screen uses the
game's fonts and artwork, sits in its layer stack and can be navigated with a
controller. You position every piece yourself. Use it when something should look
like part of KCD2, and a [web view](../web-views/) for everything else; a
resource can use both.

- [`NativeUI.createScreen`](../../reference/client/variables/NativeUI.md#createscreen)
  gives an empty [`NativeScreen`](../../reference/client/classes/NativeScreen.md)
  to compose [`NativeClip`](../../reference/client/classes/NativeClip.md)s into.
- [`NativeUI.element`](../../reference/client/variables/NativeUI.md#element)
  gives a [`NativeElement`](../../reference/client/classes/NativeElement.md), a
  handle on one of the game's existing screens.

## Build a first screen

```ts
const screen = NativeUI.createScreen();

screen.on("ready", () => {
    const root = screen.root;
    if (!root) return;

    // A filled panel, drawn with the ActionScript drawing API. No assets needed.
    const panel = root.createClip();
    if (!panel) return;
    panel.invoke("beginFill", [0x1a1109, 92]);
    panel.invoke("moveTo", [0, 0]);
    panel.invoke("lineTo", [840, 0]);
    panel.invoke("lineTo", [840, 300]);
    panel.invoke("lineTo", [0, 300]);
    panel.invoke("endFill");
    panel.set({ x: 540, y: 390 });

    const label = panel.createText({ x: 32, y: 28, width: 776, height: 244 });
    label?.setTextStyle({ font: "DisplayFont", size: 34, color: 0xe7e0cf });
    label?.setText("Kingdoms Connected");

    panel.on("press", () => Hud.showNotification("clicked"));
    screen.focus();
});

// The back action, while the screen holds focus.
screen.on("input", (action: string) => {
    if (action === "kcdc_ui_back") {
        screen.blur();
        screen.setVisible(false);
    }
});
```

Four rules that sample follows:

- **Build in `ready`.** The movie loads a few frames after `createScreen`
  returns. Until then `screen.ready` is false, `screen.root` is null and every
  call fails. `ready` always arrives on a later tick.
- **Positions are stage units, not pixels.** The stage is scaled to the
  player's resolution, so lay out at 1920 by 1080 like the game's own movies.
  `screen.stage()` reports the size; `screen.screenToStage(x, y)` turns a
  viewport fraction (0 to 1) into stage units.
- **Scale and alpha are multipliers** in `set()`: `scaleX: 1` is natural size,
  `alpha: 0.5` half transparent. The raw `clip.get("_xscale")` reads 100.
- **Events arrive a tick late**, so a handler cannot veto what raised it.

## Add clips and text

Everything on a screen is a clip under `screen.root`:

| Call | Makes or does |
| --- | --- |
| `createClip()` | An empty child, for grouping or drawing into |
| `createText({ x, y, width, height, text?, html? })` | A native text field |
| `attach(exportName)` | A sprite exported by the screen's library |
| `set({ x, y, rotation, scaleX, scaleY, alpha, visible })` | Moves, scales, fades, hides; only the fields present |
| `invoke(method, args)` | Calls an ActionScript method; the drawing API is `beginFill`, `lineStyle`, `moveTo`, `lineTo`, `curveTo`, `endFill`, `clear` |
| `setMember(name, value)`, `get(name)` | Writes or reads one ActionScript property |
| `goto(frameOrLabel, play?)` | Moves the clip's timeline |
| `setMask(clip)`, `setHitArea(clip)` | Masks this clip, or gives it a different click shape |
| `load(url)` | Loads an `img://` image into the clip |
| `remove()` | Takes it off the screen with its handlers |

Only numbers, strings, booleans and `null` cross into ActionScript; objects and
arrays do not.

Text draws in `DefaultFont` at size 20 unless restyled with `setTextStyle`.
Fonts are the game's logical names, which keeps them right in every language:

| Name | Face |
| --- | --- |
| `DefaultFont`, `DefaultFontBold`, `DefaultFontItalic` | Kingdom Come Regular |
| `LightFont`, `LightFontBold`, `LightFontItalic` | Kingdom Light Regular |
| `DisplayFont` | Kingdom Come Display |
| `Manuscript` | Warhorse Manuscript |

```ts
declare const label: NativeClip;

label.setMember("wordWrap", true);
label.setMember("multiline", true);
label.setText("<b>Bold</b> and plain", true); // true: the engine's HTML subset
```

:::caution
`load` answers `true` for any URL it accepts, even a missing one, which shows
the engine's placeholder. It is not an existence check.
:::

## Use the game's artwork

Open a screen against one of the game's movies to attach the sprites it
exports. One screen sees one library; open another screen for a second.

```ts
const menuScreen = NativeUI.createScreen({ library: "Menu" });

menuScreen.on("ready", () => {
    const button = menuScreen.root?.attach("BasicButton");
    button?.set({ x: 200, y: 200 });
});

for (const library of NativeUI.libraries()) {
    console.log(`${library.name || "(default)"}: ${library.exports.length} exports`);
}
```

## Handle input

- `screen.focus()` takes keyboard, controller and mouse. One screen holds focus
  at a time, and the game takes it back for anything with higher priority.
- While a screen holds focus, **`Key.bind` handlers stop firing**, as with a
  focused web view. Close on the screen's `input` event, never on a key bind.
- `input` handlers get the action name and its activation mode: `kcdc_ui_accept`,
  `kcdc_ui_back`, `kcdc_ui_left`, `kcdc_ui_right`, `kcdc_ui_up`, `kcdc_ui_down`.
  There is a pointer only on mouse and keyboard; a gamepad navigates through
  these actions.
- `clip.on("press", handler)` needs something to hit: draw or attach into an
  empty clip first. Other mouse events: `release`, `releaseOutside`,
  `rollOver`, `rollOut`, `dragOver`, `dragOut`.
- Focus does not pause the game; the world and other players keep moving.

## Drive the game's own screens

`NativeUI.element(name, instanceId)` takes a handle on a game element by the
name its XML declares. Instance 0 is the copy the game drives; any other number
is your own private copy, so you do not fight the game for it.

```ts
const menu = NativeUI.element("Menu", 47001);

menu.show(); // loads the movie; functions exist only once it is loaded
menu.call("ClearAll", [0]);
menu.call("PreparePage", [0, 400, 6, "Kingdoms Connected", 1]);
menu.call("AddBasicButton", ["first", 0, "Do the thing", "A tooltip", false]);
menu.call("ShowPage", [""]);

menu.on("OnButton", (args) => {
    Hud.showNotification(`pressed ${String(args[0])}`);
});
```

- `call`, `setVariable`, `getVariable`, `setArray`, `getArray`, `setClip`,
  `getClip` and `gotoClip` take names the element's XML declares; `on` takes an
  event it declares.
- `setArray` is the one call that accepts a list; it fills the game's list
  screens.
- `hide()` hides at once; `requestHide()` plays the hide transition.
- Reading from an element the game has not loaded answers `null` rather than
  loading it.

## Ship your own movie

List the movie in `mafiahub.files` like any client file, then open a screen in
it. `movie` and `assets` are paths inside your resource; `layer` is where the
screen sits in the game's stack.

```ts
const screen = NativeUI.createScreen({
    movie: "ui/myscreen.swf",
    assets: ["ui/plate.dds"],
    layer: 46,
});
```

Such a screen can `attach` only what your movie exports and gets no controller
navigation: it suits art with named clips you drive from script.

## Lifetime and limits

- A screen belongs to the resource that opened it. It closes, with its
  handlers, when the resource stops, when the session ends, or on `close()`.
- If the engine unloads the movie (a level load can), the screen raises
  `unload`, every handle on it stops resolving, and you rebuild on the next
  `ready`.
- A closed screen or removed clip reports `valid: false`, and every call on it
  fails quietly.
- At most 16 screens per resource, 512 mouse handlers per screen and 16
  arguments per ActionScript call.
- One string into ActionScript is at most 64 KiB.
- A shipped movie is at most 32 MiB, with at most 64 extra files beside it.
- There is no layout engine: no flexbox, no reflow, no text measurement beyond
  what a field reports. If you need those, use a [web view](../web-views/).

## Related

- [Show an HTML page (web views)](../web-views/): the browser-based alternative.
- [HUD messages, nametags and compass](../hud/): the game's notifications without building a screen.
- [Key binds and controls](../../client-scripting/input/): input outside a focused screen.
- [`NativeUI` reference](../../reference/client/variables/NativeUI.md): every call and option.
