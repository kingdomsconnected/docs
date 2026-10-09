---
title: Use TypeScript
description: Compile a resource from TypeScript, with editor autocomplete for the whole API and a fast edit, build, reload loop.
sidebar:
  label: Use TypeScript
  order: 12
---

Compile your resource from TypeScript and your editor knows every global, method, event name and
argument in the API. A misspelt `nickname` or a wrong argument shows up while you type, not in the
server log. This page converts `hello` from [Write your first resource](../first-resource/).

## The layout

```text
resources/hello/
  package.json
  tsconfig.json                the server program
  src/
    server/
      index.ts
    client/
      tsconfig.json            the client program
      index.ts
  dist/                        compiler output; what the server runs
```

The declarations come from npm as
[`@kingdomsconnected/types`](https://www.npmjs.com/package/@kingdomsconnected/types), published with
every release. Its version is the release version.

:::note[Why two programs?]
The server's `Player` and the client's `Player` are different classes with the same name (only the
server's can `kick` or `teleport`). One program cannot load both, so each half has its own
`tsconfig.json`, naming its side of the package, and `npm run build` compiles them in turn.
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
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"],
    "clientScripts": ["dist/client/index.js"],
    "files": ["dist/client/**"]
  }
}
```

The manifest now points at compiled files in `dist/`. `files` ships the whole compiled client folder,
because a client split across several files needs all of them.

Install the compiler and API declarations:

```sh title="In resources/hello/"
npm install --save-dev typescript @kingdomsconnected/types@latest
```

## 2. The server program

```json title="resources/hello/tsconfig.json"
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "node16",
    "moduleResolution": "node16",
    "lib": ["ES2022"],
    "types": ["@kingdomsconnected/types/server"],
    "rootDir": "src/server",
    "outDir": "dist/server",
    "strict": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src/server/**/*.ts"]
}
```

| Option | Why |
| --- | --- |
| `"types"` | Loads the server declarations, and nothing else: no `@types/node`, no DOM. Every API global (`Events`, `Player`, `setTimeout`, `console`...) comes from here, with no import. |
| `"module": "node16"` | Resources are loaded with `require()`. Write `import`; because `package.json` has no `"type": "module"`, the output uses `require`. Works with TypeScript 5.9 and later. |
| `"lib": ["ES2022"]` | Modern JavaScript. Leave out `"DOM"`: it declares a second `console` and `setTimeout`. |

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
    "module": "node16",
    "moduleResolution": "node16",
    "lib": ["ES2022"],
    "types": ["@kingdomsconnected/types/client"],
    "rootDir": ".",
    "outDir": "../../dist/client",
    "strict": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["**/*.ts"]
}
```

Same options, with the client side of the package and the output two folders up.

## 4. The code

```ts title="resources/hello/src/server/index.ts"
console.log("hello is running");

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

## 5. Build and reload

```sh title="In resources/hello/"
npm run build
```

Then `ensure hello` in the server console. Day to day, keep a compiler running for the half you edit
and type `ensure hello` after each save:

```sh title="In resources/hello/"
npm run watch            # server half
npm run watch:client     # client half, in a second terminal
```

:::tip
`tsc` still writes JavaScript when there are type errors, so a broken resource can load and fail at
runtime. A clean build prints nothing; read the output before you `ensure`.
:::

## Update after a server upgrade

Update the declarations and rebuild. Removed or renamed methods become
compile errors instead of surprises in production:

```sh title="In resources/hello/"
npm install --save-dev @kingdomsconnected/types@latest
npm run build
```

## Related

- [Structure a larger resource](../project-structure/): the next step; split a resource into folders and share code between halves.
- [@kingdomsconnected/types on npm](https://www.npmjs.com/package/@kingdomsconnected/types): the declarations and their versions.
- [Logs and debugging](../debugging/): reading errors from compiled code.
- [Server API reference](../../reference/server/index.md): everything your editor now autocompletes.
