# DOCUMENTATION INVENTORY

## PR-101-admin-onboarding — Full Governance Doc Inventory

**Generated:** 2026-02-24T00:53 UTC+2  
**Scope:** `backend/governance/PR-101-admin-onboarding/` + `suite-shavi/modules/platform-admin/governance/gates/`

---

## A — Incident Response: RSA Key Removal (fix/secure-keys)

| Filename                                       | Category | Purpose          | Status Claimed         | admin-key-1 Ref                    | ADMIN_JWKS_PAYLOAD Ref |
| ---------------------------------------------- | -------- | ---------------- | ---------------------- | ---------------------------------- | ---------------------- |
| `PR_CORE_SECURE_KEYS_PLAN.md`                  | Incident | Plan (v2)        | Completed              | ✅ Revoked                         | ✅ Active (outdated)   |
| `PR_CORE_SECURE_KEYS_EXECUTION_REPORT.md`      | Incident | Execution Report | Completed              | ✅ Revoked                         | ✅ Active (outdated)   |
| `PR_CORE_SECURE_KEYS_VERIFICATION_EVIDENCE.md` | Incident | Verification     | Partial (pre-redeploy) | ⚠️ Serving admin-key-1 as expected | ✅ Active (outdated)   |
| `PR_CORE_SECURE_KEYS_PR_BODY.md`               | Incident | PR Body          | Merged                 | ✅ Revoked                         | ✅ Active (outdated)   |
| `PR_CORE_SECURE_KEYS_AUDIT_REPORT.md`          | Incident | Audit            | SAFE TO MERGE          | ⚠️ Serving admin-key-1 as expected | ✅ Active (outdated)   |

---

## B — Pre-Merge Final Gate (fix/secure-keys + fix/ui-relocation)

| Filename                                          | Category | Purpose        | Status Claimed                | admin-key-1 Ref           | ADMIN_JWKS_PAYLOAD Ref             |
| ------------------------------------------------- | -------- | -------------- | ----------------------------- | ------------------------- | ---------------------------------- |
| `PR_CORE_FINAL_PREMERGE_PLAN.md`                  | Gate     | Pre-merge plan | Authorized                    | —                         | —                                  |
| `PR_CORE_FINAL_PREMERGE_EXECUTION_REPORT.md`      | Gate     | Execution      | Completed                     | ⚠️ INFO: served pre-merge | ✅ 5 refs in code (outdated)       |
| `PR_CORE_FINAL_PREMERGE_VERIFICATION_EVIDENCE.md` | Gate     | Evidence       | Completed                     | ⚠️ Pre-merge expected     | ✅ Active (outdated)               |
| `PR_CORE_FINAL_PREMERGE_VERDICT.md`               | Gate     | Verdict        | SAFE TO MERGE WITH CONDITIONS | ⚠️ Mentions update needed | ✅ Redeploy instruction (outdated) |

---

## C — Post-Merge Operational

| Filename                         | Category | Purpose   | Status Claimed            | admin-key-1 Ref               | ADMIN_JWKS_PAYLOAD Ref |
| -------------------------------- | -------- | --------- | ------------------------- | ----------------------------- | ---------------------- |
| `POST_MERGE_RUNBOOK.md`          | Ops      | Runbook   | Pending steps             | ✅ Revoked                    | ✅ Active (outdated)   |
| `POST_MERGE_EXECUTION_REPORT.md` | Ops      | Execution | PARTIAL — Railway Pending | ⚠️ Endpoint still admin-key-1 | —                      |

---

## D — Suite-Shavi Integration

| Filename                                     | Category    | Purpose   | Status Claimed | admin-key-1 Ref                      | ADMIN_JWKS_PAYLOAD Ref |
| -------------------------------------------- | ----------- | --------- | -------------- | ------------------------------------ | ---------------------- |
| `PR_CORE_SUITE_INTEGRATION_PLAN.md`          | Integration | Plan      | Authorized     | ⚠️ Expected desired state (outdated) | —                      |
| `PR_CORE_SUITE_EXECUTION_REPORT.md`          | Integration | Execution | Completed      | ⚠️ kid=admin-key-1 PASS (outdated)   | —                      |
| `PR_CORE_SUITE_FIX_PLAN.md`                  | Integration | Fix plan  | Authorized     | ⚠️ Expected desired state (outdated) | —                      |
| `PR_CORE_SUITE_FIX_EXECUTION_REPORT.md`      | Integration | Execution | Completed      | —                                    | —                      |
| `PR_CORE_SUITE_FIX_PR_BODY.md`               | Integration | PR body   | Merged         | —                                    | —                      |
| `PR_CORE_SUITE_FIX_VERIFICATION_EVIDENCE.md` | Integration | Evidence  | Completed      | —                                    | —                      |

---

## E — JWKS Smoke Test

| Filename                          | Category | Purpose        | Status Claimed | admin-key-1 Ref                                              | ADMIN_JWKS_PAYLOAD Ref |
| --------------------------------- | -------- | -------------- | -------------- | ------------------------------------------------------------ | ---------------------- |
| `VERIFICATION_jwks-smoke-test.md` | Ops      | Smoke test run | ✅ PASS        | ⚠️ kid=admin-key-1 marked PASS (stale — pre-rotation result) | —                      |

---

## F — PR-101 Module Registration

| Filename                          | Category | Purpose   | Status    | Notes                                       |
| --------------------------------- | -------- | --------- | --------- | ------------------------------------------- |
| `PR_101_PLAN.md`                  | Module   | Plan      | Completed | No security refs                            |
| `PR_101_EXECUTION_REPORT.md`      | Module   | Execution | Completed | No security refs                            |
| `PR_101_VERIFICATION_EVIDENCE.md` | Module   | Evidence  | Completed | No security refs                            |
| `PR_BODY_TEMPLATE.md`             | Module   | PR body   | Merged    | References kid:admin-key-1 (historical doc) |
| `CHECKLIST.md`                    | Admin    | Checklist | N/A       | No conflicts                                |
| `FILE_MANIFEST.md`                | Admin    | File list | N/A       | No conflicts                                |

---

## G — Security Tooling

| Filename                      | Category | Purpose  | Status       | Notes        |
| ----------------------------- | -------- | -------- | ------------ | ------------ |
| `SECURITY_LINTER_BASELINE.md` | Security | Baseline | Pre-existing | No conflicts |
| `SECURITY_LINTER_PATCH.md`    | Security | Patch    | Completed    | No conflicts |

---

## H — Suite-Shavi GATE_UI_FIX (fix/ui-relocation)

| Filename                               | Category | Purpose       | Status        | Notes            |
| -------------------------------------- | -------- | ------------- | ------------- | ---------------- |
| `GATE_UI_FIX_PLAN.md`                  | UI Gate  | Plan          | Authorized    | No security refs |
| `GATE_UI_FIX_EXECUTION_REPORT.md`      | UI Gate  | Execution     | Completed     | No security refs |
| `GATE_UI_FIX_VERIFICATION_EVIDENCE.md` | UI Gate  | Evidence      | Completed     | No security refs |
| `GATE_UI_FIX_FINAL_VERIFICATION.md`    | UI Gate  | Final verdict | SAFE TO MERGE | No security refs |
| `GATE_UI_FIX_PR_BODY.md`               | UI Gate  | PR body       | Merged        | No security refs |

---

## I — Core Contract (immutable reference)

| Filename                                             | Status    | Notes        |
| ---------------------------------------------------- | --------- | ------------ |
| `core-contract/CORE_CONTRACT_V1_LOCK_DECLARATION.md` | Locked    | Immutable    |
| `core-contract/CORE_CONTRACT_V1_EXTRACT.md`          | Locked    | Immutable    |
| `core-contract/CORE_CONTRACT_EVIDENCE_TABLE.md`      | Locked    | Immutable    |
| `core-contract/CORE_CONTRACT_GO_NO_GO_DECISION.md`   | Locked    | Immutable    |
| `core-contract/SPEC_DRIFT_NOTICE.md`                 | Reference | No conflicts |

---

## Summary Counts

| State                                                                      | Count         |
| -------------------------------------------------------------------------- | ------------- |
| Stale `admin-key-1` as desired/active state                                | **7 files**   |
| Stale `ADMIN_JWKS_PAYLOAD` as active config                                | **9 files**   |
| `POST_MERGE_EXECUTION_REPORT` — contradictory (says PENDING, now RESOLVED) | **1 file**    |
| Files requiring archival or status update                                  | **~13 files** |
| Immutable / no conflict                                                    | **13 files**  |
