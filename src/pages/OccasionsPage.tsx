import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useCms } from '../cms/CmsContext';
import { toCmsHref } from '../cms/cmsPages';
import { CmsSection } from '../cms/CmsSection';
import { Reveal } from '../components/Reveal';
import { SubpageHero } from '../components/SubpageHero';
import { useHotel, useSection } from '../context/HotelContext';
import { OCCASIONS_PAGE_FALLBACK } from '../lib/occasions';
import { EVENTS_PAGE_FALLBACK, topicArea, topicHref, type TopicAreaKey } from '../lib/topicAreas';
import { Navigate, useLocation } from 'react-router-dom';
import { usePageTop } from '../lib/usePageTop';

// The hub of an area: the region ("Urlaub in …") or meetings/celebrations (lib/topicAreas.ts).
export function OccasionsPage({ area: areaKey = 'region' }: { area?: TopicAreaKey }) {
  usePageTop();
  const cms = useCms();
  const hotel = useHotel();
  const { pathname } = useLocation();
  const sectionKey = areaKey === 'events' ? 'events_page' : 'occasions_page';
  const page = useSection(sectionKey);
  const area = topicArea(areaKey, page, hotel?.email);
  const data = { ...(areaKey === 'events' ? EVENTS_PAGE_FALLBACK : OCCASIONS_PAGE_FALLBACK), ...page, title: area.title };
  const occasions = area.items;
  const occasionHref = (id: string) => topicHref(area, id);
  const wrongAddress = pathname !== area.basePath && pathname !== `/cms${area.basePath}`;
  const hero = String(data.hero_image || occasions[0]?.hero_image || '');

  useEffect(() => {
    const previous = document.title;
    document.title = `${data.title || area.title} | ${hotel?.name ?? ''}`;
    return () => {
      document.title = previous;
    };
  }, [data.title, hotel?.name]);

  // The hotel's own address (only meetings: /tagen, not /tagen-und-feiern).
  if (wrongAddress) return <Navigate to={cms ? `/cms${area.basePath}` : area.basePath} replace />;

  return (
    <CmsSection sectionKey={sectionKey} label={areaKey === 'events' ? area.title : 'Region'}>
      <main>
        <SubpageHero
          image={hero}
          imageAlt={String(data.hero_image_alt || data.title)}
          eyebrow={String(data.eyebrow || '')}
          title={String(data.title || area.title)}
          subtitle={String(data.subtitle || '')}
          focal={page?.hero_focal}
          cms={{ section: sectionKey }}
        >
          <div className="wellness-hub">
            {data.intro || cms ? (
              <p className="wellness-hub__intro" data-cms-focus="intro" data-cms-path="intro">
                {String(data.intro || '')}
              </p>
            ) : null}
            <section className="wellness-hub__tiles occasions__tiles" aria-label="Region">
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
