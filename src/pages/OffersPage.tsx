import { useEffect } from 'react';
import { CmsSection } from '../cms/CmsSection';
import { IncludeList } from '../components/IncludeList';
import { Reveal } from '../components/Reveal';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';
import { OFFERS_PAGE_FALLBACK, offerHref, resolveOfferStories } from '../lib/offers';

export function OffersPage() {
  const hotel = useHotel();
  const page = useSection('offers_page');
  const homeOffers = useSection('offers');
  const data = page ?? OFFERS_PAGE_FALLBACK;
  const items = resolveOfferStories(data.items, homeOffers?.items);

  useEffect(() => {
    const previous = document.title;
    document.title = `${data.title ?? 'Angebote'} | ${hotel?.name ?? 'ambassador hotel & spa'}`;
    window.scrollTo({ top: 0 });
    return () => {
      document.title = previous;
    };
  }, [data.title, hotel?.name]);

  const adviceHref = hotel?.email ? `mailto:${hotel.email}` : '#buchung';

  return (
    <CmsSection sectionKey="offers_page" label="Angebote">
    <main>
      <SubpageHero
        image={data.hero_image ?? OFFERS_PAGE_FALLBACK.hero_image}
        imageAlt={data.hero_image_alt ?? OFFERS_PAGE_FALLBACK.hero_image_alt}
        eyebrow={page?.eyebrow ?? OFFERS_PAGE_FALLBACK.eyebrow}
        title={page?.title ?? page?.title_line1 ?? OFFERS_PAGE_FALLBACK.title}
        subtitle={page?.subtitle ?? page?.title_script ?? OFFERS_PAGE_FALLBACK.subtitle}
      >
        <div className="offers-page">
          {data.intro ? <p className="offers-page__intro" data-cms-focus="intro" data-cms-path="intro">{data.intro}</p> : null}

          <section className="offers-page__pair" aria-label="Aktuelle Angebote">
            {items.map((item, index) => (
              <Reveal key={item.id} delay={index * 80}>
                <article className="offers-page__story" id={item.id} data-cms-focus={`items:${index}`}>
                  <figure className="offers-page__photo" data-cms-path={`items.${item.id}.image`} data-cms-kind="image">
                    <img src={item.image} alt={item.image_alt} />
                  </figure>
                  <p className="offers-page__kicker" data-cms-path={`items.${item.id}.title`}>{item.title}</p>
                  <h2 className="offers-page__name heading-font" data-cms-path={`items.${item.id}.subtitle`}>{item.subtitle}</h2>
                  <p className="offers-page__text" data-cms-path={`items.${item.id}.text`}>{item.text}</p>
                  <IncludeList items={item.includes} />
                  {item.details.length ? (
                    <div className="offers-page__meta">
                      {item.details.map((detail) => (
                        <p key={detail}>{detail}</p>
                      ))}
                    </div>
                  ) : null}
                  <div className="offers-page__links">
                    <TextCta href={offerHref(item.id)}>Details</TextCta>
                    <TextCta href="#buchung">Jetzt buchen</TextCta>
                  </div>
                </article>
              </Reveal>
            ))}
          </section>

          <section className="offers-page__note" data-cms-focus="note">
            <h2 className="offers-page__note-title heading-font" data-cms-path="note_title">
              {data.note_title ?? OFFERS_PAGE_FALLBACK.note_title}
            </h2>
            <p className="offers-page__note-text" data-cms-path="note_text">
              {data.note_text ?? OFFERS_PAGE_FALLBACK.note_text}
            </p>
            <TextCta href={data.note_cta_href ?? adviceHref}>
              {data.note_cta ?? OFFERS_PAGE_FALLBACK.note_cta}
            </TextCta>
          </section>
        </div>
      </SubpageHero>
    </main>
    </CmsSection>
  );
}
