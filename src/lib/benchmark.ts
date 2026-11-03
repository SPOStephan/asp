// The benchmark copy of the website: the same pages and contents under /benchmark, with the
// design ideas from the competitor benchmark switched on. It exists for every hotel, so a
// change can be compared before/after on any of them. Nothing here changes the live pages.

export const BENCH_PREFIX = '/benchmark';
export const BENCH_COMPARE_PATH = '/benchmark-vergleich';
const SEEN_KEY = 'bench-seen';

// Further copies of the website to try one idea at a time, e.g. a different main menu:
//   /navi01 – the columns menu (fallback to the picture menu, which is the standard now)
//   /navi02 – the picture menu as it was tried (now the same as the live pages)
export const VARIANT_PREFIXES = ['/navi01', '/navi02'] as const;
export type SitePrefix = typeof BENCH_PREFIX | (typeof VARIANT_PREFIXES)[number];
const PREFIXES: SitePrefix[] = [BENCH_PREFIX, ...VARIANT_PREFIXES];

// The copy an address belongs to ("/navi01/zimmer" → "/navi01"), or null for the live pages.
export function sitePrefix(pathname: string): SitePrefix | null {
  return PREFIXES.find((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ?? null;
}

export function isBenchPath(pathname: string) {
  return sitePrefix(pathname) !== null;
}

// /benchmark/zimmer → /zimmer
export function benchPublicPath(pathname: string) {
  const prefix = sitePrefix(pathname);
  if (!prefix) return pathname;
  return pathname.slice(prefix.length) || '/';
}

function currentPrefix(): SitePrefix {
  return (typeof window !== 'undefined' && sitePrefix(window.location.pathname)) || BENCH_PREFIX;
}

// /zimmer → /benchmark/zimmer, or into the copy that is open (hashes, mail and phone links
// stay as they are)
export function toBenchHref(href: string, prefix: SitePrefix = currentPrefix()) {
  if (!href || href.startsWith('#') || /^(mailto|tel|https?):/i.test(href)) return href;
  if (!href.startsWith('/')) return href;
  if (isBenchPath(href.split(/[?#]/)[0])) return href;
  return href === '/' ? prefix : `${prefix}${href.startsWith('/?') || href.startsWith('/#') ? href.slice(1) : href}`;
}

// The before/after switch also shows on the normal pages, but only in a browser tab that has
// opened the benchmark before – ordinary guests never see it.
export function markBenchSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* private mode: the switch then only shows on the benchmark pages */
  }
}

export function benchSeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function inFrame() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}
