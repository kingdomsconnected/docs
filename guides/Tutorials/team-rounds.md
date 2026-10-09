---
title: Build a team capture-zone mode
description: Two teams kept in state bags, a spawn per team, a capture zone scored by a round timer, and a resource that cleans up after itself.
sidebar:
  label: Capture-zone mode
  order: 95
---

You will build a complete game loop: players split into red and blue, each team spawns at its own base, and a round timer scores whichever team holds a capture zone. In game, a clock line shows the time and score, and when the round ends the winner is announced in chat and a new round starts after a short break.

:::note[Before you start]
- [Write your first resource](../../getting-started/first-resource/) and [Use TypeScript](../../getting-started/typescript/), with both the server and client programs.
- [Entity state bags](../../core-concepts/state/), [Markers and trigger zones](../../world/markers/) and [Join, spawn and respawn](../../players/join-and-spawn/).

Difficulty: advanced. Time: about an hour.
:::

## What you will learn

- Storing each player's team in their [state bag](../../core-concepts/state/), visible to every client, and private per-player data with `scope: "server"`.
- Spawning and respawning players at a team base with [`playerSpawning` and `revive`](../../players/join-and-spawn/).
- Tracking who stands in a trigger [marker](../../world/markers/) with `markerEnter` and `markerExit`.
- Running a round on timers, broadcasting a clock with [server and client messages](../../core-concepts/networking/) and showing it with [HUD messages](../../user-interface/hud/).

```text
team-rounds/
  package.json
  tsconfig.json          from Use TypeScript
  src/server/
    index.ts             player lifecycle, commands, cleanup
    teams.ts             team assignment and bases
    zone.ts              the capture zone
    round.ts             the round timer and score
  src/client/
    tsconfig.json        from Use TypeScript
    index.ts             the clock
```

## 1. Write the manifest

The client script must be in `files` so the server streams it to players.

```json title="package.json"
{
  "name": "team-rounds",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc -p tsconfig.json && tsc -p src/client/tsconfig.json"
  },
  "devDependencies": {
    "@kingdomsconnected/types": "latest",
    "typescript": "^5.9.2"
  },
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"],
    "clientScripts": ["dist/client/index.js"],
    "files": ["dist/client/**"]
  }
}
```

## 2. Assign teams

A player's team is one key, `team`, in their state bag. The default `broadcast` scope sends it to every client that can see the player, and the key dies with the player's entity.

```ts title="src/server/teams.ts"
export type Team = "red" | "blue";

/** Nametag tints, packed 0xAARRGGBB. */
const TINT: Record<Team, number> = { red: 0xffe05040, blue: 0xff4080e0 };

/** Each team's base. Null until somebody stands there and types /team spawn. */
export const bases: Record<Team, Vector3 | null> = { red: null, blue: null };

export function teamOf(player: Player): Team | null {
  const team: unknown = player.state.get("team");
  return team === "red" || team === "blue" ? team : null;
}

/** Puts a player on whichever team is smaller. */
export function assignTeam(player: Player): Team {
  const counts: Record<Team, number> = { red: 0, blue: 0 };
  for (const other of Player.all()) {
    const team = teamOf(other);
    if (team) counts[team] += 1;
  }
  const team: Team = counts.red <= counts.blue ? "red" : "blue";
  player.state.set("team", team);
  player.setNametagColor(TINT[team]);
  return team;
}

export function clearTeam(player: Player): void {
  player.state.remove("team");
  player.state.remove("held");
  player.setNametagColor(0xffffffff);
}

/** Sends a player to their team's base. False when the base is not set yet. */
export function sendHome(player: Player): boolean {
  const team = teamOf(player);
  const base = team ? bases[team] : null;
  return base ? player.spawn(base) : false;
}
```

## 3. Track the capture zone

Teams score by holding a zone, not by kills, because `playerDied` does not say who killed. The zone is a trigger marker: the server raises `markerEnter` and `markerExit` as players cross it and keeps the ids of everyone inside.

```ts title="src/server/zone.ts"
import { teamOf, type Team } from "./teams.js";

let marker: Marker | null = null;
const inside = new Set<number>();

export function placeZone(position: Vector3): void {
  removeZone();
  marker = Marker.place("materials/filters/fade_short_70", position, { shape: "cylinder", size: 10, height: 3, trigger: true });
}

export function removeZone(): void {
  marker?.remove();
  marker = null;
  inside.clear();
}

/** Everyone alive and standing in the zone. */
export function occupants(): Player[] {
  const players: Player[] = [];
  for (const id of inside) {
    const player = Player.getById(id);
    if (player && player.alive) players.push(player);
  }
  return players;
}

/** The team holding the zone: the only team with anyone in it. */
export function holder(): Team | null {
  const present = new Set(occupants().map(teamOf));
  present.delete(null);
  return present.size === 1 ? [...present][0] ?? null : null;
}

export function installZoneHandlers(): void {
  Events.on("markerEnter", (entered, player) => {
    if (entered.id === marker?.id) inside.add(player.id);
  });
  Events.on("markerExit", (exited, player) => {
    if (exited.id === marker?.id) inside.delete(player.id);
  });
  // No markerExit is raised for a player who leaves the server.
  Events.on("playerDisconnect", (player) => inside.delete(player.id));
}
```

- `markerExit` is not raised when the marker is removed, `trigger` is turned off, or the player leaves the world. `removeZone` and the `playerDisconnect` handler empty the set by hand; miss one and a player who left an hour ago still holds the zone.

## 4. Run the round

The round is idle, running, or on a break. While it runs, a one-second interval scores the zone and sends the clock to every client. Each player's seconds in the zone go in their state bag with `scope: "server"`, which never goes on the wire.

```ts title="src/server/round.ts"
import { sendHome, type Team } from "./teams.js";
import { holder, occupants } from "./zone.js";

const RESOURCE = "team-rounds";
const ROUND_SECONDS = 180;
const BREAK_SECONDS = 20;
/** A team this far ahead wins early. */
const TARGET = 90;

export type Phase = "idle" | "running" | "break";

let phase: Phase = "idle";
let left = 0;
let ticker: Timeout | undefined;
let pause: Timeout | undefined;
const score: Record<Team, number> = { red: 0, blue: 0 };

export function currentPhase(): Phase {
  return phase;
}

export function scoreLine(): string {
  return `red ${score.red}, blue ${score.blue}`;
}

export function startRound(): void {
  stopRounds();
  phase = "running";
  left = ROUND_SECONDS;
  score.red = 0;
  score.blue = 0;
  for (const player of Player.all()) {
    player.state.set("held", 0, { scope: "server" });
    sendHome(player);
  }
  Chat.sendToAll(`Round started. Hold the zone for ${ROUND_SECONDS / 60} minutes.`);
  ticker = setInterval(tick, 1000);
}

function tick(): void {
  const team = holder();
  if (team) {
    score[team] += 1;
    for (const player of occupants()) {
      player.state.set("held", Number(player.state.get("held") ?? 0) + 1, { scope: "server" });
    }
  }
  left -= 1;
  Events.emitAllClients(`${RESOURCE}:clock`, { left, red: score.red, blue: score.blue, holder: team });
  if (left <= 0 || score.red >= TARGET || score.blue >= TARGET) endRound();
}

function endRound(): void {
  clearInterval(ticker);
  const winner = score.red === score.blue ? null : score.red > score.blue ? "Red" : "Blue";
  Chat.sendToAll(winner ? `${winner} wins, ${scoreLine()}.` : `A draw, ${scoreLine()}.`);

  const best = Player.all().sort((a, b) => Number(b.state.get("held") ?? 0) - Number(a.state.get("held") ?? 0))[0];
  if (best && Number(best.state.get("held") ?? 0) > 0) {
    Chat.sendToAll(`${best.nickname} held the zone longest: ${best.state.get("held")} seconds.`);
  }

  phase = "break";
  pause = setTimeout(startRound, BREAK_SECONDS * 1000);
}

export function stopRounds(): void {
  clearInterval(ticker);
  clearTimeout(pause);
  phase = "idle";
}
```

- `startRound` calls `stopRounds` first, so starting a round during a round or a break never leaves a second timer behind.

## 5. Wire the server

The entry point connects the player lifecycle to the teams, and the commands to the round.

```ts title="src/server/index.ts"
import { currentPhase, scoreLine, startRound, stopRounds } from "./round.js";
import { assignTeam, bases, clearTeam, sendHome, teamOf } from "./teams.js";
import { installZoneHandlers, placeZone, removeZone } from "./zone.js";

const RESOURCE = "team-rounds";

installZoneHandlers();

// Players already connected when the resource starts (a reload) never get playerConnect.
for (const player of Player.all()) {
  if (!teamOf(player)) assignTeam(player);
}

Events.on("playerConnect", (player) => {
  assignTeam(player);
});

// Runs once, when a player joins. It must decide synchronously: no await in here.
Events.on("playerSpawning", (player) => {
  sendHome(player);
});

Events.on("playerSpawned", (player) => {
  Chat.sendToPlayer(player, `You are on the ${teamOf(player)} team. /team tells you the score.`);
});

// There is no automatic respawn, and a revive does not raise playerSpawning:
// the body comes back where it fell. Revive, then send them home a moment later,
// resolving them again by id in case they left in between.
Events.on("playerDied", (player) => {
  const id = player.id;
  if (!player.revive()) return;
  setTimeout(() => {
    const revived = Player.getById(id);
    if (revived) sendHome(revived);
  }, 500);
});

Events.on("playerDisconnect", (player) => {
  // The leaving player is still listed while this runs.
  const staying = Player.all().filter((other) => other.id !== player.id);
  if (staying.length === 0) {
    stopRounds();
    removeZone();
  }
});

Events.on("playerCommand", (player, command, args) => {
  if (command === "round" && args[0] === "start") {
    placeZone(player.position);
    startRound();
  } else if (command === "round" && args[0] === "stop") {
    stopRounds();
    removeZone();
    Chat.sendToAll("Rounds stopped.");
  } else if (command === "team" && args[0] === "spawn") {
    const team = teamOf(player);
    if (!team) return;
    bases[team] = player.position.clone();
    Chat.sendToPlayer(player, `The ${team} base is here now.`);
  } else if (command === "team") {
    Chat.sendToPlayer(player, `You are on the ${teamOf(player)} team. Round: ${currentPhase()}, ${scoreLine()}.`);
  }
});

// Timers and handlers go with the resource; state keys, nametag tints and markers do not.
Events.on("resourceStop", (name) => {
  if (name !== RESOURCE) return;
  stopRounds();
  removeZone();
  for (const player of Player.all()) clearTeam(player);
});
```

- `player.spawn` returns true when the request went out, not when the player arrived ([Server vs client authority](../../core-concepts/authority/)). A player sent home leaves the zone only once their client reports the body moved.

## 6. Show the clock on the client

The client shows the clock in the info line, and a notification when its own `team` state key changes.

```ts title="src/client/index.ts"
const RESOURCE = "team-rounds";

Events.on("entityStateChange", (entity, key, value) => {
  if (key !== "team" || !LocalPlayer || entity.id !== LocalPlayer.id) return;
  if (value === "red" || value === "blue") Hud.showNotification(`You are on the ${value} team.`);
});

Events.on(`${RESOURCE}:clock`, (payload) => {
  if (typeof payload !== "object" || payload === null) return;
  const { left, red, blue, holder } = payload as Record<string, unknown>;
  if (typeof left !== "number") return;

  const clock = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  const held = holder === "red" || holder === "blue" ? `, ${holder} holds the zone` : "";
  // Slightly longer than a tick, so the line never blinks out between updates.
  Hud.showInfoText(`${clock}  red ${red} / blue ${blue}${held}`, 1200);
});
```

## Try it

Build the resource and run `ensure team-rounds` in the server console, with at least two players connected so each team has somebody. In game:

1. Each player walks to where their base should be and types `/team spawn`.
2. One player walks to open ground and types `/round start`. The zone appears around them and everybody is sent to their base.
3. Walk into the zone. The clock line says your team holds it, and your score climbs once a second. With both teams in it, nobody scores.
4. Die, and you come back at your base.
5. After three minutes, or when a team reaches 90, the winner and the longest holder are announced, and a new round starts 20 seconds later.
6. `ensure team-rounds` during a round reloads it: the zone goes, nametags turn white, everyone gets a new team, and the bases must be set again.

## Next steps

- Read teammates' `team` key on each client with `onChange` from [Entity state bags](../../core-concepts/state/), for example to list your team on screen.
- Put the capture zone on the map for everyone with [Map markers and blips](../../user-interface/map/).
- Replace the `if` chain in `index.ts` with the [/command system](../command-system/) once you have more than a handful of commands.
