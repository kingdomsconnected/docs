---
title: Use TypeScript
description: Compile a resource from TypeScript, with editor autocomplete for the whole API and a fast edit, build, reload loop.
sidebar:
  order: 13
---

The server and client both run JavaScript. TypeScript is compiled to that
JavaScript before the server loads it, and in return your editor knows every
global, method, event name and argument in the API. Misspell `nickname`, pass
a string where a number goes, or handle an event with the wrong arguments,
and you find out while typing instead of in the server log.

This page converts the `hello` resource from [Write your first resource](../first-resource/) to TypeScript, using the same setup as the
default gamemode.

## The layout

```text
server/
  scripting-api/                 declarations, from Run the default gamemode
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

:::note[Why two programs?]
The server's `Player` and the client's `Player` are different classes with
the same name: only the server's can `kick` or `teleport`. One TypeScript
program cannot load both sets of declarations, so each half is its own
program with its own `tsconfig.json`, and `pnpm run build` compiles them one
after the other.
:::

You need the `scripting-api/` folder next to your server binary. If you
followed [Run the default gamemode](../run-the-gamemode/) you already have it;
otherwise, step 1 of that page downloads it.

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

The manifest now points at the compiled files in `dist/`. `files` ships the
whole compiled client folder, not only the entry point, because a client
split across several files needs all of them on the player's machine.

Install the compiler:

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

A few of these are not the usual defaults, and each one is there for a
reason:

| Option | Why |
| --- | --- |
| `"module": "CommonJS"` | Resources are loaded with `require()`. Write `import` in TypeScript; the output uses `require`. |
| `"types": []` | Stops TypeScript loading `@types/node` or DOM types from anywhere else. The runtime's globals come from the declarations only. |
| The `include` path | Pulls in the server declarations from `scripting-api/`, two folders up. |
| `"lib": ["ES2022"]` | Modern JavaScript, no browser globals like `document` or `window`. |

:::caution[Imports need `.js`]
Write relative imports with the extension the *compiled* file will have:
`import { roll } from "./dice.js"`, even though the file you wrote is
`dice.ts`. The server loads `dist/server/dice.js`, and that is the name the
`require` call has to use.
:::

## 3. The client program

It sits beside the client sources so an editor opening a client file finds
the right settings:

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

Same options, the client declarations instead of the server ones, and paths
two folders deeper.

## 4. Fill the gaps in the declarations

A few things exist at runtime but are missing from the published
declarations. Declare them yourself, once per side. These files have no
`import` or `export`, which is what makes their declarations global.

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
- The declarations type `console.log` as taking **one array**, so
  `console.log("ready")` does not compile although it runs fine. The default
  gamemode wraps it once in a small `log.ts`, shown below; do the same.
- The client declarations also list `Events.onClient`. It only works on the
  server. On the client, listen with `Events.on`.
:::

## 5. The code

The server half, with the log wrapper split into its own file:

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

Notice what you did not have to write: `player`, `command` and `args` are
typed from the event name. Hover `playerCommand` in your editor and it shows
`(player: Player, command: string, args: string[])`.

The one cast is `sender as Player`. Handlers for client events are typed
loosely because any client can send anything; the first argument is always
the sending `Player`, and the payload (none here) is whatever the client
chose to send.

The client half:

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

Delete the old `server/main.js` and `client/main.js`: the manifest no longer
points at them.

## 6. Build and reload

```sh title="In resources/hello/"
pnpm run build
```

Then, in the server console:

```sh title="Server console"
ensure hello
```

For day-to-day work, keep a compiler running for the half you are editing,
and type `ensure hello` after each save:

```sh title="In resources/hello/"
pnpm run watch            # server half
pnpm run watch:client     # client half, in a second terminal
```

:::tip
`tsc` still writes the JavaScript when there are type errors, so a resource
with a mistake in it can load and fail at runtime. Read the compiler's
output before you type `ensure`. A clean build prints nothing.
:::

## Keeping declarations current

When you update the server to a new KCDC release, fetch the declarations
again (`node fetch-declarations.mjs` in the server folder) and rebuild every
resource. New methods appear in your editor, and anything removed or renamed
turns into a compile error instead of a surprise in production.

## Next

[Structure a larger resource](../project-structure/): how to split a resource
into folders so it stays easy to change.
