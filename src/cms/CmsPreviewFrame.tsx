import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CMS_PHONE_HEIGHT, CMS_PHONE_WIDTH, toCmsFrameHref } from './cmsFrame';
import { useCms } from './CmsContext';

export function CmsPreviewFrame() {
  const cms = useCms();
  const location = useLocation();
  const phone = cms?.focalPreview === 'mobile';
  const device = phone ? 'mobile' : 'desktop';
  const src = toCmsFrameHref(location.pathname, device, location.search, location.hash);
  const previewRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(1);
  const setFrameWindow = cms?.setFrameWindow;

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

  useEffect(() => {
    return () => setFrameWindow?.(null);
  }, [setFrameWindow]);

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
        <div
          className="cms-device"
          style={phone ? { transform: `scale(${scale})` } : undefined}
        >
          <iframe
            key={device}
            ref={frameRef}
            className="cms-frame"
            title="Seitenvorschau"
            src={src}
            onLoad={() => setFrameWindow?.(frameRef.current?.contentWindow ?? null)}
          />
        </div>
      </div>
    </div>
  );
}
