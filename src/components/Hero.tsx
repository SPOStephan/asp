import type { CSSProperties } from 'react';
import { CmsHeroPan } from '../cms/CmsHeroPan';
import { CmsSection } from '../cms/CmsSection';
import { heroFocalStyle } from '../cms/cmsFocal';
import { useSection } from '../context/HotelContext';
import { AvailabilityBar } from './AvailabilityBar';

export function Hero() {
  const data = useSection('hero');

  if (!data) return null;

  const style = heroFocalStyle(data.hero_focal) as CSSProperties;

  return (
    <CmsSection sectionKey="hero" label="Hero">
    <section className="hero" id="top" style={style}>
      <div className="hero__visual">
        <CmsHeroPan section="hero" path="hero_focal" value={data.hero_focal}>
          <div className="hero__bg" data-cms-focus="image" data-cms-path="hero_image" data-cms-kind="image">
            <img src={data.hero_image} alt={data.hero_image_alt || ''} draggable={false} />
            <div className="hero__overlay" />
          </div>
        </CmsHeroPan>

        <div className="hero__content">
          <h1 className="hero__title" data-cms-focus="title" data-cms-path="title">{data.title}</h1>
          <p className="hero__subtitle" data-cms-focus="subtitle" data-cms-path="subtitle">{data.subtitle}</p>
        </div>
      </div>

      <AvailabilityBar />
    </section>
    </CmsSection>
  );
}
