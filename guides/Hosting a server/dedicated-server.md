---
title: Run a dedicated server
description: Start KCDCServer on Windows or Linux, what it listens on, where it reads its files, and what a fresh server does.
sidebar:
  order: 100
---

`KCDCServer` is the dedicated server: it hosts the session, holds the
authoritative state of the world, and runs your resources. It is the same
program on your desk and on a rented machine, so everything here applies to
both. If you only want to get the default gamemode running locally, [Run the
default gamemode](../../getting-started/run-the-gamemode/) is the shorter path.

## What is in a release

A release has a server folder per platform. Each one is complete on its own:

| Folder | Contents |
| --- | --- |
| `server/` | `KCDCServer.exe`, `libnode.dll`, `crashpad_handler.exe`, and `resources/` |
| `server-linux/` | `KCDCServer`, `libnode.so.*`, `crashpad_handler`, and `resources/` |

The server does not need Node.js installed. It carries its own JavaScript
runtime in `libnode`. Node is only needed on whatever machine compiles
TypeScript.

On Linux the binary finds `libnode` next to itself. It links against the
system's libcurl, OpenSSL 3, zlib and libstdc++; on Ubuntu 24.04 those are
the `libcurl4t64`, `libssl3t64`, `zlib1g` and `libstdc++6` packages, which is
exactly what the official container image installs.

## Start it

Start the server from its own folder. It reads `server.json` and `resources/`
relative to the directory it runs in, not relative to the binary.

```sh title="Windows, in server/"
.\KCDCServer.exe
```

```sh title="Linux, in server-linux/"
./KCDCServer
```

The first start writes a `server.json` with every setting and its default.
When the log shows this line, the server is accepting players:

```text
KCDC Server successfully started
```

Stop it with **Ctrl+C**, `quit` in the [console](../console/), or `SIGTERM`.
All three go through the same shutdown, so resources get their
`resourceStop` handlers.

## Ports

| Port | Protocol | What it carries |
| --- | --- | --- |
| 27015 | UDP | The game session: connection, replication, resource download, voice |
| 27016 | TCP | HTTP endpoints, including a status document at `/` |

The game port is UDP only; nothing listens on TCP 27015. Both ports can be
changed with `--port` and `--apiport` on the command line or `port` and
`apiport` in [server.json](../server-json/).

A quick way to check that a server is up without starting the game:

```sh title="Any terminal"
curl http://your.server.address:27016/
```

It answers with a small JSON document: the mod name and version, the game
port, `max_players`, and the replicated `mod` settings such as the level.

For a server other people join, open or forward both ports.
[How players connect](../players-connecting/) covers routers and firewalls.

## Ten players

A session holds at most ten players. That number is compiled into the
server, not just a default: `maxplayers` in `server.json` can lower it, but a
larger value is clamped back to ten at boot with a warning.

## Command-line arguments

Arguments override the matching `server.json` key for that run, and are not
written back to the file.

| Argument | Short | Default | Purpose |
| --- | --- | --- | --- |
| `--port` | `-p` | `27015` | Game session port (UDP) |
| `--host` | `-h` | `0.0.0.0` | Address the game session binds to |
| `--apiport` | `-P` | `27016` | HTTP port (TCP) |
| `--apihost` | `-H` | `0.0.0.0` | Address the HTTP endpoints bind to |
| `--config` | `-c` | `server.json` | Configuration file to read, relative to the working directory |
| `--server-token` | `-t` | none | Masterlist token; see [server.json](../server-json/#server-token) |
| `--help` | | | Print this list and exit |

```sh title="Linux, a second server on the same machine"
./KCDCServer --port 28015 --apiport 28016 --config second.json
```

A `--config` file that does not exist yet is written with defaults, the same
way `server.json` is on a first start.

## Resources, and what a fresh server answers

Every folder under `resources/` with a valid `package.json` is a resource, and
the server starts all of them at boot. [Resource manifest and lifecycle](../../core-concepts/resources/) explains the manifest.

The server itself answers **no** chat commands. `/help`, `/horse`, `/tp`,
`/world` and every other `/` command come from the default gamemode,
`resources/kcdc-gamemode`. Remove it, or never build it, and players still
connect and play together, but typing a command does nothing.

:::caution[The gamemode ships as source]
A release contains `resources/kcdc-gamemode` as TypeScript with no `dist/`
folder. Until you compile it, the server logs that it could not start the
resource and runs without it. Follow [Run the default
gamemode](../../getting-started/run-the-gamemode/) once on the machine that builds it:
`pnpm install` and `pnpm run build` in that folder, after fetching the
declarations.
:::

You can build on your own machine and copy the resource folder, `dist/`
included, to the server. The server only loads JavaScript, so a Linux host
needs neither Node nor pnpm.

Chat itself does not depend on the gamemode: plain chat lines are relayed to
everyone by default. A gamemode that wants to own delivery (teams, proximity,
moderation) turns that off; see [Chat messages and /commands](../../server-scripting/players/chat/).

## What else the server writes

Next to `server.json`, in the working directory:

| Path | What it is |
| --- | --- |
| `logs/` | The server log |
| `.packages/` | Encrypted client packages built from your resources, plus their key. Keep it between restarts so connected players do not re-download everything |
| crash dumps | Written by `crashpad_handler` if the server crashes, and reported to the KCDC developers |

Back up the whole folder, hidden files included.

## Next

- [server.json settings](../server-json/): every key, the level, and required DLCs.
- [Server console commands](../console/): reload resources without a restart.
- [Docker, Compose, Fly.io and Pterodactyl](../containers/): the official image.
