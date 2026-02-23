# PR_CORE_FINAL_PREMERGE_VERDICT.md

## Document Control

| Field     | Value                               |
| --------- | ----------------------------------- |
| Verdict   | PR-CORE-FINAL-PREMERGE-VERDICT      |
| Date      | 2026-02-23T21:44 UTC+2              |
| Auditor   | Sonit — Release Gatekeeper          |
| Authority | Zero-trust independent verification |

---

## Verdict

```
╔═══════════════════════════════════════════════════════════════════╗
║  ✅  SAFE TO MERGE WITH CONDITIONS                               ║
║       Both: fix/secure-keys (BassanOs)                          ║
║             fix/ui-relocation (suite-shavi)                     ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## Evidence Summary

| Category                             | fix/secure-keys               | fix/ui-relocation  |
| ------------------------------------ | ----------------------------- | ------------------ |
| PEM in working tree                  | ✅ None                       | N/A                |
| Key in git history                   | ✅ Purged (e80d195 destroyed) | N/A                |
| JWKS server env-var only             | ✅ Confirmed                  | N/A                |
| React contamination in BassanOs      | ✅ None                       | N/A                |
| api/v1 / localStorage in suite-shavi | N/A                           | ✅ None            |
| npm run build                        | ✅ EXIT 0                     | ✅ EXIT 0          |
| tsc --noEmit                         | ✅ EXIT 0                     | ✅ EXIT 0          |
| npm run lint                         | ✅ EXIT 0                     | N/A (pre-existing) |
| Immutable zones                      | ✅ Untouched                  | ✅ N/A             |
| .gitignore coverage                  | ✅ All patterns present       | N/A                |
| Prevention scripts                   | ✅ present                    | N/A                |

---

## Blocking Issues

**None.** All hard stop conditions passed.

---

## Post-Merge Conditions (MANDATORY)

These are not blocking merge but MUST be completed immediately after each branch merges:

### After `fix/secure-keys` merges to master (BassanOs):

| #   | Action                                        | Why                                                                                   |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | Redeploy `jwks-server` on Railway             | New `index.js` reads `ADMIN_JWKS_PAYLOAD`; endpoint will then serve `kid:admin-key-2` |
| 2   | Verify endpoint: `GET /.well-known/jwks.json` | Must return HTTP 200, `kid == "admin-key-2"`, no `d`/`p`/`q` fields                   |
| 3   | Notify all developers                         | History was rewritten; all local clones are stale                                     |
| 4   | Update `.env.example` comment                 | Change template `kid` reference from `admin-key-1` to `admin-key-2`                   |
| 5   | Install pre-commit hook on each dev machine   | `cp scripts/pre-commit-hook.sh .git/hooks/pre-commit && chmod +x ...`                 |

### After `fix/ui-relocation` merges to master (suite-shavi):

| #   | Action                             | Why                                                        |
| --- | ---------------------------------- | ---------------------------------------------------------- |
| 1   | Verify UI loads in browser         | Confirm platform-admin client renders correctly post-merge |
| 2   | Confirm BFF proxy routes unchanged | No api/v1 or hardcoded backend URLs introduced             |

---

## Minor Issues (Non-Blocking)

| Issue                                                          | Recommended Action                 |
| -------------------------------------------------------------- | ---------------------------------- |
| `.env.example` references `kid:admin-key-1` in comment         | Update to `admin-key-2` (cosmetic) |
| `security-linter` script missing in BassanOs `package.json`    | Add script in a follow-up PR       |
| `lint` script not defined in suite-shavi client `package.json` | Add in follow-up                   |

---

_Final verdict issued: 2026-02-23T21:44 UTC+2_
_This document serves as the official release gate record for both branches._
