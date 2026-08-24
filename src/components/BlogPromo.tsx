import { TextCta } from './TextCta';
import { offerHref, type OfferStory } from '../lib/offers';

export function BlogPromo({ offer }: { offer: OfferStory }) {
  return (
    <aside className="blog-promo" aria-label="Angebot">
      <figure className="blog-promo__photo">
        <img src={offer.image} alt={offer.image_alt} />
      </figure>
      <div className="blog-promo__copy">
        <p className="blog-promo__kicker">Angebot</p>
        <h2 className="blog-promo__title heading-font">{offer.title}</h2>
        <p className="blog-promo__text">{offer.subtitle}. {offer.text}</p>
        <TextCta href={offerHref(offer.id)}>Zum Angebot</TextCta>
      </div>
    </aside>
  );
}
