import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useHotel, useSection } from '../context/HotelContext';
import { ROOMS_PAGE_FALLBACK, resolveRooms } from '../lib/rooms';
import { fieldKind, isLongText, isPlainObject } from './cmsDraft';
import { useCms } from './CmsContext';
import { CmsIconPicker } from './CmsIconPicker';
import { CmsImageField } from './CmsImageField';
import { CmsTextarea } from './CmsTextarea';
import { CMS_SECTION_LABELS, describeSelection } from './cmsSelect';

const CUSTOM_SECTIONS = new Set(['hero', 'welcome', 'discover', 'rooms_page']);

function useLivePreview(sectionKey: string, payload: Record<string, unknown>) {
  const cms = useCms();
  const serial = JSON.stringify(payload);
  const skip = useRef(true);
  useEffect(() => {
    if (skip.current) {
      skip.current = false;
      return;
    }
    cms?.preview(sectionKey, JSON.parse(serial) as Record<string, unknown>);
  }, [cms, sectionKey, serial]);
}

function Field({
  label,
  value,
  onChange,
  multiline,
  focus,
  kind,
  section,
  path,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  focus?: string;
  kind?: 'text' | 'image' | 'icon';
  section?: string;
  path?: string;
}) {
  const resolved = kind ?? (path ? fieldKind(path, value) : 'text');
  if (resolved === 'icon') {
    return (
      <div className="cms-field" data-cms-panel-focus={focus ?? path}>
        {label}
        <CmsIconPicker value={value} onChange={onChange} />
      </div>
    );
  }
  if (resolved === 'image' && section && path) {
    return <CmsImageField label={label} value={value} section={section} path={path} focus={focus} />;
  }
  const long = multiline || isLongText(value, path ?? label);
  return (
    <label className="cms-field" data-cms-panel-focus={focus}>
      {label}
      {long ? (
        <CmsTextarea value={value} onChange={onChange} minRows={value.length > 180 ? 8 : 5} />
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
  const dirty = section ? cms.dirty[section] : false;

  useEffect(() => {
    let timer = 0;
    const frame = window.requestAnimationFrame(() => {
      const root = document.querySelector('.cms-dock__body');
      if (!root) return;
      const focus = selected?.focus || selected?.path;
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
  }, [selected?.section, selected?.focus, selected?.path]);

  return (
    <aside className="cms-dock">
      <header className="cms-dock__top">
        <strong>Seite bearbeiten</strong>
        <p>Text direkt auf der Seite ändern und übernehmen. Rechts dasselbe, mit Live-Vorschau. Speichern schreibt den ganzen Block.</p>
        {selected ? <p className="cms-dock__hit">{describeSelection(selected)}</p> : null}
        {dirty ? <p className="cms-dock__hit">Vorschau — noch nicht gespeichert</p> : null}
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

function SaveBar({ sectionKey, onSave }: { sectionKey: string; onSave: () => Promise<unknown> }) {
  const cms = useCms();
  return (
    <div className="cms-save">
      {cms?.dirty[sectionKey] ? <p className="cms-muted">Die Seite zeigt die Vorschau. Erst Speichern bleibt dauerhaft.</p> : null}
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

  useEffect(() => {
    setDraft({
      title: String(data.title ?? ''),
      subtitle: String(data.subtitle ?? ''),
      hero_image: String(data.hero_image ?? ''),
      hero_image_alt: String(data.hero_image_alt ?? ''),
      focal_x: Number(data.hero_focal?.x ?? 68),
      focal_y: Number(data.hero_focal?.y ?? 50),
    });
  }, [cms?.draftTick]);

  const payload = {
    ...data,
    title: draft.title,
    subtitle: draft.subtitle,
    hero_image: draft.hero_image,
    hero_image_alt: draft.hero_image_alt,
    hero_focal: { x: draft.focal_x, y: draft.focal_y },
  };
  useLivePreview('hero', payload);

  return (
    <form className="cms-form" onSubmit={(event: FormEvent) => event.preventDefault()}>
      <h3>Hero</h3>
      <Field focus="title" path="title" label="Titel" value={draft.title} onChange={(title) => setDraft({ ...draft, title })} />
      <Field focus="subtitle" path="subtitle" label="Untertitel" value={draft.subtitle} onChange={(subtitle) => setDraft({ ...draft, subtitle })} />
      <CmsImageField focus="image" label="Bild" value={draft.hero_image} section="hero" path="hero_image" />
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
      <SaveBar sectionKey="hero" onSave={() => cms!.saveSection('hero', payload)} />
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

  useEffect(() => {
    setDraft({
      title_line1: String(data.title_line1 ?? ''),
      title_word_normal: String(data.title_word_normal ?? ''),
      title_word_script: String(data.title_word_script ?? ''),
      subtitle: String(data.subtitle ?? ''),
      text_paragraph1: String(data.text_paragraph1 ?? ''),
      text_paragraph2: String(data.text_paragraph2 ?? ''),
    });
  }, [cms?.draftTick]);

  const payload = { ...data, ...draft };
  useLivePreview('welcome', payload);

  return (
    <form className="cms-form" onSubmit={(event) => event.preventDefault()}>
      <h3>Welcome</h3>
      <Field focus="title" path="title_line1" label="Titelzeile 1" value={draft.title_line1} onChange={(title_line1) => setDraft({ ...draft, title_line1 })} />
      <Field focus="title" path="title_word_normal" label="Wort normal" value={draft.title_word_normal} onChange={(title_word_normal) => setDraft({ ...draft, title_word_normal })} />
      <Field focus="title" path="title_word_script" label="Wort Schreibschrift" value={draft.title_word_script} onChange={(title_word_script) => setDraft({ ...draft, title_word_script })} />
      <Field focus="subtitle" path="subtitle" label="Untertitel" value={draft.subtitle} onChange={(subtitle) => setDraft({ ...draft, subtitle })} />
      <Field focus="text" path="text_paragraph1" label="Absatz 1" value={draft.text_paragraph1} onChange={(text_paragraph1) => setDraft({ ...draft, text_paragraph1 })} multiline />
      <Field focus="text" path="text_paragraph2" label="Absatz 2" value={draft.text_paragraph2} onChange={(text_paragraph2) => setDraft({ ...draft, text_paragraph2 })} multiline />
      <SaveBar sectionKey="welcome" onSave={() => cms!.saveSection('welcome', payload)} />
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

  useEffect(() => {
    setDraft({
      eyebrow: String(data.eyebrow ?? ''),
      title: String(data.title ?? ''),
      subtitle: String(data.subtitle ?? ''),
      feature_image_left: String(data.feature_image_left ?? ''),
      feature_image_left_alt: String(data.feature_image_left_alt ?? ''),
      feature_image_right: String(data.feature_image_right ?? ''),
      feature_image_right_alt: String(data.feature_image_right_alt ?? ''),
      tiles: Array.isArray(data.tiles) ? data.tiles : [],
    });
  }, [cms?.draftTick]);

  const payload = { ...data, ...draft };
  useLivePreview('discover', payload);

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
      <Field focus="head" path="eyebrow" label="Eyebrow" value={draft.eyebrow} onChange={(eyebrow) => setDraft({ ...draft, eyebrow })} />
      <Field focus="head" path="title" label="Titel" value={draft.title} onChange={(title) => setDraft({ ...draft, title })} />
      <Field focus="head" path="subtitle" label="Untertitel" value={draft.subtitle} onChange={(subtitle) => setDraft({ ...draft, subtitle })} />
      <CmsImageField focus="feature_left" label="Bild links" value={draft.feature_image_left} section="discover" path="feature_image_left" />
      <Field label="Alt links" value={draft.feature_image_left_alt} onChange={(feature_image_left_alt) => setDraft({ ...draft, feature_image_left_alt })} />
      <CmsImageField focus="feature_right" label="Bild rechts" value={draft.feature_image_right} section="discover" path="feature_image_right" />
      <Field label="Alt rechts" value={draft.feature_image_right_alt} onChange={(feature_image_right_alt) => setDraft({ ...draft, feature_image_right_alt })} />
      {draft.tiles.map((tile: Record<string, string>, index: number) => (
        <fieldset key={index} className="cms-tile" data-cms-panel-focus={`tiles:${index}`}>
          <legend>Kachel {index + 1}</legend>
          <Field label="Titel" value={tile.title ?? ''} onChange={(value) => updateTile(index, 'title', value)} path={`tiles.${index}.title`} />
          <Field label="Eyebrow" value={tile.eyebrow ?? ''} onChange={(value) => updateTile(index, 'eyebrow', value)} />
          <CmsImageField label="Bild" value={tile.image ?? ''} section="discover" path={`tiles.${index}.image`} />
          <Field label="Link" value={tile.href ?? ''} onChange={(value) => updateTile(index, 'href', value)} />
        </fieldset>
      ))}
      <SaveBar sectionKey="discover" onSave={() => cms!.saveSection('discover', payload)} />
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

  useEffect(() => {
    const next = rooms.find((room) => room.id === roomId) ?? rooms[0];
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
    setDraft({
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
  }, [cms?.draftTick]);

  const payload = {
    ...base,
    ...draft,
    hotel_email: hotel?.email ?? null,
    items: rooms.map((room) =>
      room.id !== (current?.id ?? roomId)
        ? room
        : {
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
          },
    ),
  };
  useLivePreview('rooms_page', payload);

  return (
    <form className="cms-form" onSubmit={(event) => event.preventDefault()}>
      <h3>Zimmer-Seite</h3>
      <Field focus="head" path="eyebrow" label="Eyebrow" value={draft.eyebrow} onChange={(eyebrow) => setDraft({ ...draft, eyebrow })} />
      <Field focus="title" path="title" label="Titel" value={draft.title} onChange={(title) => setDraft({ ...draft, title })} />
      <Field focus="subtitle" path="subtitle" label="Untertitel" value={draft.subtitle} onChange={(subtitle) => setDraft({ ...draft, subtitle })} />
      <Field focus="intro" path="intro" label="Intro" value={draft.intro} onChange={(intro) => setDraft({ ...draft, intro })} multiline />
      <CmsImageField focus="image" label="Hero-Bild" value={draft.hero_image} section="rooms_page" path="hero_image" />
      <Field label="Hero-Alt" value={draft.hero_image_alt} onChange={(hero_image_alt) => setDraft({ ...draft, hero_image_alt })} />
      <label className="cms-choice">
        <input type="checkbox" checked={draft.show_filters} onChange={(event) => setDraft({ ...draft, show_filters: event.target.checked })} />
        Filter zeigen
      </label>
      <Field focus="note" path="note_title" label="Hinweis Titel" value={draft.note_title} onChange={(note_title) => setDraft({ ...draft, note_title })} />
      <Field focus="note" path="note_text" label="Hinweis Text" value={draft.note_text} onChange={(note_text) => setDraft({ ...draft, note_text })} multiline />
      <Field focus="note" path="note_cta" label="Hinweis CTA" value={draft.note_cta} onChange={(note_cta) => setDraft({ ...draft, note_cta })} />
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
        <Field label="Name" value={roomDraft.name} onChange={(name) => setRoomDraft({ ...roomDraft, name })} path={current ? `items.${current.id}.name` : undefined} />
        <Field label="Kicker" value={roomDraft.kicker} onChange={(kicker) => setRoomDraft({ ...roomDraft, kicker })} />
        <Field label="Text" value={roomDraft.text} onChange={(text) => setRoomDraft({ ...roomDraft, text })} multiline />
        <Field label="Größe" value={roomDraft.size} onChange={(size) => setRoomDraft({ ...roomDraft, size })} />
        <Field label="Blick" value={roomDraft.view} onChange={(view) => setRoomDraft({ ...roomDraft, view })} />
        <Field label="Belegung" value={roomDraft.occupancy} onChange={(occupancy) => setRoomDraft({ ...roomDraft, occupancy })} />
        <Field label="Preis ab" value={roomDraft.price_from} onChange={(price_from) => setRoomDraft({ ...roomDraft, price_from })} />
        <Field label="Preis-Einheit" value={roomDraft.price_unit} onChange={(price_unit) => setRoomDraft({ ...roomDraft, price_unit })} />
        <Field label="Ausstattung (eine Zeile pro Punkt)" value={roomDraft.amenities} onChange={(amenities) => setRoomDraft({ ...roomDraft, amenities })} multiline />
      </div>
      <SaveBar sectionKey="rooms_page" onSave={() => cms!.saveSection('rooms_page', payload)} />
    </form>
  );
}

function GenericFields({ sectionKey }: { sectionKey: string }) {
  const cms = useCms();
  const data = useSection(sectionKey) ?? {};
  const [draft, setDraft] = useState<Record<string, unknown>>({ ...data });

  useEffect(() => {
    setDraft({ ...data });
  }, [cms?.draftTick]);

  const payload = { ...data, ...draft };
  useLivePreview(sectionKey, payload);
  const entries = Object.entries(draft);

  return (
    <form className="cms-form" onSubmit={(event) => event.preventDefault()}>
      <h3>{CMS_SECTION_LABELS[sectionKey] ?? sectionKey}</h3>
      {entries.length === 0 ? <p className="cms-muted">Dieser Block hat noch keine CMS-Felder.</p> : null}
      {entries.map(([key, value]) => (
        <GenericValue
          key={key}
          section={sectionKey}
          path={key}
          label={key}
          value={value}
          onChange={(next) => setDraft({ ...draft, [key]: next })}
        />
      ))}
      <SaveBar sectionKey={sectionKey} onSave={() => cms!.saveSection(sectionKey, payload)} />
    </form>
  );
}

function GenericValue({
  section,
  path,
  label,
  value,
  onChange,
}: {
  section: string;
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
        section={section}
        path={path}
        label={label}
        value={value}
        onChange={onChange}
        multiline={isLongText(value, path)}
      />
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="cms-list">
        {value.map((item, index) => {
          const itemPath = `${path}.${index}`;
          return (
            <fieldset key={itemPath} className="cms-tile" data-cms-panel-focus={`${path}:${index}`}>
              <legend>
                {label} {index + 1}
              </legend>
              {isPlainObject(item) ? (
                Object.entries(item).map(([childKey, childValue]) =>
                  typeof childValue === 'string' || typeof childValue === 'number' || typeof childValue === 'boolean' ? (
                    <GenericValue
                      key={childKey}
                      section={section}
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
                <Field
                  label={label}
                  value={String(item ?? '')}
                  onChange={(next) => {
                    const copy = value.slice();
                    copy[index] = next;
                    onChange(copy);
                  }}
                />
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
            section={section}
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
