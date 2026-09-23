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
  const match = CMS_EDITOR_PAGES.find(
    (page) => page.publicPath !== '/' && (pathname === page.publicPath || pathname.startsWith(`${page.publicPath}/`)),
  );
  return `${match?.to ?? pathname}${search}${hash}`;
}

export function sectionDraft(sectionKey: string, data?: Record<string, unknown> | null) {
  const fallback = CMS_SECTION_FALLBACKS[sectionKey] ?? {};
  return { ...fallback, ...data };
}
