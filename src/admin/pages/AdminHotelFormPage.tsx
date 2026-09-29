import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { COLOR_WORLDS, hotelColorsFromWorld, type ColorWorld } from '../../lib/colorWorlds';
import { applyHotelPageSelection, cloneHotelContent, loadPageTemplates, saveHotelRecord } from '../../lib/applyHotelPages';
import { canResumeHotelSlug, findHotelBySlug } from '../../lib/hotelSave';
import { defaultSelectedKeys, type PageTemplate } from '../../lib/pageTemplates';
import { publicHotelOrigin } from '../../lib/musterPages';

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

function explainHotelSaveError(message?: string | null) {
  if (!message) return 'Hotel konnte nicht gespeichert werden.';
  if (/hotel_pages_page_key_check/i.test(message)) {
    return 'Supabase blockiert neue Seiten-Keys (home, impressum, …). In SQL Editor ausführen: ALTER TABLE hotel_pages DROP CONSTRAINT IF EXISTS hotel_pages_page_key_check; Danach das vorhandene Hotel öffnen und speichern — nicht noch einmal anlegen.';
  }
  if (/hotels_slug_key/i.test(message)) {
    return 'Dieses Hotel existiert schon (gleicher Slug) vom ersten Versuch. Zurück zur Hotel-Liste, das Haus öffnen und dort speichern — nicht noch einmal unter + Hotel anlegen.';
  }
  return message;
}

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
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [pages, setPages] = useState<Record<string, boolean>>({});
  const [hotels, setHotels] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [cloneFromId, setCloneFromId] = useState('');
  const [cloneContent, setCloneContent] = useState(isNew);

  useEffect(() => {
    void supabase
      .from('hotels')
      .select('id, name, slug')
      .order('name')
      .then(({ data }) => {
        const list = ((data ?? []) as Array<{ id: string; name: string; slug: string }>).filter(
          (hotel) => hotel.id !== id,
        );
        setHotels(list);
        const ambassador = list.find((hotel) => hotel.slug === 'ambassador-hotel-spa');
        setCloneFromId(ambassador?.id ?? list[0]?.id ?? '');
      });
  }, [id]);

  useEffect(() => {
    void loadPageTemplates().then((list) => {
      setTemplates(list);
      if (isNew) {
        const selected = new Set(defaultSelectedKeys(list));
        setPages(Object.fromEntries(list.map((item) => [item.template_key, selected.has(item.template_key)])));
      }
    });
  }, [isNew]);

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
    void supabase
      .from('hotel_pages')
      .select('page_key, enabled')
      .eq('hotel_id', id)
      .then(({ data }) => {
        if (!data?.length) return;
        setPages((current) => {
          const next = { ...current };
          for (const row of data) next[row.page_key] = row.enabled !== false;
          return next;
        });
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
    const result = await saveHotelRecord(
      { ...payload, slug: String(payload.slug) },
      isNew ? undefined : id,
    );
    if (result.error || !result.id) {
      setError(explainHotelSaveError(result.error) ?? 'Hotel konnte nicht gespeichert werden.');
      setBusy(false);
      return;
    }
    const hotelId = result.id;
    const selected = Object.entries(pages)
      .filter(([, on]) => on)
      .map(([key]) => key);
    const applied = await applyHotelPageSelection(hotelId, selected, templates);
    if (applied.error) {
      setError(explainHotelSaveError(applied.error));
      setBusy(false);
      return;
    }
    if (cloneContent && cloneFromId) {
      const cloned = await cloneHotelContent(cloneFromId, hotelId);
      if (cloned.error) {
        setError(explainHotelSaveError(cloned.error));
        setBusy(false);
        return;
      }
    }
    navigate('/admin');
    setBusy(false);
  }

  const system = templates.filter((item) => item.kind === 'system');
  const library = templates.filter((item) => item.kind === 'library');
  const slugOwner = isNew ? findHotelBySlug(hotels, form.slug) : undefined;

  return (
    <>
      <p>
        <Link to="/admin">← Hotels</Link>
      </p>
      <h2>{isNew ? 'Neues Hotel' : 'Hotel bearbeiten'}</h2>
      <p className="lead">
        Stammdaten und die Seiten, die dieses Haus bekommt. Bilder (Logo, Header, Galerie) sitzen im CMS — ohne Kopie
        bleiben sie leer, die Seite zeigt dann Muster-Platzhalter. Für einen Piloten Inhalte vom Ambassador kopieren.
      </p>
      {!isNew && publicHotelOrigin(parseDomains(form.domains)) ? (
        <p className="admin-actions">
          <a className="admin-btn admin-btn--gold" href={`${publicHotelOrigin(parseDomains(form.domains))}/cms`}>
            Startseite visuell bearbeiten
          </a>
          <a className="admin-btn admin-btn--ghost" href={`${publicHotelOrigin(parseDomains(form.domains))}/cms/zimmer`}>
            Zimmer visuell bearbeiten
          </a>
        </p>
      ) : null}
      <form className="admin-form admin-form--wide" onSubmit={(event) => void onSubmit(event)}>
        <label>
          Name
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label>
          Slug
          <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} required />
        </label>
        {isNew && slugOwner ? (
          <p className={canResumeHotelSlug(form.slug) ? 'admin-muted' : 'admin-error'}>
            {canResumeHotelSlug(form.slug) ? (
              <>
                Dieser Slug gehört schon zu {slugOwner.name}. Speichern führt das vorhandene Haus weiter — oder{' '}
                <Link to={`/admin/hotels/${slugOwner.id}`}>jetzt öffnen</Link>.
              </>
            ) : (
              <>
                Dieser Slug ist der Ambassador. Bitte einen eigenen Slug für das neue Haus wählen — oder{' '}
                <Link to={`/admin/hotels/${slugOwner.id}`}>Ambassador öffnen</Link>.
              </>
            )}
          </p>
        ) : null}
        <label>
          Domains
          <input
            value={form.domains}
            onChange={(event) => setForm({ ...form, domains: event.target.value })}
            placeholder="neues-hotel.lohbeckhotels.de"
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
        {hotels.length ? (
          <fieldset>
            <legend>Startinhalt</legend>
            <label className="admin-choice">
              <input type="checkbox" checked={cloneContent} onChange={(event) => setCloneContent(event.target.checked)} />
              {isNew
                ? 'Inhalte eines bestehenden Hotels kopieren (Blöcke, Texte, Bilder, FAQ)'
                : 'Inhalte jetzt von einem bestehenden Hotel übernehmen (überschreibt die Blöcke dieses Hauses)'}
            </label>
            {cloneContent ? (
              <label>
                Quelle
                <select value={cloneFromId} onChange={(event) => setCloneFromId(event.target.value)} required>
                  {hotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name} ({hotel.slug})
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="admin-muted">Ohne Kopie entstehen leere Seiten-Container.</p>
            )}
          </fieldset>
        ) : null}
        <fieldset>
          <legend>Seiten für dieses Hotel</legend>
          <p className="admin-muted">
            {cloneContent
              ? 'Haken steuert, welche Seiten erreichbar sind. Die kopierten Inhalte bleiben erhalten.'
              : 'Haken = leerer Container. Logo und Header bekommen Muster-Platzhalter, den Rest füllt ihr im Editor oder per Kopie.'}
          </p>
          {[...system, ...library].map((page) => (
            <label key={page.template_key} className="admin-choice">
              <input
                type="checkbox"
                checked={page.required || pages[page.template_key] === true}
                disabled={page.required}
                onChange={(event) => setPages({ ...pages, [page.template_key]: event.target.checked })}
              />
              <span>
                {page.title}
                {page.required ? ' · immer an' : page.default_selected ? ' · Standard' : ''}
                {page.kind === 'library' ? ' · Bibliothek' : ''}
                <small className="admin-muted"> {page.tags.join(', ')}</small>
              </span>
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
          <Link className="admin-btn admin-btn--ghost" to="/admin/vorlagen">
            Zur Bibliothek
          </Link>
        </div>
      </form>
    </>
  );
}
