---
title: "Skills, XP and perks: player progression"
description: Grant XP, levels and perks, set how fast players level up, block perks, and keep a player's progression between sessions.
sidebar:
  label: Progression
  order: 32
---

Every skill, stat and perk a player earns goes through the server. Their game
asks before any XP lands, the server applies your rules, and the game then
grants it the normal way, with its own level-up popup and perk points. Use
this to grant XP from your own jobs and quests, slow down grinding, block
perks, and keep a character between sessions.

```ts
const saved = new Map<string, ProgressionSnapshot>(); // swap for your own storage

Events.on("playerReady", (player) => {
  const snapshot = saved.get(player.nickname);
  if (snapshot) player.restoreProgression(snapshot);
});

Events.on("playerDisconnect", (player) => {
  if (player.progression) saved.set(player.nickname, player.progression);
});
```

:::note
Every session starts with a fresh character. Without a restore like the one
above, a player who reconnects starts again from level 1.
:::

## Name a track

A **track** is one skill or stat: `weapon_sword`, `thievery`, `alchemy`,
`strength`, `speech`. Every progression call takes a track name.
[`Progression.tracks()`](../../reference/server/variables/Progression.md#tracks)
lists all twenty, the fifteen skills first, then the five stats:

```ts
for (const track of Progression.tracks()) {
  console.log(`${track.name} (${track.kind}), cap ${track.cap}`);
}
```

`fencing` is special: the game derives it from the five weapon skills, so
`addXp` and `setLevel` refuse it. Every track caps at level 30.

## Read a player's progress

```ts
player.level;                    // main level, derived from the stats
player.levels.alchemy;           // one track's level, from the last report
player.perks;                    // every perk they own, by name
player.hasPerk("Basic medicine"); // by name or GUID

const sword = player.getTrack("weapon_sword");
if (sword) console.log(`sword ${sword.level}, ${sword.xp}/${sword.xpToNext} XP, ${sword.perkPoints} points`);
```

Everything reads zero, `[]` or `null` until the player's client has sent its
first report, shortly after they connect. `getTrack` throws for a track name
the game does not have.

## Grant XP and levels

```ts
player.addXp("survival", 50);   // as if they had earned it
player.setLevel("thievery", 10); // raise straight to a level
```

- `addXp` runs through the game's own path, so the player's perk multipliers
  apply, a level crossed shows the level-up popup, and new levels give perk
  points. It throws for XP that is not positive.
- `setLevel` grants exactly the XP between the current level and the one you
  ask for. The game cannot lower a level, so asking for a lower one throws.
- Both return `true` once the order went out. Your rates, budgets and caps
  (below) do not apply to them: those limit what players earn, not what you
  give.

## Set the rules for XP earned in play

```ts
Progression.setXpRate("*", 0.5);             // half the game's pace on every track
Progression.setXpRate("marksmanship", 2);    // except archery
Progression.setXpBudget("weapon_sword", 300); // at most 300 XP a minute
Progression.setLevelCap("*", 20);            // play stops at level 20
Progression.setNativeXp(false);              // no XP from play at all
```

| Call | Effect |
| --- | --- |
| `setXpRate(track, rate)` | Multiplies each gain before the player's own perks do. `1` is the normal pace, `0` none. |
| `setXpBudget(track, xpPerMinute)` | Caps how fast a track can be ground. The budget holds a minute's worth and refills steadily, so two players sparring for sword XP soon run dry. `0` removes it. |
| `setLevelCap(track, level)` | Play cannot take the track past `level`. `addXp` and `setLevel` still can. |
| `setNativeXp(enabled)` | `false` drops every gain the game makes. Only `addXp` and `setLevel` move a track, for servers where progression comes from your own jobs or trainers. |

Every call takes `*` for every track. Rules are not saved: set them in your
resource's startup code.

To decide on each gain yourself, return `false` from `playerXpGaining`:

```ts
Events.on("playerXpGaining", (player, track, xp, source) => {
  // source is the game's name for the cause: "Attack", "LockpickingResult", or ""
  if (track === "thievery" && player.virtualWorld !== 0) return false;
});
```

## Give, take and block perks

```ts
player.addPerk("Basic medicine");    // no point spent, no requirements checked
player.removePerk("Basic medicine"); // the point is not refunded
player.addPerkPoints("main", 2);    // a track name, or "main"
player.respecPerks();               // the game's own respec

Progression.blockPerks(["Always drunk"]); // nobody can learn or be granted it
Progression.unblockPerks(["Always drunk"]);
```

Perk names are the game's own, spaces and capitals included (`Basic medicine`,
`Archer`), and a perk's GUID works too. `Progression.perks({ visibleOnly: true })`
lists the ones on the perk screen, and `Progression.findPerk(name)` looks one
up, including the track that pays for it and the level it needs. `addPerk`
and `removePerk` throw for a name the game does not have.

Players learn perks on the game's own perk screen. The server checks every
learn against the game's rules and your block list, then asks
`playerPerkLearning`. Return `false` to refuse it:

```ts
Events.on("playerPerkLearning", (player, perk) => {
  // No thievery perks for players in the arena world.
  if (player.virtualWorld === 2 && Progression.findPerk(perk)?.track === "thievery") return false;
});
```

## Progression events

| Event | Arguments | When |
| --- | --- | --- |
| `playerXpGaining` | `player`, `track`, `xp`, `source` | Their game produced XP. Return `false` to refuse. `xp` is before your rate and their perks. |
| `playerXpGained` | `player`, `track`, `xp` | XP landed, after every multiplier. |
| `playerLevelUp` | `player`, `track`, `level`, `perkPoints` | A track reached a new level. |
| `playerPerkLearning` | `player`, `perk` | They confirmed a perk on the perk screen. Return `false` to refuse. |
| `playerPerkAdded` | `player`, `perk`, `source` | A perk appeared: `learned`, `server`, or `native` (the game granted it). |
| `playerPerkRemoved` | `player`, `perk`, `source` | A perk went: `server` or `native`. |
| `playerProgressionRejected` | `player`, `reason` | Their client reported progress the server never granted. |

`playerProgressionRejected` means a modified client. The game cannot take a
level back, so the report is kept, and what happens next is yours to decide.
Kicking is the usual answer:

```ts
Events.on("playerProgressionRejected", (player, reason) => {
  console.log(`${player.nickname}: ${reason}`);
  player.kick("Progression out of sync");
});
```

## On the client

The client can read the local player's progress but cannot change it. The
local player's `getTrack` works as on the server; for anyone else it returns
`null`, though their `levels` and `perks` still read.

```ts
// client
Events.on("progressionLevelUp", (track, level) => {
  Hud.showNotification(`${track} is now level ${level}`);
});

Events.on("progressionPerkRefused", (perk, reason) => {
  // The game's perk screen says nothing when the server refuses, so say why.
  if (reason === "blocked") Hud.showNotification("That perk is disabled on this server.");
});
```

The client also has `progressionXpGained`, `progressionPerkAdded` and
`progressionPerkRemoved`. `reason` is `points`, `level`, `parent`,
`exclusive`, `blocked`, `script` (your `playerPerkLearning` said no), `owned`
or `hidden`.

## Related

- [Read health, stats and skills](../stats/): the live combat skills and attributes
- [Brew potions at alchemy tables](../alchemy/): brewing grants alchemy XP through these rules
- [Join, spawn and respawn](../join-and-spawn/): `playerReady`, where a restore belongs
- [Progression reference](../../reference/server/variables/Progression.md)
