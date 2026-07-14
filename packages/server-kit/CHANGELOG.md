# @heybray/server-kit

## 0.1.1

### Patch Changes

- 7ec61ca: `getAppVersion()` now takes an explicit path to the consuming app's
  `package.json` instead of guessing one by walking a fixed number of
  directory levels from its own module location. That heuristic only worked
  while this package was consumed as raw source at a known depth inside the
  bray-scenarios monorepo; once installed from npm, `server-kit`'s own
  location on disk bears no fixed relationship to the app's root, and the old
  code read (or failed to read) the wrong file. This was a breaking change to
  `getAppVersion`'s signature, but the function had no other real callers yet.

## 0.1.0

### Minor Changes

- 888b88c: Initial public release of the heybray platform packages, extracted from
  bray-scenarios. Bumps all 10 packages from 0.0.1 to 0.1.0 and publishes them
  to npm under the @heybray scope for the first time.
