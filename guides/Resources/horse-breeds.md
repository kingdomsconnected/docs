---
title: Horse breeds
description: Every breed Horse.spawn knows by name, with the in-game name and the soul GUID behind it.
sidebar:
  label: Horse breeds
  order: 113
---

A breed is a horse the game gives a character of its own: the ones its traders sell, the named
horses of its quests, and `horse`, the generic riding horse.
[`Horse.spawn`](../../reference/server/classes/Horse.md#spawn) takes the breed name or the soul
GUID, and [`Horse.breeds`](../../reference/server/classes/Horse.md#breeds) lists the names.

```ts
Horse.spawn(player.position, undefined, "pebbles", `${player.nickname}'s horse`);
```

A named horse wears its own tack when the game gives it some, and any other a common set. Pass
a gear argument to change that: see [Horse gear](../horse-gear/) and
[Horses](../../npcs-and-animals/horses/).

<!-- generated:breeds -->

| Breed | Name in game | Soul | Soul GUID |
| --- | --- | --- | --- |
| `horse` | Horse | `animal_horse` | `fc0e6251-b314-4398-b83f-3a66a52961ee` |
| `acorn` | Acorn | `tsem_sukHorse` | `08cf11e6-1786-43f1-84bc-17f9084c912e` |
| `aethon` | Aethon | `prepadeni_horsePtacek` | `40b4e92a-8d88-446a-3822-70f6dc57ddaf` |
| `agro` | Agro | `kgru_buresHorse` | `cce04ba3-9170-4bde-a422-9bd6078d27d0` |
| `arion` | Arion | `utokNaNebakov_caponsHorse` | `90f91c60-49fc-4a2b-8154-f612f060480a` |
| `artax` | Artax | `kmal_horseForSale_2` | `94219ce7-1665-4098-8848-d4751f3b43c5` |
| `attila` | Attila | `ttro_bergovHorse` | `99465ad8-6021-4bbe-af56-a1e3f1a23c64` |
| `basarab_of_mondra` | Basarab of Mondra | `ksta_horse_2` | `63415fa6-4b96-4a8a-a72c-f6d3081d6189` |
| `bentlie` | Bentlie | `ztracenyTovarys_puskoHorse` | `8820846d-8e3d-47be-a83c-bf20d54db87a` |
| `bibiana` | Bibiana | `tneb_bibiana` | `bb702580-5ea3-4438-8ce2-632fb7b7ef83` |
| `bill` | Bill | `kgru_horseForSale_2` | `66bbccb7-4f45-455a-8b47-b946b6bc1b72` |
| `bitterklee` | Bitterklee | `tsem_horseForSale_3` | `5c9d68fd-dcb9-4c1d-91d8-6edd0ff6da4c` |
| `boudica` | Boudica | `hladAZmar_boadiceaHorse` | `3b37e775-d36b-4b56-9987-b13694506ceb` |
| `bronka` | Bronka | `tneb_horse_16` | `c362be26-5390-41cf-889f-c5e8a017f175` |
| `caballus` | Caballus | `kmal_horseCaponKutnohorsko` | `2e2de7d7-5173-4731-88a6-eaaaf7451421` |
| `chon` | Chon | `tvez_horse_3` | `ae053778-2bb3-4b2e-b3dd-fdb39b0fe2de` |
| `crow` | Crow | `kmal_horseForSale_6` | `aa926f0c-c07d-4015-b995-10238e8ec201` |
| `curca_of_mondra` | Curca of Mondra | `ksta_horse_3` | `3b0c48c4-72e7-4291-a9a1-86bd66cae254` |
| `dietrich` | Dietrich | `kkut_dietrich` | `9751ee5f-49ae-4108-9d95-080288d239ca` |
| `dragonfly` | Dragonfly | `ttkc_vosycka` | `74d93621-d457-4870-9e3e-ecbf41701c6d` |
| `dzar` | Dzar | `tvez_horse_4` | `b20d8d1a-f4a5-40af-9a1a-f09fc515abf0` |
| `erdel` | Erdel | `kmal_horseForSale_5` | `33fccfe6-45fe-4b7a-bafb-7fa3580a67b2` |
| `first_of_a_thousand` | First of a Thousand | `tvez_horse_2` | `2f91a84b-36ac-4980-8343-90f9634004e2` |
| `gavora` | Gavora | `kkut_horseForSale_2` | `de1aeac2-a7f6-4cde-bfff-d9a55703cbe1` |
| `gringolet` | Gringolet | `kzik_gringolet` | `91420991-084a-4504-96d0-9d3fa32c408d` |
| `hector` | Hector | `kcer_hektor` | `6d79656e-362c-410b-8fc3-b82f2473af81` |
| `henri` | Henri | `krat_horseBrabantNamed` | `c0e61814-5fa6-41ac-9889-480ce790f3e7` |
| `herring` | Herring | `nebakovPruzkum_herynk` | `f4f05c70-fa06-4e68-b390-0857fddfa1bb` |
| `hide_n_hair` | Hide'n'hair | `tvid_horse_2` | `fec9e888-c5a2-47fd-afba-49f4d5356c94` |
| `jarmilka` | Jarmilka | `tsem_seminsrHorse` | `59cbc2d4-a915-4f99-8d3e-d750d42d6a49` |
| `kaduk` | Kaduk | `papezskyLegat_horse_komar` | `5d58ed68-d06e-4ce5-bb6f-e5bf801ffc3c` |
| `kasztanka` | Kasztanka | `kmal_horseForSale_3` | `464d41f3-b530-4145-bd5e-48a8c8e0c971` |
| `khartoum` | Khartoum | `kmal_horseForSale_1` | `61c78acd-7777-4d6b-9c1b-f5103d986ba7` |
| `kincsem` | Kincsem | `kkut_horseForSale_1` | `9cf58e3f-ccee-4f3a-9c3e-a9caf4aaaccc` |
| `kluger_hans` | Kluger Hans | `kgru_horseForSale_1` | `fcf0601f-2305-47ec-9ddd-97252cc28449` |
| `mark` | Mark | `kgru_horseForSale_6` | `7c19f542-39d8-4d6d-ac1c-e7d948b5caa2` |
| `meadow` | Meadow | `knab_horse_1` | `7f58ced0-7332-45e3-968c-2e7038d90d71` |
| `medousa` | Medousa | `kcer_meduza` | `2540999f-8ae6-45e9-bbb7-be79c4146d2b` |
| `napoli` | Napoli | `kkut_horseForSale_3` | `f691093f-1224-4db6-941d-6b9d32907d31` |
| `pazdero` | Pazdero | `rodinnaChlouba_racingHorse` | `ff369b90-297b-401a-96a6-0ba52daee611` |
| `pebbles` | Pebbles | `tsem_sedivka` | `4e5abeff-f19e-0eab-0921-a24611c4ad8f` |
| `pepik` | Pepik | `tvid_huntsmansHorse` | `40a00dcf-ffbb-7a0b-dcb3-058db2ac4796` |
| `phantom_horse` | Phantom horse | `katuvSleh_horse` | `a0eabf26-ba9c-4a3d-a2b5-851376fa7150` |
| `pike` | Pike | `tvid_horse_1` | `9f6911bd-4fe3-40f0-a7d1-6a2224cefb55` |
| `pisek_lad` | Pisek Lad | `kkut_horseForSale_4` | `dc4588cd-c039-40a5-9d61-f0bea8693099` |
| `schkrle` | Schkrle | `tneb_zizkaHorse` | `4dff075b-4097-45bd-8f07-e152e6cd0621` |
| `shlamhak` | Shlamhak | `kmal_horseForSale_4` | `aa7fbfa0-5004-4526-84ea-0be603f44f08` |
| `siegfried` | Siegfried | `kkut_siegfried` | `2b354297-f038-44aa-80f9-6e3c9b8b72c2` |
| `slug` | Slug | `kcer_kubenkaHorse` | `905b8952-fa01-4819-8d39-346dd20af4b3` |
| `snorter` | Snorter | `ttkc_frkacek` | `53891928-bd6c-454c-b64a-f6ebf47d23a1` |
| `soldier` | Soldier | `tsem_horseForSale_2` | `e39e9f8c-6604-4e34-90fd-4be29da50ad2` |
| `stein` | Stein | `tneb_erikHorse` | `7b6b77da-649d-4a2d-826a-9e227883fab5` |
| `svadilfari` | Svadilfari | `kgru_horseForSale_3` | `aafd240c-3d57-436d-a4f3-7a4afbe83319` |
| `tarant` | Tarant | `tsem_horseForSale_1` | `73df796d-0a9a-428a-8146-9b4349cb7c61` |
| `tooth` | Tooth | `tvez_horse_1` | `c1e6b81c-59b0-4f90-b836-883544bae06a` |
| `veillantif` | Veillantif | `kgru_horseForSale_5` | `22fa6644-17cc-4e52-9e94-39eb47c5e712` |
| `vranik` | Vranik | `poustevnik_vranik` | `73bd40d1-ded8-4278-9d8b-cc552de2f309` |
| `windwurf` | Windwurf | `kgru_horseForSale_4` | `fdb3bd79-a95c-471d-9e32-0f589bdc3638` |

<!-- /generated:breeds -->
