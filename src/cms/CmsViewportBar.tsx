import { Monitor, Smartphone, Undo2 } from 'lucide-react';
import { useEffect } from 'react';
import { useCms } from './CmsContext';

export function CmsViewportBar() {
  const cms = useCms();
  const canUndo = Boolean(cms?.canUndo);
  const undo = cms?.undo;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z' || event.shiftKey) return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return;
      }
      if (!canUndo || !undo) return;
      event.preventDefault();
      undo();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canUndo, undo]);

  if (!cms) return null;

  return (
    <div className="cms-viewport" role="toolbar" aria-label="Ansicht">
      <button
        type="button"
        className="cms-viewport__btn"
        aria-label="Rückgängig"
        title="Letzte Aktion rückgängig machen"
        disabled={!cms.canUndo}
        onClick={() => cms.undo()}
      >
        <Undo2 size={20} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`cms-viewport__btn${cms.focalPreview === 'desktop' ? ' is-on' : ''}`}
        aria-pressed={cms.focalPreview === 'desktop'}
        aria-label="Desktop-Ansicht"
        onClick={() => cms.setFocalPreview('desktop')}
      >
        <Monitor size={20} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`cms-viewport__btn${cms.focalPreview === 'mobile' ? ' is-on' : ''}`}
        aria-pressed={cms.focalPreview === 'mobile'}
        aria-label="Mobil-Ansicht"
        onClick={() => cms.setFocalPreview('mobile')}
      >
        <Smartphone size={20} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  );
}
