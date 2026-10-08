// Removes personal data of guests from stored conversations, so they can be kept for good.
// Two steps: fixed patterns (e-mail, phone, IBAN, card numbers) that always work, then a
// model for what patterns cannot see (names, addresses, booking numbers).
import { parseJson } from './concierge';
import { complete, type AiConfig } from './provider';

// AI_CHAT_ANONYMIZE_DAYS: days until personal data is removed (default 30, 0 = next night).
export function anonymizeAfterDays(value: string) {
  const days = Number(value);
  return value.trim() && Number.isFinite(days) && days >= 0 ? days : 30;
}

export type Keep = { emails: string[]; phones: string[] };

const digits = (value: string) => value.replace(/\D/g, '');

// The hotel's own e-mail and phone number stay, everything else is replaced.
export function redactPatterns(text: string, keep: Keep = { emails: [], phones: [] }) {
  const keepEmails = new Set(keep.emails.map((item) => item.toLowerCase()));
  const keepPhones = new Set(keep.phones.map(digits).filter(Boolean));
  return text
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, (match) => (keepEmails.has(match.toLowerCase()) ? match : '[E-Mail]'))
    .replace(/\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){3,7}(?:\s?[A-Z0-9]{1,3})?\b/g, '[IBAN]')
    .replace(/\b(?:\d[ -]?){13,19}\b/g, '[Kartennummer]')
    .replace(/(?:\+|\b0)[\d ()/-]{6,}\d/g, (match) => {
      const value = digits(match);
      if (value.length < 7) return match;
      const own = [...keepPhones].some((phone) => phone.endsWith(value.slice(-7)) || value.endsWith(phone.slice(-7)));
      return own ? match : '[Telefon]';
    });
}

export function anonymizeMessages(question: string, answer: string, hotelName: string) {
  return [
    {
      role: 'system' as const,
      content: [
        `Du anonymisierst ein Gespräch zwischen einem Gast und dem Chat von ${hotelName}.`,
        'Ersetze alle personenbezogenen Daten von Gästen: Namen durch [Name], Anschriften durch [Adresse], Geburtsdaten durch [Datum], Buchungs- und Reservierungsnummern durch [Buchungsnummer], Kfz-Kennzeichen durch [Kennzeichen], sonstige Kennungen durch [entfernt].',
        'Alles andere bleibt wörtlich gleich: Fragen, Reisedaten ohne Personenbezug, Zimmer, Preise, Angaben über das Hotel und seine Kontaktdaten.',
        'Antworte nur mit JSON: {"question": "...", "answer": "..."}',
      ].join('\n'),
    },
    { role: 'user' as const, content: JSON.stringify({ question, answer }) },
  ];
}

export async function anonymize(
  config: AiConfig | null,
  model: string | null,
  input: { question: string; answer: string; hotelName: string; keep: Keep },
) {
  const question = redactPatterns(input.question, input.keep);
  const answer = redactPatterns(input.answer, input.keep);
  if (!config || !model) return { question, answer, ai: false };
  const result = await complete(config, { model, messages: anonymizeMessages(question, answer, input.hotelName), maxTokens: 1600, temperature: 0 });
  const parsed = parseJson<{ question?: unknown; answer?: unknown }>(result.text);
  if (typeof parsed?.question !== 'string' || typeof parsed?.answer !== 'string') throw new Error('Anonymisierung nicht lesbar.');
  // The model must not add anything: if a text grows a lot, keep the pattern result.
  const safe = (before: string, after: string) => (after.length <= before.length * 1.2 + 40 ? redactPatterns(after, input.keep) : before);
  return { question: safe(question, parsed.question), answer: safe(answer, parsed.answer), ai: true };
}
