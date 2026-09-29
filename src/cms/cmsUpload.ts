import { supabase } from '../lib/supabase';
import { explainUploadFailure } from './cmsUploadMessage';

export { explainUploadFailure } from './cmsUploadMessage';

export async function readUploadResponse(response: Response): Promise<string> {
  const body = await response.text();
  let json: { error?: string; bunny_url?: string } | null = null;
  try {
    json = JSON.parse(body) as { error?: string; bunny_url?: string };
  } catch {
    json = null;
  }
  if (!response.ok || !json?.bunny_url) {
    throw new Error(explainUploadFailure(response.status, body));
  }
  return json.bunny_url;
}

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
  return readUploadResponse(response);
}
