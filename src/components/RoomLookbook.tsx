import { useState } from 'react';
import type { RoomStory } from '../lib/rooms';

interface RoomLookbookProps {
  room: RoomStory;
}

function slidesFor(room: RoomStory) {
  const seen = new Set<string>();
  return [
    { src: room.hero_image || room.image, alt: room.hero_image_alt || room.image_alt },
    { src: room.image, alt: room.image_alt },
    ...room.gallery,
  ].filter((slide) => {
    if (!slide.src || seen.has(slide.src)) return false;
    seen.add(slide.src);
    return true;
  });
}

export function RoomLookbook({ room }: RoomLookbookProps) {
  const slides = slidesFor(room);
  const [index, setIndex] = useState(0);

  if (!slides.length) return null;

  const go = (next: number) => {
    if (slides.length < 2) return;
    setIndex((next + slides.length) % slides.length);
  };

  return (
    <div className="room-lookbook">
      <p className="room-lookbook__kicker">Lookbook</p>
      <button
        type="button"
        className="room-lookbook__stage"
        onClick={() => go(index + 1)}
        aria-label={
          slides.length > 1 ? `Nächstes Foto: ${room.name}` : room.hero_image_alt || room.name
        }
      >
        {slides.map((slide, slideIndex) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt || room.name}
            className={`room-lookbook__image${slideIndex === index ? ' is-active' : ''}`}
          />
        ))}
      </button>
      {slides.length > 1 ? (
        <div className="room-lookbook__dots" role="tablist" aria-label={`Fotos ${room.name}`}>
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.src}
              type="button"
              role="tab"
              aria-selected={slideIndex === index}
              aria-label={`Foto ${slideIndex + 1}`}
              className={`room-lookbook__dot${slideIndex === index ? ' is-active' : ''}`}
              onClick={() => setIndex(slideIndex)}
            />
          ))}
        </div>
      ) : null}
      <p className="room-lookbook__hint">
        {index + 1} / {slides.length} · Antippen für das nächste Motiv
      </p>
    </div>
  );
}
