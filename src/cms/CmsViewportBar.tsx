import { Monitor, Smartphone } from 'lucide-react';
import { useCms } from './CmsContext';

export function CmsViewportBar() {
  const cms = useCms();
  if (!cms) return null;

  return (
    <div className="cms-viewport" role="toolbar" aria-label="Ansicht">
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
