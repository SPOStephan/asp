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
  return (
    <article className={`blog-card${featured ? ' blog-card--featured' : ''}`}>
      <a className="blog-card__photo" href={blogHref(post.slug)}>
        <img src={post.hero_image} alt={post.hero_image_alt} />
      </a>
      <div className="blog-card__copy">
        <p className="blog-card__meta">
          <span>{BLOG_TOPIC_LABEL[post.topic]}</span>
          <span aria-hidden="true"> · </span>
          <time dateTime={post.published_at}>{formatBlogDate(post.published_at)}</time>
        </p>
        <h2 className="blog-card__title heading-font">
          <a href={blogHref(post.slug)}>{post.title}</a>
        </h2>
        <p className="blog-card__excerpt">{post.excerpt}</p>
        <TextCta href={blogHref(post.slug)}>Weiterlesen</TextCta>
      </div>
    </article>
  );
}
