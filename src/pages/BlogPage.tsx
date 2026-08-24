import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BlogCard } from '../components/BlogCard';
import { Reveal } from '../components/Reveal';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';
import {
  BLOG_PAGE_FALLBACK,
  BLOG_TOPICS,
  filterBlogPosts,
  isBlogTopic,
  resolveBlogPosts,
  type BlogTopicId,
} from '../lib/blog';

export function BlogPage() {
  const hotel = useHotel();
  const page = useSection('blog_page');
  const data = page ?? BLOG_PAGE_FALLBACK;
  const posts = resolveBlogPosts(data.items);
  const [params, setParams] = useSearchParams();
  const topic: BlogTopicId | 'alle' = isBlogTopic(params.get('thema'))
    ? (params.get('thema') as BlogTopicId)
    : 'alle';
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

  const setTopic = (next: BlogTopicId | 'alle') => {
    const nextParams = new URLSearchParams(params);
    if (next === 'alle') nextParams.delete('thema');
    else nextParams.set('thema', next);
    setParams(nextParams, { replace: true });
  };

  return (
    <main>
      <SubpageHero
        image={data.hero_image ?? BLOG_PAGE_FALLBACK.hero_image}
        imageAlt={data.hero_image_alt ?? BLOG_PAGE_FALLBACK.hero_image_alt}
        eyebrow={page?.eyebrow ?? BLOG_PAGE_FALLBACK.eyebrow}
        title={page?.title ?? BLOG_PAGE_FALLBACK.title}
        subtitle={page?.subtitle ?? BLOG_PAGE_FALLBACK.subtitle}
      >
        <div className="blog-page">
          <p className="blog-page__intro">{data.intro ?? BLOG_PAGE_FALLBACK.intro}</p>

          <div className="blog-page__filters" role="tablist" aria-label="Themen">
            {BLOG_TOPICS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={topic === item.id}
                className={`blog-page__filter${topic === item.id ? ' is-active' : ''}`}
                onClick={() => setTopic(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {featured ? (
            <Reveal>
              <BlogCard post={featured} featured />
            </Reveal>
          ) : (
            <p className="blog-page__empty">Keine Beiträge in diesem Thema.</p>
          )}

          {rest.length ? (
            <section className="blog-page__grid" aria-label="Weitere Beiträge">
              {rest.map((post, index) => (
                <Reveal key={post.id} delay={index * 60}>
                  <BlogCard post={post} />
                </Reveal>
              ))}
            </section>
          ) : null}

          <section className="blog-page__note">
            <h2 className="blog-page__note-title heading-font">
              {data.note_title ?? BLOG_PAGE_FALLBACK.note_title}
            </h2>
            <p className="blog-page__note-text">
              {data.note_text ?? BLOG_PAGE_FALLBACK.note_text}
            </p>
            <TextCta href={data.note_cta_href ?? BLOG_PAGE_FALLBACK.note_cta_href}>
              {data.note_cta ?? BLOG_PAGE_FALLBACK.note_cta}
            </TextCta>
          </section>
        </div>
      </SubpageHero>
    </main>
  );
}
