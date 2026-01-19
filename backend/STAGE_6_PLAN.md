**STATUS: GOVERNANCE (PLANNING-AUTHORIZED ONLY) — NO IMPLEMENTATION**

---

# STAGE 6 — BACKGROUND EXECUTION ENGINE & SCHEDULER RUNTIME

## Executive Summary

Stage 6 implements the background execution engine that activates the asynchronous execution infrastructure created in Stage 5. This stage adds **ONLY** the runtime components necessary to evaluate schedules, process deferred executions, and manage retries—without modifying any Stage 5 data models, API endpoints, or security mechanisms.

**Project:** Bassan.os  
**Stage:** 6 — Background Execution Engine & Scheduler Runtime  
**Status:** PLANNING-AUTHORIZED ONLY  
**Baseline:** Stage 5 (LOCKED & IMMUTABLE at commit 31103f8)  
**Execution Mode:** STRICT · FAIL-CLOSED · IMMUTABLE

---

## Stage Purpose & Positioning

### Relationship to Stage 5

Stage 5 established the data models and API endpoints for asynchronous execution:

- `ScheduledTrigger` — Time-based trigger definitions
- `DeferredExecution` — Pending execution queue
- `ExecutionAttempt` — Immutable attempt audit trail
- API endpoints for CRUD operations and manual retry

**Stage 5 Limitation:** No automatic execution. Schedules and deferred executions can be created and managed via API, but do not automatically execute workflows.

**Stage 6 Purpose:** Add background worker processes to automatically evaluate schedules, process deferred executions, and manage retries.

### Architectural Position

Stage 6 operates as a **runtime activation layer** on top of Stage 5. It does not replace, modify, or extend Stage 5 data models or APIs. Stage 5 remains the canonical interface; Stage 6 provides the background automation.

**Conceptual Flow:**

- Stage 5 provides data models and API endpoints (unchanged)
- Stage 6 provides background workers that read/write Stage 5 models
- Background workers invoke Stage 3 runtime to create workflow instances
- All operations respect tenant isolation via Prisma extension

---

## Scope Definition

### In Scope

The following capabilities are explicitly included in Stage 6:

1. **Background Scheduler Worker**
   - Evaluate scheduled triggers for due execution
   - Create deferred execution records for due schedules
   - Update schedule metadata (last/next execution times)
   - Handle worker lifecycle (startup, shutdown)

2. **Background Executor Worker**
   - Process pending deferred executions
   - Invoke Stage 3 runtime to create workflow instances
   - Record execution attempts (success or failure)
   - Manage retry scheduling with exponential backoff
   - Transition exhausted retries to dead-letter state
   - Handle worker lifecycle (startup, shutdown, claim release)

3. **Cron Expression Validation**
   - Validate cron syntax
   - Validate timezone strings
   - Calculate next execution times
   - Return validation errors

4. **Observability Extensions**
   - Structured logging for all background operations
   - Metrics for worker health and throughput
   - Queue depth monitoring
   - Retry rate tracking
   - Dead-letter queue monitoring

5. **Graceful Lifecycle Management**
   - Worker startup and shutdown coordination
   - In-flight execution claim release
   - Signal handling for graceful termination

### Out of Scope

The following items are explicitly excluded from Stage 6:

1. **External Infrastructure**
   - No Kafka, RabbitMQ, SQS, or similar message brokers
   - No Redis for distributed locking
   - No external cron services
   - All processing is internal to the application

2. **Distributed Coordination**
   - No multi-node scheduler coordination
   - No distributed locks
   - Single-instance workers only (horizontal scaling deferred)

3. **User Interface**
   - No admin panel for schedule monitoring
   - No dashboard for queue visualization
   - API-only management (Stage 5 endpoints unchanged)

4. **Advanced Scheduling Features**
   - No calendar-based scheduling (holidays, business days)
   - No dependency-based scheduling (workflow chaining)
   - No priority-based execution ordering (FIFO only)

5. **Stage 5 Modifications**
   - No changes to `ScheduledTrigger`, `DeferredExecution`, `ExecutionAttempt` models
   - No changes to Stage 5 API endpoints
   - No changes to Stage 5 DTOs or controllers
   - No changes to Stage 5 security configuration

6. **New API Endpoints**
   - No HTTP endpoints added by Stage 6
   - Background workers only (no REST API)

---

## Component Responsibilities

### Scheduler Worker

**Purpose:** Background worker that evaluates schedules and creates deferred executions.

**Responsibilities:**

- Poll `ScheduledTrigger` table for due schedules
- Evaluate cron expressions to determine next execution time
- Create `DeferredExecution` records for due schedules
- Update `ScheduledTrigger` metadata (last/next execution times)
- Respect tenant isolation (process all tenants, enforce boundaries)
- Emit structured logs and metrics

**Constraints:**

- Must be idempotent (safe to restart mid-cycle)
- Must handle clock skew gracefully
- Must not block on individual schedule processing
- Must release resources on shutdown
- Must respect `organizationId` boundaries (no cross-tenant data leakage)

---

### Executor Worker

**Purpose:** Background worker that processes deferred executions and creates workflow instances.

**Responsibilities:**

- Poll `DeferredExecution` table for pending executions
- Claim executions for processing
- Check idempotency before processing
- Invoke Stage 3 runtime to create `WorkflowInstance`
- Record execution attempts with outcomes
- Update `DeferredExecution` status
- Schedule retries for failed executions
- Transition exhausted retries to DEAD_LETTER state
- Emit structured logs and metrics

**Constraints:**

- Must respect retry policies (exponential backoff, max retries)
- Must check idempotency before processing
- Must release claims on shutdown
- Must respect `organizationId` boundaries (no cross-tenant execution)
- Must classify transient vs permanent failures

---

### Cron Validation Service

**Purpose:** Validate cron expressions and calculate next execution times.

**Responsibilities:**

- Validate cron syntax (standard format)
- Validate timezone strings (IANA timezone database)
- Calculate next execution time given current time and timezone
- Return validation errors with clear messages

**Constraints:**

- Must handle invalid input gracefully
- Must support standard cron syntax only (no custom extensions)

---

## Failure Handling Philosophy

### Core Principles

1. **Visible Failures:** Every failure is logged, recorded, and queryable
2. **Bounded Retries:** No infinite retry loops; all retries are capped
3. **Graceful Degradation:** Worker failure does not block synchronous operations
4. **Dead Letter Strategy:** Exhausted retries move to dead letter state, not deleted
5. **No Silent Drops:** Every execution request has a terminal state

### Failure Categories

| Category              | Handling           | Retry Eligible |
| --------------------- | ------------------ | -------------- |
| Transient             | Retry with backoff | Yes            |
| Validation            | Immediate failure  | No             |
| Definition Not ACTIVE | Immediate failure  | No             |
| Tenant Mismatch       | Immediate failure  | No             |
| System Error          | Retry with backoff | Yes (limited)  |

---

## Stage 5 Immutability Commitment

### What Stage 6 Does NOT Change

Stage 6 commits to preserving the following Stage 5 artifacts unchanged:

1. **Schema:**
   - `ScheduledTrigger` model (no new fields, no field modifications)
   - `DeferredExecution` model (no new fields, no field modifications)
   - `ExecutionAttempt` model (no new fields, no field modifications)
   - All enums (DeferredExecutionStatus, ExecutionAttemptStatus)

2. **APIs:**
   - POST /scheduled-triggers
   - GET /scheduled-triggers
   - GET /scheduled-triggers/:id
   - PATCH /scheduled-triggers/:id
   - DELETE /scheduled-triggers/:id
   - GET /deferred-executions
   - GET /deferred-executions/:id
   - GET /deferred-executions/:id/attempts
   - POST /deferred-executions/:id/retry

3. **Behavior:**
   - Stage 5 API endpoints return identical responses
   - Tenant isolation logic unchanged
   - ACTIVE definition enforcement unchanged
   - Manual retry behavior unchanged

4. **Security:**
   - Guard configuration unchanged
   - Tenant context handling unchanged
   - Cross-tenant 404 responses unchanged

### Coexistence Model

Stage 5 and Stage 6 operate cooperatively:

- Stage 5 provides data models and API endpoints (unchanged)
- Stage 6 provides background workers that read/write Stage 5 models
- Both respect tenant isolation via Prisma extension
- No shared mutable state between API layer and background workers

---

## Success Criteria

Stage 6 is considered complete when:

1. Background scheduler evaluates schedules and creates deferred executions
2. Background executor processes deferred executions and creates workflow instances
3. Failed executions are retried per configured policy
4. Exhausted retries are moved to dead letter state
5. Cron expressions are validated
6. All operations are tenant-isolated
7. All executions are observable (logged, metriced)
8. Stage 5 functionality remains unchanged and verified (all Stage 5 tests pass)
9. Stage 4 functionality remains unchanged and verified (all Stage 4 tests pass)
10. All gates pass verification

---

## Document References

- backend/STAGE_5_FINAL_LOCK_DECLARATION.md — Authoritative Stage 5 completion record
- backend/STAGE_5_PLAN.md — Stage 5 technical specification
- backend/STAGE_5_LAWS.md — Stage 5 architectural laws
- backend/STAGE_6_LAWS.md — Stage 6 architectural laws
- backend/STAGE_6_GATES_CHECKLIST.md — Stage 6 execution protocol
- backend/STAGE_6_AUTHORIZATION.md — Stage 6 scope authorization
- backend/STAGE_6_TECHNICAL_DESIGN.md — Stage 6 technical design (non-binding)
- backend/STAGE_6_IMPLEMENTATION_SPEC.md — Stage 6 implementation specification (non-binding)

---

**Document Status:** GOVERNANCE (PLANNING-AUTHORIZED ONLY)  
**Approval Required:** Architecture & Governance Authority  
**Date:** 2026-01-19
