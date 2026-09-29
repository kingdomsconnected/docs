---
title: Buffs and status effects
description: Every status effect in the game's buff tables, by class, with how long it lasts, plus the classes a server can claim and the tags clearBuffs takes.
sidebar:
  label: Buffs
  order: 117
---

[`player.addBuff`](../../reference/server/classes/Player.md#addbuff) and `hasBuff` take an effect's
name or GUID, [`player.clearBuffs`](../../reference/server/classes/Player.md#clearbuffs) takes a tag,
and [`Buffs.claim`](../../reference/server/variables/Buffs.md#claim) takes classes.

```ts
const info = Buffs.find("food_poison");
if (info) player.addBuff(info.name);
player.clearBuffs("poison");
```

`addBuff` only sticks for effects in a claimable class; see [Buffs](../../players/buffs/) for why,
and for the events.

## Classes

<!-- generated:classes -->

| Class | Effects | Claimable |
| --- | --- | --- |
| `testingStat` | 73 |  |
| `system` | 147 |  |
| `weaponSkill` | 5 |  |
| `testingCombat` | 12 |  |
| `perk` | 297 |  |
| `injury` | 8 | Yes |
| `heal` | 7 | Yes |
| `poison` | 34 | Yes |
| `perception` | 9 | Yes |
| `overeat` | 2 | Yes |
| `alcohol` | 12 | Yes |
| `item` | 21 |  |
| `potion` | 77 | Yes |
| `foodPoison` | 1 | Yes |
| `scriptSystem` | 155 |  |
| `unconsciousness` | 5 | Yes |
| `hangover` | 6 | Yes |
| `satisfaction` | 4 | Yes |
| `perfume` | 13 | Yes |
| `punishment` | 14 | Yes |
| `forcedDrunkenness` | 23 | Yes |
| `plague` | 4 | Yes |

<!-- /generated:classes -->

## Tags

What `player.clearBuffs` takes, in the game's own words:

<!-- generated:tags -->

`alcohol_mood`, `alcohol_drunk`, `alcohol_blackout`, `poison`, `bleed`, `sleep`, `overeat`, `injury`, `savegame`, `q_tournament_poison`, `q_romanceWithTheresa_alphaMale`, `low_health`, `unstream_protection`, `food_poison`, `alcohol_hangover`, `exhausted`, `encumbered`, `smell`, `unconscious`, `potion_nighthawk`, `limb_injury_protection`, `antiPlague`, `dlc2_bed_sleep_alcoTeleport`

<!-- /generated:tags -->

## Effects

**Lasts** is the effect's duration in real time, the same number `Buffs.find` returns. "Game
clock" marks an effect timed by the world clock, which runs 15 times faster than real time by
default; changing the clock's speed does not fast-forward it. **None** is an effect with no
timer of its own, held by a condition or applied as it lands.

<!-- generated:buffs -->

<details>
<summary><code>alcohol</code> (12)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `alcoholism` | Until removed | `cd727cba-0507-4e97-bab9-ae4fe6d55d07` |
| `alcoholism_level1` | Until removed | `072de769-e653-4191-80e6-8c1fcd207d59` |
| `alcoholism_level2` | Until removed | `26ddafa9-42ff-4416-bf7d-2d9aa4075ad0` |
| `alcoholism_level3` | Until removed | `ccc546e2-5a5f-428b-8c79-5d7953218180` |
| `alcoholism_level4` | Until removed | `529f69fb-3da9-4971-b128-4e4bf8c55fe6` |
| `alcoholism_level5` | Until removed | `aa59e6c0-9233-4aab-8a6f-c1c02bd17924` |
| `alcoholism_level6` | Until removed | `57095908-1351-40a3-b8c2-c3f8216b77ad` |
| `drunkenness` | Until removed | `ff92671b-2a82-4def-8d59-51627e0ecfc7` |
| `npc_drunkenness` | Until removed | `ffc20522-134d-4811-8bc5-e933b74b7081` |
| `npc_drunkenness_nonpersistent` | Until removed | `c61da6da-01bc-4f55-8152-7165f46590b3` |
| `quest_hledaniLichtenstejna_udo_drunkenness` | Until removed | `7296d3c1-fca0-48ef-b8af-c2bfad31598c` |
| `quest_ucednik_npcFadingDrunkness` | 3.3 min | `21be065a-31f3-44bb-85c3-96ce42445fd0` |

</details>

<details>
<summary><code>foodPoison</code> (1)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `food_poisoning` | Until removed | `aeef8e78-896a-4106-ab2f-62bec1d98378` |

</details>

<details>
<summary><code>forcedDrunkenness</code> (23)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `player_remove_drunkness` | 1 s | `e928b585-1391-4cbd-84b2-4ed573263efa` |
| `quest_bohutovaVlozka_startQuestDrinkingInPub` | 3.3 min | `f18772f9-99fc-550d-9725-4fddd8574068` |
| `quest_budovaniLazni_drunkAfterParty` | 1 s | `e3453dfa-70f9-49dc-9c0c-8426a7c532c2` |
| `quest_erik_forceDrunkenness0` | Until removed | `d6707e6d-bd5f-4e09-ae0d-40dc65ba983e` |
| `quest_fistfightsChampion_drinkingWithBarnabas_alcoholStartState` | 3.3 min | `d53e09a0-1b8a-43eb-8be3-673108ed2569` |
| `quest_kejkliri_drunkLuteCrusher` | 3.3 min | `a05916dd-634b-4c11-81b6-6dc8e4bd52cd` |
| `quest_kumaniNaTrosecku_campDrinkingFirstPhase` | 3.3 min | `73094e4b-b127-4112-854f-3a6885cbb8de` |
| `quest_kumaniNaTrosecku_campDrinkingFirstPhase_nonpersistent` | Until removed | `62bf2a7f-bddb-4bec-9a1c-071e472ae607` |
| `quest_kumaniNaTrosecku_campDrinkingSecondPhase` | 3.3 min | `d41d5f5f-caa1-4207-8a02-bc6f7f7b911f` |
| `quest_kumaniNaTrosecku_campDrinkingSecondPhaseNotSoDrunk` | 3.3 min | `14353495-866f-471a-b446-7a3e1099c35c` |
| `quest_kumaniNaTrosecku_campDrinkingSecondPhaseNotSoDrunk_nonpersistent` | Until removed | `dfeb773e-6270-4ffa-92c7-09772a914dcb` |
| `quest_kumaniNaTrosecku_campDrinkingSecondPhase_nonpersistent` | Until removed | `66a4bda4-a8d6-47ac-a4d1-b166ce62aea9` |
| `quest_prepadeniVlasskehoDvora_bohutaDrunkenness_nonpersistent` | 1 s | `973a0f71-595d-48ca-91d2-d770951fd5d6` |
| `quest_sedmStatecnych2_drinkingSecondPhaseDrunk_nonpersistent` | Until removed | `fa71d1ee-10de-4835-8d77-688558d4d033` |
| `quest_setkaniVRatbori2_drunkBohuta` | 5 s | `7028ef11-7dbf-44ad-b3b6-e8795e0a7f2d` |
| `quest_ucednik_drunkness_blackout` | 1 min | `09e69c2c-023b-4822-81c8-de14570e5e22` |
| `quest_ucednik_specialDrunk` | 1 s | `2da23f38-bf0d-4ee3-9c89-66aa93082dd0` |
| `quest_ucednik_specialDrunk_nonpersistent` | Until removed | `873606da-21cb-4274-91ce-a7943dff9586` |
| `quest_zikmunduvTabor_dedrunk` | 1 s | `e8541aae-07e1-87ca-8cfd-a462a12a8080` |
| `quest_zikmunduvTabor_drunkHard` | 1 s | `fbda778d-108a-9fe8-9cdf-322c1124358e` |
| `quest_zikmunduvTabor_drunkLight` | 1 s | `fdba522c-558a-8ed7-2acf-259a6873279d` |
| `quest_zoufalaObranaZaBohutu_drunkBohuta` | Until removed | `3201fd57-2853-4b22-9def-197056571cfd` |
| `test_drunkness_blackout` | Until removed | `b989d448-056c-4be4-b0a8-727775b0e855` |

</details>

<details>
<summary><code>hangover</code> (6)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `hangover` | 6.67 s, game clock | `7e252c71-5e41-472c-ad32-f223a664faab` |
| `quest_budovaniLazni_hangover` | 5.6 min, game clock | `34df201f-6674-4b94-8d84-0967ba735728` |
| `quest_kocovnickaCest_campCelebration_hangover` | 20 s, game clock | `b8f6812f-fb42-475d-b630-72dcf2516877` |
| `quest_kumaniNaTrosecku_campDrinkingHangover` | 5.6 min, game clock | `75ad69c0-51be-451f-a455-00ea054b5da0` |
| `quest_sedmStatecnychDva_hangover` | 20 s, game clock | `e8bb8423-3c1d-483d-9af7-6b27835216b5` |
| `quest_zoufalaObranaZaBohutu_hangover` | 33.33 s, game clock | `b562abfc-2b45-45b7-824c-62fbd10dc123` |

</details>

<details>
<summary><code>heal</code> (7)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `food_heal` | Until removed | `d8ef78c6-c535-4436-b9df-5d9e86e153ac` |
| `full_heal` | 1 min | `3fc3bea1-81e6-4620-8ad7-887714193126` |
| `half_heal` | 30 s | `27f2305e-8b64-4426-ae2f-203ddf38b80b` |
| `horse_regeneration` | Until removed | `52ada4a7-b8a2-466c-a3ef-bcba8daf18e1` |
| `instant_cure` | 1 s | `e860a7b2-dce1-4a77-a746-971ed8f537cf` |
| `miraculous_cure` | 10 s | `f29ee947-a131-4597-8ed7-6f06aca0a4a2` |
| `thirty_heal` | 1 min | `16aac08d-aed6-46cd-9794-d90b836d1c01` |

</details>

<details>
<summary><code>injury</code> (8)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `injured_head` | Until removed | `c48e48e2-ae85-4429-9dd6-4fb94c388001` |
| `injured_left_arm` | Until removed | `34f0885b-7287-4881-907f-f19751a5e831` |
| `injured_left_leg` | Until removed | `10fc25ca-c095-44c6-b88b-d54ad58ab0a6` |
| `injured_right_arm` | Until removed | `ce3737db-b0a3-459d-8d47-d58695d58be3` |
| `injured_right_leg` | Until removed | `738f8a07-c5fd-4687-9408-34ffb0bcd17e` |
| `injured_torso` | Until removed | `37d59205-3782-446d-b32e-89a9f786725d` |
| `remove_injuries` | 1 s | `46683e3b-e261-412f-b402-99ee17dda62a` |
| `test_bleeding` | Until removed | `b0247507-ca18-4277-a037-ee3a9274e625` |

</details>

<details>
<summary><code>item</code> (21)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `bow_self_harm_attack` | Until removed | `f8558fe2-f4cd-4899-932b-82e0e15fa964` |
| `item_apron` | Until removed | `5601746a-f692-4e65-a498-8102ed42cbcf` |
| `item_bigger_dread` | Until removed | `4296e6e9-1f10-400c-b009-ccc67461848c` |
| `item_bridle` | Until removed | `061d9f55-6652-461f-bb64-471a631f2d21` |
| `item_caparison` | Until removed | `78dab124-7126-493c-b651-66258042570f` |
| `item_gloves` | Until removed | `1b569025-da7e-44d4-a167-fa7972050085` |
| `item_halberd` | Until removed | `8938ac5f-35d3-44dc-8251-97df7570b672` |
| `item_horsePadded` | Until removed | `3339697b-c4de-4df1-b49e-9a57c8c0bb7f` |
| `item_horsePlate` | Until removed | `2aef664e-3b40-4a59-bedf-6af5a83a2720` |
| `item_horse_saddle` | Until removed | `e2f2e0c7-b1d0-4ec5-8f1f-9f412f547f2d` |
| `item_horse_shoe` | Until removed | `41e625ec-7783-46fd-8409-e2f05d93d023` |
| `item_one_hand_longsword` | Until removed | `bf861d60-b892-42a3-9c3b-d3787362f88b` |
| `item_shield` | Until removed | `8a5dd3a2-04e1-4ce7-8833-9252b410662b` |
| `item_spectacles` | Until removed | `30750623-dc45-4fa2-b82d-ae1ef8c52a8a` |
| `item_spur` | Until removed | `62ae725e-56d9-46fa-a09a-794480b757a5` |
| `item_torch` | Until removed | `f32f52ad-64a8-4a77-a118-707f7c86a7cc` |
| `perk_experimental_powder` | Until removed | `11fd0a23-9871-48e1-8eeb-e5dfac149f9c` |
| `perk_razor_sharp` | 10 min | `c9b42294-ea97-4943-9196-84c85ad602c4` |
| `poi_crayfishBlueCooked` | 1 h | `d4969aad-6ac6-4940-b458-71e5348a1792` |
| `poi_zlodejZeli_sauerkraut` | 1 h | `227015bf-ba96-4e11-874d-5f3874b1cb3c` |
| `thunderStone` | Until removed | `3e330171-aa47-4a93-80e4-bc3d26d3650c` |

</details>

<details>
<summary><code>overeat</code> (2)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `overeat` | Until removed | `e855944d-493e-4a25-b77c-005dcdf503fe` |
| `potion_antidote` | 20 s | `81886e93-8aba-4480-aa3b-d2c0a86447d7` |

</details>

<details>
<summary><code>perception</code> (9)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `deafness` | Until removed | `8af7dac3-3cfd-4a0e-aa7f-58db4311660d` |
| `interrupt_deafness` | Until removed | `1951e0bc-532d-4813-a64d-38ef635b3fd5` |
| `percept_combat` | Until removed | `7fa46759-36ce-49e3-8a37-99081c07ca05` |
| `percept_prio_big_boost` | Until removed | `c467caae-bce9-4bb8-bf57-4e7a5ba01b20` |
| `percept_prio_medium_boost` | Until removed | `bee2ec16-7993-4c41-b94f-1ca3ad273c62` |
| `percept_prio_small_boost` | Until removed | `c46c670f-0d0a-4664-9df0-922ae5cd7d3f` |
| `poor_hearing` | 3 min | `29336a21-dd76-447b-a4f0-94dd6b9db466` |
| `vigilant` | Until removed | `43873196-0efc-48ee-81d2-30909c3700eb` |
| `vigilant_nonAlerted` | Until removed | `8448dd2a-2f0f-45e6-ab54-e14c517f12eb` |

</details>

<details>
<summary><code>perfume</code> (13)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `perfume_longWeak` | 20 min | `5d07a436-c01f-4062-b5c4-0c3ec3c8185d` |
| `perfume_longWeak_2` | 20 min | `caf16a25-b138-46bf-b7d3-63f8b2e9bb91` |
| `perfume_longWeak_3` | 30 min | `43cd3832-7a94-45e2-95f9-a8632fc861b8` |
| `perfume_longWeak_4` | 40 min | `3190c8ba-5aa2-4825-9e96-03387983f9cd` |
| `perfume_morovyOblek_aetherOil` | 10 min | `6f516071-b977-4e84-bb9f-d2b5850f6fb7` |
| `perfume_morovyOblek_aetherOil_2` | 15 min | `6cd29b76-a8e8-4b65-9f48-030fa90c5025` |
| `perfume_morovyOblek_aetherOil_3` | 1.6 h | `4e87d153-c0ff-41ce-90fa-51cdf25b0923` |
| `perfume_morovyOblek_aetherOil_4` | 30 min | `88afdcff-5728-4c38-99e6-4746395eab12` |
| `perfume_shortStrong` | 3 min | `b0b520e9-a85f-4698-ad8c-e46ea32d7d65` |
| `perfume_shortStrong_2` | 4 min | `a047a33e-4715-41c1-977f-1a5f454e30e7` |
| `perfume_shortStrong_3` | 5 min | `714a027c-b5d4-4816-a1d3-f89764997bde` |
| `perfume_shortStrong_4` | 10 min | `b6ab81fb-5c59-47ac-8ca1-a4f9a97f1828` |
| `short_period_perfume` | 30 s | `1aa6a7cc-4cee-4b73-8080-562bebc21443` |

</details>

<details>
<summary><code>perk</code> (297)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `alcoholAddictionBohuta` | Until removed | `2c5a7879-8fa0-4fb2-a6d4-3f66bbd51021` |
| `buff_infinite_blindness` | Until removed | `443e14f2-0b9c-4be5-a1ab-b62faae938b1` |
| `closed_visor_debuff` | Until removed | `25f95783-b9a6-4554-aab2-48b43dd9280b` |
| `on_washed` | Until removed | `9b308d86-b3c5-4b85-b6fc-c1a4c4af2abf` |
| `perk_adept_of_mystic_arts` | Until removed | `2f8acda9-2d7a-4c06-baef-19403a5d3767` |
| `perk_against_all_odds` | Until removed | `7f4d0a7e-849b-46a7-a344-f2efa4762f64` |
| `perk_airgiyn_tav` | Until removed | `55d01a54-1de2-4c26-a800-27f115ee720a` |
| `perk_archer` | Until removed | `9dc818e5-c766-4bd2-b3d9-2d5716b67ea5` |
| `perk_art_of_preservation` | Until removed | `0026238d-f360-4c93-a8a2-304fad73f039` |
| `perk_artisan` | Until removed | `837fef23-9600-4d63-a87f-b01649f4536d` |
| `perk_ascetic_digestion` | Until removed | `7edb27d6-448a-46a1-bc02-46de157311d4` |
| `perk_back alley style` | Until removed | `76f01161-4b40-43b3-bf7c-3da14854a407` |
| `perk_balanced_diet` | Until removed | `5d669fd1-0f36-4e30-95b8-1b5e53fac46e` |
| `perk_basic_law_fine` | Until removed | `90381759-5f11-4872-a994-af5878e81189` |
| `perk_basic_law_skillcheck` | Until removed | `be5e9b17-35d6-4b3a-b8cc-bcc7e9023ebd` |
| `perk_basic_medicine` | Until removed | `fdf55b6e-aa26-42c4-8468-8a01a014a796` |
| `perk_basic_medicine_ii` | Until removed | `1f4b4700-8aed-4b4d-8f74-a51c8f246a58` |
| `perk_basic_theology` | 0.13 s, game clock | `b2822778-82e9-4717-bcd0-caadbe2af6bd` |
| `perk_battering_ram_opponent` | 20 s | `d4402c06-3902-486e-99df-1aada37c99ff` |
| `perk_battle_cry` | 20 s | `fe8608bd-78c0-4026-93b0-216dbe10b43f` |
| `perk_battle_cry_ii` | 20 s | `30725214-37be-4afd-aabf-a9a35869be38` |
| `perk_beast_of_a_dog` | Until removed | `ce36a90a-90a3-4ddb-9bab-3b8b791b3d5e` |
| `perk_bigger_they_are_harder_they_fall` | Until removed | `458147cb-540c-4e44-ade3-f3c594e62ecb` |
| `perk_black_arts_apprentice_alchemy` | Until removed | `e53f7108-87a8-4dcd-a07c-7a60c52c5214` |
| `perk_black_arts_apprentice_dialog` | Until removed | `9eda390a-792c-48e0-bc6b-1c0a6d439129` |
| `perk_blacksmithsson` | Until removed | `35595bdd-635f-42f4-bda2-21b99567af5e` |
| `perk_blood_of_siegfried` | Until removed | `e7c785a9-7d40-4997-8fc3-f6a8788c376d` |
| `perk_bloodletter` | Until removed | `1bd49b9c-01c0-4df1-8250-0eab7129ded3` |
| `perk_boid_friend` | Until removed | `2402fe25-e948-4117-9575-87e52d0e2606` |
| `perk_botanicus` | Until removed | `22fa0e64-b33c-4dd9-8c61-7f73b4bfb03e` |
| `perk_breaking_the_law` | 2 min | `4e13c60a-90a5-4c05-877a-d92de0da7214` |
| `perk_brute_force` | Until removed | `3f639ebf-e075-4a95-a825-f7dd6e497178` |
| `perk_brute_force_ii` | Until removed | `4dc34141-7b07-4a4a-8d4f-25959dfc2bfa` |
| `perk_burgess` | Until removed | `3e0867d9-cdb1-469f-a59e-e05a377b2b67` |
| `perk_bushman` | Until removed | `f3325304-6973-4de0-8bc7-63d1dd9203ed` |
| `perk_charlatan` | Until removed | `f741eb92-78bf-4304-8a77-5392ac592eeb` |
| `perk_charming_lad_discounts` | Until removed | `11fab81d-5cbc-41d1-ae2b-a9ff0bc67b57` |
| `perk_charming_lad_skillcheck` | Until removed | `643b1eed-3ab8-4372-bdac-d5b223b234a1` |
| `perk_cheers` | Until removed | `23414b41-fb30-487b-9ec1-1dffb2ac38d0` |
| `perk_cistota_pul_zdravi` | Until removed | `d0ada81c-1131-4056-937f-57b213249fd1` |
| `perk_cleaver` | Until removed | `c6357595-cdd0-41b1-87d7-0549b2a5bdf9` |
| `perk_companion_mouth_full_of_teeth` | Until removed | `46f79eee-2550-47d2-b060-aca53fd67d44` |
| `perk_contemplative` | Until removed | `041bdeeb-cc02-428d-93bb-58dab72010b5` |
| `perk_creative_soul` | Until removed | `2364a338-7feb-41ee-b22e-d8f9cb28a75c` |
| `perk_criminal_price_bonus` | Until removed | `0dd9c972-fc1a-4dbd-bf85-c12dcbea404c` |
| `perk_criminal_stat_bonuses` | Until removed | `14d3c14d-f03a-435b-bb71-b25a7bcb1191` |
| `perk_crippling_hit` | 20 s | `e1b26e00-daa0-487d-9663-ef5164ba14d0` |
| `perk_crippling_hit_ii` | 30 s | `8a085ddc-2775-45d3-8896-a049a6231391` |
| `perk_cuman_killer` | Until removed | `658deed5-9498-41a0-b57f-8e67c3f4f25c` |
| `perk_deceiving_strike` | Until removed | `f1a0dfcd-8ee3-4725-abc8-1348586c5f9f` |
| `perk_defender_companion` | Until removed | `7426839f-07cf-4c68-8d35-896275d381f2` |
| `perk_deft_hands` | Until removed | `3652816f-7376-4afc-a522-7c82df5cc4c6` |
| `perk_deft_hands_ii` | Until removed | `7d77ad5c-6a64-4977-bd53-859e8eb81cee` |
| `perk_discoverer` | Until removed | `fc4f748f-2057-4919-b327-db1893356c39` |
| `perk_dobrej_batvat_to_je_zaklad` | Until removed | `e33475d3-8b9d-464c-8b13-d6b5ce10a170` |
| `perk_dog_person` | Until removed | `d2adfd58-d81e-45e7-b802-d4c21874cc8c` |
| `perk_dominant_hand` | Until removed | `f9959a68-ff94-4410-8c0b-b18a5786398d` |
| `perk_down_to_size_constantBuff` | Until removed | `e1603cc6-12ff-4bf7-9ea2-31cce0595b80` |
| `perk_dread_steed` | Until removed | `22bfeaec-b7b3-48cc-b20c-d4ec72fe13ef` |
| `perk_dreaded_warrior` | 20 s | `54e47564-c338-4de0-808d-fde58ec3c5be` |
| `perk_dreaded_warrior_ii` | 20 s | `377d20b4-836c-4c74-95f1-3148bdf9e29b` |
| `perk_driven_by_vengeance` | Until removed | `8b1ee791-17ee-445f-9be2-cf75da1e719b` |
| `perk_eagle_eye` | 3 s | `4c7ad7f0-4f2b-4624-8bfc-98f0a4336213` |
| `perk_enhancing_mixture` | Until removed | `b7c451f0-1660-4b29-8140-7c79d57420b6` |
| `perk_enthusiast` | Until removed | `999f5d16-64d4-4959-bf07-aef341500d7d` |
| `perk_fast_as_a_wind_companion` | Until removed | `5efbe307-0880-4315-bf9a-455c20742e9b` |
| `perk_fast_as_a_wind_ii_companion` | Until removed | `3d43de70-67af-4475-a523-55ce2dcd1fe1` |
| `perk_featherweight` | Until removed | `44d83d12-9709-4e54-9b7d-9b6bcfb630be` |
| `perk_final_offer` | Until removed | `14570aae-5102-4228-8c96-dde9d2fd1a55` |
| `perk_finesse` | Until removed | `c8e2a05e-9e93-4532-87f6-0fa17e14a277` |
| `perk_finesse_ii` | Until removed | `97d6a748-fa09-4eb8-8f98-2f39cedc857c` |
| `perk_finest_goods` | None | `efb01942-5570-41b9-af0a-c8cd3e7cc83d` |
| `perk_first_strike` | 1 min | `5ce5cbf9-7c8a-4b91-8168-24cf143a206c` |
| `perk_fleeing_shadow_i` | 2 min | `c73fb207-9b80-47ec-b435-626621818f38` |
| `perk_fleeing_shadow_ii` | 2 min | `9d994e02-5948-4f93-984d-ff2b621ea252` |
| `perk_flower_power` | Until removed | `942e3fee-6be1-4e29-8da2-f6dba1d5fe6a` |
| `perk_frejir` | Until removed | `18efd084-f853-404e-b7cd-02d2d8ed31da` |
| `perk_frightening_presence` | Until removed | `964d2bd3-75ba-4145-bf6b-722a054b801d` |
| `perk_fuck_shit_up` | 30 s | `f240f866-90e8-41b4-b4b0-1b773347b5b0` |
| `perk_fuck_shit_up_watcher` | 1 min | `13915c8c-4ba9-4d02-bfb8-d80967d9217e` |
| `perk_furor_teutonicus` | Until removed | `49e55549-614a-4e02-9560-a552964fb81d` |
| `perk_gentle_touch` | Until removed | `0bde0b28-5b60-484a-be3d-9fa11aa5acd0` |
| `perk_ghillie_suit` | Until removed | `518b0634-71f2-4e79-8afc-73afb0ad891a` |
| `perk_ghillie_suit_ii` | Until removed | `d872099d-a103-46f1-bf83-decbdfe56c4b` |
| `perk_gladiator` | Until removed | `586f1ccf-06d9-407c-8b7e-4018bf00811a` |
| `perk_glissade` | Until removed | `1b999b3f-f0b3-4287-a227-c305baf1a947` |
| `perk_good_natured_skillcheck_bonus` | Until removed | `447424b9-3315-49ed-8d24-0d7f8bb7227d` |
| `perk_grand_slam` | Until removed | `179a51df-f3d8-4cb1-b6c4-4e78058734e7` |
| `perk_grand_slam_ii` | Until removed | `ad31512d-d6df-4e38-850b-a7e1f0c890b2` |
| `perk_green_knight` | 5 s | `ba7a0877-f599-4bfd-a2cb-a078bbe3cb6f` |
| `perk_hack_and_slash` | 8 s | `771280ab-d18b-4df4-b8f6-8516f862b29c` |
| `perk_hammerer` | Until removed | `c5ea9ac7-035a-47b8-aab7-2f1945b4016f` |
| `perk_hard_to_kill` | 2 s | `5968df62-e746-4c0f-9eb8-dd4de5dd3d2e` |
| `perk_hardcore_bad_back` | Until removed | `a2369937-b2c8-476e-b728-4a4c4b488450` |
| `perk_hardcore_bad_back_movement_debuff` | 30 s | `a0163c8e-2d15-4eca-8489-e8fc38ddb844` |
| `perk_hardcore_hangry_henry_hunger_debuff` | Until removed | `d6d7dfda-6497-482d-a1b2-05d7cb51de30` |
| `perk_hardcore_heavy_footed` | Until removed | `347ba8f6-7e02-4be7-bee5-5a19a4a09dc7` |
| `perk_hardcore_horse_capacity_debuff` | Until removed | `9be2c050-27e7-4cc1-b176-b8a8fb567a0a` |
| `perk_hardcore_known_criminal` | Until removed | `5b1b3855-e943-495c-ac03-c83e65746de7` |
| `perk_hardcore_mode` | Until removed | `06b51f16-ce08-49e8-970e-14dab9531162` |
| `perk_hardcore_numbskull` | Until removed | `3569eadc-0823-48c3-92ec-561d6c440acf` |
| `perk_hardcore_picky_eater` | Until removed | `85099ef3-aef6-4b71-860b-3e34972e053e` |
| `perk_hardcore_picky_eater_hunter_loot` | Until removed | `84f8ddba-c125-4bf8-bd6d-7a0349358a58` |
| `perk_hardcore_shy` | Until removed | `dda906cc-fb98-42c6-887d-ab5eb4e2fc7a` |
| `perk_hardcore_somnambulant` | Until removed | `4ec5fb15-c96b-43fc-a86e-f942dad9401c` |
| `perk_hardcore_sweaty` | Until removed | `a5a2cad7-7613-470d-bf2a-313e250c33b3` |
| `perk_hardened_steel` | Until removed | `e82de782-c961-4b15-8bd9-696d4be52058` |
| `perk_hardened_veteran` | Until removed | `a138ae06-d341-4ce9-8b04-89b28c884f86` |
| `perk_hardened_veteran_ii` | Until removed | `946070b9-1686-4041-a612-85612b9d78d5` |
| `perk_hardwood` | Until removed | `7912b4a0-1565-430d-ac9b-2892ddac2042` |
| `perk_hardworking_lad_inv_capacity` | Until removed | `25d19bb6-866e-4977-98fa-0ba396d5dfa6` |
| `perk_heartseeker` | Until removed | `be9eabeb-3750-460c-8161-6748a2f0c154` |
| `perk_heartseeker_ii` | Until removed | `c5f95c08-062e-4005-82c8-9ba4abc30bc0` |
| `perk_heavy_duty` | Until removed | `06b5b5b3-3af9-4f98-ba08-a7aca471dc09` |
| `perk_heavy_tip` | Until removed | `6a99f1e6-8897-4e0e-9b90-e22a044d7627` |
| `perk_heavyduty_pony_companion` | Until removed | `f93e5f9b-3dc7-484e-aa65-4830a0168886` |
| `perk_help_in_the_workshop` | Until removed | `3f89a58f-ba92-4807-813d-53a678411068` |
| `perk_henry_shot_first` | 1 min | `c49d2fed-5821-42f8-b444-d7705d2bbc82` |
| `perk_henry_shot_first_ii` | 1 min | `485503c0-5dc4-4db1-b441-0604cdc21ec9` |
| `perk_heracles` | Until removed | `17aac6ab-2857-4b9a-8d1b-62b4d71a2587` |
| `perk_hidden_pockets` | Until removed | `4894a695-80e4-4276-8e2c-e34c312ba7c8` |
| `perk_horsenip_horse_buff` | Until removed | `d3738270-45ee-4a64-bcca-a9bba05ec6cc` |
| `perk_hranicarsky_beh` | Until removed | `1cfa46f5-c457-4c7c-a2a0-b47c2739e8db` |
| `perk_huntsman` | Until removed | `166379a6-c26d-427e-8795-48cff1c18328` |
| `perk_in_vino_veritas` | Until removed | `847a9f16-120e-44f7-9c62-d8c3d5cf132c` |
| `perk_infantryman` | Until removed | `1a2cff66-ee87-42e5-a6b6-59ded328d2b8` |
| `perk_into_the_fray` | Until removed | `0bf17e64-96c9-44b9-9174-4d7783323faf` |
| `perk_iron_harvest` | Until removed | `93c2e0e2-6393-40a8-8e82-2b7d1fcd35b2` |
| `perk_iron_rain` | 8 s | `b2fcc70d-b398-4ca4-8ba0-b7be8c293eba` |
| `perk_ironclad` | Until removed | `2659feb3-7b19-45ac-acbf-0caf268e1337` |
| `perk_its_a_trap` | Until removed | `56e78053-1268-4ce0-b9dd-af2d412796f3` |
| `perk_its_a_trap_debuff` | 20 s | `e2d4a058-978d-43cf-9097-e04cba3fce54` |
| `perk_jack_of_all_trades` | Until removed | `967f1088-7d15-4d8c-b5ec-7ec3ace5657a` |
| `perk_jawbreaker` | 8 s | `2f77cca2-345e-4cc3-92a1-929318836bb9` |
| `perk_jockey` | Until removed | `004a0fc5-9603-4352-9d9b-765f0736c595` |
| `perk_kaminka` | Until removed | `f2d6a1ad-8685-441f-af80-09a7711edd36` |
| `perk_keen_eye` | Until removed | `99563e24-66de-4a8a-ba16-82cdad11aecf` |
| `perk_keeping_distance` | Until removed | `5aad5c76-3fcb-4e91-88c2-227e82d34110` |
| `perk_knight_in_a_shining_armor` | Until removed | `2face638-f944-4901-b066-8adc9cdf67d4` |
| `perk_knight_training` | Until removed | `38af79f3-bcc3-4006-a005-58ecb4808f8d` |
| `perk_kurzkampf` | Until removed | `b3547b41-8750-43c9-9a9a-881befb1bf38` |
| `perk_kurzkampf_ii` | Until removed | `9646c875-5953-4b0c-abdc-5fe720941dd2` |
| `perk_lab_dweller` | Until removed | `0be587cd-51c2-44f8-b32e-d1b89d0cfb63` |
| `perk_legday` | Until removed | `51a3b3ce-b735-494e-8718-8bfa2e8fcfe7` |
| `perk_lehka_hlava_trvrdy_zada` | Until removed | `00fefffd-2958-4210-8034-f593855419a8` |
| `perk_let_em_come` | 30 s | `de2b894c-6ee2-4de5-97a0-d25c5ff6ddfe` |
| `perk_let_em_come_flee` | Until removed | `fc5b4f62-a474-4ea4-88c0-d4aa2930112e` |
| `perk_letailleur` | Until removed | `5d642cd6-b078-4e00-a9fe-fb8f5a30ef05` |
| `perk_local_hero` | Until removed | `0bbd5e18-1e6d-4e26-a865-e42316e0c55e` |
| `perk_locksmith_lockpicks` | Until removed | `6da0b521-6182-4ecb-be5f-73a99e634138` |
| `perk_locksmith_thievery` | Until removed | `68034469-1a26-4019-8cfc-5ddacc8abc69` |
| `perk_long_reach_i` | Until removed | `01275a35-0982-47f6-af70-505b0deecbc7` |
| `perk_long_reach_ii` | Until removed | `52848ef1-2730-4de7-be7b-d2c94e930479` |
| `perk_looter` | Until removed | `ffaa6525-1c1e-4a77-a17c-e4d136ea76d8` |
| `perk_lovely_companion` | Until removed | `ae621e26-6b02-4c80-b93e-1b8a1b18a0ae` |
| `perk_loyal_companion` | Until removed | `ad401562-d450-48d8-afa6-8ce077ac4f2c` |
| `perk_luck_of_the_drunk` | Until removed | `030c1c68-d6e8-4677-86e9-bea7648ffc20` |
| `perk_lucky_day` | Until removed | `8ff8ae27-c26f-48e6-9d45-d8523b0007ca` |
| `perk_magister_dimicator` | 30 s | `c88660ae-d481-48eb-8289-c8fb5fc0930d` |
| `perk_master_fletcher` | Until removed | `bdeb2e5c-fcd9-471a-92ae-9ea358ea8e42` |
| `perk_master_thief` | Until removed | `c052039b-da71-4890-a4be-8e62e374cfb0` |
| `perk_masterful_feint` | Until removed | `bfec26bd-6fbb-40ca-a71d-356278713833` |
| `perk_memorable` | Until removed | `fc8b6ed8-403b-4b8b-94c7-7e2ed95f248c` |
| `perk_merchants_wit` | Until removed | `0385d5c5-d907-4629-a180-e2d5e96b9917` |
| `perk_militia_training` | Until removed | `a3220969-bb60-4b8d-9906-5bf5199da134` |
| `perk_mule` | Until removed | `a684d24b-f828-4998-8164-acbadaa64af9` |
| `perk_my_father_blacksmith_martin` | Until removed | `34420807-8ea5-4643-9dfe-5a0d7d632521` |
| `perk_my_father_sir_radzig` | Until removed | `f860e82d-a68e-42f4-a5de-829961a0ac00` |
| `perk_natural_camouflage` | Until removed | `eb26bf65-508c-469a-ba47-6e4dbeb661f2` |
| `perk_navratilec_companion` | Until removed | `38128413-5a2a-4b22-9196-60913ed197f1` |
| `perk_never_surrender` | Until removed | `43a8edd2-5c14-4698-bdaa-c57affb9fcaf` |
| `perk_nezdolny_pijan` | Until removed | `876d3d7c-27a9-452d-afc1-7e889fce932a` |
| `perk_night_crawler` | Until removed | `1a8c954e-eead-4de2-b585-26e6c11d43d7` |
| `perk_nimble_stance` | Until removed | `2edea01e-937a-48d8-ab51-e8d010ffdd77` |
| `perk_no_pain_no_gain` | Until removed | `cb647869-5765-484d-a5aa-84c172f0ccc2` |
| `perk_no_rest_for_the_wicked` | Until removed | `12bf14fd-9cf5-431f-a0e0-ee8cc2255630` |
| `perk_no_rest_for_the_wicked_ii` | Until removed | `cfdf3015-1c51-4c40-bc33-c15bbac69e80` |
| `perk_on_the_road_companion` | Until removed | `d4257840-c780-44a5-b159-a0416cb22036` |
| `perk_one_man_army` | Until removed | `8523987d-363e-4b2e-8993-1110a638f38f` |
| `perk_one_shot_at_glory` | 11 s | `98a7eac8-d935-479f-8070-ab7034c4ff61` |
| `perk_one_way_or_the_other_debuff` | 20 s | `290b0780-fb93-4522-9b8e-558b39afe056` |
| `perk_onslaught` | 10 s | `763446ed-532e-4ff9-8968-3e33d6d1d407` |
| `perk_opening_strike` | 5 s | `a5cd2f81-96dd-43d8-af24-ceeba25e367a` |
| `perk_opening_strike_II` | 5 s | `2fefcc87-60fc-43cf-9a58-52ecb2e54f64` |
| `perk_opilecke_stesti` | Until removed | `813ac50b-0a0f-4c50-bd42-b18a5833dd23` |
| `perk_oportunista` | Until removed | `2b54e25a-6116-4544-a30c-31f13e35bba3` |
| `perk_ordinary_mug` | Until removed | `09a931bc-615f-476c-ac0e-b8c0987c5e7e` |
| `perk_pacifist` | 12 h | `2ea3aada-58dc-4851-8046-d9be9a17d07a` |
| `perk_padding` | Until removed | `2d21ec86-93c9-46f0-99b6-f00077487087` |
| `perk_painkiller` | 20 s | `a5018a05-c5f6-4c69-9727-a5ad9a2eb401` |
| `perk_perfect_vigour` | Until removed | `c3b1c0b6-f8ea-4827-9f1b-6a2358ee3f88` |
| `perk_pivoslapek` | Until removed | `3826f792-9bec-49aa-9a3f-3c08d2dfe248` |
| `perk_player_fader_protection` | Until removed | `c76dfa1e-0985-4ed7-9605-d38fd084e705` |
| `perk_plizivej_prizrak` | Until removed | `f28b2f4a-3aea-4757-a912-4715391c279f` |
| `perk_plizivej_prizrak_ii` | Until removed | `13fa7806-a0a0-421a-b5f6-0d43f7b0ac8c` |
| `perk_poacher_trail` | Until removed | `70a789e6-3ff5-455b-916a-57e099535483` |
| `perk_poison_specialist` | Until removed | `5ad75e59-7bc7-4b42-a016-62234d6332e3` |
| `perk_poison_specialist_ii` | Until removed | `74ebd8f1-8deb-4961-8871-3e47ae83aafe` |
| `perk_precise_strike` | Until removed | `535db3e9-4ab7-4e9e-9681-567c7b6aa5a0` |
| `perk_prizen_sv_bibiany` | Until removed | `4b6df874-b0c7-4512-bfc1-597b73e9f6d2` |
| `perk_pub_brawler` | Until removed | `87b8c20d-f46b-4071-aa8c-195372a4f5e6` |
| `perk_purple_haze` | Until removed | `bc514b2d-a9ec-4f53-8b7f-6a630e8c0245` |
| `perk_purple_haze_ii` | Until removed | `b897ea1a-b2e9-4c1c-b12a-a023a951c7ad` |
| `perk_quick_escape` | None | `18fe33c4-b60c-4a60-8f33-c6b0479cf6e8` |
| `perk_quick_escape_cooldown` | 3 min | `cd559797-50f4-44fa-a1b4-aef537a38a0a` |
| `perk_quick_on_hands` | Until removed | `300fdd93-a489-4d40-8e65-ab7e9b7642f8` |
| `perk_racing_horse_companion` | Until removed | `dcdbdef0-6faa-4ed5-b14d-a64b0210a85e` |
| `perk_rage` | Until removed | `ab52bcd4-2a16-4bed-95fb-dac933f624e8` |
| `perk_ratman` | Until removed | `87fcba00-672f-4e6b-90f7-4322f316356e` |
| `perk_reading_Cushion` | Until removed | `5815db0b-0d67-4559-b7a8-290a012cba4e` |
| `perk_reading_educated` | Until removed | `b23979fb-24c8-4136-bfc3-d99b91aed569` |
| `perk_repairman` | Until removed | `0a6b8191-267b-4d39-b585-675dd759c6ef` |
| `perk_resistance` | Until removed | `0cc86b00-3c4f-418f-9ac7-f6d1ef51e6d2` |
| `perk_revenant` | Until removed | `854af3e0-abd9-4318-b9fb-559836c92d47` |
| `perk_routinist` | Until removed | `0d7d7f98-f840-4c38-a7cf-48cc3ecef08c` |
| `perk_runaway_boy` | Until removed | `cac3a513-9384-4a8b-a52d-9f715db127a8` |
| `perk_sagittarius` | Until removed | `2728e90f-af6b-426a-bdcb-934d7608c1bf` |
| `perk_salva` | 7 s | `3ed6ff20-4743-47a8-82fb-cc095efdcd85` |
| `perk_sandman` | Until removed | `34859639-32b3-45e4-a6ab-d5ed0ac6ae6f` |
| `perk_secrets_of_equilibrium_i` | Until removed | `ade16c8d-bb89-4903-9293-9ed397e9d91b` |
| `perk_secrets_of_equilibrium_ii` | Until removed | `82501a7f-00fe-4bc9-9ac9-e350fcd37cd4` |
| `perk_secrets_of_matter_i` | Until removed | `f1a483b4-a142-4311-87a8-150978216167` |
| `perk_secrets_of_matter_ii` | Until removed | `84676300-205d-4642-8c33-dc8d32aebcea` |
| `perk_sedlar_repairkit` | Until removed | `3f90092b-a053-4b9e-a6c4-28e77a23b75a` |
| `perk_sedlar_thievery` | Until removed | `7900b360-bbaf-431b-b5ff-29a0977898fe` |
| `perk_seven_league_boots` | Until removed | `1deed15c-f41b-4b07-b216-c687726403b7` |
| `perk_seven_league_boots_ii` | Until removed | `8a1d9909-929a-4bde-8b0e-913117ed5688` |
| `perk_shieldbreaker` | Until removed | `016e8bc4-d537-47e8-b8e4-fbb914e7ed10` |
| `perk_showtime` | Until removed | `29ede409-f87e-4d72-bdbc-d2f181e69f2a` |
| `perk_silent_fiddler` | Until removed | `d4575952-8be1-4a07-83f7-8cb6d4ce628e` |
| `perk_silver_tongue` | Until removed | `de344688-0dbb-4f3f-bde2-a6e24be2ba0f` |
| `perk_skirmisher` | 10 s | `ef8ba347-bd2d-4ef7-8d18-4b1db38420d6` |
| `perk_skirmishing_cavalry_companion` | Until removed | `7e51812f-9d1f-4263-a14b-a506ad75d143` |
| `perk_skirmishing_cavalry_player` | Until removed | `d5fd516d-89b8-4e9d-af75-8ce968c30814` |
| `perk_slice_and_dice` | 8 s | `a642b3cc-6c88-4ecb-be99-10cf2bb90d4a` |
| `perk_slim_fit` | Until removed | `112d58e9-e722-4031-9c11-82f070cc69ec` |
| `perk_smart_bootstraping` | Until removed | `bbf765da-9968-44d8-839d-140f4f8db41e` |
| `perk_smelinar` | None | `1cae56df-89a6-476e-aea8-ff1abc8a9451` |
| `perk_smeller` | Until removed | `46a6b7fc-7a1e-467f-b3cb-da30ae1c9b6d` |
| `perk_spiritual_guidance_bonusy` | Until removed | `f30d25fb-ee1e-4a5f-8cc9-1073678a896a` |
| `perk_spiritual_guidance_traveni_alkoholu` | Until removed | `2d88c285-6927-4394-b1b3-687ac724d4d9` |
| `perk_spiteful_creature` | Until removed | `a8575bc5-f401-44bd-a3ed-9d716c1e2d43` |
| `perk_start_me_up` | Until removed | `b127f918-08cb-4bf0-a183-775938fb0065` |
| `perk_steadfast` | Until removed | `f4a8fb42-0d27-4e09-9b8d-253ddeabfb52` |
| `perk_steady_aim` | Until removed | `3bd47522-914e-4039-8e30-51f250127a15` |
| `perk_steady_aim_ii` | Until removed | `e9ff22f2-2292-4998-a951-12f3d8c50aa8` |
| `perk_steady_hand` | Until removed | `0f8234c4-2128-48d5-954c-34af7d405617` |
| `perk_steer` | Until removed | `ec97ede4-64b4-4586-b59d-7f4cb11b1e26` |
| `perk_strider` | Until removed | `76559a29-306d-410f-88cf-2ce3c0fac0c2` |
| `perk_strong_arm` | Until removed | `242442a9-d104-4d4b-928c-e46586e9f12f` |
| `perk_stronghold` | Until removed | `3344d9b7-eeb6-4ee4-97fe-0f2ef03f9ee6` |
| `perk_sundering_blow` | Until removed | `0ceba04e-f435-4962-9229-52d3b9afd0a7` |
| `perk_sundering_blow_ii` | Until removed | `f278c697-9fbc-4a6b-b6bc-98c9934874aa` |
| `perk_swordmakers_wisdom_craftsmanship` | Until removed | `4c31611c-4b46-4edc-a5f6-079adb97b460` |
| `perk_swordmakers_wisdom_weapon_usage` | Until removed | `e323d5db-06b1-448f-bc8a-1338d8386061` |
| `perk_sympatak` | Until removed | `0bed40e2-51d1-480f-a8fe-e84d58cb0777` |
| `perk_tear_up` | Until removed | `4a9c2912-ccbd-4b96-9fad-168bd884b5e9` |
| `perk_the_hammer_and_the_anvil` | Until removed | `0d2126c1-5b05-4047-8717-8560cb591c8a` |
| `perk_the_mountain` | 10 s | `f9ba8bc7-68e0-407f-92fb-ddff6d026341` |
| `perk_the_river` | 10 s | `9c5ca38f-17ba-4fad-8324-267fb32864b1` |
| `perk_they_will_never_know` | Until removed | `87ca580a-b1bc-404a-a033-385fd8e42e9e` |
| `perk_thorough_maintenance` | Until removed | `08529368-09b4-462b-b9cc-58deec4c2573` |
| `perk_thorough_maintenance_ii` | Until removed | `55ebf188-6fa2-497d-ba03-7219e2e3075a` |
| `perk_thrasher` | Until removed | `e0a7aac5-d516-429e-a146-f4251e426b8d` |
| `perk_through_and_through_i` | Until removed | `503e0457-6455-4d0f-95be-b321c2a2f703` |
| `perk_through_and_through_ii` | Until removed | `a30efc1d-8667-4d1a-ad56-752353766c3d` |
| `perk_thunderous_blast` | 1 min | `20cc046f-17a4-4f93-a565-8f6e48b21455` |
| `perk_tight_grip` | Until removed | `0f73d553-c72c-42f3-b9ec-6804d7d3456b` |
| `perk_tire_em_to_take_em` | Until removed | `fa9cc60d-9cb2-4dac-be7a-63f3c5bff585` |
| `perk_tool_master` | Until removed | `fdf4d0d0-e740-403d-991d-2768b4f64039` |
| `perk_tormenting_strike_debuff` | 10 s | `8498a35b-5b9f-4462-93a4-cb31239938e7` |
| `perk_totally_legit` | Until removed | `03e5f869-3ff6-4640-b955-5a25e508b95b` |
| `perk_totentanz` | Until removed | `4dc87b89-0e2e-4c4c-9b22-6fd66e7fbcac` |
| `perk_towering_menace` | Until removed | `974a7d3e-a2c9-42f7-a862-37566d1aa116` |
| `perk_trafficker` | Until removed | `08c4739a-4085-4899-94ca-879b0f1e144f` |
| `perk_train_hard_fight_easy` | Until removed | `c778d24f-5baf-4ef9-a05e-b6663e4ebcc0` |
| `perk_train_hard_fight_easy_ii` | Until removed | `71b2c207-d1d9-4f8c-a722-e6c17bafd3de` |
| `perk_trustworthy_partner` | Until removed | `6003cef0-34b3-4c42-9d3e-d00e40d101bc` |
| `perk_unbreakable` | Until removed | `c26057b8-c901-434d-81e7-e65efccec0b5` |
| `perk_undaunted_cavalier` | Until removed | `aef7d88c-c9df-4696-8b70-1abe562db209` |
| `perk_vanguard` | Until removed | `b3a2375d-2286-4d6c-b6f0-74cef7d4a21c` |
| `perk_veteran_od_kosova_pole` | 15 s | `66acdbc0-d36f-428c-98a0-e8486f384ff3` |
| `perk_viper` | Until removed | `fdda5eda-aeea-44bb-a7b9-1d4963c2a87d` |
| `perk_viper_ii` | Until removed | `f968bdf6-2b8b-4152-8ad4-6c65550f7c87` |
| `perk_vycvicenej_pajsl` | Until removed | `85e8b56e-ba15-4fb6-b4d5-8fd0cba7be42` |
| `perk_wanderer` | Until removed | `b640bd3e-6d33-45f8-b0a9-a01d7713488d` |
| `perk_warhorse` | Until removed | `d4df9a61-240a-4836-a6d9-dffd56c063c9` |
| `perk_warmonger` | 6 h | `2db7639e-ace8-4af2-a135-768bbe82f4be` |
| `perk_water_of_life` | Until removed | `c54eed34-93de-4a20-96db-f2d2e586ac7e` |
| `perk_weaponmaster_i` | Until removed | `3fe863fd-15f5-44d0-9d0a-18a3283129b8` |
| `perk_weaponmaster_ii` | Until removed | `2cec75cb-6556-441b-a53d-04737e9f1e8d` |
| `perk_weasel_boy` | Until removed | `fcf836e3-8e10-4e09-b4e8-b4546acbfaa1` |
| `perk_well_built` | Until removed | `3f630062-0b0d-4783-9d6e-aaf3698ad6e8` |
| `perk_whirlwind` | Until removed | `656c1eab-4a40-47ed-b484-354b597c0fda` |
| `perk_wildrider_companion` | Until removed | `154f9573-07cb-496c-aaa3-a426981f5a53` |
| `perk_zapasnik` | Until removed | `567f86c7-6177-4c97-9df8-ce470d3ac701` |
| `perk_zkusenej_kalic` | Until removed | `d2466244-1e5e-4d9a-aa09-bb1382a1e8ec` |

</details>

<details>
<summary><code>plague</code> (4)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `plague_heal` | Until removed | `6fad3c94-e9f0-4c3a-ba09-29299a751b19` |
| `plague_stage1` | Until removed | `49cba93a-bf78-4457-ad28-e1c62b304f1a` |
| `plague_stage2` | Until removed | `2889a407-27a8-40b0-874b-d056e2c67010` |
| `plague_stage3` | Until removed | `00b17b49-762d-46d0-bdd7-19de7559aa3d` |

</details>

<details>
<summary><code>poison</code> (34)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `deadly_poison` | 3 min | `8544ebca-1e30-400c-b31c-2a1839f1cab8` |
| `food_poison` | Until removed | `04218e40-e756-476b-914e-03d67a24e733` |
| `forced_skiptime_protection` | Until removed | `1c13fe26-3766-4f50-829f-080bb9d543b8` |
| `only_antidote` | Until removed | `c2d02711-353a-4f9f-918f-bc17faf515b2` |
| `potion_antidote_2` | 10 min | `69c7ab9c-18e3-4919-8154-54fec286f03f` |
| `potion_antidote_3` | 10 min | `88b0cf2b-516e-4d73-adba-c67517d278c3` |
| `potion_antidote_4` | 20 min | `e8b7b563-f15b-487f-aa28-35b790ad98e4` |
| `potion_bane` | 1 min | `58138b68-0c86-4d5e-8823-417106d08d3c` |
| `potion_bane_2` | 45 s | `0514be45-7ace-4c34-9d12-cd3d8c83bae4` |
| `potion_bane_3` | 30 s | `79285ce3-21f3-4aa6-a824-68c42c37732a` |
| `potion_bane_4` | 15 s | `6451a511-4c57-4aff-9e81-c7d9cd02fd2d` |
| `potion_dollmaker` | 2 min | `db397470-27c5-4a3a-9717-1b3b5f42377a` |
| `potion_dollmaker_2` | 3 min | `43292c72-7261-44e3-be02-6e0ef355dd6c` |
| `potion_dollmaker_3` | 4 min | `35effd0b-b401-43c6-8195-b502d67ebe63` |
| `potion_dollmaker_4` | 6 min | `7a94771c-98bd-445f-bf48-ee24bf235c95` |
| `potion_sleeping` | 24 min, game clock | `15387b1a-7f7e-4462-8ce6-ea652f0e182e` |
| `potion_sleeping_2` | 24 min, game clock | `689753d8-56a1-4012-822d-3d169d9504da` |
| `potion_sleeping_3` | 48 min, game clock | `bb7bfaed-fad9-4f27-a9be-731c3b141285` |
| `potion_sleeping_4` | 1.6 h, game clock | `f4b3ffd4-8a48-41af-bbae-1f7d50121ab4` |
| `potion_steakTartarePerkUnlocker` | 1.8 min | `671df15c-3341-440a-ad0e-e3f3eed603cc` |
| `quest_kocovnickaCest_sleepingPotionMedium` | 24 min, game clock | `6aa19cd2-5426-46b2-a5c4-f6124eb512f8` |
| `remove_all_posions` | Until removed | `de68e56a-a74c-4447-874b-487b03c3fc6e` |
| `weapon_bane` | 1 min | `b56d79e6-156c-4803-8d91-73a82f01926e` |
| `weapon_bane_2` | 45 s | `743b8ca4-6538-4c00-9903-29ab2050c8e8` |
| `weapon_bane_3` | 30 s | `3a818f56-ff68-4aa4-bfc0-6437c3e73703` |
| `weapon_bane_4` | 15 s | `ed10dd29-b177-4d04-a330-3cbe76fe04b2` |
| `weapon_dollmaker` | 2 min | `25bdbc39-c19a-4a11-8c0f-6e16c432846f` |
| `weapon_dollmaker_2` | 3 min | `b1697366-d4cf-4133-9736-97c3f512f9e6` |
| `weapon_dollmaker_3` | 4 min | `03845da1-2125-45dd-a315-cf7dba569e54` |
| `weapon_dollmaker_4` | 6 min | `40b35ed9-a09a-47c2-b163-a4019340a52a` |
| `weapon_sleeping` | 24 min, game clock | `f13d37c1-5524-4822-9515-48e1ccb0dde4` |
| `weapon_sleeping_2` | 24 min, game clock | `dd2612e4-0e4a-4092-867b-8728f45dcfc5` |
| `weapon_sleeping_3` | 48 min, game clock | `d6079f34-4b7e-4afd-afe1-eee36f4674c6` |
| `weapon_sleeping_4` | 1.6 h, game clock | `45275677-0808-4d4a-bcad-e78aa77ae612` |

</details>

<details>
<summary><code>potion</code> (77)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `alcohol_desc_bacon` | 30 s | `1524fad6-ef2e-495c-9f96-b5d88947c025` |
| `alcohol_desc_cooked` | 40 s | `1524fad6-ef2e-589c-9f96-b5d88947c025` |
| `alcohol_desc_diary` | 30 s | `1524fad6-ef2e-853c-9f96-b5d88947c025` |
| `alcohol_desc_dried` | 20 s | `1524fad6-ef2e-483c-9f96-b5d88947c025` |
| `alcohol_desc_pastry` | 10 s | `1524fad6-ef2e-458c-9f96-b5d88947c025` |
| `alcohol_desc_smoked` | 30 s | `1524fad6-ef2e-450c-9f96-b5d88947c025` |
| `alcohol_desc_soup` | 30 s | `1524fad6-ef2e-752c-9f96-b5d88947c025` |
| `alcohol_desc_vlasak` | 20 s | `b4594a5d-7f5e-4317-93f0-8d850e3ac16d` |
| `food_test` | 20 s | `1524fad6-ef2e-450c-9f96-b37a8947c025` |
| `golden_egg` | 10 min | `0fc57667-2401-467a-82ec-90c402c22769` |
| `potion_aesop` | 24 min | `f23dda25-6450-49c8-86f3-fc7bc1236199` |
| `potion_aesop_2` | 48 min | `ad53097a-b18d-4b05-9a4d-4d14176b2740` |
| `potion_aesop_3` | 48 min | `8cc1d023-1c9d-43bc-8662-144499904a6e` |
| `potion_aesop_4` | 1.6 h | `1ff0e4a0-c09c-40be-b31e-fcb98b8ae0df` |
| `potion_antiInflammatoryPotion` | 10 min | `60b21e2b-560d-4245-b01f-c9ea2310f89c` |
| `potion_antiInflammatoryPotion_2` | 10 min | `96cbf4be-5827-4862-b356-fe2b9fe2d191` |
| `potion_antiInflammatoryPotion_3` | 20 min | `0fac3a7c-f402-40b7-8159-206f6ccedd83` |
| `potion_antiInflammatoryPotion_4` | 30 min | `b5ee756f-25d3-4a71-8a31-397094e0eef9` |
| `potion_antiPlaguePotion` | 20 min | `ef9bad80-2314-42fa-8b7f-6f15dd1a469d` |
| `potion_antiPlaguePotion_2` | 20 min | `d40346c2-f607-4b8d-8990-2e9284f66df2` |
| `potion_antiPlaguePotion_3` | 30 min | `005cd31f-a09a-457a-a21e-16632ca0c1f2` |
| `potion_antiPlaguePotion_4` | 40 min | `c91be522-8785-4901-9971-4cf8baf8f26d` |
| `potion_aqua_vitalis` | 5 min | `27c2fd6a-9b87-4d1f-b434-44f5ec3fa426` |
| `potion_aqua_vitalis_2` | 10 min | `eaf0b14c-e2a4-4ace-bb89-e33ea2dedcd6` |
| `potion_aqua_vitalis_3` | 10 min | `c0662fdb-9bd1-44ce-9a89-a6e83ec8063a` |
| `potion_aqua_vitalis_4` | 15 min | `7f89c355-d3c6-4f61-9774-3a3898372ab7` |
| `potion_artemisia` | 10 min | `940b16f1-d2ef-4874-a915-8122a7d4392a` |
| `potion_artemisia_2` | 10 min | `15bfe81a-1c4e-41ce-91da-fa345129cc92` |
| `potion_artemisia_3` | 10 min | `6026810f-22fe-49e5-8811-b233722f44b2` |
| `potion_artemisia_4` | 15 min | `19b9bd34-f153-4e2b-a56c-207a2a2f9f3a` |
| `potion_bard` | 48 min | `1f398bd2-05ea-4a56-b883-9ac3ba3ad01a` |
| `potion_bard_2` | 1.6 h | `81e733a3-4bfd-4573-a895-6d8613e444d5` |
| `potion_bard_3` | 1.6 h | `085e7b12-8b53-462a-83c0-ccb34217af0f` |
| `potion_bard_4` | 3.2 h | `ea76c3af-bfb1-4e89-9157-d82f028b8572` |
| `potion_chamomile_decoction` | 48 min | `dff536bc-9472-4754-9851-8656b5b18247` |
| `potion_chamomile_decoction_2` | 1.6 h | `bec61738-f8ed-4429-b9ae-482f5512e442` |
| `potion_chamomile_decoction_3` | 1.6 h | `e300b5f3-9d1f-4dfd-8285-c872bb3ed85b` |
| `potion_chamomile_decoction_4` | 3.2 h | `34adf873-92b4-4166-b85b-a0fcaacb760c` |
| `potion_embrocation` | 10 min | `ceb70cbf-9c4e-491a-8d75-7e8ab874db54` |
| `potion_embrocation_2` | 10 min | `3010a853-a9bb-4a0c-8d85-8b510e1b2ea6` |
| `potion_embrocation_3` | 15 min | `d97eea3c-162b-4537-a156-8d984b3a90a1` |
| `potion_embrocation_4` | 20 min | `b1075629-edcd-4be0-bbbc-28c63a7f61be` |
| `potion_hair_o_dog` | 30 s | `fca19318-7d59-4645-bb7d-01fa9e6c925f` |
| `potion_hair_o_dog_2` | 30 s | `f5e6a217-25b5-4b95-88d4-abc7d15a2203` |
| `potion_hair_o_dog_3` | 1 min | `3a323f98-5d10-421f-accc-553a1b759100` |
| `potion_hair_o_dog_4` | 8 min | `cf87b636-408a-403e-b0ac-87eb323aabd4` |
| `potion_insomia` | 10 min | `e3a88c22-4058-4bf2-9000-043fff49f332` |
| `potion_insomia_2` | 10 min | `7b37ac9b-840f-40d2-8397-b62313d2239e` |
| `potion_insomia_3` | 48 min | `27e0c970-cf34-428a-91ff-35c1da071665` |
| `potion_insomia_4` | 1.6 h | `0e94d82b-50ec-4d25-8ea5-438478ec5e31` |
| `potion_maliruvLek_potion` | 32 min | `5a5551f6-43a7-46f4-bf1f-afe8806a9472` |
| `potion_maliruvLek_potion_2` | 32 min | `d91f6594-0786-46fd-bd07-448a7bcae0dc` |
| `potion_maliruvLek_potion_3` | 32 min | `7383214d-0bdc-4aed-8673-fafb7dfefa94` |
| `potion_maliruvLek_potion_4` | 32 min | `c1fdd3cd-a712-40fa-9df6-dfae95e62a70` |
| `potion_marigold_decoction` | 1 min | `8503216a-a34c-49f0-aefa-54d4502046f9` |
| `potion_marigold_decoction_2` | 1 min | `96083a8f-cdb5-42ec-9bb1-3caf40386ea2` |
| `potion_marigold_decoction_3` | 1 min | `e223597e-8005-4464-8948-9b30b3ef293e` |
| `potion_marigold_decoction_4` | 1 min | `b6bd097c-f092-469d-984a-e673f4cdd03c` |
| `potion_nighthawk` | 10 min | `fa2ad41e-5701-4fe7-8630-5cee49eb304f` |
| `potion_nighthawk_2` | 15 min | `436e58bd-a715-4009-b305-a4c25f4e6759` |
| `potion_nighthawk_3` | 20 min | `fe0d144f-2fe0-4cda-bbb1-61e593ece413` |
| `potion_nighthawk_4` | 25 min | `7f16793c-4d42-4d63-a912-d93d51b92289` |
| `potion_padfoot` | 20 min | `eacbd986-ad07-4698-bf81-59df608b56a1` |
| `potion_padfoot_2` | 20 min | `adcc7caf-447f-4450-83cb-77ce46f0b056` |
| `potion_padfoot_3` | 40 min | `e3dfbf21-e1c1-43db-9270-078c0c2b3611` |
| `potion_padfoot_4` | 1 h | `c14174d4-a381-4129-a935-62bb031901d3` |
| `potion_painkiller` | 10 min | `336b5fe9-ec7f-442f-a9d1-b8bb2a6d3fa1` |
| `potion_painkiller_2` | 15 min | `f08512d7-03f5-4312-b3a2-5e8574fc6188` |
| `potion_painkiller_3` | 20 min | `dab8a783-c391-4925-860b-8162eb2f2642` |
| `potion_painkiller_4` | 30 min | `2f76aa98-165f-4105-be87-61b630fe70b8` |
| `potion_stamina` | 20 min | `122c0e62-747e-4bb3-9650-1a14d0420b08` |
| `potion_stamina_2` | 20 min | `2608543a-bb2f-41f0-b6a3-8140c9e6ac0e` |
| `potion_stamina_3` | 40 min | `78c21c77-dc76-4464-ac62-a37ececa1974` |
| `potion_stamina_4` | 1 h | `efd07a19-ef79-4454-bbb3-a2a09af1ce0f` |
| `quest_kumaniNaTrosecku_onIslandVision` | Until removed | `43c56ec5-676e-4ab4-b7e3-f2765f479b83` |
| `quest_nakaza_plague` | Until removed | `c3ceb785-f7b8-4176-ad5a-7f9c5f0353aa` |
| `svatba_roastedPigletAlcoholAntidote` | 1 s | `e3701f28-11f8-40fb-a026-2b90a9b939f8` |

</details>

<details>
<summary><code>punishment</code> (14)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `branding` | 3 h | `2140972b-095a-40a8-909e-c1b46e261504` |
| `crime_punishment_beating_medium` | 40 min | `c9a62a45-b044-42a0-969e-1e77be655a5c` |
| `crime_punishment_beating_medium_hardcore` | 40 min | `37a359c2-fbc4-44e9-b92f-c594bac876e8` |
| `crime_punishment_beating_strong` | 1 h | `b8175a93-aee3-4bd1-9cbe-de691c34cd1b` |
| `crime_punishment_beating_strong_hardcore` | 1 h | `7ccf1b35-d40f-4b6d-8e12-b607602ec0d4` |
| `crime_punishment_beating_weak` | 30 min | `d9711484-b2cd-4982-ac1f-e44a7ce9b548` |
| `crime_punishment_beating_weak_hardcore` | 30 min | `a221f70c-e87d-4d01-bbed-e98ad939ca40` |
| `crime_punishment_brand` | 3 h | `bc7ec5a9-e0d5-4c38-a091-7779ca7241f8` |
| `crime_punishment_pillory_medium` | 40 min | `1ab50a60-821b-4c19-ace3-c296d73566da` |
| `crime_punishment_pillory_medium_hardcore` | 40 min | `ad08caaf-d048-4fb2-a7c3-219a81ad91a5` |
| `crime_punishment_pillory_strong` | 1 h | `68a05048-1c56-43d3-95fd-75c36125c76a` |
| `crime_punishment_pillory_strong_hardcore` | 1 h | `13af7b46-8bc3-408b-b1ee-52332078eaf9` |
| `crime_punishment_pillory_weak` | 30 min | `8607dd71-e4b1-4234-a4d3-532c9e2504c1` |
| `crime_punishment_pillory_weak_hardcore` | 30 min | `baad8949-178a-48ff-bef4-2ff57b79b28e` |

</details>

<details>
<summary><code>satisfaction</code> (4)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `alpha_male_in_love` | 1.67 h | `717abd8d-86a8-4399-91df-8fbeb536a2d2` |
| `sex_time_well_spent` | 1.67 h | `0d635e3e-757d-477a-8196-f504f8afce46` |
| `sex_time_well_spent_clara` | 3.33 h | `aa8eb327-77c8-47c4-80a3-38bf70576dc4` |
| `sex_time_well_spent_nebakovObrana` | Until removed | `9ff367d5-0b08-4020-8428-9ab08290d031` |

</details>

<details>
<summary><code>scriptSystem</code> (155)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `archery_bigBoost` | Until removed | `7dd35ae5-0b5c-40f9-8219-e89aa33007f9` |
| `archery_midBoost` | Until removed | `41b06d3c-f848-4977-b73f-fe51ee4684d9` |
| `archery_smallBoost` | Until removed | `b403333c-191c-49d4-a858-153a10fdcfe0` |
| `autotest_healing` | 2 s | `95afeef3-bfe4-4697-801e-ff92671f8110` |
| `barbora_flee_morale_debuff` | Until removed | `ffc20521-134d-4811-8bc5-e932b74b7077` |
| `barbora_mercy_morale_debuff` | Until removed | `ffc20521-134d-4811-8bc5-e932b74b7076` |
| `battle_accuracy_debuff` | None | `8a9b72c9-5591-418c-83dd-3b87b785d4c4` |
| `bleeding_protection` | Until removed | `a2088337-e015-4c28-8ab2-043f6925c087` |
| `boar_easyKill_permanent` | Until removed | `083704b7-e238-41c3-9996-8ebd5cde89e1` |
| `boost_agility_big_nonpersistent` | Until removed | `9d1be500-79ee-4b31-8a38-6d91f5b64b4e` |
| `boost_stealth` | Until removed | `67ad3acc-5e8b-4f73-a226-7c093632b4ee` |
| `boost_str_agi_marksmanship` | Until removed | `81b4a2f5-914f-4778-b4ee-40fa0f24d375` |
| `budovaniLazni_visionBoost` | Until removed | `4e5149ff-974e-4e9d-a3fa-b51aa94d243f` |
| `combat_moraleHit_large` | Until removed | `549119f2-d5c9-43f7-ab52-487b0a262d47` |
| `combat_stat_skill_debuff` | Until removed | `48afa86f-2515-422f-b2c0-f9f05f11190a` |
| `companion_infinite_morale` | Until removed | `3139a69b-a65b-4056-a95e-6eeadc499a81` |
| `constant_speed` | Until removed | `ffc20521-134d-4811-8bc5-e932b74b7075` |
| `crime_instantRecognition` | Until removed | `dc4be505-46d6-4ca4-857b-59cfa36adc2a` |
| `crime_interrupt_confronting` | Until removed | `d61a0120-6087-4116-9645-2a3abe1f11fd` |
| `crime_interrupt_looking` | Until removed | `f2c8fc57-43a4-4593-acb7-0bbbbe4854d6` |
| `crime_interrupt_searching` | Until removed | `e7952613-5660-419c-988d-ac973ed13c5d` |
| `crime_monasteryPunishment` | 30 min | `0eed0a4f-6aeb-4281-bcad-386c53ed23aa` |
| `death_protection` | Until removed | `c7c79394-cd16-4d86-a029-f8a5f6623f9d` |
| `death_protection_cutscene` | Until removed | `6f706644-e28a-41a9-9674-5f19dea03bf1` |
| `death_protection_nonpersistent` | Until removed | `0f6bc79a-fc67-4aab-a797-4a9d4e4c2dc5` |
| `deer_doe_easyKill_permanent` | Until removed | `7d411bf8-42de-4ef4-bebf-abe704af601f` |
| `disableDodger` | Until removed | `dbc47939-2de8-4c3e-add9-6875461a1877` |
| `disableMasterStrike` | Until removed | `21c300a6-552c-46e5-9f52-ad89f452187c` |
| `duels_defenceDuringTraining` | Until removed | `d836b0fc-1eb8-4000-9192-ce35bf9208d1` |
| `equipment_deterioration_reduction` | Until removed | `b919d148-056c-41e4-10a8-127715b0e855` |
| `erik_duelBuff` | Until removed | `d4a4ffe8-f4a3-4abe-a784-784e27c2e37c` |
| `erik_erikAngryDebuff` | Until removed | `1f50033a-475f-42c8-94df-6c98b1d982a8` |
| `event_chase_slow_debuff` | Until removed | `3e0d4151-c06f-4f5b-b4a6-cd8be1aa35f3` |
| `event_chase_slower_debuff` | Until removed | `e5260d2e-430b-47c7-8503-a9b1a14cb500` |
| `fasttravel_immortality` | 3 s | `c37ab134-a443-433f-92a9-51ff6f08999c` |
| `fasttravel_scriptInitiated` | Until removed | `5334ee91-1d9b-4e03-8678-9cd19647b51b` |
| `fistfights_fightInvisibility` | Until removed | `fe9ca784-46f1-4bb4-9efc-1abe7e96a99a` |
| `fresh_cut` | 3.2 h, game clock | `3a48b1ca-7668-437f-89ce-b20ce5d56bac` |
| `hare_oneshot_permanent` | Until removed | `1ae8375c-5027-4f37-b09f-02f39de3cb0a` |
| `healthEatSleep` | Until removed | `f97fd5a3-edec-490f-b94b-46ec0f1a32b2` |
| `healthEatSleep_instant` | 1 s | `1ad1650e-e565-40bf-9e99-01cefea90c2f` |
| `hladAZmar_horseMoraleDebuff` | Until removed | `8371d6b9-aecf-4b40-a0eb-84ed6ede3fd6` |
| `hladAZmar_sermonBattleBuff` | Until removed | `dcca27c8-0d73-4aa8-8464-c00a6be820f0` |
| `hladAZmar_sermonBattleDebuff` | Until removed | `decf1ab0-d222-4073-8e11-fb101b6b1eb6` |
| `hledaniPsa_wolfKiller` | Until removed | `048e83f9-247e-4875-a24c-b41f154c89bd` |
| `horse_moraleDebuff_heardGunFire` | 20 s | `761f5b41-5e11-44a3-bcca-815cf4ddbd2e` |
| `horse_moraleDebuff_heardGunshot` | 20 s | `5d3175c5-4064-4270-bd48-92fa9bbc6944` |
| `horse_moraleDebuff_mountedByPlayer` | Until removed | `17899ec7-4801-4d38-8fe7-f02b8a8fa48d` |
| `horse_moraleDebuff_onMountByPlayer` | 3 min | `f4909c8f-d3ff-4886-aa6f-f3eca996fc1c` |
| `horse_pulldown_protection` | Until removed | `b6163c06-1ba8-4db5-859d-d58cfad9a3f9` |
| `horse_throwdown_protection` | Until removed | `261fc53f-3ef2-4e0a-a7c8-e46bc8528977` |
| `immortality_nonpersistent` | Until removed | `730503bf-735a-4f47-baae-c2d84ee77524` |
| `inDialog` | Until removed | `053b4122-6dfa-44d1-9a7c-70bf14c67506` |
| `infinite_unconsciousness` | Until removed | `196d18f7-46a7-4ad3-99ff-dd6ccd29da77` |
| `infinite_unconsciousness_nonpersistent` | Until removed | `74cf0c29-d03e-4233-9352-b91ca5ea69ea` |
| `injured_tag` | Until removed | `3d530e43-375f-4739-a6ee-3bbcf9292601` |
| `injured_tag_persistent` | Until removed | `83ef27f9-4ce2-4894-bd42-d2cc61a6f758` |
| `knockout_protection` | Until removed | `ab827233-116c-4366-ab1f-704de01d628b` |
| `konskeZavody_horseBoost_diff1` | Until removed | `229821f1-f204-406b-9c5e-63665278db86` |
| `konskeZavody_horseBoost_diff2` | Until removed | `27ce4a62-f137-4158-ad32-83b94f70a464` |
| `konskeZavody_horseBoost_diff3` | Until removed | `2bd82344-6a86-42c7-87c9-5573cd07049e` |
| `kovar_tutorialInvisibility` | Until removed | `c7b61a3c-b619-4c7c-9857-8cc8c97f5676` |
| `limited_combat` | Until removed | `87dede4e-88e1-4cca-95de-545d0523d5fd` |
| `melee_hit_debuff` | 0.8 s | `a2261902-5204-4e9d-b15e-b3b8d8495f40` |
| `mucirnaVypaleniSemina_resistent_victim` | Until removed | `b5e6123f-dcb3-4c7e-8096-5b584fbc87f6` |
| `mute_cutscene` | Until removed | `945430c5-be04-4f3c-bb83-7951e7e13996` |
| `navstevaLekare_notWorthIt` | Until removed | `4b777931-4ef5-4630-8296-bfd9ccc2dc02` |
| `near_death_experience` | Until removed | `feb6ee6a-781b-4367-976d-3a21ba56fc9a` |
| `nebakovObrana_boost_allies` | Until removed | `3b753f2f-0290-4962-ae6f-fa1ded8d2284` |
| `not_immortal` | Until removed | `ed59af7c-6d7e-4454-8ffb-f16935bf5130` |
| `not_immortal_nonpersistent` | Until removed | `3cd19fea-f99c-41d8-a8ec-66ff545e1f4d` |
| `npc_meal` | 5 s | `2c14d546-1993-4b77-946f-004d63c686ec` |
| `oblehaniSuchdole_augment_damage_received` | Until removed | `b17748f4-da00-44ab-a5ff-d0081e8cd308` |
| `oblehaniSuchdole_exhausted` | Until removed | `360b25df-29c1-44da-a858-30826ca0be21` |
| `perk_good_old_pebbles` | Until removed | `3565bca8-d8cf-48e1-96f7-202cac228a0a` |
| `perk_hardcore_alco_teleport_ai` | Until removed | `543fb101-9e14-4208-8ceb-8d487a46a48b` |
| `perk_hardcore_punchable_face_player` | Until removed | `785d8380-f581-40ee-894f-4b15d0f0d475` |
| `perk_red_herring` | Until removed | `27bbe210-274b-47c1-86c2-4d183df1f48d` |
| `pogrom_wagonInvisibility` | Until removed | `325c9978-f592-42f2-96d5-a196139ee742` |
| `posledniPomazani_boostedBohuta` | Until removed | `ede2a6b3-7475-4596-ab05-2362655ee2b8` |
| `posledniPomazani_healthLossBoost` | Until removed | `151ace61-70fb-409e-8b95-57b35d6ad83f` |
| `post_combat_protection` | 4 s | `b2a1ddda-26f3-436f-b902-1af34094e3c0` |
| `potion_savegame` | None | `612f0945-9933-47f0-9083-2db00be0e830` |
| `potion_savegame_2` | 3 min | `cf9b4526-29f1-40ce-b95d-0299974e39ba` |
| `potion_savegame_3` | 5 min | `9186f153-b18e-4e04-8b39-411268d24476` |
| `potion_savegame_4` | 8 min | `24c8edfc-a310-4f98-8adc-37de87514c38` |
| `predaniVChramu_zacharyDuelBuff` | Until removed | `433c0267-506c-4664-9075-56b50b93ba21` |
| `prepadeni_XpGainNullifier` | Until removed | `3abfb65b-ec73-4f52-9bf9-c0a6a044b687` |
| `prepadeni_customBleedingSpeed` | Until removed | `f2d371a0-feab-4f9e-b0d2-43a331b41520` |
| `prepadeni_initialBoostedHenry` | Until removed | `358e6a61-66a5-468a-8588-e93f2f17c1f0` |
| `prepadeni_nervousGuard` | Until removed | `c207b0b5-1911-4975-8d53-45f962e80a21` |
| `prepadeni_perfectBlockForCapon` | Until removed | `82dfb051-bd76-4681-abc1-185350e09eac` |
| `prepadeni_ptacekBoostSpeed` | None | `084023c1-a396-4d48-aaeb-7e0f7981b66d` |
| `prepadeni_ptacekInDuel` | Until removed | `6b861ae1-7d80-4e5d-9fe6-df5833dc4750` |
| `prepadeni_vorechMorale` | None | `13d87f0e-fc80-489b-97b6-ad31458e93e3` |
| `prepadeni_weakCapon` | Until removed | `6e4087dc-26a6-478f-bd64-6727e24c330b` |
| `quest_bohutovaVlozka_bohutaLeftFightBanditsStats` | Until removed | `45c2c8d9-dd12-4da9-97ed-d93f0ca03b23` |
| `quest_kocovnickaCest_fightingCapabilities_debuff` | Until removed | `fdb86908-efb7-4e8e-a378-47f9362b18df` |
| `quest_kocovnickaCest_moraleHitExtreme` | Until removed | `fdb86906-e4c2-4ef4-b0b9-ce64470fe13a` |
| `quest_kocovnickaCest_movementSpeed_debuff` | Until removed | `fdb86907-1899-4868-a0f0-e7a76050f9eb` |
| `quest_nebakovObrana_bohutaShootingStats` | Until removed | `4e87f141-5222-4d52-a14d-c9e10604a002` |
| `quest_noBlood` | Until removed | `2a37002d-b6c3-4323-a139-f2eb5ada6087` |
| `quest_prepadeniVlasskehoDvora_alliesBoost` | Until removed | `7619b2ea-3d11-49b0-b001-3e69283555b8` |
| `quest_prepadeniVlasskehoDvora_highMorale` | Until removed | `27f46b49-dbe7-4b42-b8f8-470e4f28fb35` |
| `quest_prepadeniVlasskehoDvora_lowMorale` | Until removed | `819df34d-1c14-44b7-b02c-d2f5f13aeb2c` |
| `quest_sermiri_arne_debuff` | None | `a679d85a-dbad-4607-8982-1e1a11a6d2eb` |
| `quest_setkaniVRatbori2_noDamage` | None | `57e07f55-0cc5-4318-abd9-693df4a232a4` |
| `quest_stealthMiseZaJindru_brabant_hearingBoost` | Until removed | `64c27976-ed6a-589b-2191-cc586082aee6` |
| `quest_stealthMiseZaJindru_brabant_moraleHit` | 30 s | `549889f2-d5c9-43f7-ab52-487b0a262d47` |
| `quest_stealthMiseZaJindru_guard_visionBoost` | Until removed | `dcbee361-3936-46d8-a06c-50d5b0c51265` |
| `quest_utokNaNebakov_zizkaHardcoreMode` | Until removed | `0e48ec11-4cb8-48a8-88c2-abb358b5f35e` |
| `quest_utokNaNebakov_zizkaLowerStats` | Until removed | `b2f86f72-b8f7-458f-9358-dd2ed7b01a9f` |
| `quest_weak_attacker` | Until removed | `404a26eb-cc2d-46cc-8989-ca40fd0d56e1` |
| `quest_zbranePanaSemina_seminDuel` | Until removed | `91fe879a-2881-426b-984c-0f49b551a76f` |
| `quest_zikmunduvTabor_ditrichBoost` | Until removed | `22a77241-ab4c-456a-9596-ba158154ece1` |
| `red_deer_easyKill_permanent` | Until removed | `401598d4-9e5b-4a5c-8917-afe2aad4cc6f` |
| `remove_drunkness` | Until removed | `e7e0eda4-a76c-49af-aa3e-43ccea14297c` |
| `remove_drunkness_constant` | Until removed | `e5ff5b8f-c764-44d8-b156-a884233150e1` |
| `roadside_corpse_npc_triggered` | Until removed | `bc2be2ea-c588-4c32-b155-d96c646cb689` |
| `roe_deer_easyKill_permanent` | Until removed | `f6c604fd-66fb-47db-9e9e-1506d5a8e414` |
| `rutinaAVypad_battleBadPairDebuff` | Until removed | `519fcbcc-bd4a-4e08-a996-ab6f8bfab68a` |
| `rutinaAVypad_battleGoodPairBuff` | Until removed | `b9564fae-880a-4e44-9c29-61af452b8038` |
| `rutinaAVypad_healthLossBoost` | Until removed | `cc3a1a4a-ef7d-4a55-821b-dc2567d1290e` |
| `simulatedKnockout` | 5 s | `af197e82-54c1-44e4-a21c-21e83a8c273e` |
| `socky_drunkard_onehit_permanent` | Until removed | `c4deabe7-4375-4114-82ff-3d0c04d86cb0` |
| `spizovaciOddil_plagueGravesDug` | 20 min | `a40fff68-9051-48af-a599-54f3667a3065` |
| `stealth_lowerVisibilityArea` | Until removed | `2e9634d8-a7e4-4cdb-a5a5-eba2ca54ce16` |
| `stealthkill_protection` | Until removed | `479a82c7-89e8-47e1-b9b3-7544762bc822` |
| `svatba_tournamentBuffForNpc` | Until removed | `0606c003-7419-4e83-b359-59d1ff5ca8f5` |
| `svatba_tournamentBuffForPlayer` | Until removed | `f6d618ff-6361-4a20-b7d4-ea8e55f35321` |
| `temporary_immortality_onMercy` | 2 s | `8a4eec60-a667-4921-806f-05e3592c2de2` |
| `test_playBandageMyselfOnRepeat` | Until removed | `d42c87f2-9b51-48e3-831e-9ad449a4f100` |
| `thirty_heal_instant` | 1 s | `2c0cd734-d506-459b-a4ea-507c9e8a1074` |
| `training_experience_debuff` | Until removed | `ffda734a-763e-4de6-9cac-309c6084513b` |
| `unmute` | Until removed | `5145bb5c-ac08-43b9-92a7-0a6766516d53` |
| `unmute_nonpersistent` | Until removed | `18a0bd7c-214f-4107-bbc1-9e9bc09ce9db` |
| `utokNaMalesov_certDuelDebuff` | Until removed | `c1db1812-e3cf-4faa-a337-b34495f3b817` |
| `utokNaMalesov_malesovTowerDefendersDebuff` | Until removed | `71644162-1bcc-484f-b926-ec31eacec96e` |
| `vezniNaTroskach_afterTorture` | 1 h | `0e553f9a-5da8-4050-912e-0506e4a95c18` |
| `vezniNaTroskach_torture_1` | Until removed | `c01b06d6-1003-43f6-a92d-1685d12b24c8` |
| `vezniNaTroskach_torture_2` | Until removed | `7750688b-21f7-4ab2-a89d-f975cc4ce277` |
| `vezniNaTroskach_torture_3` | Until removed | `01807959-3249-40f3-a25b-9983b3d9e5cb` |
| `vip_attackprot_fading` | 2 s | `363e7fef-1251-466a-b133-7f5970af00f7` |
| `vip_knockoutprot_remove` | Until removed | `f8180af4-ce59-41c2-b038-e4d72b68366f` |
| `vip_lootprot` | Until removed | `d096efbd-54cd-4ebd-b6e9-669802ec5f03` |
| `vip_lootprot_remove` | Until removed | `b9c82b6a-55f2-43dc-b481-8ce28a373a56` |
| `vip_stealprot` | Until removed | `d5996d8b-611d-4cc8-bfbd-7ab2c8884cf6` |
| `vip_stealprot_persistent` | Until removed | `63edd356-a11b-4701-b560-ac39bfb8f42f` |
| `well_rested` | 1.6 h | `0648c02b-ebe8-4a77-85a5-23b43f625dc5` |
| `wildAnimal_fasterBleeding` | Until removed | `352d9c12-c7ac-4035-a516-308678bb31d3` |
| `zachranaPtacka_boostedVavak` | Until removed | `f99b83d8-0fda-4869-8060-40ddb6a98989` |
| `zachranaPtacka_malesovAlarmNervousness` | Until removed | `f4d0347e-40b1-4a21-8c1f-d422aaceea32` |
| `zranenyLovci_onTree` | Until removed | `aa483616-9328-4e86-8b43-76ddfa559cf7` |
| `zranenyLovci_pullDownProtection` | Until removed | `98e072dc-43be-472d-a8b5-a8e9a024bbe2` |
| `zranenyLovci_wolfHealthLossBoost` | Until removed | `f053ee01-aade-4a13-a776-597c97d34bab` |

</details>

<details>
<summary><code>system</code> (147)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `actor_illuminance_meter` | None | `58558161-bed7-4af5-902d-6978c8d21c5e` |
| `additional_weight` | Until removed | `6685629b-f174-440a-a7f8-0b6a22a0ac88` |
| `after_sleep` | Until removed | `9b281555-f071-4a9c-aedc-41b5015ee702` |
| `alchoholDigestionBoost` | 1 s | `fc781bef-900d-40d8-9d8d-edb58abc930c` |
| `archery_stamina` | Until removed | `187d87c7-e97a-4558-ab7c-5318e441e065` |
| `autotest_no_exhaustion_digestion` | Until removed | `4eb14ea6-2ad6-420d-bba6-670d05601cce` |
| `autotest_stamina_boost_infinite` | Until removed | `bf1ed388-e1a5-4688-8563-05895e529e7a` |
| `autotest_stamina_regen` | Until removed | `5ae26f31-1783-44cd-a40b-503c62c867af` |
| `bleeding` | Until removed | `0c903899-fcc9-4cf2-9ee3-1130ac08b0fc` |
| `bleeding_thickblooded` | Until removed | `3e9b2099-d1e5-493d-8fe4-8de9ea9e9e8a` |
| `bratriZCimburka_cimbrosBattleBuff` | Until removed | `6d7a3329-11d1-49cd-a100-a7fa79bce4bd` |
| `caffeine` | Until removed | `950fcd4d-fbb5-449d-bdd3-f0895da89168` |
| `carrying_load` | Until removed | `88e6cb97-af82-4b75-8d4f-388246cd7489` |
| `clean_cut_debuff` | 20 s | `993dba95-0683-4cf1-9c57-48edefaa382f` |
| `combat_close_threat_morale_context` | Until removed | `3277268b-60f2-47c6-8130-ddca6bea82a1` |
| `combat_fall_damage_enable` | Until removed | `2c04557c-b6cf-4bfd-b815-a0204f57d3cf` |
| `combat_morale_context` | Until removed | `1385b27e-0d22-4a92-806b-3a0c94f6a813` |
| `combat_riposte_probability_penalty_on_master_strike` | 30 s | `4ce909c2-93d3-4b37-887d-c62a79eb5890` |
| `combat_stamina` | Until removed | `e0efefa6-d79b-4cae-988c-b9fd5a78f575` |
| `crouch` | Until removed | `adddf52a-4c53-49e2-aa22-bd11ae452eca` |
| `cutscene_stopTime` | Until removed | `bbe946c9-a6d6-4ba7-96e2-6a884bb66fe3` |
| `debuffSpeed` | Until removed | `5fc4d5d0-6589-4df2-b585-3899a681fb56` |
| `defense_debuff` | None | `3f96e766-9e2c-4d3c-b86c-62ad7b6f1970` |
| `defense_debuff_nonpersistent` | None | `526b44bf-c119-4b26-9218-fed39d034d0e` |
| `disable_perks_ui` | Until removed | `46ad1d94-bce0-4d2b-be23-7d6c827616cb` |
| `disable_run` | Until removed | `6f8d0939-90cb-47dc-9352-33a9cb2e6bf0` |
| `disable_sprint` | Until removed | `7481f890-237d-4312-b647-f056c880edc2` |
| `disable_sprint_persistent` | Until removed | `4e029081-a402-41ef-bfc5-7a01afdc391b` |
| `disabled_revive` | Until removed | `6a61a139-4ae5-49e1-9b7f-31b72ff2e1e5` |
| `dlc2_bed_sleep_alcoTeleport` | 1.6 h, game clock | `5e670a29-9e21-413a-be75-943c2e9c656b` |
| `dlc2_bed_sleep_craftsmanship_unarmed_bonus` | 1.6 h, game clock | `f2b89fdb-9d15-4a2d-9cea-93bcd8e5eecd` |
| `dlc2_bed_sleep_digest_sleep_bonus` | 1.6 h, game clock | `2797dac5-8ae3-4e20-a31d-8739e96b5b19` |
| `dlc2_bed_sleep_reputation_bonus` | 1.6 h, game clock | `8ebef888-833c-4ebb-828b-acd663113ce4` |
| `dlc2_bed_sleep_skillchecks_bonus` | 1.6 h, game clock | `f6fc9df8-da1c-44c5-a437-5f52f8f45991` |
| `dlc2_bed_sleep_survival_bonus` | 1.6 h, game clock | `345744d4-5a9a-48f7-9d02-cf39f7563166` |
| `dlc2_bed_sleep_well_rested` | 6.4 min, game clock | `23777ca7-2dc4-4a0d-aead-e8d25636d838` |
| `dlc2_others_reading_quality_bonus` | Until removed | `aa9bd3d5-a2e7-4d50-8ea3-ce556345ca55` |
| `dlc2_others_sleeping_quality_bonus` | Until removed | `20a5ce9c-f09b-4917-b7e4-21fd7da4b35f` |
| `dlc2_table_buy_sell_margin_bonus` | 1.6 h, game clock | `f6c92aeb-7899-4e4e-b520-b65ef37e8e9b` |
| `dlc2_table_fruit_vegetable_healing_bonus` | 1.6 h, game clock | `629b9545-e7c5-44a9-a625-c43a5bee83f9` |
| `dlc2_table_limb_injury_protection` | 1.6 h, game clock | `71069524-a9f7-443e-ae12-a6525d7f60bc` |
| `dlc2_table_lockpicks_break_chance_bonus` | 1.6 h, game clock | `60ed0e48-be98-402d-b67c-27257ab3bab7` |
| `dlc2_table_ranged_attack_bonus` | 1.6 h, game clock | `9a7d430b-2640-4709-bb77-b96c68d7f409` |
| `dlc2_table_skillteachers_xp_bonus` | 1.6 h, game clock | `91099846-a906-43ed-a65b-e956b291c4bf` |
| `dog_stealth` | Until removed | `ffc20521-134d-4811-8bc5-e932b74b7078` |
| `drunk` | Until removed | `690ed604-ebe9-448a-b87c-b9d1df82a527` |
| `drunk_nonpersistent` | Until removed | `362c7a34-218d-46dd-a001-f46095cb091a` |
| `encumbered` | Until removed | `daa26974-e5ce-41be-88cb-bbcef56e6452` |
| `exhausted` | Until removed | `c7f2c0f0-776a-43e3-a504-31870afc3710` |
| `exhaustion_protection_nonpersistent` | Until removed | `8db78e39-01f3-4a14-8594-7cca5fc8428d` |
| `fall_damage` | Until removed | `4bc0b081-a57e-4e6e-8297-6d9db58b39b2` |
| `fasttravel` | Until removed | `82fd15ef-4117-4094-88d9-ca15f7fe033e` |
| `fasttravel_invisibility` | 3 s | `e4b76425-4bc5-492a-9d5f-3575b4fab1be` |
| `god_mode` | Until removed | `e8ba6719-baba-48b2-9442-d737ef443148` |
| `haggle_denial` | 2 min | `0dcc7c4f-6ea3-4bd7-8f80-79249c4f5a66` |
| `has_damaged_armor` | Until removed | `5664cd2c-d113-42e6-b71b-5ea789dfc4e3` |
| `has_damaged_weapon` | Until removed | `2290487b-ec89-47c1-8ac0-f1decb9cd32f` |
| `heavy_bleeding` | 30 s | `ae48b141-6946-4714-9818-a253f81e792d` |
| `heavy_weapon_combo_finished_dummy` | None | `0a886758-b222-42f1-a5c5-c5f3d840e913` |
| `immortality` | Until removed | `85aca9c5-ec41-400d-a563-53df7b2399e8` |
| `immortality_fast_heal` | Until removed | `6cf0aa39-e09c-42fa-bf67-10f2d03991b7` |
| `immortality_fast_heal_nonpersistent` | Until removed | `52e578c8-608f-44e5-b6c0-e79673cfd4a0` |
| `invisibility` | Until removed | `cf787871-d151-43b7-a7c9-39acac116f0f` |
| `jail` | Until removed | `a8b03550-5e68-417a-9d10-2064b289a7e5` |
| `jail_recovery` | 1.6 h | `b152dbb8-d883-4e67-acba-b89829542e3e` |
| `jail_recovery_renegade` | 1.6 h | `46769b14-d592-4a7c-a6bc-811e3366affa` |
| `jail_recovery_theresa` | 1.6 h | `972b0d5a-6fab-4e28-b59c-a3697f7c05c3` |
| `low_health` | Until removed | `9c5eb897-0432-4b41-8fbd-2607d0629b44` |
| `low_pickpocketing` | Until removed | `3c815093-4d43-40f3-9cdc-accb5c9e07ca` |
| `mikes_kozlik_nebakov_stats` | Until removed | `231cf355-1fc4-48f4-b694-ccd9363a2e5e` |
| `mikes_kozlik_oblehani_suchdole_stats` | Until removed | `25222af4-f519-4baa-ac87-803e5f974d62` |
| `mlynaruvUcen_stealthTakedownBuff` | Until removed | `c795a2ad-b1c0-44c8-93d8-bb1a9d39993d` |
| `mlynaruvUcen_stealthTakedownDebuff` | Until removed | `0a00cd37-3769-4d0f-8f82-088d5a3f9b1b` |
| `monk` | Until removed | `64ad3583-161b-4fb0-97ad-56b826ed2480` |
| `morale_context` | Until removed | `81d476d4-3c68-40cf-8c85-b62a4102cb76` |
| `mounted_player_buff` | Until removed | `abcdefab-ffff-ffff-ffff-aaffaaffaaff` |
| `near_level_barrier` | Until removed | `7747812b-253d-42fd-bd7a-0e50b65e6b27` |
| `overread` | Until removed | `943bb91d-52a2-42e9-bbd5-66cf48179224` |
| `oversleep` | Until removed | `a5e4791a-f5a6-403e-9161-5b8a22966751` |
| `owned dog` | Until removed | `389302cb-5a3c-49cc-be4c-14579cdd4e72` |
| `perk_SupremelyAttentive` | Until removed | `01f942ca-a62a-44ed-8c6f-a8274b8df30d` |
| `perk_bonebreaker` | 10 s | `b141e92e-020c-4713-b48b-3202431ac8e2` |
| `perk_down_to_size_debuff` | 15 s | `b3ae0db1-e975-4ea0-946f-7f4ee1aa3fe4` |
| `perk_hardcore_hangry_henry_starvation` | Until removed | `62058f03-c55e-433f-acea-7fa777cf67c2` |
| `perk_hardworking_lad_carrying_body` | Until removed | `efab3328-a1f7-4df1-a1df-eeaf86972b10` |
| `perk_immortal_companion` | Until removed | `ab1503b5-1494-456a-baa1-0c2f4efbf3e5` |
| `perk_mischief_artist` | 2 min | `3eededc5-5839-4d8c-9550-814209e97fc4` |
| `perk_reading_regen_improved` | Until removed | `feb22377-20e5-4b48-99a5-ead424fca392` |
| `perk_thunderous_blast_debuff` | 20 s | `d8c62af9-fde6-43b7-a36d-1f044987d552` |
| `perk_totentanz_attack_bonus` | 5 s | `d2217865-127b-4637-94b6-e159d30d2c17` |
| `perk_trustworthy_middleman` | Until removed | `8dbc9082-ca40-46e5-bdce-2712b4e698a3` |
| `perk_undercut` | 10 s | `25f7907b-fb0d-4563-bddf-dfdc44c168cb` |
| `perk_undercut_ii` | 10 s | `e7115e39-2607-4509-a640-fe941b4959d6` |
| `permanent_corpse` | Until removed | `7a61a139-4ae5-49e1-9b7f-31b72ff2e1e6` |
| `permanent_corpse_persistent` | Until removed | `3702b27b-2591-4dd7-9353-4ae569151d98` |
| `player_horse_stamina_modifier` | Until removed | `feedbeef-dead-babe-f00d-be9dad6abed9` |
| `player_immortality` | Until removed | `98d2764a-bdbf-473f-903a-1209813d2e15` |
| `player_immortalityOnly_nonPersistent` | Until removed | `89739dbc-fb20-4a28-8b70-986ab9b5f79a` |
| `player_immortality_nonpersistent` | Until removed | `44e1ccc9-9252-48a9-922d-2ae4523c69a3` |
| `poustevnik_excited_konrad` | Until removed | `c3b0ab94-8e7a-4c96-ae74-53b919ffc052` |
| `prepadeniVlasskehoDvora_alcoholAntidoteBooster` | 10 s | `0873fbf3-a245-4e3e-9b4a-bb2f2df09c02` |
| `prepadeniVlasskehoDvora_alcoholDigestBooster` | Until removed | `d5744c88-7cde-405f-811a-55fc502236b6` |
| `quest_cart_tag` | Until removed | `cbb45bf5-a8fa-4615-a9ea-fc72f517b87f` |
| `quest_mapaKPokladu_banditCourage` | Until removed | `eeddf516-3f10-4988-8b97-5ee130f47163` |
| `quest_nebakovPruzkum_fencingBoost` | Until removed | `c2ea5d48-9283-4be4-ae48-b7c02ff376ad` |
| `quest_utokNebakov_blur_long` | 55 s | `87b33bd6-c3bc-4974-8c34-01fd14ad7a36` |
| `quest_utokNebakov_blur_short` | 8 s | `117fe105-5c31-4e45-9e77-50993dae4472` |
| `quest_utokNebakov_half_movement` | 8 s | `f16d86e9-230d-4f75-b2ce-cfc6765e9608` |
| `quest_zachranaPtacka_PtacekCombatBoost` | Until removed | `6ed245f0-7882-49d9-b074-41e25c13753e` |
| `reading` | Until removed | `9be2617e-61e0-4a0c-976b-1dbb216bef15` |
| `reading_quality` | Until removed | `48562e8c-f292-4c1a-a307-e63bcf0b00f2` |
| `reading_regen` | Until removed | `eab9a787-9460-4c90-96ec-8e69c4a82d8d` |
| `remove_all` | 5 s | `8e56612f-30b7-447c-b331-c7e4be807717` |
| `respec` | Until removed | `c8b0d038-a503-44cc-85a5-7f753a09eb6e` |
| `ridden_horse` | Until removed | `60c6aca4-a5a9-442b-9cc8-7f0e31ecfd43` |
| `robbed_angriness` | 10 min | `26e0501f-c2d6-463f-b9b8-1946e5e9b1c3` |
| `s39_headProtectionNPC` | Until removed | `7d89d580-f6aa-45d2-aa66-6ce68d7d817d` |
| `setkaniVRatbori2_bohuta_alcoholDigestBooster` | Until removed | `e7afc162-6c81-4bac-84f5-fa06d236894f` |
| `sharpening_pressure` | Until removed | `acae1f4d-f766-4ccb-b081-44bda51f779c` |
| `short_term_nutrition_food` | Until removed | `677cbe60-d88f-4313-9bc9-985aa59e5e1d` |
| `sleep` | Until removed | `cbbedb16-8ab8-4583-b740-a0e8a2521d95` |
| `slow_attack_rate` | Until removed | `ffda724a-762e-4de6-9cac-209c6084512b` |
| `smell` | Until removed | `6ecc9124-b0bb-4a37-a9e9-ca0d78e76a5e` |
| `sniffing` | Until removed | `1b562bab-88fc-4e84-83fd-a5ac465c18a8` |
| `sprint` | Until removed | `c502b267-8084-40b4-9cbd-ee76cf52b37a` |
| `starvation` | Until removed | `78dc0d01-337e-47f5-b7b5-14b25d9b251f` |
| `stomach_pain` | Until removed | `77f9e797-3bca-4bbe-871b-b83b587d6b92` |
| `surrendering` | Until removed | `5d070c0b-5891-4e1e-83c5-72120a90b015` |
| `svatba_svatba_tournamentBuffForNpc_fistFight` | Until removed | `15e247cc-3793-407f-b9bd-03b49c549437` |
| `sword_combo_finished_dummy` | None | `26524ef2-ef50-4bc5-a149-262880922b82` |
| `targeted by opponent (ranged wpn)` | Until removed | `3e6e8dc6-3851-419f-b1e9-1f32524dcb06` |
| `test_suppressArmorLoad_high` | Until removed | `70d29ce9-cf46-40b4-b0b7-803307c45c42` |
| `test_suppressArmorLoad_low` | Until removed | `228f7520-d160-436a-8d37-97f677a21591` |
| `test_suppressArmorLoad_zero` | Until removed | `4757340d-214a-4188-8526-a58bcb0704e1` |
| `unconscious_fall_damage_enable` | Until removed | `4ad6bb79-f2a0-4656-bfe6-cbf4141adbc2` |
| `unconsciousness_protection` | Until removed | `7524aadc-7819-4c55-a3cf-8caec0d0f437` |
| `unconsciousness_protection_cutscene` | Until removed | `3be64de4-dca5-4580-ac24-7553e3c89b05` |
| `unconsciousness_protection_nonpersistent` | Until removed | `f46120bf-b45f-4ec5-95c6-03d526cb40bf` |
| `unstream_protection` | 5 min | `32bcd798-bc87-4947-bb7e-ad07f4e9fe30` |
| `unstream_protection_nonpersistent` | Until removed | `0ba907a9-780f-4427-ba8a-a3b2a788d0bc` |
| `utokNaMalesov_malesovVillagersBoost` | Until removed | `3f92a272-3469-46aa-b9f3-fdb5b6aa8588` |
| `utokNaMalesov_stealthBuff` | Until removed | `c9c0a4c8-cec0-4f88-9785-cc35ce1ff551` |
| `vezniNaTroskach_drunkSoldiers` | Until removed | `a40f5d6c-ef6e-456b-bfef-cb0f5d26ac6a` |
| `vip_stealprot_remove` | Until removed | `999b783c-90ff-4054-bb5a-9f4f9b1da7cb` |
| `vip_unconprot_remove` | Until removed | `ac6db9f1-254e-488a-9e45-759fd8cc7088` |
| `vip_unconprot_remove_persistent` | Until removed | `97828156-42a0-40e2-b772-7c328d2ead98` |
| `visualBleeding_protection` | Until removed | `11f44a76-21e3-4e1a-9b25-4b9341d4b8ef` |

</details>

<details>
<summary><code>testingCombat</code> (12)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `boar_charge` | Until removed | `0d256673-3b7a-4125-a069-b40c20d5071f` |
| `combatTutorial_preventDamage` | Until removed | `7d6a30e4-c6fe-470f-b8c9-f8b226ee44cf` |
| `combatTutorial_preventHealthDamage` | Until removed | `3f98693d-43d6-4c09-bec7-2498c40ea908` |
| `combat_passivity` | Until removed | `09fd5ffb-4972-4b70-8c2e-02c35bd15602` |
| `greater_attack` | 5 min | `e87bf450-36ae-4c37-a01c-1ff2a141cb83` |
| `prepadeni_preventDamageDuringTrainingDuel` | Until removed | `e719142d-5438-4cc4-b640-6124b8c8869d` |
| `quest_utokNebakov_noDamage` | None | `7ead0083-026d-4567-80b3-68ac82693b78` |
| `resistent_fella` | 1 h | `7ead0083-026d-4567-80b3-68ac82693b77` |
| `stamina_frenzy` | 5 min | `087ae30d-5484-4223-8814-0bc946a07172` |
| `test_invincible` | Until removed | `4add60ab-9015-4e56-9f7a-cb19345d6d49` |
| `test_stealth_kill_fail` | Until removed | `6ad5711f-8727-4e9a-9607-c36ab5cea256` |
| `test_stealth_kill_success` | Until removed | `97746824-30b5-4b8a-8168-8f218bf2661d` |

</details>

<details>
<summary><code>testingStat</code> (73)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `autotest_max_badassness` | Until removed | `6f4d327d-2d97-4339-a9d2-679b02aee5e6` |
| `autotest_max_charisma` | Until removed | `3d4e4e2a-3d1c-4d1c-9131-9b12b21f65a5` |
| `autotest_max_coerce` | Until removed | `d38c9301-2b8a-45b1-a0b3-5fd11119a211` |
| `autotest_max_dominate` | Until removed | `512c510f-12c2-404d-9c13-df1e43133ec8` |
| `autotest_max_dread` | Until removed | `e6a5dc1c-ccf5-453f-bffc-3e874ac84165` |
| `autotest_max_impress` | Until removed | `d491b2d0-c2f8-4a20-9a9d-f11db82ca5db` |
| `autotest_max_might` | Until removed | `844445e2-300b-4750-9cf4-a1f5c0e1beef` |
| `autotest_max_morale` | Until removed | `d46dfbbf-3f14-4477-b639-fd5508fc7dfc` |
| `autotest_max_persuade` | Until removed | `5eb76853-4423-47d8-ab0b-f505f243c4c2` |
| `autotest_min_badassness` | Until removed | `33d328b8-9567-41f4-b2d2-67058da639e2` |
| `autotest_min_charisma` | Until removed | `cebe4d7b-d7fe-46e6-85d1-d62c8c9d16e6` |
| `autotest_min_coerce` | Until removed | `aaba4c77-f834-4971-bcc4-ef444477c817` |
| `autotest_min_dominate` | Until removed | `f59911d3-52de-4e36-961d-27794857c426` |
| `autotest_min_dread` | Until removed | `a2604dae-292b-44cf-be15-e7d1ef5ef0fa` |
| `autotest_min_impress` | Until removed | `24beca1b-ceee-40b0-9138-6955acdf557e` |
| `autotest_min_might` | Until removed | `1fe1dee3-d749-4a2d-b36f-4a6b9a0c412a` |
| `autotest_min_morale` | Until removed | `aea172fe-0217-4c17-b37b-c029568b4e07` |
| `autotest_min_persuade` | Until removed | `f18dbed4-0e86-427d-9ba1-a5a4331d8872` |
| `blacksmithing_stamina` | None | `068143cd-45b5-4c44-8c6c-9d2c622b75de` |
| `good_appetite` | 10 min | `ae62df54-a5cc-4018-a4e1-247259b3fa6d` |
| `imba_combat_guy` | Until removed | `e064e816-cc15-4e53-a036-cdf573421302` |
| `meat_agi_exp_test` | 50 min | `2c6f5c04-087b-4a7d-9b0e-0d7e07c38483` |
| `meat_str_exp_test` | 50 min | `0902c0be-711b-40be-bc76-78d93de970aa` |
| `meat_vit_exp_test` | 50 min | `7ffc7b0d-ca9f-46f6-9fe4-bf0187f898a7` |
| `morale_max` | Until removed | `61bf5b0d-aa94-45cc-9cdd-dd76d3903189` |
| `mr_nice_guy` | 10 min | `79efdca6-1992-44df-ada4-9c2ae1710bf1` |
| `nonpersistent_very_tough_guy` | Until removed | `d9cfb9e0-7949-49e0-b6b5-b7cd6a51dd27` |
| `nonpersitent_tough_guy` | Until removed | `77273b1c-a974-4512-b59e-017b19788f54` |
| `not_so_tough_guy` | Until removed | `076c2e93-347d-4996-bef9-016c3d890008` |
| `poor_vision` | 3 min | `53a52200-e84e-4e26-99ba-d84f151cadb4` |
| `quest_noDirt` | Until removed | `a3dd717a-5b53-41de-b417-53e0798d10a7` |
| `really_slow_movement` | Until removed | `988fef54-920a-44a7-b771-2caa66a0219a` |
| `slow_movement` | Until removed | `b9f062d3-c06e-4698-90d4-e642e863337b` |
| `temp_deaf` | 3 min | `559ec27d-1c69-48d6-9ccb-da33a9b23124` |
| `test_agi` | 10 s | `e737ed03-c53b-4535-b0b1-f701756c4b79` |
| `test_bane_visual` | 10 s | `7a7f5bdf-2b9d-4d84-9290-e09d3ce8d3d8` |
| `test_berserker_visual` | 10 s | `e211967c-e1de-4041-a0ea-d48d99ddb62b` |
| `test_boost_charisma` | Until removed | `a933d97c-698c-41cf-a935-e0fb687d7970` |
| `test_code` | Until removed | `8e87a286-712b-49b9-82eb-f47805ec5d08` |
| `test_constant` | Until removed | `45166775-a225-47aa-bcee-338105a687d3` |
| `test_e3_pickpocket_for_player` | Until removed | `d81cbd73-3b9d-4fd7-b437-f2648b540202` |
| `test_encumber` | Until removed | `9a2d3b9d-cdd9-4113-aeeb-764e12b3ba86` |
| `test_extreme_digestion` | 1 min | `1191c7f4-2dea-4c1c-8b7d-e1c808871e78` |
| `test_fading` | 10 s | `62eeb23f-ccbf-4af9-8f8d-de57da75c50e` |
| `test_forceSurrender_smallerHits` | Until removed | `43de5a76-82f4-4619-89f0-ccd2ca2d1703` |
| `test_huge_inventory` | Until removed | `1a42e06f-41c2-4d0a-bcf7-935b0c87a56a` |
| `test_invisible` | Until removed | `07db9dfd-0e0c-4cbe-bf8a-10aaa1add262` |
| `test_mst` | 20 s | `4d1ec44e-5d1a-436b-a8d9-973d386b48d1` |
| `test_negation` | Until removed | `c7e37c48-bd84-4838-9f96-a2025e15cded` |
| `test_nighthawk_visual` | 10 s | `0d7ada24-d3fc-4dc9-abc8-5e57bdf747bc` |
| `test_owl` | 1 min | `e3b8e7dc-0a1b-4e6c-a0ce-ffc1519c40ec` |
| `test_padfoot_visual` | 10 s | `e4165c2f-39ff-4a0a-9133-c4f82fcd95ba` |
| `test_poison_visual` | 10 s | `6b5db01c-0e65-4b5f-b9f6-f091f3bea121` |
| `test_profiling_slow_death` | 3 min | `bd0dcc02-f7ed-4ebf-bdf0-b2bd7358aac2` |
| `test_realspeed` | 30 s | `2d71ec02-4257-479e-a8fa-a1a8fda667dc` |
| `test_reg` | 20 s | `f446ed8b-e69b-4616-8b43-1678093ea493` |
| `test_script` | 10 s | `44c61b30-c20e-4267-ab01-a1e39342731e` |
| `test_stamina_boost` | 1 min | `bc753c63-6c91-4789-9d4a-9e3674759fa8` |
| `test_state_delta` | 5 s | `567ba83f-fc83-40fb-a8c6-ac42bc4a7201` |
| `test_str` | 20 s | `f964e339-a3d5-4e50-83c5-1d74a6e0ea41` |
| `test_turtle_skin` | 1 min | `ac563832-a5d6-427c-86c0-564c119c7948` |
| `test_weapon_poison_deadly` | 10 s | `dea88883-e54d-4946-b586-78975597752e` |
| `test_witch_visual` | 10 s | `eca9aa28-9c54-4af1-9fac-c10b439c5a8b` |
| `test_wormwood_visual` | 10 s | `ae3d6454-5ae8-4662-9bea-deebebac82e8` |
| `test_zero_morale` | 20 s | `60e8260f-026a-491e-90c3-b3738aae3c8a` |
| `tough_guy` | Until removed | `ccf87599-202c-49e0-ab36-baa62e5fa05b` |
| `very_tough_guy` | Until removed | `ab97ed6c-e830-4fc6-a45a-261117cd5c85` |
| `very_weak_guy_nonpersistent` | Until removed | `fb737451-20e9-4338-a8d3-5121b50804b7` |
| `vip_attackprot` | Until removed | `360e7fef-1051-446a-b133-7f5970af00f7` |
| `vip_attackprot_persistent` | Until removed | `9155cc2e-0af1-449b-acf2-58379c0e6115` |
| `vip_attackprot_remove` | Until removed | `8e9cb93a-eb5f-4846-be2c-2c7010872704` |
| `vip_attackprotonly_remove` | Until removed | `47b12127-c5b3-43a8-a729-070db79a219a` |
| `weak_guy_nonpersistent` | Until removed | `fb737451-20e9-4338-a8d3-5121b50804a8` |

</details>

<details>
<summary><code>unconsciousness</code> (5)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `remove_unconsciousness` | None | `bd22f98a-e61f-4d83-b39c-79d1d85b6b91` |
| `unconscious` | 1 min | `f8d60fe4-e2c1-420a-946a-213e1cd09264` |
| `unconscious_alcohol` | Until removed | `7f0e2530-abc9-4800-8ae1-5db8a9aa86b1` |
| `unconscious_nonpersistend` | 1 min | `f8d60fe4-e2c1-420a-946a-213e1cd09265` |
| `unconscious_permanent` | Until removed | `c75aa0db-65ca-44d7-9001-e4b6d38c6875` |

</details>

<details>
<summary><code>weaponSkill</code> (5)</summary>

| Effect | Lasts | GUID |
| --- | --- | --- |
| `potion_bowmans_brew` | 10 min | `736fcb09-5554-4e6b-b3e0-f9bc6cc4fd0a` |
| `potion_bowmans_brew_2` | 10 min | `ebd30789-f788-493d-8bf3-ed830446e7aa` |
| `potion_bowmans_brew_3` | 10 min | `59ead0ed-6514-4b45-8a57-d3a95b75d7ba` |
| `potion_bowmans_brew_4` | 15 min | `71afe0a0-fa45-42f1-a07d-acd3d02bfc0f` |
| `standing_still_archery_boost` | Until removed | `d37f94bd-5337-483e-8c53-45ac015c429f` |

</details>

<!-- /generated:buffs -->
