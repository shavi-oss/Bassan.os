This document supersedes any informal instructions for Stage 3 execution.

# STAGE 3 IMPLEMENTATION PLAN
STAGE 3 — EXECUTION & SAFETY LAWS

Status: ENFORCED
Execution Mode: STRICT · FAIL-CLOSED · IMMUTABLE
Scope: Stage 3 (Workflow Runtime Only)

These laws are binding for Stage 3 execution and apply to all AI agents, developers, reviewers, and CI processes.

LAW S3-01 — Stage Boundary & Immutability Enforcement

RULE
During Stage 3, all artifacts from Stage 0, Stage 1, and Stage 2 are STRICTLY IMMUTABLE.

FORBIDDEN
Any modification (direct or indirect) to files under:

backend/src/core/**
backend/src/shared/**
backend/src/modules/auth/**
backend/src/modules/organizations/**
backend/src/modules/users/**
backend/src/modules/roles/**
backend/src/modules/workflows/**


ENFORCEMENT

Security linter MUST fail if any diff is detected in the above paths.

CI MUST block merge immediately on violation.

FAIL CONDITION
Any detected modification → BUILD FAIL · EXECUTION HALT

LAW S3-02 — Runtime Scope Lock (Minimal Core Only)

RULE
Stage 3 implementation is limited to runtime execution only of workflows.

ALLOWED CONCEPTS ONLY

WorkflowInstance

WorkflowExecutionLog (immutable, append-only)

Runtime lifecycle: Start → Transition → Complete / Fail

Optimistic locking (version-based concurrency)

FORBIDDEN

Tasks

Evidence

Audit frameworks beyond execution log

Background jobs / queues / cron

Timers or delayed execution

UI / Frontend

Integrations / Webhooks / External APIs

Any new business domains

ENFORCEMENT

Linter scans for forbidden model names, fields, and dependencies.

FAIL CONDITION
Any forbidden concept introduced → BUILD FAIL

LAW S3-03 — Module & Controller Surface Freeze

RULE
Only ONE new module is permitted in Stage 3.

ALLOWED MODULE

backend/src/modules/workflow-instances/**


ALLOWED CONTROLLERS
Only controllers inside the allowed module and exposing only the following endpoints:

POST /workflow-instances
GET  /workflow-instances/:id
POST /workflow-instances/:id/transition
GET  /workflow-instances/:id/history


FORBIDDEN

Any additional module

Any additional controller

Any additional endpoint (even if “harmless”)

ENFORCEMENT

Security linter scans @Module() and @Controller() declarations.

Endpoint allowlist validation.

FAIL CONDITION
Any unauthorized module, controller, or endpoint → BUILD FAIL

LAW S3-04 — Mandatory Guard Enforcement

RULE
Every Stage 3 endpoint MUST be protected with guards in the exact order below:

@UseGuards(JwtAuthGuard, TenantGuard)


FORBIDDEN

Missing guards

Different guard order

Custom guards

Public endpoints

ENFORCEMENT

AST scan on all controller handlers.

FAIL CONDITION
Missing or incorrect guard enforcement → BUILD FAIL

LAW S3-05 — Prisma Access Firewall

RULE
All database access in Stage 3 MUST go through:

prismaService.client
prismaService.client.$transaction()


FORBIDDEN

this.prisma.<model>

this.prisma.$transaction

_unsafeClient

Raw SQL

Manual organizationId filters

RATIONALE
Preserves CLS-based tenant isolation and prevents bypass of security extension.

ENFORCEMENT

Linter scans for forbidden Prisma access patterns.

FAIL CONDITION
Any forbidden Prisma usage → BUILD FAIL

LAW S3-06 — Tenant Isolation & Enumeration Protection

RULE

All runtime data MUST be tenant-scoped.

Cross-tenant access MUST behave as non-existent resources.

MANDATORY BEHAVIOR

Accessing another tenant’s WorkflowInstance or history → 404 NOT FOUND

Never return 403 for cross-tenant data.

ENFORCEMENT

Integration tests

Security linter validation of error handling patterns

FAIL CONDITION
Returning 403 or leaking existence → SECURITY VIOLATION · BUILD FAIL

LAW S3-07 — Transaction & State Machine Integrity

RULE
All workflow transitions MUST be executed atomically.

MANDATORY

Use a single transaction for:

State transition

Version increment

Execution log append

Validate transition strictly against Stage 2 WorkflowDefinition graph.

Transitions allowed ONLY from RUNNING state.

FORBIDDEN

Partial updates

Skipping validation

Manual state mutation

ENFORCEMENT

Code review + integration tests

Linter pattern checks for transactional boundaries

FAIL CONDITION
Non-atomic or invalid transitions → BUILD FAIL

LAW S3-08 — Gate-Controlled Execution

RULE
Stage 3 MUST be executed strictly by gates, in order.

MANDATORY GATE ORDER

Gate 0 — Clean Baseline

Gate 1 — Security Linter Extension

Gate 2 — Prisma Runtime Models

Gate 3 — Runtime Module Implementation

Gate 4 — Integration Tests

FORBIDDEN

Skipping gates

Executing future gates early

Writing runtime code before linter enforcement

ENFORCEMENT

Human + AI execution discipline

CI verification

FAIL CONDITION
Gate violation → EXECUTION HALT

LAW S3-09 — Test Gate Allowlist

RULE
Only the following tests are considered blocking gates in Stage 3:

npm run build

security-linter

stage3-execution integration tests

NON-BLOCKING

Penetration tests

Legacy e2e tests

Future-stage test suites

ENFORCEMENT

CI documentation and execution rules

FAIL CONDITION
Blocking execution due to non-gate tests → PROCESS VIOLATION

FINAL DECLARATION

These laws are:

Stage-specific

Non-negotiable

Fail-closed

Binding for AI and humans

Any violation MUST immediately halt execution and be reported before proceeding.
## Workflow Execution (Runtime)
------------------------------------------
**Date**: 2026-01-14
**Architect**: Principal Software Architect + Principal Security Engineer
**Execution Mode**: STRICT · FAIL-CLOSED · IMMUTABLE
**Authority Level**: OVERRIDE

---

## 🚫 ABSOLUTE SCOPE LOCK (NON-NEGOTIABLE)

### ✅ ALLOWED (Runtime Minimal Core)

- **WorkflowInstance**: Represents a running execution of a WorkflowDefinition.
- **WorkflowExecutionLog**: Immutable history of transitions (Audit Lite).
- **Runtime Lifecycle**: Start → Transition → Complete/Fail.
- **State Machine Engine**: Enforces valid transitions defined in Stage 2.
- **Concurrency Control**: Optimistic locking for state transitions.

### ❌ FORBIDDEN (Hard Stop)

- **Modifying Stage 0-2 Artifacts**: `auth`, `organizations`, `users`, `roles`, `workflows` modules are IMMUTABLE.
- **UI / Frontend**: No UI components.
- **Integrations**: No webhooks, no external API calls.
- **Background Jobs**: No Redis, no BullMQ, no Cron (deferred to Gate 4).
- **Complex Orchestration**: No parallel branches, no sub-workflows, no timers.
- **New Dependencies**: No `package.json` changes (S3-L6).

---

## A) WORK BREAKDOWN (ORDERED TASKS)

### STEP 1: Architectural Guard Rails (Linter First)

**Objective**: Extend security linter to enforce Stage 3 isolation and immutable history.

#### Task 1.1: Extend Security Linter (Stage 3)

**File to modify**: `src/security/security-linter.spec.ts`

**New Rules Enforced**:

- **S3-L1**: `_unsafeClient` FORBIDDEN in `src/modules/workflow-instances/**`.
- **S3-L2**: Module allowlist extended (add `workflow-instances` ONLY).
- **S3-L3**: Endpoint allowlist (Strict Stage 3 endpoints).
- **S3-L4**: Guards mandatory (`JwtAuthGuard`, `TenantGuard`).
- **S3-L5**: Prisma access via `prismaService.client` (tenant-scoped).
- **S3-L6**: Dependency Freeze (maintained).
- **S3-L7**: **IMMUTABILITY CHECK** — Fail if any file in `src/modules/workflows`, `src/modules/auth`, etc. is modified.

**Tests Required**:

- `npm run test -- --testPathPattern=security-linter`

---

### STEP 2: Data Model Definition (Runtime)

**Objective**: Define minimal runtime schema without touching design-time tables.

#### Task 2.1: Define Prisma Models

**New Models**:

1. **WorkflowInstance**
   - `id`, `workflowDefinitionId`, `currentStateId`
   - `status` (RUNNING | COMPLETED | FAILED)
   - `context` (JSON, nullable - for minimal data passing)
   - `organizationId` (Tenant Scoped)
   - `version` (Int - for optimistic locking)
2. **WorkflowExecutionLog** (Immutable History)
   - `id`, `workflowInstanceId`, `fromStateId`, `toStateId`
   - `triggeredById` (User), `timestamp`
   - `organizationId`

**Constraint**:

- Design-time models (`WorkflowDefinition`) remain UNTOUCHED.
- No cross-tenant relations.

---

### STEP 3: Workflow Instances Module

**Objective**: Runtime execution engine.

#### Task 3.1: Create WorkflowInstancesModule

**Files**:

- `backend/src/modules/workflow-instances/workflow-instances.module.ts`
- `backend/src/modules/workflow-instances/workflow-instances.controller.ts`
- `backend/src/modules/workflow-instances/workflow-instances.service.ts`
- `backend/src/modules/workflow-instances/workflow-engine.service.ts` (The Brain)
- `backend/src/modules/workflow-instances/dto/initiate-workflow.dto.ts`
- `backend/src/modules/workflow-instances/dto/transition-workflow.dto.ts`

**Endpoints**:

- `POST /workflow-instances` (Start a new instance from ACTIVE definition)
- `GET /workflow-instances/:id` (Get instance status)
- `POST /workflow-instances/:id/transition` (Move to next state)
- `GET /workflow-instances/:id/history` (Get execution log)

**Business Logic (The Engine)**:

1. **Instantiation**:
   - Verify Definition is `ACTIVE`.
   - Verify Start State exists.
   - Create Instance pointing to Start State.
   - Log creation.
2. **Transition**:
   - Input: `instanceId`, `transitionId` (or `targetStateId`).
   - Verify Instance is `RUNNING`.
   - Verify Transition is valid (exists in Definition & connects `currentState` to `targetState`).
   - Atomic Transaction:
     - Update Instance `currentStateId`.
     - Update `version` (+1).
     - Check `isEnd` state → if yes, set status `COMPLETED`.
     - Create `WorkflowExecutionLog`.
   - Return new state.

---

### STEP 4: Integration & Safety Tests

**Objective**: Verify runtime correctness and isolation.

#### Task 4.1: Write Integration Tests

**File**: `tests/integration/stage3-execution.spec.ts`

**Scenarios**:

1. **Happy Path**: Start -> Transition -> Complete.
2. **Invalid Transition**: Try to jump to unconnected state -> 400 Bad Request.
3. **Invalid Lifecycle**: Try to start from DRAFT definition -> 400.
4. **Tenant Isolation**: User A cannot transition User B's instance.
5. **Optimistic Locking**: Concurrent transitions detected.

---

## B) SECURITY RISK MATRIX

| Area                  | Risk                | Mitigation                                | Verification      |
| --------------------- | ------------------- | ----------------------------------------- | ----------------- |
| **State Integrity**   | Invalid jumps       | Engine validates against Definition graph | Unit Tests        |
| **Concurrency**       | Race conditions     | Optimistic Locking (`version` check)      | Integration Tests |
| **Tenant Leak**       | Cross-org execution | CLS + Tenant Guard                        | Integration Tests |
| **History Tampering** | Altering logs       | `WorkflowExecutionLog` is append-only     | Code Review       |
| **Stage Drift**       | Modifying Stage 2   | S3-L7 Immutability Rule                   | Security Linter   |

---

## C) FINAL ALLOWLIST (Stage 3)

**Modules**:

- `workflow-instances` (NEW)
- (Plus all Stage 0-2 modules)

**Endpoints** (New Only):

- `POST /workflow-instances`
- `GET /workflow-instances/:id`
- `POST /workflow-instances/:id/transition`
- `GET /workflow-instances/:id/history`

---

## D) GATE CONDITIONS (Definition of Done)

Stage 3 is **COMPLETE** only if:

- [ ] All tests pass.
- [ ] Security linter passes (including S3-L7 immutability check).
- [ ] No changes to Stage 0, 1, or 2 code files.
- [ ] Execution Engine enforces Stage 2 definition constraints strictly.

---

## E) STOP CONDITIONS (Gate 4 Triggers)

- ❌ DO NOT implement automated triggers (time-based, event-based).
- ❌ DO NOT implement external webhooks (Outbound).
- ❌ DO NOT implement visual definition builder.

---

## F) DIFF SAFETY

| Artifact                            | Status     | Rule                       |
| ----------------------------------- | ---------- | -------------------------- |
| `src/modules/auth/**`               | **LOCKED** | NO CHANGES ALLOWED         |
| `src/modules/organizations/**`      | **LOCKED** | NO CHANGES ALLOWED         |
| `src/modules/workflows/**`          | **LOCKED** | NO CHANGES ALLOWED         |
| `prisma/schema.prisma`              | **OPEN**   | Additive ONLY (New models) |
| `package.json`                      | **FROZEN** | NO CHANGES ALLOWED         |
| `src/modules/workflow-instances/**` | **NEW**    | Implementation Allowed     |

---

## G) APPROVAL CHECKLIST

- [ ] Does this plan respect the IMMUTABILITY of Stage 2?
- [ ] Is the scope minimal (Core State Machine only)?
- [ ] Are security linter extensions defined FIRST?
- [ ] Is tenant isolation enforced for runtime entities?
