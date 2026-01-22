# STAGE 7 — THREAT MODEL

**Document Type:** Security & Operational Threat Analysis  
**Stage:** 7 (Operational Readiness & Production Governance)  
**Classification:** CONFIDENTIAL — SECURITY REVIEW REQUIRED  
**Created:** 2026-01-21  
**Status:** FINAL

---

## 1. EXECUTIVE SUMMARY

This document identifies and analyzes all runtime and operational threats to the BassanOS multi-tenant SaaS platform. It establishes threat categories, attack surfaces, trust boundaries, and maps existing mitigations from Stage 0-6 implementation.

**Threat Posture:** The system implements a **FAIL-CLOSED** security model with defense-in-depth across authentication, authorization, and data isolation layers.

---

## 2. SYSTEM TRUST BOUNDARIES

### 2.1 Trust Boundary Map

```
┌─────────────────────────────────────────────────────────────┐
│ EXTERNAL (UNTRUSTED)                                        │
│  - Public Internet                                          │
│  - Client Applications (Web Browsers)                       │
│  - Third-party APIs (future)                                │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ PERIMETER (AUTHENTICATION BOUNDARY)                         │
│  - JWT Validation (JwtAuthGuard)                            │
│  - Token Signature Verification                             │
│  - Token Expiration Enforcement                             │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ TENANT ISOLATION BOUNDARY                                   │
│  - TenantGuard (CLS Context Injection)                      │
│  - Request Sanitization (organizationId removal)            │
│  - Prisma Tenant Extension (FAIL-CLOSED)                    │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER (SEMI-TRUSTED)                            │
│  - Controllers (HTTP Endpoints)                             │
│  - Services (Business Logic)                                │
│  - Background Workers (Scheduler + Executor)                │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ DATA LAYER (TRUSTED)                                        │
│  - Prisma Client (Tenant-Scoped)                            │
│  - Database (PostgreSQL)                                    │
│  - Audit Logs (Immutable)                                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Trust Assumptions

| Component               | Trust Level  | Justification                                           |
| ----------------------- | ------------ | ------------------------------------------------------- |
| **External Clients**    | UNTRUSTED    | Assume hostile intent, validate all input               |
| **Authenticated Users** | SEMI-TRUSTED | Valid credentials, but may attempt privilege escalation |
| **Application Code**    | TRUSTED      | Under version control, reviewed, tested                 |
| **Database**            | TRUSTED      | Access restricted, encrypted at rest                    |
| **Background Workers**  | TRUSTED      | Internal processes, CLS-isolated per tenant             |
| **Secrets Store**       | TRUSTED      | Environment variables, restricted access                |

---

## 3. RUNTIME THREATS

### 3.1 Authentication & Authorization Threats

#### T-AUTH-01: JWT Token Theft

**Description:** Attacker obtains valid JWT token through XSS, network interception, or client-side storage compromise.

**Attack Vector:**

- Cross-site scripting (XSS) in client application
- Man-in-the-middle (MITM) attack on unencrypted connection
- Local storage/session storage compromise

**Existing Mitigation:**

- JWT tokens signed with secret key (signature verification enforced)
- Token expiration enforced (limited lifetime)
- HTTPS required for production (transport encryption)

**Residual Risk:** MEDIUM  
**Operational Response:** Token revocation mechanism, force re-authentication, audit log review

---

#### T-AUTH-02: Authentication Bypass

**Description:** Attacker bypasses JWT validation to access protected endpoints without valid credentials.

**Attack Vector:**

- Missing guard on endpoint
- Guard misconfiguration
- JWT library vulnerability

**Existing Mitigation:**

- `JwtAuthGuard` mandatory on all protected endpoints (enforced by security linter LAW SEC-01)
- Guard order enforced: `@UseGuards(JwtAuthGuard, TenantGuard)`
- Security linter verifies guard presence on all controllers

**Residual Risk:** LOW  
**Operational Response:** Security linter failure blocks deployment, immediate code review

---

#### T-AUTH-03: Privilege Escalation

**Description:** Authenticated user gains access to resources or actions beyond their authorized role.

**Attack Vector:**

- Role-based access control (RBAC) bypass
- Permission check omission
- Authorization logic flaw

**Existing Mitigation:**

- Role and permission models implemented (Stage 1)
- Permission checks in service layer
- Tenant isolation prevents cross-organization access

**Residual Risk:** MEDIUM  
**Operational Response:** Audit log review, permission model verification, incident investigation

---

### 3.2 Multi-Tenant Isolation Threats

#### T-TENANT-01: Cross-Tenant Data Leakage

**Description:** Attacker from Organization A accesses data belonging to Organization B.

**Attack Vector:**

- Missing `organizationId` filter in database query
- CLS context not set or corrupted
- Prisma extension bypass

**Existing Mitigation:**

- **FAIL-CLOSED Prisma Extension** (Stage 0): Automatically injects `organizationId` into all queries for tenant-scoped models
- **TenantGuard** (Stage 0): Sets CLS context from validated JWT, sanitizes request to remove manual `organizationId`
- **Security Linter** (Stage 2+): Verifies no `_unsafeClient` usage in tenant-scoped modules
- **E2E Penetration Tests** (Stage 6): 13 tests verify IDOR, injection, and cross-tenant attacks are blocked

**Residual Risk:** VERY LOW  
**Operational Response:** Immediate tenant isolation, data access audit, incident escalation to P0

---

#### T-TENANT-02: organizationId Injection

**Description:** Attacker manually injects `organizationId` in request body, query parameters, or URL to access another tenant's data.

**Attack Vector:**

- POST/PATCH request with `organizationId` in body
- Query string parameter `?organizationId=victim-org-id`
- URL path parameter manipulation

**Existing Mitigation:**

- **TenantGuard Sanitization** (Stage 0): Removes `organizationId`, `orgId`, `tenantId` from request body, query, and params
- **Prisma Extension Overwrite** (Stage 0): Overwrites any manually provided `organizationId` during CREATE operations
- **ValidationPipe** (Stage 0): `forbidNonWhitelisted: true` rejects unknown fields in DTOs
- **E2E Tests** (Stage 6): Injection attacks verified as blocked

**Residual Risk:** VERY LOW  
**Operational Response:** Logged as warning by TenantGuard, no data leakage possible

---

#### T-TENANT-03: Background Worker Isolation Failure

**Description:** Background workers (Scheduler, Executor) process data for wrong tenant due to CLS context corruption or missing context.

**Attack Vector:**

- CLS context not set before processing
- CLS context shared across concurrent operations
- Polling loop processes multiple tenants without isolation

**Existing Mitigation:**

- **Per-Organization CLS Context** (Stage 6): Scheduler and Executor iterate all organizations, call `clsService.run()` for each, set `orgId` and `userId` in CLS
- **Tenant-Scoped Queries** (Stage 6): All Prisma queries inside `clsService.run()` are automatically tenant-scoped
- **Unit Tests** (Stage 6): Mock `clsService.run()` to verify callback execution

**Residual Risk:** LOW  
**Operational Response:** Monitor background worker logs, verify CLS context in audit logs

---

### 3.3 Data Integrity Threats

#### T-DATA-01: SQL Injection

**Description:** Attacker injects malicious SQL code to bypass tenant isolation or corrupt data.

**Attack Vector:**

- Raw SQL query with unsanitized user input
- Prisma `$queryRaw` or `$executeRaw` misuse

**Existing Mitigation:**

- **Raw SQL Blocked** (Stage 0): `PrismaService` blocks `$queryRaw` and `$executeRaw` methods
- **Prisma ORM** (Stage 0): All queries use Prisma client (parameterized queries)
- **`_unsafeClient` Restricted** (Stage 1+): Only allowed in `auth`, `organizations`, `prisma` modules (enforced by security linter)

**Residual Risk:** VERY LOW  
**Operational Response:** Security linter failure blocks deployment, code review required

---

#### T-DATA-02: Data Corruption via Race Condition

**Description:** Concurrent operations corrupt data due to missing transaction boundaries or optimistic locking.

**Attack Vector:**

- Concurrent workflow state transitions
- Concurrent deferred execution processing
- Missing version field or transaction

**Existing Mitigation:**

- **Optimistic Locking** (Stage 3): `WorkflowInstance` has `version` field for concurrency control
- **Idempotency Keys** (Stage 5): `DeferredExecution` uses `idempotencyKey` to prevent duplicate processing
- **Transaction Boundaries** (Stage 2): Workflow activation uses `$transaction` for atomic operations

**Residual Risk:** MEDIUM  
**Operational Response:** Data integrity verification, rollback to last known good state, incident investigation

---

### 3.4 Input Validation Threats

#### T-INPUT-01: Malformed Input Exploitation

**Description:** Attacker sends malformed input to trigger application errors, denial of service, or unexpected behavior.

**Attack Vector:**

- Invalid JSON payload
- Excessively large payload
- Invalid data types or formats

**Existing Mitigation:**

- **ValidationPipe** (Stage 0): `class-validator` decorators on all DTOs
- **Transform and Whitelist** (Stage 0): `transform: true`, `whitelist: true`, `forbidNonWhitelisted: true`
- **Cron Expression Validation** (Stage 6): `CronValidationService` validates cron syntax before storage

**Residual Risk:** LOW  
**Operational Response:** Validation errors logged, request rejected with 400 status

---

#### T-INPUT-02: Denial of Service via Resource Exhaustion

**Description:** Attacker sends requests designed to exhaust server resources (CPU, memory, database connections).

**Attack Vector:**

- Large payload (e.g., 100MB JSON)
- Recursive or deeply nested data structures
- Expensive database queries (e.g., unbounded `findMany`)

**Existing Mitigation:**

- **Payload Size Limits** (application-level, not documented in Stage 0-6)
- **Pagination** (not enforced in Stage 0-6)
- **Rate Limiting** (not implemented in Stage 0-6)

**Residual Risk:** HIGH  
**Operational Response:** Monitor resource utilization, implement rate limiting (requires Patch Authorization), restart service if needed

---

### 3.5 Insecure Direct Object Reference (IDOR)

#### T-IDOR-01: Direct Resource Access by ID

**Description:** Attacker guesses or enumerates resource IDs to access resources belonging to other tenants.

**Attack Vector:**

- `GET /api/v1/workflows/:id` with victim's workflow ID
- `PATCH /api/v1/workflows/:id` to modify victim's workflow

**Existing Mitigation:**

- **Tenant-Scoped Queries** (Stage 0): Prisma extension injects `organizationId` filter on all queries
- **404 Response** (Stage 2+): `findUnique` returns `null` if resource not found or belongs to different tenant, service throws `NotFoundException`
- **Enumeration Prevention** (Stage 2+): 404 returned for both "not found" and "not yours" (no 403)
- **E2E Tests** (Stage 6): IDOR attacks verified as blocked (404 response)

**Residual Risk:** VERY LOW  
**Operational Response:** Logged as 404, no data leakage, monitor for enumeration patterns

---

## 4. OPERATIONAL THREATS

### 4.1 Secrets & Credentials Threats

#### T-OPS-01: Secrets Exposure

**Description:** Sensitive secrets (database credentials, JWT secret, API keys) are exposed through logs, error messages, or insecure storage.

**Attack Vector:**

- Secrets logged in application logs
- Secrets in error stack traces
- Secrets committed to version control
- Secrets in environment variable dumps

**Existing Mitigation:**

- **Environment Variables** (Stage 0): Secrets stored in environment variables, not in code
- **`.gitignore`** (Stage 0): `.env` files excluded from version control
- **No Secret Logging** (Stage 0-6): Application code does not log secrets

**Residual Risk:** MEDIUM  
**Operational Response:** Rotate compromised secrets immediately, audit logs for exposure, revoke access

---

#### T-OPS-02: Secrets Rotation Failure

**Description:** Secrets are not rotated according to policy, increasing risk of compromise.

**Attack Vector:**

- Forgotten rotation schedule
- Manual rotation process error
- Downtime during rotation

**Existing Mitigation:**

- **Secrets Rotation Policy** (Stage 7): Documented rotation schedules and procedures

**Residual Risk:** MEDIUM  
**Operational Response:** Automated alerts at 80% of rotation period, emergency rotation if expired

---

### 4.2 Dependency & Supply Chain Threats

#### T-OPS-03: Vulnerable Dependencies

**Description:** Application uses npm packages with known security vulnerabilities.

**Attack Vector:**

- Outdated dependency with CVE
- Transitive dependency vulnerability
- Malicious package in supply chain

**Existing Mitigation:**

- **Dependency Freeze** (Stage 2): `package.json` immutable after Stage 2 (S2-L6)
- **Security Linter** (Stage 2): Verifies `package.json` immutability

**Residual Risk:** MEDIUM  
**Operational Response:** Dependency audit (manual), Patch Authorization required for updates, emergency patch for critical CVEs

---

### 4.3 Database Threats

#### T-OPS-04: Database Corruption

**Description:** Database data is corrupted due to hardware failure, software bug, or malicious action.

**Attack Vector:**

- Disk failure
- Database software bug
- Malicious DELETE or UPDATE query
- Migration failure

**Existing Mitigation:**

- **Database Backups** (operational, not documented in Stage 0-6)
- **Transaction Boundaries** (Stage 2+): Critical operations use `$transaction`
- **Audit Logs** (Stage 3+): `WorkflowExecutionLog` provides audit trail

**Residual Risk:** MEDIUM  
**Operational Response:** Restore from backup, verify data integrity, root cause analysis

---

#### T-OPS-05: Database Credential Compromise

**Description:** Database credentials are compromised, allowing unauthorized direct database access.

**Attack Vector:**

- Credentials leaked in logs or error messages
- Credentials stolen from environment variables
- Insider threat

**Existing Mitigation:**

- **Environment Variables** (Stage 0): Credentials not in code
- **Access Control** (operational): Database access restricted to application and ops team

**Residual Risk:** HIGH  
**Operational Response:** Rotate credentials immediately, audit database access logs, investigate compromise source

---

### 4.4 Service Availability Threats

#### T-OPS-06: Application Crash

**Description:** Application crashes due to unhandled exception, memory leak, or resource exhaustion.

**Attack Vector:**

- Unhandled exception in request handler
- Memory leak in long-running process
- Background worker failure

**Existing Mitigation:**

- **Error Handling** (Stage 0): Global exception filter
- **Graceful Shutdown** (Stage 6): Background workers stop gracefully on shutdown signal

**Residual Risk:** MEDIUM  
**Operational Response:** Automated restart, health check monitoring, log analysis

---

#### T-OPS-07: Background Worker Failure

**Description:** Scheduler or Executor background workers stop processing, causing workflow execution delays.

**Attack Vector:**

- Worker process crash
- Database connection loss
- Infinite loop or deadlock

**Existing Mitigation:**

- **Error Handling** (Stage 6): Workers catch and log errors, continue processing
- **Polling Loop** (Stage 6): Workers poll continuously, recover from transient failures

**Residual Risk:** MEDIUM  
**Operational Response:** Monitor worker logs, verify polling activity, restart workers if needed

---

### 4.5 Deployment & CI/CD Threats

#### T-OPS-08: Unauthorized Deployment

**Description:** Malicious or accidental deployment of untested or vulnerable code to production.

**Attack Vector:**

- CI/CD pipeline compromise
- Missing deployment gates
- Insufficient code review

**Existing Mitigation:**

- **CI Gates** (Stage 7): Lint, security linter, unit tests, integration tests, E2E tests (documented, not enforced in CI YAML)
- **Git Tag Verification** (Stage 7): Only tagged commits deploy (documented)
- **Security Linter** (Stage 2+): Blocks deployment if governance violations detected

**Residual Risk:** MEDIUM  
**Operational Response:** Rollback deployment, investigate compromise, audit CI/CD logs

---

#### T-OPS-09: CI/CD Pipeline Compromise

**Description:** Attacker gains access to CI/CD pipeline to inject malicious code or steal secrets.

**Attack Vector:**

- Stolen CI/CD credentials
- Malicious pull request with CI bypass
- Supply chain attack on CI/CD tooling

**Existing Mitigation:**

- **Access Control** (operational): CI/CD access restricted
- **Code Review** (operational): All changes reviewed before merge

**Residual Risk:** HIGH  
**Operational Response:** Revoke compromised credentials, audit all recent deployments, incident escalation to P0

---

### 4.6 Insider Threats

#### T-OPS-10: Privileged User Misuse

**Description:** User with elevated privileges (admin, developer, ops) abuses access to steal data, corrupt system, or sabotage operations.

**Attack Vector:**

- Direct database access
- Production environment access
- Source code modification

**Existing Mitigation:**

- **Audit Logs** (Stage 3+): `WorkflowExecutionLog` tracks all workflow state transitions
- **Access Control** (operational): Principle of least privilege
- **Code Review** (operational): All changes reviewed

**Residual Risk:** HIGH  
**Operational Response:** Audit log review, access revocation, incident investigation, legal action if warranted

---

## 5. ATTACK SURFACE ANALYSIS

### 5.1 HTTP API Endpoints

**Exposed Surface:**

- All endpoints under `/api/v1/*`
- Authentication endpoints: `/api/v1/auth/login`, `/api/v1/auth/me`
- Resource endpoints: `/api/v1/workflows`, `/api/v1/organizations`, `/api/v1/users`, etc.

**Attack Vectors:**

- Authentication bypass (T-AUTH-02)
- IDOR (T-IDOR-01)
- organizationId injection (T-TENANT-02)
- Input validation bypass (T-INPUT-01)

**Mitigation Layers:**

1. JwtAuthGuard (authentication)
2. TenantGuard (tenant isolation)
3. ValidationPipe (input validation)
4. Prisma Extension (data isolation)

---

### 5.2 Background Workers

**Exposed Surface:**

- Scheduler polling loop (processes `ScheduledTrigger`)
- Executor polling loop (processes `DeferredExecution`)

**Attack Vectors:**

- CLS context corruption (T-TENANT-03)
- Worker crash (T-OPS-07)
- Resource exhaustion (T-INPUT-02)

**Mitigation Layers:**

1. CLS context per organization
2. Error handling and logging
3. Idempotency keys

---

### 5.3 Database

**Exposed Surface:**

- PostgreSQL database (internal, not directly exposed)

**Attack Vectors:**

- SQL injection (T-DATA-01)
- Credential compromise (T-OPS-05)
- Data corruption (T-OPS-04)

**Mitigation Layers:**

1. Prisma ORM (parameterized queries)
2. Raw SQL blocked
3. Access control (network + credentials)
4. Backups and recovery

---

### 5.4 Secrets Store

**Exposed Surface:**

- Environment variables (runtime)

**Attack Vectors:**

- Secrets exposure (T-OPS-01)
- Credential compromise (T-OPS-05)

**Mitigation Layers:**

1. Environment variable isolation
2. Access control (ops team only)
3. Rotation policy

---

### 5.5 CI/CD Pipeline

**Exposed Surface:**

- Source code repository
- CI/CD automation

**Attack Vectors:**

- Pipeline compromise (T-OPS-09)
- Unauthorized deployment (T-OPS-08)

**Mitigation Layers:**

1. Access control
2. Code review
3. CI gates (documented)

---

## 6. THREAT CATEGORY SUMMARY

| Category                           | Threat Count | Residual Risk | Priority |
| ---------------------------------- | ------------ | ------------- | -------- |
| **Authentication & Authorization** | 3            | LOW-MEDIUM    | HIGH     |
| **Multi-Tenant Isolation**         | 3            | VERY LOW-LOW  | CRITICAL |
| **Data Integrity**                 | 2            | LOW-MEDIUM    | HIGH     |
| **Input Validation**               | 2            | LOW-HIGH      | MEDIUM   |
| **IDOR**                           | 1            | VERY LOW      | MEDIUM   |
| **Secrets & Credentials**          | 2            | MEDIUM        | HIGH     |
| **Dependencies**                   | 1            | MEDIUM        | MEDIUM   |
| **Database**                       | 2            | MEDIUM-HIGH   | HIGH     |
| **Service Availability**           | 2            | MEDIUM        | MEDIUM   |
| **Deployment & CI/CD**             | 2            | MEDIUM-HIGH   | HIGH     |
| **Insider Threats**                | 1            | HIGH          | HIGH     |

---

## 7. MAPPING TO STAGE 6 SECURITY GUARANTEES

| Stage 6 Security Guarantee                 | Threat Mitigation                     |
| ------------------------------------------ | ------------------------------------- |
| **Multi-tenant isolation verified**        | T-TENANT-01, T-TENANT-02, T-TENANT-03 |
| **IDOR attacks blocked**                   | T-IDOR-01                             |
| **organizationId injection blocked**       | T-TENANT-02                           |
| **Authentication bypass blocked**          | T-AUTH-02                             |
| **Cross-tenant data leakage blocked**      | T-TENANT-01                           |
| **Enumeration prevention (404 responses)** | T-IDOR-01                             |
| **Background worker CLS isolation**        | T-TENANT-03                           |

**Verdict:** Stage 6 E2E penetration tests (13/13 passed) provide evidence that runtime threats T-AUTH-02, T-TENANT-01, T-TENANT-02, T-IDOR-01 are effectively mitigated.

---

## 8. RESIDUAL RISK ACCEPTANCE

The following residual risks are **ACCEPTED** for Stage 7:

| Threat                                        | Residual Risk | Acceptance Rationale                                         |
| --------------------------------------------- | ------------- | ------------------------------------------------------------ |
| **T-INPUT-02** (DoS via resource exhaustion)  | HIGH          | Rate limiting requires infrastructure changes (future stage) |
| **T-OPS-05** (Database credential compromise) | HIGH          | Operational control, not application-level mitigation        |
| **T-OPS-09** (CI/CD pipeline compromise)      | HIGH          | Operational control, not application-level mitigation        |
| **T-OPS-10** (Insider threat)                 | HIGH          | Organizational control, audit logging in place               |

All other threats have residual risk of MEDIUM or lower.

---

## 9. THREAT MODEL MAINTENANCE

This threat model must be reviewed and updated:

- When new features are added (new stages)
- When new attack vectors are discovered
- After security incidents
- Quarterly at minimum

**Responsibility:** Security Lead + Principal Architect

---

**Document Status:** FINAL  
**Created:** 2026-01-21  
**Authority:** Principal Software Architect & Security Lead  
**Next Review:** Upon Stage 8 planning or Q2 2026
