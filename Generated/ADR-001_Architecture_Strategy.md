# ADR-001: System Architecture Strategy

## Metadata

| Field         | Value                           |
| :------------ | :------------------------------ |
| **ADR ID**    | ADR-001                         |
| **Title**     | Monolithic Architecture for MVP |
| **Status**    | ✅ ACCEPTED                     |
| **Date**      | 2026-01-08                      |
| **Deciders**  | CTO                             |
| **Consulted** | Tech Lead                       |
| **Informed**  | All team members                |

---

## Context

The Bassan.os project currently has:

- 17,000+ lines of documentation
- 12-service microservices architecture specified
- Kubernetes + Istio + multi-region deployment planned
- ~100 lines of actual code
- Zero paying customers
- Team size: 1-3 developers

The documented microservices architecture would require:

- Service discovery infrastructure
- API gateway configuration
- Distributed tracing setup
- Container orchestration (Kubernetes)
- Inter-service authentication
- Multiple CI/CD pipelines
- Separate databases per service (optional but common)

Estimated time to build this infrastructure: **3-6 months** before shipping any user-facing feature.

---

## Decision

**We will build a modular monolith.**

### Architecture Characteristics

```
┌─────────────────────────────────────────────────────────┐
│                    MONOLITH                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ AuthModule  │ │ LeadsModule │ │ TasksModule │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ UsersModule │ │ OrgsModule  │ │ DashModule  │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Shared Services                     │   │
│  │  PrismaService | JwtService | ConfigService     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   PostgreSQL (Single) │
              └───────────────────────┘
```

### Module Boundaries

Each module:

- Has its own folder (`src/modules/<name>/`)
- Exports a NestJS module
- Has its own controllers, services, DTOs
- Uses shared PrismaService
- Does NOT call other modules' services directly
- Communicates via events (NestJS EventEmitter) if needed

### Deployment Model

```
┌─────────────────────────────────────────────┐
│              Railway / Render               │
│  ┌─────────────────────────────────────┐   │
│  │   bassan-api (NestJS monolith)      │   │
│  │   Port: 3000                         │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │   PostgreSQL (managed)              │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## Alternatives Considered

### Option A: Microservices (12 services) — REJECTED

| Pros                 | Cons                      |
| :------------------- | :------------------------ |
| Independent scaling  | 6+ months infrastructure  |
| Technology diversity | Complex debugging         |
| Team isolation       | Distributed transactions  |
|                      | High hosting cost         |
|                      | Requires DevOps expertise |

**Rejected because**: Zero customers, 1-3 developers, no proven scaling need.

### Option B: Serverless (AWS Lambda) — REJECTED

| Pros                 | Cons                       |
| :------------------- | :------------------------- |
| Auto-scaling         | Cold start latency         |
| Pay-per-use          | Vendor lock-in             |
| No server management | Complex local development  |
|                      | Database connection limits |

**Rejected because**: Cold starts hurt UX, connection pooling complexity.

### Option C: Modular Monolith — SELECTED ✅

| Pros              | Cons                       |
| :---------------- | :------------------------- |
| Single deployment | All modules scale together |
| Shared database   | Requires module discipline |
| Simple debugging  | Future split requires work |
| Low cost          |                            |
| Fast development  |                            |

**Selected because**: Fastest path to value, simplest operations.

---

## Consequences

### Positive

1. **Single deployment pipeline** — One CI/CD workflow
2. **Single database** — One connection string, one backup strategy
3. **Simplified debugging** — Stack traces stay in one process
4. **Lower cost** — $20-50/month vs $5,000/month
5. **Faster development** — No inter-service contracts to maintain
6. **Local development works** — `npm run dev` starts everything

### Negative

1. **Scaling is uniform** — Cannot scale leads module separately from auth
2. **Module discipline required** — Developers must respect boundaries
3. **Future migration cost** — Splitting requires effort (acceptable, may never be needed)
4. **Single point of failure** — One bug can crash entire app (mitigated by tests)

---

## Rationale

The decision is based on:

1. **Reality of 0 customers** — No users means no scaling data
2. **Reality of 1-3 developers** — Cannot staff 12 service teams
3. **Reality of limited budget** — Cannot afford enterprise infrastructure
4. **Opportunity cost** — 6 months of infrastructure = 6 months without revenue

The architecture can be revisited when:

- A specific module shows 10x higher load than others
- Team grows beyond 10 developers
- Regulatory requirements mandate isolation

---

## Compliance Requirements

None. GDPR and SOC2 do not require microservices.

---

## Review Trigger

This decision should be re-evaluated when:

| Trigger                       | Action                               |
| :---------------------------- | :----------------------------------- |
| Monthly active users > 10,000 | Evaluate caching layer               |
| Team size > 8 developers      | Consider splitting first module      |
| Database CPU > 80% sustained  | Evaluate read replicas               |
| Deploy conflicts > 3/week     | Consider splitting high-churn module |

---

## References

- Martin Fowler: [MonolithFirst](https://martinfowler.com/bliki/MonolithFirst.html)
- DHH: [The Majestic Monolith](https://m.signalvnoise.com/the-majestic-monolith/)

---

**Approved by**: CTO  
**Date**: 2026-01-08
