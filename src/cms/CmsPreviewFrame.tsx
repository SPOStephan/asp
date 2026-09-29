import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CMS_PHONE_HEIGHT, CMS_PHONE_WIDTH } from './cmsFrame';
import { useCms } from './CmsContext';

export function CmsPreviewFrame({ children }: { children: ReactNode }) {
  const cms = useCms();
  const phone = cms?.focalPreview === 'mobile';
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || !phone) {
      setScale(1);
      return;
    }
    const update = () => {
      const width = preview.clientWidth - 32;
      const height = preview.clientHeight - 32;
      setScale(Math.min(1, width / CMS_PHONE_WIDTH, height / CMS_PHONE_HEIGHT));
    };
    const observer = new ResizeObserver(update);
    observer.observe(preview);
    update();
    return () => observer.disconnect();
  }, [phone]);

  return (
    <div ref={previewRef} className={`cms-preview${phone ? ' is-phone' : ' is-desktop'}`}>
      <div
        className="cms-device-slot"
        style={
          phone
            ? { width: CMS_PHONE_WIDTH * scale, height: CMS_PHONE_HEIGHT * scale }
            : undefined
        }
      >
        <div className="cms-device" style={phone ? { transform: `scale(${scale})` } : undefined}>
          <div className="cms-frame">{children}</div>
        </div>
      </div>
    </div>
  );
}
