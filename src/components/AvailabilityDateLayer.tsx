import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  WEEKDAYS_DE,
  addMonths,
  dateInRange,
  formatMonthTitle,
  isPastDay,
  isSameDay,
  monthGrid,
  startOfMonth,
  toDateKey,
} from '../lib/availability';

interface AvailabilityDateLayerProps {
  arrival: string | null;
  departure: string | null;
  viewMonth: Date;
  onViewMonthChange: (date: Date) => void;
  onSelect: (key: string) => void;
  onClear: () => void;
  onApply: () => void;
}

export function AvailabilityDateLayer({
  arrival,
  departure,
  viewMonth,
  onViewMonthChange,
  onSelect,
  onClear,
  onApply,
}: AvailabilityDateLayerProps) {
  const today = new Date();
  const minMonth = startOfMonth(today);
  const months = [viewMonth, addMonths(viewMonth, 1)];
  const canGoBack = viewMonth.getTime() > minMonth.getTime();

  return (
    <div className="availability-layer availability-layer--dates" role="dialog" aria-label="Reisezeitraum wählen">
      <header className="availability-cal__navrow">
        <button
          type="button"
          className="availability-cal__nav"
          aria-label="Vorheriger Monat"
          disabled={!canGoBack}
          onClick={() => onViewMonthChange(addMonths(viewMonth, -1))}
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
        <div className="availability-cal__titles">
          {months.map((month) => (
            <h3 key={toDateKey(month)} className="availability-cal__title">
              {formatMonthTitle(month)}
            </h3>
          ))}
        </div>
        <button
          type="button"
          className="availability-cal__nav"
          aria-label="Nächster Monat"
          onClick={() => onViewMonthChange(addMonths(viewMonth, 1))}
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </button>
      </header>

      <div className="availability-cal">
        {months.map((month) => (
          <section key={toDateKey(month)} className="availability-cal__month">
            <div className="availability-cal__weekdays">
              {WEEKDAYS_DE.map((day) => (
                <span key={`${toDateKey(month)}-${day}`}>{day}</span>
              ))}
            </div>
            <div className="availability-cal__grid">
              {monthGrid(month).map((date, cellIndex) => {
                if (!date) {
                  return <span key={`empty-${toDateKey(month)}-${cellIndex}`} className="availability-cal__cell is-empty" />;
                }
                const key = toDateKey(date);
                const past = isPastDay(date, today);
                const selected = dateInRange(key, arrival, departure);
                const isArrival = arrival === key;
                const isDeparture = departure === key;
                const todayMark = isSameDay(date, today);
                const mark = isArrival ? 'Anreise' : isDeparture ? 'Abreise' : null;
                return (
                  <div
                    key={key}
                    className={[
                      'availability-cal__cell',
                      past ? 'is-past' : '',
                      selected ? 'is-selected' : '',
                      isArrival ? 'is-arrival' : '',
                      isDeparture ? 'is-departure' : '',
                      todayMark ? 'is-today' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <button
                      type="button"
                      className="availability-cal__day"
                      disabled={past}
                      onClick={() => onSelect(key)}
                    >
                      <span className="availability-cal__num">{date.getDate()}</span>
                      {mark ? <span className="availability-cal__mark">{mark}</span> : null}
                    </button>
                    {isDeparture ? (
                      <button
                        type="button"
                        className="availability-cal__clear"
                        aria-label="Auswahl löschen"
                        onClick={onClear}
                      >
                        <X size={10} strokeWidth={2} />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <div className="availability-cal__actions">
        <button
          type="button"
          className="availability-cal__apply"
          disabled={!arrival || !departure}
          onClick={onApply}
        >
          Anwenden
        </button>
      </div>
    </div>
  );
}
