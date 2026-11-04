import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { remapSiteHref } from '../lib/links';
import { menuImageKey, menuPreview } from '../lib/menuPreview';
import { Crest } from './Crest';

type Link = { label: string; href: string };
type Group = { title: string; href?: string; links: Link[] };

// The desktop menu (first tried as /navi02): calm and spacious.
//   left  – the main areas one below the other, in the spaced capitals of the site
//   next  – a fine line leads from the chosen area to its pages, which stand at its height;
//   right – the picture of the chosen area, below it the service row
// The chosen area stays chosen until another one is chosen (nothing closes when the mouse
// leaves); on touch screens the first tap shows an area's pages, the second opens the area.
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
  const [offset, setOffset] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
  const index = Math.max(0, Math.min(active, groups.length - 1));
  const group = groups[index];
  const previews = groups.map((item) => menuPreview(groupHref(item), item.title, sections));

  // The pages of the chosen area stand at its height.
  useLayoutEffect(() => {
    const list = listRef.current;
    const item = list?.children[index] as HTMLElement | undefined;
    setOffset(list && item ? item.getBoundingClientRect().top - list.getBoundingClientRect().top : 0);
  }, [index, groups.length]);

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
  const links = group.links.filter((link) => remapSiteHref(link.href, link.label) !== href);
  const go = (target: string, label?: string) => (event: { preventDefault: () => void }) => {
    event.preventDefault();
    onNavigate(target, label);
  };

  return (
    <div className="nav-split">
      <Crest className="crest-mark--menu" />
      <div className="nav-split__menu">
        <ul className="nav-split__areas" ref={listRef} aria-label="Bereiche">
          {groups.map((item, at) => {
            const target = groupHref(item);
            const hasPages = item.links.some((link) => remapSiteHref(link.href, link.label) !== target);
            return (
              <li key={item.title}>
                <a
                  className={`nav-split__area${at === index ? ' is-active' : ''}`}
                  href={target ?? '#'}
                  aria-current={at === index ? 'true' : undefined}
                  onMouseEnter={() => setActive(at)}
                  onFocus={() => setActive(at)}
                  onClick={(event) => {
                    event.preventDefault();
                    // Touch: first show what the area holds, then open it.
                    if (!canHover && hasPages && at !== index) {
                      setActive(at);
                      return;
                    }
                    if (target) onNavigate(target, item.title);
                    else setActive(at);
                  }}
                >
                  <span>{item.title}</span>
                  <i className="nav-split__rule" aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>

        <div className="nav-split__pages" style={{ paddingTop: offset }}>
          <div className="nav-split__pages-inner" key={group.title}>
            {/* Only what can be clicked: an area without pages shows nothing here. */}
            {links.length ? (
              <ul aria-label={group.title}>
                {links.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <a href={remapSiteHref(link.href, link.label)} onClick={go(link.href, link.label)}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      <div className="nav-split__side">
        {/* Decorative here (the area's name stands on the left), so no alt text on the page; in
            the CMS a click on the picture opens the area's own menu picture. */}
        <figure className="nav-split__picture" aria-hidden="true">
          {previews.map((item, at) =>
            item.image ? (
              <img
                key={`${at}-${item.image}`}
                src={item.image}
                alt=""
                className={at === index ? 'is-active' : ''}
                loading="lazy"
                decoding="async"
                data-cms-path={`menu_images.${menuImageKey(groupHref(groups[at]), groups[at].title)}.image`}
                data-cms-kind="image"
              />
            ) : null,
          )}
        </figure>
        {service.length ? (
          <ul className="nav-split__service" aria-label="Service">
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
    </div>
  );
}
