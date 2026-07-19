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

These gates (and the package-boundary checks in `bin/guards.sh`) run automatically in CI
via the org **`guards`** job — not only when contributors remember to run the script
manually.

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

## Cross-repo development workflow

How changes flow between the app repos (`bray-scenarios`, `bray-flashcards`, `bray-premium`)
and `bray-platform`. Canonical copy also lives in `bray-scenarios/docs/dev-workflow.md`.

### Standing rules (default behavior — not restated per task)

These apply to every session working across these repos, not just when a specific brief
says so:

- **Default to the yalc loop for any cross-repo work.** Don't hand-edit or test across a
  repo boundary without it.
- **Never merge a Version Packages PR, or otherwise trigger an actual npm publish,
  without stopping and asking the owner first** — even when all checks are green and
  auto-merge would otherwise apply. This is the one PR in the whole workflow that always
  gets an explicit human go-ahead; ordinary consumer/config PRs still auto-merge as
  designed. Confirm auto-merge is not armed automatically on `changeset-release/main`
  PRs specifically — if the changesets action or any workflow step ever enables it
  there, disable it; this is a mechanical check, not just a documented intention.
- **Don't burn a CI round-trip per tiny edit.** Iterate locally — commit locally,
  don't push — until a change is complete and locally yalc-verified; push once. Every
  push to an open PR branch re-triggers `guards`+`verify`, so five WIP pushes cost five
  full CI runs for no reason.
- **Batch related small fixes into one PR** rather than opening a new PR per one-line
  change — same principle as the batched-platform-work policy below, generalized to any
  small related work, not just changeset batches.
- **Don't idle-block waiting on a CI run** if there's independent work to do — open the
  PR, arm auto-merge (except the publish PR, per above), move on, and check back when
  the next step actually depends on that PR being merged.
- **Never bypass `guards`/`verify` "because the change is small."** Both real incidents
  in this project (yalc-polluted manifests reaching `main`; unpublished-API imports
  reaching `main`) happened on changes that felt small enough to skip the gate. The fix
  for CI being slow is making the gate cheaper and less frequent — caching
  (`actions/cache` keyed on the lockfile hash, or a Turborepo remote cache) and a
  docs-only fast path *inside* the job (detect "only `.md` files changed" and exit
  quickly — never via `paths-ignore`, which stops the check from reporting at all and
  leaves a required-check PR stuck on "Expected" forever) — never making the gate optional.

### The invariant

**A consumer repo's `main` only ever points at published `@heybray/*` versions.** Local bridges
(yalc) are a workbench state, never a committed state. Fresh-clone CI is the enforcement: it can
only resolve what npm can resolve.

### The two loops

**Inner loop (minutes, local only)** — while platform code is in flux:

```bash
# in bray-platform, after editing a package:
npm run build --workspace=@heybray/<pkg>
yalc publish packages/<pkg>                  # or: yalc push

# in the consumer repo (once per machine/branch):
yalc add @heybray/<pkg> && npm install
# iterate: edit → build → yalc push → consumer picks up the copy in place
```

**Outer loop (when the change is right)**:

1. PR into `bray-platform` — **every change carries its own changeset** in the same PR.
2. Merge → changesets opens/updates the "Version Packages" PR → merging that publishes to npm
   via CI (provenance attested). No manual publishes.
3. Consumer branch: `yalc remove @heybray/<pkg> && npm install`, bump the pin to the published
   version, land the consumer PR.

Why yalc and not the alternatives:

| Option | Verdict |
|---|---|
| **yalc** | ✅ Copies built output the way npm would — same layout, no symlinks. |
| `npm link` | ❌ Symlinks can load two instances of one package; module-level singletons split silently. |
| `file:../bray-platform/...` | ❌ Rewrites package.json/lockfile with paths that must never merge. |
| Deep imports (`node_modules/@heybray/*/src/...`) | ❌ Bypasses the exports contract entirely. |
| Copying into `node_modules` | ❌ Obviously. |

### Guard rails (mechanical, not aspirational)

- `.yalc/` and `yalc.lock` are gitignored in every consumer repo — **but note `yalc add` also
  rewrites `package.json`** with a `file:.yalc/...` dependency, and package.json is tracked.
  Therefore every consumer's CI (and its local test script) greps **`package.json` +
  `package-lock.json`** for yalc paths and **fails on any hit** (`./bin/check-no-yalc.sh`).
- After `yalc remove`, always `npm install` to restore the lockfile before committing — `yalc
  remove` alone leaves lockfile entries and broken symlinks behind.
- **Consumer commits that adopt an unpublished platform API never merge to `main`** — they wait
  on the adoption branch until the batch publishes, then land with the pin bump in one commit.
  Merging early breaks fresh clones even with clean manifests (the import target does not exist on
  npm).
- A consumer **shim duplicating an unpublished platform component** is an exception with a hard
  expiry (deleted the same day the batch publishes), never a pattern. If a shim is being
  considered, first ask whether the batch should simply publish now — "ship what's green" usually
  wins.

### Batched platform work

When a review pass produces several related platform changes (e.g. client UI dedupe), don't publish
per tweak:

- Accumulate on a short-lived feature branch. **Each item still lands with its own changeset
  file** — changesets accumulate and the eventual merge produces ONE Version Packages PR / one
  publish with an itemized changelog.
- Consumers ride yalc against the batch branch during the batch.
- **Scope bound**: one concern class per batch (e.g. client-side UI dedupe only). **Time bound**:
  ~a week; if still open, publish what's green and start a new batch.
- **Final verification before publish is against packed tarballs** (`npm pack` install or an RC),
  not yalc — yalc green is necessary, not sufficient.
- Batch ends with coordinated consumer pin bumps landing promptly in all three apps.
