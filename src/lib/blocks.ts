// Building blocks ("Bausteine"): sections kept once per hotel and placed anywhere on any page –
// edited in one place, the change shows everywhere. Each block keeps its placements in its own
// data: `placements: [{ page, after, label }]`.
//   page   "/" (start page), a page such as "/wellness", or "/zimmer/*" for every page of a kind
//   after  the part of the page it follows (see src/lib/pageParts.ts), or "end"
//   label  what the editor saw when placing it, for the list in the CMS

export interface BlockDef {
  key: string;
  label: string;
}

export interface Placement {
  page: string;
  after: string;
  label?: string;
}

export const BLOCK_LIBRARY: BlockDef[] = [
  { key: 'day_story', label: 'Ein Tag im Hotel' },
  { key: 'generations', label: 'Für jeden Anlass' },
];

export const BLOCK_KEYS = new Set(BLOCK_LIBRARY.map((block) => block.key));

export function blockPlacements(data: Record<string, unknown> | null | undefined): Placement[] {
  const raw = data?.placements;
  if (Array.isArray(raw)) {
    return raw
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
      .map((item) => ({ page: String(item.page ?? ''), after: String(item.after ?? 'end'), label: typeof item.label === 'string' ? item.label : undefined }))
      .filter((item) => item.page);
  }
  // Placements of the first version (a list of pages, block at the end of the page).
  const pages = data?.pages;
  return Array.isArray(pages) ? pages.filter((page): page is string => typeof page === 'string').map((page) => ({ page, after: 'end' })) : [];
}

// "/zimmer/austernfischer-suite" matches "/zimmer/*", "/wellness" matches "/wellness".
export function pageMatches(page: string, pathname: string) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (page.endsWith('/*')) {
    const hub = page.slice(0, -2);
    return path.startsWith(`${hub}/`) && path.length > hub.length + 1;
  }
  return page === path;
}

// For a detail page ("/zimmer/xyz") the pattern of all pages of its kind ("/zimmer/*").
export function kindPattern(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  return parts.length === 2 && parts[0] !== 'seite' ? `/${parts[0]}/*` : null;
}

const PAGE_NAMES: Record<string, string> = {
  '/': 'Startseite',
  '/ueber-uns': 'Über uns',
  '/anreise': 'Anreise',
  '/zimmer': 'Zimmer',
  '/wellness': 'Wellness',
  '/kulinarik': 'Kulinarik',
  '/angebote': 'Angebote',
  '/region': 'Region',
  '/tagen': 'Tagen & Feiern',
  '/blog': 'Blog',
  '/impressionen': 'Impressionen',
  '/faqs': 'FAQ',
};

export function pageName(page: string) {
  if (page.endsWith('/*')) return `${PAGE_NAMES[page.slice(0, -2)] ?? page.slice(0, -2)} – jede Einzelseite`;
  return PAGE_NAMES[page] ?? page;
}
