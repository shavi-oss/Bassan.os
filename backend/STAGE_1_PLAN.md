# STAGE 1 IMPLEMENTATION PLAN

## Tenant & Identity

**Date**: 2026-01-14  
**Architect**: Principal Software Architect + Principal Security Engineer  
**Scope**: Stage 1 Only - Organization, User, Role, Permission, Auth

---

## A) WORK BREAKDOWN (ORDERED TASKS)

### STEP 1: Baseline & Guard Rails (Security Foundation)

**Objective**: Ensure security mechanisms are enforced before any business logic.

#### Task 1.1: Create Security Linter Test

**Files to create**:

- `tests/security/security-linter.spec.ts`

**What it validates**:

- L1: `_unsafeClient` only in: `src/auth/**`, `src/prisma/**`, `scripts/**`
- L2: Indirectly scoped models (Permission/UserRole/RefreshToken) use relation-based filters
- L3: All controllers use `@UseGuards(JwtAuthGuard, TenantGuard)`
- L4: Endpoint allowlist enforcement (only allowed routes)
- L5: Module allowlist enforcement (no new modules outside scope)

**Security Risks**:

- ❌ **Risk**: Developers bypass tenant isolation
- ✅ **Mitigation**: Linter fails build if violations detected

**Tests Required**:

- Linter test itself (self-validating)
- Run: `npm run test -- --testPathPattern=security-linter`

---

#### Task 1.2: Verify Existing Guards

**Files to verify**:

- `src/shared/guards/tenant.guard.ts` (exists)
- `src/modules/auth/guards/jwt-auth.guard.ts` (verify exists)

**What to check**:

- TenantGuard sets CLS context from `request.user.organizationId`
- JwtAuthGuard validates JWT and attaches `request.user`
- Guard order: `@UseGuards(JwtAuthGuard, TenantGuard)` (JWT first, then Tenant)

**Security Risks**:

- ❌ **Risk**: TenantGuard runs before JwtAuthGuard → no user context
- ✅ **Mitigation**: Enforce order in all controllers

**Tests Required**:

- Existing foundation tests should still pass
- Run: `npm run test -- --testPathPattern=foundation`

---

### STEP 2: Auth Core (Login + Me)

**Objective**: Implement authentication endpoints per allowlist.

#### Task 2.1: Verify/Update AuthService

**Files to modify**:

- `src/modules/auth/auth.service.ts` (already exists - verify `login` method)

**What exists**:

- ✅ `login(dto)` - returns JWT with `organizationId` in payload
- ✅ `getProfile(userId)` - returns user profile
- ✅ Uses `_unsafeClient` (justified for auth bootstrap)

**What to verify**:

- JWT payload includes: `{ sub: userId, email, organizationId }`
- Password hashing uses bcrypt
- Returns sanitized user (no `passwordHash`)

**Security Risks**:

- ❌ **Risk**: JWT missing `organizationId` → TenantGuard fails
- ✅ **Mitigation**: Verify payload structure in tests

---

#### Task 2.2: Implement Auth Controller Endpoints

**Files to modify**:

- `src/modules/auth/auth.controller.ts` (exists - verify routes)

**Required Endpoints** (per allowlist):

1. `POST /auth/login` - public (no guards)
2. `GET /auth/me` - protected (`@UseGuards(JwtAuthGuard, TenantGuard)`)

**What to remove** (if exists):

- Any `/auth/register` endpoint (not in allowlist)
- Any `/auth/refresh` endpoint (not in allowlist)
- Any `/auth/logout` endpoint (not in allowlist)

**Security Risks**:

- ❌ **Risk**: `/auth/me` missing TenantGuard → CLS not set → Prisma fails
- ✅ **Mitigation**: Enforce guards, test with missing token

**Tests Required**:

- Login with valid credentials → returns token
- Login with invalid credentials → 401
- `/auth/me` with valid token → returns user
- `/auth/me` with invalid token → 401
- `/auth/me` with missing token → 401

---

#### Task 2.3: Verify JwtStrategy

**Files to verify**:

- `src/modules/auth/strategies/jwt.strategy.ts` (should exist)

**What it must do**:

- Extract JWT payload
- Return `{ userId: payload.sub, email: payload.email, organizationId: payload.organizationId }`
- This becomes `request.user`

**Security Risks**:

- ❌ **Risk**: Strategy doesn't include `organizationId` → TenantGuard fails
- ✅ **Mitigation**: Verify payload structure

---

### STEP 3: Organization Bootstrap

**Objective**: Allow creating organizations and reading own organization.

#### Task 3.1: Create OrganizationsModule

**Files to create**:

- `src/modules/organizations/organizations.module.ts`
- `src/modules/organizations/organizations.controller.ts`
- `src/modules/organizations/organizations.service.ts`
- `src/modules/organizations/dto/create-organization.dto.ts`

**Endpoints** (per allowlist):

1. `POST /organizations` - protected, creates org + admin user + admin role
2. `GET /organizations/:id` - protected, returns org if caller belongs to it

**Business Logic**:

- `POST /organizations`:
  - Creates Organization
  - Creates first User (admin)
  - Creates Admin Role
  - Creates basic Permissions for admin
  - Returns org + user + token
- `GET /organizations/:id`:
  - Checks `request.user.organizationId === params.id`
  - If not → 403 Forbidden
  - If yes → return org

**Security Risks**:

- ❌ **Risk**: User from Org A reads Org B via `/organizations/:orgB_id`
- ✅ **Mitigation**: Explicit check: `if (orgId !== request.user.organizationId) throw Forbidden`

**Tests Required**:

- Create org → success
- User from Org A cannot read Org B → 403

---

#### Task 3.2: Update AppModule

**Files to modify**:

- `src/app.module.ts`

**Changes**:

- Add `OrganizationsModule` to imports
- **REMOVE** `LeadsModule` (out of scope for Stage 1)

---

### STEP 4: Users Management

**Objective**: CRUD for users within tenant scope.

#### Task 4.1: Create UsersModule

**Files to create**:

- `src/modules/users/users.module.ts`
- `src/modules/users/users.controller.ts`
- `src/modules/users/users.service.ts`
- `src/modules/users/dto/create-user.dto.ts`

**Endpoints** (per allowlist):

1. `POST /users` - protected, creates user in caller's org
2. `GET /users` - protected, lists users in caller's org

**Business Logic**:

- `POST /users`:
  - Uses `prismaService.client.user.create(...)` (tenant-scoped)
  - `organizationId` comes from CLS (NOT from DTO)
  - Returns created user
- `GET /users`:
  - Uses `prismaService.client.user.findMany()` (auto-filtered by tenant extension)
  - Returns users in caller's org only

**Security Risks**:

- ❌ **Risk**: Client passes `organizationId` in DTO → injection attack
- ✅ **Mitigation**: Never accept `organizationId` from client; use CLS only
- ❌ **Risk**: Using `_unsafeClient` → cross-tenant read
- ✅ **Mitigation**: Use `prismaService.client` (extended)

**Tests Required**:

- Create user in Org A → success
- List users in Org A → returns only Org A users
- User from Org A cannot list Org B users → verified by tenant extension

---

### STEP 5: Roles & Permissions

**Objective**: Manage roles and permissions within tenant scope.

#### Task 5.1: Create RolesModule

**Files to create**:

- `src/modules/roles/roles.module.ts`
- `src/modules/roles/roles.controller.ts`
- `src/modules/roles/roles.service.ts`
- `src/modules/roles/dto/create-role.dto.ts`
- `src/modules/roles/dto/assign-permissions.dto.ts`

**Endpoints** (per allowlist):

1. `POST /roles` - protected, creates role in caller's org
2. `GET /roles` - protected, lists roles in caller's org
3. `POST /roles/:roleId/permissions` - protected, assigns permissions to role
4. `GET /roles/:roleId/permissions` - protected, lists permissions for role

**Business Logic**:

- `POST /roles`:
  - Uses `prismaService.client.role.create(...)` (tenant-scoped)
  - `organizationId` from CLS
- `GET /roles`:
  - Uses `prismaService.client.role.findMany()` (auto-filtered)
- `POST /roles/:roleId/permissions`:
  - Verifies role belongs to caller's org
  - Creates Permission records
- `GET /roles/:roleId/permissions`:
  - **CRITICAL**: Must use relation-based filter:
    ```typescript
    prismaService.client.permission.findMany({
      where: {
        roleId,
        role: { organizationId: clsService.get("orgId") },
      },
    });
    ```

**Security Risks**:

- ❌ **Risk**: Permission query without relation filter → cross-tenant read
- ✅ **Mitigation**: Security linter enforces relation-based filter (L2)
- ❌ **Risk**: User from Org A assigns permissions to Org B role
- ✅ **Mitigation**: Verify role ownership before assignment

**Tests Required**:

- Create role in Org A → success
- List roles in Org A → returns only Org A roles
- Assign permissions to Org A role → success
- List permissions for Org A role → uses relation filter (verified by linter)
- User from Org A cannot read Org B permissions → verified by relation filter

---

### STEP 6: Integration & Validation

**Objective**: Ensure all pieces work together and pass security checks.

#### Task 6.1: Write Integration Tests

**Files to create**:

- `tests/integration/stage1-auth.spec.ts`
- `tests/integration/stage1-tenant-isolation.spec.ts`

**Test Scenarios**:

1. **Auth Flow**:
   - Login → get token
   - Use token to call `/auth/me` → success
   - Invalid token → 401
2. **Tenant Isolation**:
   - Create Org A, Org B
   - User A logs in
   - User A lists users → only Org A users
   - User A lists roles → only Org A roles
   - User A tries to read Org B org → 403
3. **Permission Relation Filter**:
   - Create role in Org A
   - Assign permissions
   - List permissions → verify query uses relation filter (check logs)

**Tests Required**:

- All integration tests pass
- Security linter passes
- Foundation tests still pass

---

## B) SECURITY ANALYSIS PER TASK

| Task                   | Primary Risk                             | Mitigation                   | Verification              |
| ---------------------- | ---------------------------------------- | ---------------------------- | ------------------------- |
| 1.1 Security Linter    | Linter has false negatives               | Comprehensive regex patterns | Manual code review        |
| 1.2 Guard Verification | Wrong guard order                        | Enforce in all controllers   | Test with missing token   |
| 2.1 AuthService        | JWT missing orgId                        | Verify payload structure     | Integration test          |
| 2.2 Auth Controller    | Missing guards on `/me`                  | Linter enforcement           | Test 401 on missing token |
| 3.1 Organizations      | Cross-tenant org read                    | Explicit orgId check         | Test Org A → Org B read   |
| 4.1 Users              | Client injects orgId                     | Never accept from DTO        | Test injection attempt    |
| 5.1 Roles/Permissions  | Permission query without relation filter | Linter L2 enforcement        | Check query logs          |

---

## C) STOP CHECKLIST

Before declaring Stage 1 complete, verify:

### Scope Compliance

- [ ] No routes outside allowlist (linter enforces)
- [ ] No modules outside: auth, organizations, users, roles, prisma, core, shared
- [ ] No Leads/Tasks/Workflow code added
- [ ] No UI components
- [ ] No external integrations

### Security Compliance

- [ ] All controllers use `@UseGuards(JwtAuthGuard, TenantGuard)`
- [ ] No `_unsafeClient` outside: auth, prisma, scripts
- [ ] Permission queries use relation-based filter
- [ ] RefreshToken has no public listing endpoint
- [ ] Security linter passes

### Functional Compliance

- [ ] Login works
- [ ] `/auth/me` works
- [ ] Create org works
- [ ] Create user works (tenant-scoped)
- [ ] Create role works (tenant-scoped)
- [ ] Assign permissions works
- [ ] List permissions uses relation filter

### Test Compliance

- [ ] All integration tests pass
- [ ] Foundation tests still pass
- [ ] Security linter passes
- [ ] Tenant isolation verified (Org A ≠ Org B)

---

## D) EXPECTED ENDPOINTS (FINAL)

| Method | Path                         | Guards       | Purpose            |
| ------ | ---------------------------- | ------------ | ------------------ |
| POST   | `/auth/login`                | None         | Login              |
| GET    | `/auth/me`                   | JWT + Tenant | Get profile        |
| POST   | `/organizations`             | JWT + Tenant | Create org         |
| GET    | `/organizations/:id`         | JWT + Tenant | Get own org        |
| POST   | `/users`                     | JWT + Tenant | Create user        |
| GET    | `/users`                     | JWT + Tenant | List users         |
| POST   | `/roles`                     | JWT + Tenant | Create role        |
| GET    | `/roles`                     | JWT + Tenant | List roles         |
| POST   | `/roles/:roleId/permissions` | JWT + Tenant | Assign permissions |
| GET    | `/roles/:roleId/permissions` | JWT + Tenant | List permissions   |

**Total**: 10 endpoints (all within allowlist)

---

## E) FILES TO CREATE/MODIFY

### Create

- `tests/security/security-linter.spec.ts`
- `src/modules/organizations/organizations.module.ts`
- `src/modules/organizations/organizations.controller.ts`
- `src/modules/organizations/organizations.service.ts`
- `src/modules/organizations/dto/create-organization.dto.ts`
- `src/modules/users/users.module.ts`
- `src/modules/users/users.controller.ts`
- `src/modules/users/users.service.ts`
- `src/modules/users/dto/create-user.dto.ts`
- `src/modules/roles/roles.module.ts`
- `src/modules/roles/roles.controller.ts`
- `src/modules/roles/roles.service.ts`
- `src/modules/roles/dto/create-role.dto.ts`
- `src/modules/roles/dto/assign-permissions.dto.ts`
- `tests/integration/stage1-auth.spec.ts`
- `tests/integration/stage1-tenant-isolation.spec.ts`
- `STAGE_1.md` (completion report)
- `VALIDATION.md` (test output)
- `CHECKLIST.md` (requirements checklist)

### Modify

- `src/app.module.ts` (add Orgs/Users/Roles modules, remove Leads)
- `src/modules/auth/auth.controller.ts` (verify endpoints match allowlist)

### Verify (no changes unless required)

- `src/modules/auth/auth.service.ts`
- `src/modules/auth/strategies/jwt.strategy.ts`
- `src/shared/guards/tenant.guard.ts`
- `src/modules/auth/guards/jwt-auth.guard.ts`

---

## F) EXECUTION ORDER (STRICT)

1. **Security Linter** (STEP 1.1) → Run immediately
2. **Guard Verification** (STEP 1.2) → Verify existing
3. **Auth Endpoints** (STEP 2) → Verify/update
4. **Organizations Module** (STEP 3) → Create
5. **Users Module** (STEP 4) → Create
6. **Roles Module** (STEP 5) → Create
7. **Integration Tests** (STEP 6) → Validate all
8. **STOP** → Wait for Gate 2

---

**END OF PLAN**

This plan will be followed exactly. Any deviation requires explicit justification.

## Multi-Tenancy Doctrine

- CLS for root models
- Relation-based filtering for indirect models
- Parent–child implicit filtering
- This approach is INTENTIONAL, NOT transitional
