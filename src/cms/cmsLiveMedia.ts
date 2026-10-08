import { useEffect, useState } from 'react';
import { setPath } from './cmsDraft';

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
