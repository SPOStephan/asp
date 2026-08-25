import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';

type AdminRow = { user_id: string; email: string; created_at: string };
type InviteRow = { email: string; created_at: string; accepted_at: string | null };

export function AdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const [adminRes, inviteRes] = await Promise.all([
      supabase.from('admins').select('user_id, email, created_at').order('created_at'),
      supabase.from('admin_invites').select('email, created_at, accepted_at').order('created_at'),
    ]);
    if (adminRes.error) setError(adminRes.error.message);
    else setAdmins((adminRes.data ?? []) as AdminRow[]);
    if (inviteRes.error) setError(inviteRes.error.message);
    else setInvites((inviteRes.data ?? []) as InviteRow[]);
  }

  useEffect(() => {
    void reload();
  }, []);

  async function invite(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const result = await supabase.from('admin_invites').insert({ email: email.trim().toLowerCase() });
    if (result.error) setError(result.error.message);
    else {
      setEmail('');
      await reload();
    }
  }

  async function removeAdmin(userId: string) {
    if (admins.length <= 1) {
      setError('Der letzte Admin kann nicht entfernt werden.');
      return;
    }
    const result = await supabase.from('admins').delete().eq('user_id', userId);
    if (result.error) setError(result.error.message);
    else await reload();
  }

  return (
    <>
      <h2>Admins</h2>
      <p className="lead">Nur du lädst ein. Die Person braucht danach ein Auth-Konto mit genau dieser E-Mail und meldet sich hier an. Öffentliche Registrierung bleibt aus.</p>
      <form className="admin-form" onSubmit={(event) => void invite(event)}>
        <label>
          E-Mail einladen
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <div className="admin-actions">
          <button type="submit" className="admin-btn">
            Einladen
          </button>
        </div>
      </form>
      {error ? <p className="admin-error">{error}</p> : null}
      <h3>Aktive Admins</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>E-Mail</th>
            <th>Seit</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.user_id}>
              <td>{admin.email}</td>
              <td>{new Date(admin.created_at).toLocaleDateString('de-DE')}</td>
              <td>
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void removeAdmin(admin.user_id)}>
                  Entfernen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Einladungen</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>E-Mail</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {invites.map((inviteRow) => (
            <tr key={inviteRow.email}>
              <td>{inviteRow.email}</td>
              <td>{inviteRow.accepted_at ? 'angenommen' : 'offen'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
