import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { RoomGalleryImage } from '../lib/rooms';

interface RoomLightboxProps {
  shots: RoomGalleryImage[];
  active: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}

export function RoomLightbox({ shots, active, onClose, onStep }: RoomLightboxProps) {
  const swipeX = useRef<number | null>(null);
  const current = shots[active];

  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.classList.add('room-lightbox-open');
    document.body.style.setProperty('--lightbox-scroll', `-${scrollY}px`);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onStep(1);
      if (event.key === 'ArrowLeft') onStep(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('room-lightbox-open');
      document.body.style.removeProperty('--lightbox-scroll');
      window.removeEventListener('keydown', onKey);
      window.scrollTo(0, scrollY);
    };
  }, [onClose, onStep]);

  if (!current) return null;

  return (
    <div
      className="room-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Zimmerfotos"
      onTouchStart={(event) => {
        swipeX.current = event.changedTouches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (swipeX.current === null) return;
        const delta = event.changedTouches[0].clientX - swipeX.current;
        swipeX.current = null;
        if (Math.abs(delta) < 40) return;
        onStep(delta < 0 ? 1 : -1);
      }}
    >
      <img
        src={current.src}
        alt={current.alt}
        className="room-lightbox__image"
      />
      <button type="button" className="room-lightbox__close" aria-label="Schließen" onClick={onClose}>
        <X size={22} strokeWidth={1.6} />
      </button>
      {shots.length > 1 ? (
        <p className="room-lightbox__count">
          {active + 1} / {shots.length}
        </p>
      ) : null}
    </div>
  );
}
