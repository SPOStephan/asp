import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { BlogBlocks } from '../components/BlogBlocks';
import { BlogCard } from '../components/BlogCard';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';
import {
  BLOG_TOPIC_LABEL,
  formatBlogDate,
  resolveBlogPosts,
} from '../lib/blog';

export function BlogPostPage() {
  const { postSlug } = useParams();
  const hotel = useHotel();
  const page = useSection('blog_page');
  const posts = resolveBlogPosts(page?.items);
  const post = posts.find((item) => item.slug === postSlug || item.id === postSlug);
  const more = posts.filter((item) => item.id !== post?.id).slice(0, 2);

  useEffect(() => {
    if (!post) return;
    const previous = document.title;
    document.title = `${post.title} | ${hotel?.name ?? 'ambassador hotel & spa'}`;
    window.scrollTo({ top: 0 });
    return () => {
      document.title = previous;
    };
  }, [post, hotel?.name]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <main>
      <SubpageHero
        image={post.hero_image}
        imageAlt={post.hero_image_alt}
        eyebrow={BLOG_TOPIC_LABEL[post.topic]}
        title={post.title}
        subtitle={formatBlogDate(post.published_at)}
      >
        <article className="blog-post">
          <p className="blog-post__lead">{post.excerpt}</p>
          <BlogBlocks blocks={post.blocks} />

          <div className="blog-post__links">
            <TextCta href="/blog">Alle Beiträge</TextCta>
            <TextCta href="#buchung">Jetzt anfragen</TextCta>
          </div>

          {more.length ? (
            <section className="blog-post__more" aria-label="Weitere Beiträge">
              <h2 className="blog-post__more-title heading-font">Weiterlesen</h2>
              <div className="blog-page__grid">
                {more.map((item) => (
                  <BlogCard key={item.id} post={item} />
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </SubpageHero>
    </main>
  );
}
