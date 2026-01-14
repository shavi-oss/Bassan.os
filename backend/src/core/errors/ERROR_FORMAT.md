# Error Response Format

## Bassan.os Phase 1 Standard

All API errors MUST follow this format.

## Structure

```typescript
interface ErrorResponse {
  statusCode: number; // HTTP status code
  error: string; // Error type (e.g., "Bad Request", "Unauthorized")
  message: string; // Human-readable message
  code?: string; // Application error code (e.g., "TENANT_ISOLATION_VIOLATION")
  timestamp: string; // ISO 8601 timestamp
  path: string; // Request path
}
```

## Example

```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "TENANT_ISOLATION_VIOLATION: No tenant context for User.findMany",
  "code": "TENANT_ISOLATION_VIOLATION",
  "timestamp": "2026-01-12T09:30:00.000Z",
  "path": "/api/v1/users"
}
```

## Error Codes (Phase 1)

| Code                         | Meaning                                  |
| ---------------------------- | ---------------------------------------- |
| `TENANT_ISOLATION_VIOLATION` | Query attempted without tenant context   |
| `SECURITY_VIOLATION`         | Raw SQL or forbidden operation attempted |
| `AUTHENTICATION_REQUIRED`    | No valid token provided                  |
| `AUTHORIZATION_FAILED`       | User lacks required permission           |
| `VALIDATION_ERROR`           | Input validation failed                  |
| `NOT_FOUND`                  | Entity not found (within tenant scope)   |
