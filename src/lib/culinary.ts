import { PLACEHOLDER_IMAGE, resolveMedia } from './media';

export interface CulinaryFact {
  label: string;
  value: string;
}

export interface CulinaryVenue {
  id: string;
  name: string;
  kicker: string;
  text: string;
  details: CulinaryFact[];
  includes: string[];
  image: string;
  image_alt: string;
}

export interface CulinaryRhythm {
  kicker: string;
  title: string;
  text: string;
}

// Neutral start for a hotel without its own culinary page.
export const CULINARY_PAGE_FALLBACK = {
  eyebrow: '',
  title: 'Kulinarik',
  subtitle: '',
  intro: '',
  hero_image: PLACEHOLDER_IMAGE,
  hero_image_alt: '',
  also_title: '',
  also_text: '',
  note_title: '',
  note_text: '',
  note_cta: '',
  items: [] as CulinaryVenue[],
  rhythm: [] as CulinaryRhythm[],
};

const EMPTY_VENUE: CulinaryVenue = { id: '', name: '', kicker: '', text: '', details: [], includes: [], image: PLACEHOLDER_IMAGE, image_alt: '' };
const EMPTY_RHYTHM: CulinaryRhythm = { kicker: '', title: '', text: '' };

type RawVenue = Partial<CulinaryVenue> & {
  alt?: string;
  eyebrow?: string;
};

type RawFact = Partial<CulinaryFact>;
type RawRhythm = Partial<CulinaryRhythm>;

export function resolveCulinaryVenues(items?: RawVenue[]): CulinaryVenue[] {
  const raw = items ?? [];
  return raw.map((item, index) => {
    const fallback = { ...EMPTY_VENUE, id: `bereich-${index + 1}` };
    return {
      id: item.id ?? fallback.id,
      name: item.name ?? fallback.name,
      kicker: item.kicker ?? item.eyebrow ?? fallback.kicker,
      text: item.text ?? fallback.text,
      details: resolveFacts(item.details, fallback.details),
      includes: item.includes?.length ? item.includes : fallback.includes,
      image: resolveMedia(item.image, fallback.image),
      image_alt: item.image_alt || item.alt || fallback.image_alt,
    };
  });
}

export function resolveCulinaryRhythm(items?: RawRhythm[]): CulinaryRhythm[] {
  const raw = items ?? [];
  return raw.map((item) => {
    const fallback = EMPTY_RHYTHM;
    return {
      kicker: item.kicker ?? fallback.kicker,
      title: item.title ?? fallback.title,
      text: item.text ?? fallback.text,
    };
  });
}

function resolveFacts(items: RawFact[] | undefined, fallback: CulinaryFact[]): CulinaryFact[] {
  if (!items?.length) return fallback;
  return items
    .map((item, index) => ({
      label: item.label ?? fallback[index]?.label ?? '',
      value: item.value ?? fallback[index]?.value ?? '',
    }))
    .filter((item) => item.label && item.value);
}

export function culinaryVenueHref(id: string) {
  return `/kulinarik#${id}`;
}

// Link of a picture tile in the home culinary section; without its own link the tile leads
// to the culinary page.
export function culinaryTileHref(tile: { href?: unknown; name?: unknown }) {
  if (typeof tile.href === 'string' && tile.href.trim()) return tile.href.trim();
  return '/kulinarik';
}

export function remapCulinaryHref(href: string, label?: string) {
  const culinaryHash = href === '#kulinarik' || href === '#culinary';
  if (!culinaryHash) return href;
  if (label === 'Strandstube') return culinaryVenueHref('strandstube');
  if (label === 'Grill & Dine') return culinaryVenueHref('grill');
  if (label === 'Restaurant & Bar') return culinaryVenueHref('restaurant');
  return '/kulinarik';
}
