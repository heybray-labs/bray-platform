# @heybray/taxonomy

## 0.1.2

### Patch Changes

- 1ba24ab: Add `GamificationService.setRewardTiers` and `ensureDefaultRewardTiers`, accept mastery dimension slug on leaderboard scope queries (back-compat with `category`), and remove misleading `content_type` schema defaults.

## 0.1.1

### Patch Changes

- 96e4867: Republish all platform packages from CI to verify npm publish access after
  the initial 0.1.0 release. Includes the getAppVersion() path fix in
  server-kit.
- Updated dependencies [96e4867]
  - @heybray/identity@0.1.1
  - @heybray/server-kit@0.1.2

## 0.1.0

### Minor Changes

- 888b88c: Initial public release of the heybray platform packages, extracted from
  bray-scenarios. Bumps all 10 packages from 0.0.1 to 0.1.0 and publishes them
  to npm under the @heybray scope for the first time.

### Patch Changes

- Updated dependencies [888b88c]
  - @heybray/identity@0.1.0
  - @heybray/server-kit@0.1.0
