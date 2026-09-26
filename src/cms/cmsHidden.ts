export const HIDDEN_META_KEYS = new Set(['hidden', 'hidden_on_home', 'cms_label']);

export function sectionDisplayName(data: Record<string, unknown> | null | undefined, fallback: string) {
  const custom = typeof data?.cms_label === 'string' ? data.cms_label.trim() : '';
  return custom || fallback;
}

export function isSectionHidden(
  data: Record<string, unknown> | null | undefined,
  key = 'hidden',
): boolean {
  return data?.[key] === true;
}

export function isLayoutHideable(sectionKey: string): boolean {
  return sectionKey !== 'footer' && !sectionKey.endsWith('_page');
}

export function isHiddenMetaPath(path: string): boolean {
  const leaf = path.split('.').pop() ?? path;
  return HIDDEN_META_KEYS.has(leaf);
}

export function removedRecordIds(previousIds: string[], nextIds: string[]): string[] {
  const keep = new Set(nextIds);
  return previousIds.filter((id) => !keep.has(id));
}
