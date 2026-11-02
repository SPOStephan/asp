import { createContext, useContext } from 'react';

// True inside the benchmark copy of the website (/benchmark/…), see src/lib/benchmark.ts.
export const BenchContext = createContext(false);

export function useBench() {
  return useContext(BenchContext);
}
