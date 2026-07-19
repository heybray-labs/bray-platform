# @heybray/gamification-react

## 1.2.3

### Patch Changes

- 0a98883: Update SPDX copyright year range to 2025-2026.
- Updated dependencies [0a98883]
  - @heybray/gamification@1.1.3
  - @heybray/react@1.2.4
  - @heybray/ui@1.2.2

## 1.2.2

### Patch Changes

- a6169a8: Premium closeout: scope global leaderboard and points history by content type; disable browser fetch cache on shared apiRequest/queryFn to prevent 304 empty-body cache clobber after mutations.
- Updated dependencies [a6169a8]
  - @heybray/gamification@1.1.2
  - @heybray/react@1.2.2
  - @heybray/ui@1.2.1

## 1.2.1

### Patch Changes

- Global leaderboard accepts optional `contentType` query param; points history returns `contentType` per row; `LeaderboardPanel` and `PointsHistoryDialog` support multi-app deep links.
- Updated dependencies
- Updated dependencies [3ed7ea4]
  - @heybray/gamification@1.1.1
  - @heybray/ui@1.2.0

## 1.2.0

### Minor Changes

- 79c67c6: Add `GamificationNavActions` for shared navbar points summary and star map link. Extend `AppConfig.routes.teamStarMapPath` for host routing.

### Patch Changes

- Updated dependencies [79c67c6]
  - @heybray/react@1.1.0

## 1.1.0

### Minor Changes

- a259c46: Multi-dimension mastery: contentTypes entries may set masteryDimensionSlug; top-level masteryDimensionSlug remains a deprecated fallback for single-type apps. Leaderboard scope selects the actual dimension; star-map and getMasteryRankings are per content type. Full back-compat for existing single-type configs.

### Patch Changes

- Updated dependencies [a259c46]
  - @heybray/gamification@1.1.0

## 1.0.0

### Major Changes

- 9784e46: **1.0.0 — API stability policy lock**

  From 1.0.0 onward: a breaking DB schema change is a **major** release with expand/contract documentation; a breaking runtime API change is a **major** release with migration notes in the changelog.

  Deprecated aliases supported until **2.0.0**: legacy star-map path helpers (`legacyMemberScenarioHistoryPath`, `legacyMemberRoleplayAttemptsPath`), `drawerPink.scenarioRow` / `scenarioRowHover`, `ScenarioListRowComponent` / `ScenarioListRowProps`, `detachedFromScenarios` (use `detachedCount`), and related response-key fallbacks.

  `@heybray/llm` remains the least-validated package (single consumer: Scenarios).

### Patch Changes

- Updated dependencies [3a656e8]
- Updated dependencies [9784e46]
  - @heybray/react@1.0.0
  - @heybray/gamification@1.0.0
  - @heybray/ui@1.0.0

## 0.3.1

### Patch Changes

- Ship star-map-paths subpath exports (missing from 0.3.0 build entries).
- Updated dependencies
  - @heybray/gamification@0.3.1

## 0.3.0

### Minor Changes

- 6e2c57d: Flip star-map defaults to neutral API paths, add `memberAttemptsPath` on row props, rename `drawerPink` row style keys to neutral names with deprecated aliases, and remove hardcoded content-type defaults from points panels.

### Patch Changes

- Updated dependencies [6e2c57d]
  - @heybray/gamification@0.3.0

## 0.2.0

### Minor Changes

- 1ba24ab: Generalize gamification-react for multi-app content: configurable leaderboard mastery scope token, content-neutral star map path helpers and drawer props, and `gamificationContentType` on AppConfig for panel deep links.

### Patch Changes

- Updated dependencies [1ba24ab]
- Updated dependencies [1ba24ab]
  - @heybray/gamification@0.2.0
  - @heybray/react@0.1.2

## 0.1.1

### Patch Changes

- 96e4867: Republish all platform packages from CI to verify npm publish access after
  the initial 0.1.0 release. Includes the getAppVersion() path fix in
  server-kit.
- Updated dependencies [96e4867]
  - @heybray/gamification@0.1.1
  - @heybray/react@0.1.1
  - @heybray/ui@0.1.1

## 0.1.0

### Minor Changes

- 888b88c: Initial public release of the heybray platform packages, extracted from
  bray-scenarios. Bumps all 10 packages from 0.0.1 to 0.1.0 and publishes them
  to npm under the @heybray scope for the first time.

### Patch Changes

- Updated dependencies [888b88c]
  - @heybray/gamification@0.1.0
  - @heybray/react@0.1.0
  - @heybray/ui@0.1.0
