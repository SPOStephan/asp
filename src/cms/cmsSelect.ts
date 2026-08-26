import { fieldKind } from './cmsDraft';

export type CmsSelection = {
  section: string;
  focus?: string;
  path?: string;
};

export type CmsImageRequest = {
  section: string;
  path: string;
  altPath?: string;
};

export type CmsInline = {
  section: string;
  path: string;
  original: string;
};

export const CMS_SECTION_LABELS: Record<string, string> = {
  hero: 'Hero',
  welcome: 'Welcome',
  highlight_strip: 'Highlight-Leiste',
  discover: 'Discover',
  direct_booking: 'Direktbuchung',
  offers: 'Angebote',
  wellness: 'Wellness',
  highlights: 'Highlights',
  culinary: 'Kulinarik',
  generations: 'Generationen',
  awards: 'Awards & Impressionen',
  facts: 'Fakten',
  faq_home_section: 'FAQ',
  blog_page: 'Journal',
  newsletter: 'Newsletter',
  rooms_page: 'Zimmer',
};

const FOCUS_LABELS: Record<string, string> = {
  title: 'Titel',
  subtitle: 'Untertitel',
  image: 'Bild',
  text: 'Text',
  head: 'Überschrift',
  intro: 'Intro',
  note: 'Hinweis',
  eyebrow: 'Eyebrow',
  feature_left: 'Bild links',
  feature_right: 'Bild rechts',
};

export function describeSelection(selection: CmsSelection | null): string {
  if (!selection) return '';
  const label = CMS_SECTION_LABELS[selection.section] ?? selection.section;
  if (!selection.focus) return label;
  if (selection.focus.startsWith('tile:') || selection.focus.startsWith('tiles:')) {
    return `${label} · Kachel ${Number(selection.focus.split(':')[1]) + 1}`;
  }
  if (selection.focus.startsWith('room:')) {
    return `${label} · gewähltes Zimmer`;
  }
  const split = selection.focus.split(':');
  if (split.length === 2 && /^\d+$/.test(split[1])) {
    return `${label} · Eintrag ${Number(split[1]) + 1}`;
  }
  return `${label} · ${FOCUS_LABELS[selection.focus] ?? selection.focus}`;
}

function isElement(value: EventTarget | null): value is Element {
  return typeof value === 'object' && value !== null && 'closest' in value;
}

function readData(el: Element | null, key: 'cmsSection' | 'cmsFocus' | 'cmsPath' | 'cmsKind'): string | undefined {
  if (!el || !('dataset' in el)) return undefined;
  const value = (el as HTMLElement).dataset[key];
  return value || undefined;
}

export function isPlainTextHost(el: Element | null) {
  if (!(el instanceof HTMLElement)) return false;
  return [...el.childNodes].every(
    (node) => node.nodeType === Node.TEXT_NODE || (node instanceof HTMLElement && node.tagName === 'BR'),
  );
}

export function inferAltPath(path: string) {
  if (path.endsWith('_image')) return `${path}_alt`;
  if (path.endsWith('.image')) return `${path.slice(0, -5)}image_alt`;
  if (path.endsWith('.src')) return `${path.slice(0, -3)}alt`;
  return undefined;
}

export function selectionFromEvent(event: Pick<Event, 'target'>): CmsSelection | null {
  const el = event.target;
  if (!isElement(el)) return null;
  if (el.closest('.cms-dock, .cms-modal, .cms-inline, [data-cms-editing]')) return null;
  if (!el.closest('.cms-stage')) return null;

  const sectionEl = el.closest('[data-cms-section]');
  const section = readData(sectionEl, 'cmsSection');
  if (!section) return null;

  const focusEl = el.closest('[data-cms-focus]');
  const pathEl = el.closest('[data-cms-path]');
  const focus = readData(focusEl, 'cmsFocus');
  const path = readData(pathEl, 'cmsPath');
  return { section, focus, path };
}

export function hitKind(selection: CmsSelection, target: EventTarget | null) {
  if (selection.path) return fieldKind(selection.path);
  if (isElement(target)) {
    const marked = readData(target.closest('[data-cms-kind]'), 'cmsKind');
    if (marked === 'image' || marked === 'icon' || marked === 'text') return marked;
  }
  if (selection.focus === 'image' || selection.focus === 'feature_left' || selection.focus === 'feature_right') {
    return 'image';
  }
  return 'text';
}
