# CORE CONTRACT LOCK DECISION — Go/No-Go

**Project:** Bassan.os (Core Engine)  
**Decision ID:** CORE-CONTRACT-LOCK-V1  
**Date:** 2026-01-31  
**Reference Commit/Tag:** _(املأ tag/commit)_

---

## 1) Decision Statement

We are deciding whether to **lock Core Contract v1** as the authoritative integration surface for external layers/suites.

---

## 2) Scope of Contract v1 (MUST be explicit)

### In scope (allowed to be depended on):

✅ **Global API prefix/versioning mechanism:**

- Global prefix: `/api/v1`
- Source: [main.ts:L21](file:///d:/Basaan%20os/BassanOs/backend/src/main.ts#L21)

✅ **Authentication endpoints:**

- `POST /api/v1/auth/login` (LoginDto)
- `GET /api/v1/auth/me` (JwtAuthGuard + TenantGuard)

✅ **Tenant context propagation mechanism:**

- JWT claim name: `organizationId` (in payload)
- CLS keys: `orgId`, `userId`
- Source: [jwt.strategy.ts:L29-L49](file:///d:/Basaan%20os/BassanOs/backend/src/modules/auth/strategies/jwt.strategy.ts#L29-L49), [tenant.guard.ts:L56-L57](file:///d:/Basaan%20os/BassanOs/backend/src/shared/guards/tenant.guard.ts#L56-L57)

✅ **Workflow engine endpoints:**

- All endpoints from `workflows.controller.ts` (13 endpoints)
- All endpoints from `workflow-instances.controller.ts` (4 endpoints)
- All endpoints from `workflow-triggers.controller.ts` (6 endpoints)
- All endpoints from `scheduled-triggers.controller.ts` (5 endpoints)
- All endpoints from `deferred-execution.controller.ts` (4 endpoints)

✅ **Error/status code behaviors explicitly defined in code:**

- `HttpStatus.OK` for login endpoint (explicit `@HttpCode`)
- `UnauthorizedException` for invalid auth
- 404 for cross-tenant access (not 403) - documented in workflow-instances.controller.ts

### Out of scope (explicitly NOT guaranteed by Core):

❌ **Any endpoint not present in controllers** (even if present in OpenAPI/Postman)

❌ **Template publish capability** (unless present in controllers) — NOT FOUND in source

❌ **Correlation ID header support** (unless present in middleware/interceptors/guards) — NOT FOUND in source

❌ **Refresh/logout endpoints** (unless present in controllers) — NOT FOUND in auth.controller.ts

---

## 3) Gate Criteria (Pass/Fail)

### 3.1 Source-of-truth alignment

- ✅ **Controllers Route Map** extracted from `backend/src` with full paths (including global prefix).
- ✅ **DTO schemas** for each endpoint extracted (request body fields + validators).
- ✅ **Guards per endpoint** extracted (JwtAuthGuard/TenantGuard etc.).
- ⚠️ **Spec artifacts** (Generated/openapi.yaml, Postman) status: NOT VERIFIED
  - **Action Required:** Any Spec artifacts that disagree with source must be marked as: **SPEC DRIFT / NOT IMPLEMENTED** and are NOT part of contract.

**Fail Condition:** If any contract endpoint cannot be proven by explicit controller code.  
**Current Status:** ✅ PASS (all endpoints proven by source)

### 3.2 Stability requirements

- ⚠️ **No pending stage/patch** that will change routes/DTOs/claims for the selected reference.
  - **Action Required:** Verify git status and confirm no uncommitted changes
- ✅ **Multi-tenant enforcement evidence** exists (TenantGuard + CLS).
- ⚠️ **Build passes** on the reference commit/tag.
  - **Action Required:** Run `npm run build` to verify

**Fail Condition:** Unstable reference (moving target).  
**Current Status:** ⚠️ PENDING VERIFICATION

### 3.3 Runtime evidence (optional but recommended)

- ⚠️ **Smoke run evidence** (login → me → workflow create/read) OR documented reason it cannot be run (e.g., missing DB).

**Fail Condition:** Not required for Minimal Lock if static evidence is complete; required for "Final Lock".  
**Current Status:** ⚠️ OPTIONAL (Minimal Lock can proceed without this)

---

## 4) Decision Options

### Option A — GO: Lock Minimal Core Contract v1 (Source-derived)

**Proceed if:**

- ✅ Controllers+DTO+Guards extraction is complete and consistent.
- ✅ Spec drift is explicitly excluded from contract.

**Deliverables:**

1. `CORE_CONTRACT_V1.md` (source-derived)
2. `CORE_CONTRACT_EVIDENCE_TABLE.md` (paths + line ranges + snippets)
3. `CORE_CONTRACT_LOCK_DECLARATION.md`

### Option B — NO-GO: Do not lock (reasons must be explicit)

**Choose NO-GO if any of these are true:**

- ❌ Spec drift cannot be resolved or excluded safely.
- ❌ Controllers evidence is incomplete.
- ❌ Reference commit/tag is not stable.

**Required Output on NO-GO:**

- "Blocking Gaps List" (each gap mapped to file evidence)
- Next authorized path (docs-only patch / new stage / scope decision)

---

## 5) Final Decision

**Decision:** ☐ GO (Minimal Lock) ☐ NO-GO

**Signed by:** _(Owner / Governance Authority)_

**Notes:**

- Template publish capability: OUT OF CORE SCOPE (not found in controllers)
- Correlation ID support: OUT OF CORE SCOPE (not found in source)
- Refresh/logout endpoints: OUT OF CORE SCOPE (not found in auth.controller.ts)

**Blocking Items Before GO:**

1. Verify git status (no uncommitted changes)
2. Run `npm run build` to confirm build passes
3. Verify/exclude any OpenAPI/Postman spec drift

**Recommended Next Steps:**

1. Review `CORE_CONTRACT_V1.md` and `CORE_CONTRACT_EVIDENCE_TABLE.md`
2. Complete stability verification (git status + build)
3. Make GO/NO-GO decision
4. If GO: Create `CORE_CONTRACT_LOCK_DECLARATION.md` and tag commit
