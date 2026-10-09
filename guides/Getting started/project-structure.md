---
title: Structure a larger resource
description: Split a resource into folders by feature, keep the entry point thin, share event names between halves, and live beside other resources.
sidebar:
  label: Organise a larger resource
  order: 13
---

Split a resource by feature once it does more than one thing, so a change to prices cannot break
spawning. This is the layout the default gamemode uses.

## Use a layout that scales

```text
resources/my-mode/
  package.json
  tsconfig.json                 server program
  src/
    shared/
      events.ts                 event names both halves use
    server/
      index.ts                  entry point: wires features, no logic
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
      hud/
        install.ts
  ui/                           web pages, if you have any
```

### Keep the entry point thin

`index.ts` calls one `install` function per feature, in order, and holds no game logic:

```ts title="src/server/index.ts"
import { installEconomy } from "./economy/install.js";
import { installSpawns } from "./spawns/install.js";

installSpawns();
installEconomy();
```

Each `install` function only registers the feature's handlers:

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

Calling `installSpawns()` explicitly, rather than importing a file for its side effects, keeps the
start order visible in one place.

### Let each feature own its state and cleanup

Each feature keeps its own `Map`s and handlers, and cleans up after a player itself:

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

Key maps by `player.id`, never by the `Player` object: a handle kept from an old event may mean
nothing later. For state that should die with the player, an [entity state bag](../../core-concepts/state/)
is often simpler.

### Put one command in each file

Give each command (a name, a usage line, a function) its own file under `commands/` and register them
in one place. The gamemode's `src/server/command.ts` is a complete registry with `/help`, usage
messages and error handling; [Build a /command system](../../tutorials/command-system/) builds it from
scratch.

## Share code between the two halves

The halves are separate programs (see [Use TypeScript](../typescript/)), but they can share plain code:
event names, payload types, constants. Widen both programs' root to `src/`:

```json title="tsconfig.json" ins={8-9,12}
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "node16",
    "moduleResolution": "node16",
    "lib": ["ES2022"],
    "types": ["@kingdomsconnected/types/server"],
    "rootDir": "src",
    "outDir": "dist",
    "strict": true
  },
  "include": ["src/server/**/*.ts", "src/shared/**/*.ts"]
}
```

```json title="src/client/tsconfig.json" ins={8-9,12}
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "node16",
    "moduleResolution": "node16",
    "lib": ["ES2022"],
    "types": ["@kingdomsconnected/types/client"],
    "rootDir": "..",
    "outDir": "../../dist",
    "strict": true
  },
  "include": ["**/*.ts", "../shared/**/*.ts"]
}
```

Both now write into `dist/server/`, `dist/client/` and `dist/shared/`. Ship the shared folder to
clients too:

```json title="package.json (the mafiahub block)"
{
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"],
    "clientScripts": ["dist/client/index.js"],
    "files": ["dist/client/**", "dist/shared/**"]
  }
}
```

Event names now live in one place, and a typo is a compile error on both sides:

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
Both programs compile `shared/`, so it can only use what both sides have: constants, types, pure
functions. If it touches `Chat`, `Horse` or `LocalPlayer`, one build fails.
:::

## Use packages from npm

| Half | How |
| --- | --- |
| Server | Runs in Node.js, so packages in the resource's `node_modules` import normally (`import { z } from "zod"`). Run `npm install` on the server machine. |
| Client | The loader only follows relative paths inside the resource; `require("zod")` is refused. Bundle the client half into one file with a bundler such as [esbuild](https://esbuild.github.io/) and point `clientScripts` at it. |

## Living next to other resources

All resources on a server share one event bus and one chat:

- **Prefix event names** with your resource's name: `my-mode:round.start`, never `round-start`.
- **Answer only your own commands.** Every resource's `playerCommand` handler runs for every `/` line.
  The default gamemode replies "Unknown command" to anything it does not know, which is noisy next to
  yours; on a real server, remove it or start from a copy of it.
- **Check ownership** on shared systems. Dialogue and NPC events reach every resource; keep a set of
  the sessions or entities you created and ignore the rest.
- **Start order** comes from `resourceDependencies`: a resource starts after those it depends on.
  (`priority` is accepted but does not change the order today.) See
  [Resource manifest and lifecycle](../../core-concepts/resources/).

:::tip[Starting a real gamemode]
Copy `kcdc-gamemode` to a new folder, rename it in `package.json` and delete the commands you do not
want. You keep a command registry, a debug panel and a build setup that already work.
:::

## Related

- [Logs and debugging](../debugging/): the next step; where output goes and why nothing happened.
- [Exports and messages between resources](../../core-concepts/sharing/): call code in another resource.
- [Build a /command system](../../tutorials/command-system/): the command registry, built from scratch.
- [Entity state bags](../../core-concepts/state/): per-player state without a map.
