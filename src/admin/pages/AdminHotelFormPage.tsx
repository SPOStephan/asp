import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { COLOR_WORLDS, hotelColorsFromWorld, type ColorWorld } from '../../lib/colorWorlds';

const EMPTY = {
  name: '',
  slug: '',
  domains: '',
  booking_url: '',
  phone: '',
  email: '',
  address: '',
  color_world: 'blue' as ColorWorld,
  is_active: true,
};

function parseDomains(value: string) {
  return value
    .split(/[, \n]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function AdminHotelFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const [form, setForm] = useState(EMPTY);
  const [initialWorld, setInitialWorld] = useState<ColorWorld>('blue');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    void supabase
      .from('hotels')
      .select('name, slug, domains, booking_url, phone, email, address, color_world, is_active')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (queryError) setError(queryError.message);
        if (data) {
          const world = (data.color_world as ColorWorld) || 'blue';
          setInitialWorld(world);
          setForm({
            name: data.name ?? '',
            slug: data.slug ?? '',
            domains: Array.isArray(data.domains) ? data.domains.join(', ') : '',
            booking_url: data.booking_url ?? '',
            phone: data.phone ?? '',
            email: data.email ?? '',
            address: data.address ?? '',
            color_world: world,
            is_active: Boolean(data.is_active),
          });
        }
      });
  }, [id]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      domains: parseDomains(form.domains),
      booking_url: form.booking_url.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      color_world: form.color_world,
      is_active: form.is_active,
    };
    if (isNew || form.color_world !== initialWorld) {
      Object.assign(payload, hotelColorsFromWorld(form.color_world));
    }
    if (isNew) {
      payload.heading_font = 'Newsreader';
      payload.body_font = 'Inter';
    }
    const result = isNew
      ? await supabase.from('hotels').insert(payload)
      : await supabase.from('hotels').update(payload).eq('id', id);
    if (result.error) setError(result.error.message);
    else navigate('/admin');
    setBusy(false);
  }

  return (
    <>
      <p>
        <Link to="/admin">← Hotels</Link>
      </p>
      <h2>{isNew ? 'Neues Hotel' : 'Hotel bearbeiten'}</h2>
      <p className="lead">Domain, Farbwelt und Stammdaten. Inhalte kommen später im visuellen Editor auf der echten Seite.</p>
      <form className="admin-form" onSubmit={(event) => void onSubmit(event)}>
        <label>
          Name
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label>
          Slug
          <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} required />
        </label>
        <label>
          Domains
          <input
            value={form.domains}
            onChange={(event) => setForm({ ...form, domains: event.target.value })}
            placeholder="asp.lohbeckhotels.de, hotel-ambassador.de"
          />
        </label>
        <label>
          Buchungs-URL
          <input value={form.booking_url} onChange={(event) => setForm({ ...form, booking_url: event.target.value })} />
        </label>
        <label>
          Telefon
          <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        </label>
        <label>
          E-Mail
          <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label>
          Adresse
          <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
        </label>
        <fieldset>
          <legend>Farbwelt</legend>
          {COLOR_WORLDS.map((world) => (
            <label key={world.id} className="admin-choice">
              <input
                type="radio"
                name="color_world"
                checked={form.color_world === world.id}
                onChange={() => setForm({ ...form, color_world: world.id })}
              />
              <span className="admin-dot" style={{ background: world.primary }} />
              {world.label}
            </label>
          ))}
        </fieldset>
        <label className="admin-choice">
          <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
          Aktiv
        </label>
        {error ? <p className="admin-error">{error}</p> : null}
        <div className="admin-actions">
          <button type="submit" className="admin-btn" disabled={busy}>
            Speichern
          </button>
        </div>
      </form>
    </>
  );
}
