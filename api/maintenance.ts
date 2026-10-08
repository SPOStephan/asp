import { createClient } from '@supabase/supabase-js';
import { anonymizeAfterDays } from '../src/ai/anonymize';
import { anonymizeChat, type AiDefaults } from '../src/ai/knowledgeServer';
import { ndjsonResponse } from '../src/ai/ndjson';
import { aiConfig } from '../src/ai/provider';

// Nightly job (vercel.json "crons"): conversations stay stored for good, personal data in
// them is removed after AI_CHAT_ANONYMIZE_DAYS (default 30). Vercel sends CRON_SECRET as
// bearer token; without that secret the job does not run, so nobody else can start it.

const BATCH = 80;

function env(name: string) {
  return ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name] || '').trim();
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export default async function handler(request: Request) {
  const secret = env('CRON_SECRET');
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return json(401, { error: 'Nicht erlaubt.' });
  const supabaseUrl = env('VITE_SUPABASE_URL');
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return json(503, { error: 'Supabase-Zugang fehlt auf dem Server.' });
  const client = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const defaults: AiDefaults = { chat: env('AI_CHAT_MODEL'), extract: env('AI_EXTRACT_MODEL'), helper: env('AI_HELPER_MODEL') };
  const days = anonymizeAfterDays(env('AI_CHAT_ANONYMIZE_DAYS'));

  return ndjsonResponse(async () => {
    const before = new Date(Date.now() - days * 86400_000).toISOString();
    const { data, error } = await client
      .from('chat_messages')
      .select('id')
      .eq('channel', 'website')
      .is('anonymized_at', null)
      .lte('created_at', before)
      .order('created_at')
      .limit(BATCH);
    if (error) throw new Error(error.message);
    const result = await anonymizeChat(client, aiConfig(env), defaults, (data ?? []).map((row) => row.id as string));
    return { days, ...result };
  });
}

export const config = { runtime: 'edge' };
