import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useCms } from '../cms/CmsContext';
import { toCmsHref } from '../cms/cmsPages';
import { CmsSection } from '../cms/CmsSection';
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
  const cms = useCms();
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
    <CmsSection sectionKey="wellness_page" label="Wellness">
    <main>
      <SubpageHero
        image={resolveWellnessMedia(data.hero_image, WELLNESS_PAGE_FALLBACK.hero_image)}
        imageAlt={data.hero_image_alt ?? WELLNESS_PAGE_FALLBACK.hero_image_alt}
        eyebrow={page?.eyebrow ?? WELLNESS_PAGE_FALLBACK.eyebrow}
        title={page?.title ?? WELLNESS_PAGE_FALLBACK.title}
        subtitle={page?.subtitle ?? WELLNESS_PAGE_FALLBACK.subtitle}
        focal={data.hero_focal}
        cms={{ section: 'wellness_page' }}
      >
        <div className="wellness-hub">
          <p className="wellness-hub__intro" data-cms-focus="intro" data-cms-path="intro">
            {data.intro ?? data.content_text ?? WELLNESS_PAGE_FALLBACK.intro}
          </p>

          <section className="wellness-hub__day" aria-label="Day Spa" data-cms-focus="day">
            <p className="wellness-hub__day-kicker" data-cms-path="day_kicker">
              {data.day_kicker ?? WELLNESS_PAGE_FALLBACK.day_kicker}
            </p>
            <h2 className="wellness-hub__day-title heading-font" data-cms-path="day_title">
              {data.day_title ?? WELLNESS_PAGE_FALLBACK.day_title}
            </h2>
            <p className="wellness-hub__day-text" data-cms-path="day_text">
              {data.day_text ?? WELLNESS_PAGE_FALLBACK.day_text}
            </p>
            <TextCta href={data.day_cta_href ?? WELLNESS_PAGE_FALLBACK.day_cta_href}>
              {data.day_cta ?? WELLNESS_PAGE_FALLBACK.day_cta}
            </TextCta>
          </section>

          <section className="wellness-hub__tiles" aria-label="Wellness-Bereiche">
            {topics.map((topic, index) => (
              <Reveal key={topic.id} delay={index * 50}>
                <a
                  className="wellness-tile"
                  href={cms ? toCmsHref(wellnessTopicHref(topic.id)) : wellnessTopicHref(topic.id)}
                  data-cms-focus={`items:${index}`}
                  {...(cms ? { 'data-cms-nav': '' } : {})}
                >
                  <div className="wellness-tile__image" data-cms-path={`items.${topic.id}.image`} data-cms-kind="image">
                    <img src={topic.image} alt={topic.image_alt} />
                  </div>
                  <div className="wellness-tile__overlay" />
                  <div className="wellness-tile__content">
                    <p className="wellness-tile__kicker" data-cms-path={`items.${topic.id}.kicker`}>{topic.kicker}</p>
                    <h2 className="wellness-tile__name heading-font" data-cms-path={`items.${topic.id}.name`}>{topic.name}</h2>
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
                  data-cms-focus={`chapters:${index}`}
                >
                  <figure className="wellness-chapter__photo" data-cms-path={`chapters.${chapter.id}.image`} data-cms-kind="image">
                    <img src={chapter.image} alt={chapter.image_alt} />
                  </figure>
                  <div className="wellness-chapter__copy">
                    <p className="wellness-chapter__kicker" data-cms-path={`chapters.${chapter.id}.kicker`}>{chapter.kicker}</p>
                    <h2 className="wellness-chapter__title heading-font" data-cms-path={`chapters.${chapter.id}.title`}>{chapter.title}</h2>
                    <p className="wellness-chapter__text" data-cms-path={`chapters.${chapter.id}.text`}>{chapter.text}</p>
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

          <section className="wellness-hub__note" data-cms-focus="note">
            <h2 className="wellness-hub__note-title heading-font" data-cms-path="note_title">
              {data.note_title ?? WELLNESS_PAGE_FALLBACK.note_title}
            </h2>
            <p className="wellness-hub__note-text" data-cms-path="note_text">
              {data.note_text ?? WELLNESS_PAGE_FALLBACK.note_text}
            </p>
            <TextCta href={data.note_cta_href ?? WELLNESS_PAGE_FALLBACK.note_cta_href}>
              {data.note_cta ?? WELLNESS_PAGE_FALLBACK.note_cta}
            </TextCta>
          </section>
        </div>
      </SubpageHero>
    </main>
    </CmsSection>
  );
}
