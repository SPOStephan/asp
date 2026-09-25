export type FocalPoint = { x: number; y: number };

export type HeroFocal = {
  desktop: FocalPoint;
  mobile: FocalPoint;
};

export type FocalDevice = 'desktop' | 'mobile';

const DEFAULT_DESKTOP: FocalPoint = { x: 50, y: 50 };
const DEFAULT_MOBILE: FocalPoint = { x: 68, y: 50 };

function clamp(value: number) {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

function asPoint(value: unknown, fallback: FocalPoint): FocalPoint {
  if (!value || typeof value !== 'object') return fallback;
  const record = value as Record<string, unknown>;
  const x = Number(record.x);
  const y = Number(record.y);
  return {
    x: Number.isFinite(x) ? clamp(x) : fallback.x,
    y: Number.isFinite(y) ? clamp(y) : fallback.y,
  };
}

export function readHeroFocal(value: unknown, mobileFallback: FocalPoint = DEFAULT_MOBILE): HeroFocal {
  if (!value || typeof value !== 'object') {
    return { desktop: DEFAULT_DESKTOP, mobile: mobileFallback };
  }
  const record = value as Record<string, unknown>;
  if (record.desktop || record.mobile) {
    return {
      desktop: asPoint(record.desktop, DEFAULT_DESKTOP),
      mobile: asPoint(record.mobile, mobileFallback),
    };
  }
  if ('x' in record || 'y' in record) {
    const legacy = asPoint(record, mobileFallback);
    return { desktop: DEFAULT_DESKTOP, mobile: legacy };
  }
  return { desktop: DEFAULT_DESKTOP, mobile: mobileFallback };
}

export function heroFocalStyle(value: unknown, mobileFallback?: FocalPoint) {
  const focal = readHeroFocal(value, mobileFallback);
  return {
    '--hero-focal': `${focal.mobile.x}% ${focal.mobile.y}%`,
    '--hero-focal-desktop': `${focal.desktop.x}% ${focal.desktop.y}%`,
    '--hero-focal-mobile': `${focal.mobile.x}% ${focal.mobile.y}%`,
  } as Record<string, string>;
}

export function panFocal(start: FocalPoint, dx: number, dy: number, width: number, height: number): FocalPoint {
  const safeWidth = width || 1;
  const safeHeight = height || 1;
  return {
    x: clamp(start.x - (dx / safeWidth) * 100),
    y: clamp(start.y - (dy / safeHeight) * 100),
  };
}

export function entryFocal(items: unknown, entryId: string) {
  if (!Array.isArray(items)) return undefined;
  const item = items.find(
    (entry) =>
      typeof entry === 'object' &&
      entry !== null &&
      ('id' in entry || 'slug' in entry) &&
      ((entry as { id?: unknown }).id === entryId || (entry as { slug?: unknown }).slug === entryId),
  );
  return typeof item === 'object' && item && 'hero_focal' in item ? (item as { hero_focal?: unknown }).hero_focal : undefined;
}

export function writeHeroFocal(current: unknown, device: FocalDevice, point: FocalPoint): HeroFocal {
  const next = readHeroFocal(current);
  next[device] = { x: clamp(point.x), y: clamp(point.y) };
  return next;
}

function sameEntry(item: Record<string, unknown>, live: Record<string, unknown>) {
  return (
    (typeof item.id === 'string' && item.id === live.id) ||
    (typeof item.slug === 'string' && item.slug === live.slug)
  );
}

export function keepLiveFocals(
  published: Record<string, unknown>,
  live: Record<string, unknown> | undefined | null,
): Record<string, unknown> {
  if (!live) return published;
  const next = { ...published };
  if ('hero_focal' in live) next.hero_focal = live.hero_focal;
  if (Array.isArray(published.items) && Array.isArray(live.items)) {
    next.items = published.items.map((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return item;
      const record = item as Record<string, unknown>;
      const liveItem = live.items.find(
        (entry): entry is Record<string, unknown> =>
          Boolean(entry) &&
          typeof entry === 'object' &&
          !Array.isArray(entry) &&
          sameEntry(record, entry as Record<string, unknown>),
      );
      if (!liveItem || !('hero_focal' in liveItem)) return item;
      return { ...record, hero_focal: liveItem.hero_focal };
    });
  }
  return next;
}
