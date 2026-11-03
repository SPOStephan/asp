import { resolveWellnessMedia } from './wellness';

// The hotel page (/hotel): the house as a whole – what it is, its figures, its history, how to
// get there and the questions about the house. One page for every hotel; all texts come from
// the CMS section "hotel_page", nothing here belongs to one hotel.

export const HOTEL_PATH = '/hotel';
// The arrival part of the hotel page; the pin in the header leads here.
export const ARRIVAL_ID = 'anreise';
export const ARRIVAL_HREF = `${HOTEL_PATH}#${ARRIVAL_ID}`;

export const HOTEL_PAGE_FALLBACK = {
  eyebrow: '',
  title: 'Das Hotel',
  subtitle: '',
  hero_image: '',
  hero_image_alt: '',
  intro: '',
  figures_title: 'Das Haus in Zahlen',
  figures: [] as HotelFigure[],
  story_eyebrow: 'Geschichte',
  story_title: 'Unsere Geschichte',
  story_intro: '',
  story: [] as HotelChapter[],
  story_quote: '',
  story_quote_source: '',
  areas_title: 'Das Haus entdecken',
  areas: [] as HotelArea[],
  arrival_eyebrow: 'Anreise & Lage',
  arrival_title: 'So finden Sie zu uns',
  arrival_intro: '',
  arrival_ways: [] as HotelWay[],
  map_image: '',
  map_image_alt: '',
  route_label: 'ROUTE PLANEN',
  faq_title: 'Häufige Fragen zum Haus',
  faq_ids: [] as string[],
};

export interface HotelFigure {
  value: string;
  label: string;
}

export interface HotelChapter {
  year: string;
  title: string;
  text: string;
}

export interface HotelArea {
  title: string;
  text: string;
  href: string;
  image: string;
  image_alt: string;
}

export interface HotelWay {
  title: string;
  text: string;
}

function str(value: unknown) {
  return typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : '';
}

function list(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object') : [];
}

export function resolveFigures(value: unknown): HotelFigure[] {
  return list(value)
    .map((item) => ({ value: str(item.value), label: str(item.label) }))
    .filter((item) => item.value || item.label);
}

export function resolveChapters(value: unknown): HotelChapter[] {
  return list(value)
    .map((item) => ({ year: str(item.year), title: str(item.title), text: str(item.text) }))
    .filter((item) => item.title || item.text);
}

export function resolveWays(value: unknown): HotelWay[] {
  return list(value)
    .map((item) => ({ title: str(item.title), text: str(item.text) }))
    .filter((item) => item.title || item.text);
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
): HotelArea[] {
  const own = list(value)
    .map((item) => ({ title: str(item.title), text: str(item.text), href: str(item.href), image: str(item.image), image_alt: str(item.image_alt) }))
    .filter((item) => item.title && item.href);
  if (own.length) return own;
  return AUTO_AREAS.filter((area) => enabled(area.key)).map((area) => {
    const page = sections[area.section] ?? {};
    const raw = str(page.hero_image);
    const text = str(page.title);
    return {
      title: area.title,
      // The page's own heading below, unless it only repeats the tile's name.
      text: text.toLowerCase() === area.title.toLowerCase() ? '' : text,
      href: area.href,
      image: resolveWellnessMedia(raw, ''),
      image_alt: str(page.hero_image_alt) || area.title,
    };
  });
}

// The questions shown on the hotel page: those chosen in the CMS, in their FAQ order;
// none chosen – the questions of the start page.
export function hotelFaqs<T extends { id: string; show_on_home?: boolean }>(faqs: T[], ids: unknown): T[] {
  const chosen = Array.isArray(ids) ? new Set(ids.filter((id): id is string => typeof id === 'string')) : new Set<string>();
  if (chosen.size) return faqs.filter((faq) => chosen.has(faq.id));
  return faqs.filter((faq) => faq.show_on_home);
}

export function mapsSearchHref(name?: string | null, address?: string | null) {
  const query = [name, address].filter(Boolean).join(', ');
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : '';
}

// The map, loaded only after a click (data goes to Google only then).
export function mapsEmbedSrc(name?: string | null, address?: string | null) {
  const query = [name, address].filter(Boolean).join(', ');
  return query ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed` : '';
}
