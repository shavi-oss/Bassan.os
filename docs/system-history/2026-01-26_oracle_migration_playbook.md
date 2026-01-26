# Oracle PostgreSQL Migration Playbook — Bassan.os

Target:
Oracle Cloud — PostgreSQL (NOT Oracle DB)

Preconditions:

- Core code remains immutable
- Stage 9.7 bootstrap already executed
- Valid PostgreSQL dump available (custom format)

Steps:

1. Rotate PostgreSQL credentials on Railway
2. Generate pg_dump using pg_dump >= server major version
3. Transfer dump file securely
4. Provision Oracle PostgreSQL instance
5. Apply environment variables:
   - DATABASE_URL
   - JWT_SECRET
6. Restore using pg_restore
7. Verify:
   - Service starts
   - POST /api/v1/auth/login returns JWT
8. Cutover traffic
9. Keep Railway as rollback window

Notes:

- No schema changes during migration
- No data filtering during migration
- Any cleanup requires a future Stage
