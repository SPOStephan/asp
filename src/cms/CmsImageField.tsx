import type { ReactNode } from 'react';
import { useCms } from './CmsContext';
import { formatImageHint, imageHint } from './cmsImageHints';
import { inferAltPath } from './cmsSelect';

export function CmsImageField({
  label,
  value,
  section,
  path,
  focus,
  alt,
  children,
}: {
  label: string;
  value: string;
  section: string;
  path: string;
  focus?: string;
  // Current alt text, shown so it can be checked at a glance (changed in the picture dialog).
  alt?: string;
  // Further actions for this picture (e.g. move or remove in a gallery).
  children?: ReactNode;
}) {
  const cms = useCms();
  const hint = imageHint(section, path);
  return (
    <div className="cms-image" data-cms-panel-focus={focus ?? path}>
      <span>{label}</span>
      {value ? <img src={value} alt="" /> : <p className="cms-muted">Noch kein Bild — Datei wählen lädt es als WebP.</p>}
      <p className="cms-muted">{formatImageHint(hint)}</p>
      {alt !== undefined ? (
        <p className="cms-muted">{alt ? `Alt-Text: ${alt}` : 'Noch kein Alt-Text – wird beim Hochladen automatisch erstellt.'}</p>
      ) : null}
      <div className="cms-image__actions">
        <button
          type="button"
          className="cms-btn cms-btn--ghost"
          onClick={() => cms?.openImage({ section, path, altPath: inferAltPath(path) })}
        >
          {value ? 'Ausschnitt ändern / neues Bild' : 'Bild wählen / hochladen'}
        </button>
        {children}
      </div>
    </div>
  );
}
