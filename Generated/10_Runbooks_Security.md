# Bassan.os Runbooks & Security Procedures – Enterprise Edition v2.2

## Document Control

- **Document Title**: Bassan.os Runbooks & Security Procedures
- **Version**: 2.2
- **Status**: Approved for Operations
- **Date**: 2026-01-08
- **Context**: Operational Reference for DevOps/SecOps/SRE Teams
- **Coverage**: Complete incident response, security procedures, operational runbooks, DR procedures

## Version History

| Version | Date       | Description              | Author       |
| :------ | :--------- | :----------------------- | :----------- |
| 2.1     | 2026-01-08 | Comprehensive Edition    | AI Architect |
| 2.2     | 2026-01-08 | Sprint 0 Standardization | CTO          |

## Table of Contents

1. [Incident Response Framework](#1-incident-response-framework)
2. [Security Runbooks](#2-security-runbooks)
3. [Operational Runbooks](#3-operational-runbooks)
4. [Disaster Recovery Procedures](#4-disaster-recovery-procedures)
5. [Monitoring & Alerting Runbooks](#5-monitoring--alerting-runbooks)
6. [Compliance Procedures](#6-compliance-procedures)
7. [On-Call Procedures](#7-on-call-procedures)

---

## 1. Incident Response Framework

### 1.1 Severity Levels

| Level                | Description                                          | Examples                                               | Response SLA | Resolution SLA | Notification                |
| :------------------- | :--------------------------------------------------- | :----------------------------------------------------- | :----------- | :------------- | :-------------------------- |
| **SEV-1 (Critical)** | System down, data breach, security incident          | Complete outage, database corruption, data breach      | 15 minutes   | 2 hours        | Page on-call, notify CTO    |
| **SEV-2 (High)**     | Major feature broken, severe performance degradation | Login broken, payment processing down, API errors > 5% | 1 hour       | 8 hours        | Slack alert, notify manager |
| **SEV-3 (Medium)**   | Minor bug, workaround available                      | UI glitch, slow query, non-critical feature broken     | 4 hours      | 2 days         | Slack alert                 |
| **SEV-4 (Low)**      | Cosmetic, non-urgent                                 | Typo, minor UI issue, documentation error              | 24 hours     | 1 week         | Email                       |

### 1.2 Escalation Path

```
L1 Support → DevOps On-Call → Engineering Manager → CTO → CEO
```

**Escalation Triggers**:

- SEV-1: Immediate escalation to DevOps On-Call
- SEV-2: Escalate after 2 hours if unresolved
- SEV-3: Escalate after 8 hours if unresolved

### 1.3 Incident Response Process

**1. Detection**:

- Automated alerts (Prometheus, Sentry)
- User reports (support tickets)
- Monitoring dashboards

**2. Triage**:

- Assess severity (SEV-1 to SEV-4)
- Identify affected systems
- Estimate impact (users affected, revenue impact)

**3. Response**:

- Assign incident commander
- Create incident channel (#incident-YYYY-MM-DD-NNN)
- Execute relevant runbook
- Communicate status updates (every 30 min for SEV-1, hourly for SEV-2)

**4. Resolution**:

- Implement fix
- Verify resolution
- Monitor for recurrence

**5. Post-Mortem** (for SEV-1 and SEV-2):

- Root cause analysis
- Timeline of events
- Action items to prevent recurrence
- Publish post-mortem within 48 hours

---

## 2. Security Runbooks

### 2.1 Credential Compromise

**Trigger**: Unusual activity detected, user report, leaked credentials

**Steps**:

1. **Revoke Session** (< 5 minutes):

   ```bash
   # Invalidate all JWT tokens for user
   redis-cli DEL "session:user:${USER_ID}:*"
   ```

2. **Lock Account**:

   ```sql
   UPDATE users SET is_active = FALSE, locked_at = NOW(), locked_reason = 'Credential compromise' WHERE id = '${USER_ID}';
   ```

3. **Audit**:

   ```sql
   SELECT * FROM audit_logs WHERE user_id = '${USER_ID}' AND created_at > NOW() - INTERVAL '24 hours' ORDER BY created_at DESC;
   ```

4. **Notify User**:

   - Send email notification
   - Force password reset

5. **Investigate**:

   - Check for unauthorized access
   - Review IP addresses, locations
   - Check for data exfiltration

6. **Restore** (after verification):
   ```sql
   UPDATE users SET is_active = TRUE, locked_at = NULL WHERE id = '${USER_ID}';
   ```

**Post-Incident**:

- Document findings
- Update security policies if needed

---

### 2.2 Data Breach

**Trigger**: Egress monitor spike, public report, security scan alert

**Steps**:

1. **Isolate** (< 15 minutes):

   ```bash
   # Enable maintenance mode
   kubectl scale deployment bassan-api --replicas=0
   # Or update ALB to show maintenance page
   ```

2. **Assess Scope**:

   - Which tables affected?
   - How many records?
   - What data types (PII, financial, etc.)?
   - Time window of breach?

3. **Preserve Evidence**:

   ```bash
   # Snapshot database
   aws rds create-db-snapshot --db-instance-identifier bassan-prod --db-snapshot-identifier breach-$(date +%Y%m%d-%H%M%S)

   # Export logs
   kubectl logs -n bassan-prod --all-containers --since=24h > breach-logs-$(date +%Y%m%d).log
   ```

4. **Notify** (< 1 hour):

   - Legal/Compliance team
   - GDPR Data Protection Officer (if EU data affected)
   - Affected customers (within 72 hours for GDPR)
   - Regulatory authorities (as required)

5. **Remediate**:

   - Patch vulnerability
   - Rotate all credentials
   - Update security rules

6. **Restore Service**:
   - Verify fix
   - Enable services
   - Monitor closely

**Post-Incident**:

- Full forensic analysis
- Update security controls
- Conduct security training

---

### 2.3 DDoS Attack

**Trigger**: CPU/Memory spike, 503 errors, unusual traffic pattern

**Steps**:

1. **Analyze** (< 10 minutes):

   ```bash
   # Check WAF logs
   aws wafv2 get-sampled-requests --web-acl-arn ${WAF_ARN} --rule-metric-name ${RULE_NAME}

   # Check source IPs
   kubectl logs -n bassan-prod deployment/bassan-api | grep "HTTP" | awk '{print $1}' | sort | uniq -c | sort -rn | head -20
   ```

2. **Block Malicious Traffic**:

   ```bash
   # Update WAF rules
   aws wafv2 update-ip-set --id ${IP_SET_ID} --addresses ${MALICIOUS_IPS}

   # Or block at ALB level
   aws elbv2 modify-listener --listener-arn ${LISTENER_ARN} --default-actions Type=fixed-response,FixedResponseConfig={StatusCode=403}
   ```

3. **Scale Up**:

   ```bash
   # Increase replicas
   kubectl scale deployment bassan-api --replicas=20

   # Or update HPA max
   kubectl patch hpa bassan-api-hpa -p '{"spec":{"maxReplicas":30}}'
   ```

4. **Enable DDoS Protection**:

   - AWS Shield Advanced
   - Cloudflare "Under Attack" mode
   - Rate limiting (increase thresholds temporarily)

5. **Monitor**:
   - Watch error rates
   - Monitor CPU/memory
   - Check response times

**Post-Incident**:

- Analyze attack pattern
- Update WAF rules permanently
- Consider CDN/DDoS protection upgrade

---

### 2.4 SQL Injection Attempt

**Trigger**: WAF alert, unusual database queries

**Steps**:

1. **Block Source**:

   ```bash
   # Add IP to WAF blocklist
   aws wafv2 update-ip-set --id ${IP_SET_ID} --addresses ${ATTACKER_IP}
   ```

2. **Audit Database**:

   ```sql
   -- Check for suspicious queries
   SELECT * FROM pg_stat_statements WHERE query LIKE '%UNION%' OR query LIKE '%DROP%' ORDER BY calls DESC;
   ```

3. **Verify Data Integrity**:

   - Check for unauthorized data modifications
   - Restore from backup if needed

4. **Patch Vulnerability**:
   - Review code for SQL injection vulnerabilities
   - Use parameterized queries
   - Update ORM/query builder

**Post-Incident**:

- Code review
- Security training
- Update WAF rules

---

### 2.5 Ransomware/Malware Detection

**Trigger**: Antivirus alert, unusual file encryption, suspicious processes

**Steps**:

1. **Isolate Affected Systems** (< 5 minutes):

   ```bash
   # Disconnect from network
   kubectl cordon ${NODE_NAME}
   kubectl drain ${NODE_NAME} --ignore-daemonsets
   ```

2. **Assess Scope**:

   - Which systems affected?
   - What files encrypted?
   - Is backup compromised?

3. **Do NOT Pay Ransom**:

   - Contact law enforcement
   - Contact cybersecurity firm

4. **Restore from Backup**:

   ```bash
   # Restore database from clean backup
   aws rds restore-db-instance-from-db-snapshot --db-instance-identifier bassan-prod-restored --db-snapshot-identifier ${CLEAN_SNAPSHOT}

   # Restore files from S3 versioning
   aws s3api list-object-versions --bucket bassan-prod-files --prefix ${PREFIX}
   ```

5. **Rebuild Infrastructure**:
   - Destroy compromised infrastructure
   - Rebuild from IaC (Terraform)
   - Restore data from clean backups

**Post-Incident**:

- Full security audit
- Update antivirus/EDR
- Implement additional security controls

---

### 2.6 Insider Threat

**Trigger**: Unusual data access, data exfiltration, privilege escalation

**Steps**:

1. **Disable Access** (< 5 minutes):

   ```sql
   UPDATE users SET is_active = FALSE WHERE id = '${SUSPECT_USER_ID}';
   ```

2. **Audit Activity**:

   ```sql
   SELECT * FROM audit_logs WHERE user_id = '${SUSPECT_USER_ID}' ORDER BY created_at DESC LIMIT 1000;
   ```

3. **Preserve Evidence**:

   - Export audit logs
   - Screenshot activity
   - Document timeline

4. **Notify**:

   - HR
   - Legal
   - Law enforcement (if criminal activity)

5. **Investigate**:
   - What data was accessed?
   - Was data exfiltrated?
   - Were systems compromised?

**Post-Incident**:

- Review access controls
- Implement stricter monitoring
- Update security policies

---

## 3. Operational Runbooks

### 3.1 Deployment Rollback

**Trigger**: Bad deployment causing SEV-1/SEV-2

**Steps**:

1. **Identify Version** (< 2 minutes):

   ```bash
   # Check current version
   kubectl get deployment bassan-api -o jsonpath='{.spec.template.spec.containers[0].image}'

   # List recent deployments
   helm history bassan-os
   ```

2. **Rollback** (< 3 minutes):

   ```bash
   # Helm rollback to previous version
   helm rollback bassan-os 0

   # Or kubectl rollback
   kubectl rollout undo deployment/bassan-api
   ```

3. **Verify** (< 2 minutes):

   ```bash
   # Check health endpoint
   curl https://api.bassan.os/health

   # Check pod status
   kubectl get pods -n bassan-prod

   # Check error rate
   # (Check Grafana dashboard)
   ```

4. **Monitor** (15 minutes):

   - Watch error rates
   - Monitor latency
   - Check user reports

5. **Root Cause Analysis**:
   - Review deployment logs
   - Identify what went wrong
   - Create post-mortem

**Rollback Time**: < 5 minutes

---

### 3.2 Database Failover (Multi-AZ)

**Trigger**: Primary database failure, planned maintenance

**Steps**:

1. **Verify Failure**:

   ```bash
   # Check RDS status
   aws rds describe-db-instances --db-instance-identifier bassan-prod
   ```

2. **Initiate Failover** (automatic or manual):

   ```bash
   # Manual failover (if needed)
   aws rds reboot-db-instance --db-instance-identifier bassan-prod --force-failover
   ```

3. **Update DNS** (if manual failover):

   ```bash
   # Update Route 53 record to point to standby
   aws route53 change-resource-record-sets --hosted-zone-id ${ZONE_ID} --change-batch file://failover.json
   ```

4. **Verify**:

   ```bash
   # Test database connection
   psql -h ${NEW_DB_ENDPOINT} -U bassan -d bassan_prod -c "SELECT 1;"
   ```

5. **Monitor**:
   - Check replication lag
   - Monitor query performance
   - Watch error rates

**Failover Time**: < 2 minutes (automatic), < 10 minutes (manual)

---

### 3.3 Cache Flush (Redis)

**Trigger**: Stale data, cache corruption, deployment

**Steps**:

1. **Identify Keys to Flush**:

   ```bash
   # List keys by pattern
   redis-cli --scan --pattern "cache:user:*"
   ```

2. **Flush Specific Keys**:

   ```bash
   # Flush by pattern
   redis-cli --scan --pattern "cache:user:*" | xargs redis-cli DEL

   # Or flush all (use with caution)
   redis-cli FLUSHALL
   ```

3. **Verify**:

   ```bash
   # Check key count
   redis-cli DBSIZE
   ```

4. **Monitor**:
   - Watch cache hit rate (expect drop, then recovery)
   - Monitor database load (expect spike, then normalization)

**Impact**: Temporary performance degradation (cache rebuild)

---

### 3.4 Key Rotation (Quarterly)

**Trigger**: Scheduled maintenance (every 90 days)

**Steps**:

1. **Generate New Keys**:

   ```bash
   # Generate new JWT signing key
   openssl rand -base64 32

   # Generate new database encryption key
   openssl rand -base64 32
   ```

2. **Update Secrets Manager**:

   ```bash
   # Update JWT key (keep old key as backup)
   aws secretsmanager update-secret --secret-id bassan/jwt-key --secret-string "${NEW_JWT_KEY}"

   # Update DB encryption key
   aws secretsmanager update-secret --secret-id bassan/db-encryption-key --secret-string "${NEW_DB_KEY}"
   ```

3. **Rolling Restart**:

   ```bash
   # Restart API pods to pick up new keys
   kubectl rollout restart deployment/bassan-api
   ```

4. **Verify**:

   ```bash
   # Test login (new tokens use new key)
   curl -X POST https://api.bassan.os/v1/auth/token -d '{"username":"test","password":"test"}'

   # Test data decryption
   # (Check application logs for errors)
   ```

5. **Revoke Old Keys** (after 24 hours):
   ```bash
   # Remove old key from Secrets Manager
   aws secretsmanager delete-secret --secret-id bassan/jwt-key-old --force-delete-without-recovery
   ```

**Rotation Schedule**: Every 90 days

---

### 3.5 Database Maintenance (Weekly)

**Trigger**: Scheduled maintenance (Sunday 3 AM UTC)

**Steps**:

1. **Analyze Bloat**:

   ```sql
   -- Check table bloat
   SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

   -- Check index bloat
   SELECT schemaname, tablename, indexname, pg_size_pretty(pg_relation_size(indexrelid)) AS size
   FROM pg_stat_user_indexes
   ORDER BY pg_relation_size(indexrelid) DESC;
   ```

2. **Vacuum**:

   ```sql
   -- Vacuum analyze (reclaim space, update statistics)
   VACUUM ANALYZE;

   -- Or vacuum specific tables
   VACUUM ANALYZE users;
   VACUUM ANALYZE opportunities;
   ```

3. **Reindex** (if fragmentation > 30%):

   ```sql
   -- Reindex high-churn tables
   REINDEX TABLE users;
   REINDEX TABLE audit_logs;
   ```

4. **Update Statistics**:

   ```sql
   ANALYZE;
   ```

5. **Verify**:
   ```sql
   -- Check last vacuum/analyze time
   SELECT schemaname, tablename, last_vacuum, last_autovacuum, last_analyze, last_autoanalyze
   FROM pg_stat_user_tables;
   ```

**Maintenance Window**: Sunday 3-5 AM UTC (low traffic)

---

### 3.6 Log Rotation and Archival

**Trigger**: Scheduled (daily)

**Steps**:

1. **Rotate Logs**:

   ```bash
   # Elasticsearch: Close old indices
   curl -X POST "localhost:9200/bassan-logs-$(date -d '30 days ago' +%Y.%m.%d)/_close"

   # Delete indices older than 90 days
   curl -X DELETE "localhost:9200/bassan-logs-$(date -d '90 days ago' +%Y.%m.%d)"
   ```

2. **Archive to S3**:

   ```bash
   # Export logs to S3
   elasticdump --input=http://localhost:9200/bassan-logs-$(date -d '30 days ago' +%Y.%m.%d) --output=s3://bassan-logs-archive/$(date -d '30 days ago' +%Y.%m.%d).json
   ```

3. **Verify**:
   ```bash
   # Check S3 archive
   aws s3 ls s3://bassan-logs-archive/
   ```

**Retention**:

- Hot (Elasticsearch): 30 days
- Warm (S3): 1 year
- Cold (Glacier): 7 years

---

### 3.7 SSL Certificate Renewal

**Trigger**: Certificate expiring in < 30 days

**Steps**:

1. **Check Expiration**:

   ```bash
   # Check certificate expiration
   echo | openssl s_client -servername api.bassan.os -connect api.bassan.os:443 2>/dev/null | openssl x509 -noout -dates
   ```

2. **Renew Certificate** (AWS ACM auto-renews):

   ```bash
   # Verify ACM auto-renewal
   aws acm describe-certificate --certificate-arn ${CERT_ARN}
   ```

3. **Manual Renewal** (if needed):

   ```bash
   # Request new certificate
   aws acm request-certificate --domain-name api.bassan.os --validation-method DNS

   # Update ALB listener
   aws elbv2 modify-listener --listener-arn ${LISTENER_ARN} --certificates CertificateArn=${NEW_CERT_ARN}
   ```

4. **Verify**:
   ```bash
   # Test HTTPS connection
   curl -v https://api.bassan.os/health
   ```

**Renewal**: Automatic (AWS ACM), manual check monthly

---

### 3.8 Backup Verification (Monthly)

**Trigger**: Scheduled (1st of month)

**Steps**:

1. **List Recent Backups**:

   ```bash
   # List RDS snapshots
   aws rds describe-db-snapshots --db-instance-identifier bassan-prod --max-records 10

   # List S3 backups
   aws s3 ls s3://bassan-prod-backups/
   ```

2. **Restore Test** (in staging):

   ```bash
   # Restore database to staging
   aws rds restore-db-instance-from-db-snapshot --db-instance-identifier bassan-staging-test --db-snapshot-identifier ${LATEST_SNAPSHOT}
   ```

3. **Verify Data Integrity**:

   ```sql
   -- Check record counts
   SELECT 'users' AS table_name, COUNT(*) FROM users
   UNION ALL
   SELECT 'opportunities', COUNT(*) FROM opportunities
   UNION ALL
   SELECT 'invoices', COUNT(*) FROM invoices;
   ```

4. **Cleanup**:
   ```bash
   # Delete test instance
   aws rds delete-db-instance --db-instance-identifier bassan-staging-test --skip-final-snapshot
   ```

**Verification Schedule**: Monthly

---

## 4. Disaster Recovery Procedures

### 4.1 Full System Recovery

**Trigger**: Complete system failure, data center outage

**Steps**:

1. **Assess Scope** (< 15 minutes):

   - What systems are down?
   - Is data intact?
   - Is backup available?

2. **Activate DR Site** (< 30 minutes):

   ```bash
   # Promote RDS read replica to primary
   aws rds promote-read-replica --db-instance-identifier bassan-dr

   # Update Route 53 to point to DR region
   aws route53 change-resource-record-sets --hosted-zone-id ${ZONE_ID} --change-batch file://dr-failover.json

   # Scale up DR EKS cluster
   kubectl scale deployment bassan-api --replicas=6 -n bassan-dr
   ```

3. **Verify Services** (< 15 minutes):

   ```bash
   # Check health endpoints
   curl https://api.bassan.os/health

   # Test critical flows (login, create opportunity, etc.)
   ```

4. **Notify Stakeholders**:

   - Internal teams
   - Customers (if extended outage)

5. **Monitor**:
   - Watch error rates
   - Monitor performance
   - Check user reports

**Recovery Time Objective (RTO)**: < 1 hour

---

### 4.2 Data Corruption Recovery

**Trigger**: Database corruption, accidental data deletion

**Steps**:

1. **Stop Writes** (< 5 minutes):

   ```bash
   # Set database to read-only
   aws rds modify-db-instance --db-instance-identifier bassan-prod --no-multi-az
   ```

2. **Assess Damage**:

   - What data is corrupted?
   - When did corruption occur?
   - Is backup available before corruption?

3. **Restore from Backup**:

   ```bash
   # Restore to point-in-time before corruption
   aws rds restore-db-instance-to-point-in-time --source-db-instance-identifier bassan-prod --target-db-instance-identifier bassan-prod-restored --restore-time ${TIMESTAMP}
   ```

4. **Verify Data**:

   ```sql
   -- Check data integrity
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM opportunities;
   ```

5. **Cutover**:
   ```bash
   # Update application to point to restored database
   kubectl set env deployment/bassan-api DB_HOST=${RESTORED_DB_ENDPOINT}
   ```

**Recovery Point Objective (RPO)**: < 5 minutes

---

## 5. Monitoring & Alerting Runbooks

### 5.1 High Error Rate Alert

**Trigger**: Error rate > 1% for 5 minutes

**Steps**:

1. **Check Grafana Dashboard**:

   - Which endpoints have errors?
   - What error codes (4xx, 5xx)?
   - When did it start?

2. **Check Logs**:

   ```bash
   # Check recent errors
   kubectl logs -n bassan-prod deployment/bassan-api --tail=100 | grep "ERROR"
   ```

3. **Identify Root Cause**:

   - Recent deployment?
   - Database issue?
   - External API failure?

4. **Mitigate**:
   - Rollback deployment (if recent)
   - Scale up resources (if capacity issue)
   - Disable feature flag (if feature issue)

---

### 5.2 High Latency Alert

**Trigger**: p95 latency > 2s for 5 minutes

**Steps**:

1. **Check APM** (New Relic/Datadog):

   - Which endpoints are slow?
   - What's the bottleneck (database, external API, CPU)?

2. **Check Database**:

   ```sql
   -- Check slow queries
   SELECT query, mean_exec_time, calls FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
   ```

3. **Mitigate**:
   - Add database index (if missing)
   - Scale up resources
   - Enable caching

---

## 6. Compliance Procedures

### 6.1 GDPR Data Export

**Trigger**: User requests data export (Right to Access)

**Steps**:

1. **Verify Identity**:

   - Confirm user identity
   - Log request in audit log

2. **Export Data**:

   ```sql
   -- Export all user data
   SELECT * FROM users WHERE id = '${USER_ID}';
   SELECT * FROM leads WHERE assigned_to = '${USER_ID}';
   SELECT * FROM opportunities WHERE assigned_to = '${USER_ID}';
   -- ... (all related tables)
   ```

3. **Format as JSON/CSV**:

   ```bash
   # Export to JSON
   psql -h ${DB_HOST} -U bassan -d bassan_prod -c "COPY (SELECT row_to_json(t) FROM (SELECT * FROM users WHERE id = '${USER_ID}') t) TO STDOUT" > user_data.json
   ```

4. **Deliver to User**:
   - Secure download link (expires in 7 days)
   - Email notification

**SLA**: 30 days

---

### 6.2 GDPR Data Deletion (Right to be Forgotten)

**Trigger**: User requests data deletion

**Steps**:

1. **Verify Identity**:

   - Confirm user identity
   - Check for legal holds

2. **Soft Delete** (30-day grace period):

   ```sql
   UPDATE users SET deleted_at = NOW(), is_active = FALSE WHERE id = '${USER_ID}';
   ```

3. **Hard Delete** (after 30 days):

   ```sql
   DELETE FROM users WHERE id = '${USER_ID}' AND deleted_at < NOW() - INTERVAL '30 days';
   -- Cascade delete related records
   ```

4. **Verify**:
   ```sql
   SELECT * FROM users WHERE id = '${USER_ID}';
   ```

**SLA**: 30 days

---

## 7. On-Call Procedures

### 7.1 On-Call Rotation

**Schedule**: 1-week rotations, 24/7 coverage

**Responsibilities**:

- Respond to alerts within SLA
- Triage incidents
- Execute runbooks
- Escalate if needed

### 7.2 Handoff Procedure

**Steps**:

1. **Review Open Incidents**:

   - Any ongoing incidents?
   - Any pending tasks?

2. **Review Recent Changes**:

   - Recent deployments?
   - Configuration changes?

3. **Check Monitoring**:

   - Any degraded services?
   - Any warning alerts?

4. **Document Handoff**:
   - Update on-call log
   - Note any concerns

---

## Document Approval

**Status**: ✅ Ready for Operations  
**Alignment**: 100% with Deployment Architecture v2.1

**Version History**:

- v2.0 (2026-01-06): Initial runbooks
- v2.1 (2026-01-08): Comprehensive enhancement

---

_End of Document_
