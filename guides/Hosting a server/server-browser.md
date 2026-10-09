---
title: List your server in the server browser
description: Register your server on MafiaHub, put its push key in server.json, and appear in the in-game server browser with your logo.
sidebar:
  label: Server browser listing
  order: 104
---

The in-game **Server browser** shows the KCDC servers announced on the
MafiaHub masterlist. Servers are unlisted by default: players can join by
address, but nobody finds them by browsing. Listing takes one registration
and one line in `server.json`.

The masterlist only advertises your address; it does not make it reachable.
Make sure players can already join by address
([Let players connect](../players-connecting/)).

## How the listing works

```text
your server ──(every 5 s: players, version, port)──> masterlist.mafiahub.dev
                                                            │
in-game Server browser <──(list of live KCDC servers)───────┘
```

- The server sends a heartbeat every 5 seconds with its player count,
  version and game port, signed with your **push key**.
- The **name**, **address**, **region** and **logo** come from your
  MafiaHub registration, not from the server. Edit them there; changes show
  on the next heartbeat.
- A listing disappears about two minutes after the last heartbeat, so a
  stopped or crashed server drops out by itself.

## What players see

The browser fetches the list when it opens and again every 15 seconds while
it stays open; **Refresh** fetches it at once. Busy servers sort first, then
by name.

| On a row | Comes from |
| --- | --- |
| Logo | The logo URL in your registration. Only an `http` or `https` image is shown. With none, or when the image fails to load, the row shows the server name's first letter |
| Name, region and address | Your registration |
| Players | The heartbeat: player count and your `maxplayers`. A full server shows **Full** and cannot be joined |
| Version | The heartbeat: the KCDC version your server runs |
| Padlock | A [`password`](../server-json/#password) in `server.json`. Selecting the server puts the cursor in a password field, and **Join realm** stays disabled until the player types the password |

## Version confirmation

When the browser knows the server's version and it differs from yours,
**Different versions** shows both versions and the address. **Cancel**
returns to the menu; **Join anyway** attempts the connection. It does not
make incompatible builds work. Use matching client and server versions.

Quick connect uses the warning only when the current server list has one
unambiguous version for that address and port. An unknown version is not
proof of compatibility.

## If the public list is unavailable

A failed request shows an error with **Retry** and **Quick connect**.
Previously loaded rows remain available as cached listings. That is different
from a successful request returning no servers.

Retry the list, or enter a known server address and game port in **Quick
connect**. Direct connection bypasses the directory; the server itself must
still be reachable. The error can include an HTTP status to help identify
a temporary master server outage or blocked access.

## 1. Register the server

1. Sign in at [mafiahub.dev](https://mafiahub.dev/dashboard/servers), open
   **Servers**, and [create a new one](https://mafiahub.dev/dashboard/servers/new).
2. Choose **Kingdoms Connected** (KCDC) as the mod. It decides which game's
   browser lists you and cannot be changed later.
3. Fill in the details:

   | Field | What to enter |
   | --- | --- |
   | Server name | Shown in the browser, up to 50 characters |
   | IP address | Your **public** IP. Not `0.0.0.0`, `127.0.0.1` or a LAN address |
   | Port | The game port, `27015` unless you changed it |
   | Location | The machine's region |
   | Logo URL | Optional. An `http` or `https` link to an image, shown on your row |

4. Save, and copy the **push key** from the server's page.

:::danger[The push key is a password]
Anyone holding it can publish heartbeats for your listing. Keep it out of
screenshots, public repositories, container images and shared Pterodactyl
eggs. If it leaks, delete the listing and register a new one.
:::

## 2. Add the key to server.json

Set `server-token` in `server.json` and leave every other key alone:

```json title="server.json" ins={7}
{
  "host": "0.0.0.0",
  "port": 27015,
  "apihost": "0.0.0.0",
  "apiport": 27016,
  "maxplayers": 512,
  "server-token": "paste-your-push-key-here",
  "mod": {
    "level": "kutnohorsko",
    "required_dlc": []
  }
}
```

:::caution[Do not paste the dashboard's whole file]
The dashboard's ready-made `server.json` is generic: it has
`"maxplayers": 64` and no `mod` block, so it would cap your slots and reset
your level and DLC settings. Copy only the `server-token` line.
:::

`--server-token <key>` (or `-t`) works for one run, but a command line is
visible to anyone who can list processes, so prefer the file. In Docker or
Pterodactyl the file is in `/home/container`
([Docker and panels](../containers/)).

## 3. Restart and check

Restart the server. With no key, the log says at startup:

```text
Server will not be announced to masterlist
```

No such line means heartbeats are going out. A rejected key logs this every
5 seconds instead:

```text
Failed to ping masterlist server: 401 {"error":"Invalid API key"}
```

See your listing as the game sees it:

```sh title="Any terminal"
curl https://masterlist.mafiahub.dev/servers
```

Your server should appear with `"gamemode": "KCDC"` within seconds. Then
refresh **Server browser** in the game.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `401 Invalid API key` | Copy the key again, checking for missing characters or spaces inside the quotes. A deleted or disabled listing also rejects its old key |
| In `/servers` but not in the game | You registered under another mod. Delete the listing and register again as KCDC |
| Listed, but joining fails | The registered IP must be the public one, and the game port must be forwarded as UDP ([Let players connect](../players-connecting/#make-your-server-reachable)) |
| Wrong name or region | Edit the registration on mafiahub.dev; no restart needed |
| No logo, only a letter | The logo URL is empty, not `http` or `https`, or the image does not load. Open the URL in a browser to check it |

## Realm details and host links

Selecting a server opens its details beside the list: logo, name, region,
address, player count and version. The password field and **Join realm**
button are in that panel. Selection alone does not connect.

Publish your Discord invite and website through the MafiaHub dashboard's server
metadata (`discord_invite_url` and `website_url` ). The browser shows links supplied
by the listing. Valid HTTP or HTTPS links open in the player's web browser while the
game menu stays open. Configure these fields in the listing metadata; `server.json`
does not provide them.

## Related

- [server.json settings](../server-json/): every key the server reads.
- [Let players connect](../players-connecting/): direct connect and port forwarding.
- [Run a dedicated server](../run-a-server/): ports and command-line arguments.
