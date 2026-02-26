# PR_CORE_SECURE_KEYS_PLAN.md — BassanOs Complete Remediation Plan (v2)

## Document Control

| Field    | Value                                               |
| -------- | --------------------------------------------------- |
| Plan ID  | PR-CORE-SECURE-KEYS                                 |
| Date     | 2026-02-23T16:45 UTC+2                              |
| Author   | Sonit (AI Execution Agent)                          |
| Status   | EXECUTING — HISTORY REWRITE AWAITING HUMAN APPROVAL |
| Branch   | `fix/secure-keys` @ BassanOs                        |
| Severity | 🔴 CRITICAL — Private RSA key in git history        |

---

## 1. Incident Summary

Commit `e80d195` (and `dce69e4`) introduced:

- `backend/tools/jwks/admin-private.pem` — live RSA-2048 private key
- `backend/tools/jwks/admin-public.pem`, `jwks.json`, `signed-token.txt`, scripts, logs

The key exists in git history even after file removal. **Any clone** of the repository can
extract the private key using `git show e80d195:backend/tools/jwks/admin-private.pem`.

---

## 2. Scope Lock

### Allowed in this gate

| Path                                          | Action                            |
| --------------------------------------------- | --------------------------------- |
| `backend/tools/jwks/**`                       | `git rm` from working tree (done) |
| `backend/tools/jwks-server/jwks.json`         | `git rm` (done)                   |
| `backend/tools/jwks-server/index.js`          | Rewrite to use env var (done)     |
| `backend/tools/jwks-server/.env.example`      | Create (done)                     |
| `.gitignore`                                  | Add key patterns (done)           |
| `scripts/secret-scan.sh`                      | Create prevention script          |
| `scripts/pre-commit-hook.sh`                  | Create hook template              |
| `backend/governance/PR-101-admin-onboarding/` | Governance docs                   |
| Git history rewrite                           | Awaiting human approval           |

### Forbidden

```
src/modules/auth/**          — IMMUTABLE
src/modules/organizations/** — IMMUTABLE
prisma/schema.prisma         — IMMUTABLE
backend/tools/jwks-server/Dockerfile   — untouched
backend/tools/jwks-server/package.json — no new deps
```

---

## 3. Stop Conditions (ABSOLUTE)

1. **ABORT** if `git grep "BEGIN PRIVATE KEY"` returns results in tracked files (not doc text).
2. **ABORT** if immutable zone appears in `git diff`.
3. **ABORT** if Railway endpoint returns `d`, `p`, `q` fields (private key exposure in JWKS).
4. **ABORT** if force-push executed without explicit human approval.
5. **ABORT** if any private key content is committed or logged.

---

## 4. Completed Steps

| Step                                                      | Status                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| T1: Branch `fix/secure-keys` created                      | ✅ Done                                                      |
| T2: `git rm -r backend/tools/jwks/` (23 files)            | ✅ Done                                                      |
| T3: `git rm backend/tools/jwks-server/jwks.json`          | ✅ Done                                                      |
| T4: `git rm backend/gen-token.js`                         | ✅ Done                                                      |
| T5: `.gitignore` hardened                                 | ✅ Done                                                      |
| T6: `index.js` → reads `ADMIN_JWKS_PAYLOAD` env var       | ✅ Done                                                      |
| T7: `backend/tools/jwks-server/.env.example` created      | ✅ Done                                                      |
| T8: New RSA-2048 keypair generated in `D:\_secrets\jwks\` | ✅ Done (KID: admin-key-2)                                   |
| T9: `ADMIN_JWKS_PAYLOAD` set on Railway jwks-server       | ✅ Done (verified in Railway)                                |
| T10: Railway redeploy triggered                           | ✅ Done (endpoint still uses old binary until branch merges) |
| T11: `scripts/secret-scan.sh` created                     | ✅ Done                                                      |
| T12: `scripts/pre-commit-hook.sh` created                 | ✅ Done                                                      |

---

## 5. PHASE 4 — Git History Purge

> [!CAUTION]
> **HUMAN REQUIRED.** The following commands must NOT be run until explicit human approval
> via the governance checkpoint below. This operation is **irreversible and destructive**.

### 5.1 Compromised Commits

| Commit    | Message                                    | Contains                                    |
| --------- | ------------------------------------------ | ------------------------------------------- |
| `dce69e4` | `jwks: add jwks-server for PR-101`         | `jwks.json`, `jwks-server.js` (early stage) |
| `e80d195` | `fix(scope): remove misplaced React UI...` | `admin-private.pem` ← **CRITICAL**          |

### 5.2 Prerequisites Before Running

1. Ensure all team members are warned — force-push rewrites shared history.
2. All open PRs based on old history must be rebased after the purge.
3. Take a full backup: `git bundle create ../bassanos-backup-$(date +%Y%m%d).bundle --all`

### 5.3 History Purge Commands (git filter-repo — PREFERRED)

**Step A: Verify git-filter-repo is installed**

```bash
pip install git-filter-repo
# OR on Windows: pip install git-filter-repo
git filter-repo --version
```

**Step B: Backup**

```bash
cd "D:\Basaan os"
git bundle create BassanOs-backup-pre-purge.bundle --all
```

Verify bundle: `git bundle verify BassanOs-backup-pre-purge.bundle`

**Step C: Run filter-repo to remove all key material from ALL history**

```bash
cd "D:\Basaan os\BassanOs"
git filter-repo --force \
  --path backend/tools/jwks/ --invert-paths \
  --path backend/tools/jwks-server/jwks.json --invert-paths \
  --path backend/gen-token.js --invert-paths \
  --path-glob "*.pem" --invert-paths \
  --path-glob "*.key" --invert-paths \
  --path-glob "*signed-token.txt" --invert-paths
```

**Step D: Verify purge**

```bash
git log --all --oneline -- "backend/tools/jwks/admin-private.pem"
# Must return EMPTY
git grep "BEGIN PRIVATE KEY"
# Must return EMPTY (or only markdown doc strings)
```

**Step E: Force-push (REQUIRES HUMAN AUTHORIZATION)**

```bash
git push --force-with-lease origin fix/secure-keys
git push --force-with-lease origin main   # after merge
```

### 5.4 Fallback: BFG Repo-Cleaner

If `git filter-repo` is unavailable:

```bash
# Download: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files "admin-private.pem" .
java -jar bfg.jar --delete-files "*.pem" .
java -jar bfg.jar --delete-files "signed-token.txt" .
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force-with-lease origin main
```

### 5.5 Rollback Plan

If history rewrite causes issues:

```bash
# Restore from backup bundle
git fetch ../BassanOs-backup-pre-purge.bundle "refs/heads/*:refs/heads/*"
git push --force-with-lease origin main  # restore original history
```

---

## 6. PHASE 5 — Prevention Controls

### 6.1 Files Created

| File                         | Purpose                                        |
| ---------------------------- | ---------------------------------------------- |
| `scripts/secret-scan.sh`     | Full-tree scanner — run in CI or manually      |
| `scripts/pre-commit-hook.sh` | Staged-file scanner — install in `.git/hooks/` |

### 6.2 Developer Setup Instructions

Add to `CONTRIBUTING.md` (or create it):

```bash
# Install pre-commit hook (every developer must do this once after cloning)
cp scripts/pre-commit-hook.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### 6.3 CI Integration (Recommended — Future Gate)

Add to `railway.toml` or GitHub Actions CI:

```yaml
- name: Secret scan
  run: bash scripts/secret-scan.sh .
```

---

## 7. Verification Gates

| Gate | Command                                                              | Expected                     |
| ---- | -------------------------------------------------------------------- | ---------------------------- |
| V1   | `git grep "BEGIN PRIVATE KEY"`                                       | Only markdown doc strings    |
| V2   | `npm run build`                                                      | EXIT 0                       |
| V3   | `npx tsc --noEmit`                                                   | EXIT 0                       |
| V4   | `npm run lint`                                                       | EXIT 0                       |
| V5   | JWKS endpoint after branch merge + redeploy                          | STATUS 200, KID: admin-key-2 |
| V6   | JWKS response — no `d`,`p`,`q` fields                                | EMPTY                        |
| V7   | `git log --all -- "*/admin-private.pem"` (post purge)                | EMPTY                        |
| V8   | `railway variables --service jwks-server \| grep ADMIN_JWKS_PAYLOAD` | KID admin-key-2 present      |

---

## 8. ⚠ HUMAN REQUIRED CHECKPOINT

> [!CAUTION]
> **You must explicitly approve the following before Sonit proceeds:**
>
> **ACTION REQUESTED:**
>
> - [ ] Approve `git filter-repo` history rewrite on the BassanOs repo
> - [ ] Authorize `git push --force-with-lease` to origin (main + fix/secure-keys)
> - [ ] Confirm all team members have been notified and have no open work based on old commits
> - [ ] Confirm backup has been taken
>
> **Reply with "APPROVED: history rewrite + force push" to proceed.**

---

_END OF PLAN v2_
