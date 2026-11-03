import { createContext, useContext } from 'react';
import { BENCH_PREFIX, type SitePrefix } from '../lib/benchmark';

// Which copy of the website is open: null for the live pages, "/benchmark", "/navi01" …
export const BenchContext = createContext<SitePrefix | null>(null);

// The benchmark copy itself (its design ideas show only there).
export function useBench() {
  return useContext(BenchContext) === BENCH_PREFIX;
}

// Any copy (benchmark or a variant): links stay inside it.
export function useSitePrefix() {
  return useContext(BenchContext);
}

// The menu variant being tried ("navi01", "navi02"), or null.
export function useNavVariant() {
  const prefix = useContext(BenchContext);
  return prefix === '/navi01' ? 'navi01' : prefix === '/navi02' ? 'navi02' : null;
}
