#!/usr/bin/env bash
# scripts/secret-scan.sh
# Lightweight secret scan — run before every commit or in CI.
# Usage: bash scripts/secret-scan.sh [optional: path to scan, default: '.']
# Exit 0 = clean. Exit 1 = secrets detected — DO NOT COMMIT.
#
# No external dependencies. Uses only grep (POSIX).

set -euo pipefail

SCAN_PATH="${1:-.}"
FAILED=0

echo "[secret-scan] Scanning: $SCAN_PATH"

# ── Patterns to block ─────────────────────────────────────────────────────────
declare -a PATTERNS=(
  "-----BEGIN PRIVATE KEY-----"
  "-----BEGIN RSA PRIVATE KEY-----"
  "-----BEGIN EC PRIVATE KEY-----"
  "-----BEGIN OPENSSH PRIVATE KEY-----"
  "ADMIN_JWKS_PAYLOAD\s*=\s*\{\"keys\""
  "ADMIN_JWT_SECRET\s*=\s*[A-Za-z0-9+/=]{20}"
)

# ── Extensions / paths to scan ────────────────────────────────────────────────
declare -a INCLUDE_EXTS=("*.ts" "*.js" "*.json" "*.env" "*.txt" "*.md" "*.pem" "*.key" "*.sh")

# ── Always-ignore paths ───────────────────────────────────────────────────────
EXCLUDE_PATHS="node_modules|\.git|dist|build|_secrets"

for PATTERN in "${PATTERNS[@]}"; do
  MATCHES=$(grep -r -l \
    --include="*.ts" --include="*.js" --include="*.json" \
    --include="*.env" --include="*.txt" --include="*.pem" \
    --include="*.key" --include="*.sh" \
    -E "$PATTERN" "$SCAN_PATH" 2>/dev/null \
    | grep -vE "$EXCLUDE_PATHS" || true)

  if [[ -n "$MATCHES" ]]; then
    echo "[secret-scan] ❌ BLOCKED PATTERN FOUND: $PATTERN"
    echo "$MATCHES" | while read -r f; do echo "  → $f"; done
    FAILED=1
  fi
done

# ── Block *.pem and *.key files from being staged ────────────────────────────
PEM_FILES=$(find "$SCAN_PATH" -name "*.pem" -o -name "*.key" 2>/dev/null \
  | grep -vE "$EXCLUDE_PATHS" || true)

if [[ -n "$PEM_FILES" ]]; then
  echo "[secret-scan] ❌ KEY FILES FOUND IN PATH (must be in .gitignore):"
  echo "$PEM_FILES" | while read -r f; do echo "  → $f"; done
  FAILED=1
fi

if [[ "$FAILED" -eq 0 ]]; then
  echo "[secret-scan] ✅ Clean — no secret patterns detected."
  exit 0
else
  echo "[secret-scan] ❌ ABORT: Secret material detected. Do not commit."
  exit 1
fi
