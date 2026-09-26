import { Eye, EyeOff, Pencil } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useSection } from '../context/HotelContext';
import { useCms } from './CmsContext';
import { isLayoutHideable, isSectionHidden, sectionDisplayName } from './cmsHidden';

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
  const display = sectionDisplayName(data, label);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(display);

  useEffect(() => {
    if (!editing) setDraft(display);
  }, [display, editing]);

  if (hidden && !cms) return null;
  if (!cms) return children;

  function saveLabel() {
    const next = draft.trim();
    cms!.applyField(sectionKey, 'cms_label', next);
    setEditing(false);
  }

  return (
    <div
      className={`cms-block${cms.selected?.section === sectionKey ? ' is-on' : ''}${hidden ? ' is-hidden' : ''}`}
      data-cms-section={sectionKey}
    >
      <div className="cms-block__chrome">
        {editing ? (
          <input
            className="cms-block__name"
            data-cms-ui="rename"
            value={draft}
            aria-label="Internen Namen ändern"
            onChange={(event) => setDraft(event.target.value)}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            onBlur={saveLabel}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                saveLabel();
              }
              if (event.key === 'Escape') setEditing(false);
            }}
            autoFocus
          />
        ) : (
          <span className="cms-block__label">{hidden ? `${display} · aus` : display}</span>
        )}
        <button
          type="button"
          className="cms-block__eye"
          data-cms-ui="rename"
          aria-label={`${display} umbenennen`}
          title="Internen Namen ändern"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setDraft(display);
            setEditing(true);
          }}
        >
          <Pencil size={14} strokeWidth={1.75} />
        </button>
        {canHide ? (
          <button
            type="button"
            className="cms-block__eye"
            data-cms-ui="hide"
            aria-pressed={hidden}
            aria-label={hidden ? `${display} einblenden` : `${display} ausblenden`}
            title={hidden ? 'Für dieses Hotel einblenden' : 'Für dieses Hotel ausblenden'}
            onPointerDown={(event) => event.stopPropagation()}
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
