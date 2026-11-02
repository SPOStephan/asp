// Links inside CMS texts: "[Zimmer & Suiten](/zimmer)" becomes a real link – on the website,
// in the page version for search engines and in llms.txt. Only paths of the website
// ("/…", "#…") and full web addresses are taken; anything else stays plain text.

export type InlinePart = { text: string } | { text: string; href: string };

const LINK = /\[([^\]\n]{1,120})\]\(((?:\/|#|https?:\/\/)[^)\s]{0,300})\)/g;

export function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    const at = match.index ?? 0;
    if (at > last) parts.push({ text: text.slice(last, at) });
    parts.push({ text: match[1], href: match[2] });
    last = at + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

export function hasInlineLinks(text: string) {
  return new RegExp(LINK.source).test(text);
}

// The text without link marks (meta description, search, chat summaries).
export function stripInline(text: string) {
  return text.replace(LINK, '$1');
}
