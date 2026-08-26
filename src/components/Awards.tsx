import { CmsSection } from '../cms/CmsSection';
import { Reveal } from './Reveal';
import { TextCta } from './TextCta';
import { useSection } from '../context/HotelContext';

interface AwardItem {
  src: string;
  label: string;
}

interface Impression {
  src: string;
  alt: string;
}

const FALLBACK_IMPRESSIONS: Impression[] = [
  { src: '/collage-pool.webp', alt: 'Poolbereich mit Blick ins Weite' },
  { src: '/autumn-aerial.webp', alt: 'Luftaufnahme der Nordseeküste' },
  { src: '/collage-dining1.webp', alt: 'Kulinarik im Hotel' },
  { src: '/teaser-yoga.webp', alt: 'Yoga und Auszeit' },
  { src: '/teaser-suite.webp', alt: 'Suite im ambassador hotel & spa' },
  { src: '/collage-terrace.webp', alt: 'Terrasse am Abend' },
  { src: '/collage-night.webp', alt: 'Das Hotel bei Nacht' },
  { src: '/family-welcome.webp', alt: 'Ankommen im Nordsee-Hotel' },
];

export function Awards() {
  const data = useSection('awards');

  if (!data) return null;

  const items: AwardItem[] = data.items ?? [];
  const impressions: Impression[] = data.impressions?.length
    ? data.impressions
    : FALLBACK_IMPRESSIONS;

  return (
    <CmsSection sectionKey="awards" label="Awards">
    <section className="awards">
      <div className="container">
        <Reveal>
          <div className="awards__head" data-cms-focus="title">
            <p className="eyebrow">{data.eyebrow}</p>
            <h2 className="awards__title heading-font">{data.title}</h2>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="awards__row">
            {items.map((a, i) => (
              <article key={i} className="awards__item" data-cms-focus={`items:${i}`}>
                <img src={a.src} alt={a.label} />
                <p>{a.label}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal delay={80}>
        <div className="awards__impressions" id="impressionen">
          <h2 className="awards__impressions-title heading-font" data-cms-focus="impressions_title">
            <span className="awards__script">{data.impressions_script || 'Impressionen'}</span>
            <br />
            {data.impressions_title || 'aus Ihrem Nordsee-Hotel'}
          </h2>
          <div className="awards__shots">
            {impressions.map((shot, index) => (
              <figure key={shot.src} className="awards__shot" data-cms-focus={`impressions:${index}`}>
                <img src={shot.src} alt={shot.alt} />
              </figure>
            ))}
          </div>
          <div className="awards__cta">
            <TextCta className="text-cta--on-dark" href="/impressionen">
              {data.impressions_cta || 'Alle Impressionen'}
            </TextCta>
          </div>
        </div>
      </Reveal>
    </section>
    </CmsSection>
  );
}
