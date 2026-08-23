import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { IncludeList } from '../components/IncludeList';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';
import { resolveOfferStories } from '../lib/offers';

export function OfferDetailPage() {
  const { offerId } = useParams();
  const hotel = useHotel();
  const page = useSection('offers_page');
  const homeOffers = useSection('offers');
  const items = resolveOfferStories(page?.items, homeOffers?.items);
  const offer = items.find((item) => item.id === offerId);

  useEffect(() => {
    if (!offer) return;
    const previous = document.title;
    document.title = `${offer.title} | ${hotel?.name ?? 'ambassador hotel & spa'}`;
    window.scrollTo({ top: 0 });
    return () => {
      document.title = previous;
    };
  }, [offer, hotel?.name]);

  if (!offer) {
    return <Navigate to="/angebote" replace />;
  }

  return (
    <main className="offer-detail">
      <header className="offer-detail__head">
        <p className="offers-page__kicker">{offer.title}</p>
        <h1 className="offer-detail__title heading-font">{offer.subtitle}</h1>
        {offer.details.length ? (
          <p className="offer-detail__lede">{offer.details.join(' · ')}</p>
        ) : null}
      </header>

      <figure className="offer-detail__photo">
        <img src={offer.image} alt={offer.image_alt} />
      </figure>

      <div className="offer-detail__copy">
        {offer.detail_text.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <IncludeList items={offer.includes} />
        <div className="offer-detail__meta">
          {offer.details.map((detail) => (
            <p key={detail}>{detail}</p>
          ))}
        </div>
        <div className="offer-detail__links">
          <TextCta href="#buchung">Jetzt buchen</TextCta>
          <TextCta href="/angebote">Alle Angebote</TextCta>
        </div>
      </div>
    </main>
  );
}
