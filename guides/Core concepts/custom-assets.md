---
title: Ship custom models, sounds and animations
description: Put new meshes, textures, animation clips, sounds, FMOD banks and particle effects in a resource, or replace the game's own files, and use them from your scripts.
sidebar:
  label: Custom assets
  order: 28
---

A resource can carry art the game does not have, and replacements for art it
does. Put the files in a `stream/` or `replace/` folder next to your scripts.
The server sends them to every player along with your client scripts, and the
game loads them through its own loaders, as if they had shipped with it.

```text
resources/my-assets/
  package.json
  stream/
    objects/kcdc/my-assets/chair.cgf
    objects/kcdc/my-assets/chair.mtl
    textures/kcdc/my-assets/chair_diff.dds
  replace/
    objects/manmade/common_furniture/bucket/bucket_a_diff.dds
```

```ts
// server
Prop.spawn("objects/kcdc/my-assets/chair.cgf", player.position);
```

Nothing needs a CDN or a web server. Files travel over the game connection,
and a returning player downloads only what changed.

## Lay out the folders

| Folder | Holds | Effect |
| --- | --- | --- |
| `stream/` | New assets, each under a folder named after your resource | Adds files the game never had. Nothing in it can shadow a game file. |
| `replace/` | Files at the game's own paths | Your copy wins over the game's, everywhere, including the level's own files. |

The `my-assets` inside `objects/kcdc/my-assets/` is the resource's **name**,
the `name` in its `package.json`, not its folder name. For a resource to ship
assets, that name may use only lowercase letters, digits, `-` and `_`, up to
64 characters. Paths are case-insensitive, and no **folder** name inside
`stream/` or `replace/` may contain a dot.

A resource can ship assets and nothing else. A manifest with no scripts at all
is fine, and keeping your art in its own resource means restarting it never
touches your game logic:

```json title="resources/my-assets/package.json"
{
  "name": "my-assets",
  "version": "1.0.0",
  "mafiahub": {}
}
```

Do not list asset files in `mafiahub.files`, which is for what your web views
load. The two folders travel on their own, as archives the game reads in place.

## Add new assets

Every new file goes under `<kind>/kcdc/<resource>/` inside `stream/`. FMOD
banks and particle libraries are the exceptions: the game looks for them in
fixed folders, so they sit there with your resource's name as a file prefix.

| Kind | Path inside `stream/` | Extensions |
| --- | --- | --- |
| Models and materials | `objects/kcdc/<resource>/...` (also `characters/`, `materials/`) | `.cgf` `.cgfm` `.chr` `.chrm` `.skin` `.skinm` `.cga` `.cdf` `.mtl` |
| Textures | `textures/kcdc/<resource>/...` | `.dds`, and split mips `.dds.1` to `.dds.99`, `.dds.a`, `.dds.1a` to `.dds.99a` |
| Animation clips | `animations/kcdc/<resource>/...` | `.caf` (also `.adb`, `.animevents`) |
| Sound files | `sounds/kcdc/<resource>/...` | `.ogg` |
| Audio triggers | `sounds/kcdc/<resource>/atl/<name>.xml` | `.xml` |
| FMOD banks | `sounds/fmod/build/pc/kcdc_<resource>_<name>.bank` | `.bank`, `.strings.bank`, `.assets.bank`, `.streams.bank` |
| Particle libraries | `libs/particles/kcdc_<resource>_<name>.xml` | `.xml` |

## Replace the game's files

A file in `replace/` sits at the exact path of the game file it replaces,
taken from the game's `Data/*.pak` archives. It takes the model, material,
texture and sound extensions from the table above, with three exceptions:

- nothing under `scripts/`, `libs/`, `engine/`, `shaders/`, `levels/`,
  `localization/` or `editor/`. Those folders hold the game's logic and data,
  not its look.
- no `.caf`. The game keeps every stock clip's length and joints in an index
  built at startup, so a replaced clip would play against the wrong ones. Ship
  a new clip in `stream/` instead.
- nothing at `<folder>/kcdc/...`, which belongs to `stream/`.

A replaced texture shows on every object that uses it, so prefer `stream/`
for anything that should appear only where your script puts it.

## Use them from scripts

A new asset is named by its path inside `stream/`, in lowercase.

| Asset | Where it goes | Side |
| --- | --- | --- |
| A `.cgf` model | `Prop.spawn`, `player.setDisguise`, `props` in `playAnimation`, `PropPlacer` models | server, and client for placement |
| A `.caf` clip | `playAnimation("", { clip })` on a player or an NPC | server |
| A particle effect | `Vfx.spawn`, `Vfx.burst`, `Vfx.burstOn` | server, and the client's `Vfx` |
| An `.ogg` file | `Audio.playFile(path, entityId)`, without the extension | client |
| An audio trigger | `Audio.play`, `playAt`, `playOnEntity`, `hasTrigger` | client |

```ts
// server
const RESOURCE = "my-assets";

npc.playAnimation("", { clip: `animations/kcdc/${RESOURCE}/wave.caf`, loop: true });
Vfx.spawn(`kcdc_${RESOURCE}_sparks.cutting.wood_split`, player.position, { prime: true });
player.setDisguise(`objects/kcdc/${RESOURCE}/chair.cgf`);
```

```ts
// client
const me = LocalPlayer;
if (me && Assets.has("sounds/kcdc/my-assets/bell.ogg")) {
  Audio.playFile("sounds/kcdc/my-assets/bell", me.entityId);
}
```

The server refuses a streamed name that no running resource ships, the same
way it refuses a misspelled catalog name: `Prop.spawn`, `Vfx.spawn` and
`playAnimation` **throw**. On the client, `Assets.has(path)` answers whether
a new asset arrived. It does not see replaced files, which keep the game's
path.

### When it is safe to spawn

A player who joins has every asset loaded before the level appears, so spawns
from `playerSpawned` always work.

A resource started while players are connected (`start my-assets`) has its
archives built just after its scripts first run, so its own top-level code is
too early to spawn its own models. Spawn from an event, or after a short
timer. A player whose game does not have an asset yet still gets the prop,
disguise or effect: their client builds it the moment the file arrives.

## Edit and reload

There is no file watcher. Edit the files, then reload the resource:

| Console command | Players already in the session |
| --- | --- |
| `start my-assets` | Download the new resource's assets and load them in place. |
| `restart my-assets` | Download only the archive that changed. A changed model, material or texture updates on screen. |
| `stop my-assets` | Keep what they have until their next level load, which drops it. |

The server log prints one line per archive at boot and on every reload, with
`built` or `unchanged`:

```text
Asset pak 'my-assets' stream: 14 files, 3245102 bytes (built)
```

## Author assets the game accepts

The game, not the mod, decides what it can load. These are its rules.

- **Models.** The material a mesh names, and the textures a material names,
  are looked up by path. Point them at their streamed paths
  (`objects/kcdc/my-assets/chair`, `textures/kcdc/my-assets/chair_diff.dds`)
  when you export, or they come out with the default material.
- **Clips** must be authored for the human skeleton. They play through the
  game's own animation system, and any root motion in the clip moves the
  body.
- **Audio triggers** are the game's ATL format. Each trigger names an FMOD
  event by path (`fmod_name`; an `fmod_id` is ignored), and the other
  attributes are copied from one of the game's own triggers. The game's own
  events work, and so do events from your banks. Give triggers a name only your resource uses: when two files define
  the same trigger, the first one loaded wins.

```xml title="stream/sounds/kcdc/my-assets/atl/my-assets.xml"
<?xml version="1.0" encoding="us-ascii"?>
<ATLConfig atl_name="my-assets">
  <AudioTriggers>
    <ATLTrigger atl_name="my_assets_bell">
      <FmodEvent fmod_name="event:/my-assets/bell" distance_culling="65535" osh_preset="4" pausable="0" sword_mat="-1" sword_mat_opponent="-1" />
    </ATLTrigger>
  </AudioTriggers>
</ATLConfig>
```

- **FMOD banks** come from FMOD Studio **2.02 or earlier**; the game runs
  2.02.21. Ship your project's master and strings banks with the others, all
  named `kcdc_<resource>_<name>.bank`. FMOD loads a second project's master
  bank only when that project's master bus has the **same GUID as the game's**,
  `{8d680f2f-9df1-476a-b7fb-7f654c8a2db1}`. Without it every event of your
  project stops the moment it starts. Keep your event paths out of the game's
  own folders (`event:/my-assets/...`).
- **Particle libraries** are the game's XML format. The library's `Name`
  attribute matches its file name, and an effect is named
  `<library>.<group>.<effect>`: `Particles Name="cutting.wood_split"` inside
  `kcdc_my-assets_sparks.xml` is `kcdc_my-assets_sparks.cutting.wood_split`.

## Limits

| Limit | Value |
| --- | --- |
| One archive (each of `stream/` and `replace/`, per resource) | under 2 GB |
| Files in one archive | 65,535 |
| One file | 512 MB |
| A path inside the folder | 240 characters, `A-Z a-z 0-9 _ . / -` only |

## What players see

Players download your assets the first time they join, together with your
client scripts. A row on the game's own **Game** settings page, **Ask before
server downloads**, decides when the joining screen stops to ask first:
always, above 100 MB, above 500 MB (the default), above 2 GB, or never. A
player who chooses Leave goes back to the menu. Assets a resource ships while
the player is already in are fetched without asking.

Downloads land in the mod's `cache/servers/` folder, next to the client
scripts it caches. A file the server no longer ships is deleted the next time
the player joins.

:::caution
Like everything in `clientScripts` and `files`, these files end up on every
player's disk, readable by anyone. Ship only what you have the right to
distribute.
:::

## When an asset does not show up

Read the server log first. One bad file keeps its whole folder from shipping.

| Server log | Fix |
| --- | --- |
| `Resource 'X' ships assets but its name is not lowercase [a-z0-9_-]; skipped` | Rename the resource in `package.json`, and its folders under `kcdc/` with it. |
| `'X' stream: <file>: stream entries must sit at <category>/kcdc/<resource>/...; the lane is not shipped` | The file is outside `<kind>/kcdc/<resource>/`, or the resource name in the path is not the manifest's. |
| `...: a folder name contains a dot; ...` | Rename the folder. The game's material lookup cuts names at the first dot. |
| `...: extension is not an asset kind the engine loads by path; ...` | Check the extension against the tables above. |
| `...: FMOD banks must be named kcdc_<resource>_<name>.bank; ...` | The same goes for particle libraries, with `.xml`. |
| `...: replacements may not touch this folder; ...` | `replace/` cannot reach `scripts/`, `libs/` and the other code folders. |
| `...: stock animations cannot be replaced globally; ...` | Ship the clip in `stream/` and play it with `clip`. |
| No `Asset pak` line at all | Is the resource running? Only running resources ship assets. |

If the server shipped the asset but a player does not see it, the problem is
the file itself: an export the game cannot read, a material path that still
points at your workstation, or a bank built for a newer FMOD.

## Related

- [Resource manifest and lifecycle](../resources/): `start`, `restart` and the manifest
- [Spawn props and objects](../../world/props/): placing a streamed model
- [Particle effects](../../world/effects/): placed effects and bursts
- [Sounds and voice chat](../../client-scripting/sound-and-voice/): triggers and sound files
- [Move NPCs](../../npcs-and-animals/npc-orders/): `playAnimation` on an NPC
