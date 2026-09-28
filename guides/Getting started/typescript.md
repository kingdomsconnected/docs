---
title: Use TypeScript
description: Compile a resource from TypeScript, with editor autocomplete for the whole API and a fast edit, build, reload loop.
sidebar:
  label: Use TypeScript
  order: 12
---

Compile your resource from TypeScript and your editor knows every global, method, event name and
argument in the API. A misspelt `nickname` or a wrong argument shows up while you type, not in the
server log. This page converts `hello` from [Write your first resource](../first-resource/), using the
default gamemode's setup.

## The layout

```text
server/
  scripting-api/                 declarations, from Install and run a server
    shared.d.ts
    generated/server-api.d.ts
    generated/client-api.d.ts
  resources/hello/
    package.json
    tsconfig.json                the server program
    src/
      server/
        index.ts
        runtime.d.ts
      client/
        tsconfig.json            the client program
        index.ts
        runtime.d.ts
    dist/                        compiler output; what the server runs
```

You need `scripting-api/` next to the server binary. If you do not have it, run the
[fetch script](../install/#3-fetch-the-declarations).

:::note[Why two programs?]
The server's `Player` and the client's `Player` are different classes with the same name (only the
server's can `kick` or `teleport`). One program cannot load both, so each half has its own
`tsconfig.json` and `pnpm run build` compiles them in turn.
:::

## 1. package.json

```json title="resources/hello/package.json"
{
  "name": "hello",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "tsc -p tsconfig.json && tsc -p src/client/tsconfig.json",
    "watch": "tsc -p tsconfig.json --watch",
    "watch:client": "tsc -p src/client/tsconfig.json --watch"
  },
  "devDependencies": {
    "typescript": "^5.9.2"
  },
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"],
    "clientScripts": ["dist/client/index.js"],
    "files": ["dist/client/**"]
  }
}
```

The manifest now points at compiled files in `dist/`. `files` ships the whole compiled client folder,
because a client split across several files needs all of them. Install the compiler:

```sh title="In resources/hello/"
pnpm install
```

## 2. The server program

```json title="resources/hello/tsconfig.json"
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "lib": ["ES2022"],
    "rootDir": "src/server",
    "outDir": "dist/server",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "types": []
  },
  "include": ["src/server/**/*.ts", "../../scripting-api/generated/server-api.d.ts"]
}
```

| Option | Why |
| --- | --- |
| `"module": "CommonJS"` | Resources are loaded with `require()`. Write `import`; the output uses `require`. |
| `"types": []` | Stops TypeScript loading `@types/node` or DOM types. Globals come from the declarations only. |
| The `include` path | Pulls in the server declarations from `scripting-api/`, two folders up. |
| `"lib": ["ES2022"]` | Modern JavaScript, no browser globals like `document` or `window`. |

:::caution[Imports need `.js`]
Write relative imports with the compiled extension: `import { roll } from "./dice.js"` for `dice.ts`.
The server loads `dist/server/dice.js`, and `require` needs that name.
:::

## 3. The client program

It sits beside the client sources, so an editor opening a client file finds the right settings:

```json title="resources/hello/src/client/tsconfig.json"
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "lib": ["ES2022"],
    "rootDir": ".",
    "outDir": "../../dist/client",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "types": []
  },
  "include": ["**/*.ts", "../../../../scripting-api/generated/client-api.d.ts"]
}
```

Same options, the client declarations, and paths two folders deeper.

## 4. Fill the gaps in the declarations

A few things exist at runtime but are missing from the published declarations. Declare them once per
side. These files have no `import` or `export`, which makes their declarations global.

```ts title="resources/hello/src/server/runtime.d.ts"
// What the server runtime has and the published declarations leave out.

interface EventBus {
  /** Sends an event to every connected client's `Events.on` handlers. */
  emitAllClients(eventName: string, payload?: unknown): void;
}

declare function setTimeout(handler: () => void, milliseconds?: number): number;
declare function clearTimeout(handle: number): void;
declare function setInterval(handler: () => void, milliseconds?: number): number;
declare function clearInterval(handle: number): void;
```

```ts title="resources/hello/src/client/runtime.d.ts"
// What the client runtime has and the published declarations leave out.

interface EventBus {
  /** Sends an event to the server's `Events.onClient` handlers. */
  emitServer(eventName: string, payload?: unknown): void;
}

declare function setTimeout(handler: () => void, milliseconds?: number): number;
declare function clearTimeout(handle: number): void;
declare function setInterval(handler: () => void, milliseconds?: number): number;
declare function clearInterval(handle: number): void;
```

:::note[Two more quirks]
- The declarations type `console.log` as taking **one array**, so `console.log("ready")` does not
  compile although it runs. Wrap it once, as `log.ts` below does.
- The client declarations list `Events.onClient`, but it only works on the server. On the client, use
  `Events.on`.
:::

## 5. The code

```ts title="resources/hello/src/server/log.ts"
// The console binding takes any number of values at runtime, but its
// declaration says one array. The cast lives here, once.
type Variadic = (...values: unknown[]) => void;

export function log(...values: unknown[]): void {
  (console.log as unknown as Variadic)(...values);
}
```

```ts title="resources/hello/src/server/index.ts"
import { log } from "./log.js";

log("hello is running");

Events.on("playerSpawned", (player) => {
  Chat.sendToPlayer(player, `Hello, ${player.nickname}. Try /roll.`);
});

Events.on("playerCommand", (player, command, args) => {
  if (command !== "roll") return;

  const sides = Number(args[0] ?? 6);
  if (!Number.isInteger(sides) || sides < 2 || sides > 1000) {
    Chat.sendToPlayer(player, "Usage: /roll [sides], from 2 to 1000.");
    return;
  }

  const result = 1 + Math.floor(Math.random() * sides);
  Chat.sendToAll(`${player.nickname} rolls a d${sides}: ${result}`);
});

Events.onClient("hello:who", (sender) => {
  const names = Player.all().map((player) => player.nickname);
  (sender as Player).emit("hello:online", JSON.stringify(names));
});
```

`player`, `command` and `args` are typed from the event name: hover `playerCommand` to see
`(player: Player, command: string, args: string[])`. The one cast is `sender as Player`: client event
handlers are typed loosely because any client can send anything, but the first argument is always the
sending `Player`.

```ts title="resources/hello/src/client/index.ts"
Key.bind("f8", "down", () => {
  const me = LocalPlayer;
  if (!me) return;
  Hud.showInfoText(`${Math.round(me.health)} / ${Math.round(me.maxHealth)} health`, 3000);
});

Key.bind("f10", "down", () => {
  Events.emitServer("hello:who");
});

Events.on("hello:online", (payload) => {
  // Our own event, so TypeScript cannot know its shape. Check it.
  if (!Array.isArray(payload)) return;
  Hud.showInfoText(`Online: ${payload.join(", ")}`, 5000);
});
```

Delete the old `server/main.js` and `client/main.js`: the manifest no longer points at them.

## 6. Build and reload

```sh title="In resources/hello/"
pnpm run build
```

Then `ensure hello` in the server console. Day to day, keep a compiler running for the half you edit
and type `ensure hello` after each save:

```sh title="In resources/hello/"
pnpm run watch            # server half
pnpm run watch:client     # client half, in a second terminal
```

:::tip
`tsc` still writes JavaScript when there are type errors, so a broken resource can load and fail at
runtime. A clean build prints nothing; read the output before you `ensure`.
:::

## Keeping declarations current

After updating the server to a new release, run the [fetch script](../install/#3-fetch-the-declarations)
again and rebuild every resource. Removed or renamed methods become compile errors instead of surprises
in production.

## Related

- [Structure a larger resource](../project-structure/): the next step; split a resource into folders and share code between halves.
- [Install and run a server](../install/): where the declarations come from.
- [Logs and debugging](../debugging/): reading errors from compiled code.
- [Server API reference](../../reference/server/index.md): everything your editor now autocompletes.
