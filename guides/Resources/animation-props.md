---
title: Hand props and emotes
description: The tools and objects an animation can put in a hand, grouped by how they are held, and the gestures of the emote wheel.
sidebar:
  label: Props and emotes
  order: 121
---

`playAnimation` can put up to two props in a body's hands. Pick a prop whose grip matches the
animation's `rightHand` or `leftHand` from [`Animations.list`](../../reference/server/variables/Animations.md#list),
and it sits the way the animation was made for.

```ts
const [row] = Animations.list("chop");
const prop = row && Animations.props().find((entry) => entry.hand === row.rightHand);
if (row) player.playAnimation(row.fragment, { tags: row.tags, loop: true, props: { item: prop?.name, hand: "right" } });
```

## Animations

<!-- generated:animations -->

The catalog behind `Animations.list` holds 6,097 rows.

<!-- /generated:animations -->

That is too many to list here: search it with `Animations.list("drink")`, or with the default
gamemode's `/anim list`.

## Hand props by grip

The group name is the grip, which is what an animation's `rightHand` and `leftHand` name.

<!-- generated:props -->

<details>
<summary><code>axe</code> (15)</summary>

| Prop | Model |
| --- | --- |
| `axeBattle01` | `objects/manmade/weapons/axes/battleaxe01.cgf` |
| `axeBattle02` | `objects/manmade/weapons/axes/battleaxe02.cgf` |
| `axeBattle03` | `objects/manmade/weapons/axes/battleaxe03.cgf` |
| `axeBattle04` | `objects/manmade/weapons/axes/battleaxe04.cgf` |
| `axeCuman` | `objects/manmade/weapons/axes/cumanfokosh.cgf` |
| `axeFancy` | `objects/manmade/weapons/axes/fancyaxe.cgf` |
| `axeTraining` | `objects/manmade/weapons/axes/axe_wooden.cgf` |
| `axeWork01` | `objects/manmade/weapons/axes/workaxe01.cgf` |
| `axeWork02` | `objects/manmade/weapons/axes/workaxe02.cgf` |
| `axeWork02_kunesh` | `objects/manmade/weapons/axes/workaxe02.cgf` |
| `battle_gate_axe` | `objects/manmade/weapons/axes/battleaxe02.cgf` |
| `kovaniAsiDoVezi_protectiveAxe` | `objects/manmade/weapons/axes/workaxe01.cgf` |
| `kovaniPoklad_adornedAxe` | `objects/manmade/weapons/axes/qkovani_poklad_silveraxe.cgf` |
| `naTroskach_axeKolda` | `objects/manmade/weapons/axes/workaxe01.cgf` |
| `poi_ratborschButcherAxe` | `objects/manmade/weapons/axes/workaxe02.cgf` |

</details>

<details>
<summary><code>axe_tool</code> (3)</summary>

| Prop | Model |
| --- | --- |
| `axe_chopping` | `objects/manmade/task_specific_props/wood_industry/woodcutting/axe.cgf` |
| `lumberjack_axe` | `objects/manmade/task_specific_props/wood_industry/woodcutting/axe.cgf` |
| `lumberjack_axe_big` | `objects/manmade/task_specific_props/wood_industry/woodcutting/axe_big.cgf` |

</details>

<details>
<summary><code>barrel</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `barrel` | `objects/manmade/common_furniture/barrels/barrel_a.cgf` |

</details>

<details>
<summary><code>basket</code> (15)</summary>

| Prop | Model |
| --- | --- |
| `basket_b_apples` | `objects/manmade/common_furniture/baskets/basket_b_apples.cgf` |
| `basket_b_bread` | `objects/manmade/common_furniture/baskets/basket_b_bread.cgf` |
| `basket_b_coal` | `objects/manmade/common_furniture/baskets/basket_b_coal.cgf` |
| `basket_b_hay` | `objects/manmade/common_furniture/baskets/basket_b_hay.cgf` |
| `basket_b_stones` | `objects/manmade/common_furniture/baskets/basket_b_stones.cgf` |
| `basket_empty` | `objects/manmade/common_furniture/baskets/basket_b.cgf` |
| `basket_empty_b` | `objects/manmade/common_furniture/baskets/basket_b.cgf` |
| `basket_full_sticks` | `objects/manmade/task_specific_props/household/firewood/basket_a_woodsticks.cgf` |
| `basket_full_wood` | `objects/manmade/task_specific_props/household/firewood/basket_a_woodchips.cgf` |
| `basket_transfer_apples` | `objects/manmade/common_furniture/baskets/basket_b_apples.cgf` |
| `basket_transfer_bread` | `objects/manmade/common_furniture/baskets/basket_b_bread.cgf` |
| `basket_transfer_coal` | `objects/manmade/common_furniture/baskets/basket_b_coal.cgf` |
| `basket_transfer_hay` | `objects/manmade/common_furniture/baskets/basket_b_hay.cgf` |
| `basket_transfer_stones` | `objects/manmade/common_furniture/baskets/basket_b_stones.cgf` |
| `laundryBasket` | `objects/manmade/common_furniture/baskets/basket_laundry.cgf` |

</details>

<details>
<summary><code>basketWeaving</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `basket_unfinished` | `objects/manmade/common_furniture/baskets/basket_small_unfinished.cgf` |

</details>

<details>
<summary><code>blacksmithSword</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `semifinished_sword` | `objects/manmade/task_specific_props/metal_industry/smithing/semifinished_sword.cgf` |

</details>

<details>
<summary><code>branch</code> (2)</summary>

| Prop | Model |
| --- | --- |
| `branch_a` | `objects/manmade/task_specific_props/household/firewood/branches/branch_a.cgf` |
| `lumberjack_collecting_branch` | `objects/natural/vegetation/trees/normal_trees/abies_alba/abies_alba_branch_a.cgf` |

</details>

<details>
<summary><code>broom</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `broom` | `objects/manmade/task_specific_props/household/cleaning/broom.cgf` |

</details>

<details>
<summary><code>bucket</code> (3)</summary>

| Prop | Model |
| --- | --- |
| `milkBucket` | `objects/manmade/common_furniture/bucket/bucket_a_milk.cgf` |
| `pigFeedBucket` | `objects/manmade/common_furniture/bucket/bucket_a_a.cgf` |
| `waterBucket` | `objects/manmade/common_furniture/bucket/bucket_a_a.cgf` |

</details>

<details>
<summary><code>cage</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `cage_right_hand` | `objects/manmade/common_furniture/cages/cage_b.cgf` |

</details>

<details>
<summary><code>cookingHerbs</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `herb_coltsfoot` | `objects/manmade/task_specific_props/household/cooking_eating/herbs/herbs_rosmarinus.cgf` |

</details>

<details>
<summary><code>cookingIngredience</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `herb_coltsfoot_ingredience` | `objects/manmade/food/herbs/herb_coltsfoot_pickable.cgf` |

</details>

<details>
<summary><code>crate</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `crate_with_silver` | `objects/manmade/common_furniture/crates/crate_short_for_silver.cgf` |

</details>

<details>
<summary><code>cup</code> (9)</summary>

| Prop | Model |
| --- | --- |
| `dice_cup` | `objects/manmade/task_specific_props/entertainment/games/dice/dice_cup_b.cgf` |
| `dice_cup_leather` | `objects/manmade/task_specific_props/entertainment/games/dice/dice_cup_b.cgf` |
| `jug_pewter_small_copper` | `objects/manmade/task_specific_props/household/cooking_eating/jugs/jug_pewter_small_copper.cgf` |
| `jug_pewter_small_tin` | `objects/manmade/task_specific_props/household/cooking_eating/jugs/jug_pewter_small_tin.cgf` |
| `setkaniVRatbori_copperJug` | `objects/manmade/task_specific_props/household/cooking_eating/jugs/jug_pewter_small_copper.cgf` |
| `setkaniVRatbori_copperJug_big` | `objects/manmade/task_specific_props/household/cooking_eating/jugs/jug_pewter.cgf` |
| `setkaniVRatbori_tinJug` | `objects/manmade/task_specific_props/household/cooking_eating/jugs/jug_pewter_small_tin.cgf` |
| `setkaniVRatbori_tinJug_big` | `objects/manmade/task_specific_props/household/cooking_eating/jugs/jug_pewter.cgf` |
| `stealthMiseZaJindru_aulitzsJug` | `objects/manmade/task_specific_props/household/cooking_eating/jugs/jug_pewter_small_tin.cgf` |

</details>

<details>
<summary><code>dagger</code> (9)</summary>

| Prop | Model |
| --- | --- |
| `barber_razor` | `objects/manmade/task_specific_props/baths/razor_barber.cgf` |
| `butcher_cleaver` | `objects/manmade/task_specific_props/food_processing/butchering/cleaver_a.cgf` |
| `butcher_cleaver_small` | `objects/manmade/task_specific_props/food_processing/butchering/cleaver_a.cgf` |
| `butcher_knife` | `objects/manmade/task_specific_props/food_processing/butchering/butcher_knife.cgf` |
| `butcher_two_handed_knife` | `objects/manmade/task_specific_props/food_processing/butchering/two_handed_knife.cgf` |
| `daggerCommon` | `objects/manmade/weapons/daggers/dagger_common.cgf` |
| `nalezeniDelnici_denesDagger` | `objects/manmade/weapons/daggers/dagger_common.cgf` |
| `setkaniVRatbori1_stolenDagger` | `objects/manmade/weapons/daggers/dagger_common.cgf` |
| `zikmunduvTabor_stabProofDagger` | `objects/manmade/weapons/daggers/dagger_common.cgf` |

</details>

<details>
<summary><code>doePiece</code> (3)</summary>

| Prop | Model |
| --- | --- |
| `skinned_deer_piece1` | `objects/manmade/task_specific_props/food_processing/butchering/skinned_deer_piece_a.cgf` |
| `skinned_deer_piece2` | `objects/manmade/task_specific_props/food_processing/butchering/skinned_deer_piece_b.cgf` |
| `skinned_deer_piece3` | `objects/manmade/task_specific_props/food_processing/butchering/skinned_deer_wholemesh.cgf` |

</details>

<details>
<summary><code>eggBasket</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `eggbasket` | `objects/manmade/common_furniture/baskets/basket_eggs.cgf` |

</details>

<details>
<summary><code>firewood</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `firewoodChipsHand` | `objects/manmade/task_specific_props/household/firewood/firewood_hand_1pc.cgf` |

</details>

<details>
<summary><code>fishingRod</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `fishing_rod` | `objects/manmade/task_specific_props/foraging/fishing/fishing_rod.cgf` |

</details>

<details>
<summary><code>halberd</code> (22)</summary>

| Prop | Model |
| --- | --- |
| `bratriZCimburka_balsanHalberd` | `objects/manmade/weapons/long_weapons/polearm_poleaxe.cgf` |
| `magicShop_polearmSpear_broken` | `objects/manmade/weapons/long_weapons/polearm_spear_damaged.cgf` |
| `polearmBardiche` | `objects/manmade/weapons/long_weapons/polearm_voulge_a.cgf` |
| `polearmBardiche_broken` | `objects/manmade/weapons/long_weapons/polearm_voulge_a_damaged.cgf` |
| `polearmGlaive` | `objects/manmade/weapons/long_weapons/polearm_glaive.cgf` |
| `polearmGlaive_broken` | `objects/manmade/weapons/long_weapons/polearm_glaive_damaged.cgf` |
| `polearmGuisarm` | `objects/manmade/weapons/long_weapons/polearm_guisarm.cgf` |
| `polearmGuisarm_broken` | `objects/manmade/weapons/long_weapons/polearm_guisarm_damaged.cgf` |
| `polearmMorgenstern` | `objects/manmade/weapons/long_weapons/polearm_morgenstern.cgf` |
| `polearmMorgenstern_broken` | `objects/manmade/weapons/long_weapons/polearm_morgenstern_damaged.cgf` |
| `polearmPitchfork` | `objects/manmade/weapons/long_weapons/polearm_pitchfork.cgf` |
| `polearmPitchfork_broken` | `objects/manmade/weapons/long_weapons/polearm_pitchfork_damaged.cgf` |
| `polearmPitchforkSedlakaMateje` | `objects/manmade/weapons/long_weapons/polearm_pitchfork.cgf` |
| `polearmPoleaxe` | `objects/manmade/weapons/long_weapons/polearm_poleaxe.cgf` |
| `polearmPoleaxe_broken` | `objects/manmade/weapons/long_weapons/polearm_poleaxe_damaged.cgf` |
| `polearmSpear` | `objects/manmade/weapons/long_weapons/polearm_spear.cgf` |
| `polearmSpear_broken` | `objects/manmade/weapons/long_weapons/polearm_spear_damaged.cgf` |
| `polearmTraining` | `objects/manmade/weapons/long_weapons/polearm_training.cgf` |
| `polearmVoulge` | `objects/manmade/weapons/long_weapons/polearm_voulge.cgf` |
| `polearmVoulge_broken` | `objects/manmade/weapons/long_weapons/polearm_voulge_damaged.cgf` |
| `sesivaniTonici_svancara` | `objects/manmade/weapons/long_weapons/st_anton_polearm.cgf` |
| `svatyAntonin_svancaraAntonFlag` | `objects/manmade/weapons/long_weapons/st_anton_polearm.cgf` |

</details>

<details>
<summary><code>hammer</code> (4)</summary>

| Prop | Model |
| --- | --- |
| `big_blacksmith_hammer` | `objects/manmade/task_specific_props/metal_industry/smithing/blacksmith_hammer.cgf` |
| `big_hammer` | `objects/manmade/task_specific_props/metal_industry/smithing/blacksmith_hammer.cgf` |
| `blacksmith_hammer` | `objects/manmade/common_tools/hammer.cgf` |
| `shoemaker_hammer` | `objects/manmade/task_specific_props/clothing_industry/shoemaking/hammer_cobbler.cgf` |

</details>

<details>
<summary><code>hoe</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `iron_hoe` | `objects/manmade/task_specific_props/farming/horticulture/hoe.cgf` |

</details>

<details>
<summary><code>key</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `papezskyLegat_treasuryKey` | `objects/manmade/common_tools/keys_lockpicks/key_b.cgf` |

</details>

<details>
<summary><code>ladder</code> (5)</summary>

| Prop | Model |
| --- | --- |
| `siegeLadder` | `objects/manmade/common_fixtures/ladders/ladder_rustic_350.cgf` |
| `siegeLadder10000` | `objects/manmade/common_fixtures/ladders/ladder_siege_10m.cgf` |
| `siegeLadder10000_long` | `objects/manmade/common_fixtures/ladders/ladder_siege_10m_long.cgf` |
| `siegeLadder225` | `objects/manmade/common_fixtures/ladders/ladder_rustic_225.cgf` |
| `siegeLadder575` | `objects/manmade/common_fixtures/ladders/ladder_rustic_575.cgf` |

</details>

<details>
<summary><code>lamp</code> (2)</summary>

| Prop | Model |
| --- | --- |
| `lamp_tool` | `objects/manmade/common_illumination/lamp_leather_wearable.cgf` |
| `lamp_toolFancy` | `objects/manmade/common_illumination/lamp_new_wearable.cgf` |

</details>

<details>
<summary><code>light</code> (40)</summary>

| Prop | Model |
| --- | --- |
| `blade` | `objects/manmade/common_tools/keys_lockpicks/blade.cgf` |
| `bowl_tin_lentil_full` | `objects/manmade/food/food/mushes/bowl_lentil_tin.cgf` |
| `carpenter_saw` | `objects/manmade/task_specific_props/wood_industry/carpentry/histor.cgf` |
| `ceramic_tankard` | `objects/manmade/task_specific_props/household/cooking_eating/tankards/tankard_a.cgf` |
| `chisel` | `objects/manmade/task_specific_props/stone_industry/stonecutting/chisel_stone.cgf` |
| `chisel_npc_spawned` | `objects/manmade/task_specific_props/stone_industry/stonecutting/chisel_stone.cgf` |
| `flask` | `objects/manmade/task_specific_props/alchemy/ceramics/potion_flask_b.cgf` |
| `fortress_gate_latch_01` | `objects/manmade/structures/defensive/gatehouses/unique/nebakov/gate_nebakov_trosky_latch_cinematics.cgf` |
| `hammer` | `objects/manmade/common_tools/hammer.cgf` |
| `hammer_npc_spawned` | `objects/manmade/task_specific_props/metal_industry/mining/mining_hammer.cgf` |
| `hammer_pulling` | `objects/manmade/task_specific_props/metal_industry/armoursmith/hammer_pulling.cgf` |
| `herding_stick` | `objects/manmade/task_specific_props/camping/stick_for_fish.cgf` |
| `hoofpick_spawned` | `objects//manmade/task_specific_props/farming/animal_husbandry/hoofpick.cgf` |
| `leather_scraper` | `objects/manmade/task_specific_props/clothing_industry/tanning/scraper.cgf` |
| `letter` | `objects/manmade/task_specific_props/read_and_write/scrolls/letter.cgf` |
| `log_cut` | `objects/manmade/task_specific_props/household/firewood/log_cut.cgf` |
| `log_cut_half` | `objects/manmade/task_specific_props/household/firewood/log_cut_half.cgf` |
| `normalHammer` | `objects/manmade/common_tools/hammer.cgf` |
| `party_lute` | `objects/quest_items/lute/lute_small.cgf` |
| `pavise_stick` | `objects/manmade/task_specific_props/combat/pavises/pavise_stick.cgf` |
| `player_cup` | `objects/manmade/task_specific_props/household/cooking_eating/cups/cup_b.cgf` |
| `player_potion` | `objects/manmade/task_specific_props/alchemy/ceramics/potion_flask_ceramic_a_nocork.cgf` |
| `player_wooden_spoon` | `objects/manmade/task_specific_props/household/cooking_eating/eating_tools/wooden_spoon.cgf` |
| `rasp` | `objects/manmade/task_specific_props/metal_industry/smithing/rasp.cgf` |
| `samuels_pouch` | `objects/manmade/common_furniture/sacks/sack_items/sack_items_anim.cgf` |
| `Scoop` | `objects/manmade/task_specific_props/household/cooking_eating/eating_tools/wooden_scoop.cgf` |
| `Scoop_a` | `objects/manmade/task_specific_props/household/cooking_eating/eating_tools/wooden_scoop.cgf` |
| `scrubBrush` | `objects/manmade/task_specific_props/household/cleaning/scrub_brush.cgf` |
| `semifinished_helmet` | `objects/manmade/task_specific_props/metal_industry/smithing/semifinished_helmet.cgf` |
| `shoe_single_spawned` | `objects/manmade/task_specific_props/clothing_industry/shoemaking/shoes/shoes_pair_6_single.cgf` |
| `spigot_plug` | `objects/manmade/common_furniture/barrels/barrel_small_spigot_plug.cgf` |
| `tin_spoon_mash` | `objects/manmade/task_specific_props/household/cooking_eating/eating_tools/silver_spoon.cgf` |
| `u41_wall_stone_01` | `objects/manmade/structures/living/houses/unique/kutna_hora/tarmark/tarmark17_wall_stone_01.cgf` |
| `u41_wall_stone_02` | `objects/manmade/structures/living/houses/unique/kutna_hora/tarmark/tarmark17_wall_stone_02.cgf` |
| `wooden_scoop` | `objects/manmade/task_specific_props/household/cooking_eating/eating_tools/wooden_scoop.cgf` |
| `wooden_spoon` | `objects/manmade/task_specific_props/household/cooking_eating/eating_tools/wooden_spoon_clear.cgf` |
| `wooden_spoon_mash` | `objects/manmade/task_specific_props/household/cooking_eating/eating_tools/wooden_spoon_beans.cgf` |
| `wooden_tankard` | `objects/manmade/task_specific_props/household/cooking_eating/tankards/wood_tankard.cgf` |
| `zachranaPtacka_malesov_wall_stone_01` | `objects/manmade/structures/defensive/fortress/malesov/malesov_wall_stone_01.cgf` |
| `zachranaPtacka_malesov_wall_stone_02` | `objects/manmade/structures/defensive/fortress/malesov/malesov_wall_stone_02.cgf` |

</details>

<details>
<summary><code>long</code> (5)</summary>

| Prop | Model |
| --- | --- |
| `mortar` | `objects/manmade/task_specific_props/alchemy/mortar/mortar_a.cgf` |
| `pestle` | `objects/manmade/task_specific_props/alchemy/mortar/pestle_a.cgf` |
| `pitchfork` | `objects/manmade/task_specific_props/farming/horticulture/gardenfork.cgf` |
| `washing_stick` | `objects/manmade/task_specific_props/clothing_industry/tanning/stick.cgf` |
| `wooden_peel` | `objects/manmade/task_specific_props/food_processing/baking/wooden_peel.cgf` |

</details>

<details>
<summary><code>longsword</code> (34)</summary>

| Prop | Model |
| --- | --- |
| `finale_hanusLongsword` | `objects/manmade/weapons/swords_long/long_sword_duel.cgf` |
| `kovaniKatuvSleh_longSwordExecutioner` | `objects/manmade/weapons/swords_long/executioner_sword.cgf` |
| `kovaniKatuvSleh_longSwordExecutioner_broken` | `objects/manmade/weapons/swords_long/executioner_sword_damaged.cgf` |
| `kovaniKopie_longSwordAbsolver` | `objects/manmade/weapons/swords_long/long_sword_sturdy.cgf` |
| `kovaniKopie_penitent` | `objects/manmade/weapons/swords_long/long_sword_sturdy.cgf` |
| `kovaniSymbolSermirny_longSwordGuildRemake` | `objects/manmade/weapons/swords_long/sermiri_long_sword_guild.cgf` |
| `longswordBohuta` | `objects/manmade/weapons/swords_long/long_sword_common.cgf` |
| `longswordBroad` | `objects/manmade/weapons/swords_long/long_sword_broad.cgf` |
| `longswordCapon` | `objects/manmade/weapons/swords_long/long_sword_duel.cgf` |
| `longswordCommon` | `objects/manmade/weapons/swords_long/long_sword_common.cgf` |
| `longswordDevil` | `objects/manmade/weapons/swords_long/long_sword_broad.cgf` |
| `longswordDevil_duel` | `objects/manmade/weapons/swords_long/long_sword_broad.cgf` |
| `longswordDevil_empty` | `objects/manmade/weapons/swords_long/long_sword_duel.cgf` |
| `longSwordDuel` | `objects/manmade/weapons/swords_long/long_sword_duel.cgf` |
| `longSwordDuel_empty` | `objects/manmade/weapons/swords_long/long_sword_duel.cgf` |
| `longSwordDuel_khTournament` | `objects/manmade/weapons/swords_long/long_sword_duel.cgf` |
| `longswordHenry` | `objects/manmade/weapons/swords_long/long_sword_henry.cgf` |
| `longswordHenry_reforged` | `objects/manmade/weapons/swords_long/long_sword_henry_jm.cgf` |
| `longswordIstvan` | `objects/manmade/weapons/swords_long/long_sword_henry.cgf` |
| `longswordOld` | `objects/manmade/weapons/swords_long/long_sword_old.cgf` |
| `longswordRadzig` | `objects/manmade/weapons/swords_long/long_sword_henry.cgf` |
| `longswordRadzig_reforged` | `objects/manmade/weapons/swords_long/long_sword_henry.cgf` |
| `longswordSturdy` | `objects/manmade/weapons/swords_long/long_sword_sturdy.cgf` |
| `longswordTraining` | `objects/manmade/weapons/swords_long/long_sword_training.cgf` |
| `longswordZizka_duel` | `objects/manmade/weapons/swords_long/long_sword_common.cgf` |
| `oblehaniSuchdole_oldSword` | `objects/manmade/weapons/swords_long/long_sword_old.cgf` |
| `poustevnik_seminLongSword` | `objects/manmade/weapons/swords_long/long_sword_old.cgf` |
| `poustevnik_seminLongSword_broken` | `objects/manmade/weapons/swords_long/long_sword_old_damaged.cgf` |
| `sermiry_longSwordGuild` | `objects/manmade/weapons/swords_long/sermiri_long_sword_guild.cgf` |
| `sermiry_longSwordMenhart` | `objects/manmade/weapons/swords_long/sermiri_long_sword_menhart.cgf` |
| `sermiry_trainingSword` | `objects/manmade/weapons/swords_long/long_sword_common.cgf` |
| `stealthMiseZaJindru_aulitzSword` | `objects/manmade/weapons/swords_long/long_sword_sturdy.cgf` |
| `svatba_longswordTournament` | `objects/manmade/weapons/swords_long/long_sword_training.cgf` |
| `tournament_kuttenbergSword` | `objects/manmade/weapons/swords_long/sermiri_long_sword_guild.cgf` |

</details>

<details>
<summary><code>lute</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `kejkliri_lute` | `objects/quest_items/lute/lute.cgf` |

</details>

<details>
<summary><code>mace</code> (57)</summary>

| Prop | Model |
| --- | --- |
| `axeBattle01_broken` | `objects/manmade/weapons/axes/battleaxe01_damaged.cgf` |
| `axeBattle02_broken` | `objects/manmade/weapons/axes/battleaxe02_damaged.cgf` |
| `axeBattle03_broken` | `objects/manmade/weapons/axes/battleaxe03_damaged.cgf` |
| `axeBattle04_broken` | `objects/manmade/weapons/axes/battleaxe04_damaged.cgf` |
| `axeCuman_broken` | `objects/manmade/weapons/axes/cumanfokosh_damaged.cgf` |
| `axeFancy_broken` | `objects/manmade/weapons/axes/fancyaxe_broken.cgf` |
| `axeWork01_broken` | `objects/manmade/weapons/axes/workaxe01_damaged.cgf` |
| `axeWork02_broken` | `objects/manmade/weapons/axes/workaxe02_damaged.cgf` |
| `axeWork02_broken_kunesh` | `objects/manmade/weapons/axes/workaxe02_damaged.cgf` |
| `balatro_jimboMace` | `objects/manmade/weapons/maces/mace_jimbo_balatro.cgf` |
| `hromovyKamen_ramsHead` | `objects/manmade/weapons/war_hammers/ramshead.cgf` |
| `hromovyKamen_ramsHead_broken` | `objects/manmade/weapons/war_hammers/ramshead_damaged.cgf` |
| `kovaniAsiDoVezi_protectiveAxe_broken` | `objects/manmade/weapons/axes/workaxe01_damaged.cgf` |
| `kovaniPoklad_adornedAxe_broken` | `objects/manmade/weapons/axes/qkovani_poklad_silveraxe_damaged.cgf` |
| `mace01` | `objects/manmade/weapons/maces/mace01.cgf` |
| `mace01_broken` | `objects/manmade/weapons/maces/mace01_damaged.cgf` |
| `mace02` | `objects/manmade/weapons/maces/mace02.cgf` |
| `mace02_broken` | `objects/manmade/weapons/maces/mace02_damaged.cgf` |
| `mace03` | `objects/manmade/weapons/maces/mace03.cgf` |
| `mace03_broken` | `objects/manmade/weapons/maces/mace03_damaged.cgf` |
| `mace04` | `objects/manmade/weapons/maces/mace04.cgf` |
| `mace04_broken` | `objects/manmade/weapons/maces/mace04_damaged.cgf` |
| `maceBailiff` | `objects/manmade/weapons/maces/bailifsmace.cgf` |
| `maceBailiff_broken` | `objects/manmade/weapons/maces/bailifsmace_damaged.cgf` |
| `maceClub` | `objects/manmade/weapons/maces/club.cgf` |
| `maceClub_broken` | `objects/manmade/weapons/maces/club_damaged.cgf` |
| `maceClubSpiked` | `objects/manmade/weapons/maces/nailedclub.cgf` |
| `maceClubSpiked_broken` | `objects/manmade/weapons/maces/nailedclub_damaged.cgf` |
| `maceClubTraining` | `objects/manmade/weapons/maces/club.cgf` |
| `maceDagger` | `objects/manmade/weapons/war_hammers/daggermace.cgf` |
| `maceDagger_broken` | `objects/manmade/weapons/war_hammers/daggermace_damaged.cgf` |
| `maceHeavy` | `objects/manmade/weapons/maces/heavymace.cgf` |
| `maceHeavy_broken` | `objects/manmade/weapons/maces/heavymace_damaged.cgf` |
| `maceHetman` | `objects/manmade/weapons/maces/hetmansmace.cgf` |
| `maceHetman_broken` | `objects/manmade/weapons/maces/hetmansmace_damaged.cgf` |
| `maceZizka` | `objects/manmade/weapons/maces/mace_zizka.cgf` |
| `maceZizka_broken` | `objects/manmade/weapons/maces/mace_zizka_damaged.cgf` |
| `naTroskach_axeKolda_broken` | `objects/manmade/weapons/axes/workaxe01_damaged.cgf` |
| `taboryLapkuTrosecko_plesnivecMace` | `objects/manmade/weapons/maces/mace_zizka.cgf` |
| `taboryLapkuTrosecko_plesnivecMace_broken` | `objects/manmade/weapons/maces/mace_zizka_damaged.cgf` |
| `tournament_maceHerald` | `objects/manmade/weapons/maces/tournament_mace_herald.cgf` |
| `tournament_maceHerald_broken` | `objects/manmade/weapons/maces/tournament_mace_herald_damaged.cgf` |
| `warhammer01` | `objects/manmade/weapons/war_hammers/warhammer01.cgf` |
| `warhammer01_broken` | `objects/manmade/weapons/war_hammers/warhammer01_damaged.cgf` |
| `warhammer02` | `objects/manmade/weapons/war_hammers/warhammer02.cgf` |
| `warhammer02_broken` | `objects/manmade/weapons/war_hammers/warhammer02_damaged.cgf` |
| `warhammer03` | `objects/manmade/weapons/war_hammers/warhammer03.cgf` |
| `warhammer03_broken` | `objects/manmade/weapons/war_hammers/warhammer03_damaged.cgf` |
| `warhammer03_trollslayer` | `objects/manmade/weapons/war_hammers/warhammer03.cgf` |
| `warhammer03_trollslayer_broken` | `objects/manmade/weapons/war_hammers/warhammer03_damaged.cgf` |
| `warhammer04` | `objects/manmade/weapons/war_hammers/warhammer04.cgf` |
| `warhammer04_broken` | `objects/manmade/weapons/war_hammers/warhammer04_damaged.cgf` |
| `warhammerRaven` | `objects/manmade/weapons/war_hammers/ravensbeak.cgf` |
| `warhammerRaven_broken` | `objects/manmade/weapons/war_hammers/ravensbeak_damaged.cgf` |
| `warhammerStab` | `objects/manmade/weapons/war_hammers/stabhammer.cgf` |
| `warhammerStab_broken` | `objects/manmade/weapons/war_hammers/stabhammer_damaged.cgf` |
| `zbranePanaSemina_sukClub` | `objects/manmade/weapons/maces/nailedclub.cgf` |

</details>

<details>
<summary><code>meat</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `tool_dog_meat` | `objects/manmade/task_specific_props/animal_keeping/dog/dog_meat.cgf` |

</details>

<details>
<summary><code>milkpan</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `creamPot` | `objects/manmade/task_specific_props/food_processing/milk_processing/milkpan.cgf` |

</details>

<details>
<summary><code>pavise</code> (11)</summary>

| Prop | Model |
| --- | --- |
| `battle_pavise` | `objects/manmade/task_specific_props/combat/pavises/pavise_a.cgf` |
| `battle_pavise_prague_1` | `objects/manmade/task_specific_props/combat/pavises/pavise_a.cgf` |
| `battle_pavise_prague_2` | `objects/manmade/task_specific_props/combat/pavises/pavise_a.cgf` |
| `battle_pavise_prague_3` | `objects/manmade/task_specific_props/combat/pavises/pavise_a.cgf` |
| `battle_pavise_prague_4` | `objects/manmade/task_specific_props/combat/pavises/pavise_a.cgf` |
| `battle_pavise_prague_5` | `objects/manmade/task_specific_props/combat/pavises/pavise_a.cgf` |
| `battle_pavise_proxyLow` | `objects/quest_items/pavises/pavise_a_lowproxy.cgf` |
| `battle_pavise_suchdol_1` | `objects/quest_items/pavises/pavise_a_lowproxy.cgf` |
| `battle_pavise_suchdol_2` | `objects/quest_items/pavises/pavise_a_lowproxy.cgf` |
| `battle_pavise_suchdol_3` | `objects/quest_items/pavises/pavise_a_lowproxy.cgf` |
| `battle_pavise_suchdol_4` | `objects/quest_items/pavises/pavise_a_lowproxy.cgf` |

</details>

<details>
<summary><code>pickaxe</code> (2)</summary>

| Prop | Model |
| --- | --- |
| `pick` | `objects/manmade/task_specific_props/metal_industry/mining/pick.cgf` |
| `pick_a` | `objects/manmade/task_specific_props/metal_industry/mining/pick.cgf` |

</details>

<details>
<summary><code>plate</code> (15)</summary>

| Prop | Model |
| --- | --- |
| `bowl` | `objects/manmade/food/food/mushes/bowl_beans_empty.cgf` |
| `bowl_bakery` | `objects/manmade/food/food/bowl_chicken_thighs_empty.cgf` |
| `bowl_beans` | `objects/manmade/food/food/mushes/bowl_beans_empty.cgf` |
| `bowl_goulash` | `objects/manmade/food/food/mushes/bowl_goulash_empty.cgf` |
| `bowl_lentil` | `objects/manmade/food/food/mushes/bowl_lentil_empty.cgf` |
| `bowl_noPhaseReset` | `objects/manmade/food/food/mushes/bowl_beans_empty.cgf` |
| `bowl_sausages` | `objects/manmade/food/food/bowl_kielbasas_smoked_full.cgf` |
| `bowl_soup` | `objects/manmade/food/food/mushes/bowl_soup_empty.cgf` |
| `bowl_tin_goulash` | `objects/manmade/food/food/mushes/bowl_goulash_tin_empty.cgf` |
| `bowl_tin_goulash_full` | `objects/manmade/food/food/mushes/bowl_goulash_tin.cgf` |
| `bowl_tin_lentil` | `objects/manmade/food/food/mushes/bowl_lentil_tin_empty.cgf` |
| `bowl_tin_soup` | `objects/manmade/food/food/mushes/bowl_soup_tin_empty.cgf` |
| `bowl_tin_soup_full` | `objects/manmade/food/food/mushes/bowl_soup_tin.cgf` |
| `chair_test` | `objects/manmade/common_furniture/chairs/low/chair_rustic_d.cgf` |
| `pigEatingBowl` | `objects/manmade/food/food/mushes/bowl_pig_feed.cgf` |

</details>

<details>
<summary><code>pouch</code> (2)</summary>

| Prop | Model |
| --- | --- |
| `henGrainSack` | `objects/manmade/task_specific_props/alchemy/herbs/grain_pouch_a.cgf` |
| `herbSack` | `objects/manmade/task_specific_props/alchemy/herbs/herbs_pouch_a.cgf` |

</details>

<details>
<summary><code>quiver</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `quiver` | `objects/manmade/task_specific_props/combat/archery/quiver_with_arrows.cgf` |

</details>

<details>
<summary><code>sabre</code> (4)</summary>

| Prop | Model |
| --- | --- |
| `kovaniVajdovaKletba_botchedRikonaris` | `objects/manmade/weapons/sabres/sabre_noble.cgf` |
| `kovaniVajdovaKletba_rikonaris` | `objects/manmade/weapons/sabres/sabre_noble.cgf` |
| `sabreCommon` | `objects/manmade/weapons/sabres/sabre_common.cgf` |
| `sabreNoble` | `objects/manmade/weapons/sabres/sabre_noble.cgf` |

</details>

<details>
<summary><code>sack</code> (18)</summary>

| Prop | Model |
| --- | --- |
| `kejkliri_sackcarryable` | `objects/manmade/common_furniture/sacks/sack_wearable.cgf` |
| `klasterniTajemstvi_sackcarryable` | `objects/manmade/common_furniture/sacks/sack_wearable.cgf` |
| `kralovskeStribro_sackcarryable` | `objects/manmade/common_furniture/sacks/sack_wearable.cgf` |
| `magickySip_sackcarryable` | `objects/manmade/common_furniture/sacks/sack_wearable.cgf` |
| `mlynaruvUcen_sackcarryable` | `objects/manmade/common_furniture/sacks/sack_wearable.cgf` |
| `naTroskach_sackcarryable` | `objects/manmade/common_furniture/sacks/sack_wearable.cgf` |
| `nebakovObrana_sackcarryable` | `objects/manmade/common_furniture/sacks/sack_wearable.cgf` |
| `poustevnik_sackcarryable` | `objects/manmade/common_furniture/sacks/sack_wearable.cgf` |
| `rasuvUcen_sackcarryable` | `objects/manmade/common_furniture/sacks/sack_wearable.cgf` |
| `sack` | `objects/manmade/common_furniture/sacks/sack_wearable.cgf` |
| `sack_a` | `objects/manmade/common_furniture/sacks/sack_wearable.cgf` |
| `sack_miller` | `objects/manmade/common_furniture/sacks/sack_wearable.cgf` |
| `sack_miller_dark` | `objects/manmade/common_furniture/sacks/sack_wearable_dark.cgf` |
| `socky_sackcarryable` | `objects/manmade/common_furniture/sacks/sack_wearable.cgf` |
| `uchazec_sackcarryableAnvil` | `objects/manmade/common_furniture/sacks/sack_wearable_dark.cgf` |
| `uchazec_sackcarryableBed` | `objects/manmade/common_furniture/sacks/sack_wearable_dark.cgf` |
| `uchazec_sackcarryableGate` | `objects/manmade/common_furniture/sacks/sack_wearable_dark.cgf` |
| `uchazec_sackcarryableWindow` | `objects/manmade/common_furniture/sacks/sack_wearable_dark.cgf` |

</details>

<details>
<summary><code>shield</code> (17)</summary>

| Prop | Model |
| --- | --- |
| `dvojityAgent_petrsShield` | `objects/manmade/weapons/shields/shield_kite_blank.cgf` |
| `shieldCuman` | `objects/manmade/weapons/shields/shield_cuman_blank.cgf` |
| `shieldHeater_eagle_A` | `objects/manmade/weapons/shields/shield_heater_blank.cgf` |
| `shieldHeater_eagle_A_broken` | `objects/manmade/weapons/shields/shield_heater_blank.cgf` |
| `shieldHeater_eagle_B` | `objects/manmade/weapons/shields/shield_heater_blank.cgf` |
| `shieldHeater_eagle_B_broken` | `objects/manmade/weapons/shields/shield_heater_blank.cgf` |
| `shieldHeater_peony` | `objects/manmade/weapons/shields/shield_heater_blank.cgf` |
| `shieldHeater_prague_D` | `objects/manmade/weapons/shields/shield_heater_blank.cgf` |
| `shieldHeater_zavis` | `objects/manmade/weapons/shields/shield_heater_blank.cgf` |
| `shieldHeater_zavis_broken` | `objects/manmade/weapons/shields/shield_heater_blank.cgf` |
| `shieldHeater_zizka` | `objects/manmade/weapons/shields/shield_heater_blank.cgf` |
| `shieldHeater_zizka_broken` | `objects/manmade/weapons/shields/shield_heater_blank.cgf` |
| `shieldKite_whole_W` | `objects/characters/humans/male/weapon/shield/shield_kite_blank.cgf` |
| `shieldKite_whole_W_broken` | `objects/characters/humans/male/weapon/shield/shield_kite_blank.cgf` |
| `shieldKiteTraining` | `objects/characters/humans/male/weapon/shield/shield_kite_blank.cgf` |
| `zbranePanaSemina_sukShield_broken` | `objects/characters/humans/male/weapon/shield/shield_kite_blank.cgf` |
| `ztracenaCest_lordsOfHolohlavShield` | `objects/manmade/weapons/shields/shield_heater_blank.cgf` |

</details>

<details>
<summary><code>shoppingBasket</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `shoppingbasket` | `objects/manmade/common_furniture/baskets/basket_cloth.cgf` |

</details>

<details>
<summary><code>shovel</code> (2)</summary>

| Prop | Model |
| --- | --- |
| `shovel` | `objects/manmade/common_tools/shovel.cgf` |
| `shovel_a` | `objects/manmade/common_tools/shovel.cgf` |

</details>

<details>
<summary><code>stein</code> (6)</summary>

| Prop | Model |
| --- | --- |
| `wineJug` | `objects/manmade/task_specific_props/household/cooking_eating/jugs/jug_wine.cgf` |
| `wineJug_broader` | `objects/manmade/task_specific_props/household/cooking_eating/jugs/jug_wine_broader.cgf` |
| `wooden_stein` | `objects/manmade/task_specific_props/entertainment/tavern/stein_wood_a.cgf` |
| `wooden_stein_a` | `objects/manmade/task_specific_props/entertainment/tavern/stein_wood_a.cgf` |
| `wooden_stein_b` | `objects/manmade/task_specific_props/entertainment/tavern/stein_wood_c.cgf` |
| `wooden_stein_spa` | `objects/manmade/task_specific_props/entertainment/tavern/stein_wood_a.cgf` |

</details>

<details>
<summary><code>stoneBasket</code> (1)</summary>

| Prop | Model |
| --- | --- |
| `stonebasket` | `objects/manmade/common_tools/stonebasket.cgf` |

</details>

<details>
<summary><code>sword</code> (73)</summary>

| Prop | Model |
| --- | --- |
| `bratriZCimburka_balsanSword` | `objects/manmade/weapons/swords_short/short_sword_broad.cgf` |
| `bratriZCimburka_balsanSword_broken` | `objects/manmade/weapons/swords_short/short_sword_broad_damaged.cgf` |
| `dvojityAgent_petrsShortSword` | `objects/manmade/weapons/swords_short/dvojityagent_petrs_short_sword.cgf` |
| `dvojityAgent_petrsShortSword_broken` | `objects/manmade/weapons/swords_short/dvojityagent_petrs_short_sword_damaged.cgf` |
| `huntingSwordBasic` | `objects/manmade/weapons/hunting_swords/hunting_sword_basic.cgf` |
| `huntingSwordBasic_broken` | `objects/manmade/weapons/hunting_swords/hunting_sword_basic_damaged.cgf` |
| `huntingSwordFalchion` | `objects/manmade/weapons/hunting_swords/hunting_sword_falchion.cgf` |
| `huntingSwordFalchion_broken` | `objects/manmade/weapons/hunting_swords/hunting_sword_falchion_damaged.cgf` |
| `huntingSwordGuard` | `objects/manmade/weapons/hunting_swords/hunting_sword_guard.cgf` |
| `huntingSwordGuard_broken` | `objects/manmade/weapons/hunting_swords/hunting_sword_guard_damaged.cgf` |
| `huntingSwordMussle` | `objects/manmade/weapons/hunting_swords/hunting_sword_mussle.cgf` |
| `huntingSwordMussle_broken` | `objects/manmade/weapons/hunting_swords/hunting_sword_mussle_damaged.cgf` |
| `huntingSwordSashka` | `objects/manmade/weapons/hunting_swords/hunting_sword_sashka.cgf` |
| `huntingSwordSashka_broken` | `objects/manmade/weapons/hunting_swords/hunting_sword_sashka_damaged.cgf` |
| `huntingSwordSword` | `objects/manmade/weapons/hunting_swords/hunting_sword_sword.cgf` |
| `huntingSwordSword_broken` | `objects/manmade/weapons/hunting_swords/hunting_sword_sword_damaged.cgf` |
| `kovaniKopie_longSwordAbsolver_broken` | `objects/manmade/weapons/swords_long/long_sword_sturdy_damaged.cgf` |
| `kovaniKopie_penitent_broken` | `objects/manmade/weapons/swords_long/long_sword_sturdy_damaged.cgf` |
| `kovaniKovarskaSoutez_huntingKnifeApprentice` | `objects/manmade/weapons/hunting_swords/hunting_sword_basic.cgf` |
| `kovaniKovarskaSoutez_huntingKnifeApprentice_broken` | `objects/manmade/weapons/hunting_swords/hunting_sword_basic_damaged.cgf` |
| `kovaniKovarskaSoutez_huntingKnifeForContest` | `objects/manmade/weapons/hunting_swords/hunting_sword_basic.cgf` |
| `kovaniKovarskaSoutez_huntingKnifeForContest_broken` | `objects/manmade/weapons/hunting_swords/hunting_sword_basic_damaged.cgf` |
| `kovaniNaKovarne_pajslSword` | `objects/manmade/weapons/swords_short/short_sword_common.cgf` |
| `kovaniNaKovarne_pajslSword_broken` | `objects/manmade/weapons/swords_short/short_sword_common_damaged.cgf` |
| `kovaniNaKovarne_smithsDefense` | `objects/manmade/weapons/swords_short/short_sword_common.cgf` |
| `kovaniNaKovarne_smithsDefense_broken` | `objects/manmade/weapons/swords_short/short_sword_common_damaged.cgf` |
| `kovaniRelikvie_shortSwordKnightValentin` | `objects/manmade/weapons/swords_short/short_sword_knight_valentin.cgf` |
| `kovaniRelikvie_shortSwordKnightValentin_broken` | `objects/manmade/weapons/swords_short/short_sword_knight_valentin_damaged.cgf` |
| `kovaniSymbolSermirny_longSwordGuildRemake_broken` | `objects/manmade/weapons/swords_long/sermiri_long_sword_guild_damaged.cgf` |
| `kovaniVajdovaKletba_botchedRikonaris_broken` | `objects/manmade/weapons/sabres/sabre_noble_damaged.cgf` |
| `kovaniVajdovaKletba_rikonaris_broken` | `objects/manmade/weapons/sabres/sabre_noble_damaged.cgf` |
| `kovarskeZakazky_excalibur_broken` | `objects/manmade/weapons/swords_long/long_sword_old_damaged.cgf` |
| `longswordBroad_broken` | `objects/manmade/weapons/swords_long/long_sword_broad_damaged.cgf` |
| `longswordCommon_broken` | `objects/manmade/weapons/swords_long/long_sword_common_damaged.cgf` |
| `longSwordDuel_broken` | `objects/manmade/weapons/swords_long/long_sword_duel_damaged.cgf` |
| `longSwordDuel_khTournament_broken` | `objects/manmade/weapons/swords_long/long_sword_duel_damaged.cgf` |
| `longswordOld_broken` | `objects/manmade/weapons/swords_long/long_sword_old_damaged.cgf` |
| `longswordRadzig_broken` | `objects/manmade/weapons/swords_long/long_sword_henry_damaged.cgf` |
| `longswordSturdy_broken` | `objects/manmade/weapons/swords_long/long_sword_sturdy_damaged.cgf` |
| `longswordTraining_broken` | `objects/manmade/weapons/swords_long/long_sword_training_damaged.cgf` |
| `nemcuvPoklad_bejkovecShortSwordRusty` | `objects/manmade/weapons/swords_short/short_sword_basilard.cgf` |
| `nemcuvPoklad_bejkovecShortSwordRusty_broken` | `objects/manmade/weapons/swords_short/short_sword_basilard_damaged.cgf` |
| `oblehaniSuchdole_oldSword_broken` | `objects/manmade/weapons/swords_long/long_sword_old_damaged.cgf` |
| `sabreCommon_broken` | `objects/manmade/weapons/sabres/sabre_common_damaged.cgf` |
| `sabreNoble_broken` | `objects/manmade/weapons/sabres/sabre_noble_damaged.cgf` |
| `sermiry_huntingSwordJimram` | `objects/manmade/weapons/hunting_swords/hunting_sword_falchion.cgf` |
| `sermiry_huntingSwordJimram_broken` | `objects/manmade/weapons/hunting_swords/hunting_sword_falchion_damaged.cgf` |
| `sermiry_longSwordGuild_broken` | `objects/manmade/weapons/swords_long/sermiri_long_sword_guild_damaged.cgf` |
| `sermiry_longSwordMenhart_broken` | `objects/manmade/weapons/swords_long/sermiri_long_sword_menhart_damaged.cgf` |
| `sermiry_trainingSword_broken` | `objects/manmade/weapons/swords_long/long_sword_common_damaged.cgf` |
| `shortSwordBasilard` | `objects/manmade/weapons/swords_short/short_sword_basilard.cgf` |
| `shortSwordBasilard_broken` | `objects/manmade/weapons/swords_short/short_sword_basilard_damaged.cgf` |
| `shortswordBergov` | `objects/manmade/weapons/swords_short/short_sword_ceremony.cgf` |
| `shortswordBergov_broken` | `objects/manmade/weapons/swords_short/short_sword_ceremony_damaged.cgf` |
| `shortswordBrabant` | `objects/manmade/weapons/swords_short/short_sword_ceremony.cgf` |
| `shortswordBrabant_broken` | `objects/manmade/weapons/swords_short/short_sword_ceremony_damaged.cgf` |
| `shortswordBroad` | `objects/manmade/weapons/swords_short/short_sword_broad.cgf` |
| `shortswordBroad_broken` | `objects/manmade/weapons/swords_short/short_sword_broad_damaged.cgf` |
| `shortswordCeremony` | `objects/manmade/weapons/swords_short/short_sword_ceremony.cgf` |
| `shortswordCeremony_broken` | `objects/manmade/weapons/swords_short/short_sword_ceremony_damaged.cgf` |
| `shortswordCleaver` | `objects/manmade/weapons/swords_short/short_sword_cleaver.cgf` |
| `shortswordCommon` | `objects/manmade/weapons/swords_short/short_sword_common.cgf` |
| `shortswordCommon_broken` | `objects/manmade/weapons/swords_short/short_sword_common_damaged.cgf` |
| `shortswordCommon_khTournament` | `objects/manmade/weapons/swords_short/short_sword_common.cgf` |
| `shortswordCommon_khTournament_broken` | `objects/manmade/weapons/swords_short/short_sword_common_damaged.cgf` |
| `shortswordHeavy` | `objects/manmade/weapons/swords_short/short_sword_zizka.cgf` |
| `shortswordHeavy_broken` | `objects/manmade/weapons/swords_short/short_sword_zizka_damaged.cgf` |
| `shortSwordStGeorge_broken` | `objects/manmade/weapons/swords_short/short_sword_stgeorge_damaged.cgf` |
| `shortswordTraining` | `objects/manmade/weapons/swords_short/short_sword_training.cgf` |
| `shortswordTraining_broken` | `objects/manmade/weapons/swords_short/short_sword_training_damaged.cgf` |
| `stealthMiseZaJindru_samHuntingKnife` | `objects/manmade/weapons/hunting_swords/hunting_sword_basic.cgf` |
| `stealthMiseZaJindru_samHuntingKnife_broken` | `objects/manmade/weapons/hunting_swords/hunting_sword_basic_damaged.cgf` |
| `tournament_kuttenbergSword_broken` | `objects/manmade/weapons/swords_long/sermiri_long_sword_guild_damaged.cgf` |

</details>

<details>
<summary><code>tankard</code> (4)</summary>

| Prop | Model |
| --- | --- |
| `goblet_gold` | `objects/manmade/task_specific_props/religious/chalice_gold_b.cgf` |
| `goblet_silver` | `objects/manmade/task_specific_props/religious/chalice_silver_b.cgf` |
| `stealthMiseZaJindru_aulitzsGoblet` | `objects/manmade/task_specific_props/religious/chalice_silver_b.cgf` |
| `tankard_beer` | `objects/manmade/task_specific_props/household/cooking_eating/tankards/wood_tankard.cgf` |

</details>

<details>
<summary><code>torch</code> (4)</summary>

| Prop | Model |
| --- | --- |
| `oblehaniSuchdole_flag` | `objects/manmade/common_decorations/flags/flag_table_pile_a.cgf` |
| `rutinaAVypad_trackview_torch_weapon` | `objects/manmade/common_illumination/torch_player.cgf` |
| `torch_tool` | `objects/manmade/common_illumination/torch_short_a.cgf` |
| `torch_weapon` | `objects/manmade/common_illumination/torch_player.cgf` |

</details>

<details>
<summary><code>tray</code> (3)</summary>

| Prop | Model |
| --- | --- |
| `chicken_thigh_bowl` | `objects/manmade/food/food/bowl_chicken_thighs_4_thigh.cgf` |
| `chicken_thigh_bowl_tin` | `objects/manmade/food/food/bowl_chicken_thighs_4_tin.cgf` |
| `meal_tray_empty` | `objects/manmade/food/food/bowl_chicken_thighs_empty.cgf` |

</details>

<!-- /generated:props -->

## Emotes

The gestures the emote wheel can put in a slot, from
[`EmoteWheel.getCatalog`](../../reference/client/variables/EmoteWheel.md#getcatalog) on the client.

```ts
// client
EmoteWheel.setSlot(0, 5); // the top slot bows
```

<!-- generated:emotes -->

| Id | Name | Body | Lasts | Fragment | Tag |
| --- | --- | --- | --- | --- | --- |
| 1 | Wave | Upper body | 2.8 s | `GreetingsUpperBody` | `waveSmall` |
| 2 | Big wave | Upper body | 4.2 s | `GreetingsUpperBody` | `waveBig` |
| 3 | Nod | Upper body | 2.2 s | `GreetingsUpperBody` | `nod` |
| 4 | Respectful nod | Upper body | 1.8 s | `GreetingsUpperBody` | `nodSubmissive` |
| 5 | Bow | Whole body | 3.0 s | `Greetings` | `bowBig` |
| 6 | Cheer | Whole body | 3.9 s | `TournamentCheersHappyGesture` |  |

<!-- /generated:emotes -->
