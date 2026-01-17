# STAGE 4 LAWS — Workflow Triggers & Automation

**Authority:** Principal Software Architect  
**Effective Date:** 2026-01-17  
**Execution Mode:** STRICT · FAIL-CLOSED · IMMUTABLE  
**Status:** ENFORCED (Stage 4 Only)

---

## LAW S4-01 — Event Immutability (Audit Log)

`WorkflowTriggerEvent` is a strict immutable audit log.

- **ABSOLUTE:** No UPDATE endpoints for Events.
- **ABSOLUTE:** No DELETE endpoints for Events.
- **ABSOLUTE:** No `ON DELETE CASCADE` from Trigger → Event.

---

## LAW S4-02 — Active Definition Requirement

Trigger execution MUST ONLY instantiate from **ACTIVE** definitions.

- Before creating an instance, verify: `WorkflowDefinition.status === 'ACTIVE'`.
- If DRAFT/ARCHIVED → **400 Bad Request**.

---

## LAW S4-03 — No Fan-Out (Scope Isolation)

**One Trigger Event = One Workflow Instance.**

- Forbidden: creating multiple instances from one event.
- Forbidden: synchronous chaining.

---

## LAW S4-04 — No Side Effects (Instantiation Only)

Stage 4 Trigger System is strictly for workflow instantiation.

- Forbidden: emails/notifications, webhooks, external calls.
- Forbidden: modifying other domains directly (Leads, Tasks, etc).
- Allowed: store payload/context into instance or event log for Stage 3 engine usage.

---

## LAW S4-05 — Strict Tenant Isolation (404 not 403)

Cross-tenant access MUST return **404 Not Found**.

Reason: 403 leaks existence (enumeration risk).

---

## LAW S4-06 — Patch Governance (Stage 4.1 ONLY)

Stage 0–3 artifacts are IMMUTABLE.

**The only authorized modification outside Stage 4 module is Stage 4.1 patch:**

- Allowed file: `backend/src/core/database/prisma.extension.ts`
- Allowed change: Add `"WorkflowTrigger"`, `"WorkflowTriggerEvent"` to `DIRECTLY_SCOPED_MODELS`
- Enforcement: Security linter MUST fail-closed if any other Stage 0–3 file changes.

---

## LAW S4-07 — Tenant Context Integrity

- `organizationId` MUST NOT appear in any input DTO, query param, or URL param.
- Tenant identity comes ONLY from CLS context (set by `TenantGuard`).
- All DB operations MUST use tenant-scoped `prismaService.client`.

---

## LAW S4-08 — Guard Enforcement

Every Stage 4 handler MUST include:

`@UseGuards(JwtAuthGuard, TenantGuard)` **in this exact order**.

No public Stage 4 endpoints.

---

## LAW S4-09 — Trigger Mutability Rules

`WorkflowTrigger` is configurable but constrained:

- Trigger is **tenant-unique** by `(organizationId, eventKey)`.
- After creation, these fields are **IMMUTABLE**:
  - `eventKey`
  - `workflowDefinitionId`
- Mutable fields:
  - `isActive`
  - `description`

---

## LAW S4-10 — Fail-Closed Resolution Rules

If a Trigger cannot be resolved safely:
- Missing trigger for `eventKey` → **404 Not Found**
- Trigger exists but inactive → **400 Bad Request**
- Definition not ACTIVE → **400 Bad Request**

---

## LAW S4-11 — Data Access Pattern

- Allowed: `this.prisma.client.*` only.
- Forbidden: direct `this.prisma.*` without `.client`.
- Forbidden: manual tenant filtering by `organizationId`.

(See `CODE_LAWS.md` for global enforcement alignment.)
