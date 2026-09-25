import { useLayoutEffect, useRef, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { panFocal, readHeroFocal, writeHeroFocal, type FocalDevice } from './cmsFocal';
import { useCms } from './CmsContext';

export function CmsHeroPan({
  section,
  path,
  value,
  children,
}: {
  section: string;
  path: string;
  value: unknown;
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
  const point = readHeroFocal(value)[device];

  useLayoutEffect(() => {
    const img = rootRef.current?.querySelector('img');
    if (!(img instanceof HTMLImageElement)) return;
    img.style.objectPosition = `${point.x}% ${point.y}%`;
    img.draggable = false;
  }, [point.x, point.y]);

  if (!cms || !section) return children;

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const focal = readHeroFocal(value)[device];
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
    const next = writeHeroFocal(value, device, panFocal(current.start, dx, dy, frame.width, frame.height));
    const nextPoint = next[device];
    const img = event.currentTarget.querySelector('img');
    if (img instanceof HTMLImageElement) {
      img.style.objectPosition = `${nextPoint.x}% ${nextPoint.y}%`;
    }
    cms.applyField(section, path, next, true);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.moved) {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.classList.add('is-panned');
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
      className="cms-hero-pan"
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
      <span className="cms-hero-pan__hint">
        {device === 'mobile' ? 'Mobil-Ausschnitt ziehen' : 'Desktop-Ausschnitt ziehen'}
      </span>
    </div>
  );
}
