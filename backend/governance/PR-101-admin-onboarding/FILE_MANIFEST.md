# FILE_MANIFEST — PR-101 Admin Onboarding

## Governance (already here)

- PR_101_PLAN.md
- PR_101_EXECUTION_REPORT.md
- PR_101_VERIFICATION_EVIDENCE.md
- SECURITY_LINTER_PATCH.md
- CHECKLIST.md
- PR_BODY_TEMPLATE.md
- AGENT_PROMPT.txt

## Source files to create AFTER Approval

Place under: `D:\Basaan os\BassanOs\backend\src\modules\admin\`

- admin.module.ts
- admin.controller.ts
- admin.service.ts
- dto/README.md (note: reuse existing CreateOrganizationDto from organizations)
- admin-jwt.strategy.ts (or .md spec if registering as provider within module)
- admin-jwt.guard.ts

## Tests (place under backend/tests)

- backend/tests/organizations/admin.controller.spec.ts
- backend/tests/auth/admin-jwt.strategy.spec.ts

## Notes

- Do NOT modify `backend/src/modules/organizations/**` or `backend/src/modules/auth/**`
- Admin module must register AdminJwtStrategy locally (avoid editing immutable auth.module.ts)
