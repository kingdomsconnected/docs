---
title: Run a dedicated server
description: Start KCDCServer on Windows or Linux, open its ports, pass command-line arguments and use its console.
sidebar:
  label: Run a server
  order: 100
---

`KCDCServer` hosts the session, holds the authoritative world state and runs
your resources. It is the same program on your desk and on a rented machine.
To get the default gamemode running locally for the first time, follow
[Install and run a server](../../getting-started/install/) instead.

```sh title="Linux, in server-linux/"
./KCDCServer
```

```sh title="Windows, in server/"
.\KCDCServer.exe
```

Start it from its own folder: it reads `server.json` and `resources/` from
the working directory, not from next to the binary. The first start writes a
`server.json` with every default. The server accepts players once the log
shows:

```text
KCDC Server successfully started
```

Stop it with **Ctrl+C**, `quit` in the console, or `SIGTERM`. All three run
the same shutdown, so resources get their `resourceStop` handlers.

:::tip[Prefer Docker?]
Every release also publishes a ready-to-run image,
`ghcr.io/kingdomsconnected/kcdc-server:<version>`. See [Docker and
panels](../containers/).
:::

:::caution[The gamemode ships as source]
`resources/kcdc-gamemode` is TypeScript with no `dist/`, so the server skips
it until you build it. See [Install and run a server](../../getting-started/install/).
:::

## What is in the server folder

| Folder | Contents |
| --- | --- |
| `server/` (Windows) | `KCDCServer.exe`, `libnode.dll`, `crashpad_handler.exe`, `resources/` |
| `server-linux/` | `KCDCServer`, `libnode.so.*`, `crashpad_handler`, `resources/` |

The server carries its own JavaScript runtime in `libnode`, so the host needs
no Node.js. On Linux it also links against the system's libcurl, OpenSSL 3,
zlib and libstdc++ (on Ubuntu 24.04: `libcurl4t64`, `libssl3t64`, `zlib1g`,
`libstdc++6`, as in the official container image).

Build resources on any machine and copy the folder, `dist/` included, to the
server.

## Ports

| Port | Protocol | What it carries |
| --- | --- | --- |
| 27015 | UDP | The game session: connection, replication, resource download, voice |
| 27016 | TCP | HTTP endpoints, including a status document at `/` |

Nothing listens on TCP 27015. Change the ports with `--port` and `--apiport`,
or `port` and `apiport` in [server.json](../server-json/). To let players in
from outside, see [Let players connect](../players-connecting/).

Check that a server is up without starting the game:

```sh title="Any terminal"
curl http://your.server.address:27016/
```

It answers with JSON: mod name and version, game port, `max_players` and the
replicated `mod` settings such as the level.

## Player limit

A session holds at most 512 players. The cap is compiled in: `maxplayers`
can lower it, but a larger value is clamped to 512 at boot with a warning.

## Command-line arguments

Options override the matching `server.json` key for one run and are never
written back:

```sh title="Linux, a second server on the same machine"
./KCDCServer --port 28015 --apiport 28016 --config second.json
```

[Options and overrides](../options-and-overrides/#command-line-options) lists
every option, which source wins, and how to change common behaviours.

## Resources and chat commands

Every folder under `resources/` with a valid `package.json` is a resource,
started at boot ([Resources](../../core-concepts/resources/)).

The server itself answers no chat commands: `/help`, `/tp` and the rest come
from `kcdc-gamemode`. Without it players still connect and play, but
commands do nothing. Plain chat is relayed to everyone by default either way
([Chat and /commands](../../players/chat/)).

## Console commands

The server reads operator commands from standard input: its terminal, or a
hosting panel's console tab. `help` in the console goes to the server;
`/help` in game goes to your resources.

```sh title="Server console"
ensure my-resource
```

| Verb | What it does |
| --- | --- |
| `start <resource>` | Start a stopped resource |
| `stop <resource>` | Stop a running resource |
| `stop` | With no argument, shut the server down |
| `restart <resource>` | Reload a running resource. Refuses if it is not running |
| `ensure <resource>` | Reload the resource if running, start it if not |
| `refresh` | Register new folders in `resources/`, stopped |
| `refreshall` | `refresh`, then reload every running resource |
| `quit` | Shut the server down |
| `status` | Print server name, address and player count |
| `help` | List every verb |

`<resource>` is the `name` in its `package.json`, normally the folder name.

:::caution[`stop` on its own stops the server]
`stop kcdc-gamemode` stops one resource; a bare `stop` shuts everything down,
like `quit`.
:::

### Reload a resource

A reload runs the resource's `resourceStop` handlers, removes its listeners
and timers, forgets its cached modules, re-reads `package.json` and starts
it again. Resources that depend on it restart with it.

Players stay connected: they receive the changed client files and restart
the client half in place. Scripts and tooling usually want `ensure`, which
also works when the resource is not running.

### Add a resource while the server runs

`start` only knows resources found so far. Scan for a newly copied folder
first; `refresh` never starts anything itself:

```sh title="Server console"
refresh
start my-new-resource
```

In a container the console needs stdin and a terminal attached; see
[Docker and panels](../containers/#use-the-console).

## Files the server writes

Everything lives in the working directory: `server.json`, `resources/`,
`logs/`, `.packages/` and crash data. Back up the whole folder, hidden files
included. [Options and overrides](../options-and-overrides/#files-the-server-writes)
says what each one is.

## Related

- [Options and overrides](../options-and-overrides/): every option and setting, and which one wins.
- [server.json settings](../server-json/): every key, the level and required DLCs.
- [Let players connect](../players-connecting/): port forwarding and what to send players.
- [Docker and panels](../containers/): the official image.
- [Write your first resource](../../getting-started/first-resource/): the edit, build, `ensure` loop.
