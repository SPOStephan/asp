import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { CmsSection } from '../cms/CmsSection';
import { resolveCmsIcon } from '../cms/cmsIcons';
import { useSection } from '../context/HotelContext';

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
        const Icon = resolveCmsIcon(icon, Sparkles);
        return (
          <div
            className={`welcome__highlight ${visible ? 'welcome__highlight--in' : ''}`}
            style={{ transitionDelay: `${i * 120}ms` }}
            key={title}
            data-cms-focus={`items:${i}`}
          >
            <div className="welcome__highlight-icon" data-cms-path={`items.${i}.icon`} data-cms-kind="icon">
              <Icon size={30} strokeWidth={1.25} />
            </div>
            <h3 data-cms-path={`items.${i}.title`}>{title}</h3>
            <p data-cms-path={`items.${i}.text`}>{text}</p>
          </div>
        );
      })}
    </div>
    </CmsSection>
  );
}
