# STAGE 11 — Core / Layer Database Separation (PLAN)

Project: Bassan.os  
Stage: 11 — Database Separation (Core vs Layer)  
Document Type: PLAN (Specification Only)  
Execution Mode: STRICT · FAIL-CLOSED · GOVERNANCE-FIRST  
Status: PLANNING ONLY — NO IMPLEMENTATION AUTHORIZED

---

## 1. Purpose

This stage defines a **future, controlled separation** between:

- **Core Database** (Bassan.os Core Engine)
- **Layer / Vertical Databases** (CRM, Tasks, Domain-specific data)

The purpose of this stage is to:

- Preserve **Core purity at the data level**
- Prevent accidental coupling between Core and Layer concerns
- Enable safer long-term portability and scalability

⚠️ This document does NOT authorize execution.
⚠️ No code, schema, or data changes are allowed in this stage.

---

## 2. Background & Trigger

### Observed Reality (Operational Fact)

During portability verification on Railway, the production PostgreSQL database
was found to contain a **mixed schema**, including:

- Core tables (auth, organizations, workflow engine, triggers, async execution)
- Non-core / vertical tables:
  - `leads`
  - `tasks`
  - Related enums (LeadStatus, TaskStatus, TaskPriority)

This condition is **operationally valid today** but represents
a **long-term governance risk** if left unmanaged.

---

## 3. Definitions

### 3.1 Core Database

The Core Database is defined as the data store that contains **ONLY**:

- Authentication & Identity
- Organization & Tenant boundaries
- Workflow definitions and runtime
- Triggers & automation primitives
- Asynchronous execution & background workers

The Core Database MUST:

- Remain vendor-neutral
- Remain schema-stable across environments
- Never contain vertical or business-domain tables

---

### 3.2 Layer / Vertical Database

A Layer Database is defined as any database that contains:

- Business-domain entities (CRM, Tasks, Sales, Medical, etc.)
- Vertical-specific workflows or data models
- UI-facing or application-facing state

Layer Databases:

- Are owned by Layer repositories (NOT Bassan.os Core)
- May evolve independently
- Must never be required for Core startup or execution

---

## 4. Separation Strategy (Conceptual)

This stage proposes **Physical Database Separation** as the target model:

- One PostgreSQL database for Core
- One or more PostgreSQL databases for Layers

No logical/schema-only separation is allowed as a final state,
to avoid hidden coupling and accidental joins.

⚠️ This is a DESIGN INTENT only, not an execution directive.

---

## 5. Non-Goals (Explicitly Out of Scope)

This stage does NOT include:

- Removing existing tables
- Moving data
- Writing migration scripts
- Updating Prisma schemas
- Modifying repositories
- Changing runtime behavior
- Introducing cross-database joins
- Introducing data sync logic

Any of the above requires a **separate Execution Stage**.

---

## 6. Constraints & Guarantees

- Stages 0–10 remain **LOCKED & IMMUTABLE**
- Stage 9.7 bootstrap behavior must remain unchanged
- Core APIs must not change behavior or contracts
- Tenant isolation rules remain enforced exactly as-is
- No dependency on deployment platform (Railway, Oracle, etc.)

---

## 7. Risks Identified

| Risk             | Description                            | Mitigation                   |
| ---------------- | -------------------------------------- | ---------------------------- |
| Hidden Coupling  | Core code assumes Layer tables exist   | Physical DB separation       |
| Migration Errors | Data loss during separation            | Stage-gated execution        |
| Runtime Breakage | Core failing due to missing Layer data | Explicit non-dependency rule |
| Scope Creep      | Accidental cleanup during planning     | Planning-only enforcement    |

---

## 8. Success Criteria (Planning)

This stage is considered successful when:

- Core DB boundaries are clearly defined
- Layer DB boundaries are clearly defined
- Separation strategy is approved
- No code or data was modified
- Execution is deferred to a future authorized stage

---

## 9. Exit Condition

Upon approval of this plan:

- This document becomes **LOCKED**
- A new stage MAY be authorized for execution
- No action is taken until explicit authorization is granted

---

END OF STAGE 11 PLAN
