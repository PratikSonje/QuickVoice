#!/usr/bin/env bash
set -euo pipefail

failures=0

fail() {
  printf '[fail] %s\n' "$1" >&2
  failures=$((failures + 1))
}

ok() {
  printf '[ok] %s\n' "$1"
}

warn() {
  printf '[warn] %s\n' "$1"
}

if command -v task >/dev/null 2>&1; then
  ok "go-task is installed: $(task --version | head -n 1)"
else
  fail "go-task is not installed. Install it with: go install github.com/go-task/task/v3/cmd/task@latest"
fi

if command -v go >/dev/null 2>&1; then
  ok "Go is installed: $(go version)"
else
  warn "Go is not installed. It is only needed if you install go-task via go install."
fi

if command -v node >/dev/null 2>&1; then
  if node -e 'const major=Number(process.versions.node.split(".")[0]); process.exit(major >= 18 ? 0 : 1)' >/dev/null 2>&1; then
    ok "Node.js is installed: $(node -v)"
  else
    fail "Node.js >= 18 is required. Found: $(node -v)"
  fi
else
  fail "Node.js >= 18 is required."
fi

if command -v corepack >/dev/null 2>&1; then
  ok "corepack is installed"
else
  fail "corepack is required to activate pnpm@9.0.0."
fi

if command -v python3 >/dev/null 2>&1; then
  ok "Python is installed: $(python3 --version)"
else
  fail "python3 is required for apps/ai."
fi

if command -v docker >/dev/null 2>&1; then
  ok "Docker CLI is installed"
  if docker compose version >/dev/null 2>&1; then
    ok "Docker Compose v2 is installed: $(docker compose version --short)"
  else
    fail "Docker Compose v2 plugin is required."
  fi

  if docker info >/dev/null 2>&1; then
    ok "Docker daemon is reachable"
  else
    fail "Docker daemon is not reachable. Start Docker or add your user to the docker group."
  fi
else
  fail "Docker is required for local Postgres."
fi

if [ "$failures" -gt 0 ]; then
  cat >&2 <<'EOF'

Install hints for Ubuntu:
  sudo apt-get update
  sudo apt-get install -y docker.io docker-compose-v2 golang-go
  sudo usermod -aG docker "$USER"
  go install github.com/go-task/task/v3/cmd/task@latest
  export PATH="$PATH:$HOME/go/bin"

After changing docker group membership, reconnect your SSH session.
EOF
  exit 1
fi
