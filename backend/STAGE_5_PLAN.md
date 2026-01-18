# STAGE 5 — ASYNCHRONOUS EXECUTION & DEFERRED AUTOMATION

## Executive Summary

Stage 5 introduces asynchronous execution capabilities to the Bassan.os platform, building upon the Stage 4 trigger foundation without modifying it. This stage enables time-based triggers, deferred execution, retry mechanisms, and idempotent event processing while maintaining strict architectural boundaries and tenant isolation.

**Project:** Bassan.os  
**Stage:** 5 — Asynchronous Execution & Deferred Automation  
**Status:** PLANNING  
**Baseline:** Stage 4 (LOCKED & IMMUTABLE)  
**Execution Mode:** STRICT · FAIL-CLOSED · IMMUTABLE

---

## Stage Purpose & Positioning

### Relationship to Stage 4

Stage 4 established the synchronous workflow trigger system where events immediately create workflow instances. Stage 5 extends this foundation by introducing:

1. **Temporal Decoupling:** Events can be scheduled for future execution
2. **Execution Resilience:** Failed executions can be retried with configurable backoff
3. **Idempotent Processing:** Duplicate events are detected and handled gracefully
4. **Deferred Pipelines:** Execution can be queued and processed asynchronously

Stage 5 operates as an **additive layer** on top of Stage 4. It does not replace, modify, or intercept Stage 4 functionality. Stage 4 remains the canonical synchronous execution path; Stage 5 provides an alternative asynchronous execution path.

### Architectural Position

```
Stage 4 (Synchronous)     Stage 5 (Asynchronous)
      |                          |
  Trigger ──────────────   ScheduledTrigger
      |                          |
  FireEvent ────────────   DeferredExecution
      |                          |
  WorkflowInstance ──────  (same target)
```

Stage 5 introduces new entry points that ultimately produce the same outcome: workflow instances. The difference is timing and resilience, not destination.

---

## Scope Definition

### In Scope

The following capabilities are explicitly included in Stage 5:

1. **Scheduled Trigger Model**
   - New data model for time-based trigger configuration
   - Cron expression support for recurring schedules
   - One-time delayed execution support
   - Timezone-aware scheduling

2. **Deferred Execution Queue**
   - Internal queue for pending executions
   - Priority-based ordering
   - Execution window constraints
   - Queue depth monitoring

3. **Execution Attempt Tracking**
   - Immutable record of each execution attempt
   - Success/failure status
   - Error capture and classification
   - Attempt timing metadata

4. **Retry & Backoff Mechanism**
   - Configurable retry policies
   - Exponential backoff support
   - Maximum attempt limits
   - Dead letter handling for exhausted retries

5. **Idempotency Framework**
   - Idempotency key generation
   - Duplicate detection within configurable window
   - Idempotent response handling
   - Key expiration policy

6. **Scheduler Service**
   - Polling-based execution trigger
   - Clock-based schedule evaluation
   - Batch processing capability
   - Graceful shutdown handling

7. **Observability Extensions**
   - Execution metrics collection
   - Queue depth instrumentation
   - Retry rate monitoring
   - Latency percentile tracking

### Out of Scope

The following items are explicitly excluded from Stage 5:

1. **External Message Brokers**
   - No Kafka, RabbitMQ, SQS, or similar
   - No external queue dependencies
   - All queuing is internal to the application

2. **Distributed Scheduling**
   - No multi-node coordination
   - No distributed locks
   - Single-instance scheduler only

3. **User Interface**
   - No admin panel for schedule management
   - No dashboard for queue monitoring
   - API-only management

4. **External Integrations**
   - No webhook callbacks
   - No third-party notification services
   - No external event sources

5. **Real-Time Streaming**
   - No WebSocket push
   - No server-sent events
   - Polling-only status checks

6. **Stage 4 Modifications**
   - No changes to WorkflowTrigger model
   - No changes to WorkflowTriggerEvent model
   - No changes to trigger endpoints
   - No changes to event firing logic

---

## Component Responsibilities

### ScheduledTrigger Component

**Purpose:** Define time-based execution schedules for workflow instantiation.

**Responsibilities:**

- Store schedule configuration (cron, delay, timezone)
- Reference target workflow definition
- Maintain active/inactive state
- Track last and next execution times
- Enforce tenant isolation

**Constraints:**

- Must reference ACTIVE workflow definitions only
- Must be tenant-scoped (organizationId required)
- Must not modify Stage 4 trigger behavior

### DeferredExecution Component

**Purpose:** Queue and track pending workflow executions.

**Responsibilities:**

- Store execution requests pending processing
- Maintain execution priority
- Track scheduled execution time
- Record execution attempts
- Handle retry scheduling

**Constraints:**

- Immutable once created (append-only updates via attempts)
- Must capture all execution context at creation time
- Must not depend on external queue infrastructure

### ExecutionAttempt Component

**Purpose:** Immutable audit trail of execution attempts.

**Responsibilities:**

- Record attempt timestamp
- Capture success/failure outcome
- Store error details on failure
- Link to parent deferred execution
- Track retry sequence number

**Constraints:**

- Strictly immutable (no updates, no deletes)
- Must capture sufficient context for debugging
- Must not expose sensitive payload data in errors

### SchedulerService Component

**Purpose:** Evaluate schedules and trigger deferred executions.

**Responsibilities:**

- Poll for due scheduled triggers
- Create deferred execution records
- Initiate execution processing
- Handle scheduler lifecycle

**Constraints:**

- Must be idempotent (safe to restart)
- Must handle clock skew gracefully
- Must not block on individual executions

### ExecutorService Component

**Purpose:** Process deferred executions and create workflow instances.

**Responsibilities:**

- Claim pending executions for processing
- Invoke workflow instance creation
- Record execution attempts
- Schedule retries on failure

**Constraints:**

- Must respect retry policies
- Must check idempotency before processing
- Must release claims on shutdown

---

## Execution Model

### Synchronous vs Asynchronous Boundaries

Stage 5 introduces a clear boundary between synchronous API operations and asynchronous background processing:

**Synchronous Operations:**

- Schedule creation, update, deletion
- Deferred execution creation
- Status queries
- Configuration changes

**Asynchronous Operations:**

- Schedule evaluation
- Deferred execution processing
- Retry scheduling
- Dead letter handling

### Processing Flow

1. **Schedule Evaluation:** Scheduler polls for due schedules
2. **Execution Creation:** Deferred execution record created
3. **Execution Claim:** Executor claims pending execution
4. **Instance Creation:** Workflow instance created via existing Stage 3 runtime
5. **Attempt Recording:** Success or failure recorded
6. **Retry Scheduling:** If failed, retry scheduled per policy

### Idempotency Guarantees

Every deferred execution carries an idempotency key. Before processing:

1. Check if key has been successfully processed
2. If processed, return cached result
3. If not processed, proceed with execution
4. On success, mark key as processed

---

## Data Ownership Rules

### Write Ownership

| Component         | Writes To                 | Owned By                    |
| ----------------- | ------------------------- | --------------------------- |
| ScheduledTrigger  | scheduled_triggers table  | ScheduledTriggersService    |
| DeferredExecution | deferred_executions table | DeferredExecutionService    |
| ExecutionAttempt  | execution_attempts table  | ExecutorService             |
| WorkflowInstance  | workflow_instances table  | Stage 3 Runtime (unchanged) |

### Read Access

| Consumer           | May Read                            | May Not Read                |
| ------------------ | ----------------------------------- | --------------------------- |
| SchedulerService   | ScheduledTrigger                    | ExecutionAttempt (directly) |
| ExecutorService    | DeferredExecution, ScheduledTrigger | ScheduledTrigger (write)    |
| StatusQueryService | All Stage 5 models                  | Stage 4 models (directly)   |

### Cross-Stage Data Flow

Stage 5 creates workflow instances by invoking Stage 3 runtime. This is a forward-only dependency:

- Stage 5 MAY call Stage 3 runtime to create instances
- Stage 5 MAY read Stage 4 trigger definitions for reference
- Stage 5 MAY NOT modify Stage 3 or Stage 4 data
- Stage 3/4 have NO knowledge of Stage 5

---

## Failure Handling Philosophy

### Core Principles

1. **Visible Failures:** Every failure is logged, recorded, and queryable
2. **Bounded Retries:** No infinite retry loops; all retries are capped
3. **Graceful Degradation:** Scheduler failure does not block synchronous operations
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

### Retry Policy

Default retry configuration:

- Maximum attempts: 3
- Backoff strategy: Exponential
- Initial delay: 1 second
- Maximum delay: 5 minutes
- Jitter: 10%

---

## Stage 4 Immutability Commitment

### What Stage 5 Does NOT Change

Stage 5 commits to preserving the following Stage 4 artifacts unchanged:

1. **Schema:**
   - WorkflowTrigger model
   - WorkflowTriggerEvent model

2. **APIs:**
   - POST /workflow-triggers
   - GET /workflow-triggers
   - GET /workflow-triggers/:id
   - PATCH /workflow-triggers/:id
   - POST /workflow-triggers/events
   - GET /workflow-triggers/events/:id

3. **Behavior:**
   - Synchronous event firing
   - Immediate instance creation
   - Tenant isolation logic
   - ACTIVE definition enforcement

4. **Security:**
   - Guard configuration
   - Tenant context handling
   - Cross-tenant 404 responses

### Coexistence Model

Stage 4 and Stage 5 operate independently:

- Stage 4 triggers fire synchronously (unchanged)
- Stage 5 scheduled triggers fire asynchronously (new)
- Both create workflow instances via Stage 3 runtime
- No shared mutable state between Stage 4 and Stage 5

---

## Success Criteria

Stage 5 is considered complete when:

1. Scheduled triggers can be created, queried, updated, and deactivated
2. Schedules are evaluated and deferred executions created
3. Deferred executions are processed and workflow instances created
4. Failed executions are retried per configured policy
5. Exhausted retries are moved to dead letter state
6. All operations are tenant-isolated
7. All executions are observable (logged, metriced)
8. Stage 4 functionality remains unchanged and verified
9. All gates pass verification

---

## Document References

- STAGE_4_LOCK_DECLARATION.md — Authoritative Stage 4 completion record
- STAGE_4_PLAN.md — Stage 4 technical specification
- STAGE_4_LAWS.md — Stage 4 architectural laws
- STAGE_5_LAWS.md — Stage 5 architectural laws
- STAGE_5_GATES_CHECKLIST.md — Stage 5 execution protocol
- STAGE_5_AUTHORIZATION.md — Stage 5 scope authorization

---

**Document Status:** FINAL  
**Approval Required:** Architecture & Governance Authority  
**Date:** 2026-01-18
