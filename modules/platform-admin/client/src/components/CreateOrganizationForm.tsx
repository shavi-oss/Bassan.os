import React, { useState } from 'react';
import { createOrganization, type CreateOrgDto } from '../api/adminApi';

interface FormState {
  name: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
}

interface Props {
  onSuccess?: (org: { id: string; name: string; slug: string }) => void;
}

export function CreateOrganizationForm({ onSuccess }: Props) {
  const [form, setForm] = useState<FormState>({
    name: '',
    adminEmail: '',
    adminPassword: '',
    adminFirstName: '',
    adminLastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  async function submit(dto: CreateOrgDto) {
    const result = await createOrganization(dto);
    setSuccess(`Organization "${result.organization.name}" created (id: ${result.organization.id})`);
    setForm({ name: '', adminEmail: '', adminPassword: '', adminFirstName: '', adminLastName: '' });
    if (onSuccess) onSuccess(result.organization);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    submit(form)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.heading}>Create Organization</h3>

      {error && <div style={styles.error} role="alert">{error}</div>}
      {success && <div style={styles.successBox} role="status">{success}</div>}

      {(['name', 'adminFirstName', 'adminLastName', 'adminEmail', 'adminPassword'] as const).map((field) => (
        <label key={field} style={styles.label}>
          <span style={styles.labelText}>{fieldLabel(field)}</span>
          <input
            id={`admin-form-${field}`}
            name={field}
            type={field === 'adminPassword' ? 'password' : field === 'adminEmail' ? 'email' : 'text'}
            value={form[field]}
            onChange={handleChange}
            required
            autoComplete="off"
            style={styles.input}
            disabled={loading}
          />
        </label>
      ))}

      <button type="submit" disabled={loading} style={styles.button} id="admin-create-org-submit">
        {loading ? 'Creating…' : 'Create Organization'}
      </button>
    </form>
  );
}

function fieldLabel(f: string): string {
  const labels: Record<string, string> = {
    name: 'Organization Name',
    adminEmail: 'Admin Email',
    adminPassword: 'Admin Password',
    adminFirstName: 'Admin First Name',
    adminLastName: 'Admin Last Name',
  };
  return labels[f] ?? f;
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 },
  heading: { margin: '0 0 8px', fontSize: 16, fontWeight: 600 },
  label: { display: 'flex', flexDirection: 'column', gap: 4 },
  labelText: { fontSize: 13, fontWeight: 500, color: '#555' },
  input: { padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14 },
  button: {
    marginTop: 8, padding: '10px 16px', background: '#6366f1', color: '#fff',
    border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  error: { padding: 10, background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 13, color: '#991b1b' },
  successBox: { padding: 10, background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 6, fontSize: 13, color: '#065f46' },
};
