# STAGE 7 — OPERATIONAL RUNBOOKS

**Document Type:** Operational Procedures & Recovery Guidance  
**Stage:** 7 (Operational Readiness & Production Governance)  
**Classification:** OPERATIONAL — OPERATIONS TEAM REQUIRED  
**Created:** 2026-01-21  
**Status:** FINAL

---

## 1. EXECUTIVE SUMMARY

This document provides conceptual operational procedures for the BassanOS multi-tenant SaaS platform. All procedures are **implementation-agnostic** and describe **what must happen**, not **how to execute** specific commands.

**Operational Philosophy:** Fail-safe, observable, recoverable.

---

## 2. RTO & RPO DEFINITIONS

### 2.1 Recovery Time Objective (RTO)

**Definition:** Maximum acceptable time to restore service after an incident.

| Incident Type               | RTO Target | Justification                        |
| --------------------------- | ---------- | ------------------------------------ |
| **Application Crash**       | 5 minutes  | Automated restart + health checks    |
| **Database Failure**        | 15 minutes | Database restore from backup         |
| **Complete System Failure** | 1 hour     | Full infrastructure rebuild          |
| **Security Breach**         | Immediate  | Isolate affected tenant, investigate |

### 2.2 Recovery Point Objective (RPO)

**Definition:** Maximum acceptable data loss measured in time.

| Data Type                  | RPO Target  | Backup Strategy                              |
| -------------------------- | ----------- | -------------------------------------------- |
| **Transactional Data**     | 15 minutes  | Continuous replication + write-ahead logging |
| **User-Generated Content** | 1 hour      | Hourly incremental backups                   |
| **Configuration Data**     | 24 hours    | Daily full backups                           |
| **Audit Logs**             | 0 (no loss) | Write-ahead logging + immutable storage      |

---

## 3. STARTUP PROCEDURES

### 3.1 Pre-Startup Verification

**Objective:** Verify environment readiness before starting application.

**Required Verifications:**

1. **Environment Variables Present**
   - Database connection string
   - JWT secret
   - Application port
   - Node environment (production/staging/development)
   - Background worker polling intervals

2. **Database Connectivity**
   - Database server reachable
   - Credentials valid
   - Connection pool can be established

3. **Database Schema Current**
   - Prisma migrations applied
   - No pending migrations
   - Schema matches application expectations

**Failure Handling:**

- Missing environment variable → ABORT startup, log error
- Database unreachable → RETRY with exponential backoff (max 3 attempts), then ABORT
- Pending migrations → ABORT startup, require manual migration

---

### 3.2 Application Startup Sequence

**Objective:** Start application in correct order to ensure dependencies are ready.

**Startup Order:**

1. **Initialize Logging**
   - Configure log level
   - Configure log format
   - Configure log destination

2. **Initialize Database Connection**
   - Create Prisma client
   - Establish connection pool
   - Verify connectivity

3. **Initialize CLS (Async Local Storage)**
   - Create CLS store
   - Configure CLS middleware

4. **Initialize HTTP Server**
   - Bind to port
   - Configure global prefix (`/api/v1`)
   - Configure global pipes (ValidationPipe)
   - Configure global filters (exception handling)

5. **Initialize Background Workers**
   - Start Scheduler polling loop
   - Start Executor polling loop
   - Verify workers are polling

6. **Verify Health**
   - Health endpoint responds
   - Database connectivity confirmed
   - Background workers active

**Success Criteria:**

- HTTP server listening on configured port
- Health endpoint returns 200 OK
- Background workers logging polling activity
- No errors in startup logs

---

### 3.3 Post-Startup Verification

**Objective:** Confirm application is fully operational.

**Verification Steps:**

1. **Health Endpoint Check**
   - Request health endpoint
   - Verify 200 OK response
   - Verify response includes database status

2. **Authentication Flow Test**
   - Attempt login with test credentials
   - Verify JWT token returned
   - Verify token can access protected endpoint

3. **Background Worker Activity**
   - Verify Scheduler logs show polling activity
   - Verify Executor logs show polling activity
   - Verify no errors in worker logs

4. **Tenant Isolation Verification**
   - Create test data for two different organizations
   - Verify each organization can only access their own data
   - Verify cross-tenant access returns 404

**Failure Handling:**

- Health check fails → Investigate logs, verify database connectivity, restart if needed
- Authentication fails → Verify JWT secret, verify database contains users
- Background workers not active → Verify environment variables, restart workers
- Tenant isolation fails → CRITICAL, shut down immediately, investigate

---

## 4. SHUTDOWN PROCEDURES

### 4.1 Graceful Shutdown Sequence

**Objective:** Stop application without data loss or corruption.

**Shutdown Order:**

1. **Stop Accepting New Requests**
   - HTTP server stops accepting new connections
   - Existing connections remain open

2. **Drain In-Flight Requests**
   - Wait for all in-flight HTTP requests to complete
   - Timeout: 30 seconds
   - After timeout, forcefully close remaining connections

3. **Stop Background Workers**
   - Signal Scheduler to stop polling
   - Signal Executor to stop polling
   - Wait for current processing to complete
   - Timeout: 60 seconds
   - After timeout, forcefully terminate workers

4. **Close Database Connections**
   - Close Prisma client
   - Close connection pool
   - Wait for all connections to close gracefully

5. **Flush Logs**
   - Ensure all log entries are written
   - Close log files/streams

6. **Exit Process**
   - Exit with code 0 (clean shutdown)

**Success Criteria:**

- No in-flight requests lost
- No background worker processing interrupted mid-operation
- All database connections closed cleanly
- Exit code 0

---

### 4.2 Emergency Shutdown

**Objective:** Stop application immediately in case of critical failure.

**Trigger Conditions:**

- Tenant isolation failure detected
- Database corruption detected
- Security breach detected
- Unrecoverable error

**Emergency Shutdown Steps:**

1. **Immediate Stop**
   - Terminate all HTTP connections immediately
   - Terminate all background workers immediately
   - Do NOT wait for graceful completion

2. **Isolate System**
   - Close database connections
   - Prevent new connections

3. **Preserve Evidence**
   - Dump current logs
   - Dump current memory state (if possible)
   - Capture current database state

4. **Alert Operations**
   - Send critical alert
   - Include failure reason
   - Include evidence location

**Post-Emergency Actions:**

- Do NOT restart automatically
- Require manual investigation
- Require explicit approval to restart

---

## 5. MONITORING & OBSERVABILITY

### 5.1 Health Indicators

**Primary Health Indicators:**

1. **HTTP Server Responsive**
   - Health endpoint returns 200 OK within 1 second
   - Indicates server is running and can process requests

2. **Database Connectivity**
   - Prisma client can execute simple query
   - Connection pool has available connections
   - Query latency < 100ms

3. **Background Workers Active**
   - Scheduler logs polling activity every poll interval
   - Executor logs polling activity every poll interval
   - No errors in worker logs for past 5 minutes

4. **Memory Usage**
   - Memory usage < 80% of available memory
   - No memory leaks detected (stable over time)

5. **CPU Usage**
   - CPU usage < 70% average over 5 minutes
   - No sustained 100% CPU usage

**Health Status:**

- **HEALTHY:** All indicators green
- **DEGRADED:** One or more indicators yellow
- **UNHEALTHY:** One or more indicators red

---

### 5.2 Alert Interpretation

**Alert Levels:**

| Alert                          | Severity | Interpretation                 | Response                                    |
| ------------------------------ | -------- | ------------------------------ | ------------------------------------------- |
| **Health endpoint timeout**    | CRITICAL | Application unresponsive       | Restart application immediately             |
| **Database connection failed** | CRITICAL | Database unreachable           | Verify database status, restart application |
| **Background worker stopped**  | HIGH     | Worker crashed or hung         | Restart application, investigate logs       |
| **Memory usage > 80%**         | MEDIUM   | Potential memory leak          | Monitor, restart if continues to rise       |
| **CPU usage > 70%**            | MEDIUM   | High load or inefficient query | Monitor, investigate slow queries           |
| **Tenant isolation violation** | CRITICAL | Security breach                | Emergency shutdown, investigate immediately |

---

### 5.3 Log Analysis

**Log Levels:**

- **ERROR:** Unhandled exception, critical failure
- **WARN:** Recoverable error, potential issue
- **INFO:** Normal operation, state changes
- **DEBUG:** Detailed execution flow

**Key Log Patterns:**

1. **Tenant Isolation Violations**
   - Pattern: `TENANT_ISOLATION_VIOLATION`
   - Action: Emergency shutdown, investigate immediately

2. **Authentication Failures**
   - Pattern: `401 Unauthorized` or `403 Forbidden`
   - Action: Monitor for brute force attempts, investigate if excessive

3. **Database Errors**
   - Pattern: `PrismaClientKnownRequestError` or `PrismaClientUnknownRequestError`
   - Action: Investigate query, verify database health

4. **Background Worker Errors**
   - Pattern: `[SchedulerService]` or `[ExecutorService]` with ERROR level
   - Action: Investigate worker logs, verify CLS context

5. **Validation Errors**
   - Pattern: `400 Bad Request` with validation details
   - Action: Normal operation, monitor for malicious patterns

---

## 6. FAILURE CLASSIFICATION

### 6.1 Soft Failures (Recoverable)

**Definition:** Failures that can be recovered automatically without data loss.

**Examples:**

- Transient database connection failure
- Single request timeout
- Background worker transient error
- Validation error on user input

**Recovery Strategy:**

- Retry with exponential backoff
- Log error for monitoring
- Continue normal operation

---

### 6.2 Hard Failures (Unrecoverable)

**Definition:** Failures that require manual intervention or data recovery.

**Examples:**

- Database corruption
- Tenant isolation violation
- Unhandled exception in critical path
- Out of memory error

**Recovery Strategy:**

- Emergency shutdown
- Preserve evidence
- Alert operations team
- Require manual investigation and approval to restart

---

## 7. RECOVERY PROCEDURES

### 7.1 Application Crash Recovery

**Scenario:** Application process terminated unexpectedly.

**Recovery Steps:**

1. **Identify Crash Cause**
   - Review logs for ERROR entries before crash
   - Check for out-of-memory errors
   - Check for unhandled exceptions

2. **Verify Database Integrity**
   - Execute simple query to verify database responsive
   - Verify no pending transactions
   - Verify no corrupted data

3. **Restart Application**
   - Follow startup procedures (Section 3)
   - Verify post-startup health checks
   - Monitor for recurrence

4. **Root Cause Analysis**
   - Analyze crash logs
   - Identify code defect or resource issue
   - Create Patch Authorization if code fix needed

**RTO:** 5 minutes  
**RPO:** 0 (no data loss expected)

---

### 7.2 Database Failure Recovery

**Scenario:** Database server unreachable or corrupted.

**Recovery Steps:**

1. **Identify Failure Type**
   - Network failure: Database server unreachable
   - Corruption: Database returns errors or inconsistent data
   - Credential failure: Authentication rejected

2. **Network Failure Recovery**
   - Verify network connectivity
   - Verify database server running
   - Restart application (will retry connection)

3. **Corruption Recovery**
   - Stop application immediately
   - Identify last known good backup
   - Restore database from backup
   - Verify data integrity
   - Restart application

4. **Credential Failure Recovery**
   - Verify credentials in environment variables
   - Rotate credentials if compromised
   - Update environment variables
   - Restart application

**RTO:** 15 minutes  
**RPO:** 15 minutes (transactional data), 1 hour (user-generated content)

---

### 7.3 Complete System Failure Recovery

**Scenario:** Entire infrastructure unavailable (e.g., data center outage).

**Recovery Steps:**

1. **Provision New Infrastructure**
   - Provision database server
   - Provision application server
   - Configure network

2. **Restore Database**
   - Restore database from last backup
   - Verify data integrity
   - Apply any pending migrations

3. **Deploy Application**
   - Deploy application code
   - Configure environment variables
   - Follow startup procedures (Section 3)

4. **Verify Functionality**
   - Execute post-startup verification (Section 3.3)
   - Verify tenant isolation
   - Verify background workers active

5. **Resume Operations**
   - Update DNS or load balancer
   - Monitor for issues
   - Communicate status to users

**RTO:** 1 hour  
**RPO:** 15 minutes (transactional data), 1 hour (user-generated content)

---

### 7.4 Security Breach Recovery

**Scenario:** Unauthorized access detected or suspected.

**Recovery Steps:**

1. **Immediate Isolation**
   - Emergency shutdown (Section 4.2)
   - Isolate affected tenant (if known)
   - Prevent further access

2. **Evidence Preservation**
   - Capture logs
   - Capture database state
   - Capture memory dump (if possible)

3. **Investigation**
   - Identify attack vector
   - Identify compromised data
   - Identify affected tenants

4. **Remediation**
   - Rotate all secrets
   - Patch vulnerability (requires Patch Authorization)
   - Restore compromised data from backup (if needed)

5. **Notification**
   - Notify affected tenants
   - Provide incident details
   - Provide remediation steps

6. **Resume Operations**
   - Deploy patched application
   - Verify security posture
   - Monitor for recurrence

**RTO:** Immediate (isolation), variable (full recovery)  
**RPO:** 0 (no data loss, but data may be compromised)

---

## 8. BACKUP & RESTORE PROCEDURES

### 8.1 Backup Strategy

**Backup Types:**

1. **Full Backup**
   - Frequency: Daily
   - Retention: 30 days
   - Includes: All database tables, all data

2. **Incremental Backup**
   - Frequency: Hourly
   - Retention: 7 days
   - Includes: Changes since last backup

3. **Write-Ahead Log (WAL) Archiving**
   - Frequency: Continuous
   - Retention: 7 days
   - Includes: All database transactions

**Backup Verification:**

- Test restore monthly
- Verify data integrity
- Verify restore time meets RTO

---

### 8.2 Restore Procedures

**Point-in-Time Restore:**

1. **Identify Restore Point**
   - Determine desired restore timestamp
   - Identify last full backup before timestamp
   - Identify incremental backups and WAL segments after full backup

2. **Restore Full Backup**
   - Stop application
   - Restore full backup to database
   - Verify restore completed successfully

3. **Apply Incremental Backups**
   - Apply incremental backups in chronological order
   - Stop at desired restore point

4. **Apply WAL Segments**
   - Apply WAL segments to reach exact restore point
   - Verify database state matches desired timestamp

5. **Verify Data Integrity**
   - Execute data integrity checks
   - Verify tenant isolation
   - Verify no corruption

6. **Restart Application**
   - Follow startup procedures (Section 3)
   - Verify post-startup health checks

**RTO:** 15 minutes (database failure), 1 hour (complete system failure)  
**RPO:** 15 minutes (transactional data)

---

## 9. TENANT ISOLATION VERIFICATION

### 9.1 Verification Procedure

**Objective:** Confirm multi-tenant isolation is functioning correctly.

**Verification Steps:**

1. **Create Test Data**
   - Create two test organizations
   - Create test users for each organization
   - Create test workflows for each organization

2. **Verify Isolation**
   - Authenticate as Organization A user
   - Attempt to access Organization B workflow by ID
   - Verify 404 response (not 200 or 403)

3. **Verify Injection Prevention**
   - Authenticate as Organization A user
   - Attempt to create workflow with `organizationId: "org-b"` in request body
   - Verify workflow created in Organization A (not Organization B)

4. **Verify Background Worker Isolation**
   - Verify Scheduler processes triggers for all organizations
   - Verify Executor processes executions for all organizations
   - Verify no cross-tenant data access in logs

**Success Criteria:**

- All cross-tenant access attempts return 404
- All injection attempts are sanitized
- Background workers process data for correct tenant only

**Failure Response:**

- Emergency shutdown
- Investigate logs
- Verify Prisma extension configuration
- Verify TenantGuard configuration
- Require Patch Authorization if code fix needed

---

## 10. RUNBOOK MAINTENANCE

This runbook must be reviewed and updated:

- When new features are added (new stages)
- When operational procedures change
- After incidents (incorporate lessons learned)
- Quarterly at minimum

**Responsibility:** Operations Lead + Principal Architect

---

**Document Status:** FINAL  
**Created:** 2026-01-21  
**Authority:** Principal Software Architect & Operations Lead  
**Next Review:** Upon Stage 8 planning or Q2 2026
