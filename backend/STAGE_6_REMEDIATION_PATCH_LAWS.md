# Stage 6 Remediation Patch Laws

## Immutable Security Boundaries

### Law 1: Tenant Isolation is Sacrosanct

- **Enforcement**: `prisma.extension.ts` MUST NOT be modified
- **Rationale**: Security-critical fail-closed policy protects against tenant data leakage
- **Violation**: STOP immediately, revert all changes

### Law 2: GLOBAL_MODELS Whitelist is Frozen

- **Current Whitelist**: `Organization`, `SystemConfig`
- **Prohibition**: No additions to GLOBAL_MODELS for this patch
- **Rationale**: Expanding whitelist weakens security posture
- **Violation**: STOP immediately, revert all changes

### Law 3: No \_unsafeClient Usage

- **Prohibition**: All database access MUST use `prisma.client` (tenant-scoped)
- **Rationale**: `_unsafeClient` bypasses tenant isolation
- **Detection**: Security linter will fail
- **Violation**: STOP immediately, revert all changes

## Scope Enforcement

### Law 4: Allowed File Modifications (Exhaustive List)

- `src/modules/scheduler/scheduler.service.ts`
- `src/modules/executor/executor.service.ts`
- `src/app.module.ts` (imports array only, no reformatting)

### Law 5: Forbidden Modifications (Non-Exhaustive)

- Any file in `src/core/**`
- Any file in `src/prisma/**`
- Any Stage 0-5 artifact
- `prisma/schema.prisma`
- `package.json` or `package-lock.json`
- Any test file except re-running existing tests

### Law 6: New File Creation

- **Allowed**: Helper modules ONLY within `src/modules/scheduler/` or `src/modules/executor/`
- **Requirement**: Must be justified in patch documentation
- **Prohibition**: No new files outside these directories

## Implementation Constraints

### Law 7: CLS Context is Mandatory

- **Requirement**: All tenant-scoped queries MUST execute within `clsService.run()` with `orgId` set
- **CLS Keys**: Use exact keys from `prisma.extension.ts`: `"orgId"` and `"userId"`
- **Pattern**:
  ```typescript
  clsService.run(async () => {
    clsService.set("orgId", organizationId);
    clsService.set("userId", "system-worker");
    // queries here
  });
  ```

### Law 8: Tenant Iteration is Required

- **Requirement**: Workers MUST iterate all organizations explicitly
- **Source**: `prisma.client.organization.findMany()` (GLOBAL_MODEL)
- **Rationale**: No cross-tenant queries without context

### Law 9: Error Isolation

- **Requirement**: Per-tenant errors MUST NOT stop iteration
- **Pattern**: Catch errors per tenant, log, continue to next tenant
- **Rationale**: One tenant's failure should not block others

### Law 10: Existing Logic Preservation

- **Scheduler**: Maintain cron validation, polling loop, batch limits
- **Executor**: Maintain idempotency, retry, dead-letter, batch limits
- **Prohibition**: No refactoring beyond CLS integration

## Verification Enforcement

### Law 11: Verification Order is Strict

1. Lint
2. Build
3. Security Linter (Stage 6)
4. Integration Tests (Gate 5)

**Violation**: If any step fails, STOP. Do not proceed to next step.

### Law 12: Scope Verification

- **Before Edits**: `git status --porcelain` and `git diff --name-only` MUST be clean
- **After Edits**: `git diff --name-only` MUST show only allowed files
- **Violation**: STOP, report unauthorized changes

### Law 13: Test Pass Criteria

- **Gate 5 Integration Tests**: MUST pass without `TENANT_ISOLATION_VIOLATION`
- **Security Linter**: MUST pass with `BASSAN_STAGE=6`
- **Failure**: STOP, analyze root cause, do not commit

## Commit & Release Enforcement

### Law 14: Commit Message Format

- **Required**: `fix(stage6): remediation patch for background workers tenant context`
- **Prohibition**: No other format accepted

### Law 15: Tag Format

- **Required**: `stage6-remediation-patch-1`
- **Prohibition**: No other tag format accepted

### Law 16: Push Requirement

- **Required**: Tag MUST be pushed to origin
- **Command**: `git push origin stage6-remediation-patch-1`

## Governance Artifacts

### Law 17: Required Documentation

- `STAGE_6_REMEDIATION_PATCH_PLAN.md` (this document's companion)
- `STAGE_6_REMEDIATION_PATCH_LAWS.md` (this document)
- `STAGE_6_REMEDIATION_PATCH_COMPLETION.md` (created after verification)

### Law 18: Documentation Accuracy

- **Requirement**: All claims MUST be evidence-backed
- **Prohibition**: No speculation, no assumptions
- **Format**: Cite line numbers from source files

## Emergency Stop Conditions

### Law 19: Hard Stop Triggers

- Any security linter failure
- Any unauthorized file modification detected
- Any `_unsafeClient` usage detected
- Any GLOBAL_MODELS expansion attempt
- Any `prisma.extension.ts` modification

### Law 20: Stop Procedure

1. STOP all work immediately
2. Revert all uncommitted changes
3. Report exact error with evidence
4. Await explicit authorization to proceed
