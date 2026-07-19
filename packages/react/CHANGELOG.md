# @heybray/react

## 1.2.4

### Patch Changes

- 0a98883: Update SPDX copyright year range to 2025-2026.
- Updated dependencies [0a98883]
  - @heybray/identity@1.0.1
  - @heybray/taxonomy@1.0.1
  - @heybray/ui@1.2.2

## 1.2.3

### Patch Changes

- bb6ebe2: Fix cover images failing to load when many authenticated media fetches run at once (shared blob cache, auth-aware loading, cache cleared on logout).

## 1.2.2

### Patch Changes

- a6169a8: Premium closeout: scope global leaderboard and points history by content type; disable browser fetch cache on shared apiRequest/queryFn to prevent 304 empty-body cache clobber after mutations.
- Updated dependencies [a6169a8]
  - @heybray/ui@1.2.1

## 1.2.1

### Patch Changes

- fe6463e: Disable default reconnect refetch on the shared query client (`refetchOnReconnect: false`) and stabilize `AuthProvider` context value with `useMemo`.
- Use `cache: "no-store"` on shared `fetch` in `apiRequest` and the default queryFn so mutation refetches cannot receive empty 304 bodies that clobber optimistic cache patches.
- Updated dependencies [537e74c]
  - @heybray/ui@1.1.0

## 1.2.0

### Minor Changes

- c786b89: Request hygiene: default `staleTime` of 30s, and a single-flight 401 latch so session expiry redirects to login once (reset on successful login). Documented in the package README. `retry` / `refetchOnWindowFocus` remain false as previously shipped.

## 1.1.0

### Minor Changes

- 79c67c6: Add `GamificationNavActions` for shared navbar points summary and star map link. Extend `AppConfig.routes.teamStarMapPath` for host routing.

## 1.0.0

### Major Changes

- 9784e46: **1.0.0 — API stability policy lock**

  From 1.0.0 onward: a breaking DB schema change is a **major** release with expand/contract documentation; a breaking runtime API change is a **major** release with migration notes in the changelog.

  Deprecated aliases supported until **2.0.0**: legacy star-map path helpers (`legacyMemberScenarioHistoryPath`, `legacyMemberRoleplayAttemptsPath`), `drawerPink.scenarioRow` / `scenarioRowHover`, `ScenarioListRowComponent` / `ScenarioListRowProps`, `detachedFromScenarios` (use `detachedCount`), and related response-key fallbacks.

  `@heybray/llm` remains the least-validated package (single consumer: Scenarios).

### Patch Changes

- 3a656e8: Add neutral `detachedCount` to media delete response; keep `detachedFromScenarios` as a deprecated alias until 2.0.0. `@heybray/react` `MediaManagementPanel` reads `detachedCount` first.
- Updated dependencies [9784e46]
  - @heybray/identity@1.0.0
  - @heybray/taxonomy@1.0.0
  - @heybray/ui@1.0.0

## 0.1.2

### Patch Changes

- 1ba24ab: Generalize gamification-react for multi-app content: configurable leaderboard mastery scope token, content-neutral star map path helpers and drawer props, and `gamificationContentType` on AppConfig for panel deep links.
- Updated dependencies [1ba24ab]
  - @heybray/taxonomy@0.1.2

## 0.1.1

### Patch Changes

- 96e4867: Republish all platform packages from CI to verify npm publish access after
  the initial 0.1.0 release. Includes the getAppVersion() path fix in
  server-kit.
- Updated dependencies [96e4867]
  - @heybray/identity@0.1.1
  - @heybray/taxonomy@0.1.1
  - @heybray/ui@0.1.1

## 0.1.0

### Minor Changes

- 888b88c: Initial public release of the heybray platform packages, extracted from
  bray-scenarios. Bumps all 10 packages from 0.0.1 to 0.1.0 and publishes them
  to npm under the @heybray scope for the first time.

### Patch Changes

- Updated dependencies [888b88c]
  - @heybray/identity@0.1.0
  - @heybray/taxonomy@0.1.0
  - @heybray/ui@0.1.0
