---
title: Player appearance (face, hair, body)
description: Give players their own face, hair, beard and skin from the game's catalog, and handle gender and per-face beards.
sidebar:
  label: Appearance
  order: 37
---

On a fresh server everyone is Henry. [`player.setAppearance`](../../reference/server/classes/Player.md#setappearance)
changes that, and the [`Appearances`](../../reference/server/variables/Appearances.md)
catalog lists what you can choose from.

```ts title="src/server/index.ts"
Events.on("playerSpawned", (player) => {
  player.setAppearance(Appearances.random());
});
```

Call it from `playerSpawned`, not `playerConnect`, when their client has a body
to apply it to. `Appearances.random()` is uniform over the catalog, not over
what looks good together, so the result looks recognisably random.

## What an appearance is

An [`Appearance`](../../reference/server/interfaces/Appearance.md) is a
`gender` plus four of the game's character-component names:

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

An empty string means "leave it to the game". A body nobody has chosen for
reads as all parts empty.

## Change one part

`setAppearance` takes a partial. An empty string hands that part back:

```ts
player.setAppearance({ hair: "m_hair_barber_07" });
player.setAppearance({ beard: "" }); // clean-shaven again
```

It returns `true` when the request went out; `player.appearance` changes with
their next update. It returns `false` for a name not in the catalog, a name
from the other gender's catalog, a beard that face cannot wear, or no
connection. See [Server vs client authority](../../core-concepts/authority/).

## Browse the catalog

```ts
Appearances.options("hair");                          // male by default
Appearances.options("head", "female");
Appearances.find("hair", "m_hair_barber_07");         // AppearanceOption or null
Appearances.beards("m_head_012");                     // beards that face can grow
Appearances.random("female");                         // a complete Appearance
```

Every name is also listed in [Faces, hair and skins](../../resources/appearance/) and
[Beards](../../resources/beards/).

| Tree | Faces | Hairstyles | Beards | Skins |
| --- | --- | --- | --- | --- |
| male | 212 | 262 | 51 | 47 |
| female | 61 | 71 | 0 | 41 |

The game ships each hairstyle once per colour. Each
[`AppearanceOption`](../../reference/server/interfaces/AppearanceOption.md) has
a `group` naming its style, so grouping turns 262 entries into a readable list:

```ts
const styles = new Map<string, string[]>();
for (const option of Appearances.options("hair")) {
  const style = option.group ?? option.name;
  styles.set(style, [...(styles.get(style) ?? []), option.name]);
}
```

Check names from players with `Appearances.find` first, so you can give a
useful error instead of a refused request.

## Match beards to faces

A beard is modelled against particular heads. Generic faces carry 24 each,
Henry's face the 15 the barber offers, and 14 faces carry none. A face and
beard pair that was never modelled is refused **whole**, face included.

Build beard choices from `Appearances.beards(head)`, not `options("beard")`,
and when changing the face, check the current beard fits. The default
gamemode's `/appearance set head` shaves rather than refuses:

```ts
function setHead(player: Player, head: string): boolean {
  const { gender, beard } = player.appearance;
  const fits = beard === "" || Appearances.beards(head, gender).some((option) => option.name === beard);
  return player.setAppearance(fits ? { head } : { head, beard: "" });
}
```

`Appearances.random()` draws the beard after the face, so its result always
fits.

## Change gender

Gender lives on the body's archetype and decides which half of the catalog
applies. The halves never share names, so clear the parts with it:

```ts
player.setAppearance({ gender: "female", head: "", hair: "", beard: "", body: "" });
```

:::caution
The other archetype also changes four gameplay numbers on the owner's body:
base armour, the conspicuousness and visibility pair, and unarmed attack. Only
change gender when you mean it. A male-to-male change never touches the
archetype.
:::

## Copy another player

The default gamemode's `/lookalike` reads one player's published look and asks
another client to wear it:

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

Clothing is separate: it is inventory, listed in `player.equipment`. Changing
hair does not disturb a hat. See [Items](../items/#read-what-they-wear-and-hold).

## Related

- [Items: give, take and drop](../items/), for clothing
- [Read health, stats and skills](../stats/), for everything else on a player
- The default gamemode's `src/server/commands/appearance.ts`, a full chooser
  with listing, filtering and `@player` targeting
