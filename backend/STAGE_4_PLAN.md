# STAGE 4 PLAN — Workflow Triggers & Automation

**Authority:** Principal Software Architect + Principal Security Engineer  
**Date:** 2026-01-17  
**Status:** APPROVED (Execution Ready)  
**Execution Mode:** STRICT · FAIL-CLOSED · IMMUTABLE

---

## 1. Executive Summary

Stage 4 introduces **request-driven workflow automation** via Triggers.

Callers fire an Event (API) using an `eventKey`.
The system resolves `eventKey` → Trigger → **ACTIVE** WorkflowDefinition → creates **ONE** WorkflowInstance and logs an immutable Trigger Event.

Core Principle: **One Event = One Instance.**

---

## 2. Strict Scope Lock

### ✅ IN SCOPE
- New models:
  - `WorkflowTrigger` (configuration mapping)
  - `WorkflowTriggerEvent` (immutable audit log)
- New module:
  - `workflow-triggers`
- API surface (minimal):
  - CRUD (limited) for Triggers
  - Fire Event + Get Event
- Governance Patch 4.1 to register models for tenant isolation (per laws)

### ❌ OUT OF SCOPE (Hard Stop)
- Cron / scheduled triggers / timers
- Event bus / pub-sub
- Queues/workers (Redis/BullMQ)
- Fan-out / multi-instance creation
- Conditional expression rules engine
- Notifications / emails / webhooks
- UI / Frontend

---

## 3. Data Architecture (Schema)

### 3.1 New Models

#### `WorkflowTrigger`
- `id` (UUID)
- `eventKey` (String)
- `workflowDefinitionId` (UUID)
- `description` (String?, optional)
- `isActive` (Boolean, default true)
- `organizationId` (String, system-managed)
- `createdAt` / `updatedAt`

**Constraints**
- Unique per tenant: `@@unique([organizationId, eventKey])`
- `eventKey` + `workflowDefinitionId` immutable after creation

#### `WorkflowTriggerEvent` (Immutable Audit Log)
- `id` (UUID)
- `workflowTriggerId` (UUID)
- `workflowInstanceId` (UUID)
- `payload` (Json?, optional)
- `triggeredById` (UUID)
- `organizationId` (String, system-managed)
- `createdAt` (DateTime)

**Constraints**
- No update/delete API
- No cascade delete from Trigger

---

## 4. API Specification

**Base Path:** `/workflow-triggers`  
**Guards:** `@UseGuards(JwtAuthGuard, TenantGuard)` on every handler

### 4.1 Triggers
| Method | Path | Purpose | Notes |
|---|---|---|---|
| POST | `/` | Create trigger | eventKey unique per org; definition must be ACTIVE |
| GET | `/` | List triggers | CLS scoped |
| GET | `/:id` | Get trigger | 404 cross-tenant |
| PATCH | `/:id` | Update trigger | ONLY `isActive`, `description` |

### 4.2 Events
| Method | Path | Purpose | Notes |
|---|---|---|---|
| POST | `/events` | Fire event | Resolve by `eventKey`, create ONE instance, log event |
| GET | `/events/:id` | Get event | 404 cross-tenant |

### 4.3 Fire Event Logic (Deterministic)
1) Resolve Trigger by `(organizationId from CLS, eventKey)`  
   - If missing → 404  
2) If trigger inactive → 400  
3) Verify definition is ACTIVE → 400 if not  
4) Create WorkflowInstance (Stage 3)  
5) Create WorkflowTriggerEvent (immutable log)  
6) Return `{ eventId, workflowInstanceId }`

---

## 5. Governance Patch (Stage 4.1)

Required to enforce tenant scoping in Prisma extension:

- File: `backend/src/core/database/prisma.extension.ts`
- Change: add new models to `DIRECTLY_SCOPED_MODELS`
- This change is only legal under Gate 2.1 with patch env set.

---

## 6. Execution Strategy

Stage 4 MUST be executed gate-by-gate using:

- `STAGE_4_GATES_CHECKLIST.md`

No gate skipping.
No “continue anyway”.
Any uncertainty → stop.
