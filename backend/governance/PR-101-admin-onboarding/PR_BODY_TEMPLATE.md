# PR Body Template — PR-101 JWKS + RS256 S2S Smoke Test

## Title

`feat(admin): JWKS RS256 S2S authentication — smoke test evidence`

## Summary

This PR documents the RS256 S2S token pipeline for the Bassan admin module using a Railway-hosted
JWKS endpoint. The JWKS server is live and serving the correct public key. The Core admin route
requires deployment before the end-to-end smoke test can fully pass.

## JWKS Endpoint (Live)

```
https://practical-amazement-production.up.railway.app/.well-known/jwks.json
```

- `kid: admin-key-1`
- `alg: RS256`
- `use: sig`

## Smoke Test Result

| Check                                 | Result                     |
| ------------------------------------- | -------------------------- |
| Railway JWKS endpoint                 | ✅ HTTP 200                |
| RS256 token signing                   | ✅ Signed locally, len 531 |
| Core POST /api/v2/admin/organizations | ⚠️ HTTP 404 — Not deployed |

## Actions Required Before Full Smoke Pass

### 1. Set Railway Environment Variable

In Railway dashboard → Core service → Variables:

```
ADMIN_JWKS_URL=https://practical-amazement-production.up.railway.app/.well-known/jwks.json
```

### 2. Deploy PR-101 Changes to Railway Core

Merge commit `2dcfaf4` (AdminModule registration in AppModule) and trigger Railway deploy.
After deploy, verify logs show:

```
AdminModule dependencies initialized
AdminJwtStrategy initialized
Mapped {/api/v2/admin/organizations, POST}
```

### 3. Re-run Smoke Test

```bash
# Re-sign token (5-min expiry)
node backend/tools/jwks/sign-rs256.js > backend/tools/jwks/signed-token.txt

# POST to Core
$token = Get-Content backend/tools/jwks/signed-token.txt
Invoke-RestMethod -Uri https://glorious-harmony-production-34b8.up.railway.app/api/v2/admin/organizations `
  -Method POST `
  -Headers @{ Authorization="Bearer $token"; "X-Correlation-Id"="smoke-002" } `
  -Body '{"name":"SmokeOrg2","adminEmail":"smoke2@test.com","adminPassword":"Pass123!","adminFirstName":"Smoke","adminLastName":"Test"}' `
  -ContentType application/json
```

Expected success response: HTTP 201 with `{ id, name, adminEmail }`.

## Security Notes

- `admin-private.pem` is LOCAL ONLY — never committed or pushed
- Token expiry: 5 minutes (`exp: now + 300s`)
- JWKS public key only is committed/deployed

## Governance Evidence

`backend/src/modules/organizations/governance/pr/PR-101-admin-onboarding/`

- `PR_101_PLAN.md` — scope and task list
- `PR_101_EXECUTION_REPORT.md` — all commands and STEP_COMPLETED entries
- `PR_101_VERIFICATION_EVIDENCE.md` — raw outputs and safety audit
