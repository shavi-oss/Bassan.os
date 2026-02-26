#!/usr/bin/env bash
# .git/hooks/pre-commit  (copy this file to .git/hooks/pre-commit and chmod +x)
# OR use the documented approach below to install via npm prepare script.
#
# PURPOSE: Block commits that contain private key material or .pem files.
# INSTALL: cp scripts/pre-commit-hook.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
# TEAM: Each developer must install this locally. It is NOT auto-installed.
#       Document in CONTRIBUTING.md.

set -euo pipefail

# Run the secret scanner against staged files only (fast)
STAGED=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || true)

if [[ -z "$STAGED" ]]; then
  exit 0
fi

FAILED=0

echo "[pre-commit] Scanning staged files for secrets..."

while IFS= read -r file; do
  # Block PEM files staged directly
  if [[ "$file" == *.pem || "$file" == *.key || "$file" == *.p12 || "$file" == *.pfx ]]; then
    echo "[pre-commit] ❌ KEY FILE STAGED: $file — add to .gitignore and unstage."
    FAILED=1
    continue
  fi

  # Block private key header content in any staged file
  if git show ":$file" 2>/dev/null | grep -qE "-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----"; then
    echo "[pre-commit] ❌ PRIVATE KEY CONTENT IN STAGED FILE: $file"
    FAILED=1
  fi
done <<< "$STAGED"

if [[ "$FAILED" -eq 0 ]]; then
  echo "[pre-commit] ✅ Secret scan passed."
  exit 0
else
  echo "[pre-commit] ❌ COMMIT BLOCKED: secret material detected. See above."
  exit 1
fi
