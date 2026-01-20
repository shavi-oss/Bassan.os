# Stage 6 Remediation Patch Plan

## Evidence Reference

**Gate 5 Integration Test Failure:**

- **Error**: `TENANT_ISOLATION_VIOLATION: No tenant context for ScheduledTrigger.findMany/DeferredExecution.findMany`
- **Root Cause**: Background workers (`SchedulerService`, `ExecutorService`) query tenant-scoped models without active CLS tenant context
- **Source**: `tests/integration/stage6-background-workers.spec.ts` execution results
- **Prisma Extension**: Lines 111-112 of `src/core/database/prisma.extension.ts` show CLS keys: `clsService.get("orgId")` and `clsService.get("userId")`

## Governing Documents

**STAGE_6_PLAN.md Lines 53-65:**

- Background Scheduler Worker: "Evaluate scheduled triggers for due execution"
- Background Executor Worker: "Process pending deferred executions"
- Both require tenant-scoped operations

**STAGE_6_GATES_CHECKLIST.md Lines 363-369:**

- Required Test Scenarios include Scheduler Evaluation, Executor Processing, Tenant Isolation

## Problem Statement

Stage 6 background workers cannot execute tenant-scoped queries because they lack CLS tenant context. The fail-closed security policy in `prisma.extension.ts` correctly blocks these operations.

## Solution: Tenant Iteration with CLS Context

### Strategy

Implement "Tenant Iteration + CLS per Tenant" pattern:

1. Fetch all tenants using `Organization` (GLOBAL_MODEL, no context required)
2. For each tenant, establish CLS context with `orgId` and `userId`
3. Execute tenant-scoped queries within that context
4. Aggregate results across all tenants

### Technical Implementation

**CLS Context Establishment:**

```typescript
clsService.run(async () => {
  clsService.set("orgId", organizationId);
  clsService.set("userId", "system-worker");
  // tenant-scoped operations here
});
```

**Key Design Decisions:**

- Use `clsService.run()` + `clsService.set()` (not `runWith()`) to avoid TS2353 type errors
- Set `userId` to `"system-worker"` for audit trail
- Maintain existing batch limits per tenant
- Catch and log per-tenant errors without stopping iteration

## Scope Lock

### Allowed Modifications

- ✅ `src/modules/scheduler/scheduler.service.ts`
- ✅ `src/modules/executor/executor.service.ts`
- ✅ `src/app.module.ts` (imports array only, if needed)

### Forbidden Modifications

- ❌ `src/core/database/prisma.extension.ts` (SECURITY-CRITICAL)
- ❌ GLOBAL_MODELS allowlist
- ❌ Any Stage 0-5 artifacts
- ❌ Prisma schema
- ❌ package.json dependencies
- ❌ Any use of `_unsafeClient`

### New Files (if absolutely required)

- Helper modules ONLY within `src/modules/scheduler/` or `src/modules/executor/`

## Implementation Requirements

### SchedulerService Changes

1. Inject `ClsService` via constructor
2. Modify `processDueTriggers()`:
   - Fetch all organizations via `prisma.client.organization.findMany()`
   - For each org, run `clsService.run()` with `orgId` set
   - Query `ScheduledTrigger.findMany()` within CLS context
   - Process triggers for that tenant
3. Maintain existing polling loop, cron validation, error handling

### ExecutorService Changes

1. Inject `ClsService` via constructor
2. Implement `OnModuleInit` and background polling (if not present)
3. Modify `processDueExecutions()`:
   - Fetch all organizations via `prisma.client.organization.findMany()`
   - For each org, run `clsService.run()` with `orgId` set
   - Query `DeferredExecution.findMany()` within CLS context
   - Process executions for that tenant
4. Maintain existing idempotency, retry, dead-letter logic

## Security Guarantees

- **No Security Weakening**: Tenant isolation remains fail-closed
- **No GLOBAL_MODELS Expansion**: Organization already in whitelist
- **Audit Trail**: All operations tagged with `userId: "system-worker"`
- **Tenant Scoping**: All queries execute with explicit `orgId` in CLS

## Verification Commands

Execute in strict order from `backend/`:

```bash
# 1. Lint
npm run lint

# 2. Build
npm run build

# 3. Security Linter (Stage 6)
$env:BASSAN_STAGE=6
npm run test -- --testPathPattern=security-linter --forceExit
Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue

# 4. Integration Tests (Gate 5)
npm run test -- --testPathPattern=stage6-background-workers --forceExit
```

## Pass Criteria

- ✅ All verification commands exit with code 0
- ✅ Gate 5 integration tests pass without `TENANT_ISOLATION_VIOLATION`
- ✅ `git diff --name-only` shows only allowed files
- ✅ No scope violations detected

## Fail Criteria

- ❌ Any verification command fails
- ❌ `TENANT_ISOLATION_VIOLATION` persists
- ❌ Unauthorized file modifications detected
- ❌ Security linter detects violations

## Commit & Tag

**Commit Message:**

```
fix(stage6): remediation patch for background workers tenant context
```

**Tag:**

```
stage6-remediation-patch-1
```

**Push:**

```bash
git push origin stage6-remediation-patch-1
```
