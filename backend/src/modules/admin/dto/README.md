# Admin Module — DTO Note

## DTO Reuse Policy

The admin module does **NOT** define its own DTOs.

It reuses `CreateOrganizationDto` from the organizations module:

```
import { CreateOrganizationDto } from "../organizations/dto/create-organization.dto";
```

## Why no new DTO?

- The admin onboarding endpoint accepts the same payload as the v1 org creation endpoint.
- Duplicating the DTO would create drift risk.
- `CreateOrganizationDto` does not contain `organizationId` (enforced by CODE_LAWS.md Law 1).

## Constraint

- Do NOT add `organizationId` to `CreateOrganizationDto`.
- Do NOT create a new DTO that includes `organizationId`.
- Any future admin-specific fields must be added as a separate `AdminCreateOrganizationDto`
  that **extends** `CreateOrganizationDto` without adding `organizationId`.
