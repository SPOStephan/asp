import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useHotel, useSection } from '../context/HotelContext';
import { ROOMS_PAGE_FALLBACK, resolveRooms } from '../lib/rooms';
import { useCms } from './CmsContext';
import { CMS_SECTION_LABELS, describeSelection } from './cmsSelect';

const CUSTOM_SECTIONS = new Set(['hero', 'welcome', 'discover', 'rooms_page']);

function Field({
  label,
  value,
  onChange,
  multiline,
  focus,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  focus?: string;
}) {
  return (
    <label className="cms-field" data-cms-panel-focus={focus}>
      {label}
      {multiline ? (
        <textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

export function CmsEditor() {
  const cms = useCms();
  if (!cms) return null;
  const selected = cms.selected;
  const section = selected?.section ?? null;

  useEffect(() => {
    let timer = 0;
    const frame = window.requestAnimationFrame(() => {
      const root = document.querySelector('.cms-dock__body');
      if (!root) return;
      const focus = selected?.focus;
      const target = focus
        ? root.querySelector(`[data-cms-panel-focus="${CSS.escape(focus)}"]`)
        : root.querySelector('.cms-form');
      if (!(target instanceof HTMLElement)) return;
      target.scrollIntoView({ block: 'start', behavior: 'smooth' });
      target.classList.add('cms-panel-flash');
      timer = window.setTimeout(() => target.classList.remove('cms-panel-flash'), 1200);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [selected?.section, selected?.focus]);

  return (
    <aside className="cms-dock">
      <header className="cms-dock__top">
        <strong>Seite bearbeiten</strong>
        <p>Block oder Element anklicken — rechts öffnet sich der passende Bereich. Speichern schreibt den ganzen Block.</p>
        {selected ? <p className="cms-dock__hit">{describeSelection(selected)}</p> : null}
        <nav className="cms-dock__nav">
          <Link to="/cms">Start</Link>
          <Link to="/cms/zimmer">Zimmer</Link>
          <a href="/">Öffentliche Seite</a>
        </nav>
      </header>
      <div className="cms-dock__body">
        {!section ? <p className="cms-muted">Noch kein Block gewählt.</p> : null}
        {section === 'hero' ? <HeroFields /> : null}
        {section === 'welcome' ? <WelcomeFields /> : null}
        {section === 'discover' ? <DiscoverFields /> : null}
        {section === 'rooms_page' ? <RoomsFields /> : null}
        {section && !CUSTOM_SECTIONS.has(section) ? <GenericFields key={section} sectionKey={section} /> : null}
      </div>
    </aside>
  );
}

function SaveBar({ onSave }: { onSave: () => Promise<unknown> }) {
  const cms = useCms();
  return (
    <div className="cms-save">
      {cms?.saveError ? <p className="cms-error">{cms.saveError}</p> : null}
      <button type="button" className="cms-btn" disabled={cms?.saving} onClick={() => void onSave()}>
        {cms?.saving ? 'Speichert…' : 'Block speichern'}
      </button>
    </div>
  );
}

function HeroFields() {
  const cms = useCms();
  const data = useSection('hero') ?? {};
  const [draft, setDraft] = useState({
    title: String(data.title ?? ''),
    subtitle: String(data.subtitle ?? ''),
    hero_image: String(data.hero_image ?? ''),
    hero_image_alt: String(data.hero_image_alt ?? ''),
    focal_x: Number(data.hero_focal?.x ?? 68),
    focal_y: Number(data.hero_focal?.y ?? 50),
  });

  return (
    <form
      className="cms-form"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
      }}
    >
      <h3>Hero</h3>
      <Field focus="title" label="Titel" value={draft.title} onChange={(title) => setDraft({ ...draft, title })} />
      <Field focus="subtitle" label="Untertitel" value={draft.subtitle} onChange={(subtitle) => setDraft({ ...draft, subtitle })} />
      <Field focus="image" label="Bild-URL" value={draft.hero_image} onChange={(hero_image) => setDraft({ ...draft, hero_image })} />
      <Field label="Alt-Text" value={draft.hero_image_alt} onChange={(hero_image_alt) => setDraft({ ...draft, hero_image_alt })} />
      <label className="cms-field" data-cms-panel-focus="image">
        Bildausschnitt Telefon (horizontal {draft.focal_x}%)
        <input type="range" min={0} max={100} value={draft.focal_x} onChange={(event) => setDraft({ ...draft, focal_x: Number(event.target.value) })} />
      </label>
      <label className="cms-field">
        Bildausschnitt Telefon (vertikal {draft.focal_y}%)
        <input type="range" min={0} max={100} value={draft.focal_y} onChange={(event) => setDraft({ ...draft, focal_y: Number(event.target.value) })} />
      </label>
      <div className="cms-phone">
        <img src={draft.hero_image} alt="" style={{ objectPosition: `${draft.focal_x}% ${draft.focal_y}%` }} />
      </div>
      <SaveBar
        onSave={() =>
          cms!.saveSection('hero', {
            ...data,
            title: draft.title,
            subtitle: draft.subtitle,
            hero_image: draft.hero_image,
            hero_image_alt: draft.hero_image_alt,
            hero_focal: { x: draft.focal_x, y: draft.focal_y },
          })
        }
      />
    </form>
  );
}

function WelcomeFields() {
  const cms = useCms();
  const data = useSection('welcome') ?? {};
  const [draft, setDraft] = useState({
    title_line1: String(data.title_line1 ?? ''),
    title_word_normal: String(data.title_word_normal ?? ''),
    title_word_script: String(data.title_word_script ?? ''),
    subtitle: String(data.subtitle ?? ''),
    text_paragraph1: String(data.text_paragraph1 ?? ''),
    text_paragraph2: String(data.text_paragraph2 ?? ''),
  });

  return (
    <form className="cms-form" onSubmit={(event) => event.preventDefault()}>
      <h3>Welcome</h3>
      <Field focus="title" label="Titelzeile 1" value={draft.title_line1} onChange={(title_line1) => setDraft({ ...draft, title_line1 })} />
      <Field focus="title" label="Wort normal" value={draft.title_word_normal} onChange={(title_word_normal) => setDraft({ ...draft, title_word_normal })} />
      <Field focus="title" label="Wort Schreibschrift" value={draft.title_word_script} onChange={(title_word_script) => setDraft({ ...draft, title_word_script })} />
      <Field focus="subtitle" label="Untertitel" value={draft.subtitle} onChange={(subtitle) => setDraft({ ...draft, subtitle })} />
      <Field focus="text" label="Absatz 1" value={draft.text_paragraph1} onChange={(text_paragraph1) => setDraft({ ...draft, text_paragraph1 })} multiline />
      <Field focus="text" label="Absatz 2" value={draft.text_paragraph2} onChange={(text_paragraph2) => setDraft({ ...draft, text_paragraph2 })} multiline />
      <SaveBar onSave={() => cms!.saveSection('welcome', { ...data, ...draft })} />
    </form>
  );
}

function DiscoverFields() {
  const cms = useCms();
  const data = useSection('discover') ?? {};
  const [draft, setDraft] = useState({
    eyebrow: String(data.eyebrow ?? ''),
    title: String(data.title ?? ''),
    subtitle: String(data.subtitle ?? ''),
    feature_image_left: String(data.feature_image_left ?? ''),
    feature_image_left_alt: String(data.feature_image_left_alt ?? ''),
    feature_image_right: String(data.feature_image_right ?? ''),
    feature_image_right_alt: String(data.feature_image_right_alt ?? ''),
    tiles: Array.isArray(data.tiles) ? data.tiles : [],
  });

  function updateTile(index: number, key: string, value: string) {
    setDraft({
      ...draft,
      tiles: draft.tiles.map((tile: Record<string, string>, tileIndex: number) =>
        tileIndex === index ? { ...tile, [key]: value } : tile,
      ),
    });
  }

  return (
    <form className="cms-form" onSubmit={(event) => event.preventDefault()}>
      <h3>Discover</h3>
      <Field focus="head" label="Eyebrow" value={draft.eyebrow} onChange={(eyebrow) => setDraft({ ...draft, eyebrow })} />
      <Field focus="head" label="Titel" value={draft.title} onChange={(title) => setDraft({ ...draft, title })} />
      <Field focus="head" label="Untertitel" value={draft.subtitle} onChange={(subtitle) => setDraft({ ...draft, subtitle })} />
      <Field focus="feature_left" label="Bild links" value={draft.feature_image_left} onChange={(feature_image_left) => setDraft({ ...draft, feature_image_left })} />
      <Field focus="feature_left" label="Alt links" value={draft.feature_image_left_alt} onChange={(feature_image_left_alt) => setDraft({ ...draft, feature_image_left_alt })} />
      <Field focus="feature_right" label="Bild rechts" value={draft.feature_image_right} onChange={(feature_image_right) => setDraft({ ...draft, feature_image_right })} />
      <Field focus="feature_right" label="Alt rechts" value={draft.feature_image_right_alt} onChange={(feature_image_right_alt) => setDraft({ ...draft, feature_image_right_alt })} />
      {draft.tiles.map((tile: Record<string, string>, index: number) => (
        <fieldset key={index} className="cms-tile" data-cms-panel-focus={`tiles:${index}`}>
          <legend>Kachel {index + 1}</legend>
          <Field label="Titel" value={tile.title ?? ''} onChange={(value) => updateTile(index, 'title', value)} />
          <Field label="Eyebrow" value={tile.eyebrow ?? ''} onChange={(value) => updateTile(index, 'eyebrow', value)} />
          <Field label="Bild" value={tile.image ?? ''} onChange={(value) => updateTile(index, 'image', value)} />
          <Field label="Link" value={tile.href ?? ''} onChange={(value) => updateTile(index, 'href', value)} />
        </fieldset>
      ))}
      <SaveBar onSave={() => cms!.saveSection('discover', { ...data, ...draft })} />
    </form>
  );
}

function RoomsFields() {
  const cms = useCms();
  const hotel = useHotel();
  const page = useSection('rooms_page');
  const base = page ?? ROOMS_PAGE_FALLBACK;
  const rooms = useMemo(() => resolveRooms(base.items), [base.items]);
  const focus = cms?.selected?.focus;
  const focusRoomId = focus?.startsWith('room:') ? focus.slice(5) : '';
  const [roomId, setRoomId] = useState(focusRoomId || rooms[0]?.id || '');
  const [draft, setDraft] = useState({
    eyebrow: String(base.eyebrow ?? ''),
    title: String(base.title ?? ''),
    subtitle: String(base.subtitle ?? ''),
    intro: String(base.intro ?? ''),
    hero_image: String(base.hero_image ?? ''),
    hero_image_alt: String(base.hero_image_alt ?? ''),
    show_filters: (base as { show_filters?: boolean }).show_filters !== false,
    note_title: String(base.note_title ?? ''),
    note_text: String(base.note_text ?? ''),
    note_cta: String(base.note_cta ?? ''),
  });
  const current = rooms.find((room) => room.id === roomId) ?? rooms[0];
  const [roomDraft, setRoomDraft] = useState({
    name: current?.name ?? '',
    kicker: current?.kicker ?? '',
    text: current?.text ?? '',
    size: current?.size ?? '',
    view: current?.view ?? '',
    occupancy: current?.occupancy ?? '',
    price_from: current?.price_from ?? '',
    price_unit: current?.price_unit ?? '',
    amenities: (current?.amenities ?? []).join('\n'),
  });

  function pickRoom(id: string) {
    const next = rooms.find((room) => room.id === id);
    setRoomId(id);
    if (!next) return;
    setRoomDraft({
      name: next.name,
      kicker: next.kicker,
      text: next.text,
      size: next.size,
      view: next.view,
      occupancy: next.occupancy,
      price_from: next.price_from,
      price_unit: next.price_unit,
      amenities: next.amenities.join('\n'),
    });
  }

  useEffect(() => {
    if (!focusRoomId) return;
    const next = rooms.find((room) => room.id === focusRoomId);
    if (!next || next.id === roomId) return;
    pickRoom(focusRoomId);
  }, [focusRoomId, roomId, rooms]);

  async function save() {
    const items = rooms.map((room) => {
      if (room.id !== (current?.id ?? roomId)) return room;
      return {
        ...room,
        name: roomDraft.name,
        kicker: roomDraft.kicker,
        text: roomDraft.text,
        size: roomDraft.size,
        view: roomDraft.view,
        occupancy: roomDraft.occupancy,
        price_from: roomDraft.price_from,
        price_unit: roomDraft.price_unit,
        amenities: roomDraft.amenities.split('\n').map((line) => line.trim()).filter(Boolean),
      };
    });
    return cms!.saveSection('rooms_page', {
      ...base,
      ...draft,
      items,
      hotel_email: hotel?.email ?? null,
    });
  }

  return (
    <form className="cms-form" onSubmit={(event) => event.preventDefault()}>
      <h3>Zimmer-Seite</h3>
      <Field focus="head" label="Eyebrow" value={draft.eyebrow} onChange={(eyebrow) => setDraft({ ...draft, eyebrow })} />
      <Field focus="title" label="Titel" value={draft.title} onChange={(title) => setDraft({ ...draft, title })} />
      <Field focus="subtitle" label="Untertitel" value={draft.subtitle} onChange={(subtitle) => setDraft({ ...draft, subtitle })} />
      <Field focus="intro" label="Intro" value={draft.intro} onChange={(intro) => setDraft({ ...draft, intro })} multiline />
      <Field focus="image" label="Hero-Bild" value={draft.hero_image} onChange={(hero_image) => setDraft({ ...draft, hero_image })} />
      <Field focus="image" label="Hero-Alt" value={draft.hero_image_alt} onChange={(hero_image_alt) => setDraft({ ...draft, hero_image_alt })} />
      <label className="cms-choice">
        <input type="checkbox" checked={draft.show_filters} onChange={(event) => setDraft({ ...draft, show_filters: event.target.checked })} />
        Filter zeigen
      </label>
      <Field focus="note" label="Hinweis Titel" value={draft.note_title} onChange={(note_title) => setDraft({ ...draft, note_title })} />
      <Field focus="note" label="Hinweis Text" value={draft.note_text} onChange={(note_text) => setDraft({ ...draft, note_text })} multiline />
      <Field focus="note" label="Hinweis CTA" value={draft.note_cta} onChange={(note_cta) => setDraft({ ...draft, note_cta })} />
      <div className="cms-room" data-cms-panel-focus={focusRoomId ? `room:${focusRoomId}` : current ? `room:${current.id}` : undefined}>
        <label className="cms-field">
          Zimmer
          <select value={roomId} onChange={(event) => pickRoom(event.target.value)}>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </label>
        <Field label="Name" value={roomDraft.name} onChange={(name) => setRoomDraft({ ...roomDraft, name })} />
        <Field label="Kicker" value={roomDraft.kicker} onChange={(kicker) => setRoomDraft({ ...roomDraft, kicker })} />
        <Field label="Text" value={roomDraft.text} onChange={(text) => setRoomDraft({ ...roomDraft, text })} multiline />
        <Field label="Größe" value={roomDraft.size} onChange={(size) => setRoomDraft({ ...roomDraft, size })} />
        <Field label="Blick" value={roomDraft.view} onChange={(view) => setRoomDraft({ ...roomDraft, view })} />
        <Field label="Belegung" value={roomDraft.occupancy} onChange={(occupancy) => setRoomDraft({ ...roomDraft, occupancy })} />
        <Field label="Preis ab" value={roomDraft.price_from} onChange={(price_from) => setRoomDraft({ ...roomDraft, price_from })} />
        <Field label="Preis-Einheit" value={roomDraft.price_unit} onChange={(price_unit) => setRoomDraft({ ...roomDraft, price_unit })} />
        <Field label="Ausstattung (eine Zeile pro Punkt)" value={roomDraft.amenities} onChange={(amenities) => setRoomDraft({ ...roomDraft, amenities })} multiline />
      </div>
      <SaveBar onSave={save} />
    </form>
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function GenericFields({ sectionKey }: { sectionKey: string }) {
  const cms = useCms();
  const data = useSection(sectionKey) ?? {};
  const [draft, setDraft] = useState<Record<string, unknown>>({ ...data });
  const entries = Object.entries(draft);

  return (
    <form className="cms-form" onSubmit={(event) => event.preventDefault()}>
      <h3>{CMS_SECTION_LABELS[sectionKey] ?? sectionKey}</h3>
      {entries.length === 0 ? <p className="cms-muted">Dieser Block hat noch keine CMS-Felder.</p> : null}
      {entries.map(([key, value]) => (
        <GenericValue
          key={key}
          path={key}
          label={key}
          value={value}
          onChange={(next) => setDraft({ ...draft, [key]: next })}
        />
      ))}
      <SaveBar onSave={() => cms!.saveSection(sectionKey, { ...data, ...draft })} />
    </form>
  );
}

function GenericValue({
  path,
  label,
  value,
  onChange,
}: {
  path: string;
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (typeof value === 'boolean') {
    return (
      <label className="cms-choice" data-cms-panel-focus={path}>
        <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
        {label}
      </label>
    );
  }

  if (typeof value === 'number') {
    return (
      <label className="cms-field" data-cms-panel-focus={path}>
        {label}
        <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} />
      </label>
    );
  }

  if (typeof value === 'string') {
    return (
      <Field
        focus={path}
        label={label}
        value={value}
        onChange={onChange}
        multiline={value.length > 80 || value.includes('\n')}
      />
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="cms-list">
        {value.map((item, index) => {
          const itemPath = `${path}:${index}`;
          return (
            <fieldset key={itemPath} className="cms-tile" data-cms-panel-focus={itemPath}>
              <legend>
                {label} {index + 1}
              </legend>
              {isPlainObject(item) ? (
                Object.entries(item).map(([childKey, childValue]) =>
                  typeof childValue === 'string' || typeof childValue === 'number' || typeof childValue === 'boolean' ? (
                    <GenericValue
                      key={childKey}
                      path={`${itemPath}.${childKey}`}
                      label={childKey}
                      value={childValue}
                      onChange={(next) => {
                        const copy = value.slice();
                        copy[index] = { ...item, [childKey]: next };
                        onChange(copy);
                      }}
                    />
                  ) : Array.isArray(childValue) && childValue.every((entry) => typeof entry === 'string') ? (
                    <Field
                      key={childKey}
                      label={childKey}
                      value={childValue.join('\n')}
                      onChange={(next) => {
                        const copy = value.slice();
                        copy[index] = { ...item, [childKey]: next.split('\n').map((line) => line.trim()).filter(Boolean) };
                        onChange(copy);
                      }}
                      multiline
                    />
                  ) : null,
                )
              ) : (
                <Field label={label} value={String(item ?? '')} onChange={(next) => {
                  const copy = value.slice();
                  copy[index] = next;
                  onChange(copy);
                }} />
              )}
            </fieldset>
          );
        })}
      </div>
    );
  }

  if (isPlainObject(value)) {
    return (
      <fieldset className="cms-tile" data-cms-panel-focus={path}>
        <legend>{label}</legend>
        {Object.entries(value).map(([childKey, childValue]) => (
          <GenericValue
            key={childKey}
            path={`${path}.${childKey}`}
            label={childKey}
            value={childValue}
            onChange={(next) => onChange({ ...value, [childKey]: next })}
          />
        ))}
      </fieldset>
    );
  }

  return null;
}
