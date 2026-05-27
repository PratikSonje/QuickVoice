#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

copy_if_missing() {
  local src="$1"
  local dest="$2"

  if [ -f "$dest" ]; then
    printf 'kept    %s\n' "${dest#$ROOT/}"
    return
  fi

  cp "$src" "$dest"
  printf 'created %s\n' "${dest#$ROOT/}"
}

copy_if_missing "$ROOT/.env.dev.example" "$ROOT/.env.dev"
copy_if_missing "$ROOT/apps/server/.env.dev.example" "$ROOT/apps/server/.env.dev"
copy_if_missing "$ROOT/apps/ai/.env.dev.example" "$ROOT/apps/ai/.env.dev"
copy_if_missing "$ROOT/apps/console/.env.dev.example" "$ROOT/apps/console/.env.local"
copy_if_missing "$ROOT/apps/web/.env.dev.example" "$ROOT/apps/web/.env.local"
