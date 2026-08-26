import { useEffect, useLayoutEffect, useState } from 'react';
import { useCms } from './CmsContext';

export function CmsInlineEdit() {
  const cms = useCms();
  const inline = cms?.inline;
  const [text, setText] = useState('');
  const [box, setBox] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!inline) {
      setBox(null);
      return;
    }
    const el = document.querySelector(`.cms-stage [data-cms-path="${CSS.escape(inline.path)}"]`);
    if (!(el instanceof HTMLElement)) return;
    el.dataset.cmsEditing = 'true';
    el.contentEditable = 'true';
    el.focus();
    setText(el.innerText);
    setBox(el.getBoundingClientRect());

    function onInput() {
      if (el instanceof HTMLElement) setText(el.innerText);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        cms?.cancelInline();
      }
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        cms?.commitInline(el.innerText);
      }
    }
    el.addEventListener('input', onInput);
    el.addEventListener('keydown', onKey);
    return () => {
      el.removeEventListener('input', onInput);
      el.removeEventListener('keydown', onKey);
      el.removeAttribute('data-cms-editing');
      el.contentEditable = 'false';
    };
  }, [inline?.section, inline?.path, inline?.original]);

  useEffect(() => {
    if (!inline) return;
    function onScroll() {
      const el = document.querySelector(`.cms-stage [data-cms-path="${CSS.escape(inline.path)}"]`);
      if (el instanceof HTMLElement) setBox(el.getBoundingClientRect());
    }
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [inline?.path]);

  if (!cms || !inline || !box) return null;

  return (
    <div className="cms-inline" style={{ top: Math.max(12, box.top - 48), left: box.left }}>
      <button type="button" className="cms-btn" onClick={() => cms.commitInline(text)}>
        Übernehmen
      </button>
      <button type="button" className="cms-btn cms-btn--ghost" onClick={() => cms.cancelInline()}>
        Abbrechen
      </button>
    </div>
  );
}
