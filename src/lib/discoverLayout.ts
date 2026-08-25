export type DiscoverTileLike = {
  priority?: number;
};

/** When a row would stay incomplete, the highest-priority tile spans two cells. */
export function wideDiscoverIndex(tiles: DiscoverTileLike[], columns: number) {
  if (columns < 2 || tiles.length === 0 || tiles.length % columns === 0) {
    return -1;
  }

  let index = 0;
  let best = Number.POSITIVE_INFINITY;
  tiles.forEach((tile, i) => {
    const priority = tile.priority ?? Number.POSITIVE_INFINITY;
    if (priority < best) {
      best = priority;
      index = i;
    }
  });
  return index;
}
