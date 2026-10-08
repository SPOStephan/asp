import { useEffect } from 'react';
import { useCms } from '../cms/CmsContext';
import { CmsPart, CmsSection } from '../cms/CmsSection';
import { BlogCard } from '../components/BlogCard';
import { Reveal } from '../components/Reveal';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';
import { resolveMedia } from '../lib/media';
import { ListFilterBar, useListFilter } from '../components/ListFilterBar';
import { BLOG_PAGE_FALLBACK, BLOG_TOPICS, filterBlogPosts, resolveBlogPosts } from '../lib/blog';

export function BlogPage() {
  const editing = Boolean(useCms());
  const hotel = useHotel();
  const page = useSection('blog_page');
  const data = page ?? BLOG_PAGE_FALLBACK;
  const posts = resolveBlogPosts(data.items);
  const topicFilter = useListFilter(page, BLOG_TOPICS, posts.map((post) => [post.topic]), 'thema');
  const topic = topicFilter.active;
  const visible = filterBlogPosts(posts, topic);
  const [featured, ...rest] = visible;

  useEffect(() => {
    const previous = document.title;
    document.title = `${data.title ?? 'Blog'} | ${hotel?.name ?? 'ambassador hotel & spa'}`;
    window.scrollTo({ top: 0 });
    return () => {
      document.title = previous;
    };
  }, [data.title, hotel?.name]);

  return (
    <CmsSection sectionKey="blog_page" label="Journal">
    <main>
      <SubpageHero
        image={resolveMedia(data.hero_image, BLOG_PAGE_FALLBACK.hero_image)}
        imageAlt={data.hero_image_alt || BLOG_PAGE_FALLBACK.hero_image_alt}
        eyebrow={page?.eyebrow ?? BLOG_PAGE_FALLBACK.eyebrow}
        title={page?.title ?? BLOG_PAGE_FALLBACK.title}
        subtitle={page?.subtitle ?? BLOG_PAGE_FALLBACK.subtitle}
        focal={data.hero_focal}
        cms={{ section: 'blog_page' }}
      >
        <div className="blog-page">
          <CmsPart sectionKey="blog_page" part="intro" label="Einleitung">
            <p className="blog-page__intro" data-cms-focus="intro" data-cms-path="intro">{data.intro ?? BLOG_PAGE_FALLBACK.intro}</p>
          </CmsPart>

          <CmsPart sectionKey="blog_page" part="filters" label="Themen">
            {topicFilter.switchedOn || editing ? (
              <ListFilterBar filters={topicFilter.filters} active={topic} onChange={topicFilter.setActive} className="blog-page__filter" label="Themen" />
            ) : null}
          </CmsPart>

          {featured ? (
            <Reveal>
              <div data-cms-focus={`items:${posts.findIndex((post) => post.id === featured.id)}`}>
                <BlogCard post={featured} featured />
              </div>
            </Reveal>
          ) : (
            <p className="blog-page__empty">Keine Beiträge in diesem Thema.</p>
          )}

          {rest.length ? (
            <section className="blog-page__grid" aria-label="Weitere Beiträge">
              {rest.map((post, index) => (
                <Reveal key={post.id} delay={index * 60}>
                  <div data-cms-focus={`items:${posts.findIndex((item) => item.id === post.id)}`}>
                    <BlogCard post={post} />
                  </div>
                </Reveal>
              ))}
            </section>
          ) : null}

          <CmsPart sectionKey="blog_page" part="note" label="Hinweis">
            <section className="blog-page__note" data-cms-focus="note">
              <h2 className="blog-page__note-title heading-font" data-cms-path="note_title">
                {data.note_title ?? BLOG_PAGE_FALLBACK.note_title}
              </h2>
              <p className="blog-page__note-text" data-cms-path="note_text">
                {data.note_text ?? BLOG_PAGE_FALLBACK.note_text}
              </p>
              <TextCta href={data.note_cta_href ?? BLOG_PAGE_FALLBACK.note_cta_href}>
                {data.note_cta ?? BLOG_PAGE_FALLBACK.note_cta}
              </TextCta>
            </section>
          </CmsPart>
        </div>
      </SubpageHero>
    </main>
    </CmsSection>
  );
}
