---
title: Server console commands
description: The verbs the server console understands, for starting, stopping and reloading resources without a restart.
sidebar:
  order: 103
---

The server reads commands from its standard input: the terminal window it
runs in, or the console tab of a hosting panel. These are operator commands,
separate from chat. Typing `/help` in the game goes to your resources; typing
`help` in the console goes to the server.

The most useful one while you work on a resource:

```sh title="Server console"
ensure my-resource
```

That reloads `my-resource` from disk if it is running, or starts it if it is
not, and pushes the new client files to every connected player.

## Verbs

| Verb | What it does |
| --- | --- |
| `start <resource>` | Start a stopped resource |
| `stop <resource>` | Stop a running resource |
| `stop` | With no argument, shut the server down |
| `restart <resource>` | Reload a running resource's code. Refuses if the resource is not running |
| `ensure <resource>` | Reload the resource if it is running, start it if it is not |
| `refresh` | Scan `resources/` for new resource folders and register them, stopped |
| `refreshall` | Scan for new folders (registered, stopped), then reload every running resource |
| `quit` | Shut the server down |
| `status` | Print the server name, address and player count |
| `help` | List every verb |

`<resource>` is the `name` in the resource's `package.json`, which is
normally also its folder name.

:::caution[`stop` on its own stops the server]
`stop kcdc-gamemode` stops one resource. `stop` with nothing after it shuts
the whole server down, the same as `quit`. Double-check before pressing Enter
on a live server.
:::

## Reloading

A reload stops the resource, forgets its cached modules, re-reads its
`package.json`, and starts it again. On the way down it runs the resource's
`resourceStop` handlers, removes its event listeners and cancels its timers,
so a reload does not leave the old copy running beside the new one.
[Resource manifest and lifecycle](../../core-concepts/resources/) covers what is
cleaned up and what is not.

Resources that depend on the one you reload are stopped with it and started
again after it.

Players stay connected throughout. The server sends them the changed client
files and they restart the client half in place; a reload of a resource with
no client half sends nothing.

`ensure` and `restart` both reload code. The difference is what happens when
the resource is not running: `ensure` starts it, `restart` refuses. Scripts
and tooling usually want `ensure`.

## Adding a resource while the server runs

`start` only knows resources the server has already found. A folder you
copied into `resources/` after boot needs a scan first:

```sh title="Server console"
refresh
start my-new-resource
```

`refresh` never starts anything on its own. `ensure my-new-resource` also
works after the `refresh`.

## The console in a container

The console is the process's standard input, and a container started with
`docker run -d` or Compose has none attached, so typed verbs go nowhere. To
use it, start the container with stdin open and a terminal:

```sh title="Host"
docker run -dit --name kcdc --init --restart unless-stopped \
  -p 27015:27015/udp -p 27016:27016/tcp \
  -v kcdc-data:/home/container 'ghcr.io/kingdomsconnected/kcdc-server:<version>'
docker attach kcdc
```

For Compose, add `stdin_open: true` and `tty: true` to the service, then
`docker compose attach server`.

Detach with **Ctrl+P** then **Ctrl+Q**. Pressing **Ctrl+C** while attached
sends an interrupt to the server and shuts it down.

Without a console, `docker restart kcdc` restarts the whole server, which
picks up every resource change at the cost of disconnecting everyone.

Pterodactyl's console tab writes to the server's standard input, so every
verb works there as typed.

## Related

- [Run a dedicated server](../dedicated-server/)
- [Write your first resource](../../getting-started/first-resource/): the edit, build, `ensure` loop.
