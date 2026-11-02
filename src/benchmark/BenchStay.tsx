import { ConciergeButton } from '../concierge/ConciergeButton';
import { formatGuestSummary, type AvailabilityQuery } from '../lib/availability';

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

// "2 Nov 2026": the day strong, month and year light – like a caption, without fields.
function StayDate({ value, placeholder }: { value: string | null; placeholder: string }) {
  if (!value) return <span className="bench-stay__empty">{placeholder}</span>;
  const [year, month, day] = value.split('-').map(Number);
  return (
    <span className="bench-stay__date">
      <b>{day}</b> {MONTHS[month - 1]} {year}
    </span>
  );
}

export function BenchStay({
  query,
  open,
  onToggle,
  guestsId,
  datesId,
  inquiry,
}: {
  query: AvailabilityQuery;
  open: 'dates' | 'guests' | null;
  onToggle: (layer: 'dates' | 'guests') => void;
  guestsId: string;
  datesId: string;
  inquiry: { label: string; href: string } | null;
}) {
  return (
    <div className="bench-stay">
      <button
        type="button"
        id={guestsId}
        className={`bench-stay__pick${open === 'guests' ? ' is-open' : ''}`}
        aria-expanded={open === 'guests'}
        aria-haspopup="dialog"
        aria-label={`Zahl der Gäste: ${formatGuestSummary(query.adults, query.children)}`}
        onClick={() => onToggle('guests')}
      >
        <span className="bench-stay__date">
          <b>{query.adults}</b> {query.adults === 1 ? 'Erwachsener' : 'Erwachsene'}
          {query.children ? (
            <>
              {' · '}
              <b>{query.children}</b> {query.children === 1 ? 'Kind' : 'Kinder'}
            </>
          ) : null}
        </span>
      </button>
      <button
        type="button"
        id={datesId}
        className={`bench-stay__pick${open === 'dates' ? ' is-open' : ''}`}
        aria-expanded={open === 'dates'}
        aria-haspopup="dialog"
        aria-label="Reisezeitraum wählen"
        onClick={() => onToggle('dates')}
      >
        <StayDate value={query.arrival} placeholder="Anreise" />
        <span className="bench-stay__dash" aria-hidden="true">–</span>
        <StayDate value={query.departure} placeholder="Abreise" />
      </button>
      <button type="submit" className={`bench-stay__book${inquiry?.href ? '' : ' bench-stay__book--solid'}`}>
        Buchen
      </button>
      {inquiry?.href ? (
        <a className="bench-stay__ask" href={inquiry.href}>
          {inquiry.label}
        </a>
      ) : null}
      <span className="bench-stay__chat">
        <ConciergeButton />
      </span>
    </div>
  );
}
