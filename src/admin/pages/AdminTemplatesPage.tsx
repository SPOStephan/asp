import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { applyHotelPageSelection, loadPageTemplates, saveLibraryTemplate, updateLibraryTemplate } from '../../lib/applyHotelPages';
import {
  matchesTemplateQuery,
  templateFromLibraryDraft,
  type PageTemplate,
} from '../../lib/pageTemplates';

type HotelRow = { id: string; name: string; slug: string };

export function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [hotels, setHotels] = useState<HotelRow[]>([]);
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [assignHotel, setAssignHotel] = useState('');
  const [draft, setDraft] = useState({ title: '', template_key: '', tags: '', description: '', preview_url: '' });
  const [fromHotel, setFromHotel] = useState('');
  const [fromPage, setFromPage] = useState('');
  const [fromTitle, setFromTitle] = useState('');
  const [fromTags, setFromTags] = useState('');
  const [hotelPages, setHotelPages] = useState<Array<{ page_key: string; enabled: boolean }>>([]);

  async function reload() {
    const [list, hotelResult] = await Promise.all([
      loadPageTemplates(),
      supabase.from('hotels').select('id, name, slug').order('name'),
    ]);
    setTemplates(list);
    if (hotelResult.error) setError(hotelResult.error.message);
    else setHotels((hotelResult.data ?? []) as HotelRow[]);
  }

  useEffect(() => {
    void reload();
  }, []);

  useEffect(() => {
    if (!fromHotel) {
      setHotelPages([]);
      return;
    }
    void supabase
      .from('hotel_pages')
      .select('page_key, enabled')
      .eq('hotel_id', fromHotel)
      .then(({ data, error: queryError }) => {
        if (queryError) setError(queryError.message);
        setHotelPages((data ?? []) as Array<{ page_key: string; enabled: boolean }>);
      });
  }, [fromHotel]);

  const tags = useMemo(() => [...new Set(templates.flatMap((item) => item.tags))].sort(), [templates]);
  const visible = templates.filter((item) => matchesTemplateQuery(item, query) && (!tag || item.tags.includes(tag)));

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNote(null);
    const template = templateFromLibraryDraft({
      title: draft.title,
      template_key: draft.template_key || draft.title,
      description: draft.description,
      tags: draft.tags.split(/[, ]+/),
      preview_url: draft.preview_url || null,
    });
    const result = await saveLibraryTemplate(template);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDraft({ title: '', template_key: '', tags: '', description: '', preview_url: '' });
    setNote(`Vorlage „${template.title}“ liegt in der Bibliothek.`);
    await reload();
  }

  async function onSaveFromHotel(event: FormEvent) {
    event.preventDefault();
    if (!fromHotel || !fromPage) return;
    setBusy(true);
    setError(null);
    setNote(null);
    const source = templates.find((item) => item.template_key === fromPage);
    const sectionKeys = source?.section_keys?.length ? source.section_keys : [];
    const { data, error: queryError } = await supabase
      .from('hotel_sections')
      .select('section_key, data')
      .eq('hotel_id', fromHotel)
      .in('section_key', sectionKeys.length ? sectionKeys : ['__none__']);
    if (queryError) {
      setBusy(false);
      setError(queryError.message);
      return;
    }
    const sectionData = Object.fromEntries((data ?? []).map((row) => [row.section_key, row.data ?? {}]));
    const template = templateFromLibraryDraft({
      title: fromTitle || source?.title || fromPage,
      template_key: fromTitle || `${fromPage}-vorlage`,
      tags: fromTags.split(/[, ]+/),
      description: `Leerer Container nach ${source?.title ?? fromPage}.`,
      layout_key: source?.layout_key === 'home' ? 'generic' : source?.layout_key,
      section_data: Object.keys(sectionData).length ? sectionData : source?.skeleton,
      created_from_hotel_id: fromHotel,
    });
    const result = await saveLibraryTemplate(template);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setFromTitle('');
    setFromTags('');
    setNote(`„${template.title}“ wurde ohne Inhalte als Vorlage gespeichert.`);
    await reload();
  }

  async function assign(template: PageTemplate) {
    if (!assignHotel) {
      setError('Bitte zuerst ein Hotel wählen.');
      return;
    }
    setBusy(true);
    setError(null);
    setNote(null);
    const { data } = await supabase.from('hotel_pages').select('page_key, enabled').eq('hotel_id', assignHotel);
    const selected = [
      ...new Set([
        ...(data ?? []).filter((row) => row.enabled !== false).map((row) => String(row.page_key)),
        template.template_key,
      ]),
    ];
    const result = await applyHotelPageSelection(assignHotel, selected, templates);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    const hotel = hotels.find((item) => item.id === assignHotel);
    setNote(`„${template.title}“ ist jetzt für ${hotel?.name ?? 'das Hotel'} aktiv.`);
  }

  async function saveMeta(template: PageTemplate, preview_url: string, tagsValue: string) {
    if (!template.id) return;
    const result = await updateLibraryTemplate(template.id, {
      preview_url: preview_url || null,
      tags: tagsValue.split(/[, ]+/).map((item) => item.trim().toLowerCase()).filter(Boolean),
    });
    if (result.error) setError(result.error);
    else await reload();
  }

  return (
    <>
      <div className="admin-row">
        <div>
          <h2>Seiten-Bibliothek</h2>
          <p className="lead">
            Leere Container aus dem Ambassador-Layout und jede später gesicherte Hotel-Seite. Suche über Titel oder Tags,
            Vorschau zeigt das Gerüst.
          </p>
        </div>
        <Link className="admin-btn admin-btn--ghost" to="/admin">
          Zu den Hotels
        </Link>
      </div>

      <div className="admin-library-toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Suche nach Titel, Tag, Pfad…"
        />
        <select value={assignHotel} onChange={(event) => setAssignHotel(event.target.value)}>
          <option value="">Hotel für Zuweisung…</option>
          {hotels.map((hotel) => (
            <option key={hotel.id} value={hotel.id}>
              {hotel.name}
            </option>
          ))}
        </select>
      </div>
      <div className="admin-tag-row">
        <button type="button" className={!tag ? 'is-on' : undefined} onClick={() => setTag('')}>
          Alle
        </button>
        {tags.map((item) => (
          <button key={item} type="button" className={tag === item ? 'is-on' : undefined} onClick={() => setTag(item)}>
            {item}
          </button>
        ))}
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      {note ? <p className="admin-note">{note}</p> : null}

      <div className="admin-template-grid">
        {visible.map((template) => (
          <article key={template.template_key} className="admin-template-card">
            <TemplatePreview template={template} />
            <div className="admin-template-card__body">
              <h3>{template.title}</h3>
              <p>{template.description}</p>
              <p className="admin-muted">
                {template.path_prefix} · {template.kind === 'system' ? 'System' : 'Bibliothek'}
              </p>
              <p className="admin-tag-row">
                {template.tags.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </p>
              {template.id ? (
                <TemplateMeta
                  template={template}
                  onSave={(preview, nextTags) => void saveMeta(template, preview, nextTags)}
                />
              ) : null}
              <button type="button" className="admin-btn" disabled={busy} onClick={() => void assign(template)}>
                Diesem Hotel geben
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="admin-library-forms">
        <form className="admin-card admin-form" onSubmit={(event) => void onCreate(event)}>
          <h3>Neue leere Vorlage</h3>
          <label>
            Titel
            <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required />
          </label>
          <label>
            Schlüssel
            <input
              value={draft.template_key}
              onChange={(event) => setDraft({ ...draft, template_key: event.target.value })}
              placeholder="hochzeit"
            />
          </label>
          <label>
            Tags
            <input
              value={draft.tags}
              onChange={(event) => setDraft({ ...draft, tags: event.target.value })}
              placeholder="hochzeit, events"
            />
          </label>
          <label>
            Beschreibung
            <input value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          </label>
          <label>
            Vorschaubild-URL
            <input value={draft.preview_url} onChange={(event) => setDraft({ ...draft, preview_url: event.target.value })} />
          </label>
          <button type="submit" className="admin-btn" disabled={busy}>
            In die Bibliothek legen
          </button>
        </form>

        <form className="admin-card admin-form" onSubmit={(event) => void onSaveFromHotel(event)}>
          <h3>Aus Hotel-Seite sichern</h3>
          <p className="admin-muted">Speichert die Struktur ohne Texte und Bilder, inkl. Tags für die Suche.</p>
          <label>
            Hotel
            <select value={fromHotel} onChange={(event) => setFromHotel(event.target.value)} required>
              <option value="">Hotel wählen…</option>
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Seite
            <select value={fromPage} onChange={(event) => setFromPage(event.target.value)} required>
              <option value="">Seite wählen…</option>
              {hotelPages
                .filter((row) => row.enabled !== false)
                .map((row) => (
                  <option key={row.page_key} value={row.page_key}>
                    {templates.find((item) => item.template_key === row.page_key)?.title ?? row.page_key}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Name der Vorlage
            <input value={fromTitle} onChange={(event) => setFromTitle(event.target.value)} placeholder="Hochzeit" />
          </label>
          <label>
            Tags
            <input value={fromTags} onChange={(event) => setFromTags(event.target.value)} placeholder="hochzeit, events" />
          </label>
          <button type="submit" className="admin-btn" disabled={busy}>
            Als leeren Container speichern
          </button>
        </form>
      </div>
    </>
  );
}

function TemplateMeta({
  template,
  onSave,
}: {
  template: PageTemplate;
  onSave: (preview: string, tags: string) => void;
}) {
  const [preview, setPreview] = useState(template.preview_url ?? '');
  const [tags, setTags] = useState(template.tags.join(', '));
  return (
    <div className="admin-template-meta">
      <input value={preview} onChange={(event) => setPreview(event.target.value)} placeholder="Vorschaubild-URL" />
      <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="tags" />
      <button type="button" className="admin-btn admin-btn--ghost" onClick={() => onSave(preview, tags)}>
        Metadaten speichern
      </button>
    </div>
  );
}

function TemplatePreview({ template }: { template: PageTemplate }) {
  if (template.preview_url) {
    return (
      <div className="tpl-preview">
        <img src={template.preview_url} alt="" />
      </div>
    );
  }
  return (
    <div className={`tpl-preview tpl-preview--${template.layout_key}`} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
