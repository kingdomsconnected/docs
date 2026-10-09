---
title: Make a custom letter players can read
description: Build a two-file resource that gives a personalized inventory letter and opens its server-selected pages with the Book API.
sidebar:
  label: Readable custom letter
  order: 94
---

Give a player a named letter. Selecting **Read** opens its message in the
game's own reading screen, and the letter remains in their inventory.

## Before you start

Complete [Your first resource](../../getting-started/first-resource/) first. This
tutorial uses JavaScript, so there is no compilation step.

## What you will learn

- Register a letter with a **Read** action and a separate inventory row for each copy.
- Store a private message ID on a server inventory row.
- Send the selected pages to one player and handle cases where they cannot read.

## File tree

```text
resources/village-mail/
  package.json
  server/main.js
  client/main.js
```

## 1. Describe the resource

```json title="package.json"
{
  "name": "village-mail",
  "version": "1.0.0",
  "type": "module",
  "mafiahub": {
    "serverScripts": ["server/main.js"],
    "clientScripts": ["client/main.js"]
  }
}
```

## 2. Register the letter and keep the message on the server

The registration runs when the resource loads. `/maildemo` grants one copy per player.
A player can request another after reconnecting or after the resource restarts. The
use handler receives a row the server has already checked for ownership, revision and
usability.

```js title="server/main.js"
const LETTER = Items.register("village-mail:letter", {
  name: "Letter",
  description: "A sealed village letter.",
  visual: "a54ab5ef-d4a2-4929-9045-1a1efde935c5",
  weight: 0.1,
  price: 1,
  stackable: false,
  usable: true,
  useLabel: "Read",
});
const OPEN = "village-mail:open";
const issued = new Set();
const messages = new Map([
  ["anna-001", {
    sender: "Anna",
    pages: [
      "<heading>A favor for the mill</heading><paragraph>Henry, meet me by the mill before sunset. Bring the timber receipt.</paragraph>",
      "<paragraph>Thank you for your help.</paragraph><paragraph><i>Anna</i></paragraph>",
    ],
  }],
]);

Events.on("playerCommand", (player, command) => {
  if (command !== "maildemo" || !player.ready) return;
  if (issued.has(player.id)) {
    Chat.sendToPlayer(player, "You have already received this session's demo letter.");
    return;
  }
  const message = messages.get("anna-001");
  if (!message) return;
  const result = Inventory.add(player, {
    item: LETTER,
    amount: 1,
    metadata: {
      custom: {
        name: `Letter from ${message.sender}`,
        description: `Addressed to ${player.nickname}`,
        data: { messageId: "anna-001" },
      },
    },
  });
  if (result.ok) issued.add(player.id);
  Chat.sendToPlayer(player, result.ok ? "Open your inventory and read Anna's letter." : `Letter refused: ${result.code}`);
});

Events.on("playerCustomItemUse", (player, row) => {
  if (row.item !== LETTER) return;
  const custom = row.metadata.custom;
  if (!custom || typeof custom !== "object" || !("data" in custom)) return;
  const data = custom.data;
  if (!data || typeof data !== "object" || !("messageId" in data) || typeof data.messageId !== "string") return;
  const message = messages.get(data.messageId);
  if (!message) return;
  player.emit(OPEN, JSON.stringify({ pages: message.pages }));
});

Events.on("playerDisconnect", (player) => issued.delete(player.id));
```

The server selects the content from its own message store. Private metadata
is not automatically sent to the client. This example lets whoever currently
owns the letter read it, including after a transfer. For recipient-only mail,
save an authenticated account ID and check it in the use handler too.

## 3. Open the pages on the client

Network event payloads may already be decoded. This handler accepts an object or a
JSON string, checks the page data, and shows a notification if the book cannot open.

```js title="client/main.js"
let ownedBook = null;

Events.on("village-mail:open", (payload) => {
  let message = payload;
  if (typeof message === "string") {
    try { message = JSON.parse(message); } catch { return; }
  }
  if (!message || typeof message !== "object" || !("pages" in message) || !Array.isArray(message.pages)) return;
  const pages = message.pages;
  if (pages.length === 0 || pages.length > 8 ||
      !pages.every(page => typeof page === "string" && page.length <= 8192)) return;
  const id = Book.open({ style: "letter", visual: 3, pages });
  if (id === null) {
    Hud.showNotification(`Cannot read now: ${Book.getLastError()}`);
    return;
  }
  ownedBook = id;
});

Events.on("bookClosed", (id) => {
  if (ownedBook === id) ownedBook = null;
});

Events.on("resourceStop", (name) => {
  if (name === "village-mail" && ownedBook !== null && Book.getOpenBook() === ownedBook) {
    Book.close();
  }
});
```

This example accepts up to eight pages, with at most 8192 characters per page. These
are limits chosen for the tutorial, not Book API limits. There is no client
`Inventory.onUse` handler: the built-in custom use request already reaches the server.
Installing one would replace that request.

## 4. Try it

1. Put the folder under the server's `resources/` directory. Start it with
   `ensure village-mail` in the server console.
2. Join the server and type `/maildemo` in chat.
3. Open inventory. Find **Letter from Anna** and choose **Read**.
4. Turn to the second page, then leave reading with the game's normal control.
5. Confirm the letter remains, and try reading it again by double-clicking.

If registration throws, check the visual GUID and whether another resource registered
a different definition under the same ID. If the item appears but nothing happens,
check both resource logs and remove competing use handlers. Reading can be refused
during combat, while mounted, or while another book is open. Finish combat, dismount
or close the other book, then try again. The letter stays in your inventory.

## Next steps

The `messages` map and `issued` set exist only in memory and reset when the resource
restarts. For persistent mail, save the definitions, message store and complete
inventory rows under authenticated player accounts. Register definitions before
restoring items. Add more messages or a
[book image](../../user-interface/books/#add-a-picture). If reading should grant a
reward, validate that separately on the server; displaying pages or receiving a client
close event does not prove they were read.
