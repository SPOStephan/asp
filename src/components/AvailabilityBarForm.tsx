import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronDown, Gift, Mail, MapPin, Phone, Search, Users } from 'lucide-react';
import { AiChatIcon } from './AiChatIcon';
import { AvailabilityBarFormLegacy } from './AvailabilityBarFormLegacy';
import { AvailabilityDateLayer } from './AvailabilityDateLayer';
import { AvailabilityGuestsLayer } from './AvailabilityGuestsLayer';
import { useHotel } from '../context/HotelContext';
import {
  AVAILABILITY_UI_MODE,
  createAvailabilityQuery,
  formatGuestSummary,
  formatStaySummary,
  nextDateSelection,
  startOfMonth,
  toBookingParams,
} from '../lib/availability';

interface AvailabilityBarFormProps {
  idPrefix?: string;
}

type OpenLayer = 'dates' | 'guests' | null;

function AvailabilityBarFormModern({ idPrefix = '' }: AvailabilityBarFormProps) {
  const hotel = useHotel();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState<OpenLayer>(null);
  const [query, setQuery] = useState(createAvailabilityQuery);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const phoneHref = hotel?.phone ? `tel:${hotel.phone.replace(/\s/g, '')}` : '#';
  const mailHref = hotel?.email ? `mailto:${hotel.email}` : '#';
  const guestsId = `${idPrefix}guests-trigger`;
  const datesId = `${idPrefix}dates-trigger`;

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!formRef.current?.contains(event.target as Node)) {
        setOpen(null);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null);
    };
    window.addEventListener('mousedown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (layer: Exclude<OpenLayer, null>) => {
    setOpen((current) => (current === layer ? null : layer));
  };

  return (
    <form
      ref={formRef}
      className="availability-bar__form availability-bar__form--modern"
      onSubmit={(event) => {
        event.preventDefault();
        toBookingParams(query);
        setOpen(null);
      }}
    >
      {open === 'dates' ? (
        <AvailabilityDateLayer
          arrival={query.arrival}
          departure={query.departure}
          viewMonth={viewMonth}
          onViewMonthChange={setViewMonth}
          onSelect={(key) => {
            setQuery((current) => ({ ...current, ...nextDateSelection(current, key) }));
          }}
          onClear={() => setQuery((current) => ({ ...current, arrival: null, departure: null }))}
          onApply={() => setOpen(null)}
        />
      ) : null}

      {open === 'guests' ? (
        <AvailabilityGuestsLayer
          rooms={query.rooms}
          onChange={(rooms) => setQuery((current) => ({ ...current, rooms }))}
          onApply={() => setOpen(null)}
        />
      ) : null}

      <input type="hidden" name="arrival" value={query.arrival ?? ''} />
      <input type="hidden" name="departure" value={query.departure ?? ''} />
      <input type="hidden" name="rooms" value={String(query.rooms.length)} />

      <div className="availability-bar__pickers">
        <button
          type="button"
          id={guestsId}
          className={`availability-bar__picker${open === 'guests' ? ' is-open' : ''}`}
          aria-expanded={open === 'guests'}
          aria-haspopup="dialog"
          onClick={() => toggle('guests')}
        >
          <span className="availability-bar__picker-icon" aria-hidden="true">
            <Users size={18} strokeWidth={1.5} />
          </span>
          <span className="availability-bar__picker-copy">
            <span className="availability-bar__picker-label">Zahl der Gäste</span>
            <span className="availability-bar__picker-value">{formatGuestSummary(query.rooms)}</span>
          </span>
          <ChevronDown
            className="availability-bar__picker-chevron"
            size={16}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          id={datesId}
          className={`availability-bar__picker${open === 'dates' ? ' is-open' : ''}`}
          aria-expanded={open === 'dates'}
          aria-haspopup="dialog"
          onClick={() => toggle('dates')}
        >
          <span className="availability-bar__picker-icon" aria-hidden="true">
            <Calendar size={18} strokeWidth={1.5} />
          </span>
          <span className="availability-bar__picker-copy">
            <span className="availability-bar__picker-label">Reisezeitraum</span>
            <span className="availability-bar__picker-value">
              {formatStaySummary(query.arrival, query.departure)}
            </span>
          </span>
          <ChevronDown
            className="availability-bar__picker-chevron"
            size={16}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </button>
      </div>

      <button type="submit" className="availability-bar__btn">
        <Search size={16} strokeWidth={1.5} />
        Verfügbarkeit prüfen
      </button>
      <div className="availability-bar__tools" aria-label="Schnelle Kontakte">
        <a className="availability-bar__tool" href="#" aria-label="Geschenkgutscheine">
          <Gift size={18} strokeWidth={1.5} />
        </a>
        <a className="availability-bar__tool" href={mailHref} aria-label="E-Mail schreiben">
          <Mail size={18} strokeWidth={1.5} />
        </a>
        <a className="availability-bar__tool" href={phoneHref} aria-label="Anrufen">
          <Phone size={18} strokeWidth={1.5} />
        </a>
        <a className="availability-bar__tool" href="#anreise" aria-label="Anreise und Lage">
          <MapPin size={18} strokeWidth={1.5} />
        </a>
      </div>
      <button type="button" className="availability-bar__chat" aria-label="Frage stellen">
        <AiChatIcon />
      </button>
    </form>
  );
}

export function AvailabilityBarForm({ idPrefix = '' }: AvailabilityBarFormProps) {
  if (AVAILABILITY_UI_MODE === 'legacy') {
    return <AvailabilityBarFormLegacy idPrefix={idPrefix} />;
  }
  return <AvailabilityBarFormModern idPrefix={idPrefix} />;
}
