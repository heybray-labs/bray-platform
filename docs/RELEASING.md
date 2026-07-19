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
3. **`.github/workflows/release.yml`** (trigger: **push to `main`**) runs:
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

## Consumer adoption

App repos (`bray-scenarios`, `bray-flashcards`, `bray-premium`, template) bump pinned
`@heybray/*` versions in separate PRs after publish — see cross-repo workflow in
`CONTRIBUTING.md`.
