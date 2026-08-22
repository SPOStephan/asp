import { useState } from 'react';
import { Reveal } from './Reveal';
import { Plus, Minus } from 'lucide-react';
import { useSection } from '../context/HotelContext';

interface Restaurant {
  image: string;
  alt: string;
  eyebrow: string;
  name: string;
}

export function Culinary() {
  const [expanded, setExpanded] = useState(false);
  const data = useSection('culinary');

  if (!data) return null;

  const restaurants: Restaurant[] = data.restaurants ?? [];

  return (
    <section className="culinary" id="kulinarik">
      <Reveal>
        <div className="culinary__hero">
          <img src={data.hero_image} alt={data.hero_image_alt || ''} />
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
            <div className="culinary__text">
              <p>{data.text}</p>

              {expanded && (
                <div className="culinary__extra">
                  <p>{data.extra_text}</p>
                </div>
              )}

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
            </div>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <div className="culinary__images">
            {restaurants.map((r) => (
              <div className="culinary__img-block" key={r.name}>
                <img src={r.image} alt={r.alt} />
                <div className="culinary__img-label">
                  <p className="eyebrow">{r.eyebrow}</p>
                  <h3 className="heading-font">{r.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
