import { chosenFaqs, list, str } from './aboutPage';

// "Anreise" (/anreise): address, route, the ways to get there, the map (loaded on click) and
// the questions about arriving and parking. The pin in the header leads here when the page
// is switched on. Texts from the CMS section "arrival_page".

export const ARRIVAL_PATH = '/anreise';

export const ARRIVAL_PAGE_FALLBACK = {
  eyebrow: 'Anreise & Lage',
  title: 'So finden Sie zu uns',
  subtitle: '',
  hero_image: '',
  hero_image_alt: '',
  intro: '',
  route_label: 'ROUTE PLANEN',
  ways_title: 'Ihr Weg zu uns',
  ways: [] as ArrivalWay[],
  map_image: '',
  map_image_alt: '',
  faq_title: 'Fragen zu Anreise und Parken',
  faq_ids: [] as string[],
};

export interface ArrivalWay {
  title: string;
  text: string;
}

export function resolveWays(value: unknown): ArrivalWay[] {
  return list(value)
    .map((item) => ({ title: str(item.title), text: str(item.text) }))
    .filter((item) => item.title || item.text);
}

// None ticked: the questions of a category about arriving or parking.
export function arrivalFaqs<T extends { id: string; category?: string }>(faqs: T[], ids: unknown): T[] {
  return chosenFaqs(faqs, ids, (faq) => /anreise|parken|anfahrt/i.test(faq.category ?? ''));
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
