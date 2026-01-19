# STAGE 5 PATCH 5.3 AUTHORIZATION

- **Stage**: 5 (Asynchronous Execution)
- **Patch**: 5.3
- **Date**: 2026-01-19
- **Execution Mode**: STRICT · FAIL-CLOSED · IMMUTABLE
- **Authority**: Emergency Hotfix (Test Infrastructure Defect)
- **Status**: AUTHORIZED

## Reason for Patch

Gate 4.1 regression verification uncovered a critical test infrastructure defect:

**Defect**: `tests/utils/db.ts` `resetDb()` function does not include Stage 5 tables in its TRUNCATE or deleteMany operations.

**Root Cause**: Stage 5 tables (`execution_attempts`, `deferred_executions`, `scheduled_triggers`) were manually removed from the reset infrastructure in a previous step, breaking database isolation between tests.

**Impact**:

- `resetDb()` clears Stage 0-4 tables but leaves Stage 5 tables with orphaned FK references
- Tests fail with `Foreign key constraint violated: users_organizationId_fkey` when creating new organizations/users
- Both Stage 5 and Stage 4 regression tests fail due to this infrastructure defect

## Patch Scope

### Authorized Changes

**File**: `backend/tests/utils/db.ts`

**Change 1 - TRUNCATE list (line 24-42)**:
Add Stage 5 tables to TRUNCATE statement in FK-safe order (children before parents):

```diff
 TRUNCATE TABLE
+  execution_attempts,
+  deferred_executions,
+  scheduled_triggers,
   workflow_trigger_events,
   workflow_triggers,
```

**Change 2 - deleteMany fallback (line 46-62)**:
Add Stage 5 tables to deleteMany transaction in FK-safe order:

```diff
 await prismaUnsafe.$transaction([
+  prismaUnsafe.executionAttempt.deleteMany(),
+  prismaUnsafe.deferredExecution.deleteMany(),
+  prismaUnsafe.scheduledTrigger.deleteMany(),
   prismaUnsafe.workflowTriggerEvent.deleteMany(),
```

### Forbidden Actions

- No changes to Stage 0-4 artifacts
- No changes to `prisma/schema.prisma`
- No changes to `package.json`
- No changes to test files (only test utilities)
- No changes to application code (`src/**`)
- No refactoring beyond the minimal fix

## Verification Plan

Execute the following commands in sequence (fail-closed):

1. **Lint**: `npm run lint`
2. **Build**: `npm run build`
3. **Stage 5 Integration Tests**: `$env:BASSAN_STAGE=5; npm run test -- --testPathPattern=stage5-async --forceExit`
4. **Stage 4 Regression**: `$env:BASSAN_STAGE=4; $env:BASSAN_PATCH='4.1'; npm run test -- --testPathPattern=stage4-triggers --forceExit`

**Pass Criteria**: All commands must exit with code 0 and all tests must pass (14/14 Stage 5, 7/7 Stage 4).

**Fail Criteria**: Any command failure halts the patch and requires escalation.

## Governance Compliance

- [x] **Minimal Scope**: Only add missing table names to existing lists
- [x] **Test Infrastructure Only**: No application code changes
- [x] **Stage 5 Scope**: Only affects Stage 5 test infrastructure
- [x] **Immutability Preserved**: No schema or dependency changes
- [x] **Emergency Authorization**: Gate 4.1 blocker justifies immediate patch
- [x] **Evidence Required**: Lock declaration must be created upon success

## Authorization Statement

This patch is authorized as an emergency hotfix to resolve a test infrastructure defect that blocks Gate 4.1 verification. The defect was introduced when Stage 5 tables were manually removed from the database reset utility, breaking test isolation.

**Authorized By**: Architecture & Governance Authority  
**Patch Code**: BASSAN_PATCH="5.3"  
**Effective**: 2026-01-19

---

**END OF AUTHORIZATION**
