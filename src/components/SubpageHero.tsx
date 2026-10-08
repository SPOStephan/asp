import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useCms as useCmsContext } from '../cms/CmsContext';
import { CmsHeroPan } from '../cms/CmsHeroPan';
import { heroFocalStyle } from '../cms/cmsFocal';
import { isCmsFrame } from '../cms/cmsFrame';

interface SubpageHeroCms {
  image?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  section?: string;
  focalPath?: string;
}

interface SubpageHeroProps {
  image: string;
  // Optional own picture for phones.
  imageMobile?: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  // Rest of the heading after the title, e.g. a second line with a script word.
  titleLine2?: ReactNode;
  subtitle?: string;
  focal?: unknown;
  cms?: SubpageHeroCms;
  // Extra CSS variables, e.g. the colour gradient of the home page.
  style?: Record<string, string>;
  // Sits at the bottom edge of the picture (the booking bar on the home page).
  imageFooter?: ReactNode;
  // Layer between picture and text (the colour gradient).
  imageOverlay?: ReactNode;
  // Where the heading stands, as a share of the screen height from the top.
  textTop?: number;
  children?: ReactNode;
}

export function SubpageHero({
  image,
  imageMobile,
  imageAlt,
  eyebrow,
  title,
  titleLine2,
  subtitle,
  focal,
  cms,
  style,
  imageFooter,
  imageOverlay,
  textTop = 0.45,
  children,
}: SubpageHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const editing = Boolean(useCmsContext());
  const [imageBottom, setImageBottom] = useState(0);
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const hero = heroRef.current;
      if (!hero) return;
      const bottom = hero.getBoundingClientRect().bottom;
      // Inside the CMS preview iframe the iframe itself is the screen; its .cms-stage is as
      // tall as the whole page and must not count as one.
      const stage = isCmsFrame() ? null : hero.closest('.cms-device') || hero.closest('.cms-stage');
      const frame = stage instanceof HTMLElement ? stage : null;
      const vh = frame?.clientHeight || window.innerHeight;
      const frameWidth = frame?.clientWidth || window.innerWidth;
      const flowTopPadding = frameWidth <= 768 ? 80 : 120;
      setImageBottom(Math.max(0, Math.min(vh, bottom)));
      setDocked(bottom <= vh * textTop - flowTopPadding);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const stage = heroRef.current?.closest('.cms-device') || heroRef.current?.closest('.cms-stage');
    const preview = heroRef.current?.closest('.cms-preview');
    const observer = stage instanceof HTMLElement ? new ResizeObserver(onScroll) : null;
    if (stage instanceof HTMLElement) observer?.observe(stage);
    preview?.addEventListener('scroll', onScroll, { passive: true });
    stage?.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      preview?.removeEventListener('scroll', onScroll);
      stage?.removeEventListener('scroll', onScroll);
      observer?.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [textTop]);

  const cssVars = {
    '--image-bottom': `${imageBottom}px`,
    '--hero-text-top': `${textTop * 100}vh`,
    ...heroFocalStyle(focal),
    ...style,
  } as CSSProperties & {
    '--image-bottom': string;
  };

  const imagePath = cms?.image ?? 'hero_image';
  const eyebrowPath = cms?.eyebrow ?? 'eyebrow';
  const titlePath = cms?.title ?? 'title';
  const subtitlePath = cms?.subtitle ?? 'subtitle';

  const Headline = ({ editable = false }: { editable?: boolean }) => (
    <>
      {eyebrow || (editable && editing) ? (
        <p className="subpage-hero__eyebrow" {...(editable ? { 'data-cms-focus': 'head', 'data-cms-path': eyebrowPath } : {})}>{eyebrow}</p>
      ) : null}
      <h1 className="subpage-hero__title" {...(editable ? { 'data-cms-focus': 'title', 'data-cms-path': titlePath } : {})}>{title}{titleLine2}</h1>
      {subtitle || (editable && editing) ? <p className="subpage-hero__subtitle" {...(editable ? { 'data-cms-focus': 'subtitle', 'data-cms-path': subtitlePath } : {})}>{subtitle}</p> : null}
    </>
  );

  return (
    <div className="subpage-hero" style={cssVars}>
      <CmsHeroPan section={cms?.section ?? ''} path={cms?.focalPath ?? 'hero_focal'} value={focal}>
      <div className={`subpage-hero__image${imageFooter ? ' has-footer' : ''}`} ref={heroRef} data-cms-focus="image" data-cms-path={imagePath} data-cms-kind="image">
        <picture>
          {imageMobile ? <source media="(max-width: 600px)" srcSet={imageMobile} /> : null}
          <img
            src={image}
            alt={imageAlt}
            width={1080}
            height={692}
            fetchPriority="high"
            decoding="async"
            draggable={false}
          />
        </picture>
        <div className="subpage-hero__overlay" />
        {imageOverlay}
        {imageFooter ? <div className="subpage-hero__footer">{imageFooter}</div> : null}
      </div>
      </CmsHeroPan>

      <div className={`subpage-hero__flow${docked ? ' is-docked' : ''}`}>
        <div className="subpage-hero__text subpage-hero__text--dark subpage-hero__text--flow">
          <Headline editable />
        </div>
      </div>

      <div className={`subpage-hero__fixed${docked ? ' is-hidden' : ''}`} aria-hidden={docked}>
        <div className="subpage-hero__clip subpage-hero__clip--white">
          <div className="subpage-hero__text subpage-hero__text--white"><Headline /></div>
        </div>
        <div className="subpage-hero__clip subpage-hero__clip--dark">
          <div className="subpage-hero__text subpage-hero__text--dark"><Headline /></div>
        </div>
      </div>

      {children}
    </div>
  );
}
