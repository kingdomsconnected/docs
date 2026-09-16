# Kingdoms Connected documentation

Public, maintainer-authored guides for the Kingdoms Connected scripting API.

The closed-source mod remains authoritative for the generated client and server API contracts. It publishes those contracts as immutable artifacts to MafiaHub Services. This repository downloads an exact contract revision, composes it with the public guides, generates the complete site, and deploys it to the standalone documentation service.

## Structure

- `guides/` subdirectories become the sidebar's guide groups, and their names become the group labels (capitalized by the theme, so keep them single lowercase words): `basics/` (onboarding), `concepts/` (events and other cross-cutting ideas), `server/` and `client/` (per-environment systems). `overview.md` sits at the top level, above the groups.
- `docs.config.json` selects the published guides with the `communityContent.documents` globs; a guide outside those globs is silently excluded from navigation. Each page's frontmatter `sidebar.order` sets its position within its group, and a group is placed by the lowest order it contains — give a new guide an order between its neighbours.
- Image directories live beside the Markdown document that references them.
- `docs.config.json` owns the published site's generator pin, branding, links, navigation inputs, and community-content mapping.
- `scripts/sync_contract.mjs` downloads and verifies the public scripting contract.
- `scripts/docs.mjs` is the single local and CI generation entrypoint.
- `src/styles/production.css` is the production theme shared by the standalone site and local preview.

The closed-source mod repository owns only contract generation and publication. It does not render or deploy this website.

## Contributing

Open a pull request with the guide or asset change. Keep local image references relative to the Markdown file and avoid active HTML such as scripts, forms, iframes, or inline event handlers.

Guides document the API as it is, not as it is planned. Every global, function and property named in a guide should exist in the generated reference; when the two disagree the reference is right, because it comes from the runtime's own binding registrations.

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

That bypasses the download and its integrity checks entirely, so use it for previewing only — CI always resolves a published, verified revision.

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
pnpm build
git diff --check
```

The generated `dist/` is the same static artifact deployed in CI.

Merges to `main` deploy against the selected contract channel, and maintainers can run the deployment manually with an exact contract revision. This repository owns the scoped standalone documentation upload token; the mod repository never receives site-rendering or deployment credentials, and never triggers or controls this workflow.
