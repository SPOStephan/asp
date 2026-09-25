import { useRef, type PointerEvent, type ReactNode } from 'react';
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
  const drag = useRef<{
    x: number;
    y: number;
    start: { x: number; y: number };
    moved: boolean;
  } | null>(null);

  if (!cms || !section) return children;

  const device: FocalDevice = cms.focalPreview;

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const focal = readHeroFocal(value)[device];
    drag.current = { x: event.clientX, y: event.clientY, start: focal, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current) return;
    const frame = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) current.moved = true;
    const next = writeHeroFocal(value, device, panFocal(current.start, dx, dy, frame.width, frame.height));
    cms.applyField(section, path, next, true);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.moved) {
      event.preventDefault();
      event.stopPropagation();
    }
    drag.current = null;
  }

  return (
    <div
      className="cms-hero-pan"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        drag.current = null;
      }}
    >
      {children}
      <span className="cms-hero-pan__hint">
        {device === 'mobile' ? 'Telefon-Ausschnitt ziehen' : 'Desktop-Ausschnitt ziehen'}
      </span>
    </div>
  );
}
