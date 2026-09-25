---
title: Chat box on the client
description: Read incoming chat lines, send lines from script, catch what the player types before it leaves, and hide or replace the chat overlay.
sidebar:
  order: 83
---

The client side of chat is small: a line comes in, a line goes out, and there
is an overlay you can show, hide or open. Use it to add client-only commands, to
keep a copy of what the server says, or to replace the built-in chat box with
your own web view.

Who may say what, and how lines are relayed to everyone, is the server's
business: see [Chat messages and /commands](../../../server-scripting/players/chat/).

## Incoming lines

Every line the server sends to this player arrives as the reserved
`chatMessage` event, with one object: `{ author, text, color }`.

```ts
Events.on("chatMessage", (message) => {
    if (typeof message !== "object" || message === null) return;
    const { author, text } = message as { author?: unknown; text?: unknown };
    if (typeof text !== "string") return;

    const line = typeof author === "string" && author.length > 0 ? `${author}: ${text}` : text;
    console.log(line);
});
```

`author` is empty for a system line, and `color` is a packed `0xRRGGBBAA`
number, 0 meaning the default colour. The server sets both; a client cannot.

:::note
`chatMessage` and `chatSend` are reserved events that the declarations do not
list in `EventMap`, so their arguments are typed `unknown`. Narrow them as
above. The default gamemode's `src/client/index.ts` does the same with a small
`readField` helper.
:::

## Sending a line

`Chat.send(text)` sends a line to the server exactly as if the player had typed
it. A line that starts with `/` is a command on the server, so this is how a
button in your UI runs one:

```ts
Chat.send("/help");
```

The default gamemode's panel runs every world-changing button this way, so the
server applies the same checks it applies to a typed command. The answer comes
back as a `chatMessage`.

## Catching what the player types

Before a typed line leaves, it is offered to every `chatSend` handler. Return
the literal `false` to keep it on this machine. That is how you add a command
that only the client handles:

```ts
Events.on("chatSend", (text) => {
    if (typeof text !== "string") return;

    if (text === "/hidehud") {
        Nametags.setVisible(false);
        Compass.visible = false;
        return false;
    }
});
```

The rules are strict, because the client needs an answer before it sends:

- It fires for every line the player submits in the overlay, commands
  included.
- Handlers run synchronously. An `async` handler cannot block a line, since its
  promise is not awaited.
- Only a literal `false` blocks. A handler that returns nothing lets the line
  through, so forgetting a `return` never swallows chat.
- Every handler runs, even after one has returned `false`. A handler that
  throws is logged and skipped.
- `Chat.send` does **not** fire `chatSend`. To rewrite a line, block it and send
  your own version; your handler will not see its own output.

```ts
Events.on("chatSend", (text) => {
    if (typeof text !== "string" || !text.startsWith("/me ")) return;
    Chat.send(`* ${text.slice(4)}`);
    return false;
});
```

:::caution
Blocking on the client is a convenience, not a filter. A modified client can
skip it entirely. Anything that must not reach other players is checked on the
server.
:::

## The overlay

The chat box in the top-left corner opens with **T** and closes with Escape.
Your script can drive it:

| Call | Does |
| --- | --- |
| `Chat.setUIVisible(visible)` | Shows or hides the whole overlay |
| `Chat.isUIVisible()` | Whether it is drawn |
| `Chat.open()` | Opens and focuses the input line |
| `Chat.close()` | Closes the input line without sending it |
| `Chat.isOpen()` | Whether the input line is taking keys |

While the input line is open, the player cannot move and `Key.bind` handlers do
not fire. Focusing a web view closes it.

Hiding the overlay with `setUIVisible(false)` stops it drawing, and **T** no
longer opens it, but `chatMessage`, `chatSend` and `Chat.send` keep working.
That is the hook for a chat of your own.

## Replacing the chat box

Hide the overlay, draw lines in a web view, and send what the page submits with
`Chat.send`:

```ts
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

The page sends its text with `callEvent("chat:submit", JSON.stringify(text))`,
and must blur itself on Escape or after sending, because while it is focused
**T** goes to the page rather than to your bind. The details of both directions
are in [Send data to and from a page](../page-bridge/).

Lines typed into your own page do not go through `chatSend`, since they reach
the server through `Chat.send`. Apply your client-side commands in the
`chat:submit` handler instead.

## Related

- [Chat messages and /commands](../../../server-scripting/players/chat/): relaying, colours and
  `playerCommand` on the server.
- [Key binds and controls](../../input/)
