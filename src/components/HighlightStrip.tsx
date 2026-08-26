import { useEffect, useRef, useState } from 'react';
import { Zap, Bike, BedDouble, Dog, MapPin, Sparkles, type LucideIcon } from 'lucide-react';
import { CmsSection } from '../cms/CmsSection';
import { useSection } from '../context/HotelContext';

const iconMap: Record<string, LucideIcon> = {
  MapPin,
  BedDouble,
  Sparkles,
  Bike,
  Dog,
  Zap,
};

interface HighlightItem {
  icon: string;
  title: string;
  text: string;
}

export function HighlightStrip() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const data = useSection('highlight_strip');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '-40px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const items: HighlightItem[] = data?.items ?? [];

  return (
    <CmsSection sectionKey="highlight_strip" label="Highlight-Leiste">
    <div className="welcome__highlights" aria-label="Das Resort auf einen Blick" ref={ref}>
      {items.map(({ icon, title, text }, i) => {
        const Icon = iconMap[icon] ?? Sparkles;
        return (
          <div
            className={`welcome__highlight ${visible ? 'welcome__highlight--in' : ''}`}
            style={{ transitionDelay: `${i * 120}ms` }}
            key={title}
            data-cms-focus={`items:${i}`}
          >
            <div className="welcome__highlight-icon">
              <Icon size={30} strokeWidth={1.25} />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        );
      })}
    </div>
    </CmsSection>
  );
}
