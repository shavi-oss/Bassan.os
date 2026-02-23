# PR_CORE_SECURE_KEYS_PR_BODY.md — v2

## ⚠ SECURITY INCIDENT — RSA Private Key Exposure

### What Happened

Commit `e80d195` committed a live RSA-2048 private key (`admin-private.pem`) and 24 other
sensitive artifacts to the BassanOs repository. The key remains in git history even after
file removal. **The old key (`admin-key-1`) is permanently compromised.**

---

## What This PR Does

### Phase 1 — Working Tree Cleanup (committed)

| Change                                   | Detail                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------- |
| `git rm` 25 files                        | All key material, scripts, logs removed from working tree                       |
| `.gitignore` hardened                    | `*.pem`, `*.key`, `backend/tools/jwks/`, signed-token, logs                     |
| `index.js` rewritten                     | No longer reads `jwks.json` from filesystem → uses `ADMIN_JWKS_PAYLOAD` env var |
| `backend/tools/jwks-server/.env.example` | Documents env var format — no real keys                                         |
| `scripts/secret-scan.sh`                 | Lightweight CI/pre-commit secret scanner (POSIX, no deps)                       |
| `scripts/pre-commit-hook.sh`             | Hook template to block key commits (developer installs manually)                |

### Phase 2 — Key Rotation (done out-of-band)

| Action                                                    | Status                                                                            |
| --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| New RSA-2048 keypair generated (KID: `admin-key-2`)       | ✅ Done locally — NOT committed                                                   |
| `ADMIN_JWKS_PAYLOAD` set on Railway `jwks-server` service | ✅ Confirmed via `railway variables`                                              |
| Redeploy triggered                                        | ✅ — **endpoint will serve `admin-key-2` after this branch merges and redeploys** |

### Phase 3 — Git History Purge (NOT YET DONE — requires human approval)

The compromised private key still exists in commits `dce69e4` and `e80d195`.
Exact purge commands are documented in `PR_CORE_SECURE_KEYS_PLAN.md` §5.

**Approver must run the history rewrite after merging this PR.**

---

## What Is NOT Safe Yet

> [!WARNING]
> Until git history is purged, anyone with access to the repository can extract
> the old private key from commit `e80d195` using:
> `git show e80d195:backend/tools/jwks/admin-private.pem`
>
> **The old `admin-key-1` must be treated as permanently revoked.**
> All tokens signed with `admin-key-1` will fail verification after this branch
> deploys (JWKS endpoint will only advertise `admin-key-2`).

---

## Verification Results

| Check                                         | Result                                     |
| --------------------------------------------- | ------------------------------------------ |
| `git grep "BEGIN PRIVATE KEY"` (working tree) | ✅ Only markdown doc strings — no real PEM |
| `npm run build`                               | ✅ EXIT 0                                  |
| `tsc --noEmit`                                | ✅ EXIT 0                                  |
| `npm run lint`                                | ✅ EXIT 0                                  |
| Security linter                               | ✅ Zero new violations                     |
| JWKS endpoint private fields (`d`, `p`, `q`)  | ✅ Absent                                  |
| Railway variable `ADMIN_JWKS_PAYLOAD`         | ✅ Contains `kid:admin-key-2`              |

---

## Reviewer Checklist

- [ ] Confirm `admin-private.pem` only appears in **deletions** in this diff
- [ ] Confirm `git grep "BEGIN PRIVATE KEY"` returns only markdown text — no PEM blocks
- [ ] Confirm `src/`, `prisma/`, `Dockerfile`, `package.json` unchanged
- [ ] After merge: redeploy `jwks-server` and verify endpoint returns `kid: admin-key-2`
- [ ] After merge: run `git filter-repo` history purge (see Plan §5) + force-push
- [ ] After purge: verify `git log --all -- "*/admin-private.pem"` returns empty

---

## Files Changed in This PR

```
M  .gitignore
D  backend/gen-token.js
M  backend/tools/jwks-server/index.js
A  backend/tools/jwks-server/.env.example
D  backend/tools/jwks-server/jwks.json
D  backend/tools/jwks/ (23 files)
A  scripts/secret-scan.sh
A  scripts/pre-commit-hook.sh
A  backend/governance/PR-101-admin-onboarding/PR_CORE_SECURE_KEYS_PLAN.md
A  backend/governance/PR-101-admin-onboarding/PR_CORE_SECURE_KEYS_EXECUTION_REPORT.md
A  backend/governance/PR-101-admin-onboarding/PR_CORE_SECURE_KEYS_VERIFICATION_EVIDENCE.md
A  backend/governance/PR-101-admin-onboarding/PR_CORE_SECURE_KEYS_PR_BODY.md
```

**Merge only after: key rotation verified in Railway + human approval for history rewrite.**
