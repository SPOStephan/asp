import type { CropRect } from './cmsImage';

// Every uploaded picture keeps its original and the chosen crop, so it can be moved,
// zoomed and cropped again later without losing what was cut away.
// Stored per section: media_sources[<field path>] = { src, crop }.
export const MEDIA_SOURCES_KEY = 'media_sources';

export type MediaSource = { src: string; crop?: CropRect };

export function readMediaSource(section: Record<string, unknown> | null | undefined, path: string): MediaSource | null {
  const all = section?.[MEDIA_SOURCES_KEY];
  if (!all || typeof all !== 'object') return null;
  const entry = (all as Record<string, unknown>)[path] as Partial<MediaSource> | undefined;
  if (!entry || typeof entry.src !== 'string' || !entry.src) return null;
  const crop = entry.crop;
  const valid = crop && [crop.x, crop.y, crop.width, crop.height].every((value) => Number.isFinite(value)) && crop.width > 0 && crop.height > 0;
  return { src: entry.src, crop: valid ? crop : undefined };
}

export function withMediaSource(section: Record<string, unknown>, path: string, source: MediaSource) {
  const all = section[MEDIA_SOURCES_KEY] && typeof section[MEDIA_SOURCES_KEY] === 'object' ? (section[MEDIA_SOURCES_KEY] as Record<string, unknown>) : {};
  return { ...section, [MEDIA_SOURCES_KEY]: { ...all, [path]: source } };
}

export function withoutMediaSource(section: Record<string, unknown>, path: string) {
  const all = section[MEDIA_SOURCES_KEY] && typeof section[MEDIA_SOURCES_KEY] === 'object' ? { ...(section[MEDIA_SOURCES_KEY] as Record<string, unknown>) } : {};
  delete all[path];
  return { ...section, [MEDIA_SOURCES_KEY]: all };
}

// A crop must lie inside the picture (the original may be smaller than when it was cut).
export function clampCrop(crop: CropRect, width: number, height: number): CropRect {
  const w = Math.min(Math.max(1, crop.width), width);
  const h = Math.min(Math.max(1, crop.height), height);
  return { x: Math.min(Math.max(0, crop.x), width - w), y: Math.min(Math.max(0, crop.y), height - h), width: w, height: h };
}

// Pictures on the CDN are read through our own address, so the browser may edit them.
export function editableImageUrl(src: string) {
  if (src.startsWith('/') && !src.startsWith('//')) return src;
  return `/api/media-proxy?url=${encodeURIComponent(src)}`;
}
