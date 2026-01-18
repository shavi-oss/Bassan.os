# STAGE 5 — GATES EXECUTION CHECKLIST

## Preamble

This document defines the gate-by-gate execution protocol for Stage 5 of the Bassan.os platform. Each gate must be completed in sequence. No gate may be skipped. A gate is considered complete only when all verification steps pass and evidence is recorded.

**Project:** Bassan.os  
**Stage:** 5 — Asynchronous Execution & Deferred Automation  
**Execution Mode:** STRICT · FAIL-CLOSED · SEQUENTIAL  
**Prerequisites:** Stage 4 LOCKED (per STAGE_4_LOCK_DECLARATION.md)

---

## Gate Summary

| Gate | Name                      | Objective                                           |
| ---- | ------------------------- | --------------------------------------------------- |
| 0    | Baseline Verification     | Verify clean state and Stage 4 integrity            |
| 1    | Security Linter Extension | Extend linter for Stage 5 scope                     |
| 2    | Database Schema           | Add Stage 5 models to Prisma schema                 |
| 2.1  | Governance Patch          | Register Stage 5 models for tenant isolation        |
| 3    | Module Implementation     | Implement scheduled triggers and deferred execution |
| 4    | Integration Tests         | Verify Stage 5 functionality                        |
| 4.1  | Stage 4 Regression        | Verify Stage 4 remains unchanged                    |
| 5    | Release & Lock            | Commit, push, and declare Stage 5 complete          |

---

## Gate 0: Baseline Verification

### Objective

Verify that the working tree is clean, Stage 4 is locked, and the codebase is in a valid state for Stage 5 execution.

### Allowed Files

None. This gate is read-only verification.

### Forbidden Actions

- Any file modifications
- Any code changes
- Any configuration changes

### Verification Commands

```bash
cd backend

# Verify clean working tree
git status --porcelain

# Verify on correct branch
git branch --show-current

# Verify Stage 4 lock exists
cat STAGE_4_LOCK_DECLARATION.md | head -20

# Verify lint passes
npm run lint

# Verify build passes
npm run build

# Verify Stage 4 tests pass
$env:BASSAN_STAGE=4
$env:BASSAN_PATCH="4.1"
npm run test -- --testPathPattern=stage4-triggers --forceExit
Remove-Item Env:\BASSAN_PATCH -ErrorAction SilentlyContinue
Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue
```

### Pass Criteria

- git status shows no uncommitted changes
- STAGE_4_LOCK_DECLARATION.md exists and contains "LOCKED & COMPLETE"
- Lint exits with code 0
- Build exits with code 0
- Stage 4 integration tests pass (7/7)

### Fail Criteria

- Any uncommitted changes present
- STAGE_4_LOCK_DECLARATION.md missing or incomplete
- Lint errors
- Build errors
- Stage 4 test failures

### Hard Stop Rules

- If Stage 4 tests fail, STOP. Do not proceed.
- If lock declaration missing, STOP. Stage 4 must be formally locked.

---

## Gate 1: Security Linter Extension

### Objective

Extend the security linter to enforce Stage 5 scope rules, module allowlist, endpoint allowlist, and Stage 0-4 immutability verification.

### Allowed Files

- `backend/tests/security/security-linter.spec.ts`

### Forbidden Files

- Any file under `backend/src/**`
- Any file under `backend/prisma/**`
- Any Stage 0-4 artifacts

### Required Changes

1. Add Stage 5 conditional logic (`describeS5`)
2. Implement S5-L1: Forbid `_unsafeClient` in Stage 5 modules
3. Implement S5-L2: Module allowlist (scheduled-triggers, deferred-execution)
4. Implement S5-L3: Endpoint allowlist (Stage 5 endpoints)
5. Update immutability check to verify Stage 0-4 files unchanged

### Verification Commands

```bash
cd backend

# Run security linter at Stage 5
$env:BASSAN_STAGE=5
npm run test -- --testPathPattern=security-linter --forceExit
Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue
```

### Pass Criteria

- All existing Stage 4 security tests still pass
- New Stage 5 tests pass (S5-L1, S5-L2, S5-L3)
- Immutability verification passes

### Fail Criteria

- Any Stage 4 test failure
- Any Stage 5 test failure
- Immutability violation detected

### Hard Stop Rules

- If Stage 4 immutability fails, STOP. Stage 0-4 artifacts may have been modified.

---

## Gate 2: Database Schema

### Objective

Add Stage 5 data models to the Prisma schema and generate migration.

### Allowed Files

- `backend/prisma/schema.prisma`

### Forbidden Files

- Any modification to existing Stage 0-4 models
- Any file under `backend/src/**`

### Required Models

1. **ScheduledTrigger**
   - id (UUID, primary key)
   - cronExpression (String, nullable)
   - delaySeconds (Int, nullable)
   - timezone (String, default UTC)
   - workflowDefinitionId (FK to WorkflowDefinition)
   - description (String, nullable)
   - isActive (Boolean, default true)
   - lastExecutedAt (DateTime, nullable)
   - nextExecutionAt (DateTime, nullable)
   - organizationId (FK to Organization)
   - createdAt, updatedAt

2. **DeferredExecution**
   - id (UUID, primary key)
   - scheduledTriggerId (FK to ScheduledTrigger, nullable)
   - workflowDefinitionId (FK to WorkflowDefinition)
   - idempotencyKey (String, unique)
   - status (Enum: PENDING, PROCESSING, COMPLETED, FAILED, DEAD_LETTER)
   - scheduledFor (DateTime)
   - payload (Json, nullable)
   - retryCount (Int, default 0)
   - maxRetries (Int, default 3)
   - lastAttemptAt (DateTime, nullable)
   - organizationId (FK to Organization)
   - createdAt, updatedAt

3. **ExecutionAttempt**
   - id (UUID, primary key)
   - deferredExecutionId (FK to DeferredExecution)
   - attemptNumber (Int)
   - startedAt (DateTime)
   - completedAt (DateTime, nullable)
   - status (Enum: RUNNING, SUCCEEDED, FAILED, TIMEOUT)
   - errorMessage (String, nullable)
   - errorCode (String, nullable)
   - workflowInstanceId (UUID, nullable, reference only)
   - organizationId (FK to Organization)
   - createdAt

4. **Enum: DeferredExecutionStatus**
   - PENDING
   - PROCESSING
   - COMPLETED
   - FAILED
   - DEAD_LETTER

5. **Enum: ExecutionAttemptStatus**
   - RUNNING
   - SUCCEEDED
   - FAILED
   - TIMEOUT

### Verification Commands

```bash
cd backend

# Format schema
npx prisma format

# Generate migration
npx prisma migrate dev --name stage5_async_execution

# Generate client
npx prisma generate

# Build to verify
npm run build
```

### Pass Criteria

- Prisma format succeeds
- Migration generated successfully
- Prisma client generated
- Build succeeds

### Fail Criteria

- Schema validation errors
- Migration generation failure
- Build errors

### Hard Stop Rules

- If existing models are modified, STOP. This violates S5-I1.

---

## Gate 2.1: Governance Patch (Tenant Isolation)

### Objective

Register Stage 5 models in the tenant isolation extension to enforce automatic organizationId filtering.

### Allowed Files

- `backend/src/core/database/prisma.extension.ts`

### Forbidden Files

- Any other file under `backend/src/**`
- Any file under `backend/prisma/**`

### Required Changes

Add to `DIRECTLY_SCOPED_MODELS` array:

- ScheduledTrigger
- DeferredExecution
- ExecutionAttempt

### Verification Commands

```bash
cd backend

# Run with Stage 5 patch authorization
$env:BASSAN_STAGE=5
$env:BASSAN_PATCH="5.1"
npm run test -- --testPathPattern=security-linter --forceExit
Remove-Item Env:\BASSAN_PATCH -ErrorAction SilentlyContinue
Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue
```

### Pass Criteria

- Security linter passes with patch authorization
- Immutability check passes (patch exception recognized)

### Fail Criteria

- Security linter fails
- Immutability violation (outside authorized patch)

### Hard Stop Rules

- Only prisma.extension.ts may be modified
- Only DIRECTLY_SCOPED_MODELS array may be changed

---

## Gate 3: Module Implementation

### Objective

Implement Stage 5 modules: scheduled-triggers and deferred-execution services, controllers, and DTOs.

### Allowed Files

- `backend/src/modules/scheduled-triggers/**`
- `backend/src/modules/deferred-execution/**`
- `backend/src/app.module.ts` (module registration only)

### Forbidden Files

- Any Stage 0-4 module directories
- Any core infrastructure files (except via Gate 2.1)
- `backend/prisma/schema.prisma`

### Required Endpoints

**Scheduled Triggers:**

- POST /scheduled-triggers
- GET /scheduled-triggers
- GET /scheduled-triggers/:id
- PATCH /scheduled-triggers/:id
- DELETE /scheduled-triggers/:id

**Deferred Execution:**

- GET /deferred-executions
- GET /deferred-executions/:id
- GET /deferred-executions/:id/attempts
- POST /deferred-executions/:id/retry (manual retry)

### Implementation Requirements

1. All controllers use `@UseGuards(JwtAuthGuard, TenantGuard)`
2. No organizationId in DTOs
3. Tenant context from CLS only
4. Cross-tenant access returns 404

### Verification Commands

```bash
cd backend

# Lint
npm run lint

# Build
npm run build

# Security linter
$env:BASSAN_STAGE=5
npm run test -- --testPathPattern=security-linter --forceExit
Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue
```

### Pass Criteria

- Lint passes (0 errors)
- Build succeeds
- Security linter passes (all S5 rules)

### Fail Criteria

- Lint errors
- Build errors
- Security linter failures

### Hard Stop Rules

- Any modification to Stage 0-4 files is a STOP.
- Any security guard misconfiguration is a STOP.

---

## Gate 4: Integration Tests

### Objective

Create and execute integration tests verifying Stage 5 functionality.

### Allowed Files

- `backend/tests/integration/stage5-async.spec.ts`
- `backend/tests/utils/db.ts` (add Stage 5 tables to reset)

### Forbidden Files

- Any file under `backend/src/**`
- Any existing test files (must not modify)

### Required Test Scenarios

1. **Scheduled Trigger CRUD**
   - Create scheduled trigger with cron expression
   - Create scheduled trigger with delay
   - Query scheduled triggers
   - Update scheduled trigger (activate/deactivate)
   - Delete scheduled trigger

2. **Deferred Execution Lifecycle**
   - Create deferred execution from schedule
   - Query pending executions
   - Process execution successfully
   - Verify workflow instance created

3. **Retry Behavior**
   - Simulate transient failure
   - Verify retry with backoff
   - Verify attempt records created
   - Verify retry count increment

4. **Dead Letter Handling**
   - Exhaust all retries
   - Verify dead letter state
   - Verify no further processing

5. **Idempotency**
   - Submit duplicate execution
   - Verify only one instance created
   - Verify idempotent response

6. **Cross-Tenant Isolation**
   - Victim creates schedule
   - Attacker cannot access (returns 404)
   - Victim executions not visible to attacker

### Verification Commands

```bash
cd backend

# Run Stage 5 integration tests
$env:BASSAN_STAGE=5
$env:BASSAN_PATCH="5.1"
npm run test -- --testPathPattern=stage5-async --forceExit
Remove-Item Env:\BASSAN_PATCH -ErrorAction SilentlyContinue
Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue
```

### Pass Criteria

- All test scenarios pass
- No test failures
- Exit code 0

### Fail Criteria

- Any test failure
- Missing test coverage for required scenarios

### Hard Stop Rules

- If cross-tenant isolation fails, STOP immediately.
- If idempotency fails, STOP immediately.

---

## Gate 4.1: Stage 4 Regression Verification

### Objective

Verify that Stage 4 functionality remains unchanged after Stage 5 implementation.

### Allowed Files

None. This gate is verification only.

### Forbidden Actions

- Any file modifications
- Any code changes

### Verification Commands

```bash
cd backend

# Run Stage 4 integration tests
$env:BASSAN_STAGE=4
$env:BASSAN_PATCH="4.1"
npm run test -- --testPathPattern=stage4-triggers --forceExit
Remove-Item Env:\BASSAN_PATCH -ErrorAction SilentlyContinue
Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue

# Run Stage 3 integration tests
npm run test -- --testPathPattern=stage3-execution --forceExit

# Verify Stage 4 endpoints still respond correctly
# (Manual verification or automated E2E if available)
```

### Pass Criteria

- Stage 4 integration tests: 7/7 pass
- Stage 3 integration tests: pass
- No behavioral changes in Stage 4 endpoints

### Fail Criteria

- Any Stage 3 or Stage 4 test failure
- Any behavioral change detected

### Hard Stop Rules

- If Stage 4 tests fail, STOP. S5-I2 violated.
- Stage 5 cannot be completed until Stage 4 regression passes.

---

## Gate 5: Release & Lock

### Objective

Commit all Stage 5 changes, push to remote, and declare Stage 5 complete.

### Allowed Files

- `backend/STAGE_5_LOCK_DECLARATION.md` (new file)

### Required Actions

1. Verify git status clean (only Stage 5 files)
2. Stage all Stage 5 files
3. Commit with governance message
4. Push to remote
5. Create STAGE_5_LOCK_DECLARATION.md
6. Commit and push lock declaration

### Verification Commands

```bash
cd backend

# Check status
git status --porcelain

# Add and commit implementation
git add .
git commit -m "feat(stage5): implement async execution & deferred automation"

# Push
git push

# Create lock declaration (separate commit)
# (Lock declaration created as documentation)

git add STAGE_5_LOCK_DECLARATION.md
git commit -m "docs(governance): Stage 5 official lock & completion declaration"
git push

# Final clean check
git status --porcelain
```

### Pass Criteria

- All changes committed
- Push succeeds
- Remote updated
- Lock declaration created and pushed
- Git status clean

### Fail Criteria

- Uncommitted changes remain
- Push fails
- Remote not updated

### Hard Stop Rules

- Do not create lock declaration until all other gates pass.
- Do not push until all verification complete.

---

## Gate Execution Rules

### Sequencing

Gates must be executed in order: 0 → 1 → 2 → 2.1 → 3 → 4 → 4.1 → 5

No gate may be started until the previous gate passes.

### Evidence Requirements

For each gate, the following must be recorded:

- Verification command output
- Pass/Fail determination
- Timestamp of completion
- Any notes or exceptions

### Rollback Protocol

If a gate fails:

1. Stop immediately
2. Document the failure
3. Identify root cause
4. Remediate
5. Re-run failed gate from beginning
6. Previous gates do not need re-verification unless affected

### Exception Handling

If an unexpected issue arises:

1. Stop execution
2. Document the issue in detail
3. Consult Architecture Authority
4. Receive written authorization before proceeding
5. Document the exception and authorization

---

**Document Status:** FINAL  
**Execution Authority:** Architecture & Governance Authority  
**Date:** 2026-01-18
