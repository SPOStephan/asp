import { useEffect, useState } from 'react';
import { getPath, setPath } from './cmsDraft';

export const LIVE_MEDIA_KEY = 'cms-live-media';
export const LIVE_MEDIA_CHANNEL = 'cms-live-media';

export function overlayKey(section: string, path: string) {
  return `${section}::${path}`;
}

export function readLiveMedia(): Record<string, string> {
  if (typeof sessionStorage === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(LIVE_MEDIA_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function writeLiveMedia(section: string, path: string, url: string) {
  if (!url.trim()) return;
  const next = { ...readLiveMedia(), [overlayKey(section, path)]: url };
  sessionStorage.setItem(LIVE_MEDIA_KEY, JSON.stringify(next));
  sessionStorage.setItem(LIVE_STAMPS_KEY, JSON.stringify({ ...readLiveStamps(), [overlayKey(section, path)]: Date.now() }));
  window.dispatchEvent(new Event('cms-live-media'));
  try {
    const bus = new BroadcastChannel(LIVE_MEDIA_CHANNEL);
    bus.postMessage(next);
    bus.close();
  } catch {
    /* BroadcastChannel missing */
  }
}

// A removed picture must not come back from the session's list of fresh uploads.
export function clearLiveMedia(section: string, path: string) {
  const next = { ...readLiveMedia() };
  delete next[overlayKey(section, path)];
  sessionStorage.setItem(LIVE_MEDIA_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('cms-live-media'));
  try {
    const bus = new BroadcastChannel(LIVE_MEDIA_CHANNEL);
    bus.postMessage(next);
    bus.close();
  } catch {
    /* BroadcastChannel missing */
  }
}

// Fresh uploads only bridge the moment until the database has them. Entries the loaded
// content already carries (or that point to a picture since replaced or removed in the
// database) go, so an old picture can never come back from this list later.
export function pruneLiveMedia(sections: Record<string, Record<string, unknown>>, loadedAt: number) {
  const overlay = readLiveMedia();
  const stamps = readLiveStamps();
  let changed = false;
  for (const key of Object.keys(overlay)) {
    const [section, path] = key.split('::');
    const value = getPath(sections[section] ?? {}, path);
    if (value === overlay[key] || (stamps[key] ?? 0) < loadedAt - 60_000) {
      delete overlay[key];
      delete stamps[key];
      changed = true;
    }
  }
  if (!changed) return;
  sessionStorage.setItem(LIVE_MEDIA_KEY, JSON.stringify(overlay));
  sessionStorage.setItem(LIVE_STAMPS_KEY, JSON.stringify(stamps));
}

const LIVE_STAMPS_KEY = 'cms-live-media-at';

function readLiveStamps(): Record<string, number> {
  if (typeof sessionStorage === 'undefined') return {};
  try {
    return JSON.parse(sessionStorage.getItem(LIVE_STAMPS_KEY) || '{}') as Record<string, number>;
  } catch {
    return {};
  }
}

export function applyLiveMediaMap(
  section: string,
  data: Record<string, unknown> | null,
  overlay: Record<string, string>,
): Record<string, unknown> | null {
  if (!data) return data;
  let next = data;
  const prefix = `${section}::`;
  for (const [key, url] of Object.entries(overlay)) {
    if (!key.startsWith(prefix) || !url.trim()) continue;
    next = setPath(next, key.slice(prefix.length), url);
  }
  return next;
}

export function applyLiveMedia(section: string, data: Record<string, unknown> | null) {
  return applyLiveMediaMap(section, data, readLiveMedia());
}

export function useLiveMediaTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((current) => current + 1);
    window.addEventListener('cms-live-media', bump);
    let bus: BroadcastChannel | null = null;
    try {
      bus = new BroadcastChannel(LIVE_MEDIA_CHANNEL);
      bus.onmessage = bump;
    } catch {
      /* ignore */
    }
    return () => {
      window.removeEventListener('cms-live-media', bump);
      bus?.close();
    };
  }, []);
  return tick;
}
