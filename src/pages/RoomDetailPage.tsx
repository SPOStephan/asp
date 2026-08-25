import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { RoomAmenityGrid } from '../components/RoomAmenityGrid';
import { RoomLookbook } from '../components/RoomLookbook';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';
import { expandRoomFeatures, formatRoomPriceDetail, resolveRooms } from '../lib/rooms';

interface RoomDetailPageProps {
  compareAmenities?: boolean;
}

export function RoomDetailPage({ compareAmenities = false }: RoomDetailPageProps) {
  const { roomId } = useParams();
  const hotel = useHotel();
  const page = useSection('rooms_page');
  const items = resolveRooms(page?.items);
  const room = items.find((item) => item.id === roomId);
  const pair = room?.gallery.slice(0, 2) ?? [];
  const features = room ? expandRoomFeatures(room) : [];

  useEffect(() => {
    if (!room) return;
    const previous = document.title;
    document.title = `${room.name} | ${hotel?.name ?? 'ambassador hotel & spa'}`;
    window.scrollTo({ top: 0 });
    return () => {
      document.title = previous;
    };
  }, [room, hotel?.name]);

  if (!room) {
    return <Navigate to="/zimmer" replace />;
  }

  return (
    <main>
      <SubpageHero
        image={room.hero_image}
        imageAlt={room.hero_image_alt}
        eyebrow={room.kicker}
        title={room.name}
        subtitle={`${room.size} · ${room.view}`}
      >
        <div className={`room-detail${compareAmenities ? ' room-detail--compare' : ''}`}>
          {compareAmenities ? (
            <p className="room-compare-note">
              Vergleich: Ausstattung in zwei Spalten. Nicht die Live-Seite.
              {' '}
              <Link to={`/zimmer/${room.id}`}>Zur echten Detailseite</Link>
            </p>
          ) : null}
          <div className="room-detail__split">
            <div className="room-detail__copy">
              {room.detail_text.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <div className="room-detail__facts">
                <div className="room-detail__fact">
                  <p className="room-detail__fact-label">Größe</p>
                  <p className="room-detail__fact-value">{room.size}</p>
                </div>
                <div className="room-detail__fact">
                  <p className="room-detail__fact-label">Ausblick</p>
                  <p className="room-detail__fact-value">{room.view}</p>
                </div>
                <div className="room-detail__fact">
                  <p className="room-detail__fact-label">Belegung</p>
                  <p className="room-detail__fact-value">{room.occupancy}</p>
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
            <RoomAmenityGrid items={features} />
          </div>

          <RoomLookbook room={room} />

          {pair.length === 2 ? (
            <Reveal className="discover__feature-pair room-detail__pair">
              <div className="discover__feature-image discover__feature-image--left">
                <img src={pair[0].src} alt={pair[0].alt || room.name} />
              </div>
              <div className="discover__feature-image discover__feature-image--right">
                <img src={pair[1].src} alt={pair[1].alt || room.name} />
              </div>
            </Reveal>
          ) : null}
        </div>
      </SubpageHero>
    </main>
  );
}
