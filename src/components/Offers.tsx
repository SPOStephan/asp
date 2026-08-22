import { useEffect, useRef, useState } from 'react';
import { Reveal } from './Reveal';
import { useSection } from '../context/HotelContext';

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
  title_before: 'Unsere besten Angebote für Ihre',
  title_script: 'Nordsee-Ferien',
  items: [
    {
      title: 'Wellnessurlaub',
      subtitle: 'Auszeit am Meer',
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
  const items: OfferItem[] = data.items ?? FALLBACK.items;

  return (
    <section className="offers" id="angebote" aria-label="Aktuelle Angebote">
      <Reveal>
        <h2 className="offers__headline heading-font">
          {data.title_before}{' '}
          <span className="offers__script">{data.title_script}</span>
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
                      <a key={link.label} className="offers__link link-underline" href={link.href}>
                        {link.label}
                      </a>
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
