# SECURITY LINTER PATCH — Admin Path Exception

## Problem

The current security linter enforces that every protected controller must use `@UseGuards(JwtAuthGuard, TenantGuard)` which blocks a legitimate admin-only controller that must be protected by a **service-to-service (S2S) Admin JWT** (no organizationId, no TenantGuard).

## Proposed change (human description)

Add a **controlled exception** to the linter:

- If controller base path starts with `/api/v2/admin` **or** module name equals `admin`, linter should permit `AdminJwtAuthGuard` **only if**:
  1. The controller rejects `organizationId` from client input (scan code for `if (dto.organizationId)` or DTO field presence).
  2. The controller triggers an audit call for create operations (presence of `auditService.logAction` or similar).
  3. The controller path is exactly under `api/v2/admin/*` (explicit allowlist).

- Add `/api/v2/admin/organizations` to endpoint allowlist for Stage 2+ exception.

## Rationale

- Preserves tenant isolation (organizationId still cannot come from client). :contentReference[oaicite:8]{index=8}
- Keeps guard enforcement intact for all other controllers. :contentReference[oaicite:9]{index=9}
- Makes the exception explicit, auditable and narrow.

## Tests to add

- Linter unit test that asserts admin controller with AdminJwtAuthGuard passes only when conditions (1) and (2) are present.
- Linter test that admin controller without audit or with organizationId in body fails.

## Governance

- This patch must be included in the PR and documented in `PR_101_EXECUTION_REPORT.md`.
- Any future admin endpoints must follow the same pattern and be added to the allowlist explicitly.
