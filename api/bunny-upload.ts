import { createClient } from '@supabase/supabase-js';

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

function env(name: string) {
  return (process.env[name] || '').trim();
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function safeName(name: string) {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return base.slice(0, 80) || 'image';
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json(405, { error: 'Nur POST.' });

  const zone = env('BUNNY_STORAGE_ZONE');
  const accessKey = env('BUNNY_STORAGE_API_KEY');
  const cdn = env('BUNNY_CDN_URL').replace(/\/$/, '');
  const storageHost = env('BUNNY_STORAGE_HOST') || 'storage.bunnycdn.com';
  const supabaseUrl = env('VITE_SUPABASE_URL');
  const supabaseAnon = env('VITE_SUPABASE_ANON_KEY');

  if (!zone || !accessKey || !cdn) {
    return json(503, { error: 'Bunny ist nicht konfiguriert.' });
  }
  if (!supabaseUrl || !supabaseAnon) {
    return json(503, { error: 'Supabase-Zugang fehlt auf dem Server.' });
  }

  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!token) return json(401, { error: 'Nicht angemeldet.' });

  const supabase = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
  if (adminError) return json(500, { error: adminError.message });
  if (isAdmin !== true) return json(403, { error: 'Nur Admins dürfen hochladen.' });

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return json(400, { error: 'Keine Datei.' });
  if (file.size > MAX_BYTES) return json(413, { error: 'Datei größer als 12 MB.' });
  if (file.type && !ALLOWED.has(file.type)) return json(415, { error: 'Nur Bilddateien.' });

  const hotelId = String(form.get('hotelId') ?? '').trim() || null;
  const alt = String(form.get('alt') ?? '').trim() || null;
  const folder = hotelId ? `hotels/${hotelId}` : 'shared';
  const fileName = file.type === 'image/webp'
    ? safeName(file.name.replace(/\.[a-z0-9]+$/i, '.webp'))
    : safeName(file.name);
  const bunnyPath = `${folder}/${Date.now()}-${fileName}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const put = await fetch(`https://${storageHost}/${zone}/${bunnyPath}`, {
    method: 'PUT',
    headers: {
      AccessKey: accessKey,
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: bytes,
  });
  if (!put.ok) {
    const detail = await put.text();
    return json(502, { error: `Bunny-Upload fehlgeschlagen (${put.status}). ${detail.slice(0, 180)}` });
  }

  const bunnyUrl = `${cdn}/${bunnyPath}`;
  const { data, error } = await supabase
    .from('media')
    .insert({
      hotel_id: hotelId,
      bunny_path: bunnyPath,
      bunny_url: bunnyUrl,
      alt_text: alt,
    })
    .select('id, bunny_url, bunny_path, alt_text')
    .maybeSingle();

  if (error) return json(500, { error: error.message });
  return json(200, data ?? { bunny_url: bunnyUrl, bunny_path: bunnyPath, alt_text: alt });
}

export const config = { runtime: 'edge' };
