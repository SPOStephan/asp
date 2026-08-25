import { useEffect, useState } from 'react';
import { roomGalleryImages, type RoomStory } from '../lib/rooms';
import { GalleryViewer } from './GalleryViewer';

interface RoomPhotoGridProps {
  room: RoomStory;
}

export function RoomPhotoGrid({ room }: RoomPhotoGridProps) {
  const slides = roomGalleryImages(room);
  const preview = slides.slice(0, 3);
  const extra = slides.length - preview.length;
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (active === null) return;
    let locked = false;
    const onWheel = (event: WheelEvent) => {
      if (locked) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 24) return;
      locked = true;
      setActive((current) => {
        if (current === null) return current;
        return (current + (delta > 0 ? 1 : -1) + slides.length) % slides.length;
      });
      window.setTimeout(() => {
        locked = false;
      }, 420);
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [active, slides.length]);

  if (!preview.length) return null;

  const step = (delta: number) => {
    setActive((current) => {
      if (current === null) return current;
      return (current + delta + slides.length) % slides.length;
    });
  };

  return (
    <>
      <div className="room-photos">
        {preview.map((slide, index) => {
          const isHero = index === 0;
          const isWideTile = !isHero && preview.length === 2;
          return (
            <button
              key={slide.src}
              type="button"
              className={`room-photos__shot${isHero ? ' room-photos__shot--hero' : ''}${isWideTile ? ' room-photos__shot--wide' : ''}`}
              onClick={() => setActive(index)}
              aria-label={`Foto öffnen: ${slide.alt || room.name}`}
            >
              <img src={slide.src} alt={slide.alt || room.name} />
              {index === 2 && extra > 0 ? <span className="room-photos__more">+{extra}</span> : null}
            </button>
          );
        })}
      </div>
      {active !== null ? (
        <GalleryViewer
          shots={slides}
          active={active}
          onClose={() => setActive(null)}
          onStep={step}
        />
      ) : null}
    </>
  );
}
