---
title: Show an HTML page (web views)
description: Put an HTML page on the player's screen with Web.createView, ship it inside your resource, and decide who owns the keyboard.
sidebar:
  order: 80
---

A web view is a Chromium page drawn over the game, owned by one client
resource. Use it for anything with real layout: a scoreboard, a shop, a menu,
a form. The page is ordinary HTML, CSS and JavaScript that you ship inside your
resource, and your client script creates the view, moves it, shows and hides
it, and talks to it.

Web views exist on the client only. The server cannot open one; it tells the
client to, with an event.

## A first view

Four files: the manifest, the page, its stylesheet, and the client script that
opens it.

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

The page is ordinary HTML. Its `head` declares UTF-8 and loads `style.css`
with a stylesheet link element; the body is just the markup:

```html title="ui/index.html (body)"
<div class="card">Hello from my-hud</div>
```

```css title="ui/style.css"
html, body { margin: 0; background: transparent; }
.card { margin: 24px; padding: 12px 16px; color: #eee; background: rgba(0, 0, 0, 0.6); font: 14px sans-serif; }
```

Every release ships a complete, working page to read alongside this one:
`resources/kcdc-gamemode/ui/index.html`, the default gamemode's F4 panel.

```ts title="src/client/index.ts"
const PAGE = "fw://resources/my-hud/ui/index.html";

const view = Web.createView(PAGE, { x: 0, y: 0, width: 400, height: 120 });

Key.bind("f3", "down", () => {
    if (Web.isViewVisible(view)) {
        Web.hideView(view);
    } else {
        Web.showView(view);
    }
});
```

F3 now toggles a small card in the top-left corner. The view was created
visible, because `visible` defaults to true, and unfocused, because `focus`
defaults to false, so the player keeps walking around while it is up. (Pick
your keys with care: F5 to F7 and F9 already belong to the client.)

## Where the page comes from

Every file a resource ships to clients is served at
`fw://resources/<resource>/<path inside the resource>`. The page above lives at
`ui/index.html` in a resource called `my-hud`, so its URL is
`fw://resources/my-hud/ui/index.html`. Relative URLs inside the page (a
stylesheet, an image, a second script) resolve against the same folder, so
an image whose `src` is `crest.png` loads `ui/crest.png`.

Two things decide whether the file is there at all:

- **The manifest has to ship it.** `mafiahub.files` is a list of globs, relative
  to the resource folder, of extra files sent to every client. Client scripts
  are always sent; your page is not unless a glob matches it. The default
  gamemode lists `"ui/**"` for exactly this reason. A resource with no `files`
  list only gets the folders its client scripts sit in, which usually does not
  include `ui/`.
- **The URL has to be the full `fw://` one.** Pass the whole URL to
  `createView`, as the default gamemode's `src/client/panel.ts` does.

:::caution
Edit the page, then refresh or restart the resource so the new file is sent to
clients. A missing file is a real 404 in the view, which you will see as a blank
page and a `browserLoadingFailed` event.
:::

A view can also load an `https://` URL. It is then locked to that origin
instead, and it cannot read your `fw://` files. For anything you ship yourself,
use `fw://`.

## Size, position and stacking

`createView` takes pixel geometry in screen space:

| Option | Default | Meaning |
| --- | --- | --- |
| `x`, `y` | `0` | Top-left corner on the screen |
| `width`, `height` | `0` | Size of the page. Leaving both at 0 fills the screen and follows it when the resolution changes |
| `zIndex` | `0` | Stacking order against your other views; higher is on top |
| `visible` | `true` | Whether it is drawn straight away |
| `focus` | `false` | Whether it takes keyboard and mouse straight away |

[`Web.getScreenSize()`](../../../reference/client/variables/Web.md#getscreensize)
answers the current viewport in pixels, which is how you centre a panel.
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

Give the page `background: transparent` on `html` and `body` if you want the
game to show through the parts you do not draw.

## Focus: who owns the keyboard

A view is either focused or not, and the difference is large.

- **Unfocused**, the page is a picture. The game keeps every key and the mouse,
  and the player moves normally. HUD-style views stay like this.
- **Focused** (`Web.focusView(view, true)`, or `focus: true` on creation), the
  page owns keyboard and mouse. A pointer appears, the camera stops turning,
  the character stops moving, and **`Key.bind` handlers stop firing**.

That last point is the one that catches everyone. If F4 opens your panel with
focus, F4 cannot close it again, because the key now goes to the page. The page
itself has to offer the way out.

:::danger[Always give a focused page an exit]
A focused view with no close button and no Escape handler leaves the player
stuck with a pointer and no way to move. Put a close control on the page, and
send an event from it that calls `Web.focusView(view, false)` or
`Web.hideView(view)`.
:::

The default gamemode's F4 panel shows the full arrangement. Its page has a
**Close** button, a **Hand back input** button, and an Escape handler, each of
which sends an event to the client script:

```ts
const view = Web.createView("fw://resources/my-hud/ui/panel.html", { visible: false });

Web.on(view, "panel:close", () => {
    Web.focusView(view, false);
    Web.hideView(view);
});

// Leaves the panel on screen but gives the game its input back,
// so the player can walk and the F4 bind works again.
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

The page side of `panel:close` and `panel:blur` is on the next page,
[Send data to and from a page](../page-bridge/).

:::caution
Hiding a view does not unfocus it. A hidden view that still holds focus keeps
the player's keyboard and mouse, with nothing on screen to click. Always call
`Web.focusView(view, false)` when you hide a focused view. The gamemode's
`hide()` does both, in that order.
:::

If you want a pointer without freezing the player, or a frozen player with no
pointer, focus is the wrong tool: use
[`Controls`](../../../reference/client/variables/Controls.md), described in
[Key binds and controls](../../input/).

## Hidden, offscreen, destroyed

- `hideView` stops drawing the page and stops it painting. Its JavaScript keeps
  running and its state is kept, so showing it again is instant.
- `setViewOffscreen(view, true)` keeps a hidden view painting, for the rare case
  where something else samples it.
- `destroyView` throws the browser away together with every `Web.on` handler on
  it. The id is dead afterwards.

When your resource stops, the framework destroys every view it owns. You only
need `destroyView` yourself to reset your own bookkeeping, which is what the
gamemode does from `resourceStop`:

```ts
const RESOURCE = "my-hud";
let view = Web.createView("fw://resources/my-hud/ui/index.html");

Events.on("resourceStop", (resourceName) => {
    if (resourceName === RESOURCE) {
        Web.destroyView(view);
        view = -1;
    }
});
```

## When the page fails to load

A bad path or a typo in the manifest gives you an empty view and nothing else
on screen. Listen for `browserLoadingFailed` and log it:

```ts
Events.on("browserLoadingFailed", (event) => {
    if (event.isMainFrame) {
        console.log(`page failed: ${event.description} (${event.errorCode}) at ${event.url}`);
    }
});
```

`createView` itself throws when it cannot make a view at all (for example
before the browser is up), so wrap it in `try` if the call can run early. The
page's own `console.log` output goes to the client log without you doing
anything; the `browserConsoleMessage` event is there if you want to show it in
game.

## Related

- [Send data to and from a page](../page-bridge/): `callEvent`, `Web.on`, `Web.emit`, and
  the `browser*` events.
- [Build an in-game HTML panel](../../../tutorials/game-panel/): the gamemode's F4
  panel, end to end.
- [`Web` reference](../../../reference/client/variables/Web.md).
