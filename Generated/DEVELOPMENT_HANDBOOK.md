# Bassan.os Development Handbook

## Document Control

- **Document Title**: Bassan.os Development Handbook
- **Version**: 2.2
- **Status**: Approved
- **Date**: 2026-01-08
- **Audience**: All developers, QA engineers, DevOps

---

## Table of Contents

1. [Git Workflow](#1-git-workflow)
2. [Code Review Process](#2-code-review-process)
3. [Definition of Done](#3-definition-of-done)
4. [Sprint Planning Process](#4-sprint-planning-process)
5. [Bug Reporting Process](#5-bug-reporting-process)
6. [Development Environment](#6-development-environment)
7. [Deployment Process](#7-deployment-process)

---

## 1. Git Workflow

### 1.1 Branching Strategy (Trunk-Based Development)

**Main Branches**:

- `main`: Production-ready code
- `develop`: Integration branch for features

**Supporting Branches**:

- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes

### 1.2 Workflow Steps

**1. Create Feature Branch**:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/BAS-123-oauth-login
```

**2. Develop & Commit**:

```bash
# Make changes
git add .
git commit -m "feat(auth): add OAuth 2.0 login"
```

**3. Keep Branch Updated**:

```bash
git checkout develop
git pull origin develop
git checkout feature/BAS-123-oauth-login
git rebase develop
```

**4. Push & Create PR**:

```bash
git push origin feature/BAS-123-oauth-login
# Create PR on GitHub
```

**5. Merge After Approval**:

```bash
# Squash and merge via GitHub UI
# Delete feature branch after merge
```

### 1.3 Commit Guidelines

- **Atomic commits**: One logical change per commit
- **Meaningful messages**: Follow conventional commits format
- **Frequent commits**: Commit often, push daily
- **No WIP commits**: Finish work before committing

### 1.4 Merge Strategy

- **Feature → Develop**: Squash and merge
- **Develop → Main**: Merge commit (for release)
- **Hotfix → Main**: Merge commit, then cherry-pick to develop

---

## 2. Code Review Process

### 2.1 When to Request Review

- All code changes (no direct commits to `develop` or `main`)
- After self-review completed
- After all tests pass
- After CI/CD checks pass

### 2.2 Review Checklist

**Functionality**:

- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling appropriate
- [ ] No regressions introduced

**Code Quality**:

- [ ] Follows code standards
- [ ] No code smells
- [ ] No unnecessary complexity
- [ ] DRY principle followed
- [ ] SOLID principles followed

**Testing**:

- [ ] Unit tests added/updated
- [ ] Integration tests added (if needed)
- [ ] Tests are meaningful
- [ ] Coverage meets requirements (80%+)

**Security**:

- [ ] No security vulnerabilities
- [ ] Input validation present
- [ ] No hardcoded secrets
- [ ] SQL injection prevented
- [ ] XSS prevented

**Performance**:

- [ ] No obvious performance issues
- [ ] Database queries optimized
- [ ] No N+1 queries
- [ ] Caching used appropriately

**Documentation**:

- [ ] Code is self-explanatory
- [ ] Complex logic commented
- [ ] API documentation updated
- [ ] README updated (if needed)

### 2.3 Review Timeline

- **Small PRs (< 200 lines)**: 4 hours
- **Medium PRs (200-500 lines)**: 1 day
- **Large PRs (> 500 lines)**: 2 days

**Note**: PRs > 500 lines should be split if possible

### 2.4 Approval Process

- **1 approval required** for feature branches
- **2 approvals required** for `develop` → `main`
- **Technical Lead approval required** for architectural changes

### 2.5 Addressing Feedback

- Respond to all comments
- Make requested changes or discuss
- Mark conversations as resolved after addressing
- Request re-review after changes

---

## 3. Definition of Done

### 3.1 Story/Task Level

A story/task is "Done" when:

**Code**:

- [ ] Code written and follows standards
- [ ] Code reviewed and approved
- [ ] All feedback addressed
- [ ] No linting errors
- [ ] No type errors

**Testing**:

- [ ] Unit tests written (80%+ coverage)
- [ ] Integration tests written (if applicable)
- [ ] All tests passing
- [ ] Manual testing completed
- [ ] Edge cases tested

**Documentation**:

- [ ] Code comments added (where needed)
- [ ] API documentation updated
- [ ] README updated (if needed)
- [ ] User documentation updated (if needed)

**Deployment**:

- [ ] Merged to `develop`
- [ ] Deployed to dev environment
- [ ] Smoke tests passed
- [ ] No breaking changes (or documented)

**Acceptance**:

- [ ] Acceptance criteria met
- [ ] Product Owner reviewed (if needed)
- [ ] Demo completed (if needed)

### 3.2 Sprint Level

A sprint is "Done" when:

- [ ] All committed stories completed
- [ ] Sprint goals achieved
- [ ] Code merged to `develop`
- [ ] Deployed to staging
- [ ] Regression tests passed
- [ ] Sprint demo completed
- [ ] Retrospective completed

### 3.3 Release Level

A release is "Done" when:

- [ ] All features tested
- [ ] UAT completed and approved
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Release notes prepared
- [ ] Deployed to production
- [ ] Smoke tests passed in production
- [ ] Monitoring confirmed working

---

## 4. Sprint Planning Process

### 4.1 Sprint Duration

- **2 weeks** (10 working days)
- Sprint starts Monday, ends Friday (2 weeks later)

### 4.2 Sprint Planning Meeting

**When**: First day of sprint (Monday morning)  
**Duration**: 2 hours  
**Attendees**: Development team, Product Owner, Scrum Master

**Agenda**:

1. Review sprint goal (15 min)
2. Review backlog items (30 min)
3. Estimate stories (45 min)
4. Assign tasks (20 min)
5. Confirm commitment (10 min)

### 4.3 Estimation

**Story Points** (Fibonacci scale):

- **1 point**: Few hours (simple change)
- **2 points**: Half day (small feature)
- **3 points**: 1 day (medium feature)
- **5 points**: 2-3 days (large feature)
- **8 points**: 1 week (very large feature)
- **13 points**: Too large, split story

**Velocity**: Team's average story points per sprint

### 4.4 Sprint Backlog

- Stories pulled from product backlog
- Ordered by priority
- Estimated and assigned
- Committed by team

### 4.5 Daily Standup

**When**: Every day at 10:00 AM  
**Duration**: 15 minutes  
**Format**: Each person answers:

1. What did I do yesterday?
2. What will I do today?
3. Any blockers?

---

## 5. Bug Reporting Process

### 5.1 Bug Report Template

```markdown
## Bug Description

Brief description of the bug

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Screenshots

If applicable

## Environment

- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., v2.2.0]

## Additional Context

Any other relevant information

## Severity

- [ ] Critical (system down)
- [ ] High (major feature broken)
- [ ] Medium (minor feature broken)
- [ ] Low (cosmetic)
```

### 5.2 Bug Severity Levels

| Severity     | Description            | SLA     | Examples                          |
| :----------- | :--------------------- | :------ | :-------------------------------- |
| **Critical** | System down, data loss | 4 hours | Login broken, database corruption |
| **High**     | Major feature broken   | 1 day   | Payment processing fails          |
| **Medium**   | Minor feature broken   | 3 days  | Filter not working                |
| **Low**      | Cosmetic issue         | 1 week  | Typo, alignment issue             |

### 5.3 Bug Workflow

1. **Report**: Create bug ticket with template
2. **Triage**: Product Owner assigns severity and priority
3. **Assign**: Assign to developer
4. **Fix**: Developer fixes and creates PR
5. **Review**: Code review
6. **Test**: QA verifies fix
7. **Close**: Mark as resolved

### 5.4 Hotfix Process

For **Critical** bugs in production:

1. Create `hotfix/*` branch from `main`
2. Fix bug
3. Test thoroughly
4. Get emergency approval (Technical Lead)
5. Deploy to production
6. Merge to `main` and `develop`

---

## 6. Development Environment

### 6.1 Required Software

**Backend**:

- Node.js 18+
- npm 9+
- PostgreSQL 16
- Redis 7
- Docker Desktop

**Frontend**:

- Node.js 18+
- npm 9+

**Mobile**:

- Node.js 18+
- React Native CLI
- Xcode (Mac only, for iOS)
- Android Studio

**Tools**:

- Git
- VS Code (recommended)
- Postman/Insomnia (API testing)

### 6.2 Setup Instructions

**1. Clone Repositories**:

```bash
git clone https://github.com/bassan-os/backend.git
git clone https://github.com/bassan-os/frontend.git
git clone https://github.com/bassan-os/mobile.git
```

**2. Backend Setup**:

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with local configuration
docker-compose up -d  # Start PostgreSQL and Redis
npm run db:migrate
npm run db:seed
npm run dev
```

**3. Frontend Setup**:

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with local configuration
npm run dev
```

**4. Mobile Setup**:

```bash
cd mobile
npm install
cp .env.example .env
# iOS
npx pod-install
npm run ios
# Android
npm run android
```

### 6.3 Environment Variables

**Backend** (`.env`):

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/bassan
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

**Frontend** (`.env`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 6.4 VS Code Extensions

**Recommended**:

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- GitLens
- Docker
- Prisma
- Tailwind CSS IntelliSense

---

## 7. Deployment Process

### 7.1 Environments

| Environment     | Purpose           | Auto-Deploy                       | URL               |
| :-------------- | :---------------- | :-------------------------------- | :---------------- |
| **Development** | Developer testing | Yes (on commit to feature branch) | dev.bassan.os     |
| **Staging**     | QA testing        | Yes (on merge to develop)         | staging.bassan.os |
| **Production**  | Live system       | Manual (approval required)        | app.bassan.os     |

### 7.2 Deployment Checklist

**Pre-Deployment**:

- [ ] All tests passing
- [ ] Code review approved
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] Stakeholders notified

**Deployment**:

- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Get approval
- [ ] Deploy to production
- [ ] Monitor for 15 minutes
- [ ] Run smoke tests
- [ ] Verify health checks

**Post-Deployment**:

- [ ] Verify error rates
- [ ] Verify performance metrics
- [ ] Update release notes
- [ ] Notify stakeholders
- [ ] Monitor for 24 hours

### 7.3 Rollback Process

If issues detected after deployment:

1. **Assess severity** (< 5 min)
2. **Decide**: Fix forward or rollback
3. **If rollback**:

   ```bash
   # Kubernetes
   kubectl rollout undo deployment/bassan-api

   # Or Helm
   helm rollback bassan-os 0
   ```

4. **Verify** rollback successful
5. **Investigate** root cause
6. **Fix** and redeploy

**Rollback Time**: < 5 minutes

---

## Communication

### Slack Channels

- `#dev-general`: General development discussion
- `#dev-backend`: Backend-specific
- `#dev-frontend`: Frontend-specific
- `#dev-mobile`: Mobile-specific
- `#dev-deployments`: Deployment notifications
- `#dev-incidents`: Incident alerts

### Meetings

- **Daily Standup**: 10:00 AM (15 min)
- **Sprint Planning**: First Monday of sprint (2 hours)
- **Sprint Review**: Last Friday of sprint (1 hour)
- **Sprint Retrospective**: Last Friday of sprint (1 hour)
- **Tech Sync**: Wednesday 3:00 PM (30 min)

---

## Resources

- **Documentation**: [docs.bassan.os](https://docs.bassan.os)
- **API Docs**: [api.bassan.os/docs](https://api.bassan.os/docs)
- **Jira**: [bassan.atlassian.net](https://bassan.atlassian.net)
- **GitHub**: [github.com/bassan-os](https://github.com/bassan-os)
- **Figma**: [figma.com/bassan-os](https://figma.com/bassan-os)

---

**Document Status**: Approved  
**Review Frequency**: Quarterly  
**Last Updated**: 2026-01-08
