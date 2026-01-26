# STAGE 10 LAWS — Core Governance

## Execution Mode Statement

**STRICT · FAIL-CLOSED · GOVERNANCE-FIRST**

Any ambiguity in this stage must be resolved by choosing the interpretation that is **most restrictive** and **least permissive**.

## Laws (Binding)

### LAW-10.0: Core Isolation (No UI Code)

**Definition**: The Core Engine MUST NOT contain any frontend code, UI components, dashboard logic, or presentation-layer dependencies.
**Forbidden**:

- React / Vue / Angular components.
- HTML generation logic.
- CSS / Styling files.
- `dashboard`, `frontend`, `ui` directories in `src`.
  **Enforcement**:
- Build failure if UI libraries are detected in `package.json`.
- Reject PRs adding UI directories.

### LAW-10.1: Dark Tracking (Metrics Only)

**Definition**: Usage tracking MUST be "dark" — it observes and records, but NEVER enforces or blocks execution based on values.
**Forbidden**:

- `if (usage > limit) throw Error`.
- Billing logic, Plans, Subscriptions, Pricing Models within Core.
- Hardcoded limits based on "Tier".
  **Enforcement**:
- Manual code review checklist.
- search-and-destroy for "billing", "price", "plan", "limit".

### LAW-10.2: Organization Scope Consistency

**Definition**: ALL usage tracking and integration primitives MUST be strictly scoped to a single `Organization`.
**Required**:

- API Keys must be linked to ONE Organization.
- Usage logs must allow partitioning by Organization.
- No "Global" usage metrics that cross tenant boundaries.
  **Enforcement**:
- Database schema validation (Foreign Key to `Organization`).
- TenantGuard enforcement on all integration endpoints.

### LAW-10.3: Integration Security Primitives

**Definition**: Integration secrets MUST be treated with highest security standards.
**Required**:

- API Keys MUST be stored as **hashes** (e.g., SHA-256/Argon2), NEVER plain text.
- API Keys MUST show only last 4 chars in admin views (if exposed via API).
- Webhooks MUST include a cryptographic signature (`X-Bassan-Signature`) using a per-tenant secret.
  **Enforcement**:
- Security Linter rule checking for plain text secret storage.
- Tests verifying signature generation.

### LAW-10.4: Audit Immutability

**Definition**: Audit logs MUST be append-only and immutable.
**Required**:

- No `UPDATE` or `DELETE` operations allowed on Audit Log tables.
- All critical actions (Auth, Schema Change, Key Rotation) MUST generate an audit log.
  **Enforcement**:
- Database permissions (REVOKE UPDATE/DELETE).
- Middleware enforcement.

### LAW-10.5: No Backward Incompatibility

**Definition**: Stage 10 specifications MUST NOT introduce breaking changes to existing APIs, schemas, or contracts from Stages 0-9.7.
**Required**:

- All new models must be additive only.
- Existing endpoints must remain unchanged.
- No modification to existing Prisma models from prior stages.
  **Enforcement**:
- Schema diff review during Gate 2.
- API contract compatibility verification.

### LAW-10.6: Core / Layer Boundary Enforcement

**Definition**: The Core MUST NOT contain any vertical domain logic, business rules, or layer-specific concerns.
**Forbidden**:

- CRM entities (Lead, Deal, Contact).
- Sales pipeline logic.
- Customer service workflows.
- Omnichannel routing.
  **Required**:
- All Core features must be domain-agnostic.
- Layer repositories are responsible for vertical logic.
  **Enforcement**:
- Model name scan for vertical domain terms.
- Code review checklist.

### LAW-10.7: Performance Non-Impact (Async, Bounded Tracking)

**Definition**: Usage tracking MUST NOT degrade request/response performance.
**Required**:

- All tracking must be asynchronous (fire-and-forget or message queue).
- No synchronous database writes in request path.
- Tracking failures must not cause request failures.
  **Enforcement**:
- Architecture review during Gate 2.
- Performance testing requirements (MAY be enforced via CI in later stages).

### LAW-10.8: No Cross-Tenant Aggregation

**Definition**: Usage metrics MUST NOT aggregate data across multiple Organizations without explicit per-tenant consent and isolation guarantees.
**Forbidden**:

- Global dashboards showing cross-tenant metrics.
- Aggregated usage reports without per-tenant filtering.
  **Required**:
- All queries must include `organizationId` filter.
- Export APIs must enforce tenant isolation.
  **Enforcement**:
- TenantGuard enforcement on all metric endpoints.
- Query pattern review (MAY be enforced via Security Linter in later stages).

### LAW-10.9: Stage 10 Is Planning Only (No Implementation)

**Definition**: Stage 10 MUST produce specifications, contracts, and documentation ONLY. No code implementation, migrations, or runtime behavior changes are permitted.
**Forbidden**:

- Writing new `.ts` files in `src/`.
- Modifying existing service logic.
- Creating or modifying Prisma migrations.
- Adding new npm dependencies.
  **Allowed**:
- Markdown documentation.
- Schema specifications (non-executable).
- API contract definitions (OpenAPI/Swagger specs).
- Runbook documentation.
  **Enforcement**:
- Gate 4 verification that no code was written.
- Git diff review confirming documentation-only changes.

## Violation Handling

Any violation of these laws detected during review or automated testing results in:

1.  **Immediate Rejection** of the Change Request.
2.  **Incident Report** if violation reaches `main` branch.
3.  **Mandatory Revert** of offending code.
