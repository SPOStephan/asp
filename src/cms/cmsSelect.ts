export type CmsSelection = {
  section: string;
  focus?: string;
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

function readData(el: Element | null, key: 'cmsSection' | 'cmsFocus'): string | undefined {
  if (!el || !('dataset' in el)) return undefined;
  const value = (el as HTMLElement).dataset[key];
  return value || undefined;
}

export function selectionFromEvent(event: Pick<Event, 'target'>): CmsSelection | null {
  const el = event.target;
  if (!isElement(el)) return null;
  if (el.closest('.cms-dock')) return null;
  if (!el.closest('.cms-stage')) return null;

  const sectionEl = el.closest('[data-cms-section]');
  const section = readData(sectionEl, 'cmsSection');
  if (!section) return null;

  const focus = readData(el.closest('[data-cms-focus]'), 'cmsFocus');
  return { section, focus };
}
