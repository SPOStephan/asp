import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { answerQuestion, type AiDefaults } from '../src/ai/knowledgeServer';
import { ndjsonResponse } from '../src/ai/ndjson';
import { aiConfig } from '../src/ai/provider';
import { REFERENCE_HOTEL_SLUG } from '../src/config/product';
import { CONCIERGE_SECTION, conciergeConfig, guestText } from '../src/lib/concierge';
import type { ChatTurn } from '../src/lib/knowledge';

// The website chat for guests. No login: the hotel follows from the domain the guest is
// on, never from the request, so a visitor can only ever talk to that hotel's knowledge.
// The server reads with the service key (SUPABASE_SERVICE_ROLE_KEY); the search function
// itself only returns knowledge of that hotel's organisation.
//
// Limits against abuse and runaway costs (environment, optional):
//   AI_CHAT_LIMIT_VISITOR_HOUR  questions per visitor and hour (default 30)
//   AI_CHAT_LIMIT_HOTEL_DAY     questions per hotel and day (default 1500)

const MAX_QUESTION = 1000;
const MAX_TURNS = 40;

function env(name: string) {
  return ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name] || '').trim();
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

function requestHost(request: Request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || new URL(request.url).host;
  return host.split(',')[0].trim().toLowerCase().replace(/:\d+$/, '');
}

function limit(name: string, fallback: number) {
  const value = Number(env(name));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

// The IP itself is never stored: only a hash that changes every day.
async function visitorHash(request: Request, pepper: string) {
  const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown').split(',')[0].trim();
  const day = new Date().toISOString().slice(0, 10);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${ip}|${day}|${pepper}`));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

async function hotelForHost(client: SupabaseClient, host: string) {
  const fields = 'id, name, organization_id';
  const byDomain = await client.from('hotels').select(fields).contains('domains', [host]).eq('is_active', true).limit(1);
  if (byDomain.data?.[0]) return byDomain.data[0] as { id: string; name: string; organization_id: string | null };
  if (!REFERENCE_HOTEL_SLUG) return null;
  const reference = await client.from('hotels').select(fields).eq('slug', REFERENCE_HOTEL_SLUG).eq('is_active', true).maybeSingle();
  return reference.data as { id: string; name: string; organization_id: string | null } | null;
}

async function count(query: PromiseLike<{ count: number | null; error: { message: string } | null }>) {
  const result = await query;
  if (result.error) throw new Error(result.error.message);
  return result.count ?? 0;
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json(405, { error: 'Nur POST.' });
  const supabaseUrl = env('VITE_SUPABASE_URL');
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
  const config = aiConfig(env);
  if (!supabaseUrl || !serviceKey || !config) return json(503, { error: 'Der Chat ist auf dem Server noch nicht eingerichtet.' });

  const client = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const host = requestHost(request);
  const hotel = await hotelForHost(client, host);
  if (!hotel?.organization_id) return json(404, { error: 'Für diese Adresse gibt es keinen Chat.' });
  const section = await client.from('hotel_sections').select('data').eq('hotel_id', hotel.id).eq('section_key', CONCIERGE_SECTION).maybeSingle();
  if (!conciergeConfig(section.data?.data as Record<string, unknown> | undefined, hotel.name).enabled) {
    return json(403, { error: 'Der Chat ist für dieses Hotel ausgeschaltet.' });
  }

  const input = (await request.json().catch(() => ({}))) as { question?: unknown; history?: unknown; conversationId?: unknown };
  const question = String(input.question ?? '').trim();
  if (!question) return json(400, { error: 'Bitte eine Frage eingeben.' });
  if (question.length > MAX_QUESTION) return json(400, { error: `Bitte höchstens ${MAX_QUESTION} Zeichen.` });
  const history: ChatTurn[] = (Array.isArray(input.history) ? (input.history as Array<Partial<ChatTurn> | null>) : [])
    .filter((turn): turn is ChatTurn => (turn?.role === 'user' || turn?.role === 'assistant') && typeof turn?.content === 'string')
    .slice(-12)
    .map((turn) => ({ role: turn.role, content: turn.content.slice(0, 2000) }));
  const conversationId = /^[0-9a-f-]{36}$/i.test(String(input.conversationId ?? '')) ? String(input.conversationId) : crypto.randomUUID();

  const clientHash = await visitorHash(request, serviceKey);
  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const today = new Date(new Date().toISOString().slice(0, 10)).toISOString();
  const [byVisitor, byHotel, inConversation] = await Promise.all([
    count(client.from('chat_messages').select('id', { count: 'exact', head: true }).eq('client_hash', clientHash).gte('created_at', hourAgo)),
    count(client.from('chat_messages').select('id', { count: 'exact', head: true }).eq('hotel_id', hotel.id).eq('channel', 'website').gte('created_at', today)),
    count(client.from('chat_messages').select('id', { count: 'exact', head: true }).eq('conversation_id', conversationId)),
  ]);
  if (byVisitor >= limit('AI_CHAT_LIMIT_VISITOR_HOUR', 30) || inConversation >= MAX_TURNS) {
    return json(429, { error: 'Sie haben sehr viele Fragen gestellt. Bitte versuchen Sie es später noch einmal oder schreiben Sie uns direkt.' });
  }
  if (byHotel >= limit('AI_CHAT_LIMIT_HOTEL_DAY', 1500)) {
    return json(429, { error: 'Der Chat ist heute ausgelastet. Bitte schreiben Sie uns direkt oder rufen Sie an.' });
  }

  const defaults: AiDefaults = { chat: env('AI_CHAT_MODEL'), extract: env('AI_EXTRACT_MODEL'), helper: env('AI_HELPER_MODEL') };
  return ndjsonResponse(async (send) => {
    const answer = await answerQuestion(client, config, {
      hotelId: hotel.id,
      question,
      history,
      conversationId,
      channel: 'website',
      host,
      defaults,
      clientHash,
      onDelta: (text) => send({ type: 'delta', text }),
    });
    // Guests see the pages the answer is based on, not the internal sources.
    const seen = new Set<string>();
    const links = answer.sources
      .filter((source) => source.cited && source.url && /^https?:\/\//.test(source.url))
      .filter((source) => !seen.has(source.url!) && Boolean(seen.add(source.url!)))
      .slice(0, 3)
      .map((source) => ({ title: source.heading || source.title, url: source.url! }));
    return { id: answer.id, conversationId, answer: guestText(answer.answer), gap: answer.gap, links };
  });
}

export const config = { runtime: 'edge' };
