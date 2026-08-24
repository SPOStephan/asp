import type { BlogBlock } from '../lib/blog';
import { youtubeId } from '../lib/blog';

export function BlogBlocks({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="blog-blocks">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h2 key={`${block.text}-${index}`} className="blog-blocks__heading heading-font">
              {block.text}
            </h2>
          );
        }
        if (block.type === 'image') {
          return (
            <figure key={`${block.src}-${index}`} className="blog-blocks__figure">
              <img src={block.src} alt={block.alt} />
              {block.caption ? <figcaption>{block.caption}</figcaption> : null}
            </figure>
          );
        }
        if (block.type === 'video') {
          const youtube = block.provider === 'youtube' ? youtubeId(block.src) : null;
          return (
            <figure key={`${block.src}-${index}`} className="blog-blocks__figure blog-blocks__video">
              {youtube ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtube}`}
                  title={block.caption || 'Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={block.src} poster={block.poster} controls playsInline />
              )}
              {block.caption ? <figcaption>{block.caption}</figcaption> : null}
            </figure>
          );
        }
        return (
          <p key={`${block.text.slice(0, 24)}-${index}`} className="blog-blocks__text">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
