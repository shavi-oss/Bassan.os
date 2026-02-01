# SPEC DRIFT NOTICE

**Date:** 2026-01-31  
**Contract Version:** v1 (Minimal Lock)

---

## Purpose

This notice documents the **explicit exclusion** of OpenAPI/Postman specs from Core Contract v1.

---

## Ruling

**Source of Truth:** Controllers + DTOs + Guards in `backend/src`  
**NOT Source of Truth:** OpenAPI specs, Postman collections, Generated docs

---

## Spec Drift Policy

### If Spec Disagrees with Source

**Rule:** Source code ALWAYS wins.

**Examples:**

- Spec shows endpoint `/api/v1/templates/publish` but NO controller exists → **NOT PART OF CONTRACT**
- Spec shows correlation ID header but NO middleware exists → **NOT PART OF CONTRACT**
- Spec shows refresh token endpoint but NO controller exists → **NOT PART OF CONTRACT**
- Spec shows register endpoint but NO controller route exists → **NOT PART OF CONTRACT** (DTO exists but no implementation)

### Spec Maintenance (Optional)

Specs MAY be updated to match source, but:

- Specs are NOT binding
- Specs are NOT authoritative
- Specs are NOT required for contract lock

---

## Verification

To verify contract, ALWAYS inspect source code:

```bash
# List all controllers
rg -n "@Controller\(" backend/src

# List all DTOs
find backend/src -name "*.dto.ts"

# Check global prefix
rg -n "setGlobalPrefix\(" backend/src

# Search for specific endpoint
rg -n "@Post\(\"login\"\)" backend/src
```

**DO NOT** rely on:

- `Generated/openapi.yaml`
- Postman collections
- Auto-generated docs
- Swagger UI

---

## Known Spec Drift Items

The following items MAY appear in specs but are **NOT IMPLEMENTED** in source:

❌ **Template Publish Endpoints** — No controller found  
❌ **Correlation ID Headers** — No middleware/interceptor found  
❌ **Refresh Token Endpoint** — No controller route found  
❌ **Logout Endpoint** — No controller route found  
❌ **Register Endpoint** — DTO exists but no controller route found

---

## Consumer Guidance

### For Suite/Layer Developers

**DO:**

- ✅ Reference [CORE_CONTRACT_V1_EXTRACT.md](./CORE_CONTRACT_V1_EXTRACT.md) for authoritative endpoint list
- ✅ Reference [CORE_CONTRACT_EVIDENCE_TABLE.md](./CORE_CONTRACT_EVIDENCE_TABLE.md) for source file paths
- ✅ Verify endpoints exist in source code before depending on them

**DO NOT:**

- ❌ Assume an endpoint exists because it's in OpenAPI/Postman
- ❌ Depend on endpoints not listed in CORE_CONTRACT_V1_EXTRACT.md
- ❌ Use correlation ID headers (not supported)
- ❌ Use template publish endpoints (not implemented)
- ❌ Use refresh/logout endpoints (not implemented)

### For Core Developers

**DO:**

- ✅ Update specs to match source (optional)
- ✅ Remove spec drift items from specs (optional)
- ✅ Add new endpoints to controllers first, then update specs

**DO NOT:**

- ❌ Add endpoints to specs without controller implementation
- ❌ Treat specs as authoritative
- ❌ Break contract without new major version

---

## Enforcement

**Contract Lock Enforcement:** All PRs touching controllers/DTOs/guards MUST be reviewed against [CORE_CONTRACT_V1_LOCK_DECLARATION.md](./CORE_CONTRACT_V1_LOCK_DECLARATION.md).

**Spec Updates:** Optional and non-blocking. Spec drift does not block releases.

---

**END OF SPEC DRIFT NOTICE**
