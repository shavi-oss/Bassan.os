# PORTABILITY_EXECUTION_REPORT — Bassan.os

Date: 2026-01-26
Timezone: Africa/Cairo
Execution Mode: STRICT · FAIL-CLOSED · IMMUTABLE
Scope: Operational parity + portability ONLY (No code changes)

## 1) Authoritative Context (Frozen Core)

- Bassan.os is CORE ENGINE ONLY (No UI/CRM/Omnichannel/Billing).
- Stages 0→6 implemented & LOCKED.
- Stage 7 (docs-only) LOCKED.
- Stage 8 (docs-only) LOCKED.
- Stage 9.7 bootstrap executed one-time on Railway; verified login.
- Stage 10 planning only (NO CODE / NO MIGRATIONS).
  Evidence references:
- Stage 7 lock (docs-only) :contentReference[oaicite:2]{index=2}
- Stage 8 lock (deployment governance docs-only) :contentReference[oaicite:3]{index=3}
- Stage 9.7 bootstrap completion & verification :contentReference[oaicite:4]{index=4}
- Stage 6 lock & runner context :contentReference[oaicite:5]{index=5} :contentReference[oaicite:6]{index=6}

## 2) Objective

Ensure environment parity & portability:

- Proven DB backup/restore workflow from Railway PostgreSQL.
- Ensure migration path to Oracle Cloud PostgreSQL is straightforward.
- Maintain vendor neutrality (no Railway-specific dependencies).

## 3) Environment Variables (Contract)

### 3.1 Required Portable Variables (User-managed)

- DATABASE_URL
- JWT_SECRET

### 3.2 Railway System Variables (Non-portable / Provided by Railway)

- RAILWAY_PUBLIC_DOMAIN
- RAILWAY_PRIVATE_DOMAIN
- RAILWAY_PROJECT_NAME
- RAILWAY_ENVIRONMENT_NAME
- RAILWAY_SERVICE_NAME
- RAILWAY_PROJECT_ID
- RAILWAY_ENVIRONMENT_ID
- RAILWAY_SERVICE_ID

Decision:

- Oracle environment will NOT provide Railway system variables.
- Core must not rely on Railway system variables (vendor neutrality).

## 4) Security Note (Secrets Handling)

Incident:

- DATABASE_URL was exposed during local command execution.
  Required action:
- Rotate PostgreSQL credentials on Railway immediately.
- Update Railway DATABASE_URL variable.
- Redeploy and re-verify login.
  (Operational compliance with secrets policy / Stage 7 expectations.) :contentReference[oaicite:7]{index=7}

## 5) DB Backup & Restore Drill (Proved Portability)

### 5.1 Initial Failure (Root Cause)

- Using PowerShell syntax inside Linux container caused DATABASE_URL expansion to be empty.
- Result: pg_dump attempted local socket /var/run/postgresql/.s.PGSQL.5432 and failed.

### 5.2 Version Mismatch Resolved

- Server version: PostgreSQL 17.7
- pg_dump 16.x fails with server major 17.
  Resolution:
- Use postgres:17 (or postgres:18) image for pg_dump.

### 5.3 Correct Dump Method on Windows (Binary-safe)

Problem:

- Redirecting binary output using PowerShell can corrupt custom-format dumps.
  Resolution:
- Write dump inside container file, then docker cp to host.

Commands used (template — DO NOT store secrets in files):

1. Create dump inside container:
   docker run --name pgdump -e DATABASE_URL="$env:DATABASE_URL" postgres:17 `
     sh -lc 'pg_dump -Fc "$DATABASE_URL" -f /tmp/railway_backup.dump'

2. Copy dump out:
   docker cp pgdump:/tmp/railway_backup.dump .\railway_backup.dump
   docker rm pgdump

### 5.4 Dump Verification (TOC list)

Command:

- docker run --rm -v "${PWD}:/backup" postgres:17 `
  sh -lc 'pg_restore -l /backup/railway_backup.dump | head -n 20'

Verified output included:

- Format: CUSTOM
- Integer: 4 bytes
- Dumped from DB version: 17.7
- Dumped by pg_dump: 17.7

### 5.5 Local Restore Drill (Docker Postgres)

Issue:

- Port 5433 was already allocated by container "bassan_test_db".
  Resolution:
- Run local test DB on port 5440.

Commands used:

1. Start local Postgres:
   docker run --name pg-local-test -e POSTGRES_PASSWORD=pass -p 5440:5432 -d postgres:17

2. Create database:
   docker exec -e PGPASSWORD=pass pg-local-test createdb -U postgres bassan_restore_test

3. Restore dump:
   docker run --rm -v "${PWD}:/backup" postgres:17 `
   sh -lc 'pg_restore -d "postgresql://postgres:pass@host.docker.internal:5440/bassan_restore_test" /backup/railway_backup.dump'

4. Verify tables:
   docker exec -e PGPASSWORD=pass pg-local-test psql -U postgres -d bassan_restore_test -c "\dt"

Result:

- Restore succeeded.
- Verified tables present:
  Core/security: organizations, users, roles, permissions, user_roles, refresh_tokens
  Workflow engine: workflow_definitions, workflow_states, workflow_transitions, workflow_instances, workflow_execution_logs
  Stage 4: workflow_triggers, workflow_trigger_events
  Stage 5/6: scheduled_triggers, deferred_executions, execution_attempts

## 6) Observed DB Reality (Important)

Observation:

- The restored database also contains:
  - leads table
  - tasks table
  - enums: LeadStatus / TaskStatus / TaskPriority
    Meaning:
- Railway DB is currently MIXED (Core tables + remnants/vertical artifacts).
  Decision (Operational):
- Keep mixed DB for now to avoid migration breakage.
- Plan DB separation later only via NEW Stage authorization (not now). :contentReference[oaicite:8]{index=8} :contentReference[oaicite:9]{index=9}

## 7) Oracle Migration Plan (PostgreSQL only)

Target:

- Oracle Cloud PostgreSQL (NOT Oracle DB)

Steps (high level):

1. Provision Oracle PostgreSQL instance.
2. Apply same portable ENV contract:
   - DATABASE_URL (Oracle)
   - JWT_SECRET (same)
3. Move dump file railway_backup.dump to migration machine.
4. Restore using pg_restore into Oracle DB.
5. Smoke verify:
   - app starts
   - POST /api/v1/auth/login returns 200 + JWT (same verification as Stage 9.7) :contentReference[oaicite:10]{index=10}
6. Cutover traffic + keep Railway as rollback window per deployment governance discipline. :contentReference[oaicite:11]{index=11}

## 8) Final Status

- Portability (Railway → Local PostgreSQL) VERIFIED.
- Backup/restore workflow established (binary-safe).
- Remaining risk: Mixed DB contents must be acknowledged and planned for future separation (Stage-based).
- No code changes performed. Governance preserved.
