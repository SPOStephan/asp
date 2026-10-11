import { useEffect, useRef, useState } from 'react';
import { CmsSection } from '../cms/CmsSection';
import { useCms } from '../cms/CmsContext';
import { Reveal } from './Reveal';
import { TextCta } from './TextCta';
import { useSection } from '../context/HotelContext';

const OFFER_TEXT = '';

interface OfferLink {
  label: string;
  href: string;
  new_tab?: boolean;
}

interface OfferItem {
  title: string;
  subtitle?: string;
  text?: string;
  details?: string[];
  links?: OfferLink[];
  image_primary: string;
  image_primary_alt: string;
  image_secondary: string;
  image_secondary_alt: string;
}

// A hotel without its own offers section shows none (never another hotel's offers).
const FALLBACK: { title_line1: string; title_line2: string; title_script: string; items: OfferItem[] } = {
  title_line1: 'Unsere besten Angebote',
  title_line2: '',
  title_script: '',
  items: [],
};

function offerHeadline(data: {
  title_line1?: string;
  title_line2?: string;
  title_before?: string;
  title_script?: string;
}) {
  const line1 = data.title_line1 ?? 'Unsere besten Angebote';
  const leftover = (data.title_before ?? '').replace(/^Unsere besten Angebote\s*/i, '').trim();
  const line2 = data.title_line2 ?? leftover ?? 'für Ihre';
  return {
    line1,
    line2: line2 || 'für Ihre',
    script: data.title_script ?? FALLBACK.title_script,
  };
}

function OfferVisual({
  item,
  from,
}: {
  item: OfferItem;
  from: 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '-8% 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`offers__visual offers__visual--${from}${visible ? ' is-in' : ''}`}
    >
      <figure className="offers__photo offers__photo--primary">
        <img loading="lazy" decoding="async" src={item.image_primary} alt={item.image_primary_alt} />
      </figure>
      <figure className="offers__photo offers__photo--secondary">
        <img loading="lazy" decoding="async" src={item.image_secondary} alt={item.image_secondary_alt} />
      </figure>
    </div>
  );
}

export function Offers() {
  const editing = Boolean(useCms());
  const cms = useSection('offers');
  const data: Record<string, any> = cms ?? FALLBACK;
  const items: OfferItem[] = (data.items ?? FALLBACK.items).map((item, index) => ({
    ...item,
    text: item.text ?? FALLBACK.items[index]?.text ?? OFFER_TEXT,
  }));
  const headline = offerHeadline(data);

  if (!items.length && !editing) return null;

  return (
    <CmsSection sectionKey="offers" label="Angebote">
    <section className="offers" id="angebote" aria-label="Aktuelle Angebote">
      <Reveal>
        <h2 className="offers__headline heading-font" data-cms-focus="title_line1">
          {headline.line1}
          <br />
          {headline.line2}{' '}
          <span className="offers__script">{headline.script}</span>
        </h2>
      </Reveal>

      <div className="offers__list">
        {items.map((item, index) => {
          const imagesLeft = index % 2 === 0;
          return (
            <article
              key={item.title}
              className={`offers__row${imagesLeft ? '' : ' offers__row--reverse'}`}
              data-cms-focus={`items:${index}`}
            >
              <OfferVisual item={item} from={imagesLeft ? 'left' : 'right'} />
              <Reveal className="offers__copy" delay={80}>
                <p className="offers__title">{item.title}</p>
                {item.subtitle ? (
                  <h3 className="offers__subtitle heading-font">{item.subtitle}</h3>
                ) : null}
                {item.text ? <p className="offers__text">{item.text}</p> : null}
                {item.details?.length ? (
                  <div className="offers__details">
                    {item.details.map((detail) => (
                      <p key={detail}>{detail}</p>
                    ))}
                  </div>
                ) : null}
                {item.links?.length ? (
                  <div className="offers__links">
                    {item.links.map((link) => (
                      <TextCta key={link.label} href={link.href} newTab={link.new_tab === true}>
                        {link.label}
                      </TextCta>
                    ))}
                  </div>
                ) : null}
              </Reveal>
            </article>
          );
        })}
      </div>
    </section>
    </CmsSection>
  );
}
