# STAGE 11 — Core / Layer Database Separation (LAWS)

Project: Bassan.os  
Stage: 11 — Database Separation  
Document Type: GOVERNANCE & ARCHITECTURAL LAWS  
Execution Mode: STRICT · FAIL-CLOSED · IMMUTABLE  
Status: EFFECTIVE UPON STAGE AUTHORIZATION

---

## LAW 11.0 — CORE DATA PURITY

The Bassan.os Core Database MUST contain ONLY data required
for the operation of the Core Engine.

The following are STRICTLY FORBIDDEN inside the Core Database:

- Business-domain entities
- CRM-related tables
- Task management tables
- Sales, medical, or industry-specific models
- UI-facing or application-facing state

Violation of this law is considered a **Critical Architecture Breach**.

---

## LAW 11.1 — NO CORE DEPENDENCY ON LAYER DATA

The Core Engine MUST NOT:

- Read from Layer databases
- Write to Layer databases
- Assume the existence of Layer tables
- Fail or degrade if Layer databases are offline or absent

Core startup, execution, and background workers
MUST function independently of any Layer database.

---

## LAW 11.2 — PHYSICAL SEPARATION ONLY

Logical or schema-based separation (same database, different schema)
is NOT an acceptable final architecture.

Approved separation model:

- Physical database separation
- Independent PostgreSQL instances (or clusters)

Reason:

- Prevent hidden joins
- Prevent accidental coupling
- Enforce ownership boundaries

---

## LAW 11.3 — NO CROSS-DATABASE JOINS OR TRANSACTIONS

Under no circumstances may:

- Cross-database joins be introduced
- Distributed transactions be used
- Implicit data synchronization be assumed

Any interaction between Core and Layer systems
must occur via explicit APIs or events,
outside the Core Engine repository.

---

## LAW 11.4 — IMMUTABILITY OF CORE SCHEMA

The Core Database schema is IMMUTABLE by default.

Any schema change related to separation requires:

- A new authorized Execution Stage
- Explicit migration plans
- Rollback strategy
- Verification gates

Ad-hoc cleanup or “silent refactoring” is forbidden.

---

## LAW 11.5 — LAYER OWNERSHIP & RESPONSIBILITY

Layer Databases:

- Are owned by their respective repositories
- Control their own schema and migrations
- Bear responsibility for their own data integrity

The Bassan.os Core Team is NOT responsible
for Layer data correctness or lifecycle.

---

## LAW 11.6 — MIGRATION SAFETY

During any future separation execution:

- Core data must never be modified implicitly
- Layer data must never be deleted without backup
- Rollback must be possible at every step

If rollback is not possible,
the execution MUST NOT proceed.

---

## LAW 11.7 — PLATFORM NEUTRALITY

Database separation MUST NOT:

- Depend on Railway-specific features
- Depend on Oracle-specific extensions
- Depend on any vendor-specific behavior

PostgreSQL standard features ONLY are allowed.

---

## LAW 11.8 — STAGE ENFORCEMENT

No action related to database separation may occur unless:

- A dedicated Execution Stage is authorized
- Gates are defined and approved
- This LAW document is referenced explicitly

Any work outside an authorized stage
is considered **UNAUTHORIZED EXECUTION**.

---

## LAW 11.9 — FAILURE MODE

If separation introduces ambiguity, instability,
or unexpected coupling:

The system MUST:

- Fail closed
- Preserve Core integrity
- Prefer non-execution over partial execution

---

END OF STAGE 11 LAWS
