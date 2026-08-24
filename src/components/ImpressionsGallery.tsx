import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { TextCta } from './TextCta';

export interface ImpressionShot {
  src: string;
  alt: string;
}

interface ImpressionsGalleryProps {
  shots: ImpressionShot[];
  cta: string;
}

export function ImpressionsGallery({ shots, cta }: ImpressionsGalleryProps) {
  const [active, setActive] = useState<number | null>(null);
  const swipeX = useRef<number | null>(null);

  useEffect(() => {
    if (active === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null);
      if (event.key === 'ArrowRight') setActive((index) => step(index, 1, shots.length));
      if (event.key === 'ArrowLeft') setActive((index) => step(index, -1, shots.length));
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [active, shots.length]);

  if (!shots.length) return null;

  const current = active === null ? null : shots[active];

  return (
    <>
      <div className="awards__shots">
        {shots.map((shot, index) => (
          <button
            key={`${shot.src}-${index}`}
            type="button"
            className="awards__shot"
            aria-label={shot.alt}
            onClick={() => setActive(index)}
          >
            <img src={shot.src} alt="" />
            <span className="awards__shot-label">{shot.alt}</span>
          </button>
        ))}
      </div>

      <div className="awards__cta">
        <TextCta className="text-cta--on-dark" onClick={() => setActive(0)}>
          {cta}
        </TextCta>
      </div>

      {current ? (
        <div
          className="impressions-view"
          role="dialog"
          aria-modal="true"
          aria-label="Impressionen"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            className="impressions-view__close"
            aria-label="Schließen"
            onClick={() => setActive(null)}
          >
            <X size={22} strokeWidth={1.6} />
          </button>
          <button
            type="button"
            className="impressions-view__nav impressions-view__nav--prev"
            aria-label="Vorheriges Bild"
            onClick={(event) => {
              event.stopPropagation();
              setActive((index) => step(index, -1, shots.length));
            }}
          >
            <ChevronLeft size={26} strokeWidth={1.5} />
          </button>
          <figure
            className="impressions-view__stage"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => {
              swipeX.current = event.changedTouches[0].clientX;
            }}
            onTouchEnd={(event) => {
              if (swipeX.current === null) return;
              const delta = event.changedTouches[0].clientX - swipeX.current;
              swipeX.current = null;
              if (Math.abs(delta) < 40) return;
              setActive((index) => step(index, delta < 0 ? 1 : -1, shots.length));
            }}
          >
            <img src={current.src} alt={current.alt} />
            <figcaption>
              <span>{current.alt}</span>
              <em>
                {active! + 1} / {shots.length}
              </em>
            </figcaption>
          </figure>
          <button
            type="button"
            className="impressions-view__nav impressions-view__nav--next"
            aria-label="Nächstes Bild"
            onClick={(event) => {
              event.stopPropagation();
              setActive((index) => step(index, 1, shots.length));
            }}
          >
            <ChevronRight size={26} strokeWidth={1.5} />
          </button>
        </div>
      ) : null}
    </>
  );
}

function step(index: number | null, delta: number, total: number) {
  if (index === null) return 0;
  return (index + delta + total) % total;
}
