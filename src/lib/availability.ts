/** Set to `legacy` to restore the previous Anreise / Abreise / Gäste form. */
export const AVAILABILITY_UI_MODE: 'modern' | 'legacy' = 'modern';

export interface AvailabilityQuery {
  arrival: string | null;
  departure: string | null;
  adults: number;
  children: number;
}

export const WEEKDAYS_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;

export const MONTHS_DE = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
] as const;

export function createAvailabilityQuery(): AvailabilityQuery {
  return {
    arrival: null,
    departure: null,
    adults: 2,
    children: 0,
  };
}

export function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function compareDateKeys(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function formatDateDe(key: string): string {
  const date = parseDateKey(key);
  return `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()}`;
}

export function formatMonthTitle(date: Date): string {
  return `${MONTHS_DE[date.getMonth()]} ${date.getFullYear()}`;
}

export function isPastDay(date: Date, today: Date): boolean {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return day.getTime() < start.getTime();
}

export function monthGrid(view: Date): Array<Date | null> {
  const first = startOfMonth(view);
  const firstWeekday = (first.getDay() + 6) % 7;
  const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= days; day += 1) {
    cells.push(new Date(view.getFullYear(), view.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function dateInRange(key: string, arrival: string | null, departure: string | null): boolean {
  if (!arrival) return false;
  if (!departure) return key === arrival;
  return key >= arrival && key <= departure;
}

export function nextDateSelection(
  current: Pick<AvailabilityQuery, 'arrival' | 'departure'>,
  nextKey: string,
): Pick<AvailabilityQuery, 'arrival' | 'departure'> {
  const { arrival, departure } = current;
  if (!arrival || departure) {
    return { arrival: nextKey, departure: null };
  }
  if (nextKey <= arrival) {
    return { arrival: nextKey, departure: null };
  }
  return { arrival, departure: nextKey };
}

export function formatGuestSummary(adults: number, children: number): string {
  const parts = [
    `${adults} ${adults === 1 ? 'Erwachsener' : 'Erwachsene'}`,
  ];
  if (children) parts.push(`${children} ${children === 1 ? 'Kind' : 'Kinder'}`);
  return parts.join(', ');
}

export function formatStaySummary(arrival: string | null, departure: string | null): string {
  if (!arrival && !departure) return 'Anreise? → Abreise?';
  const start = arrival ? formatDateDe(arrival) : 'Anreise?';
  const end = departure ? formatDateDe(departure) : 'Abreise?';
  return `${start} → ${end}`;
}

/** Placeholder mapping for the later IBE handoff. */
export function toBookingParams(query: AvailabilityQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.arrival) params.set('arrival', query.arrival);
  if (query.departure) params.set('departure', query.departure);
  params.set('adults', String(query.adults));
  params.set('children', String(query.children));
  return params;
}

export const GUEST_ROWS = [
  { key: 'adults', label: 'Erwachsene', min: 1, max: 6 },
  { key: 'children', label: 'Kinder', min: 0, max: 6 },
] as const;
