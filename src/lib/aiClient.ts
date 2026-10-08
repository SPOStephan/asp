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
  if (!response.body) throw new Error(`KI-Schnittstelle antwortet ${response.status}.`);
  if (!response.ok && !(response.headers.get('content-type') ?? '').includes('ndjson')) {
    const text = await response.text();
    let message = text.slice(0, 200);
    try {
      message = (JSON.parse(text) as { error?: string }).error ?? message;
    } catch {
      // keep text
    }
    throw new Error(message || `KI-Schnittstelle antwortet ${response.status}.`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result: { ok: true; data: T } | { ok: false; error: string } | null = null;
  const handle = (line: string) => {
    if (!line.trim()) return;
    const event = JSON.parse(line) as { type: string; text?: string; data?: T; error?: string };
    if (event.type === 'delta' && event.text) onDelta?.(event.text);
    if (event.type === 'result') result = { ok: true, data: event.data as T };
    if (event.type === 'error') result = { ok: false, error: event.error ?? 'Fehler' };
  };
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    lines.forEach(handle);
  }
  handle(buffer);
  const final = result as { ok: true; data: T } | { ok: false; error: string } | null;
  if (!final) throw new Error('Die KI-Schnittstelle hat abgebrochen.');
  if (!final.ok) throw new Error(final.error);
  return final.data;
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
