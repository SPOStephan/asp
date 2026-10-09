// Occasion pages ("Für jeden Anlass"): one hub at /anlaesse and a detail page per occasion
// (e.g. with dog, as a couple, with the family). All content comes from the CMS.

export interface OccasionFact {
  label: string;
  value: string;
}

export interface OccasionLink {
  label: string;
  href: string;
  new_tab?: boolean;
}

export interface OccasionQuestion {
  question: string;
  answer: string;
}

// A tip or post from the travel community (entered by hand for now; later filled from
// the community itself).
export interface OccasionCommunityTip {
  text: string;
  author: string;
  href: string;
  image: string;
}

export interface Occasion {
  id: string;
  name: string;
  kicker: string;
  summary: string;
  text: string[];
  details: OccasionFact[];
  includes: string[];
  // Matching offers, wellness pages, journal articles … Offers show as cards.
  links: OccasionLink[];
  faqs: OccasionQuestion[];
  community: OccasionCommunityTip[];
  cta: string;
  cta_href: string;
  image: string;
  image_alt: string;
  hero_image: string;
  hero_image_alt: string;
}

export const OCCASIONS_PAGE_FALLBACK = {
  eyebrow: 'Für jeden Anlass',
  title: 'Anlässe',
  subtitle: '',
  intro: '',
  hero_image: '',
  hero_image_alt: '',
  items: [] as Array<Record<string, unknown>>,
};

type Raw = Record<string, unknown>;

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function list<T>(value: unknown, map: (item: Raw) => T | null): T[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (item && typeof item === 'object' ? map(item as Raw) : typeof item === 'string' ? map({ value: item }) : null))
    .filter((item): item is T => item !== null);
}

export function occasionSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function resolveOccasions(items: unknown): Occasion[] {
  return list(items, (item) => {
    const name = text(item.name) || text(item.title);
    const id = text(item.id) || occasionSlug(name);
    if (!id) return null;
    const image = text(item.image) || text(item.hero_image);
    return {
      id,
      name: name || id,
      kicker: text(item.kicker),
      summary: text(item.summary),
      text: list(item.text, (entry) => text(entry.value) || null),
      details: list(item.details, (entry) => (text(entry.label) ? { label: text(entry.label), value: text(entry.value) } : null)),
      includes: list(item.includes, (entry) => text(entry.value) || null),
      links: list(item.links, (entry) =>
        text(entry.href) ? { label: text(entry.label), href: text(entry.href), new_tab: entry.new_tab === true } : null,
      ),
      faqs: list(item.faqs, (entry) =>
        text(entry.question) && text(entry.answer) ? { question: text(entry.question), answer: text(entry.answer) } : null,
      ),
      community: list(item.community, (entry) =>
        text(entry.text)
          ? { text: text(entry.text), author: text(entry.author), href: text(entry.href), image: text(entry.image) }
          : null,
      ),
      cta: text(item.cta),
      cta_href: text(item.cta_href),
      image,
      image_alt: text(item.image_alt) || name,
      hero_image: text(item.hero_image) || image,
      hero_image_alt: text(item.hero_image_alt) || text(item.image_alt) || name,
    };
  });
}

export function occasionHref(id: string) {
  return `/anlaesse/${id}`;
}
