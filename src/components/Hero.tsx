import type { CSSProperties } from 'react';
import { useCms } from '../cms/CmsContext';
import { CmsHeroPan } from '../cms/CmsHeroPan';
import { CmsSection } from '../cms/CmsSection';
import { heroFocalStyle } from '../cms/cmsFocal';
import { useHotel, useSection } from '../context/HotelContext';
import { MUSTER_MEDIA, resolveMedia } from '../lib/media';
import { AvailabilityBar } from './AvailabilityBar';

// Same breakpoint as the phone crop of the hero in index.css.
export const HERO_MOBILE_MEDIA = '(max-width: 600px)';

// 0–100 in the CMS -> 0–1 for CSS.
export function fadeStrength(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) / 100 : 0;
}

export function Hero() {
  const data = useSection('hero') ?? {};

  const hotel = useHotel();
  // Gradient in the hotel colour at the bottom edge: calms a busy motif under the text.
  const style = {
    ...heroFocalStyle(data.hero_focal),
    '--hero-fade-color': hotel?.primary_color || 'var(--primary-500)',
    '--hero-fade-desktop': String(fadeStrength(data.fade_desktop)),
    '--hero-fade-mobile': String(fadeStrength(data.fade_mobile)),
  } as CSSProperties;
  const image = resolveMedia(data.hero_image, MUSTER_MEDIA.hero);
  // Optional own picture for phones (hotels that only work in portrait).
  const mobileImage = typeof data.hero_image_mobile === 'string' ? data.hero_image_mobile.trim() : '';
  const cms = useCms();
  const editPath = mobileImage && cms?.focalPreview === 'mobile' ? 'hero_image_mobile' : 'hero_image';

  return (
    <CmsSection sectionKey="hero" label="Hero">
    <section className="hero" id="top" style={style}>
      <div className="hero__visual">
        <CmsHeroPan section="hero" path="hero_focal" value={data.hero_focal}>
          <div className="hero__bg" data-cms-focus="image" data-cms-path={editPath} data-cms-kind="image">
            <picture>
              {mobileImage ? <source media={HERO_MOBILE_MEDIA} srcSet={mobileImage} /> : null}
              <img fetchPriority="high" decoding="async" src={image} alt={data.hero_image_alt || ''} draggable={false} />
            </picture>
            <div className="hero__overlay" />
            <div className="hero__fade" />
          </div>
          <div className="hero__content">
            <h1 className="hero__title" data-cms-focus="title" data-cms-path="title">{data.title}</h1>
            <p className="hero__subtitle" data-cms-focus="subtitle" data-cms-path="subtitle">{data.subtitle}</p>
          </div>
        </CmsHeroPan>
      </div>

      <AvailabilityBar />
    </section>
    </CmsSection>
  );
}
