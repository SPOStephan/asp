export const MUSTER_PAGES = [
  { key: 'zimmer', label: 'Zimmer & Suiten', pathPrefix: '/zimmer' },
  { key: 'wellness', label: 'Wellness', pathPrefix: '/wellness' },
  { key: 'angebote', label: 'Angebote', pathPrefix: '/angebote' },
  { key: 'kulinarik', label: 'Kulinarik', pathPrefix: '/kulinarik' },
  { key: 'blog', label: 'Blog', pathPrefix: '/blog' },
  { key: 'impressionen', label: 'Impressionen', pathPrefix: '/impressionen' },
  { key: 'faqs', label: 'FAQ', pathPrefix: '/faqs' },
] as const;

export type MusterPageKey = (typeof MUSTER_PAGES)[number]['key'];

export function pageKeyFromPath(pathname: string): MusterPageKey | null {
  const match = MUSTER_PAGES.find((page) => pathname === page.pathPrefix || pathname.startsWith(`${page.pathPrefix}/`));
  return match?.key ?? null;
}

export function pageKeyFromHref(href: string): MusterPageKey | null {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return null;
  try {
    const path = href.startsWith('http') ? new URL(href).pathname : href.split('#')[0];
    return pageKeyFromPath(path || '/');
  } catch {
    return pageKeyFromPath(href.split('#')[0] || '/');
  }
}

export function filterMenuGroups<T extends { href?: string; title: string; links: Array<{ href: string; label: string }> }>(
  groups: T[],
  enabled: (key: MusterPageKey) => boolean,
): T[] {
  return groups
    .map((group) => {
      const groupKey = pageKeyFromHref(group.href || '');
      if (groupKey && !enabled(groupKey)) return null;
      const links = group.links.filter((link) => {
        const key = pageKeyFromHref(link.href);
        return !key || enabled(key);
      });
      if (groupKey && !links.length) return { ...group, links: [] };
      if (!groupKey && !links.length) return null;
      return { ...group, links };
    })
    .filter((group): group is T => Boolean(group));
}

export function publicHotelOrigin(domains: string[] | null | undefined) {
  const list = (domains ?? []).map((item) => item.trim().toLowerCase()).filter(Boolean);
  const preferred =
    list.find((item) => item.includes('lohbeckhotels.de') && !item.startsWith('admin.')) ||
    list.find((item) => item !== 'localhost' && item !== '127.0.0.1' && !item.endsWith('.local')) ||
    list[0];
  if (!preferred || preferred === 'localhost' || preferred === '127.0.0.1') return '';
  return `https://${preferred}`;
}
