---
title: Run the default gamemode
description: Compile the default gamemode from a release, start a local server and join it.
sidebar:
  order: 11
---

A release ships the default gamemode as TypeScript source, not as compiled
JavaScript, so that you can read it and change it. Until you compile it, the
server starts fine but answers no commands at all. This page takes you from a
freshly unpacked release to a server you are standing in.

It takes about ten minutes the first time. You need Node.js and pnpm from
[Install the tools](../installation/).

## 1. Get the declarations

The gamemode is type-checked against the scripting API's declarations: the
files that tell the compiler `Player` has a `teleport` method. Its
`tsconfig.json` expects them two folders up, in a `scripting-api/` folder next
to the server binary. A release does not include them, so download them once.

1. Save this script as `fetch-declarations.mjs` inside the `server/` folder of
   your release (next to `KCDCServer.exe`):

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
The version it prints should match the version in your release folder's name
(`KCDC-1.3.4`). If you are running a prerelease, fetch the `testing` channel
instead: `node fetch-declarations.mjs testing`. Declarations from another
version will make the compiler complain about methods that do or do not exist.
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

## 2. Compile the gamemode

1. Install the gamemode's compiler. It is pinned in its lockfile, so everyone
   builds with the same version:

   ```sh title="In server/resources/kcdc-gamemode/"
   pnpm install
   ```

2. Compile both halves:

   ```sh title="In server/resources/kcdc-gamemode/"
   pnpm run build
   ```

   No output means success. You now have a `dist/` folder:

   ```text
   dist/
     server/index.js        what the server runs
     server/commands/*.js
     client/index.js        what every player's game runs
     client/*.js
   ```

`pnpm run build` runs the TypeScript compiler twice, once per half. The two
halves are separate programs because the server's `Player` and the client's
`Player` are different classes: only the server's can kick or teleport
someone. [Use TypeScript](../typescript/) explains the setup, which is the
one to copy for your own resources.

<details>
<summary>What does the manifest tell the server?</summary>

Open `package.json`. The `mafiahub` block is what makes a folder a resource:

```json
{
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"],
    "clientScripts": ["dist/client/index.js"],
    "files": ["dist/client/**", "ui/**"],
    "priority": 10
  }
}
```

`serverScripts` run on the server and are never sent anywhere.
`clientScripts` are downloaded by every player and run in their game. `files`
are also downloaded but not run: here, the rest of the compiled client code
and the debug panel's web page. [Resource manifest and lifecycle](../../core-concepts/resources/) lists every field.

</details>

## 3. Start the server

From the `server/` folder:

```sh title="Windows"
.\KCDCServer.exe
```

```sh title="Linux (from server-linux/)"
./KCDCServer
```

The first start writes a `server.json` with every setting and its default.
Watch the log for the gamemode's two lines:

```text
[kcdc-gamemode] debug panel answering; clients open it with F4 or /ui
[kcdc-gamemode] ready with 20 commands
```

(The count grows as the gamemode gains commands; any number is fine.)

If they are missing, the gamemode did not load. See the troubleshooting list
at the bottom of the page.

:::note
The server listens on UDP port 27015 for players and TCP port 27016 for its
HTTP endpoints. For a server on your own machine you do not need to open
anything. [How players connect](../../hosting-a-server/players-connecting/) covers the
rest.
:::

## 4. Join it

1. Start Steam.
2. Run `client/KCDCLauncher.exe`. The game starts with the multiplayer menu.
3. Choose **Quick connect**. It connects to `127.0.0.1` on port 27015, which
   is exactly where your local server is listening.

The game loads the level the server names in `server.json` and puts you in
the world, and the gamemode greets you in chat.

:::tip[Skip the menu]
The launcher also takes a server link on its command line and connects
straight away:

```sh title="In client/"
.\KCDCLauncher.exe "kcdc://127.0.0.1?nickname=Tester"
```

Handy for testing with two clients on one machine, each with its own
nickname. [How players connect](../../hosting-a-server/players-connecting/) covers the
server browser and connecting to a remote host.
:::

## 5. Try it

Open chat with **T** and try a few of the gamemode's commands:

| Type | What happens |
| --- | --- |
| `/help` | Lists every command the gamemode registers |
| `/horse` | Spawns a horse in front of you |
| `/world hour 21` | Moves the shared clock to nine in the evening, for everyone |
| `/dialogue` | Opens a sample conversation in the game's own dialogue list |
| `/quest give errand "Deliver the letter"` | Writes a quest into your journal, for everyone on the server |

Press **F4** for the debug panel: your character's live stats, the world
clock, who is connected, and a box to type commands into. **Esc** hands the
keyboard back to the game while the panel stays open.

## 6. Change something

The fastest loop keeps the compiler running and reloads the resource without
restarting the server.

1. In one terminal, leave the compiler watching the server half:

   ```sh title="In server/resources/kcdc-gamemode/"
   pnpm run watch
   ```

   Use `pnpm run watch:client` in a second terminal if you are changing the
   client half.

2. Edit `src/server/index.ts`. For example, change the welcome line in the
   `playerSpawned` handler.

3. Type this into the **server console** (the window the server runs in, not
   the game chat):

   ```sh title="Server console"
   ensure kcdc-gamemode
   ```

   `ensure` reloads a running resource from disk, and pushes the new client
   files to everyone connected. Reconnect, or wait for the next player, to see
   the new welcome.

:::tip
Every resource is loaded the same way, so this loop works for your own
resources too. [Server console commands](../../hosting-a-server/console/) lists the other
verbs, such as `stop`, `start` and `refresh`.
:::

## Troubleshooting

<details>
<summary><code>error TS2304: Cannot find name 'Player'</code> (and hundreds like it)</summary>

The compiler cannot find the declarations. Check that
`server/scripting-api/generated/server-api.d.ts` exists, relative to the
gamemode at `../../scripting-api/generated/server-api.d.ts`. Run step 1 again
from the `server/` folder, not from the gamemode folder.

</details>

<details>
<summary>The build fails on a few specific methods</summary>

Your declarations and your release are different versions. Fetch the channel
that matches your release (`stable` or `testing`), then build again.

</details>

<details>
<summary>The server starts, but commands do nothing</summary>

With no compiled gamemode, the server has nothing listening for commands, so
`/help` is silently ignored. Check that
`resources/kcdc-gamemode/dist/server/index.js` exists, and read the server log
for a line mentioning `kcdc-gamemode` near startup: a missing file or a script
error is reported there.

</details>

<details>
<summary><code>pnpm: command not found</code></summary>

Corepack is not enabled in this terminal. Run `corepack enable` again, then
open a new terminal.

</details>

<details>
<summary>The launcher cannot find the game</summary>

Steam must be running before you start the launcher, because the launcher
asks Steam where the game is installed. If the game moved, delete
`KCDC_launcher.json` next to the launcher and it will look again.

</details>

## Next

[Write your first resource](../first-resource/): write a small resource of your own,
next to the gamemode.
