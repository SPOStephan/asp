import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { remapSiteHref } from '../lib/links';
import { menuPreview } from '../lib/menuPreview';
import { Crest } from './Crest';

type Link = { label: string; href: string };
type Group = { title: string; href?: string; links: Link[] };

// Menu variant /navi02 (desktop): one calm screen in three parts.
//   left   – the main areas, large, one below the other (hover, focus or arrow keys choose)
//   middle – what the chosen area holds; areas without sub-pages show their line instead
//   right  – the picture of the chosen area, changing softly
// Below: the service row. Every area keeps its own page link; nothing needs a second click to
// be found, and the picture tells at a glance where a click leads.
export function NavSplit({
  groups,
  service,
  sections,
  groupHref,
  onNavigate,
}: {
  groups: Group[];
  service: Link[];
  sections: Record<string, Record<string, any> | undefined>;
  groupHref: (group: Group) => string | undefined;
  onNavigate: (href: string, label?: string) => void;
}) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const group = groups[Math.min(active, groups.length - 1)];
  const previews = groups.map((item) => menuPreview(groupHref(item), item.title, sections));

  // Arrow keys move through the areas, like a list.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      setActive((current) => {
        const next = (current + (event.key === 'ArrowDown' ? 1 : -1) + groups.length) % groups.length;
        listRef.current?.querySelectorAll<HTMLAnchorElement>('.nav-split__area')[next]?.focus();
        return next;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [groups.length]);

  if (!group) return null;
  const href = groupHref(group);
  const preview = previews[Math.min(active, groups.length - 1)];
  const links = group.links.filter((link) => remapSiteHref(link.href, link.label) !== href);
  const go = (target: string, label?: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    onNavigate(target, label);
  };

  return (
    <div className="nav-split">
      <Crest className="crest-mark--menu" />
      <ul className="nav-split__areas" ref={listRef} aria-label="Bereiche">
        {groups.map((item, index) => {
          const target = groupHref(item);
          return (
            <li key={item.title}>
              <a
                className={`nav-split__area heading-font${index === active ? ' is-active' : ''}`}
                href={target ?? '#'}
                aria-current={index === active ? 'true' : undefined}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={(event) => {
                  event.preventDefault();
                  if (target) onNavigate(target, item.title);
                  else setActive(index);
                }}
              >
                <span className="nav-split__num">{String(index + 1).padStart(2, '0')}</span>
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>

      <div className="nav-split__detail" key={group.title}>
        <p className="nav-split__kicker">{group.title}</p>
        {links.length ? (
          <ul className="nav-split__links">
            {links.map((link) => (
              <li key={`${link.label}-${link.href}`}>
                <a href={remapSiteHref(link.href, link.label)} onClick={go(link.href, link.label)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : preview.teaser ? (
          <p className="nav-split__teaser heading-font">{preview.teaser}</p>
        ) : null}
        {href ? (
          <a className="text-cta nav-split__all" href={href} onClick={go(href, group.title)}>
            <span className="text-cta__label">{links.length ? 'ZUR ÜBERSICHT' : 'ZUR SEITE'}</span>
            <span className="text-cta__arrow" aria-hidden="true">
              <ArrowUpRight size={14} strokeWidth={1.6} />
            </span>
          </a>
        ) : null}
      </div>

      <figure className="nav-split__picture" aria-hidden="true">
        {previews.map((item, index) =>
          item.image ? <img key={`${index}-${item.image}`} src={item.image} alt="" className={index === active ? 'is-active' : ''} loading="lazy" decoding="async" /> : null,
        )}
      </figure>

      {service.length ? (
        <ul className="navbar__service nav-split__service" aria-label="Service">
          {service.map((link) => (
            <li key={`${link.label}-${link.href}`}>
              <a href={remapSiteHref(link.href, link.label)} onClick={go(link.href, link.label)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
