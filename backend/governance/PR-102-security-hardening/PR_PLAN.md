# PR-102 — Phase-0 Security Hardening (Bassan.OS Core)

> Governance-compliant patch following the PR-101 precedent.
> Patch authorization mechanism: `BASSAN_PATCH=9.0` (mirrors 3.1 / 4.1 / 6.0).

## Scope Lock

### ✅ ALLOWED (Stage 0-2 immutable zones, authorized via BASSAN_PATCH=9.0)

| File | Change |
|------|--------|
| `src/modules/auth/auth.service.ts` | Enforce org suspension (`isActive`) on login + refresh |
| `src/modules/auth/auth.controller.ts` | `@UseGuards(ThrottleGuard)` on `POST /auth/login` |
| `src/modules/roles/roles.controller.ts` | `@UseGuards(PermissionsGuard)` on `POST` + `assignPermissions` |
| `src/modules/users/users.controller.ts` | `@UseGuards(PermissionsGuard)` on `POST` |
| `src/shared/shared.module.ts` | Register `PermissionsGuard` + `ThrottleGuard` globally |
| `src/shared/guards/permissions.guard.ts` | **NEW** — RBAC enforcement guard |
| `src/shared/guards/throttle.guard.ts` | **NEW** — zero-dependency in-memory rate limiter |
| `src/shared/decorators/require-permission.decorator.ts` | **NEW** — `@RequirePermission(resource, action)` |
| `src/main.ts` | Security response headers (X-Content-Type-Options, X-Frame-Options, etc.) |
| `src/app.module.ts` | Removed dead `TenantMiddleware` wiring (safe pass-through was a no-op) |
| `src/.env.example` | `JWT_SECRET` warning |
| `tests/security/security-linter.spec.ts` | **MINOR UPDATE** — `BASSAN_PATCH=9.0` exception |
| `docs/SECURITY_HARDENING_PHASE0.md` | **NEW** — implementation record |
| `tests/security/permissions.guard.spec.ts` | **NEW** — unit tests (6 passed) |
| `tests/security/suspend.spec.ts` | **NEW** — unit tests |

### ⛔ FORBIDDEN (out of scope — MUST NOT TOUCH)

| File | Reason |
|------|--------|
| `prisma/schema.prisma` | No schema change; non-breaking by contract |
| `src/core/database/prisma.extension.ts` | Tenant-isolation extension untouched |
| `src/core/jwt.strategy.ts` | Auth-strategy untouched |
| `src/shared/guards/tenant.guard.ts` | Unchanged |
| `src/middleware/tenant.middleware.ts` | Dead code (unwired); separate cleanup PR |
| `package.json` | No new dependencies (guards are zero-dependency) → S2-L6 safe |

## Design principles
- **Non-breaking**: only additive guards + checks. Class-level `@UseGuards(JwtAuthGuard, TenantGuard)` kept on every modified controller (S2-L4 satisfied).
- **Zero new deps**: throttle + headers implemented natively (no `helmet`, no `throttler`).
- **Adds a guard = allowed**: CORE_CONTRACT_V1 explicitly permits adding guards as a non-breaking change.
