# Log Format Standard

## Bassan.os Phase 1

All logs MUST follow this format for consistency and auditability.

## Log Levels

| Level   | Usage                                           |
| ------- | ----------------------------------------------- |
| `error` | System failures, security violations            |
| `warn`  | Security attempts blocked, deprecated usage     |
| `log`   | Important operational events                    |
| `debug` | Query details, tenant context, development info |

## Format

```
[CATEGORY] STATUS | Context
Details...
```

## Examples

### Security Logs

```
🚨 SECURITY: Attempted $queryRaw - BLOCKED
[SECURITY] Blocked organizationId injection attempt: x -> y
```

### Query Logs

```
[QUERY] User.findMany | OrgId: abc-123 | UserId: user-456
[FILTER] Added organizationId to WHERE: abc-123
[RESULT] User.findMany returned 5 records
```

### Database Logs

```
[SQL] ✅ FILTERED | 45ms
Query: SELECT * FROM users WHERE...
```

```
[SQL] ⚠️ UNFILTERED | 12ms
Query: SELECT * FROM organizations WHERE...
```

### System Logs

```
🔌 Connecting to database...
✅ Database connected
🛡️ Tenant isolation extension activated
```

## Required Context

Every tenant-scoped log MUST include:

- `OrgId`: Current tenant ID or "NONE"
- `UserId`: Current user ID or "NONE"

## Security Events (Always Log)

1. Failed authentication attempts
2. Tenant isolation violations
3. Raw SQL attempts
4. Permission denials
5. Cross-tenant access attempts
