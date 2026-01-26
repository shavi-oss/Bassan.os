# STAGE 10 PLAN — Core Hardening & Readiness

## Overview

Stage 10 focuses on defining specifications and contracts for hardening the Bassan.os Core Engine to support real-world usage and future vertical layers. This stage produces operational contracts, audit specifications, integration primitive definitions, and usage tracking contracts without implementing any runtime behavior, business logic, or UI components.

## Preconditions

- Stage 9.7 (Bootstrap) MUST be COMPLETE and CLOSED.
- `EXECUTION_AUTHORITY.md` and `ARCHITECTURAL_LAWS.md` MUST be strictly followed.

## Objectives

1.  Define operational contracts and runbooks for system maintenance.
2.  Specify audit logging structure, guarantees, and export contracts.
3.  Define secure integration primitives (API Keys, Webhooks) for external connectivity.
4.  Specify core-level usage tracking contracts to provide visibility for future layers.

## In-Scope (Allowed)

### Operational Readiness

- **Definition**: Concepts and runbooks for operating the Core.
- **Scope**:
  - Health check contract specification.
  - Logging standardization specification (JSON structured logs).
  - Error code catalog consolidation.
  - Operational Runbooks (Markdown only).

### Audit & Observability

- **Definition**: Traceability and immutable history specifications.
- **Scope**:
  - Hardened Audit Log structure specification (standardized schema).
  - Immutable guarantee specification (append-only logic).
  - Export contracts (API definition for fetching logs).
  - **No UI** for viewing logs.

### Integration Primitives

- **Definition**: Security primitive specifications for external systems.
- **Scope**:
  - **API Keys**: Specification for Creation, Hashing, Scoping, Revocation.
  - **Outbound Webhooks**: Specification for Signature generation, Delivery attempts, Failure tracking.
  - **Scopes**: Granular permission scope definitions for keys.
  - **No Integrations Marketplace**.

### Usage Tracking (Core-level, tracking-only)

- **Definition**: "Dark usage tracking" contract specification for observability.
- **Scope**:
  - Organization-scoped metrics specification.
  - Tracked Metrics:
    - Workflow executions (count, status).
    - Scheduler triggers fired.
    - Aggregate API usage (request counts).
  - **Mechanism**: Asynchronous, non-blocking counter/log specification.

## Out of Scope (Forbidden)

- **UI / Frontend**: No dashboards, no configuration screens.
- **Billing / Pricing**: No plans, no subscriptions, no currency, no invoices.
- **Enforcement**: No blocking based on limits, no "plan awareness".
- **Vertical Domain**: No CRM, Sales, or vertical-specific logic.
- **Feature Gating**: Core features must not check for "Plan Level".
- **Implementation**: No code, no migrations, no runtime behavior.

## Architectural Principles

1.  **Core-Only Purity**: The Core expects a Layer to handle business logic; Core only handles mechanics.
2.  **Organization Isolation**: All data, including usage metrics, must be strictly scoped to an Organization.
3.  **Governance First**: All new structures must align with `ARCHITECTURAL_LAWS.md`.
4.  **Observer Pattern**: Usage tracking must observe, not interfere.
5.  **Planning Only**: Stage 10 produces specifications and contracts only.

## Risk Register

| Risk                     | Impact                            | Mitigation                                       |
| :----------------------- | :-------------------------------- | :----------------------------------------------- |
| **Business Logic Leak**  | Billing concepts leak into Core   | Strict specification review against LAW-10.1.    |
| **Performance Overhead** | Tracking slows down execution     | Async/Message-based tracking specification only. |
| **Security Bypass**      | API Keys bypass TenantGuard       | Specification requires Guard enforcement.        |
| **Scope Creep**          | Implementation occurs in Stage 10 | LAW-10.9 enforcement and gate review.            |

## Success Criteria

- [ ] API Key primitive specifications defined and approved.
- [ ] Webhook signature verification specification defined and approved.
- [ ] Usage tracking contract specification defined and approved.
- [ ] Audit log structure specification defined and approved.
- [ ] No UI code, dependencies, or implementation introduced.
- [ ] No runtime behavior changes.

## Exit Conditions (Stage 10 Closure)

- All In-Scope specifications completed and approved.
- Stage 10 documents are PLAN-LOCKED (read-only).
- No code was written or modified.
- Stage 11 is authorized for implementation.
- Complete Governance Review confirming no "Billing/UI/Implementation" contamination.
