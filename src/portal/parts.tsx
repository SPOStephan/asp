import { ArrowUpRight, Search } from 'lucide-react';
import { useState, type ComponentType, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { bookingUrl } from '../lib/availability';
import { canonicalOrigin } from '../site/renderSite';
import { hotelSiteUrl } from './hotelSite';
import { daysUntil, formatDate, formatPoints, nights, sized, hideBroken } from './format';
import type { Benefit, PortalHotel, ProgramSettings, Stay, Summary, Tier } from './types';

export function tierClass(id: string | undefined) {
  return `tier-${(id || 'classic').replace(/[^a-z0-9-]/gi, '').toLowerCase()}`;
}

export function sortedTiers(settings: ProgramSettings | null | undefined): Tier[] {
  return [...(settings?.tiers ?? [])].sort((a, b) => a.min_points - b.min_points);
}

// Line icon in a thin gold circle, as on the hotel websites.
export function IconCircle({ icon: Icon, small }: { icon: ComponentType<{ size?: number; strokeWidth?: number }>; small?: boolean }) {
  return (
    <span className={`portal-icon${small ? ' portal-icon--small' : ''}`} aria-hidden="true">
      <Icon size={small ? 18 : 24} strokeWidth={1.3} />
    </span>
  );
}

// Address of a hotel's website (its own domain first, as on the website itself).
export function hotelSite(hotel: PortalHotel) {
  return hotel.domains?.length ? canonicalOrigin(hotel.domains, '') : '';
}

// To a hotel website in the same tab; a signed-in member arrives signed in there too.
export function openHotelSite(event: MouseEvent<HTMLAnchorElement>) {
  const href = event.currentTarget.href;
  if (event.metaKey || event.ctrlKey || event.shiftKey) return;
  event.preventDefault();
  void hotelSiteUrl(href)
    .catch(() => href)
    .then((url) => window.location.assign(url));
}

// Uppercase link with the arrow in a circle (the websites' "Mehr erfahren" style).
export function ArrowLink({ to, href, site, children, light }: { to?: string; href?: string; site?: boolean; children: ReactNode; light?: boolean }) {
  const className = `portal-arrow${light ? ' portal-arrow--light' : ''}`;
  const inner = <>{children}<span className="portal-arrow__circle"><ArrowUpRight size={14} strokeWidth={1.5} /></span></>;
  if (to) return <Link to={to} className={className}>{inner}</Link>;
  if (site) return <a href={href} className={className} onClick={openHotelSite}>{inner}</a>;
  return <a href={href} className={className} target={href?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{inner}</a>;
}

// Where the member stands between the tiers: equal steps from tier to tier, like a status bar.
export function StatusTracker({ summary }: { summary: Summary }) {
  const tiers = sortedTiers(summary.program.settings);
  const points = summary.qualifying_points;
  const steps = Math.max(1, tiers.length - 1);
  const index = Math.max(0, tiers.findIndex((tier) => tier.id === summary.tier?.id));
  const next = tiers[index + 1];
  const within = next ? Math.min(1, Math.max(0, (points - tiers[index].min_points) / Math.max(1, next.min_points - tiers[index].min_points))) : 0;
  const share = tiers.length < 2 ? 100 : Math.min(100, ((index + within) / steps) * 100);
  const months = summary.program.settings.tier_window_months ?? 24;
  return (
    <div className="portal-tracker">
      <div className="portal-tracker__bar" role="img" aria-label={`${formatPoints(points)} Statuspunkte`}>
        <span className="portal-tracker__fill" style={{ width: `${share}%` }} />
        {tiers.map((tier, position) => (
          <span key={tier.id} className={`portal-tracker__mark${position <= index ? ' is-reached' : ''}`} style={{ left: `${(position / steps) * 100}%` }} />
        ))}
        <span className="portal-tracker__you" style={{ left: `${share}%` }} />
      </div>
      <ol className="portal-tracker__labels">
        {tiers.map((tier, position) => (
          <li key={tier.id} className={position === index ? 'is-current' : undefined} style={{ left: `${(position / steps) * 100}%` }}>
            <strong>{tier.name}</strong>
            <span>{tier.min_points ? `ab ${formatPoints(tier.min_points)}` : 'ab Start'}</span>
          </li>
        ))}
      </ol>
      <p className="portal-tracker__text">
        {next
          ? <>Noch <strong>{formatPoints(Math.max(0, next.min_points - points))} Punkte</strong> bis {next.name}</>
          : <>Sie haben die höchste Stufe erreicht.</>}
      </p>
      <p className="portal-muted portal-small">Für die Stufe zählen die Punkte der letzten {months} Monate – aktuell {formatPoints(points)}.</p>
    </div>
  );
}

// Half-circle gauge: how close the member is to the next reward.
export function Gauge({ share, children }: { share: number; children: ReactNode }) {
  const radius = 80;
  const length = Math.PI * radius;
  const filled = Math.max(0, Math.min(1, share)) * length;
  return (
    <div className="portal-gauge">
      <svg viewBox="0 0 200 112" aria-hidden="true">
        <path d="M 20 100 A 80 80 0 0 1 180 100" className="portal-gauge__track" />
        <path d="M 20 100 A 80 80 0 0 1 180 100" className="portal-gauge__fill" style={{ strokeDasharray: `${filled} ${length}` }} />
      </svg>
      <div className="portal-gauge__value">{children}</div>
    </div>
  );
}

export function rewardsFor(summary: Summary, benefits: Benefit[]) {
  const tiers = sortedTiers(summary.program.settings);
  const rank = (id: string) => tiers.findIndex((tier) => tier.id === id);
  const mine = rank(summary.tier?.id ?? '');
  const rewards = benefits.filter((item) => item.kind === 'reward' && item.points_cost).sort((a, b) => (a.points_cost ?? 0) - (b.points_cost ?? 0));
  const open = rewards.filter((item) => !item.min_tier || rank(item.min_tier) <= mine);
  return {
    available: open.filter((item) => (item.points_cost ?? 0) <= summary.balance),
    next: open.find((item) => (item.points_cost ?? 0) > summary.balance),
  };
}

export function NextReward({ summary, benefits }: { summary: Summary; benefits: Benefit[] }) {
  const { available, next } = rewardsFor(summary, benefits);
  if (!available.length && !next) {
    return <p className="portal-muted">Prämien zum Einlösen folgen in Kürze.</p>;
  }
  return (
    <>
      <Gauge share={next ? summary.balance / (next.points_cost ?? 1) : 1}>
        {next ? (
          <><strong>{formatPoints((next.points_cost ?? 0) - summary.balance)}</strong><span>Punkte bis zur nächsten Prämie</span></>
        ) : (
          <><strong>{available.length}</strong><span>Prämien sofort einlösbar</span></>
        )}
      </Gauge>
      <p className="portal-reward__title">
        {next ? <>Als Nächstes: <strong>{next.title}</strong></> : <>Zum Beispiel: <strong>{available[available.length - 1].title}</strong></>}
      </p>
      {available.length && next ? <p className="portal-muted portal-small">{available.length === 1 ? 'Eine Prämie' : `${available.length} Prämien`} können Sie schon jetzt einlösen.</p> : null}
    </>
  );
}

// Booking engine of the hotel with dates, guests and the member rate code.
export function memberBookingUrl(hotel: PortalHotel, settings: ProgramSettings, query?: { arrival: string | null; departure: string | null; adults: number }) {
  const base = hotel.booking_url || (hotelSite(hotel) ? `${hotelSite(hotel)}/#buchung` : '');
  if (!base) return '';
  const withStay = hotel.booking_url && query ? bookingUrl(base, { ...query, children: 0 }) ?? base : base;
  const code = settings.member_rate_code;
  if (!code) return withStay;
  try {
    const url = new URL(withStay);
    url.searchParams.set(settings.member_rate_param || 'code', code);
    return url.toString();
  } catch {
    return withStay;
  }
}

export function BookingSearch({ hotels, settings, favourite, title }: { hotels: PortalHotel[]; settings: ProgramSettings; favourite?: string | null; title?: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const [hotelId, setHotelId] = useState(favourite && hotels.some((hotel) => hotel.id === favourite) ? favourite : hotels[0]?.id ?? '');
  const [arrival, setArrival] = useState('');
  const [departure, setDeparture] = useState('');
  const [adults, setAdults] = useState(2);
  if (!hotels.length) return null;

  function submit(event: FormEvent) {
    event.preventDefault();
    const hotel = hotels.find((item) => item.id === hotelId) ?? hotels[0];
    const href = memberBookingUrl(hotel, settings, { arrival: arrival || null, departure: departure || null, adults });
    if (href) window.open(href, '_blank', 'noopener');
  }

  return (
    <form className="portal-search" onSubmit={submit}>
      {title ? <h2 className="heading portal-search__title">{title}</h2> : null}
      <div className="portal-search__fields">
        <label className="portal-search__hotel">
          <span>Hotel</span>
          <select value={hotelId} onChange={(event) => setHotelId(event.target.value)}>
            {hotels.map((hotel) => <option key={hotel.id} value={hotel.id}>{hotel.name}</option>)}
          </select>
        </label>
        <label>
          <span>Anreise</span>
          <input type="date" min={today} value={arrival} onChange={(event) => { setArrival(event.target.value); if (departure && departure <= event.target.value) setDeparture(''); }} />
        </label>
        <label>
          <span>Abreise</span>
          <input type="date" min={arrival || today} value={departure} onChange={(event) => setDeparture(event.target.value)} />
        </label>
        <label>
          <span>Gäste</span>
          <select value={adults} onChange={(event) => setAdults(Number(event.target.value))}>
            {[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count} {count === 1 ? 'Erwachsener' : 'Erwachsene'}</option>)}
          </select>
        </label>
        <button type="submit" className="portal-btn"><Search size={16} strokeWidth={1.6} /> Mitgliederpreis prüfen</button>
      </div>
      {settings.direct_bonus_percent ? <p className="portal-search__note">Direkt gebucht: {settings.direct_bonus_percent} % Bonuspunkte auf jeden Aufenthalt.</p> : null}
    </form>
  );
}

export function upcomingLabel(stay: Stay) {
  const days = daysUntil(stay.arrival);
  if (days < 0) return 'Gerade vor Ort';
  if (days === 0) return 'Heute';
  if (days === 1) return 'Morgen';
  return `In ${days} Tagen`;
}

export function StayCard({ stay, hotel, points }: { stay: Stay; hotel?: PortalHotel; points?: number }) {
  const upcoming = stay.status === 'booked' && daysUntil(stay.departure) >= 0;
  return (
    <article className={`portal-stay${stay.status === 'cancelled' ? ' is-cancelled' : ''}`}>
      <div className="portal-stay__picture">
        {hotel?.image ? <img src={sized(hotel.image, 800)} alt="" loading="lazy" onError={hideBroken} /> : null}
        {upcoming ? <span className="portal-stay__badge">{upcomingLabel(stay)}</span> : null}
      </div>
      <div className="portal-stay__body">
        <p className="portal-eyebrow">{stay.status === 'cancelled' ? 'Storniert' : upcoming ? 'Gebucht' : 'Aufenthalt'}</p>
        <h3 className="heading">{hotel?.name || stay.hotel_name}</h3>
        <p>{formatDate(stay.arrival)} – {formatDate(stay.departure)} · {nights(stay.arrival, stay.departure)} Nächte</p>
        {stay.room ? <p className="portal-muted">{stay.room}{stay.guests ? ` · ${stay.guests} ${stay.guests === 1 ? 'Gast' : 'Gäste'}` : ''}</p> : null}
        <p className="portal-stay__meta">
          <span>Buchung {stay.booking_ref}</span>
          {points ? <span className="portal-points">+{formatPoints(points)} Punkte</span> : null}
        </p>
      </div>
    </article>
  );
}

// The houses of the group, framed like a brand overview.
export function HotelsStrip({ hotels }: { hotels: PortalHotel[] }) {
  if (!hotels.length) return null;
  return (
    <section className="portal-brands" aria-label="Unsere Hotels">
      <p className="portal-brands__label">{hotels.length === 1 ? 'Unser Hotel' : `${hotels.length} Hotels · ein Programm`}</p>
      <ul>
        {hotels.map((hotel) => (
          <li key={hotel.id}>
            {hotelSite(hotel) ? <a href={hotelSite(hotel)} onClick={openHotelSite} className="heading">{hotel.name}</a> : <span className="heading">{hotel.name}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PortalFooter({ name, settings }: { name: string; settings: ProgramSettings | null | undefined }) {
  const links = [
    { href: settings?.terms_url, label: 'Teilnahmebedingungen' },
    { href: settings?.privacy_url, label: 'Datenschutz' },
    { href: settings?.imprint_url, label: 'Impressum' },
  ].filter((link) => link.href);
  return (
    <footer className="portal-footer">
      <div className="portal-footer__inner">
        <div>
          <p className="heading portal-footer__brand">{name}</p>
          <p className="portal-footer__text">Ihr Konto für Reisen, Punkte und Vorteile – im Browser und als App auf Ihrem Smartphone.</p>
        </div>
        <nav aria-label="Rechtliches">
          {settings?.contact_email ? <a href={`mailto:${settings.contact_email}`}>Kontakt</a> : null}
          {links.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}
        </nav>
      </div>
      <p className="portal-footer__fine">© {new Date().getFullYear()} {name}</p>
    </footer>
  );
}
