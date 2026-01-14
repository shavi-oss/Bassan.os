# Bassan.os Developer Onboarding – Enterprise Edition v2.2

## Document Control

- **Document Title**: Bassan.os Developer Onboarding Guide
- **Version**: 2.2
- **Status**: Approved for Development
- **Date**: 2024-01-20
- **Context**: Complete guide for new developers joining Bassan.os team
- **Coverage**: Development setup, architecture overview, coding standards, workflows
- **Linked Documents**: 
  - 5_Technical_Architecture.md (v2.1)
  - 8_Deployment_Architecture.md (v2.1)
  - 7_API_Specifications.md (v2.1)
  - 4_Database_ERD.md (v2.1)

## Table of Contents

1. [Introduction](#1-introduction)
2. [Development Environment Setup](#2-development-environment-setup)
3. [Architecture Overview](#3-architecture-overview)
4. [Coding Standards & Conventions](#4-coding-standards--conventions)
5. [Git Workflow & Branching](#5-git-workflow--branching)
6. [Development Processes](#6-development-processes)
7. [Testing Procedures](#7-testing-procedures)
8. [Documentation Guidelines](#8-documentation-guidelines)
9. [Troubleshooting Common Issues](#9-troubleshooting-common-issues)

---

## 1. Introduction

### 1.1 Welcome to Bassan.os

Bassan.os is an enterprise-grade SaaS platform designed as an operating system for service-driven businesses. As a developer, you'll be building features that help organizations manage operations, workflows, accountability, and growth across multiple departments.

### 1.2 Development Philosophy

Our development approach is guided by:
- **Quality First**: Code reviews, automated testing, continuous integration
- **User-Centric**: Every feature starts with user needs
- **Collaborative**: Open communication, knowledge sharing, mentorship
- **Iterative**: Small increments, frequent releases, continuous improvement
- **Security-Minded**: Security considerations in all development

### 1.3 Team Structure

**Development Teams**:
- **Frontend Team**: React/React Native applications
- **Backend Team**: NestJS microservices
- **DevOps Team**: Infrastructure, CI/CD, monitoring
- **QA Team**: Testing automation, quality assurance
- **Product Team**: Requirements, user stories, prioritization

**Communication Channels**:
- Slack: #bassan-dev (general), #bassan-frontend, #bassan-backend
- Jira: Project tracking and sprint planning
- Confluence: Documentation and decisions
- GitHub: Code reviews and pull requests

---

## 2. Development Environment Setup

### 2.1 Prerequisites

**Required Software**:
- Node.js 20 LTS or higher
- npm 9+ or yarn 1.22+
- Git 2.30+
- Docker Desktop (for local containers)
- VS Code (recommended) with extensions:
  - ESLint
  - Prettier
  - GitLens
  - Thunder Client (for GraphQL)

**Required Accounts**:
- GitHub (for code access)
- AWS/GCP/Azure (for cloud resources)
- Datadog/New Relic (for monitoring)
- Sentry (for error tracking)

### 2.2 Repository Setup

**Clone Repository**:
```bash
git clone https://github.com/bassanos/bassan-os.git
cd bassan-os
```

**Install Dependencies**:
```bash
# Frontend
cd web
npm install

# Backend
cd api
npm install

# Mobile
cd mobile
npm install
```

**Environment Configuration**:
```bash
# Copy example environment files
cp .env.example .env

# Configure your local values
nano .env
```

### 2.3 Local Development

**Start All Services**:
```bash
# Using Docker Compose
docker-compose up -d

# Or start individually
cd web && npm run dev
cd api && npm run dev
cd mobile && npm run ios # or android
```

**Database Setup**:
```bash
# Run migrations
cd api
npm run migration:run

# Seed development data
npm run seed:dev
```

---

## 3. Architecture Overview

### 3.1 System Architecture

Bassan.os follows a **microservices architecture** with the following components:

```
┌─────────────────────────────────────────┐
│         Frontend Layer            │
│  (Web: Next.js, Mobile: RN)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         API Gateway                │
│    (Kong/Nginx, GraphQL)          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Microservices Layer          │
│  (Core, Sales, Ops, HR, etc.)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Data Layer                │
│  (PostgreSQL, Redis, Elasticsearch)  │
└─────────────────────────────────────┘
```

### 3.2 Key Services

| Service | Purpose | Tech Stack | Repository |
|---------|---------|-----------|------------|
| **Core API** | Auth, users, RBAC | NestJS, TypeScript | /services/core-api |
| **Sales Service** | Leads, opportunities, quotes | NestJS, TypeScript | /services/sales-service |
| **Operations Service** | Tasks, workflows, SLA | NestJS, TypeScript | /services/ops-service |
| **HR Service** | Employees, performance, training | NestJS, TypeScript | /services/hr-service |
| **Finance Service** | Invoices, payments, budgets | NestJS, TypeScript | /services/finance-service |
| **Analytics Service** | Dashboards, reports, KPIs | NestJS, TypeScript | /services/analytics-service |
| **Notification Service** | Email, SMS, push | NestJS, TypeScript | /services/notification-service |

### 3.3 Data Flow

**Request Flow**:
1. User action in frontend
2. API call to API Gateway
3. Route to appropriate microservice
4. Service validates and processes request
5. Service queries/updates database
6. Response returns through gateway
7. Frontend updates UI

**Event Flow**:
1. Service publishes event to message queue
2. Event bus distributes to subscribers
3. Subscribers process events asynchronously
4. Results logged and monitored

---

## 4. Coding Standards & Conventions

### 4.1 Naming Conventions

**Database Entities**:
- PascalCase: `Organization`, `UserProfile`, `TaskAssignment`
- Plural for tables: `organizations`, `user_profiles`
- Foreign keys: `{entity}_id`: `organization_id`, `user_id`

**API Endpoints**:
- kebab-case: `/auth/login`, `/leads/list`, `/tasks/{id}`
- RESTful: `/v1/{resource}/{id}`
- GraphQL: camelCase for queries/mutations

**Code Variables**:
- camelCase: `userId`, `organizationName`, `taskStatus`
- Constants: UPPER_SNAKE_CASE: `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT`

**Files & Folders**:
- kebab-case: `user-service.ts`, `task-controller.ts`
- Folders: kebab-case: `/services`, `/controllers`, `/utils`

### 4.2 TypeScript Guidelines

**Type Definitions**:
```typescript
// Interfaces for data structures
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// Types for unions or literals
type UserRole = 'admin' | 'manager' | 'contributor';

// Enums for fixed sets
enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}
```

**Best Practices**:
- Use `interface` for object shapes
- Use `type` for unions and literals
- Use `enum` for fixed sets of values
- Avoid `any` - use `unknown` with type guards
- Use generics for reusable components

### 4.3 Code Style

**Formatting**:
```bash
# Prettier configuration
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Linting**:
```bash
# Run ESLint
npm run lint

# Fix automatically
npm run lint:fix
```

### 4.4 Comment Standards

**JSDoc for Functions**:
```typescript
/**
 * Creates a new task in the system
 * @param taskData - The task details
 * @param userId - The ID of the user creating the task
 * @returns Promise resolving to the created task
 */
async function createTask(
  taskData: CreateTaskDto,
  userId: string
): Promise<Task> {
  // Implementation
}
```

**Inline Comments**:
- Explain WHY, not WHAT
- Comment complex business logic
- Note workarounds or temporary solutions
- Reference external resources

---

## 5. Git Workflow & Branching

### 5.1 Branching Strategy

**Branch Types**:
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/{ticket-id}-{short-description}`: New features
- `bugfix/{ticket-id}-{short-description}`: Bug fixes
- `hotfix/{ticket-id}-{short-description}`: Critical production fixes

### 5.2 Commit Messages

**Format**:
```
{type}({scope}): {subject}

{body}

{footer}
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
```
feat(sales): add lead qualification scoring

Add automatic lead scoring based on engagement
and demographic data to help sales prioritize.

Closes #BASSAN-123

feat(auth): implement biometric login

Allow users to authenticate using Face ID, Touch ID,
and fingerprint for faster, more secure access.

Closes #BASSAN-456
```

### 5.3 Pull Request Process

**Before Creating PR**:
1. Update branch from develop
2. Run tests locally
3. Run linting and fix issues
4. Update documentation if needed
5. Self-review your changes

**PR Requirements**:
- Clear title and description
- Link to related ticket
- All tests passing
- Code review approval from at least one team member
- No merge conflicts
- Updated documentation

**Review Checklist**:
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Performance considered
- [ ] Security reviewed

---

## 6. Development Processes

### 6.1 Feature Development Workflow

**1. Planning**:
- Review user story and acceptance criteria
- Break down into technical tasks
- Estimate effort
- Create tickets in Jira

**2. Development**:
- Create feature branch
- Implement following coding standards
- Write tests alongside code
- Update documentation

**3. Review**:
- Create pull request
- Address review feedback
- Update tests and docs as needed
- Get approval

**4. Testing**:
- Run automated tests
- Manual testing on staging
- Cross-browser testing (for web)
- Device testing (for mobile)

**5. Deployment**:
- Merge to develop
- Deploy to staging
- Monitor for issues
- Deploy to production (after approval)

### 6.2 Bug Fix Workflow

**1. Triage**:
- Reproduce the issue
- Identify root cause
- Assess severity and priority

**2. Fix**:
- Create bugfix branch
- Implement fix with tests
- Document the issue and solution

**3. Verify**:
- Run automated tests
- Manual verification of fix
- Regression testing

**4. Deploy**:
- Merge to develop
- Deploy to staging
- Monitor for recurrence
- Deploy to production

---

## 7. Testing Procedures

### 7.1 Test Pyramid

```
        /       /        / E2E  \  (10%)
     /__________    /               /  Integration \ (30%)
  /______________ /                /    Unit Tests    \ (60%)
/__________________```

### 7.2 Unit Testing

**Guidelines**:
- Test individual functions and components
- Mock external dependencies
- Test happy path and edge cases
- Aim for 80%+ code coverage

**Example**:
```typescript
describe('TaskService', () => {
  describe('createTask', () => {
    it('should create task with valid data', async () => {
      // Arrange
      const taskData = { title: 'Test Task', priority: 'high' };

      // Act
      const result = await taskService.createTask(taskData);

      // Assert
      expect(result).toBeDefined();
      expect(result.title).toBe(taskData.title);
    });

    it('should throw error with invalid data', async () => {
      // Arrange
      const invalidData = { title: '' };

      // Act & Assert
      await expect(
        taskService.createTask(invalidData)
      ).rejects.toThrow(ValidationError);
    });
  });
});
```

### 7.3 Integration Testing

**Guidelines**:
- Test service interactions
- Use test database
- Test API endpoints
- Verify database operations

**Example**:
```typescript
describe('Task API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('POST /tasks', () => {
    it('should create task and return 201', async () => {
      const response = await request(app)
        .post('/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
    });
  });
});
```

### 7.4 E2E Testing

**Tools**:
- Cypress (web)
- Detox (mobile)

**Guidelines**:
- Test critical user journeys
- Test across browsers/devices
- Use realistic test data
- Maintain test data

---

## 8. Documentation Guidelines

### 8.1 Code Documentation

**When to Document**:
- Complex business logic
- Non-obvious algorithms
- Public APIs
- Configuration options
- Workarounds or temporary solutions

**How to Document**:
- JSDoc for functions and classes
- Inline comments for complex logic
- README for complex modules
- Architecture Decision Records (ADRs) for major decisions

### 8.2 API Documentation

**Updating API Docs**:
1. Update OpenAPI specification
2. Generate documentation from spec
3. Test endpoints in Postman
4. Deploy to documentation site
5. Notify team of changes

### 8.3 Architecture Documentation

**When to Update**:
- New services added
- Major architectural changes
- Integration patterns updated
- Performance optimizations implemented

---

## 9. Troubleshooting Common Issues

### 9.1 Development Issues

**Problem**: Dependencies won't install
**Solution**:
```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

**Problem**: Database migrations fail
**Solution**:
```bash
# Check current migration status
npm run migration:status

# Rollback if needed
npm run migration:rollback

# Re-run with debug output
DEBUG=* npm run migration:run
```

### 9.2 Performance Issues

**Problem**: Slow API response times
**Investigation**:
1. Check query performance with EXPLAIN ANALYZE
2. Review database indexes
3. Check for N+1 queries
4. Profile with APM tools

**Problem**: Frontend rendering slow
**Investigation**:
1. Check bundle size
2. Review component re-renders
3. Profile with React DevTools
4. Optimize images and assets

### 9.3 Build Issues

**Problem**: Build fails in CI/CD
**Investigation**:
1. Check CI logs for specific errors
2. Reproduce locally with same Node version
3. Verify all dependencies are compatible
4. Check for environment-specific issues

**Problem**: Docker container won't start
**Investigation**:
1. Check container logs
2. Verify environment variables
3. Check port conflicts
4. Verify Docker daemon is running

### 9.4 Getting Help

**Resources**:
- Slack: #bassan-dev for quick questions
- Jira: Create ticket for bugs or issues
- Confluence: Search documentation first
- Senior Developers: Available for pairing and mentorship

**Escalation Path**:
1. Team Lead (for team-specific issues)
2. Tech Lead (for technical issues)
3. Engineering Manager (for blockers or process issues)

---

## Appendix A: Quick Reference

### A.1 Useful Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run test             # Run tests
npm run lint             # Check code style
npm run lint:fix         # Fix code style

# Database
npm run migration:run    # Run pending migrations
npm run migration:status  # Check migration status
npm run seed:dev         # Seed development data

# Docker
docker-compose up -d      # Start all services
docker-compose down       # Stop all services
docker-compose logs -f    # View logs
```

### A.2 Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `NODE_ENV` | Environment (dev/staging/prod) | development |
| `DATABASE_URL` | PostgreSQL connection string | (required) |
| `REDIS_URL` | Redis connection string | (required) |
| `JWT_SECRET` | Secret for JWT tokens | (required) |
| `API_PORT` | API server port | 3000 |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | info |

### A.3 Important Links

- **Documentation**: https://docs.bassanos.io
- **API Reference**: https://api.bassanos.io/docs
- **Jira**: https://bassanos.atlassian.net
- **Confluence**: https://bassanos.atlassian.net/wiki
- **GitHub**: https://github.com/bassanos/bassan-os
- **Monitoring**: https://monitor.bassanos.io
