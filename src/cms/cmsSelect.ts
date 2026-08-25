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
  if (selection.focus.startsWith('tile:')) {
    return `${label} · Kachel ${Number(selection.focus.slice(5)) + 1}`;
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

export function selectionFromEvent(event: Event): CmsSelection | null {
  const el = event.target;
  if (!(el instanceof Element)) return null;
  if (el.closest('.cms-dock')) return null;
  if (!el.closest('.cms-stage')) return null;

  const sectionEl = el.closest('[data-cms-section]');
  if (!(sectionEl instanceof HTMLElement)) return null;
  const section = sectionEl.dataset.cmsSection;
  if (!section) return null;

  const focusEl = el.closest('[data-cms-focus]');
  const focus = focusEl instanceof HTMLElement ? focusEl.dataset.cmsFocus : undefined;
  return { section, focus: focus || undefined };
}
