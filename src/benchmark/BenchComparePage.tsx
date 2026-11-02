import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { benchPublicPath, markBenchSeen, toBenchHref } from '../lib/benchmark';
import './bench.css';

type Device = 'desktop' | 'phone';
const SIZES: Record<Device, { width: number; height: number }> = {
  desktop: { width: 1440, height: 900 },
  phone: { width: 390, height: 844 },
};

// Before and after side by side: the live page left, the benchmark copy right, scrolling
// together. Desktop frames are drawn at 1440 px and scaled down to fit.
export function BenchComparePage() {
  const [params, setParams] = useSearchParams();
  const page = benchPublicPath(params.get('seite') || '/');
  const device: Device = params.get('geraet') === 'handy' ? 'phone' : 'desktop';
  const [sync, setSync] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const left = useRef<HTMLIFrameElement>(null);
  const right = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    markBenchSeen();
    document.title = 'Vorher / Nachher';
  }, []);

  useEffect(() => {
    const fit = () => {
      const width = stageRef.current?.clientWidth ?? window.innerWidth;
      const { width: w } = SIZES[device];
      setScale(Math.min(1, (width - 24) / 2 / w));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [device]);

  // Scroll sync between the two frames (same origin), by share of the page height.
  useEffect(() => {
    if (!sync) return;
    let lock = false;
    const frames = [left.current, right.current];
    const cleanups: Array<() => void> = [];
    const bind = () => {
      cleanups.forEach((fn) => fn());
      cleanups.length = 0;
      frames.forEach((frame, index) => {
        const win = frame?.contentWindow;
        const other = frames[1 - index]?.contentWindow;
        if (!win || !other) return;
        const onScroll = () => {
          if (lock) return;
          lock = true;
          const doc = win.document.documentElement;
          const ratio = win.scrollY / Math.max(1, doc.scrollHeight - win.innerHeight);
          const otherDoc = other.document.documentElement;
          other.scrollTo({ top: ratio * (otherDoc.scrollHeight - other.innerHeight) });
          requestAnimationFrame(() => {
            lock = false;
          });
        };
        win.addEventListener('scroll', onScroll, { passive: true });
        cleanups.push(() => win.removeEventListener('scroll', onScroll));
      });
    };
    const onLoad = () => bind();
    frames.forEach((frame) => frame?.addEventListener('load', onLoad));
    bind();
    return () => {
      frames.forEach((frame) => frame?.removeEventListener('load', onLoad));
      cleanups.forEach((fn) => fn());
    };
  }, [sync, page, device]);

  const { width, height } = SIZES[device];
  // Desktop frames fill the window height (a tall page view); phones keep their screen size.
  const frameHeight = device === 'phone' ? Math.min(height, window.innerHeight - 110) : Math.max(height, (window.innerHeight - 110) / scale);
  const frameBox = { width: width * scale, height: frameHeight * scale };
  const frameStyle = { width, height: frameBox.height / scale, transform: `scale(${scale})` };
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
  };

  return (
    <div className="bench-compare">
      <header className="bench-compare__bar">
        <strong>Vorher / Nachher</strong>
        <label>
          Seite
          <input
            defaultValue={page}
            key={page}
            onKeyDown={(event) => {
              if (event.key === 'Enter') set('seite', (event.target as HTMLInputElement).value || '/');
            }}
            aria-label="Adresse der Seite, z. B. /zimmer"
          />
        </label>
        <div className="bench-compare__seg" role="group" aria-label="Gerät">
          <button type="button" aria-pressed={device === 'desktop'} onClick={() => set('geraet', 'desktop')}>
            Desktop
          </button>
          <button type="button" aria-pressed={device === 'phone'} onClick={() => set('geraet', 'handy')}>
            Handy
          </button>
        </div>
        <label className="bench-compare__check">
          <input type="checkbox" checked={sync} onChange={(event) => setSync(event.target.checked)} />
          gemeinsam scrollen
        </label>
        <a href={toBenchHref(page)}>Nur Nachher öffnen</a>
      </header>
      <div className="bench-compare__stage" ref={stageRef}>
        {[
          { ref: left, src: page, label: 'Vorher' },
          { ref: right, src: toBenchHref(page), label: 'Nachher' },
        ].map((side) => (
          <figure key={side.label} className="bench-compare__side">
            <figcaption>{side.label}</figcaption>
            <div className="bench-compare__frame" style={frameBox}>
              <iframe ref={side.ref} src={side.src} title={side.label} style={frameStyle} />
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}
