import { Minus, Plus } from 'lucide-react';
import {
  GUEST_ROWS,
  createRoom,
  type GuestRowKey,
  type RoomOccupancy,
} from '../lib/availability';

interface AvailabilityGuestsLayerProps {
  rooms: RoomOccupancy[];
  onChange: (rooms: RoomOccupancy[]) => void;
  onApply: () => void;
}

export function AvailabilityGuestsLayer({ rooms, onChange, onApply }: AvailabilityGuestsLayerProps) {
  const updateRoom = (index: number, key: GuestRowKey, next: number) => {
    onChange(rooms.map((room, roomIndex) => (
      roomIndex === index ? { ...room, [key]: next } : room
    )));
  };

  const addRoom = () => {
    if (rooms.length >= 4) return;
    onChange([...rooms, createRoom(2)]);
  };

  const removeRoom = (index: number) => {
    if (rooms.length === 1) return;
    onChange(rooms.filter((_, roomIndex) => roomIndex !== index));
  };

  return (
    <div className="availability-layer availability-layer--guests" role="dialog" aria-label="Zahl der Gäste">
      {rooms.map((room, index) => (
        <section key={`room-${index}`} className="availability-guests__room">
          {rooms.length > 1 ? (
            <header className="availability-guests__room-head">
              <h3>Zimmer {index + 1}</h3>
              <button type="button" onClick={() => removeRoom(index)}>
                Entfernen
              </button>
            </header>
          ) : null}
          {GUEST_ROWS.map((row) => {
            const value = room[row.key];
            return (
              <div key={row.key} className="availability-guests__row">
                <div className="availability-guests__copy">
                  <p className="availability-guests__label">{row.label}</p>
                  {row.hint ? <p className="availability-guests__hint">{row.hint}</p> : null}
                </div>
                <div className="availability-guests__stepper">
                  <button
                    type="button"
                    className="availability-guests__step"
                    aria-label={`${row.label} verringern`}
                    disabled={value <= row.min}
                    onClick={() => updateRoom(index, row.key, value - 1)}
                  >
                    <Minus size={14} strokeWidth={1.5} />
                  </button>
                  <span className="availability-guests__value">{value}</span>
                  <button
                    type="button"
                    className="availability-guests__step"
                    aria-label={`${row.label} erhöhen`}
                    disabled={value >= row.max}
                    onClick={() => updateRoom(index, row.key, value + 1)}
                  >
                    <Plus size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      ))}
      <div className="availability-guests__actions">
        <button
          type="button"
          className="availability-guests__more"
          disabled={rooms.length >= 4}
          onClick={addRoom}
        >
          Weiteres Zimmer?
        </button>
        <button type="button" className="availability-guests__apply" onClick={onApply}>
          Anwenden
        </button>
      </div>
    </div>
  );
}
