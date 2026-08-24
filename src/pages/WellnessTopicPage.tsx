import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { IncludeList } from '../components/IncludeList';
import { OverlapStage } from '../components/OverlapStage';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';
import { resolveWellnessTopics } from '../lib/wellness';

export function WellnessTopicPage() {
  const { topicId } = useParams();
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
    return <Navigate to="/wellness" replace />;
  }

  return (
    <main>
      <SubpageHero
        image={topic.hero_image}
        imageAlt={topic.hero_image_alt}
        eyebrow={topic.kicker}
        title={topic.name}
        subtitle={topic.summary}
      >
        <div className="wellness-topic">
          <div className="wellness-topic__copy">
            {topic.text.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            {topic.details.length ? (
              <dl className="wellness-topic__facts">
                {topic.details.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <IncludeList items={topic.includes} />

            {topic.prices?.map((group) => (
              <section key={group.title} className="wellness-topic__prices" aria-label={group.title}>
                <h2 className="wellness-topic__prices-title heading-font">{group.title}</h2>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <span>
                        {item.name}
                        {item.meta ? <small>{item.meta}</small> : null}
                      </span>
                      <strong>{item.price}</strong>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {topic.price_note ? <p className="wellness-topic__price-note">{topic.price_note}</p> : null}

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
            />
          ) : null}
        </div>
      </SubpageHero>
    </main>
  );
}
