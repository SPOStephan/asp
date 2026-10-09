import { CmsSection } from '../cms/CmsSection';
import { Reveal } from './Reveal';
import { TextCta } from './TextCta';
import { useSection } from '../context/HotelContext';

interface Shot {
  src: string;
  alt: string;
}

// Impressions used to live inside the awards section. Until a hotel's data has been moved
// (migration 031), the old fields there still fill this section.
function legacyFromAwards(awards: Record<string, any> | null): Record<string, any> {
  if (!awards?.impressions) return {};
  return {
    script: awards.impressions_script,
    title: awards.impressions_title,
    cta: awards.impressions_cta,
    cta_href: '/impressionen',
    images: awards.impressions,
  };
}

export function Impressions() {
  const own = useSection('impressions');
  const awards = useSection('awards');
  const data = { ...legacyFromAwards(awards), ...own };
  const images: Shot[] = (Array.isArray(data.images) ? data.images : []).filter((shot: Shot) => shot?.src);

  if (!own && !images.length) return null;

  return (
    <CmsSection sectionKey="impressions" label="Impressionen">
      <section className="impressions" id="impressionen">
        <Reveal delay={80}>
          <div className="impressions__inner">
            <h2 className="impressions__title heading-font" data-cms-focus="title">
              {data.script ? (
                <>
                  <span className="impressions__script">{data.script}</span>
                  <br />
                </>
              ) : null}
              {data.title}
            </h2>
            <div className="impressions__shots">
              {images.map((shot, index) => (
                <figure key={`${shot.src}-${index}`} className="impressions__shot" data-cms-focus={`images:${index}`}>
                  <img loading="lazy" decoding="async" src={shot.src} alt={shot.alt} />
                </figure>
              ))}
            </div>
            {data.cta ? (
              <div className="impressions__cta">
                <TextCta className="text-cta--on-dark" href={data.cta_href || '/impressionen'}>
                  {data.cta}
                </TextCta>
              </div>
            ) : null}
          </div>
        </Reveal>
      </section>
    </CmsSection>
  );
}
