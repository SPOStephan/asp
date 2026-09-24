import { useEffect, useMemo, useState } from 'react';
import { CmsSection } from '../cms/CmsSection';
import { useCms } from '../cms/CmsContext';
import { GalleryViewer } from '../components/GalleryViewer';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';
import {
  classifyImpressionShape,
  filterImpressions,
  IMPRESSION_TOPICS,
  IMPRESSIONS_PAGE_FALLBACK,
  packImpressions,
  resolveImpressions,
  type ImpressionShape,
  type ImpressionTopic,
} from '../lib/impressions';

export function ImpressionsPage() {
  const hotel = useHotel();
  const cms = useCms();
  const page = useSection('impressions_page');
  const data = page ?? IMPRESSIONS_PAGE_FALLBACK;
  const shots = resolveImpressions(page?.items);
  const [topic, setTopic] = useState<ImpressionTopic | 'alle'>('alle');
  const [active, setActive] = useState<number | null>(null);
  const [shapes, setShapes] = useState<Record<string, ImpressionShape>>({});
  const visible = filterImpressions(shots, topic);
  const packed = useMemo(() => packImpressions(visible, shapes), [visible, shapes]);

  useEffect(() => {
    const previous = document.title;
    document.title = `${data.title ?? 'Impressionen'} | ${hotel?.name ?? 'ambassador hotel & spa'}`;
    window.scrollTo({ top: 0 });
    return () => {
      document.title = previous;
    };
  }, [data.title, hotel?.name]);

  useEffect(() => {
    setActive(null);
  }, [topic]);

  useEffect(() => {
    let cancelled = false;
    shots.forEach((shot) => {
      if (shot.shape) {
        setShapes((current) => ({ ...current, [shot.src]: shot.shape as ImpressionShape }));
        return;
      }
      const image = new Image();
      image.onload = () => {
        if (cancelled) return;
        const next = classifyImpressionShape(image.naturalWidth, image.naturalHeight);
        setShapes((current) => (current[shot.src] === next ? current : { ...current, [shot.src]: next }));
      };
      image.src = shot.src;
    });
    return () => {
      cancelled = true;
    };
  }, [shots]);

  const step = (delta: number) => {
    setActive((index) => {
      if (index === null || !packed.length) return 0;
      return (index + delta + packed.length) % packed.length;
    });
  };

  return (
    <CmsSection sectionKey="impressions_page" label="Impressionen">
    <main>
      <SubpageHero
        image={data.hero_image ?? IMPRESSIONS_PAGE_FALLBACK.hero_image}
        imageAlt={data.hero_image_alt ?? IMPRESSIONS_PAGE_FALLBACK.hero_image_alt}
        eyebrow={page?.eyebrow ?? IMPRESSIONS_PAGE_FALLBACK.eyebrow}
        title={page?.title ?? IMPRESSIONS_PAGE_FALLBACK.title}
        subtitle={page?.subtitle ?? IMPRESSIONS_PAGE_FALLBACK.subtitle}
        focal={data.hero_focal}
        cms={{ section: 'impressions_page' }}
      >
        <article className="impressions-page">
          <p className="impressions-page__intro" data-cms-focus="intro" data-cms-path="intro">
            {data.intro ?? IMPRESSIONS_PAGE_FALLBACK.intro}
          </p>

          <div className="impressions-page__filters" role="tablist" aria-label="Motive">
            {IMPRESSION_TOPICS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={topic === item.id}
                className={`impressions-page__filter${topic === item.id ? ' is-active' : ''}`}
                onClick={() => setTopic(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="impressions-page__grid">
            {packed.map((shot, index) => {
              const itemIndex = shots.findIndex((item) => item.src === shot.src);
              return (
              <button
                key={shot.src}
                type="button"
                className={`impressions-page__shot is-${shot.role}`}
                aria-label={shot.alt}
                data-cms-focus={itemIndex >= 0 ? `items:${itemIndex}` : undefined}
                data-cms-path={itemIndex >= 0 ? `items.${itemIndex}.src` : undefined}
                data-cms-kind="image"
                onClick={() => setActive(index)}
              >
                <img src={shot.src} alt="" />
                <span className="impressions-page__shot-label" data-cms-path={itemIndex >= 0 ? `items.${itemIndex}.alt` : undefined}>{shot.alt}</span>
              </button>
              );
            })}
          </div>

          <div className="impressions-page__note" data-cms-focus="note">
            <h2 className="impressions-page__note-title heading-font" data-cms-path="note_title">
              {data.note_title ?? IMPRESSIONS_PAGE_FALLBACK.note_title}
            </h2>
            <p className="impressions-page__note-text" data-cms-path="note_text">
              {data.note_text ?? IMPRESSIONS_PAGE_FALLBACK.note_text}
            </p>
            <TextCta href={data.note_cta_href ?? IMPRESSIONS_PAGE_FALLBACK.note_cta_href}>
              {data.note_cta ?? IMPRESSIONS_PAGE_FALLBACK.note_cta}
            </TextCta>
          </div>
        </article>
      </SubpageHero>

      {active !== null && !cms ? (
        <GalleryViewer shots={packed} active={active} onClose={() => setActive(null)} onStep={step} />
      ) : null}
    </main>
    </CmsSection>
  );
}
