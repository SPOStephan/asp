import { PLACEHOLDER_IMAGE, resolveMedia } from './media';

import type { ListFilter } from './listFilters';

// Free per hotel; the list below only names the topics of hotels without their own.
export type BlogTopicId = string;

export type BlogSource = 'human' | 'ai';

export type BlogBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'video'; src: string; provider?: 'file' | 'youtube'; caption?: string; poster?: string };

export type BlogPromoPlacement = 'inline' | 'after';

export interface BlogPromo {
  enabled: boolean;
  offer_id: string;
  placement: BlogPromoPlacement;
  suggested_offer_id: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  topic: BlogTopicId;
  hero_image: string;
  hero_image_alt: string;
  published_at: string;
  source: BlogSource;
  promo?: BlogPromo;
  blocks: BlogBlock[];
}

export const BLOG_TOPICS: ListFilter[] = [
  { id: 'erholung', label: 'Erholung' },
  { id: 'familie', label: 'Familie' },
  { id: 'hund', label: 'Mit Hund' },
];

// Neutral start for a hotel without its own journal: no posts of another hotel.
export const BLOG_PAGE_FALLBACK = {
  eyebrow: 'Journal',
  title: 'Journal',
  subtitle: '',
  intro: '',
  hero_image: PLACEHOLDER_IMAGE,
  hero_image_alt: '',
  home_eyebrow: 'Journal',
  home_title: 'Zuletzt geschrieben',
  home_cta: 'Alle Beiträge',
  note_title: '',
  note_text: '',
  note_cta: '',
  note_cta_href: '',
  items: [] as BlogPost[],
};

const EMPTY_POST: BlogPost = {
  id: '',
  slug: '',
  title: '',
  excerpt: '',
  topic: '',
  hero_image: PLACEHOLDER_IMAGE,
  hero_image_alt: '',
  published_at: '',
  source: 'human',
  blocks: [],
};

type RawBlock = Partial<BlogBlock> & { type?: string };
type RawPost = Partial<BlogPost> & { blocks?: RawBlock[] };

export function resolveBlogPosts(items?: RawPost[]): BlogPost[] {
  const raw = items ?? [];
  return raw
    .map((item, index) => {
      const fallback = { ...EMPTY_POST, id: `beitrag-${index + 1}`, slug: `beitrag-${index + 1}` };
      return {
        id: item.id ?? fallback.id,
        slug: item.slug ?? fallback.slug,
        title: item.title ?? fallback.title,
        excerpt: item.excerpt ?? fallback.excerpt,
        topic: item.topic ?? fallback.topic,
        hero_image: resolveMedia(item.hero_image, fallback.hero_image),
        hero_image_alt: item.hero_image_alt || fallback.hero_image_alt,
        published_at: item.published_at ?? fallback.published_at,
        source: item.source ?? fallback.source,
        promo: resolvePromo(item.promo, item.topic ?? fallback.topic, fallback.promo),
        blocks: resolveBlocks(item.blocks, fallback.blocks),
      };
    })
    .sort((a, b) => (a.published_at < b.published_at ? 1 : -1));
}

// No built-in offer suggestions: offer ids differ from hotel to hotel.
const TOPIC_PROMO: Record<string, string> = {};

export function suggestPromoOfferId(topic: BlogTopicId) {
  return TOPIC_PROMO[topic] ?? '';
}

function resolvePromo(
  value: Partial<BlogPromo> | undefined,
  topic: BlogTopicId,
  fallback?: BlogPromo
): BlogPromo | undefined {
  const suggested = value?.suggested_offer_id ?? fallback?.suggested_offer_id ?? suggestPromoOfferId(topic);
  const enabled = value?.enabled ?? fallback?.enabled ?? true;
  if (value?.enabled === false) return { enabled: false, offer_id: suggested, placement: 'after', suggested_offer_id: suggested };
  return {
    enabled,
    offer_id: value?.offer_id ?? fallback?.offer_id ?? suggested,
    placement: value?.placement ?? fallback?.placement ?? 'after',
    suggested_offer_id: suggested,
  };
}

export function blogHeadings(blocks: BlogBlock[]) {
  return blocks
    .filter((block): block is Extract<BlogBlock, { type: 'heading' }> => block.type === 'heading')
    .map((block) => ({ id: headingAnchor(block.text), text: block.text }));
}

export function headingAnchor(value: string) {
  return value
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function resolveBlocks(items: RawBlock[] | undefined, fallback: BlogBlock[]): BlogBlock[] {
  if (!items?.length) return fallback;
  return items
    .map((item, index) => {
      const base = fallback[index];
      if (item.type === 'heading' && item.text) return { type: 'heading' as const, text: item.text };
      if (item.type === 'image' && item.src) {
        return {
          type: 'image' as const,
          src: item.src,
          alt: item.alt ?? '',
          caption: item.caption,
        };
      }
      if (item.type === 'video' && item.src) {
        return {
          type: 'video' as const,
          src: item.src,
          provider: item.provider === 'youtube' ? 'youtube' : 'file',
          caption: item.caption,
          poster: item.poster,
        };
      }
      if (item.type === 'paragraph' && item.text) return { type: 'paragraph' as const, text: item.text };
      return base;
    })
    .filter((item): item is BlogBlock => Boolean(item));
}

export function filterBlogPosts(posts: BlogPost[], topic: BlogTopicId | 'alle') {
  if (topic === 'alle') return posts;
  return posts.filter((post) => post.topic === topic);
}

export function latestBlogPosts(posts: BlogPost[], count = 3) {
  return resolveBlogPosts(posts).slice(0, count);
}

export function blogHref(slug: string) {
  return `/blog/${slug}`;
}

export function formatBlogDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function youtubeId(src: string) {
  const watch = src.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (watch) return watch[1];
  const short = src.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (short) return short[1];
  if (/^[a-zA-Z0-9_-]{6,}$/.test(src)) return src;
  return null;
}
