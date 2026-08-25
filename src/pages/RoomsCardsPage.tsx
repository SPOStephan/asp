import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CmsSection } from '../cms/CmsSection';
import { Reveal } from '../components/Reveal';
import { RoomOverlapCard } from '../components/RoomOverlapCard';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';
import {
  filterRooms,
  isRoomFilter,
  resolveRooms,
  ROOM_FILTERS,
  ROOMS_PAGE_FALLBACK,
  type RoomFilterId,
} from '../lib/rooms';

export function RoomsCardsPage() {
  const hotel = useHotel();
  const page = useSection('rooms_page');
  const data = page ?? ROOMS_PAGE_FALLBACK;
  const items = resolveRooms(data.items);
  const [params, setParams] = useSearchParams();
  const filter: RoomFilterId = isRoomFilter(params.get('filter'))
    ? (params.get('filter') as RoomFilterId)
    : 'alle';
  const visible = filterRooms(items, filter);
  const adviceHref = hotel?.email ? `mailto:${hotel.email}` : '#buchung';

  useEffect(() => {
    const previous = document.title;
    document.title = `${data.title ?? 'Zimmer & Suiten'} | ${hotel?.name ?? 'ambassador hotel & spa'}`;
    window.scrollTo({ top: 0 });
    return () => {
      document.title = previous;
    };
  }, [data.title, hotel?.name]);

  const setFilter = (next: RoomFilterId) => {
    const nextParams = new URLSearchParams(params);
    if (next === 'alle') nextParams.delete('filter');
    else nextParams.set('filter', next);
    setParams(nextParams, { replace: true });
  };

  return (
    <CmsSection sectionKey="rooms_page" label="Zimmer">
    <main>
      <SubpageHero
        image={data.hero_image ?? ROOMS_PAGE_FALLBACK.hero_image}
        imageAlt={data.hero_image_alt ?? ROOMS_PAGE_FALLBACK.hero_image_alt}
        eyebrow={page?.eyebrow ?? ROOMS_PAGE_FALLBACK.eyebrow}
        title={page?.title ?? ROOMS_PAGE_FALLBACK.title}
        subtitle={page?.subtitle ?? ROOMS_PAGE_FALLBACK.subtitle}
      >
        <div className="rooms-cards">
          {data.intro ? <p className="rooms-cards__intro">{data.intro}</p> : null}

          {data.show_filters !== false ? (
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
          ) : null}

          <section className="rooms-cards__list" aria-label="Zimmer und Suiten">
            {visible.length ? (
              visible.map((room, index) => (
                <Reveal key={room.id} delay={index * 50}>
                  <RoomOverlapCard room={room} reverse={index % 2 === 1} />
                </Reveal>
              ))
            ) : (
              <p className="rooms-cards__empty">Keine Zimmer in dieser Auswahl.</p>
            )}
          </section>

          <p className="rooms-cards__price-note">
            {data.price_note ?? ROOMS_PAGE_FALLBACK.price_note}
          </p>

          <section className="rooms-cards__note">
            <h2 className="rooms-cards__note-title heading-font">
              {data.note_title ?? ROOMS_PAGE_FALLBACK.note_title}
            </h2>
            <p className="rooms-cards__note-text">
              {data.note_text ?? ROOMS_PAGE_FALLBACK.note_text}
            </p>
            <TextCta href={data.note_cta_href ?? adviceHref}>
              {data.note_cta ?? ROOMS_PAGE_FALLBACK.note_cta}
            </TextCta>
          </section>
        </div>
      </SubpageHero>
    </main>
    </CmsSection>
  );
}
