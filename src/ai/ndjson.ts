// Answers of /api/ai and /api/chat: one JSON object per line
// ({"type":"start"|"ping"|"delta"|"result"|"error"}). The first byte goes out at once and
// a ping every few seconds, so long model calls never hit a time limit, and answers
// appear while they are written.

export type NdjsonSend = (event: Record<string, unknown>) => void;

export function ndjsonResponse(work: (send: NdjsonSend) => Promise<unknown>, status = 200) {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send: NdjsonSend = (event) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      const ping = setInterval(() => send({ type: 'ping' }), 5000);
      send({ type: 'start' });
      try {
        send({ type: 'result', data: await work(send) });
      } catch (err) {
        send({ type: 'error', error: err instanceof Error ? err.message : String(err) });
      } finally {
        clearInterval(ping);
        controller.close();
      }
    },
  });
  return new Response(body, { status, headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store' } });
}

// Reads such an answer in the browser; resolves with the result or throws the error.
export async function readNdjson<T>(response: Response, onDelta?: (text: string) => void): Promise<T> {
  if (!response.body) throw new Error(`Die Schnittstelle antwortet ${response.status}.`);
  if (!(response.headers.get('content-type') ?? '').includes('ndjson')) {
    const text = await response.text();
    let message = text.slice(0, 200);
    try {
      message = (JSON.parse(text) as { error?: string }).error ?? message;
    } catch {
      // not JSON: keep the text
    }
    throw new Error(message || `Die Schnittstelle antwortet ${response.status}.`);
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
  if (!final) throw new Error('Die Verbindung wurde unterbrochen.');
  if (!final.ok) throw new Error(final.error);
  return final.data;
}
