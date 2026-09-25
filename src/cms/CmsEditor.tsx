import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useHotel, useHotelContent, useSection } from '../context/HotelContext';
import { ROOMS_PAGE_FALLBACK, resolveRooms } from '../lib/rooms';
import type { HotelFAQ } from '../lib/supabase';
import { fieldKind, isLongText, isPlainObject, shouldPublishPreview } from './cmsDraft';
import { keepLiveFocals } from './cmsFocal';
import {
  CMS_DETAIL_LABELS,
  CMS_EDITOR_PAGES,
  cmsDetailFromPath,
  cmsEntryHref,
  matchesCmsEntry,
  sectionDraft,
} from './cmsPages';
import { useCms } from './CmsContext';
import { CmsIconPicker } from './CmsIconPicker';
import { CmsImageField } from './CmsImageField';
import { CmsTextarea } from './CmsTextarea';
import { CMS_SECTION_LABELS, describeSelection } from './cmsSelect';

const CUSTOM_SECTIONS = new Set(['hero', 'welcome', 'discover', 'rooms_page', 'faq_page']);

function useLivePreview(sectionKey: string, payload: Record<string, unknown>) {
  const cms = useCms();
  const preview = cms?.preview;
  const previewRef = useRef(preview);
  previewRef.current = preview;
  const serial = JSON.stringify(payload);
  const lastSerial = useRef<string | null>(null);
  useEffect(() => {
    if (!shouldPublishPreview(serial, lastSerial.current)) {
      lastSerial.current = serial;
      return;
    }
    lastSerial.current = serial;
    previewRef.current?.(sectionKey, JSON.parse(serial) as Record<string, unknown>);
  }, [sectionKey, serial]);
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

function useCmsDetail() {
  const location = useLocation();
  return cmsDetailFromPath(location.pathname);
}

export function CmsEditor() {
  const cms = useCms();
  const location = useLocation();
  const detail = useCmsDetail();
  const selectRef = useRef(cms?.select);
  selectRef.current = cms?.select;
  const selected = cms?.selected ?? null;

  useEffect(() => {
    if (!detail) return;
    selectRef.current?.(detail.section, `item:${detail.entryId}`, `items.${detail.entryId}`);
  }, [detail?.section, detail?.entryId]);

  useEffect(() => {
    if (!cms) return;
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

  if (!cms) return null;
  const section = selected?.section ?? detail?.section ?? null;
  const dirty = section ? cms.dirty[section] : false;
  const currentHub = CMS_EDITOR_PAGES.find(
    (page) => page.to === location.pathname || (page.to !== '/cms' && location.pathname.startsWith(`${page.to}/`)),
  );
  const showEntry = Boolean(detail && section === detail.section);

  return (
    <aside className="cms-dock">
      <header className="cms-dock__top">
        <strong>Seite bearbeiten</strong>
        <p>Text direkt auf der Seite ändern und übernehmen. Rechts dasselbe, mit Live-Vorschau. Speichern schreibt den ganzen Block.</p>
        {selected ? <p className="cms-dock__hit">{describeSelection(selected)}</p> : null}
        {dirty ? <p className="cms-dock__hit">Vorschau — noch nicht gespeichert</p> : null}
        <nav className="cms-dock__nav">
          {CMS_EDITOR_PAGES.map((page) => (
            <Link key={page.to} to={page.to} aria-current={currentHub?.to === page.to ? 'page' : undefined}>
              {page.label}
            </Link>
          ))}
          <a href="/">Öffentliche Seite</a>
        </nav>
      </header>
      <div className="cms-dock__body">
        {!section ? <p className="cms-muted">Noch kein Block gewählt.</p> : null}
        {section === 'hero' ? <HeroFields /> : null}
        {section === 'welcome' ? <WelcomeFields /> : null}
        {section === 'discover' ? <DiscoverFields /> : null}
        {section === 'rooms_page' ? <RoomsFields /> : null}
        {section === 'faq_page' ? <FaqFields /> : null}
        {showEntry && detail ? (
          <EntryFields key={`${detail.section}:${detail.entryId}`} sectionKey={detail.section} entryId={detail.entryId} hub={detail.hub} />
        ) : null}
        {section && !CUSTOM_SECTIONS.has(section) && !showEntry ? <GenericFields key={section} sectionKey={section} /> : null}
      </div>
      <footer className="cms-dock__save">
        {dirty ? <p className="cms-muted">Vorschau — noch nicht gespeichert.</p> : null}
        {cms.saveError ? <p className="cms-error">{cms.saveError}</p> : null}
        <button type="button" className="cms-btn" disabled={!cms.canSave || cms.saving} onClick={() => void cms.runSave()}>
          {cms.saving ? 'Speichert…' : 'Speichern'}
        </button>
      </footer>
    </aside>
  );
}

function SaveBar({ sectionKey, onSave }: { sectionKey: string; onSave: () => Promise<unknown> }) {
  const cms = useCms();
  const setSaveAction = cms?.setSaveAction;
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (!setSaveAction) return;
    setSaveAction(() => onSaveRef.current());
    return () => setSaveAction(null);
  }, [sectionKey, setSaveAction]);

  return null;
}

function HeroFields() {
  const cms = useCms();
  const data = useSection('hero') ?? {};
  const [draft, setDraft] = useState({
    title: String(data.title ?? ''),
    subtitle: String(data.subtitle ?? ''),
    hero_image: String(data.hero_image ?? ''),
    hero_image_alt: String(data.hero_image_alt ?? ''),
  });

  useEffect(() => {
    setDraft({
      title: String(data.title ?? ''),
      subtitle: String(data.subtitle ?? ''),
      hero_image: String(data.hero_image ?? ''),
      hero_image_alt: String(data.hero_image_alt ?? ''),
    });
  }, [cms?.draftTick]);

  const payload = keepLiveFocals(
    {
      ...data,
      title: draft.title,
      subtitle: draft.subtitle,
      hero_image: draft.hero_image,
      hero_image_alt: draft.hero_image_alt,
    },
    data,
  );
  useLivePreview('hero', payload);

  return (
    <form className="cms-form" onSubmit={(event: FormEvent) => event.preventDefault()}>
      <h3>Hero</h3>
      <Field focus="title" path="title" label="Titel" value={draft.title} onChange={(title) => setDraft({ ...draft, title })} />
      <Field focus="subtitle" path="subtitle" label="Untertitel" value={draft.subtitle} onChange={(subtitle) => setDraft({ ...draft, subtitle })} />
      <CmsImageField focus="image" label="Bild" value={draft.hero_image} section="hero" path="hero_image" />
      <Field label="Alt-Text" value={draft.hero_image_alt} onChange={(hero_image_alt) => setDraft({ ...draft, hero_image_alt })} />
      <p className="cms-muted">Ausschnitt: oben Desktop oder Mobil wählen, dann das Bild in der Vorschau ziehen.</p>
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

  const payload = keepLiveFocals({
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
  }, base);
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

function FaqFields() {
  const cms = useCms();
  const { content } = useHotelContent();
  const page = useSection('faq_page');
  const base = sectionDraft('faq_page', page);
  const [draft, setDraft] = useState({
    eyebrow: String(base.eyebrow ?? ''),
    title: String(base.title ?? ''),
    subtitle: String(base.subtitle ?? ''),
    cta_text: String(base.cta_text ?? ''),
    cta_button: String(base.cta_button ?? ''),
  });
  const [faqs, setFaqs] = useState<HotelFAQ[]>(content?.faqs ?? []);

  useEffect(() => {
    const next = sectionDraft('faq_page', page);
    setDraft({
      eyebrow: String(next.eyebrow ?? ''),
      title: String(next.title ?? ''),
      subtitle: String(next.subtitle ?? ''),
      cta_text: String(next.cta_text ?? ''),
      cta_button: String(next.cta_button ?? ''),
    });
    setFaqs(content?.faqs ?? []);
  }, [cms?.draftTick]);

  const payload = { ...base, ...draft };
  useLivePreview('faq_page', payload);
  const previewFaqs = cms?.previewFaqs;
  const previewFaqsRef = useRef(previewFaqs);
  previewFaqsRef.current = previewFaqs;
  const faqsSerial = JSON.stringify(faqs);
  const lastFaqs = useRef<string | null>(null);
  useEffect(() => {
    if (!shouldPublishPreview(faqsSerial, lastFaqs.current)) {
      lastFaqs.current = faqsSerial;
      return;
    }
    lastFaqs.current = faqsSerial;
    previewFaqsRef.current?.(JSON.parse(faqsSerial) as HotelFAQ[]);
  }, [faqsSerial]);

  function updateFaq(index: number, key: keyof HotelFAQ, value: string | boolean) {
    setFaqs(faqs.map((faq, faqIndex) => (faqIndex === index ? { ...faq, [key]: value } : faq)));
  }

  async function save() {
    const pageOk = await cms!.saveSection('faq_page', payload);
    if (!pageOk) return;
    await cms!.saveFaqs(faqs);
  }

  return (
    <form className="cms-form" onSubmit={(event) => event.preventDefault()}>
      <h3>FAQ</h3>
      <Field focus="head" path="eyebrow" label="Eyebrow" value={draft.eyebrow} onChange={(eyebrow) => setDraft({ ...draft, eyebrow })} />
      <Field focus="title" path="title" label="Titel" value={draft.title} onChange={(title) => setDraft({ ...draft, title })} />
      <Field focus="subtitle" path="subtitle" label="Untertitel" value={draft.subtitle} onChange={(subtitle) => setDraft({ ...draft, subtitle })} />
      <Field focus="cta" path="cta_text" label="CTA-Text" value={draft.cta_text} onChange={(cta_text) => setDraft({ ...draft, cta_text })} />
      <Field path="cta_button" label="CTA-Button" value={draft.cta_button} onChange={(cta_button) => setDraft({ ...draft, cta_button })} />
      {faqs.map((faq, index) => (
        <fieldset key={faq.id} className="cms-tile" data-cms-panel-focus={`faq:${faq.id}`}>
          <legend>Frage {index + 1}</legend>
          <Field label="Kategorie" value={faq.category} onChange={(category) => updateFaq(index, 'category', category)} />
          <Field label="Frage" value={faq.question} onChange={(question) => updateFaq(index, 'question', question)} multiline />
          <Field label="Antwort" value={faq.answer} onChange={(answer) => updateFaq(index, 'answer', answer)} multiline />
          <label className="cms-choice">
            <input
              type="checkbox"
              checked={faq.show_on_home}
              onChange={(event) => updateFaq(index, 'show_on_home', event.target.checked)}
            />
            Auf der Startseite
          </label>
        </fieldset>
      ))}
      <button
        type="button"
        className="cms-btn cms-btn--ghost"
        onClick={() =>
          setFaqs([
            ...faqs,
            {
              id: `new-${Date.now()}`,
              hotel_id: content?.hotel.id ?? '',
              category: 'Allgemein',
              question: '',
              answer: '',
              sort_order: faqs.length,
              show_on_home: false,
            },
          ])
        }
      >
        Frage hinzufügen
      </button>
      <SaveBar sectionKey="faq_page" onSave={save} />
    </form>
  );
}

function EntryFields({ sectionKey, entryId, hub }: { sectionKey: string; entryId: string; hub: string }) {
  const cms = useCms();
  const data = useSection(sectionKey);
  const base = sectionDraft(sectionKey, data);
  const [draft, setDraft] = useState<Record<string, unknown>>(base);

  useEffect(() => {
    setDraft(sectionDraft(sectionKey, data));
  }, [cms?.draftTick, sectionKey]);

  const payload = keepLiveFocals({ ...base, ...draft }, data);
  useLivePreview(sectionKey, payload);

  const items = Array.isArray(draft.items) ? (draft.items as Record<string, unknown>[]) : [];
  const item = items.find((entry) => matchesCmsEntry(entry, entryId));
  const itemId = typeof item?.id === 'string' ? item.id : entryId;
  const title =
    (typeof item?.title === 'string' && item.title) ||
    (typeof item?.name === 'string' && item.name) ||
    entryId;

  function updateItem(next: unknown) {
    setDraft({
      ...draft,
      items: items.map((entry) => (matchesCmsEntry(entry, entryId) ? (next as Record<string, unknown>) : entry)),
    });
  }

  return (
    <form className="cms-form" onSubmit={(event) => event.preventDefault()}>
      <h3>{CMS_DETAIL_LABELS[sectionKey] ?? CMS_SECTION_LABELS[sectionKey] ?? sectionKey}</h3>
      <p className="cms-muted">{title}</p>
      <Link className="cms-entry-open" to={hub}>
        Zur Übersicht
      </Link>
      {!item ? (
        <p className="cms-muted">Dieser Eintrag liegt nicht in den Daten.</p>
      ) : (
        <GenericValue
          section={sectionKey}
          path={`items.${itemId}`}
          label={CMS_DETAIL_LABELS[sectionKey] ?? 'Eintrag'}
          value={item}
          onChange={updateItem}
        />
      )}
      <SaveBar sectionKey={sectionKey} onSave={() => cms!.saveSection(sectionKey, payload)} />
    </form>
  );
}

function GenericFields({ sectionKey }: { sectionKey: string }) {
  const cms = useCms();
  const data = useSection(sectionKey);
  const base = sectionDraft(sectionKey, data);
  const [draft, setDraft] = useState<Record<string, unknown>>(base);

  useEffect(() => {
    setDraft(sectionDraft(sectionKey, data));
  }, [cms?.draftTick, sectionKey]);

  const payload = keepLiveFocals({ ...base, ...draft }, data);
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
  if (path === 'hero_focal' || path.endsWith('.hero_focal')) return null;

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
          const itemId = isPlainObject(item) && typeof item.id === 'string' ? item.id : String(index);
          const itemPath = `${path}.${itemId}`;
          const openTo = path === 'items' && isPlainObject(item) ? cmsEntryHref(section, item) : null;
          return (
            <fieldset key={itemPath} className="cms-tile" data-cms-panel-focus={`${path}:${index}`}>
              <legend>
                {label} {index + 1}
              </legend>
              {openTo ? (
                <Link className="cms-entry-open" to={openTo}>
                  Seite öffnen
                </Link>
              ) : null}
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
                  ) : (
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
                  ),
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
