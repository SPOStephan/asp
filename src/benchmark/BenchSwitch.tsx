import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BENCH_COMPARE_PATH,
  benchPublicPath,
  inFrame,
  isBenchPath,
  sitePrefix,
  markBenchSeen,
  toBenchHref,
} from '../lib/benchmark';
import './bench.css';

const SCROLL_KEY = 'bench-scroll';

// Inside the benchmark every link of the website stays in the benchmark: a click on
// "/zimmer" goes to "/benchmark/zimmer". Captured before the page's own handlers.
function useBenchLinks(active: boolean) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!active) return;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link || link.target === '_blank' || link.hasAttribute('download') || link.closest('[data-bench-keep]')) return;
      const raw = link.getAttribute('href') ?? '';
      if (!raw.startsWith('/') || raw.startsWith('//')) return;
      const url = new URL(raw, window.location.origin);
      if (isBenchPath(url.pathname) || url.pathname.startsWith('/api/') || url.pathname === BENCH_COMPARE_PATH) return;
      event.preventDefault();
      event.stopPropagation();
      navigate(toBenchHref(`${url.pathname}${url.search}${url.hash}`));
      if (!url.hash) window.scrollTo({ top: 0 });
    };
    window.addEventListener('click', onClick, true);
    return () => window.removeEventListener('click', onClick, true);
  }, [active, navigate]);
}

// After a switch the other version opens at the same place of the page.
function useKeptScroll(pathname: string) {
  useEffect(() => {
    let stored: { path: string; ratio: number } | null = null;
    try {
      stored = JSON.parse(sessionStorage.getItem(SCROLL_KEY) || 'null');
    } catch {
      stored = null;
    }
    if (!stored || stored.path !== pathname) return;
    try {
      sessionStorage.removeItem(SCROLL_KEY);
    } catch {
      /* ignore */
    }
    const ratio = stored.ratio;
    // The page needs a moment for its pictures; the position is set twice.
    const place = () => window.scrollTo({ top: ratio * (document.documentElement.scrollHeight - window.innerHeight) });
    const a = window.setTimeout(place, 350);
    const b = window.setTimeout(place, 1100);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [pathname]);
}

// Small "Vorher | Nachher" switch, bottom left – only on the benchmark pages, never on the
// normal pages, inside the side-by-side view or in the CMS.
export function BenchSwitch() {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const bench = isBenchPath(pathname);
  const framed = inFrame();

  useBenchLinks(bench);
  useKeptScroll(pathname);

  useEffect(() => {
    if (bench) markBenchSeen();
  }, [bench]);

  // Only inside the benchmark copy; the normal pages never show it.
  if (framed || !bench) return null;

  const page = benchPublicPath(pathname);
  const go = (toBench: boolean) => {
    if (toBench === bench) return;
    const target = toBench ? toBenchHref(page) : page;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    try {
      sessionStorage.setItem(SCROLL_KEY, JSON.stringify({ path: target, ratio: max > 0 ? window.scrollY / max : 0 }));
    } catch {
      /* ignore */
    }
    navigate(`${target}${search}${hash}`);
  };

  return (
    <div className="bench-switch" role="group" aria-label="Benchmark-Vergleich" data-bench-keep>
      <button type="button" aria-pressed={!bench} onClick={() => go(false)}>
        Vorher
      </button>
      <button type="button" aria-pressed={bench} onClick={() => go(true)}>
        Nachher
      </button>
      <a href={`${BENCH_COMPARE_PATH}?seite=${encodeURIComponent(page)}&kopie=${encodeURIComponent(sitePrefix(pathname) ?? '')}`} className="bench-switch__pair" title="Beide Fassungen nebeneinander">
        Nebeneinander
      </a>
    </div>
  );
}
