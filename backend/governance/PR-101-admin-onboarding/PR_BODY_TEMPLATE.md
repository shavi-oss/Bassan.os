# PR Title: PR-101 Core: Add admin module & admin-safe onboarding endpoint (S2S)

## Summary

This PR adds a new admin-only module `src/modules/admin` and the admin-safe onboarding endpoint:
`POST /api/v2/admin/organizations`. The endpoint is protected by an S2S Admin JWT (AdminJwtAuthGuard)
and reuses `OrganizationsService.create()` for bootstrap. No v1 endpoints or immutable modules were changed.

## Scope

Files changed:

- `backend/src/modules/admin/*` (NEW)
- `backend/tests/organizations/admin.controller.spec.ts` (NEW)
- `backend/tests/auth/admin-jwt.strategy.spec.ts` (NEW)
- `backend/tests/security/security-linter.spec.ts` (MINOR UPDATE)
- `backend/src/modules/organizations/governance/pr/PR-101/*` (governance docs)

## Verification

- Typecheck: `npx tsc --noEmit` — PASS
- Lint: `npm run lint` — PASS
- Security linter: `npx jest backend/tests/security/security-linter.spec.ts` — PASS
- Unit tests (admin): `npx jest backend/tests/organizations/admin.controller.spec.ts` — PASS
- Smoke curl: 201 with valid S2S token; 401 without token.

## Risk & Rollback

- Risk: Low-Medium. We add an admin path and a linter exception; tenant isolation preserved.
- Rollback: revert commit.

## Evidence

- `backend/src/modules/organizations/governance/pr/PR-101/PR_101_EXECUTION_REPORT.md`
- `backend/src/modules/organizations/governance/pr/PR-101/PR_101_VERIFICATION_EVIDENCE.md`
