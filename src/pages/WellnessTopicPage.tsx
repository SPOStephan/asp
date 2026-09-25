import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useCms } from '../cms/CmsContext';
import { CmsSection } from '../cms/CmsSection';
import { IncludeList } from '../components/IncludeList';
import { OverlapStage } from '../components/OverlapStage';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';
import { entryFocal } from '../cms/cmsFocal';
import { resolveWellnessTopics } from '../lib/wellness';

export function WellnessTopicPage() {
  const { topicId } = useParams();
  const cms = useCms();
  const hotel = useHotel();
  const page = useSection('wellness_page');
  const topics = resolveWellnessTopics(page?.items);
  const topic = topics.find((item) => item.id === topicId);

  useEffect(() => {
    if (!topic) return;
    const previous = document.title;
    document.title = `${topic.name} | ${hotel?.name ?? 'ambassador hotel & spa'}`;
    window.scrollTo({ top: 0 });
    return () => {
      document.title = previous;
    };
  }, [topic, hotel?.name]);

  if (!topic) {
    return <Navigate to={cms ? '/cms/wellness' : '/wellness'} replace />;
  }

  const prefix = `items.${topic.id}`;

  return (
    <CmsSection sectionKey="wellness_page" label="Wellness-Seite">
    <main>
      <SubpageHero
        image={topic.hero_image}
        imageAlt={topic.hero_image_alt}
        eyebrow={topic.kicker}
        title={topic.name}
        subtitle={topic.summary}
        focal={entryFocal(page?.items, topic.id)}
        cms={{
          image: `${prefix}.hero_image`,
          eyebrow: `${prefix}.kicker`,
          title: `${prefix}.name`,
          subtitle: `${prefix}.summary`,
          section: 'wellness_page',
          focalPath: `${prefix}.hero_focal`,
        }}
      >
        <div className="wellness-topic">
          <div className="wellness-topic__copy">
            {topic.text.map((paragraph, index) => (
              <p key={`${paragraph}-${index}`} data-cms-path={`${prefix}.text.${index}`}>{paragraph}</p>
            ))}

            {topic.details.length ? (
              <dl className="wellness-topic__facts">
                {topic.details.map((fact, index) => (
                  <div key={`${fact.label}-${index}`}>
                    <dt data-cms-path={`${prefix}.details.${index}.label`}>{fact.label}</dt>
                    <dd data-cms-path={`${prefix}.details.${index}.value`}>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <IncludeList items={topic.includes} pathPrefix={`${prefix}.includes`} />

            {topic.prices?.map((group, groupIndex) => (
              <section key={`${group.title}-${groupIndex}`} className="wellness-topic__prices" aria-label={group.title}>
                <h2 className="wellness-topic__prices-title heading-font" data-cms-path={`${prefix}.prices.${groupIndex}.title`}>
                  {group.title}
                </h2>
                <ul>
                  {group.items.map((item, itemIndex) => (
                    <li key={`${item.name}-${itemIndex}`}>
                      <span>
                        <span data-cms-path={`${prefix}.prices.${groupIndex}.items.${itemIndex}.name`}>{item.name}</span>
                        {item.meta ? (
                          <small data-cms-path={`${prefix}.prices.${groupIndex}.items.${itemIndex}.meta`}>{item.meta}</small>
                        ) : null}
                      </span>
                      <strong data-cms-path={`${prefix}.prices.${groupIndex}.items.${itemIndex}.price`}>{item.price}</strong>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {topic.price_note ? <p className="wellness-topic__price-note" data-cms-path={`${prefix}.price_note`}>{topic.price_note}</p> : null}

            <div className="wellness-topic__links">
              <TextCta href="/wellness/termin">Termin anfragen</TextCta>
              <TextCta href="/wellness">Alle Wellness-Bereiche</TextCta>
            </div>
          </div>

          {topic.pair_image ? (
            <OverlapStage
              kicker={topic.kicker}
              title={topic.name}
              text={topic.summary}
              cta={topic.id === 'termin' ? 'Alle Wellness-Bereiche' : 'Termin anfragen'}
              href={topic.id === 'termin' ? '/wellness' : '/wellness/termin'}
              front={topic.hero_image}
              frontAlt={topic.hero_image_alt}
              back={topic.pair_image}
              backAlt={topic.pair_image_alt ?? topic.name}
              cms={{
                focus: 'item',
                kicker: `${prefix}.kicker`,
                title: `${prefix}.name`,
                text: `${prefix}.summary`,
                front: `${prefix}.hero_image`,
                back: `${prefix}.pair_image`,
              }}
            />
          ) : null}
        </div>
      </SubpageHero>
    </main>
    </CmsSection>
  );
}
