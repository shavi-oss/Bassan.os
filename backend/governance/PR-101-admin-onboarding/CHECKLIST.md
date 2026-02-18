# CHECKLIST — PR-101 Preflight & Postflight

## Preflight

- [ ] `git status --porcelain` clean (or only governance files untracked)
- [ ] `git rev-parse HEAD` recorded in PR_PLAN
- [ ] PR_PLAN.md present in governance folder
- [ ] Secrets / JWKS URL noted (DO NOT store secrets in repo)

## Execution

- [ ] Created admin module files under `src/modules/admin`
- [ ] Tests added under `backend/tests`
- [ ] security-linter updated per SECURITY_LINTER_PATCH.md

## Verification

- [ ] `npx tsc --noEmit` PASS
- [ ] `npm run lint` PASS
- [ ] `npx jest backend/tests/security/security-linter.spec.ts` PASS
- [ ] admin unit tests PASS
- [ ] smoke curl PASS

## Post-Execution

- [ ] PR opened with PR_BODY_TEMPLATE.md content
- [ ] PR_101_EXECUTION_REPORT.md attached
- [ ] PR_101_VERIFICATION_EVIDENCE.md attached
