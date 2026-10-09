---
title: Build a /command system
description: Turn playerCommand into a registry of one-file commands with usage lines, quoted arguments, async commands and a generated /help.
sidebar:
  label: /command system
  order: 90
---

You will build a command registry where each `/command` lives in its own file. In game, `/give "Hunting Sword"` works with spaces in the name, a bad argument answers with the command's usage, and `/help` always lists exactly the commands the server answers.

:::note[Before you start]
- [Write your first resource](../../getting-started/first-resource/) and [Use TypeScript](../../getting-started/typescript/): this tutorial reuses that `tsconfig.json`.
- [Chat and /commands](../../players/chat/) for `playerCommand` and `Chat`.
- [Items: give, take and drop](../../players/items/) for `giveItem` and `takeItem`.

Difficulty: intermediate. Time: about 30 minutes.
:::

## What you will learn

- Routing every `/` line from one [`playerCommand`](../../players/chat/) handler to a command object.
- Rebuilding "quoted arguments", which the server splits on spaces.
- Writing an async command around [`takeItem`](../../players/items/)'s promise, and catching what it throws.
- Generating `/help` from the registry so it never falls out of date.

```text
my-commands/
  package.json
  tsconfig.json          from Use TypeScript
  src/server/
    index.ts             builds the registry, handles playerCommand
    command.ts           Command, CommandContext, CommandRegistry
    args.ts              quoted values and amounts
    commands/
      give.ts
      take.ts
      help.ts
```

It is all server code, cut down from the default gamemode's `src/server/command.ts`.

## 1. Write the manifest

The resource has a server program only.

```json title="package.json"
{
  "name": "my-commands",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc -p tsconfig.json"
  },
  "devDependencies": {
    "@kingdomsconnected/types": "latest",
    "typescript": "^5.9.2"
  },
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"]
  }
}
```

## 2. Define a command and the registry

A command is a plain object: a name, a one-line summary, its usage forms and a `run` function. `run` gets a context instead of raw arguments, so every command answers the caller the same way.

```ts title="src/server/command.ts"
/** One player's chat channel. */
export class Reply {
  constructor(private readonly player: Player) {}

  line(text: string): void {
    Chat.sendToPlayer(this.player, text);
  }

  lines(texts: readonly string[]): void {
    for (const text of texts) this.line(text);
  }
}

export interface CommandContext {
  readonly player: Player;
  readonly args: readonly string[];
  readonly reply: Reply;
  /** Answers with every form of the command. */
  usage(): void;
}

export interface Command {
  readonly name: string;
  readonly summary: string;
  readonly usage: readonly string[];
  run(context: CommandContext): void | Promise<void>;
}

export class CommandRegistry {
  private readonly commands = new Map<string, Command>();

  add(...commands: Command[]): this {
    for (const command of commands) this.commands.set(command.name, command);
    return this;
  }

  all(): Command[] {
    return [...this.commands.values()];
  }

  get(name: string): Command | undefined {
    return this.commands.get(name.toLowerCase());
  }

  /** Runs the command a line names. False when this registry has no such command. */
  dispatch(player: Player, name: string, args: readonly string[]): boolean {
    const command = this.get(name);
    if (!command) return false;

    const reply = new Reply(player);
    const context: CommandContext = {
      player,
      args,
      reply,
      usage: () => reply.lines(command.usage.map((form) => `Usage: ${form}`)),
    };

    // A command is player input reaching game state, so a throw is ordinary.
    const fail = (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`/${command.name} failed: ${message}`);
      reply.line(`/${command.name} could not run: ${message}`);
    };

    try {
      const running = command.run(context);
      if (running instanceof Promise) running.catch(fail);
    } catch (error) {
      fail(error);
    }
    return true;
  }
}
```

- `running.catch(fail)` matters: without it, an async command that throws after its first `await` becomes an unhandled rejection in the log, and the player hears nothing.

## 3. Read quoted arguments and amounts

The server splits a command line on whitespace only, so `/give "Hunting Sword"` arrives as `"Hunting` and `Sword"`. These helpers rebuild the quoted run and validate an amount.

```ts title="src/server/args.ts"
/** One value at `from`: a bare word, or a "quoted run" rebuilt from the words it was split into. */
export function readQuoted(args: readonly string[], from: number): { value: string; next: number } {
  const first = args[from];
  if (first === undefined) return { value: "", next: from };
  if (!first.startsWith('"')) return { value: first, next: from + 1 };
  if (first.length > 1 && first.endsWith('"')) return { value: first.slice(1, -1), next: from + 1 };

  const words = [first.slice(1)];
  for (let index = from + 1; index < args.length; index += 1) {
    const word = args[index] ?? "";
    if (word.endsWith('"')) {
      words.push(word.slice(0, -1));
      return { value: words.join(" "), next: index + 1 };
    }
    words.push(word);
  }
  // No closing quote: take the rest of the line, which is what the player meant.
  return { value: words.join(" "), next: args.length };
}

/** A whole number from 1 to `max`, or null. `Number` refuses the trailing junk `parseInt` accepts. */
export function readAmount(raw: string | undefined, max = 10000): number | null {
  if (raw === undefined || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 1 && value <= max ? value : null;
}
```

- 10000 is the most `giveItem` and `takeItem` accept in one call.

## 4. Write the commands

One file per command. `/give` is synchronous: [`giveItem`](../../reference/server/classes/Player.md#giveitem) adds to the inventory the server holds and returns whether it worked.

```ts title="src/server/commands/give.ts"
import { readAmount, readQuoted } from "../args.js";
import type { Command } from "../command.js";

export const giveCommand: Command = {
  name: "give",
  summary: "Puts an item in your inventory.",
  usage: ["/give <item> [amount]", '/give "<item name>" [amount]'],

  run({ player, args, reply, usage }) {
    const item = readQuoted(args, 0);
    if (item.value === "") return usage();

    const raw = args[item.next];
    const amount = raw === undefined ? 1 : readAmount(raw);
    if (amount === null) return reply.line("The amount must be a whole number from 1 to 10000.");

    if (!player.giveItem(item.value, amount)) {
      return reply.line(`'${item.value}' is not an item this game knows.`);
    }
    reply.line(`Gave you ${amount} x ${item.value}.`);
  },
};
```

`/take` is async: [`takeItem`](../../reference/server/classes/Player.md#takeitem) returns a promise, settled by the time you get it, and takes every unit or none. An async `run` is all it takes, because the registry already catches what it throws and rejects.

```ts title="src/server/commands/take.ts"
import { readAmount, readQuoted } from "../args.js";
import type { Command } from "../command.js";

export const takeCommand: Command = {
  name: "take",
  summary: "Takes an item back out of your inventory.",
  usage: ["/take <item> [amount]"],

  async run({ player, args, reply, usage }) {
    const item = readQuoted(args, 0);
    if (item.value === "") return usage();

    const raw = args[item.next];
    const amount = raw === undefined ? 1 : readAmount(raw);
    if (amount === null) return reply.line("The amount must be a whole number from 1 to 10000.");

    const result = await player.takeItem(item.value, amount);
    if (result.reason === "insufficientItems") return reply.line(`You do not have ${amount} x ${item.value}.`);
    if (!result.ok) return reply.line(`Could not take it: ${result.reason}`);
    reply.line(`Took ${result.removed} x ${item.value}.`);
  },
};
```

:::caution
The player can disconnect during an `await`. Sending a chat line afterwards is harmless, but a command that touches game state after an `await` should look the player up again with `Player.getById(id)` and stop if it is gone.
:::

`/help` needs the registry, so it is a function that builds a command rather than a constant.

```ts title="src/server/commands/help.ts"
import type { Command, CommandRegistry } from "../command.js";

export function helpCommand(registry: CommandRegistry): Command {
  return {
    name: "help",
    summary: "Lists the commands this server answers.",
    usage: ["/help", "/help <command>"],

    run({ args, reply }) {
      const asked = args[0];
      if (asked === undefined) {
        reply.lines(registry.all().map((command) => `/${command.name}: ${command.summary}`));
        return;
      }

      const command = registry.get(asked.replace(/^\//, ""));
      if (!command) return reply.line(`No command called '${asked}'.`);
      reply.line(`/${command.name}: ${command.summary}`);
      reply.lines(command.usage.map((form) => `  ${form}`));
    },
  };
}
```

## 5. Wire it to playerCommand

The entry point builds the registry and connects it to `playerCommand`. `/help` is added last so it lists everything, itself included.

```ts title="src/server/index.ts"
import { CommandRegistry } from "./command.js";
import { giveCommand } from "./commands/give.js";
import { helpCommand } from "./commands/help.js";
import { takeCommand } from "./commands/take.js";

const commands = new CommandRegistry();
commands.add(giveCommand, takeCommand);
commands.add(helpCommand(commands));

Events.on("playerCommand", (player, command, args) => {
  if (!commands.dispatch(player, command, args)) {
    Chat.sendToPlayer(player, `Unknown command '/${command}'. /help lists them.`);
  }
});
```

- A new command is now one new file and one name in `commands.add`.

:::caution[Two resources, one command line]
Every resource with a `playerCommand` handler sees every `/` line. If two of them answer "unknown command", players get a right answer and a wrong one. The default gamemode does this and also owns `/give`, `/take` and `/help`, so stop it while you try this resource. On a real server, let one resource own the "unknown" reply.
:::

## Try it

Build the resource, then run `stop kcdc-gamemode` and `ensure my-commands` in the server console. In game:

1. `/help` lists three commands, and `/help take` shows the usage of one.
2. `/give bread 3` puts three loaves in your inventory.
3. `/take bread 5` says you do not have five and leaves your three loaves alone; `/take bread 3` takes them.
4. `/give bread lots` answers with the amount rule and does nothing.

`start kcdc-gamemode` brings the default commands back.

## Next steps

- Add a `/heal` or `/tp` command as one more file, using [Teleport, kick and other player actions](../../players/actions/).
- Add an `adminOnly` flag to `Command`, check it in `dispatch` against your own list of admins, and leave those commands out of `/help` for everyone else.
- Send these same lines from a page with [Build an in-game HTML panel](../game-panel/).
- Read the default gamemode's `src/server/commands/` for two dozen commands written this way.
