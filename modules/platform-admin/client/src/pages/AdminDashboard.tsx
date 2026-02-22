import React, { useState } from 'react';
import { CreateOrganizationForm } from '../components/CreateOrganizationForm';
import { OrganizationList } from '../components/OrganizationList';

interface OrgRecord {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
}

/**
 * AdminDashboard — admin-safe organization management page
 *
 * Access control:
 *   Renders only if VITE_ADMIN_JWT is configured.
 *   The JWT must be a valid RS256 token signed by admin-private.pem,
 *   containing { sub, type:'s2s', scope:'bassan:admin' }.
 *
 * Security:
 *   - Does NOT accept organizationId from user input (enforced by adminApi.ts)
 *   - Fail-closed: missing VITE_ADMIN_JWT shows access-denied screen (not an error)
 */
export function AdminDashboard() {
  const hasToken = Boolean(import.meta.env.VITE_ADMIN_JWT);
  const [orgs, setOrgs] = useState<OrgRecord[]>([]);

  if (!hasToken) {
    return (
      <div style={styles.denied} id="admin-dashboard-no-access">
        <h2>Admin Access Not Configured</h2>
        <p>
          VITE_ADMIN_JWT is not set. This dashboard requires a valid S2S JWT signed by the admin
          private key. Contact your platform administrator.
        </p>
      </div>
    );
  }

  return (
    <main style={styles.page} id="admin-dashboard">
      <header style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.subtitle}>Organization management · Bassan.os</p>
      </header>

      <section style={styles.section} aria-labelledby="create-org-heading">
        <h2 id="create-org-heading" style={styles.sectionTitle}>Create Organization</h2>
        <CreateOrganizationForm
          onSuccess={(org) => setOrgs((prev) => [org, ...prev])}
        />
      </section>

      <section style={styles.section} aria-labelledby="org-list-heading">
        <h2 id="org-list-heading" style={styles.sectionTitle}>Organizations Created This Session</h2>
        <OrganizationList orgs={orgs} />
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 900, margin: '0 auto', padding: '32px 24px', fontFamily: 'Inter, sans-serif' },
  header: { marginBottom: 32 },
  title: { margin: 0, fontSize: 28, fontWeight: 700, color: '#1e1b4b' },
  subtitle: { margin: '6px 0 0', color: '#6b7280', fontSize: 15 },
  section: { marginBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 600, margin: '0 0 16px', paddingBottom: 8, borderBottom: '2px solid #e5e7eb' },
  denied: {
    maxWidth: 500, margin: '80px auto', padding: 32, textAlign: 'center',
    background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12,
    color: '#991b1b',
  },
};
