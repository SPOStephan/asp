import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react';
import type { RoomStory } from '../lib/rooms';

interface RoomsLookbookProps {
  rooms: RoomStory[];
  label: string;
  onChoose: (id: string) => void;
}

function padIndex(index: number) {
  return String(index + 1).padStart(2, '0');
}

export function RoomsLookbook({ rooms, label, onChoose }: RoomsLookbookProps) {
  const [activeId, setActiveId] = useState(rooms[0]?.id ?? '');
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!rooms.some((room) => room.id === activeId)) {
      setActiveId(rooms[0]?.id ?? '');
    }
  }, [rooms, activeId]);

  const activeIndex = Math.max(0, rooms.findIndex((room) => room.id === activeId));
  const active = rooms[activeIndex] ?? rooms[0];

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 18;
    setOffset({ x, y });
  };

  const resetOffset = () => setOffset({ x: 0, y: 0 });

  if (!rooms.length || !active) return null;

  const layerStyle = {
    transform: `translate(${offset.x}px, ${offset.y}px) scale(1.08)`,
  } as CSSProperties;

  return (
    <section className="rooms-lookbook" aria-label={label}>
      <div className="rooms-lookbook__index">
        <p className="rooms-lookbook__kicker">{label}</p>
        <ol className="rooms-lookbook__names">
          {rooms.map((room, index) => {
            const isActive = room.id === active.id;
            return (
              <li key={room.id}>
                <button
                  type="button"
                  className={`rooms-lookbook__name heading-font${isActive ? ' is-active' : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                  onMouseEnter={() => setActiveId(room.id)}
                  onFocus={() => setActiveId(room.id)}
                  onClick={() => {
                    setActiveId(room.id);
                    onChoose(room.id);
                  }}
                >
                  <span className="rooms-lookbook__num">{padIndex(index)}</span>
                  <span>{room.name}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div
        className="rooms-lookbook__stage"
        onMouseMove={onMove}
        onMouseLeave={resetOffset}
      >
        {rooms.map((room) => (
          <img
            key={room.id}
            className={`rooms-lookbook__image${room.id === active.id ? ' is-active' : ''}`}
            src={room.image}
            alt={room.image_alt}
            style={layerStyle}
            loading={room.id === rooms[0].id ? 'eager' : 'lazy'}
          />
        ))}
        <p className="rooms-lookbook__count" aria-hidden="true">
          {padIndex(activeIndex)}
          <span> / {String(rooms.length).padStart(2, '0')}</span>
        </p>
      </div>
    </section>
  );
}
