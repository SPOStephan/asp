import { Minus, Plus } from 'lucide-react';
import { GUEST_ROWS } from '../lib/availability';

interface AvailabilityGuestsLayerProps {
  adults: number;
  children: number;
  onChange: (next: { adults: number; children: number }) => void;
  onApply: () => void;
}

export function AvailabilityGuestsLayer({
  adults,
  children,
  onChange,
  onApply,
}: AvailabilityGuestsLayerProps) {
  const values = { adults, children };

  return (
    <div className="availability-layer availability-layer--guests" role="dialog" aria-label="Zahl der Gäste">
      {GUEST_ROWS.map((row) => {
        const value = values[row.key];
        return (
          <div key={row.key} className="availability-guests__row">
            <p className="availability-guests__label">{row.label}</p>
            <div className="availability-guests__stepper">
              <button
                type="button"
                className="availability-guests__step"
                aria-label={`${row.label} verringern`}
                disabled={value <= row.min}
                onClick={() => onChange({ ...values, [row.key]: value - 1 })}
              >
                <Minus size={14} strokeWidth={1.5} />
              </button>
              <span className="availability-guests__value">{value}</span>
              <button
                type="button"
                className="availability-guests__step"
                aria-label={`${row.label} erhöhen`}
                disabled={value >= row.max}
                onClick={() => onChange({ ...values, [row.key]: value + 1 })}
              >
                <Plus size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        );
      })}
      <div className="availability-guests__actions">
        <button type="button" className="availability-guests__apply" onClick={onApply}>
          Anwenden
        </button>
      </div>
    </div>
  );
}
