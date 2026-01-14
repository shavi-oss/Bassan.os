# Bassan.os CTO Execution Directive

**Document Type**: Executive Execution Order  
**Status**: FINAL — EFFECTIVE IMMEDIATELY  
**Date**: 2026-01-08  
**Authority**: CTO  
**Classification**: Binding

---

# EXECUTIVE EXECUTION VERDICT

**The project is FROZEN as of this document.**

All documentation work STOPS. All architecture discussions STOP. All future-phase planning STOPS.

From this moment, the only acceptable output is **working code**.

**Target**: First paying customer within 90 days.  
**Team**: 1–3 developers.  
**Budget**: Minimal. No Kubernetes. No AWS enterprise services.

**If it doesn't help a user login, create a lead, or assign a task — it waits.**

---

# PART 1: SELF-DRIVEN EXECUTION PLAN

## 1.1 Project Reset Strategy

### FROZEN (Do Not Touch)

| Item                                 | Reason                              |
| :----------------------------------- | :---------------------------------- |
| All 48+ documentation files          | Reference only. Not binding.        |
| Mobile architecture                  | No mobile until web works.          |
| Partner Portal (BR-13, BR-14, BR-15) | Phase 2+.                           |
| Multi-region deployment              | Zero users, zero need.              |
| GraphQL API                          | REST only until mobile demands it.  |
| Event sourcing                       | Audit table is enough.              |
| Workflow engine (custom)             | Use manual task assignment for MVP. |

### DELETED FROM SCOPE

| Item                       | Reason                                       |
| :------------------------- | :------------------------------------------- |
| Microservices architecture | Monolith only.                               |
| Service mesh (Istio)       | Not needed.                                  |
| Kubernetes                 | Not needed for MVP.                          |
| RabbitMQ / Kafka           | PostgreSQL pg_boss or simple queues.         |
| Elasticsearch              | PostgreSQL ILIKE or pg_trgm.                 |
| HashiCorp Vault            | Environment variables.                       |
| Custom commission engine   | Excel export for MVP. Finance can calculate. |
| Custom SLA engine          | Manual due dates for MVP.                    |
| Custom workflow engine     | Linear task flow only.                       |

### POSTPONED (Phase 2+)

| Item                          | Target Phase |
| :---------------------------- | :----------- |
| SSO (SAML, Auth0)             | Phase 2      |
| Webhook integrations          | Phase 2      |
| Multi-currency                | Phase 2      |
| Advanced reporting/dashboards | Phase 2      |
| Customer portal               | Phase 2      |
| Mobile app                    | Phase 3      |
| API rate limiting             | Phase 2      |
| Audit log viewer              | Phase 2      |

### MANDATORY IMMEDIATELY

| Item                          | Deadline        |
| :---------------------------- | :-------------- |
| Auth module (JWT)             | Sprint 1 Day 3  |
| Organization registration     | Sprint 1 Day 5  |
| User CRUD                     | Sprint 1 Week 1 |
| Lead CRUD                     | Sprint 1 Week 2 |
| Task CRUD                     | Sprint 2 Week 1 |
| Frontend login screen         | Sprint 1 Day 5  |
| Frontend leads list           | Sprint 1 Week 2 |
| CI pipeline (lint + test)     | Sprint 1 Day 2  |
| Working local dev environment | Sprint 1 Day 1  |

---

## 1.2 MVP Definition (Non-Negotiable)

### MVP Feature List (Maximum 5)

| #   | Feature               | Description                                  | Done When                               |
| :-- | :-------------------- | :------------------------------------------- | :-------------------------------------- |
| 1   | **Multi-Tenant Auth** | Register org, login, logout, JWT refresh     | User can login and see their org name   |
| 2   | **Lead Management**   | Create, list, update, delete leads           | Sales user can add and edit a lead      |
| 3   | **Task Management**   | Create, assign, complete tasks               | Ops user can create and complete a task |
| 4   | **Basic Dashboard**   | Show lead count, task count, recent activity | User sees summary on login              |
| 5   | **User Management**   | Invite users, assign roles (Admin/User)      | Admin can add team members              |

### Explicit Out-of-Scope for MVP

- Opportunities / Pipeline
- Quotes / Proposals
- Invoicing / Payments
- Campaigns / Marketing
- HR / Employee management
- Support tickets
- Workflows (beyond linear task assignment)
- Commission calculations
- SLA enforcement
- File uploads
- Notifications (email/SMS/push)
- Search (beyond basic filtering)
- Reports / Analytics (beyond dashboard counts)
- Mobile app
- Customer-facing portal
- Integrations (any external system)

### MVP Success Criteria

| Criterion                      | Measurement                               |
| :----------------------------- | :---------------------------------------- |
| User can register organization | API returns 201, org in DB                |
| User can login/logout          | JWT issued, validated on protected routes |
| User can CRUD leads            | 4 endpoints work, data persists           |
| User can CRUD tasks            | 4 endpoints work, assigned_to works       |
| Dashboard displays counts      | API returns accurate counts               |
| Frontend works                 | User completes full flow in browser       |
| Tests pass                     | 80%+ coverage on auth, 60%+ elsewhere     |
| Deploys to staging             | One-command deploy works                  |

---

## 1.3 Sprint Plan

### Sprint 1: Foundation (Week 1-2)

**Goal**: Working auth + leads on backend and frontend.

| Day   | Deliverable                                     |
| :---- | :---------------------------------------------- |
| 1     | Local dev environment works (docker-compose up) |
| 2     | CI pipeline (GitHub Actions: lint + test)       |
| 3     | Auth module: register, login, JWT               |
| 4     | Auth module: logout, refresh, guards            |
| 5     | Frontend: login screen working                  |
| 6-7   | Organization CRUD API                           |
| 8-9   | User CRUD API + invite flow                     |
| 10    | Leads CRUD API                                  |
| 11-12 | Frontend: leads list + create form              |
| 13-14 | Testing + bug fixes                             |

**Exit Criteria**:

- `docker-compose up` works first try
- Login flow works end-to-end
- Leads CRUD works end-to-end
- CI passes on all commits

**Risks**:

- Prisma migrations may have issues → Mitigation: Test early, keep schema simple
- CORS issues → Mitigation: Configure in Day 1

---

### Sprint 2: Core Features (Week 3-4)

**Goal**: Tasks + dashboard + user invite.

| Day   | Deliverable                                         |
| :---- | :-------------------------------------------------- |
| 1-2   | Tasks CRUD API                                      |
| 3-4   | Task assignment logic                               |
| 5-6   | Frontend: tasks list + create + complete            |
| 7-8   | Dashboard API (counts)                              |
| 9-10  | Frontend: dashboard page                            |
| 11-12 | User invite flow (email optional, direct create OK) |
| 13-14 | Testing + bug fixes                                 |

**Exit Criteria**:

- Task full lifecycle works
- Dashboard shows accurate data
- Admin can add users
- All APIs tested

**Risks**:

- Task assignment complexity → Mitigation: Simple assigned_to FK, no workflow

---

### Sprint 3: Polish & Deploy (Week 5-6)

**Goal**: Production-ready MVP.

| Day   | Deliverable                         |
| :---- | :---------------------------------- |
| 1-2   | Error handling + loading states     |
| 3-4   | Form validation + UX fixes          |
| 5-6   | Staging deployment (Railway/Render) |
| 7-8   | Production deployment               |
| 9-10  | Manual E2E testing                  |
| 11-12 | Fix blockers                        |
| 13-14 | Documentation (README, setup guide) |

**Exit Criteria**:

- Production URL works
- First internal user completes full flow
- No P1 bugs

**Risks**:

- Hosting configuration → Mitigation: Use managed PaaS (Railway)

---

### Sprint 4: First Customer (Week 7-8)

**Goal**: Onboard first external user.

| Day   | Deliverable                               |
| :---- | :---------------------------------------- |
| 1-2   | Customer onboarding flow                  |
| 3-4   | Fix issues from customer feedback         |
| 5-6   | Basic email notifications (welcome email) |
| 7-8   | Password reset flow                       |
| 9-10  | Minor UX improvements                     |
| 11-14 | Support first customer                    |

**Exit Criteria**:

- One external org using system
- No data loss
- Customer can work independently

---

## 1.4 Team & Responsibility Model

### Roles (Can Be Same Person)

| Role             | Responsibility                                |
| :--------------- | :-------------------------------------------- |
| **Tech Lead**    | Architecture decisions, code review, blockers |
| **Backend Dev**  | API development, database, auth               |
| **Frontend Dev** | UI development, state management              |
| **QA**           | Testing, bug reporting (can be shared)        |
| **DevOps**       | CI/CD, deployment (can be Tech Lead)          |

### Ownership Matrix

| Area                | Owner        |
| :------------------ | :----------- |
| Auth & Security     | Tech Lead    |
| Database Schema     | Backend Dev  |
| API Endpoints       | Backend Dev  |
| Frontend UI         | Frontend Dev |
| CI/CD Pipeline      | Tech Lead    |
| Staging/Prod Deploy | Tech Lead    |
| Testing Strategy    | Tech Lead    |
| Customer Support    | Tech Lead    |

### Decision Escalation

| Decision Type        | Decider                              |
| :------------------- | :----------------------------------- |
| Feature scope change | CTO (this document)                  |
| Technology change    | Tech Lead + CTO approval             |
| Schema change        | Backend Dev + Tech Lead review       |
| UX change            | Frontend Dev (execute, review later) |
| Bug priority         | Tech Lead                            |
| Release go/no-go     | Tech Lead                            |

---

## 1.5 Execution Risks & Mitigations

| #   | Risk                          | Probability | Impact   | Mitigation                                          |
| :-- | :---------------------------- | :---------- | :------- | :-------------------------------------------------- |
| 1   | Scope creep                   | High        | High     | Frozen scope. All changes require CTO approval.     |
| 2   | Over-engineering relapse      | Medium      | High     | No abstractions until third use. YAGNI enforced.    |
| 3   | Database schema changes       | High        | Medium   | Migration strategy. Test locally first.             |
| 4   | Auth security vulnerabilities | Medium      | Critical | Use battle-tested libraries (Passport.js, bcrypt).  |
| 5   | Frontend complexity           | Medium      | Medium   | Keep UI simple. No component library debates.       |
| 6   | Deployment failures           | Medium      | High     | Test staging first. Rollback plan ready.            |
| 7   | Team burnout                  | Low         | High     | 2-week sprints. No death marches.                   |
| 8   | Customer requirements expand  | High        | Medium   | MVP scope locked. Feedback goes to Phase 2 backlog. |
| 9   | Third-party service issues    | Low         | Medium   | Minimal dependencies. No external APIs in MVP.      |
| 10  | Data loss                     | Low         | Critical | Daily backups. Test restore process.                |

---

# PART 2: ARCHITECTURE DECISION RECORDS

---

# ADR #001 — System Architecture Strategy

**ADR ID**: ADR-001  
**Title**: Monolithic Architecture for MVP  
**Status**: ACCEPTED  
**Date**: 2026-01-08  
**Decider**: CTO

## Context

The project has 17,000+ lines of documentation specifying a 12-service microservices architecture with Kubernetes, Istio, event sourcing, and multi-region deployment. The actual codebase has ~100 lines. Zero customers exist. The team is 1-3 developers.

Building microservices requires:

- Service discovery
- API gateway
- Distributed tracing
- Container orchestration
- Inter-service communication
- Multiple deployment pipelines

This infrastructure would consume 3-6 months before delivering any user value.

## Decision

**We will build a modular monolith.**

Characteristics:

- Single NestJS application
- Single PostgreSQL database
- Single deployment artifact
- Module boundaries (not service boundaries)
- Shared database, isolated code modules

## Alternatives Considered

| Alternative                 | Reason Rejected                       |
| :-------------------------- | :------------------------------------ |
| Microservices (12 services) | 6+ months infrastructure, 0 customers |
| Serverless (Lambda)         | Vendor lock-in, cold start issues     |
| Modular monolith            | ✅ Selected                           |
| No structure (single file)  | Unmaintainable                        |

## Consequences

**Positive**:

- Single deployment pipeline
- Single database to manage
- Simplified debugging
- Faster time-to-market (3x faster)
- Lower hosting costs

**Negative**:

- Future scaling requires refactoring
- Module boundaries require discipline
- Cannot scale individual components

## Rationale

With 0 customers and proven need, optimizing for scale is premature. The monolith can be split when:

- Team size exceeds 10 developers
- Specific module has different scaling needs
- Regulatory requirements demand isolation

## Review Trigger

Re-evaluate when:

- Monthly active users > 10,000
- Team size > 8 developers
- Module deploy conflicts occur weekly

---

# ADR #002 — Technology Stack & Infrastructure

**ADR ID**: ADR-002  
**Title**: Simplified Technology Stack for MVP  
**Status**: ACCEPTED  
**Date**: 2026-01-08  
**Decider**: CTO

## Context

The documentation specifies:

- PostgreSQL + Redis + Elasticsearch + RabbitMQ/Kafka
- NestJS + Next.js + React Native
- Docker + Kubernetes + Istio + Terraform + Vault
- AWS EKS multi-region

This stack costs $5,000+/month and requires 2+ months of DevOps before writing features.

## Decision

### Backend

| Component  | Choice            | Justification               |
| :--------- | :---------------- | :-------------------------- |
| Framework  | NestJS 10.x       | Mature, TypeScript, modular |
| Runtime    | Node.js 20 LTS    | Stable, performant          |
| ORM        | Prisma            | Type-safe, migrations       |
| Validation | class-validator   | Decorator-based             |
| Auth       | Passport.js + JWT | Battle-tested               |

### Frontend

| Component | Choice                   | Justification           |
| :-------- | :----------------------- | :---------------------- |
| Framework | Next.js 14 (App Router)  | SSR, file-based routing |
| UI        | Tailwind CSS + shadcn/ui | Fast, consistent        |
| State     | React Query              | Server state caching    |
| Forms     | React Hook Form          | Performance             |

### Database

| Component | Choice              | Justification          |
| :-------- | :------------------ | :--------------------- |
| Primary   | PostgreSQL 16       | Reliable, features     |
| Caching   | None (MVP)          | Premature              |
| Search    | PostgreSQL ILIKE    | Sufficient for MVP     |
| Queue     | pg_boss (if needed) | No external dependency |

### Infrastructure

| Component  | Choice                | Justification         |
| :--------- | :-------------------- | :-------------------- |
| Hosting    | Railway or Render     | Managed, simple       |
| CI/CD      | GitHub Actions        | Free, integrated      |
| Secrets    | Environment variables | Simple, secure enough |
| Monitoring | Railway built-in      | Free, sufficient      |
| CDN        | None (MVP)            | Premature             |

## Alternatives Considered

| Component | Alternative           | Reason Rejected            |
| :-------- | :-------------------- | :------------------------- |
| Database  | MySQL                 | PostgreSQL more features   |
| Cache     | Redis                 | Not needed for MVP         |
| Search    | Elasticsearch         | Overkill, PostgreSQL works |
| Queue     | RabbitMQ              | External dependency        |
| Hosting   | AWS EKS               | Cost, complexity           |
| Hosting   | Vercel + separate API | Split management           |

## Consequences

**Positive**:

- $20-50/month hosting (not $5,000)
- 1-day infrastructure setup (not 2 months)
- Single deployment target
- Built-in scaling to thousands of users
- No DevOps specialist required

**Negative**:

- Less "enterprise" appearance
- May need to migrate hosting later (acceptable)
- No Redis caching (database can handle it for now)

## Rationale

Railway/Render provides:

- PostgreSQL managed database
- Automatic SSL
- Zero-downtime deploys
- Built-in preview deployments
- $5 hobby tier, $20 starter tier

This is sufficient for MVP and first 100 customers.

## Review Trigger

Re-evaluate when:

- Database response time > 500ms (add Redis)
- Search queries > 10/sec (add Elasticsearch)
- Monthly bill > $500 (optimize or migrate)
- Team needs Kubernetes features

---

# FINAL CTO COMMANDMENTS

These 5 rules are non-negotiable for the next 90 days:

## 1. NO NEW DOCUMENTATION

Every hour spent documenting is an hour not coding. Write code. Document later.

## 2. YAGNI IS LAW

You Aren't Gonna Need It. No abstractions until third use. No future-proofing. No "what if" code.

## 3. SHIP WEEKLY

Every Friday, something new works that didn't work last Friday. No exceptions.

## 4. ONE WAY TO DO THINGS

No debates about state management, CSS approaches, or folder structures. The first reasonable solution wins. Move on.

## 5. CUSTOMERS OVER CODE QUALITY

A working ugly feature beats a beautiful unfinished feature. Refactor after users exist.

---

**This document is BINDING.**

All previous architectural decisions in documentation are SUPERSEDED by this directive.

**Execution begins NOW.**

---

**Signed**: CTO  
**Date**: 2026-01-08  
**Effective**: Immediately
