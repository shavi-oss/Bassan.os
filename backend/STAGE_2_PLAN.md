# STAGE 2 IMPLEMENTATION PLAN

## Workflow Definition (Design-Time Only)

**Date**: 2026-01-14
**Architect**: Principal Software Architect + Principal Security Engineer
**Execution Mode**: STRICT · FAIL-CLOSED · IMMUTABLE
**Authority Level**: OVERRIDE

---

## 🚫 ABSOLUTE SCOPE LOCK (NON-NEGOTIABLE)

### ✅ ALLOWED (Design-Time Only)

- **WorkflowDefinition** (DRAFT → ACTIVE → ARCHIVED lifecycle)
- **WorkflowState** (isStart, isEnd)
- **WorkflowTransition** (fromStateId → toStateId)
- **Validation Engine** (Graph reachability, rules)
- **Lifecycle Management** (Activate, Archive)

### ❌ FORBIDDEN (Hard Stop)

- **Runtime Execution**: No WorkflowInstance, No Task execution
- **Logs/Audit**: No Evidence, No Audit Trails
- **Integrations**: No Webhooks, No External calls
- **UI/Admin**: No Admin shortcuts, No UI components
- **Background Jobs**: No Queues, No Cron jobs
- **Stage 3+ Concepts**: No execution logic whatsoever

---

## A) WORK BREAKDOWN (ORDERED TASKS)

### STEP 1: Architectural Guard Rails (BEFORE Business Logic)

**Objective**: Extend security linter to enforce Stage 2 strict scope.

#### Task 1.1: Extend Security Linter (Stage 2)

**File to modify**: `tests/security/security-linter.spec.ts`

**New Rules Enforced**:

- **S2-L1**: `_unsafeClient` is **FORBIDDEN** in `src/modules/workflows/**`
- **S2-L2**: Only allowed new module is `src/modules/workflows/**`
- **S2-L3**: Endpoint Allowlist (Strict 14 endpoints)
- **S2-L4**: All controllers MUST use `@UseGuards(JwtAuthGuard, TenantGuard)`
- **S2-L5**: Prisma access ONLY via `prismaService.client` (tenant-scoped)
- **S2-L6**: Dependency Freeze (No package.json changes)

**Tests Required**:

- `npm run test -- --testPathPattern=security-linter`

---

### STEP 2: Data Model Definition (Design-Time Only)

**Objective**: Define Prisma schema for design-time entities.

#### Task 2.1: Define Prisma Models

**Models**:

1. **WorkflowDefinition**
   - `id`, `name`, `status` (DRAFT/ACTIVE/ARCHIVED), `organizationId`
   - Tenant-scoped
2. **WorkflowState**
   - `id`, `workflowDefinitionId`, `name`, `isStart`, `isEnd`
3. **WorkflowTransition**
   - `id`, `workflowDefinitionId`, `fromStateId`, `toStateId`

**Constraint**: NO runtime fields (e.g., timestamps implying execution, instance references).

---

### STEP 3: WorkflowDefinition Module

**Objective**: CRUD and Lifecycle management.

#### Task 3.1: Create WorkflowsModule

**Files**:

- `src/modules/workflows/workflows.module.ts`
- `src/modules/workflows/workflows.controller.ts`
- `src/modules/workflows/workflows.service.ts`
- `src/modules/workflows/dto/create-workflow.dto.ts`
- `src/modules/workflows/dto/update-workflow.dto.ts`

**Endpoints**:

- `POST /workflows` (Create DRAFT)
- `GET /workflows` (List)
- `GET /workflows/:id` (Get)
- `PATCH /workflows/:id` (Update - DRAFT only)
- `POST /workflows/:id/activate` (Lifecycle - Validates & Activates)
- `POST /workflows/:id/archive` (Lifecycle - Sets ARCHIVED)

**Business Rules**:

- **ACTIVE** workflows are IMMUTABLE.
- **ARCHIVED** workflows are READ-ONLY.
- **Activation** triggers Validation Engine.

---

### STEP 4: Workflow States

**Objective**: Manage states within a workflow definition.

#### Task 4.1: Implement States Endpoints

**Endpoints**:

- `POST /workflows/:id/states` (Create)
- `GET /workflows/:id/states` (List)
- `PATCH /workflows/:id/states/:stateId` (Update)
- `DELETE /workflows/:id/states/:stateId` (Delete)

**Business Rules**:

- Mutations allowed **ONLY** if workflow is DRAFT.
- `isStart`: Exactly one per workflow (validated on activation).
- `isEnd`: At least one per workflow (validated on activation).

---

### STEP 5: Workflow Transitions

**Objective**: Define paths between states.

#### Task 5.1: Implement Transitions Endpoints

**Endpoints**:

- `POST /workflows/:id/transitions` (Create)
- `GET /workflows/:id/transitions` (List)
- `DELETE /workflows/:id/transitions/:transitionId` (Delete)

**Business Rules**:

- Mutations allowed **ONLY** if workflow is DRAFT.
- `fromState` and `toState` MUST belong to the same workflow.
- No cross-definition links.

---

### STEP 6: Validation Engine (CRITICAL)

**Objective**: Ensure workflow integrity before activation.

#### Task 6.1: Build Validation Service

**File**: `src/modules/workflows/workflow-validation.service.ts`

**Validation Checks**:

1. **Graph Reachability**: All states reachable from Start.
2. **Start/End Rules**: Exactly 1 Start, >= 1 End.
3. **Transition Integrity**: No orphan states, no dead ends (except End states).

**Logic**:

- Called by `POST /workflows/:id/activate`.
- If ANY check fails → Throw Error, Block Activation.

---

### STEP 7: Integration & Validation Tests

**Objective**: Verify system behavior and isolation.

#### Task 7.1: Write Integration Tests

**Files**:

- `tests/integration/stage2-workflows.spec.ts`

**Scenarios**:

1. **Tenant Isolation**: Org A cannot access Org B workflows.
2. **Lifecycle Mutations**: Cannot edit ACTIVE workflow.
3. **Validation Gates**: Activation fails for invalid graph.
4. **Security**: Linter rules pass.

---

## B) SECURITY RISK MATRIX

| Area                 | Risk                      | Mitigation      | Verification           |
| -------------------- | ------------------------- | --------------- | ---------------------- |
| **Tenant Isolation** | Cross-org access          | CLS + Prisma    | Integration Tests      |
| **Validation**       | Broken workflow active    | Activation Gate | Validation Tests       |
| **Scope**            | Execution logic creep     | Security Linter | Build Failure          |
| **Mutability**       | Editing ACTIVE definition | Status Checks   | Unit/Integration Tests |

---

## C) FINAL ALLOWLIST (Stage 2)

**Modules**:

- `src/modules/workflows`

**Endpoints**:

- `POST /workflows`, `GET /workflows`
- `GET /workflows/:id`, `PATCH /workflows/:id`
- `POST /workflows/:id/activate`, `POST /workflows/:id/archive`
- `POST /workflows/:id/states`, `GET /workflows/:id/states`
- `PATCH /workflows/:id/states/:stateId`, `DELETE /workflows/:id/states/:stateId`
- `POST /workflows/:id/transitions`, `GET /workflows/:id/transitions`
- `DELETE /workflows/:id/transitions/:transitionId`

---

## D) GATE CONDITION

Stage 2 is **COMPLETE** only if:

- [ ] All tests pass (`npm run test`)
- [ ] Security linter passes (S2-L1 to S2-L6)
- [ ] No scope violations (Design-time only)
- [ ] Documentation delivered (`STAGE_2.md`, `VALIDATION.md`)

---

## 🛑 STOP CONDITION

After completing Stage 2:

- ❌ **DO NOT** start Stage 3.
- ❌ **DO NOT** add execution logic.
- ✅ **WAIT** for explicit Gate 3 approval.

## Multi-Tenancy Doctrine

- CLS for root models
- Relation-based filtering for indirect models
- Parent–child implicit filtering
- This approach is INTENTIONAL, NOT transitional
