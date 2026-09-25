// Checks every guide against the scripting contract it documents.
//
//   pnpm check
//
// Three things are checked:
//
// - Every `js` and `ts` code block is type-checked against the contract's own
//   declarations, so a sample that calls something the runtime does not have
//   fails here instead of in a reader's editor.
// - Every `json` code block parses.
// - Prose uses plain punctuation: no em or en dashes, and no `--` standing in
//   for one.
// - No line trips the site generator's active-HTML filter, which rejects the
//   whole page and applies inside code blocks too.
//
// A block is checked against the server declarations unless the guide lives
// under `guides/Client scripting/`, its first line is a `// client` comment, or its title
// names a `client/` path. `// server` does the opposite. A `<!-- check: skip -->`
// comment on the line before a fence skips that block, which is for fragments
// that are not statements, like one option inside an object literal; a
// `<!-- check: server -->` or `<!-- check: client -->` comment picks the
// declarations explicitly.
//
// Untitled blocks are checked one by one, as separate modules. Blocks whose
// title is a file path (`title="src/server/index.ts"`) are written to that path
// and checked together, so a tutorial that splits a resource across files can
// import one from another the way the reader's copy will.
//
// A few names are declared for every block so that a short sample can say
// `player.teleport(...)` without a line of setup first. They are listed in
// PLACEHOLDERS below; a sample that needs anything else defines it. RUNTIME is
// the declaration file the TypeScript guide has readers add for what the
// runtime has and the contract does not declare; keep the two identical.
//
// JavaScript samples are checked the way an editor checks a plain `.js` file:
// wrong names, arity and property access fail, but a payload of type `unknown`
// is left alone, because in JavaScript it is simply a value.
//
// With `--dist`, the built site is checked too: every relative link and anchor
// in a guide page has to land on a page, and an anchor, that exist.

import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { syncContract } from "./sync_contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const guidesRoot = path.join(root, "guides");

// Mirrors guides/start/typescript.md. The contract leaves these out, and a
// TypeScript resource needs them to compile.
const RUNTIME = {
  server: `
interface EventBus {
  emitAllClients(eventName: string, payload?: unknown): void;
}
declare function setTimeout(handler: () => void, milliseconds?: number): number;
declare function clearTimeout(handle: number): void;
declare function setInterval(handler: () => void, milliseconds?: number): number;
declare function clearInterval(handle: number): void;
`,
  client: `
interface EventBus {
  emitServer(eventName: string, payload?: unknown): void;
}
declare function setTimeout(handler: () => void, milliseconds?: number): number;
declare function clearTimeout(handle: number): void;
declare function setInterval(handler: () => void, milliseconds?: number): number;
declare function clearInterval(handle: number): void;
`,
};

// The contract types each console method as taking one array rather than any
// number of values, so `console.log("text")` fails to type-check although
// it runs. The TypeScript guide shows the wrapper to use; samples keep the
// plain call, and this one diagnostic is not reported for it.
const isConsoleArrayQuirk = (message, sourceLine) => (/parameter of type 'unknown\[\]'/.test(message) || /^Expected 0-1 arguments, but got \d+\.$/.test(message)) && /\bconsole\.(log|info|warn|error|debug)\(/.test(sourceLine);

// Codes an editor would not raise for a plain .js file: values of type
// `unknown`, and parameters or variables with no type annotation.
const JS_TOLERATED = new Set([18046, 2571, 7005, 7006, 7031, 7034]);

const PLACEHOLDERS = {
  server: `
declare const player: Player;
declare const target: Player;
declare const horse: Horse;
declare const quest: Quest;
declare const npc: Npc;
declare const dog: Dog;
declare const session: number;
`,
  client: `
declare const player: Player;
`,
};

const COMPILER_OPTIONS = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.Node10,
  lib: ["lib.es2022.d.ts"],
  types: [],
  strict: true,
  allowJs: true,
  checkJs: true,
  noEmit: true,
  skipLibCheck: true,
  noFallthroughCasesInSwitch: true,
};

// Mirrors validateMarkdown in the services CLI's community-content.ts.
const UNSAFE = [
  /<\s*(?:base|button|embed|form|iframe|input|link|meta|object|script|style)\b/i,
  /\son[a-z]+\s*=/i,
  /(?:javascript|vbscript)\s*:/i,
  /data\s*:\s*text\/html/i,
  /\{@(?:link|linkcode|linkplain)\b/i,
];

const walk = async (directory) => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute)));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(absolute);
  }
  return files.sort();
};

// Fences may be indented inside a list item. The closing fence matches the
// opening one's indentation and backtick count.
const extractBlocks = (markdown) => {
  const lines = markdown.split("\n");
  const blocks = [];
  let inFrontmatter = lines[0] === "---";
  for (let index = inFrontmatter ? 1 : 0; index < lines.length; index += 1) {
    if (inFrontmatter) {
      if (lines[index] === "---") inFrontmatter = false;
      continue;
    }
    const open = lines[index].match(/^(\s*)(`{3,})(\S*)\s*(.*)$/);
    if (!open) continue;
    const [, indent, ticks, language, meta] = open;
    const body = [];
    let end = index + 1;
    for (; end < lines.length; end += 1) {
      const line = lines[end];
      if (line.trimStart().startsWith(ticks) && line.trim() === ticks) break;
      body.push(line.startsWith(indent) ? line.slice(indent.length) : line.trimStart());
    }
    let previous = index - 1;
    while (previous >= 0 && lines[previous].trim() === "") previous -= 1;
    const directive = previous >= 0 ? lines[previous].match(/^\s*<!--\s*check:\s*(skip|server|client)\s*-->\s*$/)?.[1] : undefined;
    blocks.push({ line: index + 1, language: language.toLowerCase(), meta, body, directive });
    index = end;
  }
  return blocks;
};

// Everything outside fences and inline code, with frontmatter kept: a title or
// a description is prose too.
const proseLines = (markdown) => {
  const result = [];
  let fence = null;
  markdown.split("\n").forEach((line, index) => {
    const open = line.match(/^\s*(`{3,})/);
    if (fence) {
      if (open && line.trim() === fence) fence = null;
      return;
    }
    if (open) {
      fence = open[1];
      return;
    }
    result.push({ line: index + 1, text: line.replace(/`[^`]*`/g, "``") });
  });
  return result;
};

const titleOf = (meta) => meta.match(/title="([^"]+)"/)?.[1];

const environmentOf = (relative, block) => {
  if (block.directive === "server" || block.directive === "client") return block.directive;
  const first = block.body.find((line) => line.trim() !== "")?.trim() ?? "";
  const comment = first.match(/^\/\/\s*(server|client)\b/i);
  if (comment) return comment[1].toLowerCase();
  const title = titleOf(block.meta) ?? "";
  if (/(^|\/)client\//.test(title)) return "client";
  if (/(^|\/)server\//.test(title)) return "server";
  return relative.split("/")[1] === "Client scripting" ? "client" : "server";
};

// Every relative href in a built guide page has to reach a page that exists,
// and an anchor on it that exists too.
const checkLinks = async (report) => {
  const dist = path.join(root, "dist");
  const pages = new Map();
  const readPage = async (file) => {
    if (!pages.has(file)) pages.set(file, await readFile(file, "utf8").catch(() => null));
    return pages.get(file);
  };
  const htmlFiles = async (directory) => {
    const found = [];
    for (const entry of await readdir(directory, { withFileTypes: true }).catch(() => [])) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) found.push(...(await htmlFiles(absolute)));
      else if (entry.name === "index.html") found.push(absolute);
    }
    return found;
  };
  const guidePages = await htmlFiles(path.join(dist, "guides"));
  if (!guidePages.length) {
    report("dist", 1, "no built guide pages; run pnpm build first");
    return;
  }
  for (const page of guidePages) {
    const html = await readPage(page);
    // Only the article: the sidebar and header are the generator's.
    const article = html.slice(html.indexOf('class="sl-markdown-content'), html.lastIndexOf("</main>"));
    for (const [, href] of article.matchAll(/href="([^"]+)"/g)) {
      // External links, and the generator's own absolute links (pagination,
      // stylesheets). Guides only ever write relative ones.
      if (/^(?:[a-z]+:|\/)/i.test(href)) continue;
      const [pathname, anchor] = href.split("#");
      const target = pathname === "" ? page : path.resolve(path.dirname(page), pathname, pathname.endsWith(".html") ? "" : "index.html");
      const label = path.relative(dist, page);
      const targetHtml = await readPage(target);
      if (targetHtml === null) {
        report(label, 1, `broken link ${href}`);
        continue;
      }
      if (anchor && !targetHtml.includes(`id="${anchor}"`)) report(label, 1, `missing anchor ${href}`);
    }
  }
};

const main = async () => {
  const contractRoot = await syncContract();
  const declarations = {
    server: path.join(contractRoot, "targets", "server", "api.d.ts"),
    client: path.join(contractRoot, "targets", "client", "api.d.ts"),
  };
  const problems = [];
  const report = (file, line, message) => problems.push(`${file}:${line}: ${message}`);

  const scratch = await mkdtemp(path.join(tmpdir(), "kcdc-guides-"));
  let checkedBlocks = 0;
  try {
    for (const absolute of await walk(guidesRoot)) {
      const relative = path.relative(root, absolute).split(path.sep).join("/");
      const markdown = (await readFile(absolute, "utf8")).replaceAll("\r\n", "\n");

      // The generator refuses a whole page that matches any of these, code
      // blocks included, so catch them here with a line number.
      markdown.split("\n").forEach((text, index) => {
        if (UNSAFE.some((pattern) => pattern.test(text))) report(relative, index + 1, "the site generator rejects this line as active HTML (even inside a code block)");
      });

      // The generator copies every local image a page names, code included,
      // and fails the build when one is missing.
      for (const [index, text] of markdown.split("\n").entries()) {
        for (const match of text.matchAll(/!\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))|<img\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi)) {
          const reference = match.slice(1).find(Boolean);
          if (!reference || /^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(reference)) continue;
          const target = path.resolve(path.dirname(absolute), decodeURIComponent(reference.split(/[?#]/)[0]));
          if (!(await stat(target).catch(() => null))?.isFile()) report(relative, index + 1, `image ${reference} does not exist, and the site generator fails on it (even inside a code block)`);
        }
      }

      for (const { line, text } of proseLines(markdown)) {
        if (/[\u2013\u2014]/.test(text)) report(relative, line, "em or en dash in prose; use a comma, colon, parentheses or a new sentence");
        if (/(^|\s)--(\s|$)/.test(text) && !/^\s*[-|:\s]+$/.test(text) && !/^\s*<!--|-->\s*$/.test(text)) report(relative, line, "`--` standing in for a dash in prose");
      }

      const frontmatter = markdown.startsWith("---\n") ? markdown.slice(4, markdown.indexOf("\n---", 4)) : "";
      if (!/^title:/m.test(frontmatter)) report(relative, 1, "frontmatter has no title");
      if (!/^description:/m.test(frontmatter)) report(relative, 1, "frontmatter has no description");

      const pageRoot = path.join(scratch, relative.replace(/\.md$/, ""));
      const files = { server: new Map(), client: new Map() };
      let snippet = 0;
      for (const block of extractBlocks(markdown)) {
        if (block.directive === "skip") continue;
        if (block.language === "json") {
          checkedBlocks += 1;
          try {
            JSON.parse(block.body.join("\n"));
          } catch (error) {
            report(relative, block.line, `JSON block does not parse: ${error.message}`);
          }
          continue;
        }
        if (!["js", "ts", "javascript", "typescript"].includes(block.language)) continue;
        checkedBlocks += 1;
        const environment = environmentOf(relative, block);
        const extension = block.language.startsWith("t") ? ".ts" : ".js";
        const title = titleOf(block.meta);
        const named = title && /\.(?:[cm]?[jt]s)$/.test(title) && !title.startsWith("/") && !title.includes("..");
        const file = path.join(pageRoot, environment, named ? title : `snippet-${(snippet += 1)}${extension}`);
        // A file shown twice (before and after a change) is checked as its last version.
        files[environment].set(file, { block, source: named ? block.body.join("\n") : `${block.body.join("\n")}\nexport {};\n`, offset: 0 });
      }

      for (const environment of ["server", "client"]) {
        if (!files[environment].size) continue;
        const prelude = path.join(pageRoot, environment, "__placeholders.d.ts");
        await mkdir(path.dirname(prelude), { recursive: true });
        await writeFile(prelude, `${RUNTIME[environment]}\n${PLACEHOLDERS[environment]}`);
        for (const [file, { source }] of files[environment]) {
          await mkdir(path.dirname(file), { recursive: true });
          await writeFile(file, source);
        }
        const program = ts.createProgram([...files[environment].keys(), prelude, declarations[environment]], COMPILER_OPTIONS);
        for (const diagnostic of ts.getPreEmitDiagnostics(program)) {
          const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
          const source = diagnostic.file ? files[environment].get(path.resolve(diagnostic.file.fileName)) : undefined;
          if (!source) {
            report(relative, 1, `[${environment}] ${message}`);
            continue;
          }
          const isJs = diagnostic.file.fileName.endsWith(".js");
          if (isJs && JS_TOLERATED.has(diagnostic.code)) continue;
          const { line } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
          if (isConsoleArrayQuirk(message, source.block.body[line] ?? "")) continue;
          report(relative, source.block.line + 1 + line, `[${environment}] ${message}`);
        }
      }
    }
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }

  if (process.argv.includes("--dist")) await checkLinks(report);

  if (problems.length) {
    console.error(problems.join("\n"));
    console.error(`\n${problems.length} problem(s) in the guides.`);
    process.exitCode = 1;
    return;
  }
  console.log(`Guides are clean: ${checkedBlocks} code block(s) checked against the contract.`);
};

await main();
