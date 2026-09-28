# Kingdoms Connected documentation

Public, maintainer-authored guides for the Kingdoms Connected scripting API.

The closed-source mod remains authoritative for the generated client and server API contracts. It publishes those contracts as immutable artifacts to MafiaHub Services. This repository downloads an exact contract revision, composes it with the public guides, generates the complete site, and deploys it to the standalone documentation service.

## Structure

- `guides/` holds every page. Its folders become the sidebar's groups, labelled with the folder name exactly as written, so folders are named the way readers should see them ("Players", "Quests, dialogue and shops"). Their URLs are the lowercased, dashed form (`quests-dialogue-and-shops/`). The generator renders every guide group expanded, so the tree is kept to **one level of folders**: a new page goes into an existing group, and a new group needs a good reason.
  - `overview.md` is the introduction and the task index ("I want to... -> page"). Add a row there for every new page.
  - `Getting started/` is the beginner path, read in order: install and run a server, a first resource, TypeScript, a larger layout, debugging.
  - `Core concepts/` holds the ideas every other page leans on: authority, resources, events, networking, state, positions, virtual worlds, sharing code. Other pages link here instead of re-explaining them.
  - Server features are grouped by what they act on: `Players/`, `World/`, `NPCs and animals/`, `Quests, dialogue and shops/`. A feature with a client side too (chat, raycasts) keeps both halves on one page.
  - `Client scripting/` covers code in each player's game (input, camera, placement, sound, Discord), and `User interface/` covers pages, HUD, map and native screens.
  - `Tutorials/` holds multi-file builds, all in the same shape: before you start, what you will learn, file tree, numbered steps, try it, next steps.
  - `Hosting a server/` is for server operators.
  - Page titles lead with the task or keyword a reader scans for ("Give and take items", not "Items"). Each page also sets a short `sidebar.label`, because the sidebar is narrow and always open.
- `docs.config.json` selects the published guides with the `communityContent.documents` globs; a guide outside those globs is silently excluded from navigation. Each page's frontmatter `sidebar.order` sets its position within its group, and a group is placed by the lowest order it contains. Each group owns a range (Getting started 10s, Core concepts 20s, Players 30s, World 40s, NPCs and animals 50s, Quests 60s, Client scripting 70s, User interface 80s, Tutorials 90s, Hosting 100s), so give a new guide an order inside its group's range.
- Image directories live beside the Markdown document that references them.
- `docs.config.json` owns the published site's generator pin, branding, links, navigation inputs, and community-content mapping.
- `scripts/sync_contract.mjs` downloads and verifies the public scripting contract.
- `scripts/docs.mjs` is the single local and CI generation entrypoint.
- `scripts/check_guides.mjs` type-checks every code sample against `@kingdomsconnected/types` and lints the prose (`pnpm check`).
- `src/styles/production.css` is the production theme shared by the standalone site and local preview.

## Contributing

Open a pull request with the guide or asset change. Keep local image references relative to the Markdown file and avoid active HTML such as scripts, forms, iframes, or inline event handlers.

Guides document the API as it is, not as it is planned. Every global, function and property named in a guide should exist in the generated reference; when the two disagree the reference is right, because it comes from the runtime's own binding registrations.

### Writing a guide

- **One page, one topic.** Aim for 80 to 150 lines; split a page before it passes about 250.
- **Example first.** One or two sentences on what the page lets you do, then a working sample, then task headings ("Give an item", "React to a hit"). Properties, events and failure cases go in tables. Rationale goes in a short `:::note` or a `<details>`, or is left to the Core concepts page that already explains it.
- **Frontmatter:** every page has a `title`, a one-sentence `description`, a short `sidebar.label` and a `sidebar.order`.
- **Plain punctuation.** No em or en dashes, and no `--` standing in for one. Write the way you would explain it to a colleague.
- **Links** between guides use the page's route, relative to the page you are writing: from `guides/Getting started/typescript.md` (served at `guides/getting-started/typescript/`) the events page is `[Events](../../core-concepts/events/)`. Lowercase every folder and replace spaces with dashes. (A `.md` link cannot cross a folder whose name has a space in it.) Links into the API reference are relative `.md` links, as if `reference/` sat next to `guides/`: `[Player](../../reference/server/classes/Player.md#teleport)` from a page in a group folder. Never use absolute `/...` links, because the site can be deployed under a base path. `pnpm check:site` verifies every link and anchor.
- **Markdown only.** Asides (`:::note`, `:::tip[Title]`, `:::caution`, `:::danger`), titled code blocks (`title="src/server/index.ts"`), line markers (`{2-4}`, `ins={3}`, `del={5}`), `diff lang="ts"` blocks, `<details>` and tables all work. MDX components do not.
- **The generator rejects a page** containing `<script`, `<style`, `<button`, `<meta`, `<link`, `<input`, `<form`, `<iframe`, `<object`, `<embed`, `<base`, an ` onX=` attribute or a `javascript:` URL anywhere, **code blocks included**. Show web pages without those tags, and put their JavaScript in its own block.

### Code samples are checked

`pnpm check` type-checks every `js` and `ts` block against [`@kingdomsconnected/types`](https://www.npmjs.com/package/@kingdomsconnected/types), the package readers install, parses every `json` block, and lints the prose. A sample that calls something the runtime does not have fails the check.

When a release ships, bump the package's exact version in `package.json` (`pnpm add -D -E @kingdomsconnected/types@<version>`) and in the guides that name it (`grep -rn 'types@\|types": "' guides`).

- Blocks on pages under `guides/Client scripting/` and `guides/User interface/` use the client declarations; everything else uses the server's. A block whose first line is `// client` or `// server`, or whose title names a `client/` or `server/` path, picks its side explicitly.
- Blocks titled with a file path are compiled together, so a tutorial's files can import each other (`./command.js`).
- A few names are pre-declared so short samples need no setup: `player`, `target`, `horse`, `quest`, `npc`, `dog` and `session` on the server, `player` on the client. See `PLACEHOLDERS` in the script.
- `<!-- check: skip -->` on the line before a fence skips a block that is not meant to compile on its own (a fragment, or browser code). Use it rarely.

`pnpm check:site` additionally checks every link and anchor in the built `dist/`, so run it after `pnpm build`.

### Local preview

The preview is completely public. It does not require the closed-source mod, the game, a Services checkout, platform credentials, or an upload token. It downloads the same unauthenticated, immutable scripting contract used by CI and runs the same complete generator as production, including Server API, Client API, guides, branding, and navigation.

Install [Node.js 22 or newer](https://nodejs.org/), clone this repository, and install the pinned dependencies:

```sh
git clone https://github.com/kingdomsconnected/docs.git
cd docs
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install --frozen-lockfile
```

Start the local development server:

```sh
pnpm dev
```

Open <http://localhost:4321/>. The first run downloads the current `testing` contract into the ignored `.cache/` directory. Edit Markdown, colocated images, `docs.config.json`, or `src/styles/production.css`; the complete production site rebuilds and the browser refreshes automatically.

To download the contract without starting the preview:

```sh
pnpm docs:sync
```

Set `KCDC_CONTRACT_CHANNEL`, `KCDC_CONTRACT_REVISION`, or `KCDC_SERVICES_API_URL` to select another public contract. A manual deployment can pin an exact immutable revision; otherwise it resolves the selected public channel when the docs workflow starts.

### Building against a local contract

Until a contract has been published, and whenever you want to see an unpublished API change rendered, point the generator at a contract bundle built from a mod checkout:

```sh
KCDC_CONTRACT_ROOT=/path/to/mod/build/scripting-contract pnpm build
```

That bypasses the download and its integrity checks entirely, so use it for previewing only; CI always resolves a published, verified revision.

### Known issues with services-cli 0.6.4

Two of them, both in the generator rather than in this repository, and both
absent from the Linux runner CI uses:

- **The API reference renders empty on Windows.** The generator hands the
  contract's entry point to TypeDoc as a glob after resolving it to a native
  path, and a backslash escapes the next character in a glob, so it matches
  nothing. The build reports `server: 0 bound member names represented` and
  succeeds anyway. Guides and navigation are unaffected; build under WSL or
  Linux to preview the reference itself.
- **`pnpm dlx` cannot resolve the generator's own peer dependency.** The Astro
  build fails with `Cannot find package 'satteri'`. `npx -y
  @mafiahub/services-cli@<version>` installs it and works, so a local Windows
  preview can invoke the generator that way until the packaging is fixed.

Before opening a pull request, verify the affected pages at desktop and mobile widths and run:

```sh
pnpm check
pnpm build
pnpm check:site
git diff --check
```

The generated `dist/` is the same static artifact deployed in CI.

Merges to `main` deploy against the selected contract channel, and maintainers can run the deployment manually with an exact contract revision. This repository owns the scoped standalone documentation upload token; the mod repository never receives site-rendering or deployment credentials, and never triggers or controls this workflow.
