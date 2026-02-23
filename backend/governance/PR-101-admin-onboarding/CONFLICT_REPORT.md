# CONFLICT REPORT

## Documentation Conflicts, Contradictions, and Deprecations

**Generated:** 2026-02-24T00:53 UTC+2  
**Scope:** backend/governance/PR-101-admin-onboarding/ + suite-shavi/gates/  
**Status:** ⚠️ CONFLICTS FOUND — human approval required before any deletion

---

## CONFLICT 1 — CRITICAL: Git History Purge Discrepancy

**Severity:** 🔴 CRITICAL  
**Files Affected:** `PR_CORE_SECURE_KEYS_AUDIT_REPORT.md`, `POST_MERGE_EXECUTION_REPORT.md`

**Claim in audit report:**

> `git cat-file -e e80d195 → fatal: Not a valid object name e80d195`  
> "Commit object DESTROYED"

**Current reality (VE-03):**

```
git log --all --oneline -- "backend/tools/jwks/admin-private.pem"
→ e80d195 fix(scope): remove misplaced React UI from BassanOs core repo
```

**Analysis:**
Either the short SHA `e80d195` now points to a _different rewritten commit_ that happened to get the same 7-char prefix (SHA collision is common in short refs), or the history rewrite did not fully remove the object from all refs. The audit's `git cat-file -e` test may have been run before `git push --force` or against a different SHA interpretation.

> [!CAUTION]
> **Action Required — DO NOT PROCEED WITHOUT THIS CHECK:**
> Run `git show e80d195 --stat` and `git cat-file -p e80d195` to inspect what `e80d195` now refers to.
> If it contains `admin-private.pem` in its tree → history purge is INCOMPLETE. If not → it's a different rewritten commit with overlapping short SHA.

---

## CONFLICT 2 — MEDIUM: ADMIN_JWKS_PAYLOAD Active References in Historical Docs

**Severity:** 🟡 MEDIUM  
**Files Affected (9 files):**

| File                                              | Line                  | Issue                                              |
| ------------------------------------------------- | --------------------- | -------------------------------------------------- |
| `PR_CORE_SECURE_KEYS_PLAN.md`                     | 75, 78, 218           | States ADMIN_JWKS_PAYLOAD as active config         |
| `PR_CORE_SECURE_KEYS_EXECUTION_REPORT.md`         | 23, 26, 63, 66        | ADMIN_JWKS_PAYLOAD set as correct step             |
| `PR_CORE_SECURE_KEYS_VERIFICATION_EVIDENCE.md`    | 77–83, 94, 99, 114    | Verifies ADMIN_JWKS_PAYLOAD usage as pass          |
| `PR_CORE_SECURE_KEYS_AUDIT_REPORT.md`             | 126–134, 143, 159–170 | Describes ADMIN_JWKS_PAYLOAD as the config path    |
| `PR_CORE_SECURE_KEYS_PR_BODY.md`                  | 31, 66                | ADMIN_JWKS_PAYLOAD as confirmed setup              |
| `PR_CORE_FINAL_PREMERGE_EXECUTION_REPORT.md`      | 79                    | ADMIN_JWKS_PAYLOAD 5 refs in code (obsolete)       |
| `PR_CORE_FINAL_PREMERGE_VERDICT.md`               | 58                    | Redeploy instruction references ADMIN_JWKS_PAYLOAD |
| `POST_MERGE_RUNBOOK.md`                           | Multiple              | Instructs setting ADMIN_JWKS_PAYLOAD               |
| `PR_CORE_FINAL_PREMERGE_VERIFICATION_EVIDENCE.md` | 27                    | 5 code refs verified (obsolete)                    |

**Cause:** All these docs were written before the `ADMIN_JWKS_PAYLOAD → ADMIN_JWKS_B64` migration.

**Required Action:** Add addendum note to each, stating ADMIN_JWKS_PAYLOAD was deprecated. Do NOT delete — these are accurate historical records.

---

## CONFLICT 3 — MEDIUM: admin-key-1 as "Expected Desired State" in Old Plans

**Severity:** 🟡 MEDIUM  
**Files Affected (5 files):**

| File                                | Line           | Issue                                                         |
| ----------------------------------- | -------------- | ------------------------------------------------------------- |
| `PR_CORE_SUITE_INTEGRATION_PLAN.md` | 265, 464       | Lists `kid="admin-key-1"` as the intended verification target |
| `PR_CORE_SUITE_EXECUTION_REPORT.md` | 25             | PASS with kid=admin-key-1                                     |
| `VERIFICATION_jwks-smoke-test.md`   | 24, 28, 52, 99 | PASS marked with admin-key-1 active                           |
| `PR_CORE_SUITE_FIX_PLAN.md`         | 203            | Expected result: kid=admin-key-1                              |
| `POST_MERGE_EXECUTION_REPORT.md`    | 143, 176       | Status PENDING — "still serving admin-key-1"                  |

**Cause:** Written before key rotation. These are accurate historical snapshots.

**Required Action:**

- `POST_MERGE_EXECUTION_REPORT.md` — must be updated to RESOLVED (kid=admin-key-2 is now live).
- All others — add addendum noting key rotation to admin-key-2 completed post-execution.

---

## CONFLICT 4 — LOW: POST_MERGE_EXECUTION_REPORT.md Outdated Status

**Severity:** 🟢 LOW (resolved)  
**File:** `POST_MERGE_EXECUTION_REPORT.md`

**Claim:** Status `⚠️ PARTIAL — RAILWAY DEPLOYMENT PENDING`

**Current reality:** Railway is now live with `kid: admin-key-2` (verified VE-04).

**Required Action:** Append resolution addendum — do not rewrite the original.

---

## CONFLICT 5 — LOW: POST_MERGE_RUNBOOK.md Instructions Outdated

**Severity:** 🟢 LOW  
**File:** `POST_MERGE_RUNBOOK.md`

**Issue:** Runbook instructs setting `ADMIN_JWKS_PAYLOAD` variable. This variable is now:

- Deleted from Railway
- Hard-fails the server if present
- Replaced by `ADMIN_JWKS_B64`

**Required Action:** Replace runbook variable instructions with B64 procedure. Flag old steps as superseded.

---

## Summary — Actions Required

| Conflict                          | Severity    | File Count | Action                                  | Human Approval?    |
| --------------------------------- | ----------- | ---------- | --------------------------------------- | ------------------ |
| C1 — e80d195 history check        | 🔴 CRITICAL | 2          | Run `git show e80d195 --stat` to verify | **YES — BLOCKER**  |
| C2 — ADMIN_JWKS_PAYLOAD refs      | 🟡 MEDIUM   | 9          | Add deprecation addendum to each        | No — addendum only |
| C3 — admin-key-1 stale docs       | 🟡 MEDIUM   | 5          | Add rotation addendum                   | No — addendum only |
| C4 — POST_MERGE status stale      | 🟢 LOW      | 1          | Append resolution addendum              | No                 |
| C5 — Runbook PAYLOAD instructions | 🟢 LOW      | 1          | Supersede old steps with B64            | No                 |

---

## Proposed Canonical Document Structure

```
backend/governance/
├── PR-101-admin-onboarding/
│   ├── canonical/
│   │   ├── INCIDENT_RSA_KEY_REMOVAL.md        ← merged: Plan + Audit + Evidence
│   │   ├── JWKS_SERVER_HARDENING.md           ← B64 migration + Dockerfile fix
│   │   ├── GIT_HISTORY_REWRITE.md             ← filter-repo evidence + status
│   │   ├── POST_MERGE_STATUS.md               ← final resolved state declaration
│   │   └── UI_RELOCATION_FIX.md               ← suite-shavi gate summary
│   ├── archived/
│   │   ├── ARCHIVED_PR_CORE_SECURE_KEYS_PLAN.md
│   │   ├── ARCHIVED_PR_CORE_SECURE_KEYS_EXECUTION_REPORT.md
│   │   ├── ARCHIVED_PR_CORE_SECURE_KEYS_VERIFICATION_EVIDENCE.md
│   │   ├── ARCHIVED_PR_CORE_SUITE_INTEGRATION_PLAN.md
│   │   ├── ARCHIVED_VERIFICATION_jwks-smoke-test.md
│   │   └── ARCHIVED_POST_MERGE_RUNBOOK.md
│   └── [all other PR-101 ops docs — unchanged]
```

**Recommendation:** Do NOT delete any files. Convert historical docs to `ARCHIVED_*.md`. Create canonical docs by merging relevant evidence.

---

## STOP CONDITION TRIGGERED

> [!IMPORTANT]
> \*\*CONFLICT 1 (e80d195 git history) requires human inspection before:
>
> - Declaring history purge complete
> - Creating GIT_HISTORY_REWRITE.md canonical doc with "PURGED" status
> - Marking the repo as fully clean\*\*
>
> All other conflicts can be resolved with addendums (no file deletions required).
