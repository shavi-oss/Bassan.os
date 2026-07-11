# EXECUTION_REPORT — PR-102 (Phase-0 Security Hardening)

## Mandatory governance reads (compliance)
- `governance/core-contract/CORE_CONTRACT_V1_LOCK_DECLARATION.md` ✅
- `governance/PR-101-admin-onboarding/*` (precedent for patch-auth + linter MINOR UPDATE) ✅
- `tests/security/security-linter.spec.ts` — full read of S2-L2 / S2-L3 / S2-L4 / S2-L6 / S3-L7 ✅
- Modified controllers: `auth.service`, `auth.controller`, `roles.controller`,
  `users.controller`, `shared.module`, `main.ts` ✅

## Changes made (all within Scope Lock)

1. **auth.service.ts** — `login()` and `refresh()` now resolve `user.organization?.isActive`;
   if the organization is inactive → throw `UnauthorizedException` (suspension actually enforced).
2. **auth.controller.ts** — `@UseGuards(ThrottleGuard)` on `POST /auth/login` (brute-force protection).
3. **roles.controller.ts** — `@UseGuards(PermissionsGuard)` + `@RequirePermission('roles','write')`
   on `POST` and `assignPermissions`.
4. **users.controller.ts** — `@UseGuards(PermissionsGuard)` + `@RequirePermission('users','write')` on `POST`.
5. **shared.module.ts** — `PermissionsGuard` + `ThrottleGuard` registered as global providers/exports.
6. **NEW** `shared/guards/permissions.guard.ts` — resolves the user's permission tree
   (UserRole → Role → Permission) and throws `403 Forbidden` when the required permission is absent.
   Uses `prisma.client` (honors tenant isolation).
7. **NEW** `shared/guards/throttle.guard.ts` — in-memory 5 req/IP/min limiter (MVP, no external store).
8. **NEW** `shared/decorators/require-permission.decorator.ts` — `@RequirePermission(resource, action)`.
9. **main.ts** — added security response headers (X-Content-Type-Options, X-Frame-Options,
   X-XSS-Protection, Referrer-Policy, Permissions-Policy) without external deps.
10. **.env.example** — `JWT_SECRET` must-be-changed warning.
11. **tests/security/security-linter.spec.ts** — `BASSAN_PATCH=9.0` exception (MINOR UPDATE).
12. **docs/SECURITY_HARDENING_PHASE0.md** + 2 unit-test suites (NEW).

## Stop conditions (from governance)
- ✅ No files outside the Allowed list modified (verified via `git diff` scope).
- ✅ `npx tsc --noEmit` → EXIT 0.
- ✅ New unit tests → 6 passed.
- ✅ Linter (with `BASSAN_PATCH=9.0`) → S3-L7 PASS; only 3 pre-existing failures remain.

## Result
Linter (with governance exception): **S3-L7 PASS**; 3 pre-existing failures
(S2-L4 / S4-L2 / S4-L3) remain in untouched files → out of scope.
