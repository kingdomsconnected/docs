---
title: Install and run a server
description: Go from nothing to standing in your own local server running the default gamemode, then change it and reload.
sidebar:
  label: Install and run a server
  order: 10
---

This page takes you from an empty machine to a local server running the **default gamemode**, with you
standing in it. It takes about ten minutes the first time.

## What you need

| What | Why | Needed to |
| --- | --- | --- |
| Kingdom Come: Deliverance II | The client runs inside the game. A Steam, GOG or any other copy works | Join a server |
| A KCDC release | The launcher, the client and the dedicated server for Windows and Linux | Run anything |
| Node.js 22 or newer, with npm | Installs dependencies and runs the TypeScript compiler | Build the default gamemode or any TypeScript resource |
| An editor | [Visual Studio Code](https://code.visualstudio.com/) autocompletes the whole API in a TypeScript resource | Writing code |

:::note
The server does **not** need Node.js to run: it carries its own JavaScript runtime. Node only compiles
TypeScript, so you can build on your own machine and upload the result.
:::

## 1. Get a release

A release is one archive. Unpack it anywhere, not inside the game folder (nothing is ever copied there):

```text
KCDC/
  client/            KCDCLauncher.exe and the mod itself
  server/            KCDCServer.exe for Windows, with its own resources/
  server-linux/      KCDCServer for Linux, with its own resources/
  resources/         the default gamemode on its own, to edit or upload
  README.txt
```

Each server folder reads resources from the `resources/` folder next to its binary. The top-level
`resources/` is a spare copy for hosting elsewhere; the guides use the one inside `server/`.

:::caution
Unpack the complete archive so the launcher has its dependencies. In **1.6.6**,
it resolves updates from the installed build through the update service;
the archive's channel file is only an initial hint for a fresh installation.
:::

## 2. Install Node.js and npm

1. Install [Node.js 22 or newer](https://nodejs.org/). The LTS installer is fine.
2. Open a new terminal. `node --version` should print `v22` or later, and
   `npm --version` should print a version number.

The **1.6.6** default game mode and optional playground use npm and include a
`package-lock.json`. They do not require pnpm or Corepack. Your own resources
can use the package manager you prefer.

## 3. Build the gamemode

A release ships the gamemode as TypeScript source. Until you build it, the server starts but answers no
commands.

```sh title="In server/resources/kcdc-gamemode/"
npm ci
npm run build
```

`npm ci` installs the locked compiler and API declarations,
[`@kingdomsconnected/types`](https://www.npmjs.com/package/@kingdomsconnected/types) at your release's
version. `npm run build` compiles the server and client halves as two programs.
You now have `dist/server/index.js` (what the server runs)
and `dist/client/index.js` (what every player's game runs). [Use TypeScript](../typescript/) explains
the setup.

The `mafiahub` block in `package.json` tells the server which files to run and send to players; see
[Resource manifest and lifecycle](../../core-concepts/resources/).

## 4. Start the server

From the `server/` folder:

```sh title="Windows"
.\KCDCServer.exe
```

```sh title="Linux (from server-linux/)"
./KCDCServer
```

The first start writes a `server.json` with every setting and its default. Look for the gamemode's two
lines in the log (the command count varies):

```text
[kcdc-gamemode] debug panel answering; clients open it with F4 or /ui
[kcdc-gamemode] ready with 20 commands
```

The server uses UDP 27015 and TCP 27016; a server on your own machine needs nothing opened. See
[Ports](../../hosting-a-server/run-a-server/#ports).

## 5. Join it

1. If your copy of the game is on Steam, start Steam.
2. Run `client/KCDCLauncher.exe`. The game starts with the multiplayer menu.
3. Choose **Quick connect**. It connects to `127.0.0.1` on port 27015, where your server listens.

The launcher finds the game on its own the first time:

| Your copy | What the launcher does |
| --- | --- |
| Steam, with Steam running | Asks Steam where the game is installed. Nothing to pick |
| Microsoft Store / Xbox app (PC Game Pass) | Detects the installed package after trying Steam |
| GOG or a copy not detected automatically | Opens a file dialog. Pick GOG's `Bin\Win64MasterMasterGogPGO\KingdomCome.exe` or Steam's `Bin\Win64MasterMasterSteamPGO\KingdomCome.exe` |

The launcher saves the game path in `client/KCDC_launcher.json`, so later launches use
the same copy. A manually selected executable takes precedence over automatic store
detection. Delete that file to choose again. The launcher also registers `kcdc://`
links for the current Windows user on startup.

The game loads the level named in `server.json`, and the gamemode greets you in chat.

:::tip[Skip the menu]
Pass a server link to the launcher to connect straight away. Handy for two clients on one machine,
each with its own nickname:

```sh title="In client/"
.\KCDCLauncher.exe "kcdc://127.0.0.1?nickname=Tester"
```
:::

## 6. Try some commands

Open chat with **T**:

| Type | What happens |
| --- | --- |
| `/help` | Lists every command the gamemode registers |
| `/horse` | Spawns a horse in front of you |
| `/world hour 21` | Moves the shared clock to nine in the evening, for everyone |
| `/dialogue` | Opens a sample conversation in the game's dialogue list |
| `/quest give errand "Deliver the letter"` | Writes a quest into everyone's journal |

Press **F4** for the debug panel: live stats, the world clock, who is connected and a command box.
**Esc** hands the keyboard back to the game while the panel stays open.

## 7. Change something and reload

1. Keep both compilers watching your changes:

   ```sh title="In server/resources/kcdc-gamemode/"
   npm run dev
   ```

2. Edit `src/server/index.ts`, for example the welcome line in the `playerSpawned` handler.
3. In the **server console** (the server's window, not game chat), reload the resource:

   ```sh title="Server console"
   ensure kcdc-gamemode
   ```

   `ensure` reloads a running resource from disk and pushes new client files to everyone connected.
   Reconnect to see the new welcome.

`npm run dev` watches both halves in one terminal. It recompiles files but
does not reload the running resource; use `ensure` after a successful compile.
Press **Ctrl+C** to stop both watchers. Use `npm test` to build both halves
and run the game mode's automated tests. The separate `npm run watch` and
`npm run watch:client` commands remain available.

Compilation followed by `ensure` works for your own resources too.
[Console commands](../../hosting-a-server/run-a-server/#console-commands)
lists the others, such as `stop`, `start` and `refresh`.

## Troubleshooting

<details>
<summary><code>error TS2304: Cannot find name 'Player'</code> (and hundreds like it)</summary>

The compiler cannot find the declarations. Run `npm ci` in the game mode
folder first, then build again.

</details>

<details>
<summary>The build fails on a few specific methods</summary>

Your declarations and your release are different versions. Check that `@kingdomsconnected/types` in
the game mode's `package.json` is your release's version. Use the matching
release's package files and run `npm ci` again. If you deliberately edit
dependencies, run `npm install` to update the lockfile before building.

</details>

<details>
<summary>The server starts, but commands do nothing</summary>

With no compiled gamemode, nothing listens for commands, so `/help` is silently ignored. Check that
`resources/kcdc-gamemode/dist/server/index.js` exists, and look in the server log for a
`kcdc-gamemode` line near startup: a missing file or a script error is reported there.

</details>

<details>
<summary><code>npm: command not found</code></summary>

Install Node.js with npm selected, then open a new terminal so its updated
PATH is available.

</details>

<details>
<summary>The launcher cannot find the game</summary>

With a Steam copy, start Steam before the launcher, which asks Steam where the game is installed.
The launcher next tries the installed Microsoft Store / Xbox app
package. If it still asks, pick `KingdomCome.exe` in the dialog: Steam uses
`Bin\Win64MasterMasterSteamPGO\` and GOG uses `Bin\Win64MasterMasterGogPGO\`
under the game folder. Cancelling the dialog closes the launcher.

If the game moved, or you picked the wrong copy, delete `KCDC_launcher.json` next to the launcher and
it will ask again.

</details>

## Related

- [Write your first resource](../first-resource/): the next step, a resource of your own next to the gamemode.
- [Let players connect](../../hosting-a-server/players-connecting/): the server browser and remote hosts.
- [Run a dedicated server](../../hosting-a-server/run-a-server/): arguments, ports and console commands.
- [server.json settings](../../hosting-a-server/server-json/): every setting the first start wrote.
