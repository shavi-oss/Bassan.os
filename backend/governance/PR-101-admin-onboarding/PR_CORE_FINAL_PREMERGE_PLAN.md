# PR_CORE_FINAL_PREMERGE_PLAN.md

## Document Control

| Field    | Value                                                           |
| -------- | --------------------------------------------------------------- |
| Plan ID  | PR-CORE-FINAL-PREMERGE                                          |
| Date     | 2026-02-23T21:44 UTC+2                                          |
| Executor | Sonit — Governance Executor                                     |
| Branches | `fix/secure-keys` (BassanOs), `fix/ui-relocation` (suite-shavi) |
| Status   | ✅ COMPLETE — Verdict issued                                    |

---

## Objective

Complete final pre-merge verification for both remediation branches, produce all
governance artifacts required for a safe merge, and issue merge readiness verdict.

---

## Scope Lock

### Allowed

| Repo        | Scope                                                                  |
| ----------- | ---------------------------------------------------------------------- |
| BassanOs    | `backend/governance/PR-101-admin-onboarding/**` (governance docs only) |
| suite-shavi | `modules/platform-admin/governance/gates/**` (governance docs only)    |

### Forbidden (Unchanged)

- `src/modules/auth/**`
- `src/modules/organizations/**`
- `prisma/schema.prisma`
- Any application business logic
- Any secrets, PEM bodies, JWTs

---

## Steps

### Phase 1 — Zero-Trust Verification (BassanOs)

1. Branch existence + recency check: `git branch -a`, `git log --oneline -10`
2. PEM block scan working tree: `git grep "BEGIN PRIVATE KEY"`, `git grep "BEGIN RSA PRIVATE KEY"`
3. Tracked file scan: `git ls-files | grep .pem|.key|signed-token`
4. History forensic: `git cat-file -e e80d195` (must fail), `git log --all -- admin-private.pem` (must be empty)
5. React contamination check: `git grep -l "import React"`, find `*.tsx` in `modules/`
6. JWKS server code inspection: confirm env-var-only, fail-closed, private-field stripping
7. Static checks: `npm run build`, `npx tsc --noEmit`, `npm run lint`

### Phase 1 — Zero-Trust Verification (suite-shavi)

1. Branch check: `git branch -a`
2. Forbidden patterns: `git grep "api/v1"`, `git grep "localStorage"` in client src
3. Static checks: `npm run build`, `npx tsc --noEmit`

### Phase 2 — Governance Artifacts

Produce: Plan, Execution Report, Verification Evidence, Verdict, PR Bodies (×2), suite-shavi gate doc, Post-Merge Runbook.

### Phase 3 — Verdict

Issue one of: SAFE TO MERGE WITH CONDITIONS / DO NOT MERGE.

### Phase 4 — Post-Merge Runbook

Produce `POST_MERGE_RUNBOOK.md` with Railway steps, endpoint verification, team reset, rollback.

---

## Stop Conditions

- Any real PEM block in working tree or history → BLOCK
- Immutable zone appears in `git diff` → BLOCK
- `npm run build` failure → BLOCK
- `git cat-file -e e80d195` succeeds (old commit alive) → BLOCK
