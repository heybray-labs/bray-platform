# Testing

## Full local suite

From the repo root:

```bash
npm test
```

Runs `./bin/test.sh`:

1. **`./bin/guards.sh`** — yalc, deep-import, vocabulary, and package-boundary tripwires
   (plus changeset status is CI-only via the reusable guards workflow)
2. **`npx turbo run typecheck build`** — all packages in dependency order
3. **`npm run test --workspace=@heybray/gamification-react`**
4. **`npm run test --workspace=@heybray/react`**
5. **`npm run test --workspace=@heybray/server-kit`**

Individual package commands:

| Package | Command | Config |
|---------|---------|--------|
| `@heybray/gamification-react` | `npm run test --workspace=@heybray/gamification-react` | happy-dom, `src/**/*.test.tsx` |
| `@heybray/react` | `npm run test --workspace=@heybray/react` | happy-dom, `src/**/*.test.ts` |
| `@heybray/server-kit` | `npm run test --workspace=@heybray/server-kit` | node, `src/**/*.test.ts` |

Other packages rely on **typecheck + build** only (no Vitest suite today).

## CI (`.github/workflows/ci.yml`)

| Job | What runs |
|-----|-----------|
| **`guards`** | Org reusable workflow; platform passes `changesets: true` (except Version Packages PRs) |
| **`verify`** | `npm ci`, `turbo run typecheck build`, **`gamification-react` tests only** |
| **`examples-integration`** | Fresh Postgres, `basic-app` `db:init`, boot server on `:3101`, curl smoke (auth, taxonomy, notes, points, leaderboard) |

Required merge checks on `main`: **`guards / guards`**, **`verify`**.

Note: CI **`verify`** does not currently run `@heybray/react` or `@heybray/server-kit`
Vitest — the full local `bin/test.sh` does. Run `npm test` locally before pushing
changes to those packages.

## Lint

```bash
npm run lint        # SPDX header + eslint across packages/*/src
npm run lint:fix    # auto-fix headers
```

## Before opening a PR

```bash
npm run build
npm run typecheck
npm run lint
npm test            # recommended when touching react, server-kit, or gamification-react
./bin/check-scenarios-vocabulary.sh
```

Add a changeset when the change should publish (`npx changeset add`).
