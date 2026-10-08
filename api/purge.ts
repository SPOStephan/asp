import { createClient } from '@supabase/supabase-js';
import { dangerouslyDeleteByTag } from '@vercel/functions';
import { siteCacheTag } from '../src/site/cacheTag';

// Called by the CMS after every save: drops the hotel's pages from Vercel's CDN cache so
// the next visitor gets the new version right away instead of after the cache time.
// Node runtime: the purge API is part of the Vercel function context.

function env(name: string) {
  return (process.env[name] || '').trim();
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const supabaseUrl = env('VITE_SUPABASE_URL');
  const supabaseAnon = env('VITE_SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnon) return json(503, { error: 'Supabase-Zugang fehlt auf dem Server.' });
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!token) return json(401, { error: 'Nicht angemeldet.' });
  const input = (await request.json().catch(() => ({}))) as { hotelId?: unknown };
  const hotelId = String(input.hotelId ?? '');
  if (!hotelId) return json(400, { error: 'Hotel fehlt.' });

  const client = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.rpc('can_edit_hotel', { hotel: hotelId });
  if (error) return json(500, { error: error.message });
  if (data !== true) return json(403, { error: 'Keine Berechtigung.' });

  const context = (globalThis as Record<symbol, { get?: () => { purge?: unknown } } | undefined>)[Symbol.for('@vercel/request-context')]?.get?.();
  await dangerouslyDeleteByTag(siteCacheTag(hotelId));
  return json(200, { purged: Boolean(context?.purge) });
}
