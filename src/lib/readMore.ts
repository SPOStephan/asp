// "[weiterlesen]" in a text marks where phones fold it: what comes before is always
// shown, the rest after "Weiterlesen". Search engines, AI and the server HTML get the
// whole text without the mark.
export const READ_MORE_MARK = '[weiterlesen]';

const MARK_PATTERN = /\s*\[weiterlesen\]\s*/i;

export function hasReadMore(text: string) {
  return MARK_PATTERN.test(text);
}

export function stripReadMore(text: string) {
  return text.replace(new RegExp(MARK_PATTERN.source, 'gi'), ' ').replace(/ {2,}/g, ' ').trim();
}

// Text before and after the (first) mark; null when there is none.
export function splitReadMore(text: string): { before: string; after: string } | null {
  const match = MARK_PATTERN.exec(text);
  if (!match) return null;
  return { before: text.slice(0, match.index), after: stripReadMore(text.slice(match.index + match[0].length)) };
}

// Puts the one mark at a position of one paragraph, removing it everywhere else.
export function placeReadMore(texts: Record<string, string>, key: string, position: number) {
  const next: Record<string, string> = {};
  for (const [name, value] of Object.entries(texts)) {
    if (name !== key) {
      next[name] = hasReadMore(value) ? stripReadMore(value) : value;
      continue;
    }
    const left = value.slice(0, position);
    const right = value.slice(position);
    const leftClean = hasReadMore(left) ? stripReadMore(left) : left.trimEnd();
    const rightClean = hasReadMore(right) ? stripReadMore(right) : right.trimStart();
    next[name] = `${leftClean} ${READ_MORE_MARK} ${rightClean}`.trim();
  }
  return next;
}
