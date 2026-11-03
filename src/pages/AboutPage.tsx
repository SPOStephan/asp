import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useCms } from '../cms/CmsContext';
import { toCmsHref } from '../cms/cmsPages';
import { CmsPart, CmsSection } from '../cms/CmsSection';
import { Crest } from '../components/Crest';
import { InlineText } from '../components/InlineText';
import { Reveal } from '../components/Reveal';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useHotelContent, useSection } from '../context/HotelContext';
import { filled } from '../lib/filled';
import { ABOUT_PAGE_FALLBACK, aboutFaqs, resolveAreas, resolveChapters, resolveFigures, resolveHosts } from '../lib/aboutPage';
import { PLACEHOLDER_IMAGE } from '../lib/media';
import { usePageTop } from '../lib/usePageTop';
import { FaqList, useHashScroll } from './sharedParts';
import '../styles/hotel.css';

export function AboutPage() {
  usePageTop();
  useHashScroll();
  const cms = useCms();
  const hotel = useHotel();
  const { content, isPageEnabled } = useHotelContent();
  const page = useSection('about_page');
  const data = { ...ABOUT_PAGE_FALLBACK, ...page };
  const figures = resolveFigures(data.figures);
  const chapters = resolveChapters(data.story);
  const hosts = resolveHosts(data.hosts);
  const areas = resolveAreas(data.areas, content?.sections ?? {}, isPageEnabled);
  // Own tiles can be edited on the page; the automatic ones show the pictures of their pages.
  const ownAreas = Array.isArray(page?.areas) && page.areas.length > 0;
  const faqs = aboutFaqs(content?.faqs ?? [], data.faq_ids);
  const hero = String(data.hero_image || areas[0]?.image || PLACEHOLDER_IMAGE);
  const link = (href: string) => (cms ? toCmsHref(href) : href);

  useEffect(() => {
    const previous = document.title;
    document.title = `${data.title || 'Über uns'} | ${hotel?.name ?? ''}`;
    return () => {
      document.title = previous;
    };
  }, [data.title, hotel?.name]);

  return (
    <CmsSection sectionKey="about_page" label="Über uns">
      <main className="hotel-page">
        <SubpageHero
          image={hero}
          imageAlt={String(data.hero_image_alt || data.title)}
          eyebrow={String(data.eyebrow || hotel?.name || '')}
          title={String(data.title || 'Über uns')}
          subtitle={String(data.subtitle || '')}
          focal={page?.hero_focal}
          cms={{ section: 'about_page' }}
        >
          <div className="hotel-page__body">
            <CmsPart sectionKey="about_page" part="intro" label="Einleitung" empty={!filled(data.intro)}>
              <section className="hotel-intro container" id="haus">
                <p className="hotel-intro__text" data-cms-focus="intro" data-cms-path="intro">
                  <InlineText text={String(data.intro || '')} />
                </p>
              </section>
            </CmsPart>

            <CmsPart sectionKey="about_page" part="figures" label="Das Haus in Zahlen" empty={!figures.length}>
              <section className="hotel-figures container" id="zahlen" aria-labelledby="about-figures-title">
                <h2 className="hotel-section__title heading-font" id="about-figures-title" data-cms-path="figures_title">
                  {data.figures_title}
                </h2>
                <dl className="hotel-figures__list">
                  {figures.map((figure, index) => (
                    <Reveal key={`${figure.value}-${index}`} delay={index * 40}>
                      <div className="hotel-figure" data-cms-focus={`figures:${index}`}>
                        <dt className="hotel-figure__value heading-font" data-cms-path={`figures.${index}.value`}>{figure.value}</dt>
                        <dd className="hotel-figure__label" data-cms-path={`figures.${index}.label`}>{figure.label}</dd>
                      </div>
                    </Reveal>
                  ))}
                </dl>
              </section>
            </CmsPart>

            <CmsPart sectionKey="about_page" part="story" label="Geschichte" empty={!chapters.length}>
              <section className="hotel-story" id="geschichte" aria-labelledby="about-story-title">
                <Crest className="crest-mark--story" />
                <div className="container hotel-story__inner">
                  <header className="hotel-story__head">
                    <p className="eyebrow" data-cms-path="story_eyebrow">{data.story_eyebrow}</p>
                    <h2 className="hotel-section__title heading-font" id="about-story-title" data-cms-path="story_title">
                      {data.story_title}
                    </h2>
                    {data.story_intro || cms ? (
                      <p className="hotel-story__intro" data-cms-path="story_intro">
                        <InlineText text={String(data.story_intro || '')} />
                      </p>
                    ) : null}
                  </header>
                  <ol className="hotel-story__list">
                    {chapters.map((chapter, index) => (
                      <li key={`${chapter.year}-${index}`} className="hotel-chapter" data-cms-focus={`story:${index}`}>
                        <span className="hotel-chapter__year heading-font" data-cms-path={`story.${index}.year`}>{chapter.year}</span>
                        <div className="hotel-chapter__copy">
                          <h3 className="hotel-chapter__title" data-cms-path={`story.${index}.title`}>{chapter.title}</h3>
                          <p className="hotel-chapter__text" data-cms-path={`story.${index}.text`}>
                            <InlineText text={chapter.text} />
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  {data.story_quote ? (
                    <figure className="hotel-story__quote">
                      <blockquote className="heading-font" data-cms-path="story_quote">„{data.story_quote}“</blockquote>
                      {data.story_quote_source ? <figcaption data-cms-path="story_quote_source">{data.story_quote_source}</figcaption> : null}
                    </figure>
                  ) : null}
                </div>
              </section>
            </CmsPart>

            <CmsPart sectionKey="about_page" part="hosts" label="Gastgeber & Team" empty={!hosts.length}>
              <section className="hotel-hosts container" id="gastgeber" aria-labelledby="about-hosts-title">
                <header className="hotel-hosts__head">
                  <p className="eyebrow" data-cms-path="hosts_eyebrow">{data.hosts_eyebrow}</p>
                  <h2 className="hotel-section__title heading-font" id="about-hosts-title" data-cms-path="hosts_title">
                    {data.hosts_title}
                  </h2>
                  {data.hosts_intro || cms ? (
                    <p className="hotel-hosts__intro" data-cms-path="hosts_intro">
                      <InlineText text={String(data.hosts_intro || '')} />
                    </p>
                  ) : null}
                </header>
                <div className="hotel-hosts__grid">
                  {hosts.map((host, index) => (
                    <Reveal key={`${host.name}-${index}`} delay={index * 50}>
                      <figure className="hotel-host" data-cms-focus={`hosts:${index}`}>
                        <div className="hotel-host__image" data-cms-path={`hosts.${index}.image`} data-cms-kind="image">
                          {host.image ? <img loading="lazy" decoding="async" src={host.image} alt={host.image_alt || host.name} /> : null}
                        </div>
                        <figcaption>
                          <strong className="hotel-host__name heading-font" data-cms-path={`hosts.${index}.name`}>{host.name}</strong>
                          {host.role ? <span className="hotel-host__role" data-cms-path={`hosts.${index}.role`}>{host.role}</span> : null}
                          {host.text ? (
                            <p className="hotel-host__text" data-cms-path={`hosts.${index}.text`}>
                              <InlineText text={host.text} />
                            </p>
                          ) : null}
                        </figcaption>
                      </figure>
                    </Reveal>
                  ))}
                </div>
              </section>
            </CmsPart>

            <CmsPart sectionKey="about_page" part="group" label="Hotelgruppe" empty={!filled(data.group_title, data.group_text)}>
              <section className="hotel-group" id="gruppe" aria-labelledby="about-group-title">
                <div className="container hotel-group__inner">
                  <Crest className="crest-mark--group" />
                  <div className="hotel-group__copy">
                    {data.group_eyebrow || cms ? <p className="eyebrow" data-cms-path="group_eyebrow">{data.group_eyebrow}</p> : null}
                    <h2 className="hotel-section__title heading-font" id="about-group-title" data-cms-path="group_title">
                      {data.group_title}
                    </h2>
                    <p className="hotel-group__text" data-cms-path="group_text">
                      <InlineText text={String(data.group_text || '')} />
                    </p>
                    {data.group_href ? (
                      <TextCta href={String(data.group_href)} newTab={/^https?:/i.test(String(data.group_href))}>
                        {String(data.group_cta || 'MEHR ÜBER DIE GRUPPE').toUpperCase()}
                      </TextCta>
                    ) : null}
                  </div>
                </div>
              </section>
            </CmsPart>

            <CmsPart sectionKey="about_page" part="areas" label="Das Haus entdecken" empty={!areas.length}>
              <section className="hotel-areas container" id="bereiche" aria-labelledby="about-areas-title">
                <h2 className="hotel-section__title heading-font" id="about-areas-title" data-cms-path="areas_title">
                  {data.areas_title}
                </h2>
                <div className="hotel-areas__grid">
                  {areas.map((area, index) => (
                    <Reveal key={area.href} delay={index * 50}>
                      <a className="hotel-area" href={link(area.href)} data-cms-focus={`areas:${index}`} {...(cms ? { 'data-cms-nav': '' } : {})}>
                        <figure className="hotel-area__image" {...(ownAreas ? { 'data-cms-path': `areas.${index}.image`, 'data-cms-kind': 'image' } : {})}>
                          {area.image ? <img loading="lazy" decoding="async" src={area.image} alt={area.image_alt} /> : null}
                        </figure>
                        <div className="hotel-area__caption">
                          <h3 className="hotel-area__title heading-font" {...(ownAreas ? { 'data-cms-path': `areas.${index}.title` } : {})}>{area.title}</h3>
                          {area.text ? <p className="hotel-area__text" {...(ownAreas ? { 'data-cms-path': `areas.${index}.text` } : {})}>{area.text}</p> : null}
                        </div>
                        <span className="hotel-area__arrow" aria-hidden="true">
                          <ArrowUpRight size={18} strokeWidth={1.5} />
                        </span>
                      </a>
                    </Reveal>
                  ))}
                </div>
              </section>
            </CmsPart>

            <CmsPart sectionKey="about_page" part="faq" label="Häufige Fragen" empty={!faqs.length}>
              <FaqList id="fragen" title={String(data.faq_title)} faqs={faqs} more={isPageEnabled('faqs')} />
            </CmsPart>
          </div>
        </SubpageHero>
      </main>
    </CmsSection>
  );
}
