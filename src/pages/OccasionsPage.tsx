import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useCms } from '../cms/CmsContext';
import { toCmsHref } from '../cms/cmsPages';
import { CmsSection } from '../cms/CmsSection';
import { Reveal } from '../components/Reveal';
import { SubpageHero } from '../components/SubpageHero';
import { useHotel, useSection } from '../context/HotelContext';
import { occasionHref, OCCASIONS_PAGE_FALLBACK, resolveOccasions } from '../lib/occasions';

export function OccasionsPage() {
  const cms = useCms();
  const hotel = useHotel();
  const page = useSection('occasions_page');
  const data = { ...OCCASIONS_PAGE_FALLBACK, ...page };
  const occasions = resolveOccasions(data.items);
  const hero = String(data.hero_image || occasions[0]?.hero_image || '');

  useEffect(() => {
    const previous = document.title;
    document.title = `${data.title || 'Anlässe'} | ${hotel?.name ?? ''}`;
    window.scrollTo({ top: 0 });
    return () => {
      document.title = previous;
    };
  }, [data.title, hotel?.name]);

  return (
    <CmsSection sectionKey="occasions_page" label="Anlässe">
      <main>
        <SubpageHero
          image={hero}
          imageAlt={String(data.hero_image_alt || data.title)}
          eyebrow={String(data.eyebrow || '')}
          title={String(data.title || 'Anlässe')}
          subtitle={String(data.subtitle || '')}
          focal={page?.hero_focal}
          cms={{ section: 'occasions_page' }}
        >
          <div className="wellness-hub">
            {data.intro || cms ? (
              <p className="wellness-hub__intro" data-cms-focus="intro" data-cms-path="intro">
                {String(data.intro || '')}
              </p>
            ) : null}
            <section className="wellness-hub__tiles occasions__tiles" aria-label="Anlässe">
              {occasions.map((occasion, index) => (
                <Reveal key={occasion.id} delay={index * 50}>
                  <a
                    className="wellness-tile"
                    href={cms ? toCmsHref(occasionHref(occasion.id)) : occasionHref(occasion.id)}
                    data-cms-focus={`items:${index}`}
                    {...(cms ? { 'data-cms-nav': '' } : {})}
                  >
                    <div className="wellness-tile__image" data-cms-path={`items.${occasion.id}.image`} data-cms-kind="image">
                      {occasion.image ? <img loading="lazy" decoding="async" src={occasion.image} alt={occasion.image_alt} /> : null}
                    </div>
                    <div className="wellness-tile__overlay" />
                    <div className="wellness-tile__content">
                      <p className="wellness-tile__kicker" data-cms-path={`items.${occasion.id}.kicker`}>{occasion.kicker}</p>
                      <h2 className="wellness-tile__name heading-font" data-cms-path={`items.${occasion.id}.name`}>{occasion.name}</h2>
                    </div>
                    <span className="wellness-tile__arrow" aria-hidden="true">
                      <ArrowUpRight size={18} strokeWidth={1.5} />
                    </span>
                  </a>
                </Reveal>
              ))}
            </section>
          </div>
        </SubpageHero>
      </main>
    </CmsSection>
  );
}
