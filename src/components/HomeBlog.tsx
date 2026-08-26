import { CmsSection } from '../cms/CmsSection';
import { BlogCard } from './BlogCard';
import { Reveal } from './Reveal';
import { TextCta } from './TextCta';
import { useSection } from '../context/HotelContext';
import { BLOG_PAGE_FALLBACK, latestBlogPosts, resolveBlogPosts } from '../lib/blog';

export function HomeBlog() {
  const page = useSection('blog_page');
  const data = page ?? BLOG_PAGE_FALLBACK;
  const posts = latestBlogPosts(resolveBlogPosts(data.items), 3);

  if (!posts.length) return null;

  return (
    <CmsSection sectionKey="blog_page" label="Journal">
    <section className="home-blog" id="blog" aria-label="Journal">
      <div className="home-blog__head" data-cms-focus="home_title">
        <p className="eyebrow">{data.home_eyebrow ?? BLOG_PAGE_FALLBACK.home_eyebrow}</p>
        <h2 className="home-blog__title heading-font">
          {data.home_title ?? BLOG_PAGE_FALLBACK.home_title}
        </h2>
      </div>
      <div className="home-blog__grid">
        {posts.map((post, index) => {
          const source = (data.items ?? BLOG_PAGE_FALLBACK.items) as { id?: string }[];
          const itemIndex = source.findIndex((item) => item.id === post.id);
          return (
          <Reveal key={post.id} delay={index * 70}>
            <div data-cms-focus={itemIndex >= 0 ? `items:${itemIndex}` : undefined}>
              <BlogCard post={post} />
            </div>
          </Reveal>
          );
        })}
      </div>
      <div className="home-blog__cta">
        <TextCta href="/blog">{data.home_cta ?? BLOG_PAGE_FALLBACK.home_cta}</TextCta>
      </div>
    </section>
    </CmsSection>
  );
}
