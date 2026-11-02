// The parts of the page shown right now, in order – the places a building block can follow.
// Read from the rendered page, so it works for every page without each page listing its parts:
// the direct children of <main>; for pages with a picture hero, the hero and then the parts of
// its content (one level deeper when the content is a single wrapper). Inside the CMS preview
// sections sit in a .cms-block frame; the key comes from the section inside, so the same part
// has the same key in the CMS and on the website.

export interface PagePart {
  key: string;
  label: string;
  // The element the block is inserted after.
  node: Element;
}

const SLOT = 'block-slot';

function isOurs(el: Element) {
  return el.classList.contains(SLOT) || el.hasAttribute('data-block-ui');
}

function unwrap(el: Element): Element {
  if (!el.classList.contains('cms-block')) return el;
  return [...el.children].find((child) => !child.classList.contains('cms-block__chrome') && !isOurs(child)) ?? el;
}

function baseKey(content: Element) {
  if (content.id) return content.id;
  const cls = [...content.classList].find((name) => !/^(is-|has-|reveal$|visible$)/.test(name));
  return cls || content.tagName.toLowerCase();
}

function labelOf(content: Element, fallback: string) {
  const heading = content.querySelector('h1, h2, h3, .eyebrow');
  const text = heading?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  return text ? text.slice(0, 48) : fallback;
}

export function findPageMain(): HTMLElement | null {
  const mains = [...document.querySelectorAll('main')].filter((el) => !el.closest(`.${SLOT}`));
  return (mains[0] as HTMLElement | undefined) ?? null;
}

export function pageParts(main: Element): PagePart[] {
  const parts: PagePart[] = [];
  const seen: Record<string, number> = {};
  const add = (node: Element, content: Element, label?: string) => {
    const base = baseKey(content);
    seen[base] = (seen[base] ?? 0) + 1;
    const key = seen[base] > 1 ? `${base}~${seen[base]}` : base;
    parts.push({ key, node, label: label ?? labelOf(content, base) });
  };
  for (const el of main.children) {
    if (isOurs(el)) continue;
    const content = unwrap(el);
    if (content.classList.contains('subpage-hero')) {
      const kids = [...content.children].filter((child) => !isOurs(child));
      const fixed = kids.findIndex((child) => child.classList.contains('subpage-hero__fixed'));
      const heroEnd = fixed >= 0 ? kids[fixed] : kids[0];
      if (heroEnd) add(heroEnd, content, 'Kopfbereich mit Bild');
      let rest = fixed >= 0 ? kids.slice(fixed + 1) : [];
      if (rest.length === 1 && rest[0].children.length > 1) rest = [...rest[0].children].filter((child) => !isOurs(child));
      for (const part of rest) add(part, unwrap(part));
      continue;
    }
    add(el, content);
  }
  return parts;
}

// An empty element right after the part, for a block to render into (kept in place).
export function slotAfter(part: PagePart): HTMLElement {
  const next = part.node.nextElementSibling;
  if (next?.classList.contains(SLOT) && next.getAttribute('data-after') === part.key) return next as HTMLElement;
  const existing = part.node.parentElement?.querySelector(`:scope > .${SLOT}[data-after="${CSS.escape(part.key)}"]`);
  const slot = (existing as HTMLElement | null) ?? document.createElement('div');
  slot.className = SLOT;
  slot.setAttribute('data-after', part.key);
  part.node.parentElement?.insertBefore(slot, part.node.nextSibling);
  return slot;
}

export function removeSlots(root: ParentNode = document) {
  root.querySelectorAll(`.${SLOT}`).forEach((slot) => slot.remove());
}
