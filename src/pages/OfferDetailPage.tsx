import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { IncludeList } from '../components/IncludeList';
import { Reveal } from '../components/Reveal';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';
import { resolveOfferStories } from '../lib/offers';

const PAIR_FALLBACK = {
  left: '/willkommen-spo-smart.jpg',
  leftAlt: 'Ausblick auf das Meer mit Whirlpool',
  right: '/hotel-stpeter-ording-Austernfischer-Suite05.jpg',
  rightAlt: 'Suite mit Meerblick und Balkon',
};

export function OfferDetailPage() {
  const { offerId } = useParams();
  const hotel = useHotel();
  const page = useSection('offers_page');
  const homeOffers = useSection('offers');
  const discover = useSection('discover');
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

  const stayLabel = offer.details[0] ?? 'Aufenthalt';
  const stayValue = offer.details.slice(1).join(' · ') || offer.details[0];
  const pairLeft = discover?.feature_image_left ?? PAIR_FALLBACK.left;
  const pairLeftAlt = discover?.feature_image_left_alt || PAIR_FALLBACK.leftAlt;
  const pairRight = discover?.feature_image_right ?? PAIR_FALLBACK.right;
  const pairRightAlt = discover?.feature_image_right_alt || PAIR_FALLBACK.rightAlt;

  return (
    <main>
      <SubpageHero
        image={offer.hero_image}
        imageAlt={offer.hero_image_alt}
        eyebrow={offer.title}
        title={offer.subtitle}
        subtitle={offer.details.join(' · ')}
      >
        <div className="offer-detail">
          <div className="offer-detail__copy">
            {offer.detail_text.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <IncludeList items={offer.includes} />
            <div className="offer-detail__facts">
              <div className="offer-detail__fact">
                <p className="offer-detail__fact-label">{stayLabel}</p>
                <p className="offer-detail__fact-value">{stayValue}</p>
              </div>
              <div className="offer-detail__fact">
                <p className="offer-detail__fact-label">{offer.travel_period_label}</p>
                <p className="offer-detail__fact-value">{offer.travel_period}</p>
              </div>
            </div>
            <div className="offer-detail__links">
              <TextCta href="#buchung">Jetzt buchen</TextCta>
            </div>
          </div>

          <Reveal className="discover__feature-pair offer-detail__pair">
            <div className="discover__feature-image discover__feature-image--left">
              <img src={pairLeft} alt={pairLeftAlt} />
            </div>
            <div className="discover__feature-image discover__feature-image--right">
              <img src={pairRight} alt={pairRightAlt} />
            </div>
          </Reveal>
        </div>
      </SubpageHero>
    </main>
  );
}
