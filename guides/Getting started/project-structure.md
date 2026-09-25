---
title: Structure a larger resource
description: Split a resource into folders by feature, keep the entry point thin, share event names between halves, and live beside other resources.
sidebar:
  order: 14
---

One `index.ts` is fine for a resource that does one thing. Around the third
feature it stops being fine: a spawn system, a shop and a set of admin
commands all reading and writing the same file is how a change to prices ends
up breaking spawning. This page is the layout the default gamemode uses, and
the reasons behind it.

## A layout that scales

```text
resources/my-mode/
  package.json
  tsconfig.json                 server program
  src/
    shared/
      events.ts                 event names both halves use
    server/
      index.ts                  entry point: wires features, no logic
      log.ts
      runtime.d.ts
      command.ts                the command registry
      commands/                 one command per file
        heal.ts
        kit.ts
      spawns/                   one folder per feature
        points.ts
        install.ts
      economy/
        wallet.ts
        install.ts
    client/
      tsconfig.json             client program
      index.ts
      runtime.d.ts
      hud/
        install.ts
  ui/                           web pages, if you have any
```

Three habits make this work.

### The entry point wires, it does not do

`index.ts` imports each feature and calls one `install` function per feature,
in the order they need. It holds no game logic of its own:

```ts title="src/server/index.ts"
import { installEconomy } from "./economy/install.js";
import { installSpawns } from "./spawns/install.js";

installSpawns();
installEconomy();
```

Each `install` function registers the feature's handlers and nothing else:

```ts title="src/server/spawns/install.ts"
// Stand where you want people to arrive and read your position off the
// default gamemode's F4 panel. A guessed coordinate can land inside a hill.
const TOWN_SQUARE = { x: -1423.5, y: 2871.2, z: 118.0 };

export function installSpawns(): void {
  Events.on("playerSpawning", (player) => {
    player.spawn(TOWN_SQUARE);
  });
}
```

Calling `installSpawns()` explicitly, instead of relying on `import
"./spawns/install.js"` running code as a side effect, keeps the order visible
in one place. When one feature needs another to be ready first, you can see
it and change it here.

### A feature owns its state and its cleanup

Each feature folder keeps its own `Map`s and its own event handlers, and
cleans up after a player itself:

```ts title="src/server/economy/wallet.ts"
const balances = new Map<number, number>(); // player id -> coins

export function balanceOf(player: Player): number {
  return balances.get(player.id) ?? 0;
}

export function pay(player: Player, amount: number): void {
  balances.set(player.id, balanceOf(player) + amount);
}

export function forget(player: Player): void {
  balances.delete(player.id);
}
```

```ts title="src/server/economy/install.ts"
import { forget, pay } from "./wallet.js";

export function installEconomy(): void {
  Events.on("playerSpawned", (player) => pay(player, 100));

  Events.on("playerDisconnect", (player) => {
    // The feature that stored it deletes it. Nobody else has to remember.
    forget(player);
  });
}
```

Keep maps keyed by `player.id`, never by the `Player` object: a handle you
kept from an old event is not guaranteed to mean anything later. For state
that should die with the player on its own, an [entity state
bag](../../core-concepts/state/) is often simpler than a map.

### One command per file

A command is a name, a usage line and a function. Give each one its own file
under `commands/` and register them all in one place. The gamemode's
`src/server/command.ts` is a complete registry with `/help`, usage messages
and error handling, and [Build a /command system](../../tutorials/command-system/) builds it from scratch.

## Sharing code between the two halves

The server and the client are separate programs (see [Use TypeScript](../typescript/)), but they can share a folder of plain code:
event names, payload types, constants. Widen both programs' root to `src/`:

```json title="tsconfig.json" ins={6-7,11}
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "rootDir": "src",
    "outDir": "dist",
    "lib": ["ES2022"],
    "strict": true,
    "types": []
  },
  "include": ["src/server/**/*.ts", "src/shared/**/*.ts", "../../scripting-api/generated/server-api.d.ts"]
}
```

```json title="src/client/tsconfig.json" ins={6-7,11}
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "rootDir": "..",
    "outDir": "../../dist",
    "lib": ["ES2022"],
    "strict": true,
    "types": []
  },
  "include": ["**/*.ts", "../shared/**/*.ts", "../../../../scripting-api/generated/client-api.d.ts"]
}
```

Both now write into `dist/server/`, `dist/client/` and `dist/shared/`. Ship
the shared folder to clients too:

```json title="package.json (the mafiahub block)"
{
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"],
    "clientScripts": ["dist/client/index.js"],
    "files": ["dist/client/**", "dist/shared/**"]
  }
}
```

Now event names live in one place, and a typo in one of them is a compile
error on both sides:

```ts title="src/shared/events.ts"
export const EVENTS = {
  openShop: "my-mode:shop.open",
  buy: "my-mode:shop.buy",
} as const;

/** What the client sends when it buys something. */
export interface BuyRequest {
  item: string;
  amount: number;
}
```

```ts title="src/server/economy/shop.ts"
import { EVENTS, type BuyRequest } from "../../shared/events.js";

Events.onClient(EVENTS.buy, (sender, payload) => {
  const player = sender as Player;
  const request = payload as Partial<BuyRequest>;
  // A client can send anything. Check every field before trusting it.
  if (typeof request.item !== "string" || !Number.isInteger(request.amount)) return;
  Chat.sendToPlayer(player, `You asked for ${request.amount} ${request.item}.`);
});
```

:::caution[Shared code must work on both sides]
A file in `shared/` is compiled by both programs, so it can only use what
both sides have. Constants, types and pure functions are fine. The moment it
touches `Chat`, `Horse` or `LocalPlayer`, one of the two builds fails, which
is the compiler doing you a favour.
:::

## Packages from npm

The two halves differ here:

- **Server:** the server half runs in Node.js, so a package installed in the
  resource's own `node_modules` can be imported normally (`import { z } from
  "zod"`). Run `pnpm install` on the machine that runs the server.
- **Client:** the client's loader only follows relative paths inside the
  resource. `require("zod")` is refused. To use a package on the client,
  bundle the client half into one file with a bundler such as
  [esbuild](https://esbuild.github.io/) and point `clientScripts` at the
  bundle.

## Living next to other resources

Every resource on a server shares one event bus and one chat. A few habits
keep them from stepping on each other:

- **Prefix event names** with your resource's name: `my-mode:round.start`,
  never `round-start`.
- **Commands are seen by everyone.** Every resource's `playerCommand` handler
  runs for every `/` line. Answer only the commands you own, and stay silent
  about the rest. (The default gamemode replies "Unknown command" to anything
  it does not know, which is the right call for a server that only runs it,
  and noisy next to yours. For a real server, either take it out or start
  your own gamemode from a copy of it.)
- **Check ownership before acting** on shared systems. A dialogue or an NPC
  event reaches every resource; keep a set of the sessions or entities you
  created and ignore the others.
- **Start order** comes from `resourceDependencies`: a resource starts after
  the ones it depends on. (`priority` is accepted in the manifest but does not
  change the order today.) See [Resource manifest and lifecycle](../../core-concepts/resources/).

:::tip[Starting a real gamemode]
The quickest route to a full gamemode is to copy `kcdc-gamemode` to a new
folder, rename it in `package.json`, and delete the commands you do not want.
You keep a working command registry, a debug panel and a build setup, and you
learn the API by changing code that already works.
:::

## Next

[Logs and debugging](../debugging/): where output goes and how to find
out why something did not happen.
