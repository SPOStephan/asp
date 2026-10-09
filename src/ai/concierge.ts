// What the AI is told. Pure functions, so the rules of the concierge can be checked without
// a model or a database (scripts/check-knowledge.ts).
import { GAP_MARKER, type ChatTurn, type KnowledgeKind, type SourceRef } from '../lib/knowledge';
import type { AiMessage } from './provider';

export type HotelBrief = {
  id: string;
  name: string;
  url: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  bookingUrl?: string | null;
  description?: string | null;
};

export type KnowledgeHit = {
  chunk_id: string;
  source_id: string;
  kind: KnowledgeKind;
  title: string;
  heading: string | null;
  content: string;
  url: string | null;
  source_hotel: string | null;
  rank?: number;
};

export type ConciergeContext = {
  hotel: HotelBrief;
  siblings: HotelBrief[];
  rules: string[];
  tone?: string | null;
  crossSelling: boolean;
  corrections: KnowledgeHit[];
  hits: KnowledgeHit[];
  today: string;
};

const MAX_CHUNK = 2000;

function line(label: string, value?: string | null) {
  return value ? `${label}: ${value}` : '';
}

function sourceLabel(hit: KnowledgeHit, ctx: ConciergeContext) {
  const owner =
    hit.source_hotel === null
      ? 'gilt für die ganze Gruppe'
      : hit.source_hotel === ctx.hotel.id
        ? ctx.hotel.name
        : `anderes Hotel der Gruppe: ${ctx.siblings.find((item) => item.id === hit.source_hotel)?.name ?? 'unbekannt'}`;
  return [hit.title, hit.heading && hit.heading !== hit.title ? hit.heading : '', owner, hit.url ?? ''].filter(Boolean).join(' · ');
}

// Corrections first (they win), then the search hits, each chunk once.
export function numberSources(ctx: ConciergeContext): Array<{ ref: SourceRef; hit: KnowledgeHit }> {
  const seen = new Set<string>();
  const list: Array<{ ref: SourceRef; hit: KnowledgeHit }> = [];
  for (const hit of [...ctx.corrections, ...ctx.hits]) {
    if (seen.has(hit.chunk_id)) continue;
    if (!ctx.crossSelling && hit.source_hotel && hit.source_hotel !== ctx.hotel.id) continue;
    seen.add(hit.chunk_id);
    list.push({
      hit,
      ref: {
        n: list.length + 1,
        chunk_id: hit.chunk_id,
        source_id: hit.source_id,
        kind: hit.kind,
        title: hit.title,
        heading: hit.heading,
        url: hit.url,
        hotel_id: hit.source_hotel,
        cited: false,
      },
    });
  }
  return list;
}

export function buildSystemPrompt(ctx: ConciergeContext) {
  const numbered = numberSources(ctx);
  const { hotel } = ctx;
  const contact = [hotel.phone ? `Telefon ${hotel.phone}` : '', hotel.email ? `E-Mail ${hotel.email}` : ''].filter(Boolean).join(', ');
  const booking = hotel.bookingUrl
    ? `Für Preise, freie Zimmer und Buchungen verweist du auf die Online-Buchung: ${hotel.bookingUrl}`
    : `Für Preise, freie Zimmer und Buchungen verweist du auf eine Anfrage an das Hotel${contact ? ` (${contact})` : ''}.`;
  const rules = [
    `Du bist der digitale Concierge von ${hotel.name}. Du beantwortest Fragen von Gästen und Interessenten.`,
    '',
    'So arbeitest du:',
    '- Fakten über das Hotel, die Gruppe, Zeiten, Leistungen, Regeln und Preise nimmst du ausschließlich aus dem WISSEN unten. Du erfindest nichts und ergänzt nichts aus Vermutungen.',
    '- Belege jede Aussage mit der Nummer ihrer Quelle in eckigen Klammern, z. B. [2].',
    '- Einträge unter KORREKTUREN wurden vom Hotel geprüft und gehen allen anderen Quellen vor.',
    `- Kannst du eine Frage mit dem WISSEN nicht sicher beantworten, sag das offen, biete den Kontakt zur Rezeption an${contact ? ` (${contact})` : ''} und schreibe ganz am Ende ${GAP_MARKER}.`,
    `- Freie Zimmer und Preise sagst du nie zu und schätzt sie nicht. ${booking}`,
    ctx.crossSelling
      ? '- Ein anderes Hotel der Gruppe empfiehlst du nur, wenn es zur Frage deutlich besser passt oder der Gast danach fragt, mit Link.'
      : '- Andere Hotels empfiehlst du nicht.',
    '- Antworte in der Sprache der letzten Gastfrage: freundlich, knapp und konkret, kurze Absätze oder Listen, keine Überschriften. Verlinke passende Seiten der Website.',
    '- Du bist ein KI-Assistent und gibst dich nie als Mensch aus. Persönliche Daten fragst du nicht ab.',
    `- Heute ist ${ctx.today}.`,
  ];
  if (ctx.tone?.trim()) rules.push('', 'TONALITÄT', ctx.tone.trim());
  if (ctx.rules.length) rules.push('', 'REGELN DES HOTELS (immer befolgen)', ...ctx.rules.map((rule) => `- ${rule}`));
  rules.push(
    '',
    'HOTEL',
    ...[
      line('Name', hotel.name),
      line('Website', hotel.url),
      line('Adresse', hotel.address),
      line('Telefon', hotel.phone),
      line('E-Mail', hotel.email),
      line('Online-Buchung', hotel.bookingUrl),
      line('Kurzbeschreibung', hotel.description),
    ].filter(Boolean),
  );
  if (ctx.crossSelling && ctx.siblings.length) {
    rules.push('', 'WEITERE HOTELS DER GRUPPE', ...ctx.siblings.map((item) => `- ${item.name}: ${item.url}${item.description ? ` – ${item.description}` : ''}`));
  }
  const corrections = numbered.filter((item) => item.hit.kind === 'correction');
  const others = numbered.filter((item) => item.hit.kind !== 'correction');
  const entry = ({ ref, hit }: { ref: SourceRef; hit: KnowledgeHit }) =>
    `[${ref.n}] ${sourceLabel(hit, ctx)}\n${hit.content.slice(0, MAX_CHUNK)}`;
  rules.push('', 'WISSEN');
  if (corrections.length) rules.push('', 'KORREKTUREN (Vorrang)', ...corrections.map(entry));
  if (others.length) rules.push('', ...others.map(entry).join('\n\n').split('\n'));
  if (!numbered.length) rules.push('(Zu dieser Frage wurde nichts gefunden.)');
  return { system: rules.join('\n'), sources: numbered.map((item) => item.ref) };
}

export function conciergeMessages(system: string, history: ChatTurn[], question: string): AiMessage[] {
  return [
    { role: 'system', content: system },
    ...history.slice(-8).map((turn) => ({ role: turn.role, content: turn.content }) as AiMessage),
    { role: 'user', content: question },
  ];
}

// The knowledge is German; guests are not always. A cheap model turns the question
// (and what "that" refers to) into German search words.
export function searchTermsMessages(history: ChatTurn[], question: string): AiMessage[] {
  const transcript = history
    .slice(-4)
    .map((turn) => `${turn.role === 'user' ? 'Gast' : 'Concierge'}: ${turn.content.slice(0, 600)}`)
    .join('\n');
  return [
    {
      role: 'system',
      content:
        'Du bereitest eine Volltextsuche im deutschsprachigen Wissen eines Hotels vor. Gib nur eine Zeile mit 4 bis 14 deutschen Suchwörtern aus: die Begriffe der letzten Gastfrage, Synonyme und, falls die Frage sich auf den Verlauf bezieht, das gemeinte Thema. Keine Sätze, keine Satzzeichen.',
    },
    { role: 'user', content: `${transcript ? `Verlauf:\n${transcript}\n\n` : ''}Letzte Frage: ${question}` },
  ];
}

export function cleanSearchTerms(text: string) {
  return text.replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
}

export type CheckInput = { question: string; expected: string; wrong_text?: string | null };

export function judgeMessages(check: CheckInput, answer: string): AiMessage[] {
  return [
    {
      role: 'system',
      content:
        'Du prüfst Antworten eines Hotel-Chats. Bestanden ist eine Antwort, wenn sie der RICHTIGEN AUSSAGE entspricht (andere Worte sind in Ordnung) und ihr nirgends widerspricht. Nicht bestanden ist sie, wenn sie widerspricht, die FALSCHE AUSSAGE wiederholt oder die Frage nicht beantwortet. Antworte nur mit JSON: {"pass": true oder false, "reason": "ein kurzer Satz auf Deutsch"}',
    },
    {
      role: 'user',
      content: [
        `FRAGE: ${check.question}`,
        `RICHTIGE AUSSAGE: ${check.expected}`,
        check.wrong_text ? `FALSCHE AUSSAGE (früher gegeben): ${check.wrong_text}` : '',
        `ANTWORT: ${answer}`,
      ]
        .filter(Boolean)
        .join('\n'),
    },
  ];
}

export function parseJson<T>(text: string): T | null {
  const start = text.search(/[[{]/);
  if (start < 0) return null;
  const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  if (end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

export function readJudgement(text: string): { pass: boolean; reason: string } {
  const parsed = parseJson<{ pass?: unknown; reason?: unknown }>(text);
  if (!parsed || typeof parsed.pass !== 'boolean') return { pass: false, reason: 'Prüfung nicht lesbar: ' + text.slice(0, 160) };
  return { pass: parsed.pass, reason: String(parsed.reason ?? '') };
}

// E-mails become general questions and answers without anything personal.
export function emailMessages(text: string, hotelName: string): AiMessage[] {
  return [
    {
      role: 'system',
      content: [
        `Hier sind E-Mails, die ${hotelName} an Gäste geschrieben hat. Erstelle daraus Frage-Antwort-Paare, die für künftige Gäste allgemein gelten.`,
        '- Entferne alles Personenbezogene: Namen von Gästen, deren E-Mail-Adressen, Telefonnummern, Anschriften, Buchungsnummern, konkrete Aufenthaltsdaten, Zahlungsdaten.',
        '- Kontaktdaten des Hotels selbst dürfen bleiben.',
        '- Lass individuelle Absprachen, Entschuldigungen und Einzelfälle weg.',
        '- Formuliere die Frage so, wie ein Gast sie stellen würde, und die Antwort vollständig und sachlich.',
        '- Ausgabe nur als JSON-Array: [{"question": "...", "answer": "..."}]. Gibt es nichts Allgemeines, gib [] aus.',
      ].join('\n'),
    },
    { role: 'user', content: text.slice(0, 60_000) },
  ];
}

export function readQaPairs(text: string): Array<{ question: string; answer: string }> {
  const parsed = parseJson<unknown>(text);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((item) => ({
      question: String((item as { question?: unknown })?.question ?? '').trim(),
      answer: String((item as { answer?: unknown })?.answer ?? '').trim(),
    }))
    .filter((item) => item.question && item.answer);
}

// Scanned PDF pages and images: a model that can read images writes the text down.
export function ocrMessages(dataUrl: string): AiMessage[] {
  return [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Schreib den gesamten Text dieser Seite vollständig und wortgetreu ab, in Lesereihenfolge. Tabellen als Markdown-Tabelle, Überschriften mit ##. Nichts zusammenfassen, nichts ergänzen. Gibt es keinen Text, antworte mit einer leeren Zeile.',
        },
        { type: 'image_url', image_url: { url: dataUrl } },
      ],
    },
  ];
}

// Alt text for a picture of the hotel's website, with what is known about the hotel, so the
// text names the region where it fits (sea, mountains, view) and never invents anything.
export type AltContext = { hotelName: string; address?: string | null; about?: string | null; place?: string };

export function altTextMessages(dataUrl: string, context: AltContext): AiMessage[] {
  const facts = [
    `Hotel: ${context.hotelName}`,
    context.address ? `Adresse/Lage: ${context.address}` : '',
    context.about ? `Über das Hotel: ${context.about}` : '',
    context.place ? `Das Bild steht auf der Website hier: ${context.place}` : '',
  ].filter(Boolean);
  return [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: [
            'Du schreibst den Alt-Text für ein Bild auf der Website eines Hotels – für blinde Gäste und für Google.',
            ...facts,
            '',
            'Regeln:',
            '- Ein sachlicher Satz auf Deutsch, höchstens 120 Zeichen: was ist zu sehen (Raum, Ausstattung, Speise, Landschaft, Stimmung).',
            '- Ort oder Region (aus der Adresse ableiten, z. B. Nordsee, St. Peter-Ording, Sauerland) nur nennen, wenn es zum Motiv passt: Außenansicht, Landschaft, Meer, Berge, Ausblick, Strand.',
            '- Den Hotelnamen nur, wenn das Haus selbst oder sein Name zu sehen ist oder es eindeutig ein Raum des Hotels ist – sparsam.',
            '- Nicht beginnen mit „Bild von“, „Foto von“. Keine Werbesprache, nichts erfinden, keine Personen benennen.',
            '- Dazu ein kurzer Dateiname: 3 bis 6 deutsche Wörter, klein, mit Bindestrichen, ohne Umlaute (ae, oe, ue, ss).',
            '',
            'Antworte nur mit JSON: {"alt": "…", "datei": "…"}',
          ].join('\n'),
        },
        { type: 'image_url', image_url: { url: dataUrl } },
      ],
    },
  ];
}

export function readAltSuggestion(text: string): { alt: string; fileName: string } {
  const parsed = parseJson<{ alt?: unknown; datei?: unknown; file?: unknown }>(text);
  const alt = String(parsed?.alt ?? '').replace(/\s+/g, ' ').trim().slice(0, 160);
  const fileName = String(parsed?.datei ?? parsed?.file ?? '').trim();
  return { alt, fileName };
}
