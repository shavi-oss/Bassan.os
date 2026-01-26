# Environment Parity Matrix — Bassan.os

## Portable Environment Variables (Required)

These variables MUST exist in any environment (Railway, Oracle, Local):

- DATABASE_URL
- JWT_SECRET

## Railway System Variables (Non-Portable)

Provided automatically by Railway. MUST NOT be assumed elsewhere:

- RAILWAY_PUBLIC_DOMAIN
- RAILWAY_PRIVATE_DOMAIN
- RAILWAY_PROJECT_NAME
- RAILWAY_ENVIRONMENT_NAME
- RAILWAY_SERVICE_NAME
- RAILWAY_PROJECT_ID
- RAILWAY_ENVIRONMENT_ID
- RAILWAY_SERVICE_ID

Decision:
Oracle Cloud environments will NOT include Railway system variables.
Core behavior must remain vendor-neutral.
