import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useSection } from '../context/HotelContext';

const WELLNESS_HERO_IMAGE = '/hotel-nordsee-wellness02.webp';

export function WellnessPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [imageBottom, setImageBottom] = useState(0);
  const [docked, setDocked] = useState(false);
  const data = useSection('wellness_page');

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const hero = heroRef.current;
      if (!hero) return;
      const bottom = hero.getBoundingClientRect().bottom;
      const vh = window.innerHeight;
      const flowTopPadding = window.innerWidth <= 768 ? 80 : 120;
      setImageBottom(Math.max(0, Math.min(vh, bottom)));
      setDocked(bottom <= vh * 0.45 - flowTopPadding);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (!data) return null;

  const cssVars = { '--image-bottom': `${imageBottom}px` } as CSSProperties & { '--image-bottom': string };

  const HeadlineContent = () => (
    <>
      <p className="wellness-page__eyebrow">{data.eyebrow}</p>
      <h1 className="wellness-page__title">{data.title}</h1>
      <p className="wellness-page__subtitle">{data.subtitle}</p>
    </>
  );

  return (
    <div className="wellness-page" style={cssVars}>
      <div className="wellness-page__hero" ref={heroRef}>
        <img
          src={WELLNESS_HERO_IMAGE}
          alt={data.hero_image_alt || ''}
          width={1080}
          height={692}
          fetchPriority="high"
          decoding="async"
        />
        <div className="wellness-page__overlay" />
      </div>

      <div className={`wellness-page__flow-headline${docked ? ' is-docked' : ''}`}>
        <div className="wellness-page__text wellness-page__text--dark wellness-page__text--flow">
          <HeadlineContent />
        </div>
      </div>

      <div className={`wellness-page__fixed-layer${docked ? ' is-hidden' : ''}`} aria-hidden={docked}>
        <div className="wellness-page__clip wellness-page__clip--white">
          <div className="wellness-page__text wellness-page__text--white">
            <HeadlineContent />
          </div>
        </div>
        <div className="wellness-page__clip wellness-page__clip--dark">
          <div className="wellness-page__text wellness-page__text--dark">
            <HeadlineContent />
          </div>
        </div>
      </div>

      <div className="wellness-page__content">
        <div className="container">
          <p className="eyebrow">{data.content_eyebrow}</p>
          <h2 className="heading-font" style={{ marginTop: '8px' }}>{data.content_title}</h2>
          <p style={{ maxWidth: '640px', marginTop: '24px', lineHeight: 1.7 }}>
            {data.content_text}
          </p>
        </div>
      </div>
    </div>
  );
}
