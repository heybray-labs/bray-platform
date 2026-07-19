#!/usr/bin/env bash
# Build + yalc publish platform packages. See docs/DEVELOPMENT.md (consumer repos).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TARGETS_FILE=".yalc-targets.local"

DEFAULT_LINK_PKGS=(
  server-kit
  identity
  taxonomy
  media
  gamification
  llm
  ui
  react
  gamification-react
)

YALC_REMINDER_PRINTED=0

die() {
  echo "error: $*" >&2
  exit 1
}

usage() {
  cat <<EOF
Usage:
  bin/yalc-sync.sh                 # build + publish + push ALL platform packages
  bin/yalc-sync.sh <pkg> [<pkg>…]  # rebuild named package(s) and workspace dependents
  bin/yalc-sync.sh --link <path>   # yalc add default package set into consumer, npm install
  bin/yalc-sync.sh --unlink <path> # yalc remove --all && npm install in consumer
  bin/yalc-sync.sh --status <path> # list yalc-linked @heybray/* packages in consumer

Path may be a directory or a shortcut name from ${TARGETS_FILE} (e.g. premium).
Copy .yalc-targets.local.example to ${TARGETS_FILE} and edit paths for shortcuts.
EOF
}

print_yalc_reminder() {
  if [ "$YALC_REMINDER_PRINTED" -eq 1 ]; then
    return 0
  fi
  YALC_REMINDER_PRINTED=1
  if grep -rn --include='package.json' --include='package-lock.json' \
       -e '\.yalc' "$ROOT" --exclude-dir=node_modules --exclude-dir=.yalc -l >/dev/null 2>&1; then
    echo "note: yalc references detected under $ROOT"
  fi
  echo "remember to --unlink every target before committing — guards will reject a push with yalc residue."
}

resolve_target_path() {
  local arg="$1"
  if [ -d "$arg" ]; then
    (cd "$arg" && pwd)
    return 0
  fi
  if [ -f "$TARGETS_FILE" ]; then
    local line name path
    while IFS= read -r line || [ -n "$line" ]; do
      line="${line%%#*}"
      line="${line#"${line%%[![:space:]]*}"}"
      [ -z "$line" ] && continue
      name="${line%%=*}"
      path="${line#*=}"
      path="${path#"${path%%[![:space:]]*}"}"
      if [ "$name" = "$arg" ]; then
        [ -d "$path" ] || die "target path missing for ${name}: ${path}"
        (cd "$path" && pwd)
        return 0
      fi
    done < "$TARGETS_FILE"
  fi
  die "unknown target '${arg}' — pass a directory or add name=path to ${TARGETS_FILE}"
}

turbo_build_packages() {
  npx turbo run build "$@" --dry-run=json 2>/dev/null | node -e '
    let input = "";
    process.stdin.on("data", (chunk) => { input += chunk; });
    process.stdin.on("end", () => {
      const data = JSON.parse(input);
      const pkgs = [
        ...new Set(
          (data.tasks || [])
            .filter((task) => task.task === "build" && task.package && task.package.startsWith("@heybray/"))
            .map((task) => task.package),
        ),
      ].sort();
      for (const pkg of pkgs) {
        console.log(pkg);
      }
    });
  '
}

publishable_dir_for_package() {
  local full="$1"
  local short="${full#@heybray/}"
  echo "packages/${short}"
}

publish_package() {
  local full="$1"
  local dir
  dir="$(publishable_dir_for_package "$full")"
  [ -d "$dir" ] || return 0
  if ! grep -q '"build"' "$dir/package.json" 2>/dev/null; then
    return 0
  fi
  if [ ! -d "$dir/dist" ]; then
    die "expected ${dir}/dist after build — cannot yalc publish ${full}"
  fi
  print_yalc_reminder
  echo "→ yalc publish --push ${full} (${dir})"
  (cd "$dir" && yalc publish --push)
}

sync_all() {
  npx turbo run build
  local dir full
  for dir in packages/*/; do
    [ -f "${dir}package.json" ] || continue
    grep -q '"build"' "${dir}package.json" || continue
    full="$(node -p "require('./${dir}package.json').name")"
    publish_package "$full"
  done
}

sync_named() {
  local filters=()
  local pkg
  for pkg in "$@"; do
    filters+=(--filter="...@heybray/${pkg}")
  done

  local packages=()
  while IFS= read -r pkg; do
    [ -n "$pkg" ] && packages+=("$pkg")
  done < <(turbo_build_packages "${filters[@]}")

  if [ "${#packages[@]}" -eq 0 ]; then
    die "no @heybray/* packages matched: $*"
  fi

  echo "Turbo pipeline (${#packages[@]}): ${packages[*]}"
  npx turbo run build "${filters[@]}"

  for pkg in "${packages[@]}"; do
    publish_package "$pkg"
  done
}

cmd_link() {
  local target
  target="$(resolve_target_path "$1")"
  local specs=()
  local pkg
  for pkg in "${DEFAULT_LINK_PKGS[@]}"; do
    specs+=("@heybray/${pkg}")
  done
  echo "Linking ${#specs[@]} packages into ${target}"
  (
    cd "$target"
    yalc add "${specs[@]}"
    npm install
  )
}

cmd_unlink() {
  local target
  target="$(resolve_target_path "$1")"
  (
    cd "$target"
    yalc remove --all
    npm install
  )
}

cmd_status() {
  local target
  target="$(resolve_target_path "$1")"
  echo "Consumer: ${target}"
  if grep -qE '\.yalc|file:\.yalc' "$target/package.json" 2>/dev/null; then
    echo "package.json yalc entries:"
    grep -E '@heybray/|\.yalc|file:\.yalc' "$target/package.json" || true
  else
    echo "package.json: no yalc-linked @heybray/* entries"
  fi
  if [ -d "$target/.yalc" ]; then
    echo ".yalc/:"
    ls -1 "$target/.yalc" 2>/dev/null || true
  else
    echo ".yalc/: (absent)"
  fi
}

main() {
  case "${1:-}" in
    -h|--help)
      usage
      ;;
    --link)
      [ $# -ge 2 ] || die "--link requires a path or shortcut name"
      cmd_link "$2"
      ;;
    --unlink)
      [ $# -ge 2 ] || die "--unlink requires a path or shortcut name"
      cmd_unlink "$2"
      ;;
    --status)
      [ $# -ge 2 ] || die "--status requires a path or shortcut name"
      cmd_status "$2"
      ;;
    "")
      sync_all
      ;;
    *)
      sync_named "$@"
      ;;
  esac
}

main "$@"
