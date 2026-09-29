---
title: Horse gear and tack presets
description: Every saddle, bridle, caparison and horseshoe a horse can wear, by slot, and the game's own tack presets.
sidebar:
  label: Horse gear
  order: 114
---

A horse wears four slots: `saddle`, `head`, `torso` and `shoe`. Each takes an item class from
[`Horse.gearItems`](../../reference/server/classes/Horse.md#gearitems) by name or GUID, and a
preset from [`Horse.gearPresets`](../../reference/server/classes/Horse.md#gearpresets) fills
them all at once.

```ts
horse.setGear("horse_noble05");
horse.equipGear("BasicSaddle01_m01");
horse.setGear({ saddle: "BasicSaddle01_m01", head: null, torso: null, shoe: null });
```

`setGear` throws on an item that is not horse gear or sits in the wrong slot, and `{}` leaves the
horse bare. See [Horses](../../npcs-and-animals/horses/#change-its-gear) for the gear events and the lock.

## Items by slot

<!-- generated:items -->

<details>
<summary><code>saddle</code>: Saddles (153)</summary>

| Item class | GUID |
| --- | --- |
| `BasicSaddle01_m01` | `12427009-3f05-45f4-81f4-c8163b3a8543` |
| `BasicSaddle01_m02` | `95fdc8c1-9c4a-4d69-b398-9708b1760478` |
| `BasicSaddle01_m03` | `66c02e00-86a3-49ee-94d6-6b007e4fb7b3` |
| `BasicSaddle01_m04` | `c1c03e61-2d2a-4ece-8426-426a52c58c14` |
| `BasicSaddle01_m05` | `8509c519-4a13-4b63-be62-182b9c392c1e` |
| `BasicSaddle01_m06` | `03319c8e-1096-4ef0-80ae-c52de29a9fbb` |
| `BasicSaddle01_m07` | `e7c5ad73-951d-43e7-8722-8006a79393d2` |
| `BasicSaddle01_m08` | `980969f0-fe14-4faf-9ab9-18b98762f518` |
| `BasicSaddle01_m09` | `381c996c-7c8b-416b-a217-5fbb483b22ca` |
| `BasicSaddle01_m10` | `d859030d-12f4-4af5-babb-043839d20b71` |
| `BasicSaddle01_m11` | `7dc67d5d-30bc-4bd0-8f0d-210854390dfd` |
| `BasicSaddle01_m12` | `1b23dccf-4b1f-4156-9441-f438dd662244` |
| `BasicSaddle02_m01` | `80058304-bb23-45fa-83a4-e632d89c1938` |
| `BasicSaddle02_m02` | `0c044d3b-508e-4da2-bb9b-e57f7e457827` |
| `BasicSaddle02_m03` | `9b456bd7-f2a9-4603-a658-0d568a4c5094` |
| `BasicSaddle02_m04` | `3cb68c2a-dccc-41be-8515-626ed0756b97` |
| `BasicSaddle02_m05` | `ff65c42b-b3de-4347-b01f-36626bf4c1ee` |
| `BasicSaddle02_m06` | `4cbec1f9-335e-4ad2-822f-12771f82ad68` |
| `BasicSaddle02_m07` | `966760b0-75c6-4387-ae57-8c5238f09df9` |
| `BasicSaddle02_m08` | `85983427-faf2-48e1-a700-2aa4da881e5d` |
| `BasicSaddle02_m09` | `f66fc83f-074e-447a-ab41-361887c47a2a` |
| `BasicSaddle02_m10` | `55a4a336-9617-4f9d-b4a3-c98d263da72e` |
| `BasicSaddle02_m11` | `9c6158cf-5f30-4aef-bcef-d665505c3623` |
| `BasicSaddle02_m12` | `52bae50a-2cc3-498a-8736-04ac6a31fd12` |
| `BasicSaddle03_m01` | `8007b1d2-6179-49bb-a9eb-132bfc1b0ab6` |
| `BasicSaddle03_m02` | `b6bd8d57-2d4c-442c-9a6e-522142af25ed` |
| `BasicSaddle03_m03` | `2e343e8a-2c21-4794-8c7d-7ee11f720676` |
| `BasicSaddle03_m04` | `e72d851c-0da3-43fa-9433-fa8f60ae4bea` |
| `BasicSaddle03_m05` | `3350f93c-2b8b-4c83-ae3f-9e85cd67497f` |
| `BasicSaddle03_m06` | `d51bb072-916b-4235-85d2-ddba645c1c93` |
| `BasicSaddle03_m07` | `3ae53d22-43b5-47c8-9486-de739e4eabde` |
| `BasicSaddle03_m08` | `155571e4-ff66-4f2b-848a-01f78ed44b4b` |
| `BasicSaddle03_m09` | `e576ae73-6422-46ca-9898-5e6f35f5c654` |
| `BasicSaddle03_m10` | `9e770c83-7d7c-4fa4-b7a2-35ea7ea1c1c5` |
| `BasicSaddle03_m11` | `02de7fc4-7679-4fd1-925d-36683b2bd9a1` |
| `BasicSaddle03_m12` | `0b51c334-71e2-4c20-bbe4-ba7d4037d25a` |
| `EastSaddle01_m01` | `2939fb92-50f8-4ad0-9afc-deba97a38a1a` |
| `EastSaddle01_m02` | `0f517dbf-ae9b-44eb-990c-e941e8151596` |
| `EastSaddle01_m03` | `f74034d0-58b3-4ebf-8dca-b7ba3abd1940` |
| `EastSaddle01_m04` | `da944680-fbc0-431f-ac4a-4a64c32e3856` |
| `EastSaddle01_m05` | `17032eaf-2ff4-4803-b671-79eaccaa4743` |
| `EastSaddle01_m06` | `f2ee862e-852b-4980-a4e6-bc0a69d144fb` |
| `EastSaddle01_m07` | `6ae2fa40-7ceb-4067-99ef-54a86a7c6b2d` |
| `EastSaddle01_m08` | `36b6f37d-41e3-4899-9335-f83dff408f25` |
| `EastSaddle01_m09` | `bbad295d-76a4-4897-a71c-52f950135473` |
| `EastSaddle01_m10` | `bb05ba08-8f51-43c3-a51e-15339aa50660` |
| `EastSaddle01_m11` | `fe9b01ba-71d8-4892-bc59-d72f5317139c` |
| `EastSaddle01_m12` | `81b4ef33-4e2d-4e0f-98d4-967c7352ab8e` |
| `EastSaddle02_m01` | `dc7c6cb2-9a46-4499-ac63-e9af6633a1ff` |
| `EastSaddle02_m02` | `dd37d5f4-74e1-4ef5-a3a0-38682eef40ae` |
| `EastSaddle02_m03` | `da93d293-ffa9-4841-8dd3-242a5b7876c5` |
| `EastSaddle02_m04` | `9d583a73-9102-417b-a6ef-317fc9c975fd` |
| `EastSaddle02_m05` | `cf32fddc-8d4f-4fb2-8efa-fbdfbf7de711` |
| `EastSaddle02_m06` | `c894d31f-95cd-446a-a4ad-d01fedf7b589` |
| `EastSaddle02_m07` | `4b324fef-6385-4a50-b355-f73e797dc657` |
| `EastSaddle02_m08` | `c675ab1d-995f-4b35-aa8a-ba5b62dbe4a2` |
| `EastSaddle02_m09` | `e04237cb-356d-4012-b9b4-54981beb1c8a` |
| `EastSaddle02_m10` | `11f99643-7fc3-4ba3-95ea-178467c3ec75` |
| `EastSaddle02_m11` | `5740fe7f-019c-45e7-b220-b21b2ac9bd17` |
| `EastSaddle02_m12` | `c2e04911-14d5-44d6-9d82-e2ad0b7ced82` |
| `horseTrading_cheapSaddle` | `bf06d242-4dcb-48e9-bbf1-b6a36f368a57` |
| `mountedArchery_slowingSaddle` | `615fc0ae-4f14-43f5-9c3b-8308e828e9ad` |
| `NobleSaddle01_m01` | `ae7eb079-4570-4f9c-8002-5de375d4421c` |
| `NobleSaddle01_m02` | `63a38e69-225a-4d82-91ee-20018557d402` |
| `NobleSaddle01_m03` | `d761189b-9ac2-4fa0-bdc8-cb59d1845957` |
| `NobleSaddle01_m04` | `a3d98538-60f4-4051-9704-bd57aa9b5f7f` |
| `NobleSaddle01_m05` | `9112f383-0216-42e1-a017-bff80f2e8d7b` |
| `NobleSaddle01_m06` | `92f84b58-ae79-4429-bed8-de43c09e402b` |
| `NobleSaddle01_m07` | `2913fe30-7252-475d-96d7-5ee408fd38df` |
| `NobleSaddle01_m08` | `74e56615-5cfb-458b-bc73-95bab7d81ebe` |
| `NobleSaddle01_m09` | `1265d185-9915-4509-8536-bef531fb6164` |
| `NobleSaddle01_m10` | `0f929cb0-58c7-44a7-9df7-0b4339070bec` |
| `NobleSaddle01_m11` | `e09d7e78-7524-469d-ad75-d0d48d5d2d85` |
| `NobleSaddle01_m12` | `93768d06-15a4-4d81-a69c-cc52f4329291` |
| `NobleSaddle01_m13` | `cafb850b-23a4-4a59-a500-4cd27eb15799` |
| `NobleSaddle01_m14` | `3f19b164-cc5b-4444-b7ef-6a0da1fe960e` |
| `NobleSaddle02_m01` | `ed154d31-b836-4c4c-a8c8-3b00c2f6b6b3` |
| `NobleSaddle02_m02` | `a3ce6197-7b02-406e-9afd-e0da5828f506` |
| `NobleSaddle02_m03` | `db9eb8f0-ba77-48a8-a657-91eaa1018114` |
| `NobleSaddle02_m04` | `be99e748-2fca-4363-a102-d0d83343e844` |
| `NobleSaddle02_m05` | `c1238997-86be-4803-aa98-7b27eae9cd9c` |
| `NobleSaddle02_m06` | `ab02705b-9c90-43b9-97f5-35ef70ebb595` |
| `NobleSaddle02_m07` | `6d712946-f8a0-4b51-b863-c21812413427` |
| `NobleSaddle02_m08` | `4fbe6287-9b35-4608-948c-ed5c487d726f` |
| `NobleSaddle02_m09` | `1ca6a63a-0522-42b1-a60a-e8295a0c03f1` |
| `NobleSaddle02_m10` | `c86b79b0-3214-478b-aac7-96ebe0be793b` |
| `NobleSaddle02_m11` | `d464f9be-c088-459c-aaf3-60beef6905b9` |
| `NobleSaddle02_m12` | `fd74329c-eaba-4c72-a774-527b099dad3d` |
| `NobleSaddle02_m13` | `aa2c10e4-145c-49bb-9e9c-afcdc3468fc6` |
| `NobleSaddle02_m14` | `51636329-c3b8-489f-ac74-a10993153063` |
| `NobleSaddle02_m15` | `34758735-e07e-40e0-9c04-9665106331c9` |
| `NobleSaddle03_m01` | `fd6c8a0a-96b9-4b20-a0f0-01f52637ae9e` |
| `NobleSaddle03_m02` | `82242945-dcc8-4b6d-aec9-e12b80ff6f29` |
| `NobleSaddle03_m03` | `53a6b283-0ad9-48da-ad2e-c5537ee64cd4` |
| `NobleSaddle03_m04` | `fcf843c9-d15b-4bc7-8f02-b5988249f944` |
| `NobleSaddle03_m05` | `e28e1ff1-d463-4bd7-8f1a-1d06e76f9a27` |
| `NobleSaddle03_m06` | `24f9ef85-28a0-40df-8733-fd670a072b3f` |
| `NobleSaddle03_m07` | `0757f25f-041f-4467-832f-9d3dc838a868` |
| `NobleSaddle03_m08` | `b9a5ba14-c3c5-41d3-bf74-ec68fee3c65a` |
| `NobleSaddle03_m09` | `c18e7087-592a-4eb0-a242-aa5630a50130` |
| `NobleSaddle03_m10` | `5d5dad3d-3f5f-45c2-a066-f7d001c0857c` |
| `NobleSaddle03_m11` | `90fa13dd-120b-43e2-b743-a03ed8e2cb96` |
| `NobleSaddle03_m12` | `0a01129a-00f2-455c-ac7c-3a69922b8f56` |
| `NobleSaddle03_m13` | `f2c54b43-48aa-4c71-9201-484147e7e85b` |
| `NobleSaddle03_m14` | `6454ac78-049e-441c-80de-7e5e7263b913` |
| `Saddle_placeholder` | `51297fea-ac38-4dae-ae93-5f7ad66e7f28` |
| `WarSaddle01_m01` | `5643a2b2-7400-44a9-8022-2f30f094e75b` |
| `WarSaddle01_m02` | `9443c076-6645-45c7-8b4e-551853339f52` |
| `WarSaddle01_m03` | `5fdac6a0-470b-4020-9b13-d94f90a969a5` |
| `WarSaddle01_m04` | `ecaf3259-5425-4006-9b0f-e758bd3de3b3` |
| `WarSaddle01_m05` | `e8549d6b-d220-4e00-b513-a5231441ad71` |
| `WarSaddle01_m06` | `527ae1dd-fd0c-4c6a-8ff3-5cc4ce2ca401` |
| `WarSaddle01_m07` | `96d902a0-3368-4505-a989-a040593910c0` |
| `WarSaddle01_m08` | `fa7be428-e2f9-46dd-bfd3-f3191e025455` |
| `WarSaddle01_m09` | `65525bbe-86c4-4d36-8869-f4cdb309532f` |
| `WarSaddle01_m10` | `7d0c6354-eb5e-47a8-bd88-f5800cdef639` |
| `WarSaddle01_m11` | `95144a64-4cbd-4166-baec-d5f02cef5285` |
| `WarSaddle01_m12` | `0094cf41-f12f-498e-ac87-9c6206263c70` |
| `WarSaddle01_m13` | `976e5898-8d71-4d28-88a9-4c056fb7f776` |
| `WarSaddle01_m14` | `c99cce7d-c007-4402-bfde-4b6a17fff4e3` |
| `WarSaddle02_m01` | `57c34487-7433-4d5a-92d8-fe680bbd5a86` |
| `WarSaddle02_m02` | `52774f52-cd99-4783-a864-a19aa3dca586` |
| `WarSaddle02_m03` | `5201189d-794d-4c2b-8bcb-7a9a0c861b5d` |
| `WarSaddle02_m04` | `5b832791-6195-4b8f-895b-8ad85f7fa5b9` |
| `WarSaddle02_m05` | `0f8c83fe-3516-42cc-9034-32a8d072132f` |
| `WarSaddle02_m06` | `9b80d61a-b073-42ea-9ec1-57d255b8e90b` |
| `WarSaddle02_m07` | `2426bf31-8534-4d37-9b5f-447cd0a0eb63` |
| `WarSaddle02_m08` | `8b1bf03d-f100-4432-b91e-95de8ba06aec` |
| `WarSaddle02_m09` | `dddee287-f803-4e89-bb42-02c06d668f1a` |
| `WarSaddle02_m10` | `807a742a-8c89-422c-b0cc-64f8210558dd` |
| `WarSaddle02_m11` | `4d5634b0-bd29-4432-89f5-93929b2ffc86` |
| `WarSaddle02_m12` | `b50334bd-3e7f-46a5-af8d-61373569fabd` |
| `WarSaddle02_m13` | `79c7e1fd-bfcc-4c26-b3eb-fb4f9be42ab8` |
| `WarSaddle02_m14` | `7b0ddc96-1ac8-45c3-9f06-fca440c2fde6` |
| `WarSaddle03_m01` | `9be0331e-e07d-4055-9c12-d16c91b80f37` |
| `WarSaddle03_m02` | `7dfc1c15-6452-4cf6-9d41-2ca7fb8a8252` |
| `WarSaddle03_m03` | `fb253378-030c-465e-83bf-8af0bbd9e00c` |
| `WarSaddle03_m04` | `ca526ec9-d923-4cf3-a1cb-ced43bdc2f72` |
| `WarSaddle03_m05` | `13b7e805-3c51-4c0e-93f2-de54d2e46e5d` |
| `WarSaddle03_m06` | `7d61ceeb-5230-46c5-a610-8b7ec0d7b091` |
| `WarSaddle03_m07` | `e9bba790-bae7-4b97-a683-8fc8c14e7ad1` |
| `WarSaddle03_m08` | `4146da70-95fe-4776-9ce5-6bc54ebaa566` |
| `WarSaddle03_m09` | `b5869d5e-86d6-4648-9eca-abd536fbae7a` |
| `WarSaddle03_m10` | `52015519-f75a-494e-8487-327169c844de` |
| `WarSaddle03_m11` | `c949589a-3cdb-4eb6-9504-37add6cddb81` |
| `WarSaddle03_m12` | `7b885bcf-a60e-4722-baed-1601d6fafaf6` |
| `WarSaddle03_m13` | `29935052-4849-447f-938e-3b84348cd6fe` |
| `WarSaddle03_m14` | `77d53928-9c9f-44a0-9f60-a50d4751b78d` |
| `WarSaddle03_m15` | `741b60fa-d7e2-44f4-86bf-925c3d12be9d` |
| `YokeDouble01Left` | `467f8539-39b0-475d-97d9-126f3036a3b2` |
| `YokeDouble01Right` | `a880782f-37f7-4047-8ce7-37992109154c` |
| `YokeSingle01` | `0958776d-8528-4480-b0e3-df127362e0c1` |
| `YokeUniversal01` | `25423384-b6c9-45ff-a915-d8514e4629b1` |

</details>

<details>
<summary><code>head</code>: Bridles and chanfrons (103)</summary>

| Item class | GUID |
| --- | --- |
| `BasicBridle01_m01` | `6ebbf914-5917-4ce0-850b-caf2c04f6562` |
| `BasicBridle01_m02` | `eff39384-5a02-4cc5-89d8-4717824480bc` |
| `BasicBridle01_m03` | `8033fb08-2fbb-40fd-88a0-db257ea7409a` |
| `BasicBridle01_m04` | `d9277418-34a7-42c5-8514-03e1f1d4850f` |
| `BasicBridle01_m05` | `aa4fe572-9442-4184-8dba-d8c91efd3700` |
| `BasicBridle01_m06` | `3a8dc292-52a2-4140-82af-eaa8737a52e9` |
| `BasicBridle01_m07` | `9fc5c8ee-4b81-4e99-8b84-b2fa60b833b5` |
| `BasicBridle01_m08` | `fb6859ba-cda9-417b-926c-97e2357d51df` |
| `BasicBridle01_m09` | `7093c5df-79d8-41f3-9e9d-f3227072b875` |
| `BasicBridle01_m10` | `d6da5adc-f3aa-4e20-b65e-903971bbe55a` |
| `BasicBridle02_m01` | `49d08322-10f6-4f56-b9ae-ceb8b62d5c52` |
| `BasicBridle02_m02` | `c2749a78-ed35-4df9-a7e9-0942bc8ccc9d` |
| `BasicBridle02_m03` | `4ed20d32-2ae9-4eae-8b66-4f017eeb59ab` |
| `BasicBridle02_m04` | `e6ea8edc-0c8a-4e93-9ba2-0b2c67cfd336` |
| `BasicBridle02_m05` | `89001105-166c-4276-b92c-da1b6bb83805` |
| `BasicBridle02_m06` | `596212ea-ce9b-4b8c-af09-278ae2d834bb` |
| `BasicBridle02_m07` | `21f1f549-1bbb-479c-8368-0ee986dc7636` |
| `BasicBridle02_m08` | `c5d6da49-48b0-461c-b7ae-eb16b0599b15` |
| `BasicBridle02_m09` | `9c4be44a-ddcf-4829-9cf4-71f0161c5108` |
| `BasicBridle02_m10` | `6f04d4c1-d6bf-440b-a199-f6a081843558` |
| `BasicBridle03_m01` | `3a865dd3-3380-456a-9818-7b96efe83876` |
| `BasicBridle03_m02` | `c68f7174-ae53-4d75-ac92-88c54eccc452` |
| `BasicBridle03_m03` | `3fed5dda-18f1-4e5e-b1f8-471a0f7d1241` |
| `BasicBridle03_m04` | `e6352ea6-c400-4284-ae13-dc2c04e6ea4b` |
| `BasicBridle03_m05` | `ded459e9-fb6f-4225-8d8f-2ff70300884d` |
| `BasicBridle03_m06` | `cbe3909c-1d76-4ef8-94bd-7c419ead48f9` |
| `BasicBridle03_m07` | `84ef8a68-a21b-4227-83be-a3d69bcbe7af` |
| `BasicBridle03_m08` | `59823877-63a1-4e97-8c5f-e3e5db024823` |
| `BasicBridle03_m09` | `c0b3273b-5121-49ae-ae0e-95c35634ff2d` |
| `BasicBridle03_m10` | `98a01fba-7694-4f59-8e6f-0e68364bf850` |
| `Bridle_placeholder` | `58b3b141-7bde-49a8-a201-3b9bf4167d35` |
| `CartBridle01_m01` | `7bca8097-7d3c-4d5d-8de0-9c336de7761d` |
| `CartBridle01_m02` | `6ef6d6e4-f2de-48e2-851a-810f2699c0a4` |
| `CartBridle01_m03` | `b4802f55-cb4c-40aa-965a-a62a2e62c022` |
| `CartBridle01_m04` | `0bc067ff-f27c-4ab8-bd10-b37a9a2491cf` |
| `Chanfron_placeholder` | `05913089-eb8b-4964-9af8-4f8bf65a6055` |
| `CumanChanfron01_m01` | `8193888e-7412-4304-b2f5-6448c0d1047e` |
| `EastBridle02_m01` | `f0107fc6-4be0-4f17-94df-5413a93a6228` |
| `EastBridle02_m02` | `a6855c72-1caf-4e4c-9ceb-c128f4b19d09` |
| `EastBridle02_m03` | `8b6afb40-e9b0-4b82-afda-7c134a521d77` |
| `EastBridle02_m04` | `dadc9db2-ff5d-4845-901d-fcf9504bcd4e` |
| `EastBridle02_m05` | `662663b9-61ae-4378-a2a6-b3c82beea544` |
| `EastBridle02_m06` | `1fa14c25-19b0-455a-9fff-592a3fddf336` |
| `EastBridle02_m07` | `cf252e68-842d-4e7d-a597-d07938c14439` |
| `EastBridle02_m08` | `6bbc8afd-602d-4181-99cc-4b5cdd64cf44` |
| `EastBridle02_m09` | `153b4fff-7a69-4425-bb31-fa74034f5d78` |
| `EastBridle02_m10` | `54bfe970-e84d-453d-9fd0-8da0eaa178a7` |
| `horseTrading_cheapBridle` | `505343b8-b5ff-4f47-94d9-470a1977a421` |
| `loot_rattayBridle` | `43f00e08-e8c1-462c-897f-447ad7ab37f0` |
| `mountedArchery_slowingBridle` | `b1622382-1065-4c74-bf2f-c9eea9fd4002` |
| `NobleBridle01_m01` | `68204d36-5d4d-412e-9b37-8bce360952f3` |
| `NobleBridle01_m02` | `c3deaeec-4712-4e2b-bd95-20b3a8c2b549` |
| `NobleBridle01_m03` | `8e9765b9-4cc8-4cbf-9013-873946960aab` |
| `NobleBridle01_m04` | `c8542eac-f3ed-4799-8cb9-e60d3ed84c85` |
| `NobleBridle01_m05` | `38524c97-f740-4e37-b65a-ea332e3e4385` |
| `NobleBridle01_m06` | `236a25e6-232a-431f-9541-7b4bb3ac41b6` |
| `NobleBridle01_m07` | `95a500fb-89e3-45fc-a058-15335899b0bf` |
| `NobleBridle01_m08` | `a3d02b6b-e8ef-4727-8548-9bac4b627124` |
| `NobleBridle01_m09` | `3c865190-3414-4fd0-8a1c-3d8e018209d1` |
| `NobleBridle01_m10` | `23cf705b-f472-4fa8-a623-ed6ccf36e022` |
| `NobleBridle02_m01` | `72eb952b-3354-4e70-8c54-5c9a33fb9f91` |
| `NobleBridle02_m02` | `8d8c6878-5e2e-4d05-8518-4da978492031` |
| `NobleBridle02_m03` | `caccef17-3530-4e16-9c1b-09f3972eb400` |
| `NobleBridle02_m04` | `5ae64694-f455-411a-a33d-dfc91c95a199` |
| `NobleBridle02_m05` | `478b934c-025e-4313-acfc-bc1e699d1a95` |
| `NobleBridle02_m06` | `8af9135b-2b6e-442b-a6c7-c9d8ea4530d4` |
| `NobleBridle02_m07` | `83003a9e-8c50-4a48-976b-f9fde08145a5` |
| `NobleBridle02_m08` | `34168b55-f1d6-4f52-9f2c-d1373a8b4269` |
| `NobleBridle02_m09` | `aecfd845-a69d-4e69-9cdb-49026eda4924` |
| `NobleBridle02_m10` | `f854687f-fc8a-4c51-93d9-98535bd75731` |
| `NomadBridle01_m01` | `0caed7dc-b9cb-48f3-8960-7f39b3e8b71b` |
| `WarChanfron01_m01` | `77f4d779-aeea-4937-a36c-74d17eb2cb15` |
| `WarChanfron01_m02` | `c195f864-5154-4df2-ac14-b552f9be8dc6` |
| `WarChanfron01_m03` | `15fbc2fb-af46-4765-9ffd-0ed63f596b3b` |
| `WarChanfron01_m04` | `e6e2e301-8df2-41ba-b55d-935118da72f4` |
| `WarChanfron01_m05` | `e6cc44a4-d5c3-4dfc-8198-d0a902f5d6bd` |
| `WarChanfron01_m06` | `df55ebd0-b61c-4a82-88c6-0c20a2335e0c` |
| `WarChanfron01_m07` | `f9cbfaff-21fb-48a8-b10d-d97585b10201` |
| `WarChanfron01_m08` | `fbeadf50-89c1-476c-bc32-96b3249a59ef` |
| `WarChanfron01_m09` | `3d70fc92-440d-4177-85e1-6c702d185059` |
| `WarChanfron01_m10` | `5b7fd800-e9a2-48a7-97d1-3afd561dea39` |
| `WarChanfron02_m01` | `2a119cb9-20a9-466a-982b-645b6fc733ac` |
| `WarChanfron02_m02` | `d8738c2c-9a40-4393-a2a8-01e3ae5f3b3a` |
| `WarChanfron02_m03` | `891e6272-8792-435c-ad17-0f0d04fc4ede` |
| `WarChanfron02_m04` | `fe4c4894-b916-4d35-b403-2280dac4975c` |
| `WarChanfron02_m05` | `93c91306-67dd-446a-8d3d-67de866d97df` |
| `WarChanfron02_m06` | `db7e8637-31de-4287-ad28-ee779ff4c25d` |
| `WarChanfron02_m07` | `b2350448-fdc8-4ac3-84dc-263a1a0fc64c` |
| `WarChanfron02_m08` | `fff81d9e-65b0-49a9-a41d-48d67bd3fbd0` |
| `WarChanfron02_m09` | `b0102119-cab9-4d52-b473-f99a938ad083` |
| `WarChanfron02_m10` | `b6f33840-7bfe-4ce8-aa6c-5151207682fd` |
| `WarChanfron03_m01` | `cc619b0e-2c49-4b2f-9029-163301396b79` |
| `WarChanfron03_m02` | `1144ac54-351f-44d2-a713-a525f5d1fd19` |
| `WarChanfron03_m03` | `637a1bcc-a03a-4733-98b0-df7be1ef6d18` |
| `WarChanfron03_m04` | `29f86d3a-4bf2-4c0f-b177-94fa7027b23c` |
| `WarChanfron03_m05` | `ddba3782-b343-4bf1-9142-225b49e2c976` |
| `WarChanfron03_m06` | `4f638b4b-adb2-4782-b3de-0bb93ddf8429` |
| `WarChanfron03_m07` | `69aa0f16-b6ef-4cd8-affc-a6c5e1a20331` |
| `WarChanfron03_m08` | `881032cf-cd77-4b76-b8de-d3cfac5a21fe` |
| `WarChanfron03_m09` | `fc9ea950-6d10-4353-9197-ea2a437fdca0` |
| `WarChanfron03_m10` | `a7863748-175b-4ff5-bcc1-77a914fe1068` |
| `WarChanfron03_mMessenger` | `32432cd2-9f55-4107-984a-091755410155` |
| `WarChanfron04_mPros` | `7d394b2f-ff88-4f95-8bb1-c593c6305500` |

</details>

<details>
<summary><code>torso</code>: Caparisons and trappings (269)</summary>

| Item class | GUID |
| --- | --- |
| `BasicHarness01_m01` | `14b87250-c51b-43bc-b8af-abaa7e192102` |
| `BasicHarness01_m02` | `a0f0411b-78f9-4e13-aaee-2db04706021d` |
| `BasicHarness01_m03` | `1d979689-a035-44d8-adad-4e6068a74714` |
| `BasicHarness01_m04` | `5c93de8b-a82c-45ed-9d69-466d71d5056f` |
| `BasicHarness01_m05` | `6f3c3b10-687a-480c-93dc-771b063250c6` |
| `BasicHarness01_m06` | `215b3118-14aa-4576-ace0-e14c96785314` |
| `BasicHarness01_m07` | `88b82d1f-dd8d-4546-b3fa-73d3f2356552` |
| `BasicHarness01_m08` | `94fdc2b1-95a3-4519-a1c6-093c2a854009` |
| `BasicHarness01_m09` | `ecd94ac4-e8f0-48c4-95e4-729685ca8f28` |
| `BasicHarness01_m10` | `b5e1afb0-d067-486a-9d8e-0b4a278c43ee` |
| `BasicHarness01_m11` | `132977d7-bfe2-466d-ba43-f7328beb8f86` |
| `BasicHarness01_m12` | `b0f581d8-b787-4489-bb7b-b5fd049d1e43` |
| `BasicHarness01_m13` | `156d7c44-9882-4951-a1a5-bb6717a665e6` |
| `BasicHarness01_m14` | `5f2ae2c5-b557-4399-a01e-4d7de16bfa49` |
| `BasicHarness02_m01` | `353e4bb0-d365-4281-8a47-a5ab9d694c62` |
| `BasicHarness02_m02` | `1017710d-9585-4416-9a14-92c271ff0077` |
| `BasicHarness02_m03` | `1da7e68f-e06d-4417-bac8-901350da15b7` |
| `BasicHarness02_m04` | `d358142b-ba22-422a-ac40-9f6613776bc4` |
| `BasicHarness02_m05` | `3793a429-6d49-4542-a263-bd6f16425790` |
| `BasicHarness02_m06` | `4967ecb7-3dae-4390-a9a2-6a0f08a4b92e` |
| `BasicHarness02_m07` | `10378077-c05f-4fd3-ab2e-627a969e51b3` |
| `BasicHarness02_m08` | `88455b1c-c518-4ebf-a637-90852153dddd` |
| `BasicHarness02_m09` | `4ed167e1-9712-464c-9b34-032ab10b3b20` |
| `BasicHarness02_m10` | `aa12cf71-7816-40da-9b1b-a5cef0874dda` |
| `BasicHarness02_m11` | `928226ee-b328-4c29-b2aa-6a3aec846972` |
| `BasicHarness02_m12` | `88ad09e8-f339-4f9f-8b26-2572e58c5023` |
| `BasicHarness02_m13` | `3a7911af-8a5b-4038-890a-90cd4f66c1a4` |
| `BasicHarness02_m14` | `9a91b09f-bcc2-4bc5-9505-7822f59826af` |
| `BasicHarness03_m01` | `b2cff226-0f20-4bb4-be37-21b03d8b932f` |
| `BasicHarness03_m02` | `10aa607a-06eb-497f-86cf-3a5afc931657` |
| `BasicHarness03_m03` | `67878a6d-91b7-4ba2-9fec-939496d61b38` |
| `BasicHarness03_m04` | `911df0af-e8c8-4ff6-b487-a13f29cefe38` |
| `BasicHarness03_m05` | `9671fc3f-0734-4866-8586-ff174189a59f` |
| `BasicHarness03_m06` | `8dbd1400-754b-4e84-ba7d-5e0bb36401b2` |
| `BasicHarness03_m07` | `aaee1995-16c8-4c35-af8e-f9f17f7f66b1` |
| `BasicHarness03_m08` | `9253e9d4-41ba-4ded-bb04-5b6860f8ea57` |
| `BasicHarness03_m09` | `cab8d2b3-ffe8-4341-aab1-eb4c7d020f21` |
| `BasicHarness03_m10` | `ddf60ba6-e7e9-4823-85fb-220ba1086886` |
| `BasicHarness03_m11` | `0ff0a7d1-8f34-4e5f-a71a-5d83faf890ca` |
| `BasicHarness03_m12` | `cc358866-4314-4c97-80ae-d1849f6203ed` |
| `BasicHarness03_m13` | `8afad34e-877e-4e3b-aa51-787288c22e21` |
| `BasicHarness03_m14` | `303572e5-fdcf-4241-a710-f557fa51c6b2` |
| `BasicHarness03_m15` | `fcb39e3e-138a-4072-8234-92df6c366327` |
| `Caparison01_m01` | `c21df618-bf34-4532-9ee2-06e32914d732` |
| `Caparison01_m02` | `23f1afa6-51b3-4053-81d3-e1b64460a8c8` |
| `Caparison01_m03` | `013be77f-e0e9-44d4-af3a-8888ebc0d6fd` |
| `Caparison01_m04` | `0a768dfe-859f-4db8-9ce1-18ad29b9206c` |
| `Caparison01_m05` | `ca590f8c-5c65-4a56-ab70-acf8f6a2426f` |
| `Caparison01_m06` | `59015337-0b25-458c-80dd-b35af648a599` |
| `Caparison01_m07` | `15bcd913-3ce3-4ab7-82c5-16a9ee61c286` |
| `Caparison01_m08` | `72b01b0c-fae2-4f5d-9bac-4ec905586767` |
| `Caparison01_mLeipa` | `2e062fed-74d0-4c00-b566-56a64be719cc` |
| `Caparison01_mLeipa01` | `b65ceba3-a532-45be-8d82-dc6a202f98dc` |
| `Caparison01_mPros` | `36694031-e85d-4547-8054-5e67b51aa8fe` |
| `Caparison01_mRuhard` | `fd4b04c1-6400-449d-8471-75980518cace` |
| `Caparison01_mRuhard02` | `95d5e043-2bba-43dc-8897-4ea8c64ae68a` |
| `Caparison01_mSemin` | `e6c56923-4062-451c-8a83-39aa76977b00` |
| `Caparison01_mSemin02` | `f1657cbd-97f4-45f3-948b-68ec3962027e` |
| `Caparison02_m01` | `e3d5498a-4869-476d-9edd-8561df9f2931` |
| `Caparison02_m02` | `f0dc849e-2439-40d7-9a8c-8d629f77f9a5` |
| `Caparison02_m03` | `4b59331b-2dbe-4831-ac2a-4453935e4342` |
| `Caparison02_m04` | `77d38e9d-a374-4a16-930f-b5ca6bd86f49` |
| `Caparison02_m05` | `0a5439f2-0145-4eb5-9301-f3d2f614dc53` |
| `Caparison02_m06` | `d842004a-b83f-4768-8551-a2fe0bbfe0a4` |
| `Caparison02_m07` | `55d6ad0e-011e-4a3e-93ec-1c7f582edf63` |
| `Caparison02_m08` | `2ca11fcf-c0a1-4424-97cc-9538c3a5be7c` |
| `Caparison02_mTeuton` | `aef0433b-a68a-4429-8432-1c6c975f709b` |
| `Caparison03_m01` | `665005e3-8f19-477e-a10c-6cb665ce1df9` |
| `Caparison03_m02` | `b50bc28e-7a5a-4ec7-92a6-454800f158e9` |
| `Caparison03_m03` | `26566627-402c-4d3f-adf8-2aa205194b0e` |
| `Caparison03_m04` | `010dace9-e80f-49db-b744-968a2a05b3ed` |
| `Caparison03_m05` | `d0864235-80e2-4077-9586-8316c95a3bcb` |
| `Caparison03_m06` | `74c05b8b-6461-4e24-a344-99a48197c503` |
| `Caparison03_m07` | `f5c64a03-c38c-4736-8805-28f743646ff9` |
| `Caparison03_m08` | `51f8ae21-65c9-424f-b0ef-3ab7453714a8` |
| `Caparison03_mLeipa` | `a57afc93-b952-461b-8dfa-18ba1a446431` |
| `Caparison03_mLeipa01` | `972175ab-00fc-471b-ae1d-6d257a18ad58` |
| `Caparison03_mLeipa02` | `5979f0c3-bf55-4bd5-9d91-f4dc08902257` |
| `Caparison03_mLeipa03` | `9902f662-a748-4765-b78a-23b1fc91333f` |
| `Caparison03_mRuthard` | `1e0ac4a2-00f9-4d50-b80e-0e3033bf12ba` |
| `Caparison03_mRuthard02` | `96fd2a94-7570-473a-b4ba-7b64829247f7` |
| `Caparison03_mSemin` | `2c972710-02d1-41e0-83cd-8de8f9bc7216` |
| `Caparison04_m01` | `27467b6f-a8d8-498b-9297-b8eaba69e80c` |
| `Caparison04_m02` | `f8307be9-ec64-4934-953b-cbea36aa4b2d` |
| `Caparison04_m03` | `dea605c7-2f09-4d49-af83-6224d036bc21` |
| `Caparison04_m04` | `97c45588-7a43-432e-b364-913159035351` |
| `Caparison04_m05` | `903e2f21-996c-487b-aa2c-ec31d246f937` |
| `Caparison04_m06` | `676a72d3-c088-477b-9fd5-47c0c65d18fb` |
| `Caparison04_m07` | `c0da574d-f21f-4d6f-916f-eeeca45d895b` |
| `Caparison04_m08` | `644aeef7-5230-4912-a7d7-a021e5674df6` |
| `Caparison05_m01` | `3a098596-5bb6-405c-b7b5-70cdff8db673` |
| `Caparison05_m02` | `a8308a40-31ae-459f-8a93-d82de04efd15` |
| `Caparison05_m03` | `dfb5ebaf-70d3-4db8-8eae-340a225bb452` |
| `Caparison05_m04` | `08488293-63b5-42c6-803a-8d547d425925` |
| `Caparison05_m05` | `8ce6b2ec-d2bb-45a3-bbd1-4574d293607c` |
| `Caparison05_m06` | `bb84ffa6-211c-4fd3-9771-873f9f939dc1` |
| `Caparison05_m07` | `8d345816-ec28-4f71-8fdb-79438308df70` |
| `Caparison05_m08` | `bbfb564d-768f-4252-8998-91edcf2cab86` |
| `Caparison_placeholder` | `6fad7800-d0b6-41dc-96c3-a0b7821c341b` |
| `CaparisonBrunswig_m01` | `d4fb7944-20da-47b1-bf93-03bc58176793` |
| `Harness_placeholder` | `dd2d35f2-7078-469b-af26-9afd81248f8c` |
| `HorsePadded_placeholder` | `100baec1-374a-44f2-b901-22a8b7fd7390` |
| `loot_rattayHarness` | `185f823e-5e4e-42ee-a8c3-9c995bebad88` |
| `mountedArchery_slowingCaparison` | `6d5b1977-32b4-4d30-a33c-ccf2fbfa6d41` |
| `NobleCaparison01_m01` | `85a133ab-cc0a-4106-a414-375e6b7f2af2` |
| `NobleCaparison01_m02` | `bc25c392-64c3-4e37-b1d4-4f96edfb6b0e` |
| `NobleCaparison01_m03` | `a5cebc2e-f901-4dcc-82f9-638ee0daa7a5` |
| `NobleCaparison01_m04` | `0d7bd42b-f495-4ff6-80a3-ef99475d583e` |
| `NobleCaparison01_m05` | `c14ede14-3138-4d0a-8e32-b1d985fff226` |
| `NobleCaparison01_m06` | `52379cdf-9749-423e-815d-c1e5591f3ed1` |
| `NobleCaparison01_m07` | `465c20ef-f2fa-442e-9de0-6343ca7b5ff4` |
| `NobleCaparison01_m08` | `2ef6ca4c-ea3d-45ce-923c-42d084ae6bf9` |
| `NobleCaparison01_m09` | `bb8fd4b8-70dd-46d8-9d31-bb830b1e582f` |
| `NobleCaparison01_m10` | `00acd76f-fdbe-4552-bffa-6640832af8e3` |
| `NobleCaparison01_m11` | `25c4d2e8-2368-431d-86af-b8c10c5c79ae` |
| `NobleCaparison01_m12` | `4ac37359-e55c-4dc9-a39a-c4b70ad5c29d` |
| `NobleCaparison01_mJezek` | `e99a819c-612b-4842-b6d8-6ecf35113ae7` |
| `NobleCaparison01_mLeipa` | `34f3b6e7-f251-4199-b86f-c8782c8a7758` |
| `NobleCaparison01_mLeipa02` | `288d5d7e-e87d-457e-a174-04f31cf66d71` |
| `NobleCaparison01_mTwitch` | `bfc06521-05ed-44cb-a022-88be09a2dca7` |
| `NobleCaparison02_m01` | `4d8c778d-144a-4bd5-9163-70d7ecd24338` |
| `NobleCaparison02_m02` | `6896df33-18f7-42c0-ba5e-108a5ea07f38` |
| `NobleCaparison02_m03` | `a77065c6-7bae-41ba-8e34-9ad7242c2792` |
| `NobleCaparison02_m04` | `538d406b-3706-4e12-8cc5-48078a1d52cc` |
| `NobleCaparison02_m05` | `57ac2f43-bcb5-4b5c-a2b8-8a9be75bfb46` |
| `NobleCaparison02_m06` | `5f4e4f67-794c-467c-9a30-a8436b5cad5a` |
| `NobleCaparison02_m07` | `08cd152e-0a78-4119-930d-64762e3605b0` |
| `NobleCaparison02_m08` | `a024c830-5e59-4677-9337-10cd088ec636` |
| `NobleCaparison02_m09` | `51b5c2ca-be2b-4e8d-9022-17ab74a63523` |
| `NobleCaparison02_m10` | `670b8480-23f6-4f37-818b-80d4c1143d53` |
| `NobleCaparison02_m11` | `8631c168-3b26-4955-adc7-916753140f5b` |
| `NobleCaparison02_m12` | `6df3efcb-27f6-41fe-8ca4-5105c9a1a6d3` |
| `NobleCaparison02_m13` | `bb97b80c-1f12-497b-9bba-66923c2b19e7` |
| `NobleCaparison02_m14` | `e9b2dae4-fcf1-4ac7-8a0c-4b65af20e6fd` |
| `NobleCaparison02_mLeipa` | `d18c67a0-e117-4530-86ea-514e67ce60fe` |
| `NobleCaparison02_mLeipa02` | `8c14ac92-cc83-45c1-82b1-6554183807a1` |
| `NobleCaparison02_mMarkvart` | `c36d9fa2-3484-487e-9fd6-4eea23bf4bf5` |
| `NobleCaparison03_m01` | `072c4a0f-3efc-4c9d-9ea0-cf9b577477fd` |
| `NobleCaparison03_m02` | `bda66810-1255-4c97-b179-3b1b03025591` |
| `NobleCaparison03_m03` | `871018f4-bad4-4f44-b29c-6c36e2a6dbcf` |
| `NobleCaparison03_m04` | `50bc4d3d-7e67-4a75-88b6-c94bdf9630bd` |
| `NobleCaparison03_m05` | `d07daf9e-46df-4347-9529-6492d74cf45e` |
| `NobleCaparison03_m06` | `2d0b520e-a7b1-499e-bbb9-82b0dc76fbd2` |
| `NobleCaparison03_m07` | `4fc291cc-93e9-4a92-ab43-41e0f3dcd09e` |
| `NobleCaparison03_m08` | `51cbe92d-f11f-4475-bf76-2d5a04626ae2` |
| `NobleCaparison03_m09` | `d1f96b94-2a78-4663-9d44-af5a39997d83` |
| `NobleCaparison03_m10` | `fb36885b-8df0-4353-b36c-fe0f9c65b61f` |
| `NobleCaparison03_m11` | `a8626b5b-6d74-4e0b-b992-cee6922f0629` |
| `NobleCaparison03_m12` | `53b03774-0e9e-471c-a546-dc8e2cf77436` |
| `NobleCaparison03_m13` | `93ccb74f-8b86-41c1-8eca-7dbd8f2214f6` |
| `NobleCaparison03_m14` | `23daff23-428c-42a1-bc43-7ba432f58423` |
| `NobleCaparison03_mLeipa` | `455154ff-87a2-4892-a001-80708edc0f46` |
| `NobleCaparison03_mLeipa02` | `37140c46-727e-41a6-afca-2eebccaf4616` |
| `NobleCaparison04_m01` | `477c944b-27cb-4d76-99ef-4f7e6b7eb1e4` |
| `NobleCaparison04_m02` | `d31186b6-d0b2-4ba7-a387-95ffb8b0dd07` |
| `NobleCaparison04_m03` | `bdd98236-3fd2-411c-8194-cfc6b5dfeffe` |
| `NobleCaparison04_m04` | `401abd48-c45c-4df3-ab8f-ee4f5be626db` |
| `NobleCaparison04_m05` | `fbafb20c-9473-4b37-9fe6-d9e877e2b2cc` |
| `NobleCaparison04_m06` | `35a5693e-891a-4239-a8a3-dc35cdf84574` |
| `NobleCaparison04_m07` | `1ac8e65c-6154-4884-a03f-7ec679a6b036` |
| `NobleCaparison04_m08` | `af0e44c7-8fc5-4186-a6fb-d2d57a563a67` |
| `NobleCaparison04_m09` | `5bb37b12-c268-4abb-bb83-f31e8631ec79` |
| `NobleCaparison04_m10` | `dc2f0283-5570-462c-ba36-afab924034e3` |
| `NobleCaparison04_mMarkvart` | `2428b944-b184-4e9a-9faa-58c778003c48` |
| `NobleCaparison05_m01` | `3d44de66-b34c-476d-98eb-f280b07d88c0` |
| `NobleCaparison05_m02` | `93109d78-7b6c-4b26-b2cd-51aae8d0ea3d` |
| `NobleCaparison05_m03` | `96a5ce7a-6c6f-45bc-b4ea-1c0a2e4cdbd3` |
| `NobleCaparison05_m04` | `2b714d8b-8753-43f4-a82d-8cfe414d3dab` |
| `NobleCaparison05_m05` | `308cfc8d-64a7-4726-8539-48f878e31733` |
| `NobleCaparison05_m06` | `dcb8c5a6-df67-4ee9-afb9-e59d86e855de` |
| `NobleCaparison05_m07` | `82c19843-4254-427b-812b-53bf8a939845` |
| `NobleCaparison05_m08` | `f05b9cd0-ca30-4393-8540-033083861182` |
| `NobleCaparison05_m09` | `c92bf1cf-0513-4870-91ce-b96e8b6b95b1` |
| `NobleCaparison05_m10` | `b89ca515-a4b8-4073-b172-e12989df5ac6` |
| `NobleCaparison06_m01` | `1dcc68e2-20d6-44da-bf31-fd5ccf16a1fd` |
| `NobleCaparison06_m02` | `796890cb-0aa0-4aad-9cae-8c65c9eb752a` |
| `NobleCaparison06_m03` | `592428d2-6e56-406f-b917-899024ee4427` |
| `NobleCaparison06_m04` | `fd94cd25-cf40-4a9d-b15a-a0df9e67f501` |
| `NobleCaparison06_m05` | `28855f6e-c16a-473d-b16f-43ce0b23b49b` |
| `NobleCaparison06_m06` | `9ebb6fb5-0c6e-4f4b-8ca9-c150666c56f9` |
| `NobleCaparison06_m07` | `11084379-c94c-4a8b-bfe8-5b6214b9c890` |
| `NobleCaparison06_m08` | `ca154752-a639-4b06-9a19-2d6028352465` |
| `NobleCaparison06_m09` | `abf99866-6deb-4de1-a9ba-ee0443cb0db1` |
| `NobleCaparison06_m10` | `d5e78740-a7f3-46f1-acde-b5a0976ebb52` |
| `NobleCaparison06_mLeipa` | `e26ed0c8-91cf-4120-a898-1498856615ff` |
| `NobleCaparison07_m01` | `cef0e663-7cf6-4984-a2a1-ca3a12400aab` |
| `NobleCaparison07_m02` | `faada886-a161-4e3b-9614-9c7243059353` |
| `NobleCaparison07_m03` | `eaaf1591-bcf3-4fb0-8df7-9e6ce4916dda` |
| `NobleCaparison07_m04` | `8f750fcf-e720-40b0-ad39-ef1905c0b5cc` |
| `NobleCaparison07_m05` | `b7bf69c9-e0ff-4c43-a86b-461784805e34` |
| `NobleCaparison07_m06` | `5dce98d4-971d-48f8-89cb-aad53bd70af5` |
| `NobleCaparison07_m07` | `8ccab226-4038-4095-9ba1-5a3934db850d` |
| `NobleCaparison07_m08` | `b2e610f1-4c18-4fa5-8172-248470491aaa` |
| `NobleCaparison07_mLeipa` | `2ec3b1c1-bfbe-4dad-81fe-da4a573b004a` |
| `NobleCaparison08_m01` | `104567b2-f6b0-4726-99b8-bf052a1e8ce1` |
| `NobleCaparison08_m02` | `51e7f495-3abb-4a64-a19a-863afb9e0c4c` |
| `NobleCaparison08_m03` | `46eec158-6f24-4914-83c0-1443b37ebbc2` |
| `NobleCaparison08_m04` | `787f1371-f5d7-4a85-9acb-f1543ef11237` |
| `NobleCaparison08_m05` | `d80678f8-7267-48d5-9868-56c2b17b2354` |
| `NobleCaparison08_m06` | `2dd6589c-5067-48a5-90c0-e6f07a86738e` |
| `NobleCaparison08_m07` | `0bce901c-6370-45f8-abde-3513a566ac5c` |
| `NobleCaparison08_m08` | `257d653c-1aab-4121-a684-c88f91ed93e2` |
| `NobleCaparison08_mErik` | `872ef517-59dc-4c56-a3d6-d6b363f400de` |
| `PaddedCaparison01_m01` | `886aaa70-06e0-4617-a55c-5a3e5fdec2d6` |
| `PaddedCaparison01_m02` | `859c486c-5eaa-4c84-8ef7-3b9b3338b6a2` |
| `PaddedCaparison01_m03` | `54741398-b9b6-4e1e-8280-793af804cbf1` |
| `PaddedCaparison01_m04` | `69e4929c-b5d6-46b0-a36e-92829fbc898c` |
| `PaddedCaparison01_m05` | `34b86ba5-95f4-449a-9f9c-df5f13ff938a` |
| `PaddedCaparison01_m06` | `66be7eb2-923e-4d8d-9652-49b0563141df` |
| `PaddedCaparison01_m07` | `6766fb76-17ac-4acd-ac87-4e47b949b997` |
| `PaddedCaparison01_m08` | `f836869b-013a-4040-a209-c936cb56bdcb` |
| `PaddedCaparison01_m09` | `fb66efee-3aa6-4d87-aa76-647e4a2b75d6` |
| `PaddedCaparison01_m10` | `7a33f459-476b-4e3f-92b5-5c6de67ea002` |
| `PaddedCaparison01_mLeipa` | `cb464bd2-9504-48b2-b8ac-de5452dd73b1` |
| `PaddedCaparison01_mLeipa01` | `37ca1d69-60dd-476b-a488-43b266c51c9f` |
| `PaddedCaparison01_mRuthard` | `20060d35-0347-4ee7-b1b5-06766d6f5285` |
| `PaddedCaparison01_mRuthard02` | `b8b6e1ad-4f3c-4163-ae84-73a6462aea26` |
| `PaddedCaparison01_mSemin` | `b2ceb731-81fb-43a1-a0d3-c21066d65a55` |
| `PaddedCaparison01_mSemin02` | `e88ff1c5-203a-4483-b492-6bf81c5633e6` |
| `PaddedCaparison02_m01` | `444cccd2-fc08-4800-8255-cbb19427aee0` |
| `PaddedCaparison02_m02` | `9caff0c8-3f23-4d5e-ae38-f20e8d0049c4` |
| `PaddedCaparison02_m03` | `a1e4191e-e8d7-40c9-ac8f-438ba7e8d6c8` |
| `PaddedCaparison02_m04` | `37686ce9-e122-4a41-b4d5-926cae9ef74f` |
| `PaddedCaparison02_m05` | `1436c206-4208-4215-8402-896e87791cb8` |
| `PaddedCaparison02_m06` | `4f4ddea5-1c57-463e-bd48-6148fb02f23b` |
| `PaddedCaparison02_m07` | `c06fb041-304a-4810-a29d-10a584141744` |
| `PaddedCaparison02_m08` | `0b38b046-f80e-4941-8c85-af9619cc3313` |
| `PaddedCaparison02_m09` | `531bdc22-0cf3-47a8-9565-d20f8d6d263e` |
| `PaddedCaparison02_m10` | `9a9fc522-c626-443d-85d9-2336f6cd62db` |
| `PaddedCaparison02_mRuthard02` | `ac74242c-a20c-4675-a27f-fa78e05b5fba` |
| `PaddedCaparison02_mRuthard03` | `72a1c5f5-0732-4395-a7b6-11075a43f770` |
| `PaddedCaparison02_mSemin` | `08a87c78-3761-4a04-a693-1226c56b0766` |
| `PaddedCaparison02_mSemin02` | `a5d6d4ea-7099-4590-b3f7-138a9660811c` |
| `PaddedCaparison03_m01` | `56e54c14-e049-4473-8a9d-27106dbf5bb9` |
| `PaddedCaparison03_m02` | `df108cd8-72ad-45fc-936e-3cf26e793d0b` |
| `PaddedCaparison03_m03` | `06b506d2-11ea-45a5-b70a-f36e91e002a5` |
| `PaddedCaparison03_m04` | `9c6da684-8448-43d7-b28c-0a7ffa89e180` |
| `PaddedCaparison03_m05` | `8ff7c154-4741-4a2b-bcd0-10c0e5043cc3` |
| `PaddedCaparison03_m06` | `248f40f1-4213-44b6-93b8-d0ee04dc4884` |
| `PaddedCaparison03_m07` | `5eb8fd68-bfc8-41e9-941b-a29ea5b7429a` |
| `PaddedCaparison03_m08` | `61d0e35a-2c53-4646-9852-f097d229bc56` |
| `PaddedCaparison03_m09` | `3a87205f-5988-4d46-9ed9-83e2e19b7731` |
| `PaddedCaparison03_m10` | `ee4b742f-ad10-473c-940e-a743971c28d3` |
| `PaddedCaparison03_mBailiff` | `a5264a2f-8f6f-4de4-b80f-5db4f35ff9a1` |
| `PaddedCaparison03_mLeipa` | `73634299-2c72-48c6-a986-feb001cf8e08` |
| `PaddedCaparison03_mLeipa01` | `2b2a3572-38a6-4787-aa58-2ee4ee00cab0` |
| `PaddedCaparison04_m01` | `ace99cb0-6ec3-46f4-8226-2c5a3301342e` |
| `PaddedCaparison04_m02` | `e9484ee3-cf40-4acf-9ec8-3e297eea3f5f` |
| `PaddedCaparison04_m03` | `350373bb-ea1d-453a-b7c0-9f4a135a9c9b` |
| `PaddedCaparison04_m04` | `71d13987-b003-42c6-85ba-f565b7662b98` |
| `PaddedCaparison04_m05` | `338edf6b-d128-4ee4-afab-d7869fa22873` |
| `PaddedCaparison04_m06` | `78ba17e5-2761-4f59-b2f2-c6af88547f74` |
| `PaddedCaparison04_m07` | `3c28bcae-6724-4465-aa60-3b0364450f34` |
| `PaddedCaparison04_m08` | `978eff03-61a3-4b0d-bb19-33c10101754e` |
| `PaddedCaparison04_m09` | `75d84292-9fe6-4878-a646-8482194b8bed` |
| `PaddedCaparison04_m10` | `58f79fdd-143e-413e-a72f-71bcf3cca192` |
| `PaddedCaparison04_mSemin` | `47c73480-49b4-4788-9a2d-065fbdb7e563` |
| `PaddedCaparison05_m01` | `7281b200-ed5b-4f8a-8ad2-4be277437ca4` |
| `PaddedCaparison05_m02` | `088ce19a-dac6-4243-9055-3f6b8319503e` |
| `PaddedCaparison05_m03` | `2d604b81-801d-45fe-ac88-0a2eae2dbb38` |
| `PaddedCaparison05_m04` | `f31bacdd-7bc7-47f5-a4b8-c907aea56e82` |
| `PaddedCaparison05_m05` | `dd8ed70b-7225-47bb-886b-0514a1d9471f` |
| `PaddedCaparison05_m06` | `a7d4c077-4813-4632-8e1c-4689ed792fe1` |
| `PaddedCaparison05_m07` | `4af690ff-f83b-47d4-a551-449cf7270021` |
| `PaddedCaparison05_m08` | `7084e3e7-a865-47bd-823e-0de2c4ac5c08` |
| `PaddedCaparison05_m09` | `31c45b42-342f-4372-bdaf-02507111a92b` |
| `PaddedCaparison05_m10` | `30e40e6d-6bc0-4543-98e4-f1e0d9678bc9` |
| `PaddedCaparison05_mLeipa` | `e6233a38-9ffb-4ca9-aa52-85d36361a438` |
| `ztracenaCest_jezeksCaparison` | `a5427b6d-f30d-4090-af39-50e793693800` |

</details>

<details>
<summary><code>shoe</code>: Horseshoes (10)</summary>

| Item class | GUID |
| --- | --- |
| `horseshoeFarmer` | `549ab26e-df73-43d6-ac9b-f4f74afec67f` |
| `horseshoeMilitary` | `0faf833f-8e88-40a0-87b8-2669c0e64c03` |
| `horseshoeNoble` | `5ded1ff4-9f81-4179-bb65-f786e6e80560` |
| `horseshoeNomad` | `1dd2863e-0793-49ba-bb82-125af6b31ddc` |
| `horseshoeRacing` | `4934fb15-73c4-4b71-912a-9bab78a53f66` |
| `horseshoeSpecial_phantomHorse` | `651333f0-7ae6-45a1-b9ec-bf0d4701c8e5` |
| `kovaniKatuvSleh_magicHorseshoe` | `651333f0-36d1-4321-975f-bc7833a773eb` |
| `kovaniZavodniPodkovy_caulkinHorseshoe` | `22799e4c-1489-44b1-807f-6bfa3df47425` |
| `mountedArchery_slowingHorseshoes` | `5b821af7-7e7c-48bf-9b45-cc7317b98051` |
| `test_blacksmith_horseshoe` | `7d1be726-749b-4540-8982-da148fc826b5` |

</details>

<!-- /generated:items -->

## Presets

A preset is one of the game's own clothing presets for horses. The four columns show what it
puts in each slot; an empty cell leaves that slot bare.

<!-- generated:presets -->

<details>
<summary><code>horse_common</code> family (20)</summary>

| Preset | Saddle | Head | Torso | Shoe |
| --- | --- | --- | --- | --- |
| `horse_common01` | `BasicSaddle01_m03` | `BasicBridle01_m01` |  | `horseshoeMilitary` |
| `horse_common02` | `BasicSaddle01_m04` | `BasicBridle01_m03` |  | `horseshoeFarmer` |
| `horse_common03` | `NobleSaddle03_m02` | `BasicBridle01_m03` |  | `horseshoeNoble` |
| `horse_common04` | `NobleSaddle03_m04` | `BasicBridle01_m05` |  | `horseshoeNoble` |
| `horse_common05` | `BasicSaddle01_m02` | `BasicBridle01_m02` |  | `horseshoeFarmer` |
| `horse_common06` | `BasicSaddle02_m06` | `BasicBridle01_m05` |  | `horseshoeMilitary` |
| `horse_common07` | `BasicSaddle02_m04` | `BasicBridle03_m02` |  | `horseshoeMilitary` |
| `horse_common08` | `BasicSaddle02_m03` | `BasicBridle01_m04` |  | `horseshoeMilitary` |
| `horse_common09` | `BasicSaddle02_m04` | `BasicBridle03_m01` |  | `horseshoeMilitary` |
| `horse_common10` | `WarSaddle01_m06` | `BasicBridle03_m03` |  | `horseshoeMilitary` |
| `horse_common11` | `WarSaddle01_m03` | `BasicBridle01_m01` |  | `horseshoeMilitary` |
| `horse_common12` | `BasicSaddle03_m05` | `BasicBridle01_m01` |  | `horseshoeNoble` |
| `horse_common13` | `WarSaddle01_m10` | `BasicBridle01_m01` | `BasicHarness01_m01` | `horseshoeNoble` |
| `horse_common14` | `BasicSaddle03_m08` | `BasicBridle02_m07` |  | `horseshoeNoble` |
| `horse_common15` | `BasicSaddle03_m09` | `BasicBridle03_m08` |  | `horseshoeNoble` |
| `horse_common16` | `BasicSaddle03_m06` | `WarChanfron02_m06` | `BasicHarness02_m11` | `horseshoeMilitary` |
| `horse_common17` | `WarSaddle01_m05` | `BasicBridle02_m06` |  | `horseshoeMilitary` |
| `horse_common18` | `BasicSaddle01_m07` | `BasicBridle01_m02` |  | `horseshoeFarmer` |
| `horse_common19` | `WarSaddle01_m14` | `BasicBridle03_m01` |  | `horseshoeNoble` |
| `horse_common20` | `WarSaddle01_m10` | `BasicBridle01_m02` |  | `horseshoeMilitary` |

</details>

<details>
<summary><code>horse_noble</code> family (22)</summary>

| Preset | Saddle | Head | Torso | Shoe |
| --- | --- | --- | --- | --- |
| `horse_noble_05` | `BasicSaddle03_m05` | `NobleBridle01_m01` | `BasicHarness02_m02` |  |
| `horse_noble_06` | `BasicSaddle03_m07` | `NobleBridle02_m01` |  |  |
| `horse_noble01` | `BasicSaddle03_m09` | `BasicBridle01_m02` | `NobleCaparison02_m01` | `horseshoeNoble` |
| `horse_noble02` | `BasicSaddle03_m04` | `BasicBridle03_m04` | `BasicHarness01_m05` | `horseshoeMilitary` |
| `horse_noble03` | `BasicSaddle02_m08` | `BasicBridle02_m08` | `BasicHarness02_m02` | `horseshoeMilitary` |
| `horse_noble04` | `NobleSaddle02_m15` | `NobleBridle01_m01` | `BasicHarness03_m13` | `horseshoeNoble` |
| `horse_noble05` | `NobleSaddle01_m04` | `NobleBridle01_m03` | `NobleCaparison04_m08` | `horseshoeNoble` |
| `horse_noble06` | `NobleSaddle03_m04` | `NobleBridle02_m03` | `NobleCaparison06_m08` | `horseshoeNoble` |
| `horse_noble07` | `WarSaddle02_m09` | `NobleBridle01_m02` |  | `horseshoeNoble` |
| `horse_noble08` | `NobleSaddle01_m06` | `NobleBridle01_m01` | `NobleCaparison08_m08` | `horseshoeNoble` |
| `horse_noble09` | `NobleSaddle03_m09` | `BasicBridle01_m02` | `NobleCaparison03_m08` | `horseshoeNoble` |
| `horse_noble10` | `NobleSaddle01_m13` | `BasicBridle02_m07` | `BasicHarness03_m11` | `horseshoeMilitary` |
| `horse_noble11` | `WarSaddle03_m13` | `WarChanfron03_m07` | `NobleCaparison06_m04` | `horseshoeMilitary` |
| `horse_noble12` | `WarSaddle03_m08` | `NobleBridle01_m04` | `NobleCaparison03_m12` | `horseshoeNoble` |
| `horse_noble13` | `BasicSaddle02_m12` | `NobleBridle02_m04` | `BasicHarness02_m06` | `horseshoeNoble` |
| `horse_noble14` | `NobleSaddle02_m04` | `WarChanfron03_m08` | `Caparison03_m07` | `horseshoeNoble` |
| `horse_noble15` | `NobleSaddle01_m04` | `WarChanfron02_m10` | `BasicHarness03_m13` | `horseshoeMilitary` |
| `horse_noble16` | `NobleSaddle02_m12` | `NobleBridle01_m07` | `NobleCaparison01_m11` | `horseshoeNoble` |
| `horse_noble17` | `WarSaddle03_m14` | `WarChanfron01_m05` | `PaddedCaparison02_m03` | `horseshoeNoble` |
| `horse_noble18` | `NobleSaddle01_m14` | `NobleBridle02_m06` | `Caparison01_m08` | `horseshoeNoble` |
| `horse_noble19` | `NobleSaddle02_m15` | `NobleBridle02_m09` | `PaddedCaparison03_m10` | `horseshoeNoble` |
| `horse_noble20` | `WarSaddle01_m13` | `NobleBridle02_m08` | `PaddedCaparison04_m03` | `horseshoeRacing` |

</details>

<details>
<summary><code>horse_nomad</code> family (20)</summary>

| Preset | Saddle | Head | Torso | Shoe |
| --- | --- | --- | --- | --- |
| `horse_nomad01` | `EastSaddle02_m07` | `EastBridle02_m01` |  | `horseshoeNomad` |
| `horse_nomad02` | `EastSaddle01_m03` | `EastBridle02_m03` |  | `horseshoeNomad` |
| `horse_nomad03` | `EastSaddle02_m12` | `EastBridle02_m06` |  | `horseshoeNomad` |
| `horse_nomad04` | `EastSaddle01_m02` | `EastBridle02_m04` |  | `horseshoeNomad` |
| `horse_nomad05` | `EastSaddle01_m07` | `EastBridle02_m06` |  | `horseshoeNomad` |
| `horse_nomad06` | `EastSaddle02_m09` | `EastBridle02_m06` |  | `horseshoeNoble` |
| `horse_nomad07` | `EastSaddle02_m10` | `EastBridle02_m05` |  | `horseshoeNoble` |
| `horse_nomad08` | `EastSaddle02_m04` | `EastBridle02_m08` |  | `horseshoeNomad` |
| `horse_nomad09` | `EastSaddle02_m02` | `EastBridle02_m07` |  | `horseshoeNoble` |
| `horse_nomad10` | `EastSaddle02_m11` | `EastBridle02_m04` |  | `horseshoeNomad` |
| `horse_nomad11` | `EastSaddle01_m10` | `EastBridle02_m02` |  | `horseshoeNomad` |
| `horse_nomad12` | `EastSaddle01_m06` | `EastBridle02_m01` |  | `horseshoeFarmer` |
| `horse_nomad13` | `EastSaddle01_m04` | `EastBridle02_m04` |  | `horseshoeNomad` |
| `horse_nomad14` | `EastSaddle01_m08` | `EastBridle02_m04` |  | `horseshoeNomad` |
| `horse_nomad15` | `EastSaddle02_m10` | `EastBridle02_m10` |  | `horseshoeFarmer` |
| `horse_nomad16` | `EastSaddle01_m08` | `BasicBridle01_m06` |  | `horseshoeFarmer` |
| `horse_nomad17` | `EastSaddle02_m08` | `EastBridle02_m01` |  | `horseshoeNomad` |
| `horse_nomad18` | `EastSaddle02_m01` | `BasicBridle03_m06` |  | `horseshoeFarmer` |
| `horse_nomad19` | `EastSaddle02_m08` | `EastBridle02_m05` |  | `horseshoeFarmer` |
| `horse_nomad20` | `EastSaddle01_m09` | `EastBridle02_m10` | `BasicHarness01_m13` | `horseshoeNomad` |

</details>

<details>
<summary><code>horse_draft</code> family (10)</summary>

| Preset | Saddle | Head | Torso | Shoe |
| --- | --- | --- | --- | --- |
| `horse_draft_bridle01` |  | `BasicBridle01_m01` |  | `horseshoeFarmer` |
| `horse_draft_bridle02` |  | `BasicBridle03_m05` |  | `horseshoeFarmer` |
| `horse_draft_bridle03` |  | `BasicBridle01_m02` |  | `horseshoeFarmer` |
| `horse_draft01` | `YokeUniversal01` | `BasicBridle01_m01` |  | `horseshoeFarmer` |
| `horse_draft02` | `YokeUniversal01` | `BasicBridle03_m02` |  | `horseshoeFarmer` |
| `horse_draft03` | `YokeUniversal01` | `BasicBridle03_m01` |  | `horseshoeFarmer` |
| `horse_draft04` | `YokeUniversal01` | `CartBridle01_m02` |  | `horseshoeFarmer` |
| `horse_draft05` | `YokeUniversal01` | `BasicBridle03_m07` |  | `horseshoeFarmer` |
| `horse_draft06` | `YokeUniversal01` | `BasicBridle01_m03` |  | `horseshoeFarmer` |
| `horse_draft07` | `YokeUniversal01` | `CartBridle01_m04` |  | `horseshoeFarmer` |

</details>

<details>
<summary>Named horses and quests (152)</summary>

| Preset | Saddle | Head | Torso | Shoe |
| --- | --- | --- | --- | --- |
| `_haste_horseEarlyGame` | `horseTrading_cheapSaddle` | `horseTrading_cheapBridle` |  | `horseshoeFarmer` |
| `_haste_horseGameplayTrailer` | `WarSaddle03_m07` | `NobleBridle02_m01` | `BasicHarness03_m06` | `horseshoeNoble` |
| `_haste_horseGrid` | `NobleSaddle01_m11` | `WarChanfron03_m06` | `PaddedCaparison02_m01` | `horseshoeNomad` |
| `_haste_horseHardcore` | `WarSaddle03_m09` | `NobleBridle02_m05` | `NobleCaparison04_m05` | `horseshoeRacing` |
| `_haste_horseLateGame` | `EastSaddle01_m06` | `BasicBridle02_m01` | `Caparison05_m01` | `horseshoeNoble` |
| `_haste_horseMidGame` | `BasicSaddle03_m07` | `BasicBridle01_m01` | `BasicHarness02_m06` | `horseshoeMilitary` |
| `_test_horse_Jonas` | `NobleSaddle02_m12` | `NobleBridle02_m10` | `BasicHarness01_m14` |  |
| `battle_leipa_01` | `NobleSaddle02_m05` | `WarChanfron03_m02` | `PaddedCaparison05_mLeipa` |  |
| `battle_leipa_02` | `BasicSaddle03_m02` | `WarChanfron01_m02` | `PaddedCaparison03_mLeipa` |  |
| `battle_leipa_03` | `WarSaddle01_m13` | `BasicBridle02_m02` | `PaddedCaparison03_mLeipa` |  |
| `battle_leipa_04` | `BasicSaddle03_m05` | `BasicBridle01_m02` | `PaddedCaparison03_mLeipa01` |  |
| `battle_leipa_05` | `WarSaddle01_m13` | `WarChanfron02_m03` | `PaddedCaparison01_mLeipa01` |  |
| `battle_leipa_06` | `WarSaddle01_m13` | `WarChanfron02_m06` | `PaddedCaparison01_mLeipa` |  |
| `battle_leipa_07` | `WarSaddle01_m13` | `WarChanfron02_m06` | `NobleCaparison03_mLeipa02` |  |
| `battle_leipa_08` | `WarSaddle01_m13` | `WarChanfron03_m02` | `NobleCaparison03_mLeipa` |  |
| `battle_leipa_09` | `NobleSaddle02_m03` | `NobleBridle01_m03` | `NobleCaparison02_mLeipa02` |  |
| `battle_leipa_10` | `NobleSaddle02_m06` | `WarChanfron03_m02` | `NobleCaparison02_mLeipa` |  |
| `battle_leipa_11` | `WarSaddle01_m09` | `WarChanfron02_m03` | `NobleCaparison01_mLeipa02` |  |
| `battle_leipa_12` | `WarSaddle01_m10` | `BasicBridle03_m02` | `NobleCaparison01_mLeipa` |  |
| `battle_leipa_13` | `WarSaddle01_m13` | `BasicBridle02_m02` | `Caparison03_mLeipa03` |  |
| `battle_leipa_14` | `WarSaddle01_m13` | `WarChanfron01_m02` | `Caparison03_mLeipa02` |  |
| `battle_leipa_15` | `WarSaddle01_m13` | `WarChanfron02_m06` | `Caparison03_mLeipa01` |  |
| `battle_leipa_16` | `WarSaddle01_m13` | `NobleBridle01_m01` | `Caparison03_mLeipa` |  |
| `battle_leipa_17` | `WarSaddle02_m01` | `BasicBridle01_m02` | `Caparison01_mLeipa01` |  |
| `battle_leipa_18` | `BasicSaddle03_m09` | `BasicBridle01_m02` | `Caparison01_mLeipa` |  |
| `battle_ruthard_01` | `NobleSaddle02_m06` | `WarChanfron03_m02` | `PaddedCaparison02_mRuthard03` |  |
| `battle_ruthard_02` | `WarSaddle01_m13` | `WarChanfron02_m03` | `PaddedCaparison02_mRuthard02` |  |
| `battle_ruthard_03` | `WarSaddle01_m13` | `BasicBridle02_m02` | `PaddedCaparison01_mRuthard02` |  |
| `battle_ruthard_04` | `WarSaddle01_m13` | `BasicBridle03_m02` | `PaddedCaparison01_mRuthard` |  |
| `battle_ruthard_05` | `WarSaddle01_m13` | `WarChanfron03_m02` | `PaddedCaparison01_mRuthard` |  |
| `battle_ruthard_06` | `NobleSaddle02_m04` | `WarChanfron03_m02` | `Caparison03_mRuthard02` |  |
| `battle_ruthard_07` | `NobleSaddle02_m05` | `WarChanfron01_m02` | `Caparison03_mRuthard` |  |
| `battle_ruthard_08` | `BasicSaddle03_m01` | `NobleBridle01_m01` | `Caparison01_mRuhard02` |  |
| `battle_ruthard_09` | `BasicSaddle03_m02` | `WarChanfron01_m02` | `Caparison01_mRuhard` |  |
| `battle_semin_01` | `NobleSaddle02_m05` | `NobleBridle01_m04` | `PaddedCaparison04_mSemin` |  |
| `battle_semin_02` | `WarSaddle01_m08` | `WarChanfron01_m02` | `PaddedCaparison02_mSemin02` |  |
| `battle_semin_03` | `WarSaddle01_m06` | `BasicBridle03_m01` | `PaddedCaparison02_mSemin02` |  |
| `battle_semin_04` | `WarSaddle01_m03` | `NobleBridle01_m04` | `PaddedCaparison02_mSemin` |  |
| `battle_semin_05` | `NobleSaddle02_m06` | `WarChanfron02_m06` | `PaddedCaparison02_mSemin` |  |
| `battle_semin_06` | `NobleSaddle02_m06` | `WarChanfron02_m06` | `PaddedCaparison01_mSemin02` |  |
| `battle_semin_07` | `NobleSaddle01_m01` | `WarChanfron03_m02` | `PaddedCaparison01_mSemin` |  |
| `battle_semin_08` | `NobleSaddle02_m03` | `WarChanfron03_m02` | `Caparison03_mSemin` |  |
| `battle_semin_09` | `NobleSaddle01_m07` | `NobleBridle01_m01` | `Caparison03_mSemin` |  |
| `battle_semin_10` | `NobleSaddle01_m01` | `WarChanfron01_m02` | `Caparison01_mSemin02` |  |
| `battle_semin_11` | `WarSaddle01_m06` | `BasicBridle01_m03` | `Caparison01_mSemin` |  |
| `cross_country_easy_01` | `BasicSaddle02_m12` | `BasicBridle03_m08` |  | `horseshoeFarmer` |
| `cross_country_easy_02` | `BasicSaddle01_m07` | `BasicBridle03_m01` |  | `horseshoeFarmer` |
| `cross_country_easy_03` | `BasicSaddle01_m01` | `BasicBridle01_m05` |  | `horseshoeFarmer` |
| `cross_country_easy_04` | `BasicSaddle02_m03` | `BasicBridle01_m07` |  | `horseshoeFarmer` |
| `cross_country_easy_05` | `BasicSaddle02_m10` | `BasicBridle03_m06` |  | `horseshoeFarmer` |
| `cross_country_easy_06` | `BasicSaddle01_m05` | `BasicBridle03_m10` |  | `horseshoeFarmer` |
| `cross_country_hard_01` | `WarSaddle01_m08` | `BasicBridle02_m03` |  | `horseshoeNoble` |
| `cross_country_hard_02` | `BasicSaddle03_m12` | `BasicBridle03_m08` |  | `horseshoeNoble` |
| `cross_country_hard_03` | `EastSaddle01_m07` | `EastBridle02_m01` |  | `horseshoeNomad` |
| `cross_country_hard_04` | `EastSaddle01_m11` | `EastBridle02_m08` |  | `horseshoeNomad` |
| `cross_country_hard_05` | `BasicSaddle03_m10` | `BasicBridle02_m07` |  | `horseshoeNoble` |
| `cross_country_hard_06` | `EastSaddle01_m09` | `EastBridle02_m10` |  | `horseshoeNomad` |
| `cross_country_medium_01` | `BasicSaddle03_m01` | `BasicBridle02_m08` |  | `horseshoeFarmer` |
| `cross_country_medium_02` | `BasicSaddle03_m07` | `BasicBridle03_m04` |  | `horseshoeFarmer` |
| `cross_country_medium_03` | `EastSaddle02_m01` | `BasicBridle03_m07` |  | `horseshoeNomad` |
| `cross_country_medium_04` | `EastSaddle02_m08` | `BasicBridle02_m07` |  | `horseshoeNomad` |
| `cross_country_medium_05` | `EastSaddle02_m10` | `BasicBridle02_m02` |  | `horseshoeNomad` |
| `cross_country_medium_06` | `BasicSaddle03_m08` | `BasicBridle03_m06` |  | `horseshoeFarmer` |
| `drak_AlchemistHorse_s30` | `WarSaddle01_m11` | `EastBridle02_m04` | `BasicHarness03_m10` |  |
| `hladAZmar_boadiceaHorse` |  | `BasicBridle03_m02` |  | `horseshoeMilitary` |
| `horse_arne` | `BasicSaddle03_m04` | `BasicBridle03_m02` |  |  |
| `horse_bohuta` | `WarSaddle01_m08` | `BasicBridle03_m05` |  |  |
| `horse_brabant` | `WarSaddle03_m13` | `BasicBridle03_m02` | `BasicHarness03_m09` |  |
| `horse_brunswiq` | `WarSaddle03_m01` | `NobleBridle02_m04` | `CaparisonBrunswig_m01` |  |
| `horse_capon` | `NobleSaddle03_m11` | `BasicBridle01_m02` | `NobleCaparison01_m01` |  |
| `horse_caponkutnohorsko` | `BasicSaddle03_m02` | `BasicBridle03_m01` |  |  |
| `horse_capontrosecko` | `WarSaddle02_m02` | `WarChanfron02_m06` | `BasicHarness03_m04` |  |
| `horse_cart_doubleLleft` | `YokeDouble01Left` | `CartBridle01_m01` |  |  |
| `horse_cart_doubleRight` | `YokeDouble01Right` | `CartBridle01_m01` |  |  |
| `horse_cart_single` | `YokeSingle01` | `CartBridle01_m02` |  |  |
| `horse_cart_universal` | `YokeUniversal01` | `CartBridle01_m01` |  |  |
| `horse_erik_battle` | `NobleSaddle02_m04` | `WarChanfron02_m01` | `NobleCaparison08_mErik` |  |
| `horse_erik_travel` | `NobleSaddle02_m04` | `NobleBridle01_m02` |  |  |
| `horse_henry_arrival` | `WarSaddle01_m12` | `BasicBridle03_m04` |  |  |
| `horse_henry_final` | `NobleSaddle01_m02` | `WarChanfron03_m01` | `BasicHarness03_m01` |  |
| `horse_markvart` | `BasicSaddle03_m02` | `WarChanfron02_m06` | `NobleCaparison04_mMarkvart` |  |
| `horse_markvart_commando` | `BasicSaddle03_m02` | `WarChanfron02_m06` | `BasicHarness03_m03` |  |
| `horse_markvart_dream` | `BasicSaddle03_m02` |  | `NobleCaparison02_mMarkvart` |  |
| `horse_menhart` | `WarSaddle02_m12` | `NobleBridle01_m09` | `BasicHarness03_m03` |  |
| `horse_posledniBereVse` | `BasicSaddle01_m03` | `BasicBridle01_m01` | `BasicHarness01_m13` | `horseshoeMilitary` |
| `horse_prepadeni_sedivka` | `NobleSaddle01_m04` | `NobleBridle01_m01` | `BasicHarness02_m12` |  |
| `horse_pros` | `WarSaddle03_m05` | `NobleBridle02_m01` | `Caparison01_mPros` |  |
| `horse_test_marcos` | `BasicSaddle03_m09` |  | `NobleCaparison01_mTwitch` |  |
| `horse_war_noble_01` | `WarSaddle03_m01` | `WarChanfron03_m01` | `PaddedCaparison05_m01` |  |
| `horse_zizka` | `BasicSaddle03_m02` | `BasicBridle03_m04` | `BasicHarness03_m07` |  |
| `katuvSleh_phantomHorse` | `WarSaddle03_m15` | `WarChanfron02_m02` | `BasicHarness02_m11` |  |
| `kbyl_janHorse` | `WarSaddle03_m02` | `WarChanfron03_m02` | `PaddedCaparison05_m02` |  |
| `kbyl_miroslavHorse` | `WarSaddle01_m02` | `NobleBridle01_m01` | `PaddedCaparison02_m01` |  |
| `kcer_kubenkaHorse` | `WarSaddle01_m10` | `BasicBridle01_m02` |  |  |
| `kgru_buresHorse` | `NobleSaddle01_m01` | `NobleBridle01_m02` | `NobleCaparison02_m03` |  |
| `kzik_chertanHorse_1` | `EastSaddle01_m04` | `EastBridle02_m01` |  |  |
| `kzik_grozavHorse_1` | `WarSaddle01_m08` | `NobleBridle02_m03` | `NobleCaparison02_m05` |  |
| `kzik_horse_gringolet` | `WarSaddle02_m01` | `WarChanfron02_m03` | `NobleCaparison01_mJezek` |  |
| `kzik_katzHorse_1` | `WarSaddle03_m01` | `WarChanfron02_m02` |  |  |
| `kzik_sykoraHorse_1` | `WarSaddle01_m04` | `BasicBridle03_m04` |  |  |
| `M35_BrabantHorse_escape` | `BasicSaddle02_m03` | `BasicBridle02_m04` |  | `horseshoeMilitary` |
| `M35_CaponHorse_escape` | `BasicSaddle01_m05` | `BasicBridle01_m05` |  | `horseshoeMilitary` |
| `oblehaniSuchdole_horse_prague01` | `NobleSaddle03_m01` | `BasicBridle01_m04` | `NobleCaparison01_m03` |  |
| `oblehaniSuchdole_horse_prague02` | `BasicSaddle01_m05` | `BasicBridle01_m04` | `BasicHarness02_m01` |  |
| `oblehaniSuchdole_horse_prague03` | `WarSaddle02_m04` | `WarChanfron02_m01` | `BasicHarness01_m05` |  |
| `oblehaniSuchdole_horse_prague04` | `WarSaddle02_m03` | `WarChanfron01_m01` | `BasicHarness03_m03` |  |
| `oblehaniSuchdole_horse_prague05` | `WarSaddle02_m03` | `BasicBridle01_m02` | `NobleCaparison03_m02` |  |
| `oblehaniSuchdole_horse_suchdol01` | `WarSaddle01_m03` | `BasicBridle01_m09` | `BasicHarness01_m09` |  |
| `oblehaniSuchdole_horse_suchdol02` | `WarSaddle02_m05` | `WarChanfron02_m10` | `Caparison01_m03` |  |
| `oblehaniSuchdole_horse_suchdol03` | `WarSaddle01_m01` | `BasicBridle01_m04` | `PaddedCaparison04_mSemin` |  |
| `oblehaniSuchdole_horse_suchdol04` | `BasicSaddle03_m08` | `WarChanfron03_m03` | `BasicHarness02_m10` |  |
| `papezskyLegat_legateHorse` | `NobleSaddle02_m12` | `NobleBridle02_m04` | `NobleCaparison05_m02` | `horseshoeFarmer` |
| `papezskyLegat_legateMenHorse` | `NobleSaddle03_m01` | `NobleBridle02_m04` |  | `horseshoeFarmer` |
| `papezskyLegat_rozasHorse` | `NobleSaddle02_m12` | `NobleBridle02_m10` | `BasicHarness01_m14` |  |
| `prepadeni_horsebailiffsGroupHorse_1` | `WarSaddle02_m04` | `BasicBridle01_m04` | `BasicHarness01_m05` |  |
| `prepadeni_horsebailiffsGroupHorse_10` | `NobleSaddle02_m02` | `WarChanfron02_m02` | `BasicHarness01_m05` |  |
| `prepadeni_horsebailiffsGroupHorse_11` | `NobleSaddle02_m04` | `BasicBridle03_m05` | `BasicHarness02_m09` |  |
| `prepadeni_horsebailiffsGroupHorse_12` | `NobleSaddle02_m02` | `WarChanfron03_m02` | `BasicHarness01_m07` |  |
| `prepadeni_horsebailiffsGroupHorse_2` | `WarSaddle01_m07` | `WarChanfron03_m02` |  |  |
| `prepadeni_horsebailiffsGroupHorse_3` | `WarSaddle03_m04` | `BasicBridle01_m04` | `BasicHarness03_m01` |  |
| `prepadeni_horsebailiffsGroupHorse_4` | `WarSaddle01_m07` | `BasicBridle01_m04` |  |  |
| `prepadeni_horsebailiffsGroupHorse_5` | `NobleSaddle03_m06` | `BasicBridle01_m02` | `BasicHarness02_m06` |  |
| `prepadeni_horsebailiffsGroupHorse_6` | `NobleSaddle03_m02` | `BasicBridle01_m02` |  |  |
| `prepadeni_horsebailiffsGroupHorse_7` | `NobleSaddle03_m06` | `BasicBridle01_m02` | `BasicHarness03_m03` |  |
| `prepadeni_horsebailiffsGroupHorse_8` | `WarSaddle02_m03` | `BasicBridle01_m02` |  |  |
| `prepadeni_horsebailiffsGroupHorse_9` | `WarSaddle03_m01` | `WarChanfron01_m03` | `BasicHarness01_m05` |  |
| `prepadeni_horseKonrad` | `BasicSaddle03_m09` | `WarChanfron03_m08` |  |  |
| `prepadeni_horseMikulas` | `NobleSaddle02_m07` | `BasicBridle01_m02` | `BasicHarness02_m02` |  |
| `prepadeni_horsePivec` | `WarSaddle01_m09` | `BasicBridle03_m05` | `BasicHarness01_m06` |  |
| `prepadeni_horseTomas` | `NobleSaddle02_m03` | `NobleBridle02_m01` | `BasicHarness01_m05` |  |
| `prepadeni_horseVoves` | `NobleSaddle03_m02` | `BasicBridle01_m02` | `BasicHarness03_m02` |  |
| `preview_not-defined` | `BasicSaddle02_m01` |  | `BasicHarness01_m03` |  |
| `sedmStatecnych_leadersHorse` | `BasicSaddle03_m02` | `BasicBridle03_m01` | `BasicHarness03_m03` |  |
| `setkaniVRatbori1_tempRatiborRetinueHorse` | `NobleSaddle02_m15` | `BasicBridle02_m04` | `Caparison03_mLeipa03` |  |
| `setkaniVRatbori1_tempRatiborRetinueHorse10` | `BasicSaddle02_m04` | `BasicBridle03_m05` | `BasicHarness01_m12` |  |
| `setkaniVRatbori1_tempRatiborRetinueHorse2` | `BasicSaddle03_m09` | `BasicBridle02_m02` | `NobleCaparison02_mLeipa02` |  |
| `socky_messengerHorse` | `NobleSaddle01_m07` | `WarChanfron03_mMessenger` | `BasicHarness03_m06` |  |
| `tsem_hanusHorse` | `NobleSaddle01_m04` | `NobleBridle02_m03` | `NobleCaparison07_mLeipa` |  |
| `tsem_jostHorse` | `NobleSaddle02_m15` | `WarChanfron02_m10` | `PaddedCaparison05_m07` |  |
| `tsem_racekHorse` | `WarSaddle03_m13` | `NobleBridle01_m01` | `NobleCaparison05_m07` |  |
| `tsem_seminsrHorse` | `WarSaddle03_m08` | `BasicBridle03_m05` | `NobleCaparison07_m03` |  |
| `tsem_sukHorse` | `NobleSaddle02_m09` | `NobleBridle02_m05` |  |  |
| `ttro_bergovHorse` | `NobleSaddle01_m11` | `WarChanfron03_m07` | `BasicHarness03_m13` |  |
| `utokNaNebakov_bartosHorse` | `WarSaddle03_m05` | `NobleBridle01_m01` | `BasicHarness02_m02` |  |
| `utokNaNebakov_hankoHorse` | `WarSaddle01_m02` | `WarChanfron01_m02` | `BasicHarness01_m07` |  |
| `utokNaNebakov_hermanHorse` | `WarSaddle01_m03` | `WarChanfron01_m01` | `Caparison02_m02` |  |
| `utokNaNebakov_janHorse` | `NobleSaddle03_m02` | `WarChanfron02_m02` | `PaddedCaparison04_m01` |  |
| `utokNaNebakov_jesekHorse` | `NobleSaddle02_m05` | `BasicBridle02_m04` | `BasicHarness03_m01` |  |
| `utokNaNebakov_komoriHorse` | `NobleSaddle02_m03` | `WarChanfron03_m02` | `NobleCaparison07_m02` |  |
| `utokNaNebakov_olbramHorse` | `BasicSaddle03_m01` | `WarChanfron02_m06` | `PaddedCaparison04_m01` |  |
| `zachranaPtacka_playerHorse` | `BasicSaddle03_m12` | `BasicBridle03_m05` |  |  |
| `ztracenyTovarys_horse` | `BasicSaddle03_m11` | `BasicBridle03_m05` |  |  |

</details>

<!-- /generated:presets -->
