import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useHotel, useHotelContent, useSection } from '../context/HotelContext';
import { type DiscoverTile, newDiscoverTile, resolveDiscoverTiles } from '../lib/media';
import { BLOG_TOPICS, resolveBlogPosts } from '../lib/blog';
import { readFilters } from '../lib/listFilters';
import { hasReadMore, placeReadMore, READ_MORE_MARK, stripReadMore } from '../lib/readMore';
import { ROOM_FILTERS, ROOMS_PAGE_FALLBACK, resolveRooms } from '../lib/rooms';
import type { HotelFAQ } from '../lib/supabase';
import { fieldKind, isLongText, isPlainObject, keepLiveMedia, shouldPublishPreview } from './cmsDraft';
import { keepLiveFocals, readHeroFocal } from './cmsFocal';
import {
  CMS_DETAIL_LABELS,
  CMS_EDITOR_PAGES,
  cmsDetailFromPath,
  cmsEntryHref,
  matchesCmsEntry,
  sectionDraft,
} from './cmsPages';
import { heroTextTop } from '../components/Hero';
import { useCms } from './CmsContext';
import { isHiddenMetaPath } from './cmsHidden';
import { CmsFilterEditor } from './CmsFilterEditor';
import { CmsIconPicker } from './CmsIconPicker';
import { CmsImageField } from './CmsImageField';
import { CmsLinkPicker } from './CmsLinkPicker';
import { CmsTextarea } from './CmsTextarea';
import { CMS_SECTION_LABELS, describeSelection } from './cmsSelect';

const CUSTOM_SECTIONS = new Set(['navbar', 'hero', 'welcome', 'discover', 'rooms_page', 'faq_page']);

function useLivePreview(sectionKey: string, payload: Record<string, unknown>) {
  const cms = useCms();
  const live = useSection(sectionKey);
  const merged = keepLiveMedia(payload, live);
  const preview = cms?.preview;
  const previewRef = useRef(preview);
  previewRef.current = preview;
  const serial = JSON.stringify(merged);
  const lastSerial = useRef<string | null>(null);
  useEffect(() => {
    if (!shouldPublishPreview(serial, lastSerial.current)) {
      lastSerial.current = serial;
      return;
    }
    lastSerial.current = serial;
    previewRef.current?.(sectionKey, JSON.parse(serial) as Record<string, unknown>);
  }, [sectionKey, serial]);
  return merged;
}

function Field({
  label,
  value,
  onChange,
  multiline,
  focus,
  kind,
  color,
  onColorChange,
  section,
  path,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  focus?: string;
  kind?: 'text' | 'image' | 'icon' | 'color';
  color?: string;
  onColorChange?: (color: string) => void;
  section?: string;
  path?: string;
}) {
  const resolved = kind ?? (path ? fieldKind(path, value) : 'text');
  if (resolved === 'icon') {
    return (
      <div className="cms-field" data-cms-panel-focus={focus ?? path}>
        {label}
        <CmsIconPicker value={value} onChange={onChange} color={color} onColorChange={onColorChange} />
      </div>
    );
  }
  if (resolved === 'color') {
    return (
      <label className="cms-field cms-icon-color" data-cms-panel-focus={focus ?? path}>
        {label}
        <input type="color" value={value || '#957640'} onChange={(event) => onChange(event.target.value)} />
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="#957640" />
      </label>
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
        <CmsTextarea value={value} onChange={onChange} minRows={value.length > 180 ? 8 : 5} placeholder={label} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={label} />
      )}
    </label>
  );
}

function ItemDeleteButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="cms-item-delete" data-cms-ui="delete" onClick={onClick} aria-label={label}>
      <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
      Löschen
    </button>
  );
}

function useCmsDetail() {
  const location = useLocation();
  return cmsDetailFromPath(location.pathname);
}

export function CmsEditor() {
  const cms = useCms();
  const location = useLocation();
  const { content } = useHotelContent();
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
      // Scroll the panel only: scrollIntoView would also move the page preview behind it,
      // so a double click for inline editing would land on another entry.
      const top = target.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
      root.scrollTo({ top: Math.max(0, top - 8), behavior: 'smooth' });
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
          {Object.entries(content?.pages ?? {})
            .filter(([key, on]) => on && key !== 'home' && !CMS_EDITOR_PAGES.some((page) => page.publicPath === `/${key}` || page.publicPath === key))
            .map(([key]) => (
              <Link key={key} to={`/cms/seite/${key}`} aria-current={location.pathname === `/cms/seite/${key}` ? 'page' : undefined}>
                {key}
              </Link>
            ))}
          <a href="/">Öffentliche Seite</a>
        </nav>
      </header>
      <div className="cms-dock__body">
        {!section ? <p className="cms-muted">Noch kein Block gewählt.</p> : null}
        {section === 'navbar' ? <NavbarFields /> : null}
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

type BarLink = { label: string; href: string };

function readBarLinks(value: unknown): BarLink[] {
  return Array.isArray(value)
    ? value.filter(isPlainObject).map((link) => ({ label: String(link.label ?? ''), href: String(link.href ?? '') }))
    : [];
}

// Desktop bar after scrolling: a few chosen pages next to "Menü", and the optional
// "Anfragen" button (off unless switched on for the hotel).
const BAR_LINKS_MAX = 6;

function NavbarFields() {
  const cms = useCms();
  const data = useSection('navbar') ?? {};
  const read = () => ({
    logo_white: String(data.logo_white ?? ''),
    logo_normal: String(data.logo_normal ?? ''),
    links: readBarLinks(data.links),
    show_inquire: data.show_inquire === true,
    cta_text: String(data.cta_text ?? ''),
    cta_href: String(data.cta_href ?? ''),
    bar_voucher_href: String(data.bar_voucher_href ?? ''),
    bar_arrival_href: String(data.bar_arrival_href ?? ''),
  });
  const [draft, setDraft] = useState(read);

  useEffect(() => {
    setDraft(read());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cms?.draftTick]);

  const payload = keepLiveMedia(
    {
      ...data,
      ...draft,
      logo_white: String(data.logo_white || draft.logo_white),
      logo_normal: String(data.logo_normal || draft.logo_normal),
    },
    data,
  );
  useLivePreview('navbar', payload);

  const setLink = (index: number, next: Partial<BarLink>) =>
    setDraft({ ...draft, links: draft.links.map((link, at) => (at === index ? { ...link, ...next } : link)) });
  const moveLink = (index: number, step: number) => {
    const target = index + step;
    if (target < 0 || target >= draft.links.length) return;
    const links = draft.links.slice();
    [links[index], links[target]] = [links[target], links[index]];
    setDraft({ ...draft, links });
  };

  return (
    <form className="cms-form" onSubmit={(event: FormEvent) => event.preventDefault()}>
      <h3>Logo & Leiste</h3>
      <p className="cms-muted">
        Zwei Dateien: weiß auf dem Headerbild, farbig auf der hellen Leiste nach dem Scrollen. Klick auf das Logo
        in der Vorschau öffnet diese Felder.
      </p>
      <CmsImageField focus="logo" label="Logo weiß (auf dem Header)" value={String(data.logo_white || draft.logo_white)} section="navbar" path="logo_white" />
      <CmsImageField focus="logo" label="Logo farbig (helle Leiste)" value={String(data.logo_normal || draft.logo_normal)} section="navbar" path="logo_normal" />

      <fieldset className="cms-fade">
        <legend>Menüpunkte in der Leiste (Desktop)</legend>
        <p className="cms-muted">
          Erscheinen am Desktop nach dem Scrollen neben „Menü“, in dieser Reihenfolge. Höchstens {BAR_LINKS_MAX}; Seiten, die
          ausgeschaltet sind, fallen automatisch weg. Alle Seiten bleiben im großen Menü.
        </p>
        {draft.links.map((link, index) => (
          <div key={index} className="cms-bar-link">
            <div className="cms-filters__row">
              <input aria-label="Bezeichnung" value={link.label} placeholder="Bezeichnung" onChange={(event) => setLink(index, { label: event.target.value })} />
              <button type="button" className="cms-item-move" disabled={index === 0} onClick={() => moveLink(index, -1)} aria-label="Nach vorn">
                ↑
              </button>
              <button type="button" className="cms-item-move" disabled={index === draft.links.length - 1} onClick={() => moveLink(index, 1)} aria-label="Nach hinten">
                ↓
              </button>
              <button
                type="button"
                className="cms-item-move"
                onClick={() => setDraft({ ...draft, links: draft.links.filter((_, at) => at !== index) })}
                aria-label={`${link.label || 'Menüpunkt'} entfernen`}
              >
                ✕
              </button>
            </div>
            <CmsLinkPicker value={link.href} context={link.label} onChange={(href) => setLink(index, { href })} />
          </div>
        ))}
        {draft.links.length < BAR_LINKS_MAX ? (
          <button type="button" className="cms-btn cms-btn--ghost" onClick={() => setDraft({ ...draft, links: [...draft.links, { label: '', href: '' }] })}>
            Menüpunkt hinzufügen
          </button>
        ) : null}
      </fieldset>

      <fieldset className="cms-fade">
        <legend>„Anfragen“-Button</legend>
        <label className="cms-choice">
          <input type="checkbox" checked={draft.show_inquire} onChange={(event) => setDraft({ ...draft, show_inquire: event.target.checked })} />
          Neben „Buchen“ einen zweiten Button zeigen
        </label>
        {draft.show_inquire ? (
          <>
            <Field label="Beschriftung" value={draft.cta_text} onChange={(cta_text) => setDraft({ ...draft, cta_text })} />
            <CmsLinkPicker
              label="Ziel"
              value={draft.cta_href}
              context={draft.cta_text}
              onChange={(cta_href) => setDraft({ ...draft, cta_href })}
            />
          </>
        ) : null}
      </fieldset>
      <fieldset className="cms-fade">
        <legend>Symbole in der Buchungsleiste (Desktop)</legend>
        <p className="cms-muted">E-Mail und Telefon kommen aus den Hoteldaten. Gutscheine erscheinen nur mit Ziel.</p>
        <CmsLinkPicker
          label="Gutscheine (Geschenk-Symbol)"
          value={draft.bar_voucher_href}
          context="Gutscheine"
          onChange={(bar_voucher_href) => setDraft({ ...draft, bar_voucher_href })}
        />
        {draft.bar_voucher_href ? (
          <button type="button" className="cms-btn cms-btn--ghost" onClick={() => setDraft({ ...draft, bar_voucher_href: '' })}>
            Gutschein-Symbol ausblenden
          </button>
        ) : null}
        <CmsLinkPicker
          label="Anreise (Karten-Symbol)"
          value={draft.bar_arrival_href}
          context="Anreise"
          onChange={(bar_arrival_href) => setDraft({ ...draft, bar_arrival_href })}
        />
        <p className="cms-muted">
          {draft.bar_arrival_href ? '' : 'Ohne eigenes Ziel öffnet das Symbol die Hoteladresse in Google Maps.'}
        </p>
        {draft.bar_arrival_href ? (
          <button type="button" className="cms-btn cms-btn--ghost" onClick={() => setDraft({ ...draft, bar_arrival_href: '' })}>
            Zurück zu Google Maps
          </button>
        ) : null}
      </fieldset>
      <SaveBar sectionKey="navbar" onSave={() => cms!.saveSection('navbar', payload)} />
    </form>
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
    fade_desktop: Number(data.fade_desktop ?? 0) || 0,
    fade_mobile: Number(data.fade_mobile ?? 0) || 0,
    eyebrow: String(data.eyebrow ?? ''),
    title_word_normal: String(data.title_word_normal ?? ''),
    title_word_script: String(data.title_word_script ?? ''),
    text_top: Math.round(heroTextTop(data.text_top) * 100),
    text_top_mobile: data.text_top_mobile != null && data.text_top_mobile !== '' ? Math.round(heroTextTop(data.text_top_mobile) * 100) : null,
    layout: data.layout === 'classic' ? 'classic' : 'flow',
  });

  useEffect(() => {
    setDraft({
      title: String(data.title ?? ''),
      subtitle: String(data.subtitle ?? ''),
      hero_image: String(data.hero_image ?? ''),
      hero_image_alt: String(data.hero_image_alt ?? ''),
      fade_desktop: Number(data.fade_desktop ?? 0) || 0,
      fade_mobile: Number(data.fade_mobile ?? 0) || 0,
      eyebrow: String(data.eyebrow ?? ''),
      title_word_normal: String(data.title_word_normal ?? ''),
      title_word_script: String(data.title_word_script ?? ''),
      text_top: Math.round(heroTextTop(data.text_top) * 100),
      text_top_mobile: data.text_top_mobile != null && data.text_top_mobile !== '' ? Math.round(heroTextTop(data.text_top_mobile) * 100) : null,
      layout: data.layout === 'classic' ? 'classic' : 'flow',
    });
  }, [cms?.draftTick]);

  const payload = keepLiveFocals(
    {
      ...data,
      title: draft.title,
      subtitle: draft.subtitle,
      hero_image: String(data.hero_image || draft.hero_image),
      hero_image_alt: draft.hero_image_alt,
      fade_desktop: draft.fade_desktop,
      fade_mobile: draft.fade_mobile,
      eyebrow: draft.eyebrow,
      title_word_normal: draft.title_word_normal,
      title_word_script: draft.title_word_script,
      layout: draft.layout,
      text_top: draft.text_top,
      text_top_mobile: draft.text_top_mobile,
    },
    data,
  );
  useLivePreview('hero', payload);

  return (
    <form className="cms-form" onSubmit={(event: FormEvent) => event.preventDefault()}>
      <h3>Hero</h3>
      <label className="cms-field">
        Darstellung
        <select value={draft.layout} onChange={(event) => setDraft({ ...draft, layout: event.target.value })}>
          <option value="flow">Wie die Unterseiten (Schrift wandert beim Scrollen)</option>
          <option value="classic">Klassisch (Schrift auf dem Bild, Stand bis Okt. 2026)</option>
        </select>
      </label>
      {draft.layout === 'flow' ? (
        <>
          <Field focus="head" path="eyebrow" label="Zeile über dem Titel in Schreibschrift (optional)" value={draft.eyebrow} onChange={(eyebrow) => setDraft({ ...draft, eyebrow })} />
          <label className="cms-field">
            Schrift-Position{draft.text_top_mobile != null ? ' Desktop' : ''}: {draft.text_top} % von oben
            <input type="range" min={25} max={75} step={1} value={draft.text_top} onChange={(event) => setDraft({ ...draft, text_top: Number(event.target.value) })} />
          </label>
          <label className="cms-choice">
            <input
              type="checkbox"
              checked={draft.text_top_mobile != null}
              onChange={(event) => setDraft({ ...draft, text_top_mobile: event.target.checked ? draft.text_top : null })}
            />
            Auf Handys eigene Position
          </label>
          {draft.text_top_mobile != null ? (
            <label className="cms-field">
              Schrift-Position Handy: {draft.text_top_mobile} % von oben
              <input type="range" min={25} max={75} step={1} value={draft.text_top_mobile} onChange={(event) => setDraft({ ...draft, text_top_mobile: Number(event.target.value) })} />
            </label>
          ) : null}
        </>
      ) : null}
      <Field focus="title" path="title" label={draft.layout === 'flow' ? 'Titelzeile 1' : 'Titel'} value={draft.title} onChange={(title) => setDraft({ ...draft, title })} />
      {draft.layout === 'flow' ? (
        <>
          <Field focus="title" path="title_word_normal" label="Titelzeile 2: normale Schrift (optional)" value={draft.title_word_normal} onChange={(title_word_normal) => setDraft({ ...draft, title_word_normal })} />
          <Field focus="title" path="title_word_script" label="Titelzeile 2: Schreibschrift (optional)" value={draft.title_word_script} onChange={(title_word_script) => setDraft({ ...draft, title_word_script })} />
        </>
      ) : null}
      <Field focus="subtitle" path="subtitle" label="Untertitel" value={draft.subtitle} onChange={(subtitle) => setDraft({ ...draft, subtitle })} />
      <CmsImageField focus="image" label="Bild" value={String(data.hero_image || draft.hero_image)} section="hero" path="hero_image" />
      <Field label="Alt-Text" value={draft.hero_image_alt} onChange={(hero_image_alt) => setDraft({ ...draft, hero_image_alt })} />
      <CmsImageField focus="image_mobile" label="Bild für Handys (optional)" value={String(data.hero_image_mobile ?? '')} section="hero" path="hero_image_mobile" />
      <p className="cms-muted">
        Leer: Handys zeigen das Desktop-Bild (in der Handy-Ansicht ziehen und zoomen). Für einen eigenen Ausschnitt aus dem
        Original: hier oder in der Handy-Ansicht aufs Bild klicken.
      </p>
      {data.hero_image_mobile ? (
        <button type="button" className="cms-btn cms-btn--ghost" onClick={() => cms?.removeImage('hero', 'hero_image_mobile', { hero_focal: { desktop: readHeroFocal(data.hero_focal).desktop } })}>
          Handy-Bild entfernen
        </button>
      ) : null}
      <fieldset className="cms-fade" data-cms-panel-focus="fade">
        <legend>Farbverlauf unten (Hotelfarbe)</legend>
        <p className="cms-muted">Überdeckt einen unruhigen unteren Bildrand, damit die Schrift gut lesbar bleibt. 0 % = aus.</p>
        <label className="cms-field">
          Desktop: {draft.fade_desktop} %
          <input type="range" min={0} max={100} step={5} value={draft.fade_desktop} onChange={(event) => setDraft({ ...draft, fade_desktop: Number(event.target.value) })} />
        </label>
        <label className="cms-field">
          Handy: {draft.fade_mobile} %
          <input type="range" min={0} max={100} step={5} value={draft.fade_mobile} onChange={(event) => setDraft({ ...draft, fade_mobile: Number(event.target.value) })} />
        </label>
        <p className="cms-muted">Die Handy-Wirkung siehst du, wenn oben die Mobil-Ansicht gewählt ist.</p>
      </fieldset>
      <p className="cms-muted">
        Ausschnitt: oben Desktop oder Mobil wählen, dann das Bild ziehen. Mit + / − den Ausschnitt zoomen.
      </p>
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
  // Where the cursor last stood in one of the two paragraphs (for the read-more mark).
  const [caret, setCaret] = useState<{ key: string; position: number } | null>(null);
  const rememberCaret = (key: string) => (event: { target: EventTarget }) => {
    if (event.target instanceof HTMLTextAreaElement) setCaret({ key, position: event.target.selectionStart });
  };

  return (
    <form className="cms-form" onSubmit={(event) => event.preventDefault()}>
      <h3>Welcome</h3>
      <Field focus="title" path="title_line1" label="Titelzeile 1" value={draft.title_line1} onChange={(title_line1) => setDraft({ ...draft, title_line1 })} />
      <Field focus="title" path="title_word_normal" label="Wort normal" value={draft.title_word_normal} onChange={(title_word_normal) => setDraft({ ...draft, title_word_normal })} />
      <Field focus="title" path="title_word_script" label="Wort Schreibschrift" value={draft.title_word_script} onChange={(title_word_script) => setDraft({ ...draft, title_word_script })} />
      <Field focus="subtitle" path="subtitle" label="Untertitel" value={draft.subtitle} onChange={(subtitle) => setDraft({ ...draft, subtitle })} />
      <div onKeyUpCapture={rememberCaret('text_paragraph1')} onClickCapture={rememberCaret('text_paragraph1')} onSelectCapture={rememberCaret('text_paragraph1')}>
        <Field focus="text" path="text_paragraph1" label="Absatz 1" value={draft.text_paragraph1} onChange={(text_paragraph1) => setDraft({ ...draft, text_paragraph1 })} multiline />
      </div>
      <div onKeyUpCapture={rememberCaret('text_paragraph2')} onClickCapture={rememberCaret('text_paragraph2')} onSelectCapture={rememberCaret('text_paragraph2')}>
        <Field focus="text" path="text_paragraph2" label="Absatz 2" value={draft.text_paragraph2} onChange={(text_paragraph2) => setDraft({ ...draft, text_paragraph2 })} multiline />
      </div>
      <fieldset className="cms-fade">
        <legend>Kürzung auf Handys</legend>
        <p className="cms-muted">
          Auf Handys erscheint der Text gekürzt mit „Weiterlesen“. Ohne Angabe nach drei Zeilen. Eigene Stelle: Cursor im Text
          an die gewünschte Stelle setzen und den Knopf drücken (oder {READ_MORE_MARK} von Hand schreiben). Der ganze Text bleibt
          für Suchmaschinen und KI lesbar.
        </p>
        <div className="cms-modal__actions">
          <button
            type="button"
            className="cms-btn cms-btn--ghost"
            disabled={!caret}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              if (!caret) return;
              const texts = { text_paragraph1: draft.text_paragraph1, text_paragraph2: draft.text_paragraph2 };
              setDraft({ ...draft, ...placeReadMore(texts, caret.key, caret.position) });
            }}
          >
            „Weiterlesen“ hier setzen
          </button>
          {hasReadMore(draft.text_paragraph1) || hasReadMore(draft.text_paragraph2) ? (
            <button
              type="button"
              className="cms-btn cms-btn--ghost"
              onClick={() => setDraft({ ...draft, text_paragraph1: stripReadMore(draft.text_paragraph1), text_paragraph2: stripReadMore(draft.text_paragraph2) })}
            >
              Eigene Stelle entfernen
            </button>
          ) : null}
        </div>
      </fieldset>
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
    title_script: String(data.title_script ?? ''),
    subtitle: String(data.subtitle ?? ''),
    feature_image_left: String(data.feature_image_left ?? ''),
    feature_image_left_alt: String(data.feature_image_left_alt ?? ''),
    feature_image_right: String(data.feature_image_right ?? ''),
    feature_image_right_alt: String(data.feature_image_right_alt ?? ''),
    tiles: resolveDiscoverTiles(data.tiles),
  });

  useEffect(() => {
    setDraft({
      eyebrow: String(data.eyebrow ?? ''),
      title: String(data.title ?? ''),
      title_script: String(data.title_script ?? ''),
      subtitle: String(data.subtitle ?? ''),
      feature_image_left: String(data.feature_image_left ?? ''),
      feature_image_left_alt: String(data.feature_image_left_alt ?? ''),
      feature_image_right: String(data.feature_image_right ?? ''),
      feature_image_right_alt: String(data.feature_image_right_alt ?? ''),
      tiles: resolveDiscoverTiles(data.tiles),
    });
  }, [cms?.draftTick]);

  const payload = keepLiveMedia(
    {
      ...data,
      ...draft,
      feature_image_left: String(data.feature_image_left || draft.feature_image_left),
      feature_image_right: String(data.feature_image_right || draft.feature_image_right),
    },
    data,
  );
  useLivePreview('discover', payload);

  const liveTiles = resolveDiscoverTiles(data.tiles);

  function setTiles(tiles: DiscoverTile[]) {
    setDraft({ ...draft, tiles });
  }

  function updateTile(index: number, key: 'title' | 'eyebrow' | 'href' | 'image', value: string) {
    setTiles(draft.tiles.map((tile, tileIndex) => (tileIndex === index ? { ...tile, [key]: value } : tile)));
  }

  function moveTile(index: number, step: number) {
    const target = index + step;
    if (target < 0 || target >= draft.tiles.length) return;
    const tiles = draft.tiles.slice();
    [tiles[index], tiles[target]] = [tiles[target], tiles[index]];
    setTiles(tiles);
  }

  return (
    <form className="cms-form" onSubmit={(event) => event.preventDefault()}>
      <h3>Discover</h3>
      <Field focus="head" path="eyebrow" label="Eyebrow" value={draft.eyebrow} onChange={(eyebrow) => setDraft({ ...draft, eyebrow })} />
      <Field focus="head" path="title" label="Titel" value={draft.title} onChange={(title) => setDraft({ ...draft, title })} />
      <Field
        focus="head"
        path="title_script"
        label="Wort/Wörter daraus in goldener Schreibschrift (optional)"
        value={draft.title_script}
        onChange={(title_script) => setDraft({ ...draft, title_script })}
      />
      {draft.title_script.trim() && !draft.title.toLowerCase().includes(draft.title_script.trim().toLowerCase()) ? (
        <p className="cms-error">Diese Wörter kommen im Titel nicht vor – bitte genau so schreiben wie im Titel.</p>
      ) : null}
      <Field focus="head" path="subtitle" label="Untertitel" value={draft.subtitle} onChange={(subtitle) => setDraft({ ...draft, subtitle })} />
      <CmsImageField focus="feature_left" label="Bild links" value={String(data.feature_image_left || draft.feature_image_left)} section="discover" path="feature_image_left" />
      <Field label="Alt links" value={draft.feature_image_left_alt} onChange={(feature_image_left_alt) => setDraft({ ...draft, feature_image_left_alt })} />
      <CmsImageField focus="feature_right" label="Bild rechts" value={String(data.feature_image_right || draft.feature_image_right)} section="discover" path="feature_image_right" />
      <Field label="Alt rechts" value={draft.feature_image_right_alt} onChange={(feature_image_right_alt) => setDraft({ ...draft, feature_image_right_alt })} />
      {draft.tiles.map((tile, index) => (
        <fieldset key={tile.id} className="cms-tile" data-cms-panel-focus={`tiles:${index}`}>
          <legend>Kachel {index + 1}</legend>
          <div className="cms-tile__actions">
            <button type="button" className="cms-item-move" disabled={index === 0} onClick={() => moveTile(index, -1)}>
              ↑ Nach vorn
            </button>
            <button
              type="button"
              className="cms-item-move"
              disabled={index === draft.tiles.length - 1}
              onClick={() => moveTile(index, 1)}
            >
              ↓ Nach hinten
            </button>
            <ItemDeleteButton
              label={`Kachel ${index + 1} löschen`}
              onClick={() => setTiles(draft.tiles.filter((_, tileIndex) => tileIndex !== index))}
            />
          </div>
          <Field label="Titel" value={tile.title} onChange={(value) => updateTile(index, 'title', value)} path={`tiles.${index}.title`} />
          <Field label="Eyebrow" value={tile.eyebrow} onChange={(value) => updateTile(index, 'eyebrow', value)} />
          <CmsImageField
            label="Bild"
            value={String(liveTiles.find((item) => item.id === tile.id)?.image || tile.image)}
            section="discover"
            path={`tiles.${tile.id}.image`}
          />
          <CmsLinkPicker
            value={tile.href}
            context={tile.title}
            newTab={tile.new_tab === true}
            onChange={(href) => updateTile(index, 'href', href)}
            onNewTabChange={(next) => setTiles(draft.tiles.map((item, tileIndex) => (tileIndex === index ? { ...item, new_tab: next } : item)))}
          />
        </fieldset>
      ))}
      <button type="button" className="cms-btn cms-btn--ghost" onClick={() => setTiles([...draft.tiles, newDiscoverTile()])}>
        Kachel hinzufügen
      </button>
      <SaveBar sectionKey="discover" onSave={() => cms!.saveSection('discover', payload)} />
    </form>
  );
}

function roomFilterDraft(base: Record<string, unknown>, rooms: Array<{ id: string; tags: string[] }>) {
  return {
    filters: readFilters(base.filters) ?? ROOM_FILTERS,
    tags: Object.fromEntries(rooms.map((room) => [room.id, room.tags])) as Record<string, string[]>,
  };
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
    note_title: String(base.note_title ?? ''),
    note_text: String(base.note_text ?? ''),
    note_cta: String(base.note_cta ?? ''),
    icon_color: String((base as { icon_color?: string }).icon_color ?? ''),
  });
  const [filterDraft, setFilterDraft] = useState(() => roomFilterDraft(base, rooms));
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
      note_title: String(base.note_title ?? ''),
      note_text: String(base.note_text ?? ''),
      note_cta: String(base.note_cta ?? ''),
      icon_color: String((base as { icon_color?: string }).icon_color ?? ''),
    });
    setFilterDraft(roomFilterDraft(base, rooms));
  }, [cms?.draftTick]);

  const payload = keepLiveFocals({
    ...base,
    ...draft,
    hero_image: String(base.hero_image || draft.hero_image),
    hotel_email: hotel?.email ?? null,
    filters: filterDraft.filters,
    // The old switch "show_filters" now is the eye of the filter bar.
    hidden_filters: (base as { hidden_filters?: boolean }).hidden_filters ?? (base as { show_filters?: boolean }).show_filters === false,
    show_filters: undefined,
    items: rooms.map((room) =>
      room.id !== (current?.id ?? roomId)
        ? { ...room, tags: filterDraft.tags[room.id] ?? room.tags }
        : {
            ...room,
            tags: filterDraft.tags[room.id] ?? room.tags,
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
      <CmsImageField focus="image" label="Hero-Bild" value={String(base.hero_image || draft.hero_image)} section="rooms_page" path="hero_image" />
      <Field label="Hero-Alt" value={draft.hero_image_alt} onChange={(hero_image_alt) => setDraft({ ...draft, hero_image_alt })} />
      <CmsFilterEditor
        title="Filter über der Zimmerliste"
        filters={filterDraft.filters}
        entries={rooms.map((room) => ({ id: room.id, name: room.name, tags: filterDraft.tags[room.id] ?? room.tags }))}
        multi
        onChange={(filters, tags) => setFilterDraft({ filters, tags })}
      />
      <Field focus="note" path="note_title" label="Hinweis Titel" value={draft.note_title} onChange={(note_title) => setDraft({ ...draft, note_title })} />
      <Field focus="note" path="note_text" label="Hinweis Text" value={draft.note_text} onChange={(note_text) => setDraft({ ...draft, note_text })} multiline />
      <Field focus="note" path="note_cta" label="Hinweis CTA" value={draft.note_cta} onChange={(note_cta) => setDraft({ ...draft, note_cta })} />
      <Field kind="color" label="Icon-Farbe" value={draft.icon_color} onChange={(icon_color) => setDraft({ ...draft, icon_color })} />
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
          <ItemDeleteButton
            label={`Frage ${index + 1} löschen`}
            onClick={() => setFaqs(faqs.filter((_, faqIndex) => faqIndex !== index))}
          />
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

function BlogTopicFields({ draft, setDraft }: { draft: Record<string, unknown>; setDraft: (next: Record<string, unknown>) => void }) {
  const posts = resolveBlogPosts(draft.items as Parameters<typeof resolveBlogPosts>[0]);
  const raw = (Array.isArray(draft.items) && draft.items.length ? draft.items : posts) as Array<Record<string, unknown>>;
  return (
    <CmsFilterEditor
      title="Themen über den Beiträgen"
      filters={readFilters(draft.filters) ?? BLOG_TOPICS}
      entries={posts.map((post) => ({ id: post.id, name: post.title, tags: post.topic ? [post.topic] : [] }))}
      multi={false}
      onChange={(filters, tags) =>
        setDraft({
          ...draft,
          filters,
          items: raw.map((item, index) => {
            const id = String(item.id ?? posts[index]?.id ?? '');
            return { ...item, topic: tags[id]?.[0] ?? '' };
          }),
        })
      }
    />
  );
}

// Optional sliders a block can have before they are set (0–100, 0 = off).
const SECTION_SLIDERS: Record<string, Array<{ key: string; label: string; hint: string }>> = {
  wellness: [
    {
      key: 'fade',
      label: 'Farbverlauf unten (Hotelfarbe)',
      hint: 'Macht die Schrift auf dem aufgeklappten Bild besser lesbar. 0 % = aus.',
    },
  ],
};

// Optional choices a block can have before they are set (first option = default).
const SECTION_CHOICES: Record<string, Array<{ key: string; label: string; options: Array<{ value: string; label: string }> }>> = {
  wellness: [
    {
      key: 'mobile_layout',
      label: 'Darstellung auf Handys',
      options: [
        { value: 'overlap', label: 'Bilder überlappen das mittlere und fahren beim Aufklappen zur Seite' },
        { value: 'side', label: 'Bilder schmal daneben (bisherige Darstellung)' },
      ],
    },
  ],
};

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
      <h3>{String(draft.cms_label || CMS_SECTION_LABELS[sectionKey] || sectionKey)}</h3>
      {Array.isArray(draft.items) &&
      (draft.items as unknown[]).some((item) => item && typeof item === 'object' && 'icon' in item) ? (
        <Field
          kind="color"
          label="Icon-Farbe"
          value={String(draft.icon_color ?? '')}
          onChange={(icon_color) => setDraft({ ...draft, icon_color })}
        />
      ) : null}
      {entries.length === 0 ? <p className="cms-muted">Dieser Block hat noch keine CMS-Felder.</p> : null}
      {sectionKey === 'blog_page' ? <BlogTopicFields draft={draft} setDraft={setDraft} /> : null}
      {(SECTION_CHOICES[sectionKey] ?? []).map((choice) => (
        <label key={choice.key} className="cms-field" data-cms-panel-focus={choice.key}>
          {choice.label}
          <select
            value={String(draft[choice.key] ?? choice.options[0].value)}
            onChange={(event) => setDraft({ ...draft, [choice.key]: event.target.value })}
          >
            {choice.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      {(SECTION_SLIDERS[sectionKey] ?? []).map((slider) => {
        const current = Math.min(100, Math.max(0, Number(draft[slider.key]) || 0));
        return (
          <fieldset key={slider.key} className="cms-fade" data-cms-panel-focus={slider.key}>
            <legend>{slider.label}</legend>
            <p className="cms-muted">{slider.hint}</p>
            <label className="cms-field">
              Stärke: {current} %
              <input type="range" min={0} max={100} step={5} value={current} onChange={(event) => setDraft({ ...draft, [slider.key]: Number(event.target.value) })} />
            </label>
          </fieldset>
        );
      })}
      {entries.map(([key, value]) =>
        key === 'icon_color' ||
        (sectionKey === 'blog_page' && key === 'filters') ||
        SECTION_SLIDERS[sectionKey]?.some((slider) => slider.key === key) ||
        SECTION_CHOICES[sectionKey]?.some((choice) => choice.key === key) ? null : (
          <GenericValue
            key={key}
            section={sectionKey}
            path={key}
            label={key}
            value={value}
            onChange={(next) => setDraft({ ...draft, [key]: next })}
          />
        ),
      )}
      <SaveBar sectionKey={sectionKey} onSave={() => cms!.saveSection(sectionKey, payload)} />
    </form>
  );
}

// A new, empty entry shaped like the existing ones (all their fields, texts empty, the
// first icon kept as a start, a fresh id where entries have ids).
function blankListItem(list: unknown[], path: string): unknown {
  const sample = list[list.length - 1];
  if (typeof sample === 'string') return '';
  if (typeof sample === 'number') return 0;
  if (!isPlainObject(sample)) return '';
  const blank: Record<string, unknown> = {};
  for (const entry of list) {
    if (!isPlainObject(entry)) continue;
    for (const [key, value] of Object.entries(entry)) {
      if (key in blank) continue;
      if (key === 'icon' || key === 'icon_color') blank[key] = value;
      else if (typeof value === 'string') blank[key] = '';
      else if (typeof value === 'number') blank[key] = 0;
      else if (typeof value === 'boolean') blank[key] = false;
      else if (Array.isArray(value)) blank[key] = [];
      else if (isPlainObject(value)) blank[key] = blankListItem([value], key);
    }
  }
  if ('id' in blank) blank.id = `${path.split('.').pop() || 'eintrag'}-${Date.now().toString(36)}`;
  return blank;
}

function GenericValue({
  section,
  path,
  label,
  value,
  onChange,
  hint,
}: {
  section: string;
  path: string;
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
  // Title of the item a nested value belongs to (offer, room …), for link suggestions.
  hint?: string;
}) {
  if (path === 'hero_focal' || path.endsWith('.hero_focal') || isHiddenMetaPath(path)) return null;

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
          const itemHint = isPlainObject(item) && typeof item.title === 'string' && item.title.trim() ? item.title : hint;
          return (
            <fieldset key={itemPath} className="cms-tile" data-cms-panel-focus={`${path}:${index}`}>
              <legend>
                {label} {index + 1}
              </legend>
              <ItemDeleteButton
                label={`${label} ${index + 1} löschen`}
                onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
              />
              {openTo ? (
                <Link className="cms-entry-open" to={openTo}>
                  Seite öffnen
                </Link>
              ) : null}
              {isPlainObject(item) ? (
                Object.entries(item).map(([childKey, childValue]) =>
                  childKey === 'icon_color' && typeof item.icon === 'string' ? null : childKey === 'icon' && typeof childValue === 'string' ? (
                    <Field
                      key={childKey}
                      label="Icon"
                      value={childValue}
                      path={`${itemPath}.icon`}
                      kind="icon"
                      color={typeof item.icon_color === 'string' ? item.icon_color : ''}
                      onColorChange={(next) => {
                        const copy = value.slice();
                        copy[index] = { ...item, icon_color: next };
                        onChange(copy);
                      }}
                      onChange={(next) => {
                        const copy = value.slice();
                        copy[index] = { ...item, icon: next };
                        onChange(copy);
                      }}
                    />
                  ) : childKey === 'new_tab' ? null : childKey === 'href' && typeof childValue === 'string' ? (
                    // Link targets: choose a page or address, optionally "open in a new tab".
                    <CmsLinkPicker
                      key={childKey}
                      label="Ziel"
                      value={childValue}
                      context={String(item.label ?? item.title ?? '')}
                      hint={itemHint}
                      newTab={item.new_tab === true}
                      onChange={(next) => {
                        const copy = value.slice();
                        copy[index] = { ...item, href: next };
                        onChange(copy);
                      }}
                      onNewTabChange={(next) => {
                        const copy = value.slice();
                        copy[index] = { ...item, new_tab: next };
                        onChange(copy);
                      }}
                    />
                  ) : typeof childValue === 'string' || typeof childValue === 'number' || typeof childValue === 'boolean' ? (
                    <GenericValue hint={itemHint}
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
                    <GenericValue hint={itemHint}
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
        {value.length ? (
          <button type="button" className="cms-btn cms-btn--ghost" onClick={() => onChange([...value, blankListItem(value, path)])}>
            + {label === 'items' ? 'Eintrag' : label} hinzufügen
          </button>
        ) : null}
      </div>
    );
  }

  if (isPlainObject(value)) {
    return (
      <fieldset className="cms-tile" data-cms-panel-focus={path}>
        <legend>{label}</legend>
        {Object.entries(value).map(([childKey, childValue]) =>
          childKey === 'icon_color' && typeof value.icon === 'string' ? null : childKey === 'icon' && typeof childValue === 'string' ? (
            <Field
              key={childKey}
              label="Icon"
              value={childValue}
              path={`${path}.icon`}
              kind="icon"
              color={typeof value.icon_color === 'string' ? value.icon_color : ''}
              onColorChange={(next) => onChange({ ...value, icon_color: next })}
              onChange={(next) => onChange({ ...value, icon: next })}
            />
          ) : (
            <GenericValue hint={hint}
              key={childKey}
              section={section}
              path={`${path}.${childKey}`}
              label={childKey}
              value={childValue}
              onChange={(next) => onChange({ ...value, [childKey]: next })}
            />
          ),
        )}
      </fieldset>
    );
  }

  return null;
}
