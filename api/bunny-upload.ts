import { createClient } from '@supabase/supabase-js';
import {
  BUNNY_CDN_KEYS,
  BUNNY_KEY_KEYS,
  BUNNY_STORAGE_HOST_KEYS,
  BUNNY_ZONE_KEYS,
  SUPABASE_ANON_KEYS,
  SUPABASE_URL_KEYS,
  firstPresent,
  readEnv,
} from './env';

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

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

function normalizeCdn(value: string) {
  const trimmed = value.trim().replace(/\/$/, '');
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export async function handleBunnyUpload(request: Request) {
  if (request.method !== 'POST') return json(405, { error: 'Nur POST.' });

  const zone = readEnv(...BUNNY_ZONE_KEYS);
  const accessKey = readEnv(...BUNNY_KEY_KEYS);
  const cdn = normalizeCdn(readEnv(...BUNNY_CDN_KEYS));
  const storageHost = readEnv(...BUNNY_STORAGE_HOST_KEYS) || 'storage.bunnycdn.com';
  const supabaseUrl = readEnv(...SUPABASE_URL_KEYS);
  const supabaseAnon = readEnv(...SUPABASE_ANON_KEYS);

  if (!zone || !accessKey || !cdn) {
    return json(503, {
      error: 'Bunny-Zugang gefunden, aber nicht unter den erwarteten Namen — oder die Werte erreichen die Funktion nicht.',
      missing: {
        zone: !zone,
        apiKey: !accessKey,
        cdn: !cdn,
      },
      used: {
        zone: firstPresent(...BUNNY_ZONE_KEYS),
        apiKey: firstPresent(...BUNNY_KEY_KEYS),
        cdn: firstPresent(...BUNNY_CDN_KEYS),
      },
    });
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
  const bunnyPath = `${folder}/${Date.now()}-${safeName(file.name)}`;
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

export default async function handler(request: Request) {
  return handleBunnyUpload(request);
}
