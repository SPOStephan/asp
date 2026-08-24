import { Fragment, type ReactNode } from 'react';
import type { BlogBlock } from '../lib/blog';
import { headingAnchor, youtubeId } from '../lib/blog';

interface BlogBlocksProps {
  blocks: BlogBlock[];
  inlinePromo?: ReactNode;
}

export function BlogBlocks({ blocks, inlinePromo }: BlogBlocksProps) {
  const firstHeading = blocks.findIndex((block) => block.type === 'heading');
  const promoAfter = firstHeading === -1 ? -1 : firstHeading + 1 < blocks.length ? firstHeading + 1 : firstHeading;

  return (
    <div className="blog-blocks">
      {blocks.map((block, index) => {
        const node =
          block.type === 'heading' ? (
            <h2 id={headingAnchor(block.text)} className="blog-blocks__heading heading-font">
              {block.text}
            </h2>
          ) : block.type === 'image' ? (
            <figure className="blog-blocks__figure">
              <img src={block.src} alt={block.alt} />
              {block.caption ? <figcaption>{block.caption}</figcaption> : null}
            </figure>
          ) : block.type === 'video' ? (
            <figure className="blog-blocks__figure blog-blocks__video">
              {block.provider === 'youtube' && youtubeId(block.src) ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId(block.src)}`}
                  title={block.caption || 'Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={block.src} poster={block.poster} controls playsInline />
              )}
              {block.caption ? <figcaption>{block.caption}</figcaption> : null}
            </figure>
          ) : (
            <p className="blog-blocks__text">{block.text}</p>
          );

        return (
          <Fragment key={`${block.type}-${index}`}>
            {node}
            {inlinePromo && index === promoAfter ? inlinePromo : null}
          </Fragment>
        );
      })}
    </div>
  );
}
