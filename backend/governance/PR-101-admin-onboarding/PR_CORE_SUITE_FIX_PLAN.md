# PR_CORE_SUITE_FIX_PLAN.md — BassanOs Repository

## Document Control

| Field      | Value                                                         |
| ---------- | ------------------------------------------------------------- |
| Plan ID    | PR-CORE-SUITE-FIX                                             |
| Date       | 2026-02-23T13:33 UTC+2                                        |
| Author     | Sonit (AI Execution Agent)                                    |
| Status     | DRAFT — AWAITING HUMAN APPROVAL                               |
| Branch     | `fix/ui-relocation` (to be created from current HEAD)         |
| Repository | BassanOs (`D:\Basaan os\BassanOs\`)                           |
| Authority  | ARCHITECTURAL_LAWS.md · CODE_LAWS.md · EXECUTION_AUTHORITY.md |

---

## 1. Objective

Correct a repository contamination: React UI components were previously committed to the
BassanOs core-API repository, violating **LAW SD-01** (UI is forbidden in Stage 1 scope)
and the principle that BassanOs houses only NestJS backend code, governance artifacts, and
the JWKS server tool.

**What this plan authorises:**

- Deletion of four misplaced UI source files from BassanOs.
- Verification that nothing else is disturbed.
- Production of execution report and verification evidence in the governance folder.

**What this plan does NOT authorise:**

- Any change to `src/`, `prisma/`, `tests/`, `backend/tools/`, or any governance doc other
  than the new artifacts listed below.
- Any change to auth, organizations, tenant guard, schema, or CI configuration.

---

## 2. Scope Locks

### 2.1 Allowed Files (write/delete)

| Action | Path                                                                                    |
| ------ | --------------------------------------------------------------------------------------- |
| DELETE | `modules/platform-admin/client/src/api/adminApi.ts`                                     |
| DELETE | `modules/platform-admin/client/src/components/CreateOrganizationForm.tsx`               |
| DELETE | `modules/platform-admin/client/src/components/OrganizationList.tsx`                     |
| DELETE | `modules/platform-admin/client/src/pages/AdminDashboard.tsx`                            |
| DELETE | `modules/platform-admin/client/` _(entire directory, now empty after deletions)_        |
| CREATE | `backend/governance/PR-101-admin-onboarding/PR_CORE_SUITE_FIX_EXECUTION_REPORT.md`      |
| CREATE | `backend/governance/PR-101-admin-onboarding/PR_CORE_SUITE_FIX_VERIFICATION_EVIDENCE.md` |
| CREATE | `backend/governance/PR-101-admin-onboarding/PR_CORE_SUITE_FIX_PR_BODY.md`               |

### 2.2 Immutable / Forbidden Paths (must NOT be touched)

```
src/modules/auth/**
src/modules/organizations/**
src/modules/users/**
src/core/**
src/shared/**
prisma/schema.prisma
backend/tools/jwks-server/**
backend/tools/jwks/**
tests/security/security-linter.spec.ts
backend/governance/PR-101-admin-onboarding/PR_101_*.md  (existing docs, read-only)
```

---

## 3. Identified Misplaced Files

The following four files were committed to BassanOs in error.
They contain React/JSX code — frontend scope, not backend scope.

| File                                                                      | Size    | Content Summary                                                                   |
| ------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------- |
| `modules/platform-admin/client/src/api/adminApi.ts`                       | 1,679 B | S2S fetch wrapper; calls `POST /api/v2/admin/organizations` via `VITE_ADMIN_JWT`  |
| `modules/platform-admin/client/src/pages/AdminDashboard.tsx`              | 2,771 B | Fail-closed admin page, renders form + list, guarded by `VITE_ADMIN_JWT` presence |
| `modules/platform-admin/client/src/components/CreateOrganizationForm.tsx` | 3,885 B | React form for creating organizations via `createOrganization()` API call         |
| `modules/platform-admin/client/src/components/OrganizationList.tsx`       | 1,666 B | Table display component for created organizations                                 |

**Safe to delete:** These files are not imported by any NestJS source file. They are
isolated in `modules/platform-admin/client/src/` which is a React subtree with no
counterpart in NestJS `src/`. The suite-shavi repository already contains richer
equivalents (confirmed during pre-read).

---

## 4. Tasks (Ordered — Executor Must Follow Sequence)

### T1 — Create Branch

```bash
cd "D:\Basaan os\BassanOs"
git checkout -b fix/ui-relocation
```

**Stop if:** branch creation fails or there are uncommitted changes in protected paths.

### T2 — Delete Misplaced UI Files

```bash
git rm modules/platform-admin/client/src/api/adminApi.ts
git rm modules/platform-admin/client/src/components/CreateOrganizationForm.tsx
git rm modules/platform-admin/client/src/components/OrganizationList.tsx
git rm modules/platform-admin/client/src/pages/AdminDashboard.tsx
```

Then remove now-empty directories:

```bash
git rm -r modules/platform-admin/client/
```

**Stop if:** `git rm` touches any path outside `modules/platform-admin/client/`.

### T3 — Confirm No UI Residue

```bash
git grep -l "import React" -- "*.tsx" "*.jsx"
git grep -l "import React" -- "*.ts" | grep -v spec | grep -v ".d.ts"
git status --porcelain
```

**Expected:** All outputs empty (no TSX/JSX files remain in BassanOs).

### T4 — Verify JWKS Server Untouched

```bash
git diff --name-only HEAD backend/tools/jwks-server/
git diff --name-only HEAD backend/tools/jwks/
```

**Expected:** Empty output (no changes).

### T5 — Run Verification Suite

```bash
npm run build
npx tsc --noEmit
npm run lint
npx jest
npm run security-linter
```

**Stop conditions:**

- Any of the above exits non-zero → ABORT and do NOT commit.
- Security linter reports new violations → ABORT.

### T6 — JWKS Smoke Test Re-Confirmation

Verify the live JWKS URL is still operational. The existing evidence in
`VERIFICATION_jwks-smoke-test.md` already shows:

- `POST /api/v2/admin/organizations` with RS256 JWT → **201** ✅
- `POST /api/v2/admin/organizations` without auth → **401** ✅

Re-run smoke test only if Railway environment is accessible. If not,
record that smoke test was deferred with justification in the execution report.

### T7 — Commit

```bash
git add -A
git commit -m "fix(scope): remove misplaced React UI from BassanOs core repo

UI files for the admin dashboard were incorrectly committed to BassanOs.
These files are React/JSX components and belong exclusively in suite-shavi.
The equivalent components already exist in suite-shavi/modules/platform-admin/client/src/.

Deleted:
  modules/platform-admin/client/src/api/adminApi.ts
  modules/platform-admin/client/src/components/CreateOrganizationForm.tsx
  modules/platform-admin/client/src/components/OrganizationList.tsx
  modules/platform-admin/client/src/pages/AdminDashboard.tsx

No backend files modified. No governance docs modified.
JWKS server and all immutable zones unchanged.

Refs: PR-CORE-SUITE-FIX"
```

### T8 — Write Governance Artifacts

Create execution report and verification evidence in:
`backend/governance/PR-101-admin-onboarding/`

---

## 5. Verification Commands

| Command                       | Expected Result                           |
| ----------------------------- | ----------------------------------------- |
| `git diff --name-only HEAD~1` | Shows only 4 deleted UI files             |
| `git grep -rl "import React"` | Empty                                     |
| `find modules/ -name "*.tsx"` | Empty (or no output)                      |
| `npm run build`               | Exit 0                                    |
| `npx tsc --noEmit`            | Exit 0, 0 errors                          |
| `npm run lint`                | Exit 0                                    |
| `npx jest`                    | All tests pass                            |
| `npm run security-linter`     | Zero new violations vs. baseline          |
| JWKS URL curl                 | `kid: admin-key-1`, no private key fields |

---

## 6. Stop Conditions (ABSOLUTE)

1. **ABORT** if any file outside `modules/platform-admin/client/` is touched by `git rm`.
2. **ABORT** if `npm run build` or `npx tsc --noEmit` exits non-zero.
3. **ABORT** if security linter introduces new (non-pre-existing) violations.
4. **ABORT** if any immutable path (`auth/`, `organizations/`, `prisma/schema.prisma`,
   `tenant.guard.ts`, `jwks-server/`) shows in `git status`.
5. **ABORT** if any private key or secret is found in staged changes.
6. **ABORT** if smoke test returns anything other than `201` (valid JWT) or `401` (no auth).

---

## 7. Post-Execution Artifacts to Create

- `PR_CORE_SUITE_FIX_EXECUTION_REPORT.md` — step-by-step record with command outputs
- `PR_CORE_SUITE_FIX_VERIFICATION_EVIDENCE.md` — diffs, test outputs, linter output
- `PR_CORE_SUITE_FIX_PR_BODY.md` — PR description template for human merge review

---

## 8. Human Approval Required

**This plan MUST NOT be executed until explicit human approval is received.**

Approver acknowledges:

- [ ] Scope is limited to deletion of 4 UI files + directory cleanup
- [ ] No backend/NestJS code is modified
- [ ] JWKS server and governance artifacts remain untouched
- [ ] Verification suite must pass before any commit is merged
- [ ] A separate plan governs suite-shavi changes (see `GATE_UI_FIX_PLAN.md`)

---

_END OF PLAN_
