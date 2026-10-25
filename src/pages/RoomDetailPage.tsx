import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useCms } from '../cms/CmsContext';
import { CmsSection } from '../cms/CmsSection';
import { Reveal } from '../components/Reveal';
import { RoomAmenityGrid } from '../components/RoomAmenityGrid';
import { RoomPhotoGrid } from '../components/RoomPhotoGrid';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { entryFocal } from '../cms/cmsFocal';
import { useHotel, useSection } from '../context/HotelContext';
import { expandRoomFeatures, formatRoomPriceDetail, resolveRooms, roomGallery } from '../lib/rooms';
import { usePageTop } from '../lib/usePageTop';

export function RoomDetailPage() {
  usePageTop();
  const { roomId } = useParams();
  const cms = useCms();
  const hotel = useHotel();
  const page = useSection('rooms_page');
  const items = resolveRooms(page?.items);
  const room = items.find((item) => item.id === roomId);
  const pair = room ? roomGallery(room).slice(0, 2) : [];
  const features = room ? expandRoomFeatures(room) : [];

  useEffect(() => {
    if (!room) return;
    const previous = document.title;
    document.title = `${room.name} | ${hotel?.name ?? ''}`;
    return () => {
      document.title = previous;
    };
  }, [room?.name, hotel?.name]);

  if (!room) {
    return <Navigate to={cms ? '/cms/zimmer' : '/zimmer'} replace />;
  }

  const prefix = `items.${room.id}`;

  return (
    <CmsSection sectionKey="rooms_page" label="Zimmer">
    <main>
      <SubpageHero
        image={room.hero_image}
        imageAlt={room.hero_image_alt}
        eyebrow={room.kicker}
        title={room.name}
        subtitle={`${room.size} · ${room.view}`}
        focal={entryFocal(page?.items, room.id)}
        cms={{
          image: `${prefix}.hero_image`,
          eyebrow: `${prefix}.kicker`,
          title: `${prefix}.name`,
          section: 'rooms_page',
          focalPath: `${prefix}.hero_focal`,
        }}
      >
        <div className="room-detail">
          <div className="room-detail__split">
            <div className="room-detail__copy">
              {room.detail_text.map((paragraph, index) => (
                <p key={`${index}-${paragraph}`} data-cms-path={`${prefix}.detail_text.${index}`}>{paragraph}</p>
              ))}
              <div className="room-detail__facts">
                <div className="room-detail__fact">
                  <p className="room-detail__fact-label">Größe</p>
                  <p className="room-detail__fact-value" data-cms-path={`${prefix}.size`}>{room.size}</p>
                </div>
                <div className="room-detail__fact">
                  <p className="room-detail__fact-label">Ausblick</p>
                  <p className="room-detail__fact-value" data-cms-path={`${prefix}.view`}>{room.view}</p>
                </div>
                <div className="room-detail__fact">
                  <p className="room-detail__fact-label">Belegung</p>
                  <p className="room-detail__fact-value" data-cms-path={`${prefix}.occupancy`}>{room.occupancy}</p>
                </div>
              </div>
              <div className="room-detail__book">
                <p className="room-detail__book-label">Preis</p>
                <p className="room-detail__book-price heading-font">{formatRoomPriceDetail(room)}</p>
                <div className="room-detail__links">
                  <TextCta href="#buchung">Jetzt buchen</TextCta>
                  <TextCta href="/zimmer">Alle Zimmer</TextCta>
                </div>
              </div>
            </div>
            <RoomAmenityGrid items={features} color={typeof page?.icon_color === 'string' ? page.icon_color : undefined} />
          </div>

          <RoomPhotoGrid room={room} />

          {pair.length === 2 ? (
            <Reveal className="discover__feature-pair room-detail__pair">
              <div className="discover__feature-image discover__feature-image--left">
                <img loading="lazy" decoding="async" src={pair[0].src} alt={pair[0].alt || room.name} data-cms-path={`${prefix}.${pair[0].field}`} data-cms-kind="image" />
              </div>
              <div className="discover__feature-image discover__feature-image--right">
                <img loading="lazy" decoding="async" src={pair[1].src} alt={pair[1].alt || room.name} data-cms-path={`${prefix}.${pair[1].field}`} data-cms-kind="image" />
              </div>
            </Reveal>
          ) : null}
        </div>
      </SubpageHero>
    </main>
    </CmsSection>
  );
}
