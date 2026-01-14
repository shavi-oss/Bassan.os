# ADR-002: Technology Stack & Infrastructure

## Metadata

| Field         | Value                               |
| :------------ | :---------------------------------- |
| **ADR ID**    | ADR-002                             |
| **Title**     | Simplified Technology Stack for MVP |
| **Status**    | ✅ ACCEPTED                         |
| **Date**      | 2026-01-08                          |
| **Deciders**  | CTO                                 |
| **Consulted** | Tech Lead                           |
| **Informed**  | All team members                    |

---

## Context

The existing documentation specifies:

- PostgreSQL + Redis + Elasticsearch + RabbitMQ/Kafka
- NestJS + Next.js + React Native
- Docker + Kubernetes + Istio + Terraform + Vault
- AWS EKS with multi-region deployment
- Estimated infrastructure cost: $5,000+/month

Current reality:

- Zero paying customers
- Zero revenue
- 1-3 developers
- 90-day MVP target

---

## Decision

### Final Technology Stack

#### Backend

| Component      | Technology        | Version | Justification                        |
| :------------- | :---------------- | :------ | :----------------------------------- |
| **Runtime**    | Node.js           | 20 LTS  | Stable, performant, team knows it    |
| **Framework**  | NestJS            | 10.x    | TypeScript, modular, well-documented |
| **ORM**        | Prisma            | Latest  | Type-safe, migrations, great DX      |
| **Validation** | class-validator   | Latest  | Decorators, integrates with NestJS   |
| **Auth**       | Passport.js + JWT | Latest  | Battle-tested strategies             |
| **Password**   | bcrypt            | Latest  | Industry standard                    |

#### Frontend

| Component      | Technology      | Version | Justification                 |
| :------------- | :-------------- | :------ | :---------------------------- |
| **Framework**  | Next.js         | 14.x    | App Router, SSR, file routing |
| **Styling**    | Tailwind CSS    | 3.x     | Fast, consistent, no debates  |
| **Components** | shadcn/ui       | Latest  | Copy-paste, customizable      |
| **State**      | React Query     | 5.x     | Server state caching          |
| **Forms**      | React Hook Form | 7.x     | Performance, validation       |
| **Icons**      | Lucide React    | Latest  | Modern, lightweight           |

#### Database & Storage

| Component        | Technology       | Justification                    |
| :--------------- | :--------------- | :------------------------------- |
| **Primary DB**   | PostgreSQL 16    | ACID, JSONB, extensions          |
| **Caching**      | None (MVP)       | PostgreSQL can handle MVP load   |
| **Search**       | PostgreSQL ILIKE | Sufficient for MVP               |
| **File Storage** | Local (MVP)      | Add S3 when file features needed |
| **Queue**        | None (MVP)       | Add pg_boss if async needed      |

#### Infrastructure

| Component            | Technology         | Justification              |
| :------------------- | :----------------- | :------------------------- |
| **Hosting**          | Railway            | Managed, simple, free tier |
| **Database Hosting** | Railway PostgreSQL | Managed, auto-backups      |
| **CI/CD**            | GitHub Actions     | Free, integrated           |
| **Secrets**          | Railway env vars   | Simple, encrypted          |
| **Domain**           | Any registrar      | Later concern              |
| **SSL**              | Railway auto       | Free, automatic            |

---

## Alternatives Considered

### Backend Framework

| Option     | Decision    | Reason                                |
| :--------- | :---------- | :------------------------------------ |
| NestJS     | ✅ Selected | TypeScript, modular, enterprise-ready |
| Express.js | ❌ Rejected | No structure, manual work             |
| Fastify    | ❌ Rejected | Less ecosystem than NestJS            |
| Hono       | ❌ Rejected | Too new, less documentation           |

### Frontend Framework

| Option       | Decision    | Reason                        |
| :----------- | :---------- | :---------------------------- |
| Next.js 14   | ✅ Selected | SSR, routing, React ecosystem |
| Vite + React | ❌ Rejected | No SSR, needs more setup      |
| Remix        | ❌ Rejected | Smaller ecosystem             |
| Vue/Nuxt     | ❌ Rejected | Team doesn't know Vue         |

### Database

| Option     | Decision    | Reason                         |
| :--------- | :---------- | :----------------------------- |
| PostgreSQL | ✅ Selected | Features, reliability, tooling |
| MySQL      | ❌ Rejected | Fewer features than PostgreSQL |
| MongoDB    | ❌ Rejected | Relational data, ACID needed   |
| Supabase   | ❌ Rejected | Abstraction layer not needed   |

### Hosting

| Option     | Decision       | Reason                 |
| :--------- | :------------- | :--------------------- |
| Railway    | ✅ Selected    | Simple, cheap, good DX |
| Render     | ✅ Alternative | Similar to Railway     |
| Vercel     | ❌ Rejected    | API hosting separate   |
| AWS ECS    | ❌ Rejected    | Too complex for MVP    |
| Kubernetes | ❌ Rejected    | Overkill, expensive    |

### Caching

| Option     | Decision     | Reason                         |
| :--------- | :----------- | :----------------------------- |
| None (MVP) | ✅ Selected  | Not needed yet                 |
| Redis      | ❌ Postponed | Add when response times matter |

### Search

| Option           | Decision     | Reason                     |
| :--------------- | :----------- | :------------------------- |
| PostgreSQL ILIKE | ✅ Selected  | Simple, no new dependency  |
| Elasticsearch    | ❌ Postponed | Overkill for MVP           |
| Meilisearch      | ❌ Postponed | Add if search becomes core |

### Message Queue

| Option     | Decision     | Reason                              |
| :--------- | :----------- | :---------------------------------- |
| None (MVP) | ✅ Selected  | No async jobs yet                   |
| pg_boss    | ❌ Postponed | Add when email notifications needed |
| RabbitMQ   | ❌ Rejected  | External dependency                 |
| Kafka      | ❌ Rejected  | Enterprise overkill                 |

---

## Consequences

### Positive

1. **Monthly cost: $20-50** (vs $5,000)
2. **Setup time: 1 day** (vs 2 months)
3. **Single dashboard** for everything
4. **Free tier available** for development
5. **No DevOps specialist required**
6. **Automatic SSL** and zero-downtime deploys
7. **Preview deployments** for PRs

### Negative

1. **Less "enterprise" tooling** (acceptable, can upgrade)
2. **Railway lock-in** (easy to migrate)
3. **No Redis** (database handles it for now)
4. **No CDN** (acceptable for MVP)

---

## Cost Comparison

| Component       | Documented Stack | MVP Stack     | Savings    |
| :-------------- | :--------------- | :------------ | :--------- |
| Compute         | $2,000 (EKS)     | $10           | $1,990     |
| Database        | $500 (RDS)       | $10           | $490       |
| Redis           | $100             | $0            | $100       |
| Elasticsearch   | $300             | $0            | $300       |
| Kafka           | $500             | $0            | $500       |
| Load Balancer   | $50              | $0 (included) | $50        |
| Secrets         | $50 (Vault)      | $0            | $50        |
| Monitoring      | $200             | $0 (included) | $200       |
| **Total/month** | **$3,700**       | **$20**       | **$3,680** |

---

## Rationale

The decision is based on:

1. **No customers** — Cannot justify $3,700/month with $0 revenue
2. **Speed** — Railway deploys in 2 minutes, K8s takes hours
3. **Simplicity** — Fewer moving parts = fewer failure modes
4. **Team size** — 1-3 devs cannot operate Kubernetes
5. **Opportunity cost** — DevOps time = feature development time

---

## Migration Path

When scale demands it:

| Current           | Future          | Trigger                        |
| :---------------- | :-------------- | :----------------------------- |
| Railway           | AWS ECS         | Team > 5, revenue > $10K/month |
| PostgreSQL only   | + Redis         | Response times > 500ms         |
| PostgreSQL search | + Elasticsearch | Search queries > 100/sec       |
| No queue          | + SQS/pg_boss   | Async jobs > 10/min            |

---

## Review Trigger

Re-evaluate this decision when:

| Trigger               | Action                             |
| :-------------------- | :--------------------------------- |
| Database CPU > 80%    | Add read replica or caching        |
| Response time > 500ms | Profile and add Redis              |
| Monthly bill > $500   | Optimize or consider alternatives  |
| Search critical       | Evaluate Elasticsearch/Meilisearch |
| Team > 5 developers   | Consider platform upgrade          |

---

**Approved by**: CTO  
**Date**: 2026-01-08
