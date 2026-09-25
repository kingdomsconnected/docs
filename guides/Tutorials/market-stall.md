---
title: Build an NPC shop
description: An NPC shopkeeper who talks first and trades second, combining npcInteract, a dialogue and a vendor with a purse that can run dry.
sidebar:
  order: 92
---

NPCs, conversations and shops are three separate APIs in Kingdoms Connected, and none of them knows about the others. A [`Vendor`](../../reference/server/variables/Vendor.md) is a price list and a purse. A [`Dialogue`](../../reference/server/variables/Dialogue.md) runs on a player, not on an NPC. What makes them a stall is the glue you write.

You will build `/stall`, which puts a grocer in front of you. Press use on him and he greets you. From the conversation you can open his trade screen or ask whether he is buying. He starts with 400 coins, pays for what you sell out of them, and says so when he runs low.

The default gamemode has both halves separately, in `src/server/commands/vendor.ts` and `src/server/commands/dialogue.ts`. This tutorial joins them.

```text
market-stall/
  package.json
  tsconfig.json
  types/runtime.d.ts
  src/server/
    index.ts
    place.ts
    wares.ts
    stall.ts
    talk.ts
```

`tsconfig.json` and `types/runtime.d.ts` are the ones from [Use TypeScript](../../getting-started/typescript/). It is all server code.

## 1. The manifest

```json title="package.json"
{
  "name": "market-stall",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc -p tsconfig.json"
  },
  "devDependencies": {
    "typescript": "^5.9.2"
  },
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"]
  }
}
```

## 2. Where the stall goes

The stall is put a couple of metres in front of whoever typed the command, with the keeper turned to face them. The world is Z up and an unrotated entity faces +Y; [Positions, rotations and vectors](../../core-concepts/math/) explains the maths.

```ts title="src/server/place.ts"
/** `distance` metres ahead of the player on the ground, turned back to face them. */
export function inFrontOf(player: Player, distance: number): { position: Vector3; rotation: Quaternion } {
  const facing = (player.rotation as Quaternion).rotateVector(new Vector3(0, 1, 0));
  const length = Math.hypot(facing.x, facing.y);
  const aheadX = length < 1e-4 ? 0 : facing.x / length;
  const aheadY = length < 1e-4 ? 1 : facing.y / length;
  const from = player.position;
  return {
    position: new Vector3(from.x + aheadX * distance, from.y + aheadY * distance, from.z),
    rotation: Quaternion.fromAxisAngle(new Vector3(0, 0, 1), Math.atan2(aheadX, -aheadY)),
  };
}
```

## 3. The wares

Prices are in money units, the amount of the game's `money` item. Item names are the game's own item names, the same ones `player.giveItem` takes.

```ts title="src/server/wares.ts"
export const STOCK: VendorStockRow[] = [
  { item: "bread", amount: 20, price: 30 },
  { item: "apple", amount: 30, price: 10 },
  { item: "beer", amount: 12, price: 45 },
];

/** What he pays for. Anything not listed shows at no value and cannot be sold to him. */
export const BUYS: VendorBuyRow[] = [
  { item: "apple", price: 4 },
  { item: "carrot", price: 3 },
];

/** All he can pay out. Deals keep it current: what players pay goes in, what they are paid comes out. */
export const PURSE = 400;
```

## 4. The stall

A stall is two ids: the keeper's NPC id and the vendor id. They are kept together in one map, looked up by the keeper when somebody presses use, and by the vendor when a deal settles.

```ts title="src/server/stall.ts"
import { BUYS, PURSE, STOCK } from "./wares.js";

export interface Stall {
  readonly keeper: number;
  readonly vendor: number;
}

const stalls = new Map<number, Stall>();

export function openStall(position: Vector3, rotation: Quaternion): Npc {
  const keeper = Npc.create({
    soul: "townsman",
    position,
    rotation,
    name: "Ondra the grocer",
    interactable: true,
    nametag: true,
    invulnerable: true,
  });
  const vendor = Vendor.create({ name: `stall ${keeper.id}`, purse: PURSE, buys: true });
  Vendor.setStock(vendor, STOCK);
  Vendor.setBuyPrices(vendor, BUYS);
  stalls.set(keeper.id, { keeper: keeper.id, vendor });
  return keeper;
}

export function stallOf(keeper: number): Stall | undefined {
  return stalls.get(keeper);
}

/** Takes down every stall: the vendor first, which closes anyone's open trade screen. */
export function closeAll(): number {
  const count = stalls.size;
  for (const stall of stalls.values()) {
    Vendor.destroy(stall.vendor);
    Npc.getById(stall.keeper)?.remove();
  }
  stalls.clear();
  return count;
}

export function installTrading(): void {
  Events.on("vendorTrade", (vendor, player, bought, sold, balance) => {
    const stall = [...stalls.values()].find((candidate) => candidate.vendor === vendor);
    const keeper = stall && Npc.getById(stall.keeper);
    if (!keeper) return;

    const purse = Vendor.getPurse(vendor) ?? 0;
    if (purse < 20) keeper.say("That is the last of my coin. I am buying nothing more today.");
    else if (balance < 0) keeper.say(`Enjoy it, ${player.nickname}.`);
    else keeper.say("Pleasure doing business.");

    console.log(`${player.nickname} bought ${bought.length} line(s), sold ${sold.length}, balance ${balance}, purse now ${purse}`);
  });
}
```

`interactable: true` is what makes pressing use on the keeper raise `npcInteract` at all. `invulnerable: true` keeps a bored customer from killing the shop.

:::note
What players sell to a vendor does not join its stock. If your grocer should resell the apples he buys, add them back with `Vendor.setStock` in the `vendorTrade` handler. The lines it receives name items by GUID in `item` and by the game's name in `name`.
:::

## 5. The conversation

A conversation belongs to a player, so the map is keyed by player id, and each entry remembers which stall it is about. `Dialogue.update` swaps the page inside the same session instead of opening a new one.

```ts title="src/server/talk.ts"
import type { Stall } from "./stall.js";

interface Talk {
  readonly session: number;
  readonly stall: Stall;
}

const talks = new Map<number, Talk>();

function greeting(): DialoguePage {
  return {
    line: "Fresh bread, apples, beer. What will it be?",
    onRight: false,
    options: [
      { id: "trade", text: "Show me your wares.", enabled: true },
      { id: "purse", text: "Are you buying today?", enabled: true },
      { id: "leave", text: "Nothing, thanks.", enabled: true },
    ],
  };
}

function purseAnswer(stall: Stall): DialoguePage {
  const coin = Vendor.getPurse(stall.vendor) ?? 0;
  return {
    line: coin > 0 ? `Apples and carrots. I have ${coin} coins left for them.` : "Not today. My purse is empty.",
    onRight: false,
    options: [
      { id: "trade", text: "Then let us trade.", enabled: true },
      { id: "leave", text: "Another time.", enabled: true },
    ],
  };
}

export function startTalk(player: Player, stall: Stall): void {
  const session = Dialogue.open(player.id, greeting());
  if (session !== 0) talks.set(player.id, { session, stall });
}

export function endAllTalks(): void {
  for (const talk of talks.values()) Dialogue.close(talk.session);
  talks.clear();
}

export function installTalk(): void {
  Events.on("dialogueChoice", (session, player, optionId) => {
    const talk = talks.get(player.id);
    // Another resource's conversation, or an answer to one that already ended.
    if (!talk || talk.session !== session) return;

    if (optionId === "trade") {
      Dialogue.close(session);
      Vendor.open(talk.stall.vendor, player.id, talk.stall.keeper);
    } else if (optionId === "purse") {
      Dialogue.update(session, purseAnswer(talk.stall));
    } else {
      Dialogue.close(session);
    }
  });

  Events.on("dialogueClosed", (session, player) => {
    if (talks.get(player.id)?.session === session) talks.delete(player.id);
  });
}
```

:::tip
The contract spells `line`, `onRight` and `enabled` as properties that must be present, even though the runtime treats them as optional. Typing each page as `DialoguePage` and naming all three keeps the compiler happy and makes a malformed page a compile error instead of a refused call.
:::

Choices come back by option id, never by index, so a page you rebuild with different rows still routes correctly. The check against `talk.session` is what lets this resource share `dialogueChoice` with every other resource on the server.

## 6. Wiring it up

The entry point connects the pieces: the command, the use key, and cleanup.

```ts title="src/server/index.ts"
import { inFrontOf } from "./place.js";
import { closeAll, installTrading, openStall, stallOf } from "./stall.js";
import { endAllTalks, installTalk, startTalk } from "./talk.js";

const RESOURCE = "market-stall";

installTrading();
installTalk();

Events.on("playerCommand", (player, command, args) => {
  if (command !== "stall") return;

  if (args[0] === "clear") {
    Chat.sendToPlayer(player, `Closed ${closeAll()} stall(s).`);
    return;
  }
  // A body with no pose yet would put the stall at the world origin.
  if (!player.ready) {
    Chat.sendToPlayer(player, "Your position has not reached the server yet. Try again in a moment.");
    return;
  }
  const { position, rotation } = inFrontOf(player, 2.5);
  const keeper = openStall(position, rotation);
  Chat.sendToPlayer(player, `${keeper.name} has set up shop. Walk up to him and press use.`);
});

Events.on("npcInteract", (npc, player) => {
  const stall = stallOf(npc.id);
  if (!stall) return;
  npc.lookAt(player);
  startTalk(player, stall);
});

// Vendors, conversations and NPCs outlive the resource that made them.
Events.on("resourceStop", (name) => {
  if (name !== RESOURCE) return;
  endAllTalks();
  closeAll();
});
```

:::caution
Stopping a resource removes its event handlers and timers, but not the vendors, conversations or NPCs it created. Without the `resourceStop` handler, every reload leaves a mute grocer behind whose shop nobody can open.
:::

There is no `playerDisconnect` handler, and none is needed: a disconnect closes the player's conversation with reason 3 and their trade screen with reason 4, and the `dialogueClosed` handler already tidies the map.

## Try it

Build the resource, then:

```sh title="Server console"
ensure market-stall
```

In game:

1. `/stall`. Ondra appears in front of you, facing you.
2. Walk up and press use. He turns to you and the conversation opens.
3. Pick "Are you buying today?", then "Then let us trade." The game's own trade screen opens with Ondra as the trader.
4. Buy a loaf. He thanks you by name over his head.
5. With the default gamemode running, `/give apple 150`, then sell him apples until his purse gives out. Ask him again and he tells you it is empty.
6. `/stall clear` removes him.

## Where to go next

- [Vendors](../../server-scripting/quests-dialogue-and-shops/vendors/) and [Dialogue](../../server-scripting/quests-dialogue-and-shops/dialogue/) cover each API in full, including the client's `vendorOpened` and `vendorClosed`.
- [NPCs](../../server-scripting/npcs-horses-and-dogs/npcs/) lists the roles you can use instead of `townsman`.
- [Script an NPC cutscene](../scripted-scene/) makes NPCs move and talk on their own.
