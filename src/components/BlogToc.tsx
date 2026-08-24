import { useEffect, useMemo, useState } from 'react';
import type { BlogBlock } from '../lib/blog';
import { blogHeadings } from '../lib/blog';

export function BlogToc({ blocks }: { blocks: BlogBlock[] }) {
  const headings = useMemo(() => blogHeadings(blocks), [blocks]);
  const headingKey = headings.map((item) => item.id).join('|');
  const [active, setActive] = useState(headings[0]?.id ?? '');

  useEffect(() => {
    if (!headings.length) return;
    const nodes = headings
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0.2, 0.6] }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [headingKey, headings]);

  if (!headings.length) return null;

  return (
    <nav className="blog-toc" aria-label="Inhalt">
      <div className="blog-toc__inner">
        <p className="blog-toc__label">Inhalt</p>
        <ol>
          {headings.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={item.id === active ? 'is-active' : undefined}
                onClick={() => setActive(item.id)}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
