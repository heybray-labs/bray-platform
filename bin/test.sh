#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

./bin/guards.sh
npx turbo run typecheck build
npm run test --workspace=@heybray/gamification-react
npm run test --workspace=@heybray/react
npm run test --workspace=@heybray/server-kit
