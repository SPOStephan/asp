import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useSection } from '../context/HotelContext';
import { BLOG_TOPICS } from '../lib/blog';
import { readFilters } from '../lib/listFilters';
import { useCms } from './CmsContext';
import { getPath, isPlainObject } from './cmsDraft';
import { CmsImageField } from './CmsImageField';
import { CmsLinkPicker } from './CmsLinkPicker';
import { matchesCmsEntry } from './cmsPages';
import { inferAltPath } from './cmsSelect';
import { CmsTextarea } from './CmsTextarea';

// The editor for one entry's own page (room, offer, wellness topic, occasion, journal post):
// pictures first – each with upload to Bunny, size advice and alt text – then every text with a
// plain German label. Changes show in the page preview at once; "Speichern" writes the block.
// Which fields an entry has is described below, per block; a new kind of page gets its own list.

type Sub = { key: string; label: string; long?: boolean; image?: boolean; link?: boolean };

export type EntryFieldSpec =
  | { kind: 'image'; key: string; label: string }
  | { kind: 'text'; key: string; label: string; long?: boolean }
  | { kind: 'date'; key: string; label: string }
  | { kind: 'paragraphs'; key: string; label: string }
  | { kind: 'lines'; key: string; label: string }
  | { kind: 'list'; key: string; label: string; item: string; fields: Sub[]; nested?: { key: string; label: string; item: string; fields: Sub[] } }
  | { kind: 'gallery'; key: string; label: string }
  | { kind: 'blocks'; key: string; label: string }
  | { kind: 'topic'; key: string; label: string }
  | { kind: 'promo'; key: string; label: string };

export type EntrySpec = { title: string; hub: string; hubLabel: string; pictures: EntryFieldSpec[]; texts: EntryFieldSpec[] };

const FACTS: Sub[] = [
  { key: 'label', label: 'Bezeichnung' },
  { key: 'value', label: 'Angabe' },
];

export const ENTRY_SPECS: Record<string, EntrySpec> = {
  rooms_page: {
    title: 'Zimmer',
    hub: '/cms/zimmer',
    hubLabel: 'Zur Zimmerübersicht',
    pictures: [
      { kind: 'image', key: 'hero_image', label: 'Großes Bild oben' },
      { kind: 'image', key: 'image', label: 'Bild in der Zimmerliste' },
      { kind: 'gallery', key: 'gallery', label: 'Galerie' },
    ],
    texts: [
      { kind: 'text', key: 'name', label: 'Name' },
      { kind: 'text', key: 'kicker', label: 'Zeile über dem Namen' },
      { kind: 'text', key: 'text', label: 'Kurztext (Zimmerliste)', long: true },
      { kind: 'paragraphs', key: 'detail_text', label: 'Beschreibung auf der Detailseite' },
      { kind: 'text', key: 'size', label: 'Größe' },
      { kind: 'text', key: 'view', label: 'Ausblick' },
      { kind: 'text', key: 'occupancy', label: 'Belegung' },
      { kind: 'text', key: 'price_from', label: 'Preis ab' },
      { kind: 'text', key: 'price_unit', label: 'Preis-Einheit' },
      { kind: 'lines', key: 'amenities', label: 'Ausstattung' },
    ],
  },
  offers_page: {
    title: 'Angebot',
    hub: '/cms/angebote',
    hubLabel: 'Zur Angebotsübersicht',
    pictures: [
      { kind: 'image', key: 'hero_image', label: 'Großes Bild oben' },
      { kind: 'image', key: 'image', label: 'Bild in der Angebotsliste' },
    ],
    texts: [
      { kind: 'text', key: 'title', label: 'Name des Angebots (kleine Zeile oben)' },
      { kind: 'text', key: 'subtitle', label: 'Überschrift' },
      { kind: 'text', key: 'text', label: 'Kurztext (Angebotsliste)', long: true },
      { kind: 'paragraphs', key: 'detail_text', label: 'Beschreibung auf der Detailseite' },
      { kind: 'lines', key: 'details', label: 'Eckdaten (z. B. „2 Nächte“, „ab 227 Euro pro Person“)' },
      { kind: 'lines', key: 'includes', label: 'Leistungen' },
      { kind: 'text', key: 'travel_period_label', label: 'Bezeichnung Reisezeitraum' },
      { kind: 'text', key: 'travel_period', label: 'Reisezeitraum' },
    ],
  },
  wellness_page: {
    title: 'Wellness-Seite',
    hub: '/cms/wellness',
    hubLabel: 'Zur Wellness-Übersicht',
    pictures: [
      { kind: 'image', key: 'hero_image', label: 'Großes Bild oben' },
      { kind: 'image', key: 'image', label: 'Bild in der Übersicht' },
      { kind: 'image', key: 'pair_image', label: 'Zusätzliches Bild auf der Seite' },
    ],
    texts: [
      { kind: 'text', key: 'name', label: 'Name' },
      { kind: 'text', key: 'kicker', label: 'Zeile über dem Namen' },
      { kind: 'text', key: 'summary', label: 'Kurztext (Übersicht)', long: true },
      { kind: 'text', key: 'tile_cta', label: 'Linktext in der Übersicht' },
      { kind: 'paragraphs', key: 'text', label: 'Beschreibung' },
      { kind: 'list', key: 'details', label: 'Eckdaten', item: 'Angabe', fields: FACTS },
      { kind: 'lines', key: 'includes', label: 'Das erwartet Sie' },
      {
        kind: 'list',
        key: 'prices',
        label: 'Preise',
        item: 'Preisgruppe',
        fields: [{ key: 'title', label: 'Überschrift der Gruppe' }],
        nested: {
          key: 'items',
          label: 'Preise',
          item: 'Preis',
          fields: [
            { key: 'name', label: 'Leistung' },
            { key: 'meta', label: 'Zusatz' },
            { key: 'price', label: 'Preis' },
          ],
        },
      },
      { kind: 'text', key: 'price_note', label: 'Hinweis unter den Preisen', long: true },
    ],
  },
  occasions_page: {
    title: 'Anlass',
    hub: '/cms/anlaesse',
    hubLabel: 'Zur Anlass-Übersicht',
    pictures: [
      { kind: 'image', key: 'hero_image', label: 'Großes Bild oben' },
      { kind: 'image', key: 'image', label: 'Bild in der Übersicht' },
    ],
    texts: [
      { kind: 'text', key: 'name', label: 'Name' },
      { kind: 'text', key: 'kicker', label: 'Zeile über dem Namen' },
      { kind: 'text', key: 'summary', label: 'Kurztext (Übersicht)', long: true },
      { kind: 'paragraphs', key: 'text', label: 'Beschreibung' },
      { kind: 'list', key: 'details', label: 'Eckdaten', item: 'Angabe', fields: FACTS },
      { kind: 'lines', key: 'includes', label: 'Das erwartet Sie' },
      { kind: 'list', key: 'links', label: 'Passende Angebote und Seiten', item: 'Link', fields: [{ key: 'label', label: 'Text' }, { key: 'href', label: 'Ziel', link: true }] },
      { kind: 'list', key: 'faqs', label: 'Häufige Fragen', item: 'Frage', fields: [{ key: 'question', label: 'Frage' }, { key: 'answer', label: 'Antwort', long: true }] },
      {
        kind: 'list',
        key: 'community',
        label: 'Tipps aus der Community',
        item: 'Tipp',
        fields: [
          { key: 'text', label: 'Tipp', long: true },
          { key: 'author', label: 'Von' },
          { key: 'href', label: 'Link zum Beitrag', link: true },
          { key: 'image', label: 'Bild', image: true },
        ],
      },
      { kind: 'text', key: 'cta', label: 'Text des Buttons' },
      { kind: 'text', key: 'cta_href', label: 'Ziel des Buttons' },
    ],
  },
  blog_page: {
    title: 'Beitrag',
    hub: '/cms/blog',
    hubLabel: 'Zur Blog-Übersicht',
    pictures: [{ kind: 'image', key: 'hero_image', label: 'Großes Bild oben' }],
    texts: [
      { kind: 'text', key: 'title', label: 'Titel' },
      { kind: 'text', key: 'excerpt', label: 'Kurztext (Übersicht)', long: true },
      { kind: 'topic', key: 'topic', label: 'Thema' },
      { kind: 'date', key: 'published_at', label: 'Veröffentlicht am' },
      { kind: 'blocks', key: 'blocks', label: 'Inhalt des Beitrags' },
      { kind: 'promo', key: 'promo', label: 'Angebot im Beitrag' },
    ],
  },
};

const asText = (value: unknown) => (typeof value === 'string' ? value : value == null ? '' : String(value));
const asList = (value: unknown) => (Array.isArray(value) ? value : []);
const splitParagraphs = (value: string) => value.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
const splitLines = (value: string) => value.split('\n').map((line) => line.trim()).filter(Boolean);

function Move({ index, count, onMove, onRemove, label }: { index: number; count: number; onMove: (to: number) => void; onRemove: () => void; label: string }) {
  return (
    <span className="cms-entry__moves">
      <button type="button" className="cms-btn cms-btn--ghost" disabled={index === 0} onClick={() => onMove(index - 1)}>Nach oben</button>
      <button type="button" className="cms-btn cms-btn--ghost" disabled={index === count - 1} onClick={() => onMove(index + 1)}>Nach unten</button>
      <button type="button" className="cms-item-delete" onClick={onRemove} aria-label={`${label} entfernen`}>Entfernen</button>
    </span>
  );
}

function moved<T>(list: T[], from: number, to: number) {
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// Text areas that keep blank lines while typing; the stored value is a list.
function ListText({ label, value, paragraphs, onChange, focus }: { label: string; value: string[]; paragraphs: boolean; onChange: (next: string[]) => void; focus: string }) {
  const cms = useCms();
  const joined = value.join(paragraphs ? '\n\n' : '\n');
  const [text, setText] = useState(joined);
  // Edits made directly on the page come back in here.
  useEffect(() => setText(joined), [cms?.draftTick]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <label className="cms-field" data-cms-panel-focus={focus}>
      {label} {paragraphs ? '(Absätze durch eine Leerzeile trennen)' : '(eine Zeile pro Punkt)'}
      <CmsTextarea
        value={text}
        minRows={paragraphs ? 8 : 4}
        placeholder={label}
        onChange={(next) => {
          setText(next);
          onChange(paragraphs ? splitParagraphs(next) : splitLines(next));
        }}
      />
    </label>
  );
}

export function CmsEntryEditor({ sectionKey, entryId }: { sectionKey: string; entryId: string }) {
  const cms = useCms();
  const live = (useSection(sectionKey) ?? {}) as Record<string, unknown>;
  const spec = ENTRY_SPECS[sectionKey];
  const items = asList(live.items) as Array<Record<string, unknown>>;
  const entry = items.find((item) => isPlainObject(item) && matchesCmsEntry(item, entryId));
  if (!cms || !spec) return null;
  if (!entry || typeof entry.id !== 'string') {
    return (
      <div className="cms-form">
        <h3>{spec.title}</h3>
        <p className="cms-muted">Dieser Eintrag steht noch nicht in den gespeicherten Daten.</p>
        <Link className="cms-entry-open" to={spec.hub}>{spec.hubLabel}</Link>
      </div>
    );
  }

  const prefix = `items.${entry.id}`;
  const value = (key: string) => getPath(live, `${prefix}.${key}`);
  const set = (key: string, next: unknown, quiet = true) => cms!.applyField(sectionKey, `${prefix}.${key}`, next, quiet);
  const name = asText(entry.name) || asText(entry.title) || entry.id;

  const imageField = (path: string, label: string, extra?: ReactNode) => (
    <CmsImageField
      key={path}
      label={label}
      value={asText(getPath(live, path))}
      alt={asText(getPath(live, inferAltPath(path) ?? ''))}
      section={sectionKey}
      path={path}
    >
      {extra}
    </CmsImageField>
  );

  function subFields(listPath: string, item: Record<string, unknown>, fields: Sub[], context: string, write: (next: Record<string, unknown>) => void) {
    return fields.map((field) => {
      const path = `${listPath}.${field.key}`;
      if (field.image) return imageField(path, field.label);
      if (field.link) {
        return (
          <CmsLinkPicker
            key={path}
            label={field.label}
            value={asText(item[field.key])}
            context={context}
            newTab={item.new_tab === true}
            onChange={(href) => write({ ...item, [field.key]: href })}
            onNewTabChange={(next) => write({ ...item, new_tab: next })}
          />
        );
      }
      return (
        <label key={path} className="cms-field" data-cms-panel-focus={path}>
          {field.label}
          {field.long ? (
            <CmsTextarea value={asText(item[field.key])} minRows={3} placeholder={field.label} onChange={(next) => write({ ...item, [field.key]: next })} />
          ) : (
            <input value={asText(item[field.key])} placeholder={field.label} onChange={(event) => write({ ...item, [field.key]: event.target.value })} />
          )}
        </label>
      );
    });
  }

  function render(field: EntryFieldSpec) {
    const path = `${prefix}.${field.key}`;
    switch (field.kind) {
      case 'image':
        return imageField(path, field.label);
      case 'text':
        return (
          <label key={path} className="cms-field" data-cms-panel-focus={path}>
            {field.label}
            {field.long ? (
              <CmsTextarea value={asText(value(field.key))} minRows={3} placeholder={field.label} onChange={(next) => set(field.key, next)} />
            ) : (
              <input value={asText(value(field.key))} placeholder={field.label} onChange={(event) => set(field.key, event.target.value)} />
            )}
          </label>
        );
      case 'date':
        return (
          <label key={path} className="cms-field" data-cms-panel-focus={path}>
            {field.label}
            <input type="date" value={asText(value(field.key)).slice(0, 10)} onChange={(event) => set(field.key, event.target.value)} />
          </label>
        );
      case 'paragraphs':
      case 'lines':
        return (
          <ListText
            key={path}
            focus={path}
            label={field.label}
            paragraphs={field.kind === 'paragraphs'}
            value={asList(value(field.key)).map(asText)}
            onChange={(next) => set(field.key, next)}
          />
        );
      case 'gallery': {
        // Older data may hold plain addresses; the editor always writes { src, alt }.
        const photos = asList(value(field.key)).map((photo) => (isPlainObject(photo) ? photo : { src: asText(photo), alt: '' }));
        const write = (next: unknown[]) => set(field.key, next, false);
        return (
          <fieldset key={path} className="cms-tile">
            <legend>{field.label} ({photos.length} {photos.length === 1 ? 'Foto' : 'Fotos'})</legend>
            {photos.map((_, index) =>
              imageField(
                `${path}.${index}.src`,
                `Foto ${index + 1}`,
                <Move index={index} count={photos.length} label={`Foto ${index + 1}`} onMove={(to) => write(moved(photos, index, to))} onRemove={() => write(photos.filter((__, other) => other !== index))} />,
              ),
            )}
            <button
              type="button"
              className="cms-btn"
              onClick={() => {
                write(photos);
                cms!.openImage({ section: sectionKey, path: `${path}.${photos.length}.src`, altPath: `${path}.${photos.length}.alt` });
              }}
            >
              Foto hinzufügen
            </button>
          </fieldset>
        );
      }
      case 'list': {
        const list = asList(value(field.key)).filter(isPlainObject);
        const write = (next: unknown[]) => set(field.key, next, false);
        const blank = Object.fromEntries(field.fields.map((sub) => [sub.key, ''])) as Record<string, unknown>;
        if (field.nested) blank[field.nested.key] = [];
        return (
          <fieldset key={path} className="cms-tile">
            <legend>{field.label}</legend>
            {list.map((item, index) => {
              const itemPath = `${path}.${index}`;
              const writeItem = (next: Record<string, unknown>) => write(list.map((other, at) => (at === index ? next : other)));
              const nested = field.nested;
              const inner = nested ? asList(item[nested.key]).filter(isPlainObject) : [];
              const writeInner = (next: unknown[]) => nested && writeItem({ ...item, [nested.key]: next });
              return (
                <div key={itemPath} className="cms-entry__item" data-cms-panel-focus={`${field.key}:${index}`}>
                  <p className="cms-entry__item-head">
                    <strong>{field.item} {index + 1}</strong>
                    <Move index={index} count={list.length} label={`${field.item} ${index + 1}`} onMove={(to) => write(moved(list, index, to))} onRemove={() => write(list.filter((_, other) => other !== index))} />
                  </p>
                  {subFields(itemPath, item, field.fields, name, writeItem)}
                  {nested ? (
                    <div className="cms-entry__nested">
                      {inner.map((sub, subIndex) => (
                        <div key={`${itemPath}.${nested.key}.${subIndex}`} className="cms-entry__item">
                          <p className="cms-entry__item-head">
                            <strong>{nested.item} {subIndex + 1}</strong>
                            <Move index={subIndex} count={inner.length} label={`${nested.item} ${subIndex + 1}`} onMove={(to) => writeInner(moved(inner, subIndex, to))} onRemove={() => writeInner(inner.filter((_, other) => other !== subIndex))} />
                          </p>
                          {subFields(`${itemPath}.${nested.key}.${subIndex}`, sub, nested.fields, name, (next) => writeInner(inner.map((other, at) => (at === subIndex ? next : other))))}
                        </div>
                      ))}
                      <button type="button" className="cms-btn cms-btn--ghost" onClick={() => writeInner([...inner, Object.fromEntries(nested.fields.map((sub) => [sub.key, '']))])}>
                        {nested.item} hinzufügen
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
            <button type="button" className="cms-btn cms-btn--ghost" onClick={() => write([...list, blank])}>
              {field.item} hinzufügen
            </button>
          </fieldset>
        );
      }
      case 'blocks': {
        const blocks = asList(value(field.key)).filter(isPlainObject);
        const write = (next: unknown[]) => set(field.key, next, false);
        const add = (block: Record<string, unknown>) => {
          write([...blocks, block]);
          if (block.type === 'image') cms!.openImage({ section: sectionKey, path: `${path}.${blocks.length}.src`, altPath: `${path}.${blocks.length}.alt` });
        };
        const names: Record<string, string> = { paragraph: 'Absatz', heading: 'Zwischenüberschrift', image: 'Bild', video: 'Video' };
        return (
          <fieldset key={path} className="cms-tile">
            <legend>{field.label}</legend>
            {blocks.map((block, index) => {
              const blockPath = `${path}.${index}`;
              const type = asText(block.type) || 'paragraph';
              const writeBlock = (next: Record<string, unknown>) => write(blocks.map((other, at) => (at === index ? next : other)));
              const moves = <Move index={index} count={blocks.length} label={`${names[type] ?? 'Baustein'} ${index + 1}`} onMove={(to) => write(moved(blocks, index, to))} onRemove={() => write(blocks.filter((_, other) => other !== index))} />;
              return (
                <div key={blockPath} className="cms-entry__item" data-cms-panel-focus={blockPath}>
                  <p className="cms-entry__item-head"><strong>{names[type] ?? type}</strong>{type === 'image' ? null : moves}</p>
                  {type === 'image' ? (
                    <>
                      {imageField(`${blockPath}.src`, 'Bild', moves)}
                      <label className="cms-field">
                        Bildunterschrift (optional)
                        <input value={asText(block.caption)} onChange={(event) => writeBlock({ ...block, caption: event.target.value })} />
                      </label>
                    </>
                  ) : type === 'video' ? (
                    <>
                      <label className="cms-field">
                        Video-Adresse (YouTube oder Datei)
                        <input value={asText(block.src)} onChange={(event) => writeBlock({ ...block, src: event.target.value })} />
                      </label>
                      <label className="cms-field">
                        Unterschrift (optional)
                        <input value={asText(block.caption)} onChange={(event) => writeBlock({ ...block, caption: event.target.value })} />
                      </label>
                    </>
                  ) : (
                    <label className="cms-field">
                      {type === 'heading' ? 'Zwischenüberschrift' : 'Text'}
                      {type === 'heading' ? (
                        <input value={asText(block.text)} onChange={(event) => writeBlock({ ...block, text: event.target.value })} />
                      ) : (
                        <CmsTextarea value={asText(block.text)} minRows={4} placeholder="Text" onChange={(next) => writeBlock({ ...block, text: next })} />
                      )}
                    </label>
                  )}
                </div>
              );
            })}
            <span className="cms-entry__moves">
              <button type="button" className="cms-btn cms-btn--ghost" onClick={() => add({ type: 'paragraph', text: '' })}>Absatz hinzufügen</button>
              <button type="button" className="cms-btn cms-btn--ghost" onClick={() => add({ type: 'heading', text: '' })}>Zwischenüberschrift hinzufügen</button>
              <button type="button" className="cms-btn cms-btn--ghost" onClick={() => add({ type: 'image', src: '', alt: '' })}>Bild hinzufügen</button>
            </span>
          </fieldset>
        );
      }
      case 'topic': {
        const topics = readFilters(live.filters) ?? BLOG_TOPICS;
        return (
          <label key={path} className="cms-field" data-cms-panel-focus={path}>
            {field.label}
            <select value={asText(value(field.key))} onChange={(event) => set(field.key, event.target.value, false)}>
              <option value="">– ohne Thema –</option>
              {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.label}</option>)}
            </select>
          </label>
        );
      }
      case 'promo': {
        const promo = isPlainObject(value(field.key)) ? (value(field.key) as Record<string, unknown>) : {};
        const write = (next: Record<string, unknown>) => set(field.key, { ...promo, ...next }, false);
        return (
          <fieldset key={path} className="cms-tile">
            <legend>{field.label}</legend>
            <label className="cms-choice">
              <input type="checkbox" checked={promo.enabled === true} onChange={(event) => write({ enabled: event.target.checked })} />
              Ein passendes Angebot im Beitrag zeigen
            </label>
            <PromoOffer value={asText(promo.offer_id)} onChange={(offer_id) => write({ offer_id })} />
            <label className="cms-field">
              Wo im Beitrag
              <select value={asText(promo.placement) || 'inline'} onChange={(event) => write({ placement: event.target.value })}>
                <option value="inline">Mitten im Text</option>
                <option value="after">Am Ende des Beitrags</option>
              </select>
            </label>
          </fieldset>
        );
      }
      default:
        return null;
    }
  }

  return (
    <form className="cms-form cms-entry" onSubmit={(event) => event.preventDefault()}>
      <h3>{spec.title}: {name}</h3>
      <Link className="cms-entry-open" to={spec.hub}>{spec.hubLabel}</Link>
      <fieldset className="cms-tile">
        <legend>Bilder</legend>
        {spec.pictures.filter((field) => field.kind !== 'gallery').map(render)}
      </fieldset>
      {spec.pictures.filter((field) => field.kind === 'gallery').map(render)}
      <fieldset className="cms-tile">
        <legend>Texte</legend>
        {spec.texts.map(render)}
      </fieldset>
      <EntrySave sectionKey={sectionKey} data={live} />
    </form>
  );
}

// The offers of the hotel, to choose the one shown inside a journal post.
function PromoOffer({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const offers = asList(useSection('offers_page')?.items).filter(isPlainObject);
  return (
    <label className="cms-field">
      Angebot
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">– passend vorschlagen –</option>
        {offers.map((offer) => <option key={asText(offer.id)} value={asText(offer.id)}>{asText(offer.title) || asText(offer.id)}</option>)}
      </select>
    </label>
  );
}

// "Speichern" at the bottom of the panel writes the whole block with this entry's changes.
function EntrySave({ sectionKey, data }: { sectionKey: string; data: Record<string, unknown> }) {
  const cms = useCms();
  const latest = useRef({ cms, sectionKey, data });
  latest.current = { cms, sectionKey, data };
  const setSaveAction = cms?.setSaveAction;
  useEffect(() => {
    if (!setSaveAction) return;
    setSaveAction(() => latest.current.cms!.saveSection(latest.current.sectionKey, latest.current.data));
    return () => setSaveAction(null);
  }, [sectionKey, setSaveAction]);
  return null;
}
