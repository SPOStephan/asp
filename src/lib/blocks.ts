// Building blocks ("Bausteine"): sections kept once per hotel and shown on any page the editor
// picks in the CMS – edited in one place, the change shows everywhere. Each block keeps the
// pages it appears on in its own data as `pages`: "/" (start page), a hub such as "/wellness",
// or "/zimmer/*" for every detail page of that kind.

export interface BlockDef {
  key: string;
  label: string;
  // Pages before an editor chose any (older data): the start page for blocks that used to
  // sit there, so nothing changes on the live website.
  defaultPages: string[];
}

export const BLOCK_LIBRARY: BlockDef[] = [
  { key: 'day_story', label: 'Ein Tag im Hotel', defaultPages: [] },
  { key: 'generations', label: 'Für jeden Anlass', defaultPages: ['/'] },
];

export const BLOCK_KEYS = new Set(BLOCK_LIBRARY.map((block) => block.key));

// Where a block can be placed (the CMS shows these as checkboxes).
export const BLOCK_PLACES: Array<{ path: string; label: string }> = [
  { path: '/', label: 'Startseite' },
  { path: '/zimmer', label: 'Zimmer' },
  { path: '/zimmer/*', label: 'Zimmer – jede Zimmerseite' },
  { path: '/wellness', label: 'Wellness' },
  { path: '/wellness/*', label: 'Wellness – jede Themenseite' },
  { path: '/kulinarik', label: 'Kulinarik' },
  { path: '/angebote', label: 'Angebote' },
  { path: '/angebote/*', label: 'Angebote – jede Angebotsseite' },
  { path: '/anlaesse', label: 'Anlässe' },
  { path: '/anlaesse/*', label: 'Anlässe – jede Anlass-Seite' },
  { path: '/blog', label: 'Blog' },
  { path: '/impressionen', label: 'Impressionen' },
  { path: '/faqs', label: 'FAQ' },
];

export function blockPages(def: BlockDef, data: Record<string, unknown> | null | undefined): string[] {
  const pages = data?.pages;
  return Array.isArray(pages) ? pages.filter((item): item is string => typeof item === 'string') : def.defaultPages;
}

// "/zimmer/austernfischer-suite" matches "/zimmer/*", "/wellness" matches "/wellness".
export function blockOnPage(pages: string[], pathname: string) {
  const path = pathname.replace(/\/+$/, '') || '/';
  return pages.some((page) => {
    if (page.endsWith('/*')) {
      const hub = page.slice(0, -2);
      return path.startsWith(`${hub}/`) && path.length > hub.length + 1;
    }
    return page === path;
  });
}
