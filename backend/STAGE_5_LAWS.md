# STAGE 5 — ARCHITECTURAL LAWS

## Preamble

This document establishes the non-negotiable architectural laws governing Stage 5 of the Bassan.os platform. These laws are binding constraints that must be enforced during all phases of Stage 5 execution. Violation of any law constitutes a governance breach and requires immediate remediation.

**Project:** Bassan.os  
**Stage:** 5 — Asynchronous Execution & Deferred Automation  
**Authority:** Architecture & Governance Authority  
**Enforcement Level:** MANDATORY  
**Execution Mode:** STRICT · FAIL-CLOSED · IMMUTABLE

---

## Law Categories

Laws are organized into the following categories:

- **S5-I:** Immutability Laws (Stage 0-4 preservation)
- **S5-T:** Tenant Isolation Laws
- **S5-E:** Execution Laws (async/sync boundaries)
- **S5-F:** Failure Handling Laws
- **S5-O:** Observability Laws
- **S5-D:** Data Integrity Laws

---

## Immutability Laws (S5-I)

### S5-I1: Stage 0-4 Artifact Immutability

**Statement:** No Stage 5 implementation may modify, delete, or alter the behavior of any Stage 0, 1, 2, 3, or 4 artifact.

**Scope:**

- Database schema (Prisma schema models)
- API endpoints (routes, controllers)
- Service implementations
- Security configurations
- Test specifications
- Governance documents

**Enforcement:** Security linter must verify no Stage 0-4 files are modified during Stage 5 execution.

**Violation Consequence:** Immediate gate failure; rollback required.

---

### S5-I2: Stage 4 API Contract Preservation

**Statement:** All Stage 4 API endpoints must continue to function identically after Stage 5 completion.

**Affected Endpoints:**

- POST /workflow-triggers
- GET /workflow-triggers
- GET /workflow-triggers/:id
- PATCH /workflow-triggers/:id
- POST /workflow-triggers/events
- GET /workflow-triggers/events/:id

**Enforcement:** Stage 4 integration tests must pass without modification during Stage 5 verification.

**Violation Consequence:** Stage 5 cannot be completed; blocking defect.

---

### S5-I3: No Implicit Stage 4 Dependencies

**Statement:** Stage 5 must not introduce implicit runtime dependencies that alter Stage 4 execution paths.

**Prohibited Patterns:**

- Middleware that intercepts Stage 4 requests
- Event listeners that modify Stage 4 behavior
- Database triggers affecting Stage 4 tables
- Shared mutable state between Stage 4 and Stage 5

**Enforcement:** Code review and architectural audit during Gate 3.

**Violation Consequence:** Design revision required before proceeding.

---

## Tenant Isolation Laws (S5-T)

### S5-T1: Mandatory organizationId Scoping

**Statement:** Every Stage 5 data model must include an organizationId field and enforce tenant isolation.

**Affected Models:**

- ScheduledTrigger
- DeferredExecution
- ExecutionAttempt

**Enforcement:** Schema validation during Gate 2; Prisma extension registration during Gate 2.1.

**Violation Consequence:** Security vulnerability; immediate gate failure.

---

### S5-T2: Tenant Context from CLS Only

**Statement:** The organizationId for any Stage 5 operation must be derived exclusively from the CLS (Continuation-Local Storage) context, never from request parameters, query strings, or request bodies.

**Prohibited Patterns:**

- organizationId in DTO properties
- organizationId in URL parameters
- organizationId in query strings
- X-Tenant-Id headers

**Enforcement:** Security linter rule; DTO validation during code review.

**Violation Consequence:** Trust boundary violation; gate failure.

---

### S5-T3: Cross-Tenant Access Returns 404

**Statement:** Any attempt to access Stage 5 resources belonging to a different tenant must return HTTP 404, not 403.

**Rationale:** Returning 403 confirms resource existence, enabling tenant enumeration attacks. 404 provides no information about resource existence.

**Enforcement:** Integration test scenarios; penetration test verification.

**Violation Consequence:** Security vulnerability; gate failure.

---

### S5-T4: Scheduler Tenant Boundary Enforcement

**Statement:** The scheduler service must only evaluate schedules belonging to the current processing context and must never cross tenant boundaries during batch operations.

**Requirements:**

- Schedule queries must include organizationId filter
- Batch processing must group by tenant
- No cross-tenant data leakage in logs or metrics

**Enforcement:** Code review; integration testing.

**Violation Consequence:** Data breach risk; immediate remediation required.

---

## Execution Laws (S5-E)

### S5-E1: No Synchronous Coupling to Async Execution

**Statement:** Synchronous API operations must not block waiting for asynchronous execution results.

**Prohibited Patterns:**

- Blocking poll for execution completion
- Synchronous retry loops
- Long-running HTTP requests waiting for async results

**Required Pattern:**

- Create deferred execution (sync, fast)
- Return execution ID immediately
- Client polls for status separately

**Enforcement:** Code review; timeout testing.

**Violation Consequence:** Performance degradation; design revision required.

---

### S5-E2: Idempotent Execution Guarantee

**Statement:** Every deferred execution must be idempotent. Processing the same execution multiple times must produce the same outcome without side effects.

**Requirements:**

- Idempotency key generated at creation time
- Duplicate check before processing
- Cached result return for duplicates
- Key expiration policy defined

**Enforcement:** Unit tests; duplicate scenario integration tests.

**Violation Consequence:** Data corruption risk; gate failure.

---

### S5-E3: Bounded Execution Time

**Statement:** Individual execution processing must complete within a defined timeout. Executions exceeding the timeout must be marked as failed and eligible for retry.

**Default Timeout:** 30 seconds per execution attempt

**Requirements:**

- Timeout enforcement in executor service
- Graceful cancellation on timeout
- Accurate timeout recording in attempt log

**Enforcement:** Load testing; timeout scenario testing.

**Violation Consequence:** Resource exhaustion risk; design revision required.

---

### S5-E4: No Hidden Retries

**Statement:** All retry attempts must be explicitly recorded in the execution attempt log. No retry may occur without a corresponding audit record.

**Requirements:**

- Attempt record created before processing
- Outcome recorded after completion
- Retry scheduling visible in execution state

**Enforcement:** Integration tests; log verification.

**Violation Consequence:** Audit trail gap; gate failure.

---

### S5-E5: Dead Letter Terminal State

**Statement:** Executions that exhaust all retry attempts must transition to a dead letter state. They must not be deleted, hidden, or silently dropped.

**Requirements:**

- Dead letter state is queryable
- Dead letter records are immutable
- Manual intervention possible for dead letters

**Enforcement:** Integration tests; dead letter scenario coverage.

**Violation Consequence:** Data loss; gate failure.

---

## Failure Handling Laws (S5-F)

### S5-F1: No Silent Failures

**Statement:** Every failure must be logged, recorded in the database, and available for query. No failure may be swallowed or ignored.

**Requirements:**

- Error logged with context
- ExecutionAttempt record with error details
- DeferredExecution state updated

**Enforcement:** Integration tests with failure injection; log verification.

**Violation Consequence:** Debugging impossible; gate failure.

---

### S5-F2: Transient vs Permanent Failure Classification

**Statement:** Every failure must be classified as transient (retriable) or permanent (terminal). Retry decisions must respect this classification.

**Transient Failures:**

- Network timeouts
- Database connection errors
- Temporary resource unavailability

**Permanent Failures:**

- Validation errors
- Authorization failures
- Definition not ACTIVE
- Tenant mismatch

**Enforcement:** Error classification logic review; test coverage.

**Violation Consequence:** Infinite retry loops or premature failure; gate failure.

---

### S5-F3: Scheduler Failure Isolation

**Statement:** Scheduler service failure must not impact synchronous operations. Stage 4 and Stage 5 synchronous APIs must remain operational.

**Requirements:**

- Scheduler runs as background process
- Scheduler failure logged and alerted
- Scheduler restart does not corrupt state

**Enforcement:** Fault injection testing; failover scenario coverage.

**Violation Consequence:** System-wide degradation; design revision required.

---

### S5-F4: Graceful Shutdown Handling

**Statement:** Scheduler and executor services must handle shutdown gracefully. In-flight executions must be released, not abandoned.

**Requirements:**

- SIGTERM/SIGINT handlers implemented
- In-flight execution claims released
- Shutdown logged for audit

**Enforcement:** Shutdown scenario testing; integration tests.

**Violation Consequence:** Orphaned executions; gate failure.

---

## Observability Laws (S5-O)

### S5-O1: Mandatory Structured Logging

**Statement:** All Stage 5 operations must emit structured logs with consistent fields.

**Required Log Fields:**

- timestamp
- level
- service
- operation
- organizationId
- executionId (where applicable)
- duration (where applicable)
- outcome (success/failure)

**Enforcement:** Log format validation; code review.

**Violation Consequence:** Debugging and audit impaired; gate failure.

---

### S5-O2: Execution Metrics Collection

**Statement:** Stage 5 must expose metrics for execution monitoring.

**Required Metrics:**

- Execution count (by status, tenant)
- Queue depth (pending executions)
- Retry rate (percentage)
- Latency percentiles (p50, p95, p99)
- Dead letter count

**Enforcement:** Metrics endpoint verification; integration tests.

**Violation Consequence:** Operational blindness; gate failure.

---

### S5-O3: Trace Correlation

**Statement:** All Stage 5 operations must propagate trace identifiers for distributed tracing.

**Requirements:**

- Trace ID included in all logs
- Trace ID passed to Stage 3 runtime calls
- Trace ID queryable for debugging

**Enforcement:** Trace propagation testing; log correlation verification.

**Violation Consequence:** Root cause analysis impaired; gate failure.

---

## Data Integrity Laws (S5-D)

### S5-D1: Execution Attempt Immutability

**Statement:** ExecutionAttempt records are strictly immutable. Once created, they may not be updated or deleted.

**Enforcement:** No UPDATE or DELETE operations on execution_attempts table; schema review; code review.

**Violation Consequence:** Audit trail corruption; gate failure.

---

### S5-D2: Deferred Execution State Machine

**Statement:** DeferredExecution records must follow a defined state machine. Invalid state transitions are prohibited.

**Valid States:**

- PENDING → PROCESSING
- PROCESSING → COMPLETED
- PROCESSING → FAILED
- FAILED → PENDING (retry)
- FAILED → DEAD_LETTER (exhausted)
- DEAD_LETTER is terminal

**Enforcement:** State transition validation in service layer; integration tests.

**Violation Consequence:** Inconsistent execution state; gate failure.

---

### S5-D3: Referential Integrity Enforcement

**Statement:** All Stage 5 foreign key references must be validated. Orphan records are prohibited.

**References:**

- ScheduledTrigger → WorkflowDefinition
- DeferredExecution → ScheduledTrigger (optional)
- DeferredExecution → Organization
- ExecutionAttempt → DeferredExecution

**Enforcement:** Prisma schema constraints; integration tests.

**Violation Consequence:** Data corruption; gate failure.

---

### S5-D4: Clock Source Consistency

**Statement:** All timestamp generation must use the database server clock via `@default(now())` in Prisma schema. Application-generated timestamps are prohibited for persistence.

**Rationale:** Prevents clock skew issues between application instances.

**Enforcement:** Schema review; code review for timestamp generation.

**Violation Consequence:** Time ordering inconsistencies; gate failure.

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

- Security linter (Stage 0-4 immutability)
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

**Document Status:** FINAL  
**Enforcement Level:** MANDATORY  
**Effective Date:** 2026-01-18  
**Authority:** Architecture & Governance Authority
