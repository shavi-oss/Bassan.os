# CORE CONTRACT v1 — MINIMAL LOCK DECLARATION

**Status:** � LOCK READY (Pending Commit/Tag)  
**Lock Type:** Minimal Contract Lock (Source-Derived)  
**Lock Date:** 2026-01-31  
**Decision ID:** CORE-CONTRACT-LOCK-V1  
**Git Commit:** `[TO BE FILLED ON COMMIT]`  
**Git Tag:** `core-contract-v1-minimal-lock`

---

## 1) Declaration

This document formally **locks Core Contract v1** as the authoritative integration surface for external layers, suites, and modules.

**Scope:** Minimal Lock (source-derived only)  
**Authority:** Controllers + DTOs + Guards in `backend/src`  
**Exclusions:** OpenAPI/Postman specs (see [SPEC_DRIFT_NOTICE.md](./SPEC_DRIFT_NOTICE.md))

---

## 2) Contract Scope

### In Scope (Binding)

✅ **Global API Prefix:** `/api/v1`  
✅ **Authentication Endpoints:** 2 endpoints (login, me)  
✅ **Workflow Engine Endpoints:** 40 endpoints across 8 controllers  
✅ **Tenant Context Mechanism:** JWT claim `organizationId`, CLS keys (`orgId`, `userId`)  
✅ **Guards:** JwtAuthGuard, TenantGuard  
✅ **Error Behaviors:** Explicit status codes, UnauthorizedException, 404 for cross-tenant

**Total Endpoints:** 42 (41 protected, 1 public)

**Controllers:**

1. AuthController (2 endpoints)
2. WorkflowsController (13 endpoints)
3. WorkflowInstancesController (4 endpoints)
4. WorkflowTriggersController (6 endpoints)
5. ScheduledTriggersController (5 endpoints)
6. DeferredExecutionController (4 endpoints)
7. UsersController (2 endpoints)
8. OrganizationsController (2 endpoints)
9. RolesController (4 endpoints)

### Out of Scope (NOT Guaranteed)

❌ **Correlation ID / Request ID headers** — NOT FOUND in source  
❌ **Template publish endpoints** — NOT FOUND in source  
❌ **Refresh token / Logout endpoints** — NOT FOUND in source  
❌ **Register endpoint** — DTO exists but no controller implementation  
❌ **Any endpoint not in controllers** — Even if in OpenAPI/Postman

---

## 3) Source of Truth

**Authoritative Documents:**

1. [CORE_CONTRACT_V1_EXTRACT.md](./CORE_CONTRACT_V1_EXTRACT.md) — Complete route map, DTOs, guards
2. [CORE_CONTRACT_EVIDENCE_TABLE.md](./CORE_CONTRACT_EVIDENCE_TABLE.md) — File paths + line ranges
3. [CORE_CONTRACT_GO_NO_GO_DECISION.md](./CORE_CONTRACT_GO_NO_GO_DECISION.md) — Decision rationale

**Source Code Reference:**

- Controllers: `backend/src/modules/*/**.controller.ts`
- DTOs: `backend/src/modules/*/dto/**.dto.ts`
- Guards: `backend/src/modules/auth/guards/`, `backend/src/shared/guards/`
- Global Config: `backend/src/main.ts`

**Verification Method:**

```bash
# List all controllers
rg -n "@Controller\(" backend/src

# List all DTOs
find backend/src -name "*.dto.ts"

# Check global prefix
rg -n "setGlobalPrefix\(" backend/src
```

---

## 4) Immutability Rules

### Breaking Changes (FORBIDDEN without new major version)

🚫 Removing any of the 42 endpoints  
🚫 Changing route paths (e.g., `/api/v1/workflows` → `/api/v2/workflows`)  
🚫 Removing required DTO fields  
🚫 Changing JWT claim names (`organizationId`, `sub`, `email`)  
🚫 Changing CLS keys (`orgId`, `userId`)  
🚫 Removing guards from protected endpoints

### Non-Breaking Changes (ALLOWED)

✅ Adding new endpoints  
✅ Adding optional DTO fields  
✅ Adding new guards (if they don't break existing behavior)  
✅ Internal implementation changes (services, repositories)  
✅ Adding new error codes (if they don't replace existing ones)

---

## 5) Verification Evidence

### Static Evidence (COMPLETE)

✅ All 42 endpoints extracted from 9 controllers with line-level evidence  
✅ All DTOs documented with validators  
✅ All guards documented with behavior  
✅ Global prefix confirmed in source  
✅ Tenant context mechanism fully documented

### Stability Verification (COMPLETED)

✅ **Git Status:** Clean (only untracked .resolved files)  
✅ **Build Status:** PASS (`npm run build` exit code 0)  
✅ **Commit:** `[TO BE FILLED ON COMMIT]`

### Runtime Evidence (OPTIONAL for Minimal Lock)

⚠️ Smoke tests not required for Minimal Lock  
⚠️ Required for "Final Lock" (future)

---

## 6) Authentication & Tenant Context

### JWT Authentication

**Mechanism:** JWT Bearer token in `Authorization` header  
**Strategy:** JwtStrategy (Passport)  
**Payload Fields:**

- `sub` (User ID)
- `email` (User email)
- `organizationId` (Tenant/Organization ID)

**req.user Fields:**

- `id` (from `sub`)
- `email`
- `organizationId`

**Source:** [jwt.strategy.ts:L29-L49](file:///d:/Basaan%20os/BassanOs/backend/src/modules/auth/strategies/jwt.strategy.ts#L29-L49)

### Tenant Context

**Source:** JWT claim `organizationId`  
**CLS Keys:**

- `orgId` (set from `req.user.organizationId`)
- `userId` (set from `req.user.id`)

**Request Sanitization:** TenantGuard actively removes manual tenant ID injections from:

- Query parameters
- Request body
- URL parameters

**Source:** [tenant.guard.ts:L56-L124](file:///d:/Basaan%20os/BassanOs/backend/src/shared/guards/tenant.guard.ts#L56-L124)

---

## 7) External Dependencies

### Suite Repos (Separate Repositories)

External suites MUST reference this lock via:

- **Git Tag:** `core-contract-v1-minimal-lock`
- **Governance Doc:** `backend/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`

**Suite-Side Template:**

External suites should create `governance/CORE_DEPENDENCY_LOCK.md`:

```markdown
# CORE DEPENDENCY LOCK

**Suite Name:** [Suite Name]  
**Core Repo:** Bassan.os  
**Core Contract Version:** v1 (Minimal Lock)  
**Core Git Tag:** `core-contract-v1-minimal-lock`  
**Lock Date:** 2026-01-31

## Dependency Declaration

This suite depends on Core Contract v1 as defined in:

- Core Repo: `backend/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`
- Core Tag: `core-contract-v1-minimal-lock`

## Endpoints Used

List only the endpoints this suite actually uses:

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/workflows`
- `GET /api/v1/workflows/:id`
- (etc.)

## NOT USED (Explicitly Out of Scope)

List endpoints this suite does NOT use:

- Correlation ID headers (not supported by Core)
- Template publish endpoints (not supported by Core)
- Refresh/logout endpoints (not supported by Core)

## Verification

Before deploying this suite, verify Core tag:
\`\`\`bash
cd /path/to/core-repo
git tag -l "core-contract\*"
git show core-contract-v1-minimal-lock
\`\`\`
```

---

## 8) Change Log

| Date       | Change                                           | Commit           | Author   |
| ---------- | ------------------------------------------------ | ---------------- | -------- |
| 2026-01-31 | Initial lock (Minimal Contract v1, 42 endpoints) | `[TO BE FILLED]` | [Author] |

---

## 9) Governance Ruling

**This contract is IMMUTABLE for v1.**

Any breaking change requires:

1. New major version (v2)
2. New lock declaration
3. Deprecation period for v1 (if applicable)

**Enforcement:** All PRs touching controllers/DTOs/guards MUST be reviewed against this contract.

---

**END OF LOCK DECLARATION**
