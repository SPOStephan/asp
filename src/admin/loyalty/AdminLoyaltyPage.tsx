import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { managedOrgs, useAdminAuth } from '../AdminAuth';
import { parseStays } from './importStays';

type Tier = { id: string; name: string; min_points: number };
type Settings = {
  points_per_euro: number;
  direct_bonus_percent: number;
  points_valid_months: number;
  tier_window_months: number;
  stamp_goal: number;
  tiers: Tier[];
  member_rate_code?: string;
  member_rate_param?: string;
  contact_email?: string;
};
type Benefit = {
  id?: string;
  hotel_id: string | null;
  kind: 'perk' | 'reward' | 'rate';
  title: string;
  description: string;
  image: string;
  min_tier: string;
  points_cost: number | null;
  code: string;
  link: string;
  active: boolean;
  valid_until: string | null;
  sort_order: number;
};
type MemberRow = { user_id: string; member_number: string; email: string; first_name: string; last_name: string; created_at: string; balance: number };

const DEFAULT_SETTINGS: Settings = {
  points_per_euro: 1,
  direct_bonus_percent: 25,
  points_valid_months: 36,
  tier_window_months: 24,
  stamp_goal: 10,
  tiers: [
    { id: 'classic', name: 'Classic', min_points: 0 },
    { id: 'silber', name: 'Silber', min_points: 2500 },
    { id: 'gold', name: 'Gold', min_points: 7500 },
  ],
};

const EMPTY_BENEFIT: Benefit = { hotel_id: null, kind: 'perk', title: '', description: '', image: '', min_tier: '', points_cost: null, code: '', link: '', active: true, valid_until: null, sort_order: 0 };

export function AdminLoyaltyPage() {
  const { admin } = useAdminAuth();
  const orgs = managedOrgs(admin);
  const [orgId, setOrgId] = useState(orgs[0]?.id ?? '');
  const [tab, setTab] = useState<'programm' | 'vorteile' | 'reisen' | 'mitglieder'>('programm');
  const [hotels, setHotels] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId && orgs[0]) setOrgId(orgs[0].id);
  }, [orgId, orgs]);

  useEffect(() => {
    if (!orgId) return;
    void supabase.from('hotels').select('id, name, slug').eq('organization_id', orgId).order('name').then(({ data }) => setHotels(data ?? []));
  }, [orgId]);

  if (!orgs.length) return <p className="admin-muted">Das Treueprogramm verwalten Inhaber und Admins einer Organisation.</p>;

  return (
    <>
      <h2>Treueprogramm</h2>
      <p className="lead">Mitglieder melden sich im Mitgliederportal an und sehen dort Reisen, Punkte und Vorteile.</p>
      {orgs.length > 1 ? (
        <label className="admin-inline">
          Organisation{' '}
          <select value={orgId} onChange={(event) => setOrgId(event.target.value)}>
            {orgs.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
          </select>
        </label>
      ) : null}
      <div className="admin-tabs" role="tablist">
        {(['programm', 'vorteile', 'reisen', 'mitglieder'] as const).map((key) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'is-on' : undefined} onClick={() => { setTab(key); setNote(null); setError(null); }}>
            {{ programm: 'Programm', vorteile: 'Vorteile', reisen: 'Reisen importieren', mitglieder: 'Mitglieder' }[key]}
          </button>
        ))}
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      {note ? <p className="admin-note">{note}</p> : null}
      {orgId && tab === 'programm' ? <ProgramForm orgId={orgId} onError={setError} onNote={setNote} /> : null}
      {orgId && tab === 'vorteile' ? <BenefitsEditor orgId={orgId} hotels={hotels} onError={setError} onNote={setNote} /> : null}
      {orgId && tab === 'reisen' ? <StayImport orgId={orgId} hotels={hotels} onError={setError} onNote={setNote} /> : null}
      {orgId && tab === 'mitglieder' ? <Members orgId={orgId} onError={setError} onNote={setNote} /> : null}
    </>
  );
}

type Props = { orgId: string; onError: (value: string | null) => void; onNote: (value: string | null) => void };

function ProgramForm({ orgId, onError, onNote }: Props) {
  const [name, setName] = useState('Treueprogramm');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    void supabase.from('loyalty_programs').select('name, settings').eq('organization_id', orgId).maybeSingle().then(({ data }) => {
      if (data) {
        setName(data.name);
        setSettings({ ...DEFAULT_SETTINGS, ...(data.settings as Settings) });
      }
    });
  }, [orgId]);

  const set = (patch: Partial<Settings>) => setSettings({ ...settings, ...patch });

  async function save(event: FormEvent) {
    event.preventDefault();
    const { error } = await supabase.from('loyalty_programs').upsert({ organization_id: orgId, name, settings, updated_at: new Date().toISOString() });
    if (error) onError(error.message);
    else onNote('Programm gespeichert.');
  }

  return (
    <form className="admin-form admin-form--wide" onSubmit={(event) => void save(event)}>
      <label>Name des Programms<input value={name} onChange={(event) => setName(event.target.value)} /></label>
      <fieldset>
        <legend>Punkte</legend>
        <label>Punkte pro Euro (Logis)<input type="number" step="0.1" min="0" value={settings.points_per_euro} onChange={(event) => set({ points_per_euro: Number(event.target.value) })} /></label>
        <label>Bonus für Direktbuchungen (%)<input type="number" min="0" value={settings.direct_bonus_percent} onChange={(event) => set({ direct_bonus_percent: Number(event.target.value) })} /></label>
        <label>Punkte gültig (Monate)<input type="number" min="1" value={settings.points_valid_months} onChange={(event) => set({ points_valid_months: Number(event.target.value) })} /></label>
        <label>Stammgastpass: Stempel bis zur Gratisnacht<input type="number" min="1" value={settings.stamp_goal} onChange={(event) => set({ stamp_goal: Number(event.target.value) })} /></label>
      </fieldset>
      <fieldset>
        <legend>Stufen (Punkte der letzten {settings.tier_window_months} Monate)</legend>
        <label>Zeitraum für die Stufe (Monate)<input type="number" min="1" value={settings.tier_window_months} onChange={(event) => set({ tier_window_months: Number(event.target.value) })} /></label>
        {settings.tiers.map((tier, index) => (
          <div key={index} className="admin-row">
            <input aria-label="Name der Stufe" value={tier.name} onChange={(event) => set({ tiers: settings.tiers.map((item, i) => (i === index ? { ...item, name: event.target.value, id: item.id || event.target.value.toLowerCase() } : item)) })} />
            <input aria-label="ab Punkten" type="number" min="0" value={tier.min_points} onChange={(event) => set({ tiers: settings.tiers.map((item, i) => (i === index ? { ...item, min_points: Number(event.target.value) } : item)) })} />
          </div>
        ))}
      </fieldset>
      <fieldset>
        <legend>Mitgliederpreis und Kontakt</legend>
        <label>Mitglieder-Code der Buchungsstrecke<input value={settings.member_rate_code ?? ''} onChange={(event) => set({ member_rate_code: event.target.value })} placeholder="z. B. MEMBER" /></label>
        <label>Parameter in der Buchungs-URL<input value={settings.member_rate_param ?? ''} onChange={(event) => set({ member_rate_param: event.target.value })} placeholder="z. B. code" /></label>
        <label>Kontakt-E-Mail für Mitglieder<input type="email" value={settings.contact_email ?? ''} onChange={(event) => set({ contact_email: event.target.value })} /></label>
      </fieldset>
      <div className="admin-actions"><button type="submit" className="admin-btn admin-btn--gold">Speichern</button></div>
    </form>
  );
}

function BenefitsEditor({ orgId, hotels, onError, onNote }: Props & { hotels: Array<{ id: string; name: string }> }) {
  const [items, setItems] = useState<Benefit[]>([]);
  const [draft, setDraft] = useState<Benefit | null>(null);
  const [tiers, setTiers] = useState<Tier[]>(DEFAULT_SETTINGS.tiers);

  const load = useCallback(async () => {
    const [rows, program] = await Promise.all([
      supabase.from('loyalty_benefits').select('*').eq('organization_id', orgId).order('sort_order'),
      supabase.from('loyalty_programs').select('settings').eq('organization_id', orgId).maybeSingle(),
    ]);
    setItems((rows.data ?? []) as Benefit[]);
    setTiers(((program.data?.settings as Settings | undefined)?.tiers ?? DEFAULT_SETTINGS.tiers) as Tier[]);
  }, [orgId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const row = { ...draft, organization_id: orgId, points_cost: draft.points_cost || null, valid_until: draft.valid_until || null, hotel_id: draft.hotel_id || null };
    const { error } = draft.id ? await supabase.from('loyalty_benefits').update(row).eq('id', draft.id) : await supabase.from('loyalty_benefits').insert(row);
    if (error) return onError(error.message);
    onNote('Vorteil gespeichert.');
    setDraft(null);
    await load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from('loyalty_benefits').delete().eq('id', id);
    if (error) onError(error.message);
    else await load();
  }

  const set = (patch: Partial<Benefit>) => setDraft(draft ? { ...draft, ...patch } : draft);

  return (
    <>
      <table className="admin-table">
        <thead><tr><th>Vorteil</th><th>Art</th><th>Hotel</th><th>Stufe</th><th>Punkte</th><th>Aktiv</th><th /></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{{ perk: 'Vorteil', reward: 'Prämie', rate: 'Mitgliederpreis' }[item.kind]}</td>
              <td>{hotels.find((hotel) => hotel.id === item.hotel_id)?.name ?? 'alle'}</td>
              <td>{tiers.find((tier) => tier.id === item.min_tier)?.name ?? '–'}</td>
              <td>{item.points_cost ?? '–'}</td>
              <td>{item.active ? 'ja' : 'nein'}</td>
              <td>
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setDraft(item)}>Bearbeiten</button>{' '}
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void remove(item.id!)}>Löschen</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="admin-actions"><button type="button" className="admin-btn" onClick={() => setDraft({ ...EMPTY_BENEFIT, sort_order: items.length })}>+ Vorteil anlegen</button></div>
      {draft ? (
        <form className="admin-form admin-form--wide" onSubmit={(event) => void save(event)}>
          <label>Titel<input required value={draft.title} onChange={(event) => set({ title: event.target.value })} /></label>
          <label>Beschreibung<input value={draft.description} onChange={(event) => set({ description: event.target.value })} /></label>
          <label>Art
            <select value={draft.kind} onChange={(event) => set({ kind: event.target.value as Benefit['kind'] })}>
              <option value="perk">Vorteil (automatisch, z. B. Late Check-out)</option>
              <option value="reward">Prämie (gegen Punkte)</option>
              <option value="rate">Mitgliederpreis</option>
            </select>
          </label>
          <label>Hotel
            <select value={draft.hotel_id ?? ''} onChange={(event) => set({ hotel_id: event.target.value || null })}>
              <option value="">Alle Hotels</option>
              {hotels.map((hotel) => <option key={hotel.id} value={hotel.id}>{hotel.name}</option>)}
            </select>
          </label>
          <label>Ab Stufe
            <select value={draft.min_tier} onChange={(event) => set({ min_tier: event.target.value })}>
              <option value="">alle Mitglieder</option>
              {tiers.map((tier) => <option key={tier.id} value={tier.id}>{tier.name}</option>)}
            </select>
          </label>
          <label>Punkte (leer = ohne Punkte)<input type="number" min="1" value={draft.points_cost ?? ''} onChange={(event) => set({ points_cost: event.target.value ? Number(event.target.value) : null })} /></label>
          <label>Fester Gutscheincode (leer = je Einlösung neu)<input value={draft.code} onChange={(event) => set({ code: event.target.value })} /></label>
          <label>Link (optional)<input value={draft.link} onChange={(event) => set({ link: event.target.value })} /></label>
          <label>Bild-URL (optional)<input value={draft.image} onChange={(event) => set({ image: event.target.value })} /></label>
          <label>Gültig bis<input type="date" value={draft.valid_until ?? ''} onChange={(event) => set({ valid_until: event.target.value || null })} /></label>
          <label className="admin-check"><input type="checkbox" checked={draft.active} onChange={(event) => set({ active: event.target.checked })} /> aktiv</label>
          <div className="admin-actions">
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setDraft(null)}>Abbrechen</button>
            <button type="submit" className="admin-btn admin-btn--gold">Speichern</button>
          </div>
        </form>
      ) : null}
    </>
  );
}

function StayImport({ orgId, hotels, onError, onNote }: Props & { hotels: Array<{ id: string; name: string; slug: string }> }) {
  const [text, setText] = useState('');
  const parsed = useMemo(() => (text.trim() ? parseStays(text) : null), [text]);
  const findHotel = (value: string) => {
    const v = value.trim().toLowerCase();
    return hotels.find((hotel) => hotel.slug === v || hotel.name.toLowerCase() === v) ?? hotels.find((hotel) => v && hotel.name.toLowerCase().includes(v));
  };

  async function run() {
    if (!parsed?.rows.length) return;
    const rows = parsed.rows.map(({ hotel, ...row }) => {
      const match = findHotel(hotel);
      return { ...row, organization_id: orgId, hotel_id: match?.id ?? null, hotel_name: match?.name ?? hotel, updated_at: new Date().toISOString() };
    });
    const { error } = await supabase.from('loyalty_stays').upsert(rows, { onConflict: 'organization_id,booking_ref' });
    if (error) return onError(error.message);
    // Stays of existing members are linked through their e-mail address.
    const members = await supabase.from('loyalty_members').select('user_id, email').eq('organization_id', orgId);
    for (const member of members.data ?? []) {
      await supabase.from('loyalty_stays').update({ member_id: member.user_id }).eq('organization_id', orgId).is('member_id', null).ilike('guest_email', member.email.replace(/[%_\\]/g, (char: string) => `\\${char}`));
    }
    onNote(`${rows.length} Reisen übernommen. Abgereiste Aufenthalte von Mitgliedern bringen ihre Punkte automatisch.`);
    setText('');
  }

  return (
    <div className="admin-form admin-form--wide">
      <p className="admin-muted">
        Export aus dem Buchungssystem als CSV einfügen (Kopfzeile + eine Zeile je Buchung). Erkannte Spalten: Buchungsnummer, Hotel,
        E-Mail, Name, Anreise, Abreise, Zimmer, Personen, Betrag, Kanal, Status. Gleiche Buchungsnummern werden aktualisiert.
      </p>
      <textarea rows={10} value={text} onChange={(event) => setText(event.target.value)} placeholder={'Buchungsnummer;Hotel;E-Mail;Name;Anreise;Abreise;Zimmer;Betrag;Kanal;Status\nA-1001;Hotel am See;erika@example.de;Erika Muster;10.03.2026;13.03.2026;Doppelzimmer;780,00;Direkt;abgereist'} />
      {parsed ? (
        <p className="admin-muted">
          {parsed.rows.length} Reisen erkannt{parsed.rows.some((row) => !findHotel(row.hotel)) ? ' · Achtung: nicht jedes Hotel wurde zugeordnet' : ''}.
          {parsed.problems.map((problem) => <span key={problem}><br />{problem}</span>)}
        </p>
      ) : null}
      <div className="admin-actions"><button type="button" className="admin-btn admin-btn--gold" disabled={!parsed?.rows.length} onClick={() => void run()}>Reisen übernehmen</button></div>
    </div>
  );
}

function Members({ orgId, onError, onNote }: Props) {
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [query, setQuery] = useState('');
  const [booking, setBooking] = useState<{ member: MemberRow; points: number; reason: string } | null>(null);

  const load = useCallback(async () => {
    const [members, ledger] = await Promise.all([
      supabase.from('loyalty_members').select('user_id, member_number, email, first_name, last_name, created_at').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(500),
      supabase.from('loyalty_ledger').select('member_id, points, expires_at').eq('organization_id', orgId),
    ]);
    const now = new Date().toISOString();
    const balance = new Map<string, number>();
    for (const row of ledger.data ?? []) {
      if (row.expires_at && row.expires_at < now) continue;
      balance.set(row.member_id, (balance.get(row.member_id) ?? 0) + row.points);
    }
    setRows(((members.data ?? []) as Omit<MemberRow, 'balance'>[]).map((member) => ({ ...member, balance: balance.get(member.user_id) ?? 0 })));
  }, [orgId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function book(event: FormEvent) {
    event.preventDefault();
    if (!booking) return;
    const { error } = await supabase.from('loyalty_ledger').insert({ organization_id: orgId, member_id: booking.member.user_id, points: booking.points, reason: booking.reason });
    if (error) return onError(error.message);
    onNote(`${booking.points} Punkte für ${booking.member.first_name} ${booking.member.last_name} gebucht.`);
    setBooking(null);
    await load();
  }

  const needle = query.trim().toLowerCase();
  const visible = rows.filter((row) => !needle || `${row.first_name} ${row.last_name} ${row.email} ${row.member_number}`.toLowerCase().includes(needle));

  return (
    <>
      <div className="admin-form"><label>Suchen<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, E-Mail oder Mitgliedsnummer" /></label></div>
      <table className="admin-table">
        <thead><tr><th>Name</th><th>E-Mail</th><th>Nummer</th><th>Punkte</th><th>seit</th><th /></tr></thead>
        <tbody>
          {visible.map((row) => (
            <tr key={row.user_id}>
              <td>{row.first_name} {row.last_name}</td>
              <td>{row.email}</td>
              <td>{row.member_number}</td>
              <td>{row.balance}</td>
              <td>{new Date(row.created_at).toLocaleDateString('de-DE')}</td>
              <td><button type="button" className="admin-btn admin-btn--ghost" onClick={() => setBooking({ member: row, points: 100, reason: 'Kulanz' })}>Punkte buchen</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {!visible.length ? <p className="admin-muted">Noch keine Mitglieder.</p> : null}
      {booking ? (
        <form className="admin-form" onSubmit={(event) => void book(event)}>
          <p>{booking.member.first_name} {booking.member.last_name}</p>
          <label>Punkte (negativ zum Abziehen)<input type="number" value={booking.points} onChange={(event) => setBooking({ ...booking, points: Number(event.target.value) })} /></label>
          <label>Grund<input required value={booking.reason} onChange={(event) => setBooking({ ...booking, reason: event.target.value })} /></label>
          <div className="admin-actions">
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setBooking(null)}>Abbrechen</button>
            <button type="submit" className="admin-btn admin-btn--gold">Buchen</button>
          </div>
        </form>
      ) : null}
    </>
  );
}
