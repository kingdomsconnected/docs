---
title: Build an in-game HTML panel
description: A web page on a key, fed by the client with the local body and by the server with what only it knows, the way the default gamemode's F4 panel works.
sidebar:
  label: HTML panel
  order: 91
---

You will build an HTML panel that opens on F8. It shows your health, stamina and position, the world clock and everyone connected, and has a link that sends `/help` as if you had typed it.

:::note[Before you start]
- [Write your first resource](../../getting-started/first-resource/) and [Use TypeScript](../../getting-started/typescript/), with both the server and client programs.
- [Show an HTML page (web views)](../../user-interface/web-views/) and [Send data to and from a page](../../user-interface/page-bridge/).

Difficulty: intermediate. Time: about 45 minutes.
:::

## What you will learn

- Creating, showing, focusing and hiding a [web view](../../user-interface/web-views/).
- Talking to the page with `Web.emit`, `Web.on` and `callEvent` through the [page bridge](../../user-interface/page-bridge/), without losing messages sent before it loads.
- Reading the [local player](../../client-scripting/local-player/) on the client.
- Polling the server for data only it has, with [server and client messages](../../core-concepts/networking/).
- Binding a [key](../../client-scripting/input/) and cleaning up on `resourceStop`.

```text
my-panel/
  package.json
  tsconfig.json          from Use TypeScript
  ui/
    index.html           the page
    app.js               the page's script
  src/server/
    index.ts             answers the poll
  src/client/
    tsconfig.json        from Use TypeScript
    index.ts             key, page handlers, refresh timer
    view.ts              owns the web view
    snapshot.ts          reads the local player
```

It is the default gamemode's F4 panel (`src/client/index.ts`, `panel.ts`, `snapshot.ts` and `src/server/panel.ts`) with the tabs taken out.

## 1. Write the manifest

`files` is what the server streams to clients: the compiled client script and the page must both be in it.

```json title="package.json"
{
  "name": "my-panel",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc -p tsconfig.json && tsc -p src/client/tsconfig.json"
  },
  "devDependencies": {
    "@kingdomsconnected/types": "1.5.3",
    "typescript": "^5.9.2"
  },
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"],
    "clientScripts": ["dist/client/index.js"],
    "files": ["dist/client/**", "ui/**"]
  }
}
```

## 2. Write the page

The page is plain HTML, served as `fw://resources/my-panel/ui/index.html`.

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
This site cannot publish a script tag, even in a listing. In your file, replace the comment with a script element whose `src` is `app.js`. The default gamemode's `ui/index.html` is a complete page to compare against.
:::

The page's script calls `callEvent(name, json)` to reach your client script's `Web.on` handlers, and receives `Web.emit` as a `CustomEvent` on `window`, with the payload in `event.detail`.

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

- `send("panel:ready")` on the last line tells the client script the page is listening. Step 3 depends on it.

:::danger
Player names are chosen by players. Put them in the page with `textContent`, never `innerHTML`, or a player named with a snippet of HTML gets it run in everyone's panel.
:::

## 3. Own the view

`view.ts` owns the one view and one rule: **nothing is sent before the page says it is ready**, because `Web.emit` into a page that is still loading is lost. `push` remembers the newest value per channel, and `markReady` sends them all when `panel:ready` arrives.

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

- `hide` keeps the view and its page alive, so opening it again is instant.

## 4. Read the local player

The client reads its own body directly and copies out rounded numbers for the page to draw.

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

## 5. Answer the poll on the server

The clock and the player list live on the server. It answers one client's poll with [`player.emit`](../../reference/server/classes/Player.md#emit), which takes a JSON string, so a panel nobody has open costs nothing.

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

## 6. Wire the client

The entry point binds F8, handles what the page sends, refreshes once a second while the panel is visible, and destroys the view when the resource stops.

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

- `Chat.send` sends the line exactly as if the player typed it, with the player's own permissions, so the page never gets more power than the player has.

:::caution[A focused view owns the keyboard]
While the view has focus, `Key.bind` handlers do not fire, so F8 cannot close the panel. That is why the page sends `panel:close` on Escape and has a Close link. Without both, the player is stuck until the resource stops.
:::

## Try it

Build the resource and run `ensure my-panel` in the server console. In game, press F8. Your own numbers appear straight away, and the clock and player list a moment later, once the server answers. Take some damage and watch the health line change. Click "Send /help" and read the answer in chat, then press Escape.

If the panel stays blank, look for a `browserLoadingFailed` line in the client log: usually the page is missing from `files`, or the URL does not match the resource's folder name.

## Next steps

- Add a button that sends a `/give` line to the [/command system](../command-system/).
- Show a HUD message or notification alongside the panel with [HUD messages, nametags and compass](../../user-interface/hud/).
- Push server data only when it changes, with [entity state bags](../../core-concepts/state/), instead of polling.
- Compare with the default gamemode's `ui/index.html`, a full five-tab version of this page.
