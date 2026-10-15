import { sized, hideBroken } from '../format';
import { usePortal } from '../PortalData';
import type { PortalHotel } from '../types';

// The hotel's booking engine with the member rate code, if the programme has one.
function memberBookingUrl(hotel: PortalHotel, code?: string, param?: string) {
  const base = hotel.booking_url || (hotel.domains[0] ? `https://${hotel.domains[0]}/#buchung` : '');
  if (!base || !code) return base;
  try {
    const url = new URL(base);
    url.searchParams.set(param || 'code', code);
    return url.toString();
  } catch {
    return base;
  }
}

export function BookPage() {
  const { hotels, summary } = usePortal();
  const settings = summary?.program.settings ?? {};
  const code = settings.member_rate_code;
  const favourite = summary?.member.favourite_hotel_id;
  const sorted = [...hotels].sort((a, b) => Number(b.id === favourite) - Number(a.id === favourite));

  return (
    <div className="portal-page">
      <h1 className="heading portal-title">Buchen zum Mitgliederpreis</h1>
      <p className="portal-lead">
        Als Mitglied buchen Sie direkt bei uns zu Vorzugskonditionen und sammeln die vollen Punkte
        {settings.direct_bonus_percent ? ` – plus ${settings.direct_bonus_percent} % Bonus für Direktbuchungen` : ''}.
        {code ? <> Ihr Mitgliedercode <strong className="portal-inline-code">{code}</strong> ist beim Buchen schon eingetragen.</> : null}
      </p>
      <div className="portal-hotels">
        {sorted.map((hotel) => {
          const href = memberBookingUrl(hotel, code, settings.member_rate_param);
          return (
            <article key={hotel.id} className="portal-hotel">
              <div className="portal-hotel__picture">{hotel.image ? <img src={sized(hotel.image, 800)} alt="" loading="lazy" onError={hideBroken} /> : null}</div>
              <div className="portal-hotel__body">
                {hotel.id === favourite ? <p className="portal-eyebrow">Ihr Lieblingshotel</p> : null}
                <h2 className="heading">{hotel.name}</h2>
                {hotel.address ? <p className="portal-muted">{hotel.address}</p> : null}
                <div className="portal-hotel__actions">
                  {href ? <a className="portal-btn portal-btn--small" href={href} target="_blank" rel="noreferrer">Verfügbarkeit prüfen</a> : null}
                  {hotel.domains[0] ? <a className="portal-link" href={`https://${hotel.domains[0]}`} target="_blank" rel="noreferrer">Zur Website</a> : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
