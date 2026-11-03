import { PLACEHOLDER_IMAGE } from './media';
import { resolveOfferStories } from './offers';
import { EVENTS_PATHS } from './topicAreas';
import { resolveWellnessMedia } from './wellness';

// What the open menu can show about a group's page: a short line and its picture – taken
// from that page's own head (title, subtitle, picture), so it is always the hotel's own.
// Used for groups without links of their own (Kulinarik …) and by the menu variant /navi02.

type Sections = Record<string, Record<string, any> | undefined>;

export interface MenuPreview {
  teaser: string;
  image: string;
  image_alt: string;
}

function sectionFor(path: string) {
  if (path === '/ueber-uns') return 'about_page';
  if (path === '/zimmer') return 'rooms_page';
  if (path === '/angebote') return 'offers_page';
  if (path === '/wellness') return 'wellness_page';
  if (path === '/kulinarik') return 'culinary_page';
  if (path === '/region') return 'occasions_page';
  if (path === '/impressionen') return 'impressions_page';
  if (path === '/anreise') return 'arrival_page';
  if ((EVENTS_PATHS as string[]).includes(path)) return 'events_page';
  return null;
}

function str(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function firstItemImage(page: Record<string, any> | undefined, key: string): { image: string; alt: string } {
  const items = Array.isArray(page?.items) ? page!.items : [];
  for (const item of items) {
    const image = str(item?.hero_image) || str(item?.image);
    if (image) return { image, alt: str(item?.hero_image_alt) || str(item?.image_alt) || str(item?.name) || str(item?.title) };
  }
  return { image: '', alt: key };
}

export function menuPreview(href: string | undefined, title: string, sections: Sections): MenuPreview {
  const path = (href ?? '').split(/[?#]/)[0];
  const key = sectionFor(path);
  const page = key ? sections[key] : undefined;
  const pageTitle = str(page?.title);
  const teaser = pageTitle && pageTitle.toLowerCase() !== title.toLowerCase() ? pageTitle : str(page?.subtitle);
  let image = resolveWellnessMedia(str(page?.hero_image), '');
  let alt = str(page?.hero_image_alt);
  if (key === 'offers_page' && (!image || image === PLACEHOLDER_IMAGE)) {
    const offer = resolveOfferStories(page?.items, sections.offers?.items).find((item) => item.image && item.image !== PLACEHOLDER_IMAGE);
    image = offer?.image ?? '';
    alt = offer?.image_alt ?? '';
  }
  if (!image || image === PLACEHOLDER_IMAGE) {
    const first = firstItemImage(page, title);
    image = first.image;
    alt = alt || first.alt;
  }
  if (!image) {
    image = str(sections.hero?.hero_image);
    alt = alt || str(sections.hero?.hero_image_alt);
  }
  return { teaser, image, image_alt: alt || title };
}
