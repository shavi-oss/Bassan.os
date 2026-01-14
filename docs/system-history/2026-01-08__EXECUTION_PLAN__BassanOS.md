# EXECUTION PLAN — Bassan.os MVP Development

---

## Header

| Field       | Value                                     |
| :---------- | :---------------------------------------- |
| **Date**    | 2026-01-08                                |
| **Author**  | CTO / Principal Architect (AI)            |
| **Trigger** | User request for realistic execution plan |
| **Status**  | 🟢 APPROVED & IN PROGRESS                 |
| **Version** | 1.1                                       |
| **Updated** | 2026-01-08 23:30                          |

---

## Input Context Snapshot

### Current State

| Metric        | Value                          |
| :------------ | :----------------------------- |
| Documentation | 17,000+ lines across 48+ files |
| Backend Code  | ~100 lines (skeleton)          |
| Frontend Code | 0 lines (does not exist)       |
| Tests         | 0                              |
| CI/CD         | Not configured                 |
| Customers     | 0                              |
| Revenue       | $0                             |

### Architecture Status

| Documented           | Reality             |
| :------------------- | :------------------ |
| 12 microservices     | 1 skeleton API      |
| 76 database entities | 5 Prisma models     |
| 200+ API endpoints   | 1 health endpoint   |
| Kubernetes + Istio   | docker-compose only |

### Team Assumption

- 1-3 developers
- Mixed full-stack skills
- Available 40 hours/week each

---

## Key Decisions Made

### ADR-001: Architecture Strategy

| Decision             | Rationale                                                                                                    |
| :------------------- | :----------------------------------------------------------------------------------------------------------- |
| **Modular Monolith** | Microservices rejected. Zero customers, 1-3 devs, no scaling need. Single NestJS app with module boundaries. |

### ADR-002: Technology Stack

| Layer    | Choice               | Why                                   |
| :------- | :------------------- | :------------------------------------ |
| Backend  | NestJS 10.x          | TypeScript, modular, enterprise-ready |
| Frontend | Next.js 14           | App Router, SSR, modern React         |
| Database | PostgreSQL 16        | Reliable, features, Prisma support    |
| Styling  | Tailwind + shadcn/ui | Fast, no debates                      |
| Hosting  | Railway              | $20/month, managed, simple            |
| CI/CD    | GitHub Actions       | Free, integrated                      |

### Scope Decisions

| IN SCOPE (MVP)            | OUT OF SCOPE           |
| :------------------------ | :--------------------- |
| Auth (login/logout/JWT)   | Opportunities/Pipeline |
| Organization registration | Quotes/Proposals       |
| Lead CRUD                 | Invoicing/Payments     |
| Task CRUD                 | Marketing/Campaigns    |
| Basic Dashboard           | HR/Employees           |
| User invite               | Support tickets        |
|                           | Workflow engine        |
|                           | Mobile app             |
|                           | Integrations           |
|                           | Notifications          |
|                           | File uploads           |

---

## Execution Plan

### Overview

| Sprint   | Duration | Goal                    | Exit Criteria                                |
| :------- | :------- | :---------------------- | :------------------------------------------- |
| Sprint 1 | Week 1-2 | Auth + Leads + Frontend | Login works, leads CRUD works                |
| Sprint 2 | Week 3-4 | Tasks + Dashboard       | Task lifecycle works, dashboard shows counts |
| Sprint 3 | Week 5-6 | Polish + Deploy         | Production URL works, no P1 bugs             |
| Sprint 4 | Week 7-8 | First Customer          | One external org using system                |

---

### Sprint 1: Foundation (Week 1-2)

**Goal**: Working authentication + lead management on backend and frontend.

#### Day-by-Day Breakdown

| Day | Task                  | Owner     | Deliverable                              | Done When                      |
| :-- | :-------------------- | :-------- | :--------------------------------------- | :----------------------------- |
| 1   | Project setup         | Tech Lead | Monorepo with backend + frontend folders | Both `npm run dev` work        |
| 1   | Docker Compose fix    | Tech Lead | PostgreSQL + API running                 | `docker-compose up` works      |
| 2   | CI Pipeline           | Tech Lead | GitHub Actions lint + test               | Green badge on PR              |
| 2   | Prisma schema         | Backend   | Core models (Org, User, Role, Lead)      | `npx prisma migrate dev` works |
| 3   | Auth module: register | Backend   | POST /auth/register                      | Creates org + admin user       |
| 3   | Auth module: login    | Backend   | POST /auth/login                         | Returns JWT token              |
| 4   | Auth module: guards   | Backend   | JWT validation middleware                | Protected routes work          |
| 4   | Auth module: refresh  | Backend   | POST /auth/refresh                       | Token refresh works            |
| 5   | Frontend: setup       | Frontend  | Next.js 14 skeleton                      | Home page renders              |
| 5   | Frontend: login page  | Frontend  | Login form + API call                    | Can login via UI               |
| 6   | Organization CRUD     | Backend   | 4 endpoints                              | GET/POST/PATCH/DELETE work     |
| 7   | User CRUD             | Backend   | 4 endpoints                              | GET/POST/PATCH/DELETE work     |
| 8   | Frontend: layout      | Frontend  | Sidebar + header                         | Navigation works               |
| 9   | Lead CRUD             | Backend   | 5 endpoints                              | Full lead lifecycle            |
| 10  | Frontend: leads list  | Frontend  | Table with leads                         | Shows leads from API           |
| 11  | Frontend: lead form   | Frontend  | Create/edit form                         | Can add leads via UI           |
| 12  | Testing               | QA/Dev    | Auth + leads tests                       | 60%+ coverage                  |
| 13  | Bug fixes             | All       | Fix blockers                             | All tests pass                 |
| 14  | Sprint review         | All       | Demo                                     | Stakeholder sees login + leads |

#### Sprint 1 Deliverables

- [ ] Working local dev environment
- [ ] CI pipeline (lint + test)
- [ ] Auth: register, login, logout, refresh
- [ ] Organization CRUD API
- [ ] User CRUD API
- [ ] Lead CRUD API
- [ ] Frontend: login page
- [ ] Frontend: leads list + form
- [ ] 60%+ test coverage on auth

#### Sprint 1 Risks

| Risk                    | Mitigation                 |
| :---------------------- | :------------------------- |
| Prisma migration issues | Test locally before commit |
| CORS problems           | Configure Day 1            |
| JWT security            | Use Passport.js, bcrypt    |

---

### Sprint 2: Core Features (Week 3-4)

**Goal**: Task management + dashboard.

| Day   | Task                 | Owner    | Deliverable                       |
| :---- | :------------------- | :------- | :-------------------------------- |
| 1-2   | Task CRUD API        | Backend  | 5 endpoints                       |
| 3-4   | Task assignment      | Backend  | assigned_to works                 |
| 3-4   | Task status flow     | Backend  | pending → in_progress → completed |
| 5-6   | Frontend: tasks list | Frontend | Table with tasks                  |
| 7-8   | Frontend: task form  | Frontend | Create/edit/complete              |
| 9-10  | Dashboard API        | Backend  | Counts endpoint                   |
| 11-12 | Frontend: dashboard  | Frontend | Cards with counts                 |
| 13    | User invite flow     | Backend  | Invite by email                   |
| 14    | Testing + bug fixes  | All      | All tests pass                    |

#### Sprint 2 Deliverables

- [ ] Task CRUD API
- [ ] Task assignment working
- [ ] Dashboard counts API
- [ ] Frontend: tasks list + form
- [ ] Frontend: dashboard page
- [ ] User invite flow
- [ ] 70%+ test coverage

---

### Sprint 3: Polish & Deploy (Week 5-6)

**Goal**: Production deployment.

| Day   | Task              | Owner     | Deliverable                    |
| :---- | :---------------- | :-------- | :----------------------------- |
| 1-2   | Error handling    | Frontend  | Loading states, error messages |
| 3-4   | Form validation   | Frontend  | Client-side validation         |
| 5-6   | Railway setup     | Tech Lead | Staging environment            |
| 7-8   | Production deploy | Tech Lead | Production URL                 |
| 9-10  | E2E testing       | QA        | Manual test all flows          |
| 11-12 | Bug fixes         | All       | Fix P1/P2 bugs                 |
| 13-14 | Documentation     | Tech Lead | README, setup guide            |

#### Sprint 3 Deliverables

- [ ] Staging environment
- [ ] Production environment
- [ ] All critical paths tested
- [ ] No P1 bugs
- [ ] README updated

---

### Sprint 4: First Customer (Week 7-8)

**Goal**: Onboard first external user.

| Day  | Task              | Owner    | Deliverable             |
| :--- | :---------------- | :------- | :---------------------- |
| 1-2  | Onboarding flow   | Frontend | Welcome wizard          |
| 3-4  | Password reset    | Backend  | Forgot password flow    |
| 5-6  | Welcome email     | Backend  | Basic email on register |
| 7-8  | Customer feedback | All      | Fix reported issues     |
| 9-14 | Support + iterate | All      | Customer success        |

#### Sprint 4 Deliverables

- [ ] Password reset working
- [ ] Welcome email sent
- [ ] One customer active
- [ ] Customer can work independently

---

## Team & Ownership

| Role             | Responsibility               | Tasks                    |
| :--------------- | :--------------------------- | :----------------------- |
| **Tech Lead**    | Architecture, CI/CD, deploys | Setup, pipeline, Railway |
| **Backend Dev**  | API development              | Auth, CRUD, database     |
| **Frontend Dev** | UI development               | Pages, forms, state      |
| **QA** (shared)  | Testing                      | Unit tests, E2E          |

### Ownership Matrix

| Area            | Primary   | Backup    |
| :-------------- | :-------- | :-------- |
| Auth & Security | Tech Lead | Backend   |
| Database        | Backend   | Tech Lead |
| API             | Backend   | Tech Lead |
| Frontend        | Frontend  | Tech Lead |
| CI/CD           | Tech Lead | Backend   |
| Deploy          | Tech Lead | -         |

---

## Risks & Mitigation

| #   | Risk                     | Probability | Impact   | Mitigation                                       |
| :-- | :----------------------- | :---------- | :------- | :----------------------------------------------- |
| 1   | Scope creep              | High        | High     | MVP scope frozen. All changes require approval.  |
| 2   | Over-engineering         | Medium      | High     | YAGNI enforced. No abstractions until third use. |
| 3   | Auth vulnerabilities     | Medium      | Critical | Use Passport.js, bcrypt, standard patterns.      |
| 4   | Database issues          | Medium      | Medium   | Test migrations locally first.                   |
| 5   | Deployment failures      | Low         | High     | Test staging before production.                  |
| 6   | Team burnout             | Low         | High     | 2-week sprints, no overtime.                     |
| 7   | Customer scope expansion | High        | Medium   | MVP locked. Feedback → Phase 2 backlog.          |

---

## State After This Plan

| Metric         | Before     | After Sprint 4 |
| :------------- | :--------- | :------------- |
| Backend code   | ~100 lines | ~3,000 lines   |
| Frontend code  | 0 lines    | ~2,000 lines   |
| Tests          | 0          | 150+           |
| Customers      | 0          | 1+             |
| Production URL | None       | Yes            |
| Monthly cost   | $0         | ~$20           |

---

## Open Questions

| #   | Question                                 | Impact | Needs Answer By |
| :-- | :--------------------------------------- | :----- | :-------------- |
| 1   | Do we need email verification on signup? | Low    | Sprint 1 Day 3  |
| 2   | What are the lead status options?        | Low    | Sprint 1 Day 9  |
| 3   | Who is the first customer candidate?     | High   | Sprint 3        |
| 4   | Do we need password complexity rules?    | Low    | Sprint 1 Day 3  |

---

## Review Required

### ⚠️ USER APPROVAL NEEDED

**I will NOT execute any code until you approve this plan.**

Please review:

1. ✅ Sprint 1-4 scope is acceptable
2. ✅ MVP features (5) are correct
3. ✅ Out-of-scope list is correct
4. ✅ Technology choices are acceptable
5. ✅ Timeline (8 weeks) is realistic
6. ✅ Team model is realistic

### Approval Options

Reply with one of:

- **"APPROVED"** — I will begin Sprint 1 Day 1 execution
- **"APPROVED WITH CHANGES: [list changes]"** — I will update plan and re-submit
- **"REJECTED: [reason]"** — I will revise the entire plan

---

## CTO Declaration

I, as the designated CTO for this project, declare:

1. **All previous architecture documentation is superseded** by this plan
2. **Microservices are rejected** — monolith only
3. **MVP scope is frozen** — 5 features only
4. **No execution without approval** — user controls the gate
5. **Code > Documentation** — every hour produces working software

This plan is realistic, executable, and can be handed to developers tomorrow.

---

**Document Status**: AWAITING APPROVAL  
**Next Action**: User review and approval  
**Prepared by**: CTO (AI)  
**Date**: 2026-01-08
