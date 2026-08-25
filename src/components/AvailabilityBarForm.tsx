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
  hideExtras?: boolean;
  hideSubmit?: boolean;
  variant?: 'bar' | 'sheet';
  formId?: string;
  onSubmitted?: () => void;
}

type OpenLayer = 'dates' | 'guests' | null;

function AvailabilityBarFormModern({
  idPrefix = '',
  hideExtras = false,
  hideSubmit = false,
  variant = 'bar',
  formId,
  onSubmitted,
}: AvailabilityBarFormProps) {
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
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    if (variant === 'sheet') {
      return () => window.removeEventListener('keydown', onKey);
    }
    const onPointer = (event: MouseEvent) => {
      if (!formRef.current?.contains(event.target as Node)) {
        setOpen(null);
      }
    };
    window.addEventListener('mousedown', onPointer);
    return () => {
      window.removeEventListener('mousedown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, variant]);

  const sheet = variant === 'sheet';

  const toggle = (layer: Exclude<OpenLayer, null>) => {
    setOpen((current) => (current === layer ? null : layer));
  };

  const selectDate = (key: string) => {
    setQuery((current) => {
      const nextDates = nextDateSelection(current, key);
      if (sheet && nextDates.arrival && nextDates.departure) setOpen(null);
      return { ...current, ...nextDates };
    });
  };

  return (
    <form
      id={formId}
      ref={formRef}
      className={`availability-bar__form availability-bar__form--modern${sheet ? ' availability-bar__form--sheet' : ''}`}
      onSubmit={(event) => {
        event.preventDefault();
        toBookingParams(query);
        setOpen(null);
        onSubmitted?.();
      }}
    >
      {open === 'dates' ? (
        <AvailabilityDateLayer
          arrival={query.arrival}
          departure={query.departure}
          viewMonth={viewMonth}
          onViewMonthChange={setViewMonth}
          onSelect={selectDate}
          onClear={() => setQuery((current) => ({ ...current, arrival: null, departure: null }))}
          onApply={() => setOpen(null)}
          hideApply={sheet}
        />
      ) : null}

      {open === 'guests' ? (
        <AvailabilityGuestsLayer
          adults={query.adults}
          children={query.children}
          onChange={(next) => setQuery((current) => ({ ...current, ...next }))}
          onApply={() => setOpen(sheet ? 'dates' : null)}
          applyLabel={sheet ? 'Weiter' : 'Anwenden'}
        />
      ) : null}

      <input type="hidden" name="arrival" value={query.arrival ?? ''} />
      <input type="hidden" name="departure" value={query.departure ?? ''} />
      <input type="hidden" name="adults" value={String(query.adults)} />
      <input type="hidden" name="children" value={String(query.children)} />

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
            <span className="availability-bar__picker-value">{formatGuestSummary(query.adults, query.children)}</span>
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

      {hideSubmit ? null : (
      <button type="submit" className="availability-bar__btn">
        <Search size={16} strokeWidth={1.5} />
        Verfügbarkeit prüfen
      </button>
      )}
      {hideExtras ? null : (
        <>
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
        </>
      )}
    </form>
  );
}

export function AvailabilityBarForm({
  idPrefix = '',
  hideExtras = false,
  hideSubmit = false,
  variant = 'bar',
  formId,
  onSubmitted,
}: AvailabilityBarFormProps) {
  if (AVAILABILITY_UI_MODE === 'legacy') {
    return <AvailabilityBarFormLegacy idPrefix={idPrefix} />;
  }
  return (
    <AvailabilityBarFormModern
      idPrefix={idPrefix}
      hideExtras={hideExtras}
      hideSubmit={hideSubmit}
      variant={variant}
      formId={formId}
      onSubmitted={onSubmitted}
    />
  );
}
