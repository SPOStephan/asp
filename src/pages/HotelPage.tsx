import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { useCms } from '../cms/CmsContext';
import { toCmsHref } from '../cms/cmsPages';
import { CmsPart, CmsSection } from '../cms/CmsSection';
import { Crest } from '../components/Crest';
import { InlineText } from '../components/InlineText';
import { Reveal } from '../components/Reveal';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useHotelContent, useSection } from '../context/HotelContext';
import { filled } from '../lib/filled';
import {
  ARRIVAL_ID,
  HOTEL_PAGE_FALLBACK,
  hotelFaqs,
  mapsEmbedSrc,
  mapsSearchHref,
  resolveAreas,
  resolveChapters,
  resolveFigures,
  resolveWays,
} from '../lib/hotelPage';
import { PLACEHOLDER_IMAGE } from '../lib/media';
import { usePageTop } from '../lib/usePageTop';
import '../styles/hotel.css';

// The map only after a click: until then nothing goes to Google.
function ArrivalMap({ image, alt, src }: { image: string; alt: string; src: string }) {
  const [open, setOpen] = useState(false);
  if (!src) return null;
  if (open) {
    return (
      <div className="hotel-arrival__map is-open">
        <iframe src={src} title="Karte" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      </div>
    );
  }
  return (
    <div className="hotel-arrival__map" data-cms-path="map_image" data-cms-kind="image">
      {image ? <img src={image} alt={alt} loading="lazy" decoding="async" /> : <div className="hotel-arrival__map-blank" aria-hidden="true" />}
      <div className="hotel-arrival__map-load">
        <button type="button" className="text-cta" onClick={() => setOpen(true)}>
          <MapPin size={16} strokeWidth={1.5} aria-hidden="true" /> KARTE LADEN
        </button>
        <p>Beim Laden der Karte werden Daten an Google übertragen.</p>
      </div>
    </div>
  );
}

export function HotelPage() {
  usePageTop();
  const cms = useCms();
  const hotel = useHotel();
  const { content, isPageEnabled } = useHotelContent();
  const page = useSection('hotel_page');
  const data = { ...HOTEL_PAGE_FALLBACK, ...page };
  const figures = resolveFigures(data.figures);
  const chapters = resolveChapters(data.story);
  const ways = resolveWays(data.arrival_ways);
  const areas = resolveAreas(data.areas, content?.sections ?? {}, isPageEnabled);
  // Own tiles can be edited on the page; the automatic ones show the pictures of their pages.
  const ownAreas = Array.isArray(page?.areas) && page.areas.length > 0;
  const faqs = hotelFaqs(content?.faqs ?? [], data.faq_ids);
  const routeHref = mapsSearchHref(hotel?.name, hotel?.address);
  const hero = String(data.hero_image || areas[0]?.image || PLACEHOLDER_IMAGE);
  const link = (href: string) => (cms ? toCmsHref(href) : href);

  // "/hotel#anreise" (the pin in the header): straight to that part.
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    return () => window.clearTimeout(timer);
  }, [hash]);

  useEffect(() => {
    const previous = document.title;
    document.title = `${data.title || 'Das Hotel'} | ${hotel?.name ?? ''}`;
    return () => {
      document.title = previous;
    };
  }, [data.title, hotel?.name]);

  return (
    <CmsSection sectionKey="hotel_page" label="Hotel">
      <main className="hotel-page">
        <SubpageHero
          image={hero}
          imageAlt={String(data.hero_image_alt || data.title)}
          eyebrow={String(data.eyebrow || hotel?.name || '')}
          title={String(data.title || 'Das Hotel')}
          subtitle={String(data.subtitle || '')}
          focal={page?.hero_focal}
          cms={{ section: 'hotel_page' }}
        >
          <div className="hotel-page__body">
            <CmsPart sectionKey="hotel_page" part="intro" label="Einleitung" empty={!filled(data.intro)}>
              <section className="hotel-intro container" id="haus">
                <p className="hotel-intro__text" data-cms-focus="intro" data-cms-path="intro">
                  <InlineText text={String(data.intro || '')} />
                </p>
              </section>
            </CmsPart>

            <CmsPart sectionKey="hotel_page" part="figures" label="Das Haus in Zahlen" empty={!figures.length}>
              <section className="hotel-figures container" id="zahlen" aria-labelledby="hotel-figures-title">
                <h2 className="hotel-section__title heading-font" id="hotel-figures-title" data-cms-path="figures_title">
                  {data.figures_title}
                </h2>
                <dl className="hotel-figures__list">
                  {figures.map((figure, index) => (
                    <Reveal key={`${figure.value}-${index}`} delay={index * 40}>
                      <div className="hotel-figure" data-cms-focus={`figures:${index}`}>
                        <dt className="hotel-figure__value heading-font" data-cms-path={`figures.${index}.value`}>{figure.value}</dt>
                        <dd className="hotel-figure__label" data-cms-path={`figures.${index}.label`}>{figure.label}</dd>
                      </div>
                    </Reveal>
                  ))}
                </dl>
              </section>
            </CmsPart>

            <CmsPart sectionKey="hotel_page" part="story" label="Geschichte" empty={!chapters.length}>
              <section className="hotel-story" id="geschichte" aria-labelledby="hotel-story-title">
                <Crest className="crest-mark--story" />
                <div className="container hotel-story__inner">
                  <header className="hotel-story__head">
                    <p className="eyebrow" data-cms-path="story_eyebrow">{data.story_eyebrow}</p>
                    <h2 className="hotel-section__title heading-font" id="hotel-story-title" data-cms-path="story_title">
                      {data.story_title}
                    </h2>
                    {data.story_intro || cms ? (
                      <p className="hotel-story__intro" data-cms-path="story_intro">
                        <InlineText text={String(data.story_intro || '')} />
                      </p>
                    ) : null}
                  </header>
                  <ol className="hotel-story__list">
                    {chapters.map((chapter, index) => (
                      <li key={`${chapter.year}-${index}`} className="hotel-chapter" data-cms-focus={`story:${index}`}>
                        <span className="hotel-chapter__year heading-font" data-cms-path={`story.${index}.year`}>{chapter.year}</span>
                        <div className="hotel-chapter__copy">
                          <h3 className="hotel-chapter__title" data-cms-path={`story.${index}.title`}>{chapter.title}</h3>
                          <p className="hotel-chapter__text" data-cms-path={`story.${index}.text`}>
                            <InlineText text={chapter.text} />
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  {data.story_quote ? (
                    <figure className="hotel-story__quote">
                      <blockquote className="heading-font" data-cms-path="story_quote">„{data.story_quote}“</blockquote>
                      {data.story_quote_source ? <figcaption data-cms-path="story_quote_source">{data.story_quote_source}</figcaption> : null}
                    </figure>
                  ) : null}
                </div>
              </section>
            </CmsPart>

            <CmsPart sectionKey="hotel_page" part="areas" label="Das Haus entdecken" empty={!areas.length}>
              <section className="hotel-areas container" id="bereiche" aria-labelledby="hotel-areas-title">
                <h2 className="hotel-section__title heading-font" id="hotel-areas-title" data-cms-path="areas_title">
                  {data.areas_title}
                </h2>
                <div className="hotel-areas__grid">
                  {areas.map((area, index) => (
                    <Reveal key={area.href} delay={index * 50}>
                      <a
                        className="hotel-area"
                        href={link(area.href)}
                        data-cms-focus={`areas:${index}`}
                        {...(cms ? { 'data-cms-nav': '' } : {})}
                      >
                        <figure className="hotel-area__image" {...(ownAreas ? { 'data-cms-path': `areas.${index}.image`, 'data-cms-kind': 'image' } : {})}>
                          {area.image ? <img loading="lazy" decoding="async" src={area.image} alt={area.image_alt} /> : null}
                        </figure>
                        <div className="hotel-area__caption">
                          <h3 className="hotel-area__title heading-font" {...(ownAreas ? { 'data-cms-path': `areas.${index}.title` } : {})}>{area.title}</h3>
                          {area.text ? <p className="hotel-area__text" {...(ownAreas ? { 'data-cms-path': `areas.${index}.text` } : {})}>{area.text}</p> : null}
                        </div>
                        <span className="hotel-area__arrow" aria-hidden="true">
                          <ArrowUpRight size={18} strokeWidth={1.5} />
                        </span>
                      </a>
                    </Reveal>
                  ))}
                </div>
              </section>
            </CmsPart>

            <CmsPart sectionKey="hotel_page" part="arrival" label="Anreise & Lage" empty={!filled(hotel?.address ?? '', data.arrival_intro) && !ways.length}>
              <section className="hotel-arrival" id={ARRIVAL_ID} aria-labelledby="hotel-arrival-title">
                <div className="container hotel-arrival__inner">
                  <div className="hotel-arrival__copy">
                    <p className="eyebrow" data-cms-path="arrival_eyebrow">{data.arrival_eyebrow}</p>
                    <h2 className="hotel-section__title heading-font" id="hotel-arrival-title" data-cms-path="arrival_title">
                      {data.arrival_title}
                    </h2>
                    <address className="hotel-arrival__address">
                      <strong>{hotel?.name}</strong>
                      {hotel?.address ? <span>{hotel.address}</span> : null}
                      {hotel?.phone ? <a href={`tel:${hotel.phone.replace(/[^\d+]/g, '')}`}>{hotel.phone}</a> : null}
                    </address>
                    {routeHref ? (
                      <a className="hotel-arrival__route" href={routeHref} target="_blank" rel="noopener noreferrer" data-cms-path="route_label">
                        <MapPin size={16} strokeWidth={1.5} aria-hidden="true" />
                        {String(data.route_label || 'ROUTE PLANEN').toUpperCase()}
                      </a>
                    ) : null}
                    {data.arrival_intro || cms ? (
                      <p className="hotel-arrival__intro" data-cms-path="arrival_intro">
                        <InlineText text={String(data.arrival_intro || '')} />
                      </p>
                    ) : null}
                    <div className="hotel-arrival__ways">
                      {ways.map((way, index) => (
                        <div key={`${way.title}-${index}`} className="hotel-way" data-cms-focus={`arrival_ways:${index}`}>
                          <h3 className="hotel-way__title" data-cms-path={`arrival_ways.${index}.title`}>{way.title}</h3>
                          <p className="hotel-way__text" data-cms-path={`arrival_ways.${index}.text`}>
                            <InlineText text={way.text} />
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ArrivalMap image={String(data.map_image || '')} alt={String(data.map_image_alt || `Karte: ${hotel?.name ?? ''}`)} src={mapsEmbedSrc(hotel?.name, hotel?.address)} />
                </div>
              </section>
            </CmsPart>

            <CmsPart sectionKey="hotel_page" part="faq" label="Häufige Fragen" empty={!faqs.length}>
              <section className="hotel-faq container" id="fragen" aria-labelledby="hotel-faq-title">
                <h2 className="hotel-section__title heading-font" id="hotel-faq-title" data-cms-path="faq_title">
                  {data.faq_title}
                </h2>
                <div className="faq__list">
                  {faqs.map((item) => (
                    <details key={item.id} className="faq__item" data-cms-focus="faq_ids">
                      <summary className="faq__question">
                        <span>{item.question}</span>
                        <span className="faq__icon" aria-hidden="true" />
                      </summary>
                      <div className="faq__answer">
                        <p>{item.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
                {isPageEnabled('faqs') ? (
                  <div className="hotel-faq__more">
                    <TextCta href="/faqs">ALLE FRAGEN</TextCta>
                  </div>
                ) : null}
              </section>
            </CmsPart>
          </div>
        </SubpageHero>
      </main>
    </CmsSection>
  );
}
