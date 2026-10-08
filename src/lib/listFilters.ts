// Filters above lists (rooms, blog topics). Every hotel names its own filters and decides
// whether the bar shows at all; filters without a matching entry never show.

export type ListFilter = { id: string; label: string };

export const ALL_FILTER = 'alle';

export function slugifyFilter(label: string) {
  return label
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

// The hotel's own list, or null when it has none yet.
export function readFilters(value: unknown): ListFilter[] | null {
  if (!Array.isArray(value)) return null;
  const seen = new Set<string>();
  const list: ListFilter[] = [];
  for (const entry of value) {
    const label = typeof entry?.label === 'string' ? entry.label.trim() : '';
    const id = (typeof entry?.id === 'string' && entry.id.trim()) || slugifyFilter(label);
    if (!label || !id || id === ALL_FILTER || seen.has(id)) continue;
    seen.add(id);
    list.push({ id, label });
  }
  return list;
}

// Filters worth showing: with at least one entry, and not matching every entry
// (a filter that keeps everything changes nothing).
export function usefulFilters(configured: ListFilter[] | null, defaults: ListFilter[], entries: string[][]) {
  const list = configured ?? defaults;
  return list.filter((filter) => {
    const hits = entries.filter((tags) => tags.includes(filter.id)).length;
    return hits > 0 && hits < entries.length;
  });
}

export function filterLabel(configured: ListFilter[] | null, defaults: ListFilter[], id: string) {
  return (configured ?? defaults).find((filter) => filter.id === id)?.label ?? defaults.find((filter) => filter.id === id)?.label ?? '';
}

// Shown unless switched off in the CMS (eye of the part "filters", or the older switch).
export function filtersSwitchedOn(section: Record<string, unknown> | null | undefined) {
  return section?.hidden_filters !== true && section?.show_filters !== false;
}
