---
title: Chat and /commands
description: Send chat lines, own how chat is relayed and answer slash commands on the server, and read, send, intercept or replace chat on the client.
sidebar:
  label: Chat and /commands
  order: 39
---

The server sends lines with [`Chat`](../../reference/server/variables/Chat.md)
and hears them through `playerChat` and `playerCommand`. The server has no
commands of its own: every one comes from a resource like yours.

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

## On the server

### Send a line

| Call | Goes to |
| --- | --- |
| `Chat.sendToAll(text, options?)` | Every connected player. |
| `Chat.sendToPlayer(player, text, options?)` | One player. |

Options: `author`, the name before the line (leave it out for a system notice,
styled differently), and `color`, a [`Color`](../../reference/server/classes/Color.md)
or a packed number.

```ts
Chat.sendToAll("Round starts in 10 seconds.", { color: 0xFFD24DFF });
Chat.sendToAll("The gates are closing.", { color: Color.fromRGB(200, 60, 60) });
Chat.sendToPlayer(player, "You are on the red team.", { author: "Referee" });
```

:::caution
A packed chat colour is `0xRRGGBBAA`, alpha **last**, always eight digits:
`0xFF8800` reads as `0x00FF8800` (green-blue, not orange). `0` is the client's
default. Nametag colours are the opposite, `0xAARRGGBB`. When in doubt, pass a
`Color`.
:::

### Receive a line

`playerChat` fires with the sender and text of every line not starting with `/`.
The author is always the sender's real nickname; only the server can set an
author or colour.

```ts
Events.on("playerChat", (player, text) => {
  console.log(`[chat] ${player.nickname}: ${text}`);
});
```

### Own the relay

By default the server relays every plain line to everyone, sender included,
**before** `playerChat` runs, so your handler can react but not stop it. To
filter or reformat chat, call [`Chat.setDefaultRelay(false)`](../../reference/server/variables/Chat.md#setdefaultrelay)
and deliver lines yourself (`Chat.isDefaultRelay()` reads the setting). Proximity
chat, 30 metres:

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

- With the relay off, the sender sees their own line only if you send it
  (here, their distance to themselves is 0).
- The setting is server-wide. Let one resource own chat; others react to
  `playerChat` without sending.

### Answer commands

A line starting with `/` is never relayed. It raises `playerCommand` with the
command word and the rest split on whitespace:

| Typed | `command` | `args` |
| --- | --- | --- |
| `/heal` | `"heal"` | `[]` |
| `/give apple 5` | `"give"` | `["apple", "5"]` |
| `/tp Jan Zizka` | `"tp"` | `["Jan", "Zizka"]` |
| `/Give  apple` | `"Give"` | `["apple"]` |

The command keeps the player's case, so lower-case it. Answer unknown commands,
or the line simply vanishes:

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
Every resource listening to `playerCommand` sees every command. If two answer
unknown ones, the player gets two replies: let one resource own that.
:::

Past a handful of commands, use a registry with usage lines and `/help`:
[Build a /command system](../../tutorials/command-system/).

### Arguments with spaces

Quotes are not parsed: `/give "Hunting Sword" 2` gives
`['"Hunting', 'Sword"', '2']`, and runs of spaces are lost. The default
gamemode's `readQuoted` in `src/server/args.ts` rebuilds a quoted run; the
[/command system tutorial](../../tutorials/command-system/) walks through it.

### Name a player in a command

The default gamemode's `src/server/players.ts` tries an exact name, then a
unique prefix, then a connection slot:

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

## On the client

Client code can read incoming lines, send lines, catch what the player types,
and hide or replace the chat box. Who may say what stays the server's call.

### Read incoming lines

Every line sent to this player arrives as `chatMessage` with
`{ author, text, color }`. `author` is empty for a system line; `color` is a
packed `0xRRGGBBAA`, 0 for the default.

```ts
// client
Events.on("chatMessage", (message) => {
  if (typeof message !== "object" || message === null) return;
  const { author, text } = message as { author?: unknown; text?: unknown };
  if (typeof text !== "string") return;

  console.log(typeof author === "string" && author.length > 0 ? `${author}: ${text}` : text);
});
```

:::note
`chatMessage` and `chatSend` are reserved events missing from `EventMap`, so
their arguments are `unknown`. Narrow them as above.
:::

### Send a line

`Chat.send(text)` sends a line exactly as if the player typed it, so a `/` line
runs a server command with the same checks. This is how a UI button runs one;
the answer comes back as a `chatMessage`.

```ts
// client
Chat.send("/help");
```

### Catch typed lines

Before a typed line leaves, every `chatSend` handler sees it. Return the literal
`false` to keep it on this machine, for example for a client-only command:

```ts
// client
Events.on("chatSend", (text) => {
  if (typeof text !== "string") return;

  if (text === "/hidehud") {
    Nametags.setVisible(false);
    Compass.visible = false;
    return false;
  }
});
```

- It fires for every line submitted in the overlay, commands included.
- Handlers run synchronously; an `async` handler cannot block.
- Only a literal `false` blocks, so a missing `return` never swallows chat.
- Every handler runs, even after one returned `false`. One that throws is
  logged and skipped.
- `Chat.send` does **not** fire `chatSend`. To rewrite a line, block it and
  send your own version.

:::caution
Client blocking is a convenience, not a filter: a modified client skips it.
Anything that must not reach others is checked on the server.
:::

### Show, hide or open the chat box

The overlay opens with **T** and closes with Escape.

| Call | Does |
| --- | --- |
| `Chat.setUIVisible(visible)` | Shows or hides the whole overlay. Hidden, **T** no longer opens it, but events and `Chat.send` keep working. |
| `Chat.isUIVisible()` | Whether it is drawn. |
| `Chat.open()` | Opens and focuses the input line. |
| `Chat.close()` | Closes the input line without sending. |
| `Chat.isOpen()` | Whether the input line takes keys. |

While the input line is open the player cannot move and `Key.bind` handlers do
not fire. Focusing a web view closes it.

### Replace the chat box

Hide the overlay, draw lines in a [web view](../../user-interface/web-views/),
and send what the page submits:

```ts
// client
const view = Web.createView("fw://resources/my-chat/ui/chat.html", {
  x: 16, y: 16, width: 480, height: 320,
});

Chat.setUIVisible(false);

Events.on("chatMessage", (message) => {
  Web.emit(view, "chat:line", message);
});

Web.on(view, "chat:submit", (payload) => {
  if (typeof payload === "string" && payload.trim().length > 0) {
    Chat.send(payload.trim());
  }
  Web.focusView(view, false);
});

Key.bind("t", "down", () => {
  Web.focusView(view, true);
});
```

The page sends with `callEvent("chat:submit", JSON.stringify(text))` and must
blur itself on Escape or after sending, because while focused it gets **T**
instead of your bind. See [Send data to and from a page](../../user-interface/page-bridge/).
Lines from your page skip `chatSend`, so handle client-only commands in
`chat:submit`.

## Related

- [Build a /command system](../../tutorials/command-system/), a registry with `/help`
- [Items: give, take and drop](../items/), for `/give` and `/take`
- [Key binds and controls](../../client-scripting/input/), for opening your own chat
- [HUD messages, nametags and compass](../../user-interface/hud/), for non-chat notices
