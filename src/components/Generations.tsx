import { CmsSection } from '../cms/CmsSection';
import { Reveal } from './Reveal';
import { useSection } from '../context/HotelContext';
import { useCms } from '../cms/CmsContext';
import { toCmsHref } from '../cms/cmsPages';

interface GenImage {
  src: string;
  alt: string;
  label: string;
  caption: string;
  className?: string;
  href?: string;
  new_tab?: boolean;
}

export function Generations() {
  const data = useSection('generations');
  const cms = useCms();

  if (!data) return null;

  const images: GenImage[] = data.images ?? [];

  return (
    <CmsSection sectionKey="generations" label="Generationen">
    <section className="generations" id="suiten">
      <div className="container">
        <Reveal>
          <div className="generations__head" data-cms-focus="title_line1">
            <p className="eyebrow">{data.eyebrow}</p>
            <h2 className="generations__title heading-font">
              {data.title_line1}<br />
              <em>{data.title_line2_em}</em>
            </h2>
            <p className="generations__subtitle">{data.subtitle}</p>
          </div>
        </Reveal>
      </div>

      <Reveal delay={150}>
        <div className={`generations__masonry generations__masonry--${Math.min(images.length, 5)}`}>
          {images.map((img, i) => {
            const inner = (
              <>
                <img loading="lazy" decoding="async" src={img.src} alt={img.alt} />
                <div className="generations__overlay">
                  <p className="generations__label">{img.label}</p>
                  <p className="generations__caption">{img.caption}</p>
                </div>
              </>
            );
            const href = typeof img.href === 'string' ? img.href.trim() : '';
            // A tile with a link leads to its page (e.g. an occasion page).
            return href ? (
              <a
                key={i}
                className="generations__item generations__item--link"
                href={cms ? toCmsHref(href) : href}
                target={img.new_tab && !cms ? '_blank' : undefined}
                rel={img.new_tab && !cms ? 'noopener noreferrer' : undefined}
                data-cms-focus={`images:${i}`}
              >
                {inner}
              </a>
            ) : (
              <article key={i} className="generations__item" data-cms-focus={`images:${i}`}>
                {inner}
              </article>
            );
          })}
        </div>
      </Reveal>
    </section>
    </CmsSection>
  );
}
