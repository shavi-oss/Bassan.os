# Railway Database Reality Note

Date: 2026-01-26

Observation:
The PostgreSQL database running on Railway contains a **mixed schema**.

Confirmed tables include:

- Core / Security tables (organizations, users, roles, permissions, etc.)
- Workflow engine tables (definitions, instances, logs, triggers)
- Asynchronous execution tables (scheduled_triggers, deferred_executions)
- Additional non-core tables:
  - leads
  - tasks

Enums observed:

- LeadStatus
- TaskStatus
- TaskPriority

Interpretation:
The Railway database is NOT Core-only.
It contains historical or vertical-layer remnants.

Decision:

- No cleanup or modification will be performed at this time.
- The mixed database will be migrated as-is to avoid portability issues.
- Database separation (Core vs Layer) requires a NEW authorized Stage.

This note is informational and does NOT authorize any change.
