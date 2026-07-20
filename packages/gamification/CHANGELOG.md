# @heybray/gamification

## 1.2.0

### Minor Changes

- 89d2b2f: Gamification 1.2: optional `contentType` override on star-map drill-in service path and query parser export.

### Patch Changes

- Updated dependencies [89d2b2f]
- Updated dependencies [89d2b2f]
  - @heybray/identity@1.1.0
  - @heybray/server-kit@1.2.0

## 1.1.3

### Patch Changes

- 0a98883: Update SPDX copyright year range to 2025-2026.
- Updated dependencies [0a98883]
  - @heybray/identity@1.0.1
  - @heybray/server-kit@1.1.1
  - @heybray/taxonomy@1.0.1

## 1.1.2

### Patch Changes

- a6169a8: Premium closeout: scope global leaderboard and points history by content type; disable browser fetch cache on shared apiRequest/queryFn to prevent 304 empty-body cache clobber after mutations.

## 1.1.1

### Patch Changes

- Global leaderboard accepts optional `contentType` query param; points history returns `contentType` per row; `LeaderboardPanel` and `PointsHistoryDialog` support multi-app deep links.

## 1.1.0

### Minor Changes

- a259c46: Multi-dimension mastery: contentTypes entries may set masteryDimensionSlug; top-level masteryDimensionSlug remains a deprecated fallback for single-type apps. Leaderboard scope selects the actual dimension; star-map and getMasteryRankings are per content type. Full back-compat for existing single-type configs.

## 1.0.0

### Major Changes

- 9784e46: **1.0.0 — API stability policy lock**

  From 1.0.0 onward: a breaking DB schema change is a **major** release with expand/contract documentation; a breaking runtime API change is a **major** release with migration notes in the changelog.

  Deprecated aliases supported until **2.0.0**: legacy star-map path helpers (`legacyMemberScenarioHistoryPath`, `legacyMemberRoleplayAttemptsPath`), `drawerPink.scenarioRow` / `scenarioRowHover`, `ScenarioListRowComponent` / `ScenarioListRowProps`, `detachedFromScenarios` (use `detachedCount`), and related response-key fallbacks.

  `@heybray/llm` remains the least-validated package (single consumer: Scenarios).

### Patch Changes

- Updated dependencies [9784e46]
  - @heybray/identity@1.0.0
  - @heybray/server-kit@1.0.0
  - @heybray/taxonomy@1.0.0

## 0.3.1

### Patch Changes

- Ship star-map-paths subpath exports (missing from 0.3.0 build entries).

## 0.3.0

### Minor Changes

- 6e2c57d: Drop `legacy_id` from the `reward_tiers` schema definition and export neutral star-map API path constants (`content-history`, `contents/:contentId/attempts`). Apps with an existing database must drop the column via their own migration before upgrading.

## 0.2.0

### Minor Changes

- 1ba24ab: Add `GamificationService.setRewardTiers` and `ensureDefaultRewardTiers`, accept mastery dimension slug on leaderboard scope queries (back-compat with `category`), and remove misleading `content_type` schema defaults.

### Patch Changes

- Updated dependencies [1ba24ab]
  - @heybray/taxonomy@0.1.2

## 0.1.1

### Patch Changes

- 96e4867: Republish all platform packages from CI to verify npm publish access after
  the initial 0.1.0 release. Includes the getAppVersion() path fix in
  server-kit.
- Updated dependencies [96e4867]
  - @heybray/identity@0.1.1
  - @heybray/server-kit@0.1.2
  - @heybray/taxonomy@0.1.1

## 0.1.0

### Minor Changes

- 888b88c: Initial public release of the heybray platform packages, extracted from
  bray-scenarios. Bumps all 10 packages from 0.0.1 to 0.1.0 and publishes them
  to npm under the @heybray scope for the first time.

### Patch Changes

- Updated dependencies [888b88c]
  - @heybray/identity@0.1.0
  - @heybray/server-kit@0.1.0
  - @heybray/taxonomy@0.1.0
