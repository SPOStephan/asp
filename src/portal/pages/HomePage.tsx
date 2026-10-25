import { CircleHelp, CreditCard, MailQuestion, Smartphone, UserRound, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatPoints, formatShort, nights, sized, hideBroken } from '../format';
import { usePortal } from '../PortalData';
import { ArrowLink, BookingSearch, HotelsStrip, IconCircle, NextReward, StatusTracker, sortedTiers, tierClass, upcomingLabel } from '../parts';
import type { Member } from '../types';

type InstallPrompt = Event & { prompt: () => Promise<void> };

// Browsers that can install the portal as an app announce it once; the button uses that.
function useInstallPrompt() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  useEffect(() => {
    const keep = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    window.addEventListener('beforeinstallprompt', keep);
    return () => window.removeEventListener('beforeinstallprompt', keep);
  }, []);
  return prompt;
}

function profileShare(member: Member) {
  const fields = [member.first_name, member.last_name, member.phone, member.birthday, member.favourite_hotel_id];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

export function HomePage() {
  const { summary, stays, hotels, ledger, benefits } = usePortal();
  const install = useInstallPrompt();
  const [installHint, setInstallHint] = useState(false);
  if (!summary) return null;
  const today = new Date().toISOString().slice(0, 10);
  const next = [...stays].filter((stay) => stay.status === 'booked' && stay.departure >= today).sort((a, b) => a.arrival.localeCompare(b.arrival))[0];
  const hotelOf = (id: string | null) => hotels.find((hotel) => hotel.id === id);
  const member = summary.member;
  const settings = summary.program.settings;
  const stats = summary.stats;
  const favourite = hotelOf(member.favourite_hotel_id);
  const bandPicture = favourite?.image || hotels.find((hotel) => hotel.image)?.image || '';
  const tiers = sortedTiers(settings);
  const myRank = tiers.findIndex((tier) => tier.id === summary.tier?.id);
  const myPerks = benefits.filter((item) => item.kind !== 'reward' && (!item.min_tier || (tiers.findIndex((tier) => tier.id === item.min_tier) <= myRank && tiers.findIndex((tier) => tier.id === item.min_tier) >= 0)));
  const offers = benefits.filter((item) => item.image && item.kind !== 'reward').slice(0, 2);
  const share = profileShare(member);
  const contact = settings.contact_email;
  const number = member.member_number.replace(/(\d{4})(?=\d)/g, '$1 ');

  return (
    <>
      <section className={`portal-account ${tierClass(summary.tier?.id)}`}>
        {bandPicture ? <img className="portal-account__picture" src={sized(bandPicture, 1800)} alt="" onError={hideBroken} /> : null}
        <div className="portal-account__inner">
          <div className="portal-account__who">
            <p className="portal-account__hello">Hallo {member.first_name || 'und willkommen'},</p>
            <h1 className="heading">{summary.tier?.name ?? 'Mitglied'}<span>-Mitglied</span></h1>
            <p className="portal-account__number">Mitglied Nr. {number} · seit {new Date(member.created_at).getFullYear()}</p>
            {stats && stats.stays ? (
              <ul className="portal-account__stats">
                <li><strong>{stats.stays}</strong> {stats.stays === 1 ? 'Aufenthalt' : 'Aufenthalte'}</li>
                <li><strong>{stats.nights}</strong> {stats.nights === 1 ? 'Nacht' : 'Nächte'}</li>
                <li><strong>{stats.hotels}</strong> {stats.hotels === 1 ? 'Hotel' : 'Hotels'}</li>
              </ul>
            ) : null}
          </div>
          <div className="portal-account__points">
            <p className="portal-account__label">Ihre Punkte</p>
            <p className="portal-account__balance">{formatPoints(summary.balance)}</p>
            <Link to="/vorteile" className="portal-btn portal-btn--light portal-btn--small">Punkte einlösen</Link>
            <Link to="/karte" className="portal-account__link">Mitgliedskarte zeigen</Link>
          </div>
        </div>
      </section>

      <div className="portal-page">
        {next ? (
          <section className="portal-next" aria-label="Ihre nächste Reise">
            <div className="portal-next__picture">
              {hotelOf(next.hotel_id)?.image ? <img src={sized(hotelOf(next.hotel_id)!.image, 1200)} alt="" onError={hideBroken} /> : null}
              <span className="portal-next__badge">{upcomingLabel(next)}</span>
            </div>
            <div className="portal-next__body">
              <p className="portal-eyebrow">Ihre nächste Reise</p>
              <h2 className="heading">{hotelOf(next.hotel_id)?.name || next.hotel_name}</h2>
              <p className="portal-next__dates">{formatDate(next.arrival)} – {formatDate(next.departure)}</p>
              <p className="portal-muted">{nights(next.arrival, next.departure)} Nächte{next.room ? ` · ${next.room}` : ''}{next.guests ? ` · ${next.guests} ${next.guests === 1 ? 'Gast' : 'Gäste'}` : ''}</p>
              <p className="portal-muted portal-small">Buchungsnummer {next.booking_ref}</p>
              <div className="portal-next__links">
                <ArrowLink to="/reisen">Alle Reisen</ArrowLink>
                {hotelOf(next.hotel_id)?.domains[0] ? <ArrowLink href={`https://${hotelOf(next.hotel_id)!.domains[0]}`}>Zum Hotel</ArrowLink> : null}
              </div>
            </div>
          </section>
        ) : null}

        <BookingSearch hotels={hotels} settings={settings} favourite={member.favourite_hotel_id} title="Nächste Reise buchen" />

        <div className="portal-duo">
          <section className="portal-panel">
            <header className="portal-panel__head"><h2 className="heading">Ihr Status</h2></header>
            <div className="portal-panel__body">
              <p className="portal-panel__tier heading">{summary.tier?.name ?? 'Mitglied'}</p>
              <StatusTracker summary={summary} />
              {myPerks.length ? (
                <ul className="portal-perks">
                  {myPerks.slice(0, 4).map((perk) => <li key={perk.id}><Check size={15} strokeWidth={1.8} />{perk.title}</li>)}
                </ul>
              ) : null}
              <ArrowLink to="/vorteile">Alle Vorteile</ArrowLink>
            </div>
          </section>
          <section className="portal-panel">
            <header className="portal-panel__head"><h2 className="heading">Ihre Prämien</h2></header>
            <div className="portal-panel__body portal-panel__body--center">
              <NextReward summary={summary} benefits={benefits} />
              <Link to="/vorteile" className="portal-btn portal-btn--small">Prämien ansehen</Link>
            </div>
          </section>
        </div>

        <section className="portal-welcome">
          {bandPicture ? <img className="portal-welcome__picture" src={sized(hotels.find((hotel) => hotel.image && hotel.image !== bandPicture)?.image || bandPicture, 1600)} alt="" loading="lazy" onError={hideBroken} /> : null}
          <h2 className="heading portal-welcome__title">Schön, dass Sie dabei sind</h2>
          <div className="portal-welcome__cards">
            <Link to="/profil" className="portal-welcome__card">
              <UserRound size={22} strokeWidth={1.3} />
              <p>{share < 100 ? `Ihr Profil ist zu ${share} % ausgefüllt – mit Geburtstag und Lieblingshotel können wir Sie noch persönlicher begrüßen.` : 'Ihr Profil ist vollständig. Danke!'}</p>
              <span>{share < 100 ? 'Profil vervollständigen' : 'Profil ansehen'}</span>
            </Link>
            <Link to="/karte" className="portal-welcome__card">
              <CreditCard size={22} strokeWidth={1.3} />
              <p>Zeigen Sie Ihre digitale Mitgliedskarte beim Check-in – so landen alle Punkte sicher auf Ihrem Konto.</p>
              <span>Mitgliedskarte</span>
            </Link>
            <button
              type="button"
              className="portal-welcome__card"
              onClick={() => (install ? void install.prompt() : setInstallHint(!installHint))}
            >
              <Smartphone size={22} strokeWidth={1.3} />
              <p>{installHint ? 'iPhone: Teilen-Symbol, dann „Zum Home-Bildschirm“. Android: Menü, dann „App installieren“.' : 'Ihr Konto als App: Buchungen, Karte und Punkte immer dabei – auch ohne Netz.'}</p>
              <span>Als App installieren</span>
            </button>
          </div>
        </section>

        {offers.length ? (
          <section className="portal-section">
            <div className="portal-section__head">
              <h2 className="heading">Exklusiv für Mitglieder</h2>
              <ArrowLink to="/vorteile">Alle Vorteile</ArrowLink>
            </div>
            <div className="portal-offers portal-offers--two">
              {offers.map((offer) => (
                <article key={offer.id} className="portal-offer">
                  <div className="portal-offer__picture"><img src={sized(offer.image, 1000)} alt="" loading="lazy" onError={hideBroken} /></div>
                  <div className="portal-offer__body">
                    <p className="portal-eyebrow">{offer.kind === 'rate' ? 'Mitgliederpreis' : 'Ihr Vorteil'}</p>
                    <h3 className="heading">{offer.title}</h3>
                    {offer.description ? <p>{offer.description}</p> : null}
                    {offer.kind === 'rate' ? <ArrowLink to="/buchen">Jetzt buchen</ArrowLink> : <ArrowLink to="/vorteile">Mehr erfahren</ArrowLink>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {ledger.length ? (
          <section className="portal-section">
            <div className="portal-section__head">
              <h2 className="heading">Ihr Punktekonto</h2>
              {settings.points_valid_months ? <span className="portal-muted portal-small">Punkte gelten {settings.points_valid_months} Monate</span> : null}
            </div>
            <ul className="portal-ledger">
              {ledger.slice(0, 5).map((row) => (
                <li key={row.id}>
                  <span>{row.reason}<small>{formatShort(row.created_at)}</small></span>
                  <strong className={row.points < 0 ? 'is-minus' : undefined}>{row.points > 0 ? '+' : ''}{formatPoints(row.points)}</strong>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="portal-help" aria-label="Hilfe">
          {contact ? (
            <a href={`mailto:${contact}?subject=${encodeURIComponent(`Fehlende Punkte – Mitglied ${member.member_number}`)}`}>
              <IconCircle icon={MailQuestion} small />
              <strong>Fehlen Punkte?</strong>
              <span>Sagen Sie uns Bescheid</span>
            </a>
          ) : null}
          {contact ? (
            <a href={`mailto:${contact}?subject=${encodeURIComponent(`Frage zum Programm – Mitglied ${member.member_number}`)}`}>
              <IconCircle icon={CircleHelp} small />
              <strong>Haben Sie Fragen?</strong>
              <span>Kontakt</span>
            </a>
          ) : null}
          <Link to="/karte">
            <IconCircle icon={CreditCard} small />
            <strong>Beim Check-in</strong>
            <span>Mitgliedskarte zeigen</span>
          </Link>
          <Link to="/profil">
            <IconCircle icon={UserRound} small />
            <strong>Ihre Daten</strong>
            <span>Profil &amp; Einstellungen</span>
          </Link>
        </section>

        <HotelsStrip hotels={hotels} />
      </div>
    </>
  );
}
