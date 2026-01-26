# Oracle Migration Dry-Run Checklist — Bassan.os (PostgreSQL Only)

Date: 2026-01-26  
Mode: STRICT · FAIL-CLOSED · IMMUTABLE  
Scope: Operational only (NO code / NO migrations / NO schema edits)

---

## 0) Target Definition (Non-Negotiable)

- Target DB: Oracle Cloud **PostgreSQL** (NOT Oracle DB)
- Migration type: Lift-and-shift (same schema/data as Railway DB)
- Core must remain vendor-neutral (no Railway variables assumed)

---

## 1) Preconditions Gate (STOP if any fails)

### 1.1 Governance

- [ ] Repo clean: `git status --porcelain` is empty
- [ ] System history docs committed & pushed
- [ ] Stage 11 remains NOT AUTHORIZED (no execution)

### 1.2 Secrets Hygiene

- [ ] Railway PostgreSQL credentials rotated after any exposure
- [ ] No secrets stored in files / git / terminal logs

### 1.3 Known Reality

- [ ] Acknowledge DB is MIXED (core + leads/tasks remnants) and will migrate as-is
- [ ] Portability already verified via local restore drill

---

## 2) Railway Freeze Window (Read/Write Control)

- [ ] Choose migration window (start/end time)
- [ ] Freeze writes (operational): stop any jobs/processes that write to DB
- [ ] Confirm no active write traffic during dump window

Evidence:

- [ ] Screenshot/log note: “freeze start time”
- [ ] Screenshot/log note: “freeze end time”

---

## 3) Backup Gate (Railway → Dump)

### 3.1 Dump Version Gate

- [ ] Confirm server major version (expected 17.x)
- [ ] Use pg_dump major >= server major (postgres:17 or postgres:18)

### 3.2 Binary-safe Dump Method (Windows)

Template (DO NOT paste secrets into docs):

- [ ] Create dump inside container file
- [ ] Copy dump out via docker cp
- [ ] Keep file `railway_backup.dump` (CUSTOM format)

### 3.3 Dump Integrity Check

- [ ] `pg_restore -l` shows:
  - Format: CUSTOM
  - Dumped from DB version: 17.x
  - Dumped by pg_dump version: 17.x (or higher)
- [ ] Dump size is reasonable (not tiny KB)

Artifacts:

- [ ] Store dump filename: `railway_backup.dump`
- [ ] Record file size + sha256 checksum

---

## 4) Oracle Provisioning Gate (PostgreSQL)

- [ ] Provision Oracle PostgreSQL instance
- [ ] Record:
  - host
  - port
  - db name
  - user
  - region
- [ ] Ensure network access from deployment environment
- [ ] Create empty target database (if required)

Security:

- [ ] Use strong password
- [ ] Restrict inbound to required sources (IP allowlist if possible)

---

## 5) Restore Gate (Dump → Oracle PostgreSQL)

### 5.1 Restore Execution

- [ ] Restore using `pg_restore` into Oracle DB
- [ ] Restore completes with exit code 0

### 5.2 Post-Restore Schema Sanity

- [ ] Tables exist:
  - organizations, users, roles, permissions, user_roles
  - workflow\_\* tables
  - scheduled_triggers, deferred_executions, execution_attempts
- [ ] Record row counts (minimum sanity):
  - organizations count
  - users count

---

## 6) App Cutover Dry-Run (No DNS yet)

### 6.1 Environment Parity

- [ ] Set Oracle `DATABASE_URL`
- [ ] Keep `JWT_SECRET` identical to Railway
- [ ] Do NOT rely on Railway system variables

### 6.2 Boot & Smoke

- [ ] App starts cleanly (no DB errors)
- [ ] Login works:
  - POST /api/v1/auth/login returns 200 + JWT
- [ ] Background workers start (scheduler/executor) without crashing

---

## 7) Behavioral Verification Gate (Minimal)

- [ ] Auth/login success
- [ ] Tenant isolation unaffected (no cross-tenant leakage in logs)
- [ ] No unexpected 500s in basic endpoints
- [ ] Confirm `/api/v1` prefix behavior unchanged

---

## 8) Cutover Plan (Real Switch)

- [ ] Decide cutover method (DNS/proxy/config)
- [ ] Define rollback window duration
- [ ] Keep Railway DB/service available during rollback window

---

## 9) Rollback Gate (Mandatory)

Rollback triggers (any one triggers rollback):

- [ ] App fails to start on Oracle
- [ ] Login fails
- [ ] DB restore incomplete/corrupt
- [ ] Severe errors in workers

Rollback actions:

- [ ] Point app back to Railway `DATABASE_URL`
- [ ] Re-enable writes on Railway
- [ ] Document incident notes in system-history

---

## 10) Finalization (After Successful Cutover)

- [ ] Unfreeze writes (on Oracle)
- [ ] Monitor logs/errors for 24h
- [ ] Take fresh Oracle backup
- [ ] Decide retirement timeline for Railway

---

## 11) Evidence & Recordkeeping

Store in `docs/system-history/`:

- [ ] Dump checksum + size
- [ ] Oracle instance metadata (no secrets)
- [ ] Verification notes (login OK, workers OK)
- [ ] Cutover/rollback timestamps

---

END OF CHECKLIST
