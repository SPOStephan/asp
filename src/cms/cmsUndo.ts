export type CmsUndoEntry =
  | { kind: 'section'; section: string; before: Record<string, unknown> }
  | { kind: 'faqs'; before: unknown };

const DEFAULT_WINDOW_MS = 700;
const DEFAULT_LIMIT = 80;

export function createUndoStack(limit = DEFAULT_LIMIT, windowMs = DEFAULT_WINDOW_MS) {
  const items: CmsUndoEntry[] = [];
  let lastKey: string | null = null;
  let lastAt = 0;

  return {
    push(entry: CmsUndoEntry, key: string, now = Date.now()) {
      if (key && key === lastKey && now - lastAt <= windowMs) {
        lastAt = now;
        return items.length;
      }
      lastKey = key;
      lastAt = now;
      items.push(entry);
      if (items.length > limit) items.shift();
      return items.length;
    },
    pop() {
      lastKey = null;
      lastAt = 0;
      return items.pop() ?? null;
    },
    get size() {
      return items.length;
    },
  };
}
