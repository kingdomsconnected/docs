---
title: Chat messages and /commands
description: Send chat lines to players, own how chat is relayed, and answer slash commands with their arguments.
sidebar:
  order: 37
---

The server-side [`Chat`](../../../reference/server/variables/Chat.md) object
sends lines to players. Two events bring lines in: `playerChat` for ordinary
messages and `playerCommand` for anything starting with `/`. Every command a
server answers comes from a resource like yours; the server has none of its
own.

```ts title="src/server/index.ts"
Events.on("playerSpawned", (player) => {
  Chat.sendToPlayer(player, `Welcome, ${player.nickname}.`, { author: "Server" });
});

Events.on("playerCommand", (player, command) => {
  if (command === "online") {
    Chat.sendToPlayer(player, `${Player.all().length} player(s) online.`);
  }
});
```

## Sending

| Call | Goes to |
| --- | --- |
| `Chat.sendToAll(text, options?)` | Every connected player. |
| `Chat.sendToPlayer(player, text, options?)` | One player. |

Both take the same options:

- `author`: the name shown before the line. Leave it out for a system notice,
  which the client styles differently.
- `color`: the colour of the line's text, either a
  [`Color`](../../../reference/server/classes/Color.md) or a packed number.

```ts
Chat.sendToAll("Round starts in 10 seconds.", { color: 0xFFD24DFF });
Chat.sendToAll("The gates are closing.", { color: Color.fromRGB(200, 60, 60) });
Chat.sendToPlayer(player, "You are on the red team.", { author: "Referee" });
```

:::caution
A packed chat colour is `0xRRGGBBAA`, alpha **last**, and always needs all
eight digits: `0xFF8800` is read as `0x00FF8800` (green-blue, not orange).
`0` means the client's default colour. Nametag colours use the opposite order,
`0xAARRGGBB`. When in doubt, pass a `Color`.
:::

## Receiving plain lines

`playerChat` fires with the sender and the text of every line that does not
start with `/`:

```ts
Events.on("playerChat", (player, text) => {
  console.log(`[chat] ${player.nickname}: ${text}`);
});
```

The line's author is always the sender's real nickname. Clients cannot set an
author or colour on their own lines; only the server can.

## Owning the relay

By default the server relays every plain line to everyone, the sender
included, under the sender's nickname. That happens **before** `playerChat`
runs, so while the default relay is on your handler can react to a line but
cannot stop it.

To filter, restrict or reformat chat, turn the relay off and deliver lines
yourself. [`Chat.setDefaultRelay`](../../../reference/server/variables/Chat.md#setdefaultrelay)
is a KCDC addition; `Chat.isDefaultRelay()` reads the current setting.

This is proximity chat, where only players within 30 metres see a line:

```ts title="src/server/local-chat.ts"
const RANGE = 30;

Chat.setDefaultRelay(false);

Events.on("playerChat", (player, text) => {
  for (const other of Player.all()) {
    if (!other.ready || other.virtualWorld !== player.virtualWorld) continue;
    if (other.position.distance(player.position) <= RANGE) {
      Chat.sendToPlayer(other, text, { author: player.nickname });
    }
  }
});
```

:::note
With the relay off, the sender does not see their own line unless you send it
to them: the client shows nothing locally when it sends. The loop above
includes the sender because their distance to themselves is 0.
:::

`setDefaultRelay` is server-wide. If two resources both want to own chat, only
one of them should turn the relay off and deliver lines; have the other react
to `playerChat` without sending.

## Commands

A line starting with `/` is never relayed to anyone. It raises `playerCommand`
with the command word and the rest of the line split on whitespace:

| Typed | `command` | `args` |
| --- | --- | --- |
| `/heal` | `"heal"` | `[]` |
| `/give apple 5` | `"give"` | `["apple", "5"]` |
| `/tp Jan Zizka` | `"tp"` | `["Jan", "Zizka"]` |
| `/Give  apple` | `"Give"` | `["apple"]` |

The command keeps the case the player typed, so lower-case it before you
compare. Answer unknown commands, or the player's line simply disappears:

```ts
Events.on("playerCommand", (player, command, args) => {
  switch (command.toLowerCase()) {
    case "heal":
      player.clearBuffs("bleed");
      Chat.sendToPlayer(player, "Bandaged.");
      return;
    case "me":
      Chat.sendToAll(`* ${player.nickname} ${args.join(" ")}`, { color: 0xC8A2FFFF });
      return;
    default:
      Chat.sendToPlayer(player, `Unknown command '/${command}'.`);
  }
});
```

:::caution
More than one resource can listen to `playerCommand`, and each of them sees
every command. If two resources both answer unknown commands, the player gets
two "unknown command" replies. Let one resource (usually your gamemode) own
that reply.
:::

### Arguments with spaces

The split is on whitespace and nothing else, so quotes arrive as part of the
words: `/give "Hunting Sword" 2` gives `['"Hunting', 'Sword"', '2']`. The default
gamemode's `src/server/args.ts` rebuilds a quoted run:

```ts title="src/server/args.ts"
/** A bare word, or a "quoted run" rebuilt from the words it was split into. */
export function readQuoted(args: readonly string[], from: number): { value: string; next: number } {
  const first = args[from];
  if (first === undefined) return { value: "", next: from };
  if (!first.startsWith('"')) return { value: first, next: from + 1 };
  if (first.length > 1 && first.endsWith('"')) return { value: first.slice(1, -1), next: from + 1 };

  const words = [first.slice(1)];
  for (let index = from + 1; index < args.length; index += 1) {
    const word = args[index] as string;
    if (word.endsWith('"')) {
      words.push(word.slice(0, -1));
      return { value: words.join(" "), next: index + 1 };
    }
    words.push(word);
  }
  return { value: words.join(" "), next: args.length }; // unterminated: take the rest
}
```

Runs of spaces inside quotes collapse to one, since the split already threw
them away.

### Naming a player

Commands that target someone need to turn a word into a player. The default
gamemode's `src/server/players.ts` tries an exact name, then a unique prefix,
then a connection slot:

```ts title="src/server/players.ts"
export function findPlayer(query: string): Player | string {
  const players = Player.all();
  const folded = query.toLowerCase();

  const exact = players.find((p) => p.nickname.toLowerCase() === folded);
  if (exact) return exact;

  const prefixed = players.filter((p) => p.nickname.toLowerCase().startsWith(folded));
  if (prefixed.length === 1) return prefixed[0] as Player;
  if (prefixed.length > 1) return `'${query}' matches more than one player.`;

  const slot = Number(query);
  const bySlot = Number.isInteger(slot) ? players.find((p) => p.playerIndex === slot) : undefined;
  return bySlot ?? `No player called '${query}'.`;
}
```

A `switch` like the one above is fine for a handful of commands. Past that,
the default gamemode keeps one object per command in a registry, with usage
lines and `/help`. [Build a /command system](../../../tutorials/command-system/)
walks through it.

## Related

- [Chat box on the client](../../../client-scripting/user-interface/chat/), for reading lines and
  hiding the built-in chat window
- [Build a /command system](../../../tutorials/command-system/)
- [Give and take items](../inventory/), for `/give` and `/take`
