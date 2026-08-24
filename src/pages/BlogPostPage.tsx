import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { BlogBlocks } from '../components/BlogBlocks';
import { BlogCard } from '../components/BlogCard';
import { BlogPromo } from '../components/BlogPromo';
import { BlogToc } from '../components/BlogToc';
import { SubpageHero } from '../components/SubpageHero';
import { TextCta } from '../components/TextCta';
import { useHotel, useSection } from '../context/HotelContext';
import { blogHeadings, BLOG_TOPIC_LABEL, formatBlogDate, resolveBlogPosts } from '../lib/blog';
import { resolveOfferStories } from '../lib/offers';

export function BlogPostPage() {
  const { postSlug } = useParams();
  const hotel = useHotel();
  const page = useSection('blog_page');
  const offersPage = useSection('offers_page');
  const homeOffers = useSection('offers');
  const posts = resolveBlogPosts(page?.items);
  const offers = resolveOfferStories(offersPage?.items, homeOffers?.items);
  const post = posts.find((item) => item.slug === postSlug || item.id === postSlug);
  const more = posts.filter((item) => item.id !== post?.id).slice(0, 2);
  const headings = post ? blogHeadings(post.blocks) : [];
  const promoOffer =
    post?.promo?.enabled === false
      ? undefined
      : offers.find((item) => item.id === post?.promo?.offer_id) ??
        offers.find((item) => item.id === post?.promo?.suggested_offer_id);

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

  const promo = promoOffer ? <BlogPromo offer={promoOffer} /> : null;
  const inlinePromo = post.promo?.placement === 'inline' ? promo : null;
  const afterPromo = post.promo?.placement !== 'inline' ? promo : null;

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

          <div className={`blog-post__layout${headings.length ? ' has-toc' : ''}`}>
            {headings.length ? <BlogToc blocks={post.blocks} /> : null}
            <div className="blog-post__body">
              <BlogBlocks blocks={post.blocks} inlinePromo={inlinePromo} />
              {afterPromo}
              <div className="blog-post__links">
                <TextCta href="/blog">Alle Beiträge</TextCta>
                <TextCta href="#buchung">Jetzt anfragen</TextCta>
              </div>
            </div>
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
