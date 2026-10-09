import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { altTextMessages, emailMessages, ocrMessages, readAltSuggestion, readQaPairs } from '../src/ai/concierge';
import { crawlableLinks, htmlToText, isPublicHttpUrl, pageChunks } from '../src/ai/htmlText';
import {
  anonymizeChat,
  answerQuestion,
  loadHotel,
  replaceChunks,
  requireModel,
  resolveSettings,
  runCheck,
  syncWebsite,
  type AiDefaults,
} from '../src/ai/knowledgeServer';
import { anonymizeAfterDays } from '../src/ai/anonymize';
import { platformDefaults } from '../src/ai/defaultModels';
import { ndjsonResponse } from '../src/ai/ndjson';
import { aiConfig, complete, listModels, type AiConfig } from '../src/ai/provider';
import type { ChatTurn } from '../src/lib/knowledge';

// Everything the admin area asks the AI for, streamed line by line (src/ai/ndjson.ts).
//
// Environment: AI_API_KEY, AI_BASE_URL (default OpenRouter), and optional platform
// defaults AI_CHAT_MODEL, AI_EXTRACT_MODEL, AI_HELPER_MODEL.

function env(name: string) {
  return ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name] || '').trim();
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function requestHost(request: Request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || new URL(request.url).host;
  return host.split(',')[0].trim().toLowerCase();
}

async function allowed(client: SupabaseClient, fn: string, args: Record<string, unknown>) {
  const { data, error } = await client.rpc(fn, args);
  if (error) throw new Error(error.message);
  if (data !== true) throw new Error('Keine Berechtigung.');
}

const MAX_PAGE_BYTES = 3 * 1024 * 1024;

async function fetchPage(url: string) {
  if (!isPublicHttpUrl(url)) throw new Error('Nur öffentliche http(s)-Adressen.');
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HotelKnowledgeBot/1.0)', Accept: 'text/html,application/xhtml+xml' },
  });
  if (!response.ok) throw new Error(`${url} antwortet ${response.status}.`);
  const type = response.headers.get('content-type') ?? '';
  if (!/html|xml|text\/plain/i.test(type)) throw new Error(`${url} ist keine Webseite (${type || 'unbekannter Typ'}).`);
  const html = (await response.text()).slice(0, MAX_PAGE_BYTES);
  return { html, finalUrl: response.url || url };
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json(405, { error: 'Nur POST.' });
  const supabaseUrl = env('VITE_SUPABASE_URL');
  const supabaseAnon = env('VITE_SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnon) return json(503, { error: 'Supabase-Zugang fehlt auf dem Server.' });
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!token) return json(401, { error: 'Nicht angemeldet.' });

  const client = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const input = (await request.json().catch(() => ({}))) as Record<string, any>;
  const action = String(input.action ?? '');
  const host = requestHost(request);
  const config = aiConfig(env);
  const defaults: AiDefaults = await platformDefaults(config, env);
  const needAi = (): AiConfig => {
    if (!config) throw new Error('Auf dem Server ist noch kein KI-Zugang hinterlegt (AI_API_KEY).');
    return config;
  };

  return ndjsonResponse(async (send) => {
    switch (action) {
      case 'status': {
        await allowed(client, 'is_admin', {});
        return { configured: Boolean(config), baseUrl: config?.baseUrl ?? null, defaults, anonymizeDays: anonymizeAfterDays(env('AI_CHAT_ANONYMIZE_DAYS')) };
      }
      case 'models': {
        await allowed(client, 'is_admin', {});
        return { models: await listModels(needAi()) };
      }
      case 'sync-website': {
        const hotelId = String(input.hotelId ?? '');
        await allowed(client, 'can_edit_hotel', { hotel: hotelId });
        return syncWebsite(client, hotelId, host);
      }
      case 'import-url': {
        // One page per call; the admin area walks through the links it gets back.
        const sourceId = String(input.sourceId ?? '');
        const url = String(input.url ?? '').trim();
        const { data: source, error } = await client.from('knowledge_sources').select('id, organization_id, hotel_id, url').eq('id', sourceId).maybeSingle();
        if (error) throw new Error(error.message);
        if (!source) throw new Error('Quelle nicht gefunden.');
        await allowed(client, 'can_edit_knowledge', { org: source.organization_id, hotel: source.hotel_id });
        const page = await fetchPage(url);
        const text = htmlToText(page.html, page.finalUrl);
        const chunks = pageChunks(text, page.finalUrl);
        await replaceChunks(client, sourceId, chunks, page.finalUrl);
        return { url: page.finalUrl, title: text.title, chunks: chunks.length, links: crawlableLinks(text.links, source.url || url) };
      }
      case 'ocr': {
        const organizationId = String(input.organizationId ?? '');
        const hotelId = input.hotelId ? String(input.hotelId) : null;
        await allowed(client, 'can_edit_knowledge', { org: organizationId, hotel: hotelId });
        const image = String(input.image ?? '');
        if (!/^data:image\/(jpeg|png|webp);base64,/.test(image)) throw new Error('Kein Bild.');
        const settings = await resolveSettings(client, organizationId, hotelId, defaults);
        const result = await complete(needAi(), { model: requireModel(settings, 'extract'), messages: ocrMessages(image), maxTokens: 4000, temperature: 0 });
        return { text: result.text.trim(), model: result.model, usage: result.usage };
      }
      case 'describe-image': {
        // Alt text and file name for a picture the hotel team uploads in the CMS.
        const hotelId = String(input.hotelId ?? '');
        await allowed(client, 'can_edit_hotel', { hotel: hotelId });
        const image = String(input.image ?? '');
        if (!/^data:image\/(jpeg|png|webp);base64,/.test(image)) throw new Error('Kein Bild.');
        const hotel = await loadHotel(client, hotelId);
        const settings = await resolveSettings(client, hotel.organization_id, hotel.id, defaults);
        const result = await complete(needAi(), {
          model: requireModel(settings, 'extract'),
          messages: altTextMessages(image, {
            hotelName: hotel.name,
            address: [hotel.address, hotel.address_detail].filter(Boolean).join(', '),
            about: hotel.seo_description,
            place: String(input.place ?? '').slice(0, 300),
          }),
          maxTokens: 300,
          temperature: 0.2,
        });
        return { ...readAltSuggestion(result.text), model: result.model };
      }
      case 'emails': {
        const organizationId = String(input.organizationId ?? '');
        const hotelId = input.hotelId ? String(input.hotelId) : null;
        await allowed(client, 'can_edit_knowledge', { org: organizationId, hotel: hotelId });
        const hotelName = hotelId
          ? (await loadHotel(client, hotelId)).name
          : String((await client.from('organizations').select('name').eq('id', organizationId).maybeSingle()).data?.name ?? 'das Hotel');
        const settings = await resolveSettings(client, organizationId, hotelId, defaults);
        const result = await complete(needAi(), {
          model: requireModel(settings, 'helper'),
          messages: emailMessages(String(input.text ?? ''), hotelName),
          maxTokens: 4000,
          temperature: 0,
        });
        return { pairs: readQaPairs(result.text), model: result.model, usage: result.usage };
      }
      case 'chat': {
        const hotelId = String(input.hotelId ?? '');
        await allowed(client, 'can_edit_hotel', { hotel: hotelId });
        const history = (Array.isArray(input.history) ? input.history : [])
          .filter((turn: ChatTurn) => (turn?.role === 'user' || turn?.role === 'assistant') && typeof turn.content === 'string')
          .map((turn: ChatTurn) => ({ role: turn.role, content: turn.content.slice(0, 4000) }));
        return answerQuestion(client, needAi(), {
          hotelId,
          question: String(input.question ?? ''),
          history,
          conversationId: String(input.conversationId || crypto.randomUUID()),
          channel: 'test',
          model: input.model ? String(input.model) : undefined,
          host,
          defaults,
          onDelta: (text) => send({ type: 'delta', text }),
        });
      }
      case 'anonymize': {
        // Every message of one conversation, at once instead of after the waiting period.
        const conversationId = String(input.conversationId ?? '');
        const { data: rows, error } = await client.from('chat_messages').select('id, hotel_id').eq('conversation_id', conversationId);
        if (error) throw new Error(error.message);
        const hotelIds = [...new Set((rows ?? []).map((row) => row.hotel_id as string))];
        for (const hotelId of hotelIds) await allowed(client, 'can_edit_hotel', { hotel: hotelId });
        return anonymizeChat(client, config, defaults, (rows ?? []).map((row) => row.id as string));
      }
      case 'run-check': {
        return runCheck(client, needAi(), String(input.checkId ?? ''), host, defaults, input.model ? String(input.model) : undefined);
      }
      default:
        throw new Error(`Unbekannte Aktion: ${action || '(keine)'}`);
    }
  });
}

export const config = { runtime: 'edge' };
