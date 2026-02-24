# PR_CORE_SUITE_INTEGRATION_PLAN

## Core ↔ Suite Admin S2S Integration

---

## Document Control

| Attribute           | Value                                                          |
| ------------------- | -------------------------------------------------------------- |
| Date                | 2026-02-23                                                     |
| Executor            | Sonit (AI Execution Agent)                                     |
| Branch (core)       | `fix/admin-mount-pr101` (HEAD: `0a1020c`)                      |
| Branch (jwks)       | `fix/jwks-server-sandbox` (unified; was also `pr/PR-101-jwks`) |
| Branch (suite)      | TBD — `gate/admin-dashboard` (new)                             |
| Base commit         | `0a1020c` (fix/admin-mount-pr101 HEAD as of 2026-02-22)        |
| Admin module commit | `2c6d3d5` (APPROVE_READY — tsc/lint/jest PASS)                 |
| Authority           | ARCHITECTURAL_LAWS.md → EXECUTION_AUTHORITY.md → Stage locks   |
| Status              | **DRAFT — awaiting human approval before any code changes**    |

---

## Objective

Connect the suite-shavi admin interface to the Bassan.os core via secure S2S APIs by:

1. **Resolving the 401 smoke-test failure** — ADMIN_JWKS_URL not set in Railway sandbox, causing JWT signature mismatch between local signer and deployed container.
2. **Unifying the JWKS server** — two branches exist (`fix/jwks-server-sandbox`, `pr/PR-101-jwks`); merge into a single deployable JWKS Express server at `backend/tools/jwks-server/`.
3. **Refreshing the expired RAILWAY_TOKEN** — required for future `railway up` deployments.
4. **Fixing CRLF line endings** — already committed on `fix/workflow-instance-terminal-start` (SHA `39604fe`); needs verification only.
5. **Documenting pre-existing S4-L2/L3 security-linter failures** — no new regressions; these are Stage 5/6 modules introduced before this PR.
6. **Building the suite-shavi admin dashboard UI** — React components using existing design system to call `/api/v2/admin/organizations` via the JWKS-signed S2S token.

---

## Background

### Known State (from research)

| Item                         | Status                                                            |
| ---------------------------- | ----------------------------------------------------------------- |
| Admin module (core)          | ✅ COMMITTED — `2c6d3d5`, APPROVE_READY                           |
| tsc / lint / jest            | ✅ ALL PASS (18/18 suites, 15/15 admin tests)                     |
| S4-L2 / S4-L3 linter         | ⚠️ PRE-EXISTING failures (Stage 5/6 modules, not this PR)         |
| Railway deploy               | ✅ LIVE — `#02fdd59b` SUCCESS at 2026-02-22T18:21                 |
| Smoke test (POST admin/orgs) | ❌ 401 — ADMIN_JWKS_URL not set; HS256 secret mismatch            |
| JWKS keys (local)            | ✅ `admin-private.pem`, `admin-public.pem`, `admin-key-1`         |
| JWKS server (Express)        | ❌ NOT DEPLOYED — tools exist locally, not a Railway service      |
| RAILWAY_TOKEN                | ❌ EXPIRED — must be refreshed by human                           |
| CRLF linter errors           | ✅ ALREADY FIXED — `fix/workflow-instance-terminal-start@39604fe` |
| suite-shavi admin dashboard  | ❌ NOT STARTED                                                    |

### Why 401 Persists

`admin-jwt.strategy.ts` resolves keys in this order:

1. `ADMIN_JWKS_URL` (RS256 via JWKS) — **preferred**
2. `ADMIN_JWT_PUBLIC_KEY` (RS256 PEM)
3. `ADMIN_JWT_SECRET` (HS256 fallback)

The Railway sandbox service has `ADMIN_JWT_SECRET` set (via CLI), but the local `.env` value differs from the value injected into the live container. Since the strategy uses `ADMIN_JWKS_URL` if set, or requires the secrets to match exactly for HS256, the cleanest resolution is to deploy the JWKS server, set `ADMIN_JWKS_URL` in the Railway sandbox, and sign tokens with the private key via `sign-rs256.js`.

---

## Governance Constraints

### Authority Hierarchy (from EXECUTION_AUTHORITY.md)

```
EXECUTION_AUTHORITY.md
  → ARCHITECTURAL_LAWS.md
    → Stage lock declarations (STAGE_*_FINAL_LOCK_DECLARATION.md)
      → Stage-specific plans
```

### Immutable Code Zones (LAW I-02)

The following paths are **READ-ONLY post Stage 1**:

```
src/core/**
src/shared/**
src/modules/auth/**
src/modules/organizations/**
src/modules/users/**
```

**Exception**: `prisma/schema.prisma` — additive models only, no modifications to existing Stage 0–2 models.

### Security Laws

- **SEC-01**: Every protected v1 endpoint MUST use `@UseGuards(JwtAuthGuard, TenantGuard)` — unchanged.
- **SEC-02**: `organizationId` MUST NOT be accepted from client input — already enforced in admin controller.
- **Admin exception**: `POST /api/v2/admin/organizations` uses `AdminJwtAuthGuard` (not TenantGuard) — already documented in `SECURITY_LINTER_PATCH.md` and implemented.

---

## Scope Lock

### Core Backend — ALLOWED files

| File                                            | Action                    |
| ----------------------------------------------- | ------------------------- |
| `backend/tools/jwks-server/index.js`            | NEW                       |
| `backend/tools/jwks-server/package.json`        | NEW                       |
| `backend/tools/jwks-server/Dockerfile`          | NEW                       |
| `backend/tools/jwks-server/jwks.json`           | NEW (public only)         |
| `backend/tools/jwks/make-jwks.js`               | EXISTS (no change needed) |
| `backend/governance/PR-101-admin-onboarding/**` | DOCS UPDATE               |
| `backend/.env.example`                          | UPDATE (add new vars)     |

### Core Backend — FORBIDDEN

```
backend/src/modules/organizations/**
backend/src/modules/auth/**
backend/src/shared/guards/tenant.guard.ts
backend/src/modules/auth/strategies/jwt.strategy.ts
backend/prisma/schema.prisma
backend/package.json  (S2-L6: Dependency Freeze)
backend/tests/security/security-linter.spec.ts  (no new changes needed)
```

> **Note on security-linter**: The admin exception is already implemented (`2c6d3d5`). S4-L2/L3 failures are pre-existing and documented. No further changes required.

### Suite (suite-shavi) — ALLOWED files

| File                                                                      | Action                   |
| ------------------------------------------------------------------------- | ------------------------ |
| `modules/platform-admin/client/src/pages/AdminDashboard.tsx`              | NEW                      |
| `modules/platform-admin/client/src/components/OrganizationList.tsx`       | NEW                      |
| `modules/platform-admin/client/src/components/CreateOrganizationForm.tsx` | NEW                      |
| `modules/platform-admin/client/src/api/adminApi.ts`                       | NEW                      |
| `modules/platform-admin/client/src/App.tsx`                               | MODIFY (add admin route) |
| `modules/platform-admin/governance/**`                                    | NEW DOCS                 |

### Suite — FORBIDDEN

```
modules/platform-admin/src/**       (BFF — immutable)
package.json                        (no new dependencies without approval)
any /api/v1 calls
localStorage usage
organizationId from client input
```

---

## Tasks (Ordered)

### Task 1 — Refresh RAILWAY_TOKEN (**Human Action Required**)

> [!IMPORTANT]
> This step requires a human to perform; Sonit cannot generate a new Railway token.

**Steps**:

1. Run `railway login` (opens browser) OR navigate to Railway dashboard → Account Settings → Tokens.
2. Create a new token named `basaan-pr101-sandbox`.
3. Set locally: `$env:RAILWAY_TOKEN = "<new-token>"` (PowerShell).
4. Update `backend/.env` (not committed): add `RAILWAY_TOKEN=<new-token>`.
5. Update Railway sandbox service env: `railway variables set RAILWAY_TOKEN=<new-token> --service core-admin-mount`.

**Verify**: `railway whoami` returns authenticated state.

---

### Task 2 — Unify JWKS Server into `backend/tools/jwks-server/`

**Branch**: `fix/jwks-server-sandbox` (create from current HEAD on `fix/admin-mount-pr101`)

**Sub-tasks**:

#### 2a. Create JWKS Express server

File: `backend/tools/jwks-server/index.js`

```js
// Minimal JWKS server — serves public JWKS only
// Private key stored in Railway secret ADMIN_PRIVATE_PEM
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3001;
const jwks = JSON.parse(
  fs.readFileSync(path.join(__dirname, "jwks.json"), "utf8"),
);

http
  .createServer((req, res) => {
    if (req.url === "/.well-known/jwks.json" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(jwks));
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
  })
  .listen(PORT, () => console.log(`JWKS server listening on ${PORT}`));
```

#### 2b. Generate fresh `jwks.json` (public only)

Using existing `admin-public.pem` and `make-jwks.js`:

```bash
cd backend/tools/jwks && node make-jwks.js
# Outputs jwks.json with keys[]: [{kty, n, e, use, kid, alg}]
```

Copy `jwks.json` to `backend/tools/jwks-server/jwks.json`.

**Security check**: Verify `jwks.json` contains ONLY `kty, n, e, use, kid, alg` — no `d, p, q, dp, dq, qi` (private exponents). Any private key fields in the JSON = **ABORT**.

#### 2c. Dockerfile for Railway

File: `backend/tools/jwks-server/Dockerfile`

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["node", "index.js"]
```

#### 2d. package.json (no new dependencies)

File: `backend/tools/jwks-server/package.json`

```json
{
  "name": "jwks-server",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {}
}
```

No npm packages needed — uses Node built-in `http`, `fs`, `path`.

#### 2e. Verify private key NOT committed

```bash
git diff --cached --name-only | grep -v "admin-private.pem"  # must not appear
```

The private key must remain in Railway secret `ADMIN_JWKS_PRIVATE_PEM` only.

---

### Task 3 — Deploy JWKS Server to Railway Sandbox

**Pre-condition**: RAILWAY_TOKEN refreshed (Task 1).

**Steps**:

1. Commit `backend/tools/jwks-server/**` on branch `fix/jwks-server-sandbox`.
2. `railway service jwks-server` (link to sandbox project `e56fd682`).
3. `railway up --service jwks-server --detach`.
4. Poll until `STATUS:SUCCESS`.
5. Verify: `curl https://<jwks-url>/.well-known/jwks.json | jq '.keys[0].kid'` → `"admin-key-1"`.
6. Verify: `curl https://<jwks-url>/.well-known/jwks.json | jq '.keys[0].d'` → `null` (no private key).

---

### Task 4 — Set ADMIN_JWKS_URL on Core Sandbox Service

**After**: JWKS server is live and URL is known (e.g., `https://jwks-server-production.up.railway.app`).

```bash
railway variables set ADMIN_JWKS_URL=https://<jwks-url>/.well-known/jwks.json \
  --service core-admin-mount
```

This triggers an auto-redeploy. Wait for `STATUS:SUCCESS` on the new deploy.

**Also clear**: Remove `ADMIN_JWT_SECRET` from Railway sandbox (or leave as fallback — but JWKS_URL takes precedence per strategy logic). Clearing is cleaner.

---

### Task 5 — Run Smoke Test (201 Expected)

**Pre-condition**: core-admin-mount redeploy SUCCESS with ADMIN_JWKS_URL set.

```bash
# 1. Generate RS256 token (sign with private key)
cd backend/tools/jwks && node sign-rs256.js > signed-token.txt

# 2. Smoke test
$token = Get-Content signed-token.txt
$body = '{"name":"SmokeOrg","adminEmail":"smoke@test.com","adminPassword":"Pass123!","adminFirstName":"Smoke","adminLastName":"Test"}'
Invoke-WebRequest -Uri "https://core-admin-mount-production.up.railway.app/api/v2/admin/organizations" `
  -Method POST -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
  -Body $body
# Expected: HTTP 201
```

**On 401**: Check Railway runtime logs for `[AdminJwtStrategy]` entries. The JWKS URL must be reachable from the Railway container. Verify JWKS health by hitting the URL from a curl command inside Railway: `railway run --service core-admin-mount curl <jwks-url>/.well-known/jwks.json`.

---

### Task 6 — Verify CRLF Fix (Already Done)

Branch `fix/workflow-instance-terminal-start` already fixed (commit `39604fe`).

**Verification only**:

```bash
git show 39604fe --stat
file backend/tests/workflow-instance.spec.ts  # should report CRLF or LF
```

No action required unless the file has reverted.

---

### Task 7 — Document S4-L2/L3 Pre-existing Baseline

Create `backend/governance/PR-101-admin-onboarding/SECURITY_LINTER_BASELINE.md`:

| Linter Rule | Failing modules/endpoints                                                    | First introduced | PR-101 regression? |
| ----------- | ---------------------------------------------------------------------------- | ---------------- | ------------------ |
| S4-L2       | executor, scheduler, cron-validation, deferred-execution, scheduled-triggers | Stage 5/6        | ❌ NO              |
| S4-L3       | Endpoints in Stage 5/6 modules                                               | Stage 5/6        | ❌ NO              |

**Evidence**: run `npx jest backend/tests/security/security-linter.spec.ts` on master HEAD before PR-101 merge and on current branch — diff must show zero new failures.

---

### Task 8 — Update Security Linter: Add `/api/v2/admin/organizations` to Endpoint Allowlist

The endpoint `POST /api/v2/admin/organizations` is currently NOT in `ALLOWED_ENDPOINTS` in `security-linter.spec.ts`. **This is a required change** to prevent the linter from failing for a new reason after merge.

**Allowed change** (per `SECURITY_LINTER_PATCH.md`):

```typescript
// In ALLOWED_ENDPOINTS array — add:
{ method: "POST", path: "/api/v2/admin/organizations" },
```

And add `"admin"` to `ALLOWED_MODULES`:

```typescript
const ALLOWED_MODULES = [
  "auth",
  "organizations",
  "users",
  "roles",
  "workflows",
  "admin", // PR-101: admin-safe onboarding endpoint
];
```

**Governance**: Document change in `SECURITY_LINTER_PATCH.md` (existing file).

---

### Task 9 — suite-shavi Admin Dashboard UI

> [!IMPORTANT]
> This task modifies suite-shavi UI only. No BFF changes. No new npm packages without approval.

**Branch**: `gate/admin-dashboard` (create from suite-shavi master HEAD)

**Components to create**:

#### 9a. `adminApi.ts` — S2S fetch wrapper

```typescript
// modules/platform-admin/client/src/api/adminApi.ts
const BASE = import.meta.env.VITE_CORE_API_URL ?? "";
const getToken = () => import.meta.env.VITE_ADMIN_JWT ?? "";

export async function createOrganization(dto: CreateOrgDto) {
  const res = await fetch(`${BASE}/api/v2/admin/organizations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}
```

> [!WARNING]
> `VITE_ADMIN_JWT` is a **short-lived token** for the UI — it must be rotated via the JWKS server. This is acceptable for sandbox testing but must NOT be used in production. Production flow requires the suite BFF to sign tokens server-side.

#### 9b. `CreateOrganizationForm.tsx` — form component

Using existing shadcn/ui components (Button, Input, Form — already installed). No new dependencies.

- Fields: `name`, `adminEmail`, `adminPassword`, `adminFirstName`, `adminLastName`.
- On submit: calls `adminApi.createOrganization(dto)`.
- On success: shows confirmation. On error: shows error message (fail-closed UI).

#### 9c. `OrganizationList.tsx` — placeholder (GET not implemented yet)

A read-only placeholder showing "Organization management active. POST endpoint available."

#### 9d. `AdminDashboard.tsx` — page wrapper

- Guard: renders only if `VITE_ADMIN_JWT` env var is present; otherwise shows "Admin access not configured."
- Renders `<CreateOrganizationForm />` and `<OrganizationList />`.

#### 9e. Add route to `App.tsx`

```typescript
// Add to router
<Route path="/admin" element={<AdminDashboard />} />
```

**Environment variables** (not committed; must be set in Railway/Vite env):

```
VITE_CORE_API_URL=https://core-admin-mount-production.up.railway.app
VITE_ADMIN_JWT=<short-lived RS256 token signed by admin-private.pem>
```

---

### Task 10 — Update `.env.example`

Add to `backend/.env.example`:

```env
# Admin S2S JWT configuration (choose one):
ADMIN_JWKS_URL=              # Preferred: RS256 via JWKS endpoint
ADMIN_JWT_PUBLIC_KEY=        # Alternative: RS256 PEM public key
ADMIN_JWT_SECRET=            # Fallback: HS256 shared secret (sandbox only)
```

---

### Task 11 — Governance Artifacts

Create/update:

| File                                                                           | Action                |
| ------------------------------------------------------------------------------ | --------------------- |
| `backend/governance/PR-101-admin-onboarding/PR_CORE_SUITE_INTEGRATION_PLAN.md` | THIS FILE             |
| `backend/governance/PR-101-admin-onboarding/SECURITY_LINTER_BASELINE.md`       | NEW                   |
| `backend/governance/PR-101-admin-onboarding/PR_CORE_SUITE_EXECUTION_REPORT.md` | NEW (after execution) |
| `backend/governance/PR-101-admin-onboarding/VERIFICATION_jwks-server.md`       | NEW (after execution) |
| `backend/governance/PR-101-admin-onboarding/VERIFICATION_smoke-test.md`        | NEW (after execution) |
| `modules/platform-admin/governance/gate_admin_dashboard/PLAN.md`               | NEW (suite gate docs) |

---

## Verification Matrix

| Check                                | Command / Method                                                  | Expected                          |
| ------------------------------------ | ----------------------------------------------------------------- | --------------------------------- |
| Core: tsc                            | `npx tsc --noEmit`                                                | Exit 0                            |
| Core: lint                           | `npm run lint`                                                    | Exit 0                            |
| Core: jest (all)                     | `npx jest`                                                        | 18/18 suites PASS                 |
| Core: security-linter                | `npx jest tests/security/security-linter.spec.ts`                 | 0 new failures vs baseline        |
| JWKS health                          | `curl <jwks-url>/.well-known/jwks.json`                           | `kid: "admin-key-1"`, no `d`      |
| JWKS private key leak check          | `jq '.keys[0].d' jwks.json`                                       | `null`                            |
| Smoke test (admin/orgs)              | `POST /api/v2/admin/organizations` with RS256 JWT                 | HTTP 201                          |
| Smoke test (no auth)                 | `POST /api/v2/admin/organizations` without token                  | HTTP 401                          |
| Suite: build                         | `npm run build` in suite-shavi                                    | Exit 0                            |
| Suite: lint                          | `npm run lint` in suite-shavi                                     | Exit 0                            |
| Suite: no /api/v1 calls              | `grep -r "/api/v1" modules/platform-admin/client/src/`            | 0 matches                         |
| Suite: no localStorage               | `grep -r "localStorage" modules/platform-admin/client/src/`       | 0 matches                         |
| Suite: no organizationId from client | `grep -r "organizationId" modules/platform-admin/client/src/api/` | 0 matches                         |
| CRLF fix verified                    | `git show 39604fe --stat`                                         | workflow-instance.spec.ts in diff |

---

## Stop Conditions (ABORT IMMEDIATELY)

| Condition                                                                  | Action         |
| -------------------------------------------------------------------------- | -------------- |
| `git diff --name-only` shows files outside Allowed list                    | ABORT          |
| `npx tsc --noEmit` fails due to immutable zone change                      | ABORT          |
| `jwks.json` contains any private key field (`d`, `p`, `q`, etc.)           | ABORT + DELETE |
| Any file commits `admin-private.pem` or raw secret                         | ABORT + DELETE |
| security-linter shows NEW failures not in baseline                         | ABORT + REPORT |
| Suite makes calls to `/api/v1` or uses `localStorage`                      | ABORT          |
| Any code accepts `organizationId` from request body/params/headers         | ABORT          |
| Railways token cannot be refreshed → deployment blocked until human action | PAUSE          |

---

## Approval

- **Executor**: Sonit (AI Execution Agent)
- **Reviewer (Architecture Board)**: ********\_\_\_********
- **Date/Time**: ********\_\_\_********
- **Status**: ⏳ AWAITING APPROVAL — no code changes will be made until explicit "approved" or "proceed" from human reviewer.

---

## Branches & Merge Order

```
fix/admin-mount-pr101    (APPROVE_READY — awaiting smoke test)
fix/jwks-server-sandbox  (DEPLOY first — JWKS server)
gate/admin-dashboard     (suite-shavi UI — deploy after core smoke test passes)
```

**Merge order** (after approval):

1. Merge `fix/jwks-server-sandbox` → deploy JWKS server
2. Set `ADMIN_JWKS_URL` in Railway → redeploy core
3. Run smoke test → confirm 201
4. Merge `fix/admin-mount-pr101`
5. Merge `gate/admin-dashboard` (suite)
