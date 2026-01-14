# STAGE 2: Workflow Definition (Design-Time Only)

## Completion Report

**Status**: ✅ Complete  
**Date**: 2026-01-14  
**Author**: Principal Software Architect + Principal Security Engineer  
**Execution Mode**: STRICT · FAIL-CLOSED · IMMUTABLE

---

## What Was Built

### 1. Security Linter (Stage 2 Extensions)

**File**: `backend/tests/security/security-linter.spec.ts`

**New Rules Enforced**:

- **S2-L1**: `_unsafeClient` FORBIDDEN in `src/modules/workflows/**`
- **S2-L2**: Module allowlist extended (added `workflows`)
- **S2-L3**: Endpoint allowlist (14 new workflow endpoints)
- **S2-L4**: Guards mandatory (existing, applies to workflows)
- **S2-L5**: Prisma access via `prismaService.client` (existing)
- **S2-L6**: Dependency Freeze (git diff check for package.json)

**Status**: ✅ 7/7 tests passing

### 2. Prisma Schema (Design-Time Models ONLY)

**Models Added**:

1. **WorkflowDefinition**
   - `id`, `name`, `description`, `status` (DRAFT/ACTIVE/ARCHIVED)
   - `organizationId` (tenant-scoped)
   - `createdAt`, `updatedAt` (standard record keeping)
2. **WorkflowState**
   - `id`, `workflowDefinitionId`, `name`, `description`
   - `isStart`, `isEnd` (boolean flags)
   - NO runtime fields
3. **WorkflowTransition**
   - `id`, `workflowDefinitionId`, `fromStateId`, `toStateId`, `label`
   - NO runtime fields

**Enum Added**:

- `WorkflowStatus` (DRAFT | ACTIVE | ARCHIVED)

**HARD LAW COMPLIANCE**:

- ❌ NO WorkflowInstance
- ❌ NO runtime fields (executedAt, startedAt, instanceId, etc.)
- ❌ NO background/job fields
- ✅ ONLY design-time entities

### 3. Workflow Validation Service (PURE DOMAIN SERVICE)

**File**: `src/modules/workflows/workflow-validation.service.ts`

**Validation Checks**:

1. Exactly ONE start state
2. At least ONE end state
3. All states reachable from start (BFS graph traversal)
4. No orphan states
5. No invalid transitions (references to non-existent states)

**VALIDATION ENGINE LAWS COMPLIANCE**:

- ✅ Pure domain service (no side effects)
- ✅ NO database writes
- ✅ NO HTTP/controller awareness
- ✅ Deterministic and testable
- ✅ Returns structured errors

### 4. Workflows Module (Complete)

**Files Created**:

- `src/modules/workflows/workflows.module.ts`
- `src/modules/workflows/workflows.controller.ts`
- `src/modules/workflows/workflows.service.ts`
- `src/modules/workflows/workflow-validation.service.ts`
- `src/modules/workflows/dto/create-workflow.dto.ts`
- `src/modules/workflows/dto/update-workflow.dto.ts`
- `src/modules/workflows/dto/create-state.dto.ts`
- `src/modules/workflows/dto/update-state.dto.ts`
- `src/modules/workflows/dto/create-transition.dto.ts`

**Endpoints Implemented** (14):

- `POST /workflows` - Create (DRAFT)
- `GET /workflows` - List
- `GET /workflows/:id` - Get
- `PATCH /workflows/:id` - Update (DRAFT only)
- `POST /workflows/:id/activate` - Activate (with validation)
- `POST /workflows/:id/archive` - Archive
- `POST /workflows/:id/states` - Create state
- `GET /workflows/:id/states` - List states
- `PATCH /workflows/:id/states/:stateId` - Update state (DRAFT only)
- `DELETE /workflows/:id/states/:stateId` - Delete state (DRAFT only)
- `POST /workflows/:id/transitions` - Create transition
- `GET /workflows/:id/transitions` - List transitions
- `DELETE /workflows/:id/transitions/:transitionId` - Delete transition (DRAFT only)

**Business Laws Enforced**:

- ✅ ACTIVE workflows are IMMUTABLE
- ✅ ARCHIVED workflows are READ-ONLY
- ✅ Mutations ONLY in DRAFT
- ✅ Activation uses TRANSACTION LAW (single boundary)

**ACTIVATION TRANSACTION LAW COMPLIANCE**:

```typescript
async activate(id: string) {
  return await this.prisma.client.$transaction(async (tx) => {
    // 1. Re-fetch within transaction
    const workflow = await tx.workflowDefinition.findUnique({...});

    // 2. Run validation (pure)
    const validationResult = this.validationService.validate(...);

    // 3. If invalid → throw (rollback)
    if (!validationResult.valid) {
      throw new BadRequestException({...});
    }

    // 4. If valid → update status to ACTIVE
    return await tx.workflowDefinition.update({...});
  });
}
```

### 5. App Module Updates

**File Modified**: `src/app.module.ts`

**Changes**:

- Added: `WorkflowsModule` to imports

---

## Decisions Made

| Decision                          | Rationale                                                  |
| --------------------------------- | ---------------------------------------------------------- |
| Pure domain validation service    | Enforces testability, no side effects                      |
| Single transaction for activation | Prevents partial activation, ensures atomicity             |
| Strict lifecycle enforcement      | Prevents accidental mutations of ACTIVE/ARCHIVED workflows |
| Design-time only schema           | No runtime fields, prevents scope creep into Stage 3       |
| Dependency freeze enforcement     | Prevents unnecessary lib additions                         |

---

## Deviations from Plan

**None.**

All endpoints, models, and security measures implemented exactly as specified in `STAGE_2_PLAN.md`.

---

## Security Validation

| Check                            | Status                    |
| -------------------------------- | ------------------------- |
| Security linter (S2-L1 to S2-L6) | ✅ 7/7 passing            |
| Build                            | ✅ Success (Exit code: 0) |
| All controllers have guards      | ✅ Verified by S2-L4      |
| No endpoints outside allowlist   | ✅ Verified by S2-L3      |
| No modules outside allowlist     | ✅ Verified by S2-L2      |
| `_unsafeClient` not in workflows | ✅ Verified by S2-L1      |
| Dependency freeze                | ✅ Verified by S2-L6      |

---

## Files Summary

### Created (10 files)

- Workflows module: 9 files (controller, service, validation service, 5 DTOs, module)
- Completion artifacts: 1 file (this file)

### Modified (3 files)

- `prisma/schema.prisma` (added 3 models + 1 enum)
- `src/security/security-linter.spec.ts` (added S2 rules)
- `src/app.module.ts` (added WorkflowsModule)

---

## Next Steps

**STOP for Gate 3 Approval.**

Do NOT proceed to Stage 3 (Workflow Execution) without explicit approval.

## Multi-Tenancy Doctrine

- CLS for root models
- Relation-based filtering for indirect models
- Parent–child implicit filtering
- This approach is INTENTIONAL, NOT transitional
