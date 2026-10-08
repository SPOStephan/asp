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

export default async function handler(request: Request) {
  const raw = new URL(request.url).searchParams.get('url') ?? '';
  if (!allowedMediaUrl(raw, cdnHost())) return new Response('Nur Bilder der eigenen Bunny-Pull-Zone.', { status: 400 });
  const upstream = await fetch(raw);
  const type = upstream.headers.get('content-type') ?? '';
  if (!upstream.ok || !type.startsWith('image/')) return new Response(`Bild nicht lesbar (${upstream.status}).`, { status: 502 });
  const length = Number(upstream.headers.get('content-length') || 0);
  if (length > MAX_BYTES) return new Response('Bild zu groß.', { status: 413 });
  return new Response(upstream.body, { headers: { 'Content-Type': type, 'Cache-Control': 'private, max-age=300' } });
}

export const config = { runtime: 'edge' };
