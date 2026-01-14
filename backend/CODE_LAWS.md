# Bassan.os Code Laws

## Effective Date: 2026-01-09

## Authority: Principal Software Architect

## Status: ENFORCED

---

## Law 1: organizationId Placement

### Allowed Locations

| Location        | Allowed | Example                                  |
| :-------------- | :------ | :--------------------------------------- |
| JWT payload     | ✅      | `{ sub: userId, organizationId: orgId }` |
| CLS context     | ✅      | `cls.set('orgId', orgId)`                |
| Prisma schema   | ✅      | `organizationId String` field            |
| Database column | ✅      | Foreign key constraint                   |

### Forbidden Locations

| Location           | Forbidden | Why                      |
| :----------------- | :-------- | :----------------------- |
| Request body DTO   | ❌        | Trust boundary violation |
| URL parameter      | ❌        | Easy to tamper           |
| Query string       | ❌        | Easy to tamper           |
| X-Tenant-Id header | ❌        | Spoofable                |
| API response body  | ⚠️ Avoid  | Information leakage      |

---

## Law 2: Data Access Patterns

### Required Pattern (CLS-filtered)

```typescript
// ✅ CORRECT - Uses prisma.client (CLS auto-injects filter)
this.prisma.client.lead.findMany({});
this.prisma.client.lead.create({ data: { ... } });
this.prisma.client.lead.update({ where: { id }, data: { ... } });
```

### Forbidden Patterns

```typescript
// ❌ FORBIDDEN - Manual organizationId filter
this.prisma.lead.findMany({ where: { organizationId: orgId } });

// ❌ FORBIDDEN - Raw SQL query
this.prisma.$queryRaw`SELECT * FROM leads WHERE organization_id = ${orgId}`;

// ❌ FORBIDDEN - Direct prisma access (bypasses CLS)
this.prisma.lead.findMany({}); // Missing .client

// ❌ FORBIDDEN - Accept organizationId from request body
async create(@Body() dto: CreateLeadDto & { organizationId: string }) {}
```

---

## Law 3: Guard Order

### Required Order for Protected Endpoints

```typescript
@UseGuards(JwtAuthGuard, TenantGuard) // Order matters!
@Get('leads')
getLeads() {}
```

| Step | Guard        | Purpose                                    |
| :--- | :----------- | :----------------------------------------- |
| 1    | JwtAuthGuard | Validates JWT signature, sets `req.user`   |
| 2    | TenantGuard  | Sets CLS context from validated `req.user` |

### Forbidden Guard Patterns

```typescript
// ❌ FORBIDDEN - TenantGuard without JwtAuthGuard
@UseGuards(TenantGuard)

// ❌ FORBIDDEN - Wrong order
@UseGuards(TenantGuard, JwtAuthGuard)
```

---

## Law 4: Error Response Codes

| Scenario                     | HTTP Code | Body                        | Rationale            |
| :--------------------------- | :-------- | :-------------------------- | :------------------- |
| Resource not found (own org) | 404       | `{ error: "NOT_FOUND" }`    | Standard             |
| Resource in different org    | **404**   | `{ error: "NOT_FOUND" }`    | Prevents enumeration |
| No token provided            | 401       | `{ error: "UNAUTHORIZED" }` | Auth required        |
| Token valid, no permission   | 403       | `{ error: "FORBIDDEN" }`    | Authz denied         |
| Validation error             | 422       | `{ errors: [...] }`         | Bad input            |

### Critical Rule

> **Cross-tenant access MUST return 404, NOT 403.**
>
> Returning 403 reveals that the resource exists, enabling enumeration attacks.

---

## Law 5: Model Classifications

### Global Models (NOT CLS-filtered)

| Model        | Reason                          |
| :----------- | :------------------------------ |
| Organization | Root entity, no parent org      |
| User         | Cross-org auth checks possible  |
| Role         | Org-scoped but via manual check |
| Permission   | Linked to Role                  |
| UserRole     | Junction table                  |
| RefreshToken | Linked to User                  |

### Tenant-Scoped Models (CLS-filtered)

| Model    | organizationId | Filtered |
| :------- | :------------- | :------- |
| Lead     | Required       | ✅ AUTO  |
| Task     | Required       | ✅ AUTO  |
| (Future) | Required       | ✅ AUTO  |

---

## Law 6: Forbidden Practices

| Practice                          | Punishment             |
| :-------------------------------- | :--------------------- |
| Manual `WHERE organizationId = ?` | Code review rejection  |
| Direct `this.prisma.model` access | Build warning → error  |
| organizationId in DTO             | Type compilation error |
| Trusting X-Tenant-Id header       | Security vulnerability |
| Raw SQL with tenant filtering     | Security vulnerability |

---

## Enforcement Mechanisms

### 1. TypeScript Compilation

DTOs MUST NOT include organizationId - types will fail.

### 2. Code Review Checklist

- [ ] Uses `prisma.client` not `prisma` directly?
- [ ] No manual organizationId filters?
- [ ] Guard order is JwtAuthGuard, TenantGuard?
- [ ] Cross-tenant returns 404 not 403?
- [ ] E2E isolation test added for new model?

### 3. CI/CD Gates

```yaml
# Future: ESLint rule to enforce
- name: Check tenant isolation
  run: |
    grep -r "where.*organizationId" src/modules/ && exit 1 || exit 0
```

---

## Violation Consequences

| Severity | Example                    | Action                              |
| :------- | :------------------------- | :---------------------------------- |
| Critical | Cross-tenant data leak     | Immediate revert, security incident |
| High     | Manual orgId filter        | PR blocked until fixed              |
| Medium   | Missing TenantGuard        | PR requires approval                |
| Low      | organizationId in response | Warning, fix in next sprint         |

---

**Approved by**: Principal Software Architect  
**Date**: 2026-01-09  
**Review Cycle**: Every 90 days
