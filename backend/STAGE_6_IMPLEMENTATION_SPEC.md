**STATUS: DESIGN ONLY — NOT AUTHORIZED FOR IMPLEMENTATION**

---

# STAGE 6 — IMPLEMENTATION SPECIFICATION

**Project:** Bassan.os  
**Stage:** 6 — Background Execution Engine & Scheduler Runtime  
**Document Type:** Non-Binding Implementation Specification  
**Date:** 2026-01-19

> **IMPORTANT:** This document contains detailed implementation requirements extracted from gate checklists. It is NOT a governance document and does NOT authorize implementation. Implementation requires formal authorization and must follow the gate-by-gate execution protocol defined in STAGE_6_GATES_CHECKLIST.md.

---

## Purpose

This document provides detailed implementation specifications for Stage 6 gates. It contains method signatures, library dependencies, integration requirements, and test scenarios extracted from governance documents to maintain strict separation between governance and implementation.

**This document is advisory only and may be updated without formal governance approval.**

---

## Gate 2: Cron Validation Service

### Implementation Requirements

#### CronValidationService Interface

**Required Methods:**

```typescript
interface ICronValidationService {
  validateCronExpression(expression: string): {
    valid: boolean;
    error?: string;
  };

  validateTimezone(timezone: string): {
    valid: boolean;
    error?: string;
  };

  calculateNextExecution(expression: string, timezone: string): Date;
}
```

**Method Specifications:**

1. **validateCronExpression**
   - Input: Cron expression string (5-field or 6-field format)
   - Output: Validation result with optional error message
   - Behavior: Parse cron expression and validate syntax
   - Error Handling: Return `{ valid: false, error: "descriptive message" }` for invalid input

2. **validateTimezone**
   - Input: Timezone string (IANA timezone database format)
   - Output: Validation result with optional error message
   - Behavior: Validate timezone string against IANA database
   - Error Handling: Return `{ valid: false, error: "Invalid timezone" }` for invalid input

3. **calculateNextExecution**
   - Input: Cron expression and timezone
   - Output: Next execution time as Date object
   - Behavior: Calculate next execution time from current time
   - Error Handling: Throw exception for invalid input (should be validated first)

---

#### Suggested Dependencies

**Cron Parsing:**

- Library: `cron-parser`
- Version: Latest stable
- Usage: Parse and validate cron expressions, calculate next execution time

**Timezone Handling:**

- Library: `luxon` OR `date-fns-tz`
- Version: Latest stable
- Usage: Validate timezone strings, handle timezone-aware date calculations

---

#### Integration with ScheduledTriggersService

> **CRITICAL NOTE:** Integration with `scheduled-triggers.service.ts` (Stage 5 file) requires formal Patch Authorization. This integration is deferred pending approval of STAGE_6_PATCH_6.1_AUTHORIZATION.md.

**Proposed Integration (Pending Patch Authorization):**

```typescript
// In scheduled-triggers.service.ts (REQUIRES PATCH AUTHORIZATION)
async create(dto: CreateScheduledTriggerDto) {
  // Validate cron expression if provided
  if (dto.cronExpression) {
    const validation = this.cronValidationService.validateCronExpression(
      dto.cronExpression
    );
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }
  }

  // Validate timezone
  const timezoneValidation = this.cronValidationService.validateTimezone(
    dto.timezone || 'UTC'
  );
  if (!timezoneValidation.valid) {
    throw new BadRequestException(timezoneValidation.error);
  }

  // Calculate next execution time
  if (dto.cronExpression) {
    dto.nextExecutionAt = this.cronValidationService.calculateNextExecution(
      dto.cronExpression,
      dto.timezone || 'UTC'
    );
  }

  // Proceed with creation
  return super.create(dto);
}
```

**Alternative (No Patch Required):**

- Validation can be performed in SchedulerService (Stage 6 module) during schedule evaluation
- Stage 5 API accepts any cron expression; invalid expressions fail during evaluation
- Errors logged and execution marked as FAILED

---

## Gate 3: Scheduler Service

### Implementation Requirements

#### SchedulerService Interface

**Required Lifecycle Methods:**

```typescript
interface ISchedulerService extends OnModuleInit, OnModuleDestroy {
  onModuleInit(): Promise<void>;
  onModuleDestroy(): Promise<void>;
}
```

**Required Configuration:**

- Environment Variable: `SCHEDULER_POLL_INTERVAL_MS`
- Default Value: `10000` (10 seconds)
- Validation: Minimum 1000ms, Maximum 60000ms

---

#### Core Responsibilities

1. **Poll ScheduledTrigger Table**
   - Query: `SELECT * FROM scheduled_triggers WHERE isActive = true AND nextExecutionAt <= NOW()`
   - Frequency: Every `SCHEDULER_POLL_INTERVAL_MS` milliseconds
   - Batch Size: 100 records (suggested)

2. **Create DeferredExecution Records**
   - For each due schedule, create corresponding `DeferredExecution` record
   - Set `scheduledFor` to current time
   - Set `status` to PENDING
   - Copy `workflowDefinitionId` and `organizationId` from schedule
   - Generate unique `idempotencyKey`

3. **Update ScheduledTrigger Metadata**
   - Set `lastExecutedAt` to current time
   - Calculate and set `nextExecutionAt` based on cron expression or delay
   - Use `CronValidationService.calculateNextExecution()` for cron-based schedules

4. **Structured Logging**
   - Log every schedule evaluation with required fields (see STAGE_6_TECHNICAL_DESIGN.md)
   - Log errors with full context

5. **Metrics Emission**
   - Increment `scheduler.schedules_evaluated` for each schedule processed
   - Increment `scheduler.executions_created` for each deferred execution created

---

#### Graceful Lifecycle

**Startup:**

1. Log startup event: `{ service: "SchedulerService", operation: "startup", status: "starting" }`
2. Verify database connectivity
3. Start polling loop
4. Log startup complete: `{ service: "SchedulerService", operation: "startup", status: "ready" }`

**Shutdown:**

1. Log shutdown event: `{ service: "SchedulerService", operation: "shutdown", status: "stopping" }`
2. Stop polling loop (clear interval)
3. Wait for current evaluation to complete (if any)
4. Log shutdown complete: `{ service: "SchedulerService", operation: "shutdown", status: "stopped" }`

---

#### Tenant Isolation

- Use tenant-scoped Prisma client (automatic `organizationId` filtering)
- Log `organizationId` with every schedule evaluation
- No cross-tenant data leakage in logs or metrics

---

## Gate 4: Executor Service

### Implementation Requirements

#### ExecutorService Interface

**Required Lifecycle Methods:**

```typescript
interface IExecutorService extends OnModuleInit, OnModuleDestroy {
  onModuleInit(): Promise<void>;
  onModuleDestroy(): Promise<void>;
  releaseInFlightClaims(): Promise<void>;
}
```

**Required Configuration:**

- Environment Variable: `EXECUTOR_POLL_INTERVAL_MS`
- Default Value: `5000` (5 seconds)
- Validation: Minimum 1000ms, Maximum 60000ms

---

#### Core Responsibilities

1. **Poll DeferredExecution Table**
   - Query: `SELECT * FROM deferred_executions WHERE status = 'PENDING' AND scheduledFor <= NOW() LIMIT 10`
   - Frequency: Every `EXECUTOR_POLL_INTERVAL_MS` milliseconds
   - Batch Size: 10 records (suggested)

2. **Claim Executions**
   - Update `status` from PENDING to PROCESSING
   - Use optimistic locking to prevent duplicate processing
   - If claim fails (record already claimed), skip and continue

3. **Check Idempotency**
   - Query for existing `DeferredExecution` with same `idempotencyKey` and `status = COMPLETED`
   - If found, skip processing and log duplicate detection
   - If not found, proceed with execution

4. **Invoke Stage 3 Runtime**
   - Establish CLS context with `organizationId` from `DeferredExecution`
   - Call `WorkflowInstancesService.create()` with `workflowDefinitionId` and `payload`
   - Capture workflow instance ID from response

5. **Create ExecutionAttempt Record**
   - Record attempt with outcome (SUCCEEDED or FAILED)
   - Store `workflowInstanceId` if successful
   - Store `errorMessage` and `errorCode` if failed
   - Set `attemptNumber` to current `retryCount + 1`

6. **Update DeferredExecution Status**
   - On success: Set `status` to COMPLETED
   - On failure (transient): Schedule retry (increment `retryCount`, calculate next `scheduledFor`, set `status` to PENDING)
   - On failure (permanent): Set `status` to FAILED
   - On exhausted retries: Set `status` to DEAD_LETTER

7. **Structured Logging**
   - Log every execution attempt with required fields
   - Log errors with full context

8. **Metrics Emission**
   - Increment `executor.executions_processed` for each execution processed
   - Increment `executor.executions_succeeded` or `executor.executions_failed` based on outcome
   - Increment `executor.executions_retried` for retry scheduling
   - Increment `executor.executions_dead_letter` for dead letter transitions
   - Update `executor.queue_depth` gauge with current pending count
   - Record `executor.processing_duration_ms` histogram

---

#### Graceful Lifecycle

**Startup:**

1. Log startup event
2. Verify database connectivity
3. Start polling loop
4. Log startup complete

**Shutdown:**

1. Log shutdown event
2. Stop polling loop (clear interval)
3. Release in-flight claims (revert PROCESSING to PENDING)
4. Log shutdown complete

**releaseInFlightClaims() Implementation:**

```typescript
async releaseInFlightClaims(): Promise<void> {
  const inFlightExecutions = await prisma.deferredExecution.findMany({
    where: { status: 'PROCESSING' },
  });

  for (const execution of inFlightExecutions) {
    await prisma.deferredExecution.update({
      where: { id: execution.id },
      data: { status: 'PENDING' },
    });
  }

  logger.info({
    service: 'ExecutorService',
    operation: 'releaseInFlightClaims',
    count: inFlightExecutions.length,
  });
}
```

---

#### Tenant Isolation

- Establish CLS context with `organizationId` from `DeferredExecution` record
- Use tenant-scoped Prisma client
- Log `organizationId` with every execution
- No cross-tenant execution or data leakage

---

#### Retry Logic

**Exponential Backoff with Jitter:**

- Use formula from STAGE_6_TECHNICAL_DESIGN.md
- Initial delay: 1 second
- Maximum delay: 5 minutes
- Jitter: 10% random variance

**Transient vs Permanent Failure Classification:**

- Transient: Retry with backoff
  - Database connection errors
  - Network timeouts
  - 503 Service Unavailable
  - Deadlocks

- Permanent: No retry, mark as FAILED or DEAD_LETTER
  - 404 Not Found (workflow definition)
  - 400 Bad Request (validation errors)
  - 403 Forbidden (authorization)
  - Workflow definition not ACTIVE

**Retry Limit:**

- Respect `maxRetries` field on `DeferredExecution` record
- When `retryCount >= maxRetries`, transition to DEAD_LETTER

---

## Gate 5: Integration Tests

### Required Test Scenarios

#### 1. Scheduler Evaluation

**Test Steps:**

1. Create `ScheduledTrigger` with cron expression `* * * * *` (every minute)
2. Set `nextExecutionAt` to current time minus 1 minute (overdue)
3. Wait for scheduler to evaluate (max 15 seconds)
4. Verify `DeferredExecution` created with correct `workflowDefinitionId` and `organizationId`
5. Verify `ScheduledTrigger.lastExecutedAt` updated
6. Verify `ScheduledTrigger.nextExecutionAt` calculated correctly

**Expected Outcome:** Deferred execution created, schedule metadata updated

---

#### 2. Executor Processing

**Test Steps:**

1. Create `DeferredExecution` manually with `status = PENDING` and `scheduledFor = NOW()`
2. Wait for executor to process (max 10 seconds)
3. Verify `WorkflowInstance` created via Stage 3 runtime
4. Verify `ExecutionAttempt` record created with `status = SUCCEEDED`
5. Verify `DeferredExecution.status` updated to COMPLETED

**Expected Outcome:** Workflow instance created, execution marked as completed

---

#### 3. Retry Behavior

**Test Steps:**

1. Mock Stage 3 runtime to throw transient error (e.g., network timeout)
2. Create `DeferredExecution` with `maxRetries = 3`
3. Wait for executor to process
4. Verify `ExecutionAttempt` created with `status = FAILED`
5. Verify `DeferredExecution.retryCount` incremented
6. Verify `DeferredExecution.status` set to PENDING
7. Verify `DeferredExecution.scheduledFor` calculated with backoff
8. Verify retry scheduled (next attempt occurs after delay)

**Expected Outcome:** Execution retried with exponential backoff

---

#### 4. Dead Letter Handling

**Test Steps:**

1. Mock Stage 3 runtime to throw transient error
2. Create `DeferredExecution` with `maxRetries = 2`
3. Wait for executor to exhaust all retries
4. Verify 3 `ExecutionAttempt` records created (initial + 2 retries)
5. Verify `DeferredExecution.status` set to DEAD_LETTER
6. Verify no further processing occurs

**Expected Outcome:** Execution transitions to dead letter state after exhausting retries

---

#### 5. Idempotency

**Test Steps:**

1. Create `DeferredExecution` with unique `idempotencyKey`
2. Wait for executor to process successfully
3. Create duplicate `DeferredExecution` with same `idempotencyKey`
4. Wait for executor to process duplicate
5. Verify only one `WorkflowInstance` created
6. Verify duplicate detection logged

**Expected Outcome:** Duplicate execution skipped, no duplicate workflow instance

---

#### 6. Graceful Shutdown

**Test Steps:**

1. Create `DeferredExecution` with `status = PENDING`
2. Start executor
3. Wait for executor to claim execution (`status = PROCESSING`)
4. Trigger shutdown (call `onModuleDestroy()`)
5. Verify `DeferredExecution.status` reverted to PENDING
6. Verify shutdown logged

**Expected Outcome:** In-flight claim released on shutdown

---

#### 7. Tenant Isolation

**Test Steps:**

1. Create Victim tenant and Attacker tenant
2. Victim creates `ScheduledTrigger`
3. Wait for scheduler to create `DeferredExecution`
4. Wait for executor to process execution
5. Verify `WorkflowInstance` created with Victim's `organizationId`
6. Verify Attacker cannot access Victim's schedule, execution, or workflow instance (404 responses)
7. Verify no cross-tenant data in logs or metrics

**Expected Outcome:** All operations respect tenant boundaries, no cross-tenant access

---

## Document References

- backend/STAGE_6_AUTHORIZATION.md — Stage 6 scope authorization
- backend/STAGE_6_PLAN.md — Stage 6 governance plan
- backend/STAGE_6_LAWS.md — Stage 6 architectural laws
- backend/STAGE_6_GATES_CHECKLIST.md — Stage 6 execution protocol
- backend/STAGE_6_TECHNICAL_DESIGN.md — Stage 6 technical design

---

**Document Status:** DRAFT (Non-Binding)  
**Last Updated:** 2026-01-19  
**Approval Required:** None (advisory document)
