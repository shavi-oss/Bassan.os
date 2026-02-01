# CORE CONTRACT EVIDENCE TABLE v1

**Purpose:** Map every Core Contract claim to source file evidence (path + line range)  
**Date:** 2026-01-31  
**Methodology:** Source-derived (READ-ONLY analysis)

---

## 1. Global Configuration

| Claim             | Value                                                       | File                                                           | Line Range |
| ----------------- | ----------------------------------------------------------- | -------------------------------------------------------------- | ---------- |
| Global API Prefix | `/api/v1`                                                   | main.ts | L21        |
| Global Validation | ValidationPipe (whitelist, transform, forbidNonWhitelisted) | main.ts | L9-L15     |
| CORS              | Enabled                                                     | main.ts | L18        |

---

## 2. Controllers & Routes (42 Endpoints)

### Auth Module (2 endpoints)

| Endpoint             | Method | File                                                                                              | Line Range |
| -------------------- | ------ | ------------------------------------------------------------------------------------------------- | ---------- |
| `/api/v1/auth/login` | POST   | auth.controller.ts | L20-L24    |
| `/api/v1/auth/me`    | GET    | auth.controller.ts | L26-L30    |

### Workflows Module (13 endpoints)

| Endpoint Pattern                                  | Methods       | File                                                                                                             | Line Range |
| ------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------- | ---------- |
| `/api/v1/workflows`                               | POST, GET     | workflows.controller.ts | L29-L37    |
| `/api/v1/workflows/:id`                           | GET, PATCH    | workflows.controller.ts | L39-L47    |
| `/api/v1/workflows/:id/activate`                  | POST          | workflows.controller.ts | L49-L52    |
| `/api/v1/workflows/:id/archive`                   | POST          | workflows.controller.ts | L54-L57    |
| `/api/v1/workflows/:id/states`                    | POST, GET     | workflows.controller.ts | L63-L71    |
| `/api/v1/workflows/:id/states/:stateId`           | PATCH, DELETE | workflows.controller.ts | L73-L88    |
| `/api/v1/workflows/:id/transitions`               | POST, GET     | workflows.controller.ts | L94-L105   |
| `/api/v1/workflows/:id/transitions/:transitionId` | DELETE        | workflows.controller.ts | L107-L113  |

### Workflow Instances Module (4 endpoints)

| Endpoint                                    | Method | File                                                                                                                                        | Line Range |
| ------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `/api/v1/workflow-instances`                | POST   | workflow-instances.controller.ts | L40-L47    |
| `/api/v1/workflow-instances/:id`            | GET    | workflow-instances.controller.ts | L53-L56    |
| `/api/v1/workflow-instances/:id/transition` | POST   | workflow-instances.controller.ts | L62-L74    |
| `/api/v1/workflow-instances/:id/history`    | GET    | workflow-instances.controller.ts | L80-L86    |

### Workflow Triggers Module (6 endpoints)

| Endpoint                               | Method     | File                                                                                                                                     | Line Range |
| -------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `/api/v1/workflow-triggers`            | POST, GET  | workflow-triggers.controller.ts | L23-L31    |
| `/api/v1/workflow-triggers/:id`        | GET, PATCH | workflow-triggers.controller.ts | L33-L41    |
| `/api/v1/workflow-triggers/events`     | POST       | workflow-triggers.controller.ts | L43-L46    |
| `/api/v1/workflow-triggers/events/:id` | GET        | workflow-triggers.controller.ts | L48-L51    |

### Scheduled Triggers Module (5 endpoints)

| Endpoint                         | Method             | File                                                                                                                                        | Line Range |
| -------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `/api/v1/scheduled-triggers`     | POST, GET          | scheduled-triggers.controller.ts | L25-L33    |
| `/api/v1/scheduled-triggers/:id` | GET, PATCH, DELETE | scheduled-triggers.controller.ts | L35-L51    |

### Deferred Execution Module (4 endpoints)

| Endpoint                                   | Method | File                                                                                                                                        | Line Range |
| ------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `/api/v1/deferred-executions`              | GET    | deferred-execution.controller.ts | L20-L23    |
| `/api/v1/deferred-executions/:id`          | GET    | deferred-execution.controller.ts | L25-L28    |
| `/api/v1/deferred-executions/:id/attempts` | GET    | deferred-execution.controller.ts | L30-L33    |
| `/api/v1/deferred-executions/:id/retry`    | POST   | deferred-execution.controller.ts | L35-L38    |

### Users Module (2 endpoints)

| Endpoint        | Method    | File                                                                                                 | Line Range |
| --------------- | --------- | ---------------------------------------------------------------------------------------------------- | ---------- |
| `/api/v1/users` | POST, GET | users.controller.ts | L12-L20    |

### Organizations Module (2 endpoints)

| Endpoint                    | Method | File                                                                                                                         | Line Range |
| --------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `/api/v1/organizations`     | POST   | organizations.controller.ts | L20-L23    |
| `/api/v1/organizations/:id` | GET    | organizations.controller.ts | L25-L28    |

### Roles Module (4 endpoints)

| Endpoint                            | Method    | File                                                                                                 | Line Range |
| ----------------------------------- | --------- | ---------------------------------------------------------------------------------------------------- | ---------- |
| `/api/v1/roles`                     | POST, GET | roles.controller.ts | L13-L21    |
| `/api/v1/roles/:roleId/permissions` | POST, GET | roles.controller.ts | L23-L34    |

---

## 3. DTOs (19 Files)

| DTO                       | File                                                                                                                                          | Key Validators                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| LoginDto                  | login.dto.ts                                                     | `@IsEmail()`, `@MinLength(1)`                 |
| CreateWorkflowDto         | create-workflow.dto.ts                            | `@IsString()`, `@IsNotEmpty()`                |
| UpdateWorkflowDto         | update-workflow.dto.ts                            | PartialType                                   |
| CreateStateDto            | create-state.dto.ts                                  | -                                             |
| UpdateStateDto            | update-state.dto.ts                                  | -                                             |
| CreateTransitionDto       | create-transition.dto.ts                        | -                                             |
| InitiateWorkflowDto       | initiate-workflow.dto.ts               | `@IsString()`, `@IsNotEmpty()`, `@IsObject()` |
| TransitionWorkflowDto     | transition-workflow.dto.ts           | -                                             |
| CreateTriggerDto          | create-trigger.dto.ts                      | -                                             |
| UpdateTriggerDto          | update-trigger.dto.ts                      | -                                             |
| FireEventDto              | fire-event.dto.ts                              | -                                             |
| CreateScheduledTriggerDto | create-scheduled-trigger.dto.ts | `@IsUUID()`, `@IsTimeZone()`, `@Min(0)`       |
| UpdateScheduledTriggerDto | update-scheduled-trigger.dto.ts | -                                             |
| CreateUserDto             | create-user.dto.ts                                        | `@IsEmail()`, `@MinLength(8)`                 |
| CreateOrganizationDto     | create-organization.dto.ts                | -                                             |
| CreateRoleDto             | create-role.dto.ts                                        | -                                             |
| AssignPermissionsDto      | assign-permissions.dto.ts                          | -                                             |
| RefreshDto                | refresh.dto.ts                                                 | NOT USED (no endpoint)                        |
| RegisterDto               | register.dto.ts                                               | NOT USED (no endpoint)                        |

---

## 4. Guards

| Guard        | File                                                                                                   | Line Range | Purpose                               |
| ------------ | ------------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------- |
| JwtAuthGuard | jwt-auth.guard.ts | L4-L5      | Extends Passport JWT strategy         |
| TenantGuard  | tenant.guard.ts           | L26-L125   | Sets CLS context + sanitizes requests |

---

## 5. Authentication Mechanism

| Element              | Value                                  | File                                                                                                   | Line Range |
| -------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------- |
| **Strategy**         | JwtStrategy (Passport)                 | jwt.strategy.ts | L17-L51    |
| **Token Extraction** | Bearer token from Authorization header | jwt.strategy.ts | L23        |
| **JWT Secret**       | `process.env.JWT_SECRET`               | jwt.strategy.ts | L25        |
| **Payload Fields**   | `sub`, `email`, `organizationId`       | jwt.strategy.ts | L29-L33    |
| **req.user Fields**  | `id`, `email`, `organizationId`        | jwt.strategy.ts | L45-L49    |

---

## 6. Tenant Context Mechanism

| Element                  | Value                                                                     | File                                                                                                   | Line Range |
| ------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------- |
| **Tenant Source**        | JWT claim `organizationId`                                                | jwt.strategy.ts | L32, L48   |
| **CLS Key: orgId**       | Set from `req.user.organizationId`                                        | tenant.guard.ts           | L56        |
| **CLS Key: userId**      | Set from `req.user.id`                                                    | tenant.guard.ts           | L57        |
| **Request Sanitization** | Removes manual `organizationId`/`orgId`/`tenantId` from query/body/params | tenant.guard.ts           | L72-L124   |

---

## 7. Explicitly NOT FOUND (Out of Scope)

| Feature                         | Search Query                                                   | Results                               | Conclusion       |
| ------------------------------- | -------------------------------------------------------------- | ------------------------------------- | ---------------- |
| **Correlation ID / Request ID** | `x-request-id`, `x-correlation-id`, `correlation`, `requestId` | 0 matches                             | ❌ NOT SUPPORTED |
| **Template Publish Endpoints**  | `@Controller` search                                           | No `/templates` or `/publish` routes  | ❌ NOT FOUND     |
| **Refresh Token Endpoint**      | auth.controller.ts inspection                                  | Only `login` and `me` endpoints       | ❌ NOT FOUND     |
| **Logout Endpoint**             | auth.controller.ts inspection                                  | Only `login` and `me` endpoints       | ❌ NOT FOUND     |
| **Register Endpoint**           | auth.controller.ts inspection                                  | DTO exists but no controller endpoint | ❌ NOT FOUND     |

---

## Summary Statistics

| Category                | Count | Evidence                                                    |
| ----------------------- | ----- | ----------------------------------------------------------- |
| **Controllers**         | 9     | All inspected                                               |
| **Total Endpoints**     | 42    | All mapped to source                                        |
| **DTOs**                | 19    | All located                                                 |
| **Guards**              | 2     | Both documented                                             |
| **Auth Endpoints**      | 2     | login + me                                                  |
| **Protected Endpoints** | 40    | JwtAuthGuard + TenantGuard                                  |
| **Public Endpoints**    | 1     | login only                                                  |
| **NOT FOUND Items**     | 5     | Correlation ID, Template Publish, Refresh, Logout, Register |

---

## Verification Commands

```bash
# List all controllers
rg -n "@Controller\(" backend/src

# List all DTOs
find backend/src -name "*.dto.ts"

# Search for correlation ID
rg -n "x-request-id|x-correlation-id|correlation|requestId" backend/src

# Search for tenant context
rg -n "organizationId|tenant|cls\.set" backend/src
```

**All commands executed:** 2026-01-31  
**No source modifications made**

---

**END OF EVIDENCE TABLE**

