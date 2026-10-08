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
  // Desktop: the page is laid out at the size of the editor's own browser window and scaled
  // down to fit beside the panel, so the preview shows the real cut of every picture.
  const [screen, setScreen] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  const setFrameWindow = cms?.setFrameWindow;
  const deviceWidth = phone ? CMS_PHONE_WIDTH : screen.width;
  const deviceHeight = phone ? CMS_PHONE_HEIGHT : screen.height;

  useEffect(() => {
    const onResize = () => setScreen({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    const update = () => {
      const width = preview.clientWidth - 32;
      const height = preview.clientHeight - 32;
      setScale(Math.min(1, width / deviceWidth, height / deviceHeight));
    };
    const observer = new ResizeObserver(update);
    observer.observe(preview);
    update();
    return () => observer.disconnect();
  }, [deviceWidth, deviceHeight]);

  useEffect(() => {
    return () => setFrameWindow?.(null);
  }, [setFrameWindow]);

  return (
    <div ref={previewRef} className={`cms-preview${phone ? ' is-phone' : ' is-desktop'}`}>
      <div
        className="cms-device-slot"
        style={{ width: deviceWidth * scale, height: deviceHeight * scale }}
      >
        <div
          className="cms-device"
          style={{ width: deviceWidth, height: deviceHeight, transform: `scale(${scale})` }}
        >
          <iframe
            key={device}
            ref={frameRef}
            className="cms-frame"
            title="Seitenvorschau"
            src={src}
            style={{ width: deviceWidth, height: deviceHeight }}
            onLoad={() => setFrameWindow?.(frameRef.current?.contentWindow ?? null)}
          />
        </div>
      </div>
    </div>
  );
}
