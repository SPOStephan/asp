import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useCms } from '../cms/CmsContext';
import { CmsSection } from '../cms/CmsSection';
import { IncludeList } from '../components/IncludeList';
import { Reveal } from '../components/Reveal';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';
import { offerDetails, pricesShown } from '../lib/prices';
import { entryFocal } from '../cms/cmsFocal';
import { resolveOfferStories } from '../lib/offers';
import { PLACEHOLDER_IMAGE } from '../lib/media';
import { usePageTop } from '../lib/usePageTop';

const PAIR_FALLBACK = {
  left: PLACEHOLDER_IMAGE,
  leftAlt: '',
  right: PLACEHOLDER_IMAGE,
  rightAlt: '',
};

export function OfferDetailPage() {
  usePageTop();
  const { offerId } = useParams();
  const cms = useCms();
  const hotel = useHotel();
  const page = useSection('offers_page');
  const homeOffers = useSection('offers');
  const discover = useSection('discover');
  const items = resolveOfferStories(page?.items, homeOffers?.items);
  const offer = items.find((item) => item.id === offerId);

  useEffect(() => {
    if (!offer) return;
    const previous = document.title;
    document.title = `${offer.title} | ${hotel?.name ?? ''}`;
    return () => {
      document.title = previous;
    };
  }, [offer?.title, hotel?.name]);

  if (!offer) {
    return <Navigate to={cms ? '/cms/angebote' : '/angebote'} replace />;
  }

  const prefix = `items.${offer.id}`;
  const details = offerDetails(offer.details, pricesShown(page));
  const stayLabel = details.length > 1 ? details[0] : 'Aufenthalt';
  const stayValue = details.length > 1 ? details.slice(1).join(' · ') : details[0] ?? '';
  const pairLeft = discover?.feature_image_left ?? PAIR_FALLBACK.left;
  const pairLeftAlt = discover?.feature_image_left_alt || PAIR_FALLBACK.leftAlt;
  const pairRight = discover?.feature_image_right ?? PAIR_FALLBACK.right;
  const pairRightAlt = discover?.feature_image_right_alt || PAIR_FALLBACK.rightAlt;

  return (
    <CmsSection sectionKey="offers_page" label="Angebot">
    <main>
      <SubpageHero
        image={offer.hero_image}
        imageAlt={offer.hero_image_alt}
        eyebrow={offer.title}
        title={offer.subtitle}
        subtitle={details.join(' · ')}
        focal={entryFocal(page?.items, offer.id)}
        cms={{
          image: `${prefix}.hero_image`,
          eyebrow: `${prefix}.title`,
          title: `${prefix}.subtitle`,
          section: 'offers_page',
          focalPath: `${prefix}.hero_focal`,
        }}
      >
        <div className="offer-detail">
          <div className="offer-detail__copy">
            {offer.detail_text.map((paragraph, index) => (
              <p key={`${paragraph}-${index}`} data-cms-path={`${prefix}.detail_text.${index}`}>{paragraph}</p>
            ))}
            <IncludeList items={offer.includes} pathPrefix={`${prefix}.includes`} />
            <div className="offer-detail__facts">
              <div className="offer-detail__fact">
                <p className="offer-detail__fact-label" data-cms-path={`${prefix}.details.0`}>{stayLabel}</p>
                <p className="offer-detail__fact-value" data-cms-path={`${prefix}.details.1`}>{stayValue}</p>
              </div>
              <div className="offer-detail__fact">
                <p className="offer-detail__fact-label" data-cms-path={`${prefix}.travel_period_label`}>{offer.travel_period_label}</p>
                <p className="offer-detail__fact-value" data-cms-path={`${prefix}.travel_period`}>{offer.travel_period}</p>
              </div>
            </div>
            <div className="offer-detail__links">
              <TextCta href="#buchung">Jetzt buchen</TextCta>
            </div>
          </div>

          {/* The picture pair of the start page's "Entdecken" block, shared by all offers. */}
          <Reveal className="discover__feature-pair offer-detail__pair">
            <div className="discover__feature-image discover__feature-image--left" data-cms-section="discover">
              <img loading="lazy" decoding="async" src={pairLeft} alt={pairLeftAlt} data-cms-path="feature_image_left" data-cms-kind="image" />
            </div>
            <div className="discover__feature-image discover__feature-image--right" data-cms-section="discover">
              <img loading="lazy" decoding="async" src={pairRight} alt={pairRightAlt} data-cms-path="feature_image_right" data-cms-kind="image" />
            </div>
          </Reveal>
        </div>
      </SubpageHero>
    </main>
    </CmsSection>
  );
}
