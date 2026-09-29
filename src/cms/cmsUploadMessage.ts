export function explainUploadFailure(status: number, body: string): string {
  const trimmed = body.trim();
  try {
    const json = JSON.parse(trimmed) as { error?: string };
    if (json.error) return json.error;
  } catch {
    /* HTML or empty body from a missing /api route */
  }
  if (status === 404 || /<!doctype html|<html/i.test(trimmed)) {
    return 'Die Upload-API ist auf dieser Domain nicht erreichbar. Die Hotel-Domain muss am Vercel-Projekt asp hängen. Bei Bunny muss keine neue Subdomain eingetragen werden.';
  }
  if (!trimmed) return `Upload fehlgeschlagen (${status}).`;
  return trimmed.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180);
}
