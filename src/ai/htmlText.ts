// Readable text and links of a web page, without a DOM (runs in the edge function).
import type { NewChunk } from '../lib/knowledge';
import { chunkMarkdown } from '../lib/knowledge';

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', shy: '',
  auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß',
  euro: '€', ndash: '–', mdash: '—', hellip: '…', bdquo: '„', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’',
  eacute: 'é', egrave: 'è', agrave: 'à', copy: '©', reg: '®', middot: '·', bull: '•', deg: '°',
};

export function decodeEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const value = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(value) ? String.fromCodePoint(value) : match;
    }
    return ENTITIES[code] ?? match;
  });
}

function stripTags(html: string) {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/[ \t\f\v ]+/g, ' ').trim();
}

export type PageText = { title: string; markdown: string; links: string[] };

export function htmlToText(html: string, pageUrl: string): PageText {
  const title = stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  const links = new Set<string>();
  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"'#]+)[^"']*["']/gi)) {
    try {
      const url = new URL(decodeEntities(match[1]), pageUrl);
      if (!/^https?:$/.test(url.protocol)) continue;
      url.hash = '';
      links.add(url.toString());
    } catch {
      // ignore broken links
    }
  }
  let body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html;
  // Prefer the main content when the page marks it.
  const main = body.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (main && stripTags(main).length > 200) body = main;
  body = body
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|template|iframe|form|nav|header|footer|aside|button|video|audio|picture|select)\b[\s\S]*?<\/\1>/gi, ' ')
    // Tags can span several lines; the text is read line by line below.
    .replace(/<[^>]+>/g, (tag) => tag.replace(/\s+/g, ' '))
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, text) => `\n\n# ${stripTags(text)}\n\n`)
    .replace(/<h[2-3][^>]*>([\s\S]*?)<\/h[2-3]>/gi, (_, text) => `\n\n## ${stripTags(text)}\n\n`)
    .replace(/<h[4-6][^>]*>([\s\S]*?)<\/h[4-6]>/gi, (_, text) => `\n\n${stripTags(text)}\n`)
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<(br|hr)\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|section|article|li|ul|ol|table|tr|dd|dt|blockquote)>/gi, '\n\n')
    .replace(/<\/t[dh]>/gi, ' | ');
  const markdown = stripTagsKeepLines(body);
  return { title, markdown: title && !markdown.startsWith('# ') ? `# ${title}\n\n${markdown}` : markdown, links: [...links] };
}

function stripTagsKeepLines(text: string) {
  return text
    .split('\n')
    .map((part) => stripTags(part))
    .join('\n')
    .replace(/\n[ \t]*-\s*\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function pageChunks(page: PageText, url: string): NewChunk[] {
  return chunkMarkdown(page.markdown, url).filter((chunk) => chunk.content.replace(/\s/g, '').length > 30);
}

// Only pages of the same site, no files, no admin or shop internals.
export function crawlableLinks(links: string[], startUrl: string) {
  const start = new URL(startUrl);
  return links.filter((link) => {
    const url = new URL(link);
    if (url.host !== start.host) return false;
    if (/\.(pdf|jpe?g|png|gif|webp|svg|zip|docx?|xlsx?|mp4|mp3|ics)$/i.test(url.pathname)) return false;
    if (/\/(wp-admin|wp-login|admin|cms|login|cart|warenkorb|checkout)(\/|$)/i.test(url.pathname)) return false;
    return true;
  });
}

// Never fetch addresses inside the server's own network.
export function isPublicHttpUrl(value: string) {
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return false;
    if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false;
    if (host.startsWith('[')) return false;
    return host.includes('.');
  } catch {
    return false;
  }
}
