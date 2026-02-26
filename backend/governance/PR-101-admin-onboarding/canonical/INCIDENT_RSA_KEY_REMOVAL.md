# CANONICAL INCIDENT DOCUMENT: RSA Private Key Removal

## Classification: Security Incident Response Record

**Incident ID:** INC-2026-RSA-001  
**Created:** 2026-02-23 | **Resolved:** 2026-02-24T00:53 UTC+2  
**Status:** ✅ RESOLVED  
**Executor:** Sonit — Security Remediation

---

## 1. Incident Summary

An RSA-2048 private key (`admin-private.pem`, kid=`admin-key-1`) was committed to the BassanOs git repository. The key was used by the `jwks-server` service to sign administrative JWTs. Its presence in git history constituted a critical security exposure.

---

## 2. Historical Timeline

| Timestamp (approx) | Event                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| Pre-2026-02-19     | `admin-private.pem` committed to BassanOs repo alongside JWKS tooling                                        |
| 2026-02-19         | Security scan discovers private key in git history                                                           |
| 2026-02-22         | `index.js` rewritten → reads from `ADMIN_JWKS_PAYLOAD` env var; 25 sensitive files removed from working tree |
| 2026-02-22         | `git filter-repo` executed → all history referencing `admin-private.pem` purged                              |
| 2026-02-22         | Force-push to remote with new SHAs                                                                           |
| 2026-02-22         | `.gitignore` hardened: `*.pem`, `*.key`, `backend/tools/jwks/`, etc.                                         |
| 2026-02-22         | Prevention controls added: `scripts/secret-scan.sh`, `scripts/pre-commit-hook.sh`                            |
| 2026-02-23         | `fix/secure-keys` branch: pre-merge audit confirmed SAFE TO MERGE                                            |
| 2026-02-23         | Branches merged. Post-merge: Railway redeploy attempted via `railway up`                                     |
| 2026-02-23         | Railway build failure: Dockerfile contained `COPY jwks.json ./` (file no longer exists)                      |
| 2026-02-23         | Dockerfile patched: `COPY jwks.json ./` removed (commit `1ef856e`)                                           |
| 2026-02-23         | Railway crash: `ADMIN_JWKS_PAYLOAD` corrupted by PowerShell quoting (`{keys:[…]}` not JSON)                  |
| 2026-02-23         | `ADMIN_JWKS_B64` variable added to `index.js` as primary; PAYLOAD as fallback (commit `dca6a67`)             |
| 2026-02-23         | Railway variable `ADMIN_JWKS_PAYLOAD` deleted; `ADMIN_JWKS_B64` set with new RSA-2048 public key             |
| 2026-02-23         | `index.js` rewritten: B64-only config; PAYLOAD causes hard-fail (commit `cad6cb5`)                           |
| 2026-02-24T00:53   | Endpoint live: `kid=admin-key-2`, `LOADED FROM ADMIN_JWKS_B64`, no private fields                            |

---

## 3. Changes Made

### 3.1 Code Changes

| File                                     | Change                                                                                                                                             |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend/tools/jwks-server/index.js`     | Rewrote to read JWKS from `ADMIN_JWKS_B64` (B64-decoded JSON). Hard-fails if `ADMIN_JWKS_PAYLOAD` present. Private-field detection before serving. |
| `backend/tools/jwks-server/Dockerfile`   | Removed `COPY jwks.json ./` — file no longer exists                                                                                                |
| `backend/tools/jwks-server/.env.example` | Documented `ADMIN_JWKS_B64` as sole config method                                                                                                  |
| `.gitignore`                             | Added: `*.pem`, `*.key`, `backend/tools/jwks/`, `jwks.json`, `signed-token.txt`, key scripts                                                       |

### 3.2 Scripts Added

| Script                       | Purpose                                                                   |
| ---------------------------- | ------------------------------------------------------------------------- |
| `scripts/secret-scan.sh`     | Scans for PEM headers and raw key patterns in tracked files               |
| `scripts/pre-commit-hook.sh` | Blocks commits containing private key headers or `.pem`/`.key` extensions |

### 3.3 Railway Actions

| Action                                                  | Status           |
| ------------------------------------------------------- | ---------------- |
| `railway variable delete ADMIN_JWKS_PAYLOAD`            | ✅ Done          |
| `railway variables set "ADMIN_JWKS_B64=<576-char-b64>"` | ✅ Done          |
| `railway up --service jwks-server --detach`             | ✅ Done — exit 0 |

### 3.4 Git History Purge

```
Tool: git filter-repo
Target path: backend/tools/jwks/ (all files including admin-private.pem)
Result: All commits referencing the private key path were rewritten with new SHAs.
Force-push to all remotes: completed.
Verification: git log --all -- backend/tools/jwks/admin-private.pem → empty (no matching commits)
Note: SHA e80d195 now refers to a DIFFERENT rewritten commit (fix/scope: React UI removal).
      This is expected behavior — git filter-repo rewrote the DAG and short SHAs are non-unique.
```

---

## 4. Verification Evidence (raw)

### 4.1 Working Tree — No Private Keys

```
git grep "BEGIN PRIVATE KEY"
→ Only matches in: governance docs (strings), scripts/secret-scan.sh (pattern list)
→ No real PEM block content
EXIT: 0
```

### 4.2 Git History — Private Key File Absent

```
git log --all --oneline -- "backend/tools/jwks/admin-private.pem"
→ (empty output)
EXIT: 0
```

### 4.3 Code — B64-Only Config Confirmed

```
grep ADMIN_JWKS_PAYLOAD backend/tools/jwks-server/index.js
→ Only in hard-fail guard (5 lines — all print FATAL error and call process.exit(1))
grep ADMIN_JWKS_B64 backend/tools/jwks-server/index.js
→ 7 references — primary config path
```

### 4.4 Endpoint Verification

```
GET https://jwks-server-production.up.railway.app/.well-known/jwks.json
HTTP: 200
kid: admin-key-2  ✅
d: absent         ✅
p: absent         ✅
q: absent         ✅

Railway logs:
[jwks-server] Loaded 1 key(s) from ADMIN_JWKS_B64: admin-key-2
[jwks-server] Listening on port 8080
```

---

## 5. Deprecated Documentation

The following files are accurate historical records but contain outdated configuration references. They must NOT be modified; add addendums only:

| File                                           | Outdated Claim                   | Reality                    |
| ---------------------------------------------- | -------------------------------- | -------------------------- |
| `PR_CORE_SECURE_KEYS_PLAN.md`                  | ADMIN_JWKS_PAYLOAD as config     | Now: ADMIN_JWKS_B64 only   |
| `PR_CORE_SECURE_KEYS_EXECUTION_REPORT.md`      | ADMIN_JWKS_PAYLOAD as config     | Now: ADMIN_JWKS_B64 only   |
| `PR_CORE_SECURE_KEYS_VERIFICATION_EVIDENCE.md` | ADMIN_JWKS_PAYLOAD verified      | Now: ADMIN_JWKS_B64        |
| `PR_CORE_SECURE_KEYS_AUDIT_REPORT.md`          | Endpoint admin-key-1 (pre-merge) | Now: admin-key-2 live      |
| `VERIFICATION_jwks-smoke-test.md`              | PASS with admin-key-1            | Now: admin-key-2 is active |
| `POST_MERGE_RUNBOOK.md`                        | Set ADMIN_JWKS_PAYLOAD           | Now: set ADMIN_JWKS_B64    |

---

## 6. Remaining Human Actions

| Action                                                          | Status                          |
| --------------------------------------------------------------- | ------------------------------- |
| Notify team of git history rewrite (reset/reclone instructions) | ⏳ Pending human action         |
| Revoke any issued JWTs signed with admin-key-1                  | ⏳ Pending (if any were issued) |
| Install pre-commit hook on all dev machines                     | ⏳ Pending per-developer        |

---

## Final State Declaration

```
══════════════════════════════════════════════════════════
SYSTEM STATE: STABLE
══════════════════════════════════════════════════════════
Incident:              INC-2026-RSA-001 — RESOLVED
Old key:               admin-key-1 (PERMANENTLY REVOKED)
Active key:            admin-key-2 (RS256, RSA-2048)
JWKS source:           ADMIN_JWKS_B64 only
ADMIN_JWKS_PAYLOAD:    DELETED from Railway — hard-fail if set
Git history:           PURGED (no PEM path reachable)
Filesystem key load:   FORBIDDEN (Dockerfile carries no jwks.json)
UI in BassanOs:        FORBIDDEN (removed to suite-shavi)
Endpoint:              https://jwks-server-production.up.railway.app/.well-known/jwks.json
                       → HTTP 200 | kid: admin-key-2 | d/p/q: absent
══════════════════════════════════════════════════════════
```
