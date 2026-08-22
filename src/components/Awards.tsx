import { Reveal } from './Reveal';
import { useSection } from '../context/HotelContext';

interface AwardItem {
  src: string;
  label: string;
}

export function Awards() {
  const data = useSection('awards');

  if (!data) return null;

  const items: AwardItem[] = data.items ?? [];

  return (
    <section className="awards">
      <div className="container">
        <Reveal>
          <div className="awards__head">
            <p className="eyebrow">{data.eyebrow}</p>
            <h2 className="awards__title heading-font">{data.title}</h2>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="awards__row">
            {items.map((a, i) => (
              <article key={i} className="awards__item">
                <img src={a.src} alt={a.label} />
                <p>{a.label}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
