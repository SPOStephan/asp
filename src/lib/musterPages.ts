import { pageKeyFromHref as templatePageKeyFromHref, pageKeyFromPath as templatePageKeyFromPath, SYSTEM_TEMPLATES } from './pageTemplates';

export const MUSTER_PAGES = SYSTEM_TEMPLATES.filter((item) => item.template_key !== 'home').map((item) => ({
  key: item.template_key,
  label: item.title,
  pathPrefix: item.path_prefix,
}));

export type MusterPageKey = string;

export function pageKeyFromPath(pathname: string): MusterPageKey | null {
  return templatePageKeyFromPath(pathname);
}

export function pageKeyFromHref(href: string): MusterPageKey | null {
  return templatePageKeyFromHref(href);
}

export function filterMenuGroups<T extends { href?: string; title: string; links: Array<{ href: string; label: string }> }>(
  groups: T[],
  enabled: (key: MusterPageKey) => boolean,
): T[] {
  return groups
    .map((group) => {
      const groupKey = pageKeyFromHref(group.href || '');
      if (groupKey && groupKey !== 'home' && !enabled(groupKey)) return null;
      const links = group.links.filter((link) => {
        const key = pageKeyFromHref(link.href);
        return !key || key === 'home' || enabled(key);
      });
      if (groupKey && groupKey !== 'home' && !links.length) return { ...group, links: [] };
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
