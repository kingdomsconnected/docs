---
title: Particle effects
description: Every particle effect Vfx.spawn can play, by library, with whether it loops and how far away it is drawn.
sidebar:
  label: Particle effects
  order: 118
---

[`Vfx.spawn`](../../reference/server/classes/Vfx.md#spawn) takes one of these names, and
[`Vfx.list`](../../reference/server/classes/Vfx.md#list) returns them, filtered by a prefix.

```ts
Vfx.spawn("WH_Particels.fires.candle", player.position);
const fires = Vfx.list("WH_Particels.fires");
```

**Loops** means the effect keeps playing until you destroy it; **Once** plays and ends by
itself. **Seen from** is the largest distance any part of it is drawn at. Only top-level effects
are listed: the parts inside one are not meant to be played alone. See [Effects](../../world/effects/).

<!-- generated:effects -->

<details>
<summary><code>WH_Particels</code> (204)</summary>

| Effect | Plays | Seen from |
| --- | --- | --- |
| `WH_Particels.dust.dust_mill` | Loops | 10 m |
| `WH_Particels.dust.sweep` | Loops | 3 m |
| `WH_Particels.fires.alchemy_distilery` | Loops | 20 m |
| `WH_Particels.fires.alchemy_fireplace` | Loops | 20 m |
| `WH_Particels.fires.alchemy_fireplace_big` | Loops | 12 m |
| `WH_Particels.fires.burning_arrows` | Loops | 25 m |
| `WH_Particels.fires.candle` | Loops | 12 m |
| `WH_Particels.fires.exterior_fireplace` | Loops | 40 m |
| `WH_Particels.fires.fatwood` | Loops | 20 m |
| `WH_Particels.fires.fire_firewood` | Loops | 10 m |
| `WH_Particels.fires.fire_hay_s02` | Loops | 500 m |
| `WH_Particels.fires.fire_pribyslawitz_big` | Loops | 500 m |
| `WH_Particels.fires.fire_pribyslawitz_big_nosmoke` | Loops | 500 m |
| `WH_Particels.fires.fireplace_nosmoke` | Loops | 20 m |
| `WH_Particels.fires.fireplace_nosmoke_low` | Loops | 20 m |
| `WH_Particels.fires.house_fireplace` | Loops | 20 m |
| `WH_Particels.fires.pirstejn_fireplace` | Loops | 20 m |
| `WH_Particels.fires.refraction_foundry` | Loops | 3 m |
| `WH_Particels.fires.torch_burn_out` | Loops | 55 m |
| `WH_Particels.fires.torch_longdistance` | Loops | 100 m |
| `WH_Particels.fires.torch_trailer` | Loops | 100 m |
| `WH_Particels.fires.torch_trailer_less_sparks` | Loops | 100 m |
| `WH_Particels.other.alchemy_liquid_pouring` | Loops |  |
| `WH_Particels.other.apple_mash` | Loops | 100 m |
| `WH_Particels.other.arrow_fire_vranik` | Loops |  |
| `WH_Particels.other.arrow_trail` | Loops |  |
| `WH_Particels.other.arrows` | Loops |  |
| `WH_Particels.other.baker_flour` | Loops | 75 m |
| `WH_Particels.other.baker_flour_throw` | Loops | 8 m |
| `WH_Particels.other.baker_pour_flour` | Loops | 8 m |
| `WH_Particels.other.baker_pour_water` | Loops | 3 m |
| `WH_Particels.other.bath_hotwater` | Loops | 6 m |
| `WH_Particels.other.bats` | Loops |  |
| `WH_Particels.other.beer_keg_pouring` | Loops |  |
| `WH_Particels.other.beer_pouring` | Loops |  |
| `WH_Particels.other.bees` | Loops | 25 m |
| `WH_Particels.other.bellows` | Loops |  |
| `WH_Particels.other.bird_big_single` | Loops |  |
| `WH_Particels.other.birds_small_tree` | Loops |  |
| `WH_Particels.other.blacksmith_hit` | Loops | 1000 m |
| `WH_Particels.other.boiling_bubbles` | Loops | 4 m |
| `WH_Particels.other.boiling_bubbles_cooking_cauldron` | Loops | 4 m |
| `WH_Particels.other.bucket_filling` | Loops | 10 m |
| `WH_Particels.other.butcher_throw_meat_pieces` | Loops | 10 m |
| `WH_Particels.other.butterfly` | Loops | 20 m |
| `WH_Particels.other.casting` | Loops | 1000 m |
| `WH_Particels.other.charcoal` | Loops |  |
| `WH_Particels.other.chicken_kill` | Once |  |
| `WH_Particels.other.cooking` | Loops | 120 m |
| `WH_Particels.other.crash_mill` | Loops |  |
| `WH_Particels.other.crows` | Loops |  |
| `WH_Particels.other.crows_tree` | Loops |  |
| `WH_Particels.other.deer_gut` | Loops |  |
| `WH_Particels.other.deer_hanging` | Loops |  |
| `WH_Particels.other.distant_lamp_glow` | Loops |  |
| `WH_Particels.other.distant_light` | Loops |  |
| `WH_Particels.other.dream` | Loops | 25 m |
| `WH_Particels.other.dream_death` | Once | 25 m |
| `WH_Particels.other.drowning` | Loops | 25 m |
| `WH_Particels.other.explosion_dust` | Loops |  |
| `WH_Particels.other.eye_blink` | Once |  |
| `WH_Particels.other.eye_close` | Once |  |
| `WH_Particels.other.eye_open` | Once |  |
| `WH_Particels.other.fake_army_a` | Loops | 150 m |
| `WH_Particels.other.fake_army_b` | Loops | 150 m |
| `WH_Particels.other.firefly` | Loops | 50 m |
| `WH_Particels.other.firefly_2x2` | Loops | 50 m |
| `WH_Particels.other.flash` | Once | 20 m |
| `WH_Particels.other.fly` | Loops | 8 m |
| `WH_Particels.other.fly_large` | Loops | 8 m |
| `WH_Particels.other.fly_small` | Loops | 6 m |
| `WH_Particels.other.glow` | Loops | 1000 m |
| `WH_Particels.other.grain_bowl` | Loops |  |
| `WH_Particels.other.grain_dust` | Loops | 150 m |
| `WH_Particels.other.gravel` | Once |  |
| `WH_Particels.other.gunpowder_finish` | Loops |  |
| `WH_Particels.other.hen_cleaning` | Once |  |
| `WH_Particels.other.hen_feather_buildup` | Loops |  |
| `WH_Particels.other.hen_feeding` | Once |  |
| `WH_Particels.other.herbs_hmozdir` | Loops |  |
| `WH_Particels.other.herbs_pouring` | Loops |  |
| `WH_Particels.other.herbs_pouring_fast` | Loops |  |
| `WH_Particels.other.herbs_throw` | Once |  |
| `WH_Particels.other.hoeing` | Loops |  |
| `WH_Particels.other.knifewall` | Loops | 6 m |
| `WH_Particels.other.laundry` | Loops | 10 m |
| `WH_Particels.other.laundry_smack` | Once | 10 m |
| `WH_Particels.other.magic` | Loops |  |
| `WH_Particels.other.meteorit` | Once |  |
| `WH_Particels.other.oil_pouring` | Loops | 2 m |
| `WH_Particels.other.peeing` | Loops |  |
| `WH_Particels.other.peeing_dog` | Loops |  |
| `WH_Particels.other.pig_feeding` | Loops |  |
| `WH_Particels.other.pouring_poison` | Loops | 2 m |
| `WH_Particels.other.pouring_poison_b` | Loops | 30 m |
| `WH_Particels.other.prehrabavani` | Loops |  |
| `WH_Particels.other.q_conquest_gatecrush` | Once | 25 m |
| `WH_Particels.other.q_conquest_smoke` | Loops | 600 m |
| `WH_Particels.other.q_conquest_smokesmall` | Loops | 25 m |
| `WH_Particels.other.roast` | Loops |  |
| `WH_Particels.other.roasting_hole` | Loops |  |
| `WH_Particels.other.sandglass` | Loops |  |
| `WH_Particels.other.shit_monastery` | Loops | 5 m |
| `WH_Particels.other.shit_splash` | Once |  |
| `WH_Particels.other.shovel_rocks` | Loops |  |
| `WH_Particels.other.sludge_pouring` | Once |  |
| `WH_Particels.other.sludge_splash` | Once |  |
| `WH_Particels.other.smelting_puff` | Loops | 1000 m |
| `WH_Particels.other.smoking` | Loops | 120 m |
| `WH_Particels.other.sowing` | Once | 8 m |
| `WH_Particels.other.spiritus_pouring` | Loops | 2 m |
| `WH_Particels.other.spitting_vomiting` | Loops |  |
| `WH_Particels.other.stonemason` | Loops |  |
| `WH_Particels.other.stoupa` | Loops |  |
| `WH_Particels.other.stoupa_shovel` | Loops |  |
| `WH_Particels.other.stoupa_shovel_short` | Loops |  |
| `WH_Particels.other.test` | Loops |  |
| `WH_Particels.other.theresa_arrow_fire` | Loops |  |
| `WH_Particels.other.theresa_cuman_army_a` | Loops |  |
| `WH_Particels.other.theresa_cuman_army_b` | Loops |  |
| `WH_Particels.other.theresa_cuman_army_c` | Loops |  |
| `WH_Particels.other.theresa_cuman_army_torches` | Loops |  |
| `WH_Particels.other.trebuchet_hit` | Loops | 100 m |
| `WH_Particels.other.ui3d_dustandsmoke` | Loops | 100 m |
| `WH_Particels.other.ui3d_lightshafts` | Loops | 100 m |
| `WH_Particels.other.vomit` | Loops | 30 m |
| `WH_Particels.other.wagon_wheel` | Loops | 25 m |
| `WH_Particels.other.water_bottle` | Loops | 10 m |
| `WH_Particels.other.water_bucket` | Loops |  |
| `WH_Particels.other.water_circles` | Loops | 25 m |
| `WH_Particels.other.water_drops` | Once | 2 m |
| `WH_Particels.other.water_drops_mine` | Once |  |
| `WH_Particels.other.water_fountain` | Loops | 2 m |
| `WH_Particels.other.water_fountain_small` | Loops | 15 m |
| `WH_Particels.other.water_fountain_small_bottom` | Loops | 10 m |
| `WH_Particels.other.water_hands` | Loops | 30 m |
| `WH_Particels.other.water_millwheel` | Loops | 50 m |
| `WH_Particels.other.water_millwheel_base` | Loops | 50 m |
| `WH_Particels.other.water_millwheel_top` | Loops | 50 m |
| `WH_Particels.other.water_pouring` | Loops | 2 m |
| `WH_Particels.other.water_ripple` | Loops | 4 m |
| `WH_Particels.other.water_ripple_b` | Loops | 4 m |
| `WH_Particels.other.water_ripple_big` | Loops | 5 m |
| `WH_Particels.other.water_ripple_fountain` | Loops | 3 m |
| `WH_Particels.other.water_splash` | Once | 4 m |
| `WH_Particels.other.wine_pouring` | Loops | 2 m |
| `WH_Particels.other.wine_pouring_fps` | Loops | 2 m |
| `WH_Particels.other.wine_pouring_red` | Loops |  |
| `WH_Particels.other.wine_pouring_white` | Loops |  |
| `WH_Particels.other.wood_smashed` | Loops |  |
| `WH_Particels.smokes.boiling_steam` | Loops | 4 m |
| `WH_Particels.smokes.burned_house_ash` | Loops | 20 m |
| `WH_Particels.smokes.burning_house_a` | Loops | 400 m |
| `WH_Particels.smokes.burning_house_a_rotate` | Loops | 400 m |
| `WH_Particels.smokes.burning_house_b` | Loops | 300 m |
| `WH_Particels.smokes.burning_house_c` | Loops | 300 m |
| `WH_Particels.smokes.burning_house_ground_smoke` | Loops | 120 m |
| `WH_Particels.smokes.chimney` | Loops | 500 m |
| `WH_Particels.smokes.chimney_big` | Loops | 700 m |
| `WH_Particels.smokes.chimney_big_b` | Loops | 700 m |
| `WH_Particels.smokes.chimney_big_scale_rotate` | Loops | 500 m |
| `WH_Particels.smokes.chimney_big_scale_rotate_dark` | Loops | 500 m |
| `WH_Particels.smokes.chimney_small` | Loops | 400 m |
| `WH_Particels.smokes.chimney_wide` | Loops | 160 m |
| `WH_Particels.smokes.incense_burning` | Loops | 80 m |
| `WH_Particels.smokes.interior_smoke` | Loops | 80 m |
| `WH_Particels.smokes.smelting_oven_big` | Loops | 130 m |
| `WH_Particels.smokes.smelting_oven_small` | Loops | 130 m |
| `WH_Particels.smokes.smithery` | Loops | 70 m |
| `WH_Particels.smokes.smithery_hardening` | Loops | 10 m |
| `WH_Particels.smokes.smoke` | Loops | 80 m |
| `WH_Particels.smokes.smoke_ammunition` | Loops | 500 m |
| `WH_Particels.smokes.smoke_ammunition_b` | Loops | 215 m |
| `WH_Particels.smokes.smoke_city` | Loops | 300 m |
| `WH_Particels.smokes.smoke_crosscountry_race` | Loops | 40 m |
| `WH_Particels.smokes.smoke_fermentation` | Loops | 100 m |
| `WH_Particels.smokes.smoke_ground_kiln` | Loops | 160 m |
| `WH_Particels.smokes.smoke_hay_s02` | Loops | 80 m |
| `WH_Particels.smokes.smoke_medium_interior` | Loops | 160 m |
| `WH_Particels.smokes.smoke_short_interior` | Loops | 160 m |
| `WH_Particels.smokes.smoke_thin` | Loops |  |
| `WH_Particels.smokes.smoke_thin_b` | Loops |  |
| `WH_Particels.smokes.smoke_white_small` | Loops | 130 m |
| `WH_Particels.smokes.smoke_window_a` | Loops | 180 m |
| `WH_Particels.smokes.smoke_window_b` | Loops | 180 m |
| `WH_Particels.smokes.smokehouse` | Loops | 20 m |
| `WH_Particels.smokes.steam_bath` | Loops |  |
| `WH_Particels.weather.fog_distant` | Loops | 1000 m |
| `WH_Particels.weather.lightning_1` | Once |  |
| `WH_Particels.weather.rain_drops_columbarium` | Loops | 9 m |
| `WH_Particels.weather.rain_drops_edge_1m` | Loops | 6 m |
| `WH_Particels.weather.rain_drops_edge_2m` | Loops | 6 m |
| `WH_Particels.weather.rain_drops_edge_4m` | Loops | 8 m |
| `WH_Particels.weather.rain_drops_edge_8m` | Loops | 10 m |
| `WH_Particels.weather.rain_drops_edge_short_1m` | Loops | 6 m |
| `WH_Particels.weather.rain_drops_edge_short_2m` | Loops | 6 m |
| `WH_Particels.weather.rain_drops_edge_short_4m` | Loops | 8 m |
| `WH_Particels.weather.rain_drops_edge_short_8m` | Loops | 10 m |
| `WH_Particels.weather.rain_drops_gutter` | Loops | 11 m |
| `WH_Particels.weather.wind_fields` | Loops | 100 m |
| `WH_Particels.weather.wind_leaves_forest` | Once | 60 m |
| `WH_Particels.weather.wind_leaves_forest_large` | Once | 60 m |
| `WH_Particels.weather.wind_leaves_tilia` | Once | 60 m |
| `WH_Particels.weather.wind_tornado` | Loops | 70 m |

</details>

<details>
<summary><code>WH_vranik</code> (63)</summary>

| Effect | Plays | Seen from |
| --- | --- | --- |
| `WH_vranik.vranik.arrow_fire` | Loops | 60 m |
| `WH_vranik.vranik.arrows` | Loops |  |
| `WH_vranik.vranik.burned_ground_ash_player` | Loops | 20 m |
| `WH_vranik.vranik.burned_ground_ash_sparks_player` | Loops | 20 m |
| `WH_vranik.vranik.burned_ground_ash_sparks_smoke_player` | Loops | 20 m |
| `WH_vranik.vranik.cutscene_burned_ground_sparks` | Loops | 20 m |
| `WH_vranik.vranik.cutscene_skalice_ground_smoke` | Loops |  |
| `WH_vranik.vranik.cutscene_skalice_ground_smoke_dlc4_ending` | Loops |  |
| `WH_vranik.vranik.dust_ground` | Loops |  |
| `WH_vranik.vranik.dust_player` | Loops | 20 m |
| `WH_vranik.vranik.fire` | Loops | 60 m |
| `WH_vranik.vranik.fire_big` | Loops | 60 m |
| `WH_vranik.vranik.fire_c` | Loops | 500 m |
| `WH_vranik.vranik.fire_c_big` | Loops | 100 m |
| `WH_vranik.vranik.fire_c_vranik` | Loops | 600 m |
| `WH_vranik.vranik.fire_d` | Loops | 100 m |
| `WH_vranik.vranik.fire_e` | Loops |  |
| `WH_vranik.vranik.fire_f` | Loops | 60 m |
| `WH_vranik.vranik.fire_malesov_big` | Loops | 10 m |
| `WH_vranik.vranik.fire_malesov_big_base` | Loops |  |
| `WH_vranik.vranik.fire_malesov_big_ground` | Loops | 10 m |
| `WH_vranik.vranik.fire_malesov_ground` | Loops | 10 m |
| `WH_vranik.vranik.fire_malesov_medium_ground` | Loops | 10 m |
| `WH_vranik.vranik.fire_malesov_roof` | Loops | 45 m |
| `WH_vranik.vranik.fire_malesov_vertical` | Loops | 20 m |
| `WH_vranik.vranik.fire_malesov_window` | Loops | 45 m |
| `WH_vranik.vranik.fire_oillamp_explosion` | Loops | 10 m |
| `WH_vranik.vranik.fire_oillamp_fire` | Loops | 100 m |
| `WH_vranik.vranik.fire_pribyslawitz_nosmoke` | Loops | 10 m |
| `WH_vranik.vranik.fire_small` | Loops | 60 m |
| `WH_vranik.vranik.fire_small_b` | Loops | 20 m |
| `WH_vranik.vranik.fire_vertical` | Loops | 60 m |
| `WH_vranik.vranik.flyingtrash_field` | Loops | 20 m |
| `WH_vranik.vranik.skalice_fire_big` | Loops | 10 m |
| `WH_vranik.vranik.skalice_fire_theresa` | Loops | 100 m |
| `WH_vranik.vranik.skalice_fire_theresa_b` | Loops | 100 m |
| `WH_vranik.vranik.skalice_fire_theresa_camp` | Loops |  |
| `WH_vranik.vranik.skalice_smoke_ground` | Loops | 100 m |
| `WH_vranik.vranik.smoke_ground` | Loops | 100 m |
| `WH_vranik.vranik.smoke_ground_cutscene` | Loops |  |
| `WH_vranik.vranik.smoke_ground_vranik` | Loops | 100 m |
| `WH_vranik.vranik.smoke_huge` | Loops |  |
| `WH_vranik.vranik.smoke_huge_far` | Loops |  |
| `WH_vranik.vranik.smoke_small_rovna` | Loops | 60 m |
| `WH_vranik.vranik.suchdol_arrows` | Loops |  |
| `WH_vranik.vranik.suchdol_dust_gate` | Once | 20 m |
| `WH_vranik.vranik.suchdol_fire_arrows` | Loops | 20 m |
| `WH_vranik.vranik.suchdol_oil` | Loops | 10 m |
| `WH_vranik.vranik.suchdol_oil_fire` | Loops | 10 m |
| `WH_vranik.vranik.suchdol_smoke_huge` | Loops | 400 m |
| `WH_vranik.vranik.suchdol_smoke_huge_b` | Loops | 400 m |
| `WH_vranik.vranik.suchdol_smoke_local` | Loops | 10 m |
| `WH_vranik.vranik.suchdol_smoke_local_b` | Loops | 10 m |
| `WH_vranik.vranik.suchdol_woodcutting` | Once |  |
| `WH_vranik.vranik.suhdol_smoke_shooting` | Loops |  |
| `WH_vranik.vranik.trideni` | Loops |  |
| `WH_vranik.vranik.vlasak_explo_smoke_ground` | Loops |  |
| `WH_vranik.vranik.vlasak_explo_smoke_intensity100` | Loops |  |
| `WH_vranik.vranik.vlasak_explo_smoke_intensity25` | Loops |  |
| `WH_vranik.vranik.vlasak_explo_smoke_intensity50` | Loops |  |
| `WH_vranik.vranik.vlasak_explo_smoke_intensity75` | Loops |  |
| `WH_vranik.vranik.vranik_fire_big_time_a` | Loops | 10 m |
| `WH_vranik.vranik.vranik_fire_big_time_b` | Loops | 10 m |

</details>

<details>
<summary><code>cinematics</code> (193)</summary>

| Effect | Plays | Seen from |
| --- | --- | --- |
| `cinematics.animals.chicken_feathers_01` | Loops |  |
| `cinematics.arrows_and_firearms.arrow_metal` | Loops |  |
| `cinematics.arrows_and_firearms.arrows` | Loops |  |
| `cinematics.arrows_and_firearms.arrows_flying` | Loops |  |
| `cinematics.arrows_and_firearms.cannon` | Loops |  |
| `cinematics.arrows_and_firearms.frontParticleEmitNpc_noshadow` | Loops |  |
| `cinematics.arrows_and_firearms.gunpowder_pouring` | Loops |  |
| `cinematics.arrows_and_firearms.touch_hole` | Loops |  |
| `cinematics.blood.blood_blunt_a` | Loops |  |
| `cinematics.blood.blood_leaking` | Loops |  |
| `cinematics.blood.blood_leaking_pista` | Loops |  |
| `cinematics.blood.blood_slash_a` | Loops |  |
| `cinematics.blood.blood_splash_small` | Loops |  |
| `cinematics.blood.blood_stab_a` | Loops |  |
| `cinematics.blood.blood_stab_b` | Loops |  |
| `cinematics.body_and_fecal.peeing` | Loops |  |
| `cinematics.body_and_fecal.shit_splash(obsolete)` | Loops |  |
| `cinematics.body_and_fecal.sludge_pouring_(cin_m0320t)` | Once |  |
| `cinematics.body_and_fecal.sludge_splash_(cin_m0320t)` | Once |  |
| `cinematics.body_and_fecal.spit` | Once |  |
| `cinematics.body_and_fecal.vomit` | Loops |  |
| `cinematics.dirt.grave_digging` | Once |  |
| `cinematics.dirt.rock_digging_throw` | Once |  |
| `cinematics.dirt.rocks_digging_buildup` | Once |  |
| `cinematics.dirt.rocks_digging_unload` | Once |  |
| `cinematics.dirt.soil_throw_cin` | Once |  |
| `cinematics.dust.charcoal_dust` | Loops |  |
| `cinematics.dust.dust_army_a` | Loops |  |
| `cinematics.dust.dust_army_b_lower` | Loops |  |
| `cinematics.dust.dust_ground_01` | Loops |  |
| `cinematics.dust.dust_ground_01_0370t_nophysics` | Loops |  |
| `cinematics.dust.dust_ground_01_b` | Loops |  |
| `cinematics.dust.dust_ground_01_m0370t` | Loops |  |
| `cinematics.dust.dust_ground_01_m0370t_noshadow` | Loops |  |
| `cinematics.dust.dust_ground_01_noshadow` | Loops |  |
| `cinematics.dust.dust_ground_02` | Loops |  |
| `cinematics.dust.dust_stone` | Loops |  |
| `cinematics.dust.sweep_dark` | Loops |  |
| `cinematics.dust.sweep_no_wind` | Loops |  |
| `cinematics.explosion.ammunition_explosion` | Loops |  |
| `cinematics.explosion.ammunition_explosion_nowave` | Loops |  |
| `cinematics.explosion.barrel_explosion` | Loops |  |
| `cinematics.explosion.barrel_explosion_no_fire` | Loops |  |
| `cinematics.explosion.barrel_explosion_s1150t` | Loops |  |
| `cinematics.explosion.dust_and_planks_catacombs` | Loops | 4 m |
| `cinematics.explosion.dust_explosion` | Loops |  |
| `cinematics.explosion.dust_explosion_02` | Loops |  |
| `cinematics.explosion.explosion_m4450k` | Loops |  |
| `cinematics.explosion.explosion_m4450k_brick` | Once |  |
| `cinematics.explosion.nebakov_explosion` | Loops | 4 m |
| `cinematics.explosion.nebakov_explosion_dustandplanks` | Loops | 4 m |
| `cinematics.explosion.nebakov_explosion_rocks` | Loops | 4 m |
| `cinematics.explosion.talmberk_bridge_down` | Loops |  |
| `cinematics.explosion.talmberk_grate_down` | Loops |  |
| `cinematics.explosion.torch_fall` | Loops | 30 m |
| `cinematics.explosion.trebuchet_hit` | Loops |  |
| `cinematics.falling.dust_falling` | Loops |  |
| `cinematics.falling.dust_falling_b` | Loops |  |
| `cinematics.falling.dust_falling_c` | Loops |  |
| `cinematics.falling.dust_falling_m1140t` | Loops |  |
| `cinematics.falling.dust_falling_s4050k` | Loops |  |
| `cinematics.falling.falling_rocks_dust` | Loops |  |
| `cinematics.falling.rocks_falling_m12` | Once |  |
| `cinematics.falling.window_glass(cin_m1250t)` | Loops |  |
| `cinematics.fires.alchemy_fireplace_big` | Loops | 12 m |
| `cinematics.fires.alchemy_fireplace_big_far` | Loops | 100 m |
| `cinematics.fires.fatwood_noglow` | Loops | 20 m |
| `cinematics.fires.fire_big_a` | Loops | 30 m |
| `cinematics.fires.fire_big_a_nosmoke` | Loops | 30 m |
| `cinematics.fires.fire_devil` | Loops | 20 m |
| `cinematics.fires.fire_door_a` | Loops | 60 m |
| `cinematics.fires.fire_door_b` | Loops | 60 m |
| `cinematics.fires.fire_door_c` | Loops | 60 m |
| `cinematics.fires.fire_dream` | Loops | 500 m |
| `cinematics.fires.fire_old` | Loops | 10 m |
| `cinematics.fires.fire_torch_infinite_distance` | Loops | 100 m |
| `cinematics.fires.fire_torch_longdistance_no_glow` | Loops | 100 m |
| `cinematics.fires.fire_torch_longdistance_nosparks` | Loops | 100 m |
| `cinematics.fires.fire_torch_norefr` | Loops | 60 m |
| `cinematics.fires.fire_torch_norefr_noglow` | Loops | 60 m |
| `cinematics.fires.fire_torch_refr` | Loops | 60 m |
| `cinematics.fires.fire_torch_refr_noglow` | Loops | 60 m |
| `cinematics.fires.sparks` | Loops | 100 m |
| `cinematics.flying.bees_250` | Loops | 25 m |
| `cinematics.flying.bokeh_a` | Loops |  |
| `cinematics.flying.bokeh_dream` | Loops |  |
| `cinematics.flying.bokeh_dream_brighter` | Loops |  |
| `cinematics.flying.butterfly` | Loops | 20 m |
| `cinematics.flying.butterfly_1x1` | Loops | 20 m |
| `cinematics.flying.firefly` | Loops | 50 m |
| `cinematics.flying.firefly2` | Loops | 50 m |
| `cinematics.flying.firefly3` | Loops | 50 m |
| `cinematics.flying.flying_dandelion_01` | Loops |  |
| `cinematics.flying.flying_dandelion_02_slower_less` | Loops |  |
| `cinematics.flying.flying_dandelion_03` | Loops |  |
| `cinematics.flying.flying_dandelion_04` | Loops |  |
| `cinematics.flying.flying_dust` | Loops |  |
| `cinematics.flying.flying_dust_b` | Loops |  |
| `cinematics.flying.flying_dust_c` | Loops |  |
| `cinematics.flying.flying_straw` | Loops |  |
| `cinematics.horse.horse_dust_stop` | Loops |  |
| `cinematics.horse.horse_gallop_dust` | Loops |  |
| `cinematics.horse.horse_gallop_dust_noshadow` | Loops |  |
| `cinematics.horse.horse_hoof_dust` | Once |  |
| `cinematics.horse.horse_hoof_mud` | Loops |  |
| `cinematics.horse.horse_hoof_mud_intro_cutscene` | Loops |  |
| `cinematics.horse.horse_hoof_water` | Loops |  |
| `cinematics.horse.horse_trot_dust` | Loops |  |
| `cinematics.horse.horse_trot_dust_02` | Loops |  |
| `cinematics.other.apple_mash_pieces` | Loops | 100 m |
| `cinematics.other.dust_hit` | Loops |  |
| `cinematics.other.dust_hit_b` | Loops |  |
| `cinematics.other.nightmare_memory` | Loops |  |
| `cinematics.other.pouring_wine_a` | Loops |  |
| `cinematics.other.rain_render_brothers_dead.rain_render-prvni_plan_brothers_dead_01` | Loops | 100 m |
| `cinematics.other.rain_render_brothers_dead.rain_render-prvni_plan_brothers_dead_02` | Loops | 100 m |
| `cinematics.other.rain_render_brothers_dead.rain_render-prvni_plan_brothers_dead_03` | Loops | 100 m |
| `cinematics.other.rain_render_brothers_dead.rain_render-prvni_plan_brothers_dead_04` | Loops | 100 m |
| `cinematics.other.rain_render_cin_dlc4_ending.ending_p01_01` | Loops | 1000 m |
| `cinematics.other.rain_render_cin_dlc4_ending.ending_p02_01` | Loops | 300 m |
| `cinematics.other.rain_render_cin_dlc4_ending.ending_p02_02` | Loops | 300 m |
| `cinematics.other.rain_render_cin_dlc4_ending.ending_p02_03` | Loops | 1000 m |
| `cinematics.other.rain_render_cin_dlc4_ending.ending_p02_main_02` | Loops | 300 m |
| `cinematics.other.rain_render_cin_dlc4_ending.ending_p03_01_zadni_vchod` | Loops | 100 m |
| `cinematics.other.rain_render_cin_dlc4_ending.ending_p03_02` | Loops | 100 m |
| `cinematics.other.rain_render_cin_dlc4_ending.ending_p03_03` | Loops | 100 m |
| `cinematics.other.rain_render_cin_dlc4_ending.ending_p03_main_01` | Loops | 300 m |
| `cinematics.other.rain_render_cin_dlc4_ending.ending_p03_prvni_plan_01` | Loops | 100 m |
| `cinematics.other.rain_render_cin_dlc4_ending.ending_p04_01` | Loops | 300 m |
| `cinematics.other.rain_render_cin_dlc4_ending.ending_p04_02` | Loops | 300 m |
| `cinematics.other.rain_render_cin_dlc4_ending.ending_p04_03` | Loops | 300 m |
| `cinematics.other.rain_render_cin_dlc4_ending.ending_p04_04` | Loops | 300 m |
| `cinematics.other.stone_hit` | Loops |  |
| `cinematics.smokes.big_smoke` | Loops |  |
| `cinematics.smokes.boiling_steam` | Loops | 100 m |
| `cinematics.smokes.burning_house_a` | Loops | 600 m |
| `cinematics.smokes.burning_house_b` | Loops | 500 m |
| `cinematics.smokes.burning_house_c` | Loops | 300 m |
| `cinematics.smokes.burning_house_c_nowind` | Loops | 300 m |
| `cinematics.smokes.chimney` | Loops | 130 m |
| `cinematics.smokes.chimney_big` | Loops | 120 m |
| `cinematics.smokes.chimney_dark` | Loops | 120 m |
| `cinematics.smokes.chimney_dark_nowind` | Loops | 120 m |
| `cinematics.smokes.chimney_small` | Loops | 120 m |
| `cinematics.smokes.m4850k_chimney_big` | Loops | 120 m |
| `cinematics.smokes.m4850k_chimney_dark_nowind` | Loops | 120 m |
| `cinematics.smokes.smoke_ammunition` | Loops | 215 m |
| `cinematics.smokes.smoke_ammunition_b` | Loops | 215 m |
| `cinematics.smokes.smoke_city` | Loops | 150 m |
| `cinematics.smokes.smoke_ground_small_camera` | Loops | 60 m |
| `cinematics.smokes.smoke_incense` | Loops | 60 m |
| `cinematics.smokes.smoke_puff` | Loops |  |
| `cinematics.smokes.smoke_small` | Loops | 60 m |
| `cinematics.water.Water_drops` | Loops |  |
| `cinematics.water.pouring_water_01` | Loops |  |
| `cinematics.water.splash_big` | Once |  |
| `cinematics.water.splash_small` | Loops | 35.8 m |
| `cinematics.water.steam_bath` | Loops |  |
| `cinematics.water.vine_pouring` | Loops | 2 m |
| `cinematics.water.water_circle` | Loops | 4 m |
| `cinematics.water.water_drops_b` | Once | 2 m |
| `cinematics.water.water_fart` | Loops | 4 m |
| `cinematics.water.water_npc_move` | Loops | 25 m |
| `cinematics.water.water_npc_stand` | Loops | 25 m |
| `cinematics.water.water_player_move` | Loops | 25 m |
| `cinematics.water.water_player_stand` | Loops | 25 m |
| `cinematics.water.water_splash_a` | Loops | 10 m |
| `cinematics.water.water_splash_b` | Loops | 10 m |
| `cinematics.water.water_splash_big` | Loops |  |
| `cinematics.water.water_splash_c` | Loops | 10 m |
| `cinematics.water.water_splash_directional` | Loops | 10 m |
| `cinematics.water.water_swim` | Loops | 50 m |
| `cinematics.weather.fog_ground_01` | Loops |  |
| `cinematics.weather.fog_ground_02` | Loops |  |
| `cinematics.weather.fog_ground_03` | Loops |  |
| `cinematics.weather.fog_ground_river` | Loops |  |
| `cinematics.weather.hot_air` | Loops | 300 m |
| `cinematics.weather.rain_01` | Loops | 100 m |
| `cinematics.weather.rain_01_ig` | Loops |  |
| `cinematics.weather.rain_01_ig_b` | Loops |  |
| `cinematics.weather.rain_01_ig_b_m1290t` | Loops |  |
| `cinematics.weather.rain_02` | Loops | 100 m |
| `cinematics.weather.rain_03` | Loops | 100 m |
| `cinematics.weather.rain_03_ig` | Loops | 100 m |
| `cinematics.weather.rain_04_ig` | Loops | 100 m |
| `cinematics.weather.rain_M1290` | Loops | 50 m |
| `cinematics.weather.rain_fg_ig` | Loops | 50 m |
| `cinematics.weather.rain_fg_ig_rotate` | Loops | 50 m |
| `cinematics.wood.planks_break` | Loops |  |
| `cinematics.wood.sword_handle_trimming` | Loops |  |
| `cinematics.wood.sword_hit_stick` | Loops |  |
| `cinematics.wood.wood_break` | Once |  |
| `cinematics.wood.wood_break_with_water` | Loops |  |

</details>

<details>
<summary><code>collisions</code> (74)</summary>

| Effect | Plays | Seen from |
| --- | --- | --- |
| `collisions.combat.blood_head` | Once |  |
| `collisions.combat.delete` | Loops |  |
| `collisions.combat.destroyed_bow` | Loops |  |
| `collisions.combat.destroyed_crossbow` | Loops |  |
| `collisions.combat.destroyed_longsword` | Loops |  |
| `collisions.combat.destroyed_mace` | Loops |  |
| `collisions.combat.destroyed_polearm` | Loops |  |
| `collisions.combat.destroyed_rifle` | Loops |  |
| `collisions.combat.destroyed_shield` | Loops |  |
| `collisions.combat.destroyed_shortsword` | Loops |  |
| `collisions.combat.flickering` | Loops |  |
| `collisions.combat.hit_blood_animevent_a` | Loops | 100 m |
| `collisions.combat.hit_blood_animevent_b` | Loops | 100 m |
| `collisions.combat.hit_blood_animevent_dagger` | Loops | 100 m |
| `collisions.combat.hit_boulder` | Loops | 100 m |
| `collisions.combat.hit_passed_arrow_fabric` | Loops |  |
| `collisions.combat.hit_passed_arrow_plate` | Loops |  |
| `collisions.combat.hit_passed_blunt` | Loops | 100 m |
| `collisions.combat.hit_passed_blunt_plate` | Loops | 100 m |
| `collisions.combat.hit_passed_blunt_unarmed` | Loops | 100 m |
| `collisions.combat.hit_passed_bullet_fabric` | Loops | 100 m |
| `collisions.combat.hit_passed_bullet_plate` | Loops | 100 m |
| `collisions.combat.hit_passed_stab_fabric` | Loops | 100 m |
| `collisions.combat.hit_passed_sword_fabric` | Loops | 100 m |
| `collisions.combat.hit_passed_sword_plate` | Loops | 100 m |
| `collisions.combat.hit_stopped_arrow_fabric` | Loops |  |
| `collisions.combat.hit_stopped_arrow_plate` | Loops |  |
| `collisions.combat.hit_stopped_mace_plate` | Loops |  |
| `collisions.combat.hit_stopped_sword_fabric` | Loops |  |
| `collisions.combat.hit_unarmed` | Loops |  |
| `collisions.combat.sword_body` | Loops | 100 m |
| `collisions.combat.sword_body_stab` | Loops |  |
| `collisions.combat.sword_plate` | Loops |  |
| `collisions.combat.sword_sword` | Loops |  |
| `collisions.combat.test_blue` | Loops |  |
| `collisions.combat.test_green` | Loops |  |
| `collisions.combat.test_particle` | Once |  |
| `collisions.combat.test_red` | Loops |  |
| `collisions.combat.wooden_sword_wooden_sword` | Loops |  |
| `collisions.destructibles.arrow_ceramics` | Loops | 12 m |
| `collisions.destructibles.arrow_grass` | Loops | 14 m |
| `collisions.destructibles.arrow_metal` | Once | 11 m |
| `collisions.destructibles.arrow_mud` | Once | 14 m |
| `collisions.destructibles.arrow_mudwater` | Loops |  |
| `collisions.destructibles.arrow_plaster` | Loops | 15 m |
| `collisions.destructibles.arrow_sack` | Loops |  |
| `collisions.destructibles.arrow_soil` | Once | 14 m |
| `collisions.destructibles.arrow_stone` | Loops | 15 m |
| `collisions.destructibles.arrow_straw` | Loops | 15 m |
| `collisions.destructibles.arrow_water` | Loops | 50 m |
| `collisions.destructibles.arrow_wood` | Loops | 15 m |
| `collisions.destructibles.bullet_ceramics` | Loops |  |
| `collisions.destructibles.bullet_grass` | Loops |  |
| `collisions.destructibles.bullet_metal` | Loops |  |
| `collisions.destructibles.bullet_mud` | Once |  |
| `collisions.destructibles.bullet_mudwater` | Once |  |
| `collisions.destructibles.bullet_plaster` | Loops |  |
| `collisions.destructibles.bullet_sack` | Loops |  |
| `collisions.destructibles.bullet_soil` | Loops |  |
| `collisions.destructibles.bullet_stone` | Loops |  |
| `collisions.destructibles.bullet_straw` | Loops |  |
| `collisions.destructibles.bullet_wood` | Loops |  |
| `collisions.destructibles.sword_metal` | Once |  |
| `collisions.destructibles.sword_plaster` | Loops |  |
| `collisions.destructibles.sword_stone` | Loops |  |
| `collisions.destructibles.sword_straw` | Loops |  |
| `collisions.destructibles.sword_wood` | Loops |  |
| `collisions.test_smoke.a` | Loops |  |
| `collisions.test_smoke.b` | Loops |  |
| `collisions.water.water_npc_move` | Loops | 25 m |
| `collisions.water.water_npc_stand` | Loops | 25 m |
| `collisions.water.water_objects` | Loops | 25 m |
| `collisions.water.water_player_move` | Loops | 25 m |
| `collisions.water.water_player_stand` | Loops | 25 m |

</details>

<details>
<summary><code>firearms</code> (5)</summary>

| Effect | Plays | Seen from |
| --- | --- | --- |
| `firearms.hand_cannon.frontParticleEmit` | Loops |  |
| `firearms.hand_cannon.frontParticleEmitNpc` | Loops |  |
| `firearms.hand_cannon.topParticleEmit` | Loops |  |
| `firearms.hand_cannon.topParticleEmitHorseback` | Loops |  |
| `firearms.hand_cannon.topParticleEmitNpc` | Loops |  |

</details>

<details>
<summary><code>particles_smithery</code> (8)</summary>

| Effect | Plays | Seen from |
| --- | --- | --- |
| `particles_smithery.particles_smithery.hammering_hit` | Once |  |
| `particles_smithery.particles_smithery.hammering_hit_strong` | Once |  |
| `particles_smithery.particles_smithery.handle_steam` | Loops |  |
| `particles_smithery.particles_smithery.hardening_cool_down` | Loops |  |
| `particles_smithery.particles_smithery.refraction` | Loops |  |
| `particles_smithery.particles_smithery.sharpening` | Loops |  |
| `particles_smithery.particles_smithery.sharpening_fail` | Loops |  |
| `particles_smithery.particles_smithery.sparks` | Loops |  |

</details>

<details>
<summary><code>particles_water</code> (12)</summary>

| Effect | Plays | Seen from |
| --- | --- | --- |
| `particles_water.rapids.eddy_small_a` | Loops |  |
| `particles_water.streams.fishtrap` | Loops | 14 m |
| `particles_water.streams.surface_impact_medium` | Loops | 25 m |
| `particles_water.streams.surface_impact_small` | Loops |  |
| `particles_water.streams.surface_impact_tiny` | Loops |  |
| `particles_water.streams.water_blood_a` | Loops | 80 m |
| `particles_water.streams.water_blood_b` | Loops | 80 m |
| `particles_water.streams.water_stream_a` | Loops | 80 m |
| `particles_water.streams.water_wind` | Loops | 25 m |
| `particles_water.streams.wild_water` | Loops | 100 m |
| `particles_water.streams.wild_water_2` | Loops | 80 m |
| `particles_water.waterfalls.falling_small` | Loops |  |

</details>

<details>
<summary><code>particles_woodcutting</code> (3)</summary>

| Effect | Plays | Seen from |
| --- | --- | --- |
| `particles_woodcutting.cutting.planing_wood_chips` | Loops |  |
| `particles_woodcutting.cutting.wood_chip` | Once |  |
| `particles_woodcutting.cutting.wood_split` | Once | 10 m |

</details>

<details>
<summary><code>professions</code> (10)</summary>

| Effect | Plays | Seen from |
| --- | --- | --- |
| `professions.blacksmith.burning_iron` | Loops |  |
| `professions.blacksmith.burning_iron_sword` | Loops |  |
| `professions.blacksmith.forge_fire` | Loops | 12 m |
| `professions.blacksmith.forge_fire_big` | Loops | 12 m |
| `professions.blacksmith.hammering_hit` | Once |  |
| `professions.blacksmith.hardening` | Loops | 12 m |
| `professions.blacksmith.hardening_npc` | Loops | 15 m |
| `professions.minting.coin_in_hand` | Once |  |
| `professions.minting.coin_throw` | Once |  |
| `professions.washing.close_eyes` | Once |  |

</details>

<details>
<summary><code>ui</code> (1)</summary>

| Effect | Plays | Seen from |
| --- | --- | --- |
| `ui.fog_of_war` | Loops |  |

</details>

<details>
<summary><code>workBehaviors</code> (15)</summary>

| Effect | Plays | Seen from |
| --- | --- | --- |
| `workBehaviors.bathhouse.herbs_crumble` | Loops | 4 m |
| `workBehaviors.bathhouse.herbs_water` | Loops | 2 m |
| `workBehaviors.bathhouse.splash` | Loops | 2 m |
| `workBehaviors.bathhouse.splash2` | Loops | 4 m |
| `workBehaviors.bathhouse.splash_3` | Loops | 25 m |
| `workBehaviors.bathhouse.splash_4` | Loops | 25 m |
| `workBehaviors.bathhouse.water_pouring` | Loops | 15 m |
| `workBehaviors.butcher.salt` | Loops | 3 m |
| `workBehaviors.butcher.spice` | Loops | 3 m |
| `workBehaviors.housework.sweeping` | Loops | 7 m |
| `workBehaviors.stonemason.chisel` | Once | 5 m |
| `workBehaviors.stonemason.pick` | Once | 6 m |
| `workBehaviors.woodwork.chopping` | Once | 8 m |
| `workBehaviors.woodwork.cutting` | Once |  |
| `workBehaviors.woodwork.sawing` | Loops | 5 m |

</details>

<!-- /generated:effects -->
