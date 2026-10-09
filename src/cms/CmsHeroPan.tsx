import { useLayoutEffect, useRef, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { CENTER_FOCAL, panFocal, readHeroFocal, readZoom, writeHeroFocal, zoomHeroFocal, type FocalDevice } from './cmsFocal';
import { useCms } from './CmsContext';

export function CmsHeroPan({
  section,
  path,
  value,
  tile = false,
  children,
}: {
  section: string;
  path: string;
  value: unknown;
  // A picture inside a grid or list (e.g. the impressions): smaller tools, and the
  // new position goes into the editor panel as soon as the drag ends.
  tile?: boolean;
  children: ReactNode;
}) {
  const cms = useCms();
  const rootRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    start: { x: number; y: number };
    moved: boolean;
  } | null>(null);
  const device: FocalDevice = cms?.focalPreview ?? 'desktop';
  // Tiles start centred on phones too; the hero keeps its own phone default.
  const fallback = tile ? CENTER_FOCAL : undefined;
  const point = readHeroFocal(value, fallback)[device];
  const zoom = readZoom(point);

  useLayoutEffect(() => {
    const img = rootRef.current?.querySelector('img');
    if (!(img instanceof HTMLImageElement)) return;
    img.style.objectPosition = `${point.x}% ${point.y}%`;
    img.style.transform = `scale(${zoom})`;
    img.style.transformOrigin = `${point.x}% ${point.y}%`;
    img.draggable = false;
  }, [point.x, point.y, zoom]);

  if (!cms || !section) return children;

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const focal = readHeroFocal(value, fallback)[device];
    drag.current = { x: event.clientX, y: event.clientY, start: focal, moved: false };
    event.currentTarget.classList.remove('is-panned');
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current) return;
    const frame = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      current.moved = true;
      event.currentTarget.classList.add('is-panned');
    }
    const next = writeHeroFocal(value, device, panFocal(current.start, dx, dy, frame.width, frame.height), fallback);
    const nextPoint = next[device];
    const img = event.currentTarget.querySelector('img');
    if (img instanceof HTMLImageElement) {
      img.style.objectPosition = `${nextPoint.x}% ${nextPoint.y}%`;
      img.style.transformOrigin = `${nextPoint.x}% ${nextPoint.y}%`;
      img.style.transform = `scale(${readZoom(nextPoint)})`;
    }
    cms.applyField(section, path, next, true);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.moved) {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.classList.add('is-panned');
      if (tile) {
        const frame = event.currentTarget.getBoundingClientRect();
        const next = writeHeroFocal(
          value,
          device,
          panFocal(drag.current.start, event.clientX - drag.current.x, event.clientY - drag.current.y, frame.width, frame.height),
          fallback,
        );
        cms!.applyField(section, path, next);
      }
    }
    drag.current = null;
  }

  function onClick(event: MouseEvent<HTMLDivElement>) {
    if (!event.currentTarget.classList.contains('is-panned')) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('is-panned');
  }

  return (
    <div
      ref={rootRef}
      className={tile ? 'cms-hero-pan cms-hero-pan--tile' : 'cms-hero-pan'}
      data-cms-pan=""
      style={{ '--cms-hero-focal': `${point.x}% ${point.y}%` } as CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onClick={onClick}
    >
      {children}
      {/* data-cms-ui: the CMS click handler must leave these buttons alone. */}
      <div className="cms-hero-pan__tools" data-cms-ui="">
        <span className="cms-hero-pan__hint">
          {tile ? (device === 'mobile' ? 'Mobil' : 'Desktop') : `${device === 'mobile' ? 'Mobil ziehen' : 'Desktop ziehen'} · + / − zoomt`}
        </span>
        <button
          type="button"
          className="cms-hero-pan__zoom"
          aria-label="Näher"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            cms.applyField(section, path, zoomHeroFocal(value, device, 1.12, fallback));
          }}
        >
          +
        </button>
        <button
          type="button"
          className="cms-hero-pan__zoom"
          aria-label="Weiter"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            cms.applyField(section, path, zoomHeroFocal(value, device, 0.9, fallback));
          }}
        >
          −
        </button>
      </div>
    </div>
  );
}
