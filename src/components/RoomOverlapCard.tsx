import { useState } from 'react';
import { Check } from 'lucide-react';
import { TextCta } from './TextCta';
import { formatRoomPriceCard, roomHref, type RoomStory } from '../lib/rooms';

interface RoomOverlapCardProps {
  room: RoomStory;
  reverse?: boolean;
}

function slidesFor(room: RoomStory) {
  const seen = new Set<string>();
  return [{ src: room.image, alt: room.image_alt }, ...room.gallery].filter((slide) => {
    if (!slide.src || seen.has(slide.src)) return false;
    seen.add(slide.src);
    return true;
  });
}

export function RoomOverlapCard({ room, reverse = false }: RoomOverlapCardProps) {
  const slides = slidesFor(room);
  const [index, setIndex] = useState(0);
  const amenities = room.amenities.slice(0, 3);

  const go = (next: number) => {
    if (slides.length < 2) return;
    setIndex((next + slides.length) % slides.length);
  };

  return (
    <article
      className={`rooms-overlap${reverse ? ' rooms-overlap--reverse' : ''}`}
      id={room.id}
    >
      <div className="rooms-overlap__media">
        <button
          type="button"
          className="rooms-overlap__stage"
          onClick={() => go(index + 1)}
          aria-label={
            slides.length > 1
              ? `Nächstes Foto: ${room.name}`
              : room.image_alt
          }
        >
          {slides.map((slide, slideIndex) => (
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.alt || room.name}
              className={`rooms-overlap__image${slideIndex === index ? ' is-active' : ''}`}
            />
          ))}
        </button>
        {slides.length > 1 ? (
          <div className="rooms-overlap__dots" role="tablist" aria-label={`Fotos ${room.name}`}>
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.src}
                type="button"
                role="tab"
                aria-selected={slideIndex === index}
                aria-label={`Foto ${slideIndex + 1}`}
                className={`rooms-overlap__dot${slideIndex === index ? ' is-active' : ''}`}
                onClick={() => setIndex(slideIndex)}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="rooms-overlap__card">
        <p className="rooms-overlap__price">{formatRoomPriceCard(room)}</p>
        <p className="rooms-overlap__kicker">{room.kicker}</p>
        <h2 className="rooms-overlap__name heading-font">{room.name}</h2>
        <p className="rooms-overlap__text">{room.text}</p>
        <p className="rooms-overlap__meta">
          {room.size} · {room.view} · {room.occupancy}
        </p>
        {amenities.length ? (
          <ul className="rooms-overlap__amenities">
            {amenities.map((item) => (
              <li key={item}>
                <Check size={15} strokeWidth={1.5} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="rooms-overlap__links">
          <TextCta href="#buchung">Jetzt buchen</TextCta>
          <TextCta href={roomHref(room.id)}>Details</TextCta>
        </div>
      </div>
    </article>
  );
}
