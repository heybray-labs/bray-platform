#!/usr/bin/env bash
# Fail if yalc local links leaked into committed package manifests.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

shopt -s globstar nullglob
FILES=(package.json package-lock.json "**/package.json")

FOUND=0
for file in "${FILES[@]}"; do
  [[ -f "$file" ]] || continue
  if grep -qE '\.yalc/|file:\.yalc|"\.yalc' "$file"; then
    echo "ERROR: yalc reference in $file"
    FOUND=1
  fi
done

if [[ "$FOUND" -ne 0 ]]; then
  echo ""
  echo "Remove yalc links before commit: yalc remove <package> && npm install"
  exit 1
fi

echo "OK: no yalc references in package.json / package-lock.json"
