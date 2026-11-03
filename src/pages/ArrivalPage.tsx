import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { CmsPart, CmsSection } from '../cms/CmsSection';
import { InlineText } from '../components/InlineText';
import { SubpageHero } from '../components/SubpageHero';
import { useHotel, useHotelContent, useSection } from '../context/HotelContext';
import { filled } from '../lib/filled';
import { ARRIVAL_PAGE_FALLBACK, arrivalFaqs, mapsEmbedSrc, mapsSearchHref, resolveWays } from '../lib/arrivalPage';
import { PLACEHOLDER_IMAGE } from '../lib/media';
import { usePageTop } from '../lib/usePageTop';
import { FaqList, useHashScroll } from './sharedParts';
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

export function ArrivalPage() {
  usePageTop();
  useHashScroll();
  const hotel = useHotel();
  const { content, isPageEnabled } = useHotelContent();
  const page = useSection('arrival_page');
  const data = { ...ARRIVAL_PAGE_FALLBACK, ...page };
  const ways = resolveWays(data.ways);
  const faqs = arrivalFaqs(content?.faqs ?? [], data.faq_ids);
  const routeHref = mapsSearchHref(hotel?.name, hotel?.address);

  useEffect(() => {
    const previous = document.title;
    document.title = `${data.eyebrow || 'Anreise'} | ${hotel?.name ?? ''}`;
    return () => {
      document.title = previous;
    };
  }, [data.eyebrow, hotel?.name]);

  return (
    <CmsSection sectionKey="arrival_page" label="Anreise">
      <main className="hotel-page">
        <SubpageHero
          image={String(data.hero_image || PLACEHOLDER_IMAGE)}
          imageAlt={String(data.hero_image_alt || data.title)}
          eyebrow={String(data.eyebrow || '')}
          title={String(data.title || 'So finden Sie zu uns')}
          subtitle={String(data.subtitle || '')}
          focal={page?.hero_focal}
          cms={{ section: 'arrival_page' }}
        >
          <div className="hotel-page__body">
            <section className="hotel-arrival" id="anreise" aria-label="Anreise">
              <div className="container hotel-arrival__inner">
                <div className="hotel-arrival__copy">
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
                  <CmsPart sectionKey="arrival_page" part="intro" label="Text zur Lage" empty={!filled(data.intro)}>
                    <p className="hotel-arrival__intro" data-cms-focus="intro" data-cms-path="intro">
                      <InlineText text={String(data.intro || '')} />
                    </p>
                  </CmsPart>
                  <CmsPart sectionKey="arrival_page" part="ways" label="Wege" empty={!ways.length}>
                    <div className="hotel-arrival__ways">
                      <h2 className="hotel-arrival__ways-title heading-font" data-cms-path="ways_title">{data.ways_title}</h2>
                      {ways.map((way, index) => (
                        <div key={`${way.title}-${index}`} className="hotel-way" data-cms-focus={`ways:${index}`}>
                          <h3 className="hotel-way__title" data-cms-path={`ways.${index}.title`}>{way.title}</h3>
                          <p className="hotel-way__text" data-cms-path={`ways.${index}.text`}>
                            <InlineText text={way.text} />
                          </p>
                        </div>
                      ))}
                    </div>
                  </CmsPart>
                </div>
                <ArrivalMap image={String(data.map_image || '')} alt={String(data.map_image_alt || `Karte: ${hotel?.name ?? ''}`)} src={mapsEmbedSrc(hotel?.name, hotel?.address)} />
              </div>
            </section>

            <CmsPart sectionKey="arrival_page" part="faq" label="Fragen zu Anreise und Parken" empty={!faqs.length}>
              <FaqList id="fragen" title={String(data.faq_title)} faqs={faqs} more={isPageEnabled('faqs')} />
            </CmsPart>
          </div>
        </SubpageHero>
      </main>
    </CmsSection>
  );
}
