# Releasing

`bray-platform` publishes **`@heybray/*` npm packages** — not a deployable application.
There is no Docker image or app version tag for this repo.

## Packages

Ten public workspace packages (see root `package.json` workspaces):

`@heybray/ui`, `@heybray/react`, `@heybray/gamification`, `@heybray/gamification-react`,
`@heybray/server-kit`, `@heybray/taxonomy`, `@heybray/media`, `@heybray/llm`,
`@heybray/identity`, `@heybray/dev-config`

`examples/basic-app` is private and not published.

## Changesets workflow

Configuration: `.changeset/config.json` — `access: public`, `baseBranch: main`,
`updateInternalDependencies: patch`.

### Day-to-day

1. Every PR that should release includes a **changeset file** (`npx changeset add` or
   `npm run changeset`).
2. Merge to `main`.
3. **`.github/workflows/release.yml`** (trigger: **push to `main`**, or manual
   **`workflow_dispatch`**) runs:
   - `npm ci`
   - `npx turbo run build`
   - npm credential check (`npm whoami`)
   - **`changesets/action@v1`**:
     - Pending changesets → opens/updates **Version Packages** PR on branch
       `changeset-release/main` (runs `changeset version`, bumps package versions +
       changelogs)
     - No pending changesets → **`npx changeset publish`** to npm

### Version Packages PR

- Branch: `changeset-release/main`
- **Never auto-merge without explicit owner approval** — even when CI is green (see
  `CONTRIBUTING.md` / `docs/DEVELOPMENT.md` in app repos).
- CI skips the changeset guard on this branch (`guards` job with `changesets: false`).

### Publish requirements

- Repo secret **`NPM_TOKEN`**: npm **Automation** token for account `brayg` with write
  access to `@heybray` scope
- **`NPM_CONFIG_PROVENANCE: true`** and `permissions.id-token: write` for npm provenance
- Invalid/missing token often surfaces as **`E404 Not Found`** on scoped packages — that
  is usually auth failure, not a missing package

### Manual publish (same as CI)

```bash
npm ci
npx turbo run build
npx changeset publish
```

Requires `npm whoami` → `brayg` (or another maintainer on the packages).

## Stuck release pipeline

If a merge to `main` includes new `.changeset/*.md` files but no **Version Packages**
PR appears (or **Release** never ran after the merge):

1. **Manual re-trigger:** Actions → **Release** → **Run workflow** (`workflow_dispatch`)
   on `main` — no empty-commit PR required.
2. **Automated alert:** `.github/workflows/release-healthcheck.yml` runs every 15 minutes
   (and on failed **Release** runs). It opens/updates a GitHub issue when `main` has
   pending changesets, no open Version Packages PR, and no successful **Release** run
   for the latest `.changeset/` commit after a 30-minute grace window.

Do **not** compensate by merging consumer pin bumps early, pushing npm tags manually, or
running `npm version` on protected `main`.

## Orphan git tags (app repos)

Platform packages publish via changesets — they do not use app-style version tags. **App
repos** (`bray-scenarios`, `bray-flashcards`, …) cut Docker releases with `npm version`
+ `vX.Y.Z` tags via PR merge, not direct pushes to `main`.

An **orphan tag** is a tag (e.g. `v1.1.2`) that exists on the remote but whose commit is
**not on `main`** — usually from an aborted `git push --follow-tags` or a tag pushed
before the version-bump PR landed. Orphan tags confuse release state and GitHub Releases.

**Detect:**

```bash
git fetch --tags origin
git merge-base --is-ancestor v1.1.2 origin/main && echo "tag is on main" || echo "ORPHAN"
git log origin/main --oneline -3
git show v1.1.2 --oneline -s
```

**Clean up (owner, after confirming the tag should not exist):**

```bash
# Remote (irreversible — confirm first)
git push origin :refs/tags/v1.1.2

# Local
git tag -d v1.1.2
```

Then cut the release the right way: version-bump PR → merge to `main` → tag on the
merged commit (or let CI create the release from a tag push that matches `main`).

## Consumer adoption

App repos (`bray-scenarios`, `bray-flashcards`, `bray-premium`, template) bump pinned
`@heybray/*` versions in separate PRs after publish — see cross-repo workflow in
`CONTRIBUTING.md`.
