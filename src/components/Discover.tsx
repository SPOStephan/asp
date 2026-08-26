import { ArrowUpRight } from 'lucide-react';
import { CmsSection } from '../cms/CmsSection';
import { useHotelContent, useSection } from '../context/HotelContext';
import { remapSiteHref } from '../lib/links';
import { pageKeyFromHref } from '../lib/musterPages';
import { Reveal } from './Reveal';

interface DiscoverTile {
  image: string;
  eyebrow: string;
  title: string;
  href: string;
}

export function Discover() {
  const data = useSection('discover');
  const { isPageEnabled } = useHotelContent();

  if (!data) return null;

  return (
    <CmsSection sectionKey="discover" label="Discover">
    <section className="discover" id="discover">
      <Reveal className="discover__feature-pair">
        <div className="discover__feature-image discover__feature-image--left" data-cms-focus="feature_left">
          <img src={data.feature_image_left} alt={data.feature_image_left_alt || ''} />
        </div>
        <div className="discover__feature-image discover__feature-image--right" data-cms-focus="feature_right">
          <img src={data.feature_image_right} alt={data.feature_image_right_alt || ''} />
        </div>
      </Reveal>

      <div className="container">
        <Reveal>
          <div className="discover__head" data-cms-focus="head">
            <p className="eyebrow">{data.eyebrow}</p>
            <h2 className="discover__title heading-font">
              {data.title}
            </h2>
            <p className="discover__subtitle">{data.subtitle}</p>
          </div>
        </Reveal>
      </div>

      <div className="discover__grid">
        {(data.tiles ?? []).map((tile: DiscoverTile, i: number) => {
          const key = pageKeyFromHref(remapSiteHref(tile.href, tile.title));
          if (key && !isPageEnabled(key)) return null;
          return (
          <Reveal key={tile.title} delay={i * 70}>
            <a className="discover__tile" href={remapSiteHref(tile.href, tile.title)} data-cms-focus={`tiles:${i}`}>
              <div className="discover__tile-image">
                <img src={tile.image} alt={tile.title} loading="lazy" />
              </div>
              <div className="discover__tile-overlay" />
              <div className="discover__tile-content">
                <p className="discover__tile-eyebrow">{tile.eyebrow}</p>
                <h3 className="discover__tile-title">{tile.title}</h3>
              </div>
              <div className="discover__tile-arrow" aria-hidden="true">
                <ArrowUpRight size={22} strokeWidth={1.5} />
              </div>
            </a>
          </Reveal>
          );
        })}
      </div>
    </section>
    </CmsSection>
  );
}
