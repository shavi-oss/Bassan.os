# PR_CORE_SECURE_KEYS_PLAN.md — BassanOs Security Remediation

## Document Control

| Field     | Value                                                                 |
| --------- | --------------------------------------------------------------------- |
| Plan ID   | PR-CORE-SECURE-KEYS                                                   |
| Date      | 2026-02-23T14:53 UTC+2                                                |
| Author    | Sonit (AI Execution Agent)                                            |
| Status    | DRAFT — AWAITING HUMAN APPROVAL                                       |
| Branch    | `fix/secure-keys` (to be created from `fix/ui-relocation` HEAD)       |
| Authority | ARCHITECTURAL_LAWS.md · SECURITY_BASELINE.md · EXECUTION_AUTHORITY.md |
| Severity  | 🔴 CRITICAL — Private RSA key committed to repository                 |

---

## 1. Problem Statement

Commit `e80d19564c134d548573dcb8575214139e94c32e` committed a live RSA‑2048 private key
and supporting key-material files to the `BassanOs` repository under
`backend/tools/jwks/`. This violates the fundamental security law:

> **Private keys, secrets, and credentials MUST NEVER be committed to version control.**

Additionally, the JWKS server (`backend/tools/jwks-server/index.js`) loads its public-key
payload from a file (`jwks.json`) bundled inside the repository, meaning any change to the
key requires a new commit — an incorrect pattern that should use environment variables.

> [!CAUTION]
> The private key in `admin-private.pem` is **compromised** from the moment it was committed.
> It must be **rotated** (a new keypair generated) regardless of git history cleanup.
> Previous tokens signed with the old key remain valid until the JWKS endpoint is updated.

---

## 2. Scope Locks

### 2.1 Allowed Changes

| Action                | Path                                                             |
| --------------------- | ---------------------------------------------------------------- |
| `git rm` (all)        | `backend/tools/jwks/**` (23 files + directory)                   |
| `git rm`              | `backend/tools/jwks-server/jwks.json`                            |
| `git rm` (if tracked) | `backend/gen-token.js`                                           |
| MODIFY                | `backend/tools/jwks-server/index.js` (switch to env var)         |
| MODIFY                | `.gitignore` (add key-file patterns)                             |
| CREATE                | `backend/tools/jwks-server/.env.example`                         |
| CREATE                | Governance docs in `backend/governance/PR-101-admin-onboarding/` |

### 2.2 Forbidden Paths (must NOT be touched)

```
src/modules/auth/**
src/modules/organizations/**
src/core/**
src/shared/**
prisma/schema.prisma
tests/security/security-linter.spec.ts
backend/tools/jwks-server/Dockerfile
backend/tools/jwks-server/package.json
```

---

## 3. Files to Remove from Repository

### 3.1 backend/tools/jwks/ (entire directory — 23 files)

| File                         | Risk Level  | Reason                                     |
| ---------------------------- | ----------- | ------------------------------------------ |
| `admin-private.pem`          | 🔴 CRITICAL | Live RSA-2048 private key                  |
| `admin-public.pem`           | 🟡 HIGH     | Key material — should not be in repo       |
| `jwks.json`                  | 🟡 HIGH     | Derived from key pair                      |
| `jwks-railway-response.json` | 🟡 HIGH     | Contains public JWK parameters             |
| `jwks-response.json`         | 🟡 HIGH     | Contains public JWK parameters             |
| `signed-token.txt`           | 🟠 MEDIUM   | Contains a signed JWT — replay risk        |
| `sign-rs256.js`              | 🟠 MEDIUM   | Script that reads private key file         |
| `make-jwks.js`               | 🟠 MEDIUM   | Script that reads public key file          |
| `PLAN_BEFORE_PUSH.txt`       | 🟢 LOW      | Internal plan — not sensitive, but clutter |
| `lint_output.txt`            | 🟢 LOW      | Log file                                   |
| `migrate_deploy.log`         | 🟢 LOW      | May contain env context                    |
| `railway_core_env.log`       | 🟠 MEDIUM   | May contain env var names/values           |
| `railway_core_logs.log`      | 🟠 MEDIUM   | May contain tokens in log lines            |
| `railway_deploys.log`        | 🟢 LOW      | Deploy metadata                            |
| `railway_env_set.log`        | 🟠 MEDIUM   | May contain set variable names             |
| `railway_login.log`          | 🟠 MEDIUM   | May contain auth tokens                    |
| `railway_project_view.log`   | 🟢 LOW      | Project metadata                           |
| `railway_services.log`       | 🟢 LOW      | Service list                               |
| `smoke-response.txt`         | 🟢 LOW      | API response body                          |
| `smoke_resp.txt`             | 🟢 LOW      | API response body                          |
| `jwks-server.stdout.txt`     | 🟢 LOW      | Server log                                 |
| `staged-files.txt`           | 🟢 LOW      | Git staging list                           |
| `package-lock.json`          | 🟢 LOW      | Dependency lock for pem-jwk                |

### 3.2 backend/tools/jwks-server/jwks.json

The server's bundled `jwks.json` must also be removed — the server will load JWKS
from the environment variable instead.

### 3.3 backend/gen-token.js (if tracked)

Check `git ls-files backend/gen-token.js`. If tracked, remove it. The file reads from
`process.env.ADMIN_JWT_SECRET` (safe pattern), but the file itself is a dev-only utility
that does not belong in the repository.

---

## 4. .gitignore Additions

The following patterns will be added to the root `.gitignore`:

```gitignore
# ── Security: Key Material (MUST NEVER be committed) ──────────────────────
*.pem
*.key
*.p12
*.pfx

# JWKS and key-derived files
backend/tools/jwks/
backend/tools/jwks-server/jwks.json

# Token artefacts and signing scripts (dev-only)
**/signed-token.txt
**/sign-rs256.js
**/make-jwks.js
**/gen-token.js

# Railway log dumps and smoke-test output
**/railway_*.log
**/smoke-response.txt
**/smoke_resp.txt
**/migrate_deploy.log
**/lint_output.txt
**/staged-files.txt
**/jwks-server.stdout.txt
```

---

## 5. JWKS Server — Code Change

### 5.1 Current (INSECURE)

```js
const JWKS_PATH = path.join(__dirname, "jwks.json");
const raw = JSON.parse(fs.readFileSync(JWKS_PATH, "utf8"));
```

### 5.2 New (SECURE — env var)

```js
// Load JWKS from environment variable — fail fast if missing
const raw = (() => {
  const payload = process.env.ADMIN_JWKS_PAYLOAD;
  if (!payload) {
    console.error(
      "[jwks-server] FATAL: ADMIN_JWKS_PAYLOAD env var is not set.",
    );
    process.exit(1);
  }
  try {
    return JSON.parse(payload);
  } catch (e) {
    console.error(
      "[jwks-server] FATAL: ADMIN_JWKS_PAYLOAD is not valid JSON:",
      e.message,
    );
    process.exit(1);
  }
})();
```

`fs` and `path` imports are removed. No filesystem dependency.

### 5.3 ADMIN_JWKS_PAYLOAD format

The value must be a JSON string of the JWKS object (public fields only):

```json
{
  "keys": [
    {
      "kty": "RSA",
      "n": "<base64url-modulus>",
      "e": "AQAB",
      "use": "sig",
      "kid": "admin-key-1",
      "alg": "RS256"
    }
  ]
}
```

Set in Railway: `railway variables set "ADMIN_JWKS_PAYLOAD=..." --service jwks-server`

---

## 6. Key Rotation Requirement (MANDATORY — Out-of-band)

> [!CAUTION]
> The RSA private key committed in `admin-private.pem` is **permanently compromised**.
> Even after git removal, the key exists in git history and any clone made before cleanup.
>
> **Required actions (to be performed by human operator — not automated here):**
>
> 1. Generate a new RSA-2048 keypair locally (never commit the output):
>    ```bash
>    openssl genrsa -out new-admin-private.pem 2048
>    openssl rsa -in new-admin-private.pem -pubout -out new-admin-public.pem
>    ```
> 2. Generate a new JWKS JSON from the new public key (using `make-jwks.js` locally).
> 3. Set `ADMIN_JWKS_PAYLOAD` in Railway to the new JWKS.
> 4. Update `ADMIN_JWKS_PRIVATE_KEY` in Railway (or wherever the private key is needed for token signing) with the new private key content.
> 5. Previous tokens signed with the old key will fail JWKS verification immediately upon Railway redeploy — this is the desired fail-closed behaviour.

### Git History (Separate Gate — Not Automated Here)

To purge the key from git history, a future gate must use `git filter-repo` or BFG.
This requires:

- Force-push authorization from repository owner
- All team members re-cloning or rebasing
- CI token rotation

This is **out of scope** for the current branch and requires a separate execution authorization.

---

## 7. Task Sequence (Ordered)

### T1 — Create Branch

```bash
git checkout -b fix/secure-keys
```

### T2 — Check gen-token.js tracking status

```bash
git ls-files backend/gen-token.js
```

### T3 — Remove Key Files

```bash
git rm -r backend/tools/jwks/
git rm backend/tools/jwks-server/jwks.json
# If tracked:
git rm backend/gen-token.js
```

### T4 — Update .gitignore

Add all patterns from Section 4.

### T5 — Update JWKS Server

Rewrite `backend/tools/jwks-server/index.js` to use `process.env.ADMIN_JWKS_PAYLOAD`.

### T6 — Create .env.example

Create `backend/tools/jwks-server/.env.example`:

```
PORT=3001
ADMIN_JWKS_PAYLOAD={"keys":[{"kty":"RSA","n":"<base64url>","e":"AQAB","use":"sig","kid":"admin-key-1","alg":"RS256"}]}
```

### T7 — Verify No Secrets Remain

```bash
grep -r "BEGIN PRIVATE KEY" .     # must be empty
grep -r "BEGIN RSA PRIVATE KEY" . # must be empty
git diff --name-only HEAD         # only allowlisted files
```

### T8 — Run Verification Suite

```bash
npm run build
npx tsc --noEmit
npm run lint
npx jest
npm run security-linter
```

### T9 — Commit

```bash
git add -A
git commit -m "security: remove committed private key and harden JWKS server env var loading"
```

---

## 8. Stop Conditions (ABSOLUTE)

1. **ABORT** if `grep -r "BEGIN PRIVATE KEY"` returns any result after changes.
2. **ABORT** if any immutable path (`src/modules/auth/`, `prisma/schema.prisma`, etc.) appears in `git status`.
3. **ABORT** if `npm run build` or `npx tsc --noEmit` exits non-zero.
4. **ABORT** if security linter produces new violations beyond pre-existing baseline.
5. **ABORT** if the `backend/tools/jwks-server/` Dockerfile or `package.json` is modified.
6. **ABORT** if any private key content appears in any committed file after T7.

---

## 9. Human Approval Required

**This plan MUST NOT be executed until explicit human approval.**

Approver acknowledges:

- [ ] The private key in `admin-private.pem` is compromised and MUST be rotated
- [ ] The `fix/secure-keys` branch is an additive fix on top of `fix/ui-relocation`
- [ ] Git history purge is a separate gate requiring separate authorization
- [ ] JWKS server will fail to start in Railway until `ADMIN_JWKS_PAYLOAD` is set
- [ ] All immutable zones remain untouched

---

_END OF PLAN_
