# PR-101 — PR Body Template

## Title

`feat(admin): PR-101 — Admin S2S onboarding endpoint (AdminModule registration)`

## Summary

Registers `AdminModule` in `AppModule`, making `POST /api/v2/admin/organizations` reachable
at runtime. The module was implemented in previous commits (6a5c11e → b3a7e7cc); this PR
adds the single missing registration step.

## Changes

| File                        | Change                                                 |
| --------------------------- | ------------------------------------------------------ |
| `backend/src/app.module.ts` | Add `import { AdminModule }` + register in `imports[]` |

## Security

- `AdminModule` uses `AdminJwtAuthGuard` (S2S JWT only) — NOT `JwtAuthGuard + TenantGuard`
- `organizationId` cannot be supplied by client (runtime guard + DTO design)
- All operations audited via `AdminAuditService.logAction()` (fail-closed)
- Key resolution: `ADMIN_JWKS_URL` (RS256) → `ADMIN_JWT_PUBLIC_KEY` (RS256) → `ADMIN_JWT_SECRET` (HS256)
- Immutable zones NOT touched: `organizations/**`, `auth/**`, `tenant.guard.ts`, `jwt.strategy.ts`, `schema.prisma`

## Verification

Full evidence in:

- `backend/src/modules/organizations/governance/pr/PR-101-admin-onboarding/PR_101_VERIFICATION_EVIDENCE.md`
- `backend/src/modules/organizations/governance/pr/PR-101-admin-onboarding/PR_101_EXECUTION_REPORT.md`

| Check                    | Result      |
| ------------------------ | ----------- |
| `npm run build`          | ✅ PASS     |
| `npx tsc --noEmit`       | ✅ PASS     |
| `npm run lint`           | ✅ PASS     |
| S2-L4 Guard enforcement  | ✅ PASS     |
| Admin unit tests (15/15) | ✅ PASS     |
| Token leak check         | ✅ CLEAN    |
| Smoke test               | ⏳ DEFERRED |

## Required Env Variables

| Variable               | Purpose                | Priority    |
| ---------------------- | ---------------------- | ----------- |
| `ADMIN_JWKS_URL`       | JWKS endpoint (RS256)  | Preferred   |
| `ADMIN_JWT_PUBLIC_KEY` | PEM public key (RS256) | Alternative |
| `ADMIN_JWT_SECRET`     | Shared secret (HS256)  | Fallback    |

## Reviewer Checklist

- [ ] `app.module.ts` change is limited to adding import + array entry
- [ ] No immutable zone files modified
- [ ] `ADMIN_JWT_SECRET` (or `ADMIN_JWKS_URL`) provisioned in environment before smoke test
- [ ] Smoke test run: `POST /api/v2/admin/organizations` → 201, no token → 401
