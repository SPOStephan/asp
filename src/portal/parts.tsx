import { Check } from 'lucide-react';
import { daysUntil, formatDate, formatPoints, nights, sized, hideBroken } from './format';
import type { PortalHotel, Stay, Summary } from './types';

export function tierClass(id: string | undefined) {
  return `tier-${(id || 'classic').replace(/[^a-z0-9-]/gi, '').toLowerCase()}`;
}

export function TierProgress({ summary }: { summary: Summary }) {
  const { tier, next_tier: next, qualifying_points: points } = summary;
  const from = tier?.min_points ?? 0;
  const share = next ? Math.min(100, Math.round(((points - from) / Math.max(1, next.min_points - from)) * 100)) : 100;
  const months = summary.program.settings.tier_window_months ?? 24;
  return (
    <div className="portal-progress">
      <div className="portal-progress__bar"><span style={{ width: `${share}%` }} /></div>
      <p className="portal-progress__text">
        {next
          ? `Noch ${formatPoints(Math.max(0, next.min_points - points))} Punkte bis ${next.name}`
          : `Sie haben die höchste Stufe erreicht.`}
        <small> · gezählt werden die Punkte der letzten {months} Monate</small>
      </p>
    </div>
  );
}

export function StampCard({ summary }: { summary: Summary }) {
  const { count, goal, completed_cards: done } = summary.stamps;
  return (
    <section className="portal-card portal-stamps" aria-label="Stammgastpass">
      <div className="portal-card__head">
        <h2 className="heading">Stammgastpass</h2>
        <p>{count} von {goal} Stempeln{done ? ` · ${done} Gratisnacht${done > 1 ? 'nächte' : ''} verdient` : ''}</p>
      </div>
      <ol className="portal-stamps__row">
        {Array.from({ length: goal }, (_, index) => (
          <li key={index} className={index < count ? 'is-on' : undefined}>{index < count ? <Check size={16} strokeWidth={2} /> : index + 1}</li>
        ))}
      </ol>
      <p className="portal-muted">Für jeden direkt gebuchten Aufenthalt gibt es einen Stempel – nach {goal} Stempeln schenken wir Ihnen eine Übernachtung in einem Haus Ihrer Wahl.</p>
    </section>
  );
}

export function StayCard({ stay, hotel, points }: { stay: Stay; hotel?: PortalHotel; points?: number }) {
  const days = daysUntil(stay.arrival);
  const upcoming = stay.status === 'booked' && days >= 0;
  return (
    <article className={`portal-stay${stay.status === 'cancelled' ? ' is-cancelled' : ''}`}>
      <div className="portal-stay__picture">
        {hotel?.image ? <img src={sized(hotel.image, 800)} alt="" loading="lazy" onError={hideBroken} /> : null}
        {upcoming ? <span className="portal-stay__badge">{days === 0 ? 'Heute' : days === 1 ? 'Morgen' : `In ${days} Tagen`}</span> : null}
      </div>
      <div className="portal-stay__body">
        <p className="portal-eyebrow">{stay.status === 'cancelled' ? 'Storniert' : upcoming ? 'Gebucht' : 'Aufenthalt'}</p>
        <h3 className="heading">{hotel?.name || stay.hotel_name}</h3>
        <p>{formatDate(stay.arrival)} – {formatDate(stay.departure)} · {nights(stay.arrival, stay.departure)} Nächte</p>
        {stay.room ? <p className="portal-muted">{stay.room}</p> : null}
        <p className="portal-stay__meta">
          <span>Buchung {stay.booking_ref}</span>
          {points ? <span className="portal-points">+{formatPoints(points)} Punkte</span> : null}
        </p>
      </div>
    </article>
  );
}
