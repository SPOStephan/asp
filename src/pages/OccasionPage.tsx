import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useCms } from '../cms/CmsContext';
import { toCmsHref } from '../cms/cmsPages';
import { CmsSection } from '../cms/CmsSection';
import { IncludeList } from '../components/IncludeList';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';
import { entryFocal } from '../cms/cmsFocal';
import { resolveOccasions } from '../lib/occasions';
import { offerHref, resolveOfferStories } from '../lib/offers';

export function OccasionPage() {
  const { occasionId } = useParams();
  const cms = useCms();
  const hotel = useHotel();
  const page = useSection('occasions_page');
  const offersPage = useSection('offers_page');
  const homeOffers = useSection('offers');
  const occasion = resolveOccasions(page?.items).find((item) => item.id === occasionId);

  useEffect(() => {
    if (!occasion) return;
    const previous = document.title;
    document.title = `${occasion.name} | ${hotel?.name ?? ''}`;
    window.scrollTo({ top: 0 });
    return () => {
      document.title = previous;
    };
  }, [occasion, hotel?.name]);

  if (!occasion) {
    return <Navigate to={cms ? '/cms/anlaesse' : '/anlaesse'} replace />;
  }

  const prefix = `items.${occasion.id}`;
  // Links to offers show as offer cards; everything else as a text link.
  const offers = resolveOfferStories(offersPage?.items, homeOffers?.items);
  const linked = occasion.links.map((link, index) => ({
    link,
    index,
    offer: offers.find((offer) => offerHref(offer.id) === link.href.split(/[?#]/)[0]) ?? null,
  }));
  const offerCards = linked.filter((entry) => entry.offer);
  const textLinks = linked.filter((entry) => !entry.offer);
  const hrefFor = (href: string) => (cms ? toCmsHref(href) : href);

  return (
    <CmsSection sectionKey="occasions_page" label="Anlass">
      <main>
        <SubpageHero
          image={occasion.hero_image}
          imageAlt={occasion.hero_image_alt}
          eyebrow={occasion.kicker}
          title={occasion.name}
          subtitle={occasion.summary}
          focal={entryFocal(page?.items, occasion.id)}
          cms={{
            image: `${prefix}.hero_image`,
            eyebrow: `${prefix}.kicker`,
            title: `${prefix}.name`,
            subtitle: `${prefix}.summary`,
            section: 'occasions_page',
            focalPath: `${prefix}.hero_focal`,
          }}
        >
          <div className="wellness-topic occasion">
            <div className="wellness-topic__copy">
              {occasion.text.map((paragraph, index) => (
                <p key={`${paragraph}-${index}`} data-cms-path={`${prefix}.text.${index}`}>{paragraph}</p>
              ))}

              {occasion.details.length ? (
                <dl className="wellness-topic__facts">
                  {occasion.details.map((fact, index) => (
                    <div key={`${fact.label}-${index}`}>
                      <dt data-cms-path={`${prefix}.details.${index}.label`}>{fact.label}</dt>
                      <dd data-cms-path={`${prefix}.details.${index}.value`}>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              <IncludeList items={occasion.includes} pathPrefix={`${prefix}.includes`} />

              {offerCards.length ? (
                <section className="occasion__offers" aria-label="Passende Angebote">
                  <h2 className="occasion__heading heading-font">Passende Angebote</h2>
                  <div className="occasion__offer-grid">
                    {offerCards.map(({ link, index, offer }) => (
                      <a
                        key={`${link.href}-${index}`}
                        className="occasion__offer"
                        href={hrefFor(link.href)}
                        data-cms-focus={`links:${index}`}
                        {...(cms ? { 'data-cms-nav': '' } : {})}
                      >
                        {offer!.image ? <img loading="lazy" decoding="async" src={offer!.image} alt={offer!.image_alt} /> : null}
                        <span className="occasion__offer-body">
                          <span className="occasion__offer-title heading-font">{link.label || offer!.title}</span>
                          {offer!.subtitle ? <span className="occasion__offer-sub">{offer!.subtitle}</span> : null}
                          {offer!.details.length ? <span className="occasion__offer-meta">{offer!.details.join(' · ')}</span> : null}
                        </span>
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}

              {textLinks.length ? (
                <section className="occasion__more" aria-label="Mehr dazu">
                  <h2 className="occasion__heading heading-font">Mehr dazu</h2>
                  <div className="wellness-topic__links">
                    {textLinks.map(({ link, index }) => (
                      <span key={`${link.href}-${index}`} data-cms-focus={`links:${index}`}>
                        <TextCta href={link.href} newTab={link.new_tab}>{link.label || link.href}</TextCta>
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              {occasion.community.length ? (
                <section className="occasion__community" aria-label="Tipps aus der Community">
                  <h2 className="occasion__heading heading-font">Tipps aus der Community</h2>
                  <div className="occasion__tips">
                    {occasion.community.map((tip, index) => (
                      <figure key={`${tip.text}-${index}`} className="occasion__tip" data-cms-focus={`community:${index}`}>
                        {tip.image ? <img loading="lazy" decoding="async" src={tip.image} alt="" /> : null}
                        <blockquote data-cms-path={`${prefix}.community.${index}.text`}>{tip.text}</blockquote>
                        {tip.author || tip.href ? (
                          <figcaption>
                            {tip.author ? <span data-cms-path={`${prefix}.community.${index}.author`}>{tip.author}</span> : null}
                            {tip.href ? (
                              <TextCta href={tip.href} newTab>
                                Zum Beitrag
                              </TextCta>
                            ) : null}
                          </figcaption>
                        ) : null}
                      </figure>
                    ))}
                  </div>
                </section>
              ) : null}

              {occasion.faqs.length ? (
                <section className="occasion__faq" aria-label="Häufige Fragen">
                  <h2 className="occasion__heading heading-font">Gut zu wissen</h2>
                  {occasion.faqs.map((faq, index) => (
                    <details key={`${faq.question}-${index}`} className="occasion__question">
                      <summary data-cms-path={`${prefix}.faqs.${index}.question`}>{faq.question}</summary>
                      <p data-cms-path={`${prefix}.faqs.${index}.answer`}>{faq.answer}</p>
                    </details>
                  ))}
                </section>
              ) : null}

              <div className="wellness-topic__links occasion__cta">
                <TextCta href={occasion.cta_href || '#buchung'}>{occasion.cta || 'Jetzt buchen'}</TextCta>
                <TextCta href="/anlaesse">Alle Anlässe</TextCta>
              </div>
            </div>
          </div>
        </SubpageHero>
      </main>
    </CmsSection>
  );
}
