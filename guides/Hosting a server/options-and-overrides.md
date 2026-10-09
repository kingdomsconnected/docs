---
title: Server options and overrides
description: Every setting a host can change, where to set it, which source wins, and how to run, monitor and customise the official server image.
sidebar:
  label: Options and overrides
  order: 101
---

This is the reference page for server hosts and hosting providers: every
setting the server takes, where it comes from, and how to change what the
server does without touching its code.

:::tip[An official Docker image for every release]
Every KCDC release publishes a public, ready-to-run Linux server image:
`ghcr.io/kingdomsconnected/kcdc-server:<version>`. Use the latest release's
tag in place of `<version>`. No login is needed to pull it,
and the Pterodactyl egg ships inside it. Tags are exact versions only, with no
`latest`, so a host always runs the version it chose. See [Docker and
panels](../containers/).
:::

## Which setting wins

Each setting is resolved in this order, first match wins:

1. **A command-line option**, for this run only. It is never written back to
   `server.json`.
2. **`server.json`**, read once at boot from the working directory (or the
   file `--config` names). A missing file is written with every default.
3. **The built-in default.**

```sh title="server.json says port 27015; this run uses 28015"
./KCDCServer --port 28015 --apiport 28016
```

On Pterodactyl, the egg's startup command always passes `--host`, `--port`,
`--apihost`, `--apiport` and `--config`, so those keys in `server.json` have no
effect there. Everything else in the file is still yours.

## Command-line options

This is the complete list, as `KCDCServer --help` prints it:

| Option | Short | Default | What it sets |
| --- | --- | --- | --- |
| `--port` | `-p` | `27015` | Game session port (UDP) |
| `--host` | `-h` | `0.0.0.0` | Address the game session binds to |
| `--apiport` | `-P` | `27016` | HTTP port (TCP) |
| `--apihost` | `-H` | `0.0.0.0` | Address the HTTP endpoints bind to |
| `--config` | `-c` | `server.json` | Configuration file, relative to the working directory |
| `--server-token` | `-t` | none | Masterlist push token; the server is listed only when it is set |
| `--password` | | none | Password players must give to join; empty lets anyone in |
| `--help` | | | Print the list and exit |

There is no option for `maxplayers` or anything under `mod`: set those in
`server.json`.

## server.json keys

| Key | Default | Option that overrides it | Details |
| --- | --- | --- | --- |
| `host` | `"0.0.0.0"` | `--host` | |
| `port` | `27015` | `--port` | |
| `apihost` | `"0.0.0.0"` | `--apihost` | |
| `apiport` | `27016` | `--apiport` | |
| `maxplayers` | `512` | none | Can only lower the cap; above 512 is clamped with a warning |
| `server-token` | `""` | `--server-token` | [Server browser listing](../server-browser/) |
| `password` | `""` | `--password` | [Join password](../server-json/#password), 63 bytes at most |
| `mod.level` | `"kutnohorsko"` | none | [Levels](../server-json/#modlevel) |
| `mod.required_dlc` | `[]` | none | [Required DLCs](../server-json/#modrequired_dlc) |
| `mod.scoreboard` | `true` | none | [Player list](../server-json/#modscoreboard) |
| `mod.world_resources` | `[]` | none | [World exports](../server-json/#modworld_resources) |
| `mod.navmesh` | `""` | none | [Navigation mesh](../server-json/#modnavmesh) |
| `map` | `""` | none | Not used by KCDC |

A value of the wrong type, an unknown level or an unknown DLC stops the server
at boot with the reason in the log. [server.json settings](../server-json/)
has the full rules.

## Change common behaviours

| I want to... | Do this |
| --- | --- |
| Use other ports | `--port` and `--apiport`, or `port` and `apiport`. In a container, change the published ports to match |
| Listen on one interface only | `--host` and `--apihost` with that address |
| Run several servers on one machine | Give each its own folder, or its own `--config` file and ports: `--port 28015 --apiport 28016 --config second.json` |
| Hold fewer players | `maxplayers` below 512 |
| Load another level | `mod.level`: `kutnohorsko`, `trosecko` or `klaster` |
| Keep out players missing a DLC | `mod.required_dlc` |
| Turn off the Tab player list | `mod.scoreboard`: `false` |
| Load a World Builder export | Add its `.world.json` path to [`mod.world_resources`](../server-json/#modworld_resources) and restart |
| Let players use World Builder in multiplayer | Grant access from a server script with `player.setWorldBuilderEnabled(true)`, see [World Builder](../../world/world-builder/#allow-building-in-multiplayer) |
| Let NPCs walk around walls and through buildings | Copy the game's `recast.pak` into `files/<level>/`, see [`mod.navmesh`](../server-json/#modnavmesh) |
| Make a private server | `password`, see [Password](../server-json/#password). Share it with your players |
| Appear in the in-game server browser | `server-token`, see [Server browser listing](../server-browser/) |
| Keep the token or password out of process lists | Put it in `server.json`, not on the command line or in an egg variable |
| Run a different gamemode | Replace `resources/kcdc-gamemode` with your own resource, or add yours beside it |
| Run with no gamemode at all | Empty `resources/`. Players still connect; no `/` command answers. In a container, see below |
| Reload scripts without a restart | `ensure <resource>` in the [console](../run-a-server/#console-commands) |
| Change chat, spawns, commands, rules | These are gamemode behaviour, not server settings: edit or replace the resource ([Getting started](../../getting-started/first-resource/)) |

## Container specifics

The image runs `/usr/local/bin/kcdc-entrypoint`, which prepares
`/home/container`, seeds the default gamemode if it is missing, then starts the
server with your arguments.

| Input | Effect |
| --- | --- |
| Arguments after the image name (`docker run ... IMAGE --port 28015`), or Compose `command` | Passed straight to the server. They take precedence over `STARTUP` |
| `STARTUP` environment variable | Used by Pterodactyl Wings when no arguments are given |
| `KCDC_VERSION`, `KCDC_IMAGE` | Only in the sample `compose.yaml`: pick the image tag and registry. They do not configure the server |
| `TRACY_NO_INVARIANT_CHECK=1` | Needed on CPUs without an invariant TSC (some virtual machines and emulators), where the server otherwise exits at start with `Tracy Profiler initialization failure` |

| Path | What it is |
| --- | --- |
| `/home/container` | Working directory and the one volume: `server.json`, `resources/`, logs, packages, crash data |
| `/opt/kcdc/` | The server binary and its libraries (read-only) |
| `/opt/kcdc/default-resources/` | What the entrypoint seeds into `resources/` |
| `/usr/share/kcdc/egg-kcdc.json` | The Pterodactyl egg for this exact version |

The server runs as UID and GID `10001`, stops cleanly on `SIGTERM` (allow it
about 30 seconds), and the image declares `27015/udp` and `27016/tcp`.

**Seeding.** On every start, each folder of `/opt/kcdc/default-resources/` is
copied into `resources/` only if no folder of that name exists. An edited or
emptied `resources/kcdc-gamemode` is never overwritten. So:

- to run **without** the default gamemode, leave an empty
  `resources/kcdc-gamemode` folder (a folder with no `package.json` is not a
  resource), rather than deleting it;
- to ship **your own** gamemode in the image, build `FROM` the release image
  and `COPY` it into `/opt/kcdc/default-resources/`
  ([example](../containers/#flyio)).

## Monitor a server

**Ready.** The log line `KCDC Server successfully started` means players can
join. The Pterodactyl egg uses it as its "started" signal.

**Status endpoint.** `GET http://<host>:<apiport>/` answers with JSON, handy
for health checks and server lists:

```json title="GET http://127.0.0.1:27016/"
{
  "framework_version": "32.0.0",
  "host": "0.0.0.0",
  "max_players": 512,
  "mod_config": { "level": "kutnohorsko", "required_dlc": [], "scoreboard": true },
  "mod_name": "KCDC",
  "mod_slug": "kcdc",
  "mod_version": "1.6.4",
  "password_required": false,
  "port": 27015
}
```

`port` is the game port actually in use, after any override.

**Log lines worth alerting on:**

| Line | Meaning |
| --- | --- |
| `Server will not be announced to masterlist` | No `server-token`; joinable by address only |
| `Failed to ping masterlist server: 401` | The token is wrong or its listing was deleted |
| `Failed to start resources: N of M resources failed to start` | A resource is missing its built files or threw at start; the lines above name it |
| `Could not package client resource` | A resource's client script is missing, usually an unbuilt gamemode |

## Files the server writes

All in the working directory. Back up the whole folder, hidden files included.

| Path | What it is |
| --- | --- |
| `server.json` | Configuration, written with defaults on first start |
| `resources/` | Your resources |
| `logs/` | The server log |
| `.packages/` | Encrypted client packages and their key, and the archives of each resource's custom assets. Keep it, or players re-download everything after a restart |
| `cache/sentry/` | Crash-reporting data. Crashes are reported to the KCDC developers |

## Related

- [Run a dedicated server](../run-a-server/): start, ports and console commands.
- [Docker and panels](../containers/): Docker, Compose, Fly.io and Pterodactyl step by step.
- [server.json settings](../server-json/): levels, DLC names and validation.
- [Let players connect](../players-connecting/): port forwarding and firewalls.
