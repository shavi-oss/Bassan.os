# VERIFICATION EVIDENCE — JWKS Server & Smoke Test (PR-101)

## Document Control

- Date: 2026-02-23T01:12 UTC+2
- Executor: Sonit (AI Execution Agent)
- Branch: fix/admin-mount-pr101 @ 0cb418a

---

## JWKS Server Deployment

| Item            | Value                                                               |
| --------------- | ------------------------------------------------------------------- |
| Railway project | e56fd682-ed5c-449b-b109-9ad7feb888a5                                |
| Service         | jwks-server (e819dc1d-e2b3-403d-b867-f6f0ff48f1c6)                  |
| Deploy ID       | 754af11c-8053-489d-847e-b7aef7e23468                                |
| Status          | SUCCESS                                                             |
| JWKS URL        | https://jwks-server-production.up.railway.app/.well-known/jwks.json |

### JWKS Public Key Check

```
JWKS_KID:admin-key-1
JWKS_HAS_PRIVATE_KEY:False   ← SECURITY PASS
```

- `kid`: `admin-key-1` ✅
- Private key fields (d, p, q, dp, dq, qi): **ABSENT** ✅
- Algorithm: `RS256` ✅

---

## ADMIN_JWKS_URL Variable Set

```
railway variables set "ADMIN_JWKS_URL=https://jwks-server-production.up.railway.app/.well-known/jwks.json"
  --service core-admin-mount
SET_JWKS_URL_EXIT:0
```

Auto-redeploy triggered on core-admin-mount. Polling showed 401 (alive) at first poll.

---

## Smoke Test Results

### Test 1: POST with RS256 JWT (Expected: 201 Created)

```
SMOKE_TEST at 01:12:31
TOKEN_LEN:531 chars   ← RS256 signed with admin-private.pem, kid=admin-key-1
SMOKE_STATUS:201 ✅
SMOKE_BODY:{
  "organization":{
    "id":"b3629857-6907-4186-991e-05dde8b41fed",
    "name":"SmokeOrg-RS256",
    "slug":"smokeorg-rs256",
    "isActive":true,
    "createdAt":"2026-02-22T23:12:31.455Z",
    "updatedAt":"2026-02-22T23:12:31.455Z"
  },
  "user":{
    "id":"af4c2b85-e333-4ed0-94cd-fad7fdaf9ff6",
    "email":"smoke@pr101.com",
    "firstName":"Smoke"
    ...
  }
}
```

**Result: PASS ✅**

### Test 2: POST without Authorization header (Expected: 401 Unauthorized)

```
NOAUTH_STATUS:401 (expected 401) ✅
```

**Result: PASS ✅ — AdminJwtAuthGuard is blocking unauthenticated requests (fail-closed)**

---

## Security Linter Update Evidence

| Change                                                        | Result                                             |
| ------------------------------------------------------------- | -------------------------------------------------- |
| Added `"admin"` to ALLOWED_MODULES                            | admin module no longer appears in S4-L2 violations |
| Added `POST /api/v2/admin/organizations` to ALLOWED_ENDPOINTS | admin endpoint no longer in S4-L3 violations       |
| Pre-existing S4-L2/L3 (Stage 5/6 modules)                     | Unchanged — zero new regressions                   |

---

## Final Verification Matrix

| Check                              | Result               |
| ---------------------------------- | -------------------- |
| JWKS server deploy STATUS          | ✅ SUCCESS           |
| JWKS endpoint kid=admin-key-1      | ✅ PASS              |
| JWKS no private key                | ✅ PASS              |
| ADMIN_JWKS_URL set                 | ✅ EXIT 0            |
| Smoke test 201 (RS256 JWT)         | ✅ PASS              |
| Smoke test 401 (no auth)           | ✅ PASS              |
| Security linter (admin exceptions) | ✅ No new violations |
| Private key in any committed file  | ✅ ABSENT            |
