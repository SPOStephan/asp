import { useState, type FormEvent } from 'react';
import { useAdminAuth } from '../AdminAuth';

export function AdminLoginPage() {
  const { signIn } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await signIn(email, password);
    if (result.error) setError(result.error);
    setBusy(false);
  }

  return (
    <div className="admin-login">
      <div className="admin-card">
        <h1>Lohbeck CMS</h1>
        <p className="lead">Nur eingeladene Admins. Kein öffentliches Konto.</p>
        <form className="admin-form" onSubmit={(event) => void onSubmit(event)}>
          <label>
            E-Mail
            <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Passwort
            <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error ? <p className="admin-error">{error}</p> : null}
          <div className="admin-actions">
            <button type="submit" className="admin-btn" disabled={busy}>
              {busy ? 'Anmelden…' : 'Anmelden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
