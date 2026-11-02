// The benchmark copy of the website: the same pages and contents under /benchmark, with the
// design ideas from the competitor benchmark switched on. It exists for every hotel, so a
// change can be compared before/after on any of them. Nothing here changes the live pages.

export const BENCH_PREFIX = '/benchmark';
export const BENCH_COMPARE_PATH = '/benchmark-vergleich';
const SEEN_KEY = 'bench-seen';

export function isBenchPath(pathname: string) {
  return pathname === BENCH_PREFIX || pathname.startsWith(`${BENCH_PREFIX}/`);
}

// /benchmark/zimmer → /zimmer
export function benchPublicPath(pathname: string) {
  if (!isBenchPath(pathname)) return pathname;
  return pathname.slice(BENCH_PREFIX.length) || '/';
}

// /zimmer → /benchmark/zimmer (hashes, mail and phone links stay as they are)
export function toBenchHref(href: string) {
  if (!href || href.startsWith('#') || /^(mailto|tel|https?):/i.test(href)) return href;
  if (!href.startsWith('/')) return href;
  if (isBenchPath(href.split(/[?#]/)[0])) return href;
  return href === '/' ? BENCH_PREFIX : `${BENCH_PREFIX}${href.startsWith('/?') || href.startsWith('/#') ? href.slice(1) : href}`;
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
