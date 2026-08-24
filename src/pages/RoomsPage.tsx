import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { RoomsLookbook } from '../components/RoomsLookbook';
import { Reveal } from '../components/Reveal';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';
import {
  filterRooms,
  isRoomFilter,
  resolveRooms,
  ROOM_FILTERS,
  roomHref,
  ROOMS_PAGE_FALLBACK,
  type RoomFilterId,
} from '../lib/rooms';

export function RoomsPage() {
  const hotel = useHotel();
  const page = useSection('rooms_page');
  const data = page ?? ROOMS_PAGE_FALLBACK;
  const items = resolveRooms(data.items);
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const filter: RoomFilterId = isRoomFilter(params.get('filter')) ? params.get('filter') as RoomFilterId : 'alle';
  const visible = filterRooms(items, filter);
  const adviceHref = hotel?.email ? `mailto:${hotel.email}` : '#buchung';

  useEffect(() => {
    const previous = document.title;
    document.title = `${data.title ?? 'Zimmer & Suiten'} | ${hotel?.name ?? 'ambassador hotel & spa'}`;
    if (!location.hash) {
      window.scrollTo({ top: 0 });
    }
    return () => {
      document.title = previous;
    };
  }, [data.title, hotel?.name, location.hash]);

  useEffect(() => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [location.hash, visible]);

  const setFilter = (next: RoomFilterId) => {
    const nextParams = new URLSearchParams(params);
    if (next === 'alle') nextParams.delete('filter');
    else nextParams.set('filter', next);
    setParams(nextParams, { replace: true });
  };

  const scrollToRoom = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main>
      <SubpageHero
        image={data.hero_image ?? ROOMS_PAGE_FALLBACK.hero_image}
        imageAlt={data.hero_image_alt ?? ROOMS_PAGE_FALLBACK.hero_image_alt}
        eyebrow={page?.eyebrow ?? ROOMS_PAGE_FALLBACK.eyebrow}
        title={page?.title ?? ROOMS_PAGE_FALLBACK.title}
        subtitle={page?.subtitle ?? ROOMS_PAGE_FALLBACK.subtitle}
      >
        <div className="rooms-page">
          {data.intro ? <p className="rooms-page__intro">{data.intro}</p> : null}

          <div className="rooms-page__filters" role="tablist" aria-label="Zimmer filtern">
            {ROOM_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                className={`rooms-page__filter${filter === item.id ? ' is-active' : ''}`}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <RoomsLookbook
            rooms={visible}
            label={data.lookbook_label ?? ROOMS_PAGE_FALLBACK.lookbook_label}
            onChoose={scrollToRoom}
          />

          <section className="rooms-page__list" aria-label="Zimmer und Suiten">
            {visible.length ? (
              visible.map((room, index) => (
                <Reveal key={room.id} delay={index * 60}>
                  <article
                    className={`rooms-page__story${index % 2 === 1 ? ' rooms-page__story--reverse' : ''}`}
                    id={room.id}
                  >
                    <figure className="rooms-page__photo">
                      <img src={room.image} alt={room.image_alt} />
                    </figure>
                    <div className="rooms-page__copy">
                      <p className="rooms-page__kicker">{room.kicker}</p>
                      <h2 className="rooms-page__name heading-font">{room.name}</h2>
                      <p className="rooms-page__text">{room.text}</p>
                      <dl className="rooms-page__facts">
                        <div>
                          <dt>Größe</dt>
                          <dd>{room.size}</dd>
                        </div>
                        <div>
                          <dt>Ausblick</dt>
                          <dd>{room.view}</dd>
                        </div>
                        <div>
                          <dt>Belegung</dt>
                          <dd>{room.occupancy}</dd>
                        </div>
                      </dl>
                      <div className="rooms-page__links">
                        <TextCta href={roomHref(room.id)}>Details</TextCta>
                        <TextCta href="#buchung">Jetzt buchen</TextCta>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))
            ) : (
              <p className="rooms-page__empty">Keine Zimmer in dieser Auswahl.</p>
            )}
          </section>

          <section className="rooms-page__note">
            <h2 className="rooms-page__note-title heading-font">
              {data.note_title ?? ROOMS_PAGE_FALLBACK.note_title}
            </h2>
            <p className="rooms-page__note-text">
              {data.note_text ?? ROOMS_PAGE_FALLBACK.note_text}
            </p>
            <TextCta href={data.note_cta_href ?? adviceHref}>
              {data.note_cta ?? ROOMS_PAGE_FALLBACK.note_cta}
            </TextCta>
          </section>
        </div>
      </SubpageHero>
    </main>
  );
}
