---
title: Faces, hairstyles and skins
description: Every face, hairstyle and skin the appearance catalog carries, for each gender, grouped the way the game derives them.
sidebar:
  label: Faces, hair and skins
  order: 111
---

These are the names [`player.setAppearance`](../../reference/server/classes/Player.md#setappearance)
and `Npc.create({ appearance })` take for `head`, `hair` and `body`. Beards have their own page,
because each one only fits certain faces: see [Beards](../beards/).

```ts
player.setAppearance({ gender: "male", head: "m_head_000", hair: "x_hair_01" });
const femaleHair = Appearances.options("hair", "female").map((option) => option.name);
```

Names are grouped by the node they derive from. A group is a style, and the other names in it
are the same style recoloured or reshaped. The group's own name is selectable too. A name only
works with the gender it is listed under. See [Player appearance](../../players/appearance/)
for how to apply them.

## Faces (`head`)

<!-- generated:heads -->

<details>
<summary>Male: 212 options</summary>

| Group | Names |
| --- | --- |
| `henry` | `henry`, `henry_b00`, `henry_injured` |
| `m_head_000` | `m_head_000`, `m_head_000_b00` |
| `m_head_001` | `m_head_001`, `m_head_001_b00` |
| `m_head_002` | `m_head_002`, `m_head_002_b00` |
| `m_head_003` | `m_head_003`, `m_head_003_b00` |
| `m_head_004` | `m_head_004`, `m_head_004_b00` |
| `m_head_005` | `m_head_005`, `m_head_005_b00` |
| `m_head_006` | `m_head_006`, `m_head_006_b00` |
| `m_head_008` | `m_head_008`, `m_head_008_b00`, `m_head_pavel_bruised` |
| `m_head_010` | `m_head_010`, `m_head_010_b00` |
| `m_head_011` | `m_head_011`, `m_head_011_b00` |
| `m_head_012` | `m_head_012`, `m_head_012_b00`, `m_head_jezek_bruised` |
| `m_head_013` | `m_head_013`, `m_head_013_b00` |
| `m_head_016` | `m_head_016`, `m_head_016_b00` |
| `m_head_017` | `m_head_017`, `m_head_017_b00` |
| `m_head_018` | `m_head_018`, `m_head_018_b00` |
| `m_head_019` | `m_head_019`, `m_head_019_b00` |
| `m_head_020` | `m_head_020`, `m_head_020_b00` |
| `m_head_022` | `m_head_022`, `m_head_022_b00` |
| `m_head_024` | `m_head_024`, `m_head_024_b00` |
| `m_head_025` | `m_head_025`, `m_head_025_b00` |
| `m_head_026` | `m_head_026`, `m_head_026_b00` |
| `m_head_027` | `m_head_027`, `m_head_027_b00` |
| `m_head_028` | `m_head_028`, `m_head_028_b00` |
| `m_head_029` | `m_head_029`, `m_head_029_b00` |
| `m_head_030` | `m_head_030`, `m_head_030_b00` |
| `m_head_031` | `m_head_031`, `m_head_031_b00` |
| `m_head_032` | `m_head_032`, `m_head_032_b00` |
| `m_head_033` | `m_head_033`, `m_head_033_b00` |
| `m_head_034` | `m_head_034`, `m_head_034_b00`, `m_head_drowner` |
| `m_head_035` | `m_head_035`, `m_head_035_b00` |
| `m_head_036` | `m_head_036`, `m_head_036_b00` |
| `m_head_037` | `m_head_037`, `m_head_037_b00` |
| `m_head_038` | `m_head_038`, `m_head_038_b00` |
| `m_head_039` | `m_head_039`, `m_head_039_b00` |
| `m_head_040` | `m_head_040`, `m_head_040_b00` |
| `m_head_041` | `m_head_041`, `m_head_041_b00` |
| `m_head_042` | `m_head_042`, `m_head_042_b00` |
| `m_head_044` | `m_head_044`, `m_head_044_b00`, `m_head_karelArrow` |
| `m_head_045` | `m_head_045`, `m_head_045_b00` |
| `m_head_046` | `m_head_046`, `m_head_046_b00` |
| `m_head_048` | `m_head_048`, `m_head_048_b00` |
| `m_head_049` | `m_head_049`, `m_head_049_b00` |
| `m_head_050` | `m_head_050`, `m_head_050_b00` |
| `m_head_051` | `m_head_051`, `m_head_051_b00` |
| `m_head_052` | `m_head_052`, `m_head_052_b00` |
| `m_head_053` | `m_head_053`, `m_head_053_b00` |
| `m_head_054` | `m_head_054`, `m_head_054_b00` |
| `m_head_055` | `m_head_055`, `m_head_055_b00` |
| `m_head_056` | `m_head_056`, `m_head_056_b00` |
| `m_head_057` | `m_head_057`, `m_head_057_b00` |
| `m_head_058` | `m_head_058`, `m_head_058_b00` |
| `m_head_059` | `m_head_059`, `m_head_059_b00` |
| `m_head_060` | `m_head_060`, `m_head_060_b00` |
| `m_head_062` | `m_head_062`, `m_head_062_b00` |
| `m_head_063` | `m_head_063`, `m_head_063_b00` |
| `m_head_064` | `m_head_064`, `m_head_064_b00` |
| `m_head_065` | `m_head_065`, `m_head_065_b00` |
| `m_head_066` | `m_head_066`, `m_head_066_b00` |
| `m_head_067` | `m_head_067`, `m_head_067_b00` |
| `m_head_068` | `m_head_068`, `m_head_068_b00` |
| `m_head_069` | `m_head_069`, `m_head_069_b00` |
| `m_head_070` | `m_head_070`, `m_head_070_b00` |
| `m_head_071` | `m_head_071`, `m_head_071_b00` |
| `m_head_072` | `m_head_072`, `m_head_072_b00` |
| `m_head_073` | `m_head_073`, `m_head_073_b00` |
| `m_head_074` | `m_head_074`, `m_head_074_b00` |
| `m_head_075` | `m_head_075`, `m_head_075_b00` |
| `m_head_076` | `m_head_076`, `m_head_076_b00` |
| `m_head_077` | `m_head_077`, `m_head_077_b00`, `m_head_ttkc_man_2_bruise` |
| `m_head_078` | `m_head_078`, `m_head_078_b00` |
| `m_head_079` | `m_head_079`, `m_head_079_b00` |
| `m_head_080` | `m_head_080`, `m_head_080_b00` |
| `m_head_081` | `m_head_081`, `m_head_081_b00` |
| `m_head_albik` | `m_head_albik`, `m_head_albik_poisoned`, `m_head_albik_sweaty` |
| `m_head_arne` | `m_head_arne`, `m_head_arne_injured`, `m_head_arne_scar` |
| `m_head_aulitz` | `m_head_aulitz`, `m_head_aulitzChoked` |
| `m_head_bergov` | `m_head_bergov` |
| `m_head_bocek` | `m_head_bocek` |
| `m_head_busek` | `m_head_busek` |
| `m_head_capon` | `m_head_capon`, `m_head_capon_b00`, `m_head_capon_b01`, `m_head_capon_shit` |
| `m_head_cellarius` | `m_head_cellarius` |
| `m_head_chamberlain` | `m_head_chamberlain`, `m_head_chamberlain_b00` |
| `m_head_cherthan` | `m_head_cherthan`, `m_head_cherthan_dead` |
| `m_head_damian` | `m_head_damian` |
| `m_head_decapitated` | `m_head_decapitated` |
| `m_head_devil` | `m_head_devil` |
| `m_head_drabant` | `m_head_drabant` |
| `m_head_erik` | `m_head_erik` |
| `m_head_fabrizio` | `m_head_fabrizio` |
| `m_head_father` | `m_head_father` |
| `m_head_father_young` | `m_head_father_young` |
| `m_head_godwin` | `m_head_godwin` |
| `m_head_hanush` | `m_head_hanush` |
| `m_head_henrychild` | `m_head_henrychild` |
| `m_head_istvan` | `m_head_istvan`, `m_head_istvan_b00` |
| `m_head_jobst` | `m_head_jobst` |
| `m_head_komar` | `m_head_komar` |
| `m_head_kozina` | `m_head_kozina` |
| `m_head_kubenka` | `m_head_kubenka` |
| `m_head_lichtenstejn` | `m_head_lichtenstejn` |
| `m_head_morticius` | `m_head_morticius` |
| `m_head_musa` | `m_head_musa` |
| `m_head_oderin` | `m_head_oderin` |
| `m_head_olbram` | `m_head_olbram` |
| `m_head_painter` | `m_head_painter`, `m_head_painter_b00` |
| `m_head_pavel_bruised` | `m_head_pavel_bruised_fresh` |
| `m_head_pisek` | `m_head_pisek` |
| `m_head_rabbi` | `m_head_rabbi` |
| `m_head_radzig` | `m_head_radzig` |
| `m_head_ruthard` | `m_head_ruthard` |
| `m_head_samuel` | `m_head_samuel` |
| `m_head_semin` | `m_head_semin` |
| `m_head_suk` | `m_head_suk` |
| `m_head_uher` | `m_head_uher` |
| `m_head_vavak` | `m_head_vavak` |
| `m_head_zachary` | `m_head_zachary` |
| `m_head_zikmund` | `m_head_zikmund` |
| `m_head_zizka` | `m_head_zizka` |
| `m_head_zizka_v1` | `m_head_zizka_v1` |

</details>

<details>
<summary>Female: 61 options</summary>

| Group | Names |
| --- | --- |
| `f_head_000` | `f_head_000` |
| `f_head_001` | `f_head_001` |
| `f_head_002` | `f_head_002` |
| `f_head_003` | `f_head_003` |
| `f_head_004` | `f_head_004` |
| `f_head_005` | `f_head_005` |
| `f_head_006` | `f_head_006` |
| `f_head_007` | `f_head_007` |
| `f_head_008` | `f_head_008` |
| `f_head_009` | `f_head_009` |
| `f_head_010` | `f_head_010` |
| `f_head_011` | `f_head_011` |
| `f_head_012` | `f_head_012` |
| `f_head_013` | `f_head_013` |
| `f_head_014` | `f_head_014` |
| `f_head_015` | `f_head_015` |
| `f_head_016` | `f_head_016` |
| `f_head_017` | `f_head_017` |
| `f_head_018` | `f_head_018` |
| `f_head_019` | `f_head_019` |
| `f_head_020` | `f_head_020` |
| `f_head_021` | `f_head_021` |
| `f_head_022` | `f_head_022` |
| `f_head_023` | `f_head_023` |
| `f_head_024` | `f_head_024` |
| `f_head_025` | `f_head_025` |
| `f_head_026` | `f_head_026` |
| `f_head_027` | `f_head_027` |
| `f_head_028` | `f_head_028` |
| `f_head_029` | `f_head_029` |
| `f_head_030` | `f_head_030` |
| `f_head_031` | `f_head_031` |
| `f_head_032` | `f_head_032` |
| `f_head_033` | `f_head_033` |
| `f_head_034` | `f_head_034` |
| `f_head_035` | `f_head_035` |
| `f_head_036` | `f_head_036` |
| `f_head_037` | `f_head_037` |
| `f_head_038` | `f_head_038` |
| `f_head_039` | `f_head_039` |
| `f_head_040` | `f_head_040` |
| `f_head_041` | `f_head_041` |
| `f_head_042` | `f_head_042` |
| `f_head_043` | `f_head_043` |
| `f_head_044` | `f_head_044` |
| `f_head_045` | `f_head_045` |
| `f_head_046` | `f_head_046` |
| `f_head_047` | `f_head_047` |
| `f_head_048` | `f_head_048` |
| `f_head_049` | `f_head_049` |
| `f_head_bohuse` | `f_head_bohuse` |
| `f_head_bozena` | `f_head_bozena` |
| `f_head_butcherswife` | `f_head_butcherswife` |
| `f_head_butcherswife_bruised` | `f_head_butcherswife_bruised` |
| `f_head_katherine` | `f_head_katherine` |
| `f_head_magdalena` | `f_head_magdalena` |
| `f_head_marketa` | `f_head_marketa` |
| `f_head_marketa_bruised` | `f_head_marketa_bruised` |
| `f_head_miriam` | `f_head_miriam` |
| `f_head_mother` | `f_head_mother` |
| `f_head_rose` | `f_head_rose` |

</details>

<!-- /generated:heads -->

## Hairstyles (`hair`)

<!-- generated:hair -->

<details>
<summary>Male: 262 options</summary>

| Group | Names |
| --- | --- |
| `x_hair_01` | `m_hair_001_black`, `m_hair_001_blonde`, `m_hair_001_dark_brown`, `m_hair_001_dark_ginger`, `m_hair_001_dark_grey`, `m_hair_001_ginger`, `m_hair_001_grey`, `m_hair_001_light_brown`, `m_hair_001_white`, `x_hair_01` |
| `x_hair_02` | `m_hair_002_black`, `m_hair_002_blonde`, `m_hair_002_dark_brown`, `m_hair_002_dark_ginger`, `m_hair_002_dark_grey`, `m_hair_002_ginger`, `m_hair_002_grey`, `m_hair_002_light_brown`, `m_hair_002_white`, `x_hair_02` |
| `x_hair_03` | `m_hair_003_black`, `m_hair_003_blonde`, `m_hair_003_dark_brown`, `m_hair_003_dark_ginger`, `m_hair_003_dark_grey`, `m_hair_003_ginger`, `m_hair_003_grey`, `m_hair_003_light_brown`, `m_hair_003_white`, `x_hair_03` |
| `x_hair_04` | `m_hair_004_black`, `m_hair_004_blonde`, `m_hair_004_dark_brown`, `m_hair_004_dark_ginger`, `m_hair_004_dark_grey`, `m_hair_004_ginger`, `m_hair_004_grey`, `m_hair_004_light_brown`, `m_hair_004_white`, `x_hair_04` |
| `x_hair_05` | `m_hair_005_black`, `m_hair_005_blonde`, `m_hair_005_dark_brown`, `m_hair_005_dark_ginger`, `m_hair_005_dark_grey`, `m_hair_005_ginger`, `m_hair_005_grey`, `m_hair_005_light_brown`, `m_hair_005_mIstvan`, `m_hair_005_white`, `x_hair_05` |
| `x_hair_06` | `m_hair_006_black`, `m_hair_006_blonde`, `m_hair_006_dark_brown`, `m_hair_006_dark_ginger`, `m_hair_006_dark_grey`, `m_hair_006_ginger`, `m_hair_006_grey`, `m_hair_006_light_brown`, `m_hair_006_white`, `x_hair_06` |
| `x_hair_08` | `m_hair_008_black`, `m_hair_008_blonde`, `m_hair_008_dark_brown`, `m_hair_008_dark_ginger`, `m_hair_008_dark_grey`, `m_hair_008_ginger`, `m_hair_008_grey`, `m_hair_008_light_brown`, `m_hair_008_white`, `x_hair_08` |
| `x_hair_09` | `m_hair_009_black`, `m_hair_009_blonde`, `m_hair_009_dark_brown`, `m_hair_009_dark_ginger`, `m_hair_009_dark_grey`, `m_hair_009_ginger`, `m_hair_009_grey`, `m_hair_009_light_brown`, `m_hair_009_white`, `x_hair_09` |
| `x_hair_10` | `m_hair_010_black`, `m_hair_010_blonde`, `m_hair_010_dark_brown`, `m_hair_010_dark_ginger`, `m_hair_010_dark_grey`, `m_hair_010_ginger`, `m_hair_010_grey`, `m_hair_010_light_brown`, `m_hair_010_white`, `x_hair_10` |
| `x_hair_11` | `m_hair_011_black`, `m_hair_011_blonde`, `m_hair_011_dark_brown`, `m_hair_011_dark_ginger`, `m_hair_011_dark_grey`, `m_hair_011_ginger`, `m_hair_011_grey`, `m_hair_011_light_brown`, `m_hair_011_white`, `x_hair_11` |
| `x_hair_12` | `m_hair_012_black`, `m_hair_012_blonde`, `m_hair_012_dark_brown`, `m_hair_012_dark_ginger`, `m_hair_012_dark_grey`, `m_hair_012_ginger`, `m_hair_012_grey`, `m_hair_012_light_brown`, `m_hair_012_white`, `x_hair_12` |
| `x_hair_13` | `m_hair_013_black`, `m_hair_013_blonde`, `m_hair_013_dark_brown`, `m_hair_013_dark_ginger`, `m_hair_013_dark_grey`, `m_hair_013_ginger`, `m_hair_013_grey`, `m_hair_013_light_brown`, `m_hair_013_white`, `x_hair_13` |
| `x_hair_14` | `m_hair_014_black`, `m_hair_014_blonde`, `m_hair_014_dark_brown`, `m_hair_014_dark_ginger`, `m_hair_014_dark_grey`, `m_hair_014_ginger`, `m_hair_014_grey`, `m_hair_014_light_brown`, `m_hair_014_white`, `x_hair_14` |
| `x_hair_15` | `m_hair_015_black`, `m_hair_015_blonde`, `m_hair_015_dark_brown`, `m_hair_015_dark_ginger`, `m_hair_015_dark_grey`, `m_hair_015_ginger`, `m_hair_015_grey`, `m_hair_015_light_brown`, `m_hair_015_white`, `x_hair_15` |
| `x_hair_17` | `m_hair_017_black`, `m_hair_017_blonde`, `m_hair_017_dark_brown`, `m_hair_017_dark_ginger`, `m_hair_017_dark_grey`, `m_hair_017_ginger`, `m_hair_017_grey`, `m_hair_017_light_brown`, `m_hair_017_white`, `x_hair_17` |
| `x_hair_18` | `m_hair_018_black`, `m_hair_018_blonde`, `m_hair_018_dark_brown`, `m_hair_018_dark_ginger`, `m_hair_018_dark_grey`, `m_hair_018_ginger`, `m_hair_018_grey`, `m_hair_018_light_brown`, `m_hair_018_white`, `x_hair_18` |
| `x_hair_19` | `m_hair_019_black`, `m_hair_019_dark_grey`, `m_hair_019_grey`, `x_hair_19`, `x_hair_19_blonde`, `x_hair_19_dark_brown`, `x_hair_19_dark_ginger`, `x_hair_19_ginger`, `x_hair_19_light_brown`, `x_hair_19_white` |
| `x_hair_20` | `m_hair_020_black`, `m_hair_020_blonde`, `m_hair_020_dark_brown`, `m_hair_020_dark_ginger`, `m_hair_020_dark_grey`, `m_hair_020_ginger`, `m_hair_020_grey`, `m_hair_020_light_brown`, `m_hair_020_white`, `x_hair_20` |
| `m_hair_aulitz` | `m_hair_aulitz` |
| `m_hair_barber_01` | `m_hair_barber_01` |
| `m_hair_barber_02` | `m_hair_barber_02` |
| `m_hair_barber_03` | `m_hair_barber_03` |
| `m_hair_barber_04` | `m_hair_barber_04` |
| `m_hair_barber_05` | `m_hair_barber_05` |
| `m_hair_barber_06` | `m_hair_barber_06` |
| `m_hair_barber_07` | `m_hair_barber_07` |
| `m_hair_barber_08` | `m_hair_barber_08` |
| `m_hair_barber_09` | `m_hair_barber_09` |
| `m_hair_barber_10` | `m_hair_barber_10` |
| `m_hair_barber_11` | `m_hair_barber_11` |
| `m_hair_barber_12` | `m_hair_barber_12` |
| `m_hair_barber_13` | `m_hair_barber_13` |
| `m_hair_barber_14` | `m_hair_barber_14` |
| `m_hair_barber_15` | `m_hair_barber_15` |
| `m_hair_barber_16` | `m_hair_barber_16` |
| `m_hair_bergov` | `m_hair_bergov` |
| `m_hair_capon` | `m_hair_capon` |
| `m_hair_devil` | `m_hair_devil` |
| `m_hair_drabant` | `m_hair_drabant` |
| `m_hair_erik` | `m_hair_erik` |
| `m_hair_father` | `m_hair_father` |
| `m_hair_godwin` | `m_hair_godwin` |
| `m_hair_hanush` | `m_hair_hanush` |
| `m_hair_henry` | `m_hair_henry` |
| `m_hair_istvan` | `m_hair_istvan` |
| `m_hair_jobst` | `m_hair_jobst` |
| `m_hair_komar` | `m_hair_komar` |
| `m_hair_lichtenstein` | `m_hair_lichtenstein` |
| `x_hair_monk_01` | `m_hair_monk_01_black`, `m_hair_monk_01_blonde`, `m_hair_monk_01_dark_brown`, `m_hair_monk_01_dark_ginger`, `m_hair_monk_01_dark_grey`, `m_hair_monk_01_ginger`, `m_hair_monk_01_grey`, `m_hair_monk_01_light_brown`, `m_hair_monk_01_white`, `x_hair_monk_01` |
| `x_hair_monk_02` | `m_hair_monk_02_black`, `m_hair_monk_02_blonde`, `m_hair_monk_02_dark_brown`, `m_hair_monk_02_dark_ginger`, `m_hair_monk_02_dark_grey`, `m_hair_monk_02_ginger`, `m_hair_monk_02_grey`, `m_hair_monk_02_light_brown`, `m_hair_monk_02_white`, `x_hair_monk_02` |
| `x_hair_monk_03` | `m_hair_monk_03_black`, `m_hair_monk_03_blonde`, `m_hair_monk_03_dark_brown`, `m_hair_monk_03_dark_ginger`, `m_hair_monk_03_dark_grey`, `m_hair_monk_03_ginger`, `m_hair_monk_03_grey`, `m_hair_monk_03_light_brown`, `m_hair_monk_03_white`, `x_hair_monk_03` |
| `m_hair_musa` | `m_hair_musa` |
| `m_hair_pisek` | `m_hair_pisek` |
| `m_hair_rabbi` | `m_hair_rabbi` |
| `m_hair_radzig` | `m_hair_radzig` |
| `m_hair_ruthard` | `m_hair_ruthard` |
| `m_hair_samuel` | `m_hair_samuel` |
| `m_hair_suk` | `m_hair_suk` |
| `m_hair_zizka` | `m_hair_tomas`, `m_hair_zizka` |
| `m_hair_tonsure` | `m_hair_tonsure`, `m_hair_tonsure_black`, `m_hair_tonsure_blonde`, `m_hair_tonsure_dark_brown`, `m_hair_tonsure_dark_ginger`, `m_hair_tonsure_dark_grey`, `m_hair_tonsure_ginger`, `m_hair_tonsure_grey`, `m_hair_tonsure_light_brown`, `m_hair_tonsure_white` |
| `m_hair_uher` | `m_hair_uher` |
| `m_hair_zikmund` | `m_hair_zikmund` |

</details>

<details>
<summary>Female: 71 options</summary>

| Group | Names |
| --- | --- |
| `f_hair_001` | `f_hair_001`, `f_hair_001_black`, `f_hair_001_blonde`, `f_hair_001_dark_brown`, `f_hair_001_dark_ginger`, `f_hair_001_dark_grey`, `f_hair_001_ginger`, `f_hair_001_grey`, `f_hair_001_light_brown`, `f_hair_001_white` |
| `f_hair_002` | `f_hair_002`, `f_hair_002_black`, `f_hair_002_blonde`, `f_hair_002_dark_brown`, `f_hair_002_dark_ginger`, `f_hair_002_dark_grey`, `f_hair_002_ginger`, `f_hair_002_grey`, `f_hair_002_light_brown`, `f_hair_002_white` |
| `f_hair_003` | `f_hair_003`, `f_hair_003_black`, `f_hair_003_blonde`, `f_hair_003_dark_brown`, `f_hair_003_dark_ginger`, `f_hair_003_ginger`, `f_hair_003_light_brown` |
| `f_hair_004` | `f_hair_004`, `f_hair_004_black`, `f_hair_004_blonde`, `f_hair_004_dark_brown`, `f_hair_004_dark_ginger`, `f_hair_004_dark_grey`, `f_hair_004_ginger`, `f_hair_004_grey`, `f_hair_004_light_brown`, `f_hair_004_white` |
| `f_hair_005` | `f_hair_005`, `f_hair_005_black`, `f_hair_005_blonde`, `f_hair_005_dark_brown`, `f_hair_005_dark_ginger`, `f_hair_005_dark_grey`, `f_hair_005_ginger`, `f_hair_005_grey`, `f_hair_005_light_brown`, `f_hair_005_white` |
| `f_hair_006` | `f_hair_006`, `f_hair_006_black`, `f_hair_006_blonde`, `f_hair_006_dark_brown`, `f_hair_006_dark_ginger`, `f_hair_006_dark_grey`, `f_hair_006_ginger`, `f_hair_006_grey`, `f_hair_006_light_brown`, `f_hair_006_white` |
| `f_hair_007` | `f_hair_007`, `f_hair_007_black`, `f_hair_007_blonde`, `f_hair_007_dark_brown`, `f_hair_007_dark_ginger`, `f_hair_007_dark_grey`, `f_hair_007_ginger`, `f_hair_007_grey`, `f_hair_007_light_brown`, `f_hair_007_white` |
| `f_hair_katherine` | `f_hair_katherine` |
| `f_hair_miriam` | `f_hair_miriam` |
| `f_hair_mother` | `f_hair_mother` |
| `f_hair_rose` | `f_hair_rose` |

</details>

<!-- /generated:hair -->

## Skins (`body`)

The skin is the complexion and build under the clothes.

<!-- generated:skins -->

<details>
<summary>Male: 47 options</summary>

| Group | Names |
| --- | --- |
| `male_body_npc` | `african`, `capon_body`, `capon_body_wet`, `cherthan_dead_body`, `drowner_body`, `henry_body`, `m_pale`, `m_roma`, `m_tan`, `male_body_npc`, `old` |
| `henry_body` | `henry_arrow_hole`, `henry_injured_arrow`, `henry_injured_arrow_hole`, `henry_injured_left_shoulder`, `henry_wet`, `henry_whipped_four_slashes`, `henry_whipped_two_slashes` |
| `henry_injured_arrow` | `henry_injured_arrow_dry` |
| `henry_injured_left_shoulder` | `henry_injured_left_shoulder_ingame` |
| `hide_male_body` | `hide_male_body` |
| `m_pale` | `m_body_pale_01`, `m_body_pale_02`, `m_body_pale_03`, `m_body_pale_04` |
| `m_pale_old` | `m_body_pale_old_01`, `m_body_pale_old_02`, `m_body_pale_old_03` |
| `m_roma` | `m_body_roma_01`, `m_body_roma_02`, `m_body_roma_03`, `m_body_roma_04` |
| `m_tan` | `m_body_tan_01`, `m_body_tan_02`, `m_body_tan_03`, `m_body_tan_04`, `m_body_tan_05`, `m_body_tan_06` |
| `m_tan_old` | `m_body_tan_old_01`, `m_body_tan_old_02`, `m_body_tan_old_03`, `m_body_tan_old_04`, `m_body_tan_old_05`, `m_body_tan_old_06` |
| `old` | `m_pale_old`, `m_tan_old` |
| `male_body_experimental` | `male_body_experimental` |

</details>

<details>
<summary>Female: 41 options</summary>

| Group | Names |
| --- | --- |
| `bathmaid_body` | `bathmaid_body` |
| `bozena_body` | `bozena_body` |
| `female_body` | `f_body_heavy`, `f_old`, `female_body`, `female_body_naked`, `pale`, `roma`, `tan` |
| `f_old_pale` | `f_body_old_pale_01`, `f_body_old_pale_02`, `f_body_old_pale_03`, `f_body_old_pale_04` |
| `f_old` | `f_body_old_roma`, `f_heavy_old`, `f_old_pale`, `f_old_tan` |
| `f_old_tan` | `f_body_old_tan_01`, `f_body_old_tan_02`, `f_body_old_tan_03`, `f_body_old_tan_04`, `f_body_old_tan_05`, `f_body_old_tan_06` |
| `pale` | `f_body_pale_01`, `f_body_pale_02`, `f_body_pale_03`, `f_body_pale_04` |
| `tan` | `f_body_tan_01`, `f_body_tan_02`, `f_body_tan_03`, `f_body_tan_04`, `f_body_tan_05`, `f_body_tan_06` |
| `roma` | `f_roma_01`, `f_roma_02`, `f_roma_03`, `f_roma_04` |
| `female_body_naked` | `female_body_naked_klara` |
| `katherine_body` | `katherine_body` |
| `katherine_body_naked` | `katherine_body_naked` |
| `rose_body` | `rose_body` |

</details>

<!-- /generated:skins -->
