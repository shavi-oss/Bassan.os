# PR Body Template — BassanOs fix/ui-relocation

## Summary

Removes four misplaced React UI files from the BassanOs core NestJS repository.
These files were committed by mistake and belong exclusively in suite-shavi.

## What Was Removed

| File                                                                      | Reason                                  |
| ------------------------------------------------------------------------- | --------------------------------------- |
| `modules/platform-admin/client/src/api/adminApi.ts`                       | React/TS fetch wrapper — frontend scope |
| `modules/platform-admin/client/src/pages/AdminDashboard.tsx`              | React page component — frontend scope   |
| `modules/platform-admin/client/src/components/CreateOrganizationForm.tsx` | React form — frontend scope             |
| `modules/platform-admin/client/src/components/OrganizationList.tsx`       | React table — frontend scope            |

Equivalent (richer) implementations already exist in:
`suite-shavi/modules/platform-admin/client/src/`

## What Was Not Changed

- `src/` — NestJS backend source: **UNTOUCHED**
- `prisma/schema.prisma` — DB schema: **UNTOUCHED**
- `backend/tools/jwks-server/` — JWKS server: **UNTOUCHED**
- All auth, organizations, users, tenant guard files: **UNTOUCHED**
- CI configuration: **UNTOUCHED**

## Verification

| Check                     | Result                             |
| ------------------------- | ---------------------------------- |
| `npm run build`           | ✅ EXIT 0                          |
| `npx tsc --noEmit`        | ✅ EXIT 0                          |
| `npm run lint`            | ✅ EXIT 0                          |
| `git grep "import React"` | ✅ Empty (no UI code remains)      |
| Security linter           | ✅ Zero new violations             |
| JWKS smoke test           | ✅ 201 (valid JWT) / 401 (no auth) |

## Governance

- Plan: `backend/governance/PR-101-admin-onboarding/PR_CORE_SUITE_FIX_PLAN.md`
- Execution Report: `backend/governance/PR-101-admin-onboarding/PR_CORE_SUITE_FIX_EXECUTION_REPORT.md`
- Verification Evidence: `backend/governance/PR-101-admin-onboarding/PR_CORE_SUITE_FIX_VERIFICATION_EVIDENCE.md`

## Companion PR

A companion `fix/ui-relocation` branch in **suite-shavi** confirms equivalents exist,
documents env variables, and adds governance artifacts.

## Checklist for Reviewer

- [ ] Confirm only 4 UI files are deleted (no NestJS source touched)
- [ ] Confirm `src/`, `prisma/`, `backend/tools/jwks-server/` show no diff
- [ ] Confirm branch is from correct HEAD
- [ ] Merge after review ← **no auto-merge**
