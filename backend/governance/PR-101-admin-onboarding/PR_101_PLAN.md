# PR_101_PLAN — Add Admin Module and Admin-safe Onboarding Endpoint

## Document Control

- Date: 2026-02-XX
- Executor: <your name / Sonit>
- Repo: shavi-oss/Bassan.os
- HEAD (before): `git rev-parse HEAD` <-- Sonit must capture this before changes

## Objective (one line)

Add a new admin-only module `src/modules/admin` and an admin-safe onboarding API
`POST /api/v2/admin/organizations` protected by Admin S2S JWT (AdminJwtAuthGuard),
allowing Suite to perform organization bootstrap safely without altering v1 behavior.

## Background & Rationale

- `OrganizationsService.create()` already implements secure bootstrap using `_unsafeClient`. We must reuse it. :contentReference[oaicite:5]{index=5}
- v1 endpoints remain unchanged and continue to be protected by JwtAuthGuard + TenantGuard; we must not alter them. :contentReference[oaicite:6]{index=6}
- All edits must respect ARCHITECTURAL_LAWS (immutable zones, guard laws). :contentReference[oaicite:7]{index=7}

## Scope Lock

### Allowed (ONLY these files)

- `backend/src/modules/admin/admin.module.ts` (NEW)
- `backend/src/modules/admin/admin.controller.ts` (NEW)
- `backend/src/modules/admin/admin.service.ts` (NEW)
- `backend/src/modules/admin/dto/README.md` (NEW - pointer to reuse organizations DTO)
- `backend/src/modules/admin/admin-jwt.strategy.md` (NEW - spec)
- `backend/src/modules/admin/admin-jwt.guard.md` (NEW - spec)
- `backend/tests/organizations/admin.controller.spec.ts` (NEW)
- `backend/tests/auth/admin-jwt.strategy.spec.ts` (NEW)
- `backend/src/modules/organizations/governance/pr/PR-101_*` (PR docs)
- `backend/tests/security/security-linter.spec.ts` (MINOR UPDATE ONLY — add documented admin exception for `api/v2/admin` path)

### Forbidden (NO TOUCH)

- Any modification to:
  - `backend/src/modules/organizations/**` (except importing/exporting OrganizationsService)
  - `backend/src/modules/auth/**`
  - `backend/src/shared/guards/tenant.guard.ts`
  - `backend/src/modules/auth/strategies/jwt.strategy.ts`
  - `backend/prisma/schema.prisma`
  - Any file outside above Allowed list

**Important**: The admin strategy/guard will be registered locally within `admin.module.ts` to avoid editing `auth.module.ts` (immutable).

## Tasks (exact)

1. Create governance folder and files (this PR plan + templates).
2. Create `backend/src/modules/admin/admin.module.ts` (module declaration; import OrganizationsModule).
3. Create `backend/src/modules/admin/admin.controller.ts` implementing `POST /api/v2/admin/organizations`:
   - Use `@Controller("api/v2/admin/organizations")`
   - Protect with `@UseGuards(AdminJwtAuthGuard)`
   - Validate request: reject `organizationId` in body
   - Extract or generate `X-Correlation-Id`
   - Populate `performedBy` from request body or req.user.sub (service)
   - Call AdminService.createOrganization(dto, meta)
4. Create `backend/src/modules/admin/admin.service.ts`:
   - Thin adapter that calls OrganizationsService.create(dto)
   - Wrap call with audit via AuditService (or placeholder if audit module absent)
   - Fail-closed: if audit fails, abort and return failure
5. Implement AdminJwtStrategy/Guard files under `src/modules/admin` (register providers in admin.module)
   - Validate S2S JWT via JWKS or public key
   - Require iss/aud/scope: `bassan:admin` or claim `type: 's2s'`
   - Do NOT require `organizationId`
6. Add unit tests for controller and guard in `backend/tests/` (follow project test style).
7. Add a **limited** change to `tests/security/security-linter.spec.ts`:
   - Allow controllers under `/api/v2/admin/*` to use `AdminJwtAuthGuard` **only** if they:
     - explicitly reject `organizationId` from client input; and
     - perform an auditService.logAction call on create success/failure.
   - Document the linter change in `SECURITY_LINTER_PATCH.md`.
8. Preflight, commit only allowed files, run verifications and collect evidence.
9. Open PR with Execution Report & Verification Evidence attached.

## Verification Commands (must be executed by Sonit)

- `cd D:\Basaan os\BassanOs\backend`
- `git status --porcelain`
- `git rev-parse HEAD`
- After edits:
  - `git add <allowed files>` (explicit paths only)
  - `git diff --cached --name-only` (must equal allowed list)
  - `git commit -m "admin: add admin module (admin-safe onboarding endpoint, S2S)"`
- `npx tsc --noEmit` -> PASS
- `npm run lint` -> PASS
- `npx jest backend/tests/security/security-linter.spec.ts` -> PASS
- `npx jest backend/tests/organizations/admin.controller.spec.ts` -> PASS
- Smoke: `curl -i -X POST http://localhost:3000/api/v2/admin/organizations -H "Authorization: Bearer <S2S>" -H "X-Correlation-Id: <id>" -d '<payload>'` -> 201

## Stop Conditions (MANDATORY)

If any of the below occurs → **EXECUTION ABORTED — <reason>**

- `git diff --name-only` shows files outside Allowed list.
- `npx tsc --noEmit` fails due to changing immutable zones (`src/modules/auth/**` etc).
- security-linter fails for reasons that require changing immutable rules (TenantGuard/JwtStrategy).
- Any code accepts `organizationId` from request body/params/headers.
- Any logging or output contains full JWT/S2S token (tokens must be redacted).
- Any change to `prisma/schema.prisma`.

## Approval (Signoff)

- Executor: **********\_**********
- Reviewer (Architecture Board): **********\_**********
- Date/Time: **********\_**********
