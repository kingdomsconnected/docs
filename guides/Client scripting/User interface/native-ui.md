---
title: Game-native UI screens
description: Compose screens inside the game's Scaleform movies with NativeUI, and drive the game's own UI elements from a client script.
sidebar:
  order: 85
---

A client resource has two ways to draw a UI. A [web view](../web-views/) is a
browser: it lays out anything and you write it in HTML. `NativeUI` is the
game's own Scaleform renderer: what you build sits inside the game's own layer
stack, uses the game's fonts and artwork, is drawn by the pass that already
draws the HUD, and can be navigated with a controller. You position every
piece yourself. Use it when you want something to look like part of KCD2, and a
web view for everything else. A resource can use both.

There are two entry points:

- [`NativeUI.createScreen`](../../../reference/client/variables/NativeUI.md#createscreen)
  gives you an empty [`NativeScreen`](../../../reference/client/classes/NativeScreen.md)
  to compose [`NativeClip`](../../../reference/client/classes/NativeClip.md)s into.
- [`NativeUI.element`](../../../reference/client/variables/NativeUI.md#element)
  gives you a [`NativeElement`](../../../reference/client/classes/NativeElement.md),
  a handle on one of the game's existing screens (its menu, its HUD).

## A first screen

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

Four rules are in that sample, and each one bites if you assume it away.

**A screen is not composed when `createScreen` returns.** Its movie loads a few
frames later. Until then `screen.ready` is false, `screen.root` is null and
every call on it fails. Build the screen in the `ready` handler, which always
arrives on a later tick.

**Positions are stage units, not pixels.** The stage is the movie's authored
size, scaled to the player's resolution, so a point is in the same place at
1080p and at 4K. The game's own movies are authored at 1920 by 1080; lay out at
that scale. `screen.stage()` reports the size and
`screen.screenToStage(x, y)` turns a viewport fraction (0 to 1) into stage
units.

**Scale and alpha are multipliers.** In `set()`, `scaleX: 1` is natural size
and `alpha: 0.5` is half transparent. Reading the raw property back with
`clip.get("_xscale")` gives the movie's own percentage, 100.

**Events arrive a tick late.** A click is queued and delivered on the next
frame, so a handler cannot veto the thing that raised it.

## Clips and text

Everything on a screen is a clip under `screen.root`:

| Call | Makes or does |
| --- | --- |
| `createClip()` | An empty child, for grouping or drawing into |
| `createText({ x, y, width, height, text?, html? })` | A native text field |
| `attach(exportName)` | A sprite exported by the screen's library |
| `set({ x, y, rotation, scaleX, scaleY, alpha, visible })` | Moves, scales, fades, hides; only the fields present |
| `invoke(method, args)` | Calls an ActionScript method: the drawing API is `beginFill`, `lineStyle`, `moveTo`, `lineTo`, `curveTo`, `endFill`, `clear` |
| `setMember(name, value)`, `get(name)` | Writes or reads one ActionScript property |
| `goto(frameOrLabel, play?)` | Moves the clip's timeline |
| `setMask(clip)`, `setHitArea(clip)` | Masks this clip, or gives it a different click shape |
| `load(url)` | Loads an `img://` image into the clip |
| `remove()` | Takes it off the screen with its handlers |

Only numbers, strings, booleans and `null` cross into ActionScript. An object or
array argument does not.

A text field draws in `DefaultFont` at size 20 unless you restyle it with
`setTextStyle`. Fonts are the game's logical names, not face names, which is
also what keeps them right in every language:

| Name | Face |
| --- | --- |
| `DefaultFont`, `DefaultFontBold`, `DefaultFontItalic` | Kingdom Come Regular |
| `LightFont`, `LightFontBold`, `LightFontItalic` | Kingdom Light Regular |
| `DisplayFont` | Kingdom Come Display |
| `Manuscript` | Warhorse Manuscript |

Wrapping and multi-line text are ordinary field properties:

```ts
declare const label: NativeClip;

label.setMember("wordWrap", true);
label.setMember("multiline", true);
label.setText("<b>Bold</b> and plain", true); // true: the engine's HTML subset
```

:::caution
`load` answers `true` for any URL it accepted, even one that does not exist: a
missing image shows the engine's placeholder. It is not an existence check.
:::

## The game's artwork

Open a screen against one of the game's movies and you can attach the sprites
it exports:

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

`NativeUI.libraries()` lists every library and what it exports. One screen
sees one library; open a second screen for another.

## Input

`screen.focus()` takes keyboard, controller and mouse for that screen. One
screen holds focus at a time, and the game takes it back when something with a
higher priority wants it. While a screen holds focus, `Key.bind` handlers stop
firing, exactly as for a focused web view. So do what the sample does: close on
the screen's own `input` event, never on a key bind.

`input` handlers receive the action name and its activation mode. The actions
are `kcdc_ui_accept`, `kcdc_ui_back`, `kcdc_ui_left`, `kcdc_ui_right`,
`kcdc_ui_up` and `kcdc_ui_down`. There is a mouse pointer only when the player
is on mouse and keyboard; on a gamepad a screen is navigated through those
actions.

`clip.on("press", handler)` also needs something to hit: an empty clip has no
area, so draw or attach into it first. The other mouse events are `release`,
`releaseOutside`, `rollOver`, `rollOut`, `dragOver` and `dragOut`.

Focus does not pause the game. The world keeps running and other players keep
moving.

## Driving the game's own screens

`NativeUI.element(name, instanceId)` takes a handle on one of the game's
elements, by the name its XML declares. Instance 0 is the copy the game itself
drives; any other number is your own private copy of the same element, which is
how you put content on a game screen without fighting the game for it.

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

`call`, `setVariable`, `getVariable`, `setArray`, `getArray`, `setClip`,
`getClip` and `gotoClip` each take a name the element's XML declares, and `on`
takes an event it declares. `setArray` is the one call that accepts a list, and
it is how the game's own list screens are filled. `hide()` hides the element
at once, `requestHide()` plays its hide transition.

Reading from an element the game has not loaded answers `null` rather than
loading it.

## Shipping your own movie

A resource can ship a Scaleform movie and open a screen in it. List it in
`mafiahub.files` like any other client file, then:

```ts
const screen = NativeUI.createScreen({
    movie: "ui/myscreen.swf",
    assets: ["ui/plate.dds"],
    layer: 46,
});
```

`movie` and `assets` are paths inside your resource, and `layer` is where the
screen sits in the game's stack. Such a screen has only what your movie
exports to `attach`, and no controller navigation routed into it: it suits art
with named clips that you drive from script.

## Lifetime and limits

A screen belongs to the resource that opened it and closes when that resource
stops, when the session ends, or when you call `close()`. Its handlers go with
it. If the engine unloads the movie underneath (a level load can), the screen
raises `unload`, every handle on it stops resolving, and you rebuild from the
next `ready`. A closed screen or removed clip keeps reading, reports
`valid: false`, and every call on it fails quietly.

| Limit | Value |
| --- | --- |
| Screens per resource | 16 |
| Mouse handlers per screen | 512 |
| Arguments per ActionScript call | 16 |
| One string into ActionScript | 64 KiB |
| Extra files beside a shipped movie | 64 |
| Shipped movie size | 32 MiB |

There is no layout engine: no flexbox, no reflow, no text measurement beyond
what a field reports. If you need those, you want a [web view](../web-views/).
