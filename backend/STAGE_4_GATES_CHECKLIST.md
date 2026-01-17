# STAGE 4 GATES CHECKLIST: Workflow Triggers & Automation

**Status:** PENDING EXECUTION

---

## GATE 0: Baseline Verification

**Objective:** Ensure clean state before starting.

- [ ] **Files Allowed:** NONE
- **Command:** `git status --porcelain`
- **Pass Criteria:** Output is empty.

---

## GATE 1: Security Linter Extension

**Objective:** Update security rules for Stage 4 models and endpoints.

- [ ] **Files Allowed:** `backend/tests/security/security-linter.spec.ts`
- **Verification:**
  ```bash
  cd backend
  $env:BASSAN_STAGE=4
  npm run test -- --testPathPattern=security-linter --forceExit
  ```
- **Pass Criteria:** All tests PASS.

---

## GATE 2: Database Layer

**Objective:** Create Schema and Migration.

- [ ] **Files Allowed:**
  - `backend/prisma/schema.prisma`
  - `backend/prisma/migrations/**` (Auto-generated)
- **Execution:**
  ```bash
  cd backend
  npx prisma format
  npx prisma migrate dev --name stage4_triggers
  npx prisma generate
  npm run build
  ```
- **Pass Criteria:** Migration created, Prisma Client generated, Build passes.

---

## GATE 2.1: Governance Patch (Stage 4.1)

**Objective:** Register new models for Tenant Isolation.

- [ ] **Files Allowed:**
  - `backend/src/core/database/prisma.extension.ts`
  - `backend/tests/security/security-linter.spec.ts` (Exception logic)
- **Verification:**
  ```bash
  cd backend
  $env:BASSAN_STAGE=4
  $env:BASSAN_PATCH="4.1"
  npm run test -- --testPathPattern=security-linter --forceExit
  Remove-Item Env:\BASSAN_PATCH -ErrorAction SilentlyContinue
  ```
- **Pass Criteria:**
  - With `$env:BASSAN_PATCH="4.1"`: Security Linter MUST PASS and allow modification ONLY of `prisma.extension.ts` (and the linter exception logic).
  - Without `BASSAN_PATCH`: Security Linter MUST FAIL if `prisma.extension.ts` was modified (immutability enforced).

---

## GATE 3: Module Implementation

**Objective:** Implement Service, Controller, and Module.

- [ ] **Files Allowed:**
  - `backend/src/modules/workflow-triggers/**`
  - `backend/src/app.module.ts` (Register Module)
- **Verification:**
  ```bash
  cd backend
  npm run lint
  npm run build
  $env:BASSAN_STAGE=4
  npm run test -- --testPathPattern=security-linter --forceExit
  ```
- **Pass Criteria:** 0 Lint errors, Build passes, Security checks pass.

---

## GATE 4: Integration Tests

**Objective:** Verify runtime behavior and isolation.

- [ ] **Files Allowed:**
  - `backend/tests/integration/stage4-triggers.spec.ts`
  - `backend/tests/utils/db.ts`
- **Verification:**
  ```bash
  cd backend
  $env:BASSAN_STAGE=4
  $env:BASSAN_PATCH="4.1"
  npm run test -- --testPathPattern=stage4-triggers --forceExit
  ```
- **Pass Criteria:** All tests PASS (Happy Path + Cross-Tenant 404).

---

## GATE 5: Release

**Objective:** Evidence, Tag, and Merge.

- [ ] **Files Allowed:** `backend/EVIDENCE/**`
- **Execution:**
  1. Generate Evidence Logs.
  2. Commit: `feat(stage4): implement workflow triggers`
  3. Tag: `stage-4.1-final`
  4. Merge to `master`
