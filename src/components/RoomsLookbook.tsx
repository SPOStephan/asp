import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TextCta } from './TextCta';
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
  const [mountedIds, setMountedIds] = useState<string[]>(rooms[0]?.id ? [rooms[0].id] : []);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const stepRef = useRef<(direction: number) => void>(() => {});

  useEffect(() => {
    if (!rooms.some((room) => room.id === activeId)) {
      const first = rooms[0]?.id ?? '';
      setActiveId(first);
      setMountedIds(first ? [first] : []);
    }
  }, [rooms, activeId]);

  const activeIndex = Math.max(0, rooms.findIndex((room) => room.id === activeId));
  const active = rooms[activeIndex] ?? rooms[0];

  const showRoom = (id: string) => {
    if (!id || id === activeId) return;
    setMountedIds((current) => {
      const next = [id, activeId, ...current.filter((item) => item !== id && item !== activeId)];
      return next.slice(0, 3);
    });
    setActiveId(id);
  };

  const step = (direction: number) => {
    if (rooms.length < 2) return;
    const next = rooms[(activeIndex + direction + rooms.length) % rooms.length];
    showRoom(next.id);
  };
  stepRef.current = step;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMountedIds((current) => current.filter((id) => id === activeId || rooms.some((room) => room.id === id)).slice(0, 2));
    }, 800);
    return () => window.clearTimeout(timer);
  }, [activeId, rooms]);

  useEffect(() => {
    const rail = railRef.current;
    const activeButton = rail?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!rail || !activeButton) return;
    const left = activeButton.offsetLeft - rail.clientWidth / 2 + activeButton.offsetWidth / 2;
    rail.scrollTo({ left, behavior: 'smooth' });
  }, [activeId]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.35 }
    );
    observer.observe(section);

    const onKey = (event: KeyboardEvent) => {
      if (!inViewRef.current) return;
      const target = event.target;
      if (target instanceof HTMLElement && /input|textarea|select/i.test(target.tagName)) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepRef.current(1);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stepRef.current(-1);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      observer.disconnect();
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 18;
    setOffset({ x, y });
  };

  if (!rooms.length || !active) return null;

  const layerStyle = {
    transform: `translate(${offset.x}px, ${offset.y}px) scale(1.08)`,
  } as CSSProperties;
  const mountedRooms = mountedIds
    .map((id) => rooms.find((room) => room.id === id))
    .filter((room): room is RoomStory => Boolean(room));

  return (
    <section className="rooms-lookbook" aria-label={label} ref={sectionRef}>
      <p className="rooms-lookbook__kicker">{label}</p>

      <div
        className="rooms-lookbook__stage"
        onMouseMove={onMove}
        onMouseLeave={() => setOffset({ x: 0, y: 0 })}
        onTouchStart={(event) => {
          touchStartX.current = event.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const start = touchStartX.current;
          touchStartX.current = null;
          if (start == null) return;
          const delta = (event.changedTouches[0]?.clientX ?? start) - start;
          if (delta > 50) step(-1);
          if (delta < -50) step(1);
        }}
      >
        {mountedRooms.map((room) => (
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
        {rooms.length > 1 ? (
          <>
            <button
              type="button"
              className="rooms-lookbook__nav rooms-lookbook__nav--prev"
              aria-label="Vorheriges Zimmer"
              onClick={() => step(-1)}
            >
              <ChevronLeft size={22} strokeWidth={1.4} />
            </button>
            <button
              type="button"
              className="rooms-lookbook__nav rooms-lookbook__nav--next"
              aria-label="Nächstes Zimmer"
              onClick={() => step(1)}
            >
              <ChevronRight size={22} strokeWidth={1.4} />
            </button>
          </>
        ) : null}
      </div>

      <div className="rooms-lookbook__caption">
        <p className="rooms-lookbook__room-kicker">{active.kicker}</p>
        <h2 className="rooms-lookbook__title heading-font">{active.name}</h2>
        <p className="rooms-lookbook__meta">
          {active.size} · {active.view}
        </p>
        <TextCta onClick={() => onChoose(active.id)}>Ansehen</TextCta>
      </div>

      {rooms.length > 1 ? (
        <div className="rooms-lookbook__rail-wrap">
          <div className="rooms-lookbook__rail" ref={railRef} role="tablist" aria-label="Zimmer im Lookbook">
            {rooms.map((room, index) => {
              const isActive = room.id === active.id;
              return (
                <button
                  key={room.id}
                  type="button"
                  role="tab"
                  aria-current={isActive ? 'true' : undefined}
                  aria-selected={isActive}
                  className={`rooms-lookbook__rail-item${isActive ? ' is-active' : ''}`}
                  onClick={() => showRoom(room.id)}
                >
                  <span className="rooms-lookbook__num">{padIndex(index)}</span>
                  <span>{room.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
