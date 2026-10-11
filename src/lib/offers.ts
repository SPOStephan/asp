import { PLACEHOLDER_IMAGE, resolveMedia } from './media';

export interface OfferLink {
  label: string;
  href: string;
}

export interface OfferStory {
  id: string;
  title: string;
  subtitle: string;
  text: string;
  detail_text: string[];
  details: string[];
  travel_period_label: string;
  travel_period: string;
  includes: string[];
  image: string;
  image_alt: string;
  hero_image: string;
  hero_image_alt: string;
}

// Neutral start for a hotel without its own offers: no other hotel's arrangements.
export const OFFERS_PAGE_FALLBACK = {
  eyebrow: '',
  title: 'Angebote',
  subtitle: '',
  intro: '',
  hero_image: PLACEHOLDER_IMAGE,
  hero_image_alt: '',
  note_title: '',
  note_text: '',
  note_cta: '',
  items: [] as OfferStory[],
};

const EMPTY_OFFER: OfferStory = {
  id: '',
  title: '',
  subtitle: '',
  text: '',
  detail_text: [],
  details: [],
  travel_period_label: '',
  travel_period: '',
  includes: [],
  image: PLACEHOLDER_IMAGE,
  image_alt: '',
  hero_image: PLACEHOLDER_IMAGE,
  hero_image_alt: '',
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

type RawOffer = Partial<OfferStory> & {
  image_primary?: string;
  image_primary_alt?: string;
};

export function resolveOfferStories(
  pageItems?: RawOffer[],
  homeItems?: RawOffer[]
): OfferStory[] {
  const raw = pageItems ?? homeItems ?? [];
  return raw.map((item, index) => {
    const fallback = { ...EMPTY_OFFER, title: `Angebot ${index + 1}` };
    return {
      id: item.id ?? slugify(item.title ?? fallback.title),
      title: item.title ?? fallback.title,
      subtitle: item.subtitle ?? fallback.subtitle,
      text: item.text ?? fallback.text,
      detail_text: item.detail_text?.length ? item.detail_text : fallback.detail_text,
      details: item.details ?? fallback.details,
      travel_period_label: item.travel_period_label ?? fallback.travel_period_label,
      travel_period: item.travel_period ?? fallback.travel_period,
      includes: item.includes ?? fallback.includes,
      image: resolveMedia(item.image || item.image_primary, fallback.image),
      image_alt: item.image_alt || item.image_primary_alt || fallback.image_alt,
      hero_image: resolveMedia(item.hero_image || item.image || item.image_primary, fallback.hero_image),
      hero_image_alt: item.hero_image_alt || item.image_alt || fallback.hero_image_alt,
    };
  });
}

export function offerHref(id: string) {
  return `/angebote/${id}`;
}
