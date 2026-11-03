import { resolveWellnessMedia } from './wellness';

// "Über uns" (/ueber-uns): the house as a whole – what it is, its figures, its history, the hosts,
// the group it belongs to and the questions about the house. One page for every hotel; all
// texts come from the CMS section "about_page", nothing here belongs to one hotel.

export const ABOUT_PATH = '/ueber-uns';

export const ABOUT_PAGE_FALLBACK = {
  eyebrow: '',
  title: 'Über uns',
  subtitle: '',
  hero_image: '',
  hero_image_alt: '',
  intro: '',
  figures_title: 'Das Haus in Zahlen',
  figures: [] as AboutFigure[],
  story_eyebrow: 'Geschichte',
  story_title: 'Unsere Geschichte',
  story_intro: '',
  story: [] as AboutChapter[],
  story_quote: '',
  story_quote_source: '',
  hosts_eyebrow: 'Gastgeber',
  hosts_title: 'Ihre Gastgeber',
  hosts_intro: '',
  hosts: [] as AboutHost[],
  group_eyebrow: '',
  group_title: '',
  group_text: '',
  group_href: '',
  group_cta: 'MEHR ÜBER DIE GRUPPE',
  areas_title: 'Das Haus entdecken',
  areas: [] as AboutArea[],
  faq_title: 'Häufige Fragen zum Haus',
  faq_ids: [] as string[],
};

export interface AboutFigure {
  value: string;
  label: string;
}

export interface AboutChapter {
  year: string;
  title: string;
  text: string;
}

export interface AboutHost {
  name: string;
  role: string;
  text: string;
  image: string;
  image_alt: string;
}

export interface AboutArea {
  title: string;
  text: string;
  href: string;
  image: string;
  image_alt: string;
}

export function str(value: unknown) {
  return typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : '';
}

export function list(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object') : [];
}

export function resolveFigures(value: unknown): AboutFigure[] {
  return list(value)
    .map((item) => ({ value: str(item.value), label: str(item.label) }))
    .filter((item) => item.value || item.label);
}

export function resolveChapters(value: unknown): AboutChapter[] {
  return list(value)
    .map((item) => ({ year: str(item.year), title: str(item.title), text: str(item.text) }))
    .filter((item) => item.title || item.text);
}

export function resolveHosts(value: unknown): AboutHost[] {
  return list(value)
    .map((item) => ({ name: str(item.name), role: str(item.role), text: str(item.text), image: str(item.image), image_alt: str(item.image_alt) }))
    .filter((item) => item.name);
}

// The areas of the house. Without own entries: the hotel's switched-on pages with the picture
// of their own page head (rooms, spa, restaurants, pictures).
const AUTO_AREAS: Array<{ key: string; section: string; href: string; title: string }> = [
  { key: 'zimmer', section: 'rooms_page', href: '/zimmer', title: 'Zimmer & Suiten' },
  { key: 'wellness', section: 'wellness_page', href: '/wellness', title: 'Wellness' },
  { key: 'kulinarik', section: 'culinary_page', href: '/kulinarik', title: 'Kulinarik' },
  { key: 'impressionen', section: 'impressions_page', href: '/impressionen', title: 'Impressionen' },
];

export function resolveAreas(
  value: unknown,
  sections: Record<string, Record<string, unknown> | undefined>,
  enabled: (key: string) => boolean,
): AboutArea[] {
  const own = list(value)
    .map((item) => ({ title: str(item.title), text: str(item.text), href: str(item.href), image: str(item.image), image_alt: str(item.image_alt) }))
    .filter((item) => item.title && item.href);
  if (own.length) return own;
  return AUTO_AREAS.filter((area) => enabled(area.key)).map((area) => {
    const page = sections[area.section] ?? {};
    const text = str(page.title);
    return {
      title: area.title,
      // The page's own heading below, unless it only repeats the tile's name.
      text: text.toLowerCase() === area.title.toLowerCase() ? '' : text,
      href: area.href,
      image: resolveWellnessMedia(str(page.hero_image), ''),
      image_alt: str(page.hero_image_alt) || area.title,
    };
  });
}

// The questions of a page: those ticked in the CMS, in their FAQ order; none ticked – the
// fallback the page asks for (e.g. the questions of the start page).
export function chosenFaqs<T extends { id: string }>(faqs: T[], ids: unknown, fallback: (faq: T) => boolean): T[] {
  const chosen = Array.isArray(ids) ? new Set(ids.filter((id): id is string => typeof id === 'string')) : new Set<string>();
  if (chosen.size) return faqs.filter((faq) => chosen.has(faq.id));
  return faqs.filter(fallback);
}

export function aboutFaqs<T extends { id: string; show_on_home?: boolean }>(faqs: T[], ids: unknown): T[] {
  return chosenFaqs(faqs, ids, (faq) => faq.show_on_home === true);
}
