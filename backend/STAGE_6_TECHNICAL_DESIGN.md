**STATUS: DESIGN ONLY — NOT AUTHORIZED FOR IMPLEMENTATION**

---

# STAGE 6 — TECHNICAL DESIGN

**Project:** Bassan.os  
**Stage:** 6 — Background Execution Engine & Scheduler Runtime  
**Document Type:** Non-Binding Technical Design  
**Date:** 2026-01-19

> **IMPORTANT:** This document contains implementation guidance and technical design details. It is NOT a governance document and does NOT authorize implementation. Implementation requires formal authorization and must follow the gate-by-gate execution protocol defined in STAGE_6_GATES_CHECKLIST.md.

---

## Purpose

This document provides technical design guidance for Stage 6 implementation. It contains implementation patterns, code examples, algorithms, and technical specifications extracted from governance documents to maintain strict separation between governance and implementation.

**This document is advisory only and may be updated without formal governance approval.**

---

## Component Implementation Patterns

### SchedulerService Implementation Pattern

**Suggested Implementation Approach:**

```typescript
@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
  private isRunning = false;
  private pollingInterval: NodeJS.Timeout;

  async onModuleInit() {
    this.startScheduler();
  }

  async onModuleDestroy() {
    this.stopScheduler();
  }

  private async startScheduler() {
    this.isRunning = true;
    this.pollingInterval = setInterval(() => this.evaluateSchedules(), 10000);
  }

  private async stopScheduler() {
    this.isRunning = false;
    clearInterval(this.pollingInterval);
  }

  private async evaluateSchedules() {
    // Poll for due schedules
    // Create deferred executions
    // Update schedule metadata
  }
}
```

**Design Notes:**

- Use NestJS lifecycle hooks for graceful startup/shutdown
- Polling interval configurable via environment variable `SCHEDULER_POLL_INTERVAL_MS` (default 10000ms)
- Query for `isActive = true` and `nextExecutionAt <= NOW()`
- Process schedules in batches to avoid blocking
- Use tenant-scoped Prisma client for automatic `organizationId` filtering

---

### ExecutorService Implementation Pattern

**Suggested Implementation Approach:**

```typescript
@Injectable()
export class ExecutorService implements OnModuleInit, OnModuleDestroy {
  private isRunning = false;
  private pollingInterval: NodeJS.Timeout;

  async onModuleInit() {
    this.startExecutor();
  }

  async onModuleDestroy() {
    await this.stopExecutor();
  }

  private async startExecutor() {
    this.isRunning = true;
    this.pollingInterval = setInterval(() => this.processExecutions(), 5000);
  }

  private async stopExecutor() {
    this.isRunning = false;
    clearInterval(this.pollingInterval);
    await this.releaseInFlightClaims();
  }

  private async processExecutions() {
    // Poll for pending executions
    // Claim and process
    // Record attempts
    // Schedule retries or mark complete
  }
}
```

**Design Notes:**

- Use NestJS lifecycle hooks for graceful startup/shutdown
- Polling interval configurable via environment variable `EXECUTOR_POLL_INTERVAL_MS` (default 5000ms)
- Query for `status = PENDING` and `scheduledFor <= NOW()`
- Claim executions by updating status to PROCESSING (optimistic locking)
- Establish CLS context with `organizationId` from `DeferredExecution` record before invoking Stage 3 runtime
- Release claims on shutdown by reverting PROCESSING to PENDING

---

### CronValidationService Implementation Pattern

**Suggested Implementation Approach:**

```typescript
@Injectable()
export class CronValidationService {
  validateCronExpression(expression: string): {
    valid: boolean;
    error?: string;
  } {
    // Use cron-parser or similar library
  }

  calculateNextExecution(expression: string, timezone: string): Date {
    // Calculate next execution time
  }
}
```

**Design Notes:**

- Synchronous operations only (no async/await)
- Validate 5-field or 6-field cron syntax
- Validate timezone strings against IANA timezone database
- Return clear error messages for invalid input
- Support standard cron syntax only (no custom extensions)

**Suggested Libraries:**

- `cron-parser` for cron expression parsing and validation
- `luxon` or `date-fns-tz` for timezone validation and date calculations

---

## Execution Model

### Polling Strategy

**SchedulerService Polling:**

- Poll every 10 seconds (configurable via `SCHEDULER_POLL_INTERVAL_MS`)
- Query: `SELECT * FROM scheduled_triggers WHERE isActive = true AND nextExecutionAt <= NOW()`
- Process in batches (suggested batch size: 100 records)
- For each due schedule:
  1. Create `DeferredExecution` record
  2. Calculate next execution time
  3. Update `ScheduledTrigger.lastExecutedAt` and `nextExecutionAt`

**ExecutorService Polling:**

- Poll every 5 seconds (configurable via `EXECUTOR_POLL_INTERVAL_MS`)
- Query: `SELECT * FROM deferred_executions WHERE status = 'PENDING' AND scheduledFor <= NOW() LIMIT 10`
- Process in batches (suggested batch size: 10 records)
- For each pending execution:
  1. Claim execution (update status to PROCESSING)
  2. Check idempotency key
  3. Invoke Stage 3 runtime to create workflow instance
  4. Create `ExecutionAttempt` record
  5. Update `DeferredExecution` status (COMPLETED or FAILED)
  6. Schedule retry if failed and retries remaining

**Rationale:** Polling is simple, reliable, and does not require external infrastructure. Performance is acceptable for Stage 6 scope (single-instance, moderate load).

**Future Optimization (Out of Scope):** Event-driven execution with message queues.

---

## Idempotency Enforcement

### Algorithm

Before processing a `DeferredExecution`, check if the `idempotencyKey` has already been successfully processed:

1. Query `DeferredExecution` for matching `idempotencyKey` with `status = COMPLETED`
2. If found, skip processing and log duplicate detection
3. If not found, proceed with execution

### Idempotency Key Format

**Suggested Format:** `{organizationId}:{workflowDefinitionId}:{timestamp}:{random}`

**Example:** `org_123:wf_456:1737259200000:a1b2c3d4`

**Components:**

- `organizationId` — Tenant identifier
- `workflowDefinitionId` — Workflow definition identifier
- `timestamp` — Unix timestamp (milliseconds)
- `random` — Random string (8 characters)

---

## Retry Policy

### Configuration

- **Maximum Attempts:** `maxRetries` (default 3, configurable per execution)
- **Backoff Strategy:** Exponential with jitter
- **Initial Delay:** 1 second
- **Maximum Delay:** 5 minutes (300 seconds)
- **Jitter:** 10% random variance

### Backoff Calculation Formula

```typescript
const delay = Math.min(
  initialDelay * Math.pow(2, retryCount) * (1 + Math.random() * 0.1),
  maxDelay,
);
```

**Example Delays:**

- Attempt 1: 1s × 2^0 × 1.05 = ~1s
- Attempt 2: 1s × 2^1 × 1.08 = ~2.16s
- Attempt 3: 1s × 2^2 × 1.03 = ~4.12s
- Attempt 4: 1s × 2^3 × 1.07 = ~8.56s

### Retry Scheduling Steps

When an execution fails:

1. Increment `retryCount`
2. Calculate delay using backoff formula
3. Calculate `scheduledFor = NOW() + delay`
4. Update `DeferredExecution` status to PENDING
5. Create `ExecutionAttempt` record with FAILED status

### Dead Letter Transition

When `retryCount >= maxRetries`:

1. Update `DeferredExecution` status to DEAD_LETTER
2. Create final `ExecutionAttempt` record with FAILED status
3. Log dead letter event with structured logging
4. Emit dead letter metric

---

## Failure Classification

### Transient Failures (Retriable)

**Examples:**

- Database connection timeout
- Network timeout calling Stage 3 runtime
- Temporary resource unavailability (503 Service Unavailable)
- Deadlock or lock timeout
- Transient database errors (connection pool exhausted)

**Handling:** Retry with exponential backoff

---

### Permanent Failures (Terminal)

**Examples:**

- Workflow definition not found (404)
- Workflow definition not ACTIVE (validation error)
- Invalid payload structure (JSON parse error)
- Tenant mismatch (`organizationId` mismatch)
- Validation errors (400 Bad Request)
- Authorization failures (403 Forbidden)

**Handling:** Immediate failure, no retry, transition to FAILED or DEAD_LETTER

---

## Tenant Isolation

### CLS Context Establishment

Before invoking Stage 3 runtime, establish CLS context:

```typescript
// Pseudo-code for illustration
const organizationId = deferredExecution.organizationId;

await clsService.run(async () => {
  clsService.set("organizationId", organizationId);

  // Invoke Stage 3 runtime
  await workflowInstancesService.create({
    workflowDefinitionId: deferredExecution.workflowDefinitionId,
    payload: deferredExecution.payload,
  });
});
```

**Critical:** The `organizationId` must be derived from the `DeferredExecution` record, never from request parameters or user input.

---

### Tenant-Scoped Queries

All database queries must use the tenant-scoped Prisma client, which automatically filters by `organizationId`:

```typescript
// Automatic filtering via Prisma extension
const schedules = await prisma.scheduledTrigger.findMany({
  where: {
    isActive: true,
    nextExecutionAt: { lte: new Date() },
  },
});
// organizationId filter applied automatically by Prisma extension
```

---

## Observability

### Structured Logging

**Required Log Fields:**

- `timestamp` — ISO 8601 timestamp
- `level` — Log level (info, warn, error)
- `service` — Service name (SchedulerService, ExecutorService)
- `operation` — Operation name (evaluateSchedule, processExecution, etc.)
- `organizationId` — Tenant identifier
- `executionId` — Execution identifier (where applicable)
- `duration` — Operation duration in milliseconds (where applicable)
- `outcome` — Operation outcome (success, failure)
- `errorMessage` — Error message (on failure)

**Example Log Entry:**

```json
{
  "timestamp": "2026-01-19T07:00:00.000Z",
  "level": "info",
  "service": "ExecutorService",
  "operation": "processExecution",
  "organizationId": "org_123",
  "executionId": "exec_456",
  "duration": 1234,
  "outcome": "success"
}
```

---

### Metrics

**Required Metrics:**

- `scheduler.schedules_evaluated` — Count of schedules evaluated
- `scheduler.executions_created` — Count of deferred executions created
- `executor.executions_processed` — Count of executions processed
- `executor.executions_succeeded` — Count of successful executions
- `executor.executions_failed` — Count of failed executions
- `executor.executions_retried` — Count of retried executions
- `executor.executions_dead_letter` — Count of dead letter executions
- `executor.queue_depth` — Current count of pending executions
- `executor.processing_duration_ms` — Histogram of execution processing duration

**Metric Labels:**

- `organizationId` — Tenant identifier (for tenant-specific metrics)
- `status` — Execution status (COMPLETED, FAILED, DEAD_LETTER)

---

### Health Status

**Suggested Approach:**

Since Stage 6 does not add new API endpoints, health status should be exposed via:

1. **Structured Logs:** Log health status periodically (e.g., every 60 seconds)
2. **Metrics:** Expose health metrics (last successful poll timestamp, error count)
3. **Existing Metrics Endpoint:** If the application has a metrics endpoint (e.g., `/metrics` for Prometheus), include scheduler/executor health metrics

**Health Indicators:**

- Last successful poll timestamp
- Error count since last restart
- Current queue depth
- Worker running status (true/false)

**Example Health Log:**

```json
{
  "timestamp": "2026-01-19T07:00:00.000Z",
  "level": "info",
  "service": "SchedulerService",
  "operation": "healthCheck",
  "status": "healthy",
  "lastSuccessfulPoll": "2026-01-19T06:59:50.000Z",
  "errorCount": 0
}
```

---

## Graceful Lifecycle Management

### Startup Sequence

1. Verify database connectivity
2. Verify Prisma client availability
3. Log startup event
4. Emit startup metric
5. Start polling loop

### Shutdown Sequence

1. Stop accepting new work (stop polling loop)
2. Release in-flight execution claims (revert PROCESSING to PENDING)
3. Log shutdown event
4. Emit shutdown metric
5. Exit gracefully

### Signal Handling

Handle SIGTERM and SIGINT signals:

```typescript
process.on("SIGTERM", async () => {
  await this.stopExecutor();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await this.stopExecutor();
  process.exit(0);
});
```

---

## Document References

- backend/STAGE_6_AUTHORIZATION.md — Stage 6 scope authorization
- backend/STAGE_6_PLAN.md — Stage 6 governance plan
- backend/STAGE_6_LAWS.md — Stage 6 architectural laws
- backend/STAGE_6_GATES_CHECKLIST.md — Stage 6 execution protocol
- backend/STAGE_6_IMPLEMENTATION_SPEC.md — Stage 6 implementation specification

---

**Document Status:** DRAFT (Non-Binding)  
**Last Updated:** 2026-01-19  
**Approval Required:** None (advisory document)
