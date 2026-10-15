import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPoints, formatShort, greeting } from '../format';
import { StampCard, StayCard, TierProgress, tierClass } from '../parts';
import { usePortal } from '../PortalData';

export function HomePage() {
  const { summary, stays, hotels, ledger, benefits } = usePortal();
  if (!summary) return null;
  const today = new Date().toISOString().slice(0, 10);
  const next = [...stays].filter((stay) => stay.status === 'booked' && stay.departure >= today).sort((a, b) => a.arrival.localeCompare(b.arrival))[0];
  const hotelOf = (id: string | null) => hotels.find((hotel) => hotel.id === id);
  const member = summary.member;

  return (
    <div className="portal-page">
      <header className="portal-hello">
        <p className="portal-eyebrow">{greeting()}</p>
        <h1 className="heading">{member.first_name || 'Willkommen'}</h1>
      </header>

      <section className={`portal-status ${tierClass(summary.tier?.id)}`}>
        <div>
          <p className="portal-eyebrow">Ihre Stufe</p>
          <p className="portal-status__tier heading">{summary.tier?.name ?? 'Mitglied'}</p>
        </div>
        <div className="portal-status__points">
          <strong>{formatPoints(summary.balance)}</strong>
          <span>Punkte</span>
        </div>
        <TierProgress summary={summary} />
      </section>

      <section className="portal-section">
        <div className="portal-section__head">
          <h2 className="heading">Ihre nächste Reise</h2>
          <Link to="/reisen">Alle Reisen <ArrowRight size={14} /></Link>
        </div>
        {next ? (
          <StayCard stay={next} hotel={hotelOf(next.hotel_id)} />
        ) : (
          <div className="portal-card portal-empty">
            <p>Gerade ist keine Reise geplant.</p>
            <Link to="/buchen" className="portal-btn">Zum Mitgliederpreis buchen</Link>
          </div>
        )}
      </section>

      <StampCard summary={summary} />

      <section className="portal-section">
        <div className="portal-section__head">
          <h2 className="heading">Für Sie</h2>
          <Link to="/vorteile">Alle Vorteile <ArrowRight size={14} /></Link>
        </div>
        <div className="portal-chips">
          {benefits.slice(0, 4).map((benefit) => (
            <Link key={benefit.id} to="/vorteile" className="portal-chip">
              <strong>{benefit.title}</strong>
              <span>{benefit.points_cost ? `${formatPoints(benefit.points_cost)} Punkte` : 'inklusive'}</span>
            </Link>
          ))}
        </div>
      </section>

      {ledger.length ? (
        <section className="portal-section">
          <h2 className="heading">Punktekonto</h2>
          <ul className="portal-ledger">
            {ledger.slice(0, 6).map((row) => (
              <li key={row.id}>
                <span>{row.reason}<small>{formatShort(row.created_at)}</small></span>
                <strong className={row.points < 0 ? 'is-minus' : undefined}>{row.points > 0 ? '+' : ''}{formatPoints(row.points)}</strong>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
