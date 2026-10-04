---
title: Let players connect
description: Send players a short checklist to join your server, and make the server reachable through routers and firewalls.
sidebar:
  label: Let players connect
  order: 103
---

A player needs Kingdom Come: Deliverance II (Steam, GOG or any other copy),
the `client/` folder of a KCDC release, and your server's address. The first part of this page is
the checklist to send them; the second is your side: making the server
reachable.

## For players

1. **Install.** Unpack a KCDC release anywhere. Nothing goes into the game
   folder and no game file is modified.
2. **Start Steam**, if the game is on Steam. The launcher asks Steam where
   the game is. For any other copy, or when Steam cannot answer, it asks for
   `Bin\Win64MasterMasterSteamPGO\KingdomCome.exe` under the game folder
   the first time instead.
3. **Launch.** Run `client\KCDCLauncher.exe`.
4. **Connect.** On the KCDC menu, set your nickname, then pick a server:
   - **Server browser**: servers listed on the masterlist. A padlock marks
     one that asks for a password, typed in before joining.
   - **Connect directly**: host, port (usually 27015) and password. Leave the
     password empty unless the host gave you one.
   - **Quick connect**: `127.0.0.1:27015`, a server on the same machine.

Use the same KCDC version as the server. Nothing refuses a mismatch; it just
misbehaves. The launcher updates itself, so the usual culprit is a server
left behind after an update.

:::caution[Unpack, do not copy]
The launcher updates itself using the channel stamped in
`client\.mafiahub\channel`. Copying the binaries out of the archive leaves
that stamp behind, and the launcher cannot update.
:::

The launcher remembers the game it found or was given in
`KCDC_launcher.json` next to it. If the game moved, or the wrong copy was
picked, delete that file to choose again. Launcher logs are in `logs\` beside it. It needs the
Microsoft Visual C++ 2015-2022 x64 redistributable, which the game installs.

### Join with a link

The launcher accepts a server link and skips the menu:

```sh title="In client/"
.\KCDCLauncher.exe "kcdc://play.example.com:27015?nickname=Hana"
```

The format is `kcdc://host[:port][?nickname=Name&password=Secret]`; the port
defaults to 27015 and the nickname to `Player`. Only the first menu visit
uses it, so a disconnect returns to the menu.

Windows does not register `kcdc://`, so a clicked link does nothing. Give
players a batch file next to `client/` instead:

```bat title="join-my-server.bat"
@echo off
cd /d "%~dp0client"
KCDCLauncher.exe "kcdc://play.example.com?nickname=Hana"
```

### What happens on connect

1. The client receives the level and required DLCs from
   [server.json](../server-json/).
2. A player missing a required DLC is refused before any download:
   `This server requires Legacy of the Forge, Mysteria Ecclesiae.`
3. The client downloads every running resource's client half and the
   [custom assets](../../core-concepts/custom-assets/) it ships, loads the
   level and spawns. A first download larger than the player allows in the
   game's **Game** settings (**Ask before server downloads**, 500 MB by
   default) waits on the joining screen for them to choose Download or
   Leave. Your scripts see `playerConnect`, then the spawn events
   ([Join, spawn and respawn](../../players/join-and-spawn/)).

The game's own loading screen stays up through all of this and lifts once
the player is in. A server that admits the player but then stops answering
for 10 seconds at any step is given up on, and the player is back in the main
menu with the reason. The usual cause is a client and server on different
KCDC versions.

A full server (512 players, or your lower `maxplayers`) turns the next player
away.

## Make your server reachable

Players need the game port (UDP) and should reach the HTTP port (TCP); the
numbers are in [Ports](../run-a-server/#ports). Forwarding TCP for the game
port does nothing, and a forward for the wrong protocol is the most common
reason nobody can join.

- **At home, behind a router:** forward both ports to the server machine and
  allow `KCDCServer.exe` through Windows Defender Firewall on private and
  public networks. Outside players use your public IP; you and your LAN use
  the machine's local address, since many routers do not loop the public
  one back.
- **On a VPS or rented server:** open both ports in the provider's firewall
  or security group and in the OS firewall (`ufw`, `firewalld`).
- **In a container:** publish both ports and open them on the host
  ([Docker and panels](../containers/#change-the-ports)).

To test from outside, have a friend open `http://your.public.address:27016/`.
A JSON page means the TCP forward works; if they still cannot join, check the
UDP forward.

### A player cannot connect

- With a Steam copy, is Steam running on the player's machine?
- Do the player and the server run the same KCDC version? A mismatch often shows as a
  join that hangs on the loading screen for 10 seconds, then fails.
- Is the address right, and the port the game port, not the HTTP one?
- Is the game port forwarded as UDP, not TCP?
- Does the player have every DLC in `mod.required_dlc` installed?
- Is the server full?

## Related

- [Run a dedicated server](../run-a-server/): ports and the status endpoint.
- [Server browser listing](../server-browser/): appear in the in-game browser.
- [server.json settings](../server-json/): level, slots and required DLCs.
- [Docker and panels](../containers/): hosting in a container.
