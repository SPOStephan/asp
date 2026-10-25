import { sized, hideBroken } from '../format';
import { usePortal } from '../PortalData';
import { ArrowLink, BookingSearch, memberBookingUrl } from '../parts';

export function BookPage() {
  const { hotels, summary } = usePortal();
  const settings = summary?.program.settings ?? {};
  const code = settings.member_rate_code;
  const favourite = summary?.member.favourite_hotel_id;
  const sorted = [...hotels].sort((a, b) => Number(b.id === favourite) - Number(a.id === favourite));

  return (
    <div className="portal-page">
      <p className="portal-eyebrow">Buchen</p>
      <h1 className="heading portal-title">Zum Mitgliederpreis <em>direkt bei uns</em></h1>
      <p className="portal-lead">
        Als Mitglied buchen Sie direkt bei uns zu Vorzugskonditionen und sammeln die vollen Punkte
        {settings.direct_bonus_percent ? ` – plus ${settings.direct_bonus_percent} % Bonus für Direktbuchungen` : ''}.
        {code ? <> Ihr Mitgliedercode <strong className="portal-inline-code">{code}</strong> ist beim Buchen schon eingetragen.</> : null}
      </p>
      <BookingSearch hotels={hotels} settings={settings} favourite={favourite} />
      <div className="portal-hotels">
        {sorted.map((hotel) => {
          const href = memberBookingUrl(hotel, settings);
          return (
            <article key={hotel.id} className="portal-hotel">
              <div className="portal-hotel__picture">{hotel.image ? <img src={sized(hotel.image, 800)} alt="" loading="lazy" onError={hideBroken} /> : null}</div>
              <div className="portal-hotel__body">
                {hotel.id === favourite ? <p className="portal-eyebrow">Ihr Lieblingshotel</p> : null}
                <h2 className="heading">{hotel.name}</h2>
                {hotel.address ? <p className="portal-muted">{hotel.address}</p> : null}
                <div className="portal-hotel__actions">
                  {href ? <a className="portal-btn portal-btn--small" href={href} target="_blank" rel="noreferrer">Verfügbarkeit prüfen</a> : null}
                  {hotel.domains[0] ? <ArrowLink href={`https://${hotel.domains[0]}`}>Zur Website</ArrowLink> : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
