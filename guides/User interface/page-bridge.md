---
title: Send data to and from a page
description: Send events from a web page to your client script with callEvent and Web.on, push data back with Web.emit, and hold state until the page is ready.
sidebar:
  label: Page data bridge
  order: 81
---

A web view's page and your client script run in separate JavaScript worlds. They
exchange named events carrying JSON, one channel in each direction:

| Direction | Page side | Script side |
| --- | --- | --- |
| Page to script | `callEvent(name, json)` | `Web.on(view, name, handler)` |
| Script to page | `window.addEventListener(name, ...)` | `Web.emit(view, name, payload)` |

This page assumes you already have a view; see
[Show an HTML page (web views)](../web-views/).

## A round trip

The page has a Buy button and shows the player's gold. Its markup is only the
elements the script fills in, and its JavaScript lives in `ui/app.js`, loaded by
a script element at the end of the body:

```html title="ui/index.html (body)"
<div id="actions"></div>
<p>Gold: <span id="gold">0</span></p>
```

<!-- check: skip -->
```js title="ui/app.js"
// Guarded, so the page also opens in a desktop browser while you style it.
const send = (name, payload) => {
  if (typeof callEvent === "function") {
    callEvent(name, payload === undefined ? null : JSON.stringify(payload));
  }
};

const buy = document.createElement("button");
buy.textContent = "Buy 3 apples";
buy.addEventListener("click", () => send("shop:buy", { item: "apple", amount: 3 }));
document.getElementById("actions").appendChild(buy);

window.addEventListener("shop:purse", (event) => {
  document.getElementById("gold").textContent = String(event.detail.gold);
});
```

```ts title="src/client/index.ts"
const view = Web.createView("fw://resources/my-shop/ui/index.html");

Web.on(view, "shop:buy", (payload) => {
    if (typeof payload !== "object" || payload === null) return;
    const { item, amount } = payload as { item?: unknown; amount?: unknown };
    if (typeof item !== "string" || typeof amount !== "number") return;

    Events.emitServer("my-shop:buy", { item, amount });
});

Events.on("my-shop:purse", (gold) => {
    Web.emit(view, "shop:purse", { gold });
});
```

`ui/app.js` runs in the browser, so it uses the DOM and the page's `callEvent`
global, not the scripting API.

## Page to script

`callEvent` takes exactly two arguments: the event name, and a string or `null`.
Anything else throws inside the page. The handler receives:

| Page sent | Handler gets |
| --- | --- |
| `JSON.stringify({ item: "apple" })` | The parsed object |
| A string that is not JSON, like `"hello"` | The string itself |
| `null`, or an empty string | `undefined` |

The handler takes `unknown` on purpose. Check each field before it reaches the
server, and let the server check again: a client can send anything.

`Web.off(view, name)` removes every handler your resource put on that name, or
only one if you pass the same function. `destroyView` drops them all.

:::note
Page events and `browser*` events are separate. A page cannot raise
`browserDocumentReady` with `callEvent`, and `Web.emit` never reaches an
`Events.on` handler. A `callEvent` from a frame outside the view's origin (an
embedded third-party iframe) is refused and reported as `browserResourceBlocked`
with reason `"foreign-event"`.
:::

## Script to page

`Web.emit(view, name, payload)` dispatches a `CustomEvent` called `name` on the
page's `window`, with the payload in `event.detail`.

- The payload goes through `JSON.stringify`, so only plain data arrives.
  Functions are dropped; a `BigInt` or a cycle makes `emit` throw.
- No payload gives the page `event.detail === null`.
- `emit` answers `true` when the dispatch was queued, not when the page heard
  it. A page that has not finished loading has no listeners, and the event is
  lost.

## Hold state until the page is ready

The page loads a few frames after `createView` returns, and again on every
reload. Anything emitted in between is gone. Either wait for the
`browserDocumentReady` event, or, better, have the page say `ready` itself once
its listeners are up. That also covers listeners added late (after a framework
mounts) and fires again on every reload.

Keep the **latest value per channel** and flush them all when the page says
`ready`. This is what the default gamemode's `src/client/panel.ts` does:

```ts title="src/client/bridge.ts"
let view = -1;
let pageReady = false;

/** The newest payload per channel, kept for a page that is not listening yet. */
const latest = new Map<string, unknown>();

export function attach(viewId: number): void {
    view = viewId;
    pageReady = false;
    Web.on(view, "hud:ready", markReady);
}

function markReady(): void {
    pageReady = true;
    for (const [channel, payload] of latest) {
        Web.emit(view, channel, payload);
    }
}

export function push(channel: string, payload: unknown): void {
    latest.set(channel, payload);
    if (view >= 0 && pageReady) {
        Web.emit(view, channel, payload);
    }
}
```

The page announces itself as the last thing its script does:

<!-- check: skip -->
```js title="ui/app.js"
window.addEventListener("hud:health", (event) => {
  document.getElementById("health").textContent = String(event.detail);
});

// Listeners are in place: ask for the current state.
if (typeof callEvent === "function") callEvent("hud:ready", null);
```

The rest of your script calls `push` whenever something changes:

```ts title="src/client/index.ts"
import { attach, push } from "./bridge.js";

attach(Web.createView("fw://resources/my-hud/ui/index.html"));

setInterval(() => {
    const me = LocalPlayer;
    if (me) push("hud:health", Math.round(me.healthPercent));
}, 250);
```

Send **whole values**, never deltas (the gamemode sends its whole 40-line log
each time), so replaying only the newest one is enough. `push` keeps recording
while the view is hidden, so showing it again needs no refresh. If sampling is
expensive, sample only while `Web.isViewVisible(view)` is true.

## Browser events

The view reports what the browser does as reserved events on the `Events` bus.
They go only to the resource that owns the view, and every payload has
`viewId`, so check it when you have more than one view.

| Event | Payload (besides `viewId`) | Use it to |
| --- | --- | --- |
| `browserCreated` | `url` | Know the browser exists (once, before loading) |
| `browserLoadingStart` | `url`, `isMainFrame` | Show a spinner |
| `browserDocumentReady` | `url` | Start emitting, if the page does not say `ready` itself |
| `browserLoadingFailed` | `url`, `description`, `errorCode`, `isMainFrame` | Log a wrong path or a 404 |
| `browserNavigate` | `url`, `isMainFrame`, `blocked` | See navigations, refused or not |
| `browserPopup` | `url`, `openerUrl` | Handle a link that tried to open a window; popups are always blocked |
| `browserCursorChange` | `cursor`, `cursorType` | Follow the page's cursor shape |
| `browserTooltip` | `text` | Draw a tooltip yourself; nothing draws one for you |
| `browserInputFocusChange` | `focused` | Know when the player is typing into a field |
| `browserResourceBlocked` | `url`, `domain`, `reason` | Debug a refused navigation or event |
| `browserConsoleMessage` | `message`, `source`, `line`, `severity` | Show page errors in game (they are logged anyway) |
| `browserOriginChange` | `origin`, `url` | See which origin the view is locked to |

```ts
declare const view: number;

// A link with target="_blank" is blocked as a popup; open it in the view instead.
Events.on("browserPopup", (event) => {
    if (event.viewId === view) Web.loadURL(view, event.url);
});
```

Events are delivered on the next script tick, so a handler added right after
`createView` still sees that view's `browserCreated`. The page cannot navigate
to another origin (`browserResourceBlocked`, reason `"cross-origin"`), but
`Web.loadURL` can, and re-locks the view to the new origin.

## Related

- [Show an HTML page (web views)](../web-views/): create, focus, hide and destroy views.
- [Build an in-game HTML panel](../../tutorials/game-panel/): a full page and bridge, end to end.
- [Send data between server and client](../../core-concepts/networking/): get what the page asked for to the server.
- [`Web` reference](../../reference/client/variables/Web.md): `on`, `off`, `emit` and `loadURL`.
