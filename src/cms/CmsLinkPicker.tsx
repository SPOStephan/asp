import { useMemo, useState } from 'react';
import { useHotelContent } from '../context/HotelContext';
import { createHotelPage } from '../lib/applyHotelPages';
import { GENERIC_SKELETON, genericSectionKey } from '../lib/pageTemplates';
import { cmsLinkTargets, filterLinkTargets, isExternalHref, matchLinkTarget } from './cmsLinkTargets';

export function CmsLinkPicker({
  label = 'Link',
  value,
  context,
  newTab,
  onChange,
  onNewTabChange,
}: {
  label?: string;
  value: string;
  // Title of the item that carries the link; older links resolve through it.
  context?: string;
  newTab?: boolean;
  onChange: (href: string) => void;
  // Without it the link has no "new tab" choice (e.g. the navigation bar).
  onNewTabChange?: (next: boolean) => void;
}) {
  const { content, enablePages, patchSection } = useHotelContent();
  const targets = useMemo(() => cmsLinkTargets(content), [content]);
  const current = matchLinkTarget(targets, value, context);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hits = filterLinkTargets(targets, query);
  const external = isExternalHref(query) ? query.trim() : '';

  function pick(href: string) {
    onChange(href);
    setOpen(false);
    setQuery('');
  }

  async function createPage() {
    const title = query.trim();
    if (!content || !title) return;
    setCreating(true);
    setError(null);
    const result = await createHotelPage(content.hotel.id, title, Object.keys(content.pages));
    setCreating(false);
    if (result.error || !result.key) {
      setError(result.error ?? 'Seite konnte nicht angelegt werden.');
      return;
    }
    patchSection(genericSectionKey(result.key), { ...GENERIC_SKELETON, title });
    enablePages([result.key]);
    pick(`/seite/${result.key}`);
  }

  return (
    <div className="cms-field cms-link">
      {label}
      <button type="button" className="cms-link__current" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{current ? `${current.group} · ${current.label}` : value || 'Kein Ziel gewählt'}</span>
        <small>{current?.href ?? value}</small>
      </button>
      {open ? (
        <div className="cms-link__panel">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Seite suchen oder https://… eingeben"
            autoFocus
          />
          <ul className="cms-link__list">
            {external ? (
              <li>
                <button type="button" onClick={() => pick(external)}>
                  <span>Externer Link</span>
                  <small>{external}</small>
                </button>
              </li>
            ) : null}
            {hits.map((target) => (
              <li key={target.href}>
                <button type="button" onClick={() => pick(target.href)} aria-current={current?.href === target.href}>
                  <span>
                    {target.group} · {target.label}
                    {target.active ? '' : ' (wird beim Speichern angelegt)'}
                  </span>
                  <small>{target.href}</small>
                </button>
              </li>
            ))}
            {!hits.length && !external ? <li className="cms-muted">Keine Seite gefunden.</li> : null}
          </ul>
          <button type="button" className="cms-btn cms-btn--ghost" disabled={!query.trim() || creating || Boolean(external)} onClick={() => void createPage()}>
            {creating ? 'Legt an…' : query.trim() && !external ? `Neue Seite „${query.trim()}“` : 'Neue Seite (Namen oben eingeben)'}
          </button>
          {error ? <p className="cms-error">{error}</p> : null}
        </div>
      ) : null}
      {onNewTabChange ? (
        <label className="cms-choice">
          <input type="checkbox" checked={Boolean(newTab)} onChange={(event) => onNewTabChange(event.target.checked)} />
          In neuem Tab öffnen
        </label>
      ) : null}
    </div>
  );
}
