// Reads a picture from our CDN for the CMS image tool. Served from the site's own
// address, the browser may then edit it (crop, zoom) without cross-origin limits.
// Only the configured Bunny pull zone is allowed, nothing else on the internet.

const MAX_BYTES = 25 * 1024 * 1024;

function env(name: string) {
  return ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name] || '').trim();
}

function cdnHost() {
  const value = env('BUNNY_CDN_URL').replace(/^(?!https?:\/\/)(?=.)/i, 'https://');
  try {
    return value ? new URL(value).host.toLowerCase() : '';
  } catch {
    return '';
  }
}

export function allowedMediaUrl(raw: string, host: string) {
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && Boolean(host) && url.host.toLowerCase() === host;
  } catch {
    return false;
  }
}

// The CDN's optimizer shrinks pictures on delivery (e.g. 1600 px for desktops, 800 px for
// phones). Editing needs the full file: read it from the storage zone when its key is set,
// otherwise ask the CDN for the largest size.
async function fetchFull(raw: string) {
  const zone = env('BUNNY_STORAGE_ZONE');
  const key = env('BUNNY_STORAGE_API_KEY');
  const storageHost = env('BUNNY_STORAGE_HOST') || 'storage.bunnycdn.com';
  const path = new URL(raw).pathname.replace(/^\/+/, '');
  if (zone && key && path) {
    const stored = await fetch(`https://${storageHost}/${zone}/${path}`, { headers: { AccessKey: key } });
    if (stored.ok) return stored;
  }
  const url = new URL(raw);
  url.searchParams.set('width', '9999');
  return fetch(url.toString());
}

function typeFromPath(raw: string) {
  const ext = new URL(raw).pathname.split('.').pop()?.toLowerCase() ?? '';
  return { webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', avif: 'image/avif', gif: 'image/gif' }[ext] ?? '';
}

export default async function handler(request: Request) {
  const raw = new URL(request.url).searchParams.get('url') ?? '';
  if (!allowedMediaUrl(raw, cdnHost())) return new Response('Nur Bilder der eigenen Bunny-Pull-Zone.', { status: 400 });
  const upstream = await fetchFull(raw);
  // The storage zone answers with a generic type; the file name tells the real one.
  const sent = upstream.headers.get('content-type') ?? '';
  const type = sent.startsWith('image/') ? sent : typeFromPath(raw);
  if (!upstream.ok || !type.startsWith('image/')) return new Response(`Bild nicht lesbar (${upstream.status}).`, { status: 502 });
  const length = Number(upstream.headers.get('content-length') || 0);
  if (length > MAX_BYTES) return new Response('Bild zu groß.', { status: 413 });
  return new Response(upstream.body, { headers: { 'Content-Type': type, 'Cache-Control': 'private, max-age=300' } });
}

export const config = { runtime: 'edge' };
