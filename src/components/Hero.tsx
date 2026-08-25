import type { CSSProperties } from 'react';
import { CmsSection } from '../cms/CmsSection';
import { useSection } from '../context/HotelContext';
import { AvailabilityBar } from './AvailabilityBar';

export function Hero() {
  const data = useSection('hero');

  if (!data) return null;

  const focal = data.hero_focal;
  const style =
    focal && Number.isFinite(Number(focal.x)) && Number.isFinite(Number(focal.y))
      ? ({ '--hero-focal': `${Number(focal.x)}% ${Number(focal.y)}%` } as CSSProperties)
      : undefined;

  return (
    <CmsSection sectionKey="hero" label="Hero">
    <section className="hero" id="top" style={style}>
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
    </CmsSection>
  );
}
