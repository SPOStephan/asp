import { supabase } from '../lib/supabase';

export async function uploadToBunny(file: File, hotelId: string, alt: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Nicht angemeldet.');

  const body = new FormData();
  body.append('file', file);
  body.append('hotelId', hotelId);
  if (alt) body.append('alt', alt);

  const response = await fetch('/api/bunny-upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
    body,
  });
  const json = (await response.json()) as { error?: string; bunny_url?: string };
  if (!response.ok || !json.bunny_url) {
    throw new Error(json.error || 'Upload nach Bunny fehlgeschlagen.');
  }
  return json.bunny_url;
}
