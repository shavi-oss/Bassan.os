# STAGE 7 — INCIDENT RESPONSE

**Document Type:** Incident Response Procedures & Playbooks  
**Stage:** 7 (Operational Readiness & Production Governance)  
**Classification:** CONFIDENTIAL — SECURITY & OPERATIONS REQUIRED  
**Created:** 2026-01-21  
**Status:** FINAL

---

## 1. EXECUTIVE SUMMARY

This document defines incident response procedures for the BassanOS multi-tenant SaaS platform. It establishes incident classification, detection, containment, recovery, and post-mortem processes.

**Incident Response Philosophy:** Detect fast, contain immediately, recover safely, learn always.

---

## 2. INCIDENT CLASSIFICATION

### 2.1 Severity Levels

| Severity          | Definition                                           | Examples                                                            | Response Time     | Escalation                     |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------------------------- | ----------------- | ------------------------------ |
| **P0 - Critical** | Complete system outage or security breach            | Database unavailable, tenant isolation failure, data breach         | Immediate         | CTO + Security Lead + Ops Lead |
| **P1 - High**     | Major feature unavailable or significant degradation | Authentication down, background workers stopped, API 50% error rate | 15 minutes        | Engineering Lead + Ops Lead    |
| **P2 - Medium**   | Minor feature degraded or performance issue          | Slow queries, intermittent errors, single endpoint down             | 1 hour            | On-call engineer               |
| **P3 - Low**      | Cosmetic issue or minor bug                          | UI glitch, typo, non-critical log error                             | Next business day | Backlog                        |

### 2.2 Severity Determination

**Decision Tree:**

1. **Is the entire system unavailable?**
   - YES → P0 (Critical)
   - NO → Continue

2. **Is authentication or multi-tenant isolation failing?**
   - YES → P0 (Critical)
   - NO → Continue

3. **Is sensitive data exposed or compromised?**
   - YES → P0 (Critical)
   - NO → Continue

4. **Is a major feature completely unavailable?**
   - YES → P1 (High)
   - NO → Continue

5. **Is a feature degraded or experiencing errors?**
   - YES → P2 (Medium)
   - NO → P3 (Low)

---

## 3. INCIDENT RESPONSE LIFECYCLE

### 3.1 Detection

**Detection Sources:**

1. **Automated Monitoring**
   - Health check failures
   - Error rate thresholds exceeded
   - Resource utilization alerts
   - Background worker stopped alerts

2. **User Reports**
   - Support tickets
   - Email reports
   - Direct communication

3. **Security Alerts**
   - Tenant isolation violation logs
   - Authentication failure spikes
   - Unusual access patterns

**Detection Criteria:**

- Alert triggered by monitoring system
- User report of unavailability or error
- Security log pattern detected

---

### 3.2 Triage & Classification

**Objective:** Determine incident severity and assign responder.

**Triage Steps:**

1. **Acknowledge Incident**
   - Acknowledge alert or report
   - Create incident ticket
   - Assign unique incident ID

2. **Classify Severity**
   - Use severity determination decision tree (Section 2.2)
   - Assign P0, P1, P2, or P3

3. **Assign Responder**
   - P0: Escalate to CTO + Security Lead + Ops Lead
   - P1: Escalate to Engineering Lead + Ops Lead
   - P2: Assign to on-call engineer
   - P3: Add to backlog

4. **Set Response Timer**
   - Start timer based on severity response time
   - Monitor for SLA compliance

**Triage SLA:**

- P0: 5 minutes
- P1: 15 minutes
- P2: 1 hour
- P3: Next business day

---

### 3.3 Containment

**Objective:** Stop incident from spreading or causing further damage.

**Containment Actions by Severity:**

**P0 - Critical:**

- Emergency shutdown (if tenant isolation failure)
- Isolate affected tenant (if data breach)
- Revoke compromised credentials (if security breach)
- Redirect traffic away from failed component (if system outage)

**P1 - High:**

- Disable affected feature (if feature failure)
- Restart affected service (if service crash)
- Scale resources (if resource exhaustion)

**P2 - Medium:**

- Monitor for escalation
- Throttle affected endpoint (if performance issue)

**P3 - Low:**

- No immediate containment required

**Containment SLA:**

- P0: Immediate
- P1: 15 minutes
- P2: 1 hour
- P3: N/A

---

### 3.4 Investigation

**Objective:** Identify root cause of incident.

**Investigation Steps:**

1. **Gather Evidence**
   - Collect logs (application, database, system)
   - Collect metrics (CPU, memory, network)
   - Collect error messages
   - Collect user reports

2. **Analyze Evidence**
   - Identify error patterns
   - Identify timeline of events
   - Identify affected components
   - Identify potential root causes

3. **Reproduce Issue**
   - Attempt to reproduce in non-production environment
   - Verify hypothesis
   - Confirm root cause

4. **Document Findings**
   - Record root cause
   - Record affected components
   - Record timeline
   - Record evidence references

**Investigation SLA:**

- P0: Ongoing during containment and recovery
- P1: 1 hour
- P2: 4 hours
- P3: Next business day

---

### 3.5 Recovery

**Objective:** Restore service to normal operation.

**Recovery Actions by Incident Type:**

**Application Crash:**

- Restart application
- Verify health checks
- Monitor for recurrence

**Database Failure:**

- Restore from backup (if corruption)
- Restart database (if crash)
- Verify data integrity

**Security Breach:**

- Rotate all secrets
- Patch vulnerability (requires Patch Authorization)
- Restore compromised data (if needed)
- Notify affected users

**Performance Degradation:**

- Optimize slow queries (requires Patch Authorization if code change)
- Scale resources
- Implement caching (requires Patch Authorization)

**Recovery SLA:**

- P0: Per RTO targets (Section 2.1 of STAGE_7_RUNBOOKS.md)
- P1: 1 hour
- P2: 4 hours
- P3: Next sprint

---

### 3.6 Post-Mortem

**Objective:** Learn from incident and prevent recurrence.

**Post-Mortem Requirements:**

**P0 Incidents:** MANDATORY  
**P1 Incidents:** MANDATORY  
**P2 Incidents:** RECOMMENDED  
**P3 Incidents:** OPTIONAL

**Post-Mortem Template:**

1. **Incident Summary**
   - Incident ID
   - Severity
   - Date and time
   - Duration
   - Affected users/tenants

2. **Timeline**
   - Detection time
   - Triage time
   - Containment time
   - Recovery time
   - Resolution time

3. **Root Cause**
   - Technical root cause
   - Process root cause (if applicable)
   - Contributing factors

4. **Impact**
   - User impact
   - Data impact
   - Revenue impact
   - Reputation impact

5. **Response Evaluation**
   - What went well
   - What went poorly
   - SLA compliance

6. **Action Items**
   - Preventive measures
   - Process improvements
   - Code fixes (with Patch Authorization)
   - Monitoring improvements

**Post-Mortem SLA:**

- P0: 24 hours after resolution
- P1: 48 hours after resolution
- P2: 1 week after resolution
- P3: N/A

---

## 4. INCIDENT RESPONSE PLAYBOOKS

### 4.1 Playbook: Security Breach

**Trigger:** Unauthorized access detected, tenant isolation violation, data exposure.

**Response Steps:**

1. **IMMEDIATE (0-5 minutes)**
   - Emergency shutdown (Section 4.2 of STAGE_7_RUNBOOKS.md)
   - Isolate affected tenant (if known)
   - Preserve evidence (logs, memory dump, database state)

2. **CONTAINMENT (5-15 minutes)**
   - Identify attack vector
   - Identify compromised credentials
   - Revoke compromised credentials
   - Block attacker IP (if known)

3. **INVESTIGATION (15 minutes - 4 hours)**
   - Analyze logs for unauthorized access
   - Identify compromised data
   - Identify affected tenants
   - Determine breach timeline

4. **RECOVERY (4 hours - 24 hours)**
   - Rotate all secrets (database credentials, JWT secret, API keys)
   - Patch vulnerability (requires Patch Authorization)
   - Restore compromised data from backup (if needed)
   - Deploy patched application

5. **NOTIFICATION (24 hours - 72 hours)**
   - Notify affected tenants
   - Provide incident details
   - Provide remediation steps
   - Provide timeline

6. **POST-MORTEM (72 hours)**
   - Conduct post-mortem
   - Identify preventive measures
   - Update security policies
   - Update incident response procedures

**Escalation:** CTO + Security Lead + Legal (if data breach)

---

### 4.2 Playbook: Data Corruption

**Trigger:** Database returns inconsistent data, data integrity checks fail, user reports data loss.

**Response Steps:**

1. **IMMEDIATE (0-5 minutes)**
   - Stop application (prevent further corruption)
   - Preserve current database state (backup before restore)

2. **INVESTIGATION (5-30 minutes)**
   - Identify corruption scope (which tables, which records)
   - Identify corruption timeline (when did it start)
   - Identify corruption cause (bug, migration failure, hardware failure)

3. **RECOVERY (30 minutes - 1 hour)**
   - Identify last known good backup
   - Restore database from backup
   - Verify data integrity
   - Apply any missing transactions (if possible)

4. **VERIFICATION (1 hour - 2 hours)**
   - Execute data integrity checks
   - Verify tenant isolation
   - Verify no further corruption
   - Restart application

5. **NOTIFICATION (2 hours - 24 hours)**
   - Notify affected users (if data loss occurred)
   - Provide data loss details
   - Provide recovery timeline

6. **POST-MORTEM (24 hours)**
   - Conduct post-mortem
   - Identify root cause
   - Implement preventive measures (requires Patch Authorization if code fix)

**Escalation:** Engineering Lead + Database Administrator

---

### 4.3 Playbook: Performance Degradation

**Trigger:** Response time > 5 seconds, error rate > 5%, CPU/memory > 80%.

**Response Steps:**

1. **IMMEDIATE (0-5 minutes)**
   - Identify degraded component (API, database, background workers)
   - Monitor for escalation to P0 (complete outage)

2. **INVESTIGATION (5-30 minutes)**
   - Analyze slow queries (database logs)
   - Analyze slow endpoints (application logs)
   - Analyze resource utilization (CPU, memory, network)
   - Identify bottleneck

3. **CONTAINMENT (30 minutes - 1 hour)**
   - Throttle affected endpoint (if specific endpoint)
   - Scale resources (if resource exhaustion)
   - Kill long-running queries (if database bottleneck)

4. **RECOVERY (1 hour - 4 hours)**
   - Optimize slow queries (requires Patch Authorization if code change)
   - Implement caching (requires Patch Authorization)
   - Add database indexes (requires Patch Authorization)

5. **VERIFICATION (4 hours - 8 hours)**
   - Monitor performance metrics
   - Verify response time < 1 second
   - Verify error rate < 1%

6. **POST-MORTEM (24 hours)**
   - Conduct post-mortem
   - Identify preventive measures
   - Implement performance monitoring improvements

**Escalation:** Engineering Lead + Database Administrator

---

### 4.4 Playbook: Background Worker Failure

**Trigger:** Scheduler or Executor stopped polling, worker logs show errors, deferred executions not processing.

**Response Steps:**

1. **IMMEDIATE (0-5 minutes)**
   - Verify worker process running
   - Check worker logs for errors
   - Classify as soft failure (transient) or hard failure (crash)

2. **SOFT FAILURE RECOVERY (5-15 minutes)**
   - Verify worker resumes polling
   - Monitor for recurrence
   - No restart required

3. **HARD FAILURE RECOVERY (15 minutes - 1 hour)**
   - Restart application
   - Verify workers resume polling
   - Verify no data loss (idempotency keys prevent duplicates)

4. **INVESTIGATION (1 hour - 4 hours)**
   - Analyze worker logs
   - Identify crash cause (unhandled exception, resource exhaustion, database connection loss)
   - Verify CLS context integrity

5. **PREVENTION (4 hours - 24 hours)**
   - Fix bug (requires Patch Authorization)
   - Improve error handling (requires Patch Authorization)
   - Add worker health monitoring

6. **POST-MORTEM (24 hours)**
   - Conduct post-mortem
   - Identify preventive measures

**Escalation:** Engineering Lead

---

## 5. ROLES & RESPONSIBILITIES

### 5.1 Incident Response Roles

| Role                    | Responsibilities                               | Authority                                              |
| ----------------------- | ---------------------------------------------- | ------------------------------------------------------ |
| **Incident Commander**  | Overall incident coordination, decision-making | Declare emergency shutdown, authorize recovery actions |
| **Technical Lead**      | Technical investigation, root cause analysis   | Propose technical solutions, execute recovery          |
| **Communications Lead** | User communication, stakeholder updates        | Notify affected users, provide status updates          |
| **Security Lead**       | Security investigation, threat analysis        | Declare security breach, authorize credential rotation |
| **Operations Lead**     | Infrastructure management, deployment          | Execute deployments, manage infrastructure             |

### 5.2 Role Assignment by Severity

| Severity | Incident Commander | Technical Lead     | Communications Lead | Security Lead                       | Operations Lead |
| -------- | ------------------ | ------------------ | ------------------- | ----------------------------------- | --------------- |
| **P0**   | CTO                | Engineering Lead   | CTO                 | Security Lead                       | Ops Lead        |
| **P1**   | Engineering Lead   | Senior Engineer    | Engineering Lead    | Security Lead (if security-related) | Ops Lead        |
| **P2**   | On-call Engineer   | On-call Engineer   | On-call Engineer    | N/A                                 | N/A             |
| **P3**   | N/A                | Assigned Developer | N/A                 | N/A                                 | N/A             |

---

## 6. ESCALATION PATHS

### 6.1 Escalation Triggers

**Escalate from P2 to P1:**

- Incident duration > 4 hours
- User impact increases
- Error rate increases

**Escalate from P1 to P0:**

- Complete system outage
- Security breach detected
- Data loss detected

**Escalate to Executive:**

- P0 incident duration > 1 hour
- Data breach confirmed
- Legal or regulatory implications

### 6.2 Escalation Procedures

1. **Notify Next Level**
   - Send alert to escalation contact
   - Provide incident summary
   - Provide current status

2. **Transfer Command**
   - Incident Commander role transfers to higher authority
   - Brief new Incident Commander
   - Continue response under new command

3. **Expand Response Team**
   - Add additional responders as needed
   - Assign specific tasks
   - Coordinate efforts

---

## 7. EVIDENCE PRESERVATION

### 7.1 Evidence Types

| Evidence Type          | Preservation Method                   | Retention |
| ---------------------- | ------------------------------------- | --------- |
| **Application Logs**   | Copy to secure storage                | 90 days   |
| **Database Logs**      | Copy to secure storage                | 90 days   |
| **System Logs**        | Copy to secure storage                | 90 days   |
| **Memory Dumps**       | Copy to secure storage                | 30 days   |
| **Database Snapshots** | Copy to secure storage                | 30 days   |
| **Network Captures**   | Copy to secure storage (if available) | 30 days   |

### 7.2 Evidence Preservation Procedures

**For P0 Incidents (MANDATORY):**

1. **Capture Logs**
   - Application logs (all levels)
   - Database logs (queries, errors)
   - System logs (OS, network)

2. **Capture State**
   - Memory dump (if possible)
   - Database snapshot (before any recovery actions)
   - Configuration files

3. **Secure Evidence**
   - Copy to secure, immutable storage
   - Restrict access (Incident Commander + Security Lead only)
   - Document evidence location in incident ticket

4. **Chain of Custody**
   - Record who collected evidence
   - Record when evidence was collected
   - Record where evidence is stored

**For P1 Incidents (RECOMMENDED):**

- Capture logs (application, database)
- Capture state (database snapshot if data-related)

**For P2/P3 Incidents (OPTIONAL):**

- Capture logs if needed for investigation

---

## 8. COMMUNICATION PRINCIPLES

### 8.1 Internal Communication

**Communication Channels:**

- Incident ticket (primary record)
- Dedicated incident channel (real-time coordination)
- Email (formal notifications)

**Communication Frequency:**

| Severity | Update Frequency | Audience                                       |
| -------- | ---------------- | ---------------------------------------------- |
| **P0**   | Every 15 minutes | CTO, Engineering Lead, Security Lead, Ops Lead |
| **P1**   | Every 30 minutes | Engineering Lead, Ops Lead                     |
| **P2**   | Every 2 hours    | On-call Engineer                               |
| **P3**   | As needed        | Assigned Developer                             |

**Communication Content:**

- Current status
- Actions taken
- Next steps
- Estimated resolution time

---

### 8.2 External Communication

**User Notification Triggers:**

| Trigger                       | Notification Required | Timing                                      |
| ----------------------------- | --------------------- | ------------------------------------------- |
| **Complete system outage**    | YES                   | Immediate                                   |
| **Security breach**           | YES                   | Within 24 hours (or per legal requirements) |
| **Data loss**                 | YES                   | Within 24 hours                             |
| **Major feature unavailable** | YES                   | Within 1 hour                               |
| **Performance degradation**   | OPTIONAL              | If prolonged (> 4 hours)                    |

**Notification Content:**

- Incident description (non-technical)
- User impact
- Estimated resolution time
- Mitigation steps (if any)
- Contact information

**Notification Channels:**

- Email (primary)
- Status page (if available)
- In-app notification (if available)

---

## 9. INCIDENT RESPONSE METRICS

### 9.1 Key Metrics

| Metric                              | Definition                            | Target                              |
| ----------------------------------- | ------------------------------------- | ----------------------------------- |
| **Mean Time to Detect (MTTD)**      | Time from incident start to detection | < 5 minutes                         |
| **Mean Time to Acknowledge (MTTA)** | Time from detection to acknowledgment | < 5 minutes (P0), < 15 minutes (P1) |
| **Mean Time to Contain (MTTC)**     | Time from detection to containment    | < 15 minutes (P0), < 1 hour (P1)    |
| **Mean Time to Recover (MTTR)**     | Time from detection to full recovery  | Per RTO targets                     |
| **Incident Recurrence Rate**        | % of incidents that recur             | < 10%                               |

### 9.2 Metric Reporting

**Reporting Frequency:** Monthly

**Reporting Audience:** CTO, Engineering Lead, Security Lead, Ops Lead

**Reporting Content:**

- Incident count by severity
- MTTD, MTTA, MTTC, MTTR averages
- Incident recurrence rate
- Top incident causes
- Action items from post-mortems

---

## 10. INCIDENT RESPONSE PLAN MAINTENANCE

This incident response plan must be reviewed and updated:

- After every P0 incident
- After every P1 incident (if lessons learned)
- When new features are added (new stages)
- Quarterly at minimum

**Responsibility:** Security Lead + Operations Lead + Principal Architect

---

**Document Status:** FINAL  
**Created:** 2026-01-21  
**Authority:** Principal Software Architect & Security Lead  
**Next Review:** Upon Stage 8 planning or Q2 2026
