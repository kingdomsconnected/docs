---
title: Give NPCs loot and harvest animal corpses
description: Set server-owned NPC stock, handle loot changes, and keep animal harvest state when restoring corpses.
sidebar:
  label: Corpse loot
  order: 55.6
---

NPCs have server-owned inventories. Players can loot supported dead NPCs and
harvest animal corpses through the native interactions.

In a server script, set the inventory immediately after creating the NPC:

```ts
const animal = Npc.create({
  soul: "animal_sheep_ewe",
  position: player.position,
  virtualWorld: player.virtualWorld,
  nametag: false,
  interactable: false,
});
const result = Inventory.set(animal, {
  items: [{ item: "apple", amount: 2 }],
  harvested: false,
});
if (!result.ok) {
  animal.remove();
  console.log(`Could not prepare animal stock: ${result.code}`);
}
```

The apples make the example easy to recognize. Choose species-appropriate
stock with `getAnimalLoot()` for your actual game mode. Position animals on
safe walkable ground as described in [Animal populations](../animals/).

## Wait for stock or supply it yourself

`Inventory.get(npc)` and `npc.getInventory()` return the current state or null. Unless
your script sets the inventory, the client simulating the NPC reports its starting
inventory once. Wait for `npcInventoryReady` before changing that stock.
`Inventory.set` can supply it before the NPC's body exists on a client; other writes
require the inventory to be ready.

The shared `Inventory.add`, `remove`, `setProperties`, `set` and `transfer` APIs
accept `Npc` handles as well as players. They keep the same all-or-nothing
transactions and optional revision checks. Your script must check distance, access and
consent before calling `transfer`; the call does not check whether the player would be
allowed to loot through the game's interaction.

## Choose animal loot

```ts
const candidates = npc.getAnimalLoot();
if (candidates !== null) {
  for (const entry of candidates) {
    console.log(`${entry.item}: base amount ${entry.amount}, food ${entry.food}`);
  }
}
```

`getAnimalLoot()` lists possible loot without choosing or adding any items. Each entry
has `item`, `amount`, `fraction`, `variation`, `food` and `harvester` fields. It
returns null for a non-animal, an excluded soul, or an adopted body that has not been
resolved. An empty array means the preset is known but contains no loot. Choose the
loot once when the animal spawns and set it with `Inventory.set`. Repeating that
choice whenever someone opens the corpse would generate fresh loot.

The default game mode chooses loot in `src/server/npc-spawn.ts`. It uses a 100% chance
for meat and a 50% chance for special parts, with quantities from the catalog. You can
change those chances in the game mode.

## Save changes and harvest state

```ts
Events.on("npcInventoryChanged", (npc, change) => {
  const state = Inventory.get(npc);
  if (state) console.log(`NPC ${npc.id}: ${change.reason}, revision ${state.revision}`);
});
Events.on("npcHarvested", (npc, player) => {
  console.log(`${player.nickname} harvested NPC ${npc.id}`);
});
```

`npcInventoryChanged` reports committed stock changes, including loot
transfers. `npcHarvested` reports harvest completion separately. Save both
the inventory rows and `state.harvested` if corpses survive a server restart.
Restore with `Inventory.set(npc, { items, harvested })` after recreating the
correct NPC. Keep row IDs, complete metadata and equipped counts.

The NPC's lifetime is separate from its inventory. Removing the NPC removes the corpse
from the world; your game mode owns cleanup and persistence. The default population
manager also removes old corpses under its distance and timer rules. A harvested
corpse can still have items left in its inventory.

## Related

- [Inventory transactions](../../players/inventory/)
- [Animal populations](../animals/)
- [NPC events](../npc-events/)
