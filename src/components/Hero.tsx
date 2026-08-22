import { useEffect, useState } from 'react';
import { AvailabilityBar } from './AvailabilityBar';
import { useSection } from '../context/HotelContext';

export function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const data = useSection('hero');

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!data) return null;

  return (
    <section className="hero" id="top">
      <div
        className="hero__bg"
        style={{ transform: `translateY(${scrollY * 0.35}px) scale(${1 + scrollY * 0.0002})` }}
      >
        <img src={data.hero_image} alt={data.hero_image_alt || ''} />
        <div className="hero__overlay" />
      </div>

      <div className="hero__content">
        <h1 className="hero__title">{data.title}</h1>
        <p className="hero__subtitle">{data.subtitle}</p>
      </div>

      <AvailabilityBar />
    </section>
  );
}
