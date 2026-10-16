import { useState } from 'react';
import { StayCard } from '../parts';
import { usePortal } from '../PortalData';

export function TripsPage() {
  const { stays, hotels, ledger, summary } = usePortal();
  const [tab, setTab] = useState<'next' | 'past'>('next');
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = stays.filter((stay) => stay.status === 'booked' && stay.departure >= today).sort((a, b) => a.arrival.localeCompare(b.arrival));
  const past = stays.filter((stay) => !upcoming.includes(stay));
  const list = tab === 'next' ? upcoming : past;
  const pointsOf = new Map(ledger.filter((row) => row.points > 0 && row.stay_id).map((row) => [row.stay_id, row.points]));
  const contact = summary?.program.settings.contact_email;

  return (
    <div className="portal-page">
      <h1 className="heading portal-title">Meine Reisen</h1>
      <div className="portal-tabs-inline" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'next'} onClick={() => setTab('next')}>Geplant ({upcoming.length})</button>
        <button type="button" role="tab" aria-selected={tab === 'past'} onClick={() => setTab('past')}>Vergangen ({past.length})</button>
      </div>
      <div className="portal-list">
        {list.map((stay) => {
          const hotel = hotels.find((item) => item.id === stay.hotel_id);
          return <StayCard key={stay.id} stay={stay} hotel={hotel} points={pointsOf.get(stay.id)} />;
        })}
        {!list.length ? <p className="portal-card portal-empty">{tab === 'next' ? 'Keine geplanten Reisen.' : 'Noch keine vergangenen Aufenthalte.'}</p> : null}
      </div>
      <p className="portal-muted portal-note">
        Fehlt eine Reise? Aufenthalte erscheinen automatisch, wenn sie mit Ihrer E-Mail-Adresse gebucht wurden.
        {contact ? <> Sonst schreiben Sie uns an <a href={`mailto:${contact}`}>{contact}</a> mit Ihrer Buchungsnummer.</> : null}
      </p>
    </div>
  );
}
