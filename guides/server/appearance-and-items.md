---
title: Appearance and items
sidebar:
  order: 33
---

Three things describe a body: what it looks like, what it has on, and what it is
carrying. All three follow the same rule as the rest of the player API — the
owning client is authoritative, so everything here is either a snapshot it
published or a request sent to it.

## Appearance

Everyone on a fresh server is Henry, because the game hands out the same body to
anyone who has not chosen otherwise. An appearance is four of the game's own
character-component names plus the gender whose catalog they came from:

```js
player.appearance;
// { gender: "male", head: "henry", hair: "m_hair_henry", beard: "", body: "" }
```

Every part can be empty, and empty means *leave that one alone* — the body keeps
whatever it would have had. A body nobody has chosen for reads as all-empty.

### Choosing one

`setAppearance` takes a partial, so one part can change without restating the
rest:

```js
player.setAppearance({ hair: "m_hair_barber_07" });
player.setAppearance({ head: "m_head_012", beard: "m_beard_04" });
```

Passing an empty string hands that part back to the game:

```js
player.setAppearance({ beard: "" }); // clean-shaven again
```

> **Authority:** like `teleport` and `giveItem`, this is a request to that
> player's own client. `true` means it went out. Read `player.appearance` back
> to see what they actually put on — it changes with their next update, not on
> this line.

### The catalog

`Appearances` is the game's own component tree, mined at build time. The male
half has 212 faces, 262 hairstyles, 51 beards and 47 skins; the female half has
61, 71, none and 41.

```js
Appearances.options("hair");                  // male by default
Appearances.options("head", "female");
Appearances.find("hair", "m_hair_henry");     // the option, or null
Appearances.random("male");                   // a complete Appearance
```

The hairstyle count is large because the game ships each style once per colour
rather than colouring one. Group by `option.group` to get the styles back:

```js
const styles = new Map();
for (const option of Appearances.options("hair")) {
  const style = option.group || option.name;
  styles.set(style, [...(styles.get(style) ?? []), option.name]);
}
```

`Appearances.random` is the cheapest way to stop a server full of Henrys:

```js
Events.on("playerConnect", (player) => {
  player.setAppearance(Appearances.random());
});
```

It is uniform over the catalog rather than over what looks good together — the
game's faces and hairstyles are authored for particular NPCs, so a random body
is recognisably random.

### Gender has a price

Gender is not one of the four parts. It lives on the body's *archetype*, and it
decides which half of the catalog the names come from — a head from the female
tree means nothing on a male body. So it travels with the parts and is applied
first:

```js
// Names from the two halves never overlap, so clear the parts when you
// change gender.
player.setAppearance({ gender: "female", head: "", hair: "", beard: "", body: "" });
```

Moving the archetype carries four authored numbers with it: base armour, the
conspicuousness and visibility pair, and unarmed attack. Nothing reads those on
the puppets other players see, but on the body its owner plays they are a real
change. A male-to-male change never touches the archetype, so this only costs
you when you ask for it.

The female tree has no beards at all. `Appearances.random("female")` returns an
empty `beard` for that reason rather than failing.

## Outfits

What a player is wearing is readable and not writable:

```js
player.equipment;      // ["3b912b8e...", "5d5b2f4d...", ...] — worn item classes
player.rightHandItem;  // the drawn weapon or torch, or ""
player.leftHandItem;
```

These are what the player actually has on, not a preset, so a bare body reads as
an empty array and taking something off is a change like any other.

There is no `equip` verb. Clothing in Kingdom Come is inventory — a body wears
what its own equipment manager has equipped — and that decision lives on the
owning client. To dress somebody, grant the garment and let them put it on:

```js
player.giveItem("CoifCap01_m01_C"); // a coif, by its exact table name
```

> **Note:** appearance and clothing are separate on purpose. The four appearance
> parts are the body underneath; `equipment` is what is over it. Changing a
> hairstyle does not disturb a hat, and undressing does not change the face.

## Items

The server holds no inventory of its own — it has no item tables to hold one
with — so granting is an instruction rather than a transfer:

```js
player.giveItem("longswordBroad");                          // exact table name
player.giveItem("3858560f-cf48-436f-8815-4426003288fb");    // or its GUID
player.giveItem("apple", 5);                                // stacks
```

At most 10000 at a time. `false` means the class was not in the game's tables or
the amount was one the wire refuses.

There is deliberately no way to read a player's inventory and no way to take
something out of it. Both would need state the server does not have, and a
request the client has no handler for.

### Item classes

`equipment`, `rightHandItem`, `leftHandItem` and `GroundItem.itemClass` are all
the same thing — a class GUID as 32 hex digits — so they compare directly:

```js
const holding = player.rightHandItem;
const dropped = GroundItem.all().filter((item) => item.itemClass === holding);
```

A class is not an item. It says *what* something is, never which one, so no
engine-local identifier ever crosses the wire. The server holds no name for a
class either: naming one is an item database's job.

### On the ground

A stack lying in the world is a server-owned entity, unlike the contents of an
inventory:

```js
const stack = GroundItem.spawn("apple", player.position, undefined, 5);

stack.itemClass;  // 32 hex digits
stack.amount;
stack.quality;    // as the game grades it
stack.health;     // 0..1
stack.condition;  // 0..1
stack.droppedBy;  // the Player who dropped it, or null
stack.resting;    // whether it has settled

stack.destroy();
```

`spawn` throws for a class the game's tables do not have, rather than returning
a handle to nothing. Position, rotation, amount, virtual world and the condition
properties are all optional; each defaults to the class's own.

Three events cover the lifecycle:

```js
Events.on("groundItemSpawn", (item) => { /* laid down, however it got there */ });

Events.on("groundItemPickup", (item, player) => {
  // Reports a pickup; it does not decide one. By the time this runs the
  // server has already told that client the stack is theirs.
  console.log(`${player?.nickname} took ${item.amount} of ${item.itemClass}`);
});

Events.on("groundItemDestroy", (item) => {
  // Still resolves, so the class and pose can be read one last time.
});
```

`groundItemPickup` is followed by `groundItemDestroy` for the same stack.

## From the client

A client resource reads the same appearance off any body it can see, including
its own:

```js
const me = LocalPlayer;
if (me) console.log(me.appearance.hair);
```

Client-side it is readonly. The verb that changes a body lives on the server,
where the connection to ask is in scope.
