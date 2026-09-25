---
title: Player appearance (face, hair, body)
description: Give players their own face, hair, beard and skin from the game's catalog, and handle gender and per-face beards.
sidebar:
  order: 34
---

Everyone on a fresh server is Henry, because a body nobody has chosen for is
the one the game hands out. [`player.setAppearance`](../../../reference/server/classes/Player.md#setappearance)
changes that, and the [`Appearances`](../../../reference/server/variables/Appearances.md)
catalog lists what you can choose from.

```ts title="src/server/index.ts"
Events.on("playerSpawned", (player) => {
  player.setAppearance(Appearances.random());
});
```

`Appearances.random()` is the cheapest way to stop a server full of Henrys. It
is uniform over the catalog rather than over what looks good together (the
game's faces and hair were authored for particular NPCs), so a random body
looks recognisably random.

:::tip
Call it from `playerSpawned`, not `playerConnect`. The request goes to the
player's own body, and during `playerConnect` their client is still loading
and may not have one to apply it to yet.
:::

## What an appearance is

An [`Appearance`](../../../reference/server/interfaces/Appearance.md) is four of
the game's own character-component names plus the gender whose catalog they
come from:

```ts
const look: Appearance = player.appearance;
// { gender: "male", head: "", hair: "", beard: "", body: "" }
```

| Part | What it is |
| --- | --- |
| `head` | The face. |
| `hair` | The hairstyle, colour included. |
| `beard` | The beard. Male only. |
| `body` | The skin: complexion and build. |

An empty string means "leave that one alone": the body keeps whatever it would
have had. A body nobody has chosen for reads as all parts empty.

## Changing one

`setAppearance` takes a partial, so you can change one part without restating
the rest. An empty string hands that part back to the game:

```ts
player.setAppearance({ hair: "m_hair_barber_07" });
player.setAppearance({ beard: "" }); // clean-shaven again
```

:::note[Authority]
This is a request to the player's own client, like `teleport`. `true` means it
went out; `player.appearance` changes when they have actually put it on, with
their next update. `false` means it was refused before sending: a name not in
the catalog, a name from the other gender's catalog, a beard that face cannot
wear, or no connection.
:::

## The catalog

```ts
Appearances.options("hair");                          // male by default
Appearances.options("head", "female");
Appearances.find("hair", "m_hair_barber_07");         // AppearanceOption or null
Appearances.beards("m_head_012");                     // beards that face can grow
Appearances.random("female");                         // a complete Appearance
```

The male tree has 212 faces, 262 hairstyles, 51 beards and 47 skins; the
female tree has 61 faces, 71 hairstyles, no beards and 41 skins.

The hairstyle count is high because the game ships each style once per colour.
Each [`AppearanceOption`](../../../reference/server/interfaces/AppearanceOption.md)
has a `group` naming the style it is a variation of, so grouping by it turns
262 entries into a list a person can read:

```ts
const styles = new Map<string, string[]>();
for (const option of Appearances.options("hair")) {
  const style = option.group ?? option.name;
  styles.set(style, [...(styles.get(style) ?? []), option.name]);
}
```

Validate names from players with `Appearances.find` before passing them on;
it is cheaper than a refused request and lets you give a useful error.

## Beards belong to faces

A beard is modelled against one head, so not every beard fits every face. The
generic faces carry 24 each, Henry's face carries the 15 the game's barber
offers, and 14 faces carry none. A face and beard pair that was never modelled
is refused **whole**: the client does not apply the face and drop the beard.

So build beard choices from `Appearances.beards(head)`, not from
`options("beard")`, and when you change the face, check that the current
beard survives. The default gamemode's `/appearance set head` shaves rather
than refuses:

```ts
function setHead(player: Player, head: string): boolean {
  const { gender, beard } = player.appearance;
  const fits = beard === "" || Appearances.beards(head, gender).some((option) => option.name === beard);
  return player.setAppearance(fits ? { head } : { head, beard: "" });
}
```

`Appearances.random()` already draws the beard after the face, so its result
is always one the client accepts.

## Gender has a cost

Gender is not one of the four parts. It lives on the body's archetype and
decides which half of the catalog the names come from, so it is applied first.
Names from the two halves never overlap, which means changing gender almost
always means clearing the parts too:

```ts
player.setAppearance({ gender: "female", head: "", hair: "", beard: "", body: "" });
```

Moving to the other archetype also moves four numbers the game authored on it:
base armour, the conspicuousness and visibility pair, and unarmed attack.
Nothing reads those on the copies other players see, but on the body its owner
plays they are a real gameplay change. Only ask for a gender when you mean it.
A male-to-male change never touches the archetype.

## Copying another player

The default gamemode's `/lookalike` shows the whole round trip: one client
publishes its look, the server reads it, and asks another client to wear it.

```ts
const PARTS = ["head", "hair", "beard", "body"] as const;

function copyLook(player: Player, model: Player): string {
  const wanted = model.appearance;
  if (PARTS.every((part) => wanted[part] === "")) {
    return `${model.nickname} has not chosen a body yet.`;
  }
  if (!player.setAppearance(wanted)) {
    return "Refused. Your own client decides what it can wear.";
  }
  return `Asked to look like ${model.nickname}.`;
}
```

## Clothing is separate

Appearance is the body underneath. What is worn over it is inventory:
`player.equipment` lists the item classes being worn, and there is no verb to
equip something. Changing a hairstyle does not disturb a hat, and undressing
does not change the face. See [Give and take items](../inventory/).

## Related

- [Give and take items](../inventory/)
- The default gamemode's `src/server/commands/appearance.ts`, a full chooser
  with listing, filtering and `@player` targeting
