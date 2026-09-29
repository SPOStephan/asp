import { useCms } from './CmsContext';
import { formatImageHint, imageHint } from './cmsImageHints';
import { inferAltPath } from './cmsSelect';

export function CmsImageField({
  label,
  value,
  section,
  path,
  focus,
}: {
  label: string;
  value: string;
  section: string;
  path: string;
  focus?: string;
}) {
  const cms = useCms();
  const hint = imageHint(section, path);
  return (
    <div className="cms-image" data-cms-panel-focus={focus ?? path}>
      <span>{label}</span>
      {value ? <img src={value} alt="" /> : <p className="cms-muted">Noch kein Bild — Datei wählen lädt es als WebP.</p>}
      <p className="cms-muted">{formatImageHint(hint)}</p>
      <button
        type="button"
        className="cms-btn cms-btn--ghost"
        onClick={() => cms?.openImage({ section, path, altPath: inferAltPath(path) })}
      >
        Bild wählen / hochladen
      </button>
    </div>
  );
}
