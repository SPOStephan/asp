// Stays from the hotels' booking systems as CSV (semicolon or comma separated, first row =
// column names). Known columns, case and spaces ignored:
//   buchungsnummer, hotel, email, name, anreise, abreise, zimmer, personen, betrag, kanal, status
export type ImportedStay = {
  booking_ref: string;
  hotel: string;
  guest_email: string;
  guest_name: string;
  arrival: string;
  departure: string;
  room: string;
  guests: number;
  amount_eur: number;
  channel: 'direct' | 'portal' | 'ota' | 'other';
  status: 'booked' | 'stayed' | 'cancelled';
};

const ALIASES: Record<string, keyof ImportedStay> = {
  buchungsnummer: 'booking_ref', buchung: 'booking_ref', booking: 'booking_ref', reservierung: 'booking_ref',
  hotel: 'hotel', haus: 'hotel',
  email: 'guest_email', 'e-mail': 'guest_email', mail: 'guest_email',
  name: 'guest_name', gast: 'guest_name',
  anreise: 'arrival', arrival: 'arrival', abreise: 'departure', departure: 'departure',
  zimmer: 'room', kategorie: 'room', personen: 'guests', gaeste: 'guests', gäste: 'guests',
  betrag: 'amount_eur', umsatz: 'amount_eur', logis: 'amount_eur', amount: 'amount_eur',
  kanal: 'channel', channel: 'channel', status: 'status',
};

function splitLine(line: string, separator: string) {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (const char of line) {
    if (char === '"') quoted = !quoted;
    else if (char === separator && !quoted) {
      cells.push(current.trim());
      current = '';
    } else current += char;
  }
  cells.push(current.trim());
  return cells;
}

// 24.12.2026 or 2026-12-24
function isoDate(value: string) {
  const german = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (german) return `${german[3]}-${german[2].padStart(2, '0')}-${german[1].padStart(2, '0')}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
}

function amount(value: string) {
  const clean = value.replace(/[^\d,.-]/g, '');
  const normal = clean.includes(',') ? clean.replace(/\./g, '').replace(',', '.') : clean;
  return Number(normal) || 0;
}

function channel(value: string): ImportedStay['channel'] {
  const v = value.toLowerCase();
  if (/booking|expedia|hrs|ota|portal-extern/.test(v)) return 'ota';
  if (/app|portal/.test(v)) return 'portal';
  if (!v || /direkt|direct|telefon|mail|web/.test(v)) return 'direct';
  return 'other';
}

function status(value: string, departure: string): ImportedStay['status'] {
  const v = value.toLowerCase();
  if (/storn|cancel/.test(v)) return 'cancelled';
  if (/abgereist|stayed|checked.?out|beendet/.test(v)) return 'stayed';
  if (/gebucht|booked|bestätigt|reserviert/.test(v)) return 'booked';
  return departure && departure < new Date().toISOString().slice(0, 10) ? 'stayed' : 'booked';
}

export function parseStays(text: string): { rows: ImportedStay[]; problems: string[] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return { rows: [], problems: ['Bitte Kopfzeile und mindestens eine Reise einfügen.'] };
  const separator = lines[0].split(';').length >= lines[0].split(',').length ? ';' : ',';
  const head = splitLine(lines[0], separator).map((cell) => ALIASES[cell.toLowerCase().replace(/\s+/g, '')]);
  const problems: string[] = [];
  const rows: ImportedStay[] = [];
  lines.slice(1).forEach((line, index) => {
    const cells = splitLine(line, separator);
    const raw: Record<string, string> = {};
    head.forEach((key, column) => {
      if (key) raw[key] = cells[column] ?? '';
    });
    const arrival = isoDate(raw.arrival ?? '');
    const departure = isoDate(raw.departure ?? '');
    if (!raw.booking_ref || !arrival || !departure) {
      problems.push(`Zeile ${index + 2}: Buchungsnummer, Anreise oder Abreise fehlt.`);
      return;
    }
    rows.push({
      booking_ref: raw.booking_ref,
      hotel: raw.hotel ?? '',
      guest_email: (raw.guest_email ?? '').toLowerCase(),
      guest_name: raw.guest_name ?? '',
      arrival,
      departure,
      room: raw.room ?? '',
      guests: Number(raw.guests) || 1,
      amount_eur: amount(raw.amount_eur ?? ''),
      channel: channel(raw.channel ?? ''),
      status: status(raw.status ?? '', departure),
    });
  });
  return { rows, problems };
}
