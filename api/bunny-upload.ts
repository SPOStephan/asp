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

// A pull zone that is not linked to this storage zone answers 404, so the
// upload looks fine but the image never shows. Check before handing the URL out.
async function cdnServes(url: string): Promise<{ ok: boolean; status: string }> {
  let status = 'keine Antwort';
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { method: 'HEAD', cache: 'no-store' });
      if (response.ok) return { ok: true, status: String(response.status) };
      status = String(response.status);
    } catch (err) {
      status = err instanceof Error ? err.message : status;
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
  }
  return { ok: false, status };
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json(405, { error: 'Nur POST.' });

  const zone = env('BUNNY_STORAGE_ZONE');
  const accessKey = env('BUNNY_STORAGE_API_KEY');
  // Without a scheme the browser reads the CDN host as a path on this site.
  const cdn = env('BUNNY_CDN_URL').replace(/\/$/, '').replace(/^(?!https?:\/\/)(?=.)/i, 'https://');
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
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return json(400, { error: 'Keine Datei.' });
  if (file.size > MAX_BYTES) return json(413, { error: 'Datei größer als 12 MB.' });
  if (file.type && !ALLOWED.has(file.type)) return json(415, { error: 'Nur Bilddateien.' });

  const hotelId = String(form.get('hotelId') ?? '').trim() || null;
  // Hotel media: whoever may edit that hotel. Shared media (icons): the platform team.
  const { data: allowed, error: rightsError } = hotelId
    ? await supabase.rpc('can_edit_hotel', { hotel: hotelId })
    : await supabase.rpc('is_platform_admin');
  if (rightsError) return json(500, { error: rightsError.message });
  if (allowed !== true) return json(403, { error: 'Keine Berechtigung für dieses Hotel.' });
  const alt = String(form.get('alt') ?? '').trim() || null;
  // Readable addresses for search engines: hotels/<hotel>/<what-it-shows>-<4 chars>.webp
  // (the short suffix keeps two pictures with the same name apart).
  const slug = hotelId ? String((await supabase.from('hotels').select('slug').eq('id', hotelId).maybeSingle()).data?.slug ?? '') : '';
  const folder = hotelId ? `hotels/${safeName(slug) || hotelId}` : 'shared';
  const fileName = file.type === 'image/webp'
    ? safeName(file.name.replace(/\.[a-z0-9]+$/i, '.webp'))
    : safeName(file.name);
  const dot = fileName.lastIndexOf('.');
  const stem = (dot > 0 ? fileName.slice(0, dot) : fileName).toLowerCase();
  const ext = dot > 0 ? fileName.slice(dot).toLowerCase() : '';
  const bunnyPath = `${folder}/${stem}-${crypto.randomUUID().slice(0, 4)}${ext}`;
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
  const served = await cdnServes(bunnyUrl);
  if (!served.ok) {
    return json(502, {
      error:
        `Bunny hat die Datei gespeichert, aber ${bunnyUrl} liefert sie nicht aus (${served.status}). ` +
        'BUNNY_CDN_URL muss die Pull-Zone sein, die an die Storage-Zone ' + zone + ' hängt (z. B. https://name.b-cdn.net).',
      bunny_path: bunnyPath,
    });
  }
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
