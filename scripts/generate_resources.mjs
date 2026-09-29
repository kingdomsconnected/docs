// Regenerates the lists on the Resources pages from a mod checkout.
//
//   KCDC_MOD_ROOT=/path/to/KCD2MP node scripts/generate_resources.mjs
//   KCDC_MOD_ROOT=/path/to/KCD2MP KCDC_MOD_REF=v1.5.2 node scripts/generate_resources.mjs
//
// Each page under guides/Resources/ keeps its prose by hand and holds one
// generated region per list, between `<!-- generated:<name> -->` and
// `<!-- /generated:<name> -->`. Only those regions are rewritten, so a page's
// introduction and samples survive a regeneration.
//
// The catalogs are the mod's own generated C++ tables (and files/kcdc/souls.tsv),
// read from the working tree, or from a git ref with KCDC_MOD_REF so the lists
// match a release rather than whatever is checked out. Run it when a release
// ships, alongside the @kingdomsconnected/types bump.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const docsRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const pagesRoot = join(docsRoot, "guides", "Resources");
const modRoot = process.env.KCDC_MOD_ROOT;
const modRef = process.env.KCDC_MOD_REF;

if (!modRoot || !existsSync(modRoot)) {
  console.error("Set KCDC_MOD_ROOT to a Kingdoms Connected mod checkout.");
  process.exit(1);
}

const readMod = (path) =>
  modRef
    ? execFileSync("git", ["-C", modRoot, "show", `${modRef}:${path}`], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
    : readFileSync(join(modRoot, path), "utf8");

const game = (name) => readMod(`code/shared/game/${name}`);

// The body of `const std::vector<...> <name> = { ... };`.
const vectorBody = (source, name) => {
  const start = source.indexOf(`${name} = {`);
  if (start < 0) throw new Error(`${name} not found`);
  let depth = 0;
  for (let index = source.indexOf("{", start); index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    else if (source[index] === "}" && (depth -= 1) === 0) return source.slice(source.indexOf("{", start) + 1, index);
  }
  throw new Error(`${name} is not closed`);
};

// One array per `{...}` row at the top level of a vector body; strings unquoted.
const rows = (body) => {
  const result = [];
  for (const line of body.split("\n")) {
    // A trailing `// comment` only after the row's closing brace: model paths can hold `//`.
    const text = line.trim().replace(/\}\s*,?\s*\/\/[^"]*$/, "}").replace(/,$/, "");
    if (!text.startsWith("{")) continue;
    const fields = [];
    const pattern = /"((?:[^"\\]|\\.)*)"|\{[^{}]*\}|[^,{}\s][^,{}]*/g;
    for (const match of text.slice(1, -1).matchAll(pattern)) fields.push(match[1] ?? match[0].trim());
    result.push(fields);
  }
  return result;
};

const code = (value) => (value ? `\`${value}\`` : "");
const count = (value) => value.toLocaleString("en-US");
const table = (header, body) =>
  [`| ${header.join(" | ")} |`, `| ${header.map(() => "---").join(" | ")} |`, ...body.map((cells) => `| ${cells.join(" | ")} |`)].join("\n");
const details = (summary, content) => `<details>\n<summary>${summary}</summary>\n\n${content}\n\n</details>`;
const groupBy = (items, key) => {
  const groups = new Map();
  for (const item of items) {
    const name = key(item);
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(item);
  }
  return groups;
};
const byName = (a, b) => a.localeCompare(b, "en", { sensitivity: "base" });

// ---------------------------------------------------------------- appearance

const appearanceSource = game("appearance_catalog.cpp");
const appearance = rows(vectorBody(appearanceSource, "g_AppearanceOptions")).map(([name, group, part, gender]) => ({
  name,
  group,
  part: part.split("::")[1],
  gender: gender.split("::")[1],
}));
const beardSets = [];
{
  const body = vectorBody(appearanceSource, "g_AppearanceBeardSets");
  let depth = 0;
  let current = null;
  for (const token of body.matchAll(/\{|\}|"([^"]*)"/g)) {
    if (token[0] === "{") {
      depth += 1;
      current = [];
    } else if (token[0] === "}") {
      depth -= 1;
      beardSets.push(current);
    } else current.push(token[1]);
  }
}
const headBeards = rows(vectorBody(appearanceSource, "g_AppearanceHeadBeards")).map(([head, gender, set]) => ({
  head,
  gender: gender.split("::")[1],
  beards: beardSets[Number(set)],
}));

const appearanceList = (part, gender) => {
  const options = appearance.filter((option) => option.part === part && option.gender === gender);
  const groups = groupBy(options, (option) => option.group || option.name);
  const body = [...groups].map(([group, members]) => [code(group), members.map((member) => code(member.name)).join(", ")]);
  return { options, body };
};

const appearanceRegion = (part) => {
  const sections = [];
  for (const [gender, label] of [["Male", "Male"], ["Female", "Female"]]) {
    const { options, body } = appearanceList(part, gender);
    if (!options.length) continue;
    sections.push(details(`${label}: ${count(options.length)} options`, table(["Group", "Names"], body)));
  }
  return sections.join("\n\n");
};

const beardRegion = () => {
  const male = headBeards.filter((entry) => entry.gender === "Male");
  const allBeards = appearance.filter((option) => option.part === "Beard").map((option) => option.name);
  const bySet = groupBy(male, (entry) => entry.beards.join(","));
  const sets = [...bySet.values()].sort((a, b) => b[0].beards.length - a[0].beards.length || byName(a[0].head, b[0].head));
  const shaven = male.filter((entry) => !entry.beards.length).map((entry) => code(entry.head));
  const body = sets
    .filter((heads) => heads[0].beards.length)
    .map((heads) => [heads.map((entry) => code(entry.head)).join(", "), `${heads[0].beards.length}: ${heads[0].beards.map(code).join(", ")}`]);
  return [
    details(`All ${allBeards.length} beards`, allBeards.map(code).join(", ")),
    details(`Which faces grow which beards (${count(male.length - shaven.length)} faces)`, table(["Faces", "Beards they can wear"], body)),
    shaven.length ? details(`Faces with no beard (${shaven.length})`, shaven.join(", ")) : "",
  ]
    .filter(Boolean)
    .join("\n\n");
};

// ---------------------------------------------------------------- horses

const breeds = rows(vectorBody(game("horse_catalog.cpp"), "g_HorseBreeds")).map(([name, label, guid, soul]) => ({ name, label, guid, soul }));
const breedRegion = () =>
  table(
    ["Breed", "Name in game", "Soul", "Soul GUID"],
    breeds.map((breed) => [code(breed.name), breed.label, code(breed.soul), code(breed.guid)]),
  );

const gearSource = game("horse_gear_catalog.cpp");
const gear = rows(vectorBody(gearSource, "g_HorseGear")).map(([name, guid, slot]) => ({ name, guid, slot: slot.split("::")[1] }));
const gearByGuid = new Map(gear.map((item) => [item.guid, item]));
const presets = [];
for (const match of vectorBody(gearSource, "g_HorseGearPresets").matchAll(/\{"([^"]+)",\s*\{([^}]*)\}\}/g)) {
  presets.push({ name: match[1], items: [...match[2].matchAll(/"([^"]+)"/g)].map((guid) => gearByGuid.get(guid[1])) });
}
const slotNames = { Saddle: "saddle", Head: "head", Torso: "torso", Shoe: "shoe" };
const slotLabels = { Saddle: "Saddles", Head: "Bridles and chanfrons", Torso: "Caparisons and trappings", Shoe: "Horseshoes" };

const gearRegion = () =>
  Object.keys(slotNames)
    .map((slot) => {
      const items = gear.filter((item) => item.slot === slot);
      return details(
        `<code>${slotNames[slot]}</code>: ${slotLabels[slot]} (${items.length})`,
        table(["Item class", "GUID"], items.map((item) => [code(item.name), code(item.guid)])),
      );
    })
    .join("\n\n");

const presetRegion = () => {
  const family = (name) => {
    const match = name.match(/^(horse_(?:common|noble|nomad|draft))/);
    return match ? match[1] : "Named horses and quests";
  };
  const groups = groupBy([...presets].sort((a, b) => byName(a.name, b.name)), (preset) => family(preset.name));
  const order = ["horse_common", "horse_noble", "horse_nomad", "horse_draft", "Named horses and quests"];
  return order
    .filter((name) => groups.has(name))
    .map((name) => {
      const members = groups.get(name);
      const body = members.map((preset) => {
        const worn = Object.keys(slotNames).map((slot) => {
          const item = preset.items.find((entry) => entry?.slot === slot);
          return item ? code(item.name) : "";
        });
        return [code(preset.name), ...worn];
      });
      const label = name.startsWith("horse_") ? `<code>${name}</code> family` : name;
      return details(`${label} (${members.length})`, table(["Preset", "Saddle", "Head", "Torso", "Shoe"], body));
    })
    .join("\n\n");
};

// ---------------------------------------------------------------- souls

const roles = rows(vectorBody(game("npc_roles.cpp"), "g_NpcRoles")).map(([name, guid, actorClass, , character]) => ({ name, guid, actorClass, character }));
const roleRegion = () =>
  table(
    ["Role", "Body", "Looks like", "Soul GUID"],
    roles.map((role) => [code(role.name), role.actorClass === "NPC_Female" ? "Female" : "Male", code(role.character), code(role.guid)]),
  );

const souls = readMod("files/kcdc/souls.tsv")
  .split("\n")
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => {
    const [name, archetype, guid, character = ""] = line.replace(/\r$/, "").split("\t");
    return { name, archetype, guid, character };
  });

const humanSoulRegion = () => {
  const humans = souls.filter((soul) => (soul.archetype === "NPC" || soul.archetype === "NPC_Female") && soul.character);
  const looks = groupBy(humans, (soul) => soul.character);
  const generic = [];
  const named = [];
  for (const [character, members] of looks) {
    const first = [...members].sort((a, b) => byName(a.name, b.name))[0];
    const row = { character, soul: first, count: members.length, female: first.archetype === "NPC_Female" };
    (/^char_GENERIC_/.test(character) ? generic : named).push(row);
  }
  const genericGroups = groupBy(
    generic.sort((a, b) => byName(a.character, b.character)),
    (row) => row.character.replace(/^char_GENERIC_/, "").replace(/_\d+$/, "").toLowerCase().replace(/_/g, " "),
  );
  const cells = (row) => [code(row.character), row.female ? "Female" : "Male", code(row.soul.guid), code(row.soul.name), String(row.count)];
  const header = ["Look", "Body", "Soul GUID", "One soul with it", "Souls"];
  const sections = [...genericGroups]
    .sort((a, b) => byName(a[0], b[0]))
    .map(([kind, members]) => details(`Generic ${kind} (${members.length})`, table(header, members.map(cells))));
  const namedSorted = named.sort((a, b) => byName(a.character, b.character));
  const namedGroups = groupBy(namedSorted, (row) => {
    const letter = row.character.replace(/^char_/, "")[0]?.toUpperCase() ?? "?";
    return /[A-Z]/.test(letter) ? letter : "#";
  });
  const namedSections = [...namedGroups].map(([letter, members]) => details(`Named characters: ${letter} (${members.length})`, table(header, members.map(cells))));
  return { generic: sections.join("\n\n"), named: namedSections.join("\n\n"), lookCount: looks.size, humanCount: humans.length };
};

const dogSoulRegion = () => {
  const dogs = souls.filter((soul) => soul.archetype === "Dog").sort((a, b) => byName(a.name, b.name));
  return details(`All ${dogs.length} dog souls`, table(["Soul", "Soul GUID", "Character"], dogs.map((soul) => [code(soul.name), code(soul.guid), code(soul.character)])));
};

// ---------------------------------------------------------------- items

const items = rows(vectorBody(game("item_classes.cpp"), "g_ItemClasses")).map(([name, guid, category]) => ({ name, guid, category }));
const categoryLabels = {
  AlchemyBase: "Alchemy bases",
  Ammo: "Arrows and bolts",
  Armor: "Armour and clothing",
  CraftingMaterial: "Crafting materials",
  DiceBadge: "Dice badges",
  Die: "Dice",
  Document: "Documents and books",
  Food: "Food and drink",
  Helmet: "Helmets",
  Herb: "Herbs",
  Hood: "Hoods and coifs",
  ItemAlias: "Aliases",
  Key: "Keys",
  KeyRing: "Key rings",
  MeleeWeapon: "Melee weapons",
  MiscItem: "Miscellaneous",
  MissileWeapon: "Bows and crossbows",
  Money: "Money",
  NPCTool: "NPC tools",
  Ointment: "Ointments",
  PickableItem: "Pickable items",
  Poison: "Poisons",
  QuickSlotContainer: "Quick-slot containers",
};
const itemRegion = () => {
  const groups = groupBy(items, (item) => item.category);
  return [...groups]
    .sort((a, b) => byName(a[0], b[0]))
    .map(([category, members]) => {
      const sorted = [...members].sort((a, b) => byName(a.name, b.name));
      const label = categoryLabels[category] ? `${categoryLabels[category]}, <code>${category}</code>` : `<code>${category}</code>`;
      return details(`${label} (${count(sorted.length)})`, table(["Item class", "GUID"], sorted.map((item) => [code(item.name), code(item.guid)])));
    })
    .join("\n\n");
};

// ---------------------------------------------------------------- buffs

const buffHeader = game("buff_catalog.h");
const buffClassNames = [...buffHeader.match(/kNames\[kCount\] = \{([^}]*)\}/)[1].matchAll(/"([^"]*)"/g)].map((match) => match[1]);
const buffSource = game("buff_catalog.cpp");
const buffs = rows(vectorBody(buffSource, "g_Buffs")).map((fields) => ({
  name: fields[0],
  guid: fields[1],
  uiName: fields[3],
  classId: Number(fields[4]),
  worldTime: fields[11] === "true",
  duration: Number(String(fields[12]).replace(/f$/i, "")),
}));
const buffTags = [...vectorBody(buffSource, "g_BuffAiTags").matchAll(/"([^"]*)"/g)].map((match) => match[1]);
const claimable = ["injury", "heal", "poison", "perception", "overeat", "alcohol", "potion", "foodPoison", "unconsciousness", "hangover", "satisfaction", "perfume", "punishment", "forcedDrunkenness", "plague"];

// Real seconds, as `BuffInfo.duration` reports them: a game-clock row is written in game
// seconds, which run 15 times faster (kWorldTimeRatio in buff_catalog.h).
const worldTimeRatio = Number(buffHeader.match(/kWorldTimeRatio = ([\d.]+)F?;/)[1]);
const duration = (buff) => {
  if (buff.duration < 0) return "Until removed";
  if (buff.duration === 0) return "None";
  const seconds = buff.worldTime ? buff.duration / worldTimeRatio : buff.duration;
  const text = seconds >= 3600 ? `${Number((seconds / 3600).toFixed(2))} h` : seconds >= 60 ? `${Number((seconds / 60).toFixed(1))} min` : `${Number(seconds.toFixed(2))} s`;
  return buff.worldTime ? `${text}, game clock` : text;
};

const buffClassRegion = () =>
  table(
    ["Class", "Effects", "Claimable"],
    buffClassNames
      .map((name, id) => ({ name, id }))
      .filter((entry) => entry.name)
      .map((entry) => [code(entry.name), String(buffs.filter((buff) => buff.classId === entry.id).length), claimable.includes(entry.name) ? "Yes" : ""]),
  );
const buffTagRegion = () => buffTags.map(code).join(", ");
const buffRegion = () => {
  const groups = groupBy(buffs, (buff) => buffClassNames[buff.classId] || String(buff.classId));
  return [...groups]
    .sort((a, b) => byName(a[0], b[0]))
    .map(([name, members]) =>
      details(
        `<code>${name}</code> (${members.length})`,
        table(["Effect", "Lasts", "GUID"], members.map((buff) => [code(buff.name), duration(buff), code(buff.guid)])),
      ),
    )
    .join("\n\n");
};

// ---------------------------------------------------------------- effects, markers, blips

const vfx = rows(vectorBody(game("vfx_catalog.cpp"), "g_VfxEffects")).map(([name, library, group, distance, continuous]) => ({
  name,
  library,
  group,
  distance: Number(String(distance).replace(/F$/i, "")),
  continuous: continuous === "true",
}));
const vfxRegion = () => {
  const libraries = groupBy(vfx, (effect) => effect.library);
  return [...libraries]
    .map(([library, members]) =>
      details(
        `<code>${library}</code> (${members.length})`,
        table(
          ["Effect", "Plays", "Seen from"],
          members.map((effect) => [code(effect.name), effect.continuous ? "Loops" : "Once", effect.distance > 0 ? `${effect.distance} m` : ""]),
        ),
      ),
    )
    .join("\n\n");
};

const markers = rows(vectorBody(game("marker_catalog.cpp"), "g_MarkerMaterials")).map(([name, folder, opacity, decal]) => ({ name, folder, decal: decal === "true" }));
const markerRegion = (decal) => {
  const groups = groupBy(
    markers.filter((marker) => marker.decal === decal),
    (marker) => marker.name.split("/").slice(0, -1).join("/"),
  );
  return [...groups]
    .map(([folder, members]) => details(`<code>${folder}/</code> (${members.length})`, members.map((marker) => code(marker.name)).join(", ")))
    .join("\n\n");
};

const blips = [...game("blip_icon_catalog.h").matchAll(/\{(\d+), "([^"]+)", (true|false), (true|false)\}/g)].map((match) => ({
  type: Number(match[1]),
  name: match[2],
  onMap: match[3] === "true",
  undiscovered: match[4] === "true",
}));
const blipRegion = () =>
  table(
    ["Icon", "On the map screen", "Undiscovered art"],
    blips.map((blip) => [code(blip.name), blip.onMap ? "Yes" : "Compass only", blip.undiscovered ? "Yes" : ""]),
  );

// ---------------------------------------------------------------- animation props and emotes

const animationSource = game("animation_catalog.cpp");
const props = rows(vectorBody(animationSource, "g_AnimationProps")).map(([name, model, hand]) => ({ name, model, hand }));
const propRegion = () => {
  const groups = groupBy([...props].sort((a, b) => byName(a.name, b.name)), (prop) => prop.hand);
  return [...groups]
    .sort((a, b) => byName(a[0], b[0]))
    .map(([hand, members]) => details(`<code>${hand}</code> (${members.length})`, table(["Prop", "Model"], members.map((prop) => [code(prop.name), code(prop.model)]))))
    .join("\n\n");
};
const animationCount = rows(vectorBody(animationSource, "g_Animations")).length;

const emotes = rows(vectorBody(game("emote_catalog.cpp"), "g_Emotes")).map(([id, name, fragment, tag, , , seconds, fullBody]) => ({
  id,
  name,
  fragment,
  tag,
  seconds: Number(String(seconds).replace(/F$/i, "")),
  fullBody: fullBody === "true",
}));
const emoteRegion = () =>
  table(
    ["Id", "Name", "Body", "Lasts", "Fragment", "Tag"],
    emotes.map((emote) => [emote.id, emote.name, emote.fullBody ? "Whole body" : "Upper body", `${emote.seconds.toFixed(1)} s`, code(emote.fragment), code(emote.tag)]),
  );

// ---------------------------------------------------------------- write

const human = humanSoulRegion();
const countOf = (part, gender) => appearance.filter((option) => option.part === part && (!gender || option.gender === gender)).length;

const regions = {
  "overview.md": {
    counts: table(
      ["Catalog", "Entries", "Page"],
      [
        ["Faces", `${countOf("Head", "Male")} male, ${countOf("Head", "Female")} female`, "[Faces, hair and skins](../appearance/)"],
        ["Hairstyles", `${countOf("Hair", "Male")} male, ${countOf("Hair", "Female")} female`, "[Faces, hair and skins](../appearance/)"],
        ["Skins", `${countOf("Body", "Male")} male, ${countOf("Body", "Female")} female`, "[Faces, hair and skins](../appearance/)"],
        ["Beards", `${countOf("Beard")}, male only`, "[Beards](../beards/)"],
        ["Horse breeds", String(breeds.length), "[Horse breeds](../horse-breeds/)"],
        ["Horse gear", `${gear.length} items, ${presets.length} presets`, "[Horse gear](../horse-gear/)"],
        ["NPC roles and souls", `${roles.length} roles, ${count(human.lookCount)} looks`, "[NPC and dog souls](../souls/)"],
        ["Dog souls", String(souls.filter((soul) => soul.archetype === "Dog").length), "[NPC and dog souls](../souls/#dog-souls)"],
        ["Item classes", count(items.length), "[Items](../items/)"],
        ["Status effects", count(buffs.length), "[Buffs](../buffs/)"],
        ["Particle effects", String(vfx.length), "[Particle effects](../effects/)"],
        ["Marker materials", String(markers.length), "[Marker materials](../markers/)"],
        ["Blip icons", String(blips.length), "[Blip icons](../blip-icons/)"],
        ["Hand props and emotes", `${props.length} props, ${emotes.length} emotes`, "[Hand props and emotes](../animation-props/)"],
      ],
    ),
  },
  "appearance.md": { heads: appearanceRegion("Head"), hair: appearanceRegion("Hair"), skins: appearanceRegion("Body") },
  "beards.md": { beards: beardRegion() },
  "horse-breeds.md": { breeds: breedRegion() },
  "horse-gear.md": { items: gearRegion(), presets: presetRegion() },
  "souls.md": { roles: roleRegion(), generic: human.generic, named: human.named, dogs: dogSoulRegion() },
  "items.md": { items: itemRegion() },
  "buffs.md": { classes: buffClassRegion(), tags: buffTagRegion(), buffs: buffRegion() },
  "effects.md": { effects: vfxRegion() },
  "markers.md": { decals: markerRegion(true), meshes: markerRegion(false) },
  "blip-icons.md": { icons: blipRegion() },
  "animation-props.md": { props: propRegion(), emotes: emoteRegion(), animations: `The catalog behind \`Animations.list\` holds ${count(animationCount)} rows.` },
};

let failed = false;
for (const [file, blocks] of Object.entries(regions)) {
  const path = join(pagesRoot, file);
  let page = readFileSync(path, "utf8");
  for (const [name, content] of Object.entries(blocks)) {
    const pattern = new RegExp(`(<!-- generated:${name} -->)[\\s\\S]*?(<!-- /generated:${name} -->)`);
    if (!pattern.test(page)) {
      console.error(`${file}: no generated:${name} region`);
      failed = true;
      continue;
    }
    page = page.replace(pattern, (_, open, close) => `${open}\n\n${content}\n\n${close}`);
  }
  writeFileSync(path, page);
  console.log(`${file}: ${Object.keys(blocks).join(", ")}`);
}
if (failed) process.exit(1);
