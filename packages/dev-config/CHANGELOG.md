# @heybray/dev-config

## 1.0.1

### Patch Changes

- 0a98883: Update SPDX copyright year range to 2025-2026.

## 1.0.0

### Major Changes

- 9784e46: **1.0.0 — API stability policy lock**

  From 1.0.0 onward: a breaking DB schema change is a **major** release with expand/contract documentation; a breaking runtime API change is a **major** release with migration notes in the changelog.

  Deprecated aliases supported until **2.0.0**: legacy star-map path helpers (`legacyMemberScenarioHistoryPath`, `legacyMemberRoleplayAttemptsPath`), `drawerPink.scenarioRow` / `scenarioRowHover`, `ScenarioListRowComponent` / `ScenarioListRowProps`, `detachedFromScenarios` (use `detachedCount`), and related response-key fallbacks.

  `@heybray/llm` remains the least-validated package (single consumer: Scenarios).

## 0.1.1

### Patch Changes

- 96e4867: Republish all platform packages from CI to verify npm publish access after
  the initial 0.1.0 release. Includes the getAppVersion() path fix in
  server-kit.

## 0.1.0

### Minor Changes

- 888b88c: Initial public release of the heybray platform packages, extracted from
  bray-scenarios. Bumps all 10 packages from 0.0.1 to 0.1.0 and publishes them
  to npm under the @heybray scope for the first time.
