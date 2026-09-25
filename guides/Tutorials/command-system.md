---
title: Build a /command system
description: Turn playerCommand into a registry of one-file commands with usage lines, quoted arguments, async commands and a generated /help.
sidebar:
  order: 90
---

The server hands every `/` line to one event, `playerCommand`, and does nothing else with it. A handler with a `switch` in it is fine for three commands. Past that you want each command in its own file, a shared way to answer the caller, and a `/help` that can never fall out of date.

You will build the same shape the default gamemode uses (its `src/server/command.ts`), cut down to what you would type in:

- `/give <item> [amount]` and `/take <item> [amount]`, with item names in quotes when they contain spaces,
- `/take` as an async command, because taking items is a round trip to the player's client,
- `/help` and `/help <command>`, built from the registry itself.

```text
my-commands/
  package.json
  tsconfig.json
  types/runtime.d.ts
  src/server/
    index.ts
    command.ts
    args.ts
    commands/
      give.ts
      take.ts
      help.ts
```

`tsconfig.json` and `types/runtime.d.ts` are the ones from [Use TypeScript](../../getting-started/typescript/). Everything here is server code, so there is no client program.

## 1. The manifest

```json title="package.json"
{
  "name": "my-commands",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc -p tsconfig.json"
  },
  "devDependencies": {
    "typescript": "^5.9.2"
  },
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"]
  }
}
```

## 2. The vocabulary

A command is a plain object: a name, a one-line summary for `/help`, every form of its usage, and a `run` function. `run` gets a context instead of raw arguments, so every command answers the caller the same way.

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

The `catch` on the promise matters. Without it, an async command that throws after its first `await` becomes an unhandled rejection in the server log, and the player who typed it hears nothing.

## 3. Reading arguments

The server splits a command line on whitespace and nothing else, so `/give "Hunting Sword"` arrives as two arguments, `"Hunting` and `Sword"`. Rebuilding quoted runs is your job.

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

The 10000 is not arbitrary: it is the most `giveItem` and `takeItem` accept in one call.

## 4. The commands

One file per command. `/give` is synchronous: [`giveItem`](../../reference/server/classes/Player.md#giveitem) sends an instruction to the player's client and returns straight away.

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

`/take` has to wait. The server keeps no inventory, so [`takeItem`](../../reference/server/classes/Player.md#takeitem) asks the client and resolves when it answers. Making `run` async is all it takes; the registry already catches what it throws.

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
    if (result.reason !== "") return reply.line(`Could not take it: ${result.reason}.`);
    if (!result.ok) return reply.line(`You only had ${result.removed} of the ${result.requested} asked for; those are gone.`);
    reply.line(`Took ${result.removed} x ${item.value}.`);
  },
};
```

:::caution
Anything can happen during an `await`, including the player disconnecting. Here the only thing left to do is send a chat line, which is harmless. A command that touches game state after an `await` should look the player up again with `Player.getById(id)` and stop if it is gone.
:::

`/help` is the one command that needs the registry, so it is a function that builds a command rather than a constant.

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

## 5. Wiring it up

The entry point builds the registry and connects it to `playerCommand`. `/help` is added last so it can list everything, itself included.

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

:::caution[Two resources, one command line]
Every resource with a `playerCommand` handler sees every `/` line. If another resource also answers "unknown command", a player typing a command that one of you owns gets a correct answer and a wrong one. The default gamemode does this, and it also owns `/give`, `/take` and `/help`, so stop it while you try this resource. In a real server, pick one resource to own the "unknown" reply and keep the others silent.
:::

Adding a command from now on is one new file and one name in `commands.add`.

## Try it

Build the resource, then from the server console:

```sh title="Server console"
stop kcdc-gamemode
ensure my-commands
```

In game:

1. `/help` lists three commands, and `/help take` shows the usage of one.
2. `/give bread 3` puts three loaves in your inventory.
3. `/take bread 5` takes the three you have and tells you it could not find the other two.
4. `/give bread lots` answers with the amount rule instead of doing anything.

`start kcdc-gamemode` brings the default commands back.

## Where to go next

- [Chat messages and /commands](../../server-scripting/players/chat/) covers `Chat` and `playerCommand` on their own.
- [Build an in-game HTML panel](../game-panel/) puts a page on screen that can send these same lines.
- The default gamemode's `src/server/commands/` has two dozen commands written this way.
