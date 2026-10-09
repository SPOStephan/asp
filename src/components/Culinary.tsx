import { useState } from 'react';
import { CmsSection } from '../cms/CmsSection';
import { Reveal } from './Reveal';
import { Plus, Minus } from 'lucide-react';
import { TextCta } from './TextCta';
import { culinaryVenueHref } from '../lib/culinary';
import { MUSTER_MEDIA, resolveMedia } from '../lib/media';
import { useSection } from '../context/HotelContext';

interface Restaurant {
  image: string;
  alt: string;
  eyebrow: string;
  name: string;
}

function venueHref(name: string) {
  if (/grill/i.test(name)) return culinaryVenueHref('grill');
  if (/strand/i.test(name)) return culinaryVenueHref('strandstube');
  return culinaryVenueHref('restaurant');
}

export function Culinary() {
  const [expanded, setExpanded] = useState(false);
  const data = useSection('culinary');

  if (!data) return null;

  const restaurants: Restaurant[] = data.restaurants ?? [];
  const extraText = typeof data.extra_text === 'string' ? data.extra_text.trim() : '';
  // An empty button text removes the button; without the field the old default stays.
  const ctaText = typeof data.cta === 'string' ? data.cta.trim() : 'Alle Restaurants';
  const ctaHref = (typeof data.cta_href === 'string' && data.cta_href.trim()) || '/kulinarik';

  return (
    <CmsSection sectionKey="culinary" label="Kulinarik">
    <section className="culinary" id="kulinarik">
      <Reveal>
        <div className="culinary__hero" data-cms-focus="title_line1">
          <img loading="lazy" decoding="async" src={resolveMedia(data.hero_image, MUSTER_MEDIA.culinary)} alt={data.hero_image_alt || ''} />
          <div className="culinary__hero-overlay" />
          <div className="culinary__hero-content">
            <p className="eyebrow">{data.eyebrow}</p>
            <h2 className="culinary__title heading-font">
              {data.title_line1}<br />
              <em>{data.title_line2_em}</em>
            </h2>
          </div>
        </div>
      </Reveal>

      <div className="container">
        <div className="culinary__body">
          <Reveal>
            <div className="culinary__text" data-cms-focus="text">
              <p>{data.text}</p>

              {extraText && expanded && (
                <div className="culinary__extra">
                  <p>{extraText}</p>
                </div>
              )}

              {/* "Mehr lesen" only when there is more to read. */}
              {extraText ? (
                <button
                  className="culinary__toggle"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <><Minus size={16} strokeWidth={1.5} /> Weniger</>
                  ) : (
                    <><Plus size={16} strokeWidth={1.5} /> Mehr lesen</>
                  )}
                </button>
              ) : null}

              {ctaText ? (
                <span data-cms-focus="cta">
                  <TextCta href={ctaHref}>{ctaText}</TextCta>
                </span>
              ) : null}
            </div>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <div className="culinary__images">
            {restaurants.map((r, index) => (
              <a className="culinary__img-block" key={r.name} href={venueHref(r.name)} data-cms-focus={`restaurants:${index}`}>
                <img loading="lazy" decoding="async" src={r.image} alt={r.alt} />
                <div className="culinary__img-label">
                  <p className="eyebrow">{r.eyebrow}</p>
                  <h3 className="heading-font">{r.name}</h3>
                </div>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
    </CmsSection>
  );
}
