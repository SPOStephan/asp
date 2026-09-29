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

export function resolveMedia(value?: string | null, fallback = '') {
  const raw = value?.trim();
  return raw || fallback;
}

export function fillEmptyMedia(sectionKey: string, data: Record<string, unknown> = {}) {
  const defaults = SECTION_IMAGE_DEFAULTS[sectionKey];
  if (!defaults) return data;
  const next = { ...data };
  let changed = false;
  for (const [key, fallback] of Object.entries(defaults)) {
    const filled = resolveMedia(typeof next[key] === 'string' ? next[key] : '', fallback);
    if (next[key] !== filled) {
      next[key] = filled;
      changed = true;
    }
  }
  return changed ? next : data;
}
