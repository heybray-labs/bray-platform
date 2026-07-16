# ADR: Standalone app composition shape (Phase 5)

**Status:** Ratified  
**Date:** 2026-07-16  
**Context:** Phase 5 validation app [`heybray-labs/bray-flashcards`](https://github.com/heybray-labs/bray-flashcards)  
**Friction log:** [`bray-flashcards/docs/friction-log.md`](https://github.com/heybray-labs/bray-flashcards/blob/main/docs/friction-log.md) (FL-001–FL-021)

---

## Decision

**Adopt a published template repo** (`heybray-labs/bray-app-template`, evolved from `examples/basic-app` + Phase 5 learnings) as the canonical way to start a new standalone gamified app.

Do **not** build a `create-bray-app` CLI generator in the next phase. Do **not** adopt feature-package bundling for standalone apps (that remains a Phase 6 premium question).

---

## Context

Phase 5 built a second app — a flashcard/quiz trainer — on published `@heybray/*` packages only, with a different content type (`deck`), mastery dimension (`topic`), permission (`deck:manage`), and whitelabel UI. The goal was to measure:

1. How much chassis code is repeated copy-paste vs app-specific domain work  
2. Whether the **single-package** shape (`server/` + `src/`, one `package.json`) or the **workspace split** (`client/` + `server/` workspaces) is the better default  
3. How many platform changesets a second app forces, vs the ~1-week platform-side budget in `bray-scenarios/docs/platform-architecture.md` §7

---

## Evidence from `bray-flashcards`

### Shape that survived: **single-package** (basic-app shape)

| Shape | Verdict |
|---|---|
| Single `package.json`, `server/` + `src/` side by side | **Chosen** — matches `examples/basic-app`, simpler CI/Docker, one lockfile |
| Scenarios workspace split (`client/` + `server/` workspaces) | **Not chosen** — justified for Scenarios' scale; unnecessary for App #2 |

Ports: API `:3102`, Vite `:5175` (collision avoidance with Scenarios/basic-app).

### Boilerplate ratio

**28** app source files (`src/` + `server/`, excluding `server/test/`). Of these, **~11 are near-verbatim Scenarios/basic-app copies** (~39% of app source):

| File(s) | Friction | Notes |
|---|---|---|
| `server/app.ts` | FL-008 | CORS, rate limits, router mounting, static SPA fallback |
| `server/media-usage.ts` | FL-009 | App-specific hook body; pattern identical |
| `server/seed-classifications.ts` | FL-010 | Dimension/option *data* is app-specific; structure copied |
| `server/drizzle-packages-schema.ts` | FL-002 | Re-export published `@heybray/*/schema` |
| `server/db.ts`, `server/init-db.ts` | FL-002, FL-007 | Composition + migrate/seed; journal bootstrap manual |
| `server/controllers/team-star-map.controller.ts`, `server/routes/team-star-map.ts` | FL-014 | Deck adapters on Scenarios-compat URL paths |
| `src/components/AppLayout.tsx`, `src/admin-panels.ts` | FL-015 | Shell + admin panel registration |
| `src/pages/TeamStarMapPage.tsx` | FL-015 | Thin page wiring platform star-map components |

**Additional infra boilerplate** (not in app-source count): **21 files** copied/adapted from Scenarios:

- Test harness: `bin/test.sh`, `docker-compose.test.yml`, `vitest.config.ts`, `server/test/**` (18 files) — FL-018  
- Docker + CI: `Dockerfile`, `docker/entrypoint.sh`, `.github/workflows/ci.yml` — FL-020  
- Scaffold config: `tailwind.config.ts` (FL-001 node_modules globs), empty `drizzle/meta/_journal.json` (FL-007)

**Genuinely app-specific** (~17 files): deck schema/routes, study session flow, deck UI pages, `DeckCover`/`TopicChip`/`DeckListRow`, session results reveal, gamification config (`deck`/`topic`).

**Summary:** ~39% of application source is chassis boilerplate; **~50%+ of total repo file count** including test/Docker/CI is reproducible scaffold material a template should own.

### Platform changesets (round-trip)

| Changeset | Packages | Versions published |
|---|---|---|
| `phase5-gamification-gaps` | `@heybray/gamification` (minor), `@heybray/taxonomy` (patch) | 0.2.0, 0.1.2 |
| `phase5-gamification-react-gaps` | `@heybray/gamification-react` (minor), `@heybray/react` (patch) | 0.2.0, 0.1.2 |

**Total: 2 changesets, 4 package publishes** (PR [#4](https://github.com/heybray-labs/bray-platform/pull/4)).

Platform gaps addressed:

- FL-006: remove `content_type DEFAULT 'scenario'` from schema  
- FL-012: `GamificationService.setRewardTiers` / `ensureDefaultRewardTiers`  
- FL-014: content-neutral star-map paths + drawer props (legacy URLs retained)  
- FL-021: leaderboard `masteryScopeToken` + server scope back-compat  
- FL-001: `examples/basic-app` pin bump (housekeeping)

**Deferred:** FL-005 `reward_tiers.legacy_id` until Scenarios migration `0010`.

### Calendar time vs ~1-week budget

| Work | Duration |
|---|---|
| `bray-flashcards` implementation (Steps 0–6) | ~2 calendar days (agent-assisted) |
| Platform PR #4 + Version Packages merge | ~1 day |
| Manual npm publish (CI `NPM_TOKEN` broken — [#6](https://github.com/heybray-labs/bray-platform/pull/6)) | Same day |
| Pin bump + consume (Step 7) | Hours |

**Platform-side effort: well under the ~1-week budget.** The dominant cost was **boilerplate replication**, not platform API gaps.

### Acceptance checklist (flashcards)

| Criterion | Result |
|---|---|
| Published `@heybray/*` only (no `file:`/`link:`) | ✅ |
| No `@heybray/llm` in dependency tree | ✅ |
| `topic` + `deck:manage` via config only | ✅ |
| `grep -ri roleplay\|scenario src/ server/` clean | ⚠️ Platform-compat **API paths** and test assertions remain (`/scenario-history`, `/roleplays/.../attempts`, `drawerPink.scenarioRow`) — not user-facing copy; tracked FL-014 |
| Friction log complete | ✅ 21 entries, all categorized |
| Green suite | ✅ typecheck, build, 36 API tests, docker build |

---

## Options considered

### 1. Template repo (recommended)

Fork/evolve `examples/basic-app` into `heybray-labs/bray-app-template`: single-package layout, pre-wired chassis files, test harness, Docker/CI, whitelabel CSS variables, `drizzle-packages-schema.ts`, stub `media-usage.ts`, empty drizzle journal, tailwind `node_modules/@heybray/*/dist/**` globs.

**Pros:** Matches measured boilerplate; clone-and-rename is enough for App #3; no CLI maintenance; AGPL-friendly.  
**Cons:** Template drift unless updated when platform packages change (mitigate: pin ranges + CI on template).

### 2. `create-bray-app` generator

Interactive CLI (`npx create-bray-app`) prompting for content noun, dimension slug, permission, ports, palette.

**Pros:** Best DX at scale; eliminates copy-paste errors.  
**Cons:** High build cost; Phase 5 data shows only **one** validation app — premature before a third app confirms the prompt surface. Revisit after App #3 or if template drift becomes painful.

### 3. Feature-package structure (standalone)

Package app domain as `@heybray/flashcards-server` + `@heybray/flashcards-client` npm packages.

**Pros:** Natural for Phase 6 premium bundling.  
**Cons:** Wrong tool for **standalone** OSS apps; adds publish overhead per app; Phase 5 proved single-repo single-package ships faster. **Reserve for Phase 6 premium composition**, not standalone app shape.

---

## Consequences

### Immediate

1. Create **`heybray-labs/bray-app-template`** (or rename/promote `examples/basic-app` to a dedicated repo) with the FL boilerplate checklist baked in.  
2. Keep Scenarios on workspace split — no migration required.  
3. Fix CI npm publish ([#6](https://github.com/heybray-labs/bray-platform/pull/6)) + regenerate `NPM_TOKEN`.  
4. Owner ratifies this ADR → mark Phase 5 done in `bray-scenarios/docs/platform-architecture.md` §7.

### Template checklist (from friction log)

- [ ] `drizzle/meta/_journal.json` with `"entries": []`  
- [ ] `server/drizzle-packages-schema.ts` + comment  
- [ ] `server/app.ts` chassis skeleton (routers as TODO comments)  
- [ ] `server/media-usage.ts` stub with hook pattern  
- [ ] `server/seed-classifications.ts` skeleton  
- [ ] `src/components/AppLayout.tsx`, `src/admin-panels.ts` stubs  
- [ ] Test harness (`bin/test.sh`, `docker-compose.test.yml`, `server/test/helpers/`)  
- [ ] Dockerfile + `docker/entrypoint.sh` + `.github/workflows/ci.yml`  
- [ ] Tailwind content globs for `node_modules/@heybray/*/dist/**`  
- [ ] Whitelabel `:root` CSS variables + `AppConfigProvider` wiring  
- [ ] `AGENTS.md` with platform conventions

### Deferred (not blocking)

- FL-005: drop `legacy_id` from gamification schema when Scenarios ships `0010`  
- Star-map server routes: add `/content-history` + `/contents/:id/attempts` aliases (client helpers exist since 0.2.0)  
- `create-bray-app` CLI — revisit after template used for App #3  
- **Premium bundling shape** — explicitly remains open for Phase 6

---

## Ratification

- [x] **Owner approves** template-repo recommendation  
- [x] Update `bray-scenarios/docs/platform-architecture.md` §7: Phase 5 marked complete  
- [x] Open issue/milestone to extract `bray-app-template` from `examples/basic-app` — [#7](https://github.com/heybray-labs/bray-platform/issues/7)

**Approver:** Gareth Shercliff (owner)  
**Date ratified:** 2026-07-16
