#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

./bin/check-no-yalc.sh
npx turbo run typecheck build
npm run test --workspace=@heybray/gamification-react
