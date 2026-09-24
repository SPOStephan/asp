import { useCms } from '../cms/CmsContext';
import { toCmsHref } from '../cms/cmsPages';
import { TextCta } from './TextCta';
import {
  BLOG_TOPIC_LABEL,
  blogHref,
  formatBlogDate,
  type BlogPost,
} from '../lib/blog';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const cms = useCms();
  const href = cms ? toCmsHref(blogHref(post.slug)) : blogHref(post.slug);
  const nav = cms ? { 'data-cms-nav': '' } : {};

  return (
    <article className={`blog-card${featured ? ' blog-card--featured' : ''}`}>
      <a className="blog-card__photo" href={href} data-cms-path={`items.${post.id}.hero_image`} data-cms-kind="image" {...nav}>
        <img src={post.hero_image} alt={post.hero_image_alt} />
      </a>
      <div className="blog-card__copy">
        <p className="blog-card__meta">
          <span>{BLOG_TOPIC_LABEL[post.topic]}</span>
          <span aria-hidden="true"> · </span>
          <time dateTime={post.published_at}>{formatBlogDate(post.published_at)}</time>
        </p>
        <h2 className="blog-card__title heading-font">
          <a href={href} data-cms-path={`items.${post.id}.title`} {...nav}>{post.title}</a>
        </h2>
        <p className="blog-card__excerpt" data-cms-path={`items.${post.id}.excerpt`}>{post.excerpt}</p>
        <TextCta href={blogHref(post.slug)}>Weiterlesen</TextCta>
      </div>
    </article>
  );
}
