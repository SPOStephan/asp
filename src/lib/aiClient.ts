import { readNdjson } from '../ai/ndjson';
import { supabase } from './supabase';

// Calls /api/ai and reads its line-by-line answer (see api/ai.ts).
export async function callAi<T>(action: string, payload: Record<string, unknown> = {}, onDelta?: (text: string) => void): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Nicht angemeldet.');
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ action, ...payload }),
  });
  return readNdjson<T>(response, onDelta);
}

// After a save in the CMS the AI knowledge of the website follows within a short while.
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function scheduleWebsiteSync(hotelId: string, delay = 15_000) {
  clearTimeout(timers.get(hotelId));
  timers.set(
    hotelId,
    setTimeout(() => {
      timers.delete(hotelId);
      callAi('sync-website', { hotelId }).catch(() => {
        // The knowledge is optional for the site; the admin area shows the last sync.
      });
    }, delay),
  );
}
