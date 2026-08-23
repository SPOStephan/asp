import { AvailabilityBar } from './AvailabilityBar';
import { useSection } from '../context/HotelContext';

export function Hero() {
  const data = useSection('hero');

  if (!data) return null;

  return (
    <section className="hero" id="top">
      <div className="hero__visual">
        <div className="hero__bg">
          <img src={data.hero_image} alt={data.hero_image_alt || ''} />
          <div className="hero__overlay" />
        </div>

        <div className="hero__content">
          <h1 className="hero__title">{data.title}</h1>
          <p className="hero__subtitle">{data.subtitle}</p>
        </div>
      </div>

      <AvailabilityBar />
    </section>
  );
}
