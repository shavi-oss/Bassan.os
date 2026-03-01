# Phase C1 — Core Changelog

Files changed in `BassanOs/backend/src/modules/`:

## 1. `admin/admin.controller.ts`

- **Before:** Only had `POST /api/v2/admin/organizations`.
- **After:** Added 3 exact routes: `PATCH /:id/suspend`, `PATCH /:id/unsuspend`, `PATCH /:id/deactivate`.
- **Why:** `suite-shavi` Platform Admin must be able to securely propagate suspend/unsuspend/delete events to Core so that tenant lifecycle matches Suite DB state.
- **Risk & Rollback:** **Low**. All endpoints strictly protected by `AdminJwtAuthGuard`. Revert commit `47915f6` to rollback.

## 2. `admin/admin.service.ts`

- **Before:** Only had `createOrganization` adapter parsing S2S token claims.
- **After:** Added `suspendOrganization`, `unsuspendOrganization`, and `deactivateOrganization`.
- **Why:** To wrap the core `organizationsService` calls with mandatory, fail-closed `AdminAuditService` logging (both pre- and post-operation).
- **Risk & Rollback:** **Low**. If audit logging fails, the endpoints throw 500s.

## 3. `organizations/organizations.service.ts`

- **Before:** No easy way to update `isActive` from an admin endpoint.
- **After:** Added `setOrgActive(id, isActive)`.
- **Why:** Enables admin service to mutate the tenant's exact status. Uses `_unsafeClient` securely because admin context has no tenant isolation bounds.
- **Risk & Rollback:** **Low**. No DB schema migration was required because `isActive` already existed.
