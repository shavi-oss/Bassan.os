**STATUS: GOVERNANCE (PLANNING-AUTHORIZED ONLY) — NO IMPLEMENTATION**

---

# STAGE 6 — GATES EXECUTION CHECKLIST

## Preamble

This document defines the gate-by-gate execution protocol for Stage 6 of the Bassan.os platform. Each gate must be completed in sequence. No gate may be skipped. A gate is considered complete only when all verification steps pass and evidence is recorded.

**Project:** Bassan.os  
**Stage:** 6 — Background Execution Engine & Scheduler Runtime  
**Execution Mode:** STRICT · FAIL-CLOSED · SEQUENTIAL  
**Prerequisites:** Stage 5 LOCKED (per backend/STAGE_5_FINAL_LOCK_DECLARATION.md)

---

## Gate Summary

| Gate | Name                      | Objective                                  |
| ---- | ------------------------- | ------------------------------------------ |
| 0    | Baseline Verification     | Verify clean state and Stage 5 integrity   |
| 1    | Security Linter Extension | Extend linter for Stage 6 scope            |
| 2    | Cron Validation Service   | Implement cron expression validation       |
| 3    | Scheduler Service         | Implement background schedule evaluation   |
| 4    | Executor Service          | Implement background execution processing  |
| 5    | Integration Tests         | Verify Stage 6 functionality               |
| 5.1  | Stage 5 Regression        | Verify Stage 5 remains unchanged           |
| 5.2  | Stage 4 Regression        | Verify Stage 4 remains unchanged           |
| 6    | Release & Lock            | Commit, push, and declare Stage 6 complete |

---

## Gate 0: Baseline Verification

### Objective

Verify that the working tree is clean, Stage 5 is locked, and the codebase is in a valid state for Stage 6 execution.

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

# Verify Stage 5 lock exists
cat STAGE_5_FINAL_LOCK_DECLARATION.md | head -20

# Verify lint passes
npm run lint

# Verify build passes
npm run build

# Verify Stage 5 tests pass
$env:BASSAN_STAGE=5
$env:BASSAN_PATCH="5.3"
npm run test -- --testPathPattern=stage5-async --forceExit
Remove-Item Env:\BASSAN_PATCH -ErrorAction SilentlyContinue
Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue
```

### Pass Criteria

- git status shows no uncommitted changes
- STAGE_5_FINAL_LOCK_DECLARATION.md exists and contains "LOCKED & IMMUTABLE"
- Lint exits with code 0
- Build exits with code 0
- Stage 5 integration tests pass (14/14)

### Fail Criteria

- Any uncommitted changes present
- STAGE_5_FINAL_LOCK_DECLARATION.md missing or incomplete
- Lint errors
- Build errors
- Stage 5 test failures

### Hard Stop Rules

- If Stage 5 tests fail, STOP. Do not proceed.
- If lock declaration missing, STOP. Stage 5 must be formally locked.

---

## Gate 1: Security Linter Extension

### Objective

Extend the security linter to enforce Stage 6 scope rules, module allowlist, and Stage 0-5 immutability verification.

### Allowed Files

- `backend/tests/security/security-linter.spec.ts`

### Forbidden Files

- Any file under `backend/src/**`
- Any file under `backend/prisma/**`
- Any Stage 0-5 artifacts

### Scope

1. Add Stage 6 conditional logic
2. Implement linter rule: Forbid `_unsafeClient` in Stage 6 modules
3. Implement linter rule: Module allowlist (scheduler, executor, cron-validation)
4. Implement linter rule: No new API endpoints (Stage 6 is background workers only)
5. Update immutability check to verify Stage 0-5 files unchanged

### Verification Commands

```bash
cd backend

# Run security linter at Stage 6
$env:BASSAN_STAGE=6
npm run test -- --testPathPattern=security-linter --forceExit
Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue
```

### Pass Criteria

- All existing Stage 5 security tests still pass
- New Stage 6 tests pass
- Immutability verification passes

### Fail Criteria

- Any Stage 5 test failure
- Any Stage 6 test failure
- Immutability violation detected

### Hard Stop Rules

- If Stage 5 immutability fails, STOP. Stage 0-5 artifacts may have been modified.

---

## Gate 2: Cron Validation Service

### Objective

Implement cron expression validation service.

### Allowed Files

- `backend/src/modules/cron-validation/**` (new directory)

### Forbidden Files

- Any modification to Stage 5 data models
- Any modification to Stage 5 controllers or DTOs
- Any modification to Stage 5 services
- Any file under `backend/prisma/**`

### Scope

Implement cron validation service with validation methods for cron expressions, timezones, and next execution time calculation.

> **NOTE:** Integration with Stage 5 `ScheduledTriggersService` requires formal Patch Authorization (STAGE_6_PATCH_6.1_AUTHORIZATION.md). This integration is deferred pending patch approval. Cron validation can be performed in SchedulerService (Stage 6) during schedule evaluation as an alternative.

### Verification Commands

```bash
cd backend

# Lint
npm run lint

# Build
npm run build

# Security linter
$env:BASSAN_STAGE=6
npm run test -- --testPathPattern=security-linter --forceExit
Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue

# Unit tests for cron validation
npm run test -- --testPathPattern=cron-validation --forceExit
```

### Pass Criteria

- Lint passes (0 errors)
- Build succeeds
- Security linter passes (all S6 rules)
- Cron validation unit tests pass

### Fail Criteria

- Lint errors
- Build errors
- Security linter failures
- Unit test failures

### Hard Stop Rules

- Any modification to Stage 5 files is a STOP.
- Any modification to Stage 5 API contract is a STOP.

---

## Gate 3: Scheduler Service

### Objective

Implement background scheduler service that evaluates schedules and creates deferred executions.

### Allowed Files

- `backend/src/modules/scheduler/**` (new directory)
- `backend/src/app.module.ts` (module registration only)

### Forbidden Files

- Any Stage 0-5 module directories
- Any core infrastructure files
- `backend/prisma/schema.prisma`

### Scope

Implement background scheduler service with polling loop, schedule evaluation, deferred execution creation, and graceful lifecycle management.

> **IMPLEMENTATION DETAILS:** See backend/STAGE_6_IMPLEMENTATION_SPEC.md for detailed specifications.

### Verification Commands

```bash
cd backend

# Lint
npm run lint

# Build
npm run build

# Security linter
$env:BASSAN_STAGE=6
npm run test -- --testPathPattern=security-linter --forceExit
Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue

# Unit tests for scheduler
npm run test -- --testPathPattern=scheduler.service --forceExit
```

### Pass Criteria

- Lint passes (0 errors)
- Build succeeds
- Security linter passes (all S6 rules)
- Scheduler unit tests pass

### Fail Criteria

- Lint errors
- Build errors
- Security linter failures
- Unit test failures

### Hard Stop Rules

- Any modification to Stage 0-5 files is a STOP.
- Any security guard misconfiguration is a STOP.

---

## Gate 4: Executor Service

### Objective

Implement background executor service that processes deferred executions and creates workflow instances.

### Allowed Files

- `backend/src/modules/executor/**` (new directory)
- `backend/src/app.module.ts` (module registration only)

### Forbidden Files

- Any Stage 0-5 module directories
- Any core infrastructure files
- `backend/prisma/schema.prisma`

### Scope

Implement background executor service with polling loop, execution claiming, idempotency checking, workflow instance creation, retry scheduling, and graceful lifecycle management.

> **IMPLEMENTATION DETAILS:** See backend/STAGE_6_IMPLEMENTATION_SPEC.md for detailed specifications.

### Verification Commands

```bash
cd backend

# Lint
npm run lint

# Build
npm run build

# Security linter
$env:BASSAN_STAGE=6
npm run test -- --testPathPattern=security-linter --forceExit
Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue

# Unit tests for executor
npm run test -- --testPathPattern=executor.service --forceExit
```

### Pass Criteria

- Lint passes (0 errors)
- Build succeeds
- Security linter passes (all S6 rules)
- Executor unit tests pass

### Fail Criteria

- Lint errors
- Build errors
- Security linter failures
- Unit test failures

### Hard Stop Rules

- Any modification to Stage 0-5 files is a STOP.
- Any security guard misconfiguration is a STOP.

---

## Gate 5: Integration Tests

### Objective

Create and execute integration tests verifying Stage 6 functionality.

### Allowed Files

- `backend/tests/integration/stage6-background-workers.spec.ts` (new file)

### Forbidden Files

- Any file under `backend/src/**`
- Any existing test files (must not modify)

### Required Test Scenarios

1. Scheduler Evaluation
2. Executor Processing
3. Retry Behavior
4. Dead Letter Handling
5. Idempotency
6. Graceful Shutdown
7. Tenant Isolation

> **TEST SPECIFICATIONS:** See backend/STAGE_6_IMPLEMENTATION_SPEC.md for detailed test scenario specifications.

### Verification Commands

```bash
cd backend

# Run Stage 6 integration tests
$env:BASSAN_STAGE=6
npm run test -- --testPathPattern=stage6-background-workers --forceExit
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

- If tenant isolation fails, STOP immediately.
- If idempotency fails, STOP immediately.

---

## Gate 5.1: Stage 5 Regression Verification

### Objective

Verify that Stage 5 functionality remains unchanged after Stage 6 implementation.

### Allowed Files

None. This gate is verification only.

### Forbidden Actions

- Any file modifications
- Any code changes

### Verification Commands

```bash
cd backend

# Run Stage 5 integration tests
$env:BASSAN_STAGE=5
$env:BASSAN_PATCH="5.3"
npm run test -- --testPathPattern=stage5-async --forceExit
Remove-Item Env:\BASSAN_PATCH -ErrorAction SilentlyContinue
Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue
```

### Pass Criteria

- Stage 5 integration tests: 14/14 pass
- No behavioral changes in Stage 5 endpoints

### Fail Criteria

- Any Stage 5 test failure
- Any behavioral change detected

### Hard Stop Rules

- If Stage 5 tests fail, STOP. S6-I2 violated.
- Stage 6 cannot be completed until Stage 5 regression passes.

---

## Gate 5.2: Stage 4 Regression Verification

### Objective

Verify that Stage 4 functionality remains unchanged after Stage 6 implementation.

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
```

### Pass Criteria

- Stage 4 integration tests: 7/7 pass
- No behavioral changes in Stage 4 endpoints

### Fail Criteria

- Any Stage 4 test failure
- Any behavioral change detected

### Hard Stop Rules

- If Stage 4 tests fail, STOP. S6-I1 violated.
- Stage 6 cannot be completed until Stage 4 regression passes.

---

## Gate 6: Release & Lock

### Objective

Commit all Stage 6 changes, push to remote, and declare Stage 6 complete.

### Allowed Files

- `backend/STAGE_6_LOCK_DECLARATION.md` (new file)

### Required Actions

1. Verify git status clean (only Stage 6 files)
2. Stage all Stage 6 files
3. Commit with governance message
4. Push to remote
5. Create STAGE_6_LOCK_DECLARATION.md
6. Commit and push lock declaration

### Verification Commands

```bash
cd backend

# Check status
git status --porcelain

# Add and commit implementation
git add .
git commit -m "feat(stage6): implement background execution engine & scheduler runtime"

# Push
git push

# Create lock declaration (separate commit)
# (Lock declaration created as documentation)

git add STAGE_6_LOCK_DECLARATION.md
git commit -m "docs(governance): Stage 6 official lock & completion declaration"
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

Gates must be executed in order: 0 → 1 → 2 → 3 → 4 → 5 → 5.1 → 5.2 → 6

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

**Document Status:** GOVERNANCE (PLANNING-AUTHORIZED ONLY)  
**Execution Authority:** Architecture & Governance Authority  
**Date:** 2026-01-19
