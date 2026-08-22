import { useEffect, useRef, useState } from 'react';
import { useSection } from '../context/HotelContext';

interface CollageItem {
  src: string;
  alt: string;
  className: string;
}

export function Wellness() {
  const sectionRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [sideImagesVisible, setSideImagesVisible] = useState(false);
  const [textOpacity, setTextOpacity] = useState(0);
  const data = useSection('wellness');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSideImagesVisible(true);
      },
      { threshold: 0.12 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    let raf = 0;
    const update = () => {
      raf = 0;
      const section = sectionRef.current;
      if (!section) return;
      const distance = section.offsetHeight - window.innerHeight;
      if (distance <= 0) return;
      const travelled = Math.min(Math.max(-section.getBoundingClientRect().top, 0), distance);
      const progress = travelled / distance;

      setExpanded(progress >= 0.12);
      setTextOpacity(Math.min(Math.max((progress - 0.18) / 0.15, 0), 1));
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
      observer.disconnect();
    };
  }, []);

  if (!data) return null;

  const collageItems: CollageItem[] = data.collage_items ?? [];

  return (
    <section className="wellness-scene" id="wellness" ref={sectionRef}>
      <div className="wellness-scene__sticky">
        <div className={`wellness-scene__heading${expanded ? ' is-hidden' : ''}`}>
          <p className="eyebrow">{data.eyebrow}</p>
          <h2 className="wellness-scene__title heading-font">{data.title}</h2>
        </div>

        <div className={`wellness-scene__collage${sideImagesVisible ? ' is-visible' : ''}`} aria-hidden="true">
          {collageItems.map((item, i) => (
            <img
              key={item.src}
              className={`${item.className}${expanded ? ' is-pushed' : ''}`}
              src={item.src}
              alt={item.alt}
              style={{ transitionDelay: sideImagesVisible && !expanded ? `${i * 100}ms` : undefined }}
            />
          ))}
          <div className={`wellness-scene__hero${expanded ? ' is-expanded' : ''}`}>
            <img src={data.hero_image} alt={data.hero_image_alt || ''} />
          </div>
        </div>

        <div className="wellness-scene__copy" style={{ opacity: textOpacity }}>
          <p className="eyebrow">{data.copy_eyebrow}</p>
          <h3 className="heading-font">{data.copy_title}</h3>
          <p>{data.copy_text}</p>
        </div>
      </div>
    </section>
  );
}
