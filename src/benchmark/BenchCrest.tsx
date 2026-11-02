import { useHotelContent, useSection } from '../context/HotelContext';
import './bench.css';

// The crest of the hotel group (part of every hotel logo of the group): kept once for the
// whole group (CMS: Logo & Leiste → "Für alle Hotels der Gruppe übernehmen", migration 034);
// a hotel may set its own in the same field.
export function useCrest() {
  const { content } = useHotelContent();
  const bar = useSection('navbar') ?? {};
  const own = typeof bar.crest_image === 'string' ? bar.crest_image.trim() : '';
  return own || content?.brand?.crest_image?.trim() || '';
}

// The crest as a quiet graphic, faint like a watermark. Purely decorative (empty alt, hidden
// from screen readers). Without a crest nothing shows.
export function BenchCrest({ className = '' }: { className?: string }) {
  const src = useCrest();
  if (!src) return null;
  return (
    <div className={`bench-crest ${className}`} aria-hidden="true">
      <img src={src} alt="" loading="lazy" decoding="async" />
    </div>
  );
}
