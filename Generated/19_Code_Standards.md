# Bassan.os Code Standards

## Document Control

- **Document Title**: Bassan.os Code Standards
- **Version**: 2.2
- **Status**: Approved
- **Date**: 2026-01-08
- **Applies To**: All code (Backend, Frontend, Mobile)

---

## Table of Contents

1. [TypeScript Standards](#1-typescript-standards)
2. [Naming Conventions](#2-naming-conventions)
3. [File Structure](#3-file-structure)
4. [Code Organization](#4-code-organization)
5. [Comments & Documentation](#5-comments--documentation)
6. [Error Handling](#6-error-handling)
7. [Testing Standards](#7-testing-standards)
8. [Git Standards](#8-git-standards)

---

## 1. TypeScript Standards

### 1.1 General Rules

- **Strict Mode**: Always use `"strict": true` in `tsconfig.json`
- **No `any`**: Avoid `any` type; use `unknown` if type is truly unknown
- **Explicit Types**: Always declare return types for functions
- **Interfaces over Types**: Prefer `interface` over `type` for object shapes
- **Enums**: Use `const enum` for better tree-shaking

### 1.2 Type Definitions

**Good**:

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

enum UserRole {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest",
}

function getUser(id: string): Promise<User> {
  // implementation
}
```

**Bad**:

```typescript
function getUser(id) {
  // Missing types
  // implementation
}

const user: any = {}; // Using any
```

### 1.3 Null Safety

- Use `null` and `undefined` explicitly
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Avoid non-null assertions (`!`) unless absolutely necessary

**Good**:

```typescript
const userName = user?.name ?? "Guest";
```

**Bad**:

```typescript
const userName = user!.name; // Dangerous
```

---

## 2. Naming Conventions

### 2.1 Variables & Constants

- **camelCase** for variables and functions
- **UPPER_SNAKE_CASE** for constants
- **PascalCase** for classes and interfaces

```typescript
const userName = "John";
const MAX_RETRY_COUNT = 3;
class UserService {}
interface UserData {}
```

### 2.2 Files & Directories

- **kebab-case** for file names: `user-service.ts`
- **PascalCase** for component files: `UserProfile.tsx`
- **lowercase** for directories: `services/`, `components/`

```
src/
├── services/
│   └── user-service.ts
├── components/
│   └── UserProfile.tsx
└── utils/
    └── string-helpers.ts
```

### 2.3 Functions

- Use **verb** prefixes: `get`, `set`, `create`, `update`, `delete`, `is`, `has`
- Boolean functions start with `is` or `has`

```typescript
function getUser(id: string): User {}
function isAdmin(user: User): boolean {}
function hasPermission(user: User, permission: string): boolean {}
```

### 2.4 React Components

- **PascalCase** for component names
- **Props** suffix for prop interfaces

```typescript
interface UserProfileProps {
  userId: string;
  onUpdate: () => void;
}

function UserProfile({ userId, onUpdate }: UserProfileProps) {
  // implementation
}
```

---

## 3. File Structure

### 3.1 Backend (NestJS)

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   └── users/
│       ├── users.controller.ts
│       ├── users.service.ts
│       ├── users.module.ts
│       ├── dto/
│       └── entities/
│           └── user.entity.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── config/
│   └── database.config.ts
└── main.ts
```

### 3.2 Frontend (Next.js)

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (dashboard)/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── leads/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── layout.tsx
├── api/
│   └── auth/
│       └── route.ts
└── layout.tsx

components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Card.tsx
├── forms/
│   └── LoginForm.tsx
└── layouts/
    └── DashboardLayout.tsx

lib/
├── api/
│   └── client.ts
├── store/
│   └── store.ts
└── utils/
    └── format.ts
```

### 3.3 Mobile (React Native)

```
src/
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   └── dashboard/
│       └── DashboardScreen.tsx
├── components/
│   ├── ui/
│   └── forms/
├── navigation/
│   └── AppNavigator.tsx
├── services/
│   └── api.service.ts
├── store/
│   └── store.ts
└── utils/
    └── helpers.ts
```

---

## 4. Code Organization

### 4.1 Import Order

1. External libraries
2. Internal modules (absolute imports)
3. Relative imports
4. Types
5. Styles

```typescript
// External
import React from "react";
import { useRouter } from "next/navigation";

// Internal
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";

// Relative
import { LoginForm } from "./LoginForm";

// Types
import type { User } from "@/types/user";

// Styles
import styles from "./Login.module.css";
```

### 4.2 Function Length

- **Maximum 50 lines** per function
- Extract complex logic into separate functions
- Use early returns to reduce nesting

**Good**:

```typescript
function processUser(user: User): ProcessedUser {
  if (!user) return null;
  if (!user.isActive) return null;

  return {
    id: user.id,
    name: formatName(user),
    email: user.email,
  };
}
```

**Bad**:

```typescript
function processUser(user: User): ProcessedUser {
  if (user) {
    if (user.isActive) {
      // 40 lines of nested logic
    }
  }
}
```

### 4.3 Single Responsibility

- One class/function = one responsibility
- Extract reusable logic into utilities
- Keep components focused

---

## 5. Comments & Documentation

### 5.1 JSDoc Comments

- Use JSDoc for all public APIs
- Include parameter descriptions
- Include return type descriptions
- Include examples for complex functions

```typescript
/**
 * Fetches a user by ID from the database
 * @param id - The unique identifier of the user
 * @returns A promise that resolves to the user object
 * @throws {NotFoundException} If user is not found
 * @example
 * const user = await getUser('123');
 */
async function getUser(id: string): Promise<User> {
  // implementation
}
```

### 5.2 Inline Comments

- Explain **why**, not **what**
- Use comments sparingly (code should be self-explanatory)
- Update comments when code changes

**Good**:

```typescript
// Use exponential backoff to avoid overwhelming the API
await retry(fetchData, { maxRetries: 3, backoff: "exponential" });
```

**Bad**:

```typescript
// Increment counter
counter++;
```

### 5.3 TODO Comments

- Use `TODO:` prefix
- Include assignee and date
- Link to issue/ticket if applicable

```typescript
// TODO(john, 2026-01-15): Refactor this to use the new API
// See: https://github.com/bassan-os/bassan/issues/123
```

---

## 6. Error Handling

### 6.1 Try-Catch Blocks

- Always catch errors in async functions
- Log errors with context
- Re-throw or handle gracefully

```typescript
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    logger.error("Failed to fetch user", { id, error });
    throw new NotFoundException(`User ${id} not found`);
  }
}
```

### 6.2 Custom Errors

- Create custom error classes
- Include error codes
- Include context

```typescript
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string = "VALIDATION_ERROR"
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

throw new ValidationError("Email is invalid", "email");
```

### 6.3 Error Responses (Backend)

- Use standard error format
- Include error code
- Include details for debugging (dev only)

```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is invalid",
    "field": "email",
    "timestamp": "2026-01-08T15:30:00Z"
  }
}
```

---

## 7. Testing Standards

### 7.1 Test File Naming

- Same name as file being tested with `.test.ts` or `.spec.ts` suffix
- Place test files next to source files

```
user.service.ts
user.service.test.ts
```

### 7.2 Test Structure

- Use `describe` for grouping
- Use `it` or `test` for individual tests
- Follow AAA pattern: Arrange, Act, Assert

```typescript
describe("UserService", () => {
  describe("getUser", () => {
    it("should return user when found", async () => {
      // Arrange
      const userId = "123";
      const mockUser = { id: userId, name: "John" };
      jest.spyOn(repository, "findOne").mockResolvedValue(mockUser);

      // Act
      const result = await service.getUser(userId);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it("should throw NotFoundException when user not found", async () => {
      // Arrange
      const userId = "999";
      jest.spyOn(repository, "findOne").mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUser(userId)).rejects.toThrow(NotFoundException);
    });
  });
});
```

### 7.3 Test Coverage

- **Minimum 80% coverage** for all modules
- **100% coverage** for critical paths (auth, payment)
- Test edge cases and error scenarios

---

## 8. Git Standards

### 8.1 Commit Messages

**Format**: `<type>(<scope>): <subject>`

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:

```
feat(auth): add OAuth 2.0 login
fix(users): resolve null pointer in getUser
docs(api): update API documentation
refactor(leads): extract lead scoring logic
test(tasks): add unit tests for task service
```

### 8.2 Branch Naming

**Format**: `<type>/<ticket-id>-<description>`

**Examples**:

```
feature/BAS-123-oauth-login
bugfix/BAS-456-null-pointer-fix
hotfix/BAS-789-security-patch
```

### 8.3 Pull Request Guidelines

**Title**: Same as commit message format

**Description Template**:

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
```

### 8.4 Code Review Checklist

**Reviewer Must Check**:

- [ ] Code follows standards
- [ ] Tests are adequate
- [ ] No security vulnerabilities
- [ ] No performance issues
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] No unnecessary changes

---

## Enforcement

### Automated Tools

**Linting**:

- ESLint for TypeScript/JavaScript
- Prettier for formatting
- Run on pre-commit hook

**Type Checking**:

- TypeScript compiler (`tsc --noEmit`)
- Run in CI/CD pipeline

**Testing**:

- Jest for unit/integration tests
- Coverage reports in CI/CD
- Fail build if coverage < 80%

### Pre-commit Hook

```bash
#!/bin/sh
npm run lint
npm run type-check
npm run test
```

### CI/CD Pipeline

```yaml
- name: Lint
  run: npm run lint

- name: Type Check
  run: npm run type-check

- name: Test
  run: npm run test:coverage

- name: Check Coverage
  run: |
    if [ $(cat coverage/coverage-summary.json | jq '.total.lines.pct') -lt 80 ]; then
      echo "Coverage below 80%"
      exit 1
    fi
```

---

## Exceptions

Exceptions to these standards must be:

1. Documented in code comments
2. Approved by Technical Lead
3. Added to ADR (Architecture Decision Record)

---

**Document Status**: Approved  
**Enforcement**: Mandatory  
**Review Frequency**: Quarterly  
**Last Updated**: 2026-01-08
