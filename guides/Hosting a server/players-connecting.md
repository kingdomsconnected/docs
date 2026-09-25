---
title: How players connect
description: How players install the client, find your server and connect, and which ports your network has to let through.
sidebar:
  order: 104
---

A player needs the game on Steam, the `client/` folder of a KCDC release, and
your server's address. This page is the part you send to your players, plus
the part that is your job: making the server reachable.

## What a player does

Kingdom Come: Deliverance II must be installed through Steam, and the Steam
client must be running: the launcher asks Steam where the game lives.

1. Unpack a release anywhere. Nothing is copied into the game folder, and no
   game file is modified.
2. Start Steam.
3. Run `client\KCDCLauncher.exe`.

The first run writes `KCDC_launcher.json` next to the launcher with the game
path it found. Delete that file to have the game detected again. The
launcher's logs go to `logs\` beside it. It needs the Microsoft Visual C++
2015-2022 x64 redistributable, which the game already installs.

:::caution[Unpack, do not copy]
A release launcher updates itself before starting the game, using the
channel stamped in `client\.mafiahub\channel`. Copying the binaries out of
the archive leaves that stamp behind, and the launcher cannot update.
:::

Keep the client and the server on the same KCDC version. The server does not
check, so a mismatch is not refused; it just misbehaves. A release launcher
updates itself, so the usual cause is a server left behind after an update.

## Finding the server

The game opens on the KCDC menu, which offers three ways in:

- **Server browser.** Lists the servers announced on the MafiaHub masterlist.
  Your server appears there only if it has a `server-token`; see
  [server.json](../server-json/#server-token).
- **Quick connect.** Joins `127.0.0.1:27015`, a server on the same machine.
  Handy while you develop.
- **Connect directly.** A host, a port and an optional password, remembered
  for next time. This is what your players use for a server that is not
  announced.

The nickname field on the same menu is the name other players see.

KCDC servers have no password setting yet, so leave the password empty.

## A link on the command line

The launcher also takes a server link and connects straight to it, skipping
the menu:

```sh title="In client/"
.\KCDCLauncher.exe "kcdc://play.example.com:27015?nickname=Hana"
```

The format is `kcdc://host[:port][?nickname=Name&password=Secret]`. The port
defaults to 27015 and the nickname to `Player`. Only the first menu visit
uses the link, so a disconnect returns to the menu rather than reconnecting.

The `kcdc://` scheme is not registered with Windows, so a web page or a chat
message cannot open it with a click. Put the command in a shortcut or a batch
file instead:

```bat title="join-my-server.bat"
@echo off
cd /d "%~dp0client"
KCDCLauncher.exe "kcdc://play.example.com?nickname=Hana"
```

## What happens on connect

1. The client connects and receives the server's replicated settings: the
   level and the required DLCs from [server.json](../server-json/).
2. If the server requires a DLC the player does not have installed, the
   client refuses before downloading anything, and the menu says which:

   ```text
   This server requires Legacy of the Forge, Mysteria Ecclesiae.
   ```

3. The client downloads the client half of every running resource, loads the
   level, and spawns. Your resources see `playerConnect`, then the spawn
   events; [Player join and leave events](../../server-scripting/players/lifecycle/) has the
   order.

A full server, ten players or your lower `maxplayers`, turns the next player
away.

## Making the server reachable

| Port | Protocol | Needed for |
| --- | --- | --- |
| 27015 | UDP | Joining and playing. Required |
| 27016 | TCP | The HTTP status endpoint. Open it too |

Use your own ports if you changed them in [server.json](../server-json/) or
on the command line.

- **At home, behind a router:** forward both ports to the machine running the
  server, and allow `KCDCServer.exe` through Windows Defender Firewall for
  both private and public networks. Players outside your network use your
  public IP address; you and anyone on your network use the machine's local
  address, since many routers do not loop the public address back inside.
- **On a rented server or VPS:** open both ports in the provider's firewall
  or security group as well as the operating system's (`ufw`, `firewalld`).
- **In a container:** publish both ports and open them on the host. See
  [Containers](../containers/#arguments-and-ports).

Forwarding TCP 27015 does nothing: the game session is UDP only, and a
forward for the wrong protocol is the most common reason nobody can join.

To check from outside your network, ask a friend to open
`http://your.public.address:27016/`. If they get a JSON page back, the TCP
forward works; if they then cannot join, look at the UDP forward.

<details>
<summary>A player cannot connect: a checklist</summary>

- Is Steam running on the player's machine?
- Are the player's KCDC and the server's KCDC the same version? Nothing
  refuses a mismatch, it just goes wrong later.
- Is the address right, and the port the game port (27015), not the HTTP one?
- Is UDP forwarded, not TCP?
- Does the player have every DLC in `mod.required_dlc`, installed and not just
  owned?
- Is the server full?

</details>
