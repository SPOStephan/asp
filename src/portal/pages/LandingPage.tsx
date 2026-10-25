import { BadgePercent, Crown, Gift, Smartphone, Sparkles, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPoints, sized, hideBroken } from '../format';
import { useProgramName } from '../PortalApp';
import { usePortal } from '../PortalData';
import { ArrowLink, HotelsStrip, IconCircle, PortalFooter, sortedTiers, hotelSite } from '../parts';
import { LoginForm } from './AuthPages';

// Start page before login: what membership brings, the tiers, the hotels – and the login.
export function LandingPage() {
  const { hotels, info } = usePortal();
  const name = useProgramName();
  const settings = info?.settings ?? null;
  const tiers = sortedTiers(settings);
  const benefits = info?.benefits ?? [];
  const pictures = hotels.map((hotel) => hotel.image).filter(Boolean);
  const hero = pictures[0] ?? '';

  const reasons: Array<{ icon: LucideIcon; title: string; text: string }> = [
    {
      icon: Sparkles,
      title: 'Punkte sammeln',
      text: settings?.points_per_euro
        ? `${formatPoints(settings.points_per_euro)} ${settings.points_per_euro === 1 ? 'Punkt' : 'Punkte'} pro Euro – bei jedem Aufenthalt in allen Häusern.`
        : 'Bei jedem Aufenthalt in allen Häusern der Gruppe.',
    },
    {
      icon: BadgePercent,
      title: 'Mitgliederpreis',
      text: settings?.direct_bonus_percent
        ? `Direkt gebucht gibt es den besten Preis und ${settings.direct_bonus_percent} % Bonuspunkte obendrauf.`
        : 'Direkt gebucht immer zum besten Preis.',
    },
    { icon: Crown, title: 'Status-Vorteile', text: tiers.length > 1 ? `${tiers.map((tier) => tier.name).join(', ')} – je höher die Stufe, desto mehr Extras.` : 'Je öfter Sie kommen, desto mehr Extras.' },
    { icon: Gift, title: 'Prämien einlösen', text: 'Wellness, Genuss oder eine geschenkte Nacht – Sie entscheiden.' },
    { icon: Smartphone, title: 'Alles in einer App', text: 'Buchungen, Mitgliedskarte und Punkte immer dabei.' },
  ];

  // Perks a tier includes: those without a minimum tier and those of this tier or below.
  const rankOf = (id: string) => tiers.findIndex((tier) => tier.id === id);
  const tierPerks = (index: number) =>
    benefits.filter((item) => item.kind !== 'reward' && (!item.min_tier || (rankOf(item.min_tier) >= 0 && rankOf(item.min_tier) <= index)));
  const rewards = benefits.filter((item) => item.kind === 'reward');

  return (
    <div className="portal portal--public">
      <header className="portal-top portal-top--public">
        <div className="portal-top__inner">
          <Link to="/" className="portal-top__brand heading">{name}</Link>
          <div className="portal-top__side">
            <Link to="/anmelden" className="portal-top__login">Anmelden</Link>
            <Link to="/registrieren" className="portal-btn portal-btn--small">Mitglied werden</Link>
          </div>
        </div>
      </header>

      <section className="portal-hero">
        {hero ? <img className="portal-hero__picture" src={sized(hero, 2000)} alt="" onError={hideBroken} /> : null}
        <div className="portal-hero__inner">
          <div className="portal-hero__text">
            <p className="portal-hero__eyebrow">{name}</p>
            <h1 className="heading">Mehr erleben. <em>Bei jedem Aufenthalt.</em></h1>
            <p>Punkte sammeln, exklusive Vorteile genießen und zum Mitgliederpreis buchen – in {hotels.length > 1 ? `allen ${hotels.length} Hotels` : 'allen Hotels'} der Gruppe.</p>
            <Link to="/registrieren" className="portal-btn">Kostenlos Mitglied werden</Link>
          </div>
          <div className="portal-hero__login">
            <h2 className="heading">Willkommen zurück</h2>
            <LoginForm compact />
          </div>
        </div>
      </section>

      <section className="portal-band portal-band--intro">
        <h2 className="heading portal-band__title">Mit dem Mitgliederpreis <em>noch mehr entdecken</em></h2>
        <p className="portal-band__lead">Als Mitglied buchen Sie direkt bei uns zum besten Preis und werden für jeden Aufenthalt belohnt. Die Mitgliedschaft ist kostenlos.</p>
        <ul className="portal-reasons">
          {reasons.map((reason) => (
            <li key={reason.title}>
              <IconCircle icon={reason.icon} />
              <h3 className="portal-reasons__title">{reason.title}</h3>
              <p>{reason.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {tiers.length ? (
        <section className="portal-band portal-band--sand">
          <p className="portal-eyebrow portal-center">Ihre Stufen</p>
          <h2 className="heading portal-band__title">Je öfter Sie kommen, <em>desto schöner wird es</em></h2>
          <div className="portal-tiers">
            {tiers.map((tier, index) => {
              const perks = tierPerks(index);
              return (
                <article key={tier.id} className={`portal-tier ${index === tiers.length - 1 ? 'portal-tier--top' : ''}`}>
                  <p className="portal-eyebrow">{tier.min_points ? `ab ${formatPoints(tier.min_points)} Punkten` : 'ab dem ersten Tag'}</p>
                  <h3 className="heading">{tier.name}</h3>
                  {perks.length ? (
                    <ul>{perks.map((perk) => <li key={perk.id}>{perk.title}</li>)}</ul>
                  ) : (
                    <p className="portal-muted">{index ? 'Zusätzliche Extras für Stammgäste.' : 'Punkte sammeln und Prämien einlösen.'}</p>
                  )}
                </article>
              );
            })}
          </div>
          {settings?.tier_window_months ? <p className="portal-muted portal-center portal-small">Für die Stufe zählen die Punkte der letzten {settings.tier_window_months} Monate.</p> : null}
        </section>
      ) : null}

      {rewards.length ? (
        <section className="portal-band">
          <p className="portal-eyebrow portal-center">Prämien</p>
          <h2 className="heading portal-band__title">Ihre Punkte, <em>Ihre Wahl</em></h2>
          <div className="portal-offers">
            {rewards.slice(0, 3).map((reward) => (
              <article key={reward.id} className="portal-offer">
                <div className="portal-offer__picture">{reward.image ? <img src={sized(reward.image, 900)} alt="" loading="lazy" onError={hideBroken} /> : null}</div>
                <div className="portal-offer__body">
                  <p className="portal-eyebrow">{formatPoints(reward.points_cost ?? 0)} Punkte</p>
                  <h3 className="heading">{reward.title}</h3>
                  {reward.description ? <p>{reward.description}</p> : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {hotels.length ? (
        <section className="portal-band portal-band--sand">
          <p className="portal-eyebrow portal-center">Unsere Hotels</p>
          <h2 className="heading portal-band__title">{hotels.length > 1 ? <>{hotels.length} Hotels. <em>Ein Programm.</em></> : <>Ein Hotel. <em>Viele Vorteile.</em></>}</h2>
          <div className="portal-houses">
            {hotels.map((hotel) => (
              <article key={hotel.id} className="portal-house">
                <div className="portal-house__picture">{hotel.image ? <img src={sized(hotel.image, 900)} alt="" loading="lazy" onError={hideBroken} /> : null}</div>
                <div className="portal-house__body">
                  <h3 className="heading">{hotel.name}</h3>
                  {hotel.address ? <p className="portal-muted">{hotel.address}</p> : null}
                  {hotelSite(hotel) ? <ArrowLink href={hotelSite(hotel)} site>Hotel entdecken</ArrowLink> : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="portal-cta">
        <h2 className="heading">Werden Sie Teil von {name}</h2>
        <p>In einer Minute registriert – Ihre bisherigen Aufenthalte mit derselben E-Mail-Adresse holen wir automatisch auf Ihr Konto.</p>
        <div className="portal-cta__actions">
          <Link to="/registrieren" className="portal-btn">Kostenlos Mitglied werden</Link>
          <Link to="/anmelden" className="portal-btn portal-btn--light">Anmelden</Link>
        </div>
      </section>

      <div className="portal-main portal-main--flush"><HotelsStrip hotels={hotels} /></div>
      <PortalFooter name={name} settings={settings} />
    </div>
  );
}
