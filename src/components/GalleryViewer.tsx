import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ImpressionShot } from '../lib/impressions';

interface GalleryViewerProps {
  shots: ImpressionShot[];
  active: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}

export function GalleryViewer({ shots, active, onClose, onStep }: GalleryViewerProps) {
  const swipeX = useRef<number | null>(null);
  const current = shots[active];

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onStep(1);
      if (event.key === 'ArrowLeft') onStep(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, onStep]);

  if (!current) return null;

  return (
    <div
      className="gallery-view"
      role="dialog"
      aria-modal="true"
      aria-label="Bildergalerie"
      onClick={onClose}
    >
      <button type="button" className="gallery-view__close" aria-label="Schließen" onClick={onClose}>
        <X size={22} strokeWidth={1.6} />
      </button>
      <button
        type="button"
        className="gallery-view__nav gallery-view__nav--prev"
        aria-label="Vorheriges Bild"
        onClick={(event) => {
          event.stopPropagation();
          onStep(-1);
        }}
      >
        <ChevronLeft size={26} strokeWidth={1.5} />
      </button>
      <figure
        className="gallery-view__stage"
        onClick={(event) => event.stopPropagation()}
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
        <img src={current.src} alt={current.alt} />
        <figcaption>
          <span>{current.alt}</span>
          <em>
            {active + 1} / {shots.length}
          </em>
        </figcaption>
      </figure>
      <button
        type="button"
        className="gallery-view__nav gallery-view__nav--next"
        aria-label="Nächstes Bild"
        onClick={(event) => {
          event.stopPropagation();
          onStep(1);
        }}
      >
        <ChevronRight size={26} strokeWidth={1.5} />
      </button>
    </div>
  );
}
