import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { slugifyTemplateKey } from '../../lib/pageTemplates';
import { managedOrgs, useAdminAuth } from '../AdminAuth';

type Role = 'owner' | 'admin' | 'editor';
type AdminRow = { user_id: string; email: string; created_at: string };
type MemberRow = { organization_id: string; user_id: string; email: string; role: Role; created_at: string };
type InviteRow = { email: string; organization_id: string | null; role: Role; created_at: string; accepted_at: string | null };
type OrgRow = { id: string; name: string; slug: string };

const ROLE_LABEL: Record<Role, string> = {
  owner: 'Inhaber – alles, auch Team und Hotels',
  admin: 'Admin – Hotels, Inhalte und Team',
  editor: 'Redaktion – nur Inhalte',
};

function InviteForm({ onInvite, withRole }: { onInvite: (email: string, role: Role) => Promise<void>; withRole: boolean }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('editor');
  async function submit(event: FormEvent) {
    event.preventDefault();
    await onInvite(email.trim().toLowerCase(), role);
    setEmail('');
  }
  return (
    <form className="admin-form" onSubmit={(event) => void submit(event)}>
      <label>
        E-Mail einladen
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </label>
      {withRole ? (
        <label>
          Rolle
          <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
            {(Object.keys(ROLE_LABEL) as Role[]).map((key) => (
              <option key={key} value={key}>
                {ROLE_LABEL[key]}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="admin-actions">
        <button type="submit" className="admin-btn">
          Einladen
        </button>
      </div>
    </form>
  );
}

export function AdminAdminsPage() {
  const { admin } = useAdminAuth();
  const [platformAdmins, setPlatformAdmins] = useState<AdminRow[]>([]);
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const platform = Boolean(admin?.platform);

  const reload = useCallback(async () => {
    setError(null);
    const orgQuery = platform
      ? supabase.from('organizations').select('id, name, slug').order('name')
      : Promise.resolve({ data: managedOrgs(admin).map(({ id, name, slug }) => ({ id, name, slug })), error: null });
    const [orgRes, memberRes, inviteRes, adminRes] = await Promise.all([
      orgQuery,
      supabase.from('organization_members').select('organization_id, user_id, email, role, created_at').order('created_at'),
      supabase.from('admin_invites').select('email, organization_id, role, created_at, accepted_at').order('created_at'),
      platform ? supabase.from('admins').select('user_id, email, created_at').order('created_at') : Promise.resolve({ data: [], error: null }),
    ]);
    const failed = [orgRes, memberRes, inviteRes, adminRes].find((result) => result.error);
    if (failed?.error) setError(failed.error.message);
    setOrgs((orgRes.data ?? []) as OrgRow[]);
    setMembers((memberRes.data ?? []) as MemberRow[]);
    setInvites((inviteRes.data ?? []) as InviteRow[]);
    setPlatformAdmins((adminRes.data ?? []) as AdminRow[]);
  }, [admin, platform]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function invite(email: string, organizationId: string | null, role: Role) {
    const result = await supabase
      .from('admin_invites')
      .upsert({ email, organization_id: organizationId, role, accepted_at: null }, { onConflict: 'email' });
    if (result.error) setError(result.error.message);
    await reload();
  }

  async function removePlatformAdmin(userId: string) {
    if (platformAdmins.length <= 1) {
      setError('Der letzte Plattform-Admin kann nicht entfernt werden.');
      return;
    }
    const result = await supabase.from('admins').delete().eq('user_id', userId);
    if (result.error) setError(result.error.message);
    await reload();
  }

  async function removeMember(member: MemberRow) {
    const result = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', member.organization_id)
      .eq('user_id', member.user_id);
    if (result.error) setError(result.error.message);
    await reload();
  }

  async function changeRole(member: MemberRow, role: Role) {
    const result = await supabase
      .from('organization_members')
      .update({ role })
      .eq('organization_id', member.organization_id)
      .eq('user_id', member.user_id);
    if (result.error) setError(result.error.message);
    await reload();
  }

  async function createOrg(event: FormEvent) {
    event.preventDefault();
    const name = orgName.trim();
    const result = await supabase.from('organizations').insert({ name, slug: slugifyTemplateKey(name) });
    if (result.error) setError(result.error.message);
    else setOrgName('');
    await reload();
  }

  return (
    <>
      <h2>Team</h2>
      <p className="lead">
        Eingeladene Personen brauchen ein Konto mit genau dieser E-Mail und melden sich danach hier an. Mitglieder
        einer Organisation sehen und bearbeiten nur deren Hotels.
      </p>
      {error ? <p className="admin-error">{error}</p> : null}

      {orgs.map((org) => {
        const orgMembers = members.filter((member) => member.organization_id === org.id);
        const pending = invites.filter((item) => item.organization_id === org.id && !item.accepted_at);
        return (
          <section key={org.id} className="admin-team">
            <h3>{org.name}</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>E-Mail</th>
                  <th>Rolle</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orgMembers.map((member) => (
                  <tr key={member.user_id}>
                    <td>{member.email}</td>
                    <td>
                      <select value={member.role} onChange={(event) => void changeRole(member, event.target.value as Role)}>
                        {(Object.keys(ROLE_LABEL) as Role[]).map((key) => (
                          <option key={key} value={key}>
                            {ROLE_LABEL[key]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void removeMember(member)}>
                        Entfernen
                      </button>
                    </td>
                  </tr>
                ))}
                {pending.map((item) => (
                  <tr key={item.email}>
                    <td>{item.email}</td>
                    <td>{ROLE_LABEL[item.role]}</td>
                    <td className="admin-muted">eingeladen</td>
                  </tr>
                ))}
                {!orgMembers.length && !pending.length ? (
                  <tr>
                    <td colSpan={3} className="admin-muted">
                      Noch niemand.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
            <InviteForm withRole onInvite={(email, role) => invite(email, org.id, role)} />
          </section>
        );
      })}

      {platform ? (
        <>
          <section className="admin-team">
            <h3>Neue Organisation</h3>
            <form className="admin-form" onSubmit={(event) => void createOrg(event)}>
              <label>
                Name des Kunden
                <input value={orgName} onChange={(event) => setOrgName(event.target.value)} required />
              </label>
              <div className="admin-actions">
                <button type="submit" className="admin-btn">
                  Anlegen
                </button>
              </div>
            </form>
          </section>

          <section className="admin-team">
            <h3>Plattform-Team</h3>
            <p className="admin-muted">Zugriff auf alle Organisationen, die Bibliothek und die Icons.</p>
            <table className="admin-table">
              <tbody>
                {platformAdmins.map((row) => (
                  <tr key={row.user_id}>
                    <td>{row.email}</td>
                    <td>{new Date(row.created_at).toLocaleDateString('de-DE')}</td>
                    <td>
                      <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void removePlatformAdmin(row.user_id)}>
                        Entfernen
                      </button>
                    </td>
                  </tr>
                ))}
                {invites
                  .filter((item) => !item.organization_id && !item.accepted_at)
                  .map((item) => (
                    <tr key={item.email}>
                      <td>{item.email}</td>
                      <td className="admin-muted">eingeladen</td>
                      <td />
                    </tr>
                  ))}
              </tbody>
            </table>
            <InviteForm withRole={false} onInvite={(email) => invite(email, null, 'editor')} />
          </section>
        </>
      ) : null}
    </>
  );
}
