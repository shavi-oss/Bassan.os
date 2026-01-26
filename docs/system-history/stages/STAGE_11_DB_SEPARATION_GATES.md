# STAGE 11 — Core / Layer Database Separation (GATES)

Project: Bassan.os  
Stage: 11 — Database Separation  
Document Type: EXECUTION GATES  
Execution Mode: STRICT · FAIL-CLOSED · GOVERNANCE-FIRST  
Status: INACTIVE (Planning Stage Only)

---

## Gate 11.1 — Authorization Gate (ABSOLUTE)

Execution of Stage 11 is FORBIDDEN unless:

- A dedicated Execution Stage is explicitly authorized
- `STAGE_11_DB_SEPARATION_PLAN.md` is LOCKED
- `STAGE_11_DB_SEPARATION_LAWS.md` is LOCKED
- This Gates document is referenced in the authorization

❌ No authorization → NO ACTION.

---

## Gate 11.2 — Scope Lock Gate

Before execution begins, the following MUST be verified:

### Allowed Scope (ONLY):

- Data extraction of **Layer tables only**
- Provisioning of new Layer database(s)
- Data import into Layer database(s)

### Forbidden Scope (HARD STOP):

- Modifying Core tables
- Deleting any Core data
- Changing Prisma schema
- Modifying Core code
- Introducing sync logic
- Introducing cross-db access

Any deviation results in immediate STOP.

---

## Gate 11.3 — Core Independence Gate

Before any migration step:

- Core must start successfully with:
  - Core DB ONLY
  - Layer DBs disconnected or absent
- Background workers must initialize normally
- No runtime dependency on Layer tables may exist

If Core fails to start → Gate FAIL → STOP.

---

## Gate 11.4 — Data Integrity Gate (Layer)

For each Layer table moved:

- Row counts must match before and after
- Primary keys must remain unchanged
- Enum values must remain consistent
- Referential integrity must hold inside Layer DB

Mismatch → STOP → Rollback.

---

## Gate 11.5 — Tenant Isolation Gate

After separation:

- Layer data must remain tenant-scoped
- No cross-tenant leakage allowed
- Core tenant boundaries must remain unchanged

Any tenant isolation violation → CRITICAL FAIL.

---

## Gate 11.6 — Behavioral Consistency Gate

The following behaviors MUST remain unchanged:

- Authentication flow
- Authorization checks
- Workflow execution
- Trigger scheduling
- Deferred execution & retries

Any behavioral drift → STOP.

---

## Gate 11.7 — Rollback Gate (MANDATORY)

Before execution:

- Full backup of Core DB exists
- Full backup of Layer data exists
- Restore procedures are tested

If rollback cannot be guaranteed,
execution MUST NOT start.

---

## Gate 11.8 — Observability Gate

During execution:

- Logs must be enabled
- Errors must be surfaced immediately
- Silent failures are forbidden

Post-execution:

- Logs must confirm successful completion
- No suppressed warnings allowed

---

## Gate 11.9 — Post-Execution Verification Gate

After execution completes:

- Core DB contains ONLY Core tables
- Layer DB contains ONLY Layer tables
- Core operates with no reference to Layer DB
- Layer DB can be taken offline without impacting Core

Failure in any check → Execution INVALID.

---

## Gate 11.10 — Final Lock Gate

Upon successful verification:

- Stage 11 Execution is declared COMPLETE
- Resulting state is LOCKED & IMMUTABLE
- No further modification allowed without new stage

---

END OF STAGE 11 GATES
