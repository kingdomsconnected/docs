---
title: NPC and dog souls
description: The NPC roles, one soul GUID for every human look the game ships, and every dog soul, for Npc.create and Dog.spawn.
sidebar:
  label: Souls
  order: 115
---

A soul is the game's record of who a body is: its face, its clothes, its name and its stats.
[`Npc.create`](../../reference/server/classes/Npc.md#create) takes a role name or a soul GUID, and
[`Dog.spawn`](../../reference/server/classes/Dog.md#spawn) takes a dog soul GUID.

```ts
Npc.create({ soul: "guard", position: player.position });
Npc.create({ soul: "63daa80b-d1f4-46f5-8222-c22a541cae07", name: "Captain", position: player.position });
Dog.spawn(player, player.position, undefined, "fcfe02fe-7fcf-4919-b00e-193f5006dde7", "Mutt");
```

For horses, use a breed instead: see [Horse breeds](../horse-breeds/).

## Roles

The named kinds of NPC this build ships, from [`Npc.roles`](../../reference/server/classes/Npc.md#roles).
Each is one real soul from the game's tables.

<!-- generated:roles -->

| Role | Body | Looks like | Soul GUID |
| --- | --- | --- | --- |
| `guard` | Male | `char_GENERIC_MAN_GUARD_15` | `63daa80b-d1f4-46f5-8222-c22a541cae07` |
| `guard_alt` | Male | `char_GENERIC_MAN_GUARD_16` | `2e96ee86-7c95-4b57-91f6-6d3abce75d22` |
| `knight` | Male | `char_GENERIC_MAN_GUARD_05` | `fc4536b2-4964-4f79-af47-c6e7a3e5ec29` |
| `bandit` | Male | `char_GENERIC_MAN_ENEMY_BANDIT_02` | `a081e02a-6bbf-4a17-bf26-e6a31aea10af` |
| `bandit_alt` | Male | `char_GENERIC_MAN_ENEMY_BANDIT_14` | `02c59661-b14a-4f3c-9239-f31de1e2be57` |
| `cuman` | Male | `char_GENERIC_MAN_CUMAN_04` | `47e6faf8-0387-367e-4c70-0003bf03dfa8` |
| `townsman` | Male | `char_GENERIC_MAN_COMMONER_02` | `51ea9c51-48b0-4f44-bedb-081f252b6ba4` |
| `townsman_alt` | Male | `char_GENERIC_MAN_COMMONER_03` | `f61ce06c-93ca-4157-af2f-fc286b5ad83f` |
| `townswoman` | Female | `char_GENERIC_WOMAN_COMMONER_10` | `f80c07aa-d033-4e94-a61e-ef4a24c10bc2` |
| `townswoman_alt` | Female | `char_GENERIC_WOMAN_COMMONER_08` | `41c12ac6-ba41-4ffa-87a0-69574c80b633` |

<!-- /generated:roles -->

## Human souls by look

The game ships thousands of human souls, but most share a look with others: every bandit of one
quest can be the same `char_GENERIC_MAN_ENEMY_BANDIT_14`. These tables keep one soul per look, so
each row spawns a different-looking body. **Souls** counts how many of the game's souls share it.

:::caution
A soul written for a quest can bring that quest's clothing, name and faction with it. Override
what you need with the `name`, `outfit`, `wearing` and `faction` options of `Npc.create`.
:::

### Generic townsfolk, soldiers and guards

<!-- generated:generic -->

<details>
<summary>Generic man commoner (25)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_COMMONER_01` | Male | `5b6a54df-105f-4dca-9356-dc28847883ce` | `dummyWanderer_beggar_man_1` | 46 |
| `char_GENERIC_MAN_COMMONER_02` | Male | `51ea9c51-48b0-4f44-bedb-081f252b6ba4` | `bohutovaVlozka_rowdy_1` | 41 |
| `char_GENERIC_MAN_COMMONER_03` | Male | `f61ce06c-93ca-4157-af2f-fc286b5ad83f` | `bohutovaVlozka_rowdy_2` | 41 |
| `char_GENERIC_MAN_COMMONER_04` | Male | `06c26f22-1bdf-4597-906d-d6ae92fb91da` | `dummyWanderer_villager_man_1` | 41 |
| `char_GENERIC_MAN_COMMONER_05` | Male | `1e958409-42db-41c6-b5a2-630014a4a2b2` | `dummyWanderer_villager_man_2` | 37 |
| `char_GENERIC_MAN_COMMONER_06` | Male | `1926c315-a29f-4e52-b940-70e666efb2ba` | `dummyWanderer_villager_man_3` | 38 |
| `char_GENERIC_MAN_COMMONER_07` | Male | `ce489e19-e014-4da7-b927-4d90e9535fea` | `dummyWanderer_fisherman_1` | 31 |
| `char_GENERIC_MAN_COMMONER_08` | Male | `d2a3c045-2d43-491c-80a4-96137fcb99de` | `combatEnemy_3` | 38 |
| `char_GENERIC_MAN_COMMONER_09` | Male | `d3e98ce9-45fa-486b-a418-e0f3832eb173` | `dummyWanderer_fisherman_3` | 40 |
| `char_GENERIC_MAN_COMMONER_10` | Male | `99c38541-3ba5-454e-85c1-d7693c5c9b83` | `hlasatel_man_10` | 34 |
| `char_GENERIC_MAN_COMMONER_11` | Male | `b3037b98-cae4-47c8-9583-c21a92883f09` | `combatEnemy_2` | 39 |
| `char_GENERIC_MAN_COMMONER_12` | Male | `925f9309-b9ec-45c9-bd60-2452401a2d99` | `erik_party_sittingGroupMan_2` | 35 |
| `char_GENERIC_MAN_COMMONER_13` | Male | `b4cae680-98ea-4ccd-9a78-c797029b4cb6` | `hlasatel_man_13` | 32 |
| `char_GENERIC_MAN_COMMONER_14` | Male | `9384758e-29d7-4ca6-a636-17883b6f611e` | `bohutovaVlozka_rowdy_4` | 42 |
| `char_GENERIC_MAN_COMMONER_15` | Male | `35d03698-4eb9-4007-8b93-bf323917687d` | `erik_posel` | 30 |
| `char_GENERIC_MAN_COMMONER_16` | Male | `df95af07-5236-438a-bd4b-dbbdbc1343d1` | `bohutovaVlozka_rowdy_3` | 39 |
| `char_GENERIC_MAN_COMMONER_17` | Male | `584f681c-2f90-4ef2-b1de-470282a7993d` | `combatEnemy_1` | 49 |
| `char_GENERIC_MAN_COMMONER_18` | Male | `c62910f0-fb11-46ca-9766-560e03ca566e` | `hlasatel_man_18` | 37 |
| `char_GENERIC_MAN_COMMONER_19` | Male | `dad77ce1-18a1-40e7-b14c-228002cf3265` | `erik_party_dancerMan_1` | 34 |
| `char_GENERIC_MAN_COMMONER_20` | Male | `cbcfa22b-c4fb-4bce-a38b-c4ef74a979a3` | `hlasatel_man_20` | 35 |
| `char_GENERIC_MAN_COMMONER_21` | Male | `029a253b-883b-4efb-b600-afbe3fa22580` | `erik_party_groupMan_2` | 29 |
| `char_GENERIC_MAN_COMMONER_23` | Male | `8d6451ab-03e0-49f0-a1c6-689c95b8b686` | `hlasatel_janHus_man_1` | 32 |
| `char_GENERIC_MAN_COMMONER_24` | Male | `f2d8cbd0-e17a-45ad-a74d-fd12e971266f` | `erik_party_barrelMan_1` | 40 |
| `char_GENERIC_MAN_COMMONER_25` | Male | `532aa454-e01e-4d2f-beed-8d2ca7f99a54` | `hlasatel_man_25` | 35 |
| `char_GENERIC_MAN_COMMONER_26` | Male | `b8cb1c43-78be-49c1-b53f-f205ee809f62` | `hlasatel_man_26` | 34 |

</details>

<details>
<summary>Generic man cuman (4)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_CUMAN_01` | Male | `4ceb0e7a-72d1-ace7-4cb3-ec85ebe6c586` | `bratriZCimburka_cuman_6` | 23 |
| `char_GENERIC_MAN_CUMAN_02` | Male | `4abf54c3-d269-8000-084d-db5363eb2da8` | `bratriZCimburka_cuman_2` | 23 |
| `char_GENERIC_MAN_CUMAN_03` | Male | `4ec7e367-3bd4-4969-cf83-17e4b5df98a6` | `bratriZCimburka_cuman_3` | 25 |
| `char_GENERIC_MAN_CUMAN_04` | Male | `47e6faf8-0387-367e-4c70-0003bf03dfa8` | `bratriZCimburka_cuman_1` | 19 |

</details>

<details>
<summary>Generic man enemy bandit (10)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_ENEMY_BANDIT_01` | Male | `2655dfe1-d401-4f34-8941-cc9a0882fbe2` | `artefakt_zachariasMercenary_3` | 36 |
| `char_GENERIC_MAN_ENEMY_BANDIT_02` | Male | `a081e02a-6bbf-4a17-bf26-e6a31aea10af` | `archery_bloodTrail_bandit_1` | 34 |
| `char_GENERIC_MAN_ENEMY_BANDIT_03` | Male | `663b1301-fd96-43c5-b01c-f4fc597c0df6` | `crimeScene_bandits_watcher_4` | 35 |
| `char_GENERIC_MAN_ENEMY_BANDIT_04` | Male | `4a20b62a-d26d-4d1e-befb-e54963745be7` | `bohutovaVlozka_bandit_4` | 33 |
| `char_GENERIC_MAN_ENEMY_BANDIT_06` | Male | `4d2c436e-6514-216c-dda2-e9aa36ee8ba5` | `bratriZCimburka_pillager_1` | 37 |
| `char_GENERIC_MAN_ENEMY_BANDIT_08` | Male | `e9f0be89-c913-4241-9871-c3a873cf55d7` | `artefakt_zachariasMercenary_1` | 32 |
| `char_GENERIC_MAN_ENEMY_BANDIT_09` | Male | `4c590928-b13e-4013-a323-559bdfd5d5fa` | `bohutovaVlozka_bandit_6` | 26 |
| `char_GENERIC_MAN_ENEMY_BANDIT_11` | Male | `c386b193-e0cc-4df7-8e71-54be8555c013` | `crimeScene_bandits_looter_1` | 29 |
| `char_GENERIC_MAN_ENEMY_BANDIT_12` | Male | `7be22c86-2019-47b7-873b-5d8e9212f4dc` | `artefakt_zachariasMercenary_2` | 36 |
| `char_GENERIC_MAN_ENEMY_BANDIT_14` | Male | `02c59661-b14a-4f3c-9239-f31de1e2be57` | `archery_bloodTrail_bandit_2` | 45 |

</details>

<details>
<summary>Generic man gamekeeper (4)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_GAMEKEEPER_01` | Male | `3b87c9cf-8ba1-4145-821f-79d410a2b4e0` | `kbyl_man_17` | 2 |
| `char_GENERIC_MAN_GAMEKEEPER_02` | Male | `45763335-4507-4b18-ab37-f3476d2c78ef` | `tneb_man_30` | 2 |
| `char_GENERIC_MAN_GAMEKEEPER_03` | Male | `52a78f72-3723-43a9-ac78-461d72b78185` | `kopa_man_38` | 1 |
| `char_GENERIC_MAN_GAMEKEEPER_04` | Male | `1f36f233-a81b-43a6-8341-d42e59938111` | `krab_man_29` | 4 |

</details>

<details>
<summary>Generic man german (5)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_GERMAN_01` | Male | `5c1ffa30-947c-4f97-bc1d-1e1c9a0bc625` | `karavanyVeSvete_armedCaravan_german_1` | 11 |
| `char_GENERIC_MAN_GERMAN_02` | Male | `b5d8efce-9538-4255-a91e-6cff6833bd8d` | `karavanyVeSvete_armedCaravan_german_2` | 7 |
| `char_GENERIC_MAN_GERMAN_03` | Male | `fd60606c-227a-43d5-a570-eed85322f65b` | `karavanyVeSvete_armedCaravan_german_3` | 8 |
| `char_GENERIC_MAN_GERMAN_04` | Male | `f2ce2802-97c5-4c27-b067-3734b0597c77` | `karavanyVeSvete_armedCaravan_german_4` | 7 |
| `char_GENERIC_MAN_GERMAN_05` | Male | `a6d9531b-285b-404b-9682-de07b512745b` | `karavanyVeSvete_armedCaravan_german_5` | 11 |

</details>

<details>
<summary>Generic man guard (10)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_GUARD_02` | Male | `0e1aba06-82de-4270-b0ec-46a8b4744abc` | `extraGuards_kutnaHora_soldiers_guards_7` | 48 |
| `char_GENERIC_MAN_GUARD_03` | Male | `4174c2ed-6ae9-49fc-9d49-25b58883eaad` | `artefakt_monasteryKnight_2` | 63 |
| `char_GENERIC_MAN_GUARD_05` | Male | `fc4536b2-4964-4f79-af47-c6e7a3e5ec29` | `artefakt_monasteryKnight_1` | 46 |
| `char_GENERIC_MAN_GUARD_08` | Male | `cbdb3a71-2f47-4bf5-96f8-f5d6110a8a22` | `artefakt_monasteryKnight_4` | 50 |
| `char_GENERIC_MAN_GUARD_12` | Male | `49da297c-b1e0-4e94-b3e9-ca3874e71a65` | `artefakt_monasteryKnight_5` | 52 |
| `char_GENERIC_MAN_GUARD_13` | Male | `86500223-fd3d-462c-9414-352e25b30758` | `extraGuards_dummy_7` | 48 |
| `char_GENERIC_MAN_GUARD_14` | Male | `6e04789b-f704-4da7-98b6-4558fac75748` | `extraGuards_dummy_3` | 38 |
| `char_GENERIC_MAN_GUARD_15` | Male | `63daa80b-d1f4-46f5-8222-c22a541cae07` | `extraGuards_dummy_1` | 39 |
| `char_GENERIC_MAN_GUARD_16` | Male | `2e96ee86-7c95-4b57-91f6-6d3abce75d22` | `extraGuards_dummy_5` | 39 |
| `char_GENERIC_MAN_GUARD_18` | Male | `b2aaca82-ea3e-446b-9fc0-55fd94555787` | `extraGuards_dummy_4` | 51 |

</details>

<details>
<summary>Generic man jew (4)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_JEW_01` | Male | `e3c6a8c5-37fd-4bb9-a94d-c4465ef33b8f` | `kkut_additive_man_151` | 29 |
| `char_GENERIC_MAN_JEW_02` | Male | `4d6b0e86-9e46-4a66-8e60-ffe5d5407e0c` | `kkut_additive_man_155` | 26 |
| `char_GENERIC_MAN_JEW_03` | Male | `8bd2c623-5f2c-4f44-9a81-9e0a59d65a9f` | `kkut_additive_man_154` | 26 |
| `char_GENERIC_MAN_JEW_04` | Male | `df0a32a8-241c-4f1e-843d-f2aa5f914b6f` | `kkut_additive_man_153` | 25 |

</details>

<details>
<summary>Generic man market coalman czech (2)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_MARKET_COALMAN_CZECH_01` | Male | `1cdde9f6-cd85-4776-adf7-d83254143f42` | `kkut_man_225` | 2 |
| `char_GENERIC_MAN_MARKET_COALMAN_CZECH_03` | Male | `846dcb75-f6b4-4eb8-8e97-580a6355c2a8` | `kkut_man_230` | 1 |

</details>

<details>
<summary>Generic man market potter czech (1)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_MARKET_POTTER_CZECH_01` | Male | `155e6537-48e6-47de-b8a2-6b4cb4b74a28` | `kkut_additive_man_285` | 6 |

</details>

<details>
<summary>Generic man market potter german (1)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_MARKET_POTTER_GERMAN_01` | Male | `25c871f0-1f62-47a0-9344-62bd26bf42e7` | `kpri_man_15` | 1 |

</details>

<details>
<summary>Generic man merchant czech (7)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_MERCHANT_CZECH_01` | Male | `26b2cdc5-c275-4fd5-84e6-ab212040ff95` | `kcer_man_2` | 7 |
| `char_GENERIC_MAN_MERCHANT_CZECH_02` | Male | `d2c117bc-bf98-40fd-b57c-2f05f6a207ac` | `kkut_man_21` | 10 |
| `char_GENERIC_MAN_MERCHANT_CZECH_03` | Male | `e9ad4ff0-75c3-467d-b173-89bed5b1ebde` | `kcer_man_4` | 12 |
| `char_GENERIC_MAN_MERCHANT_CZECH_04` | Male | `e47c0ac7-ae85-49e4-af1a-14aa94dc9053` | `khor_man_26` | 9 |
| `char_GENERIC_MAN_MERCHANT_CZECH_05` | Male | `9c5616b1-a7cc-4992-8af4-0b2e85fd53f1` | `kkut_man_22` | 11 |
| `char_GENERIC_MAN_MERCHANT_CZECH_06` | Male | `d5e4a34d-a3a9-49a9-a892-349211977de7` | `kkut_additive_man_292` | 10 |
| `char_GENERIC_MAN_MERCHANT_CZECH_07` | Male | `bf7991fc-8d23-4595-b863-24fa39fddd86` | `kkut_additive_man_289` | 9 |

</details>

<details>
<summary>Generic man merchant german (3)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_MERCHANT_GERMAN_01` | Male | `770dbd10-09ec-4128-9d78-a2a6d9782427` | `kkut_man_8` | 1 |
| `char_GENERIC_MAN_MERCHANT_GERMAN_03` | Male | `ad09ae5a-1e72-47be-8b38-b7a9f75d50a4` | `kkut_man_221` | 1 |
| `char_GENERIC_MAN_MERCHANT_GERMAN_04` | Male | `632417d5-26e2-4076-a6c2-914ba206a8db` | `kkut_man_37` | 1 |

</details>

<details>
<summary>Generic man merchant jew (2)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_MERCHANT_JEW_01` | Male | `8863c0e4-1567-4125-8afe-c594b92725e1` | `kkut_man_47` | 1 |
| `char_GENERIC_MAN_MERCHANT_JEW_02` | Male | `fb29cc32-5798-4ad3-98dc-722b963c44f7` | `kkut_man_43` | 1 |

</details>

<details>
<summary>Generic man miner (5)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_MINER_01` | Male | `8e6bbcf2-26d0-4776-a5e8-95c1f6f5350b` | `havirskyTurnaj_animchar_22` | 32 |
| `char_GENERIC_MAN_MINER_02` | Male | `c88e57ae-6ce3-4956-a69e-f5f0f9e4a9c7` | `havirskyTurnaj_spectator_13` | 35 |
| `char_GENERIC_MAN_MINER_03` | Male | `cce99069-df6a-4c16-92ff-5712b526d584` | `havirskyTurnaj_animchar_23` | 30 |
| `char_GENERIC_MAN_MINER_04` | Male | `82ebdb7e-f264-46b8-a5c0-566344198150` | `havirskyTurnaj_animchar_24` | 31 |
| `char_GENERIC_MAN_MINER_05` | Male | `3f9ce819-5e93-48a2-a99b-a959fc65f120` | `havirskyTurnaj_spectator_1` | 31 |

</details>

<details>
<summary>Generic man nobleman (12)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_NOBLEMAN_01` | Male | `929c7806-1216-41fa-abe3-4da1850d27b3` | `kkut_additive_man_135` | 4 |
| `char_GENERIC_MAN_NOBLEMAN_02` | Male | `3c6bcb3e-2c80-4748-b9d6-caee7f5bb847` | `kutnohorskyTurnaj_nobleFan01` | 3 |
| `char_GENERIC_MAN_NOBLEMAN_03` | Male | `45db1c7c-f601-4d90-b050-8c7c133c89ac` | `kutnohorskyTurnaj_nobleFan05` | 4 |
| `char_GENERIC_MAN_NOBLEMAN_04` | Male | `d8c2a03e-851b-484f-97c9-1e8dd2b25324` | `kutnohorskyTurnaj_nobleFan03` | 3 |
| `char_GENERIC_MAN_NOBLEMAN_05` | Male | `ce17ee37-2120-405d-a659-51e0015cfc50` | `kkut_additive_man_14` | 6 |
| `char_GENERIC_MAN_NOBLEMAN_06` | Male | `f7dea6cd-4db4-4e91-ab43-a9207a9bd2e9` | `dummyWanderer_nobleman_man_2` | 4 |
| `char_GENERIC_MAN_NOBLEMAN_07` | Male | `25454ff9-baaa-40e4-aa66-1482e3d0d7b8` | `kutnohorskyTurnaj_nobleFan02` | 3 |
| `char_GENERIC_MAN_NOBLEMAN_08` | Male | `f56006c9-d211-495f-b066-bc2d8b78d228` | `kkut_additive_man_134` | 3 |
| `char_GENERIC_MAN_NOBLEMAN_09` | Male | `71c22c7f-2459-42b3-87a0-9f8e66610291` | `kkut_additive_man_218` | 3 |
| `char_GENERIC_MAN_NOBLEMAN_10` | Male | `83a066d5-1fa6-4b72-9223-afc0d3a44a64` | `setkaniVRatbori1_ratiborNoble17` | 4 |
| `char_GENERIC_MAN_NOBLEMAN_11` | Male | `f77b5988-530d-494f-be20-bb5ffe9806d0` | `kkut_additive_man_139` | 5 |
| `char_GENERIC_MAN_NOBLEMAN_12` | Male | `ee5671a2-804c-49f6-9d85-532c1586a0c6` | `kkuk_man_10` | 4 |

</details>

<details>
<summary>Generic man priest (8)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_PRIEST_01` | Male | `2e5c9ea6-85d3-4312-85c2-7b2370ee2bf1` | `ssed_monk_11` | 3 |
| `char_GENERIC_MAN_PRIEST_02` | Male | `6236b82d-9bfc-47e9-9ea3-84c6dc024d21` | `ssed_monk_24` | 2 |
| `char_GENERIC_MAN_PRIEST_03` | Male | `c469bf9e-5a7a-4192-a081-04e5f850bc61` | `ssed_monk_13` | 3 |
| `char_GENERIC_MAN_PRIEST_04` | Male | `b8b82bbc-e0c9-45b6-acec-f50d19f927b9` | `ssed_monk_14` | 2 |
| `char_GENERIC_MAN_PRIEST_06` | Male | `f02e9c6a-73b5-48a5-a29e-6290f84a97a3` | `ssed_monk_18` | 2 |
| `char_GENERIC_MAN_PRIEST_07` | Male | `2f9b930b-25ec-4293-911e-48d2754c0fcc` | `ssed_monk_19` | 2 |
| `char_GENERIC_MAN_PRIEST_08` | Male | `9adbbcdf-7ab3-485a-8233-c2eddb9bb1bc` | `ssed_monk_26` | 2 |
| `char_GENERIC_MAN_PRIEST_09` | Male | `07e51799-f488-4a99-9fb4-848a19f56a16` | `ssed_monk_12` | 2 |

</details>

<details>
<summary>Generic man roma (3)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_ROMA_01` | Male | `7d530d93-87b6-45c6-8cce-784f96c1da0f` | `taboryUCesty_dealer_actors_man_2` | 2 |
| `char_GENERIC_MAN_ROMA_02` | Male | `2f825ed0-1d9b-4df0-ad90-d6e2b136ce04` | `tvez_man_20` | 2 |
| `char_GENERIC_MAN_ROMA_03` | Male | `6bffc13d-8d1c-43d8-87c6-14994543eef2` | `taboryUCesty_dealer_actors_man_1` | 5 |

</details>

<details>
<summary>Generic man soldier (33)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_SOLDIER_01` | Male | `269d0344-669d-4b88-8893-3e903e928271` | `duels_manFromAmbush1` | 67 |
| `char_GENERIC_MAN_SOLDIER_02` | Male | `0926ad7b-f396-4136-a7f2-3de2819bd48e` | `bohutovaVlozka_eriksCompany_man_8` | 65 |
| `char_GENERIC_MAN_SOLDIER_03` | Male | `2188c38b-27da-425a-a0b5-c2a9383cc5aa` | `bohutovaVlozka_eriksCompany_man_19` | 75 |
| `char_GENERIC_MAN_SOLDIER_05` | Male | `04a2b8a2-c662-457e-be06-33fd3868cf9b` | `bohutovaVlozka_eriksCompany_man_6` | 61 |
| `char_GENERIC_MAN_SOLDIER_06` | Male | `ff431e51-9c68-464b-b082-df7d0e1e7c2d` | `artefakt_zachariasMercenary_4` | 66 |
| `char_GENERIC_MAN_SOLDIER_07` | Male | `986ea0f0-d940-4082-bde7-3448bd1e741e` | `erik_infantryGroup1_soldier13` | 59 |
| `char_GENERIC_MAN_SOLDIER_08` | Male | `0bed9f2c-f881-4509-a767-eb7befb663f1` | `bohutovaVlozka_eriksCompany_man_11` | 100 |
| `char_GENERIC_MAN_SOLDIER_10` | Male | `4bf36583-3986-47fd-9ff9-17c73f968d8c` | `bohutovaVlozka_eriksCompany_man_20` | 67 |
| `char_GENERIC_MAN_SOLDIER_11` | Male | `3fef5322-4a1c-4bee-a977-514263b1a837` | `erik_infantryGroup1_soldier10` | 76 |
| `char_GENERIC_MAN_SOLDIER_12` | Male | `178e4324-ac3e-452a-b1e5-bf508f1d9492` | `bohutovaVlozka_eriksCompany_man_3` | 62 |
| `char_GENERIC_MAN_SOLDIER_13` | Male | `218714fb-7cb7-407a-9032-dad6b6d5a52c` | `budovaniLazni_drunkard1` | 67 |
| `char_GENERIC_MAN_SOLDIER_14` | Male | `4b928f4e-11be-1447-caf4-41f99341529a` | `drak_zikmund_soldier2` | 54 |
| `char_GENERIC_MAN_SOLDIER_15` | Male | `f0d5bcee-d054-4e25-a38a-45e9997b9a7f` | `bohutovaVlozka_eriksCompany_man_1` | 68 |
| `char_GENERIC_MAN_SOLDIER_16` | Male | `0bcbb77c-a567-46ca-897f-d2cf158e3638` | `erik_cavalryGroup5_soldier1` | 67 |
| `char_GENERIC_MAN_SOLDIER_17` | Male | `a78a8a6d-7438-4940-8b4d-30fa7d844b13` | `erik_infantryGroup1_soldier23` | 57 |
| `char_GENERIC_MAN_SOLDIER_18` | Male | `4c6b5cea-b293-42cc-90b0-46a554ec38b1` | `erik_cavalryGroup1_scout1` | 77 |
| `char_GENERIC_MAN_SOLDIER_19` | Male | `40f25686-531d-4ba8-bd7a-9ff7eb1845b7` | `bohutovaVlozka_eriksCompany_man_17` | 54 |
| `char_GENERIC_MAN_SOLDIER_20` | Male | `db20ffa8-276e-43b6-8266-beffae395660` | `bohutovaVlozka_eriksCompany_man_10` | 57 |
| `char_GENERIC_MAN_SOLDIER_21` | Male | `271057ff-898e-437b-bf91-1d0cb246f4d4` | `bohutovaVlozka_eriksCompany_man_14` | 67 |
| `char_GENERIC_MAN_SOLDIER_22` | Male | `c1163805-2ecb-44a4-8bad-0a7f33ebed68` | `erik_cavalryGroup3_soldier4` | 58 |
| `char_GENERIC_MAN_SOLDIER_23` | Male | `2bc3c709-cae9-4357-ab3d-320a92cdfffb` | `erik_infantryGroup1_soldier12` | 64 |
| `char_GENERIC_MAN_SOLDIER_24` | Male | `ed300576-9c00-416a-a7fe-9cfe84f0d2b9` | `duels_manFromAmbush4` | 60 |
| `char_GENERIC_MAN_SOLDIER_25` | Male | `69e6b5eb-68d1-4991-9453-27fa206262a0` | `dvojityAgent_jansHenchman_2` | 69 |
| `char_GENERIC_MAN_SOLDIER_26` | Male | `e3da3e2a-6175-48b6-8632-884fb91d93b3` | `erik_cavalryGroup6_soldier2` | 63 |
| `char_GENERIC_MAN_SOLDIER_27` | Male | `b4b50c96-3f08-489d-a6f9-58771d83fc2d` | `bohutovaVlozka_eriksCompany_man_9` | 52 |
| `char_GENERIC_MAN_SOLDIER_28` | Male | `6f38acec-6543-4009-9aa2-889dea65896c` | `bohutovaVlozka_eriksCompany_man_5` | 60 |
| `char_GENERIC_MAN_SOLDIER_29` | Male | `ec0cc56e-b746-4b42-a93b-5735962a0e8c` | `bohutovaVlozka_eriksCompany_man_16` | 55 |
| `char_GENERIC_MAN_SOLDIER_30` | Male | `f8749d1a-0e63-410b-b966-ca0856216b7b` | `erik_infantryGroup1_soldier37` | 131 |
| `char_GENERIC_MAN_SOLDIER_31` | Male | `ebb7e807-cab7-43a3-9186-a24bd6b22aaa` | `erik_infantryGroup1_soldier3` | 151 |
| `char_GENERIC_MAN_SOLDIER_32` | Male | `4c76d915-2a27-770c-4279-d45ef95cca8c` | `drak_zikmund_soldier1` | 58 |
| `char_GENERIC_MAN_SOLDIER_33` | Male | `4e22013f-b89b-4647-8e23-c26cbb297914` | `bohutovaVlozka_eriksCompany_man_18` | 59 |
| `char_GENERIC_MAN_SOLDIER_37` | Male | `ac440b3d-be9c-49c5-bf82-1962736a402a` | `erik_cavalryGroup2_soldier3` | 49 |
| `char_GENERIC_MAN_SOLDIER_38` | Male | `133edaff-e8b1-4361-80e6-27b55f7e761a` | `bohutovaVlozka_eriksCompany_man_2` | 166 |

</details>

<details>
<summary>Generic man townsman (10)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_MAN_TOWNSMAN_01` | Male | `1b6a7e51-20c2-4197-803f-73c4afff7d30` | `dummyWanderer_nobleman_man_1` | 34 |
| `char_GENERIC_MAN_TOWNSMAN_02` | Male | `156f230e-8e6b-48b8-903b-f7c045804fa9` | `karavanyVeSvete_armedCaravan_soldier_7` | 30 |
| `char_GENERIC_MAN_TOWNSMAN_03` | Male | `90e0bf19-1356-497b-bab4-9bfa3c1bafe2` | `dummyWanderer_nobleman_man_3` | 35 |
| `char_GENERIC_MAN_TOWNSMAN_04` | Male | `b2a026c6-3436-4252-a896-21952b1f65c6` | `karavanyVeSvete_armedCaravan_soldier_3` | 38 |
| `char_GENERIC_MAN_TOWNSMAN_05` | Male | `6a258170-079f-4da0-bff3-c4fab1171679` | `karavanyVeSvete_armedCaravan_soldier_4` | 36 |
| `char_GENERIC_MAN_TOWNSMAN_06` | Male | `076fef37-31e2-4b25-af9b-a67d14b16470` | `karavanyVeSvete_armedCaravan_soldier_5` | 32 |
| `char_GENERIC_MAN_TOWNSMAN_07` | Male | `8f2f56f8-41ed-4be7-97c1-789710d412c0` | `karavanyVeSvete_armedCaravan_soldier_1` | 38 |
| `char_GENERIC_MAN_TOWNSMAN_08` | Male | `c05b2a05-0459-4f51-bcc4-7112de476494` | `duels_manFromAmbush5` | 33 |
| `char_GENERIC_MAN_TOWNSMAN_09` | Male | `74f7b530-8d9a-447f-a37c-f872adc3d577` | `duels_manFromAmbush3` | 32 |
| `char_GENERIC_MAN_TOWNSMAN_10` | Male | `545bb248-d321-4535-86b3-4856522e59eb` | `kkut_additive_man_101` | 29 |

</details>

<details>
<summary>Generic woman commoner (11)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_WOMAN_COMMONER_01` | Female | `19d3b0e6-7596-4a0d-bdf0-b5cb9ebb0702` | `cutscene_townsman_female_06` | 44 |
| `char_GENERIC_WOMAN_COMMONER_02` | Female | `c25f7faf-0436-4dd1-a873-cd5e3c07e839` | `cutscene_townsman_female_07` | 42 |
| `char_GENERIC_WOMAN_COMMONER_03` | Female | `3ed78050-e8b3-448f-8f1f-c1edfa154582` | `cutscene_villager_female_07` | 40 |
| `char_GENERIC_WOMAN_COMMONER_04` | Female | `90c33bc1-e5b6-4fef-91d0-3dddf96e5630` | `cutscene_townsman_female_02` | 39 |
| `char_GENERIC_WOMAN_COMMONER_06` | Female | `1f1bd96c-aa4d-47e4-aca0-c4102908a535` | `cart_test_npcDriverFemale` | 37 |
| `char_GENERIC_WOMAN_COMMONER_07` | Female | `2cb83fdd-ba09-4c77-880d-aaad2b69c714` | `cutscene_townsman_female_08` | 45 |
| `char_GENERIC_WOMAN_COMMONER_08` | Female | `41c12ac6-ba41-4ffa-87a0-69574c80b633` | `cutscene_townsman_female_05` | 40 |
| `char_GENERIC_WOMAN_COMMONER_09` | Female | `0c1db70c-f171-4258-b978-c87ffcb3dcb7` | `cutscene_villager_female_06` | 37 |
| `char_GENERIC_WOMAN_COMMONER_10` | Female | `f80c07aa-d033-4e94-a61e-ef4a24c10bc2` | `cutscene_townsman_female_01` | 43 |
| `char_GENERIC_WOMAN_COMMONER_11` | Female | `1aa19f4c-c1c8-4e69-ad6e-8da83d54d0bf` | `erik_party_dancerWoman_2` | 39 |
| `char_GENERIC_WOMAN_COMMONER_12` | Female | `8f144c9a-f871-42ba-bd04-e43804186fa6` | `kbyl_woman_16` | 37 |

</details>

<details>
<summary>Generic woman german (2)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_WOMAN_GERMAN_01` | Female | `ae9c1f77-55d4-497d-9e1c-a7310af2a576` | `kkut_woman_10` | 12 |
| `char_GENERIC_WOMAN_GERMAN_02` | Female | `b8687e01-0640-4c9e-be64-ffbf41288652` | `kkut_woman_102` | 14 |

</details>

<details>
<summary>Generic woman jew (3)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_WOMAN_JEW_01` | Female | `a7040a4f-09c4-40da-952e-a382609e8939` | `kkut_additive_woman_117` | 24 |
| `char_GENERIC_WOMAN_JEW_02` | Female | `f513fbe6-43b7-4849-a9b5-71b21b1059d6` | `kkut_additive_woman_118` | 24 |
| `char_GENERIC_WOMAN_JEW_03` | Female | `45abfaa6-430e-4f8b-83a1-b3a5395391e0` | `kkut_woman_64` | 1 |

</details>

<details>
<summary>Generic woman market potter czech (2)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_WOMAN_MARKET_POTTER_CZECH_01` | Female | `f93e9344-9b08-4677-954f-958724f3bcae` | `kkut_additive_woman_154` | 2 |
| `char_GENERIC_WOMAN_MARKET_POTTER_CZECH_03` | Female | `e4521d30-52c6-4087-8f38-64bf67a87467` | `kkut_additive_woman_153` | 3 |

</details>

<details>
<summary>Generic woman market potter german (1)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_WOMAN_MARKET_POTTER_GERMAN_01` | Female | `4c037a20-bc78-5aae-0009-dd0f470b5c9a` | `ttkc_woman_4` | 1 |

</details>

<details>
<summary>Generic woman merchant czech (4)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_WOMAN_MERCHANT_CZECH_01` | Female | `796daa78-4053-4859-b1f7-be1ca6dacea9` | `kbyl_woman_10` | 7 |
| `char_GENERIC_WOMAN_MERCHANT_CZECH_02` | Female | `25408e65-5425-4b70-870a-d08ecf7318ed` | `kbyl_woman_9` | 6 |
| `char_GENERIC_WOMAN_MERCHANT_CZECH_03` | Female | `fd6d208f-3ee5-4039-b3f3-7aa689979445` | `kkut_additive_woman_160` | 7 |
| `char_GENERIC_WOMAN_MERCHANT_CZECH_04` | Female | `5a7313ce-9b24-4b9e-adec-e8b7b0d71ad5` | `kgru_woman_12` | 7 |

</details>

<details>
<summary>Generic woman merchant german (1)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_WOMAN_MERCHANT_GERMAN_01` | Female | `3098fd02-acdd-4c97-88f3-9caa65f0cdc7` | `kkut_woman_105` | 2 |

</details>

<details>
<summary>Generic woman merchant jew (1)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_WOMAN_MERCHANT_JEW_01` | Female | `3cc3bad1-6f1c-4c87-b715-399e1590dfde` | `kkut_woman_36` | 1 |

</details>

<details>
<summary>Generic woman noblewoman (2)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_WOMAN_NOBLEWOMAN_02` | Female | `a35a9f47-f99d-4867-beb1-4f09cf183af7` | `dummyWanderer_nobleman_woman_3` | 2 |
| `char_GENERIC_WOMAN_NOBLEWOMAN_03` | Female | `2e88130e-5acb-452a-bf6c-ae998a5b994e` | `kkut_annazhradce` | 1 |

</details>

<details>
<summary>Generic woman roma (2)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_WOMAN_ROMA_01` | Female | `6e9e4738-4a49-4551-ae04-4d44e4563e37` | `taboryUCesty_shop_karol_woman` | 4 |
| `char_GENERIC_WOMAN_ROMA_02` | Female | `16c22c56-38b1-4ac4-9052-ddb5929c0887` | `tvez_woman_4` | 3 |

</details>

<details>
<summary>Generic woman townswoman (7)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GENERIC_WOMAN_TOWNSWOMAN_01` | Female | `461cbd9c-75f6-4376-98e9-f3de4051f26c` | `dummyWanderer_nobleman_woman_1` | 31 |
| `char_GENERIC_WOMAN_TOWNSWOMAN_02` | Female | `68ae4e1d-7128-400a-b022-c3e72ba513ee` | `dummyWanderer_nobleman_woman_2` | 32 |
| `char_GENERIC_WOMAN_TOWNSWOMAN_03` | Female | `d99a150d-e2f4-4ad8-8d0b-8646b4f19b59` | `karavanyVeSvete_civilianCaravan_civilian_woman_3` | 30 |
| `char_GENERIC_WOMAN_TOWNSWOMAN_04` | Female | `f9722421-9654-486a-87b5-8dbba66c0489` | `karavanyVeSvete_civilianCaravan_farmer_woman_3` | 31 |
| `char_GENERIC_WOMAN_TOWNSWOMAN_05` | Female | `f8f33613-1af6-4253-a836-fa3c19fdeaa9` | `kkut_additive_woman_107` | 31 |
| `char_GENERIC_WOMAN_TOWNSWOMAN_06` | Female | `a32eb857-ccaf-474d-8f4f-3fd5b10a446d` | `kkut_additive_woman_106` | 29 |
| `char_GENERIC_WOMAN_TOWNSWOMAN_07` | Female | `4ce2b18e-8ca5-44b0-a62d-72c090c0e489` | `kkut_additive_woman_101` | 31 |

</details>

<!-- /generated:generic -->

### Named characters

<!-- generated:named -->

<details>
<summary>Named characters: # (2)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `25` | Male | `9c8323ff-1561-4acc-a703-07d70efefed1` | `prepadeni_ptacek_naked` | 2 |
| `26` | Male | `4407e676-8058-4f2b-ad2f-8228f9c1989f` | `kkut_henry` | 1 |

</details>

<details>
<summary>Named characters: A (26)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_ACHIM_BASEVI` | Male | `80e81338-dcc7-4120-a821-035081d4eb02` | `pogrom_manInFinalPart8` | 1 |
| `char_ADA_VON_LIPPE` | Female | `df324865-646b-4e35-b7ca-36014751d435` | `taboryUCesty_dealer_ada` | 1 |
| `char_ADAM_MAJITEL_LAZNI` | Male | `86ece9d7-aba5-4543-ab73-783e8355d416` | `kkut_adam` | 1 |
| `char_ADAM_SMELKES` | Male | `e4aa3a8e-7db4-4579-86bc-8a3ac8f5b601` | `pogrom_injuredOnStreet` | 1 |
| `char_ADAM_VELVARA` | Male | `3f0bff60-fae1-473c-b808-9624eeb13439` | `kkut_man_1` | 1 |
| `char_ADAM_Z_ZELEJOVA` | Male | `4e5691f7-4a0a-2f95-a029-2dd4a201c3a1` | `tzel_adam` | 1 |
| `char_ADAM_ZE_ZARICI` | Male | `66238496-d56a-495c-97bb-2d923bb25290` | `kkut_adamZeZarici` | 1 |
| `char_ADELA_HEJTMANOVA_SESTRA` | Female | `ca370956-512f-4162-9bb1-7196d9e95be2` | `ttro_woman_13` | 1 |
| `char_ADELA_Z_MNISKU` | Female | `0603224d-bc82-4bf0-872f-044ebc5b6a54` | `malovanoJest_noblewoman` | 1 |
| `char_ADLETA_MANNLICHER` | Female | `defad3c7-ac3e-48f3-8d8e-b690d3bfc096` | `kkut_woman_235` | 1 |
| `char_ADLETA_ZE_STRAZE` | Female | `ab87afbe-498c-42c3-ab3e-bef003b273be` | `ttro_woman_10` | 1 |
| `char_ALBIK_Z_UNICOVA` | Male | `53a13a43-abb3-449a-9121-69c6406f7a46` | `kkut_albik` | 1 |
| `char_ALCHYMISTA_LEOPOLD` | Male | `4027fb18-e4a6-66b2-cf2d-bdd55430889f` | `drak_alchemist` | 1 |
| `char_ALENCINA_BFF` | Female | `4f0d8c67-091b-4e74-8732-0f3fe5899f5e` | `kkut_alenkaBFF` | 1 |
| `char_ALMUZNIK` | Male | `c468e3cd-3d19-4031-8e77-1b6784f37c21` | `baladaZHadru_almuznik` | 1 |
| `char_ANCE` | Female | `4234b689-b5e6-2766-006e-3325a40e50bf` | `tneb_ance` | 1 |
| `char_ANDREAS_KAMPA` | Male | `59927b73-d0ba-46e1-aa38-b00df1e560c0` | `taboryUCesty_shop_andreas` | 1 |
| `char_ANDREAS_RYCHTAR_KUTNOHORSKY` | Male | `6892f368-bb5b-4a0f-877e-8ad526b9b200` | `kkut_andreas` | 1 |
| `char_ANEZKA_DROZDOVA` | Female | `41fb629d-f380-91e3-a40d-96b5614ee589` | `ttkc_woman_10` | 1 |
| `char_ANICKA_VRTILKA` | Female | `3d2358f4-a651-42fb-b25e-7ddbdebbba83` | `kkut_betasBathmaid_1` | 1 |
| `char_ANNA_Z_VALDSTEJNA` | Female | `1e833d11-c54e-4565-a024-1e79eb0dc6cf` | `kkut_annaZValdstejna` | 1 |
| `char_ANTON_KASPAR` | Male | `25e8f061-1dbc-4ded-96d3-17e93b18e3d1` | `kkut_anton` | 1 |
| `char_ANTON_STORK` | Male | `1e4b0a78-6242-4a84-9417-c4603b94a0b0` | `taboryUCesty_shop_stork` | 1 |
| `char_ARANKA` | Female | `47915a63-f607-dcf5-6020-7cd6c94965a9` | `tvez_aranka` | 1 |
| `char_ARNE_NEMEC` | Male | `47390bd6-3c12-137b-00c0-ce077db65b8b` | `kkut_arne` | 1 |
| `char_ARNOST_MOOSIG` | Male | `9334a13c-efcd-476a-b5aa-7ba06e83f0dc` | `kutnohorskyTurnaj_fighter3arnost` | 1 |

</details>

<details>
<summary>Named characters: B (43)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_BALTAZAR` | Male | `2026f3c4-4792-4396-9123-dd443b63c1ac` | `taboryUCesty_dealer_baltazar` | 1 |
| `char_BANDITA_PUKAVEC` | Male | `6e834dfc-8e6d-4793-8659-2f0e7a97878a` | `kgru_pukavec` | 1 |
| `char_BARD` | Male | `4584ed56-e379-3938-d0ae-33a5ba0c89bd` | `kkut_vilem` | 1 |
| `char_BART_CHRISTMAN` | Male | `4496b676-d2ff-4741-b30f-446f140ceb56` | `sesivaniTonici_jorgReplacement` | 1 |
| `char_BARTOLOMEJ_OLOMOUCKY` | Male | `c264f585-f97b-45fb-9bc1-805672c56b0c` | `taboryUCesty_dice_bartolomej` | 1 |
| `char_BASAN_KUMAN` | Male | `244d07fa-4047-4e0b-80e2-d6462842bfe5` | `kzik_basan` | 1 |
| `char_BEJK` | Male | `4a62ab0a-f170-5e68-9dd8-d49f9e81f283` | `tneb_bejk` | 1 |
| `char_BEJKOVEC` | Male | `eb5d99c2-8d07-475c-990f-f3dd1fc9ef65` | `kkut_hospodskySvatych` | 1 |
| `char_BENES_OD_OKRISEK` | Male | `d4efda26-f436-4ff3-a3de-5598c04b7843` | `kmez_benes` | 1 |
| `char_BENES_Z_KOLINA` | Male | `5afc2192-7152-4495-bd43-2b15b1c31923` | `tneb_hejkal` | 1 |
| `char_BERCHTA_VON_KURZBACH` | Female | `4cb41c70-d17e-4692-9615-76800ca77371` | `taboryUCesty_archery_kurzbach_woman_1` | 1 |
| `char_BERGOV` | Male | `4be25533-2725-37f7-b9fe-0b9df3f851ba` | `ttro_bergov` | 1 |
| `char_BERTA` | Male | `c4a09f4c-0c36-444e-9915-bfa1734c7d01` | `kcer_brabantSoldier_3` | 1 |
| `char_BESTIARIUS_MACH` | Male | `26fff993-611b-4d36-9088-57eb25fb8b26` | `taboryUCesty_archery_beastmaster_1` | 1 |
| `char_BESTIARIUS_SEBESTA` | Male | `162af413-d03c-4283-9a8c-55d37d1fe09b` | `taboryUCesty_archery_beastmaster_2` | 1 |
| `char_BETA_MAJITELKA_LAZNI` | Female | `32045780-5a45-450c-a558-f15a5431444b` | `kkut_beta` | 1 |
| `char_BIBREK` | Male | `4bc10425-171d-37c4-4c5b-610024423fba` | `tvez_bibrek` | 1 |
| `char_BLAHA_BONZAK_ZIKMUNDOVO` | Male | `27b91571-d8a4-4913-bed2-3377a6aa0462` | `kzik_blaha` | 1 |
| `char_BLAZNIVY_VIKTOR_M44A` | Male | `9a1a5fae-4d54-4c48-b79d-c0d472f683a4` | `ksta_viktor` | 1 |
| `char_BOCEK_STARSI` | Male | `b04cf399-64c0-4f14-a935-cd28e2bb04b2` | `kkut_bocek` | 1 |
| `char_BOHUS` | Male | `6100c879-7ca1-4ab6-863d-17c80fd0ce50` | `kocovnickaCest_bohus_cutsceneDouble` | 2 |
| `char_BOHUSE` | Female | `5204eec5-c922-4b59-a825-ce2b1e2f86fd` | `kvys_bohuse` | 1 |
| `char_BOHUSOVA_MATKA` | Female | `44e617a7-9c54-61fd-e270-0641a1cfa882` | `tsem_bohussMother` | 1 |
| `char_BOHUTA` | Male | `46bb1e4d-31b1-7d13-d768-d7e0886a2199` | `tneb_bohuta` | 1 |
| `char_BOLEK` | Male | `453f5b3e-79a5-4923-981b-81666e216ff5` | `pocestny_indianaJones` | 1 |
| `char_BOLKA_ZELEZNA_ZE_SEMIL` | Female | `7759e6b2-6a88-4f30-a28f-bee35104370b` | `ttro_woman_12` | 1 |
| `char_BONKA_Z_PODSEMINA` | Female | `4986433e-3fc2-72f3-0a5b-4312af1404a9` | `tpod_bonka` | 1 |
| `char_BORES_ZIZKOVA_BANDA` | Male | `30e9597b-54c7-4821-b7be-fb7baeb1367c` | `zachrana_mrtvola` | 1 |
| `char_BOUCHAC` | Male | `405cab40-d6f9-16a6-0e8f-c547ac20338e` | `drak_alchemistBodyguard1` | 1 |
| `char_BOUCHAC_2` | Male | `4f6c6687-497d-4ab6-076d-23cb8df3dfa5` | `drak_alchemistBodyguard2` | 1 |
| `char_BOUCHAC_3` | Male | `4dd1aff9-44db-aea0-9eb3-8dc178be3ebb` | `drak_alchemistBodyguard3` | 1 |
| `char_BOZENA_KORENARKA_VEZICKO` | Female | `4b5d1400-8293-d227-fbd6-3d4389b2238b` | `tvez_bozena` | 1 |
| `char_BOZETECHA` | Female | `4bb85c62-b0f9-c430-27e5-2ecfd254df90` | `tvid_woman_1` | 1 |
| `char_BRADYR_CTIBOR` | Male | `61959439-15b1-4fd9-97c8-7007ee25f1a0` | `kkut_adamsBarber` | 1 |
| `char_BRADYR_FIALA` | Male | `4ee46107-4820-1413-91df-afebd14a7aa6` | `tzel_fiala` | 1 |
| `char_BRADYR_RUDLEN` | Male | `f0998bf7-51f7-4eb8-a6be-6aa7ae5d0043` | `kkut_betasBarber` | 1 |
| `char_BRATR_MORTICIUS` | Male | `43824a52-5a0a-34bb-00ce-e68717a869b6` | `ksed_morticius` | 1 |
| `char_BRATR_PETROMIL` | Male | `cf925c52-6089-49a1-bb35-8ef549f5acfc` | `ssed_monk_21` | 1 |
| `char_BRENEK_Z_LOMU` | Male | `442d028c-ca30-c34e-0480-d4b4bc40adaa` | `ttro_man_1` | 1 |
| `char_BREZINA_KUBA_PARALU` | Male | `145a9f98-2aa0-44fe-a145-a0c554f1399b` | `kvrc_brezina` | 1 |
| `char_BURES_Z_CAPIC` | Male | `c84dbff0-636c-40dc-b160-4865598e6bb8` | `kgru_buresZCapic` | 1 |
| `char_BURESOVA_OSOBNI_STRAZ` | Male | `9d256ebb-467d-44af-a40b-77f9ce7a226d` | `kgru_buresovaGorila` | 1 |
| `char_BYNEK` | Male | `44876f84-1cac-99e9-95c2-48df36981eab` | `kboh_villageHead_bynek` | 1 |

</details>

<details>
<summary>Named characters: C (23)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_CECHMISTR_BUSEK` | Male | `d1fe7711-ca41-4c2b-b664-8da9ad03554b` | `kkut_man_19` | 1 |
| `char_CECHMISTR_EICHNER` | Male | `aa025bc0-1a2c-4c0e-82ab-b016c4130a1e` | `kkut_man_224` | 1 |
| `char_CECHMISTR_GOTTFRIED` | Male | `6d3b94a9-52dc-4971-9090-682839104d4c` | `kkut_man_5` | 1 |
| `char_CECHMISTR_MATYAS` | Male | `9ac6e856-019a-4a79-83cf-a4e967cfd14e` | `kkut_man_35` | 1 |
| `char_CECHMISTR_ZBOREK` | Male | `bc668c7a-1f73-472a-9bf1-b27b669b9677` | `kkut_man_29` | 1 |
| `char_CELEDIN_DRAT` | Male | `97594b3c-c520-4f04-9e66-dd9099dc8221` | `kbyl_drat` | 1 |
| `char_CELNIK_MATOUS` | Male | `556657ff-f72c-4c89-9f92-91447aaa995f` | `kkop_bandit_1` | 1 |
| `char_CENEK` | Male | `09ce1a48-91e9-497b-9188-bfdbc1d65b07` | `kkut_cenek` | 1 |
| `char_CERNEJ_BELA` | Male | `61f46cba-b629-4053-bbcc-1071675bbb09` | `kutnohorskyTurnaj_fighter1bela` | 1 |
| `char_CERNIK` | Male | `4c3d575f-b115-4968-8ec3-2f35afa2b274` | `kbyl_cernik` | 1 |
| `char_CERNY_BARTOS` | Male | `43bef37a-1599-c008-b737-fadf5758788d` | `ttro_cernyBartos` | 1 |
| `char_CERNY_DARKO` | Male | `8f2954cb-16b8-4fbe-831e-4a214d7c6227` | `taboryUCesty_duel_darko` | 1 |
| `char_CERNY_RYTIR` | Male | `9ef0797d-a81d-455e-ad12-0adc3ba62856` | `duels_blackKnight` | 1 |
| `char_CERNY_VOJAK` | Male | `08b87c63-567a-460e-8a33-ea3aa0d3fe78` | `kzik_cerny` | 1 |
| `char_CHAKAN_KUMAN_ZIKMUNDOVO_M44A` | Male | `9a314bd7-8f8d-4a33-b263-ae5ec9fdff97` | `kzik_chakan` | 1 |
| `char_CHERTHAN_VELITEL_KUMANU_ZIKMUNDOVO` | Male | `5c4e0831-06a2-4e8b-afdf-b3295dac28a1` | `kzik_cherthan` | 1 |
| `char_CHVAL_POLAK` | Male | `5bf1904c-290c-4316-934b-88dfffb05d62` | `kutnohorskyTurnaj_fighter3chval` | 1 |
| `char_CHYMIATER` | Male | `10cb98e4-42e4-4959-8569-bef8aaae6795` | `kkut_man_14` | 1 |
| `char_CIKAN_KAROL` | Male | `14a385fd-2321-45cf-903c-959dd212b583` | `taboryUCesty_shop_karol` | 1 |
| `char_CLEN_TOVARYSSTVA_1` | Male | `5031e6f9-601a-4504-9fa9-ee9cc7ca9d39` | `kkut_hangedJourneyman_1` | 1 |
| `char_CLEN_TOVARYSSTVA_2` | Male | `7626702d-cb08-44b3-b5fd-b392efa003e7` | `kkut_hangedJourneyman_2` | 1 |
| `char_CSABA_MOLNAR` | Male | `25a69a4d-5353-4640-b517-3545a14913ce` | `prepadeniVlasskehoDvora_csaba` | 1 |
| `char_CVERK_ZIZKA_BAND` | Male | `4a76a819-cfd0-5d25-2fda-0aa88e1b37a5` | `tneb_cverk` | 1 |

</details>

<details>
<summary>Named characters: D (54)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_DANIEL_KARPELES` | Male | `1361f092-722f-49c3-a2dc-460e074197e0` | `pogrom_manInFinalPart10` | 1 |
| `char_DAVID` | Male | `01cd5b2e-d35d-4286-807a-d42fa0cbd649` | `pranyr_david` | 2 |
| `char_DELNIK_LOJZA` | Male | `e794dd50-1030-430d-bb6a-f231ecd0e7f0` | `ssed_monasteryWorker_2` | 1 |
| `char_DEPOLT_MALESOVSKY_VOJAK` | Male | `75d92c90-21c4-4d63-b612-ef014621f498` | `zachranaPtacka_soldier_10` | 1 |
| `char_DETRICH_MALESOVSKY_VOJAK` | Male | `b4a3d76e-097b-4785-8b65-7ae364138ac1` | `zachranaPtacka_soldier_8` | 1 |
| `char_DEVECKA_Z_TROSKOVICKE_HOSPODY` | Female | `48ce94e4-b2e4-86ce-5d90-fef39db4b1ba` | `ttkc_woman_2` | 1 |
| `char_DEZERTER_1_MALIRUV_LEK` | Male | `48b2157d-6dfd-45e1-bd60-937a255985a6` | `kvrc_deserter_1` | 1 |
| `char_DEZERTER_2_MALIRUV_LEK` | Male | `237b94ae-10cf-42c9-b035-3aae87e9b293` | `kvrc_deserter_2` | 1 |
| `char_DEZERTER_3_MALIRUV_LEK` | Male | `c4982da8-5cb4-4812-a63d-505f19b1601f` | `kvrc_deserter_3` | 1 |
| `char_DEZERTER_POI_CERTOVKA` | Male | `b57a0fcb-09f2-4e6d-9918-cb57b82b7dd4` | `kcer_deserter` | 1 |
| `char_DITRICH_KATZ_VELITEL_PRAZANU_ZIKMUNDOVO` | Male | `5ceeb40d-624f-4a7a-8715-614d0a7c0a24` | `kzik_ditrich` | 1 |
| `char_DIVOZENKA` | Female | `a4797b3c-898e-4da2-bc25-908f3f3987ca` | `tvez_divozenka` | 1 |
| `char_DLC3_BLAZENA` | Female | `d2c204e6-7011-43ac-9d7c-cc03d937d91d` | `ssed_blazena` | 1 |
| `char_DLC3_BRATR_REHOR` | Male | `50be11ec-6ade-465d-9633-06ab4f04284c` | `ssed_monk_17` | 1 |
| `char_DLC3_BRATR_SALVATOR` | Male | `eccb2d70-b6e1-4100-8f52-73f0ea1a064f` | `ssed_monk_16` | 1 |
| `char_DLC3_BYLINAR` | Male | `1acd5637-0ce5-4c5b-b49a-f3088c975e52` | `ssed_herbalist` | 1 |
| `char_DLC3_CELLARIUS_JULIAN` | Male | `c15d0b62-8d05-4653-abfe-1a87e83ce3ab` | `ssed_cellarius` | 1 |
| `char_DLC3_DEVECKA_MADLA` | Female | `e411b825-6347-4bc4-94c7-c5417ac3465c` | `ssed_woman_1` | 1 |
| `char_DLC3_JESEK` | Male | `4e15afbe-7819-4db3-92bc-2b372d0922c0` | `ssed_jesek` | 1 |
| `char_DLC3_KAMARAD_PREKLADATELE` | Male | `277b6271-dbfe-4c58-a8ec-4dee31d3fcb7` | `ssed_translatorFriend` | 1 |
| `char_DLC3_KAMARADKA_BLAZENY` | Female | `b6d51731-e489-40d5-b3b5-1f413f4f7da2` | `ssed_blazenasFriend` | 1 |
| `char_DLC3_KNIHOVNIK_KRYSPIN` | Male | `c1d52e43-81be-404c-b520-acc494c30b69` | `ssed_knihovnik` | 1 |
| `char_DLC3_MNICH_PREKLADATEL` | Male | `de354fba-d187-4324-a531-0c820c81d005` | `ssed_translator` | 1 |
| `char_DLC3_MNICH_SPRAVCE` | Male | `48a96f1e-5bda-4197-be39-e42df9d6564d` | `puvodNemoci_deadMonk` | 1 |
| `char_DLC3_MNICH_VINCEK` | Male | `d94fe554-5375-4c2a-ab47-d85a212c4247` | `ssed_monk_23` | 1 |
| `char_DLC3_MNICH_Z_TAJNE_MISTNOSTI` | Male | `7257d606-5980-43e7-b253-e42747c6337c` | `ssed_monkFromScretRoom` | 1 |
| `char_DLC3_MNICH_ZPOVEDNIK` | Male | `8e41c0d0-b40a-4746-9a6b-50950deee649` | `puvodNemoci_confessor` | 1 |
| `char_DLC3_MRTVOLA_U_ZDI` | Male | `56be5dcb-ec4a-4a95-be8e-b439137aa8da` | `ssed_deadBody` | 1 |
| `char_DLC3_NADRIZENY_BLAZENY` | Male | `37f29252-5abf-49e8-80da-161b7de6fbb7` | `ssed_blazenasBoss` | 1 |
| `char_DLC3_NOVIC_BENEDIKT` | Male | `03d667fc-193f-4248-a7ac-fd19d060a6a5` | `ssed_monk_1` | 1 |
| `char_DLC3_POBOCNIK_ZACHARIASE` | Male | `bdfd4a5a-4f05-491c-8134-b751a790f7e1` | `ssed_man_1` | 1 |
| `char_DLC3_RADOVY_OZBROJENEC_JAN` | Male | `2c4f4e8e-f815-4a48-b91b-d8ddcc06baf8` | `ssed_knight_7` | 1 |
| `char_DLC3_RADOVY_OZBROJENEC_MAREK` | Male | `8559b2b3-683f-4564-bc16-b024a4905d12` | `ssed_knight_6` | 1 |
| `char_DLC3_RYTIR_ALBERICH` | Male | `9c0ea8d8-5fc0-42d0-ae85-adccf3501610` | `ssed_knightLeader_1` | 1 |
| `char_DLC3_SLAVEK` | Male | `232ed2e0-4d5e-4600-87a6-bd96bf9b28c4` | `ssed_slavek` | 1 |
| `char_DLC3_SLUZEBNY_BRATR_KARL` | Male | `82d1c12a-adbd-4947-ae2a-fe022083915e` | `ssed_knight_5` | 1 |
| `char_DLC3_ZACHARIAS` | Male | `f2620b0f-706e-4d50-a6a9-c1cfbc42e322` | `ssed_zacharias` | 1 |
| `char_DONATIONS_BOZIMUKA_VILLAGER` | Male | `c84051e7-679f-4fc6-bdba-e56e7aee0a9c` | `donations_boziMuka_villager` | 1 |
| `char_DONATIONS_GENERIC_MAN_01` | Male | `f98cff24-54ff-45dc-b15a-1fb1b4a69f26` | `donations_villager_man_1` | 3 |
| `char_DONATIONS_GENERIC_MAN_02` | Male | `f2f93570-68f9-4b4a-88ee-879e63ed6ca6` | `donations_villager_man_2` | 2 |
| `char_DONATIONS_GENERIC_WOMAN_01` | Female | `7dd6e456-0ae6-4502-b43e-91c97bc0fc00` | `donations_villager_woman_2` | 2 |
| `char_DONATIONS_GENERIC_WOMAN_02` | Female | `9c1f877d-7737-410f-81c7-fd9ab0f29758` | `donations_villager_woman_1` | 3 |
| `char_DONATIONS_PRIEST_01` | Male | `35d47cf0-ece2-4049-a0b7-96c0e53826c6` | `donations_ratborPriest` | 1 |
| `char_DONATIONS_PRIEST_02` | Male | `932c29e2-e37f-44a8-b30a-19ea964afb6e` | `donations_suchdolPriest` | 1 |
| `char_DONATIONS_PRIEST_03` | Male | `7dad9115-ed95-4fc6-8151-ee9ee03084f9` | `donations_vysokaPriest` | 1 |
| `char_DOROTA_LAZEBNICE_ZIKMUNDOVO` | Female | `13daee1f-a8e1-4247-88c3-22fa3a5c25e6` | `kzik_bathmaid` | 1 |
| `char_DOUBRAVKA` | Female | `4570525f-0c25-f7d4-94cd-945bf61c3cb0` | `tsla_woman_2` | 1 |
| `char_DRAHOMIRA_KUCHYRKA_MALESOV` | Female | `8b19218e-0e2a-4a9c-ae33-c6a5cc12e780` | `zachranaPtacka_woman_2` | 1 |
| `char_DREVORUBEC_DUSKO` | Male | `4d85c4c4-08e2-64ab-0990-c5898e2c54b6` | `ttkc_dusko` | 1 |
| `char_DREVORUBEC_VASEK` | Male | `4556a6db-bdd0-09f4-d59b-b4e0988e8aa7` | `krab_woodcutter` | 1 |
| `char_DREVORUBECKY_PREDAK` | Male | `4e628918-2a38-c1ea-c786-2424123506ae` | `tpod_man_1` | 1 |
| `char_DRIMAL` | Male | `47ff42d4-9847-5a0d-9730-e75464728b80` | `tzda_drimal` | 1 |
| `char_DRTIC_LOUTEN` | Male | `40324b02-c97b-c51c-270f-e46b29d24284` | `kejkliri_luteCrusher` | 1 |
| `char_DRUHY_PREGER` | Male | `4ff5947d-d4a3-4a25-906d-b2f2df5cb41a` | `kralovskeStribro_secretMint_miner_2` | 1 |

</details>

<details>
<summary>Named characters: E (8)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_ELBEL_SPANGUS` | Male | `5982caf5-3e2a-43d4-850f-bb6530691725` | `taboryUCesty_shop_elbel` | 1 |
| `char_ELIAS` | Male | `faa95014-3ab4-4494-9b02-81ebbd3493fc` | `ssed_elias` | 1 |
| `char_ELISKA_Z_ZELEJOVA` | Female | `4b1b50e2-44c3-110a-6970-f73d34a7b188` | `tzel_eliska` | 1 |
| `char_ELSE_JOHLINOVA` | Female | `b158442c-f468-4aa1-bda9-eda92566e280` | `kkut_elsa` | 1 |
| `char_ELSE_OD_VACLAVA` | Female | `5e63cd67-69d9-470a-bb22-df6387cfa760` | `kkut_elseHolkova` | 1 |
| `char_ENDERLIN_MECIR` | Male | `a7bdac0c-278d-481d-8c1b-57bb7a567eb0` | `kkut_enderlin` | 1 |
| `char_ENNELEYN` | Female | `4ffa9be7-9c6f-92bf-d418-1a8f4bc47ab0` | `tvez_concubine` | 1 |
| `char_ERIK` | Male | `4c4222fb-413e-e667-4958-38c4ee351daf` | `ttro_erik` | 1 |

</details>

<details>
<summary>Named characters: F (20)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_FABIAN_KRAFT` | Male | `5f64973f-43b8-4f50-a62c-0f3fd6f56e5e` | `kpri_man_2` | 1 |
| `char_FABRIZIO` | Male | `e68b291f-c5ba-459d-8c2b-43a82a184b7e` | `kkut_man_107` | 1 |
| `char_FARAR_ANTONIN_VYSOKA` | Male | `90d9e811-bfcc-4b01-b864-34cbfeff2102` | `kvys_priest` | 1 |
| `char_FARAR_DETRICH` | Male | `7834567f-9467-4e6f-bff3-627b3aeadb48` | `ksuc_man_15` | 1 |
| `char_FARAR_HAVEL` | Male | `282b238b-932e-42b4-94de-1ae2ce3d6a0f` | `kgru_man_4` | 1 |
| `char_FARAR_HROZNATA` | Male | `4249af24-40f0-487e-8404-cdd187cccf29` | `krat_fararHroznata` | 1 |
| `char_FARAR_KONRAD_PNEVICE` | Male | `786b48a9-2c2b-461b-a76b-bff4b9166402` | `prepadeniVlasskehoDvora_konrad` | 1 |
| `char_FARAR_PETR_MALIN` | Male | `aa61fe0a-f1c4-4913-9a04-5f59d0bc4edb` | `prepadeniVlasskehoDvora_petrMalin` | 1 |
| `char_FARAR_SLAVA` | Male | `1bef98b9-b379-45e4-9ab5-e0a0f5fce692` | `kbyl_slava` | 1 |
| `char_FIOLKA` | Female | `492d394f-e554-7c5e-c8b6-336e7469eda3` | `kvrc_fiolka` | 1 |
| `char_FOUSEK` | Male | `fea05654-5a3a-4b1f-9314-e711de8d745b` | `traskavePoselstvi_cartDriver` | 1 |
| `char_FOUSKOVA_STRAZ_1` | Male | `065baf48-f3cb-4f2c-b3fb-b764c01f7c4c` | `traskavePoselstvi_carriageGuard_1` | 1 |
| `char_FOUSKOVA_STRAZ_2` | Male | `fab2dc7a-3555-4fb3-a447-049ae8aea0fe` | `traskavePoselstvi_carriageGuard_2` | 1 |
| `char_FRANCEK` | Male | `bb6dd19d-2d1b-4085-9c78-e99811120504` | `kkut_francek` | 1 |
| `char_FRANCIN_KRIGL` | Male | `768c99ec-c99a-4818-b610-d4fc3180188b` | `kutnohorskyTurnaj_fighter3krigl` | 1 |
| `char_FRANTA_KULDANU` | Male | `20ca62f5-1e72-4b92-a2b5-01883105dd44` | `setkaniVRatbori1_frantaKudlanu` | 1 |
| `char_FRANZ_MALESOVSKY_VOJAK` | Male | `8136831c-2033-4a84-9d1f-e955b25643c5` | `zachranaPtacka_soldier_3` | 1 |
| `char_FRANZ_ROSENTHAL` | Male | `3934eeb9-f55c-4836-8765-240995418168` | `kkut_franz` | 1 |
| `char_FRENCLIN_KLIK` | Male | `19cb1567-06e4-4b12-a1ec-257b27f6f509` | `kmez_frenclin` | 1 |
| `char_FRIDUS_KUMEL` | Male | `48aa9bfb-6c40-7f6f-5dd8-d29b75cebfa9` | `kkut_kumel` | 1 |

</details>

<details>
<summary>Named characters: G (9)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_GEJZA` | Male | `448d0aca-6eb6-f62c-d86e-a4cffa85e493` | `kocovnickaCest_gejza` | 1 |
| `char_GERHART` | Male | `4d7db8fc-764d-e9c2-dbc8-49d816fa7bb4` | `drak_gerhart` | 1 |
| `char_GERHART_IGLAUER` | Male | `32a8808b-d6a6-4868-b5b8-ed16944c538e` | `kutnohorskyTurnaj_fighter4iglauer` | 1 |
| `char_GERTA_FRENCLOVA` | Female | `ef0a87eb-a5a2-46b9-949f-f624628e7a10` | `ksuc_gertaFrenczlova` | 1 |
| `char_GERTA_Z_LEKARNY` | Female | `4f7a02cb-7d65-2e86-1591-0c0cfb4b1cac` | `ttkc_gerta` | 1 |
| `char_GIUSEPPE_CABRINI` | Male | `d6fc945c-6cb4-4c9a-a7d0-1a898d388915` | `prepadeniVlasskehoDvora_giuseppe` | 1 |
| `char_GOCLIN` | Male | `e427c706-234f-4289-ad24-e8853125dee6` | `kkut_goclin` | 2 |
| `char_GREGORIUS` | Male | `de471728-d62c-4dce-9de4-a37d1f53c40d` | `taboryUCesty_dealer_gregorius` | 1 |
| `char_GROZAV_Z_BORUMLACA_VELITEL_ZOLDAKU_ZIKMUNDOVO` | Male | `055c8d3b-36b9-49b9-a575-7fb545df6807` | `kzik_grozav` | 1 |

</details>

<details>
<summary>Named characters: H (68)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_HADANKAR_VOVES` | Male | `c75fb98d-20b8-43ce-b685-3b35aa6a7575` | `pocestny_riddler` | 1 |
| `char_HAJNY_BOHUNEK_DOLANSKO` | Male | `0898ca21-b768-48a4-89ca-7e232c3ede44` | `kopa_bohunek` | 1 |
| `char_HAJNY_HRUSKA` | Male | `c82be12b-76e1-4da5-88c9-6b1c50aa080b` | `taboryUCesty_archery_urs` | 1 |
| `char_HAJNY_VAREL` | Male | `434d9448-0770-00ba-0530-42eebfd06397` | `tneb_huntsman` | 1 |
| `char_HALAMOVA_ZENA` | Female | `1b5207f7-4480-4d53-8133-975f27febc63` | `dice_wife` | 1 |
| `char_HANDLIR_BOHUS` | Male | `4243c244-5424-4f92-b430-505ec6dfea17` | `taboryUCesty_duel_bohus` | 1 |
| `char_HANKA` | Male | `88da072a-b0fd-44b6-9c29-22d086915271` | `zakopanyZitrek_hanka` | 1 |
| `char_HANKA_PRAZACKA` | Female | `fd8b55a3-f83e-4191-bd67-be679287d02e` | `kkut_adamsBathmaid_4` | 1 |
| `char_HANKO_KOZIHLAVA` | Male | `be7e7e78-18ae-4933-baa8-f90eef82e6e1` | `ttro_man_42` | 1 |
| `char_HANKUV_LAPKA_1` | Male | `2c128363-f706-4453-b5b2-908c3504e61b` | `zakopanyZitrek_bandit_1` | 1 |
| `char_HANKUV_LAPKA_2` | Male | `80b52786-fb9e-449c-af31-8704555f2c9c` | `zakopanyZitrek_bandit_2` | 1 |
| `char_HANKUV_LAPKA_3` | Male | `c2d5bea4-47c6-4e1b-85c3-7ccdc92c6be3` | `zakopanyZitrek_bandit_3` | 1 |
| `char_HANKUV_LAPKA_4` | Male | `14dcb2b4-fc96-4c6e-9c8c-a473ebaf8c0d` | `zakopanyZitrek_bandit_4` | 1 |
| `char_HANNA` | Female | `68a7a14a-2277-47ee-8d2b-279548608c2b` | `kgru_woman_8` | 1 |
| `char_HANS_MANNLICHER` | Male | `598318a7-93d4-4d6f-8754-78b23d0c2b38` | `kkut_man_241` | 1 |
| `char_HANS_ROTTA` | Male | `d2e3d989-6bdb-46e5-966a-5749a452b0ab` | `kcer_brabantSoldier_2` | 1 |
| `char_HANS_UHER` | Male | `6cc3bb5a-8427-4a49-8ed9-ea9dcdbd3ab7` | `kmis_hansZUher` | 1 |
| `char_HANUS_Z_LIPE` | Male | `e06e3886-893d-4f76-bb93-44fb0f0336d7` | `tsem_hanus` | 1 |
| `char_HASEK_Z_KOZLE` | Male | `2b22e767-19e6-4dd2-a441-4b49b3a929a7` | `ttro_hasek` | 1 |
| `char_HASTAL_PODKONNI` | Male | `e3a3f781-a695-4bea-8c11-797385afc0db` | `kmal_hastal` | 1 |
| `char_HAVEL_KRCMAR` | Male | `a9a3e090-ee0f-417b-af10-02e8336f00e9` | `kkut_havel` | 1 |
| `char_HAVIR_PECKA` | Male | `40531f92-18de-440e-9c3f-0cc48a75dc77` | `taboryUCesty_archery_miner_1` | 1 |
| `char_HEDVIKA_Z_UJEZDA` | Female | `59100ca6-b52c-4b70-928b-cd234e48451e` | `ttro_woman_8` | 1 |
| `char_HEIMAN_ALDER` | Male | `fd120949-e4eb-4cc0-ad91-6062ebc9f7c6` | `kkut_haman` | 1 |
| `char_HEIMANN_MALESOVSKY_VOJAK` | Male | `a7e4e885-30fc-4bf0-828e-63f1cbf822af` | `zachranaPtacka_soldier_5` | 1 |
| `char_HEJTMAN_BUSEK_DUB` | Male | `b810b5b8-dd12-4df7-9965-a05e36b55690` | `ttro_man_44` | 1 |
| `char_HEJTMAN_FRENCZL_SUCHDOL` | Male | `c036eeed-b1ee-4955-a60c-2e444d465fc5` | `ksuc_frenczl` | 1 |
| `char_HEJTMAN_PUTA` | Male | `4e013028-9885-7655-a922-175633d73e8a` | `spizovaciOddil_partyCommander` | 1 |
| `char_HEJTMAN_SUK` | Male | `4cbf7572-6737-6992-ec40-b2cd8724bdb6` | `tsem_suk` | 1 |
| `char_HEJTMAN_TOMAS` | Male | `75d7d1cb-39a8-4ac3-80c3-ef81a8a6dec5` | `ttro_tomas` | 1 |
| `char_HELENA_Z_DVORCE` | Female | `dd25d276-f3a5-4bf2-9749-51a9e6b9479d` | `setkaniVRatbori1_ratiborNobleWoman1` | 1 |
| `char_HENDL` | Male | `3f22632a-2b4a-4a8b-9710-21c9a84e31e2` | `kkut_hendl` | 1 |
| `char_HENIK_TACHOV` | Male | `4e66cb26-1531-3f85-7f1c-6b9126491b8c` | `ttac_henik` | 1 |
| `char_HENSLIN` | Male | `a789299f-423b-4dac-9509-1b92bf64f337` | `taboryUCesty_shop_henslin` | 1 |
| `char_HENSLIN_EBNER` | Male | `165f8204-8656-41a6-ba84-8c0b6ed25fc5` | `kkut_henslin` | 1 |
| `char_HERTL_ZIZKA_BAND` | Male | `2fd3157f-17ea-4c44-bd6a-dac8d217ea3a` | `tneb_hertl` | 1 |
| `char_HEZOUN_KARLIK` | Male | `5dbc3051-feaf-404d-b880-5c28552d8887` | `taboryLapku_karlik` | 1 |
| `char_HLEDANI_PSA_PASTEVEC_OG` | Male | `4cad58d3-6d39-ab2f-418b-0860343697bb` | `tbuk_zibrid` | 1 |
| `char_HOLEC_MISTR_LUKOSTRELBY_KH` | Male | `e685ebf0-1118-405b-b71c-ec259e35032e` | `kkut_holec` | 1 |
| `char_HONSOBE_STRAZ_M31` | Male | `8c5a5729-b1d5-4740-8795-8f0d5ac10013` | `ksuc_man_22` | 1 |
| `char_HORST_Z_LISKOVA` | Male | `1837e841-1969-4df8-90d1-ff55eea7643c` | `prodejceReceptu_salesman` | 1 |
| `char_HOSPODKSY_GRUNTA` | Male | `dcd165d3-09e4-42ef-9825-0b3a34bcffe8` | `kgru_gros` | 1 |
| `char_HOSPODSKA_ALZBETA` | Female | `49c11722-a739-3e79-4c88-99ceb4b74eb3` | `ttkc_inkeeper` | 1 |
| `char_HOSPODSKA_MARIE_TICHOTOVA` | Female | `4758bdb9-f854-38ef-1ea4-e8799614ceb7` | `tzel_woman_9` | 1 |
| `char_HOSPODSKEHO_SYN_MAREK` | Male | `44a49cdf-6bea-322f-d56b-2f312f7b8f95` | `kmis_man_5` | 1 |
| `char_HOSPODSKY_CUSTONT` | Male | `dde5942b-f55d-4a56-bbd0-63f6c9a9a32a` | `kkut_man_121` | 1 |
| `char_HOSPODSKY_GELDSTYK` | Male | `cf22a294-f8ef-4151-9147-79dae3154fa0` | `kkut_geldstyk` | 1 |
| `char_HOSPODSKY_SCHONPETR` | Male | `9841bb6e-d632-4fdd-bfd9-ed1ef0dbf9be` | `kkut_man_26` | 1 |
| `char_HOSPODSKY_SKVIRA` | Male | `6ded9582-45a2-4993-9a70-995d9c9cdb4d` | `kkut_skvira` | 1 |
| `char_HOSPODSKY_SLACALEK` | Male | `0a86ba28-e507-44d5-9e90-8cb4add3d121` | `kmal_innkeeper` | 1 |
| `char_HOSPODSKY_SUCHDOL` | Male | `7d063ba3-7d27-4d58-b582-d3771f323cce` | `ksuc_man_11` | 1 |
| `char_HOSPODSKY_TICHACEK` | Male | `d999fce1-e31f-4595-a6c8-c83c215307a1` | `kcer_innkeeper` | 1 |
| `char_HOSPODSKY_VAVRINEC_TICHOTA` | Male | `449022cc-0fbf-ffa4-021b-2b4b13e113be` | `tzel_vavrinec` | 1 |
| `char_HOSPODSKY_ZAJEZDNI_HOSTINEC_KH` | Female | `ef406388-7d87-4394-8bb8-883c12ec69eb` | `ksta_innkeeper` | 1 |
| `char_HOSPODSKY_ZAJEZDNI_HOSTINEC_PRITOKY` | Male | `c6243024-5a07-46b7-acef-e7e1f8d3c9c6` | `kpri_innkeeper` | 1 |
| `char_HOSPODSKY_ZDESLAV_MISKOVICE` | Male | `405be10d-d082-669f-7efc-f5481166dab4` | `kmis_innkeeper` | 1 |
| `char_HRADECKA_HLIDKA_1` | Male | `d53e0607-1b30-49c0-8272-8eecb5678a2a` | `posledniBereVse_bandit1` | 1 |
| `char_HRADECKA_HLIDKA_2` | Male | `b7745fc6-31c2-4cec-8ca2-49178e4ef5b0` | `posledniBereVse_bandit2` | 1 |
| `char_HRADECKA_HLIDKA_3` | Male | `db23c7cf-bd55-492d-b05c-fcc2b7a1c8f2` | `posledniBereVse_bandit3` | 1 |
| `char_HRADECKA_HLIDKA_4` | Male | `83503129-6dfa-4b27-864c-4541611025e5` | `posledniBereVse_bandit4` | 1 |
| `char_HROBNIK_FRANTISEK` | Male | `c7bf0af6-4582-4df4-84fd-1560649672e5` | `kkut_frantisek` | 1 |
| `char_HROBNIK_IGNAC_Z_TROSKOVIC` | Male | `4bf933a6-9117-11f2-4623-b8051b743d9b` | `ttkc_gravedigger` | 1 |
| `char_HROBNIK_LENEK_SEDLEC` | Male | `26df9f8c-d608-4a96-9c95-b39251ac103c` | `ksed_gravedigger` | 1 |
| `char_HUGO_MANNLICHER` | Male | `a1e66fdf-fc76-4b67-a901-123517475141` | `kkut_man_240` | 1 |
| `char_HUTNIK_SIMA` | Male | `3266e0e7-37b9-423a-a808-0dc56e805c25` | `kgru_man_51` | 1 |
| `char_HUTNIK_VOKRAK` | Male | `c2be2067-23b8-493c-b3d6-ff2870e49f08` | `kgru_vokrak` | 1 |
| `char_HYNEK_MLIKO` | Male | `0b99c97f-297b-4c70-9467-ed9f5c615521` | `kkut_hynek` | 1 |
| `char_HYNEK_Z_MEDLOVA` | Male | `6562ba1e-b31c-4584-9cc2-9f00da670f51` | `taboryUCesty_duel_hynek` | 1 |

</details>

<details>
<summary>Named characters: I (2)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_IBRAHIM_BEN_JICCHAK` | Male | `6a053c20-a6a0-4ae8-aee8-b34067bb281d` | `taboryUCesty_dealer_ibrahim` | 1 |
| `char_ISTVAN_TOTH` | Male | `46c0e15f-70b6-4898-55ef-d8984d5715a9` | `ttro_pista` | 1 |

</details>

<details>
<summary>Named characters: J (34)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_JACHYM` | Male | `b244b8da-82af-487b-b82e-0a7d59326abe` | `kmez_jachym` | 1 |
| `char_JAKES_OD_HRADKU` | Male | `93445d0c-62ce-4dd1-a884-aefbc8898781` | `kutnohorskyTurnaj_fighter4jakes` | 1 |
| `char_JAKOB` | Male | `b4e93ffb-6421-4e9c-bb08-a93103473c8e` | `hledaniLichtenstejna_samuelsHenchman_2` | 1 |
| `char_JAN_BALSAN_TOVACOVSKY_Z_CIMBURKA` | Male | `4fef51d5-b508-7a5b-e6fe-5e9911d3e5b0` | `kbyl_jan` | 1 |
| `char_JAN_II_Z_LICHTENSTEJNA` | Male | `7fdd99e9-9dab-4741-9640-77b5fcaace07` | `kkut_lichtenstejn` | 1 |
| `char_JAN_SEMIN` | Male | `41d4149c-61c2-55b4-f11a-813ab05404a9` | `tsem_seminsr` | 1 |
| `char_JAN_SINDEL` | Male | `cef7b00d-1549-4b0a-9c20-5be85a4a3b3c` | `kkut_sindel` | 1 |
| `char_JAN_TLAMA` | Male | `ff8d65e9-3f11-4f69-86db-3bb8270ab5b0` | `taboryLapku_tlama` | 1 |
| `char_JAN_Z_GELNHAUSENU` | Male | `c1dae12e-3db8-4aec-996d-478dc89ae01b` | `kkut_man_134` | 1 |
| `char_JAN_Z_LESTINY` | Male | `a640861e-3070-4440-8a07-b68284e9e6ad` | `sabotazLazni_nobleman` | 1 |
| `char_JAN_ZE_SUCHOTLESK` | Male | `dbb868d5-470f-4219-b768-855ec71648b2` | `dvojityAgent_jan` | 1 |
| `char_JAN_ZE_ZBYSE` | Male | `26d5b267-383e-4eaf-a344-45d2ef22e9b1` | `taboryUCesty_dice_vicar` | 1 |
| `char_JAN_ZIZKA` | Male | `4a705738-fd86-23bd-5eb9-ee16d727038a` | `tneb_zizka` | 1 |
| `char_JANEK_PISMAK` | Male | `d41c1dc0-8bea-4981-98e0-a95e73c85834` | `kkut_janek` | 1 |
| `char_JANEK_ZE_SKALICE` | Male | `4f4c67ee-9c0b-4f93-ad09-361114cbafaa` | `oblehaniSuchdole_janek` | 1 |
| `char_JANKA_OD_VELVARA` | Female | `d2c99262-43e4-483d-85d4-d32c5a80b0d6` | `kkut_woman_1` | 1 |
| `char_JARDUV_KAMARAD` | Male | `fce79b69-0760-48a7-966e-76b308e0ce6b` | `prepadeniNaCeste_jardas_friend` | 1 |
| `char_JAREK` | Male | `4dfeb6ca-49c2-5097-29d4-239554905889` | `ttro_man_5` | 1 |
| `char_JAROSLAV_ZE_SKALICE` | Male | `b6fafd10-98b4-4f2f-8d8f-8e4047628039` | `oblehaniSuchdole_jaroslav` | 1 |
| `char_JENIK_DOLANY` | Male | `69d68789-7357-4e90-bcbd-ba8de6cd9418` | `krat_jenik` | 1 |
| `char_JERONYM_NAZ` | Male | `2833a48c-b222-4131-87c6-e3ef913a51ce` | `kkut_jeronym` | 1 |
| `char_JEZEK_Z_RUDOLCE` | Male | `e7c5b100-6780-46f5-846e-085c1d176e69` | `ztracenaCest_jezek` | 1 |
| `char_JIMBO` | Male | `0397a96c-b799-40e0-a71d-437160e3550b` | `pocestny_jimbo` | 1 |
| `char_JIMRAM_REZNIK` | Male | `4a55bfa3-0545-7ec3-aa37-a8fa019d6fb0` | `kkut_jimram` | 1 |
| `char_JINDRICHOVA_MATKA` | Female | `5f353a4c-f268-4693-87a1-495fa7cff048` | `tvez_henrysMother` | 1 |
| `char_JITKA_Z_KOZLE` | Female | `dbddda67-12e4-40d4-9ffa-7bd8172bb586` | `ttro_jitka` | 1 |
| `char_JOEL_BEN_SIMEON` | Male | `c8c2f0bc-d9cc-48ac-9641-883f048e81cb` | `kkut_man_390` | 1 |
| `char_JOHAN_KRUMPHANZL` | Male | `6a0701ee-c322-4c25-a2b9-c9e7edd52979` | `kkut_man_342` | 1 |
| `char_JOHAN_STRIBROPEST` | Male | `15de13c5-847f-420f-854c-1cb456f70fd5` | `kutnohorskyTurnaj_fighter4johan` | 1 |
| `char_JOHANKA_ZE_ZERNOVA` | Female | `1b21ebf4-0ccd-450e-b182-8703a01c6ff8` | `ttro_woman_11` | 1 |
| `char_JOHLIN_SVEC` | Male | `13535394-266a-49e9-afdf-ff02b2ee2a65` | `kkut_johlin` | 1 |
| `char_JORG_PRANK` | Male | `28e1018b-49b4-4d29-93df-5d93257e56e0` | `kkut_jorgPrank` | 1 |
| `char_JOST_LUCEMBURSKY` | Male | `d9ac6e9e-5d1c-40d6-9e63-f6dcbf930620` | `ksuc_jost` | 1 |
| `char_JURA_VOSTRY_VOKO` | Male | `c9115313-d1a5-4f98-8353-c2006c8b38da` | `malir_bowman` | 1 |

</details>

<details>
<summary>Named characters: K (86)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_KACKA_LASKACKA` | Female | `077a4e11-9be3-4fce-89fa-c0bb31dc9be4` | `kkut_adamsBathmaid_2` | 1 |
| `char_KAMENIK_KOULE` | Male | `5bd81902-4c4e-46d4-ad84-d06a98940fb7` | `taboryUCesty_dice_cannonball` | 1 |
| `char_KAPITAN_BARNABAS` | Male | `c6638776-d197-4bff-b94c-57795f7e0c74` | `taboryUCesty_duel_barnabas` | 1 |
| `char_KAPITAN_BUSEK` | Male | `d3d00666-9ec5-47e7-82d2-45a8698e20ae` | `taboryUCesty_archery_cumplech_man_2` | 1 |
| `char_KAPLAN_NIKODEM` | Male | `4f766c50-f6ff-d9c0-f57e-ba685fb107b4` | `ttro_man_4` | 1 |
| `char_KAREL_ZVANY_SIP` | Male | `9446f0b5-4806-4a4f-9420-d9e4a6ecc163` | `magickySip_karelSip` | 1 |
| `char_KARL_MALESOVSKY_VOJAK` | Male | `c54793af-6439-4aae-ac3f-96faa862fda9` | `zachranaPtacka_soldier_2` | 1 |
| `char_KARL_VON_UNTERBRUCK` | Male | `7f37a899-4907-4afc-9f2b-d0b06d95fed8` | `tzel_man_11` | 1 |
| `char_KASPAR` | Male | `a39dcca4-a021-49ac-9a2e-4445d187bc5c` | `taboryLapku_kaspar` | 1 |
| `char_KASPAR_RUDOLF` | Male | `abf111aa-b34c-48e9-a788-079de07e7f3f` | `kkut_kaspar` | 1 |
| `char_KAT_HYNEK` | Male | `3f98c216-6d0b-4801-94eb-0d5f2542166e` | `kkut_executioner` | 1 |
| `char_KAT_MARTIN_BROCIUS` | Male | `31ab1968-1d96-433d-a9ee-a6e0d7210f56` | `taboryUCesty_dice_executioner` | 1 |
| `char_KAT_TROSKY` | Male | `6fe281ea-8ce3-4186-b8a4-45705a63588a` | `cutscene_crime_executioner_trosecko` | 2 |
| `char_KATERINA_Z_HOLU` | Female | `445c4253-2975-454b-a775-c8bf72bd46c2` | `taboryUCesty_dealer_katerina` | 1 |
| `char_KATERINA_ZIZKOVA` | Female | `4ee6712c-b00e-45a5-9ad6-d1083e2201b5` | `ttro_katerina` | 1 |
| `char_KECAL` | Male | `a1c017eb-2949-4527-9903-ed809c43340d` | `tneb_kecal` | 1 |
| `char_KEJKLIRKA_ROXANA` | Female | `e4f784d4-a161-4f64-9547-c2f3728741d9` | `taboryUCesty_dealer_actors_woman` | 1 |
| `char_KEJLIRKA_TANECNICE` | Female | `fce0dd26-1fff-43cd-87cf-e5bbe6312b7e` | `taboryUCesty_dice_actors_woman_1` | 1 |
| `char_KERUSE` | Female | `1ea97dae-db00-4194-bbb7-26cfdb178a0a` | `kgru_woman_6` | 1 |
| `char_KLARA_HOLICKA` | Female | `e92505ca-50c8-4b99-8c32-77a0036595b0` | `kgru_bathmaid_1` | 1 |
| `char_KLARA_ZIZKA_BAND` | Female | `587678eb-b645-40f6-af37-a10762e40505` | `tneb_klara` | 1 |
| `char_KNEZ_BOHUMIL` | Male | `f80fdea8-8b33-4e39-9400-75f7aefbffec` | `kzik_man_6` | 1 |
| `char_KOCICI_PANI_SUKOVC` | Female | `135a7521-2683-4519-9728-d7cadcd99388` | `klor_woman_2` | 1 |
| `char_KOMAR_POLAK` | Male | `ea74dd3c-1cf3-472f-b36b-9aa3dafbc2c3` | `kpri_komar` | 1 |
| `char_KOMORI_TROSKY` | Male | `476fcf57-aa93-cc6c-9cc0-1e2c5971d78e` | `ttro_komori` | 1 |
| `char_KONA_GRUNTA` | Female | `40fb77c4-e4d6-24c6-3385-a580c83515a2` | `kgru_kona` | 1 |
| `char_KONIAS` | Male | `ed79e7b5-1e70-4988-a824-97259a1155bd` | `archery_nobodyWantsArchery_banditLeader` | 1 |
| `char_KONRAD_KAPITAN_MALESOVSKYCH_STRAZI` | Male | `05934bb8-c426-4bd3-984a-838e11320c48` | `zachranaPtacka_soldier_1` | 1 |
| `char_KONRAD_KRAHUJEC` | Male | `5fe2b02e-6260-4431-b97b-2121969409be` | `kkut_krahujec` | 1 |
| `char_KONRAD_Z_VECHTY` | Male | `8018bc97-6fc4-4772-ac4f-e65daf9482db` | `kkut_konrad` | 1 |
| `char_KORENAR_BARNABAS` | Male | `50982937-7b7c-4ebe-86a2-5cd36dfe3128` | `tkop_barnabas` | 1 |
| `char_KORENARKA_VLASTA_Z_MISKOVIC` | Female | `48bfdff9-a6e1-4b43-ad85-bf364bac6cd9` | `kmis_herbalist` | 1 |
| `char_KOSTKAR` | Male | `2f63e9bd-d15c-45e4-8e06-9a768892089b` | `kbyl_player_1` | 1 |
| `char_KOSTKAR_2` | Male | `122458eb-6d15-4dea-adc4-ac9da5f1bf0d` | `kbyl_player_2` | 1 |
| `char_KOSTKAR_3` | Male | `8a0d0073-67d7-4f68-a269-cc040aca13a6` | `kbyl_player_3` | 1 |
| `char_KOSTKAR_CESTMIR` | Male | `3b33c1c6-541a-4d47-85fb-a1472f7ae139` | `kkut_man_122` | 1 |
| `char_KOSTKAR_FILIP` | Male | `4977f29a-b914-b3f4-ad64-ad3a13bad188` | `ttkc_man_16` | 1 |
| `char_KOSTKAR_HALAMA` | Male | `ef1a566f-c76d-4d20-a8a8-ce7caf196d5a` | `dice_drunkard` | 1 |
| `char_KOSTKAR_JARA` | Male | `6862d0e9-699b-4485-a481-ce26c1fad428` | `kkut_additive_man_62` | 1 |
| `char_KOSTKAR_KAZIMIR` | Male | `a9cb6792-b30f-4af6-af38-687540a9754a` | `kpri_man_25` | 1 |
| `char_KOSTKAR_KONRAD` | Male | `ad262fa7-b484-4013-a0d4-a9bee7cde6b7` | `kkut_man_236` | 1 |
| `char_KOSTKAR_KOSTA` | Male | `477f05e5-ebb3-5492-fd64-e05681355782` | `tzel_rowdy_3` | 1 |
| `char_KOSTKAR_LUDVA` | Male | `7ac5ab30-f811-480d-b6fd-f64698ed2a27` | `kkut_additive_man_30` | 1 |
| `char_KOSTKAR_MARTIN` | Male | `46949c1e-a68d-410c-b657-66b6b9a778e4` | `kkut_man_39` | 1 |
| `char_KOSTKAR_VILEM` | Male | `8f5ec799-c4c0-40db-8228-f7476d5cdd97` | `ksta_man_6` | 1 |
| `char_KOSTKAR_VOJTECH` | Male | `6ff68a4e-1485-44e2-a93c-71a7d0caaf20` | `ksuc_man_57` | 1 |
| `char_KOSTKARKA_JENOVEFA` | Female | `290fa028-a5f7-467a-a87f-fb754a5e6335` | `ttac_woman_5` | 1 |
| `char_KOSTKARKA_LUCIE` | Female | `f16b1707-9ae3-4d8b-be93-91c86f7149bb` | `kmis_woman_34` | 1 |
| `char_KOVAR_LORENC_Z_TACHOVA` | Male | `47766d82-a19e-adaf-8fdc-c272aa4aca86` | `ttac_blacksmith` | 1 |
| `char_KOVAR_TEZKY_JIRA` | Male | `3e60f5da-adb8-4b7a-a95a-045675a9fc04` | `taboryUCesty_duel_jira` | 1 |
| `char_KOVARKA_MARTA` | Female | `4d10cfca-4e70-fe07-a580-852ac63c9e91` | `kmis_marta` | 1 |
| `char_KOVAROVA_ZENA_Z_TACHOVA` | Female | `4da264bb-0386-91f2-4860-1dbf4476fd8e` | `ttac_woman_1` | 1 |
| `char_KOVAROVIC_PREMEK` | Male | `4411e76e-d613-64b2-2f52-bea733b7f790` | `kmis_man_14` | 1 |
| `char_KOVAROVIC_ZUZANEK` | Male | `d02cae90-e5ef-4da1-9e35-44cab52fb734` | `kkut_zuzanek` | 1 |
| `char_KOVARSKY_UCEDNIK_MATEJ` | Male | `64f0c99d-a579-44c4-85a5-93ea83484925` | `kgru_matej` | 1 |
| `char_KOZELUH_VIDLAK` | Male | `448c2641-5152-2264-a7a1-ead5d8193296` | `tvid_tanner` | 1 |
| `char_KOZLIK_ZIZKOVA_BANDA` | Male | `bfd2bbab-2878-4453-a87b-fd2e26f1c7e0` | `tneb_kozlik` | 1 |
| `char_KRAMAR` | Male | `b8ce3378-6968-4dba-9154-1ddf5db50708` | `taboryUCesty_shop_kramar` | 1 |
| `char_KREJCI_BARTOSEK_TROSKOVICE` | Male | `4ac3f7af-2a2f-7fad-ed54-78999338c5b7` | `ttkc_bartosek` | 1 |
| `char_KREJCI_MIKUS` | Male | `5102ec8d-747d-4f21-99c2-740fcde0e393` | `kbyl_mikus` | 1 |
| `char_KRISTIAN_Z_PISKU` | Male | `ea641403-2420-4bd9-a33f-7c94a7b9a9a7` | `khor_kristianZPisku` | 1 |
| `char_KRISTIANUV_MUZ_FANOUS` | Male | `5d9a758b-c8d1-4ff8-a451-895434ca3362` | `papezskyLegat_gorilla1` | 1 |
| `char_KRISTIANUV_MUZ_MILOS` | Male | `81004a97-951f-4b25-ac06-552b6050e6be` | `papezskyLegat_gorilla2` | 1 |
| `char_KRISTOF_VLEVEC` | Male | `7bda128a-957f-42de-a405-5cac0c9a7357` | `kutnohorskyTurnaj_fighter3kristof` | 1 |
| `char_KRISTYNA_Z_NOSTIC` | Female | `ba3424ff-c8fc-4dff-82f6-d1f7a69f8b7f` | `setkaniVRatbori1_ratiborNobleWoman2` | 1 |
| `char_KRIZAN` | Male | `3af63ad8-0d37-4589-b51a-b67f758cc37a` | `kpri_krizan` | 1 |
| `char_KROPENATEJ` | Male | `56ee46b2-9e05-4d68-ac9e-336ce93b34a2` | `kvrc_bandit_2` | 1 |
| `char_KRYSA` | Female | `b0e024e7-a13b-450d-8950-fa025ed93975` | `kkut_krysa` | 1 |
| `char_KRYSTOF_ODERIN` | Male | `f29aeef9-7fcd-4931-976a-c82374cfb1e8` | `krat_krystofOderin` | 1 |
| `char_KUBA_STISTKO` | Male | `5b7bc7a3-499d-4e19-a021-729de4ea1e31` | `malir_diceman` | 1 |
| `char_KUBAJZ` | Male | `45c8e3f4-ed85-89f4-3bce-f79e17f219b8` | `tneb_kubajz` | 1 |
| `char_KUBENKA` | Male | `3965655b-c894-423f-a4b3-2da8324bc279` | `kcer_kubenka` | 1 |
| `char_KUCHAR_VLASAK` | Male | `ae32d1d3-0208-4b0a-b0dd-50ec6f20847a` | `prepadeniVlasskehoDvora_cooker` | 1 |
| `char_KUCHARKA_ANNA` | Female | `d6f16670-2356-4e72-9394-a118f46f11b4` | `prepadeniVlasskehoDvora_anna` | 2 |
| `char_KUCHARKA_FANKA` | Female | `5652e3fe-c358-4d34-89e2-1c15232c9c8d` | `ttro_woman_5` | 1 |
| `char_KUCHARKA_MADLA` | Female | `79d5ce4a-3bae-4e75-8473-62aa27a3a7c7` | `setkaniVRatbori1_ratiborMaid1` | 1 |
| `char_KUCHARKA_SEMIN` | Female | `43757901-7c09-b7d6-c3d5-8137cb6bd39b` | `tsem_woman_1` | 1 |
| `char_KUMAN_JASAK` | Male | `4d90d6bc-fd27-20a4-4565-ca212361d2b5` | `tvez_man_8` | 1 |
| `char_KUNZLIN_RUTHARD` | Male | `c7026dc5-69f5-49c7-8b06-f627406f6c1b` | `kkut_kunzlinRuthard` | 1 |
| `char_KUPEC_JURG_THOMEL` | Male | `4e1f975b-3492-c612-5812-7d67821c1c81` | `ttkc_man_11` | 1 |
| `char_KURATKO` | Male | `4b246ba5-082d-800e-5dad-0f387189779b` | `kboh_kuratko` | 1 |
| `char_KUTNOHORSKY_PREVOZNIK` | Male | `0b309057-3c22-4cb0-8b65-161f143edbbc` | `tsla_nomad` | 1 |
| `char_KUTNOHORSKY_RABIN` | Male | `c1b69783-05b3-471e-9be1-0b8ca6494661` | `kkut_rabbi` | 1 |
| `char_KUTNOHORSKY_TURNAJ_GEARMASTER_LEFL` | Male | `54fc7b60-8304-4a1e-b7eb-90c69441f17f` | `kutnohorskyTurnaj_gearmaster` | 1 |
| `char_KUTNOHORSKY_TURNAJ_LAZEBNICE_KRISTYNA` | Female | `517dbf8f-edd9-4bcb-8c4f-6a3c872b83e7` | `kutnohorskyTurnaj_lazebnice` | 1 |
| `char_KVETOSLAV` | Male | `4845e91b-804c-f647-bacc-7076ca8b0783` | `listovniTajemstvi_kvetoslav` | 1 |

</details>

<details>
<summary>Named characters: L (23)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_LACEK` | Male | `8317b6b5-3a63-412f-b595-b843f90234d6` | `kkut_lacek` | 1 |
| `char_LACHOUT_MALESOVSKY_VOJAK` | Male | `c161c2de-ad81-4dd4-820b-5ed9d4705cc8` | `zachranaPtacka_soldier_9` | 1 |
| `char_LAMPRECHT_VON_PRAG` | Male | `5c3d8d66-1d2c-40d2-b5be-fb6270483f8f` | `finale_battle_enemy_boss` | 1 |
| `char_LASZLO_FARKAS` | Male | `4049d669-1267-4e8e-ae6b-9e12b2c6c695` | `kzik_laszlo` | 1 |
| `char_LAZAR` | Male | `0335d3a1-ef19-4220-bcdf-163c45c2c446` | `kkut_lazar` | 1 |
| `char_LAZEBNICE_ANNA` | Female | `49ec2a62-9ecb-6c5a-ac22-fcbb38b1a085` | `tzel_woman_6` | 1 |
| `char_LAZEBNICE_DOROTA` | Female | `48137490-73c6-2c74-6fce-b86c79715cab` | `tzel_woman_5` | 1 |
| `char_LEKARNIK_EMERICH_Z_TROSKOVIC` | Male | `4483b844-45e5-46ef-0aa9-9a5d9ecaeaab` | `ttkc_emerich` | 1 |
| `char_LEKARNIKUV_SYN_HEINRICH` | Male | `4db4e9ff-af4e-777d-f641-83c298a1289c` | `ttkc_man_18` | 1 |
| `char_LEOPOLD_KUBA_PARALU` | Male | `4b042eb0-c8e9-85cc-9588-ab4bd5373ca5` | `kkut_leopold` | 1 |
| `char_LEVEJ_BOCEK` | Male | `d0e11c19-348d-4ab0-9868-80fa8c292439` | `kpri_man_14` | 1 |
| `char_LIDA_Z_ZELEJOVA` | Female | `44e8a915-bb7d-a071-6993-a7b5f11baf82` | `tzel_lida` | 1 |
| `char_LIDKA` | Female | `857c7b8c-f84e-4a58-8e83-f73a7fbd88b9` | `kkut_additive_woman_54` | 1 |
| `char_LINHART_SVEC` | Male | `4dbdbe7f-8099-9b33-d06a-5b908a792d9e` | `kkut_linhart` | 1 |
| `char_LIPOLD_MALESOVSKY_VOJAK` | Male | `43d53783-148b-4b2b-be9a-53cb1619154f` | `zachranaPtacka_soldier_4` | 1 |
| `char_LORENC_CHROMAJZL` | Male | `7d532d81-e5a4-42e4-a40b-5fb147b7a1bf` | `kutnohorskyTurnaj_fighter3lorenc` | 1 |
| `char_LOVCI_DOBROS_PERO_SUCHDOL` | Male | `62f589dd-1146-40d9-839c-e81434965f41` | `ksuc_dobros` | 1 |
| `char_LOVCI_VOSTATEK` | Male | `4aee38a9-a3f5-d23e-b86c-2be4efd65899` | `tvid_huntsman` | 1 |
| `char_LOVEC_HLAV_LATIN` | Male | `1e2c5cd3-917e-4f35-947e-5d2843e901f0` | `taboryUCesty_archery_latin` | 1 |
| `char_LOVEC_STEPAN` | Male | `526348f2-d99c-4b7f-b50e-220a7d91fae3` | `taboryUCesty_archery_hunter_1` | 1 |
| `char_LUKAS_PULFRATER` | Male | `d33cdfbb-3201-4368-99ac-9bc6781546dd` | `kkut_lukas` | 1 |
| `char_LUKOSTRELEC_RANEK` | Male | `eecc9b36-2a8b-4946-b662-becbe53e119c` | `sedmStatecnych2_deadBody` | 1 |
| `char_LUMP_STRNAD` | Male | `128c18d7-36bf-4a82-892f-fef0822f6301` | `kkut_strnad` | 1 |

</details>

<details>
<summary>Named characters: M (78)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_MACATA_MANA` | Female | `9954bf55-2749-4d17-97bf-d1b44666c333` | `kkut_adamsBathmaid_1` | 1 |
| `char_MAGDALENA` | Female | `d5549074-c318-4eac-893e-314f4f43419a` | `kkut_magdalena` | 1 |
| `char_MAJITELKA_LAZNI_MAGDA` | Female | `2f92c4a7-f6ed-4693-839c-29fbc1705490` | `ttro_woman_6` | 1 |
| `char_MAJITELKA_LAZNI_MILADA` | Female | `1c38604c-6e2c-4f76-9116-7b4e67e53517` | `kzik_bathhouseAbess` | 1 |
| `char_MAJITELKA_LAZNI_SMOLKA` | Female | `ec130e50-0449-4936-bf34-bff28c69e6e5` | `kcer_woman_7` | 1 |
| `char_MAJORDOMUS_RADNICE` | Male | `93db4f71-31be-4fe1-8156-eab37c55dc04` | `setkaniVRatbori1_chancellor` | 1 |
| `char_MALEJ_JANEK` | Male | `82346ad3-062e-4648-8287-c6e2d246bdc1` | `kvrc_bandit_1` | 1 |
| `char_MALINKA_LIDA` | Female | `73536e91-c0cf-49ad-ade3-9330bb42b4f3` | `kkut_adamsBathmaid_3` | 1 |
| `char_MALIR_DLC1` | Male | `3b647411-a637-4922-812a-ee4138f120b8` | `ttro_malir` | 1 |
| `char_MALIR_KRASEK` | Male | `306000b3-0cec-4df9-a2ad-10259cea11a2` | `kkut_krasek` | 1 |
| `char_MAMA` | Female | `7e570b31-2a42-4173-805e-ed634f7319e3` | `kgru_bathmaid_2` | 1 |
| `char_MAMA_DOUBRAVKY` | Female | `4e9bdbd4-885f-b50b-3940-d9ff9a000382` | `tsla_woman_1` | 1 |
| `char_MANDELINA` | Female | `cf5c5090-e7b3-4767-92a2-918d513c84a3` | `kkut_mandelina` | 1 |
| `char_MANETA` | Female | `463df03e-7d00-551e-9ffa-cc55f05ebbb4` | `ttro_panna` | 1 |
| `char_MANKA_TACHOV` | Female | `47860a6e-ef3a-a421-17c6-fa2102bf8b9b` | `ttac_manka` | 1 |
| `char_MAREK_ZIZKA_BAND` | Male | `0e118323-c699-4e4f-8bfa-15e1681e154f` | `tneb_marek` | 1 |
| `char_MARETA_Z_BORU` | Female | `c8ce363e-c71b-49a1-b20b-2ea68cd828ee` | `ttro_woman_9` | 1 |
| `char_MARIAN_KNEZ` | Male | `94d8fc80-aa80-4288-bb2f-533d890c0c80` | `ksta_marian` | 1 |
| `char_MARIKA` | Female | `3144e896-4a8d-419b-be65-a5f307b6241a` | `kocovnickaCest_marika_cutsceneDouble` | 2 |
| `char_MARKETA` | Female | `137cd148-bab9-4ae2-a8c4-1ec9ab3a72af` | `damaVNesnazich_marketa` | 1 |
| `char_MARKOLT_Z_LOUN` | Male | `674f92a2-754b-424f-b1c4-9db38d76d24f` | `kkut_markolt` | 1 |
| `char_MARKVART` | Male | `a7c3d321-fb22-477e-be78-a2cfa5bf950d` | `kkut_markvartAulitz` | 3 |
| `char_MARTIN_ODERIN` | Male | `ec79bb18-b6b3-408f-96c4-10ce1e35ccf0` | `krat_martinOderin` | 1 |
| `char_MARTIN_OTEC_JINDRICHA` | Male | `83418424-7475-416b-b437-236d7faf1111` | `zachrana_fatherOfHenry` | 1 |
| `char_MARTINA` | Female | `a6c350d9-dbfd-46c3-83be-32d34c5fab13` | `duels_womanFromAmbush` | 1 |
| `char_MARUSKA_DCERA_JAKESE` | Female | `49097c6d-43bd-8d3c-7d70-e51e6bed0387` | `ttkc_marusa` | 1 |
| `char_MATEJ_MINCIR` | Male | `e67da634-3d4e-4e19-bfa9-5c3c10725e76` | `kutnohorskyTurnaj_fighter2mincir` | 1 |
| `char_MATKA_VORSILKY` | Female | `b8e91f3b-5179-421b-b2e3-e7bdfd8aac65` | `kvys_vorsilaMother` | 1 |
| `char_MATYLDA_ZE_SLAVATIC` | Female | `9ae7b2db-7cd4-43d8-8623-dcaffe6c1ae1` | `setkaniVRatbori1_ratiborNobleWoman3` | 1 |
| `char_MAZAK_HYNEK` | Male | `520184d4-06e5-4fe2-8689-d0905e29efe2` | `kkut_mazak` | 1 |
| `char_MEJDL_ESTER` | Female | `270797bc-c9fe-4689-a953-9e0ea256373d` | `taboryUCesty_dealer_ibrahim_woman_2` | 1 |
| `char_MENHART_Z_FRANKFURTU` | Male | `4e7cfdf9-5ad3-30e9-7226-c3b8235d3ea3` | `kkut_menhart` | 1 |
| `char_MESORES_JAKOB` | Male | `1a0f8e62-39c3-482a-a0a5-2c4eb014aa5c` | `taboryUCesty_dealer_ibrahim_man` | 1 |
| `char_MICHAL` | Male | `c4b0f820-6368-4b19-bb0c-c373e416e673` | `pranyr_michal` | 2 |
| `char_MICHAL_ZIZKA_BAND` | Male | `7f3eb34c-cec4-4b00-aec1-e2dc34134da4` | `tneb_michal` | 1 |
| `char_MICUL_Z_MONDRY` | Male | `f2e8371e-d7ce-43dd-9db7-211456a81178` | `ksed_man_4` | 1 |
| `char_MIKES_ZIZKOVA_BANDA` | Male | `d8c2149c-3767-4a43-8c5a-8c9fcb1a6b58` | `tneb_mikes` | 1 |
| `char_MIKOLAJ` | Male | `3cfc3d44-1215-4d57-a276-b31df74cb71a` | `test_dialogue_4` | 2 |
| `char_MIKULA` | Male | `7f91d851-6355-4f31-8fa7-308472f74b32` | `taboryUCesty_shop_mikula` | 1 |
| `char_MIKULAS_KRONDEL_PLATNER` | Male | `5cfd3ec5-6d69-4ee6-a8d9-d9f830eec2f0` | `kkut_krondel` | 1 |
| `char_MILENA_Z_TROSKOVIC` | Female | `4502d207-09c6-d9a3-5bca-41826d5d6c82` | `ttkc_milena` | 1 |
| `char_MILULAS_Z_PRAHY` | Male | `4aa85ef3-74d6-021d-e481-47d4794f6486` | `kkut_mikulas` | 1 |
| `char_MIROSLAV_SAMHNAT_TOVACOVSKY_Z_CIMBURKA` | Male | `4bfba621-042f-3418-7239-840ea669b380` | `kvrc_miroslav` | 1 |
| `char_MISKOVICKY_RYCHTAR` | Male | `929c58a0-bd04-479e-bdfa-449e5094f50b` | `kmis_bailiff` | 1 |
| `char_MISTR_ANDREAS_DE_BRODA` | Male | `80cc3f0b-1de7-4a20-a54a-1cf60a38ca1c` | `taboryUCesty_dice_ondrej` | 1 |
| `char_MISTR_KOCOUR` | Male | `22d36d2d-1cc6-4274-aa16-faf573fd9cb7` | `test_dialogue_3` | 2 |
| `char_MISTR_PETR_MANNLICHER` | Male | `c9c5c701-a6ea-4b78-9353-702f1a09aae5` | `kkut_man_239` | 1 |
| `char_MLADA_HOLKA` | Female | `3b1c56c6-ebfa-4e10-bc32-916414328dbc` | `pocestny_henrysBride` | 1 |
| `char_MLADA_PECKY` | Female | `0b92ff86-665c-4189-9075-569e0c8edfd6` | `ksuc_mlada` | 1 |
| `char_MLADEJ_MIKA` | Male | `6f091ea5-4d3d-42af-a6ce-6d212be1dc2c` | `vezniNaTroskach_catherinesInformator` | 1 |
| `char_MLADEJ_PIVEC` | Male | `0d953369-b046-490c-b947-e80b46d97113` | `kvys_pivec` | 1 |
| `char_MLADEJ_VEJMOLA` | Male | `01908479-d634-42e6-8c1c-6d76a26f75bb` | `kvys_vejmolaYoung` | 1 |
| `char_MLADY_MARTIN` | Male | `c493502c-fa90-4fa5-b503-55ac4f075b38` | `legacyOfTheForge_henrysYoungFather` | 1 |
| `char_MLYNAR_HERMAN` | Male | `9f96412a-162b-449e-a6f2-a8315133d3a1` | `kvrc_miller` | 1 |
| `char_MLYNAR_KREJZL` | Male | `4b5fe1b4-20a4-18de-4d08-6c6cb83fb2a8` | `tpod_krejzl` | 1 |
| `char_MLYNAR_MACHAL_RABSTEJNKA` | Male | `83418424-7475-416b-b437-236d7faf930b` | `krab_machal` | 1 |
| `char_MLYNAR_SKOPEK` | Male | `e841664d-b97d-4e3c-9bdb-696ec2ef2970` | `krab_skopek` | 1 |
| `char_MLYNAR_VAREL` | Male | `478105c1-c6d4-990d-5c75-b22f2c7d7899` | `tneb_miller` | 1 |
| `char_MLYNARKA` | Female | `98365ba1-6e60-48cd-8800-44fd05606d5e` | `sMlynariNejsouZerty_marketa` | 1 |
| `char_MLYNAROVA_DCERA_VANKA` | Female | `4773458d-7041-4887-bf71-7c40253a8f93` | `kvrc_millersDaugther` | 1 |
| `char_MLYNAROVA_ZENA_Z_PODSEMINA` | Female | `455497fd-4308-c47e-ae03-649ef70b6886` | `tpod_woman_1` | 1 |
| `char_MLYNARSKY_VOZKA` | Male | `bd147642-0863-4016-a22d-c81c7934dbf1` | `socky_coachman` | 1 |
| `char_MLYNARUV_SYN_VASEK` | Male | `4256e2cb-c9d0-4ad8-9b5d-6388b62d70e8` | `kvrc_millersSon` | 1 |
| `char_MNICH_ATANAS` | Male | `8ce44f8b-b98b-4dba-9654-74fb32b00161` | `ssed_monk_10` | 1 |
| `char_MNICH_KONSTANTIN` | Male | `a7a6bc60-cb69-4de8-94f3-bdaebf69d836` | `ssed_oldMonk` | 1 |
| `char_MOJSE` | Male | `3787c41e-50be-41da-8e14-8ce84499e740` | `hledaniLichtenstejna_samuelsHenchman_1` | 1 |
| `char_MORAVAK_1` | Male | `23be9439-52df-4ee2-9fba-b173012c1374` | `zbranePanaSemina_moravak_1` | 1 |
| `char_MORAVAK_2` | Male | `7d8738a2-89ac-430e-9629-ff3e41b8ccc4` | `zbranePanaSemina_moravak_2` | 1 |
| `char_MORAVAK_JURKO` | Male | `b7df9531-0fb6-46bf-a326-3b46c33fed9f` | `zbranePanaSemina_moravak_jurko` | 1 |
| `char_MORDECHAJ_HAIM` | Male | `4dd48de6-2799-3d9b-e002-ad2a7f3b75a6` | `tvez_man_6` | 1 |
| `char_MRTVY_ALBRECH_OSTROSTRLEC` | Male | `d4b4aec9-8546-461d-861c-816f70d5fdbd` | `knab_man_2` | 1 |
| `char_MRTVY_CTIRAD_Z_LORCE` | Male | `7f23dd92-1ad9-43f9-bed8-6f6232ff70b2` | `knab_man_1` | 1 |
| `char_MRTVY_GAMBLER_KATUV_SLEH` | Male | `83918815-6168-45a6-b91a-587811cc73d5` | `katuvSleh_hangman` | 1 |
| `char_MRTVY_PASERAK` | Male | `102891e6-9ec5-4e65-8ede-94827f950366` | `kkut_deadSmuggler_1` | 2 |
| `char_MUSA_Z_MALI` | Male | `74bab062-afb4-4a17-859a-79bcdf4be73a` | `kzik_musa` | 1 |
| `char_MYSEK_RANENY_VOJAK_ZIKMUNDOVO_M44A` | Male | `a97da5a2-94d2-4047-881c-84a3ba5bf897` | `kzik_mysek` | 1 |
| `char_MYSKA` | Female | `47ed9796-6568-b86c-f3ec-e0d25464209d` | `tsem_woman_2` | 1 |
| `char_MYSLIBOR` | Male | `42f1d39c-49dc-6a76-02ed-4e5d51d081a0` | `ksus_myslibor` | 1 |

</details>

<details>
<summary>Named characters: N (7)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_NABORAR_NA_VINICI` | Male | `4b90b0f8-03c6-a5c7-12ed-1623e14f9191` | `klor_naborar` | 1 |
| `char_NAPRAVENY_BORUT` | Male | `b13275cc-2ac0-421e-a655-8311b5f7ca32` | `kgru_borut` | 1 |
| `char_NASOSKA` | Male | `bdf96408-cb4b-4801-8c96-521525d9042b` | `pocestny_drunkard` | 1 |
| `char_NATHAN_KUSSY` | Male | `1b882240-9d20-48dc-bb72-b13ee5d21848` | `kkut_man_41` | 1 |
| `char_NECHUTA` | Male | `4ad0b77e-a7bb-7e18-c2fb-8ac9eebdb283` | `tsem_nechuta` | 1 |
| `char_NEPLACH_MALESOVSKY_VOJAK` | Male | `942121a4-e6a1-4ed1-8a26-c223f4d56cd2` | `zachranaPtacka_soldier_7` | 1 |
| `char_NERVOZNI_ZLODEJ` | Male | `4a774fef-78ee-4bfc-93f8-e6348caecd2f` | `katuvSleh_looter` | 1 |

</details>

<details>
<summary>Named characters: O (27)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_OBCHODNICE_TEREZA` | Female | `63f27b47-1692-42eb-84b6-3a886a9ac685` | `kkut_woman_12` | 1 |
| `char_OBESENY_ANDEL` | Male | `8f94817d-9bd0-4d89-8922-00e621052dcf` | `hledaniLichtenstejna_andel` | 1 |
| `char_OBESENY_HAJNY_VLCI_HORY` | Male | `b8bd1368-9d14-485d-ac71-eb07708480fe` | `kvlc_deadGamekeeper` | 1 |
| `char_OCHRANKA_KUPCE` | Male | `48f8fb4c-e528-43da-ae91-cfa26c70fa67` | `posledniBereVse_posila1` | 1 |
| `char_OCHRANKA_KUPCE_2` | Male | `fbf72506-1c06-4da2-a363-52c9920bd2e8` | `posledniBereVse_posila2` | 1 |
| `char_ODBOJAR_VYDRA` | Male | `9eb88b41-0712-47e4-89a3-c42a454af9e3` | `taborOdboje_vydra` | 1 |
| `char_ODOLEN_Z_VOTIC` | Male | `2b6ec042-b6e9-4574-beeb-c5ef14feedae` | `pocestny_prisonerNoble` | 1 |
| `char_ODOLEN_Z_VOTIC_VEZEN` | Male | `08a89a16-dab8-41d2-a571-b974b446f48c` | `pocestny_prisoner` | 1 |
| `char_OKRADENY_OBCHODNIK` | Male | `7704bba1-bf3d-4841-8a85-70aa82a9b21a` | `pocestny_robbedMerchant` | 1 |
| `char_OLBERT_EICHNER` | Male | `24dff3f8-89e7-40d0-bab0-1589635bc66e` | `posledniBereVse_olbert` | 1 |
| `char_OLDRICH_VAVAK` | Male | `6732e246-88e1-4191-8e2c-93c8b28ca38f` | `kkut_oldrichVavak` | 1 |
| `char_OLINA_DCERA_JAKESE` | Female | `4916e02a-fbbd-6545-c99b-9b7d7edc2486` | `ttkc_olina` | 1 |
| `char_ONDREJ_BERANI_HLAVA` | Male | `47071b0a-1667-4f56-678f-828d91201a9a` | `hromovyKamen_banditLeader` | 1 |
| `char_ONDREJ_JAKUN` | Male | `92931299-aa3c-41e6-98bc-784f38bf7078` | `kutnohorskyTurnaj_fighter3ondrej` | 1 |
| `char_ONDREJ_POLNER` | Male | `db92a492-61f7-46a5-b9ca-26656db6a3b1` | `kkut_polner` | 1 |
| `char_OPAT_JAN` | Male | `4171e9dc-3534-05c0-5350-22361e1dd685` | `ksed_opat` | 1 |
| `char_OPILEC` | Male | `88000ef7-14ea-4ff7-9821-2c3ff7201a8f` | `rvacka_drunkard` | 1 |
| `char_OPILEC_JEZEK` | Male | `4401c793-6a8b-0338-2dea-d03e28a800b6` | `ttkc_jezek` | 1 |
| `char_OPILEC_MARES` | Male | `62a9d201-07d7-4902-a5c2-ba402eb73c5d` | `ttac_man_6` | 1 |
| `char_OPILEC_ZAVIS` | Male | `358ca730-5253-4daa-bd68-89e333d25668` | `kkut_man_125` | 1 |
| `char_OSWALD_TORWART` | Male | `519c93ba-6dac-4334-a98e-cf9d9122213f` | `kkut_oswald` | 1 |
| `char_OTEC_FRANTISEK` | Male | `99dd99ef-285d-450e-b107-f63da08922d7` | `kkut_man_385` | 1 |
| `char_OTEC_PROKOP` | Male | `8ed36650-ee53-4337-95ce-8e71afc473e0` | `kkut_prokopPriest` | 1 |
| `char_OTEC_TOBIAS` | Male | `32474f1b-2483-43f8-adec-8bc9f4ceb8ee` | `kkut_tobias` | 1 |
| `char_OTIK_POCEM` | Male | `a86afebb-ac92-4218-8044-0d19cf6675dc` | `kutnohorskyTurnaj_fighter1pocem` | 1 |
| `char_OTIK_RYCHNA` | Male | `4db18150-70e4-48ec-8739-3c0847cea6a9` | `kutnohorskyTurnaj_fighter1otik` | 1 |
| `char_OTTE_KOCH` | Male | `41c88b11-2e30-416a-882d-f70cfafb408d` | `ttro_man_43` | 1 |

</details>

<details>
<summary>Named characters: P (93)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_PACHOLEK_BRETISLAV` | Male | `4c987323-f55c-23ce-6894-efd99ee612a3` | `tzel_bretislav` | 1 |
| `char_PACHOLEK_FRANCEK` | Male | `5aad574a-b462-44bb-8f78-b99c3f7a4943` | `zbranePanaSemina_pacholekFrancek` | 1 |
| `char_PACHOLEK_HERSO` | Male | `4e91e9ee-f8c2-e465-d0a0-ee32b67c308d` | `ttro_man_7` | 1 |
| `char_PACHOLEK_JAKES` | Male | `4ff991a2-9b32-a915-f198-484c5d064d86` | `tneb_jakes` | 1 |
| `char_PACHOLEK_JENIK` | Male | `43814bca-446b-60d8-b209-1939698430ba` | `tpod_jan` | 1 |
| `char_PACHOLEK_KOLDA` | Male | `478360ef-eb87-ec87-be51-0667bfb53b98` | `ttro_man_14` | 1 |
| `char_PACHOLEK_KUBA` | Male | `41684b98-1e73-79fa-0e75-74907775f6b5` | `tneb_kuba` | 1 |
| `char_PACHOLEK_MALIK` | Male | `49f99682-6460-7e10-1980-1c46ffcdb0ae` | `tpod_malik` | 1 |
| `char_PACHOLEK_OLDRICH` | Male | `40338ccf-0c29-c50d-f347-ddb81ac7b6b9` | `ttkc_oldrich` | 1 |
| `char_PACHOLEK_RADMIL` | Male | `21aa4171-814f-45a6-8f4b-5ee198067e96` | `kkut_radmil` | 1 |
| `char_PACHOLEK_SLAMA` | Male | `484fca1f-bc40-20a0-9bb1-a10887dad5bd` | `ttkc_slama` | 1 |
| `char_PACHOLEK_STANIK_HORANY` | Male | `9c4bdaaf-7b1e-48c5-b979-bf04098f2383` | `khor_man_24` | 1 |
| `char_PACHOLEK_TOBIAS` | Male | `37b704b6-27a9-44a3-ab9a-b907084797ab` | `kgru_man_53` | 1 |
| `char_PACHOLEK_VENCA` | Male | `4f988ba2-08c4-9f5d-d6bb-6af2dd194caa` | `kmis_man_12` | 1 |
| `char_PACHOLEK_VENCA_APOLENA` | Male | `c3de15f8-7828-4d5e-b9e4-6237874fd57a` | `zbranePanaSemina_pacholek` | 1 |
| `char_PACHOLEK_VIRA` | Male | `48d0b188-1eb9-5bc1-6bf2-a62703fc49b2` | `tpod_vira` | 1 |
| `char_PACHOLEK_VITEK_MALESOVSKY_HRAD` | Male | `146c68ad-c2f2-4deb-a35e-8ab0a796c543` | `zachranaPtacka_man_1` | 1 |
| `char_PACHOLEK_VUJTEK` | Male | `b69730f0-850e-4c4c-b6bd-94ed9f7fe973` | `kkut_man_24` | 1 |
| `char_PAJSL` | Male | `a380c343-3170-4b3b-bd4d-96c00fd20444` | `kmez_pajsl` | 1 |
| `char_PANI_OFKA` | Female | `51163eb6-8761-4f46-a678-62a769c74d57` | `zachranaPtacka_woman_1` | 1 |
| `char_PAPEZSKY_LEGAT` | Male | `074d803e-12c9-46e9-afec-431fc0e721aa` | `papezskyLegat_legate` | 1 |
| `char_PASACEK_ALSIK_TACHOV` | Male | `43e27301-14ad-b605-eecc-547440a3bc86` | `ttac_alsik` | 1 |
| `char_PASAK_PRASTA` | Male | `49613399-1d12-88da-430f-bee7ff37da85` | `ttkc_prasta` | 1 |
| `char_PASAK_SAFARIK` | Male | `4ce26b93-3cdc-67a2-a655-733cd058b4bf` | `tapo_safarik` | 1 |
| `char_PASAK_SMOLIK` | Male | `44973bc3-a116-b8d5-4be6-fa1f90c7c1ba` | `ttac_smolik` | 1 |
| `char_PASERAK_STARA_KUTNA` | Male | `4f2f38cc-f533-4a93-8d8a-eae288ffc41d` | `skladPaseraku_smuggler` | 1 |
| `char_PASKO` | Male | `4afff511-c74c-a1f9-16df-f0376a0223bb` | `tneb_pasko` | 1 |
| `char_PAVEL` | Male | `e72f2ff7-f73e-4ab5-86f0-0b22f4039bcf` | `kvys_pavel` | 1 |
| `char_PAVLENA` | Female | `b076039c-ec78-43c9-9901-d441f6fc9125` | `kvrc_millersWife` | 1 |
| `char_PAVLENA_VEZICKO` | Female | `4c027101-6813-374e-b0df-ef9ab7e40387` | `tvez_pavlena` | 1 |
| `char_PECHA` | Male | `0120b481-9db6-4928-bf18-a5d74fc6ebd5` | `kgru_pecha` | 1 |
| `char_PEKAR_LEPEK_BYLANY` | Male | `c5f1b754-c9b1-4457-a055-e2102bc14298` | `kbyl_baker` | 1 |
| `char_PELCL_ZIZKA_BAND` | Male | `87c9bede-fec0-4cb3-9475-35989f7d01a8` | `tneb_pelcl` | 1 |
| `char_PENA_DOLANY` | Male | `79662caa-1e72-4cee-8e70-185da2799e6c` | `krat_pena` | 1 |
| `char_PERCHTA` | Female | `45ed04f7-3e1e-f3d1-6a8c-aa75d4d88d82` | `ttro_baba` | 1 |
| `char_PEREGRIN_MESSER` | Male | `f18954c0-5c49-4c03-8186-cb49da557aa3` | `kutnohorskyTurnaj_fighter4peregrin` | 1 |
| `char_PERKOLT_MISTR_REZNIK` | Male | `1a397b6e-dd3b-4b60-bdf4-85d92e53d811` | `kkut_perkolt` | 1 |
| `char_PESEK_PUTZLAUF` | Male | `ead2d9a5-6cbb-4afd-bf2e-f505d6c9f72b` | `kutnohorskyTurnaj_fighter4pesek` | 1 |
| `char_PETR_DRZHUBA` | Male | `b8fc3b4d-e569-4223-97a6-df59f21b3ee7` | `kutnohorskyTurnaj_fighter3drzhuba` | 1 |
| `char_PETR_HOUSER` | Male | `64ac749c-7c8c-43af-af74-4a209e80eb19` | `pocestny_duelist` | 1 |
| `char_PETR_MAILER` | Male | `237705d9-a6e6-4e38-97f8-5aa80684bda1` | `kkut_petr` | 1 |
| `char_PETR_PECKY` | Male | `59f7c93f-7d8b-4053-9743-9a3ad7ed192a` | `ksuc_petr_2` | 1 |
| `char_PETR_SADLO` | Male | `4488934e-d3bd-4066-abb4-c5bf995b0395` | `kcer_brabantSoldier_5` | 1 |
| `char_PETR_Z_PISKU` | Male | `1ca15a2a-f44d-48e5-af94-bb31f838265a` | `ksuc_petr` | 1 |
| `char_PISAR_TROSKOVICE` | Male | `4f9abd13-5f96-c6d7-529b-836fe83caab7` | `ttkc_scribe` | 1 |
| `char_PISAR_TROSKY` | Male | `45181eae-906f-33c4-a6cf-667907e38ea0` | `ttro_pisar` | 1 |
| `char_PLATNER_OSINA` | Male | `4ab1ee52-bf43-cf0c-7ff2-d692392c9088` | `ttro_kovar` | 1 |
| `char_PLECHAN` | Male | `16506a51-3a65-4c74-85a3-60c8299b6dd1` | `nebakovObrana_strelniceNPC` | 1 |
| `char_PLESNIVEC` | Male | `39fd7989-3b5d-44ee-96bb-ddacf84013c3` | `taboryLapku_plesnivec` | 1 |
| `char_POCESTNY_EVENT_RAUBRITTER` | Male | `14928769-9e91-4277-acb7-f11acca2ba3a` | `taboryUCesty_dealer_raubritter_man` | 1 |
| `char_PODIVNY_OBCHODNIK` | Male | `e542cc26-2601-4faf-9e2b-ee531a689ca1` | `prepadeniNaCeste_magicShop_victim` | 1 |
| `char_PODKONI_KABAT` | Male | `44daf8e8-7706-3126-8ccb-9fbea6dc3d8f` | `ttro_man_8` | 1 |
| `char_PODKONI_KUTNA_HORA` | Male | `fdd5b410-a473-4938-8874-8db5b7c6502e` | `kkut_man_64` | 1 |
| `char_PODKONI_SEMIN` | Male | `448027f6-9370-9960-2003-a9edc2d579b5` | `tsem_man_15` | 1 |
| `char_POGROM_OBECNY_MESTAN_1` | Male | `a46eddc6-ad8e-4535-b176-4bc6c6e9ad52` | `kkut_additive_man_223` | 2 |
| `char_POGROM_OBECNY_MESTAN_2` | Male | `a84a0114-d6e9-4fba-b162-5b7bc604b686` | `pogrom_backyardAttacker2` | 1 |
| `char_POGROM_OBET_1` | Male | `a6eaf677-d401-49d5-ac01-05815a99fb10` | `pogrom_backyardVictim1` | 1 |
| `char_POGROM_OBET_2` | Female | `99e1f426-6ac3-482a-bc79-75e183628ae5` | `pogrom_backyardVictim2` | 1 |
| `char_POKORNY_RYTIR_U45` | Male | `71f285d4-042f-4c0c-b1a5-53cbb0adac57` | `ksed_pokornyRytir` | 1 |
| `char_POMATENEC` | Male | `3effd3f9-5de1-4cbd-bb91-7543186ff0ba` | `kvrc_crazyOldMan_1` | 1 |
| `char_POMOCNICE_U_TROSKOVICKEHO_OBCHODNIKA` | Female | `4763a986-8361-a712-61d9-bf6dd706ddb6` | `ttkc_woman_6` | 1 |
| `char_POMSTYCHTIVEC_1` | Male | `47c5de63-d3ae-d6db-228f-b899c8fc6583` | `rasuvUcen_ambusher1` | 1 |
| `char_POMSTYCHTIVEC_2` | Male | `4af3f32a-48db-a1d2-ecdc-25a05c611bba` | `rasuvUcen_ambusher2` | 1 |
| `char_POMSTYCHTIVEC_3` | Male | `449c9adb-1087-7baa-d1ab-be106bc5098c` | `rasuvUcen_ambusherTalker` | 1 |
| `char_PONOCNY_ZE_SEMINA` | Male | `4dcf97c0-6d02-6ad0-cb07-4b5e100016bd` | `tsem_man_4` | 1 |
| `char_PORADATEL_JIZDNI_LUKOSTRELBY_ZIKMUNDOVO` | Male | `f34b70c1-c652-4a12-ab83-67f4bee45db0` | `kzik_man_2` | 1 |
| `char_PORADATEL_ZAVODU_MALESOV` | Male | `c0dd7ec8-cdba-499e-9935-ca04be484bda` | `kmal_man_1` | 1 |
| `char_POSEL_BEZ_DOPISU` | Male | `17c08b2b-0f95-474c-8167-c47ba8f66804` | `pocestny_lostLetter` | 1 |
| `char_POSEL_TOVARYSSTVA` | Male | `2e2d8d33-4cff-4fa1-b501-fc29ad82d57d` | `traskavePoselstvi_courier` | 1 |
| `char_POSLICEK` | Male | `c24f9034-60e5-439e-bafb-d2ee341e81f3` | `malirBezBudoucnosti_poslicek` | 1 |
| `char_POTRHLY_VCELAR_MISKOVICE` | Male | `ba4603d0-89ff-4a37-a9eb-06675bce6b9a` | `kmis_man_35` | 1 |
| `char_POULICNI_OBCHODNIK_1` | Male | `f77534fe-c563-4ff2-8235-740ee8908ab9` | `prepadeniVlasskehoDvora_merchant_1` | 1 |
| `char_POULICNI_OBCHODNIK_2` | Male | `d1b275b3-d7ae-4282-ab33-07d9cfc0ca58` | `prepadeniVlasskehoDvora_merchant_2` | 1 |
| `char_POUSTEVNIK_AMBROZ` | Male | `a533e777-e166-4d54-a42c-6bb3a582c4f9` | `tapo_ambroz` | 1 |
| `char_PREDAK_DREVORUBCU` | Male | `646c3dac-8388-42d4-abab-8234fd031858` | `kvlc_man_1` | 1 |
| `char_PREDAK_FRANTA` | Male | `11333886-44e6-437c-a4fa-b7a04af4e485` | `khor_man_21` | 1 |
| `char_PREDAK_MASLO` | Male | `4647ed03-d817-40bc-a592-f5ca670e1d3e` | `khor_maslo` | 1 |
| `char_PREDAK_ONDREJ` | Male | `682b957c-e4bb-4aae-b768-15a1f5ea6350` | `nakaza_prepadak` | 1 |
| `char_PREDAK_PAVEL` | Male | `91066582-3374-4c47-abfa-c91d08023991` | `khor_man_22` | 1 |
| `char_PREDAK_SAMKO` | Male | `d7b52394-042d-4882-bbc2-04674663d15d` | `khor_man_23` | 1 |
| `char_PREDAK_VLACH` | Male | `9e101adf-252b-4ad2-b984-f2bb0b4b7cfd` | `kkut_vlach` | 1 |
| `char_PREKUPNICE_DOROTA` | Female | `de7802fb-5eb9-4f25-adf2-e1c30ee4abf6` | `taboryUCesty_dealer_smugglers_woman` | 1 |
| `char_PREKUPNIK_DEDEK` | Male | `4611ea06-9f09-3b67-469b-8d5da6aebea9` | `tvez_dedek` | 1 |
| `char_PREPADENI_NA_CESTE_INKVIZITOR` | Male | `48219833-a05b-4f9b-a051-1e801442807f` | `prepadeniNaCeste_inquisitor` | 1 |
| `char_PROKOP_ELDRIS_PUSKAR` | Male | `2635740d-bdf7-407b-b485-c5b6d046aef1` | `kkut_prokopEldris` | 1 |
| `char_PROSPEKTOR_MARTIN` | Male | `9f414cb7-0346-46b1-8b04-e89967742d10` | `taboryUCesty_archery_prospector_1` | 1 |
| `char_PRVNI_PREGER` | Male | `24233e57-e3bf-4fba-aa57-2fd7924b8df2` | `kralovskeStribro_secretMint_miner_1` | 1 |
| `char_PURKRABI_ZICH` | Male | `9b718b83-5dba-48f0-991d-acb0cdbc7d73` | `taboryUCesty_duel_zich` | 1 |
| `char_PUSKO` | Male | `f6aa4907-90fa-434c-85f7-d3bd96c326b6` | `ztracenyTovarys_pusko` | 1 |
| `char_PYTLAK_MACH_Z_MARSOVIC` | Male | `8734c344-2809-48b1-9578-f99841cc41c0` | `ksuc_poacher_1` | 1 |
| `char_PYTLAK_SLATEJOV` | Male | `d243634f-f50c-4ee0-83d0-41930e43ed71` | `pytlakPtacek_poacherSlatejov` | 1 |
| `char_PYTLAK_Z_VEZAKU` | Male | `4e3d6f1c-1b88-e234-02b8-f1fa4bce5585` | `pytlakPtacek_poacher_2` | 1 |
| `char_PYTLAK_Z_VIDLAKU` | Male | `4e362020-b10a-1ac0-392b-cdebcc030299` | `pytlakPtacek_poacher_1` | 1 |

</details>

<details>
<summary>Named characters: R (33)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_RACEK_KOBYLA` | Male | `cb62d11c-a581-48d3-9421-31932491f2f2` | `tsem_racek` | 1 |
| `char_RANEK` | Male | `413e2645-4eea-5da7-53b8-d0c80c893894` | `ksus_ranek` | 1 |
| `char_RAS_WOLFRAM_SUCHDOL` | Male | `0d2a09b7-d9d4-469c-a89b-7950f9ed0279` | `ksuc_wolfram` | 1 |
| `char_RAUBITTER_ULRICH` | Male | `c744aa8b-c8ad-4205-8f5d-0e914ceacbb5` | `taboryUCesty_dealer_raubritter` | 1 |
| `char_RAUBRITTER_CERVENAK` | Male | `acbb818a-5c32-4606-9405-8b54b66c9a27` | `tsem_cervenak` | 1 |
| `char_REZNIK_BASKA` | Male | `412ae2ea-4bdc-3e2e-7bfa-696b7bf723a3` | `ttkc_baska` | 1 |
| `char_REZNIK_MATEJ_BUCEK` | Male | `6b39b26e-c5c8-47f1-86a6-10c5f3024d43` | `kkut_man_248` | 1 |
| `char_REZNIK_PRITOKY` | Male | `30c11415-9fb0-4940-9da3-ce7a67f7c757` | `kpri_butcher` | 1 |
| `char_REZNIK_VALIHORA` | Male | `b32d794a-2aeb-4c40-b7d3-c6f8a8c726ac` | `kkut_man_251` | 1 |
| `char_REZY_LINHARTOVA` | Female | `15843d92-58e1-4c9b-a6f4-144e14e543af` | `kkut_rezy` | 1 |
| `char_ROLNIK_FRANTISEK_ZELEJOV` | Male | `43174d5d-1664-2d37-5b71-ce107375a193` | `tzel_frantisek` | 1 |
| `char_ROZA_RUTHARD` | Female | `92e0e532-d0ca-4d76-bf98-eb4f099dac7b` | `kkut_rozaRuthard` | 1 |
| `char_ROZHODCI` | Male | `ef2df676-c2c2-4c2d-91b6-554476c4aab5` | `sabotazLazni_duelReferee` | 1 |
| `char_ROZHODCI_KAFKA` | Male | `76550ca5-9a82-4015-9f84-edd7bd86e9d0` | `kkut_man_328` | 1 |
| `char_ROZHODCI_SOUBOJE` | Male | `97ce2f39-9085-48cb-8bbf-bb309e9e19c9` | `proMistraZavet_referee` | 1 |
| `char_RUDIGER` | Male | `8287f0c1-e284-469e-9bf8-3b3507a2ae1f` | `kkut_man_211` | 1 |
| `char_RUDOKUPEC_HERMAN` | Male | `460403eb-303a-4d11-8a8e-ff3f85c878b1` | `khor_oreseller` | 1 |
| `char_RUTHARDOVSKA_STRAZ` | Male | `8384b2d9-79ec-48da-9907-1a1b573eb702` | `zachranaPtacka_ruthardGuard` | 1 |
| `char_RYBAR_VIDLAK` | Male | `45272970-c7dd-192c-5bcc-42a4784b4890` | `tvid_fisher` | 1 |
| `char_RYBAROVA_ZENA_VIDLAK` | Female | `4bb75322-f2ec-dcf0-ac22-c1e1d310fdad` | `tvid_fishersWife` | 1 |
| `char_RYCHTAR_DROZD` | Male | `482a30a6-e506-945c-00f9-29cf10e033b1` | `ttkc_drozd` | 1 |
| `char_RYCHTARUV_SYN` | Male | `94c3e852-853c-4c84-a0e5-8ea5f36d51aa` | `ttkc_bailiffSon` | 1 |
| `char_RYTIR_ARN` | Male | `daf5dccd-7c3a-4dea-8ea5-5724bd30381c` | `poustevnik_arn` | 1 |
| `char_RYTIR_CLESGIN` | Male | `be1e5c5b-68cf-4fe2-af81-aa75b54db110` | `poustevnik_clesgin` | 1 |
| `char_RYTIR_FRIDUS_LOMNICKY` | Male | `1f4f3885-2e02-430d-a361-befe1d683e3b` | `ttro_man_37` | 1 |
| `char_RYTIR_HERMAN_PALECEK_Z_CHLUMU` | Male | `4f1dc00a-acbd-4797-8318-47fd17c5d011` | `ttro_herman` | 1 |
| `char_RYTIR_JAN_PAREZ` | Male | `9ab11aa9-e67d-4b3b-9260-c19689982961` | `ttro_man_41` | 1 |
| `char_RYTIR_JESEK_Z_BORU` | Male | `a9346d5d-dbcb-4b66-8b7d-505e3f0444b3` | `ttro_man_40` | 1 |
| `char_RYTIR_KONRAD` | Male | `115063d3-e145-4a07-8d2e-308c42ce7c12` | `tapo_konrad` | 1 |
| `char_RYTIR_KUNES_Z_BELOVIC` | Male | `ead0d4ec-0373-4220-9b9f-9f3d01f26d7c` | `taboryUCesty_duel_kunes` | 1 |
| `char_RYTIR_NICLAS` | Male | `c016e9a1-d361-4d69-9529-244bba61fdc0` | `poustevnik_niclas` | 1 |
| `char_RYTIR_OLBRAM_Z_UJEZDA` | Male | `30a723d4-3cd1-424a-bede-80dec9d9d82f` | `ttro_man_39` | 1 |
| `char_RYTIR_SEBALD` | Male | `6d614555-f2bc-43ff-87e7-7fcf9ef49952` | `poustevnik_sebald` | 1 |

</details>

<details>
<summary>Named characters: S (96)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_SAMUEL` | Male | `08df910a-a0a0-4ca6-a4fd-dd52cc3eb89a` | `kkut_samuel` | 1 |
| `char_SARA_SAMOVA_MATKA` | Female | `86f27c69-b6f9-49f1-8360-6147b871d9bf` | `kkut_sara` | 1 |
| `char_SARKA` | Female | `880c4738-831f-4760-a8a6-f45d23e2a66d` | `kvrc_sarka` | 1 |
| `char_SARKAN_KUMAN_U36` | Male | `b6d99442-cb47-496d-b525-979ffbc1dc9f` | `kvrc_sarkan` | 1 |
| `char_SEDIVAK_DAMIAN` | Male | `de5a2e3a-2f75-4712-985d-02d0f695f869` | `kkut_man_124` | 1 |
| `char_SEDLAK_BOUREK_SLATEJOV` | Male | `4166b913-6b12-1965-cbb6-509a49250ba6` | `tsla_man_2` | 1 |
| `char_SEDLAK_KUBA` | Male | `476b6695-4ad3-21d8-35df-617d4cd52391` | `kmis_kuba` | 1 |
| `char_SEDLAK_OLBRAM_ZELEJOV` | Male | `4132dcc6-df4d-87f4-94e3-2d2413d159bd` | `tzel_olbram` | 1 |
| `char_SEDLAK_PROCEK_TACHOV` | Male | `427f64fa-1864-5c4d-09bf-c6f12a5210ac` | `ttac_procek` | 1 |
| `char_SEDLAK_SLAVEK_SEMIN` | Male | `45b3ddd4-659b-7ce2-7215-5d5ee5389994` | `tsem_man_17` | 1 |
| `char_SEDLAK_TUMA_HORANY` | Male | `a9de3adb-72b2-4159-8aa9-0ab49b38d913` | `khor_man_1` | 1 |
| `char_SEDLAK_ZVEST` | Male | `4eca2fe6-00bf-0426-7dc6-1906f1ecb89d` | `tzel_zvest` | 1 |
| `char_SEDLECKY_KNEZ` | Male | `4690f1cf-c33e-b343-4d1e-5fbc794f9c99` | `bratriZCimburka_deadBody_3` | 1 |
| `char_SEMIN_JUNIOR` | Male | `473b6137-a2df-ef73-7e4d-46c5835a48bf` | `tsem_seminjr` | 1 |
| `char_SEMINSKY_ZBROJNOS_1` | Male | `494cb310-941d-0caf-ce7f-f575cf1df2b3` | `tsem_man_5` | 1 |
| `char_SEMINSKY_ZBROJNOS_2` | Male | `49286996-fe9e-997d-3ad8-4ba0dd6362b8` | `tsem_man_6` | 1 |
| `char_SEMINSKY_ZBROJNOS_3` | Male | `4aec043b-9e3a-c7e4-1561-25181a159a94` | `tsem_man_7` | 1 |
| `char_SEMINSKY_ZBROJNOS_4` | Male | `400d50c1-0329-a758-252d-8c1187f5f987` | `tsem_man_8` | 1 |
| `char_SEMINSKY_ZBROJNOS_5` | Male | `4b651637-7d70-fd1f-1e54-bdb405c9da92` | `tsem_man_9` | 1 |
| `char_SENKYRKA_1_HOSPODA_DIRA` | Female | `2150cc1f-3876-4e2d-a31e-01e5a2d50880` | `kkut_woman_272` | 1 |
| `char_SENKYRKA_2_HOSPODA_DIRA` | Female | `03320409-2974-41d2-aafb-1aa0bf77b9b0` | `kkut_woman_273` | 1 |
| `char_SENKYRKA_Z_BYLANSKE_HOSPODY_1` | Female | `747e33ad-bb00-4106-a352-dca1359a0abd` | `kbyl_woman_7` | 1 |
| `char_SENKYRKA_Z_BYLANSKE_HOSPODY_2` | Female | `158e74b5-7602-4a18-8e1c-c8931b8d3e4b` | `kbyl_woman_8` | 1 |
| `char_SENKYRKA_Z_HOSPODY_NA_OPRATCE_1` | Female | `7f6112be-701c-4747-8c06-297ad6407448` | `kkut_woman_20` | 1 |
| `char_SENKYRKA_Z_HOSPODY_NA_OPRATCE_2` | Female | `771f7652-528f-4c05-975b-ced2b6925257` | `kkut_woman_21` | 1 |
| `char_SENKYRKA_Z_HOSPODY_NA_OPRATCE_3` | Female | `b7dbd799-7cfd-48b8-b542-8e1754280928` | `kkut_woman_71` | 1 |
| `char_SENKYRKA_Z_HOSPODY_U_CISARE_KARLA_1` | Female | `b6c8386b-a0eb-466c-88ac-16076c961ed2` | `kkut_woman_29` | 1 |
| `char_SENKYRKA_Z_HOSPODY_U_CISARE_KARLA_2` | Female | `2a4d284a-e719-44b4-b62d-152e1721a571` | `kkut_woman_30` | 1 |
| `char_SENKYRKA_Z_HOSPODY_U_CISARE_KARLA_3` | Female | `3192d3e5-bf0d-41f6-a571-bf14e8c7185c` | `kkut_woman_271` | 1 |
| `char_SENKYRKA_Z_HOSPODY_U_SESIVANEJCH_1` | Female | `f5152c55-9609-4ac8-905f-7557abafba55` | `kkut_woman_109` | 1 |
| `char_SENKYRKA_Z_HOSPODY_U_SESIVANEJCH_2` | Female | `731a9d8c-4bc9-4cbf-8386-8ed51e8448e7` | `kkut_woman_110` | 1 |
| `char_SENKYRKA_Z_HOSPODY_U_SVATYCH_1` | Female | `99fcaa46-5377-4e0f-b144-8edc67390103` | `kkut_woman_113` | 1 |
| `char_SENKYRKA_Z_HOSPODY_U_SVATYCH_2` | Female | `2cea5ee6-ab14-401f-87aa-a1754fe4079d` | `kkut_woman_114` | 1 |
| `char_SENKYRKA_Z_HOSPODY_V_CERTOVCE_1` | Female | `d9755d32-bc97-494b-93f5-7f98e38fdc64` | `kcer_woman_2` | 1 |
| `char_SENKYRKA_Z_HOSPODY_V_CERTOVCE_2` | Female | `a3d0f4f6-67e8-4060-8f99-55d4bbebd92b` | `kcer_woman_3` | 1 |
| `char_SENKYRKA_Z_HOSPODY_V_GRUNTE_1` | Female | `90c09d35-acb1-4e86-ad60-88ff8adfaa09` | `kgru_woman_9` | 1 |
| `char_SENKYRKA_Z_HOSPODY_V_GRUNTE_2` | Female | `66fa2276-e484-484e-a6e0-8bda0f2fb25e` | `kgru_woman_11` | 1 |
| `char_SENKYRKA_Z_HOSPODY_V_MISKOVICICH_1` | Female | `4b0975ae-2205-cfb7-9db2-932155ff97ae` | `kmis_woman_2` | 1 |
| `char_SENKYRKA_Z_HOSPODY_V_MISKOVICICH_2` | Female | `4914e8c1-a933-5257-1462-d75c745c15ac` | `kmis_woman_3` | 1 |
| `char_SENKYRKA_Z_HOSPODY_V_PLATNERSKE_1` | Female | `f55308cd-73f6-4a36-aaf5-a7a2744ecaca` | `kkut_woman_224` | 1 |
| `char_SENKYRKA_Z_HOSPODY_V_PLATNERSKE_2` | Female | `b1c5663d-f3eb-47b4-b286-6315d93a213c` | `kkut_woman_225` | 1 |
| `char_SENKYRKA_Z_HOSPODY_V_SUCHDOLI_1` | Female | `e5555d86-50fc-45d0-9e23-8abb6a04415f` | `ksuc_woman_27` | 1 |
| `char_SENKYRKA_Z_HOSPODY_V_SUCHDOLI_2` | Female | `c60b4813-5085-4c7b-9f64-bf60e49df45a` | `ksuc_woman_30` | 1 |
| `char_SENKYRKA_Z_HOSPODY_V_SUCHDOLI_3` | Female | `559b82fa-a38c-4fb6-bd3f-2394f56e8f32` | `ksuc_woman_36` | 1 |
| `char_SENKYRKA_Z_HOSPODY_VE_STARE_KUTNE_1` | Female | `46197242-1b3c-4d32-b421-bf3d32e5cdc1` | `ksta_woman_5` | 1 |
| `char_SENKYRKA_Z_HOSPODY_VE_STARE_KUTNE_2` | Female | `cefa5a0a-1ae3-4e03-90b2-d39ba75e8237` | `ksta_woman_6` | 1 |
| `char_SENKYRKA_Z_MALESOVSKE_HOSPODY_1` | Female | `37a01d8a-8340-472d-a812-1ca5f471f964` | `kmal_woman_4` | 1 |
| `char_SENKYRKA_Z_MALESOVSKE_HOSPODY_2` | Female | `69f12b59-18dd-458a-a488-4c23c3269900` | `kmal_woman_5` | 1 |
| `char_SENKYRKA_Z_PRITOCKE_HOSPODY_1` | Female | `2e2588a9-1e9a-4dec-aef9-a0514bfb820c` | `kpri_woman_12` | 1 |
| `char_SENKYRKA_Z_PRITOCKE_HOSPODY_2` | Female | `0e492478-0d6e-4ad7-bb11-a4e304a4788a` | `kpri_woman_10` | 1 |
| `char_SENKYRKA_Z_PRITOCKE_HOSPODY_3` | Female | `64ca6500-bda7-46f9-be0d-0a0270155897` | `kpri_woman_11` | 1 |
| `char_SENKYRKA_Z_PRITOCKE_HOSPODY_4` | Female | `f77ecaaa-a802-4f3a-bf02-14757fd06cef` | `kpri_woman_13` | 1 |
| `char_SENKYRKA_Z_TROSKOVICKE_HOSPODY` | Female | `416c3b05-4f9a-c77d-91a7-7060da6bf889` | `ttkc_woman_1` | 1 |
| `char_SENKYRKA_Z_ZELEJOVSKE_HOSPODY_1` | Female | `4a95aae0-f752-4bb2-2fb5-2c897d2efcb2` | `tzel_woman_10` | 1 |
| `char_SENKYRKA_Z_ZELEJOVSKE_HOSPODY_2` | Female | `40924ea1-1d40-e575-9c92-f0b3806656aa` | `tzel_woman_11` | 1 |
| `char_SIMEK_TLAMA` | Male | `7c29a20e-112b-4d03-8b09-4fd407781c8d` | `kkut_simek` | 1 |
| `char_SIPAJZ` | Male | `1b132d81-81d5-4547-813f-3bff813a7fbe` | `kkut_prvniSvaty` | 1 |
| `char_SLECHTICUV_SLUHA` | Male | `b8b5eca2-486c-4d81-a07a-5f74aae40f5d` | `sabotazLazni_noblemansValet` | 1 |
| `char_SLUHA_TADEAS` | Male | `4992fce9-ee7b-4d87-9a2f-4d809ebb9c4b` | `kkut_tadeas` | 1 |
| `char_SLUZEBNA_DASA` | Female | `220d3c42-5b21-4d0e-bb66-08ab4aa684d0` | `setkaniVRatbori1_ratiborMaid5` | 1 |
| `char_SLUZEBNA_ELISKA` | Female | `2f2ab937-7ed1-4963-8a3b-9655e669368c` | `setkaniVRatbori1_ratiborMaid2` | 1 |
| `char_SLUZEBNA_ZUZANA_SUCHDOL` | Female | `d1c94f99-50e4-4b8a-9cbd-476436d68719` | `ksuc_woman_16` | 1 |
| `char_SLUZKA_REGINA` | Female | `db0d1d1c-cddc-45d0-a18a-ddf9ed5a7dad` | `ttro_woman_14` | 1 |
| `char_SMIL` | Male | `4f5f11f5-7d19-33b3-262f-48cba00dae83` | `kboh_smil` | 1 |
| `char_SOUKENI_FIFLE` | Male | `8aba829d-c9fa-454e-84e0-953595ba1792` | `kkut_fifle` | 1 |
| `char_SOVKA` | Female | `4708e9d7-9189-8100-699c-0a5580c3d99b` | `kboh_sovka` | 1 |
| `char_SPOLUVEZEN_TROSKY` | Male | `40283a19-5289-ad62-97a8-c727d37b2e94` | `ttro_vezen` | 1 |
| `char_SPRAVCE_VINICE_JERONYM` | Male | `4044df2a-81d7-f128-52c7-92b66e1b8696` | `klor_jeronym` | 1 |
| `char_SPRAVCE_VYBAVY_TROSKY` | Male | `88f31d56-83de-4272-a9ca-c5aa1fcdfd6b` | `ttro_man_69` | 1 |
| `char_SPRAVCOVA_LAZNI` | Female | `2ef99edc-7ddb-4ed1-adff-809f82669e90` | `kkut_innkeeperAdamsBathhouse` | 1 |
| `char_STANDA_MOUCHA` | Male | `6099ee6d-1d4b-4340-bb0d-1c7b91313fcf` | `khor_man_12` | 1 |
| `char_STAREJ_KAMENIK` | Male | `498745e3-da61-4ec8-929e-22ac381b7896` | `ttro_man_57` | 1 |
| `char_STAREJ_VEJMOLA` | Male | `e46aee5f-5ab4-4551-b3b9-0b40d0595ec5` | `kvys_vejmolaOld` | 1 |
| `char_STARESINA_VLADIMIR` | Male | `113af73c-fcce-48cc-b569-56babb8fc59c` | `ksta_vladimir` | 1 |
| `char_STATECNY_CIVIL_NEBAKOV_PRUZKUM` | Male | `c5cb5aad-c749-4fd8-ad93-7d1e57d288a8` | `tneb_man_27` | 1 |
| `char_STATKAR_JAKES` | Male | `4d4699ef-fa37-de5a-20b4-6fc947fc7585` | `ttkc_jakes` | 1 |
| `char_STAVITEL_JAN_PARLER` | Male | `fa0c2d75-4547-4d32-a413-c7750b09246a` | `kkut_jan` | 1 |
| `char_STEPAN_VRANA_PRAZSKY_DESATNIK_ZIKMUNDOVO` | Male | `020cb8b3-a7dd-472b-b515-be23a51a637e` | `kzik_stepan` | 1 |
| `char_STIBOR_ZE_STIBORZYC` | Male | `a602947c-e165-4316-bad3-e8f0e174213c` | `kzik_stibor` | 1 |
| `char_STIKA` | Male | `cbc48944-a010-4850-952c-3a1187ed7c36` | `kcer_brabantSoldier_4` | 1 |
| `char_STISLAV_DOLANY` | Male | `ba54e397-7176-4522-8ae3-0ca290750be5` | `krat_stislav` | 1 |
| `char_STOJA_Z_MONDRY` | Male | `29ee5764-f51a-481e-bdd5-875f59082584` | `ksed_man_3` | 1 |
| `char_STOJAN_MALESOVSKY_VOJAK` | Male | `a15d6366-4c3e-4870-80aa-20b9a5ba5628` | `zachranaPtacka_soldier_11` | 1 |
| `char_STRAZNY_HYNEK` | Male | `4498e7ac-e4f5-034a-e55a-6e1f0710a3ad` | `ttro_man_18` | 1 |
| `char_STRAZNY_JEDLICKA` | Male | `21ad910a-7288-44ca-9bba-fe0a4a240536` | `malovanoJest_guard` | 1 |
| `char_STRAZNY_KROUPA` | Male | `421c5507-c26e-1b41-da85-4857dca45180` | `ttro_man_17` | 1 |
| `char_STRAZNY_MATEJ_ZIKMUNDOVO` | Male | `a69beb14-02e0-46b3-9187-8d640effe3e5` | `zikmunduvTabor_cherthanMurderGuard2` | 1 |
| `char_STRAZNY_PATRIK_ZIKMUNDOVO` | Male | `848f1d59-da20-4428-bcc8-506877099407` | `zikmunduvTabor_cherthanMurderGuard1` | 1 |
| `char_STRELEC_KOLDA` | Male | `94df0a05-ec2c-4ba6-a536-8de5f91e049a` | `taboryUCesty_dice_kolda` | 1 |
| `char_STRELMISTR_BOSONGA_KUMAN` | Male | `910135cc-ab97-4f05-9426-be5359038881` | `kzik_man_50` | 1 |
| `char_STRYC_HREBEJK` | Male | `eaf9caaa-0753-46e1-a10f-f9f2fca04d80` | `ksuc_man_34` | 1 |
| `char_STULEC` | Male | `88c49433-9eca-4502-bb41-9fa542ffe7ff` | `kkut_stulec` | 1 |
| `char_SUCHY_CERT` | Male | `bd672e35-7841-4e0f-be10-4cbaccf16cda` | `kcer_suchyCert` | 1 |
| `char_SUMAR_JOHAN` | Male | `484a1231-7c60-37e5-4a3a-32cadaf4bfba` | `tzel_johan` | 1 |
| `char_SVATAVA` | Female | `ec2cebda-27a4-4415-a269-7ff49871108c` | `kbyl_svatava` | 1 |
| `char_SVEDEK_KUBA_PARALU` | Male | `79daf990-8d2a-45db-8bd0-06966ad04088` | `kubaParalu_witness` | 1 |

</details>

<details>
<summary>Named characters: T (21)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_TABOROVY_HEROLD_ZIKMUNDOVO` | Male | `743feecd-8be6-4ed0-af9b-e8ac4f45cc7b` | `kzik_herold` | 1 |
| `char_TARAS_MURA` | Male | `3e604d1f-cc92-43a8-83bc-383f88b2a65e` | `ksta_taras` | 1 |
| `char_TESAR_MATEJ` | Male | `12499edc-acb7-43f7-9804-207e38dc3440` | `taboryUCesty_duel_carpenter_1` | 1 |
| `char_THOMLIN_BRUTHANS_HORANY` | Male | `420ae6cb-a930-d092-c344-97154273cbb8` | `khor_thomlin` | 1 |
| `char_TIBOR` | Male | `4e12839d-c0bf-96fc-6f72-99959901c984` | `tvez_tibor` | 1 |
| `char_TOMAS_OD_KOLINA` | Male | `d861600e-b48b-4984-a26c-417c3a4bfbf9` | `kzik_tomas` | 1 |
| `char_TONDA_PIVEC` | Male | `b30ad630-1d85-4b2d-b71e-de91f17f34b6` | `kkut_pivec` | 1 |
| `char_TOVARYS_BRUNA` | Male | `0c4a9eee-a963-4748-b88d-bae6adabcb17` | `kkut_man_7` | 1 |
| `char_TOVARYS_CHRUDOS` | Male | `8cd8b097-dfa4-4be0-b365-72c18b449474` | `truhlari_chrudos` | 1 |
| `char_TOVARYS_JANEK` | Male | `4e4ed54e-aa51-0f94-7669-8c0df1840baa` | `tsem_man_2` | 1 |
| `char_TOVARYS_JAROSLAV` | Male | `bac069c0-d61d-4216-8fda-115ce37684f7` | `kkut_man_23` | 1 |
| `char_TOVARYS_STAHLAVA_KUTNA_HORA` | Male | `772746ea-eb04-44dd-a88d-2d45761216f0` | `kkut_man_103` | 1 |
| `char_TOVARYS_VOLEK` | Male | `44459022-87cd-c37d-1122-4983868b42bf` | `tneb_volek` | 1 |
| `char_TRABANT_PESEK` | Male | `98c7479c-48c2-4197-a49d-49a71466b033` | `taboryUCesty_dealer_trabant_1` | 1 |
| `char_TROSECKY_PREVOZNIK` | Male | `0ee7fce1-98c2-4c16-b478-00df2657b5a7` | `ksuc_nomad` | 1 |
| `char_TRUHLAR` | Male | `487c6345-ae63-6e3e-fbc1-4cf271b29c95` | `ttkc_woodworker` | 1 |
| `char_TRUHLAR_TRISKA_KUTNA_HORA` | Male | `90083f0c-e348-4346-a05b-ee72e61b93f9` | `kkut_man_102` | 1 |
| `char_TRUHLARUV_OTEC` | Male | `42679a6e-33ac-9c27-ef2d-5dd19b2af0b6` | `ttkc_woodworkersFather` | 1 |
| `char_TULACKA_BARBORA` | Female | `01649fe6-905a-4ede-9a30-c9f44115da4e` | `ttkc_barbora` | 1 |
| `char_TUPLAK` | Male | `caffeca8-1e52-43ba-a4a8-e70b9439185b` | `kkut_druhySvaty` | 1 |
| `char_TYC_VETTER` | Male | `5a0d7c94-1af0-491b-9951-832ee1993eae` | `kkut_tyc` | 1 |

</details>

<details>
<summary>Named characters: U (4)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_UDO_VON` | Male | `352c2ee2-b911-45cd-91a1-6b75d869413f` | `hledaniLichtenstejna_udo` | 1 |
| `char_ULRICH_VON_ESCHENBACH` | Male | `b19ae6b4-4d58-47fa-a1f8-8c4a82652feb` | `taboryUCesty_duel_ulrich` | 1 |
| `char_ULTIMATE_TIPSTER_WALDEMAR` | Male | `1b3fd9f4-2838-4866-b11e-6425a7ea1632` | `pocestny_waldemar` | 1 |
| `char_URSO_VON_MORGENSTERN` | Male | `683213a7-f31b-4d54-885d-12ad39cfe499` | `kcer_brabantSoldier_1` | 1 |

</details>

<details>
<summary>Named characters: V (58)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_VACLAV_VORSUCHER` | Male | `e621b569-1d08-459d-8821-aa9d13d74bcd` | `kkut_vaclav` | 1 |
| `char_VACLAV_VYROBCE_LUKU_KH` | Male | `3c9b547b-ddf2-4e65-9bf5-39a63e8e23ca` | `kkut_vaclavHolek` | 1 |
| `char_VAJDA` | Male | `4e519b87-09c2-77fc-64dc-02f00b7ae399` | `tvez_vajda` | 1 |
| `char_VALKOUN_MALESOVSKY_VOJAK` | Male | `9ae754dd-7313-4867-9012-9d04556f609a` | `zachranaPtacka_soldier_6` | 1 |
| `char_VANDARK_CHRAMOSTA` | Male | `462b2176-83ba-d089-dec8-a9f838915b9e` | `tvez_chramosta` | 1 |
| `char_VANDRAK_KOPIDLO` | Male | `4275904b-a808-a913-db53-b6c8049fd98a` | `tvez_kopidlo` | 1 |
| `char_VAQUELIN_BRABANT` | Male | `b77185e0-0ec9-4a72-8ae2-048a286cced4` | `krat_baronBrabant` | 1 |
| `char_VASKO` | Male | `4f4c224f-543f-53f0-18fc-df823cff26aa` | `tvez_vasko` | 1 |
| `char_VAVAKOVA_GORILA` | Male | `c9da9c24-30b0-437c-8262-20e3eb8934db` | `zachranaPtacka_vavakHenchman_1` | 1 |
| `char_VAVAKOVA_GORILA_2` | Male | `48b69174-4f88-4b49-a072-3b836bf25691` | `zachranaPtacka_vavakHenchman_2` | 2 |
| `char_VAVAKOVA_GORILA_3` | Male | `82164293-8d26-42c9-8954-4eff42f6ee9a` | `zachranaPtacka_vavakHenchman_3` | 2 |
| `char_VAVAKOVA_GORILA_4` | Male | `104ad83e-1d92-4b5e-a20f-fac34e631aa0` | `zachranaPtacka_vavakHenchman_4` | 2 |
| `char_VAVAKOVA_GORILA_5` | Male | `23f281b7-b4a2-4bbe-be6a-409b42112fa4` | `zachranaPtacka_vavakHenchman_5` | 2 |
| `char_VAZOUN` | Male | `be2f788a-3b68-4721-af6c-ea1ec0dc5292` | `kkut_vazoun` | 1 |
| `char_VDOVA_GERDA` | Female | `9b4e5261-5a89-4119-ae33-8f8589f389c4` | `kkut_gerda` | 1 |
| `char_VDOVA_MARKETA` | Female | `4b842b7d-caeb-cf7f-afc3-83814368698c` | `ttkc_marketa` | 1 |
| `char_VELITEL_DRACIHO_ODDILU` | Male | `4f51a074-12f9-9efb-6a87-c61ae27c15b1` | `drak_zikmund_soldierLeader` | 1 |
| `char_VELITEL_FALESNE_POSADKY_U61A` | Male | `2b1c5e74-07d4-4237-9dcc-17038084ee32` | `ksta_fakeSoldier_1` | 1 |
| `char_VELITEL_KUTNOHORSKYCH_STRAZI` | Male | `c9d41b01-9cdc-4312-9d18-13455067f19c` | `kkut_commander` | 1 |
| `char_VELITEL_MESTSKE_STRAZE` | Male | `b3a7dcc2-70ec-43c4-8bdd-b9e1529c382d` | `traskavePoselstvi_guardCommander` | 1 |
| `char_VELITEL_STRAZE_SEMIN` | Male | `4781f304-0c47-602c-4631-14b0a1c72b98` | `tsem_man_14` | 1 |
| `char_VELITEL_STRAZE_TROSKOVICE` | Male | `489896b0-6a8b-039f-88dc-f395f8b26996` | `ttkc_man_1` | 1 |
| `char_VELKEJ_JARDA` | Male | `4b4f6d6b-5176-42ae-8e66-d56c21def9b7` | `prepadeniNaCeste_jarda` | 1 |
| `char_VENCL_TORWART` | Male | `236c1d82-8776-42b6-897f-5f00ea75b096` | `taboryUCesty_shop_vencl` | 1 |
| `char_VENDULA` | Female | `e4a335ce-3831-4b7b-a3d2-16095c641f58` | `kbyl_vendula` | 1 |
| `char_VENEFICUS` | Male | `9f39c982-3e9d-4780-bec4-daf8e7736600` | `kkut_man_13` | 1 |
| `char_VEPR` | Male | `197da49f-dd7a-4482-a40e-6628a4dba452` | `kkut_vepr` | 1 |
| `char_VESELA_ELISKA` | Female | `0cd92a2f-a7da-49d0-b847-45589606de95` | `kgru_bathmaid_3` | 1 |
| `char_VIKTORKA` | Female | `4211e34f-d02e-1a7c-5624-23764483fdae` | `kmis_viktorka` | 1 |
| `char_VILEM_DOSKAR` | Male | `400450c4-9f4a-44be-853a-1f473206b473` | `kutnohorskyTurnaj_fighter1vilem` | 1 |
| `char_VILEM_Z_NEBAKOVA` | Male | `4dd5b312-4eca-cd91-0494-588996ff279e` | `tneb_nebak` | 1 |
| `char_VITEK` | Male | `4a62168b-c608-ccbc-6caa-6da7b73e84b5` | `kboh_vitek_lazar` | 1 |
| `char_VITEK_SYN_LOVCIHO_VOSTATKA` | Male | `44832c5a-a851-55d8-67dc-39214faeeb88` | `tvid_huntsmansSon` | 1 |
| `char_VLADENA_ZE_SEMINA` | Female | `4c029b69-2ebb-b1ec-a664-d934571d8a8d` | `tsem_woman_4` | 1 |
| `char_VOJAK_ONDREJ_BERANI_HLAVA_BANDA` | Male | `43f36220-ff25-5147-043a-6888651db4a5` | `hromovyKamen_bandit_1` | 1 |
| `char_VOJAK_ONDREJ_BERANI_HLAVA_BANDA_2` | Male | `458dd2a9-209e-9eeb-1e1e-d47b26c728bb` | `hromovyKamen_bandit_2` | 1 |
| `char_VOJAK_Z_TABORA_1` | Male | `2537289f-159a-42f9-96e5-109f0bd2e21e` | `traskavePoselstvi_zikmundSoldier_1` | 1 |
| `char_VOJAK_Z_TABORA_2` | Male | `1b134b35-9775-4e82-95ca-b122ee54e2e7` | `traskavePoselstvi_zikmundSoldier_2` | 1 |
| `char_VOJKA_TACHOV` | Female | `4d8051eb-3c39-14e8-27b2-c1e543310e89` | `ttac_vojka` | 1 |
| `char_VOJTA_Z_ZELEJOVA` | Male | `43c4a163-f4e2-6b83-cce7-c07e1added88` | `zlatyMedailon_vojta` | 1 |
| `char_VOKO_SCHMIDT` | Male | `736090a9-f18d-4d06-a23d-99f57c51835c` | `taboryUCesty_archery_voko` | 1 |
| `char_VOLF` | Male | `aee6bc92-c879-4060-9828-865e8bc651a1` | `kkut_man_258` | 1 |
| `char_VORSILKA` | Female | `072e12b0-f60d-4b4a-b394-ad9d4a01c0e0` | `kvys_vorsila` | 1 |
| `char_VOZKA_MACEK` | Male | `92260822-f95c-4623-9dab-845421122171` | `budovaniLazni_macek` | 1 |
| `char_VOZKA_SUCHDOL` | Male | `c6ccbf93-7082-4c92-b94a-d0616402faf5` | `erik_vozka` | 1 |
| `char_VRAH` | Male | `ebc42164-e4ab-4817-a28c-ee6b528492df` | `kubaParalu_murderer` | 1 |
| `char_VRAH_BARNABAS` | Male | `c3c05829-4efe-4d83-ac6b-2017e0bda728` | `tkop_vrah` | 1 |
| `char_VRBA` | Male | `411b6fcc-a9fb-256a-0c2e-66bb744c009d` | `kboh_vrba` | 1 |
| `char_VSIVA_MARI` | Female | `393c931a-a950-4210-bd19-fe14b2a427d5` | `kkut_vsivaMari` | 1 |
| `char_VUDCE_DEZERTERU_MALIRUV_LEK` | Male | `a8f6a250-3533-42e6-bd31-ded342843fa8` | `kvrc_deserterLeader` | 1 |
| `char_VUDCE_LAPKU_TRUHLARI` | Male | `7dfecf1b-7b78-4fff-94a7-766035056263` | `kvrc_velitelLapku` | 1 |
| `char_VUDCE_LAPKU_U49_MAPA_K_POKLADU` | Male | `fb4125fb-b8f4-4e8d-951d-e31179c5c10d` | `klor_treasureHunter_1` | 1 |
| `char_VUJTEK` | Male | `4aa9ba44-8a8f-e97e-df62-e9c9f04f68ab` | `ttkc_man_19` | 1 |
| `char_VYBERCI_CLA` | Male | `7bc28937-bc5e-4d7f-bdba-8bc0546775fc` | `kkut_extras_man_67` | 1 |
| `char_VYDERAC_DRUHY` | Male | `857b2b02-35e9-4081-b75c-434fc7b4d7c2` | `baladaZHadru_fighter_2` | 1 |
| `char_VYDERAC_PRVNI` | Male | `b12f6ebe-9a12-4b7e-9545-d7eb22e0571a` | `baladaZHadru_fighter_1` | 1 |
| `char_VYHAZOVAC` | Male | `cc81cd94-aa53-4bf7-9319-ddf36684bd40` | `rvacka_bouncer_1` | 1 |
| `char_VYHAZOVAC_2` | Male | `b2a54ae2-3943-473e-83d7-9fb6861e6630` | `rvacka_bouncer_2` | 1 |

</details>

<details>
<summary>Named characters: W (2)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_WALT_VON_KURZBACH` | Male | `259d20cb-cc00-4419-b261-b250fd399be0` | `taboryUCesty_archery_kurzbach` | 1 |
| `char_WILHELM` | Male | `159bde8a-af70-439b-93fb-341bfc433a9f` | `kkut_man_212` | 1 |

</details>

<details>
<summary>Named characters: Z (38)</summary>

| Look | Body | Soul GUID | One soul with it | Souls |
| --- | --- | --- | --- | --- |
| `char_ZACHARIAS` | Male | `cc300929-14cf-4bc2-bed2-fb5f1a29dbc5` | `taboryUCesty_dice_zacharias` | 1 |
| `char_ZACHARIASUV_MUZ_1` | Male | `f4fa9f4e-caa5-4e2b-8b93-d523860790eb` | `predaniVChramu_krypta_zachariasuvMuz1` | 1 |
| `char_ZACHARIASUV_MUZ_2` | Male | `ae751669-a8db-483d-8384-5ef30fa95b6f` | `predaniVChramu_krypta_zachariasuvMuz2` | 1 |
| `char_ZACHARIASUV_MUZ_3` | Male | `52399f33-9d42-4ca7-8424-4f2328587f8b` | `predaniVChramu_krypta_zachariasuvMuz3` | 1 |
| `char_ZACHARIASUV_MUZ_4` | Male | `89f11411-3b19-4d48-a3ba-e4e48357e7aa` | `predaniVChramu_krypta_zachariasuvMuz4` | 1 |
| `char_ZACHARIASUV_MUZ_5` | Male | `c8a46740-36f6-4b60-acaf-bf62de514108` | `predaniVChramu_krypta_zachariasuvMuz5` | 2 |
| `char_ZAHRADNIK_TUREK` | Male | `81ffe926-34b7-4599-bd78-39e2fff9ca18` | `kkut_gardener_1` | 1 |
| `char_ZAJATEC_TROSKY` | Male | `48794812-df07-df58-ba05-372f8d9cfea5` | `ttro_zajatec` | 1 |
| `char_ZAJIC` | Male | `11dd5610-423d-43b6-8ba8-9bded7530397` | `kgru_zajic` | 1 |
| `char_ZAVIS_CERNY_Z_GARBOWA` | Male | `574d8067-93d5-4024-a85d-ee939be173c0` | `kzik_zavis` | 1 |
| `char_ZBROJNOS_KONRAD` | Male | `4aefc5a3-6fa4-81bd-a4bf-c241e4c0c4bd` | `prepadeni_konrad` | 1 |
| `char_ZBROJNOS_MIKULAS` | Male | `4f34f524-d0e0-a50d-f092-501b4268f0a1` | `prepadeni_mikulas` | 1 |
| `char_ZBROJNOS_PIVEC` | Male | `0275af43-5e71-4e44-8e3c-b9a39ca4cb39` | `prepadeni_pivec` | 1 |
| `char_ZBROJNOS_VOVES` | Male | `435131c6-bd53-4807-5ad1-ed2008fb67b0` | `prepadeni_voves` | 1 |
| `char_ZDENEK_HUBA_PACHOLEK_HOSPODA_TACHOV` | Male | `4d4ba292-0573-4524-eb34-81364e67a3b2` | `ttac_man_1` | 1 |
| `char_ZDENEK_OD_BRANY` | Male | `0bd93e0d-c0bc-4c49-9fe2-2ea3925f2aa8` | `kutnohorskyTurnaj_fighter2zdenek` | 1 |
| `char_ZDIMIR_GRUNTA` | Male | `3335443d-0ad6-489e-ab1a-7275935b55bc` | `kgru_zdimir` | 1 |
| `char_ZDISLAV_ZELEZNAK` | Male | `7228d987-8d0b-428e-b5fd-0595944c9710` | `kkut_zdislav` | 1 |
| `char_ZEBRAK_KOZINA` | Male | `2270ce34-f4e9-4271-9c12-c1b64f5d0cb0` | `hledaniLichtenstejna_kozina` | 1 |
| `char_ZEBRAVY_MNICH_OD_PLESNIVCE` | Male | `7ff7c12e-9b49-4c2b-a21c-5cc7a54dd3e6` | `taboryLapkuTrosecko_lapka_4` | 1 |
| `char_ZELENY_VENDELIN` | Male | `2c596199-317f-459a-b3b4-d6b93feb5e41` | `kutnohorskyTurnaj_fighter1vendelin` | 1 |
| `char_ZELINAR_VAJSAR_ZE_SLATEJOVA` | Male | `4036d624-ebac-af18-52f4-5b1f188b3694` | `tsla_vajsar` | 1 |
| `char_ZEMAN_BEDRICH` | Male | `e53a59e2-cfd0-4ec7-b3e9-d9ab88a1c8a4` | `taboryUCesty_dice_bedrich` | 1 |
| `char_ZENA_REZNIKA_Z_PRITOK` | Female | `fc9110fb-764d-4f29-b6c1-c0b2decdf211` | `kpri_butchersWife` | 1 |
| `char_ZID_JACOB` | Male | `4e866ba0-426c-4ec9-ae95-589f05f9aeaa` | `taboryUCesty_shop_jacob` | 1 |
| `char_ZIDOVKA_RACHEL` | Female | `370a4759-16e3-433f-80f8-b5dedec0f04c` | `taboryUCesty_dealer_ibrahim_woman_1` | 1 |
| `char_ZIKMUND_LUCEMBURSKY` | Male | `2387b134-6562-4bf7-a032-668b8c3abfbd` | `kkut_zikmund` | 1 |
| `char_ZINK_Z_PODSEMINA` | Male | `4ae525ca-6f90-4cf7-7eb0-de1de9963992` | `tpod_zink` | 1 |
| `char_ZLATKA_ZENA_LOVCIHO_VOSTATKA` | Female | `450982d2-6c98-69bb-02ac-96026f8cbcbc` | `tvid_huntsmansWife` | 1 |
| `char_ZLODEJ_ZELI` | Male | `7e3f1c6b-bb08-4b07-8c8d-088980451373` | `tpod_cabbageStealerPOI_1` | 1 |
| `char_ZLOUNUV_VRAHOUN_1` | Male | `0c85f381-84d6-412e-9d5a-b9c65ae6f701` | `listovniTajemstvi_bandit_1` | 1 |
| `char_ZLOUNUV_VRAHOUN_2` | Male | `1636e220-f8dc-436d-bc97-e80aedbcdeda` | `listovniTajemstvi_bandit_2` | 1 |
| `char_ZLOUNUV_VRAHOUN_3` | Male | `05ba464a-4d2f-4798-9967-0fbe40ee7de1` | `listovniTajemstvi_bandit_3` | 1 |
| `char_ZLY_ALCHYMISTA_RABSTEJNKA` | Male | `19ab5837-fea9-49a4-9818-71201fc7d1e9` | `krab_man_21` | 1 |
| `char_ZMETENY_JACHYM` | Male | `8e1aa550-14e1-42cf-b7d9-d08c6fc024fa` | `pocestny_mistakenNPC` | 1 |
| `char_ZOLDNER_CUMPLECH` | Male | `0e237d54-d6ab-4a35-ae08-f06843bd4c0d` | `taboryUCesty_archery_cumplech` | 1 |
| `char_ZRANENY_LAPKA_ONDREJ` | Male | `803a0fb5-2131-483e-96c5-124bfef78384` | `mrtviNemluvi_woundedBandit` | 1 |
| `char_ZRANENY_LOJZA` | Male | `46dfb166-be81-ec6b-ee96-8131faa893b5` | `kmis_injured` | 1 |

</details>

<!-- /generated:named -->

## Dog souls

`animal_dog` is the generic dog `Dog.spawn` uses when you pass no soul.

<!-- generated:dogs -->

<details>
<summary>All 156 dog souls</summary>

| Soul | Soul GUID | Character |
| --- | --- | --- |
| `animal_dog` | `fcfe02fe-7fcf-4919-b00e-193f5006dde7` |  |
| `Dog1` | `a579ca13-c0d6-4f2e-9cd9-5f9c6e2f1b8f` |  |
| `Dog13` | `0f56afe9-8b65-445a-8e71-2d84903b6874` |  |
| `hladAZmar_strayDog` | `ca233c99-1edf-4379-8bf4-5339ad111c00` | `char_TOULAVY_PES` |
| `hledaniPsa_wildDog` | `422239bc-5884-ad87-a231-4bfbf4152dbf` |  |
| `kboh_dog_1` | `3fa2a9ff-b56d-4262-838f-99d4fcf3b525` |  |
| `kbyl_dog_1` | `9020f173-47c6-49f3-8e2a-98cd412dd7b8` |  |
| `kgru_dog_1` | `2ae2cc61-f02c-4aaf-8f94-4f2ec170a631` |  |
| `kgru_dog_3` | `df6a79d8-3c07-451c-8156-8b32596b6c38` |  |
| `khor_dog_1` | `100371e2-de37-4817-bb16-a20b96a9f5ae` |  |
| `khor_dog_2` | `f0f65a28-7839-4f17-b697-a10cf8408794` |  |
| `kkut_dog_1` | `63dc05a5-3363-43d5-9936-1219bd235c89` |  |
| `kkut_dog_10` | `7b8a7eb7-af4f-4643-a348-fdff5eb281f1` |  |
| `kkut_dog_11` | `d5c49dd3-cce8-4bdf-b2ab-dd9dba5dc722` |  |
| `kkut_dog_12` | `ec5d3f6b-9dfa-49aa-b85f-bfd1342b426d` |  |
| `kkut_dog_13` | `14851ee8-47e5-4cc0-acd1-74aeab2fc88d` |  |
| `kkut_dog_14` | `6dd9cccf-61b7-4e49-83c1-35d3c3a72e12` |  |
| `kkut_dog_15` | `7fcb9cc9-98a3-4622-8e5b-61ace4f0a7b9` |  |
| `kkut_dog_16` | `187299f3-aff3-4dcd-a53d-bcc6cd5ddfc7` |  |
| `kkut_dog_17` | `a2436884-059d-4bb2-b19f-742f96c150b7` |  |
| `kkut_dog_18` | `e2ff89c0-91a2-4f52-a76d-51805c166209` |  |
| `kkut_dog_2` | `d7ac587e-7523-4009-accb-a9e17a99c7c4` |  |
| `kkut_dog_6` | `def4359a-b72e-4efe-ad16-19daaaa5a084` |  |
| `kkut_dogChmelna_1` | `00e0e1d0-6c3f-47f5-a23b-8f00cbce5e9c` |  |
| `kkut_dogChmelna_2` | `c411721f-1c21-4641-919c-8ca8ca343f05` |  |
| `kkut_dogGardener_1` | `28188bef-3e8e-43b4-861d-97ca2d5126ee` | `char_PES_TUREK` |
| `kkut_dogVlasska_1` | `200cd7c1-eefa-4e39-b164-532acc359936` |  |
| `klor_dog_1` | `fe1f258b-5f31-4933-8390-55c6e0c068b4` |  |
| `klor_dog_2` | `878fb093-0329-45de-bb83-12fb75df5c4d` |  |
| `klor_dog_3` | `bc16aab6-bade-4346-9e3f-fd5c74e3cea3` |  |
| `klor_dog_4` | `fafdea6c-f5ea-451e-8835-0101e5d1d7f9` |  |
| `kmal_dog_1` | `5fc19dd6-1de2-4b55-90c9-476be2b3d53c` |  |
| `kmal_dog_2` | `87488a3f-4e7d-4531-b620-fa4503fe5161` |  |
| `kmal_dog_3` | `b47bc35a-e08d-4a4e-b269-3f4aed43e176` |  |
| `kmal_dog_4` | `914dd53a-949d-4c4d-b991-12070dc762d6` |  |
| `kmez_wildD` | `0d6297ae-40e8-4d2b-9182-8da6503b9f91` |  |
| `kmez_wildDog_5` | `a235da13-2009-4b6e-9bbe-96fd8bcff383` |  |
| `kmez_wildDog_6` | `71ed820c-0653-461e-b033-a267e3960bae` |  |
| `kmez_wildDog_7` | `741a7497-0238-43bc-9396-c0e04cb240f0` |  |
| `kmis_dog_1` | `450a01c6-70e4-41fb-93a7-a04b890e5c98` |  |
| `kmis_dog_2` | `24923f3a-e4b9-48cb-97c5-ba409ad057d4` |  |
| `kmis_dog_3` | `656f5022-0c71-4830-a97f-c56c02d787db` |  |
| `knab_dog_1` | `f23b7c78-9d72-4c97-8e68-9b734455eef7` |  |
| `kopa_dog_1` | `0772432a-186b-4544-9376-b6f7fb5da975` |  |
| `korenarka_dog` | `84e7d778-fe5f-44d9-9293-1e3c4e6da025` | `char_PES_KORENARKY_BOZENY` |
| `korenarkaZachrana_oldrichDog` | `a99f4e45-fa17-4e88-83e9-461e88c6ff7a` | `char_OLDRICHUV_PES_CHLUP` |
| `kpri_dog_1` | `33f86737-77c2-486c-8d5c-ab4f33dbb522` |  |
| `kpri_dog_2` | `f579aaf1-417f-4691-b126-1336f34c5111` |  |
| `kpri_dog_3` | `b8f7ae16-1f4c-4504-b3a8-6de227acdc01` |  |
| `krab_huntsmanDog_npc_2` | `063046e2-c9e6-4efa-959c-905237eef111` |  |
| `krat_dog_1` | `4a88ec63-e385-4ef8-a8a9-550eb78469e7` |  |
| `krat_dog_2` | `1c03fe1f-2a29-4240-8296-7c5f7e3f01d1` |  |
| `krat_dog_3` | `240ad05a-154c-4932-957e-e7300e3ad934` |  |
| `ksta_dog_1` | `70926e26-cb61-4d1d-8d46-39ccedd0396f` |  |
| `ksuc_dog_1` | `79d78437-a8d2-4225-863c-e59689ff7cda` |  |
| `ksuc_dog_2` | `c1af37c9-d8f7-4f38-aa9f-84792c85c4e4` |  |
| `ksuc_dog_3` | `afcac943-faed-4375-9f30-745600a7a856` |  |
| `ksuc_dog_4` | `0574f2e1-32de-471d-9ba4-58898ae654f9` |  |
| `ksuc_dog_5` | `e2662afd-0d16-453f-b832-17f2409d5a91` |  |
| `ksuc_dog_6` | `cbffe7cc-a630-46eb-bf99-cda7d8d7d1d9` |  |
| `kumaniNaTrosecku_dogInForest` | `739121ea-1303-4483-b6e1-41212835d7f4` | `char_PODIVNY_PES` |
| `kvlc_dog_1` | `368715fe-679e-452e-af4f-ed876f9d5d04` |  |
| `kvrc_dog_1` | `ec044402-642c-4464-aece-5493acdce7d3` |  |
| `kvrc_dog_2` | `2251e8ab-4f07-4511-ae8c-22c630b0f088` |  |
| `kvys_dog_1` | `ef2dd719-1a85-473e-97ef-3008e41a90b7` |  |
| `kvys_dog_2` | `ace4efba-d675-4d03-bf9b-7594f5b3328e` |  |
| `kvys_dog_3` | `c48ebe10-00e3-41c9-925b-a1ebf3c6cee4` |  |
| `kvys_dog_4` | `fd6e8b46-b1a7-4d9e-9e92-815e110a8573` |  |
| `kzik_dog_4` | `0139eee0-0fe4-474a-baeb-92be36b2dfd9` |  |
| `kzik_dog1` | `39ccdcb1-47b8-42a6-8a08-aaa7fe7438ff` |  |
| `kzik_dog2` | `71f85966-a3e5-4a69-879a-b8f8b3e80063` |  |
| `kzik_dog3` | `2ea8ddcd-fac7-4747-b31b-7e71dc25cb56` |  |
| `kzik_zavisDog_1` | `0f84340a-842f-4108-8d0c-52c6303bf796` | `char_ZAVISUV_PES_ZIKMUNDOVO` |
| `nalezeniDelnici_dog` | `736b82a0-aec5-40c8-9bcb-fa093db832db` |  |
| `papezskyLegat_wildDog` | `efee3fed-b4ef-457f-82e1-75e257f51302` |  |
| `rasuvUcen_dog` | `baa1419f-c014-4e79-b1c6-0548a65e67d8` | `char_PES_CISAR` |
| `setkaniVRatbori1_Dog1` | `3b8253c7-14f5-4c5b-9c80-5fca35f1c9b8` | `char_PES` |
| `setkaniVRatbori1_Dog2` | `e14ccf2b-4957-40d7-b3df-10bd67a21aee` | `char_PES` |
| `tapo_dog_1` | `c16da5cf-3a03-417b-90b9-5a6c4ebdb853` |  |
| `tbuk_dog_1` | `fe46c034-3fd6-4208-b513-b66c6c155601` |  |
| `test_animal_dog` | `4cb7821b-0a0b-4b49-77bd-0fbf475670b6` |  |
| `test_animal_dog_2` | `de068b88-6bba-4d85-8077-069b8de39e25` |  |
| `test_crime_dog_1` | `6d642ae2-0004-4a99-b717-56266daa5a7e` |  |
| `test_kkut_animalPerformanceDog_npc_1` | `c064932a-1124-4076-ba26-5810eeb1ce5b` |  |
| `test_kkut_animalPerformanceDog_npc_10` | `99a37e11-1c40-4ed4-a2dc-90308b8bf7d0` |  |
| `test_kkut_animalPerformanceDog_npc_11` | `bd0fd7f6-b022-4f6a-bbff-970d11335fdf` |  |
| `test_kkut_animalPerformanceDog_npc_12` | `e5a2fd23-464d-40ec-b392-2b421998ef8a` |  |
| `test_kkut_animalPerformanceDog_npc_13` | `33f6593e-7eb0-4abd-94e2-04e916dbd0cb` |  |
| `test_kkut_animalPerformanceDog_npc_14` | `1c810cdc-b670-4b6b-9790-74fd40a54906` |  |
| `test_kkut_animalPerformanceDog_npc_15` | `ad28834d-12fa-4030-99e8-dbbb2293c2ae` |  |
| `test_kkut_animalPerformanceDog_npc_16` | `be210961-3677-4c4a-ae80-4476669f1dad` |  |
| `test_kkut_animalPerformanceDog_npc_17` | `5d259327-de5a-4543-b013-7ac9b0ef3aaf` |  |
| `test_kkut_animalPerformanceDog_npc_18` | `8fe1b147-0474-4480-b160-ca9504a1e272` |  |
| `test_kkut_animalPerformanceDog_npc_19` | `9ee5b0a2-d70f-4dcc-bd86-669f9272c1a0` |  |
| `test_kkut_animalPerformanceDog_npc_20` | `7b8c25f4-e947-4163-baad-8ea3b20236ec` |  |
| `test_kkut_animalPerformanceDog_npc_21` | `2044055b-02b3-451b-8c3b-ac6ec9f78268` |  |
| `test_kkut_animalPerformanceDog_npc_22` | `8424aede-b4ae-489f-b192-d800cf902dac` |  |
| `test_kkut_animalPerformanceDog_npc_23` | `0faa9d67-018f-4b00-a696-79e7309dcdc0` |  |
| `test_kkut_animalPerformanceDog_npc_24` | `d3340375-e3c8-454c-8057-f341d60e27d8` |  |
| `test_kkut_animalPerformanceDog_npc_25` | `6ee72ebf-1a29-4a58-aa1b-27c6d90b1b08` |  |
| `test_kkut_animalPerformanceDog_npc_3` | `f9066fd5-87be-4c7d-abd0-aada7b5f47f2` |  |
| `test_kkut_animalPerformanceDog_npc_4` | `c037fd50-caa6-4069-bdc6-fba0557d9ae0` |  |
| `test_kkut_animalPerformanceDog_npc_5` | `5dc0025f-296f-47cc-98d5-fdc1f18b32ce` |  |
| `test_kkut_animalPerformanceDog_npc_6` | `0164ba92-ddde-46dc-a4ed-bdc687cb422b` |  |
| `test_kkut_animalPerformanceDog_npc_7` | `ff605240-c5f7-45af-9304-d741de88b1e5` |  |
| `test_kkut_animalPerformanceDog_npc_8` | `e65c45ed-3f0b-41d2-8299-ccd566ebc5be` |  |
| `test_kkut_animalPerformanceDog_npc_9` | `52a05253-3c85-4c24-a20e-498816ba042c` |  |
| `test_performanceAnimal_dog_1` | `afabca16-a73f-431e-893f-a825c042574b` |  |
| `test_performanceAnimal_dog_10` | `74b5b564-50b6-4a8f-8eb2-bd1cbe09ba6f` |  |
| `test_performanceAnimal_dog_11` | `f381aed9-6ae7-4d60-9fa8-054e81150e66` |  |
| `test_performanceAnimal_dog_12` | `5faf4514-7c35-4d39-ac04-650b52a59cfe` |  |
| `test_performanceAnimal_dog_13` | `1f055b40-1dae-451f-ab71-baaf9a7d1808` |  |
| `test_performanceAnimal_dog_14` | `40542446-a249-4853-bbfd-1556dd3593e2` |  |
| `test_performanceAnimal_dog_15` | `9ca25a11-7f59-4e53-8e49-a61063232585` |  |
| `test_performanceAnimal_dog_3` | `a0cc287a-0629-4ac3-ab5e-1feff07a2984` |  |
| `test_performanceAnimal_dog_4` | `50674a1d-b4f5-4bc1-874a-99c283cb7ac8` |  |
| `test_performanceAnimal_dog_5` | `e84a4dbd-df37-4537-b31b-ab8f826c0a17` |  |
| `test_performanceAnimal_dog_6` | `1667a7fa-629b-4f52-a589-71ed5d4a262b` |  |
| `test_performanceAnimal_dog_7` | `b619495b-5e2f-42a7-b490-5855527eec90` |  |
| `test_performanceAnimal_dog_8` | `e85a2dcc-a62e-46ac-ba53-c3268ec12fc5` |  |
| `test_performanceAnimal_dog_9` | `c00a0131-8f57-4af1-8173-00899744ac30` |  |
| `tkop_dog_1` | `241dd8af-0a12-4e96-8e86-88afa006a678` |  |
| `tneb_hejkalsDog` | `5addd732-5a7e-4ddb-9fbe-bc5eedf167b4` | `char_PES_KOPRETINKA` |
| `tneb_kuba_dog` | `2b05302b-74ed-420c-8991-8432fcb0918f` |  |
| `tpod_dog_1` | `3d14fb20-dfad-4b6f-b28b-e0f9398e8e08` |  |
| `tpod_dog_2` | `2a2d9d8a-cd37-45c2-9e3f-8d604a8db522` |  |
| `tpod_dog_3` | `61e0b904-3cc9-433c-8c5f-8614067dc8b4` |  |
| `tpod_dog_4` | `c8d28642-8275-406f-82a7-003597be128a` |  |
| `tsem_dog_1` | `5086dd70-2a5a-45fa-ae77-d1b641159ab1` |  |
| `tsem_dog_2` | `bfb9b4d5-acbd-457e-b179-4dfe57fff77d` |  |
| `tsem_dog_3` | `ad8c808f-2a30-48fb-98fd-3ed3e57ed7cc` |  |
| `tsem_dog_5` | `7d922049-a9be-4344-b383-fb79503ab45d` |  |
| `ttac_dog_1` | `b007c026-b61f-4eb8-bbb9-a8ecdca1c355` |  |
| `ttac_dog_2` | `182a8126-66cd-4a39-bb14-18097a9049d6` |  |
| `ttac_dog_3` | `6b6386bf-37a2-4287-aca1-adcd19728ac2` |  |
| `ttac_dog_4` | `a54a3ea0-2fec-4770-8269-1aedd3b2d85a` |  |
| `ttkc_dog_1` | `8c1fb53f-5507-4d47-afe5-0122e7b30af3` |  |
| `ttkc_dog_2` | `187b58c7-e5ec-4307-9a78-743c584c9427` |  |
| `ttkc_dog_3` | `52a87070-1f35-44f1-8181-d51f3c3c5c40` |  |
| `ttkc_dog_4` | `b4e71208-e91f-46fe-a298-2f4bdcf2a77a` |  |
| `ttkc_dog_5` | `42eea1c3-432e-453e-98fb-8fd492203710` |  |
| `ttro_dog_1` | `da06a8e8-777a-45f0-a763-9d16a2cc4892` |  |
| `tvez_vorech` | `44a28861-719d-9fed-e3dd-b20c479e8781` | `667` |
| `tvid_dog_1` | `ee01d728-1534-48bd-81ab-503404d69dc6` |  |
| `tvid_dog_2` | `6140cfd6-948f-4783-8699-184667dd82c5` |  |
| `tzda_dog_1` | `41fa0b74-2fb7-406d-ad10-022cadea024a` |  |
| `tzda_dog_4` | `7d196af5-dfe7-49fd-b15c-d944b014fcf4` |  |
| `tzda_dog_5` | `db648646-24e5-4a68-8df5-2d1cebc3c669` |  |
| `tzel_dog_1` | `6152fa40-dc96-4e65-ba40-0d3752b728be` |  |
| `tzel_dog_2` | `f81a28c7-0c8a-498f-9557-899e7cf77380` |  |
| `vezniNaTroskach_tapo_dog_1` | `daaf3f22-96b5-4ac0-81e2-86b629281c32` |  |
| `vezniNaTroskach_tapo_dog_2` | `9cf68382-49ca-4fe5-a6ea-2bf81e38fa1e` |  |
| `vezniNaTroskach_tapo_dog_3` | `8369dfc5-5462-420f-9a06-12ed7bbe200d` |  |
| `vezniNaTroskach_tapo_dog_4` | `ea486b50-7239-4277-af05-eb93d11df6fb` |  |
| `zachranaPtacka_dog` | `c26c22c6-0c57-4288-922f-cc73a9393044` |  |
| `zachranaPtacka_slaughteredDog` | `c2c77061-2d86-465a-aeba-f103e47331a6` |  |

</details>

<!-- /generated:dogs -->
