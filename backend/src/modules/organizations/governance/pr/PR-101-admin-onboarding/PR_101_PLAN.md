# PR-101 — Plan: Register AdminModule in AppModule

## Document Control

- Date: 2026-02-19
- Executor: Sonit (AI Execution Agent)
- Branch: pr/PR-101-admin-onboarding
- HEAD before: b3a7e7cc1feb3eaafef61916156de95786ee9a08

## Objective

Register `AdminModule` in `AppModule` so that the admin S2S onboarding endpoint
(`POST /api/v2/admin/organizations`) is reachable at runtime.

`AdminModule` was already implemented (PR-101, commits 6a5c11e → b3a7e7c) but was
not yet imported into `AppModule`. This plan covers the minimal registration step only.

## Scope Lock

### Allowed (ONLY these files)

- `backend/src/app.module.ts` (MODIFY: add import + add AdminModule to imports array)
- `backend/src/modules/organizations/governance/pr/PR-101-admin-onboarding/*` (NEW governance docs)

### Forbidden (DO NOT TOUCH)

- `backend/src/modules/organizations/**`
- `backend/src/modules/auth/**`
- `backend/src/shared/guards/tenant.guard.ts`
- `backend/src/modules/auth/strategies/jwt.strategy.ts`
- `package.json`, `package-lock.json`
- `prisma/schema.prisma`

## Tasks

1. PRE-READ: Read app.module.ts, admin.module.ts, admin.controller.ts, security-linter.spec.ts
2. PREFLIGHT: `git status --porcelain` + `git rev-parse HEAD`
3. PATCH: Add `import { AdminModule }` after ExecutorModule import; add `AdminModule,` before `ExecutorModule` in imports array
4. COMMIT: `git add backend/src/app.module.ts` + `git diff --cached --name-only` (scope check) + commit
5. PUSH: `git push origin pr/PR-101-admin-onboarding`
6. VERIFY: `npm run build`, `npx tsc --noEmit`, `npm run lint`, jest test suites
7. GOVERNANCE: Create PR_101_PLAN.md, PR_101_EXECUTION_REPORT.md, PR_101_VERIFICATION_EVIDENCE.md, PR_BODY_TEMPLATE.md

## Verification Commands

```bash
npm run build            # must exit 0
npx tsc --noEmit         # must exit 0
npm run lint             # must exit 0
npx jest tests/security/security-linter.spec.ts --runInBand  # S2-L4 must pass
npx jest tests/organizations/admin.controller.spec.ts --runInBand
npx jest tests/auth/admin-jwt.strategy.spec.ts --runInBand
```

## Stop Conditions (Immediate Abort)

- Any staged file outside allowed list → `EXECUTION ABORTED — OUT_OF_SCOPE_FILE: <path>`
- tsc or build fails for reasons requiring forbidden file edits → `EXECUTION ABORTED — TYPECHECK_FAIL_IMMUTABLE`
- Security linter requires TenantGuard/JwtStrategy changes → `EXECUTION ABORTED — SECURITY_LINTER_BLOCK`
- Any code accepts organizationId from client → `EXECUTION ABORTED — FORBIDDEN_ORGID_ACCEPTED`
