import { Eye, EyeOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { useSection } from '../context/HotelContext';
import { useCms } from './CmsContext';
import { isLayoutHideable, isSectionHidden } from './cmsHidden';

export function CmsSection({
  sectionKey,
  label,
  hideable,
  hiddenKey = 'hidden',
  children,
}: {
  sectionKey: string;
  label: string;
  hideable?: boolean;
  hiddenKey?: string;
  children: ReactNode;
}) {
  const cms = useCms();
  const data = useSection(sectionKey);
  const canHide = hideable ?? isLayoutHideable(sectionKey);
  const hidden = isSectionHidden(data, hiddenKey);

  if (hidden && !cms) return null;
  if (!cms) return children;

  return (
    <div
      className={`cms-block${cms.selected?.section === sectionKey ? ' is-on' : ''}${hidden ? ' is-hidden' : ''}`}
      data-cms-section={sectionKey}
    >
      <div className="cms-block__chrome">
        <span className="cms-block__label">{hidden ? `${label} · aus` : label}</span>
        {canHide ? (
          <button
            type="button"
            className="cms-block__eye"
            data-cms-ui="hide"
            aria-pressed={hidden}
            aria-label={hidden ? `${label} einblenden` : `${label} ausblenden`}
            title={hidden ? 'Für dieses Hotel einblenden' : 'Für dieses Hotel ausblenden'}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              cms.applyField(sectionKey, hiddenKey, !hidden);
            }}
          >
            {hidden ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />}
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}
