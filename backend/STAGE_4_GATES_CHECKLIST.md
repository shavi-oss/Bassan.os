# STAGE 4 GATES CHECKLIST — Workflow Triggers & Automation

**Status:** PENDING EXECUTION  
**Execution Mode:** STRICT · FAIL-CLOSED · IMMUTABLE

---

## GATE 0 — Baseline Verification

**Objective:** Ensure a clean, lawful baseline before starting.

- Command:
  ```bash
  git status --porcelain
Pass Criteria: output is empty

Hard Stop Rules

If dirty: stop and clean baseline first.

No edits allowed in Gate 0.

GATE 1 — Security Linter Extension (Stage 4)
Objective: Extend the security linter to allow only Stage 4 scope additions and enforce Stage 4 endpoint/module allowlists.

Files Allowed

backend/tests/security/security-linter.spec.ts

Verification

bash
Copy code
cd backend
$env:BASSAN_STAGE=4
npm run test -- --testPathPattern=security-linter --forceExit
Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue
Pass Criteria

All tests PASS

No weakening of existing enforcement

Immutability checks still fail if Stage 0–3 artifacts change (unless authorized patch in Gate 2.1)

GATE 2 — Database Layer (Schema & Migration)
Objective: Add Stage 4 models and generate migration.

Files Allowed

backend/prisma/schema.prisma

backend/prisma/migrations/** (auto-generated)

No other files

Execution

bash
Copy code
cd backend
npx prisma format
npx prisma migrate dev --name stage4_triggers
npx prisma generate
npm run build
Pass Criteria

Migration created

Prisma client generated

Build passes

No destructive reset commands used

GATE 2.1 — Governance Patch (Stage 4.1)
Objective: Register new models for tenant isolation.

Files Allowed

backend/src/core/database/prisma.extension.ts (ONLY for patch)

backend/tests/security/security-linter.spec.ts (ONLY for patch allowlist logic)

Execution

bash
Copy code
cd backend
$env:BASSAN_STAGE=4
$env:BASSAN_PATCH="4.1"
npm run test -- --testPathPattern=security-linter --forceExit
Remove-Item Env:\BASSAN_PATCH -ErrorAction SilentlyContinue
Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue
Pass Criteria

With BASSAN_PATCH="4.1": linter PASS and allows only the authorized patch file change(s)

Without BASSAN_PATCH: linter MUST FAIL if prisma.extension.ts was modified

Any other Stage 0–3 file changes = FAIL

GATE 3 — Module Implementation
Objective: Implement the workflow-triggers module and register it.

Files Allowed

backend/src/modules/workflow-triggers/**

backend/src/app.module.ts (register module)

Verification

bash
Copy code
cd backend
npm run lint
npm run build
$env:BASSAN_STAGE=4
npm run test -- --testPathPattern=security-linter --forceExit
Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue
Pass Criteria

Lint passes

Build passes

Security linter passes under Stage 4

GATE 4 — Integration Tests
Objective: Verify correct behavior and isolation.

Files Allowed

backend/tests/integration/stage4-triggers.spec.ts

backend/tests/utils/db.ts (if needed)

Verification

bash
Copy code
cd backend
$env:BASSAN_STAGE=4
$env:BASSAN_PATCH="4.1"
npm run test -- --testPathPattern=stage4-triggers --forceExit
Remove-Item Env:\BASSAN_PATCH -ErrorAction SilentlyContinue
Remove-Item Env:\BASSAN_STAGE -ErrorAction SilentlyContinue
Pass Criteria

All tests PASS:

Happy path: event → instance created

Missing trigger → 404

Inactive trigger → 400

Definition not ACTIVE → 400

Cross-tenant access → 404

GATE 5 — Release & Lock
Objective: Evidence, Tag, Merge, and lock Stage 4.

Files Allowed

backend/EVIDENCE/**

Release Steps

Generate evidence logs (commands + outputs)

Commit message: feat(stage4): workflow triggers & automation

Tag: stage-4.1-final

Merge to master

Declare Stage 4 IMMUTABLE