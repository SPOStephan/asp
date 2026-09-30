export const MUSTER_MEDIA = {
  hero: '/asp-start01.jpg',
  logoWhite: '/ASP_Logo-weiss.png',
  logoNormal: '/ASP_Logo-normal.png',
  culinary: '/culinary-dining.webp',
  wellness: '/hotel-nordsee-wellness02.webp',
  rooms: '/hotel-stpeter-ording-Austernfischer-Suite05.jpg',
  offers: '/teaser-autumn.webp',
  blog: '/teaser-autumn.webp',
  impressions: '/autumn-aerial.webp',
  discoverLeft: '/willkommen-spo-smart.jpg',
  discoverRight: '/hotel-stpeter-ording-Austernfischer-Suite05.jpg',
} as const;

// The nine Discover tiles from the Ambassador pilot, used while a hotel has none.
export const MUSTER_DISCOVER_TILES = [
  { image: '/suite-room.webp', eyebrow: 'Übernachten', title: 'Zimmer & Suiten', href: '#highlights' },
  { image: '/teaser-autumn.webp', eyebrow: 'Saison', title: 'Angebote', href: '#newsletter' },
  { image: '/spa-wellness.webp', eyebrow: 'Wohlbefinden', title: 'Wellness & Spa', href: '#wellness' },
  { image: '/culinary-dining.webp', eyebrow: 'Genuss', title: 'Restaurant & Bar', href: '#culinary' },
  { image: '/autumn-aerial.webp', eyebrow: 'Region', title: 'Urlaub an der Nordsee', href: '#generations' },
  { image: '/collage-ski.webp', eyebrow: 'Winter', title: 'Strand & See', href: '#highlights' },
  { image: '/teaser-family.webp', eyebrow: 'Familie', title: 'Familienurlaub', href: '#generations' },
  { image: '/collage-mtb.webp', eyebrow: 'Aktiv', title: 'Erlebnisse', href: '#highlights' },
  { image: '/yoga-outdoor.webp', eyebrow: 'Balance', title: 'Yoga & Retreats', href: '#wellness' },
];

export type DiscoverTile = { id: string; image: string; eyebrow: string; title: string; href: string };

// Every tile carries an id so reordering in the editor keeps its image with it.
export function resolveDiscoverTiles(tiles: unknown): DiscoverTile[] {
  const list: Array<Record<string, unknown>> = Array.isArray(tiles) && tiles.length ? tiles : MUSTER_DISCOVER_TILES;
  const seen = new Set<string>();
  return list.map((tile, index) => {
    let id = typeof tile.id === 'string' && tile.id ? tile.id : `tile-${index + 1}`;
    while (seen.has(id)) id = `${id}-${index + 1}`;
    seen.add(id);
    return {
      ...tile,
      id,
      image: String(tile.image ?? ''),
      eyebrow: String(tile.eyebrow ?? ''),
      title: String(tile.title ?? ''),
      href: String(tile.href ?? ''),
    };
  });
}

export function newDiscoverTile(): DiscoverTile {
  return { id: `tile-${Date.now()}`, image: '', eyebrow: '', title: 'Neue Kachel', href: '' };
}

export const NAVBAR_CTA = {
  inquire: 'Anfragen',
  book: 'Buchen',
  bookHref: '#buchung',
} as const;

const SECTION_IMAGE_DEFAULTS: Record<string, Record<string, string>> = {
  navbar: {
    logo_white: MUSTER_MEDIA.logoWhite,
    logo_normal: MUSTER_MEDIA.logoNormal,
    cta_text: NAVBAR_CTA.inquire,
    cta_solid_text: NAVBAR_CTA.book,
    cta_solid_href: NAVBAR_CTA.bookHref,
  },
  hero: {
    hero_image: MUSTER_MEDIA.hero,
  },
  culinary: {
    hero_image: MUSTER_MEDIA.culinary,
  },
  wellness: {
    hero_image: MUSTER_MEDIA.wellness,
  },
  discover: {
    feature_image_left: MUSTER_MEDIA.discoverLeft,
    feature_image_right: MUSTER_MEDIA.discoverRight,
  },
  rooms_page: {
    hero_image: MUSTER_MEDIA.rooms,
  },
  offers_page: {
    hero_image: MUSTER_MEDIA.offers,
  },
  culinary_page: {
    hero_image: MUSTER_MEDIA.culinary,
  },
  wellness_page: {
    hero_image: MUSTER_MEDIA.wellness,
  },
  blog_page: {
    hero_image: MUSTER_MEDIA.blog,
  },
  impressions_page: {
    hero_image: MUSTER_MEDIA.impressions,
  },
};

// Uploads saved while BUNNY_CDN_URL lacked https:// hold "zone.b-cdn.net/…",
// which the browser would resolve as a path on this site.
const SCHEMELESS_CDN = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.b-cdn\.net\//i;

export function absoluteMediaUrl(value: string) {
  return SCHEMELESS_CDN.test(value) ? `https://${value}` : value;
}

export function repairMediaUrls<T>(value: T): T {
  if (typeof value === 'string') return absoluteMediaUrl(value) as T;
  if (Array.isArray(value)) return value.map(repairMediaUrls) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, repairMediaUrls(item)])) as T;
  }
  return value;
}

export function resolveMedia(value?: string | null, fallback = '') {
  const raw = value?.trim();
  return raw || fallback;
}

export function fillEmptyMedia(sectionKey: string, data: Record<string, unknown> = {}) {
  const defaults = SECTION_IMAGE_DEFAULTS[sectionKey];
  if (!defaults) return data;
  const next = { ...data };
  let changed = false;
  if (sectionKey === 'discover' && !(Array.isArray(next.tiles) && next.tiles.length)) {
    next.tiles = resolveDiscoverTiles(next.tiles);
    changed = true;
  }
  for (const [key, fallback] of Object.entries(defaults)) {
    const filled = resolveMedia(typeof next[key] === 'string' ? next[key] : '', fallback);
    if (next[key] !== filled) {
      next[key] = filled;
      changed = true;
    }
  }
  return changed ? next : data;
}
