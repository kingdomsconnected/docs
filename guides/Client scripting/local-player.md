---
title: Read the local player
description: Read the player at this machine and the other players this client can see, and why a client asks the server instead of changing them.
sidebar:
  order: 70
---

A client resource can read the body of the player sitting at this machine, and
of anyone else this client can currently see. It cannot change either one. What
a client can do is look closely: health, stamina, conditions, skills, what is in
their hands, which effects are on them, and a few things only a client knows.

```ts
const me = LocalPlayer;
if (me) {
  console.log(`${me.nickname}: ${me.health} of ${me.maxHealth} health`);
}
```

## `LocalPlayer` is read fresh, not held

[`LocalPlayer`](../../reference/client/variables/LocalPlayer.md) is a global
that reads `null` while this client has no body: before the session spawns one,
and again after it ends. A resource that starts early sees `null` on its first
read and a handle a moment later, so read it where you need it rather than
caching one at start-up.

The default gamemode's F4 panel does exactly that. Its `src/client/snapshot.ts`
reads `LocalPlayer` on every tick and returns `null` when there is nothing to
read:

```ts
function checkOnMe(): void {
  const me = LocalPlayer;
  if (!me || !me.ready) {
    return;
  }

  if (me.bleeding > 0) {
    Hud.showInfoText("You are bleeding. Bandage up.");
  }
}

setInterval(checkOnMe, 1000);
```

`ready` is false for the first moments of a connection, until the body has both
a pose and a soul. Values such as `health` read 0 until then, so check it before
you draw a bar from them.

## What a client can read

The readonly view of a body is the same on both sides, because the server and
every client read the same published snapshot. The
[Player](../../reference/client/classes/Player.md) reference lists every field;
these are the groups:

| Group | Fields |
| --- | --- |
| Identity | `id`, `nickname`, `playerIndex`, `appearance`, `virtualWorld` |
| Life | `ready`, `alive`, `canAct`, `health`, `maxHealth`, `healthPercent` |
| Stamina and needs | `stamina`, `maxStamina`, `healthyStamina`, `exhaust`, `maxExhaust`, `hunger`, `maxHunger` |
| Conditions | `bleeding`, `sleeping`, `consciousness`, `drunkenness`, `poisoning` |
| Attributes and skills | `strength`, `agility`, `vitality`, `relativeStats`, `skills`, `relativeSkills` |
| Movement | `position`, `rotation`, `velocity`, `lookDirection`, `inAir`, `crouched`, `moveSpeedTag`, `moveDirTag`, `stanceTag`, `physicsProfile` |
| Combat | `fistsUp`, `guard`, `combatZone`, `rightHandItem`, `leftHandItem`, `equipment` |

Most of these are in the game's own units rather than percentages, which is why
each value comes with its maximum. `healthPercent` is the one exception: it is
what the nametag bar draws.

`skills` is read as a whole object (`me.skills.sword`, `me.skills.defense`),
because the snapshot carries the nine skills together.

## What only a client knows

A few properties exist on the client's `Player` and not on the server's:

| Property | Meaning |
| --- | --- |
| `local` | `true` for the player at this machine |
| `entityId` | the engine entity the body was spawned as, or 0 |
| `horseId` | network id of the horse being ridden, or 0 on foot |
| `mounted` | whether they are in a saddle |
| `buffs` | the status effects on the body (local player only) |

`entityId` is what [Audio](../audio-and-voice/) and client `Vfx.attach` take,
but it is not stable. It reads 0 across a level load and before the body exists,
and the engine reuses ids. Use `id`, the network id, for anything you want to
remember.

`buffs` lists potions, poison, drunkenness, injuries and anything the server
added, as [BuffState](../../reference/client/interfaces/BuffState.md) entries.
It reads empty for every handle except your own: other clients do not publish
their effects, only the consequences.

```ts
function describeBuffs(): string[] {
  const me = LocalPlayer;
  if (!me) {
    return [];
  }

  return me.buffs.map((buff) => {
    const left = buff.duration < 0 ? "no end" : `${Math.round(buff.duration - buff.since)} s left`;
    return `${buff.name} (${buff.class}, ${left}, from ${buff.source})`;
  });
}
```

`duration - since` is only roughly what is left, because each client advances
buff time on its own frame clock.

## Other players

The `Player` constructor takes a network id and gives you a handle to a player
this client already knows about. There is no client-side list of every player,
so the id usually comes from the server:

```ts
// server
Events.on("playerSpawned", (spawned) => {
  for (const other of Player.all()) {
    if (other.id !== spawned.id) {
      other.emit("my-mode:newcomer", JSON.stringify({ id: spawned.id }));
    }
  }
});
```

```ts
Events.on("my-mode:newcomer", (payload) => {
  const id = typeof payload === "object" && payload !== null ? (payload as { id?: unknown }).id : undefined;
  if (typeof id !== "number") {
    return;
  }

  const other = new Player(id);
  const me = LocalPlayer;
  if (!me || !other.ready) {
    return;
  }

  const metres = Math.round(me.position.distance(other.position));
  Hud.showInfoText(`${other.nickname} arrived, ${metres} m away.`);
});
```

Constructing a handle does not connect or spawn anyone, and it does not check
the id either. A handle for someone this client cannot see reads empty values:
`nickname` is an empty string once their body is gone. Check `ready` before you
trust what it says.

Every player also carries its [state bag](../../core-concepts/state/), so
`other.state.get("my-mode:team")` reads what the server wrote there.

## Why there are no client-side verbs

A player's own game is authoritative for their body, so a client-side setter for
health or position would work. That is the problem: it would put the decision of
what a player may do to themselves inside code that player is running.

:::note[Authority]
Everything that changes a player lives on the server's `Player`, where the
server can refuse it. A client that wants something asks for it, and the server
decides. See [Server vs client authority](../../core-concepts/authority/).
:::

```ts
Key.bind("h", () => {
  Events.emitServer("my-mode:horse.request");
});
```

```ts
// server
Events.onClient("my-mode:horse.request", (sender) => {
  const player = sender as Player;
  if (!player.ready || !player.alive) {
    return;
  }
  Horse.spawn(player.position, undefined, undefined, `${player.nickname}'s horse`);
});
```

## Related

- [Key binds and controls](../input/)
- [Send data between server and client](../../core-concepts/networking/)
- [Reading a player on the server](../../server-scripting/players/reading/)
