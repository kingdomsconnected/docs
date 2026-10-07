---
title: Build an NPC shop
description: An NPC shopkeeper who talks first and trades second, combining npcInteract, a dialogue and a vendor with a purse that can run dry.
sidebar:
  label: NPC shop
  order: 92
---

You will build `/stall`, which puts a grocer in front of you. Press use on him and he greets you; from the conversation you can open his trade screen or ask whether he is buying, and he says so when his 400-coin purse runs low.

:::note[Before you start]
- [Write your first resource](../../getting-started/first-resource/) and [Use TypeScript](../../getting-started/typescript/).
- [Spawn NPCs](../../npcs-and-animals/npcs/), [Dialogue choices](../../quests-dialogue-and-shops/dialogue/) and [Shops (vendors)](../../quests-dialogue-and-shops/vendors/).

Difficulty: intermediate. Time: about 40 minutes.
:::

## What you will learn

- Spawning an interactable, invulnerable NPC with [`Npc.create`](../../npcs-and-animals/npcs/).
- Reacting to the use key with [`npcInteract`](../../npcs-and-animals/npc-events/).
- Running a multi-page conversation with [`Dialogue`](../../quests-dialogue-and-shops/dialogue/), shared safely with other resources.
- Creating a [`Vendor`](../../quests-dialogue-and-shops/vendors/) with stock, buy prices and a purse, and reacting to `vendorTrade`.
- Placing and facing an entity with [positions and rotations](../../core-concepts/math/).

```text
market-stall/
  package.json
  tsconfig.json          from Use TypeScript
  src/server/
    index.ts             /stall, npcInteract, cleanup
    place.ts             a spot in front of the player
    wares.ts             prices and purse
    stall.ts             keeper + vendor pairs, vendorTrade
    talk.ts              the conversation
```

NPCs, dialogues and vendors do not know about each other: the stall is the glue you write. The default gamemode has the halves separately, in `src/server/commands/vendor.ts` and `src/server/commands/dialogue.ts`.

## 1. Write the manifest

It is all server code.

```json title="package.json"
{
  "name": "market-stall",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc -p tsconfig.json"
  },
  "devDependencies": {
    "@kingdomsconnected/types": "1.6.2",
    "typescript": "^5.9.2"
  },
  "mafiahub": {
    "serverScripts": ["dist/server/index.js"]
  }
}
```

## 2. Find a spot in front of the player

The stall goes a couple of metres ahead of whoever typed the command, with the keeper turned to face them. The world is Z up and an unrotated entity faces +Y.

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

## 3. Set the prices

Prices are in money units (the game's `money` item). Item names are the game's own, the same ones `player.giveItem` takes.

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

## 4. Open the stall

A stall is two ids, the keeper's NPC id and the vendor id, kept together in one map. It is looked up by keeper when somebody presses use, and by vendor when a deal settles.

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

- `interactable: true` is what makes pressing use on the keeper raise `npcInteract` at all.
- `invulnerable: true` keeps a bored customer from killing the shop.
- What players sell does not join the vendor's stock. To resell it, call `Vendor.setStock` in `vendorTrade`; its lines name items by GUID in `item` and by game name in `name`.

## 5. Write the conversation

A conversation belongs to a player, so the map is keyed by player id and each entry remembers its stall. `Dialogue.update` swaps the page inside the same session instead of opening a new one.

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

- Typing each page as `DialoguePage` with `line`, `onRight` and `enabled` spelled out keeps the compiler happy: the contract requires them even though the runtime treats them as optional.
- Choices come back by option id, never by index, so a rebuilt page still routes correctly.
- The `talk.session` check is what lets this resource share `dialogueChoice` with every other resource.

## 6. Wire it up

The entry point connects the command, the use key and cleanup.

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

- Without the `resourceStop` handler, every reload leaves behind a mute grocer whose shop nobody can open: stopping a resource removes its handlers and timers, not its vendors, conversations or NPCs.
- No `playerDisconnect` handler is needed. A disconnect closes the player's conversation (reason 3) and trade screen (reason 4), and `dialogueClosed` tidies the map.

## Try it

Build the resource and run `ensure market-stall` in the server console. In game:

1. `/stall`. Ondra appears in front of you, facing you.
2. Walk up and press use. He turns to you and the conversation opens.
3. Pick "Are you buying today?", then "Then let us trade." The game's trade screen opens with Ondra as the trader.
4. Buy a loaf. He thanks you by name over his head.
5. With the default gamemode running, `/give apple 150`, then sell him apples until his purse gives out. Ask him again and he says it is empty.
6. `/stall clear` removes him.

## Next steps

- Refill his purse on a timer with `Vendor.setPurse`, or restock what players sold him in `vendorTrade`. See [Shops (vendors)](../../quests-dialogue-and-shops/vendors/).
- Try another role than `townsman` from [Spawn NPCs](../../npcs-and-animals/npcs/).
- Tie a purchase to a journal entry with [Quests in the journal](../../quests-dialogue-and-shops/quests/).
- Make NPCs move and talk on their own in [Script an NPC cutscene](../scripted-scene/).
