# Contributing to bray-platform

Thanks for your interest in contributing. A few things to know before you open a PR.

## Licensing and the CLA

Every package in this repo is licensed AGPL-3.0-only. The maintainer also ships commercial
licenses and proprietary extensions built on top of this same code — that dual model is what
funds ongoing development of the open-source platform.

For the maintainer to be able to include your contribution in both the open-source packages
*and* those commercial/proprietary offerings, we need a Contributor License Agreement (CLA)
on file. The CLA does not take away your rights to your own contribution — it grants the
maintainer the additional rights needed to relicense it alongside the rest of the codebase.

You'll be prompted to sign the CLA automatically the first time you open a pull request, via
a bot comment. Signing is a one-time action per contributor (tracked in this repo, no external
service).

## Development

- Node >= 20, npm >= 10. This repo uses npm workspaces + Turborepo; do not introduce another
  package manager.
- `npm install` at the repo root installs and links all packages.
- `npm run build` builds every package (via `turbo run build`, in dependency order).
- `npm run typecheck` typechecks every package.
- `npm run lint` / `npm run lint:fix` runs the SPDX license-header check (and future lint
  rules) across every package's `src/`.
- Every source file under `packages/*/src/**/*.{ts,tsx}` must carry the SPDX header enforced
  by `@heybray/dev-config`'s eslint config. Run `npm run lint:fix` to add it automatically to
  new files.

## Pull requests

- One logical change per PR where reasonable.
- Add a [changeset](https://github.com/changesets/changesets) (`npx changeset add`) for any
  change that should trigger a version bump on publish.
- Make sure `npm run build`, `npm run typecheck`, and `npm run lint` all pass before requesting
  review.
- Run `./bin/check-scenarios-vocabulary.sh` — the case-insensitive Scenarios vocabulary gate
  must pass (also enforced in CI).

## Scenarios vocabulary gate

Platform packages must not introduce new Scenarios-era **wire** vocabulary (`scenario`,
`roleplay`, and camelCase variants such as `detachedFromScenarios`). The gate is
case-insensitive:

```bash
./bin/check-scenarios-vocabulary.sh
```

Implementation: `grep -rni 'scenario\|roleplay' packages/*/src` with an allowlist. A match is
**allowed** only when:

1. **Deprecated alias** — the line contains `DEPRECATED` (deprecated response fields, path
   helpers, style keys, and type aliases kept until 2.0.0).
2. **`legacy*` identifiers** — in `star-map-paths.ts` or `TeamStarMapComponents.tsx` only
   (e.g. `legacyMemberScenarioHistoryPath`).
3. **Doc-comments** — JSDoc/block-comment lines (`*`, `/**`) mentioning Scenarios as product
   context, not as API surface.

Any other match fails the gate. Neutral replacements (`content-history`, `detachedCount`,
`ContentListRowComponent`, etc.) are required for new code.

## Publishing to npm

CI publishes via `.github/workflows/release.yml` when a "Version Packages" PR merges to `main`.
The workflow needs a repo secret **`NPM_TOKEN`**: an npm **Automation** token (not Publish) for the
`brayg` account with write access to the `@heybray` scope. If the token is missing or invalid,
`npm publish` fails with a misleading **`E404 Not Found`** on scoped packages — that is an auth
failure, not a missing package.

To publish manually (same as CI):

```bash
npm ci
npx turbo run build
npx changeset publish
```

Requires `npm whoami` to return `brayg` (or another maintainer on the `@heybray` packages).

## Cross-repo UI batch (yalc)

When extracting shared gamification UI during a review batch (client-side dedupe only):

1. Work on a **`platform/gamification-ui-batch`** branch in `bray-platform`.
2. Add a **changeset per logical change** (`npx changeset add`) — one publish at batch end, itemized changelog.
3. Local loop in consumer repos (`bray-scenarios`, `bray-flashcards`, `bray-premium`):

   ```bash
   # platform — after each change
   npm run build --workspace=@heybray/gamification-react
   yalc publish --push --changed   # or: cd packages/gamification-react && yalc push

   # consumer — once per branch
   yalc add @heybray/gamification-react @heybray/react   # when react config changes too
   npm install
   ```

4. **Do not commit** yalc `file:.yalc/...` entries. CI runs `./bin/check-no-yalc.sh` in each repo.
5. Before publish: verify consumers against **`npm pack` tarballs**, not only yalc.
6. Publish platform once → `yalc remove` in consumers → bump pinned npm versions together.

Batch scope: client-side UI dedupe only (~1 week). No API/schema changes in the batch.
