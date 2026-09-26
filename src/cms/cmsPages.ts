import { BLOG_PAGE_FALLBACK } from '../lib/blog';
import { CULINARY_PAGE_FALLBACK } from '../lib/culinary';
import { IMPRESSIONS_PAGE_FALLBACK } from '../lib/impressions';
import { OFFERS_PAGE_FALLBACK } from '../lib/offers';
import { WELLNESS_PAGE_FALLBACK } from '../lib/wellness';

export const CMS_EDITOR_PAGES = [
  { label: 'Start', to: '/cms', publicPath: '/' },
  { label: 'Zimmer', to: '/cms/zimmer', publicPath: '/zimmer' },
  { label: 'Wellness', to: '/cms/wellness', publicPath: '/wellness' },
  { label: 'Kulinarik', to: '/cms/kulinarik', publicPath: '/kulinarik' },
  { label: 'Angebote', to: '/cms/angebote', publicPath: '/angebote' },
  { label: 'Blog', to: '/cms/blog', publicPath: '/blog' },
  { label: 'Impressionen', to: '/cms/impressionen', publicPath: '/impressionen' },
  { label: 'FAQ', to: '/cms/faqs', publicPath: '/faqs' },
  { label: 'Impressum', to: '/cms/impressum', publicPath: '/impressum' },
  { label: 'Datenschutz', to: '/cms/datenschutz', publicPath: '/datenschutz' },
  { label: 'AGB', to: '/cms/agb', publicPath: '/agb' },
] as const;

export const FAQ_PAGE_FALLBACK = {
  eyebrow: 'Service & Information',
  title: 'Häufig gestellte Fragen',
  subtitle: 'Alles von A bis Z — sortiert nach Kategorien, damit Sie schnell die Antwort finden, die Sie suchen.',
  cta_text: 'Ihre Frage war nicht dabei?',
  cta_button: 'E-Mail an das Team',
};

export const FOOTER_FALLBACK = {
  tagline: '5-Sterne Wellnesshotel an der Nordsee. Wo das Meer noch echt ist.',
  col_explore_title: 'Entdecken',
  col_explore_links: [
    { label: 'Das Resort', href: '#welcome' },
    { label: 'Angebote', href: '/angebote' },
    { label: 'Wellness & Spa', href: '/wellness' },
    { label: 'Kulinarik', href: '/kulinarik' },
    { label: 'Zimmer & Suiten', href: '/zimmer' },
    { label: 'Blog', href: '/blog' },
  ],
  col_service_title: 'Service',
  col_service_links: [
    { label: 'Anreise', href: '#anreise' },
    { label: 'FAQ', href: '/faqs' },
    { label: 'Geschenkgutscheine', href: '#' },
    { label: 'Karriere', href: '#' },
  ],
};

export const CMS_SECTION_FALLBACKS: Record<string, Record<string, unknown>> = {
  wellness_page: WELLNESS_PAGE_FALLBACK,
  culinary_page: CULINARY_PAGE_FALLBACK,
  offers_page: OFFERS_PAGE_FALLBACK,
  blog_page: BLOG_PAGE_FALLBACK,
  impressions_page: IMPRESSIONS_PAGE_FALLBACK,
  faq_page: FAQ_PAGE_FALLBACK,
  footer: FOOTER_FALLBACK,
};

export const CMS_DETAIL_LABELS: Record<string, string> = {
  blog_page: 'Beitrag',
  offers_page: 'Angebot',
  wellness_page: 'Wellness-Seite',
};

export type CmsDetail = {
  section: 'blog_page' | 'offers_page' | 'wellness_page';
  entryId: string;
  hub: string;
};

function splitHref(href: string) {
  try {
    const url = href.startsWith('http') ? new URL(href) : new URL(href, 'https://local.test');
    return { pathname: url.pathname || '/', search: url.search, hash: url.hash };
  } catch {
    const [pathPart, hashPart] = href.split('#');
    const [pathOnly, query] = (pathPart || '/').split('?');
    return {
      pathname: pathOnly || '/',
      search: query ? `?${query}` : '',
      hash: hashPart ? `#${hashPart}` : '',
    };
  }
}

export function toCmsHref(href: string) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return href;
  const { pathname, search, hash } = splitHref(href);
  if (pathname === '/' || pathname === '') return `/cms${search}${hash}`;
  if (pathname === '/seite' || pathname.startsWith('/seite/')) return `/cms${pathname}${search}${hash}`;
  const match = [...CMS_EDITOR_PAGES]
    .filter((page) => page.publicPath !== '/' && (pathname === page.publicPath || pathname.startsWith(`${page.publicPath}/`)))
    .sort((a, b) => b.publicPath.length - a.publicPath.length)[0];
  if (!match) return `${pathname}${search}${hash}`;
  return `${match.to}${pathname.slice(match.publicPath.length)}${search}${hash}`;
}

export function cmsDetailFromPath(pathname: string): CmsDetail | null {
  const patterns: Array<{ section: CmsDetail['section']; hub: string; re: RegExp }> = [
    { section: 'blog_page', hub: '/cms/blog', re: /^\/cms\/blog\/([^/]+)$/ },
    { section: 'offers_page', hub: '/cms/angebote', re: /^\/cms\/angebote\/([^/]+)$/ },
    { section: 'wellness_page', hub: '/cms/wellness', re: /^\/cms\/wellness\/([^/]+)$/ },
  ];
  for (const pattern of patterns) {
    const match = pathname.match(pattern.re);
    if (match) {
      return { section: pattern.section, entryId: decodeURIComponent(match[1]), hub: pattern.hub };
    }
  }
  return null;
}

export function cmsEntryHref(section: string, item: Record<string, unknown>): string | null {
  const id = typeof item.id === 'string' ? item.id : '';
  const slug = typeof item.slug === 'string' && item.slug ? item.slug : id;
  if (!id && !slug) return null;
  if (section === 'blog_page') return `/cms/blog/${slug}`;
  if (section === 'offers_page') return `/cms/angebote/${id || slug}`;
  if (section === 'wellness_page') return `/cms/wellness/${id || slug}`;
  return null;
}

export function matchesCmsEntry(item: Record<string, unknown>, entryId: string) {
  return item.id === entryId || item.slug === entryId;
}

export function sectionDraft(sectionKey: string, data?: Record<string, unknown> | null) {
  const fallback = CMS_SECTION_FALLBACKS[sectionKey] ?? {};
  return { ...fallback, ...data };
}
