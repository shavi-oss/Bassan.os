# STAGE 4 PLAN: Workflow Triggers & Automation

**Authority:** Principal Software Architect
**Date:** 2026-01-17
**Status:** APPROVED (Execution Ready)

---

## 1. Executive Summary

Stage 4 implements **request-driven workflow automation** via Triggers. External systems can fire events (via API) that automatically instantiate workflows based on pre-configured mapping rules.

**Core Philosophy:** "One Event = One Instance". No fan-out, no complex logic, no queues.

## 2. Strict Scope Lock

### ✅ IN SCOPE (Allowed)

- **Models:**
  - `WorkflowTrigger`: Configuration mapping `eventKey` → `workflowDefinitionId`.
  - `WorkflowTriggerEvent`: Immutable audit log of execution.
- **Logic:** Map `eventKey` → `workflowDefinitionId` → Create `WorkflowInstance`.
- **API:** CRUD for Triggers, POST/GET for Events.
- **Security:** Full tenant isolation (404 for cross-tenant).
- **Governance:** Stage 4.1 Patch for `prisma.extension.ts`.

### ❌ OUT OF SCOPE (Forbidden)

- **Time-based triggers** (Cron, Scheduled).
- **Internal event bus** (Node.js EventEmitter).
- **Queues/Workers** (Redis, BullMQ).
- **Fan-out** (One event -> Multiple workflows).
- **Conditional Rules** (Expression evaluation).
- **UI/Frontend**.
- **Notifications**.

## 3. Data Architecture (Schema)

### New Models

**`WorkflowTrigger`**

- `id`: UUID
- `eventKey`: String (Unique per Tenant: `[organizationId, eventKey]`)
- `workflowDefinitionId`: UUID (Must be ACTIVE)
- `description`: String?
- `isActive`: Boolean (Default: true)
- `organizationId`: UUID (System Managed)
- `createdAt`/`updatedAt`

**`WorkflowTriggerEvent`** (Immutable Audit Log)

- `id`: UUID
- `workflowTriggerId`: UUID
- `workflowInstanceId`: UUID (The instance created)
- `payload`: Json? (Context data)
- `triggeredById`: UUID (User who fired it)
- `organizationId`: UUID (System Managed)
- `createdAt`: DateTime

### Tenant Isolation

- **Governance Patch 4.1 Required**: Must add `"WorkflowTrigger"`, `"WorkflowTriggerEvent"` to `DIRECTLY_SCOPED_MODELS` in `prisma.extension.ts`.

## 4. API Specification

**Base Path:** `/workflow-triggers` (No prefixes)
**Guards:** `@UseGuards(JwtAuthGuard, TenantGuard)`

| Method    | Path          | Purpose        | Restrictions                                                          |
| :-------- | :------------ | :------------- | :-------------------------------------------------------------------- |
| **POST**  | `/`           | Create Trigger | `eventKey` must be unique in Org. Def must be ACTIVE.                 |
| **GET**   | `/`           | List Triggers  | CLS filtered.                                                         |
| **GET**   | `/:id`        | Get Trigger    | 404 if cross-tenant.                                                  |
| **PATCH** | `/:id`        | Update Trigger | **ONLY** `isActive`, `description`. `eventKey`/`defId` are IMMUTABLE. |
| **POST**  | `/events`     | Fire Event     | Finds Trigger by `eventKey`. Creates Instance. Logs Event.            |
| **GET**   | `/events/:id` | Get Event      | 404 if cross-tenant.                                                  |

## 5. Security & Laws

1.  **Immutability**: `WorkflowTriggerEvent` can NEVER be updated or deleted.
2.  **Fail-Closed**: If `WorkflowDefinition` is not ACTIVE, Event fails (400).
3.  **Isolation**: All queries must use `prismaService.client` (CLS-scoped).
4.  **No Side Effects**: API handler must be synchronous. No background "fire and forget".
5.  **Tenant Context Integrity**: `organizationId` forbidden in DTOs.

## 6. Execution Strategy (Gate-by-Gate)

See `STAGE_4_GATES_CHECKLIST.md` for the exact command-level execution plan.
