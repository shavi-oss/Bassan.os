**STATUS: PATCH AUTHORIZATION — PENDING APPROVAL**

---

# STAGE 6 PATCH 6.0 — DEPENDENCY AUTHORIZATION

**Project:** Bassan.os  
**Stage:** 6 — Background Execution Engine & Scheduler Runtime  
**Patch:** 6.0 — Cron Parser Dependency  
**Date:** 2026-01-19  
**Authority:** Architecture & Governance Authority

---

## Patch Declaration

This document formally requests authorization to add the `cron-parser` npm dependency to `backend/package.json` and `backend/package-lock.json`.

**Patch Type:** Dependency Addition  
**Scope:** Stage 6 Infrastructure Dependency  
**Impact:** Enables Gate 2 (Cron Validation Service) completion

---

## Justification

### Problem Statement

Gate 2 of Stage 6 requires implementation of `CronValidationService` with the following methods:

1. `validateCronExpression(expression: string)` — Validate cron syntax
2. `validateTimezone(timezone: string)` — Validate IANA timezone
3. `calculateNextExecution(expression: string, timezone: string)` — Calculate next execution time

**Current Blocker:**

- S2-L6 (Dependency Freeze) states: "package.json must be immutable (no changes allowed)"
- Full cron validation requires robust cron parsing library
- Native JavaScript implementation is insufficient for production-grade cron parsing

**Attempted Workaround:**

- Implemented basic validation with native JavaScript regex
- `calculateNextExecution()` method stubbed with error: "pending dependency patch authorization"
- Gate 2 cannot be completed without full implementation

### Why This Patch Is Necessary

1. **Gate 2 Requirement:** STAGE_6_GATES_CHECKLIST.md explicitly requires cron validation service
2. **Production Quality:** Cron parsing is complex; native implementation would be error-prone
3. **Industry Standard:** `cron-parser` is the standard library for cron expression parsing in Node.js
4. **No Alternative:** No existing dependency in package.json provides cron parsing functionality

---

## Scope

### Allowed Files

**ONLY the following files may be modified:**

- `backend/package.json` (add `cron-parser` to dependencies)
- `backend/package-lock.json` (npm install lockfile update)

### Forbidden Files

**ALL other files are FORBIDDEN**, including:

- Any Stage 0-5 artifacts
- Any governance documents
- Any source code files (implementation changes are separate)

---

## Proposed Changes

### package.json

**Add to `dependencies` section:**

```json
{
  "dependencies": {
    "cron-parser": "^4.9.0"
  }
}
```

**Rationale:**

- Version `^4.9.0` is latest stable as of 2026-01-19
- Supports 5-field and 6-field cron expressions
- Supports timezone-aware calculations
- Well-maintained, 10M+ weekly downloads

### package-lock.json

**Automatic update via:**

```bash
npm install cron-parser
```

**Expected Changes:**

- Add `cron-parser` entry with resolved version and integrity hash
- Add transitive dependencies (if any)

---

## Verification Plan

### Pre-Patch Verification

1. Verify clean git status (no uncommitted changes to package.json/package-lock.json)
2. Verify Stage 5 tests pass (14/14)
3. Verify security linter passes at Stage 6

### Patch Execution

```bash
cd backend
npm install cron-parser
```

### Post-Patch Verification

**Required Checks:**

1. **Lint:** `npm run lint` (exit code 0)
2. **Build:** `npm run build` (exit code 0)
3. **Security Linter (Stage 6):**

   ```bash
   $env:BASSAN_STAGE=6
   $env:BASSAN_PATCH="6.0"
   npm run test -- --testPathPattern=security-linter --forceExit
   Remove-Item Env:\BASSAN_PATCH -ErrorAction SilentlyContinue
   Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue
   ```

   - **Expected:** S2-L6 PASS (dependency change allowed when `BASSAN_PATCH=6.0`)

4. **Stage 5 Regression:**

   ```bash
   $env:BASSAN_STAGE=5
   $env:BASSAN_PATCH="5.3"
   npm run test -- --testPathPattern=stage5-async --forceExit
   Remove-Item Env:\BASSAN_PATCH -ErrorAction SilentlyContinue
   Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue
   ```

   - **Expected:** 14/14 tests pass

5. **Cron Validation Unit Tests:**
   ```bash
   npm run test -- --testPathPattern=cron-validation --forceExit
   ```

   - **Expected:** All tests pass (after implementing full `calculateNextExecution()`)

### Pass Criteria

- ✅ Lint passes (0 errors)
- ✅ Build succeeds
- ✅ Security linter passes with `BASSAN_PATCH=6.0`
- ✅ Stage 5 tests pass (14/14)
- ✅ No unintended dependency additions (only `cron-parser` added)

### Fail Criteria

- ❌ Lint errors
- ❌ Build errors
- ❌ Security linter failures (except expected S2-L6 when `BASSAN_PATCH` not set)
- ❌ Stage 5 regression (any test failure)
- ❌ Additional dependencies added beyond `cron-parser`

---

## Security Linter Compatibility

**Note:** This patch requires **STAGE_6_PATCH_6.1** to be applied FIRST to update security linter logic.

**S2-L6 Modification Required:**

The security linter must be updated to allow `package.json` changes when `BASSAN_PATCH=6.0`:

```typescript
// In S2-L6: Dependency Freeze test
const PATCH_VERSION = process.env.BASSAN_PATCH;

if (PATCH_VERSION === "6.0") {
  // PASS - Patch 6.0 authorizes cron-parser dependency addition
  return;
}

// Otherwise, enforce dependency freeze
if (diff && diff.trim().length > 0) {
  throw new Error("S2-L6 VIOLATION: package.json modified");
}
```

---

## Rollback Plan

If patch fails verification:

```bash
cd backend
git checkout HEAD -- package.json package-lock.json
npm install  # Restore dependencies to HEAD state
```

---

## Approval Requirements

**Required Approvals:**

- ✅ Architecture & Governance Authority

**Approval Criteria:**

- Patch is minimal (only adds `cron-parser`)
- Verification plan is comprehensive
- No Stage 0-5 impact
- Security linter compatibility addressed

---

## Signature Block

**Patch Requested By:** Stage 6 Execution Agent  
**Patch Type:** Dependency Addition  
**Scope:** Stage 6 Infrastructure  
**Impact:** Enables Gate 2 completion

**Status:** PENDING APPROVAL  
**Date:** 2026-01-19

---

**END OF PATCH AUTHORIZATION REQUEST**
