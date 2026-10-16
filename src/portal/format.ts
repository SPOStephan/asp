const dateFormat = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
const shortFormat = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const numberFormat = new Intl.NumberFormat('de-DE');

export const formatDate = (value: string) => dateFormat.format(new Date(`${value.slice(0, 10)}T12:00:00`));
export const formatShort = (value: string) => shortFormat.format(new Date(`${value.slice(0, 10)}T12:00:00`));
export const formatPoints = (value: number) => numberFormat.format(value);

export function nights(arrival: string, departure: string) {
  const ms = new Date(`${departure}T12:00:00`).getTime() - new Date(`${arrival}T12:00:00`).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

export function daysUntil(date: string) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.round((new Date(`${date}T12:00:00`).getTime() - today.getTime()) / 86_400_000);
}

export function greeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 11) return 'Guten Morgen';
  if (hour < 18) return 'Guten Tag';
  return 'Guten Abend';
}

// A picture that cannot be loaded stays invisible instead of showing a broken icon.
export function hideBroken(event: { currentTarget: HTMLImageElement }) {
  event.currentTarget.style.visibility = 'hidden';
}

// Bunny serves smaller copies on request; the portal never needs the full picture.
export function sized(src: string, width: number) {
  if (!src) return '';
  if (/b-cdn\.net\//.test(src)) return `${src}${src.includes('?') ? '&' : '?'}width=${width}`;
  return src;
}
