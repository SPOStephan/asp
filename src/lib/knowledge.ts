// Shared by the admin area, the CMS and the server: what the AI knowledge looks like.

export type KnowledgeKind = 'website' | 'url' | 'pdf' | 'text' | 'email' | 'correction' | 'example';
export type KnowledgeStatus = 'ready' | 'review' | 'error';

export type KnowledgeSource = {
  id: string;
  organization_id: string;
  hotel_id: string | null;
  kind: KnowledgeKind;
  title: string;
  url: string | null;
  status: KnowledgeStatus;
  enabled: boolean;
  needs_check: boolean;
  check_reason: string | null;
  error: string | null;
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type KnowledgeChunk = {
  id: string;
  source_id: string;
  position: number;
  heading: string | null;
  content: string;
  url: string | null;
};

export type NewChunk = { heading?: string | null; content: string; url?: string | null };

// One numbered source in a prompt and later in the answer ("[2]").
export type SourceRef = {
  n: number;
  chunk_id: string;
  source_id: string;
  kind: KnowledgeKind;
  title: string;
  heading: string | null;
  url: string | null;
  hotel_id: string | null;
  cited: boolean;
};

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export type Rating = 'good' | 'improve' | 'wrong';

export const KIND_LABEL: Record<KnowledgeKind, string> = {
  website: 'Eigene Website',
  url: 'Link',
  pdf: 'PDF',
  text: 'Text',
  email: 'Antworten aus E-Mails',
  correction: 'Korrektur',
  example: 'Gute Antwort',
};

export const GAP_MARKER = '[[LUECKE]]';

// Pieces of about one screen: big enough to keep context, small enough to search.
export function chunkText(text: string, max = 1800): string[] {
  const paragraphs = text
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let current = '';
  for (const paragraph of paragraphs) {
    const pieces = paragraph.length > max ? splitLong(paragraph, max) : [paragraph];
    for (const piece of pieces) {
      if (current && current.length + piece.length + 2 > max) {
        chunks.push(current);
        current = '';
      }
      current = current ? `${current}\n\n${piece}` : piece;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function splitLong(text: string, max: number) {
  const sentences = text.match(/[^.!?\n]+[.!?]*\s*/g) ?? [text];
  const parts: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if (current && current.length + sentence.length > max) {
      parts.push(current.trim());
      current = '';
    }
    if (sentence.length > max) {
      for (let index = 0; index < sentence.length; index += max) parts.push(sentence.slice(index, index + max).trim());
      continue;
    }
    current += sentence;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

// Markdown with "## " headings -> one chunk list per heading, long sections split.
export function chunkMarkdown(markdown: string, url: string | null, max = 1800): NewChunk[] {
  const lines = markdown.split('\n');
  const title = lines.find((line) => line.startsWith('# '))?.slice(2).trim() ?? null;
  const sections: Array<{ heading: string | null; body: string[] }> = [{ heading: title, body: [] }];
  for (const line of lines) {
    if (line.startsWith('# ')) continue;
    if (line.startsWith('## ')) {
      sections.push({ heading: [title, line.slice(3).trim()].filter(Boolean).join(' – '), body: [] });
      continue;
    }
    sections[sections.length - 1].body.push(line);
  }
  const chunks: NewChunk[] = [];
  for (const section of sections) {
    for (const content of chunkText(section.body.join('\n'), max)) {
      chunks.push({ heading: section.heading, content, url });
    }
  }
  return chunks;
}

// The answer marks unknown questions with GAP_MARKER and cites sources as [n].
export function readAnswer(raw: string, sources: SourceRef[]) {
  const gap = raw.includes(GAP_MARKER);
  const answer = stripGapMarker(raw).trim();
  const cited = new Set<number>();
  for (const match of answer.matchAll(/\[(\d+(?:\s*,\s*\d+)*)\]/g)) {
    for (const value of match[1].split(',')) cited.add(Number(value.trim()));
  }
  return { answer, gap, sources: sources.map((source) => ({ ...source, cited: cited.has(source.n) })) };
}

// Also hides a marker that is still arriving while the answer streams.
export function stripGapMarker(text: string) {
  return text.replaceAll(GAP_MARKER, '').replace(/\[\[?L?U?E?C?K?E?\]?$/, '');
}

export function scopeLabel(hotelId: string | null) {
  return hotelId ? 'nur dieses Hotel' : 'ganze Gruppe';
}
