import { Reveal } from './Reveal';
import { TextCta } from './TextCta';
import { useSection } from '../context/HotelContext';

interface HighlightItem {
  image: string;
  title: string;
  text: string;
  link: string;
  href?: string;
}

function highlightHref(item: HighlightItem) {
  if (item.href) return item.href;
  if (item.link === 'Restaurants entdecken') return '/kulinarik';
  if (item.link === 'Zum Wellnessbereich') return '/wellness';
  return undefined;
}

export function Highlights() {
  const data = useSection('highlights');

  if (!data) return null;

  const items: HighlightItem[] = data.items ?? [];

  return (
    <section className="highlights" id="highlights">
      <div className="container">
        <Reveal>
          <div className="highlights__head">
            <p className="eyebrow">{data.eyebrow}</p>
            <h2 className="highlights__title heading-font">
              {data.title_line1}<br />
              <em>{data.title_line2_em}</em>
            </h2>
          </div>
        </Reveal>
      </div>

      <div className="highlights__list">
        {items.map((h, i) => (
          <Reveal key={i} delay={i * 60}>
            <article className={`hcard ${i % 2 === 1 ? 'hcard--reverse' : ''}`}>
              <div className="hcard__text">
                <h3 className="hcard__title heading-font">{h.title}</h3>
                <p className="hcard__desc">{h.text}</p>
                <TextCta className="hcard__link" href={highlightHref(h)}>
                  {h.link}
                </TextCta>
              </div>
              <div className="hcard__image">
                <img src={h.image} alt={h.title} />
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
