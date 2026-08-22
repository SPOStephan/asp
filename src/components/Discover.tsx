import { Reveal } from './Reveal';
import { ArrowUpRight } from 'lucide-react';
import { useSection } from '../context/HotelContext';

interface DiscoverTile {
  image: string;
  eyebrow: string;
  title: string;
  href: string;
}

export function Discover() {
  const data = useSection('discover');

  if (!data) return null;

  const tiles: DiscoverTile[] = data.tiles ?? [];

  return (
    <section className="discover" id="discover">
      <Reveal className="discover__feature-pair">
        <div className="discover__feature-image discover__feature-image--left">
          <img src={data.feature_image_left} alt={data.feature_image_left_alt || ''} />
        </div>
        <div className="discover__feature-image discover__feature-image--right">
          <img src={data.feature_image_right} alt={data.feature_image_right_alt || ''} />
        </div>
      </Reveal>

      <div className="container">
        <Reveal>
          <div className="discover__head">
            <p className="eyebrow">{data.eyebrow}</p>
            <h2 className="discover__title heading-font">
              {data.title}
            </h2>
            <p className="discover__subtitle">{data.subtitle}</p>
          </div>
        </Reveal>
      </div>

      <div className="discover__grid">
        {tiles.map((tile, i) => (
          <Reveal key={tile.title} delay={i * 70}>
            <a className="discover__tile" href={tile.href}>
              <div className="discover__tile-image">
                <img src={tile.image} alt={tile.title} loading="lazy" />
              </div>
              <div className="discover__tile-overlay" />
              <div className="discover__tile-content">
                <p className="discover__tile-eyebrow">{tile.eyebrow}</p>
                <h3 className="discover__tile-title">{tile.title}</h3>
              </div>
              <div className="discover__tile-arrow" aria-hidden="true">
                <ArrowUpRight size={22} strokeWidth={1.5} />
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
