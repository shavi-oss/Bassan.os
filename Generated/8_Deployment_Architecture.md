# Bassan.os Deployment Architecture – Enterprise Edition v2.2

## Document Control

- **Document Title**: Bassan.os Deployment Architecture – Enterprise Edition
- **Version**: 2.2
- **Status**: Approved for Production
- **Date**: 2026-01-08
- **Context**: Aligned with Technical Architecture v2.2 and API Specifications v2.2
- **Coverage**: Complete deployment strategies, monitoring, scaling, DR, and operational procedures

## Version History

| Version | Date       | Description              | Author       |
| :------ | :--------- | :----------------------- | :----------- |
| 2.1     | 2026-01-08 | Comprehensive Edition    | AI Architect |
| 2.2     | 2026-01-08 | Sprint 0 Standardization | CTO          |

## Table of Contents

1. [Introduction](#1-introduction)
2. [CI/CD Pipeline](#2-cicd-pipeline)
3. [Deployment Strategies](#3-deployment-strategies)
4. [Environment Specifications](#4-environment-specifications)
5. [Infrastructure Architecture](#5-infrastructure-architecture)
6. [Monitoring & Observability](#6-monitoring--observability)
7. [Scaling Strategies](#7-scaling-strategies)
8. [Multi-Region Deployment](#8-multi-region-deployment)
9. [Security & Compliance](#9-security--compliance)
10. [Disaster Recovery](#10-disaster-recovery)
11. [Operational Procedures](#11-operational-procedures)
12. [Cost Optimization](#12-cost-optimization)

---

## 1. Introduction

This document outlines the **production-ready strategy** for deploying, hosting, and maintaining the Bassan.os platform. It prioritizes **High Availability (HA)**, **Security**, **Automation**, and **Operational Excellence**.

**Key Principles**:

- **Infrastructure as Code**: All infrastructure defined in Terraform
- **GitOps**: Declarative deployments via ArgoCD
- **Immutable Infrastructure**: No manual changes to production
- **Zero-Downtime Deployments**: Blue-green and canary strategies
- **Automated Rollbacks**: Automatic rollback on failure detection

---

## 2. CI/CD Pipeline

### 2.1 Pipeline Architecture

**Tools**:

- **CI**: GitHub Actions
- **CD**: ArgoCD (GitOps)
- **Container Registry**: AWS ECR / Azure ACR
- **Artifact Storage**: S3 / Azure Blob

### 2.2 Pipeline Stages

#### Stage 1: Code Quality (2-3 minutes)

```yaml
- name: Lint
  run: |
    npm run lint
    npm run prettier:check

- name: Static Analysis
  run: |
    sonar-scanner
  quality_gate: Zero Critical Vulnerabilities
```

#### Stage 2: Testing (5-10 minutes)

```yaml
- name: Unit Tests
  run: npm run test:unit
  coverage_threshold: 80%

- name: Integration Tests
  run: npm run test:integration
  services:
    - postgres:16
    - redis:7

- name: E2E Tests
  run: npm run test:e2e
  browser: chromium
```

#### Stage 3: Build (3-5 minutes)

```yaml
- name: Build Docker Image
  run: |
    docker build -t bassan-api:${{ github.sha }} .
    docker build -t bassan-web:${{ github.sha }} ./web

- name: Security Scan
  run: |
    trivy image bassan-api:${{ github.sha }}
  fail_on: CRITICAL,HIGH
```

#### Stage 4: Publish (1-2 minutes)

```yaml
- name: Push to Registry
  run: |
    docker tag bassan-api:${{ github.sha }} $ECR_REPO/bassan-api:${{ github.sha }}
    docker push $ECR_REPO/bassan-api:${{ github.sha }}
    docker tag bassan-api:${{ github.sha }} $ECR_REPO/bassan-api:latest
    docker push $ECR_REPO/bassan-api:latest
```

#### Stage 5: Deploy (Auto for Dev/Staging, Manual for Prod)

```yaml
- name: Update Helm Chart
  run: |
    yq eval '.image.tag = "${{ github.sha }}"' -i helm/values-dev.yaml
    git commit -am "Deploy ${{ github.sha }} to dev"
    git push

- name: ArgoCD Sync
  run: |
    argocd app sync bassan-dev --prune
```

### 2.3 Branch Strategy

| Branch      | Environment | Deployment | Approval |
| :---------- | :---------- | :--------- | :------- |
| `feature/*` | -           | None       | -        |
| `develop`   | Development | Auto       | None     |
| `staging`   | Staging     | Auto       | None     |
| `main`      | Production  | Manual     | Required |

### 2.4 Quality Gates

**Must Pass Before Deployment**:

- ✅ All tests pass (unit, integration, E2E)
- ✅ Code coverage ≥ 80%
- ✅ No critical/high vulnerabilities
- ✅ SonarQube quality gate passed
- ✅ Peer review approved (for production)

---

## 3. Deployment Strategies

### 3.1 Blue-Green Deployment

**Use Case**: Production deployments with instant rollback capability

**Process**:

1. **Deploy Green**: Deploy new version to "green" environment
2. **Smoke Tests**: Run automated smoke tests on green
3. **Switch Traffic**: Update load balancer to route to green
4. **Monitor**: Monitor metrics for 15 minutes
5. **Keep Blue**: Keep blue environment for 24 hours (rollback capability)
6. **Cleanup**: Destroy blue environment after 24 hours

**Kubernetes Implementation**:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: bassan-api
spec:
  selector:
    app: bassan-api
    version: blue # Switch to 'green' for traffic shift
  ports:
    - port: 80
      targetPort: 3000
```

**Rollback**: Switch selector back to `version: blue`

### 3.2 Canary Deployment

**Use Case**: Gradual rollout with risk mitigation

**Process**:

1. **Deploy Canary**: Deploy new version to 10% of pods
2. **Monitor**: Monitor error rate, latency, CPU for 10 minutes
3. **Gradual Rollout**: If healthy, increase to 25% → 50% → 100%
4. **Auto-Rollback**: If error rate > 1%, automatic rollback

**Traffic Split**:

- 0-10 min: 10% canary, 90% stable
- 10-20 min: 25% canary, 75% stable
- 20-30 min: 50% canary, 50% stable
- 30-40 min: 100% canary

**Istio Configuration**:

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: bassan-api
spec:
  http:
    - match:
        - headers:
            canary:
              exact: "true"
      route:
        - destination:
            host: bassan-api
            subset: canary
    - route:
        - destination:
            host: bassan-api
            subset: stable
          weight: 90
        - destination:
            host: bassan-api
            subset: canary
          weight: 10
```

### 3.3 Rolling Updates

**Use Case**: Standard Kubernetes deployments

**Configuration**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bassan-api
spec:
  replicas: 6
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2 # Max 2 extra pods during update
      maxUnavailable: 1 # Max 1 pod down during update
  template:
    spec:
      containers:
        - name: api
          image: bassan-api:v2.1.0
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /health/live
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
```

### 3.4 Database Migrations

**Strategy**: Zero-downtime migrations

**Process**:

1. **Backward-Compatible Migration**: Deploy schema changes that are backward-compatible
2. **Deploy Application**: Deploy new application version
3. **Forward Migration**: Run forward migration (add columns, tables)
4. **Cleanup**: After 1 week, remove old columns (if any)

**Migration Tool**: Prisma Migrate / TypeORM Migrations

**Example**:

```typescript
// Migration 001: Add new column (backward-compatible)
await db.query(
  `ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE`
);

// Deploy application v2.1.0 (uses email_verified)

// Migration 002: Remove old column (after 1 week)
await db.query(`ALTER TABLE users DROP COLUMN old_email_status`);
```

**Rollback**: Down migrations available for all changes

---

## 4. Environment Specifications

### 4.1 Development Environment

**Purpose**: Developer testing and integration

**Infrastructure**:

- **Cluster**: Single-node Kubernetes (Minikube/Kind) or shared dev cluster
- **Database**: PostgreSQL 16 (single instance)
- **Cache**: Redis 7 (single instance)
- **Storage**: Local S3 (MinIO)

**Resource Limits**:

- API Pods: 2 replicas, 500m CPU, 512Mi memory
- Worker Pods: 1 replica, 250m CPU, 256Mi memory

**Data**: Synthetic test data, refreshed weekly

### 4.2 Staging Environment

**Purpose**: Pre-production testing, QA validation

**Infrastructure**:

- **Cluster**: AWS EKS (2 nodes, t3.large)
- **Database**: RDS PostgreSQL 16 (db.t3.medium, Multi-AZ)
- **Cache**: ElastiCache Redis (cache.t3.small, 2 nodes)
- **Storage**: S3 (standard tier)

**Resource Limits**:

- API Pods: 3 replicas, 1 CPU, 1Gi memory
- Worker Pods: 2 replicas, 500m CPU, 512Mi memory

**Data**: Anonymized production data (GDPR-compliant)

**Deployment**: Auto-deploy from `staging` branch

### 4.3 Production Environment

**Purpose**: Live customer-facing system

**Infrastructure**:

- **Cluster**: AWS EKS (6+ nodes, m5.xlarge, auto-scaling)
- **Database**: RDS PostgreSQL 16 (db.r5.2xlarge, Multi-AZ, read replicas)
- **Cache**: ElastiCache Redis (cache.r5.large, 3 nodes, cluster mode)
- **Storage**: S3 (standard + intelligent tiering)

**Resource Limits**:

- API Pods: 6+ replicas, 2 CPU, 2Gi memory (auto-scale to 20)
- Worker Pods: 4+ replicas, 1 CPU, 1Gi memory (auto-scale to 10)

**Data**: Live production data

**Deployment**: Manual approval required, blue-green strategy

### 4.4 Disaster Recovery Environment

**Purpose**: Failover in case of primary region failure

**Infrastructure**:

- **Cluster**: AWS EKS (standby, 3 nodes, m5.large)
- **Database**: RDS PostgreSQL 16 (cross-region read replica, promoted on failover)
- **Cache**: ElastiCache Redis (standby)
- **Storage**: S3 (cross-region replication)

**Resource Limits**: Same as production (scaled down when not active)

**Activation**: Manual failover or automatic (Route 53 health checks)

### 4.5 Environment Parity

**Strategy**: Keep environments as similar as possible

**Differences**:

- **Scale**: Prod has more replicas and larger instances
- **Data**: Dev/Staging use synthetic/anonymized data
- **Monitoring**: All environments monitored, prod has stricter SLAs

**Configuration Management**: Environment-specific values in Helm values files

---

## 5. Infrastructure Architecture

### 5.1 AWS Architecture (Primary)

#### Network Topology (VPC)

**VPC**: `10.0.0.0/16`

**Subnets**:

- **Public Subnet** (`10.0.1.0/24`, `10.0.2.0/24`): ALB, NAT Gateway
- **Private Subnet** (`10.0.10.0/24`, `10.0.11.0/24`): EKS nodes, ElastiCache
- **Isolated Subnet** (`10.0.20.0/24`, `10.0.21.0/24`): RDS PostgreSQL

**Availability Zones**: 2 AZs (us-east-1a, us-east-1b)

#### Compute

**EKS Cluster**:

- **Version**: Kubernetes 1.28
- **Node Groups**:
  - **General**: m5.xlarge (6 nodes, auto-scale to 20)
  - **Compute-Intensive**: c5.2xlarge (2 nodes, for reports)
  - **Memory-Intensive**: r5.xlarge (2 nodes, for analytics)

**Auto-Scaling**:

- **HPA**: CPU > 70%, Memory > 80%
- **Cluster Auto-Scaler**: Node utilization > 80%

#### Data

**Database**: Amazon RDS for PostgreSQL 16

- **Instance**: db.r5.2xlarge (8 vCPU, 64 GB RAM)
- **Multi-AZ**: Yes (automatic failover)
- **Read Replicas**: 2 (for reporting and analytics)
- **Backup**: Automated daily snapshots, 30-day retention
- **Encryption**: AES-256 at rest, TLS in transit

**Cache**: Amazon ElastiCache for Redis 7

- **Instance**: cache.r5.large (2 vCPU, 13.5 GB RAM)
- **Cluster Mode**: Enabled (3 shards, 1 replica per shard)
- **Backup**: Daily snapshots, 7-day retention

**Storage**: Amazon S3

- **Buckets**:
  - `bassan-prod-files`: User uploads, evidence
  - `bassan-prod-assets`: Marketing assets
  - `bassan-prod-backups`: Database backups
- **Versioning**: Enabled
- **Encryption**: SSE-S3 (AES-256)
- **Lifecycle**: Intelligent tiering

#### Load Balancing

**Application Load Balancer (ALB)**:

- **Scheme**: Internet-facing
- **Listeners**: HTTPS (443), HTTP (80 → redirect to 443)
- **SSL Certificate**: AWS ACM (auto-renewal)
- **Health Checks**: `/health/ready` (every 30s)

### 5.2 Multi-Cloud Support

**Azure Alternative**:

- **Compute**: AKS (Azure Kubernetes Service)
- **Database**: Azure Database for PostgreSQL
- **Cache**: Azure Cache for Redis
- **Storage**: Azure Blob Storage
- **Load Balancer**: Azure Application Gateway

**GCP Alternative**:

- **Compute**: GKE (Google Kubernetes Engine)
- **Database**: Cloud SQL for PostgreSQL
- **Cache**: Memorystore for Redis
- **Storage**: Google Cloud Storage
- **Load Balancer**: Cloud Load Balancing

---

## 6. Monitoring & Observability

### 6.1 Metrics (Prometheus + Grafana)

**Prometheus Deployment**:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
```

**Grafana Dashboards**:

1. **System Overview**: CPU, memory, disk, network
2. **Application Metrics**: Request rate, error rate, latency (RED)
3. **Business Metrics**: Active users, revenue, conversions
4. **Database Metrics**: Connections, queries/sec, slow queries
5. **Cache Metrics**: Hit rate, evictions, memory usage

**Key Metrics**:

- **Request Rate**: requests/sec per endpoint
- **Error Rate**: 4xx/5xx errors/sec
- **Latency**: p50, p95, p99 response times
- **Saturation**: CPU, memory, disk, network utilization

### 6.2 Logging (ELK Stack)

**Elasticsearch Deployment**:

- **Cluster**: 3 nodes (master, data, ingest)
- **Index**: Daily indices (`bassan-logs-2024-01-08`)
- **Retention**: 30 days (hot), 1 year (warm)

**Logstash Pipeline**:

```ruby
input {
  beats {
    port => 5044
  }
}

filter {
  json {
    source => "message"
  }

  grok {
    match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "bassan-logs-%{+YYYY.MM.dd}"
  }
}
```

**Kibana Dashboards**:

1. **Error Logs**: All ERROR and FATAL logs
2. **Slow Queries**: Database queries > 1s
3. **API Errors**: 4xx/5xx responses
4. **Security Events**: Failed logins, permission denials

### 6.3 Tracing (Jaeger / OpenTelemetry)

**OpenTelemetry Collector**:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:

processors:
  batch:
    timeout: 10s

exporters:
  jaeger:
    endpoint: jaeger:14250

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [jaeger]
```

**Trace Sampling**: 10% of requests (100% for errors)

**Trace Retention**: 7 days

### 6.4 APM (New Relic / Datadog)

**New Relic Agent**:

```javascript
require("newrelic");

// Automatic instrumentation for:
// - HTTP requests
// - Database queries
// - External API calls
// - Custom transactions
```

**Error Tracking (Sentry)**:

```javascript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 6.5 Alerting

**Alert Manager Configuration**:

```yaml
route:
  group_by: ["alertname", "cluster", "service"]
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: "pagerduty"

receivers:
  - name: "pagerduty"
    pagerduty_configs:
      - service_key: "<PAGERDUTY_KEY>"
```

**Alert Rules**:
| Alert | Condition | Severity | Action |
|:------|:----------|:---------|:-------|
| **High Error Rate** | Error rate > 1% for 5 min | Critical | Page on-call |
| **High Latency** | p95 latency > 2s for 5 min | Warning | Slack alert |
| **Pod Crash Loop** | Pod restarting > 3 times in 10 min | Critical | Page on-call |
| **Database Connections** | Connections > 80% for 5 min | Warning | Slack alert |
| **Disk Space** | Disk usage > 85% | Warning | Slack alert |
| **SSL Certificate** | Expiring in < 30 days | Warning | Email |

---

## 7. Scaling Strategies

### 7.1 Horizontal Pod Autoscaler (HPA)

**API Service HPA**:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: bassan-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: bassan-api
  minReplicas: 6
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "1000"
```

### 7.2 Cluster Autoscaler

**Configuration**:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cluster-autoscaler
data:
  cluster-autoscaler: |
    --scale-down-delay-after-add=10m
    --scale-down-unneeded-time=10m
    --scale-down-utilization-threshold=0.5
```

**Node Scaling**:

- **Scale Up**: When pods are pending due to insufficient resources
- **Scale Down**: When node utilization < 50% for 10 minutes
- **Min Nodes**: 6
- **Max Nodes**: 30

### 7.3 Database Scaling

**Read Replicas**:

- **Count**: 2 read replicas
- **Use Case**: Reporting, analytics, dashboard queries
- **Routing**: Application-level (read from replica for SELECT queries)

**Vertical Scaling**:

- **Current**: db.r5.2xlarge
- **Scale Up**: db.r5.4xlarge (if CPU > 80% sustained)

**Connection Pooling**:

```typescript
const pool = new Pool({
  max: 20, // Max connections per pod
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 7.4 Cache Scaling

**Redis Cluster**:

- **Shards**: 3 (auto-scale to 6 if memory > 80%)
- **Replicas**: 1 per shard (for HA)

---

## 8. Multi-Region Deployment

### 8.1 Architecture

**Primary Region**: us-east-1 (N. Virginia)  
**Secondary Region**: us-west-2 (Oregon)

**Strategy**: Active-Passive (with automatic failover)

### 8.2 Cross-Region Replication

**Database**: RDS cross-region read replica (promoted on failover)

**Storage**: S3 cross-region replication (CRR)

**Cache**: Redis backup/restore to secondary region

### 8.3 Global Load Balancing

**Route 53 Configuration**:

```json
{
  "Type": "A",
  "Name": "api.bassan.os",
  "SetIdentifier": "Primary",
  "Failover": "PRIMARY",
  "HealthCheckId": "hc-primary",
  "AliasTarget": {
    "HostedZoneId": "Z35SXDOTRQ7X7K",
    "DNSName": "alb-us-east-1.amazonaws.com"
  }
}
```

**Health Check**: Every 30s, failover if 3 consecutive failures

---

## 9. Security & Compliance

### 9.1 Network Security

**Security Groups**:

- **ALB**: Allow 80, 443 from 0.0.0.0/0
- **EKS Nodes**: Allow all from ALB security group
- **RDS**: Allow 5432 from EKS nodes security group
- **ElastiCache**: Allow 6379 from EKS nodes security group

**Network ACLs**: Default allow (security groups provide sufficient isolation)

**VPN**: Site-to-site VPN for corporate network access

### 9.2 Secrets Management

**AWS Secrets Manager**:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
data:
  username: <base64>
  password: <base64> # Fetched from Secrets Manager
```

**Secret Rotation**: Automatic rotation every 90 days

**Encryption**: KMS (AWS Key Management Service)

### 9.3 Compliance

**GDPR**:

- Data encryption at rest and in transit
- Right to be forgotten (soft delete + purge after 30 days)
- Data export API
- Audit logs for all data access

**SOC 2**:

- Access controls (RBAC)
- Audit logging
- Encryption
- Incident response plan

---

## 10. Disaster Recovery

### 10.1 RPO/RTO Targets

| Metric              | Target      | Strategy                               |
| :------------------ | :---------- | :------------------------------------- |
| **RPO** (Data Loss) | < 5 minutes | WAL shipping, cross-region replication |
| **RTO** (Downtime)  | < 1 hour    | Automated failover, IaC rebuild        |

### 10.2 Backup Strategy

**Database**:

- **Automated Snapshots**: Daily at 2 AM UTC
- **Transaction Logs**: Every 5 minutes
- **Retention**: 30 days
- **Cross-Region**: Replicated to us-west-2

**Files**:

- **S3 Versioning**: Enabled
- **Cross-Region Replication**: Real-time to us-west-2
- **Lifecycle**: Transition to Glacier after 90 days

### 10.3 Disaster Recovery Procedures

**Failover to DR Region**:

1. Promote RDS read replica to primary
2. Update Route 53 to point to DR region
3. Scale up DR EKS cluster
4. Verify application health
5. Notify stakeholders

**Recovery Time**: ~30-60 minutes

---

## 11. Operational Procedures

### 11.1 Deployment Runbook

**Pre-Deployment Checklist**:

- [ ] All tests passing
- [ ] Code review approved
- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] Stakeholders notified

**Deployment Steps**:

1. Create deployment ticket
2. Run database migrations (if any)
3. Deploy to staging, verify
4. Deploy to production (blue-green)
5. Monitor for 15 minutes
6. Mark deployment as complete

**Post-Deployment Verification**:

- [ ] Health checks passing
- [ ] Error rate < 0.1%
- [ ] Latency within SLA
- [ ] No critical alerts

### 11.2 Rollback Runbook

**Triggers**:

- Error rate > 1% for 5 minutes
- Critical functionality broken
- Database corruption detected

**Rollback Steps**:

1. Stop deployment
2. Switch traffic to blue environment (or previous version)
3. Investigate root cause
4. Create incident report
5. Plan fix and re-deployment

**Rollback Time**: < 5 minutes

### 11.3 Incident Response

**Severity Levels**:

- **P0 (Critical)**: System down, data loss
- **P1 (High)**: Major functionality broken
- **P2 (Medium)**: Minor functionality broken
- **P3 (Low)**: Cosmetic issues

**Response Times**:

- P0: Immediate (page on-call)
- P1: 15 minutes
- P2: 4 hours
- P3: Next business day

**On-Call Rotation**: 24/7 coverage, 1-week rotations

---

## 12. Cost Optimization

### 12.1 Reserved Instances

**Strategy**: Purchase 1-year reserved instances for baseline capacity

**Savings**: ~40% vs on-demand

**Coverage**:

- 6 m5.xlarge nodes (baseline EKS)
- 1 db.r5.2xlarge (RDS primary)
- 3 cache.r5.large (ElastiCache)

### 12.2 Spot Instances

**Use Case**: Non-critical workloads (batch jobs, CI/CD runners)

**Savings**: ~70% vs on-demand

**Configuration**: Mixed instance types, diversified AZs

### 12.3 Cost Monitoring

**AWS Cost Explorer**: Daily cost reports

**Budgets**: Alert if monthly cost > $50,000

**Tagging Strategy**:

- `Environment`: dev/staging/prod
- `Service`: api/web/worker
- `Team`: engineering/ops

---

## Document Approval

**Status**: ✅ Ready for Production  
**Alignment**: 100% with Technical Architecture v2.1

**Version History**:

- v2.0 (2026-01-06): Initial deployment architecture
- v2.1 (2026-01-08): Production-ready enhancement

---

_End of Document_
