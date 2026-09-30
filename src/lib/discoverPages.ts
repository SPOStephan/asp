import { remapSiteHref } from './links';
import { resolveDiscoverTiles } from './media';
import { pageKeyFromHref } from './pageTemplates';

// Discover tiles are fixed parts of the start page: every page a tile links to
// has to exist for the hotel, so these keys are always switched on.
export function discoverPageKeys(tiles: unknown): string[] {
  const keys = resolveDiscoverTiles(tiles)
    .map((tile) => pageKeyFromHref(remapSiteHref(tile.href, tile.title)))
    .filter((key): key is string => Boolean(key) && key !== 'home');
  return [...new Set(keys)];
}

export function missingDiscoverPages(tiles: unknown, pages: Record<string, boolean>): string[] {
  return discoverPageKeys(tiles).filter((key) => pages[key] !== true);
}
