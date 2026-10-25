import { useEffect } from 'react';
import { filled } from '../lib/filled';
import { useCms } from '../cms/CmsContext';
import { CmsPart, CmsSection } from '../cms/CmsSection';
import { Reveal } from '../components/Reveal';
import { RoomOverlapCard } from '../components/RoomOverlapCard';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';
import { resolveMedia } from '../lib/media';
import { ListFilterBar, useListFilter } from '../components/ListFilterBar';
import { filterRooms, resolveRooms, ROOM_FILTERS, ROOMS_PAGE_FALLBACK } from '../lib/rooms';
import { usePageTop } from '../lib/usePageTop';

export function RoomsCardsPage() {
  usePageTop();
  const editing = Boolean(useCms());
  const hotel = useHotel();
  const page = useSection('rooms_page');
  const data = page ?? ROOMS_PAGE_FALLBACK;
  const items = resolveRooms(data.items);
  const roomFilter = useListFilter(page, ROOM_FILTERS, items.map((room) => room.tags), 'filter');
  const filter = roomFilter.active;
  const visible = filterRooms(items, filter);
  const adviceHref = hotel?.email ? `mailto:${hotel.email}` : '#buchung';

  useEffect(() => {
    const previous = document.title;
    document.title = `${data.title ?? 'Zimmer & Suiten'} | ${hotel?.name ?? ''}`;
    return () => {
      document.title = previous;
    };
  }, [data.title, hotel?.name]);

  return (
    <CmsSection sectionKey="rooms_page" label="Zimmer">
    <main>
      <SubpageHero
        image={resolveMedia(data.hero_image, ROOMS_PAGE_FALLBACK.hero_image)}
        imageAlt={data.hero_image_alt || ROOMS_PAGE_FALLBACK.hero_image_alt}
        eyebrow={page?.eyebrow ?? ROOMS_PAGE_FALLBACK.eyebrow}
        title={page?.title ?? ROOMS_PAGE_FALLBACK.title}
        subtitle={page?.subtitle ?? ROOMS_PAGE_FALLBACK.subtitle}
        focal={data.hero_focal}
        cms={{ section: 'rooms_page' }}
      >
        <div className="rooms-cards">
          <CmsPart sectionKey="rooms_page" part="intro" label="Einleitung">
            {data.intro || editing ? <p className="rooms-cards__intro" data-cms-focus="intro" data-cms-path="intro">{data.intro}</p> : null}
          </CmsPart>

          <CmsPart sectionKey="rooms_page" part="filters" label="Filter">
            {roomFilter.switchedOn || editing ? (
              <ListFilterBar
                filters={roomFilter.filters}
                active={filter}
                onChange={roomFilter.setActive}
                className="rooms-page__filter"
                label="Zimmer filtern"
              />
            ) : null}
          </CmsPart>

          <CmsPart sectionKey="rooms_page" part="list" label="Zimmerliste">
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
          </CmsPart>

          <CmsPart sectionKey="rooms_page" part="price_note" label="Preishinweis" empty={!filled(data.price_note ?? ROOMS_PAGE_FALLBACK.price_note)}>
            <p className="rooms-cards__price-note">
              {data.price_note ?? ROOMS_PAGE_FALLBACK.price_note}
            </p>
          </CmsPart>

          <CmsPart sectionKey="rooms_page" part="note" label="Hinweis" empty={!filled(data.note_title ?? ROOMS_PAGE_FALLBACK.note_title, data.note_text ?? ROOMS_PAGE_FALLBACK.note_text)}>
            <section className="rooms-cards__note" data-cms-focus="note">
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
          </CmsPart>
        </div>
      </SubpageHero>
    </main>
    </CmsSection>
  );
}
