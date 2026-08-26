import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface SubpageHeroProps {
  image: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function SubpageHero({
  image,
  imageAlt,
  eyebrow,
  title,
  subtitle,
  children,
}: SubpageHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [imageBottom, setImageBottom] = useState(0);
  const [docked, setDocked] = useState(false);

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

  const cssVars = { '--image-bottom': `${imageBottom}px` } as CSSProperties & {
    '--image-bottom': string;
  };

  const Headline = (
    <>
      <p className="subpage-hero__eyebrow" data-cms-focus="head" data-cms-path="eyebrow">{eyebrow}</p>
      <h1 className="subpage-hero__title" data-cms-focus="title" data-cms-path="title">{title}</h1>
      {subtitle ? <p className="subpage-hero__subtitle" data-cms-focus="subtitle" data-cms-path="subtitle">{subtitle}</p> : null}
    </>
  );

  return (
    <div className="subpage-hero" style={cssVars}>
      <div className="subpage-hero__image" ref={heroRef} data-cms-focus="image">
        <img
          src={image}
          alt={imageAlt}
          width={1080}
          height={692}
          fetchPriority="high"
          decoding="async"
        />
        <div className="subpage-hero__overlay" />
      </div>

      <div className={`subpage-hero__flow${docked ? ' is-docked' : ''}`}>
        <div className="subpage-hero__text subpage-hero__text--dark subpage-hero__text--flow">
          {Headline}
        </div>
      </div>

      <div className={`subpage-hero__fixed${docked ? ' is-hidden' : ''}`} aria-hidden={docked}>
        <div className="subpage-hero__clip subpage-hero__clip--white">
          <div className="subpage-hero__text subpage-hero__text--white">{Headline}</div>
        </div>
        <div className="subpage-hero__clip subpage-hero__clip--dark">
          <div className="subpage-hero__text subpage-hero__text--dark">{Headline}</div>
        </div>
      </div>

      {children}
    </div>
  );
}
