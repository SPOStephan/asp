import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CmsSection } from '../cms/CmsSection';
import { useCms } from '../cms/CmsContext';
import { useSection } from '../context/HotelContext';
import { PLACEHOLDER_IMAGE } from '../lib/media';

interface DayItem {
  time?: string;
  unit?: string;
  title?: string;
  text?: string;
  image?: string;
  image_alt?: string;
}

const pad = (value: number) => String(value).padStart(2, '0');

// Idea from the benchmark (Hotel Hubertus, G136): "Ein Tag in unserem Hotel" – the day as stations,
// each with time, short text and picture; the next picture peeks in at the right. All texts
// and pictures come from the CMS section "day_story"; without entries nothing is shown
// (in the CMS an empty frame invites to fill it).
export function DayStory() {
  const data = useSection('day_story');
  const cms = useCms();
  const items: DayItem[] = Array.isArray(data?.items) ? data.items : [];
  const [index, setIndex] = useState(0);

  if (!items.length && !cms) return null;

  const count = items.length;
  const at = count ? Math.min(index, count - 1) : 0;
  const item = items[at] ?? {};
  const next = count > 1 ? items[(at + 1) % count] : null;
  const go = (step: number) => setIndex((current) => (Math.min(current, count - 1) + step + count) % count);
  const path = `items.${at}`;

  return (
    <CmsSection sectionKey="day_story" label="Ein Tag im Hotel">
      <section className="day-story" aria-roledescription="Karussell" aria-label={data?.title || 'Ein Tag in unserem Hotel'}>
        <div className="day-story__head">
          {data?.eyebrow ? <p className="eyebrow" data-cms-path="eyebrow">{data.eyebrow}</p> : null}
          <h2 className="day-story__title heading-font" data-cms-path="title">{data?.title || 'Ein Tag in unserem Hotel'}</h2>
        </div>
        {count ? (
          <div className="day-story__stage">
            <figure className="day-story__image" key={`img-${at}`}>
              <img
                loading="lazy"
                decoding="async"
                src={item.image || PLACEHOLDER_IMAGE}
                alt={item.image_alt || ''}
                data-cms-path={`${path}.image`}
                data-cms-kind="image"
              />
            </figure>
            <div className="day-story__copy" aria-live="polite" key={`copy-${at}`}>
              <p className="day-story__time">
                <span data-cms-path={`${path}.time`}>{item.time}</span>
                {item.unit ? <small data-cms-path={`${path}.unit`}>{item.unit}</small> : null}
              </p>
              {item.title ? <h3 className="day-story__name" data-cms-path={`${path}.title`}>{item.title}</h3> : null}
              {item.text ? <p className="day-story__text" data-cms-path={`${path}.text`}>{item.text}</p> : null}
              {count > 1 ? (
                <div className="day-story__nav">
                  <button type="button" onClick={() => go(-1)} aria-label="Vorherige Station">
                    <ArrowLeft size={18} strokeWidth={1.2} />
                  </button>
                  <span className="day-story__count">
                    {pad(at + 1)} / {pad(count)}
                  </span>
                  <button type="button" onClick={() => go(1)} aria-label="Nächste Station">
                    <ArrowRight size={18} strokeWidth={1.2} />
                  </button>
                </div>
              ) : null}
            </div>
            {next ? (
              <button type="button" className="day-story__next" onClick={() => go(1)} aria-label={`Weiter: ${next.time ?? ''} ${next.unit ?? ''}`}>
                <img loading="lazy" decoding="async" src={next.image || PLACEHOLDER_IMAGE} alt="" />
              </button>
            ) : null}
          </div>
        ) : (
          <p className="day-story__empty">Noch keine Stationen – im CMS unter „Ein Tag im Hotel“ anlegen (Uhrzeit, Titel, Text, Bild).</p>
        )}
      </section>
    </CmsSection>
  );
}
