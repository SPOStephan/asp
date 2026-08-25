import type { ReactNode } from 'react';
import { useCms } from './CmsContext';

export function CmsSection({ sectionKey, label, children }: { sectionKey: string; label: string; children: ReactNode }) {
  const cms = useCms();
  if (!cms) return children;

  return (
    <div
      className={`cms-block${cms.selected?.section === sectionKey ? ' is-on' : ''}`}
      data-cms-section={sectionKey}
    >
      <span className="cms-block__label">{label}</span>
      {children}
    </div>
  );
}
