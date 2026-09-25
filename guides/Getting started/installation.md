---
title: Install the tools
description: The game, a KCDC release, Node.js and pnpm, and what each one is for.
sidebar:
  order: 10
---

You need four things to write and test resources. Only the first two are
needed to *play*; the other two are for compiling the default gamemode and
your own TypeScript.

| What | Why | Needed to |
| --- | --- | --- |
| Kingdom Come: Deliverance II on Steam | The client runs inside the game, and Steam tells the launcher where it is installed | Join a server |
| A KCDC release | The launcher, the client and the dedicated server for Windows and Linux | Run anything |
| Node.js 22 or newer | Runs the TypeScript compiler | Build the default gamemode, or any TypeScript resource |
| pnpm 10 | Installs the gamemode's pinned compiler | Same |

:::note
The server does **not** need Node.js to run. It carries its own JavaScript
runtime. Node is only there to turn TypeScript into the JavaScript the server
loads, so you can do that on your own machine and upload the result.
:::

## Get a release

A release is one archive. Unpack it anywhere (not inside the game folder,
nothing is ever copied there):

```text
KCDC-1.3.4/
  client/            KCDCLauncher.exe and the mod itself
  server/            KCDCServer.exe for Windows, with its own resources/
  server-linux/      KCDCServer for Linux, with its own resources/
  resources/         the default gamemode on its own, to edit or upload
  README.txt
```

Each server folder reads resources from the `resources/` folder next to its
binary. The top-level `resources/` is a spare copy for when you host
somewhere else; the guides use the one inside `server/`.

:::caution
Unpack the archive instead of copying files out of it. The launcher updates
itself from the channel stamped in `client/.mafiahub/channel`, and a
hand-copied install has no stamp.
:::

## Install Node.js and pnpm

1. Install [Node.js 22 or newer](https://nodejs.org/). The LTS installer is
   fine.

2. Turn on Corepack, which ships with Node and manages pnpm for you:

   ```sh title="Any terminal"
   corepack enable
   corepack prepare pnpm@10.4.1 --activate
   ```

   On Windows, run the first command from a terminal opened as Administrator
   if it complains about permissions.

3. Check both are on your path:

   ```sh
   node --version
   pnpm --version
   ```

   You should see `v22` (or later) and `10.4.1`.

## An editor

Any editor works. [Visual Studio Code](https://code.visualstudio.com/) is a
good default because it understands TypeScript out of the box: once your
resource has the declarations (see [Use TypeScript](../typescript/)), it
autocompletes every global, method and event name and underlines calls the
runtime does not have.

## Next

[Run the default gamemode](../run-the-gamemode/): build it, start a server and
join it.
