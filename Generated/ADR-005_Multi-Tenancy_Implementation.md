
# ADR-005: Multi-Tenancy Enforcement Strategy

## Metadata

| Field         | Value                           |
| :------------ | :------------------------------ |
| **ADR ID**    | ADR-005                         |
| **Title**     | Application-Level Multi-Tenancy via CLS |
| **Status**    | ✅ ACCEPTED                     |
| **Date**      | 2026-01-08                      |
| **Deciders**  | Principal Architect               |
| **Consulted** | Tech Lead                       |
| **Informed**  | All team members                |

---

## Context

The Bassan.os project currently has:

- Multi-tenancy requirement in BRD (BR-01)
- organization_id columns in all entities
- Existing implementation uses CLS (Continuation-Local Storage) pattern
- Current PrismaService injects organizationId at application level
- No Row-Level Security (RLS) in database

The current implementation:

1. Uses nestjs-cls for request-scoped storage
2. Injects organizationId into queries via middleware
3. Filters data at application layer, not database layer
4. Allows organizationId to flow through application code

---

## Decision

**We will use application-level multi-tenancy via CLS pattern.**

### Architecture Characteristics

```
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                │
│  ┌─────────────────────────────────────────────┐   │
│  │         PrismaService (CLS-enabled)         │   │
│  │  - Injects orgId into all queries        │   │
│  │  - Filters at application level         │   │
│  └─────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────┐   │
│  │         TenantContextMiddleware            │   │
│  │  - Extracts tenant from JWT           │   │
│  │  - Sets orgId in CLS context        │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   PostgreSQL (Single) │
              │   No RLS policies    │
              └───────────────────────┘
```

### Implementation Details

1. **Tenant Context Middleware**:
   - Extracts organizationId from JWT token
   - Stores in CLS context via ClsService
   - Available throughout request lifecycle

2. **PrismaService Extension**:
   - Extends PrismaClient with CLS integration
   - Automatically injects organizationId into queries
   - Handles create, update, delete operations
   - Filters find operations

3. **Global Models**:
   - Organization, User, Role, Permission, RefreshToken, UserRole
   - These models are not filtered by organizationId
   - Access controlled explicitly

4. **Tenant-Scoped Models**:
   - Lead, Task, and future domain models
   - Automatically filtered by organizationId
   - Cannot access data outside tenant scope

---

## Alternatives Considered

### Option A: Row-Level Security (RLS) — REJECTED

| Pros                 | Cons                      |
| :------------------- | :------------------------ |
| Database-level isolation | Requires database-specific features |
| Cannot be bypassed in app | Complex to implement and debug |
| Automatic filtering | Limited query flexibility |
| | Harder to test |
| | Migration complexity |

**Rejected because**: 
- Current implementation already uses CLS pattern
- CLS provides sufficient isolation for current scale
- RLS would require complete rewrite of existing code
- CLS is easier to test and debug

### Option B: Application-Level via CLS — SELECTED ✅

| Pros              | Cons                       |
| :---------------- | :------------------------- |
| Already implemented | Filtering happens in application |
| Easy to test | Database can be queried directly |
| Easy to debug | Requires developer discipline |
| Database-agnostic | Potential for manual filter errors |
| Flexible | |

**Selected because**: 
- Already implemented in existing code
- Sufficient for current scale (0-10k users)
- Easier to maintain and extend
- Database-agnostic (can switch databases)

---

## Consequences

### Positive

1. **Existing code works** — No rewrite required
2. **Easy to test** — Can verify filtering in unit tests
3. **Database-agnostic** — Can switch to MySQL, etc.
4. **Flexible queries** — No RLS limitations
5. **Debuggable** — Can see filters in application code

### Negative

1. **Application-level filtering** — Not enforced by database
2. **Developer discipline required** — Must use CLS context
3. **Direct database access bypasses filtering** — Risk if using raw SQL
4. **No automatic isolation** — Bugs can cause cross-tenant access
5. **Manual review required** — Must audit code for proper filtering

---

## Enforcement Mechanism

1. **Code Review Rules**:
   - All queries must use PrismaService
   - No raw SQL queries allowed
   - Manual organizationId filters forbidden
   - All tenant-scoped models must use CLS context

2. **Testing Requirements**:
   - Multi-tenant tests for all CRUD operations
   - Cross-tenant access must fail
   - Same-tenant access must succeed
   - Tests must verify CLS context is set

3. **Runtime Guards**:
   - TenantContextMiddleware must set orgId
   - PrismaService must inject filters
   - Guards must verify tenant membership
   - Direct database access forbidden

---

## Failure Modes

1. **CLS context not set** → All data visible (critical)
2. **Manual filter bypass** → Cross-tenant access
3. **Raw SQL queries** → Bypasses all filtering
4. **Developer error** → Wrong organizationId used
5. **Missing CLS middleware** → No filtering applied

---

## Risk if Wrong

1. **Data leak between tenants** — Legal liability
2. **Cross-tenant access** — Security breach
3. **Compliance failure** — Cannot meet BR-01 requirements
4. **System collapse** — Loss of trust
5. **Impossible to detect leaks** — No database-level enforcement

---

## Review Trigger

This decision should be re-evaluated when:

| Trigger                       | Action                               |
| :---------------------------- | :----------------------------------- |
| Monthly active users > 10,000 | Evaluate RLS implementation       |
| Data leak incident occurs      | Immediate migration to RLS       |
| Compliance audit fails         | Implement database-level isolation |
| Direct database access needed   | Re-evaluate approach          |

---

## References

- nestjs-cls documentation
- Continuation-Local Storage pattern
- Application-level multi-tenancy best practices

---

**Approved by**: Principal Architect
**Date**: 2026-01-08
