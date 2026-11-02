import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';
import { useCms } from '../cms/CmsContext';
import { useHotelContent } from '../context/HotelContext';
import { BLOCK_LIBRARY, blockPlacements, kindPattern, pageMatches, pageName, type Placement } from '../lib/blocks';
import { findPageMain, pageParts, removeSlots, slotAfter } from '../lib/pageParts';
import { DayStory } from '../benchmark/DayStory';
import { Generations } from './Generations';

const RENDER: Record<string, () => ReactNode> = {
  day_story: () => <DayStory />,
  generations: () => <Generations />,
};

interface Placed {
  block: string;
  placement: Placement;
}

function usePlaced(pathname: string): Placed[] {
  const { content } = useHotelContent();
  const sections = content?.sections ?? {};
  return BLOCK_LIBRARY.flatMap((def) =>
    blockPlacements(sections[def.key])
      .filter((placement) => pageMatches(placement.page, pathname))
      .map((placement) => ({ block: def.key, placement })),
  );
}

// Writes a block's placements (CMS only): saved right away, like the eye that hides a section.
function useSavePlacements() {
  const cms = useCms();
  const { content } = useHotelContent();
  return (block: string, next: Placement[]) => {
    const data = { ...content?.sections?.[block] };
    delete data.pages;
    void cms?.saveSection(block, { ...data, placements: next });
  };
}

// CMS: a line between two parts of the page – "+ Baustein" places a block right here.
function BlockMarker({ pathname, after, label }: { pathname: string; after: string; label: string }) {
  const [open, setOpen] = useState(false);
  const { content } = useHotelContent();
  const save = useSavePlacements();
  const kind = kindPattern(pathname);
  const add = (block: string, page: string) => {
    const current = blockPlacements(content?.sections?.[block]);
    save(block, [...current.filter((item) => !(item.page === page && item.after === after)), { page, after, label }]);
    setOpen(false);
  };
  return (
    <div className="block-marker" data-block-ui onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
      <button type="button" className="block-marker__add" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <Plus size={14} strokeWidth={1.8} /> Baustein einfügen
      </button>
      {open ? (
        <div className="block-marker__menu" role="menu">
          {BLOCK_LIBRARY.map((def) => (
            <div key={def.key} className="block-marker__row">
              <strong>{def.label}</strong>
              <button type="button" onClick={() => add(def.key, pathname)}>
                nur hier
              </button>
              {kind ? (
                <button type="button" onClick={() => add(def.key, kind)}>
                  {pageName(kind)}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PlacedBlock({ item }: { item: Placed }) {
  const cms = useCms();
  const { content } = useHotelContent();
  const save = useSavePlacements();
  const def = BLOCK_LIBRARY.find((block) => block.key === item.block);
  const body = RENDER[item.block]?.() ?? null;
  if (!cms) return <>{body}</>;
  const remove = () => {
    const current = blockPlacements(content?.sections?.[item.block]);
    save(item.block, current.filter((entry) => !(entry.page === item.placement.page && entry.after === item.placement.after)));
  };
  return (
    <div className="block-placed">
      <div className="block-placed__bar" data-block-ui onPointerDown={(event) => event.stopPropagation()}>
        <span>
          Baustein „{def?.label}“ · {pageName(item.placement.page)}
        </span>
        <button type="button" onClick={remove}>
          <X size={13} strokeWidth={1.8} /> hier entfernen
        </button>
      </div>
      {body}
    </div>
  );
}

// Places the building blocks of this page (src/lib/blocks.ts) after the parts they follow;
// "end" and parts that no longer exist go to the end of the page. In the CMS, a marker after
// every part lets the editor place a block there.
export function BlockPlacer({ pathname }: { pathname: string }) {
  const cms = useCms();
  const placed = usePlaced(pathname);
  const [slots, setSlots] = useState<Array<{ key: string; label: string; el: HTMLElement }>>([]);
  const wantedRef = useRef('');
  wantedRef.current = placed.map((item) => item.placement.after).join('|');

  useEffect(() => {
    let frame = 0;
    const place = () => {
      const main = findPageMain();
      if (!main) return;
      const wanted = new Set(wantedRef.current.split('|'));
      const parts = pageParts(main).filter((part) => cms || wanted.has(part.key));
      const next = parts.map((part) => ({ key: part.key, label: part.label, el: slotAfter(part) }));
      // Slots nobody needs any more
      main.querySelectorAll('.block-slot').forEach((slot) => {
        if (!next.some((item) => item.el === slot)) slot.remove();
      });
      setSlots((current) =>
        current.length === next.length && current.every((item, index) => item.el === next[index].el && item.key === next[index].key) ? current : next,
      );
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    place();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      removeSlots();
      setSlots([]);
    };
  }, [pathname, cms, placed.length]);

  const found = new Set(slots.map((slot) => slot.key));
  const atEnd = placed.filter((item) => item.placement.after === 'end' || !found.has(item.placement.after));

  return (
    <>
      {slots.map((slot) =>
        createPortal(
          <>
            {placed
              .filter((item) => item.placement.after === slot.key)
              .map((item) => (
                <PlacedBlock key={`${item.block}:${item.placement.page}`} item={item} />
              ))}
            {cms ? <BlockMarker pathname={pathname} after={slot.key} label={slot.label} /> : null}
          </>,
          slot.el,
          slot.key,
        ),
      )}
      {atEnd.length ? (
        <div className="page-blocks">
          {atEnd.map((item) => (
            <PlacedBlock key={`${item.block}:${item.placement.page}:end`} item={item} />
          ))}
        </div>
      ) : null}
    </>
  );
}

// CMS page "Bausteine": every block once, to edit its content.
export function BlockLibrary() {
  return (
    <div className="page-blocks">
      {BLOCK_LIBRARY.map((def) => (
        <div key={def.key} className="page-blocks__item">
          {RENDER[def.key]?.()}
        </div>
      ))}
    </div>
  );
}
