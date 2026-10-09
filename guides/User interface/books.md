---
title: Show books and letters in the player's hands
description: Compose pages, open the native reading screen, and handle its opening and closing events.
sidebar:
  label: Books and letters
  order: 86
---

The client `Book` API shows your pages using the game's book model, camera,
page turns and reading controls. It can display a book or a folded letter.

```ts
const id = Book.open({
  style: "letter",
  visual: 3,
  pages: ["<heading>A message from Anna</heading><paragraph>Meet me by the mill.</paragraph>"],
});
if (id === null) Hud.showNotification(Book.getLastError());
```

Opening a book is local to this client. It does not create an inventory item,
award reading XP, mark a vanilla book as read, or complete a quest. For an
inventory letter, combine it with [custom items](../../players/custom-items/)
as shown in the [letter tutorial](../../tutorials/custom-letter/).

## Compose pages

Pass one markup string per page. A page break follows each string except the
last; `<newpage/>` adds another break inside one string. This is the native
book markup, not a browser page or Markdown.

```ts
Book.open({
  style: "plainBook",
  pages: [
    "<title>The mill ledger</title><paragraph>Orders for this week.</paragraph>",
    "<heading>Timber</heading><paragraph>Ten bundles for the bridge.</paragraph>",
  ],
});
```

Useful tags include `<title>`, `<subtitle>`, `<heading>`, `<paragraph>`,
`<br/>`, `<accent>`, `<i>`, `<poem>` and `<inc>A</inc>` for an ornate initial.
Treat player-written text as text: escape `&`, `<` and `>` before putting it
inside markup. Keep authored markup under your resource's control.

| Option | Meaning |
| --- | --- |
| `pages` | Required array of page strings. |
| `style` | `book` (red cover, default), `plainBook`, or `letter`. |
| `visual` | Page decoration from 1 (plain) to 7 (ornate); defaults to 1. |
| `type` | Layout ID: 1 book, 2 recipe, 3 skill book, 4 map, 5 letter, 6 plan. Defaults to 5 for letter style and 1 otherwise. |
| `legibility` | 0 to 1, clamped; defaults to fully readable. |
| `texture` | A resource image used for this copy's cover and paper material. |
| `images` | Native skill-book/map images, each with a zero-based `page` and native image name. |

## Wait for it to open

`Book.open` returns an ID when the request is accepted. Wait for `bookOpened` to know
the book is actually in the player's hands. `Book.open` returns null when the player
has no body, already has a book open, or cannot read now, such as in combat or on
horseback. `Book.getLastError()` describes the refusal. Malformed options throw.

```ts
Events.on("bookOpened", (id) => {
  console.log(`Book ${id} is in the player's hands.`);
});
Events.on("bookClosed", (id, reason) => {
  console.log(`Book ${id} closed: ${reason}`);
});
```

Close reasons are `player`, `script`, `failed` and `sessionOver`.
`Book.close()` requests the normal exit and returns false if none is open.
`Book.getOpenBook()` returns the current ID or null. A close handler may open
another book; handler promises are not awaited.

## Change legibility

Set `legibility` when opening, or call `Book.setLegibility(value)` after `bookOpened`.
The player's reading skill does not override it. The effect works in tenths, so 0.31
and 0.39 look the same. It substitutes characters without changing markup, and the
same text and setting produce the same result. Changing legibility makes the game lay
out the pages again and may return the reader to page one.

## Add a picture

Ship a `.dds` file in your client resource and resolve it with `Book.image`:

```ts
const seal = Book.image("assets/seal.dds");
const picture = "<" + `img src='${seal}' width='128' height='128' align='center'/>`;
Book.open({
  pages: [`<heading>Village charter</heading>${picture}`],
});
```

Give inline pictures explicit width and height. `Book.image` throws for a
missing file, another extension, or a file larger than 16 MiB. Include the
asset in the resource package; see [Custom assets](../../core-concepts/custom-assets/).

The `texture` option replaces both the cover and paper textures. Create the image
using the selected book model's existing UV layout and matching vanilla texture atlas.
Use `plainBook` when the material should show the painted colors without the red
book's tint. This affects only the book being shown.

## Related

- [A readable custom letter](../../tutorials/custom-letter/)
- [Book reference](../../reference/client/variables/Book.md)
