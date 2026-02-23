# PR Body Template — BassanOs fix/secure-keys

## Summary

**CRITICAL SECURITY:** Removes a live RSA-2048 private key committed in a prior commit,
hardens the JWKS server to load its public-key payload from an environment variable,
and strengthens `.gitignore` to prevent future key exposure.

> [!CAUTION]
> **The private key in `admin-private.pem` is compromised.** You MUST generate a new keypair
> and set `ADMIN_JWKS_PAYLOAD` in Railway before merging and redeploying.

---

## What Was Removed (25 files)

| File                                                       | Risk                           |
| ---------------------------------------------------------- | ------------------------------ |
| `backend/tools/jwks/admin-private.pem`                     | 🔴 CRITICAL — live private key |
| `backend/tools/jwks/admin-public.pem`                      | 🟡 Key material                |
| `backend/tools/jwks/jwks.json` + railway/response variants | 🟡 Key-derived                 |
| `backend/tools/jwks/signed-token.txt`                      | 🟠 Live JWT                    |
| `backend/tools/jwks/sign-rs256.js`, `make-jwks.js`         | 🟠 Key-reading scripts         |
| `backend/tools/jwks/railway_*.log`                         | 🟠 May contain tokens          |
| `backend/tools/jwks-server/jwks.json`                      | 🟡 Bundled public JWK          |
| `backend/gen-token.js`                                     | 🟠 Dev-only signing util       |

---

## What Was Changed

| File                                     | Change                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------- |
| `.gitignore`                             | Added `*.pem`, `*.key`, `backend/tools/jwks/`, key scripts, railway logs        |
| `backend/tools/jwks-server/index.js`     | Switched from `fs.readFileSync('jwks.json')` → `process.env.ADMIN_JWKS_PAYLOAD` |
| `backend/tools/jwks-server/.env.example` | NEW — documents `ADMIN_JWKS_PAYLOAD` format                                     |

## What Was NOT Changed

- `src/modules/auth/**` — UNTOUCHED
- `prisma/schema.prisma` — UNTOUCHED
- NestJS application source — UNTOUCHED
- Dockerfile, package.json for jwks-server — UNTOUCHED

---

## Verification

| Check                          | Result                 |
| ------------------------------ | ---------------------- |
| `git grep "BEGIN PRIVATE KEY"` | ✅ Empty               |
| `npm run build`                | ✅ EXIT 0              |
| `npx tsc --noEmit`             | ✅ EXIT 0              |
| `npm run lint`                 | ✅ EXIT 0              |
| Security linter                | ✅ Zero new violations |

---

## Required Actions Before Merge

1. **Rotate keypair** — generate a new RSA-2048 key locally (never commit output)
2. **Set `ADMIN_JWKS_PAYLOAD`** in Railway → `jwks-server` service
3. **Redeploy** `jwks-server` — JWKS server will fail to start until variable is set
4. **Git history purge** — open a separate gate for BFG / `git filter-repo`
   (force-push requires explicit team authorization)

---

## Checklist for Reviewer

- [ ] Confirm `admin-private.pem` is NOT in this diff (only in deletions)
- [ ] Confirm `grep "BEGIN PRIVATE KEY"` returns empty on this branch
- [ ] Confirm NestJS `src/`, `prisma/`, `Dockerfile` have zero changes
- [ ] Confirm Railway `ADMIN_JWKS_PAYLOAD` is set to NEW keypair before merge
- [ ] Merge after key rotation ← **no auto-merge**
