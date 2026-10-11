import { PLACEHOLDER_IMAGE } from './media';
export interface WellnessFact {
  label: string;
  value: string;
}

export interface WellnessPriceItem {
  name: string;
  meta?: string;
  price: string;
}

export interface WellnessPriceGroup {
  title: string;
  items: WellnessPriceItem[];
}

export interface WellnessTopic {
  id: string;
  name: string;
  kicker: string;
  tile_cta: string;
  summary: string;
  text: string[];
  details: WellnessFact[];
  includes: string[];
  prices?: WellnessPriceGroup[];
  price_note?: string;
  image: string;
  image_alt: string;
  hero_image: string;
  hero_image_alt: string;
  pair_image?: string;
  pair_image_alt?: string;
}

export interface WellnessChapter {
  id: string;
  kicker: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  image: string;
  image_alt: string;
}

// Neutral start for a hotel without its own wellness page: no other hotel's spa, prices
// or opening hours. Empty parts stay hidden on the site; the editor fills them.
export const WELLNESS_PAGE_FALLBACK = {
  eyebrow: '',
  title: 'Wellness',
  subtitle: '',
  intro: '',
  hero_image: PLACEHOLDER_IMAGE,
  hero_image_alt: '',
  day_kicker: '',
  day_title: '',
  day_text: '',
  day_cta: '',
  day_cta_href: '',
  chapters: [] as WellnessChapter[],
  overlap_kicker: '',
  overlap_title: '',
  overlap_text: '',
  overlap_cta: '',
  overlap_cta_href: '',
  overlap_front: '',
  overlap_front_alt: '',
  overlap_back: '',
  overlap_back_alt: '',
  note_title: '',
  note_text: '',
  note_cta: '',
  note_cta_href: '',
  items: [] as WellnessTopic[],
};

const EMPTY_TOPIC: WellnessTopic = {
  id: '',
  name: '',
  kicker: '',
  tile_cta: '',
  summary: '',
  text: [],
  details: [],
  includes: [],
  prices: [],
  price_note: '',
  image: PLACEHOLDER_IMAGE,
  image_alt: '',
  hero_image: PLACEHOLDER_IMAGE,
  hero_image_alt: '',
  pair_image: '',
  pair_image_alt: '',
};

const EMPTY_CHAPTER: WellnessChapter = { id: '', kicker: '', title: '', text: '', href: '', cta: '', image: PLACEHOLDER_IMAGE, image_alt: '' };

type RawTopic = Partial<WellnessTopic>;
type RawChapter = Partial<WellnessChapter>;

export function resolveWellnessTopics(items?: RawTopic[]): WellnessTopic[] {
  const raw = items ?? [];
  return raw.map((item, index) => {
    const fallback = { ...EMPTY_TOPIC, id: `bereich-${index + 1}` };
    return {
      id: item.id ?? fallback.id,
      name: item.name ?? fallback.name,
      kicker: item.kicker ?? fallback.kicker,
      tile_cta: item.tile_cta ?? fallback.tile_cta,
      summary: item.summary ?? fallback.summary,
      text: item.text?.length ? item.text : fallback.text,
      details: item.details?.length ? item.details : fallback.details,
      includes: item.includes?.length ? item.includes : fallback.includes,
      prices: item.prices?.length ? item.prices : fallback.prices,
      price_note: item.price_note ?? fallback.price_note,
      image: resolveWellnessMedia(item.image, fallback.image),
      image_alt: item.image_alt || fallback.image_alt,
      hero_image: resolveWellnessMedia(item.hero_image, resolveWellnessMedia(item.image, fallback.hero_image)),
      hero_image_alt: item.hero_image_alt || item.image_alt || fallback.hero_image_alt,
      pair_image: item.pair_image ?? fallback.pair_image,
      pair_image_alt: item.pair_image_alt ?? fallback.pair_image_alt,
    };
  });
}

export function resolveWellnessChapters(items?: RawChapter[]): WellnessChapter[] {
  const raw = items ?? [];
  return raw.map((item, index) => {
    const fallback = { ...EMPTY_CHAPTER, id: `kapitel-${index + 1}` };
    return {
      id: item.id ?? fallback.id,
      kicker: item.kicker ?? fallback.kicker,
      title: item.title ?? fallback.title,
      text: item.text ?? fallback.text,
      href: item.href ?? fallback.href,
      cta: item.cta ?? fallback.cta,
      image: resolveWellnessMedia(item.image, fallback.image),
      image_alt: item.image_alt || fallback.image_alt,
    };
  });
}

export function wellnessTopicHref(id: string) {
  return `/wellness/${id}`;
}

const MEDIA_ALIASES: Record<string, string> = {
  '/hotel-nordsee-wellness02.jpg': '/hotel-nordsee-wellness02.webp',
};

export function resolveWellnessMedia(value?: string | null, fallback: string = WELLNESS_PAGE_FALLBACK.hero_image) {
  const raw = value?.trim();
  if (!raw) return fallback;
  return MEDIA_ALIASES[raw] ?? raw;
}

export function remapWellnessHref(href: string, label?: string) {
  if (label === 'Wellness & Spa' && (href === '#wellness' || href === '/wellness')) {
    return '/wellness';
  }
  if (label === 'Zum Wellnessbereich') return '/wellness';
  if (label === 'Yoga & Retreats' && href === '#wellness') return '/wellness';
  if (label === 'Spa & Wellness' && href === '/wellness') return '/wellness';
  return href;
}

export function menuGroupHref(title: string, href?: string) {
  if (href) return href;
  switch (title) {
    case 'Zimmer & Suiten':
      return '/zimmer';
    case 'Angebote':
      return '/angebote';
    case 'Wellness':
      return '/wellness';
    case 'Kulinarik':
      return '/kulinarik';
    default:
      return undefined;
  }
}
