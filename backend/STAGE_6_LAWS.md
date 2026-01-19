**STATUS: GOVERNANCE (PLANNING-AUTHORIZED ONLY) — NO IMPLEMENTATION**

---

# STAGE 6 — ARCHITECTURAL LAWS

## Preamble

This document establishes the non-negotiable architectural laws governing Stage 6 of the Bassan.os platform. These laws are binding constraints that must be enforced during all phases of Stage 6 execution. Violation of any law constitutes a governance breach and requires immediate remediation.

**Project:** Bassan.os  
**Stage:** 6 — Background Execution Engine & Scheduler Runtime  
**Authority:** Architecture & Governance Authority  
**Enforcement Level:** MANDATORY  
**Execution Mode:** STRICT · FAIL-CLOSED · IMMUTABLE

---

## Law Categories

Laws are organized into the following categories:

- **S6-I:** Immutability Laws (Stage 0-5 preservation)
- **S6-T:** Tenant Isolation Laws
- **S6-E:** Execution Laws (background processing)
- **S6-F:** Failure Handling Laws
- **S6-O:** Observability Laws
- **S6-L:** Lifecycle Management Laws

---

## Immutability Laws (S6-I)

### S6-I1: Stage 0-5 Artifact Immutability

**Statement:** No Stage 6 implementation may modify, delete, or alter the behavior of any Stage 0, 1, 2, 3, 4, or 5 artifact.

**Scope:**

- Database schema (Prisma schema models)
- API endpoints (routes, controllers, DTOs)
- Service implementations
- Security configurations
- Test specifications
- Governance documents

**Enforcement:** Security linter must verify no Stage 0-5 files are modified during Stage 6 execution.

**Violation Consequence:** Immediate gate failure; rollback required.

---

### S6-I2: Stage 5 API Contract Preservation

**Statement:** All Stage 5 API endpoints must continue to function identically after Stage 6 completion.

**Affected Endpoints:**

- POST /scheduled-triggers
- GET /scheduled-triggers
- GET /scheduled-triggers/:id
- PATCH /scheduled-triggers/:id
- DELETE /scheduled-triggers/:id
- GET /deferred-executions
- GET /deferred-executions/:id
- GET /deferred-executions/:id/attempts
- POST /deferred-executions/:id/retry

**Enforcement:** Stage 5 integration tests must pass without modification during Stage 6 verification.

**Violation Consequence:** Stage 6 cannot be completed; blocking defect.

---

### S6-I3: Stage 5 Data Model Immutability

**Statement:** Stage 6 must not add fields, remove fields, or modify constraints on any Stage 5 data model.

**Protected Models:**

- ScheduledTrigger
- DeferredExecution
- ExecutionAttempt
- DeferredExecutionStatus (enum)
- ExecutionAttemptStatus (enum)

**Enforcement:** Schema diff verification during Gate 2; Prisma migration review.

**Violation Consequence:** Immediate gate failure; design revision required.

---

### S6-I4: No Implicit Stage 5 Dependencies

**Statement:** Stage 6 must not introduce implicit runtime dependencies that alter Stage 5 execution paths.

**Prohibited Patterns:**

- Middleware that intercepts Stage 5 requests
- Event listeners that modify Stage 5 behavior
- Database triggers affecting Stage 5 tables
- Shared mutable state between Stage 5 API and Stage 6 workers

**Enforcement:** Code review and architectural audit during Gate 3.

**Violation Consequence:** Design revision required before proceeding.

---

## Tenant Isolation Laws (S6-T)

### S6-T1: Background Worker Tenant Boundary Enforcement

**Statement:** All background workers (SchedulerService, ExecutorService) must enforce tenant isolation when processing records.

**Requirements:**

- All database queries must include `organizationId` filter
- Batch processing must respect tenant boundaries
- No cross-tenant data leakage in logs or metrics
- Tenant context must be established for each processed record

**Enforcement:** Code review; integration testing; penetration testing.

**Violation Consequence:** Security vulnerability; immediate gate failure.

---

### S6-T2: Tenant Context Propagation

**Statement:** When background workers invoke Stage 3 runtime to create workflow instances, the correct `organizationId` must be propagated via CLS context.

**Requirements:**

- Establish CLS context before invoking Stage 3 runtime
- Use `organizationId` from `DeferredExecution` record
- Verify tenant context is correctly set
- No hardcoded or default `organizationId` values

**Enforcement:** Unit tests; integration tests; code review.

**Violation Consequence:** Cross-tenant execution risk; immediate gate failure.

---

### S6-T3: Scheduler Tenant Isolation

**Statement:** The scheduler service must process schedules for all tenants but must never leak data across tenant boundaries.

**Requirements:**

- Query schedules with tenant-scoped Prisma client (automatic filtering)
- Log tenant ID with every schedule evaluation
- Metrics must be aggregated by tenant
- No global state shared across tenant processing

**Enforcement:** Code review; log verification; metrics verification.

**Violation Consequence:** Data breach risk; immediate remediation required.

---

## Execution Laws (S6-E)

### S6-E1: Idempotent Background Processing

**Statement:** All background processing must be idempotent. Processing the same record multiple times must produce the same outcome without side effects.

**Requirements:**

- Check idempotency key before processing `DeferredExecution`
- Handle duplicate schedule evaluations gracefully
- Ensure retry processing is idempotent
- Use database constraints to prevent duplicate processing

**Enforcement:** Unit tests; duplicate scenario integration tests; chaos testing.

**Violation Consequence:** Data corruption risk; gate failure.

---

### S6-E2: Bounded Execution Time

**Statement:** Individual execution processing must complete within a defined timeout. Executions exceeding the timeout must be marked as failed and eligible for retry.

**Default Timeout:** 30 seconds per execution attempt

**Requirements:**

- Timeout enforcement in `ExecutorService`
- Graceful cancellation on timeout
- Accurate timeout recording in `ExecutionAttempt` log
- Timeout failures are retriable (transient)

**Enforcement:** Load testing; timeout scenario testing.

**Violation Consequence:** Resource exhaustion risk; design revision required.

---

### S6-E3: No Blocking Operations in Polling Loops

**Statement:** Polling loops in `SchedulerService` and `ExecutorService` must not block on individual record processing.

**Prohibited Patterns:**

- Synchronous blocking calls in polling loop
- Long-running operations without timeout
- Unbounded batch processing

**Required Pattern:**

- Process records in batches with size limits
- Use async/await with timeout
- Continue polling even if individual records fail

**Enforcement:** Code review; performance testing.

**Violation Consequence:** Service degradation; design revision required.

---

### S6-E4: Claim Release on Shutdown

**Statement:** All in-flight execution claims must be released when the executor service shuts down.

**Requirements:**

- Implement `OnModuleDestroy` hook
- Query for `DeferredExecution` records with `status = PROCESSING`
- Revert status to `PENDING` for uncompleted executions
- Log claim release for audit

**Enforcement:** Shutdown scenario testing; integration tests.

**Violation Consequence:** Orphaned executions; gate failure.

---

### S6-E5: Retry Policy Enforcement

**Statement:** Retry processing must strictly follow the configured retry policy. No hidden retries, no infinite loops.

**Requirements:**

- Respect `maxRetries` limit
- Implement exponential backoff with jitter
- Record every retry attempt in `ExecutionAttempt` table
- Transition to DEAD_LETTER when retries exhausted

**Enforcement:** Integration tests; retry scenario coverage.

**Violation Consequence:** Infinite retry loops or premature failure; gate failure.

---

## Failure Handling Laws (S6-F)

### S6-F1: No Silent Failures

**Statement:** Every failure must be logged, recorded in the database, and available for query. No failure may be swallowed or ignored.

**Requirements:**

- Error logged with context (organizationId, executionId, error message)
- `ExecutionAttempt` record with error details
- `DeferredExecution` state updated
- Metrics incremented for failure tracking

**Enforcement:** Integration tests with failure injection; log verification.

**Violation Consequence:** Debugging impossible; gate failure.

---

### S6-F2: Transient vs Permanent Failure Classification

**Statement:** Every failure must be classified as transient (retriable) or permanent (terminal). Retry decisions must respect this classification.

**Transient Failures:**

- Network timeouts
- Database connection errors
- Temporary resource unavailability
- Stage 3 runtime transient errors

**Permanent Failures:**

- Workflow definition not found
- Workflow definition not ACTIVE
- Invalid payload structure
- Tenant mismatch (organizationId mismatch)
- Validation errors

**Enforcement:** Error classification logic review; test coverage.

**Violation Consequence:** Infinite retry loops or premature failure; gate failure.

---

### S6-F3: Scheduler Failure Isolation

**Statement:** Scheduler service failure must not impact synchronous operations. Stage 4 and Stage 5 synchronous APIs must remain operational.

**Requirements:**

- Scheduler runs as background process (separate from HTTP server)
- Scheduler failure logged and alerted
- Scheduler restart does not corrupt state
- Scheduler failure does not crash application

**Enforcement:** Fault injection testing; failover scenario coverage.

**Violation Consequence:** System-wide degradation; design revision required.

---

### S6-F4: Dead Letter Terminal State

**Statement:** Executions that exhaust all retry attempts must transition to a dead letter state. They must not be deleted, hidden, or silently dropped.

**Requirements:**

- Dead letter state is queryable via Stage 5 API
- Dead letter records are immutable
- Manual intervention possible for dead letters (via Stage 5 manual retry API)
- Dead letter count tracked in metrics

**Enforcement:** Integration tests; dead letter scenario coverage.

**Violation Consequence:** Data loss; gate failure.

---

## Observability Laws (S6-O)

### S6-O1: Mandatory Structured Logging

**Statement:** All Stage 6 operations must emit structured logs with consistent fields.

**Required Log Fields:**

- timestamp
- level
- service (SchedulerService, ExecutorService)
- operation (evaluateSchedule, processExecution, etc.)
- organizationId
- executionId (where applicable)
- duration (where applicable)
- outcome (success/failure)
- errorMessage (on failure)

**Enforcement:** Log format validation; code review.

**Violation Consequence:** Debugging and audit impaired; gate failure.

---

### S6-O2: Execution Metrics Collection

**Statement:** Stage 6 must expose metrics for background worker monitoring and health status.

**Required Metrics:**

- Schedules evaluated (count, rate)
- Executions created (count, rate)
- Executions processed (count, rate, by status)
- Queue depth (pending executions count)
- Retry rate (percentage)
- Dead letter count
- Latency percentiles (p50, p95, p99)
- Worker health status (last successful poll timestamp, error count)

**Note:** Health status must be exposed via structured logs and metrics only. Stage 6 does not add new HTTP endpoints.

**Enforcement:** Metrics verification; log verification; integration tests.

**Violation Consequence:** Operational blindness; gate failure.

---

### S6-O3: Trace Correlation

**Statement:** All Stage 6 operations must propagate trace identifiers for distributed tracing.

**Requirements:**

- Trace ID included in all logs
- Trace ID passed to Stage 3 runtime calls
- Trace ID queryable for debugging
- Trace ID generated for each schedule evaluation and execution processing

**Enforcement:** Trace propagation testing; log correlation verification.

**Violation Consequence:** Root cause analysis impaired; gate failure.

---

## Lifecycle Management Laws (S6-L)

### S6-L1: Graceful Startup

**Statement:** Background workers must start gracefully and verify dependencies before beginning processing.

**Requirements:**

- Implement `OnModuleInit` hook
- Verify database connectivity
- Verify Prisma client availability
- Log startup event
- Emit startup metric

**Enforcement:** Startup scenario testing; integration tests.

**Violation Consequence:** Startup failures; gate failure.

---

### S6-L2: Graceful Shutdown

**Statement:** Background workers must handle shutdown gracefully. In-flight executions must be released, not abandoned.

**Requirements:**

- Implement `OnModuleDestroy` hook
- Handle SIGTERM and SIGINT signals
- Stop polling loops
- Release in-flight execution claims
- Log shutdown event
- Emit shutdown metric

**Enforcement:** Shutdown scenario testing; integration tests.

**Violation Consequence:** Orphaned executions; gate failure.

---

### S6-L3: Polling Interval Configuration

**Statement:** Polling intervals for scheduler and executor must be configurable via environment variables.

**Requirements:**

- `SCHEDULER_POLL_INTERVAL_MS` (default 10000)
- `EXECUTOR_POLL_INTERVAL_MS` (default 5000)
- Validate interval values (minimum 1000ms, maximum 60000ms)
- Log configured intervals at startup

**Enforcement:** Configuration testing; code review.

**Violation Consequence:** Operational inflexibility; gate failure.

---

### S6-L4: Worker Restart Idempotency

**Statement:** Background workers must be safe to restart at any time without corrupting state.

**Requirements:**

- No in-memory state that cannot be reconstructed
- Database is source of truth for all state
- Restart does not duplicate processing
- Restart resumes from last checkpoint

**Enforcement:** Restart scenario testing; chaos testing.

**Violation Consequence:** State corruption risk; gate failure.

---

## Violation Response Protocol

### Severity Levels

| Level    | Description                      | Response                                    |
| -------- | -------------------------------- | ------------------------------------------- |
| CRITICAL | Security breach, data corruption | Immediate halt; rollback; incident report   |
| HIGH     | Gate failure, law violation      | Gate blocked; remediation required          |
| MEDIUM   | Non-compliance, missing coverage | Warning; remediation before gate completion |
| LOW      | Style, documentation gap         | Document; address in subsequent iteration   |

### Escalation Path

1. Developer identifies potential violation
2. Technical Lead reviews and classifies
3. Architecture Authority makes final determination
4. Governance Authority enforces consequence

### Remediation Requirements

All violations must be addressed with:

- Root cause analysis
- Corrective action
- Prevention measure
- Verification evidence

---

## Enforcement Mechanisms

### Automated Enforcement

- Security linter (Stage 0-5 immutability)
- ESLint (code quality)
- TypeScript compiler (type safety)
- Prisma validation (schema integrity)
- Jest tests (behavioral compliance)

### Manual Enforcement

- Code review checklist
- Architecture review gate
- Governance audit checkpoint
- Documentation review

---

**Document Status:** GOVERNANCE (PLANNING-AUTHORIZED ONLY)  
**Enforcement Level:** MANDATORY  
**Effective Date:** 2026-01-19  
**Authority:** Architecture & Governance Authority
