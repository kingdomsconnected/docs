---
title: List your server in the server browser
description: Register your server on MafiaHub, add its push key to server.json, and have it appear in the in-game server browser.
sidebar:
  order: 2
---

The in-game **Server browser** shows every KCDC server announced on the
MafiaHub masterlist. A server is not listed by default: anyone can still join
it by address, but nobody will find it by browsing. Listing takes one
registration on MafiaHub and one line in `server.json`.

You need a server that already runs and that players can reach from the
internet. If players cannot connect by address yet, fix that first with [How
players connect](../hosting-a-server/players-connecting/): the masterlist only
advertises your address, it does not make it reachable.

## How the listing works

```text
your server ──(every 5 s: players, version, port)──> masterlist.mafiahub.dev
                                                            │
in-game Server browser <──(list of live KCDC servers)───────┘
```

- Your server sends a heartbeat every five seconds with its player count, its
  version and its game port. The heartbeat carries your **push key**, which
  proves which listing it belongs to.
- The **name**, **address** and **region** shown in the browser come from the
  registration you create on MafiaHub, not from the server. Change them there.
- A listing disappears about two minutes after the last heartbeat, so a server
  that stops or crashes drops out of the browser on its own.

## 1. Register the server

1. Sign in at [mafiahub.dev](https://mafiahub.dev/dashboard/servers) and open
   **Servers**, then [create a new one](https://mafiahub.dev/dashboard/servers/new).
2. Choose **Kingdoms Connected** (KCDC) as the mod. This decides which game's
   browser lists you, and it cannot be changed later.
3. Fill in the details:

   | Field | What to enter |
   | --- | --- |
   | Server name | What players see in the browser, up to 50 characters |
   | IP address | Your server's **public** IP, the one players connect to. Not `0.0.0.0` or `127.0.0.1` |
   | Port | The game port from `server.json`, `27015` unless you changed it |
   | Location | The region the machine is in |

4. Save. The server's page shows your **push key**. Copy it.

:::danger[The push key is a password]
Anyone who has it can publish heartbeats for your listing. Keep it out of
screenshots, public repositories and shared Pterodactyl eggs. If it leaks,
delete the listing and register a new one.
:::

## 2. Add the key to server.json

Open `server.json` next to `KCDCServer` and set `server-token` to the push key.
Leave every other key as it is:

```json title="server.json" ins={7}
{
  "host": "0.0.0.0",
  "port": 27015,
  "apihost": "0.0.0.0",
  "apiport": 27016,
  "maxplayers": 10,
  "server-token": "paste-your-push-key-here",
  "mod": {
    "level": "kutnohorsko",
    "required_dlc": []
  }
}
```

:::caution[Do not paste the dashboard's whole file]
The dashboard offers a ready-made `server.json`. It is written for every
MafiaHub mod, so it has `"maxplayers": 64` (KCDC holds 10, and clamps it) and
no `mod` block. Pasting it over your file resets your level and DLC settings.
Copy only the `server-token` line.
:::

You can also pass the key on the command line for one run, with
`--server-token <key>` (or `-t`). The file is the better place for it: a
command line is visible to anyone who can list processes on the machine.

## 3. Restart and check

Restart the server. If the key is missing, the log says so at startup:

```text
Server will not be announced to masterlist
```

No such line means heartbeats are going out. A rejected key shows up every
five seconds instead:

```text
Failed to ping masterlist server: 401 {"error":"Invalid API key"}
```

To see your listing exactly as the game sees it, ask the masterlist directly:

```sh title="Any terminal"
curl https://masterlist.mafiahub.dev/servers
```

Your server appears in that list, with `"gamemode": "KCDC"`, within a few
seconds. Then open **Server browser** in the game's multiplayer menu and
refresh.

## Troubleshooting

<details>
<summary>Listed, but players cannot connect from the browser</summary>

The browser connects to the IP from your registration and the port your
server reports. Check that the registered IP is the machine's public address
(not a LAN address like `192.168.x.x`), and that UDP port 27015 is open and
forwarded to the machine. [How players
connect](../hosting-a-server/players-connecting/) covers port forwarding.

</details>

<details>
<summary><code>401 Invalid API key</code> in the log</summary>

The key in `server.json` does not match a live listing. Copy it again from
the dashboard, and watch for a missing character or stray spaces inside the
quotes. A listing that was deleted or disabled on MafiaHub also rejects its
old key.

</details>

<details>
<summary>The server is in <code>/servers</code> but not in the game's browser</summary>

The in-game browser only shows servers whose mod matches KCDC, which is the
mod you chose when registering. If you picked another mod by mistake, delete
the listing and register again: the mod cannot be changed.

</details>

<details>
<summary>The name or region is wrong</summary>

Both come from your registration. Edit them on the server's page on
mafiahub.dev; the change shows on the next heartbeat, without restarting
anything.

</details>

<details>
<summary>Running in Docker or Pterodactyl</summary>

The server reads `server.json` from its data folder (`/home/container`), so
edit the file there and restart the container. Keep the key in the file
rather than in an image or an egg variable. See [Docker, Pterodactyl and
Fly.io](../hosting-a-server/containers/).

</details>

## Related

- [server.json settings](../hosting-a-server/server-json/), every key the server reads
- [How players connect](../hosting-a-server/players-connecting/), the browser, direct connect and ports
- [Run a dedicated server](../hosting-a-server/dedicated-server/)
