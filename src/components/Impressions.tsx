import { CmsSection } from '../cms/CmsSection';
import { Reveal } from './Reveal';
import { TextCta } from './TextCta';
import { useSection } from '../context/HotelContext';
import { CmsHeroPan } from '../cms/CmsHeroPan';
import { CENTER_FOCAL, heroFocalStyle } from '../cms/cmsFocal';

interface Shot {
  src: string;
  alt: string;
  // Visible part of the picture per device (drag in the CMS), like the hero.
  focal?: unknown;
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
  // Index in the saved list, so the drag position lands on the right picture.
  const images = (Array.isArray(data.images) ? (data.images as Shot[]) : [])
    .map((shot, position) => ({ shot, position }))
    .filter(({ shot }) => shot?.src);
  const ownImages = Boolean(own && Array.isArray(own.images));

  if (!own && !images.length) return null;

  return (
    <CmsSection sectionKey="impressions" label="Impressionen">
      <section className={`impressions${data.mobile_grid === true ? ' impressions--phone-grid' : ''}`} id="impressionen">
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
              {images.map(({ shot, position }, index) => (
                <figure
                  key={`${shot.src}-${index}`}
                  className="impressions__shot"
                  data-cms-focus={`images:${position}`}
                  style={heroFocalStyle(shot.focal, CENTER_FOCAL)}
                >
                  {ownImages ? (
                    <CmsHeroPan section="impressions" path={`images.${position}.focal`} value={shot.focal} tile>
                      <img loading="lazy" decoding="async" src={shot.src} alt={shot.alt} data-cms-path={`images.${position}.src`} />
                    </CmsHeroPan>
                  ) : (
                    <img loading="lazy" decoding="async" src={shot.src} alt={shot.alt} />
                  )}
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
