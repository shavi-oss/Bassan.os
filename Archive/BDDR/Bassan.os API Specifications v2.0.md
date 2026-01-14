# Bassan.os API Specifications v2.0

## Document Control
- **Document Title**: Bassan.os API Specifications
- **Version**: 2.0
- **Status**: Ready for Implementation
- **Date**: 2024-01-20
- **Author**: Principal Software Architect
- **Reviewers**: Architecture Board, Backend Team, Frontend Team
- **Linked Documents**: BRD v2.0, User Stories Catalog v2.0, Technical Architecture v2.0, Database ERD v2.0

---

## SECTION 1: API ARCHITECTURE OVERVIEW

### 1.1 API Design Principles
- **RESTful Design**: Follow REST principles for resource-based APIs
- **GraphQL**: Use GraphQL for complex queries and aggregations
- **Versioning**: All APIs are versioned (v1, v2, etc.)
- **Consistency**: Consistent naming conventions across all endpoints
- **Security**: All endpoints require authentication unless explicitly public
- **Error Handling**: Consistent error response format across all endpoints
- **Rate Limiting**: Per-tenant and per-user rate limiting
- **Pagination**: Consistent pagination for list endpoints
- **Filtering**: Consistent filtering capabilities across list endpoints
- **Sorting**: Consistent sorting capabilities across list endpoints

### 1.2 API Gateway Configuration
- **Base URL**: `https://api.bassanos.io/{version}/{tenant_id}`
- **Authentication**: Bearer token (JWT) in Authorization header
- **Content-Type**: `application/json` for all requests/responses
- **Compression**: Gzip compression for responses > 1KB
- **CORS**: Configured CORS headers for frontend applications
- **Rate Limits**: 
  - Per tenant: 1000 requests/minute
  - Per user: 100 requests/minute
  - Burst: 200 requests in 10 seconds

### 1.3 Authentication & Authorization
- **Authentication Method**: OAuth 2.0 / OpenID Connect with JWT
- **Token Format**: JWT with standard claims (iss, sub, aud, exp, iat, tenant_id)
- **Authorization**: Role-based access control (RBAC) with permissions
- **Token Refresh**: Refresh token endpoint with 15-minute validity
- **MFA**: Multi-factor authentication for sensitive operations
- **Session Management**: Session tracking with timeout and revocation

### 1.4 Standard Response Format
```json
{
  "success": true,
  "data": { },
  "errors": [ ],
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO8601",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalPages": 10,
      "totalRecords": 200
    }
  }
}
```

### 1.5 Standard Error Response Format
```json
{
  "success": false,
  "data": null,
  "errors": [
    {
      "code": "ERROR_CODE",
      "message": "Human-readable error message",
      "field": "field_name",
      "details": { }
    }
  ],
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO8601"
  }
}
```

---

## SECTION 2: IDENTITY & ACCESS API

### 2.1 Authentication Endpoints

#### POST /auth/login
**Description**: Authenticate user with email and password
**Authentication**: Not required
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "mfaCode": "123456",
  "deviceId": "device_identifier"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 900,
    "user": {
      "userId": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John Doe",
      "avatarUrl": "https://cdn.example.com/avatars/john.jpg",
      "roles": ["role_id_1", "role_id_2"],
      "permissions": ["permission_1", "permission_2"],
      "tenantId": "tenant_uuid"
    }
  }
}
```
**Error Codes**:
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Account locked
- `AUTH_003`: MFA required
- `AUTH_004`: Invalid MFA code

#### POST /auth/refresh
**Description**: Refresh access token using refresh token
**Authentication**: Not required
**Request Body**:
```json
{
  "refreshToken": "jwt_refresh_token"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token",
    "expiresIn": 900
  }
}
```
**Error Codes**:
- `AUTH_005`: Invalid refresh token
- `AUTH_006`: Refresh token expired

#### POST /auth/logout
**Description**: Logout user and invalidate session
**Authentication**: Required
**Request Body**:
```json
{
  "refreshToken": "jwt_refresh_token",
  "deviceId": "device_identifier"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

#### POST /auth/mfa/setup
**Description**: Setup multi-factor authentication for user
**Authentication**: Required
**Request Body**:
```json
{
  "mfaType": "TOTP",
  "deviceName": "My iPhone"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "secret": "totp_secret_key",
    "qrCode": "data:image/png;base64,...",
    "backupCodes": ["code1", "code2", "code3", "code4", "code5"]
  }
}
```

#### POST /auth/mfa/verify
**Description**: Verify MFA setup with code
**Authentication**: Required
**Request Body**:
```json
{
  "mfaType": "TOTP",
  "code": "123456"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "message": "MFA verified successfully"
  }
}
```

### 2.2 User Management Endpoints

#### GET /users
**Description**: List users with filtering and pagination
**Authentication**: Required
**Permissions**: `users.read`
**Query Parameters**:
- `page`: Page number (default: 1)
- `pageSize`: Page size (default: 20, max: 100)
- `filter`: JSON filter object
- `sort`: Sort field and direction (e.g., "name:asc")
- `search`: Search term for name/email

**Response**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": "uuid",
        "tenantId": "uuid",
        "userCode": "USR001",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "displayName": "John Doe",
        "phone": "+1234567890",
        "avatarUrl": "https://cdn.example.com/avatars/john.jpg",
        "status": "ACTIVE",
        "userType": "INTERNAL",
        "mfaEnabled": true,
        "lastLoginAt": "2024-01-20T10:30:00Z",
        "createdAt": "2024-01-01T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalPages": 10,
      "totalRecords": 200
    }
  }
}
```

#### GET /users/{userId}
**Description**: Get user by ID
**Authentication**: Required
**Permissions**: `users.read` or `users.read.self` (for own user)
**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "tenantId": "uuid",
    "userCode": "USR001",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe",
    "phone": "+1234567890",
    "avatarUrl": "https://cdn.example.com/avatars/john.jpg",
    "status": "ACTIVE",
    "userType": "INTERNAL",
    "mfaEnabled": true,
    "roles": [
      {
        "roleId": "uuid",
        "roleName": "Sales Manager",
        "roleType": "DEPARTMENT",
        "isPrimary": true
      }
    ],
    "departments": [
      {
        "departmentId": "uuid",
        "departmentName": "Sales",
        "isPrimary": true
      }
    ],
    "lastLoginAt": "2024-01-20T10:30:00Z",
    "createdAt": "2024-01-01T08:00:00Z"
  }
}
```

#### POST /users
**Description**: Create new user
**Authentication**: Required
**Permissions**: `users.create`
**Request Body**:
```json
{
  "userCode": "USR001",
  "email": "user@example.com",
  "password": "secure_password",
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "John Doe",
  "phone": "+1234567890",
  "userType": "INTERNAL",
  "roleIds": ["role_id_1", "role_id_2"],
  "departmentIds": ["dept_id_1"]
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "message": "User created successfully"
  }
}
```
**Error Codes**:
- `USER_001`: Email already exists
- `USER_002`: User code already exists
- `USER_003`: Invalid user type

#### PUT /users/{userId}
**Description**: Update user
**Authentication**: Required
**Permissions**: `users.update` or `users.update.self` (for own user)
**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "John Doe",
  "phone": "+1234567890",
  "avatarUrl": "https://cdn.example.com/avatars/john.jpg"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "message": "User updated successfully"
  }
}
```

#### DELETE /users/{userId}
**Description**: Delete user (soft delete)
**Authentication**: Required
**Permissions**: `users.delete`
**Response**:
```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully"
  }
}
```

### 2.3 Role Management Endpoints

#### GET /roles
**Description**: List roles with filtering and pagination
**Authentication**: Required
**Permissions**: `roles.read`
**Query Parameters**:
- `page`: Page number (default: 1)
- `pageSize`: Page size (default: 20, max: 100)
- `filter`: JSON filter object
- `sort`: Sort field and direction (e.g., "name:asc")

**Response**:
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "roleId": "uuid",
        "tenantId": "uuid",
        "roleCode": "SALES_MGR",
        "roleName": "Sales Manager",
        "roleType": "DEPARTMENT",
        "description": "Manages sales team and pipeline",
        "isSystemRole": false,
        "permissions": ["leads.read", "leads.write", "opportunities.read", "opportunities.write"],
        "createdAt": "2024-01-01T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalPages": 5,
      "totalRecords": 100
    }
  }
}
```

#### POST /roles
**Description**: Create new role
**Authentication**: Required
**Permissions**: `roles.create`
**Request Body**:
```json
{
  "roleCode": "SALES_MGR",
  "roleName": "Sales Manager",
  "roleType": "DEPARTMENT",
  "description": "Manages sales team and pipeline",
  "permissions": ["leads.read", "leads.write", "opportunities.read", "opportunities.write"]
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "roleId": "uuid",
    "message": "Role created successfully"
  }
}
```

#### PUT /roles/{roleId}
**Description**: Update role
**Authentication**: Required
**Permissions**: `roles.update`
**Request Body**:
```json
{
  "roleName": "Sales Manager",
  "description": "Manages sales team and pipeline",
  "permissions": ["leads.read", "leads.write", "opportunities.read", "opportunities.write"]
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "roleId": "uuid",
    "message": "Role updated successfully"
  }
}
```

#### POST /roles/{roleId}/users/{userId}
**Description**: Assign role to user
**Authentication**: Required
**Permissions**: `roles.assign`
**Request Body**:
```json
{
  "isPrimary": false,
  "expiresAt": "2024-12-31T23:59:59Z"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Role assigned to user successfully"
  }
}
```

#### DELETE /roles/{roleId}/users/{userId}
**Description**: Remove role from user
**Authentication**: Required
**Permissions**: `roles.assign`
**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Role removed from user successfully"
  }
}
```

---

## SECTION 3: TENANT MANAGEMENT API

### 3.1 Tenant Endpoints

#### GET /tenants
**Description**: List tenants (admin only)
**Authentication**: Required
**Permissions**: `tenants.read` (admin only)
**Query Parameters**:
- `page`: Page number (default: 1)
- `pageSize`: Page size (default: 20, max: 100)
- `filter`: JSON filter object
- `sort`: Sort field and direction (e.g., "name:asc")

**Response**:
```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "tenantId": "uuid",
        "tenantCode": "TEN001",
        "tenantName": "Example Company",
        "tenantType": "STANDARD",
        "status": "ACTIVE",
        "maxUsers": 50,
        "maxDepartments": 10,
        "maxStorageGb": 50,
        "billingCycleStartDay": 1,
        "timezone": "UTC",
        "locale": "en_US",
        "logoUrl": "https://cdn.example.com/logos/tenant.jpg",
        "customDomain": "app.example.com",
        "createdAt": "2024-01-01T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalPages": 5,
      "totalRecords": 100
    }
  }
}
```

#### GET /tenants/{tenantId}
**Description**: Get tenant by ID
**Authentication**: Required
**Permissions**: `tenants.read` (admin only) or `tenants.read.self` (for own tenant)
**Response**:
```json
{
  "success": true,
  "data": {
    "tenantId": "uuid",
    "tenantCode": "TEN001",
    "tenantName": "Example Company",
    "tenantType": "STANDARD",
    "status": "ACTIVE",
    "subscriptionPlanId": "uuid",
    "maxUsers": 50,
    "maxDepartments": 10,
    "maxStorageGb": 50,
    "billingCycleStartDay": 1,
    "timezone": "UTC",
    "locale": "en_US",
    "logoUrl": "https://cdn.example.com/logos/tenant.jpg",
    "customDomain": "app.example.com",
    "settings": {
      "featureFlags": {
        "advancedAnalytics": true,
        "customWorkflows": true
      }
    },
    "createdAt": "2024-01-01T08:00:00Z"
  }
}
```

#### POST /tenants
**Description**: Create new tenant
**Authentication**: Required
**Permissions**: `tenants.create` (admin only)
**Request Body**:
```json
{
  "tenantCode": "TEN001",
  "tenantName": "Example Company",
  "tenantType": "STANDARD",
  "subscriptionPlanId": "uuid",
  "maxUsers": 50,
  "maxDepartments": 10,
  "maxStorageGb": 50,
  "billingCycleStartDay": 1,
  "timezone": "UTC",
  "locale": "en_US",
  "logoUrl": "https://cdn.example.com/logos/tenant.jpg",
  "customDomain": "app.example.com"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "tenantId": "uuid",
    "message": "Tenant created successfully"
  }
}
```

#### PUT /tenants/{tenantId}
**Description**: Update tenant
**Authentication**: Required
**Permissions**: `tenants.update` (admin only) or `tenants.update.self` (for own tenant)
**Request Body**:
```json
{
  "tenantName": "Example Company",
  "timezone": "UTC",
  "locale": "en_US",
  "logoUrl": "https://cdn.example.com/logos/tenant.jpg",
  "settings": {
    "featureFlags": {
      "advancedAnalytics": true
    }
  }
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "tenantId": "uuid",
    "message": "Tenant updated successfully"
  }
}
```

---

## SECTION 4: WORKFLOW API

### 4.1 Workflow Definition Endpoints

#### GET /workflows
**Description**: List workflow definitions
**Authentication**: Required
**Permissions**: `workflows.read`
**Query Parameters**:
- `page`: Page number (default: 1)
- `pageSize`: Page size (default: 20, max: 100)
- `filter`: JSON filter object
- `sort`: Sort field and direction (e.g., "name:asc")
- `status`: Filter by status (ACTIVE, INACTIVE, DRAFT)

**Response**:
```json
{
  "success": true,
  "data": {
    "workflows": [
      {
        "workflowId": "uuid",
        "workflowName": "Customer Onboarding",
        "workflowVersion": "1.0",
        "tenantId": "uuid",
        "category": "CustomerLifecycle",
        "description": "Onboard new customers",
        "status": "ACTIVE",
        "trigger": {
          "type": "Event",
          "eventType": "Customer.CustomerCreated",
          "conditions": [
            {
              "field": "data.customerType",
              "operator": "equals",
              "value": "NEW"
            }
          ]
        },
        "variables": [
          {
            "name": "customerType",
            "type": "string",
            "required": true,
            "defaultValue": "NEW"
          }
        ],
        "states": [
          {
            "stateId": "INITIAL",
            "stateType": "START",
            "transitions": [
              {
                "to": "VALIDATE_CUSTOMER",
                "condition": null
              }
            ]
          }
        ],
        "createdAt": "2024-01-01T08:00:00Z",
        "updatedAt": "2024-01-15T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalPages": 5,
      "totalRecords": 100
    }
  }
}
```

#### POST /workflows
**Description**: Create new workflow definition
**Authentication**: Required
**Permissions**: `workflows.create`
**Request Body**:
```json
{
  "workflowName": "Customer Onboarding",
  "category": "CustomerLifecycle",
  "description": "Onboard new customers",
  "trigger": {
    "type": "Event",
    "eventType": "Customer.CustomerCreated",
    "conditions": [
      {
        "field": "data.customerType",
        "operator": "equals",
        "value": "NEW"
      }
    ]
  },
  "variables": [
    {
      "name": "customerType",
      "type": "string",
      "required": true,
      "defaultValue": "NEW"
    }
  ],
  "states": [
    {
      "stateId": "INITIAL",
      "stateType": "START",
      "transitions": [
        {
          "to": "VALIDATE_CUSTOMER",
          "condition": null
        }
      ]
    }
  ]
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "workflowId": "uuid",
    "workflowVersion": "1.0",
    "message": "Workflow created successfully"
  }
}
```

#### PUT /workflows/{workflowId}
**Description**: Update workflow definition
**Authentication**: Required
**Permissions**: `workflows.update`
**Request Body**:
```json
{
  "workflowName": "Customer Onboarding",
  "description": "Onboard new customers",
  "states": [
    {
      "stateId": "INITIAL",
      "stateType": "START",
      "transitions": [
        {
          "to": "VALIDATE_CUSTOMER",
          "condition": null
        }
      ]
    }
  ]
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "workflowId": "uuid",
    "message": "Workflow updated successfully"
  }
}
```

### 4.2 Workflow Instance Endpoints

#### GET /workflow-instances
**Description**: List workflow instances
**Authentication**: Required
**Permissions**: `workflowInstances.read`
**Query Parameters**:
- `page`: Page number (default: 1)
- `pageSize`: Page size (default: 20, max: 100)
- `filter`: JSON filter object
- `sort`: Sort field and direction (e.g., "createdAt:desc")
- `status`: Filter by status (RUNNING, COMPLETED, FAILED, SUSPENDED)

**Response**:
```json
{
  "success": true,
  "data": {
    "instances": [
      {
        "instanceId": "uuid",
        "workflowId": "uuid",
        "workflowName": "Customer Onboarding",
        "workflowVersion": "1.0",
        "tenantId": "uuid",
        "status": "RUNNING",
        "currentState": "VALIDATE_CUSTOMER",
        "variables": {
          "customerType": "NEW",
          "customerId": "uuid"
        },
        "startedAt": "2024-01-20T10:00:00Z",
        "updatedAt": "2024-01-20T10:30:00Z",
        "completedAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalPages": 5,
      "totalRecords": 100
    }
  }
}
```

#### POST /workflow-instances/{instanceId}/start
**Description**: Start workflow instance
**Authentication**: Required
**Permissions**: `workflowInstances.execute`
**Request Body**:
```json
{
  "variables": {
    "customerType": "NEW",
    "customerId": "uuid"
  }
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "instanceId": "uuid",
    "status": "RUNNING",
    "currentState": "INITIAL",
    "message": "Workflow instance started successfully"
  }
}
```

#### POST /workflow-instances/{instanceId}/transition
**Description**: Transition workflow instance to next state
**Authentication**: Required
**Permissions**: `workflowInstances.execute`
**Request Body**:
```json
{
  "toState": "VALIDATE_CUSTOMER",
  "comment": "Customer validation completed"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "instanceId": "uuid",
    "status": "RUNNING",
    "currentState": "VALIDATE_CUSTOMER",
    "message": "Workflow instance transitioned successfully"
  }
}
```

---

## SECTION 5: TASK MANAGEMENT API

### 5.1 Task Endpoints

#### GET /tasks
**Description**: List tasks with filtering and pagination
**Authentication**: Required
**Permissions**: `tasks.read`
**Query Parameters**:
- `page`: Page number (default: 1)
- `pageSize`: Page size (default: 20, max: 100)
- `filter`: JSON filter object
- `sort`: Sort field and direction (e.g., "dueDate:asc")
- `status`: Filter by status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- `assignee`: Filter by assignee user ID

**Response**:
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "taskId": "uuid",
        "tenantId": "uuid",
        "taskCode": "TSK001",
        "title": "Validate customer information",
        "description": "Validate customer information before onboarding",
        "status": "PENDING",
        "priority": "HIGH",
        "assigneeId": "uuid",
        "assigneeName": "John Doe",
        "departmentId": "uuid",
        "departmentName": "Sales",
        "dueDate": "2024-01-25T17:00:00Z",
        "startedAt": null,
        "completedAt": null,
        "evidenceRequired": true,
        "evidence": [],
        "dependencies": [
          {
            "taskId": "uuid",
            "taskCode": "TSK000",
            "title": "Create customer record"
          }
        ],
        "createdAt": "2024-01-20T10:00:00Z",
        "updatedAt": "2024-01-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalPages": 5,
      "totalRecords": 100
    }
  }
}
```

#### GET /tasks/{taskId}
**Description**: Get task by ID
**Authentication**: Required
**Permissions**: `tasks.read` or `tasks.read.assigned` (for assigned tasks)
**Response**:
```json
{
  "success": true,
  "data": {
    "taskId": "uuid",
    "tenantId": "uuid",
    "taskCode": "TSK001",
    "title": "Validate customer information",
    "description": "Validate customer information before onboarding",
    "status": "PENDING",
    "priority": "HIGH",
    "assigneeId": "uuid",
    "assigneeName": "John Doe",
    "departmentId": "uuid",
    "departmentName": "Sales",
    "dueDate": "2024-01-25T17:00:00Z",
    "startedAt": null,
    "completedAt": null,
    "evidenceRequired": true,
    "evidence": [
      {
        "evidenceId": "uuid",
        "type": "document",
        "url": "https://cdn.example.com/evidence/doc.pdf",
        "uploadedAt": "2024-01-24T15:30:00Z",
        "uploadedBy": "uuid"
      }
    ],
    "dependencies": [
      {
        "taskId": "uuid",
        "taskCode": "TSK000",
        "title": "Create customer record",
        "status": "COMPLETED"
      }
    ],
    "workflowInstanceId": "uuid",
    "workflowName": "Customer Onboarding",
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
  }
}
```

#### POST /tasks
**Description**: Create new task
**Authentication**: Required
**Permissions**: `tasks.create`
**Request Body**:
```json
{
  "taskCode": "TSK001",
  "title": "Validate customer information",
  "description": "Validate customer information before onboarding",
  "priority": "HIGH",
  "assigneeId": "uuid",
  "departmentId": "uuid",
  "dueDate": "2024-01-25T17:00:00Z",
  "evidenceRequired": true,
  "dependencies": ["task_id_1", "task_id_2"],
  "workflowInstanceId": "uuid"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "taskId": "uuid",
    "message": "Task created successfully"
  }
}
```

#### PUT /tasks/{taskId}
**Description**: Update task
**Authentication**: Required
**Permissions**: `tasks.update` or `tasks.update.assigned` (for assigned tasks)
**Request Body**:
```json
{
  "title": "Validate customer information",
  "description": "Validate customer information before onboarding",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "assigneeId": "uuid",
  "dueDate": "2024-01-25T17:00:00Z"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "taskId": "uuid",
    "message": "Task updated successfully"
  }
}
```

#### POST /tasks/{taskId}/complete
**Description**: Mark task as complete
**Authentication**: Required
**Permissions**: `tasks.update.assigned` (for assigned tasks)
**Request Body**:
```json
{
  "evidence": [
    {
      "type": "document",
      "url": "https://cdn.example.com/evidence/doc.pdf"
    }
  ],
  "comment": "Task completed successfully"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "taskId": "uuid",
    "status": "COMPLETED",
    "completedAt": "2024-01-24T15:30:00Z",
    "message": "Task completed successfully"
  }
}
```

---

## SECTION 6: SALES API

### 6.1 Lead Endpoints

#### GET /leads
**Description**: List leads with filtering and pagination
**Authentication**: Required
**Permissions**: `leads.read`
**Query Parameters**:
- `page`: Page number (default: 1)
- `pageSize`: Page size (default: 20, max: 100)
- `filter`: JSON filter object
- `sort`: Sort field and direction (e.g., "createdAt:desc")
- `stage`: Filter by pipeline stage
- `owner`: Filter by owner user ID
- `source`: Filter by lead source

**Response**:
```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "leadId": "uuid",
        "tenantId": "uuid",
        "leadCode": "LD001",
        "customerId": "uuid",
        "customerName": "Example Company",
        "stage": "QUALIFIED",
        "ownerId": "uuid",
        "ownerName": "John Doe",
        "source": "WEBSITE",
        "value": 10000.00,
        "currency": "USD",
        "probability": 70,
        "expectedCloseDate": "2024-02-15T17:00:00Z",
        "createdAt": "2024-01-20T10:00:00Z",
        "updatedAt": "2024-01-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalPages": 5,
      "totalRecords": 100
    }
  }
}
```

#### POST /leads
**Description**: Create new lead
**Authentication**: Required
**Permissions**: `leads.create`
**Request Body**:
```json
{
  "leadCode": "LD001",
  "customerId": "uuid",
  "stage": "QUALIFIED",
  "ownerId": "uuid",
  "source": "WEBSITE",
  "value": 10000.00,
  "currency": "USD",
  "probability": 70,
  "expectedCloseDate": "2024-02-15T17:00:00Z"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "leadId": "uuid",
    "message": "Lead created successfully"
  }
}
```

#### PUT /leads/{leadId}/stage
**Description**: Move lead to next stage
**Authentication**: Required
**Permissions**: `leads.update` or `leads.update.owned` (for owned leads)
**Request Body**:
```json
{
  "stage": "PROPOSAL",
  "comment": "Moved to proposal stage after qualification"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "leadId": "uuid",
    "stage": "PROPOSAL",
    "message": "Lead stage updated successfully"
  }
}
```

### 6.2 Commission Endpoints

#### GET /commissions
**Description**: List commissions with filtering and pagination
**Authentication**: Required
**Permissions**: `commissions.read`
**Query Parameters**:
- `page`: Page number (default: 1)
- `pageSize`: Page size (default: 20, max: 100)
- `filter`: JSON filter object
- `sort`: Sort field and direction (e.g., "calculatedAt:desc")
- `status`: Filter by status (PENDING, APPROVED, PAID, DISPUTED)
- `userId`: Filter by user ID

**Response**:
```json
{
  "success": true,
  "data": {
    "commissions": [
      {
        "commissionId": "uuid",
        "tenantId": "uuid",
        "userId": "uuid",
        "userName": "John Doe",
        "taskId": "uuid",
        "taskCode": "TSK001",
        "taskTitle": "Validate customer information",
        "dealId": "uuid",
        "dealValue": 10000.00,
        "commissionRate": 0.10,
        "commissionAmount": 1000.00,
        "currency": "USD",
        "status": "PENDING",
        "calculatedAt": "2024-01-24T15:30:00Z",
        "approvedAt": null,
        "approvedBy": null,
        "paidAt": null,
        "disputeRaisedAt": null,
        "disputeReason": null
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalPages": 5,
      "totalRecords": 100
    }
  }
}
```

#### POST /commissions/{commissionId}/approve
**Description**: Approve commission
**Authentication**: Required
**Permissions**: `commissions.approve`
**Request Body**:
```json
{
  "comment": "Commission approved for task completion"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "commissionId": "uuid",
    "status": "APPROVED",
    "approvedAt": "2024-01-24T16:00:00Z",
    "message": "Commission approved successfully"
  }
}
```

#### POST /commissions/{commissionId}/dispute
**Description**: Raise commission dispute
**Authentication**: Required
**Permissions**: `commissions.dispute` or `commissions.dispute.self` (for own commission)
**Request Body**:
```json
{
  "reason": "Commission amount is incorrect",
  "evidence": [
    {
      "type": "document",
      "url": "https://cdn.example.com/evidence/doc.pdf"
    }
  ]
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "commissionId": "uuid",
    "status": "DISPUTED",
    "disputeRaisedAt": "2024-01-24T16:00:00Z",
    "message": "Commission dispute raised successfully"
  }
}
```

---

## SECTION 7: CUSTOMER API

### 7.1 Customer Endpoints

#### GET /customers
**Description**: List customers with filtering and pagination
**Authentication**: Required
**Permissions**: `customers.read`
**Query Parameters**:
- `page`: Page number (default: 1)
- `pageSize`: Page size (default: 20, max: 100)
- `filter`: JSON filter object
- `sort`: Sort field and direction (e.g., "name:asc")
- `status`: Filter by customer status (NEW, ACTIVE, INACTIVE, CHURNED)
- `type`: Filter by customer type

**Response**:
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "customerId": "uuid",
        "tenantId": "uuid",
        "customerCode": "CUST001",
        "name": "Example Company",
        "type": "BUSINESS",
        "status": "ACTIVE",
        "paymentStatus": "PAID",
        "industry": "Technology",
        "size": "MEDIUM",
        "address": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "country": "USA",
          "postalCode": "10001"
        },
        "contact": {
          "primaryContact": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890"
        },
        "totalRevenue": 50000.00,
        "currency": "USD",
        "createdAt": "2024-01-01T08:00:00Z",
        "updatedAt": "2024-01-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalPages": 5,
      "totalRecords": 100
    }
  }
}
```

#### POST /customers
**Description**: Create new customer
**Authentication**: Required
**Permissions**: `customers.create`
**Request Body**:
```json
{
  "customerCode": "CUST001",
  "name": "Example Company",
  "type": "BUSINESS",
  "industry": "Technology",
  "size": "MEDIUM",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001"
  },
  "contact": {
    "primaryContact": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "customerId": "uuid",
    "message": "Customer created successfully"
  }
}
```

#### PUT /customers/{customerId}
**Description**: Update customer
**Authentication**: Required
**Permissions**: `customers.update`
**Request Body**:
```json
{
  "name": "Example Company",
  "status": "ACTIVE",
  "paymentStatus": "PAID",
  "contact": {
    "primaryContact": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "customerId": "uuid",
    "message": "Customer updated successfully"
  }
}
```

---

## SECTION 8: NOTIFICATION API

### 8.1 Notification Endpoints

#### GET /notifications
**Description**: List notifications for user
**Authentication**: Required
**Permissions**: `notifications.read` or `notifications.read.self` (for own notifications)
**Query Parameters**:
- `page`: Page number (default: 1)
- `pageSize`: Page size (default: 20, max: 100)
- `filter`: JSON filter object
- `sort`: Sort field and direction (e.g., "createdAt:desc")
- `status`: Filter by status (UNREAD, READ, ARCHIVED)
- `priority`: Filter by priority (CRITICAL, HIGH, MEDIUM, LOW)

**Response**:
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "notificationId": "uuid",
        "tenantId": "uuid",
        "userId": "uuid",
        "type": "TASK_ASSIGNED",
        "title": "New task assigned",
        "message": "You have been assigned to task TSK001",
        "priority": "HIGH",
        "status": "UNREAD",
        "channels": ["EMAIL", "WHATSAPP"],
        "data": {
          "taskId": "uuid",
          "taskCode": "TSK001",
          "taskTitle": "Validate customer information"
        },
        "createdAt": "2024-01-20T10:00:00Z",
        "readAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalPages": 5,
      "totalRecords": 100
    }
  }
}
```

#### PUT /notifications/{notificationId}/read
**Description**: Mark notification as read
**Authentication**: Required
**Permissions**: `notifications.update.self` (for own notifications)
**Response**:
```json
{
  "success": true,
  "data": {
    "notificationId": "uuid",
    "status": "READ",
    "readAt": "2024-01-20T10:30:00Z",
    "message": "Notification marked as read"
  }
}
```

#### POST /notifications/preferences
**Description**: Update notification preferences
**Authentication**: Required
**Permissions**: `notifications.update.self` (for own notifications)
**Request Body**:
```json
{
  "emailEnabled": true,
  "whatsappEnabled": true,
  "smsEnabled": false,
  "inAppEnabled": true,
  "criticalOnly": false,
  "quietHours": {
    "enabled": true,
    "start": "22:00",
    "end": "08:00",
    "timezone": "UTC"
  }
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Notification preferences updated successfully"
  }
}
```

---

## SECTION 9: ANALYTICS API

### 9.1 Dashboard Endpoints

#### GET /analytics/executive-dashboard
**Description**: Get executive dashboard data
**Authentication**: Required
**Permissions**: `analytics.executive`
**Query Parameters**:
- `period`: Time period (TODAY, WEEK, MONTH, QUARTER, YEAR)
- `compare`: Compare with previous period (true/false)

**Response**:
```json
{
  "success": true,
  "data": {
    "revenue": {
      "current": 50000.00,
      "previous": 45000.00,
      "change": 5000.00,
      "changePercent": 11.11,
      "currency": "USD"
    },
    "pipeline": {
      "total": 100,
      "byStage": {
        "QUALIFIED": 30,
        "PROPOSAL": 20,
        "NEGOTIATION": 15,
        "CLOSED_WON": 25,
        "CLOSED_LOST": 10
      },
      "totalValue": 500000.00,
      "weightedValue": 350000.00,
      "currency": "USD"
    },
    "tasks": {
      "total": 500,
      "completed": 400,
      "inProgress": 80,
      "pending": 20,
      "completionRate": 80.00
    },
    "alerts": {
      "critical": 5,
      "high": 10,
      "medium": 15,
      "low": 20
    },
    "departments": [
      {
        "departmentId": "uuid",
        "departmentName": "Sales",
        "performance": 85.00,
        "tasksCompleted": 200,
        "revenue": 25000.00
      },
      {
        "departmentId": "uuid",
        "departmentName": "Marketing",
        "performance": 90.00,
        "tasksCompleted": 150,
        "revenue": 15000.00
      }
    ]
  }
}
```

#### GET /analytics/department-performance
**Description**: Get department performance metrics
**Authentication**: Required
**Permissions**: `analytics.department`
**Query Parameters**:
- `departmentId`: Department ID (optional, for specific department)
- `period`: Time period (TODAY, WEEK, MONTH, QUARTER, YEAR)

**Response**:
```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "departmentId": "uuid",
        "departmentName": "Sales",
        "metrics": {
          "tasksCompleted": 200,
          "tasksTotal": 250,
          "completionRate": 80.00,
          "averageTaskTime": 2.5,
          "onTimeDeliveryRate": 85.00,
          "revenue": 25000.00,
          "currency": "USD"
        },
        "team": [
          {
            "userId": "uuid",
            "userName": "John Doe",
            "tasksCompleted": 50,
            "tasksTotal": 60,
            "completionRate": 83.33,
            "revenue": 5000.00
          }
        ]
      }
    ]
  }
}
```

---

## SECTION 10: ERROR CODES REFERENCE

### 10.1 Authentication Errors
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Account locked
- `AUTH_003`: MFA required
- `AUTH_004`: Invalid MFA code
- `AUTH_005`: Invalid refresh token
- `AUTH_006`: Refresh token expired
- `AUTH_007`: Token expired
- `AUTH_008`: Invalid token
- `AUTH_009`: Token revoked

### 10.2 User Errors
- `USER_001`: Email already exists
- `USER_002`: User code already exists
- `USER_003`: Invalid user type
- `USER_004`: User not found
- `USER_005`: User already assigned to role
- `USER_006`: User not assigned to role

### 10.3 Role Errors
- `ROLE_001`: Role code already exists
- `ROLE_002`: Role not found
- `ROLE_003`: System role cannot be modified
- `ROLE_004`: System role cannot be deleted

### 10.4 Tenant Errors
- `TENANT_001`: Tenant code already exists
- `TENANT_002`: Tenant not found
- `TENANT_003`: Tenant limit reached
- `TENANT_004`: Tenant suspended

### 10.5 Workflow Errors
- `WORKFLOW_001`: Workflow not found
- `WORKFLOW_002`: Workflow version conflict
- `WORKFLOW_003`: Invalid workflow definition
- `WORKFLOW_004`: Workflow instance not found
- `WORKFLOW_005`: Invalid state transition

### 10.6 Task Errors
- `TASK_001`: Task not found
- `TASK_002`: Task dependencies not met
- `TASK_003`: Task already completed
- `TASK_004`: Task evidence required
- `TASK_005`: Task not assigned to user

### 10.7 Lead Errors
- `LEAD_001`: Lead not found
- `LEAD_002`: Lead already exists
- `LEAD_003`: Invalid stage transition
- `LEAD_004`: Lead not assigned to user

### 10.8 Commission Errors
- `COMMISSION_001`: Commission not found
- `COMMISSION_002`: Commission already approved
- `COMMISSION_003`: Commission already paid
- `COMMISSION_004`: Commission already disputed
- `COMMISSION_005`: Commission calculation failed

### 10.9 Customer Errors
- `CUSTOMER_001`: Customer not found
- `CUSTOMER_002`: Customer code already exists
- `CUSTOMER_003`: Invalid customer status transition

### 10.10 Notification Errors
- `NOTIFICATION_001`: Notification not found
- `NOTIFICATION_002`: Notification already read
- `NOTIFICATION_003`: Invalid notification preferences

### 10.11 Analytics Errors
- `ANALYTICS_001`: Invalid time period
- `ANALYTICS_002`: Department not found
- `ANALYTICS_003`: Insufficient permissions

### 10.12 General Errors
- `GEN_001`: Internal server error
- `GEN_002`: Service unavailable
- `GEN_003`: Rate limit exceeded
- `GEN_004`: Invalid request
- `GEN_005`: Unauthorized access
- `GEN_006`: Forbidden access
- `GEN_007`: Resource not found
- `GEN_008`: Method not allowed
- `GEN_009`: Request timeout
- `GEN_010`: Conflict

---

## SECTION 11: GRAPHQL SCHEMA

### 11.1 Query Types

```graphql
type Query {
  # Authentication
  me: User
  users(filter: UserFilter, sort: UserSort, page: Int, pageSize: Int): UserConnection

  # Tenant Management
  tenant(tenantId: ID!): Tenant
  tenants(filter: TenantFilter, sort: TenantSort, page: Int, pageSize: Int): TenantConnection

  # Workflow Management
  workflow(workflowId: ID!): Workflow
  workflows(filter: WorkflowFilter, sort: WorkflowSort, page: Int, pageSize: Int): WorkflowConnection
  workflowInstance(instanceId: ID!): WorkflowInstance
  workflowInstances(filter: WorkflowInstanceFilter, sort: WorkflowInstanceSort, page: Int, pageSize: Int): WorkflowInstanceConnection

  # Task Management
  task(taskId: ID!): Task
  tasks(filter: TaskFilter, sort: TaskSort, page: Int, pageSize: Int): TaskConnection

  # Sales Management
  lead(leadId: ID!): Lead
  leads(filter: LeadFilter, sort: LeadSort, page: Int, pageSize: Int): LeadConnection
  commission(commissionId: ID!): Commission
  commissions(filter: CommissionFilter, sort: CommissionSort, page: Int, pageSize: Int): CommissionConnection

  # Customer Management
  customer(customerId: ID!): Customer
  customers(filter: CustomerFilter, sort: CustomerSort, page: Int, pageSize: Int): CustomerConnection

  # Notifications
  notifications(filter: NotificationFilter, sort: NotificationSort, page: Int, pageSize: Int): NotificationConnection

  # Analytics
  executiveDashboard(period: DashboardPeriod, compare: Boolean): ExecutiveDashboard
  departmentPerformance(departmentId: ID, period: DashboardPeriod): DepartmentPerformance
}
```

### 11.2 Mutation Types

```graphql
type Mutation {
  # Authentication
  login(input: LoginInput!): AuthPayload
  logout(input: LogoutInput!): AuthPayload
  refreshToken(input: RefreshTokenInput!): AuthPayload
  setupMFA(input: MFASetupInput!): MFAPayload
  verifyMFA(input: MFAVerifyInput!): MFAPayload

  # User Management
  createUser(input: CreateUserInput!): UserPayload
  updateUser(userId: ID!, input: UpdateUserInput!): UserPayload
  deleteUser(userId: ID!): UserPayload
  assignRole(userId: ID!, roleId: ID!, input: AssignRoleInput!): RolePayload
  removeRole(userId: ID!, roleId: ID!): RolePayload

  # Tenant Management
  createTenant(input: CreateTenantInput!): TenantPayload
  updateTenant(tenantId: ID!, input: UpdateTenantInput!): TenantPayload

  # Workflow Management
  createWorkflow(input: CreateWorkflowInput!): WorkflowPayload
  updateWorkflow(workflowId: ID!, input: UpdateWorkflowInput!): WorkflowPayload
  startWorkflowInstance(instanceId: ID!, input: StartWorkflowInput!): WorkflowInstancePayload
  transitionWorkflowInstance(instanceId: ID!, input: TransitionWorkflowInput!): WorkflowInstancePayload

  # Task Management
  createTask(input: CreateTaskInput!): TaskPayload
  updateTask(taskId: ID!, input: UpdateTaskInput!): TaskPayload
  completeTask(taskId: ID!, input: CompleteTaskInput!): TaskPayload

  # Sales Management
  createLead(input: CreateLeadInput!): LeadPayload
  updateLeadStage(leadId: ID!, input: UpdateLeadStageInput!): LeadPayload
  approveCommission(commissionId: ID!, input: ApproveCommissionInput!): CommissionPayload
  disputeCommission(commissionId: ID!, input: DisputeCommissionInput!): CommissionPayload

  # Customer Management
  createCustomer(input: CreateCustomerInput!): CustomerPayload
  updateCustomer(customerId: ID!, input: UpdateCustomerInput!): CustomerPayload

  # Notifications
  markNotificationRead(notificationId: ID!): NotificationPayload
  updateNotificationPreferences(input: UpdateNotificationPreferencesInput!): NotificationPayload
}
```

### 11.3 Type Definitions

```graphql
type User {
  userId: ID!
  tenantId: ID!
  userCode: String!
  email: String!
  firstName: String!
  lastName: String!
  displayName: String
  phone: String
  avatarUrl: String
  status: UserStatus!
  userType: UserType!
  mfaEnabled: Boolean!
  lastLoginAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Tenant {
  tenantId: ID!
  tenantCode: String!
  tenantName: String!
  tenantType: TenantType!
  status: TenantStatus!
  maxUsers: Int!
  maxDepartments: Int!
  maxStorageGb: Int!
  timezone: String!
  locale: String!
  logoUrl: String
  customDomain: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Workflow {
  workflowId: ID!
  workflowName: String!
  workflowVersion: String!
  tenantId: ID!
  category: String!
  description: String
  status: WorkflowStatus!
  trigger: WorkflowTrigger!
  variables: [WorkflowVariable!]
  states: [WorkflowState!]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Task {
  taskId: ID!
  tenantId: ID!
  taskCode: String!
  title: String!
  description: String
  status: TaskStatus!
  priority: TaskPriority!
  assigneeId: ID!
  assigneeName: String!
  departmentId: ID!
  departmentName: String!
  dueDate: DateTime
  startedAt: DateTime
  completedAt: DateTime
  evidenceRequired: Boolean!
  evidence: [TaskEvidence!]
  dependencies: [TaskDependency!]
  workflowInstanceId: ID
  workflowName: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Lead {
  leadId: ID!
  tenantId: ID!
  leadCode: String!
  customerId: ID
  customerName: String
  stage: String!
  ownerId: ID!
  ownerName: String!
  source: String!
  value: Float!
  currency: String!
  probability: Int!
  expectedCloseDate: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Commission {
  commissionId: ID!
  tenantId: ID!
  userId: ID!
  userName: String!
  taskId: ID!
  taskCode: String!
  taskTitle: String!
  dealId: ID!
  dealValue: Float!
  commissionRate: Float!
  commissionAmount: Float!
  currency: String!
  status: CommissionStatus!
  calculatedAt: DateTime!
  approvedAt: DateTime
  approvedBy: String
  paidAt: DateTime
  disputeRaisedAt: DateTime
  disputeReason: String
}

type Customer {
  customerId: ID!
  tenantId: ID!
  customerCode: String!
  name: String!
  type: CustomerType!
  status: CustomerStatus!
  paymentStatus: PaymentStatus!
  industry: String
  size: CustomerSize!
  address: Address
  contact: Contact
  totalRevenue: Float!
  currency: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Notification {
  notificationId: ID!
  tenantId: ID!
  userId: ID!
  type: NotificationType!
  title: String!
  message: String!
  priority: NotificationPriority!
  status: NotificationStatus!
  channels: [NotificationChannel!]
  data: JSON
  createdAt: DateTime!
  readAt: DateTime
}

type ExecutiveDashboard {
  revenue: DashboardMetric!
  pipeline: PipelineData!
  tasks: TasksData!
  alerts: AlertsData!
  departments: [DepartmentPerformance!]
}

type DepartmentPerformance {
  departmentId: ID!
  departmentName: String!
  metrics: DepartmentMetrics!
  team: [TeamMemberPerformance!]
}
```

### 11.4 Enum Definitions

```graphql
enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum UserType {
  INTERNAL
  EXTERNAL
  PARTNER
  FREELANCER
  CUSTOMER
}

enum TenantType {
  TRIAL
  STANDARD
  ENTERPRISE
}

enum TenantStatus {
  ACTIVE
  SUSPENDED
  TERMINATED
}

enum WorkflowStatus {
  ACTIVE
  INACTIVE
  DRAFT
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum CommissionStatus {
  PENDING
  APPROVED
  PAID
  DISPUTED
}

enum CustomerStatus {
  NEW
  ACTIVE
  INACTIVE
  CHURNED
}

enum PaymentStatus {
  PAID
  UNPAID
  PARTIALLY_PAID
  OVERDUE
}

enum NotificationType {
  TASK_ASSIGNED
  TASK_COMPLETED
  TASK_OVERDUE
  WORKFLOW_STARTED
  WORKFLOW_COMPLETED
  LEAD_CREATED
  LEAD_STAGE_CHANGED
  COMMISSION_CALCULATED
  COMMISSION_APPROVED
  COMMISSION_PAID
  ALERT_CRITICAL
  ALERT_HIGH
  ALERT_MEDIUM
  ALERT_LOW
}

enum NotificationPriority {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum NotificationStatus {
  UNREAD
  READ
  ARCHIVED
}

enum NotificationChannel {
  EMAIL
  SMS
  WHATSAPP
  IN_APP
}

enum DashboardPeriod {
  TODAY
  WEEK
  MONTH
  QUARTER
  YEAR
}

enum CustomerType {
  BUSINESS
  INDIVIDUAL
}

enum CustomerSize {
  SMALL
  MEDIUM
  LARGE
  ENTERPRISE
}
```

### 11.5 Input Types

```graphql
input LoginInput {
  email: String!
  password: String!
  mfaCode: String
  deviceId: String
}

input LogoutInput {
  refreshToken: String!
  deviceId: String
}

input RefreshTokenInput {
  refreshToken: String!
}

input MFASetupInput {
  mfaType: MFAType!
  deviceName: String
}

input MFAVerifyInput {
  mfaType: MFAType!
  code: String!
}

input CreateUserInput {
  userCode: String!
  email: String!
  password: String!
  firstName: String!
  lastName: String!
  displayName: String
  phone: String
  userType: UserType!
  roleIds: [ID!]
  departmentIds: [ID!]
}

input UpdateUserInput {
  firstName: String
  lastName: String
  displayName: String
  phone: String
  avatarUrl: String
}

input AssignRoleInput {
  isPrimary: Boolean
  expiresAt: DateTime
}

input CreateTenantInput {
  tenantCode: String!
  tenantName: String!
  tenantType: TenantType!
  subscriptionPlanId: ID!
  maxUsers: Int!
  maxDepartments: Int!
  maxStorageGb: Int!
  billingCycleStartDay: Int!
  timezone: String!
  locale: String!
  logoUrl: String
  customDomain: String
}

input UpdateTenantInput {
  tenantName: String
  timezone: String
  locale: String
  logoUrl: String
}

input CreateWorkflowInput {
  workflowName: String!
  category: String!
  description: String
  trigger: WorkflowTriggerInput!
  variables: [WorkflowVariableInput!]
  states: [WorkflowStateInput!]
}

input UpdateWorkflowInput {
  workflowName: String
  description: String
  states: [WorkflowStateInput!]
}

input StartWorkflowInput {
  variables: JSON
}

input TransitionWorkflowInput {
  toState: String!
  comment: String
}

input CreateTaskInput {
  taskCode: String!
  title: String!
  description: String
  priority: TaskPriority!
  assigneeId: ID!
  departmentId: ID!
  dueDate: DateTime
  evidenceRequired: Boolean!
  dependencies: [ID!]
  workflowInstanceId: ID
}

input UpdateTaskInput {
  title: String
  description: String
  status: TaskStatus
  priority: TaskPriority!
  assigneeId: ID!
  dueDate: DateTime
}

input CompleteTaskInput {
  evidence: [TaskEvidenceInput!]
  comment: String
}

input CreateLeadInput {
  leadCode: String!
  customerId: ID
  stage: String!
  ownerId: ID!
  source: String!
  value: Float!
  currency: String!
  probability: Int!
  expectedCloseDate: DateTime
}

input UpdateLeadStageInput {
  stage: String!
  comment: String
}

input ApproveCommissionInput {
  comment: String
}

input DisputeCommissionInput {
  reason: String!
  evidence: [TaskEvidenceInput!]
}

input CreateCustomerInput {
  customerCode: String!
  name: String!
  type: CustomerType!
  industry: String
  size: CustomerSize!
  address: AddressInput
  contact: ContactInput
}

input UpdateCustomerInput {
  name: String
  status: CustomerStatus!
  paymentStatus: PaymentStatus!
  contact: ContactInput
}

input UpdateNotificationPreferencesInput {
  emailEnabled: Boolean!
  whatsappEnabled: Boolean!
  smsEnabled: Boolean!
  inAppEnabled: Boolean!
  criticalOnly: Boolean!
  quietHours: QuietHoursInput
}

input UserFilter {
  status: UserStatus
  userType: UserType
  search: String
}

input UserSort {
  field: String!
  direction: SortDirection!
}

input TenantFilter {
  status: TenantStatus
  tenantType: TenantType
}

input TenantSort {
  field: String!
  direction: SortDirection!
}

input WorkflowFilter {
  status: WorkflowStatus
  category: String
}

input WorkflowSort {
  field: String!
  direction: SortDirection!
}

input WorkflowInstanceFilter {
  status: WorkflowInstanceStatus
}

input WorkflowInstanceSort {
  field: String!
  direction: SortDirection!
}

input TaskFilter {
  status: TaskStatus
  priority: TaskPriority
  assignee: ID
  departmentId: ID
}

input TaskSort {
  field: String!
  direction: SortDirection!
}

input LeadFilter {
  stage: String
  owner: ID
  source: String
}

input LeadSort {
  field: String!
  direction: SortDirection!
}

input CommissionFilter {
  status: CommissionStatus
  userId: ID
}

input CommissionSort {
  field: String!
  direction: SortDirection!
}

input CustomerFilter {
  status: CustomerStatus
  type: CustomerType
}

input CustomerSort {
  field: String!
  direction: SortDirection!
}

input NotificationFilter {
  status: NotificationStatus
  priority: NotificationPriority
}

input NotificationSort {
  field: String!
  direction: SortDirection!
}

enum SortDirection {
  ASC
  DESC
}

enum MFAType {
  TOTP
  SMS
}

input WorkflowTriggerInput {
  type: String!
  eventType: String
  conditions: [JSON!]
}

input WorkflowVariableInput {
  name: String!
  type: String!
  required: Boolean!
  defaultValue: String
}

input WorkflowStateInput {
  stateId: String!
  stateType: String!
  transitions: [WorkflowTransitionInput!]
}

input WorkflowTransitionInput {
  to: String!
  condition: JSON
}

input TaskEvidenceInput {
  type: String!
  url: String!
}

input AddressInput {
  street: String!
  city: String!
  state: String!
  country: String!
  postalCode: String!
}

input ContactInput {
  primaryContact: String!
  email: String!
  phone: String!
}

input QuietHoursInput {
  enabled: Boolean!
  start: String!
  end: String!
  timezone: String!
}
```

### 11.6 Payload Types

```graphql
type UserPayload {
  success: Boolean!
  user: User
  errors: [Error!]
}

type TenantPayload {
  success: Boolean!
  tenant: Tenant
  errors: [Error!]
}

type WorkflowPayload {
  success: Boolean!
  workflow: Workflow
  errors: [Error!]
}

type WorkflowInstancePayload {
  success: Boolean!
  instance: WorkflowInstance
  errors: [Error!]
}

type TaskPayload {
  success: Boolean!
  task: Task
  errors: [Error!]
}

type LeadPayload {
  success: Boolean!
  lead: Lead
  errors: [Error!]
}

type CommissionPayload {
  success: Boolean!
  commission: Commission
  errors: [Error!]
}

type CustomerPayload {
  success: Boolean!
  customer: Customer
  errors: [Error!]
}

type NotificationPayload {
  success: Boolean!
  notification: Notification
  errors: [Error!]
}

type AuthPayload {
  success: Boolean!
  accessToken: String
  refreshToken: String
  expiresIn: Int
  user: User
  errors: [Error!]
}

type MFAPayload {
  success: Boolean!
  secret: String
  qrCode: String
  backupCodes: [String!]
  errors: [Error!]
}

type RolePayload {
  success: Boolean!
  role: Role
  errors: [Error!]
}

type Error {
  code: String!
  message: String!
  field: String
  details: JSON
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
}

type UserEdge {
  node: User!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### 11.7 Subscription Types

```graphql
type Subscription {
  # Task notifications
  taskAssigned(userId: ID!): Task!
  taskUpdated(taskId: ID!): Task!
  taskCompleted(taskId: ID!): Task!

  # Lead notifications
  leadCreated(tenantId: ID!): Lead!
  leadStageChanged(leadId: ID!): Lead!

  # Commission notifications
  commissionCalculated(userId: ID!): Commission!
  commissionApproved(commissionId: ID!): Commission!

  # Workflow notifications
  workflowStarted(tenantId: ID!): WorkflowInstance!
  workflowCompleted(instanceId: ID!): WorkflowInstance!

  # Customer notifications
  customerCreated(tenantId: ID!): Customer!
  customerUpdated(customerId: ID!): Customer!

  # Notification subscriptions
  notificationAdded(userId: ID!): Notification!
}
```
