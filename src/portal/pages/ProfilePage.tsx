import { useState, type FormEvent } from 'react';
import { usePortal } from '../PortalData';
import { portal } from '../portalClient';

export function ProfilePage() {
  const { summary, hotels, reload, signOut } = usePortal();
  const member = summary?.member;
  const [form, setForm] = useState({
    first_name: member?.first_name ?? '',
    last_name: member?.last_name ?? '',
    phone: member?.phone ?? '',
    birthday: member?.birthday ?? '',
    favourite_hotel_id: member?.favourite_hotel_id ?? '',
    marketing_opt_in: member?.marketing_opt_in ?? false,
  });
  const [password, setPassword] = useState('');
  const [note, setNote] = useState<string | null>(null);
  if (!member) return null;
  const set = (patch: Partial<typeof form>) => setForm({ ...form, ...patch });
  const contact = summary?.program.settings.contact_email;

  async function save(event: FormEvent) {
    event.preventDefault();
    const { error } = await portal
      .from('loyalty_members')
      .update({ ...form, birthday: form.birthday || null, favourite_hotel_id: form.favourite_hotel_id || null })
      .eq('user_id', member!.user_id);
    setNote(error ? error.message : 'Gespeichert.');
    if (!error) await reload();
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) return setNote('Das Passwort ist zu kurz: bitte mindestens 8 Zeichen.');
    const { error } = await portal.auth.updateUser({ password });
    setNote(error ? error.message : 'Passwort geändert.');
    setPassword('');
  }

  return (
    <div className="portal-page">
      <p className="portal-eyebrow">Ihre Daten</p>
      <h1 className="heading portal-title">Profil <em>&amp; Einstellungen</em></h1>
      {note ? <p className="portal-note-box" role="status">{note}</p> : null}
      <form className="portal-card portal-form" onSubmit={save}>
        <div className="portal-form__row">
          <label>Vorname<input value={form.first_name} onChange={(event) => set({ first_name: event.target.value })} /></label>
          <label>Nachname<input value={form.last_name} onChange={(event) => set({ last_name: event.target.value })} /></label>
        </div>
        <label>E-Mail-Adresse<input value={member.email} disabled /></label>
        <div className="portal-form__row">
          <label>Telefon<input type="tel" value={form.phone} onChange={(event) => set({ phone: event.target.value })} /></label>
          <label>Geburtstag<input type="date" value={form.birthday} onChange={(event) => set({ birthday: event.target.value })} /></label>
        </div>
        <label>Lieblingshotel
          <select value={form.favourite_hotel_id} onChange={(event) => set({ favourite_hotel_id: event.target.value })}>
            <option value="">–</option>
            {hotels.map((hotel) => <option key={hotel.id} value={hotel.id}>{hotel.name}</option>)}
          </select>
        </label>
        <label className="portal-check">
          <input type="checkbox" checked={form.marketing_opt_in} onChange={(event) => set({ marketing_opt_in: event.target.checked })} />
          <span>Angebote und Neuigkeiten per E-Mail erhalten</span>
        </label>
        <button type="submit" className="portal-btn">Speichern</button>
      </form>

      <form className="portal-card portal-form" onSubmit={changePassword}>
        <h2 className="heading">Passwort ändern</h2>
        <label>Neues Passwort<input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        <button type="submit" className="portal-btn portal-btn--ghost">Passwort ändern</button>
      </form>

      <div className="portal-card">
        <p className="portal-muted">Mitgliedsnummer {member.member_number} · Mitglied seit {new Date(member.created_at).getFullYear()}</p>
        {contact ? <p className="portal-muted">Konto löschen oder Daten anfordern: <a href={`mailto:${contact}?subject=Mitgliedskonto ${member.member_number}`}>{contact}</a></p> : null}
        <button type="button" className="portal-btn portal-btn--ghost" onClick={() => void signOut()}>Abmelden</button>
      </div>
    </div>
  );
}
