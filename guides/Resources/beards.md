---
title: Beards and the faces that grow them
description: The beards of the appearance catalog and, for every male face, which of them it can wear.
sidebar:
  label: Beards
  order: 112
---

A beard is modelled against one face's mesh, so a face can only wear the beards made for it.
Ask for any other pair and the player's client refuses the whole appearance.
[`Appearances.beards`](../../reference/server/variables/Appearances.md#beards) gives the list for one
face at runtime:

```ts
const head = "m_head_000";
const beards = Appearances.beards(head).map((option) => option.name);
if (beards.length) player.setAppearance({ head, beard: beards[0] });
```

Beards are male only; the female tree has none. An empty `beard` is clean-shaven, and it is
always allowed. See [Player appearance](../../players/appearance/) for the rest of a body.

<!-- generated:beards -->

<details>
<summary>All 51 beards</summary>

`UC_beard_aulitz`, `UC_beard_barber_01`, `UC_beard_barber_02`, `UC_beard_barber_03`, `UC_beard_barber_04`, `UC_beard_barber_05`, `UC_beard_barber_06`, `UC_beard_barber_07`, `UC_beard_barber_08`, `UC_beard_bergov`, `UC_beard_capon`, `UC_beard_cherthan`, `UC_beard_drabant`, `UC_beard_erik`, `UC_beard_father`, `UC_beard_father_young`, `UC_beard_hanush`, `UC_beard_jobst`, `UC_beard_musa`, `UC_beard_painter`, `UC_beard_pisek`, `UC_beard_rabbi`, `UC_beard_radzig`, `UC_beard_ruthard`, `UC_beard_samuel`, `UC_beard_semin`, `UC_beard_suk`, `UC_beard_uher`, `UC_beard_zachary`, `UC_beard_zikmund`, `UC_beard_zizka`, `m_beard_00`, `m_beard_01`, `m_beard_02`, `m_beard_03`, `m_beard_04`, `m_beard_05`, `m_beard_06`, `m_beard_07`, `m_beard_08`, `m_beard_09`, `m_beard_10`, `m_beard_11`, `m_beard_12`, `m_beard_13`, `m_beard_14`, `m_beard_15`, `m_beard_16`, `m_beard_17`, `m_beard_18`, `m_beard_19`

</details>

<details>
<summary>Which faces grow which beards (212 faces)</summary>

| Faces | Beards they can wear |
| --- | --- |
| `m_head_051`, `m_head_051_b00`, `m_head_suk` | 26: `UC_beard_father`, `UC_beard_jobst`, `UC_beard_rabbi`, `UC_beard_radzig`, `UC_beard_semin`, `UC_beard_suk`, `m_beard_00`, `m_beard_01`, `m_beard_02`, `m_beard_03`, `m_beard_04`, `m_beard_05`, `m_beard_06`, `m_beard_07`, `m_beard_08`, `m_beard_09`, `m_beard_10`, `m_beard_11`, `m_beard_12`, `m_beard_13`, `m_beard_14`, `m_beard_15`, `m_beard_16`, `m_beard_17`, `m_beard_18`, `m_beard_19` |
| `m_head_063`, `m_head_063_b00`, `m_head_cherthan`, `m_head_cherthan_dead` | 26: `UC_beard_cherthan`, `UC_beard_father`, `UC_beard_jobst`, `UC_beard_rabbi`, `UC_beard_radzig`, `UC_beard_semin`, `m_beard_00`, `m_beard_01`, `m_beard_02`, `m_beard_03`, `m_beard_04`, `m_beard_05`, `m_beard_06`, `m_beard_07`, `m_beard_08`, `m_beard_09`, `m_beard_10`, `m_beard_11`, `m_beard_12`, `m_beard_13`, `m_beard_14`, `m_beard_15`, `m_beard_16`, `m_beard_17`, `m_beard_18`, `m_beard_19` |
| `m_head_000`, `m_head_000_b00`, `m_head_001`, `m_head_001_b00`, `m_head_002`, `m_head_002_b00`, `m_head_003`, `m_head_003_b00`, `m_head_004`, `m_head_004_b00`, `m_head_005`, `m_head_005_b00`, `m_head_006`, `m_head_006_b00`, `m_head_008`, `m_head_008_b00`, `m_head_010`, `m_head_010_b00`, `m_head_011`, `m_head_011_b00`, `m_head_012`, `m_head_012_b00`, `m_head_013`, `m_head_013_b00`, `m_head_016`, `m_head_016_b00`, `m_head_017`, `m_head_017_b00`, `m_head_018`, `m_head_018_b00`, `m_head_019`, `m_head_019_b00`, `m_head_020`, `m_head_020_b00`, `m_head_022`, `m_head_022_b00`, `m_head_024`, `m_head_024_b00`, `m_head_025`, `m_head_025_b00`, `m_head_026`, `m_head_026_b00`, `m_head_027`, `m_head_027_b00`, `m_head_028`, `m_head_028_b00`, `m_head_029`, `m_head_029_b00`, `m_head_030`, `m_head_030_b00`, `m_head_031`, `m_head_031_b00`, `m_head_032`, `m_head_032_b00`, `m_head_033`, `m_head_033_b00`, `m_head_034`, `m_head_034_b00`, `m_head_035`, `m_head_035_b00`, `m_head_036`, `m_head_036_b00`, `m_head_037`, `m_head_037_b00`, `m_head_038`, `m_head_038_b00`, `m_head_039`, `m_head_039_b00`, `m_head_040`, `m_head_040_b00`, `m_head_041`, `m_head_041_b00`, `m_head_042`, `m_head_042_b00`, `m_head_044`, `m_head_044_b00`, `m_head_045`, `m_head_045_b00`, `m_head_046`, `m_head_046_b00`, `m_head_048`, `m_head_048_b00`, `m_head_049`, `m_head_049_b00`, `m_head_050`, `m_head_050_b00`, `m_head_052`, `m_head_052_b00`, `m_head_053`, `m_head_053_b00`, `m_head_054`, `m_head_054_b00`, `m_head_055`, `m_head_055_b00`, `m_head_056`, `m_head_056_b00`, `m_head_057`, `m_head_057_b00`, `m_head_058`, `m_head_058_b00`, `m_head_059`, `m_head_059_b00`, `m_head_060`, `m_head_060_b00`, `m_head_062`, `m_head_062_b00`, `m_head_064`, `m_head_064_b00`, `m_head_065`, `m_head_065_b00`, `m_head_066`, `m_head_066_b00`, `m_head_067`, `m_head_067_b00`, `m_head_068`, `m_head_068_b00`, `m_head_069`, `m_head_069_b00`, `m_head_070`, `m_head_070_b00`, `m_head_071`, `m_head_071_b00`, `m_head_072`, `m_head_072_b00`, `m_head_073`, `m_head_073_b00`, `m_head_074`, `m_head_074_b00`, `m_head_075`, `m_head_075_b00`, `m_head_076`, `m_head_076_b00`, `m_head_077`, `m_head_077_b00`, `m_head_078`, `m_head_078_b00`, `m_head_079`, `m_head_079_b00`, `m_head_080`, `m_head_080_b00`, `m_head_081`, `m_head_081_b00`, `m_head_arne`, `m_head_arne_injured`, `m_head_arne_scar`, `m_head_cellarius`, `m_head_chamberlain`, `m_head_chamberlain_b00`, `m_head_damian`, `m_head_drowner`, `m_head_jezek_bruised`, `m_head_karelArrow`, `m_head_morticius`, `m_head_olbram`, `m_head_pavel_bruised`, `m_head_pavel_bruised_fresh`, `m_head_ttkc_man_2_bruise` | 25: `UC_beard_father`, `UC_beard_jobst`, `UC_beard_rabbi`, `UC_beard_radzig`, `UC_beard_semin`, `m_beard_00`, `m_beard_01`, `m_beard_02`, `m_beard_03`, `m_beard_04`, `m_beard_05`, `m_beard_06`, `m_beard_07`, `m_beard_08`, `m_beard_09`, `m_beard_10`, `m_beard_11`, `m_beard_12`, `m_beard_13`, `m_beard_14`, `m_beard_15`, `m_beard_16`, `m_beard_17`, `m_beard_18`, `m_beard_19` |
| `henry`, `henry_b00`, `henry_injured` | 16: `UC_beard_barber_01`, `UC_beard_barber_02`, `UC_beard_barber_03`, `UC_beard_barber_04`, `UC_beard_barber_05`, `UC_beard_barber_06`, `UC_beard_barber_07`, `UC_beard_barber_08`, `UC_beard_painter`, `m_beard_00`, `m_beard_04`, `m_beard_07`, `m_beard_13`, `m_beard_16`, `m_beard_17`, `m_beard_18` |
| `m_head_father`, `m_head_father_young` | 7: `UC_beard_father`, `UC_beard_father_young`, `UC_beard_rabbi`, `UC_beard_zizka`, `m_beard_00`, `m_beard_01`, `m_beard_04` |
| `m_head_rabbi` | 4: `UC_beard_father`, `UC_beard_rabbi`, `m_beard_00`, `m_beard_01` |
| `m_head_albik`, `m_head_albik_poisoned`, `m_head_albik_sweaty` | 3: `m_beard_00`, `m_beard_11`, `m_beard_15` |
| `m_head_capon`, `m_head_capon_b00`, `m_head_capon_b01`, `m_head_capon_shit` | 3: `UC_beard_capon`, `m_beard_00`, `m_beard_04` |
| `m_head_jobst` | 3: `UC_beard_jobst`, `m_beard_00`, `m_beard_06` |
| `m_head_painter`, `m_head_painter_b00` | 3: `UC_beard_barber_01`, `UC_beard_painter`, `m_beard_00` |
| `m_head_radzig` | 3: `UC_beard_radzig`, `m_beard_00`, `m_beard_14` |
| `m_head_semin` | 3: `UC_beard_semin`, `m_beard_00`, `m_beard_08` |
| `m_head_aulitz`, `m_head_aulitzChoked` | 2: `UC_beard_aulitz`, `m_beard_00` |
| `m_head_bergov` | 2: `UC_beard_bergov`, `m_beard_00` |
| `m_head_busek` | 2: `m_beard_00`, `m_beard_05` |
| `m_head_drabant` | 2: `UC_beard_drabant`, `m_beard_00` |
| `m_head_erik` | 2: `UC_beard_erik`, `m_beard_00` |
| `m_head_hanush` | 2: `UC_beard_hanush`, `m_beard_00` |
| `m_head_musa` | 2: `UC_beard_musa`, `m_beard_00` |
| `m_head_pisek` | 2: `UC_beard_pisek`, `m_beard_00` |
| `m_head_ruthard` | 2: `UC_beard_ruthard`, `m_beard_00` |
| `m_head_samuel` | 2: `UC_beard_samuel`, `m_beard_00` |
| `m_head_uher` | 2: `UC_beard_uher`, `m_beard_00` |
| `m_head_zachary` | 2: `UC_beard_zachary`, `m_beard_00` |
| `m_head_zikmund` | 2: `UC_beard_zikmund`, `m_beard_00` |
| `m_head_zizka`, `m_head_zizka_v1` | 2: `UC_beard_zizka`, `m_beard_00` |
| `m_head_bocek`, `m_head_decapitated`, `m_head_devil`, `m_head_fabrizio`, `m_head_godwin`, `m_head_henrychild`, `m_head_istvan`, `m_head_istvan_b00`, `m_head_komar`, `m_head_kozina`, `m_head_kubenka`, `m_head_lichtenstejn`, `m_head_oderin`, `m_head_vavak` | 1: `m_beard_00` |

</details>

<!-- /generated:beards -->
