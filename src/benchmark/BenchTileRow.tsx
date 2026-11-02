import { Reveal } from '../components/Reveal';
import { remapSiteHref } from '../lib/links';
import { MUSTER_MEDIA, resolveMedia } from '../lib/media';
import './bench.css';

interface Tile {
  id: string;
  title: string;
  href: string;
  image: string;
  new_tab?: boolean;
}

// Benchmark idea G66 (Der Öschberghof): the tiles as portrait pictures in rows of four, every
// second one set a little lower – a loosely laid series instead of a grid. The title sits small
// in spaced capitals at the top right. Shown below the usual tiles for comparison; the career
// tile is left out here (eight tiles = two rows of four).
export function BenchTileRow({ tiles }: { tiles: Tile[] }) {
  const list = tiles.filter((tile) => !/karriere|jobs|stellen/i.test(`${tile.title} ${tile.href}`)).slice(0, 8);
  if (!list.length) return null;
  return (
    <div className="bench-row">
      <p className="bench-row__note">Variante zum Vergleich · G66 versetzte Hochformate</p>
      <div className="bench-row__grid">
        {list.map((tile, i) => (
          <Reveal key={tile.id} delay={i * 70} className="bench-row__cell">
            <a
              className="bench-row__tile"
              href={remapSiteHref(tile.href, tile.title)}
              {...(tile.new_tab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <img src={resolveMedia(tile.image, MUSTER_MEDIA.discoverLeft)} alt={tile.title} loading="lazy" />
              <span className="bench-row__label">{tile.title}</span>
            </a>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
