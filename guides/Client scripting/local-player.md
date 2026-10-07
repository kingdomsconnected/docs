---
title: Read the local player
description: Read the health, stats, conditions and buffs of the player at this machine and of the other players this client can see.
sidebar:
  label: Local player
  order: 70
---

A client resource can read the player sitting at this machine, and anyone else
this client can currently see: health, stamina, conditions, skills, what is in
their hands and which effects are on them. It cannot change them.

```ts
const me = LocalPlayer;
if (me) {
  console.log(`${me.nickname}: ${me.health} of ${me.maxHealth} health`);
}
```

## Read `LocalPlayer` fresh

[`LocalPlayer`](../../reference/client/variables/LocalPlayer.md) reads `null`
while this client has no body: before the session spawns one, and after it
ends. Read it where you need it rather than caching it at start-up.

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

`ready` is `false` for the first moments of a connection, until the body has a
pose and a soul. Values such as `health` read 0 until then, so check it before
you draw a bar. The default gamemode's F4 panel (`src/client/snapshot.ts`)
reads `LocalPlayer` this way on every tick.

## Fields you can read

The server and every client read the same published snapshot, so the readonly
fields match on both sides. The [Player](../../reference/client/classes/Player.md)
reference lists every one.

| Group | Fields |
| --- | --- |
| Identity | `id`, `nickname`, `playerIndex`, `appearance`, `virtualWorld` |
| Life | `ready`, `alive`, `canAct`, `health`, `maxHealth`, `healthPercent` |
| Stamina and needs | `stamina`, `maxStamina`, `healthyStamina`, `exhaust`, `maxExhaust`, `hunger`, `maxHunger` |
| Conditions | `bleeding`, `sleeping`, `consciousness`, `drunkenness`, `poisoning` |
| Attributes and skills | `strength`, `agility`, `vitality`, `relativeStats`, `skills`, `relativeSkills` |
| Progression | `level`, `levels`, `perks`, and `getTrack(track)` for XP and perk points |
| Movement | `position`, `rotation`, `velocity`, `lookDirection`, `inAir`, `crouched`, `moveSpeedTag`, `moveDirTag`, `stanceTag`, `physicsProfile` |
| Combat | `fistsUp`, `guard`, `combatZone`, `rightHandItem`, `leftHandItem`, `equipment` |

- Most values are in the game's own units, which is why each comes with its
  maximum. `healthPercent` is the exception: it is what the nametag bar draws.
- `skills` is one object with the nine skills (`me.skills.sword`,
  `me.skills.defense`).
- Progression is read-only here; the server grants it. [Skills, XP and
  perks](../../players/progression/#on-the-client) has the client events.

## Client-only fields

| Property | Meaning |
| --- | --- |
| `local` | `true` for the player at this machine |
| `entityId` | the engine entity of the body, or 0; on `LocalPlayer`, the game's own player entity |
| `horseId` | network id of the horse being ridden, or 0 on foot |
| `mounted` | whether they are in a saddle |
| `buffs` | the status effects on the body (local player only) |

`entityId` is what [Audio](../sound-and-voice/) and client `Vfx.attach` take.
For the player at this machine it is the game's own player entity, the body
you walk around in, so a sound played on it follows you:

```ts
const me = LocalPlayer;
if (me && me.entityId !== 0) {
  Audio.playFile("sounds/kcdc/my-assets/heartbeat", me.entityId, "inner");
}
```

It is not stable: it reads 0 across a level load and before the body exists,
and the engine reuses ids. Read it when you need it, and use `id`, the network
id, for anything you want to remember.

## List the local player's buffs

`buffs` lists potions, poison, drunkenness, injuries and anything the server
added, as [BuffState](../../reference/client/interfaces/BuffState.md) entries.
It reads empty on every handle except your own.

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

## Read another player

`new Player(id)` gives a handle to a player this client already knows about.
There is no client-side list of players, so the id usually comes from the
server:

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

The constructor does not check the id. A handle for someone this client cannot
see reads empty values (`nickname` is an empty string once their body is gone),
so check `ready` first. `other.state.get("my-mode:team")` reads the player's
[state bag](../../core-concepts/state/).

## Change a player: ask the server

:::note[No client-side verbs]
Everything that changes a player lives on the server's `Player`, where the
server can refuse it. A client asks with an event and the server decides; see
[Server vs client authority](../../core-concepts/authority/).
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

## Read stats by enum

```ts
const me = LocalPlayer;
if (me?.ready) {
  console.log(me.getStat(PlayerStat.Stamina));
  console.log(me.getDerivedStat(DerivedPlayerStat.Dirtiness));
}
```

Both getters read the latest snapshot and return zero without one. Client
scripts cannot set these values. See [Set and restore player stats](../../players/restoring-stats/)
for server setters and the difference between writable and derived stats.

To move the local player alongside someone, see [Following players and NPCs](../following/).

## Related

- [Read health, stats and skills](../../players/stats/), the server side
- [Buffs and status effects](../../players/buffs/), to add or remove them
- [Send data between server and client](../../core-concepts/networking/), for requests like the one above
- [Key binds and controls](../input/)
