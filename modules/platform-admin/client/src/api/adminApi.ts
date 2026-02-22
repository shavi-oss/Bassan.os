// Admin API — S2S fetch wrapper for suite-shavi admin dashboard
// Calls backend POST /api/v2/admin/organizations with RS256 JWT from env
//
// SECURITY NOTE:
//   VITE_ADMIN_JWT is a short-lived RS256 token (TTL 300s) signed by the
//   JWKS server private key. Acceptable for sandbox testing only.
//   Production: the BFF must sign tokens server-side.
//   Never hardcode or persist this token.

export interface CreateOrgDto {
  name: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
}

export interface CreateOrgResponse {
  organization: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: string;
  };
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

const BASE = (import.meta.env.VITE_CORE_API_URL ?? '').replace(/\/$/, '');

function getToken(): string {
  const t = import.meta.env.VITE_ADMIN_JWT ?? '';
  if (!t) throw new Error('VITE_ADMIN_JWT is not configured — admin access unavailable.');
  return t;
}

export async function createOrganization(dto: CreateOrgDto): Promise<CreateOrgResponse> {
  const res = await fetch(`${BASE}/api/v2/admin/organizations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
      'X-Correlation-Id': `ui-${Date.now()}`,
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`[adminApi] ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}
