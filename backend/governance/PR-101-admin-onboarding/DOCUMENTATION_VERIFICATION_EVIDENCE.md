# DOCUMENTATION VERIFICATION EVIDENCE

## Step 6 — Verification Commands Run During Reconciliation

**Executed:** 2026-02-24T00:53 UTC+2  
**Branch:** fix/secure-keys  
**Executor:** Sonit — Documentation Reconciliation Pass

---

## VE-01: git grep "BEGIN PRIVATE KEY"

```
$ git grep "BEGIN PRIVATE KEY"

backend/governance/PR-101-admin-onboarding/POST_MERGE_EXECUTION_REPORT.md: git grep "BEGIN PRIVATE KEY"
backend/governance/PR-101-admin-onboarding/PR_CORE_FINAL_PREMERGE_EXECUTION_REPORT.md: git grep "BEGIN PRIVATE KEY"
backend/governance/PR-101-admin-onboarding/PR_CORE_FINAL_PREMERGE_PLAN.md: 2. PEM block scan...
backend/governance/PR-101-admin-onboarding/PR_CORE_FINAL_PREMERGE_VERIFICATION_EVIDENCE.md: ... Docs/scripts only
backend/governance/PR-101-admin-onboarding/PR_CORE_SECURE_KEYS_AUDIT_REPORT.md: ... Governance docs + secret-scan.sh only
backend/governance/PR-101-admin-onboarding/PR_CORE_SECURE_KEYS_EXECUTION_REPORT.md: git grep "BEGIN PRIVATE KEY" (after rewrite)
backend/governance/PR-101-admin-onboarding/PR_CORE_SECURE_KEYS_PLAN.md: ABORT if ...
backend/governance/PR-101-admin-onboarding/PR_CORE_SECURE_KEYS_PR_BODY.md: | git grep ... | ✅ Only markdown doc strings
backend/governance/PR-101-admin-onboarding/PR_CORE_SECURE_KEYS_VERIFICATION_EVIDENCE.md: in secret-scan.sh ...
scripts/secret-scan.sh:  "-----BEGIN PRIVATE KEY-----"
EXIT: 0
```

**Result:** ✅ **Only doc-string references and secret-scan.sh pattern list. No real PEM block content.**

---

## VE-02: git grep ADMIN_JWKS_PAYLOAD (code files only: _.js, _.ts, Dockerfile)

```
$ git grep "ADMIN_JWKS_PAYLOAD" -- "*.js" "*.ts" "*.json" "Dockerfile*"

backend/tools/jwks-server/index.js:  // Hard-fail if someone still has ADMIN_JWKS_PAYLOAD set
backend/tools/jwks-server/index.js:  if (process.env.ADMIN_JWKS_PAYLOAD) {
backend/tools/jwks-server/index.js:    console.error('[jwks-server] FATAL: ADMIN_JWKS_PAYLOAD is no longer supported.')
backend/tools/jwks-server/index.js:    console.error('[jwks-server] Action: delete ADMIN_JWKS_PAYLOAD and set ADMIN_JWKS_B64')
backend/tools/jwks-server/index.js:    console.error('[jwks-server]   railway variables delete ADMIN_JWKS_PAYLOAD')
EXIT: 0
```

**Result:** ✅ **`ADMIN_JWKS_PAYLOAD` only appears in index.js as a hard-fail guard rejecting its use.  
No code reads it as an active config path. B64-only confirmed.**

---

## VE-03: git log --all -- admin-private.pem (history check)

```
$ git log --all --oneline -- "backend/tools/jwks/admin-private.pem"

e80d195 fix(scope): remove misplaced React UI from BassanOs core repo
EXIT: 0
```

> [!WARNING]
> **CONFLICT WITH PRIOR AUDIT:** `e80d195` is reachable in git history.  
> The PR_CORE_SECURE_KEYS_AUDIT_REPORT.md states:  
> `git cat-file -e e80d195 → fatal: Not a valid object name e80d195`  
> This contradiction must be investigated. Either:
>
> - The `git cat-file` check was run on a different SHA, or
> - The `git filter-repo` purge rewrote the history but the reflog/packed-refs still has a dangling reference, or
> - The check was run before the current push and the SHA `e80d195` now refers to a **different rewritten commit** with the same short SHA prefix
>
> **Human action required before declaring history purge complete.**  
> Run: `git cat-file -p e80d195` and `git show e80d195 --stat` to inspect what this object contains.

---

## VE-04: Live Endpoint Verification

```
GET https://jwks-server-production.up.railway.app/.well-known/jwks.json

Response (HTTP 200):
{
  "keys": [
    {
      "kty": "RSA",
      "n": "2dJl85fIqWpuHeitAOuvalzdFlo8QXOf5Z2Nu_kdFEoSxZFwUKt4YiZpkXq-oP...",
      "e": "AQAB",
      "use": "sig",
      "kid": "admin-key-2",
      "alg": "RS256"
    }
  ]
}
```

**KID:** admin-key-2 ✅  
**Private fields (d/p/q/dp/dq/qi):** ABSENT ✅  
**ADMIN_JWKS_B64 source:** confirmed by Railway logs: `Loaded 1 key(s) from ADMIN_JWKS_B64: admin-key-2`

---

## VE-05: admin-key-1 in active documentation (grep summary)

```
Files with admin-key-1 as desired/expected ACTIVE state (excluding historical/revocation references):

PR_CORE_SUITE_INTEGRATION_PLAN.md:265  → expects kid="admin-key-1" as success condition  ⚠️ STALE
PR_CORE_SUITE_EXECUTION_REPORT.md:25   → PASS with kid=admin-key-1                       ⚠️ STALE
VERIFICATION_jwks-smoke-test.md:28,99  → kid=admin-key-1 marked PASS                     ⚠️ STALE
POST_MERGE_EXECUTION_REPORT.md:143,176 → endpoint serving admin-key-1 as PENDING          ⚠️ OUTDATED
PR_CORE_SUITE_FIX_PLAN.md:203          → kid=admin-key-1 as expected result               ⚠️ STALE
```

**Result:** ⚠️ **5 files contain admin-key-1 in a context that implies it is the current/desired active key. These documents predate the Railway deployment and key rotation. They are historically accurate but require status addendums.**

---

## Final System State (as of 2026-02-24T00:53 UTC+2)

| Item                              | State                                          |
| --------------------------------- | ---------------------------------------------- |
| JWKS endpoint                     | `kid: admin-key-2` — LIVE ✅                   |
| ADMIN_JWKS_B64 set on Railway     | ✅                                             |
| ADMIN_JWKS_PAYLOAD on Railway     | DELETED ✅                                     |
| index.js config                   | B64-only; PAYLOAD causes hard-fail ✅          |
| PEM blocks in working tree        | NONE ✅                                        |
| Git history — `admin-private.pem` | **⚠️ e80d195 reachable — requires inspection** |
| Private fields on endpoint        | ABSENT ✅                                      |
