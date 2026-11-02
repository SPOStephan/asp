import { useSection } from '../context/HotelContext';
import './bench.css';

// The hotel's crest or signet (CMS: Logo & Leiste → "Wappen / Signet") as a quiet graphic:
// only its upper part shows, rising from the lower edge of the section, faint like a watermark.
// Purely decorative (empty alt, hidden from screen readers). Without an upload nothing shows.
export function BenchCrest({ className = '' }: { className?: string }) {
  const bar = useSection('navbar') ?? {};
  const src = typeof bar.crest_image === 'string' ? bar.crest_image.trim() : '';
  if (!src) return null;
  return (
    <div className={`bench-crest ${className}`} aria-hidden="true">
      <img src={src} alt="" loading="lazy" decoding="async" />
    </div>
  );
}
