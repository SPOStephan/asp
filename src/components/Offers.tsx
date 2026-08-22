import { useEffect, useRef, useState } from 'react';
import { Reveal } from './Reveal';
import { TextCta } from './TextCta';
import { useSection } from '../context/HotelContext';

const OFFER_TEXT =
  'Genießen Sie zwei Übernachtungen an der Nordsee mit 50 € Wellnessguthaben und mehr …';

interface OfferLink {
  label: string;
  href: string;
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

const FALLBACK = {
  title_line1: 'Unsere besten Angebote',
  title_line2: 'für Ihre',
  title_script: 'Nordsee-Ferien',
  items: [
    {
      title: 'Wellnessurlaub',
      subtitle: 'Auszeit am Meer',
      text: OFFER_TEXT,
      details: ['3 Nächte', 'ab 655 Euro pro Person'],
      links: [
        { label: 'Mehr erfahren', href: '#buchung' },
        { label: 'Jetzt buchen', href: '#buchung' },
      ],
      image_primary: '/teaser-suite.webp',
      image_primary_alt: 'Suite im ambassador hotel & spa',
      image_secondary: '/collage-dining1.webp',
      image_secondary_alt: 'Kulinarik im Hotel',
    },
    {
      title: 'Feiertage',
      subtitle: 'Weihnachten mit Meerblick',
      text: OFFER_TEXT,
      details: ['3 Nächte', 'ab 655 Euro pro Person'],
      links: [
        { label: 'Mehr erfahren', href: '#buchung' },
        { label: 'Jetzt buchen', href: '#buchung' },
      ],
      image_primary: '/collage-pool.webp',
      image_primary_alt: 'Poolbereich im ambassador hotel & spa',
      image_secondary: '/teaser-spa.webp',
      image_secondary_alt: 'Wellness und Spa',
    },
  ] satisfies OfferItem[],
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
        <img src={item.image_primary} alt={item.image_primary_alt} />
      </figure>
      <figure className="offers__photo offers__photo--secondary">
        <img src={item.image_secondary} alt={item.image_secondary_alt} />
      </figure>
    </div>
  );
}

export function Offers() {
  const cms = useSection('offers');
  const data = cms ?? FALLBACK;
  const items: OfferItem[] = (data.items ?? FALLBACK.items).map((item, index) => ({
    ...item,
    text: item.text ?? FALLBACK.items[index]?.text ?? OFFER_TEXT,
  }));
  const headline = offerHeadline(data);

  return (
    <section className="offers" id="angebote" aria-label="Aktuelle Angebote">
      <Reveal>
        <h2 className="offers__headline heading-font">
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
                      <TextCta key={link.label} href={link.href}>
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
  );
}
