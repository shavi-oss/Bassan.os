# STAGE 4 LAWS: Workflow Triggers & Automation

**Authority:** Principal Software Architect
**Effective Date:** 2026-01-17
**Status:** ENFORCED

---

## Law S4-01: Event Immutability

`WorkflowTriggerEvent` records are a strict audit log of automation activity.

- **ABSOLUTE RULE:** NO `UPDATE` or `DELETE` endpoints allowed for Events.
- **ABSOLUTE RULE:** NO `ON DELETE CASCADE` from Parent to Event (soft delete only, if ever needed).

## Law S4-02: Active Definition Requirement

Triggers MUST ONLY instantiate workflows from `ACTIVE` definitions.

- **Rule:** Before creating an instance, the system MUST verify: `WorkflowDefinition.status === 'ACTIVE'`.
- **Failure Mode:** If definition is DRAFT/ARCHIVED, the Event Creation MUST fail with `400 Bad Request`.

## Law S4-03: Scope Isolation (No Fan-Out)

One Trigger Event = One Workflow Instance.

- **FORBIDDEN:** Creating multiple instances from a single event.
- **FORBIDDEN:** Chaining multiple triggers synchronously.
- **Reason:** Prevents runaway complexity and performance degradation.

## Law S4-04: No Side Effects

The Trigger System is strictly for **Workflow Instantiation**.

- **FORBIDDEN:** Sending emails/notifications directly from the Trigger.
- **FORBIDDEN:** Calling external webhooks directly.
- **FORBIDDEN:** Modifying other entities (Leads, Tasks) directly.
- **Allowed:** Passing context to the Workflow Engine, which _then_ executes steps.

## Law S4-05: Strict Tenant Isolation

Cross-Tenant access is a critical security vulnerability.

- **Rule:** Accessing a Trigger/Event from a different tenant MUST return `404 Not Found`.
- **Reason:** `403 Forbidden` reveals existence (Enumeration Attack).

## Law S4-06: Patch Governance

Modification of Stage 0-3 artifacts is **strictly FORBIDDEN** except for the authorized Stage 4.1 patch.

- **Authorized File:** `backend/src/core/database/prisma.extension.ts`
- **Authorized Change:** Adding `"WorkflowTrigger"`, `"WorkflowTriggerEvent"` to `DIRECTLY_SCOPED_MODELS`.
- **Condition:** Enforced by Security Linter (Fail-Closed).

## Law S4-07: Tenant Context Integrity (NEW)

Tenant identity is strictly controlled by the Request Context (CLS).

- **Rule 1:** `organizationId` MUST NOT appear in any Input DTO, Query Parameter, or URL Param.
- **Rule 2:** Tenant identity comes ONLY from CLS context (injected by `TenantGuard`).
- **Rule 3:** All persistence operations MUST use the tenant-scoped `prismaService.client`.
- **Enforcement:** Static Analysis + Code Review.

## Law S4-08: Guard Enforcement (NEW)

All Stage 4 endpoints MUST enforce authentication + tenant context.

- **Rule 1:** Every Stage 4 controller handler MUST include:
  `@UseGuards(JwtAuthGuard, TenantGuard)` in this exact order.
- **Rule 2:** No public endpoints are allowed in Stage 4.
- **Failure Mode:** Missing guards or wrong order MUST fail-closed (build/linter failure).
- **Enforcement:** Static Analysis (Security Linter) + Code Review.
