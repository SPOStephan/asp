import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { OverlapStage } from '../components/OverlapStage';
import { Reveal } from '../components/Reveal';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';
import {
  resolveWellnessChapters,
  resolveWellnessMedia,
  resolveWellnessTopics,
  wellnessTopicHref,
  WELLNESS_PAGE_FALLBACK,
} from '../lib/wellness';

export function WellnessPage() {
  const hotel = useHotel();
  const page = useSection('wellness_page');
  const data = page ?? WELLNESS_PAGE_FALLBACK;
  const topics = resolveWellnessTopics(data.items);
  const chapters = resolveWellnessChapters(data.chapters);

  useEffect(() => {
    const previous = document.title;
    document.title = `${data.title ?? 'Wellness'} | ${hotel?.name ?? 'ambassador hotel & spa'}`;
    window.scrollTo({ top: 0 });
    return () => {
      document.title = previous;
    };
  }, [data.title, hotel?.name]);

  return (
    <main>
      <SubpageHero
        image={resolveWellnessMedia(data.hero_image, WELLNESS_PAGE_FALLBACK.hero_image)}
        imageAlt={data.hero_image_alt ?? WELLNESS_PAGE_FALLBACK.hero_image_alt}
        eyebrow={page?.eyebrow ?? WELLNESS_PAGE_FALLBACK.eyebrow}
        title={page?.title ?? WELLNESS_PAGE_FALLBACK.title}
        subtitle={page?.subtitle ?? WELLNESS_PAGE_FALLBACK.subtitle}
      >
        <div className="wellness-hub">
          <p className="wellness-hub__intro">
            {data.intro ?? data.content_text ?? WELLNESS_PAGE_FALLBACK.intro}
          </p>

          <section className="wellness-hub__day" aria-label="Day Spa">
            <p className="wellness-hub__day-kicker">
              {data.day_kicker ?? WELLNESS_PAGE_FALLBACK.day_kicker}
            </p>
            <h2 className="wellness-hub__day-title heading-font">
              {data.day_title ?? WELLNESS_PAGE_FALLBACK.day_title}
            </h2>
            <p className="wellness-hub__day-text">
              {data.day_text ?? WELLNESS_PAGE_FALLBACK.day_text}
            </p>
            <TextCta href={data.day_cta_href ?? WELLNESS_PAGE_FALLBACK.day_cta_href}>
              {data.day_cta ?? WELLNESS_PAGE_FALLBACK.day_cta}
            </TextCta>
          </section>

          <section className="wellness-hub__tiles" aria-label="Wellness-Bereiche">
            {topics.map((topic, index) => (
              <Reveal key={topic.id} delay={index * 50}>
                <a className="wellness-tile" href={wellnessTopicHref(topic.id)}>
                  <div className="wellness-tile__image">
                    <img src={topic.image} alt={topic.image_alt} />
                  </div>
                  <div className="wellness-tile__overlay" />
                  <div className="wellness-tile__content">
                    <p className="wellness-tile__kicker">{topic.kicker}</p>
                    <h2 className="wellness-tile__name heading-font">{topic.name}</h2>
                  </div>
                  <span className="wellness-tile__arrow" aria-hidden="true">
                    <ArrowUpRight size={18} strokeWidth={1.5} />
                  </span>
                </a>
              </Reveal>
            ))}
          </section>

          <section className="wellness-hub__chapters" aria-label="Aus dem Spa">
            {chapters.map((chapter, index) => (
              <Reveal key={chapter.id} delay={index * 60}>
                <article
                  className={`wellness-chapter${index % 2 === 1 ? ' wellness-chapter--reverse' : ''}`}
                >
                  <figure className="wellness-chapter__photo">
                    <img src={chapter.image} alt={chapter.image_alt} />
                  </figure>
                  <div className="wellness-chapter__copy">
                    <p className="wellness-chapter__kicker">{chapter.kicker}</p>
                    <h2 className="wellness-chapter__title heading-font">{chapter.title}</h2>
                    <p className="wellness-chapter__text">{chapter.text}</p>
                    <TextCta href={chapter.href}>{chapter.cta}</TextCta>
                  </div>
                </article>
              </Reveal>
            ))}
          </section>

          <OverlapStage
            kicker={data.overlap_kicker ?? WELLNESS_PAGE_FALLBACK.overlap_kicker}
            title={data.overlap_title ?? WELLNESS_PAGE_FALLBACK.overlap_title}
            text={data.overlap_text ?? WELLNESS_PAGE_FALLBACK.overlap_text}
            cta={data.overlap_cta ?? WELLNESS_PAGE_FALLBACK.overlap_cta}
            href={data.overlap_cta_href ?? WELLNESS_PAGE_FALLBACK.overlap_cta_href}
            front={data.overlap_front ?? WELLNESS_PAGE_FALLBACK.overlap_front}
            frontAlt={data.overlap_front_alt ?? WELLNESS_PAGE_FALLBACK.overlap_front_alt}
            back={data.overlap_back ?? WELLNESS_PAGE_FALLBACK.overlap_back}
            backAlt={data.overlap_back_alt ?? WELLNESS_PAGE_FALLBACK.overlap_back_alt}
          />

          <section className="wellness-hub__note">
            <h2 className="wellness-hub__note-title heading-font">
              {data.note_title ?? WELLNESS_PAGE_FALLBACK.note_title}
            </h2>
            <p className="wellness-hub__note-text">
              {data.note_text ?? WELLNESS_PAGE_FALLBACK.note_text}
            </p>
            <TextCta href={data.note_cta_href ?? WELLNESS_PAGE_FALLBACK.note_cta_href}>
              {data.note_cta ?? WELLNESS_PAGE_FALLBACK.note_cta}
            </TextCta>
          </section>
        </div>
      </SubpageHero>
    </main>
  );
}
