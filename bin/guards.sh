#!/usr/bin/env bash
set -euo pipefail

fail() { echo "GUARD FAILED: $1" >&2; exit 1; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# 1. yalc must never reach committed manifests (package.json AND lockfile)
if grep -rn --include='package.json' --include='package-lock.json' \
     -e '\.yalc' . --exclude-dir=node_modules --exclude-dir=.yalc -l >/dev/null 2>&1; then
  fail "yalc reference in a committed manifest — run: yalc remove --all && npm install"
fi

# 2. no deep imports bypassing package exports
if grep -rn --include='*.ts' --include='*.tsx' \
     -E "from ['\"][^'\"]*node_modules/@heybray|import\\(['\"][^'\"]*node_modules/@heybray" \
     --exclude-dir=node_modules . >/dev/null 2>&1; then
  fail "deep import into node_modules/@heybray — use the package's public exports"
fi

# 3. no tsconfig paths into sibling repos (tsx resolves them instead of node_modules/yalc)
./bin/check-no-sibling-tsconfig-paths.sh || \
  fail "tsconfig paths reference sibling repo — resolve @heybray/* via node_modules only"

# 4. Scenarios vocabulary gate (see CONTRIBUTING.md)
./bin/check-scenarios-vocabulary.sh

# 5. package-boundary gate — packages must not import app-shell paths
if grep -rn --include='*.ts' --include='*.tsx' \
     -e '@shared' \
     packages/*/src >/dev/null 2>&1; then
  fail "packages/*/src imports @shared — packages must not depend on app shell paths"
fi

for pattern in \
  'from "client/' "from 'client/" \
  'from "server/' "from 'server/" \
  'from "src/' "from 'src/"; do
  if grep -rn --include='*.ts' --include='*.tsx' \
       -e "$pattern" \
       packages/*/src >/dev/null 2>&1; then
    fail "packages/*/src imports app shell path ($pattern)"
  fi
done

echo "guards: OK"
