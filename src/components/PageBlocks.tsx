import type { ReactNode } from 'react';
import { useHotelContent } from '../context/HotelContext';
import { BLOCK_LIBRARY, blockOnPage, blockPages } from '../lib/blocks';
import { DayStory } from '../benchmark/DayStory';
import { Generations } from './Generations';

const RENDER: Record<string, () => ReactNode> = {
  day_story: () => <DayStory />,
  generations: () => <Generations />,
};

// The building blocks the editor placed on this page, at its end (above the footer).
// `all` shows every block (the CMS page "Bausteine").
export function PageBlocks({ pathname, all = false }: { pathname: string; all?: boolean }) {
  const { content } = useHotelContent();
  const sections = content?.sections ?? {};
  const shown = BLOCK_LIBRARY.filter((def) => all || blockOnPage(blockPages(def, sections[def.key]), pathname));
  if (!shown.length) return null;
  return (
    <div className="page-blocks">
      {shown.map((def) => (
        <div key={def.key} className="page-blocks__item">
          {RENDER[def.key]?.()}
        </div>
      ))}
    </div>
  );
}

// Whether the start page shows a block in its usual place.
export function useBlockOnHome(key: string) {
  const { content } = useHotelContent();
  const def = BLOCK_LIBRARY.find((item) => item.key === key);
  if (!def) return true;
  return blockOnPage(blockPages(def, content?.sections?.[key]), '/');
}
