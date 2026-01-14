# Bassan.os API Contract Template

## Endpoint

`[METHOD] /v1/[resource]`

## Summary

[Brief description of what this endpoint does.]

## Review Status

- [ ] Draft
- [ ] Review
- [ ] Approved
- [ ] Deprecated

## Request

### Headers

| Name          | Type   | Required | Description      |
| :------------ | :----- | :------- | :--------------- |
| Authorization | string | Yes      | Bearer token     |
| Content-Type  | string | Yes      | application/json |

### Parameters

| Name   | Type   | In    | Required | Description                |
| :----- | :----- | :---- | :------- | :------------------------- |
| id     | string | path  | Yes      | Resource ID                |
| limit  | number | query | No       | Pagination limit (max 100) |
| offset | number | query | No       | Pagination offset          |

### Body

```json
{
  "field1": "string",
  "field2": 123,
  "field3": true
}
```

### Validation Rules

- `field1`: required, generic string, min 3 chars
- `field2`: optional, integer, min 0
- `field3`: optional, boolean

## Response

### Success (200 OK)

```json
{
  "data": {
    "id": "uuid",
    "field1": "string",
    "field2": 123,
    "createdAt": "2026-01-08T12:00:00Z"
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Errors

#### 400 Bad Request

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "field1",
        "message": "Must be at least 3 characters"
      }
    ]
  }
}
```

#### 401 Unauthorized

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing token"
  }
}
```

#### 403 Forbidden

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

#### 404 Not Found

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

## Security

- **Authentication**: JWT Bearer Token required
- **Authorization**: Requires `[resource]:read` permission
- **Rate Limit**: 100 requests per minute

## Notes

[Any implementation details, edge cases, or performance considerations.]
