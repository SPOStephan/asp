import type { CSSProperties } from 'react';
import { useCms } from '../cms/CmsContext';
import { CmsHeroPan } from '../cms/CmsHeroPan';
import { CmsSection } from '../cms/CmsSection';
import { heroFocalStyle } from '../cms/cmsFocal';
import { useHotel, useSection } from '../context/HotelContext';
import { MUSTER_MEDIA, resolveMedia } from '../lib/media';
import { AvailabilityBar } from './AvailabilityBar';
import { SubpageHero } from './SubpageHero';

// Same breakpoint as the phone crop of the hero in index.css.
export const HERO_MOBILE_MEDIA = '(max-width: 600px)';

// 0–100 in the CMS -> 0–1 for CSS.
export function fadeStrength(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) / 100 : 0;
}

// Script line above the home title until the hotel writes its own; cleared = no line.
export const HOME_EYEBROW = 'Ankommen';
// Heading position on the home picture, % of the screen height from the top.
export const HOME_TEXT_TOP = 55;

export function heroTextTop(value: unknown) {
  const number = Number(value);
  return (Number.isFinite(number) && value !== '' && value != null ? Math.min(75, Math.max(25, number)) : HOME_TEXT_TOP) / 100;
}

// Home page hero. Default: like the sub-pages (the heading stays in the middle of the
// screen, turns dark at the picture's edge and lands in the page). "classic" keeps the
// earlier version (text fades in on the picture), switchable per hotel in the CMS.
export function Hero() {
  const data = useSection('hero') ?? {};
  return data.layout === 'classic' ? <HeroClassic /> : <HeroFlow />;
}

function useHeroMedia(data: Record<string, unknown>) {
  const hotel = useHotel();
  const cms = useCms();
  const mobileImage = typeof data.hero_image_mobile === 'string' ? data.hero_image_mobile.trim() : '';
  return {
    image: resolveMedia(data.hero_image as string | undefined, MUSTER_MEDIA.hero),
    mobileImage,
    editPath: mobileImage && cms?.focalPreview === 'mobile' ? 'hero_image_mobile' : 'hero_image',
    fadeVars: {
      '--hero-fade-color': hotel?.primary_color || 'var(--primary-500)',
      '--hero-fade-desktop': String(fadeStrength(data.fade_desktop)),
      '--hero-fade-mobile': String(fadeStrength(data.fade_mobile)),
    },
  };
}

function HeroFlow() {
  const data = useSection('hero') ?? {};
  const media = useHeroMedia(data);
  return (
    <CmsSection sectionKey="hero" label="Hero">
      <section className="hero-flow" id="top">
        <SubpageHero
          image={media.image}
          imageMobile={media.mobileImage}
          imageAlt={data.hero_image_alt || ''}
          eyebrow={typeof data.eyebrow === 'string' ? data.eyebrow : HOME_EYEBROW}
          title={data.title ?? ''}
          subtitle={data.subtitle}
          focal={data.hero_focal}
          cms={{ section: 'hero', image: media.editPath }}
          style={media.fadeVars}
          imageOverlay={<div className="hero__fade" />}
          imageFooter={<AvailabilityBar />}
          textTop={heroTextTop(data.text_top)}
        />
      </section>
    </CmsSection>
  );
}

function HeroClassic() {
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
