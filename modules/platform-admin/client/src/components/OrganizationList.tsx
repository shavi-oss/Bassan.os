import React from 'react';

interface OrgRecord {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
}

interface Props {
  orgs: OrgRecord[];
}

export function OrganizationList({ orgs }: Props) {
  if (orgs.length === 0) {
    return (
      <div style={styles.empty} id="admin-org-list-empty">
        No organizations created yet. Use the form above to create the first organization.
      </div>
    );
  }

  return (
    <table style={styles.table} id="admin-org-list-table">
      <thead>
        <tr>
          <th style={styles.th}>Name</th>
          <th style={styles.th}>Slug</th>
          <th style={styles.th}>ID</th>
          <th style={styles.th}>Created</th>
        </tr>
      </thead>
      <tbody>
        {orgs.map((org) => (
          <tr key={org.id}>
            <td style={styles.td}>{org.name}</td>
            <td style={styles.td}><code>{org.slug}</code></td>
            <td style={styles.td}><code style={{ fontSize: 11 }}>{org.id}</code></td>
            <td style={styles.td}>{org.createdAt ? new Date(org.createdAt).toLocaleString() : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const styles: Record<string, React.CSSProperties> = {
  empty: { color: '#888', fontSize: 14, padding: 16, background: '#f9fafb', borderRadius: 6 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { textAlign: 'left', padding: '8px 12px', background: '#f3f4f6', fontWeight: 600, fontSize: 13, borderBottom: '1px solid #e5e7eb' },
  td: { padding: '8px 12px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'top' },
};
