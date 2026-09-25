---
title: Build an in-game HTML panel
description: A web page on a key, fed by the client with the local body and by the server with what only it knows, the way the default gamemode's F4 panel works.
sidebar:
  order: 91
---

A web view is an HTML page drawn over the game. On its own it knows nothing: it cannot read the player, and it cannot reach the server. Everything it shows is pushed in by your client script, and everything it does goes back out through that same script.

You will build a small panel on F8 that shows:

- your own health, stamina and position, read on the client from [`LocalPlayer`](../../reference/client/variables/LocalPlayer.md),
- the world clock and everyone connected, which only the server knows, polled while the panel is open,
- a link that sends a `/` command, as if you had typed it.

It is the default gamemode's F4 panel (`src/client/index.ts`, `panel.ts`, `snapshot.ts` and `src/server/panel.ts`) with the tabs taken out.

```text
my-panel/
  package.json
  tsconfig.json
  types/runtime.d.ts
  ui/
    index.html
    app.js
  src/server/
    index.ts
  src/client/
    tsconfig.json
    index.ts
    view.ts
    snapshot.ts
```

The three config files are the ones from [Use TypeScript](../../getting-started/typescript/), with both programs.

## 1. The manifest

`files` is what the server streams to clients. The compiled client script and the page both have to be in it, or the view has nothing to load.

```json title="package.json"
{
  "name": "my-panel",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc -p tsconfig.json && tsc -p src/client/tsconfig.json"
  },
  "devDependencies": {
    "typescript": "^5.9.2"
  },
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"],
    "clientScripts": ["dist/client/index.js"],
    "files": ["dist/client/**", "ui/**"]
  }
}
```

## 2. The page

The page is plain HTML. It is served from the per-server asset cache as `fw://resources/my-panel/ui/index.html`.

```html title="ui/index.html"
<!doctype html>
<html>
  <body style="margin: 0; font: 14px sans-serif; color: #eee; background: rgba(24, 20, 16, 0.92)">
    <div style="padding: 16px">
      <h2>My panel</h2>
      <p id="self">Waiting for the client script.</p>
      <p id="realm"></p>
      <ul id="players"></ul>
      <p><a href="#" data-line="/help">Send /help</a> · <a href="#" id="close">Close (Esc)</a></p>
    </div>
    <!-- a script element that loads app.js goes here -->
  </body>
</html>
```

:::note
This site cannot publish a script tag, even inside a code listing, so the listing stops at a comment. In your file, replace that comment with a script element whose `src` is `app.js`. The default gamemode's `ui/index.html` is a complete page to compare against.
:::

The script talks in two directions. `callEvent(name, json)` is a function the view injects into the page, and it reaches your client script's `Web.on` handlers. Your client script's `Web.emit` arrives as a `CustomEvent` on `window`, with the payload in `event.detail`.

<!-- check: skip -->
```js title="ui/app.js"
"use strict";

// Guarded, so the page also opens in a normal browser while you style it.
const send = (name, payload) => {
  if (typeof callEvent === "function") callEvent(name, JSON.stringify(payload ?? null));
};
const $ = (id) => document.getElementById(id);

window.addEventListener("panel:self", (event) => {
  const self = event.detail;
  $("self").textContent = self
    ? `${self.name}: health ${self.health}/${self.maxHealth}, stamina ${self.stamina}/${self.maxStamina}, at ${self.x}, ${self.y}, ${self.z}`
    : "No body yet.";
});

window.addEventListener("panel:realm", (event) => {
  const realm = event.detail;
  $("realm").textContent = `Hour ${realm.hour.toFixed(1)}, ${realm.weather}`;
  const list = $("players");
  list.replaceChildren();
  for (const player of realm.players) {
    const item = document.createElement("li");
    item.textContent = `${player.name} (${player.health}%)${player.you ? ", you" : ""}`;
    list.append(item);
  }
});

for (const link of document.querySelectorAll("[data-line]")) {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    send("panel:command", { line: link.dataset.line });
  });
}
$("close").addEventListener("click", (event) => {
  event.preventDefault();
  send("panel:close");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") send("panel:close");
});

send("panel:ready");
```

:::danger
Player names are chosen by players. Put them in the page with `textContent`, never `innerHTML`. With `innerHTML`, a player who names themselves with a snippet of HTML gets it run in everyone's panel.
:::

## 3. The view

`view.ts` owns the one view and the rule that makes a web page reliable: **nothing is sent before the page says it is ready.** A page that is still loading has no listeners, and `Web.emit` into it is simply lost. So `push` remembers the newest value per channel, and `markReady` sends all of them at once when the page's `panel:ready` arrives.

```ts title="src/client/view.ts"
const PAGE = "fw://resources/my-panel/ui/index.html";
const WIDTH = 640;
const HEIGHT = 420;

export type PageHandlers = Readonly<Record<string, (payload: unknown) => void>>;

let view = -1;
let ready = false;
const latest = new Map<string, unknown>();

export function isVisible(): boolean {
  return view >= 0 && Web.isViewVisible(view);
}

/** Opens the panel, creating the view the first time. False when it could not. */
export function show(handlers: PageHandlers): boolean {
  if (view < 0 && !create(handlers)) return false;
  Web.showView(view);
  Web.focusView(view, true);
  return true;
}

export function hide(): void {
  if (view < 0) return;
  Web.focusView(view, false);
  Web.hideView(view);
}

export function markReady(): void {
  ready = true;
  for (const [channel, payload] of latest) Web.emit(view, channel, payload);
}

export function push(channel: string, payload: unknown): void {
  latest.set(channel, payload);
  if (ready) Web.emit(view, channel, payload);
}

export function destroy(): void {
  if (view >= 0) Web.destroyView(view);
  view = -1;
  ready = false;
  latest.clear();
}

function create(handlers: PageHandlers): boolean {
  const screen = Web.getScreenSize();
  try {
    view = Web.createView(PAGE, {
      width: WIDTH,
      height: HEIGHT,
      x: Math.round((screen.width - WIDTH) / 2),
      y: Math.round((screen.height - HEIGHT) / 2),
      zIndex: 100,
    });
  } catch (error) {
    console.error(`could not create the panel: ${String(error)}`);
    return false;
  }
  ready = false;
  for (const [name, handler] of Object.entries(handlers)) Web.on(view, name, handler);
  return true;
}
```

Hiding keeps the view and its page alive, so opening it again is instant and the page keeps whatever it last drew.

## 4. The client's own data

The client can read its own body directly. The snapshot copies plain numbers out of it, rounded, because the page only needs to draw them.

```ts title="src/client/snapshot.ts"
export interface SelfSnapshot {
  name: string;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  x: number;
  y: number;
  z: number;
}

export function readSelf(): SelfSnapshot | null {
  // Null before the session spawns a body, so read it fresh every time.
  const self = LocalPlayer;
  if (!self) return null;
  return {
    name: self.nickname,
    health: Math.round(self.health),
    maxHealth: Math.round(self.maxHealth),
    stamina: Math.round(self.stamina),
    maxStamina: Math.round(self.maxStamina),
    x: Math.round(self.position.x),
    y: Math.round(self.position.y),
    z: Math.round(self.position.z),
  };
}
```

## 5. The server's half

The world clock and the player list live on the server. It answers a poll from one client with [`player.emit`](../../reference/server/classes/Player.md#emit), which takes a JSON string. Answering on demand means a panel nobody has open costs the server nothing.

```ts title="src/server/index.ts"
const RESOURCE = "my-panel";

Events.onClient(`${RESOURCE}:poll`, (sender) => {
  const player = sender as Player;
  const realm = {
    hour: World.hour,
    weather: World.weather,
    players: Player.all().map((other) => ({
      name: other.nickname,
      health: Math.round(other.healthPercent),
      you: other.id === player.id,
    })),
  };
  player.emit(`${RESOURCE}:realm`, JSON.stringify(realm));
});
```

## 6. Wiring the client

The entry point binds the key, handles what the page sends, refreshes once a second while the panel is visible, and destroys the view when the resource stops.

```ts title="src/client/index.ts"
import { readSelf } from "./snapshot.js";
import * as view from "./view.js";

const RESOURCE = "my-panel";

function refresh(): void {
  view.push("panel:self", readSelf());
  Events.emitServer(`${RESOURCE}:poll`);
}

const handlers: view.PageHandlers = {
  "panel:ready": () => {
    view.markReady();
    refresh();
  },
  "panel:close": () => view.hide(),
  "panel:command": (payload) => {
    const line = typeof payload === "object" && payload !== null ? (payload as { line?: unknown }).line : undefined;
    if (typeof line === "string" && line.startsWith("/")) Chat.send(line);
  },
};

// F4 is the default gamemode's panel; F5 to F7 and F9 belong to the client itself.
Key.bind("f8", "down", () => {
  if (view.show(handlers)) refresh();
});

// The server's answer arrives already parsed.
Events.on(`${RESOURCE}:realm`, (realm) => view.push("panel:realm", realm));

const timer = setInterval(() => {
  if (view.isVisible()) refresh();
}, 1000);

Events.on("resourceStop", (name) => {
  if (name !== RESOURCE) return;
  clearInterval(timer);
  view.destroy();
});
```

:::caution[A focused view owns the keyboard]
While the view has focus, `Key.bind` handlers do not fire, so F8 cannot close the panel. That is why the page sends `panel:close` on Escape and has its own Close link. If you forget both, the player is stuck in your panel until the resource stops.
:::

`Chat.send` sends the line exactly as if the player had typed it, so the link runs whatever command resource answers `/help`, with the player's own permissions. The page never gets more power than the player already has.

## Try it

Build the resource, then:

```sh title="Server console"
ensure my-panel
```

In game, press F8. Your own numbers appear straight away and the clock and player list a moment later, once the server has answered. Take some damage and watch the health line change. Click "Send /help" and read the answer in chat, then press Escape.

If the panel stays blank, the client log has a `browserLoadingFailed` line: usually the page is missing from `files`, or the URL does not match the resource's folder name.

## Where to go next

- [Show an HTML page (web views)](../../client-scripting/user-interface/web-views/) and [Send data to and from a page](../../client-scripting/user-interface/page-bridge/) cover every `Web` call and the `browser*` events.
- [Send data between server and client](../../core-concepts/networking/) explains why `player.emit` takes a string and `Events.emitServer` does not.
- The default gamemode's `ui/index.html` is a full five-tab version of this page.
