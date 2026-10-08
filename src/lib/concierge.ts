// The website chat of a hotel: switched on and worded per hotel (section "concierge"),
// the same component for every hotel.

export type ConciergeConfig = {
  enabled: boolean;
  name: string;
  greeting: string;
  suggestions: string[];
};

export const CONCIERGE_SECTION = 'concierge';

export function conciergeConfig(section: Record<string, unknown> | undefined, hotelName: string): ConciergeConfig {
  const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
  const suggestions = Array.isArray(section?.suggestions)
    ? section.suggestions.map(text).filter(Boolean).slice(0, 4)
    : text(section?.suggestions).split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 4);
  return {
    enabled: section?.enabled === true,
    name: text(section?.name) || 'Digitaler Concierge',
    greeting: text(section?.greeting) || `Willkommen im ${hotelName}! Was möchten Sie wissen – zu Zimmern, Spa, Restaurant oder Anreise?`,
    suggestions,
  };
}

// Answers for guests: the source numbers ([2]) are for the hotel team, not for guests.
export function guestText(answer: string) {
  return answer.replace(/\s*\[\d+(?:\s*,\s*\d+)*\]/g, '').replace(/[ \t]+\n/g, '\n').trim();
}

export type AnswerPart = { type: 'text'; text: string } | { type: 'bold'; text: string } | { type: 'link'; text: string; href: string };

// Safe links only: own pages, http(s), mail and phone.
export function safeHref(href: string) {
  const value = href.trim();
  if (/^\/(?!\/)/.test(value)) return value;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return value;
  return null;
}

// One line of an answer -> text, **bold**, [label](url) and bare addresses.
export function answerParts(line: string): AnswerPart[] {
  const parts: AnswerPart[] = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|(https?:\/\/[^\s)<>,]+[^\s)<>,.!?:;])/g;
  let last = 0;
  for (const match of line.matchAll(pattern)) {
    if (match.index > last) parts.push({ type: 'text', text: line.slice(last, match.index) });
    if (match[1]) {
      const href = safeHref(match[2]);
      parts.push(href ? { type: 'link', text: match[1], href } : { type: 'text', text: match[1] });
    } else if (match[3]) {
      parts.push({ type: 'bold', text: match[3] });
    } else if (match[4]) {
      parts.push({ type: 'link', text: match[4].replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), href: match[4] });
    }
    last = match.index + match[0].length;
  }
  if (last < line.length) parts.push({ type: 'text', text: line.slice(last) });
  return parts;
}
