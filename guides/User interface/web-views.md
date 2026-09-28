---
title: Show an HTML page (web views)
description: Put an HTML page on the player's screen with Web.createView, ship it inside your resource, and decide who owns the keyboard.
sidebar:
  label: HTML pages
  order: 80
---

A web view is a Chromium page drawn over the game, owned by one client
resource. Use it for anything with real layout: a scoreboard, a shop, a menu.
The server cannot open one; it sends the client an event and the client does.

## A first view

Three files: the manifest ships the page, the page is ordinary HTML, and the
client script opens it.

```json title="package.json"
{
  "name": "my-hud",
  "version": "1.0.0",
  "mafiahub": {
    "clientScripts": ["dist/client/index.js"],
    "files": ["dist/client/**", "ui/**"]
  }
}
```

```html title="ui/index.html (body)"
<div class="card">Hello from my-hud</div>
```

```ts title="src/client/index.ts"
const view = Web.createView("fw://resources/my-hud/ui/index.html", { x: 0, y: 0, width: 400, height: 120 });

Key.bind("f3", "down", () => {
    if (Web.isViewVisible(view)) {
        Web.hideView(view);
    } else {
        Web.showView(view);
    }
});
```

F3 toggles a card in the top-left corner. The view starts visible and
unfocused, so the player keeps walking while it is up. F5 to F7 and F9 already
belong to the client, so pick other keys.

Give `html` and `body` a `background: transparent` in the page's stylesheet so
the game shows through where you do not draw. For a full working page, read
`resources/kcdc-gamemode/ui/index.html`, the default gamemode's F4 panel, which
ships with every release.

## Where the page comes from

Every file a resource ships to clients is served at
`fw://resources/<resource>/<path inside the resource>`. Relative URLs inside the
page resolve against its folder, so an image with `src` `crest.png` in
`ui/index.html` loads `ui/crest.png`.

- **The manifest must ship the page.** `mafiahub.files` lists globs, relative to
  the resource folder, of extra files sent to every client. Without a `files`
  list only the folders your client scripts sit in are sent, which usually
  leaves out `ui/`.
- **Pass the full `fw://` URL** to `createView`.
- **Refresh or restart the resource** after editing the page so clients get the
  new file. A missing file is a real 404: a blank view and a
  [`browserLoadingFailed`](#when-the-page-fails-to-load) event.

A view can also load an `https://` URL. It is then locked to that origin and
cannot read your `fw://` files.

## Size, position and stacking

| Option | Default | Meaning |
| --- | --- | --- |
| `x`, `y` | `0` | Top-left corner on the screen, in pixels |
| `width`, `height` | `0` | Size of the page. Both 0 fills the screen and follows resolution changes |
| `zIndex` | `0` | Stacking order against your other views; higher is on top |
| `visible` | `true` | Drawn straight away |
| `focus` | `false` | Takes keyboard and mouse straight away |

[`Web.getScreenSize()`](../../reference/client/variables/Web.md#getscreensize)
answers the viewport in pixels, which is how you centre a panel.
`resizeView` and `setViewPosition` change the geometry later.

```ts
const screen = Web.getScreenSize();
const width = Math.min(1040, screen.width - 120);
const height = Math.min(680, screen.height - 120);

const panel = Web.createView("fw://resources/my-hud/ui/panel.html", {
    width,
    height,
    x: Math.round((screen.width - width) / 2),
    y: Math.round((screen.height - height) / 2),
    zIndex: 100,
    visible: false,
});
```

## Focus and the keyboard

- **Unfocused**, the page is a picture. The game keeps keyboard and mouse. HUD
  views stay like this.
- **Focused** (`Web.focusView(view, true)` or `focus: true`), the page owns
  keyboard and mouse. A pointer appears, the camera and character stop, and
  **`Key.bind` handlers stop firing**.

So a key that opens a focused panel cannot close it: the key goes to the page.
The page has to offer the way out, by sending an event
([Send data to and from a page](../page-bridge/) shows the page side):

```ts
const view = Web.createView("fw://resources/my-hud/ui/panel.html", { visible: false });

Web.on(view, "panel:close", () => {
    Web.focusView(view, false);
    Web.hideView(view);
});

// Keeps the panel on screen but gives the game its input back.
Web.on(view, "panel:blur", () => {
    Web.focusView(view, false);
});

// Only fires while the view is unfocused, which is exactly when it may toggle.
Key.bind("f4", "down", () => {
    if (Web.isViewVisible(view)) {
        Web.hideView(view);
        return;
    }
    Web.showView(view);
    Web.focusView(view, true);
});
```

:::danger[Always give a focused page an exit]
A focused view with no close control and no Escape handler leaves the player
stuck with a pointer and no way to move.
:::

:::caution
Hiding a view does not unfocus it. A hidden, focused view keeps the keyboard and
mouse with nothing on screen to click. Call `Web.focusView(view, false)` before
`Web.hideView(view)`.
:::

For a pointer without freezing the player, or a frozen player without a
pointer, use [`Controls`](../../reference/client/variables/Controls.md) instead
(see [Key binds and controls](../../client-scripting/input/)).

## Hide or destroy a view

| Call | Effect |
| --- | --- |
| `hideView` | Stops drawing and painting. Its JavaScript and state live on, so showing it again is instant |
| `setViewOffscreen(view, true)` | Keeps a hidden view painting, for the rare case something samples it |
| `destroyView` | Throws the browser away with every `Web.on` handler on it. The id is dead afterwards |

When your resource stops, the framework destroys every view it owns. Call
`destroyView` yourself only to reset your own bookkeeping:

```ts
let view = Web.createView("fw://resources/my-hud/ui/index.html");

Events.on("resourceStop", (resourceName) => {
    if (resourceName === "my-hud") {
        Web.destroyView(view);
        view = -1;
    }
});
```

## When the page fails to load

| What goes wrong | What you see | What to do |
| --- | --- | --- |
| Wrong path, or the manifest does not ship the file | A blank view and `browserLoadingFailed` | Log the event (below) and check `mafiahub.files` |
| `createView` runs before the browser is up | `createView` throws | Wrap early calls in `try` |
| The page's own script errors | A broken page | Read the client log: page `console.log` output lands there, and `browserConsoleMessage` carries it if you want it in game |

```ts
Events.on("browserLoadingFailed", (event) => {
    if (event.isMainFrame) {
        console.log(`page failed: ${event.description} (${event.errorCode}) at ${event.url}`);
    }
});
```

## Related

- [Send data to and from a page](../page-bridge/): `callEvent`, `Web.on`, `Web.emit` and the `browser*` events.
- [Build an in-game HTML panel](../../tutorials/game-panel/): the gamemode's F4 panel, end to end.
- [Game-native UI screens](../native-ui/): the alternative that looks like part of the game.
- [`Web` reference](../../reference/client/variables/Web.md): every call and option.
