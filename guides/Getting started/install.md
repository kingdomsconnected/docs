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
| Kingdom Come: Deliverance II on Steam | The client runs inside the game, and Steam tells the launcher where it is | Join a server |
| A KCDC release | The launcher, the client and the dedicated server for Windows and Linux | Run anything |
| Node.js 22 or newer | Runs the TypeScript compiler | Build the default gamemode or any TypeScript resource |
| pnpm 10 | Installs the gamemode's pinned compiler | Same |
| An editor | [Visual Studio Code](https://code.visualstudio.com/) autocompletes the API once you have the declarations | Writing code |

:::note
The server does **not** need Node.js to run: it carries its own JavaScript runtime. Node only compiles
TypeScript, so you can build on your own machine and upload the result.
:::

## 1. Get a release

A release is one archive. Unpack it anywhere, not inside the game folder (nothing is ever copied there):

```text
KCDC-1.3.4/
  client/            KCDCLauncher.exe and the mod itself
  server/            KCDCServer.exe for Windows, with its own resources/
  server-linux/      KCDCServer for Linux, with its own resources/
  resources/         the default gamemode on its own, to edit or upload
  README.txt
```

Each server folder reads resources from the `resources/` folder next to its binary. The top-level
`resources/` is a spare copy for hosting elsewhere; the guides use the one inside `server/`.

:::caution
Unpack the archive instead of copying files out of it. The launcher updates itself from the channel
stamped in `client/.mafiahub/channel`, and a hand-copied install has no stamp.
:::

## 2. Install Node.js and pnpm

1. Install [Node.js 22 or newer](https://nodejs.org/). The LTS installer is fine.
2. Turn on Corepack, which ships with Node and manages pnpm. On Windows, use an Administrator terminal
   if it complains about permissions.

   ```sh title="Any terminal"
   corepack enable
   corepack prepare pnpm@10.4.1 --activate
   ```

3. Check both: `node --version` should print `v22` or later, `pnpm --version` should print `10.4.1`.

## 3. Fetch the declarations

The gamemode is type-checked against the API's declarations, which a release does not include. Its
`tsconfig.json` expects them in a `scripting-api/` folder next to the server binary.

1. Save this script as `fetch-declarations.mjs` in your release's `server/` folder, next to
   `KCDCServer.exe`:

   <!-- check: skip -->
   ```js title="server/fetch-declarations.mjs"
   // Downloads the scripting declarations the default gamemode compiles against.
   // Run it from the server folder: node fetch-declarations.mjs [stable|testing]
   import { mkdir, writeFile } from "node:fs/promises";

   const api = "https://api.mafiahub.dev/documentation-contracts/kcdc";
   const channel = process.argv[2] ?? "stable";

   const response = await fetch(`${api}/${channel}/manifest.json`);
   if (!response.ok) throw new Error(`No '${channel}' channel (HTTP ${response.status})`);
   const manifest = await response.json();

   const files = {
     "targets/shared.d.ts": "scripting-api/shared.d.ts",
     "targets/server/api.d.ts": "scripting-api/generated/server-api.d.ts",
     "targets/client/api.d.ts": "scripting-api/generated/client-api.d.ts",
   };

   await mkdir("scripting-api/generated", { recursive: true });
   for (const [from, to] of Object.entries(files)) {
     const file = await fetch(`${api}/releases/${manifest.revision}/files/${from}`);
     if (!file.ok) throw new Error(`Could not download ${from} (HTTP ${file.status})`);
     await writeFile(to, await file.text());
   }

   console.log(`Declarations for KCDC ${manifest.version} (${channel}) are in scripting-api/.`);
   ```

2. Run it from that folder:

   ```sh title="In server/"
   node fetch-declarations.mjs
   ```

   ```text
   Declarations for KCDC 1.3.4 (stable) are in scripting-api/.
   ```

:::caution[Match the versions]
The printed version should match your release folder's name (`KCDC-1.3.4`). For a prerelease, fetch
the `testing` channel: `node fetch-declarations.mjs testing`. Run the script again whenever you update
the server.
:::

Your server folder now looks like this:

```text
server/
  KCDCServer.exe
  fetch-declarations.mjs
  scripting-api/
    shared.d.ts
    generated/
      server-api.d.ts
      client-api.d.ts
  resources/
    kcdc-gamemode/
      package.json
      tsconfig.json
      src/
      ui/
```

## 4. Build the gamemode

A release ships the gamemode as TypeScript source. Until you build it, the server starts but answers no
commands.

```sh title="In server/resources/kcdc-gamemode/"
pnpm install
pnpm run build
```

`pnpm install` fetches the pinned compiler. `pnpm run build` compiles the server and client halves as
two programs and prints nothing on success. You now have `dist/server/index.js` (what the server runs)
and `dist/client/index.js` (what every player's game runs). [Use TypeScript](../typescript/) explains
the setup.

The `mafiahub` block in `package.json` tells the server which files to run and send to players; see
[Resource manifest and lifecycle](../../core-concepts/resources/).

## 5. Start the server

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

## 6. Join it

1. Start Steam.
2. Run `client/KCDCLauncher.exe`. The game starts with the multiplayer menu.
3. Choose **Quick connect**. It connects to `127.0.0.1` on port 27015, where your server listens.

The game loads the level named in `server.json`, and the gamemode greets you in chat.

:::tip[Skip the menu]
Pass a server link to the launcher to connect straight away. Handy for two clients on one machine,
each with its own nickname:

```sh title="In client/"
.\KCDCLauncher.exe "kcdc://127.0.0.1?nickname=Tester"
```
:::

## 7. Try some commands

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

## 8. Change something and reload

1. Keep the compiler watching the half you edit:

   ```sh title="In server/resources/kcdc-gamemode/"
   pnpm run watch          # server half
   pnpm run watch:client   # client half, in a second terminal
   ```

2. Edit `src/server/index.ts`, for example the welcome line in the `playerSpawned` handler.
3. In the **server console** (the server's window, not game chat), reload the resource:

   ```sh title="Server console"
   ensure kcdc-gamemode
   ```

   `ensure` reloads a running resource from disk and pushes new client files to everyone connected.
   Reconnect to see the new welcome.

This loop works for every resource. [Console commands](../../hosting-a-server/run-a-server/#console-commands)
lists the others, such as `stop`, `start` and `refresh`.

## Troubleshooting

<details>
<summary><code>error TS2304: Cannot find name 'Player'</code> (and hundreds like it)</summary>

The compiler cannot find the declarations. Check that `server/scripting-api/generated/server-api.d.ts`
exists (from the gamemode: `../../scripting-api/generated/server-api.d.ts`). Run step 3 from the
`server/` folder, not the gamemode folder.

</details>

<details>
<summary>The build fails on a few specific methods</summary>

Your declarations and your release are different versions. Fetch the matching channel (`stable` or
`testing`) and build again.

</details>

<details>
<summary>The server starts, but commands do nothing</summary>

With no compiled gamemode, nothing listens for commands, so `/help` is silently ignored. Check that
`resources/kcdc-gamemode/dist/server/index.js` exists, and look in the server log for a
`kcdc-gamemode` line near startup: a missing file or a script error is reported there.

</details>

<details>
<summary><code>pnpm: command not found</code></summary>

Corepack is not enabled in this terminal. Run `corepack enable` again, then open a new terminal.

</details>

<details>
<summary>The launcher cannot find the game</summary>

Start Steam before the launcher, which asks Steam where the game is installed. If the game moved,
delete `KCDC_launcher.json` next to the launcher and it will look again.

</details>

## Related

- [Write your first resource](../first-resource/): the next step, a resource of your own next to the gamemode.
- [Let players connect](../../hosting-a-server/players-connecting/): the server browser and remote hosts.
- [Run a dedicated server](../../hosting-a-server/run-a-server/): arguments, ports and console commands.
- [server.json settings](../../hosting-a-server/server-json/): every setting the first start wrote.
