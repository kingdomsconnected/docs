---
title: Send data to and from a page
description: Send events from a web page to your client script with callEvent and Web.on, push data back with Web.emit, and hold state until the page is ready.
sidebar:
  order: 81
---

A web view and your client script run in different JavaScript worlds. The page
cannot call your functions and your script cannot touch the page's DOM. They
talk through two one-way channels, both carrying a name and a JSON payload:

| Direction | Page side | Script side |
| --- | --- | --- |
| Page to script | `callEvent(name, json)` | `Web.on(view, name, handler)` |
| Script to page | `window.addEventListener(name, ...)` | `Web.emit(view, name, payload)` |

This page assumes you already have a view; see [Show an HTML page (web views)](../web-views/).

## Page to script

The browser gives every page a global function, `callEvent`. It takes exactly
two arguments: the event name, and either a string or `null`. Anything else
throws inside the page.

The samples on this page keep the page's JavaScript in its own file,
`ui/app.js`, which `ui/index.html` loads with a script element at the end of
its body. The page's markup is only the elements the script fills in:

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

const addButton = (label, handler) => {
  const button = document.createElement("button");
  button.textContent = label;
  button.addEventListener("click", handler);
  document.getElementById("actions").appendChild(button);
};

addButton("Close", () => send("shop:close"));
addButton("Buy", () => send("shop:buy", { item: "apple", amount: 3 }));
```

This file runs in the browser, not in the game, so it uses the DOM and the
page's own `callEvent` global rather than the scripting API.

Your client script registers one handler per name, on that view:

```ts
const view = Web.createView("fw://resources/my-shop/ui/index.html");

Web.on(view, "shop:close", () => {
    Web.focusView(view, false);
    Web.hideView(view);
});

Web.on(view, "shop:buy", (payload) => {
    if (typeof payload !== "object" || payload === null) return;
    const { item, amount } = payload as { item?: unknown; amount?: unknown };
    if (typeof item !== "string" || typeof amount !== "number") return;

    Events.emitServer("my-shop:buy", { item, amount });
});
```

What the handler receives depends on what the page sent:

| Page sent | Handler gets |
| --- | --- |
| `JSON.stringify({ item: "apple" })` | The parsed object, `{ item: "apple" }` |
| A string that is not JSON, like `"hello"` | The string itself |
| `null`, or an empty string | `undefined` |

So stringify on the page and read an object in the script. The handler is typed
as taking `unknown` on purpose: the page is code you ship, but it is still a
browser page, and anything it hands you should be checked field by field
before it reaches the server. The server checks it again, because a client can
send whatever it likes.

`Web.off(view, name)` removes every handler your resource put on that name, or
only one if you pass the same function. `destroyView` drops them all.

:::note
Page events and the `browser*` events below are kept apart on purpose. A page
cannot raise `browserDocumentReady` by calling `callEvent("browserDocumentReady")`,
and `Web.emit` never reaches an `Events.on` handler. The view also refuses a
`callEvent` from a frame outside its own origin, such as an embedded
third-party iframe, and reports it as `browserResourceBlocked` with reason
`"foreign-event"`.
:::

## Script to page

`Web.emit(view, name, payload)` dispatches a `CustomEvent` called `name` on the
page's `window`. The payload goes through `JSON.stringify` on the way, and the
page reads it back from `event.detail`:

<!-- check: skip -->
```js title="ui/app.js"
window.addEventListener("shop:purse", (event) => {
  const purse = event.detail || {};
  document.getElementById("gold").textContent = String(purse.gold);
});
```

```ts
declare const view: number;

Web.emit(view, "shop:purse", { gold: 120 });
```

Because the payload is serialised, only plain data arrives: numbers, strings,
booleans, arrays and plain objects. Functions are dropped, and a value
`JSON.stringify` cannot handle (a `BigInt`, a cycle) makes `emit` throw.
Emitting with no payload gives the page `event.detail === null`.

`emit` answers `true` when the dispatch was queued, not when the page heard it.
A page that has not finished loading has no listeners yet, and the event is
simply lost. That is the problem the next section solves.

## Holding state until the page is ready

The page loads a few frames after `createView` returns, and it loads again
whenever it is reloaded. Anything you emit in between is gone. There are two
ways to know the page is listening:

- The `browserDocumentReady` event, which fires when the main document has
  loaded. It is the earliest moment `Web.emit` can land.
- The page telling you itself, with a `callEvent` at the end of its script,
  after it has added its listeners.

The default gamemode uses the second, because it stays correct for a page that
sets its listeners up late (after a framework mounts, say) and it fires again on
every reload. Its `src/client/panel.ts` keeps **the latest value per channel**
in a `Map`, sends straight through once the page is ready, and flushes the whole
map when the page says `ready`. A page that reloads is correct again after one
message.

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

/** The page has its listeners up; everything held goes out now. */
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

The page announces itself as the very last thing its script does:

<!-- check: skip -->
```js title="ui/app.js"
window.addEventListener("hud:health", (event) => {
  document.getElementById("health").textContent = String(event.detail);
});
window.addEventListener("hud:gold", (event) => {
  document.getElementById("gold").textContent = String(event.detail);
});

// Listeners are in place: ask for the current state.
if (typeof callEvent === "function") callEvent("hud:ready", null);
```

For a complete page built this way, read the one every release ships:
`resources/kcdc-gamemode/ui/index.html`. Its script ends with
`send("panel:ready")`, and the client half flushes its held channels in answer.

The rest of your script calls `push` whenever something changes, and never
has to ask whether the page is there:

```ts title="src/client/index.ts"
import { attach, push } from "./bridge.js";

attach(Web.createView("fw://resources/my-hud/ui/index.html"));

setInterval(() => {
    const me = LocalPlayer;
    if (me) push("hud:health", Math.round(me.healthPercent));
}, 250);

Events.on("my-hud:gold", (gold) => {
    push("hud:gold", gold);
});
```

Two properties make this work. Each channel carries a **whole** value (the full
health number, the full list of lines), never a delta, so replaying only the
newest one is enough. And a channel that has never been pushed simply stays
empty until something pushes it. The gamemode sends its log as the whole array
of the last 40 lines for the same reason.

:::tip
While a view is hidden, `push` still records the latest value, so showing the
view again needs no refresh. If sampling is expensive, do what the gamemode
does and only sample while `Web.isViewVisible(view)` is true.
:::

## Browser events

Beside the page's own events, the view reports what the browser does, as
reserved events on the ordinary `Events` bus. They go only to the resource that
owns the view, and each payload carries `viewId`, so check it when you have more
than one view.

| Event | Payload (besides `viewId`) | Use it to |
| --- | --- | --- |
| `browserCreated` | `url` | Know the browser exists (fires once, before loading) |
| `browserLoadingStart` | `url`, `isMainFrame` | Show a spinner |
| `browserDocumentReady` | `url` | Start emitting, if the page does not say `ready` itself |
| `browserLoadingFailed` | `url`, `description`, `errorCode`, `isMainFrame` | Log a wrong path or a 404 |
| `browserNavigate` | `url`, `isMainFrame`, `blocked` | See navigations, refused or not |
| `browserPopup` | `url`, `openerUrl` | Handle a link that tried to open a new window; popups are always blocked |
| `browserCursorChange` | `cursor`, `cursorType` | Follow the page's cursor shape |
| `browserTooltip` | `text` | Draw a tooltip yourself; nothing draws one for you |
| `browserInputFocusChange` | `focused` | Know when the player is typing into a field on the page |
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

Events are queued and delivered on the next script tick, so a handler you add
right after `createView` still sees that view's `browserCreated`. The page
itself cannot navigate to another origin (`browserResourceBlocked` with reason
`"cross-origin"`); `Web.loadURL` can, and re-locks the view to the new origin.

## Related

- [Show an HTML page (web views)](../web-views/): creating, focusing and destroying views.
- [Send data between server and client](../../../core-concepts/networking/): getting
  what the page asked for to the server.
- [Build an in-game HTML panel](../../../tutorials/game-panel/).
