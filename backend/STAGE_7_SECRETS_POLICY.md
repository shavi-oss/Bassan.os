# STAGE 7 — SECRETS MANAGEMENT POLICY

**Document Type:** Secrets & Key Management Policy  
**Stage:** 7 (Operational Readiness & Production Governance)  
**Classification:** CONFIDENTIAL — SECURITY & OPERATIONS REQUIRED  
**Created:** 2026-01-21  
**Status:** FINAL

---

## 1. EXECUTIVE SUMMARY

This document defines the secrets management policy for the BassanOS multi-tenant SaaS platform. It establishes secret types, rotation philosophy, compromise handling, and separation of duties principles.

**Secrets Management Philosophy:** Least privilege, defense-in-depth, assume breach.

---

## 2. SECRET TYPES & CLASSIFICATION

### 2.1 Secret Categories

| Secret Type              | Purpose                            | Scope                    | Criticality |
| ------------------------ | ---------------------------------- | ------------------------ | ----------- |
| **Database Credentials** | PostgreSQL connection              | Application + Operations | CRITICAL    |
| **JWT Secret**           | Token signing and verification     | Application              | CRITICAL    |
| **Encryption Keys**      | Data encryption at rest            | Application              | CRITICAL    |
| **API Keys (External)**  | Third-party service authentication | Application              | HIGH        |
| **Session Secrets**      | Session cookie signing             | Application              | MEDIUM      |
| **Admin Credentials**    | Administrative access              | Operations               | CRITICAL    |

### 2.2 Secret Sensitivity Levels

**CRITICAL:**

- Compromise leads to complete system breach
- Examples: Database credentials, JWT secret, encryption keys
- Access: CTO + Ops Lead only
- Rotation: Mandatory, scheduled

**HIGH:**

- Compromise leads to partial system breach or data exposure
- Examples: API keys, admin credentials
- Access: Ops team + authorized developers
- Rotation: Mandatory, scheduled

**MEDIUM:**

- Compromise leads to limited impact
- Examples: Session secrets, non-critical API keys
- Access: Development team
- Rotation: Recommended, scheduled

---

## 3. ROTATION PHILOSOPHY

### 3.1 Rotation Principles

1. **Proactive Rotation**
   - Rotate secrets on schedule, not only after compromise
   - Reduces window of opportunity for attackers
   - Limits blast radius of undetected compromise

2. **Zero-Downtime Rotation**
   - Rotation must not cause service interruption
   - Support dual-secret periods (old + new)
   - Graceful transition from old to new

3. **Automated Alerts**
   - Alert at 80% of rotation period
   - Alert at 100% of rotation period (overdue)
   - Prevent secret expiration

4. **Audit Trail**
   - Log all rotation events
   - Record who rotated, when, and why
   - Immutable audit log

---

### 3.2 Rotation Schedules

| Secret Type              | Rotation Frequency | Justification                                      |
| ------------------------ | ------------------ | -------------------------------------------------- |
| **Database Credentials** | 90 days            | Balance security and operational overhead          |
| **JWT Secret**           | 180 days           | Requires token invalidation or dual-secret support |
| **Encryption Keys**      | 365 days           | Requires data re-encryption, high operational cost |
| **API Keys (External)**  | 90 days            | Third-party service dependency                     |
| **Session Secrets**      | 180 days           | Requires session invalidation                      |
| **Admin Credentials**    | 90 days            | High-privilege access                              |

**Exception:** Emergency rotation required immediately upon suspected compromise.

---

### 3.3 Rotation Procedures (Conceptual)

**General Rotation Flow:**

1. **Pre-Rotation Verification**
   - Verify current secret is valid
   - Verify rotation authority (who can rotate)
   - Verify backup/rollback plan exists

2. **Generate New Secret**
   - Use cryptographically secure random generator
   - Verify new secret meets complexity requirements
   - Store new secret securely

3. **Deploy New Secret**
   - Update environment variables
   - Deploy application with dual-secret support (if applicable)
   - Verify application can use new secret

4. **Transition Period**
   - Support both old and new secrets (if applicable)
   - Monitor for errors
   - Wait for old secret usage to cease

5. **Revoke Old Secret**
   - Remove old secret from environment variables
   - Deploy application with new secret only
   - Verify old secret no longer works

6. **Post-Rotation Verification**
   - Verify application functionality
   - Verify no errors in logs
   - Document rotation in audit log

---

## 4. COMPROMISE HANDLING

### 4.1 Compromise Detection

**Indicators of Compromise:**

1. **Secret Exposure**
   - Secret appears in logs
   - Secret appears in error messages
   - Secret committed to version control
   - Secret sent in unencrypted communication

2. **Unauthorized Access**
   - Database access from unknown IP
   - API calls with valid credentials from unknown source
   - Unusual access patterns

3. **Security Alerts**
   - Intrusion detection system alert
   - Anomaly detection alert
   - Third-party breach notification

---

### 4.2 Compromise Response

**Immediate Actions (0-15 minutes):**

1. **Revoke Compromised Secret**
   - Immediately rotate compromised secret
   - Do NOT wait for scheduled rotation
   - Follow emergency rotation procedure

2. **Assess Blast Radius**
   - Identify what the compromised secret can access
   - Identify potential data exposure
   - Identify affected tenants (if applicable)

3. **Contain Breach**
   - Block unauthorized access
   - Isolate affected systems (if needed)
   - Preserve evidence (logs, access records)

**Investigation (15 minutes - 4 hours):**

4. **Identify Compromise Source**
   - How was secret exposed?
   - Who had access to secret?
   - When did compromise occur?

5. **Identify Unauthorized Actions**
   - What actions were taken with compromised secret?
   - What data was accessed?
   - What data was modified or exfiltrated?

**Recovery (4 hours - 24 hours):**

6. **Rotate All Related Secrets**
   - Rotate all secrets in same category
   - Rotate all secrets accessible by same role
   - Assume lateral movement

7. **Patch Vulnerability**
   - Fix exposure source (requires Patch Authorization if code change)
   - Update logging to prevent future exposure
   - Update access controls

8. **Notify Affected Parties**
   - Notify affected tenants (if data exposure)
   - Notify regulatory authorities (if required)
   - Provide incident details and remediation

**Post-Incident (24 hours - 7 days):**

9. **Conduct Post-Mortem**
   - Identify root cause
   - Identify preventive measures
   - Update secrets policy (if needed)

10. **Implement Preventive Measures**
    - Update secret scanning tools
    - Update access controls
    - Update rotation procedures

---

## 5. REVOCATION & BLAST RADIUS CONTROL

### 5.1 Revocation Principles

1. **Immediate Revocation**
   - Compromised secrets must be revoked immediately
   - Do NOT delay for scheduled rotation
   - Accept service disruption if necessary

2. **Cascading Revocation**
   - Revoke all secrets accessible by compromised role
   - Revoke all secrets in same environment
   - Assume lateral movement

3. **Verification**
   - Verify revoked secret no longer works
   - Verify no residual access
   - Monitor for unauthorized access attempts

---

### 5.2 Blast Radius Limitation

**Principle:** Limit the impact of a single secret compromise.

**Strategies:**

1. **Secret Isolation**
   - Use different secrets for different environments (production, staging, development)
   - Use different secrets for different services (if microservices)
   - Do NOT reuse secrets across systems

2. **Least Privilege**
   - Grant minimum necessary permissions to each secret
   - Database credentials: read-only vs read-write
   - API keys: scoped to specific resources

3. **Secret Rotation**
   - Regular rotation limits window of opportunity
   - Compromised secret becomes invalid after rotation

4. **Access Control**
   - Restrict who can access secrets
   - Audit all secret access
   - Revoke access when no longer needed

---

## 6. SEPARATION OF DUTIES

### 6.1 Access Control Matrix

| Secret Type              | Generate | Deploy   | Rotate   | Revoke   | Audit         |
| ------------------------ | -------- | -------- | -------- | -------- | ------------- |
| **Database Credentials** | Ops Lead | Ops Lead | Ops Lead | CTO      | Security Lead |
| **JWT Secret**           | Ops Lead | Ops Lead | Ops Lead | CTO      | Security Lead |
| **Encryption Keys**      | CTO      | CTO      | CTO      | CTO      | Security Lead |
| **API Keys (External)**  | Ops Team | Ops Team | Ops Team | Ops Lead | Security Lead |
| **Session Secrets**      | Ops Team | Ops Team | Ops Team | Ops Lead | Security Lead |
| **Admin Credentials**    | Ops Lead | Ops Lead | Ops Lead | CTO      | Security Lead |

### 6.2 Separation Principles

1. **No Single Point of Failure**
   - No single person can compromise all secrets
   - Critical secrets require CTO approval
   - Audit performed by independent role (Security Lead)

2. **Dual Control**
   - Critical operations require two authorized individuals
   - Example: Encryption key rotation requires CTO + Ops Lead
   - Prevents insider threat

3. **Audit Independence**
   - Audit role cannot generate, deploy, or rotate secrets
   - Ensures objective oversight
   - Detects unauthorized access

---

## 7. SECRET STORAGE PRINCIPLES

### 7.1 Storage Requirements

**FORBIDDEN:**

- Secrets in source code
- Secrets in version control
- Secrets in logs
- Secrets in error messages
- Secrets in unencrypted files

**REQUIRED:**

- Secrets in environment variables (runtime)
- Secrets in secure vault (at rest)
- Secrets encrypted in transit
- Secrets encrypted at rest

### 7.2 Storage Locations

| Environment     | Storage Method                       | Access Control                              |
| --------------- | ------------------------------------ | ------------------------------------------- |
| **Production**  | Environment variables + secure vault | Ops Lead only                               |
| **Staging**     | Environment variables + secure vault | Ops Team                                    |
| **Development** | Environment variables (local)        | Developers (individual secrets, not shared) |

**Principle:** Production secrets NEVER used in non-production environments.

---

## 8. SECRET COMPLEXITY REQUIREMENTS

### 8.1 Minimum Complexity

| Secret Type              | Minimum Length          | Character Requirements            |
| ------------------------ | ----------------------- | --------------------------------- |
| **Database Credentials** | 32 characters           | Alphanumeric + special characters |
| **JWT Secret**           | 64 characters           | Alphanumeric + special characters |
| **Encryption Keys**      | 256 bits (32 bytes)     | Cryptographically random          |
| **API Keys**             | Per vendor requirements | Per vendor requirements           |
| **Session Secrets**      | 32 characters           | Alphanumeric + special characters |
| **Admin Credentials**    | 16 characters           | Alphanumeric + special characters |

### 8.2 Generation Requirements

**REQUIRED:**

- Use cryptographically secure random number generator
- Do NOT use predictable patterns
- Do NOT use dictionary words
- Do NOT use personal information

**FORBIDDEN:**

- Weak passwords (e.g., "password123")
- Sequential patterns (e.g., "12345678")
- Repeated characters (e.g., "aaaaaaaa")

---

## 9. SECRET LIFECYCLE

### 9.1 Lifecycle Stages

```
┌──────────────┐
│  GENERATION  │ ← Cryptographically secure random generation
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   STORAGE    │ ← Secure vault, encrypted at rest
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  DEPLOYMENT  │ ← Environment variables, encrypted in transit
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   ROTATION   │ ← Scheduled or emergency rotation
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  REVOCATION  │ ← Immediate upon compromise or end of life
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   DELETION   │ ← Secure deletion, no recovery possible
└──────────────┘
```

### 9.2 Lifecycle Governance

**Generation:**

- Authority: Per access control matrix (Section 6.1)
- Audit: Log generation event, record who generated

**Storage:**

- Authority: Ops Lead
- Audit: Log storage location, record access permissions

**Deployment:**

- Authority: Ops Lead
- Audit: Log deployment event, record environment

**Rotation:**

- Authority: Per access control matrix (Section 6.1)
- Audit: Log rotation event, record old and new secret IDs (NOT values)

**Revocation:**

- Authority: CTO (emergency) or per access control matrix (scheduled)
- Audit: Log revocation event, record reason

**Deletion:**

- Authority: CTO
- Audit: Log deletion event, verify secure deletion

---

## 10. AUDIT & COMPLIANCE

### 10.1 Audit Requirements

**Audit Frequency:** Monthly

**Audit Scope:**

- All secret access events
- All secret rotation events
- All secret revocation events
- All failed access attempts

**Audit Responsibilities:**

- Security Lead conducts audit
- Reports to CTO
- Escalates anomalies immediately

### 10.2 Compliance Verification

**Verification Checklist:**

| Item                             | Verification Method      | Frequency     |
| -------------------------------- | ------------------------ | ------------- |
| **Secrets not in source code**   | Code scan                | Every commit  |
| **Secrets not in logs**          | Log scan                 | Daily         |
| **Rotation schedule compliance** | Audit log review         | Monthly       |
| **Access control compliance**    | Access log review        | Monthly       |
| **Complexity requirements**      | Secret strength analysis | At generation |

**Non-Compliance Response:**

- Immediate remediation
- Root cause analysis
- Process improvement
- Disciplinary action (if intentional violation)

---

## 11. EMERGENCY PROCEDURES

### 11.1 Emergency Rotation

**Trigger:** Secret compromise suspected or confirmed.

**Procedure:**

1. **Immediate Notification**
   - Notify CTO
   - Notify Security Lead
   - Notify Ops Lead

2. **Emergency Rotation Authorization**
   - CTO authorizes emergency rotation
   - Bypass normal approval process
   - Accept service disruption if necessary

3. **Execute Rotation**
   - Follow rotation procedure (Section 3.3)
   - Prioritize speed over zero-downtime
   - Document all actions

4. **Verify Revocation**
   - Verify old secret no longer works
   - Monitor for unauthorized access attempts
   - Escalate if old secret still works

5. **Post-Emergency Review**
   - Conduct post-mortem within 24 hours
   - Identify compromise source
   - Implement preventive measures

---

### 11.2 Mass Rotation

**Trigger:** Widespread compromise (e.g., infrastructure breach, insider threat).

**Procedure:**

1. **Declare Mass Rotation Event**
   - CTO declares mass rotation
   - Assemble rotation team (Ops Lead + Ops Team)
   - Prioritize secrets by criticality

2. **Rotate in Priority Order**
   - CRITICAL secrets first (database, JWT, encryption)
   - HIGH secrets second (API keys, admin credentials)
   - MEDIUM secrets third (session secrets)

3. **Coordinate Deployments**
   - Deploy all rotated secrets in single deployment (if possible)
   - Minimize service disruption
   - Monitor for errors

4. **Verify All Rotations**
   - Verify all old secrets revoked
   - Verify all new secrets working
   - Monitor for unauthorized access

5. **Post-Mass-Rotation Review**
   - Conduct post-mortem within 48 hours
   - Identify compromise source
   - Implement preventive measures

---

## 12. SECRETS POLICY MAINTENANCE

This secrets policy must be reviewed and updated:

- After every secret compromise
- When new secret types are added
- When new features are added (new stages)
- Annually at minimum

**Responsibility:** Security Lead + CTO

---

**Document Status:** FINAL  
**Created:** 2026-01-21  
**Authority:** Principal Software Architect & Security Lead  
**Next Review:** Upon Stage 8 planning or Q1 2027
