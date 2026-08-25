import type { ReactNode, MouseEvent } from 'react';
import { useCms } from './CmsContext';

export function CmsSection({ sectionKey, label, children }: { sectionKey: string; label: string; children: ReactNode }) {
  const cms = useCms();
  if (!cms) return children;

  function onClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    cms?.select(sectionKey);
  }

  return (
    <div
      className={`cms-block${cms.selected === sectionKey ? ' is-on' : ''}`}
      data-cms-section={sectionKey}
      onClickCapture={onClick}
    >
      <span className="cms-block__label">{label}</span>
      {children}
    </div>
  );
}
