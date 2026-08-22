import { Reveal } from './Reveal';
import { useSection } from '../context/HotelContext';

interface HighlightItem {
  image: string;
  title: string;
  text: string;
  link: string;
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
                <button className="hcard__link link-underline">{h.link}</button>
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
