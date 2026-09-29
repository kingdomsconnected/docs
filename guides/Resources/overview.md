---
title: Game resources and catalogs
description: Every list of game names a script can pass to the API, from faces and horse breeds to items, buffs and particle effects, with the call that reads each one.
sidebar:
  label: Overview
  order: 110
---

Most spawn and change calls take one of the game's own names: `Horse.spawn` a breed,
`player.giveItem` an item class, `Vfx.spawn` a particle effect. The pages in this group list
every name the mod ships for each of them, so you can pick one without starting a server.

:::note
These are the game's data catalogs, not the script **resources** your server loads. For those, see
[Resources and the manifest](../../core-concepts/resources/).
:::

Most catalogs can also be read at runtime, and the runtime list always wins over these pages:

```ts title="src/server/index.ts"
const lists: Record<string, (filter?: string) => string[]> = {
  breeds: () => Horse.breeds(),
  gear: () => Horse.gearPresets(),
  roles: () => Npc.roles(),
  blips: () => Blip.types(),
  effects: (prefix) => Vfx.list(prefix),
};

Events.on("playerCommand", (player, command, args) => {
  if (command !== "catalog") return;
  const names = lists[args[0] ?? ""]?.(args[1]) ?? [];
  Chat.sendToPlayer(player, names.slice(0, 20).join(", ") || "Try /catalog breeds");
});
```

## The catalogs

<!-- generated:counts -->

| Catalog | Entries | Page |
| --- | --- | --- |
| Faces | 212 male, 61 female | [Faces, hair and skins](../appearance/) |
| Hairstyles | 262 male, 71 female | [Faces, hair and skins](../appearance/) |
| Skins | 47 male, 41 female | [Faces, hair and skins](../appearance/) |
| Beards | 51, male only | [Beards](../beards/) |
| Horse breeds | 58 | [Horse breeds](../horse-breeds/) |
| Horse gear | 535 items, 224 presets | [Horse gear](../horse-gear/) |
| NPC roles and souls | 10 roles, 1,040 looks | [NPC and dog souls](../souls/) |
| Dog souls | 156 | [NPC and dog souls](../souls/#dog-souls) |
| Item classes | 5,604 | [Items](../items/) |
| Status effects | 929 | [Buffs](../buffs/) |
| Particle effects | 588 | [Particle effects](../effects/) |
| Marker materials | 267 | [Marker materials](../markers/) |
| Blip icons | 83 | [Blip icons](../blip-icons/) |
| Hand props and emotes | 408 props, 6 emotes | [Hand props and emotes](../animation-props/) |

<!-- /generated:counts -->

## Where to read each one at runtime

| Catalog | Server call | Used by |
| --- | --- | --- |
| Faces, hair, skins, beards | [`Appearances.options`](../../reference/server/variables/Appearances.md#options), [`Appearances.beards`](../../reference/server/variables/Appearances.md#beards) | `player.setAppearance`, `npc.setAppearance`, `Npc.create({ appearance })` |
| Horse breeds | [`Horse.breeds`](../../reference/server/classes/Horse.md#breeds) | `Horse.spawn` |
| Horse gear | [`Horse.gearItems`](../../reference/server/classes/Horse.md#gearitems), [`Horse.gearPresets`](../../reference/server/classes/Horse.md#gearpresets) | `horse.setGear`, `horse.equipGear`, `Horse.spawn` |
| NPC roles | [`Npc.roles`](../../reference/server/classes/Npc.md#roles) | `Npc.create({ soul })` |
| Souls, items | None: a call returns `false` or throws for a name it does not know | `Npc.create`, `Dog.spawn`, `player.giveItem`, `player.takeItem`, `GroundItem.spawn` |
| Buffs | [`Buffs.find`](../../reference/server/variables/Buffs.md#find), [`Buffs.classes`](../../reference/server/variables/Buffs.md#classes), [`Buffs.tags`](../../reference/server/variables/Buffs.md#tags) | `player.addBuff`, `player.clearBuffs`, `Buffs.claim` |
| Particle effects | [`Vfx.list`](../../reference/server/classes/Vfx.md#list) | `Vfx.spawn` |
| Marker materials | [`Marker.list`](../../reference/server/classes/Marker.md#list) | `Marker.place` |
| Blip icons | [`Blip.types`](../../reference/server/classes/Blip.md#types) | `Blip.create({ type })` |
| Animations and hand props | [`Animations.list`](../../reference/server/variables/Animations.md#list), [`Animations.props`](../../reference/server/variables/Animations.md#props) | `player.playAnimation`, `npc.playAnimation` |

The lists on these pages are generated from the mod's own tables for the release the guides
are checked against. When a name listed here is refused at runtime, your server runs a
different build: trust the runtime.
