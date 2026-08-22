import { Reveal } from './Reveal';
import { useSection } from '../context/HotelContext';

interface GenImage {
  src: string;
  alt: string;
  label: string;
  caption: string;
  className?: string;
}

export function Generations() {
  const data = useSection('generations');

  if (!data) return null;

  const images: GenImage[] = data.images ?? [];

  return (
    <section className="generations" id="suiten">
      <div className="container">
        <Reveal>
          <div className="generations__head">
            <p className="eyebrow">{data.eyebrow}</p>
            <h2 className="generations__title heading-font">
              {data.title_line1}<br />
              <em>{data.title_line2_em}</em>
            </h2>
            <p className="generations__subtitle">{data.subtitle}</p>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="generations__masonry">
            {images.map((img, i) => (
              <article key={i} className={`generations__item ${img.className || ''}`}>
                <img src={img.src} alt={img.alt} />
                <div className="generations__overlay">
                  <p className="generations__label">{img.label}</p>
                  <p className="generations__caption">{img.caption}</p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
