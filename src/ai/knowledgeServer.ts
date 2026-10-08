// Server side of the AI knowledge: loads what a hotel knows, asks the model, stores the
// result. Runs with the signed-in person's database rights, so it only ever sees the
// knowledge of that person's organisation.
import type { SupabaseClient } from '@supabase/supabase-js';
import { chunkMarkdown, readAnswer, type ChatTurn, type NewChunk, type SourceRef } from '../lib/knowledge';
import { SiteModel } from '../site/pageModel';
import { canonicalOrigin, pageMarkdown } from '../site/renderSite';
import { loadSiteContentById } from '../site/siteData';
import {
  buildSystemPrompt,
  cleanSearchTerms,
  conciergeMessages,
  judgeMessages,
  readJudgement,
  searchTermsMessages,
  type CheckInput,
  type HotelBrief,
  type KnowledgeHit,
} from './concierge';
import { anonymize, type Keep } from './anonymize';
import { complete, stream, type AiConfig, type AiUsage } from './provider';

export type ModelRole = 'chat' | 'extract' | 'helper';

export type AiDefaults = { chat?: string; extract?: string; helper?: string };

type SettingsRow = {
  hotel_id: string | null;
  chat_model: string | null;
  extract_model: string | null;
  helper_model: string | null;
  cross_selling: boolean | null;
  tone: string | null;
};

export type ResolvedSettings = { models: Record<ModelRole, string>; crossSelling: boolean; tone: string };

type HotelRow = {
  id: string;
  name: string;
  domains: string[] | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  address_detail: string | null;
  booking_url: string | null;
  seo_description: string | null;
  organization_id: string | null;
};

const HOTEL_FIELDS = 'id, name, domains, phone, email, address, address_detail, booking_url, seo_description, organization_id';

function must<T>(result: { data: T; error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function loadHotel(client: SupabaseClient, hotelId: string) {
  const hotel = must(await client.from('hotels').select(HOTEL_FIELDS).eq('id', hotelId).maybeSingle()) as HotelRow | null;
  if (!hotel) throw new Error('Hotel nicht gefunden.');
  if (!hotel.organization_id) throw new Error('Das Hotel gehört zu keiner Organisation.');
  return hotel as HotelRow & { organization_id: string };
}

function brief(hotel: HotelRow, host: string): HotelBrief {
  return {
    id: hotel.id,
    name: hotel.name,
    url: canonicalOrigin(hotel.domains, host),
    phone: hotel.phone,
    email: hotel.email,
    address: [hotel.address, hotel.address_detail].filter(Boolean).join(', ') || null,
    bookingUrl: hotel.booking_url,
    description: hotel.seo_description,
  };
}

// Hotel settings win over organisation settings, which win over the platform default.
export async function resolveSettings(client: SupabaseClient, organizationId: string, hotelId: string | null, defaults: AiDefaults) {
  const rows = must(
    await client
      .from('ai_settings')
      .select('hotel_id, chat_model, extract_model, helper_model, cross_selling, tone')
      .eq('organization_id', organizationId),
  ) as SettingsRow[];
  const org = rows.find((row) => row.hotel_id === null);
  const hotel = hotelId ? rows.find((row) => row.hotel_id === hotelId) : undefined;
  const pick = (key: 'chat_model' | 'extract_model' | 'helper_model') => hotel?.[key]?.trim() || org?.[key]?.trim() || '';
  const chat = pick('chat_model') || defaults.chat || '';
  const resolved: ResolvedSettings = {
    models: {
      chat,
      extract: pick('extract_model') || defaults.extract || chat,
      helper: pick('helper_model') || defaults.helper || chat,
    },
    crossSelling: hotel?.cross_selling ?? org?.cross_selling ?? true,
    tone: [org?.tone, hotel?.tone].filter((value) => value?.trim()).join('\n'),
  };
  return resolved;
}

export function requireModel(settings: ResolvedSettings, role: ModelRole) {
  const model = settings.models[role];
  if (!model) throw new Error('Es ist noch kein KI-Modell gewählt. Bitte unter „Einstellungen“ ein Modell auswählen.');
  return model;
}

// --- Website ----------------------------------------------------------------

export function websiteChunks(site: SiteModel): NewChunk[] {
  const chunks: NewChunk[] = [];
  for (const link of site.allPaths()) {
    const model = site.page(link.href);
    if (model.status !== 200) continue;
    // The address is stored with each chunk; the "Quelle:" line would only add noise.
    const markdown = pageMarkdown(model, site).replace(/^Quelle: .*$/m, '');
    chunks.push(...chunkMarkdown(markdown, site.url(model.path)));
  }
  return chunks;
}

// The own website is read from the CMS content directly: no crawling, always current.
export async function syncWebsite(client: SupabaseClient, hotelId: string, host: string) {
  const content = await loadSiteContentById(client, hotelId);
  const origin = canonicalOrigin(content.hotel.domains, host);
  const site = new SiteModel(content, origin);
  const chunks = websiteChunks(site);
  const meta = { synced_at: new Date().toISOString(), pages: new Set(chunks.map((chunk) => chunk.url)).size };
  const find = async () =>
    (must(await client.from('knowledge_sources').select('id').eq('hotel_id', hotelId).eq('kind', 'website').limit(1)) as Array<{ id: string }>)[0]?.id;
  let sourceId = await find();
  if (!sourceId) {
    const created = await client
      .from('knowledge_sources')
      .insert({ hotel_id: hotelId, organization_id: content.hotel.organization_id, kind: 'website', title: `Website ${origin.replace(/^https:\/\//, '')}`, url: origin, meta })
      .select('id')
      .single();
    // Another sync created it in the meantime (unique index): use that one.
    sourceId = created.error ? await find() : (created.data as { id: string }).id;
    if (!sourceId) throw new Error(created.error?.message ?? 'Website-Quelle konnte nicht angelegt werden.');
  } else {
    must(await client.from('knowledge_sources').update({ meta, url: origin, status: 'ready', error: null }).eq('id', sourceId));
  }
  await replaceChunks(client, sourceId, chunks);
  return { sourceId, chunks: chunks.length, pages: meta.pages };
}

export async function replaceChunks(client: SupabaseClient, sourceId: string, chunks: NewChunk[], onlyUrl?: string) {
  let remove = client.from('knowledge_chunks').delete().eq('source_id', sourceId);
  if (onlyUrl) remove = remove.eq('url', onlyUrl);
  must(await remove);
  const start = onlyUrl
    ? ((must(await client.from('knowledge_chunks').select('position').eq('source_id', sourceId).order('position', { ascending: false }).limit(1)) as Array<{ position: number }>)[0]?.position ?? -1) + 1
    : 0;
  const rows = chunks.map((chunk, index) => ({
    source_id: sourceId,
    position: start + index,
    heading: chunk.heading ?? null,
    content: chunk.content,
    url: chunk.url ?? null,
  }));
  for (let index = 0; index < rows.length; index += 200) {
    must(await client.from('knowledge_chunks').insert(rows.slice(index, index + 200)));
  }
}

// --- Answering --------------------------------------------------------------

export type AnswerInput = {
  hotelId: string;
  question: string;
  history: ChatTurn[];
  conversationId: string;
  channel: 'test' | 'check' | 'website';
  // Website visitors: an anonymous, daily changing hash for the limits (no IP is stored).
  clientHash?: string;
  model?: string;
  host: string;
  defaults: AiDefaults;
  onDelta?: (text: string) => void;
};

export type StoredAnswer = {
  id: string | null;
  answer: string;
  gap: boolean;
  sources: SourceRef[];
  model: string;
  usage: AiUsage | null;
  cost: number | null;
  searchTerms: string;
};

async function correctionsFor(client: SupabaseClient, organizationId: string, hotelId: string): Promise<KnowledgeHit[]> {
  const sources = must(
    await client
      .from('knowledge_sources')
      .select('id, title, hotel_id, kind')
      .eq('kind', 'correction')
      .eq('organization_id', organizationId)
      .eq('enabled', true)
      .eq('status', 'ready')
      .or(`hotel_id.eq.${hotelId},hotel_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(40),
  ) as Array<{ id: string; title: string; hotel_id: string | null; kind: 'correction' }>;
  if (!sources.length) return [];
  const chunks = must(
    await client.from('knowledge_chunks').select('id, source_id, heading, content, url').in('source_id', sources.map((source) => source.id)),
  ) as Array<{ id: string; source_id: string; heading: string | null; content: string; url: string | null }>;
  return chunks.map((chunk) => {
    const source = sources.find((item) => item.id === chunk.source_id)!;
    return {
      chunk_id: chunk.id,
      source_id: source.id,
      kind: 'correction',
      title: source.title,
      heading: chunk.heading,
      content: chunk.content,
      url: chunk.url,
      source_hotel: source.hotel_id,
    };
  });
}

async function search(client: SupabaseClient, hotelId: string, terms: string, crossSelling: boolean) {
  if (!terms.trim()) return [] as KnowledgeHit[];
  return (must(
    await client.rpc('search_knowledge', { hotel: hotelId, terms, max_rows: 14, other_hotels: crossSelling }),
  ) ?? []) as KnowledgeHit[];
}

function mergeHits(lists: KnowledgeHit[][], max: number) {
  const best = new Map<string, KnowledgeHit>();
  for (const hit of lists.flat()) {
    const known = best.get(hit.chunk_id);
    if (!known || (hit.rank ?? 0) > (known.rank ?? 0)) best.set(hit.chunk_id, hit);
  }
  return [...best.values()].sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0)).slice(0, max);
}

export async function answerQuestion(client: SupabaseClient, config: AiConfig, input: AnswerInput): Promise<StoredAnswer> {
  const hotel = await loadHotel(client, input.hotelId);
  const settings = await resolveSettings(client, hotel.organization_id, hotel.id, input.defaults);
  const model = input.model?.trim() || requireModel(settings, 'chat');
  const question = input.question.trim().slice(0, 2000);

  let searchTerms = '';
  try {
    const terms = await complete(config, { model: settings.models.helper || model, messages: searchTermsMessages(input.history, question), maxTokens: 80, temperature: 0 });
    searchTerms = cleanSearchTerms(terms.text);
  } catch {
    searchTerms = '';
  }
  const [siblingsRows, rulesRows, corrections, byQuestion, byTerms] = await Promise.all([
    client.from('hotels').select(HOTEL_FIELDS).eq('organization_id', hotel.organization_id).eq('is_active', true).neq('id', hotel.id),
    client
      .from('answer_rules')
      .select('rule, hotel_id')
      .eq('enabled', true)
      .eq('organization_id', hotel.organization_id)
      .or(`hotel_id.eq.${hotel.id},hotel_id.is.null`)
      .order('created_at'),
    correctionsFor(client, hotel.organization_id, hotel.id),
    search(client, hotel.id, question, settings.crossSelling),
    search(client, hotel.id, searchTerms, settings.crossSelling),
  ]);
  const siblings = ((must(siblingsRows) ?? []) as HotelRow[]).map((row) => brief(row, input.host));
  const rules = ((must(rulesRows) ?? []) as Array<{ rule: string }>).map((row) => row.rule);
  const hits = mergeHits([byQuestion, byTerms], 12).filter((hit) => hit.kind !== 'correction');

  const { system, sources } = buildSystemPrompt({
    hotel: brief(hotel, input.host),
    siblings,
    rules,
    tone: settings.tone,
    crossSelling: settings.crossSelling,
    corrections,
    hits,
    today: new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Berlin' }),
  });
  const messages = conciergeMessages(system, input.history, question);
  const request = { model, messages, maxTokens: 900, temperature: 0.2 };
  const result = input.onDelta ? await stream(config, request, input.onDelta) : await complete(config, request);
  const read = readAnswer(result.text, sources);
  const cost = typeof result.usage?.cost === 'number' ? result.usage.cost : null;

  const stored = await client
    .from('chat_messages')
    .insert({
      hotel_id: hotel.id,
      organization_id: hotel.organization_id,
      conversation_id: input.conversationId,
      channel: input.channel,
      question,
      answer: read.answer,
      model: result.model,
      sources: read.sources,
      gap: read.gap,
      usage: result.usage,
      cost,
      client_hash: input.clientHash ?? null,
    })
    .select('id')
    .single();
  return {
    id: stored.error ? null : (stored.data as { id: string }).id,
    answer: read.answer,
    gap: read.gap,
    sources: read.sources,
    model: result.model,
    usage: result.usage,
    cost,
    searchTerms,
  };
}

// --- Check questions --------------------------------------------------------

export async function runCheck(client: SupabaseClient, config: AiConfig, checkId: string, host: string, defaults: AiDefaults, model?: string) {
  const check = must(
    await client.from('check_questions').select('id, hotel_id, organization_id, question, expected, wrong_text').eq('id', checkId).maybeSingle(),
  ) as (CheckInput & { id: string; hotel_id: string; organization_id: string }) | null;
  if (!check) throw new Error('Prüffrage nicht gefunden.');
  const answer = await answerQuestion(client, config, {
    hotelId: check.hotel_id,
    question: check.question,
    history: [],
    conversationId: crypto.randomUUID(),
    channel: 'check',
    model,
    host,
    defaults,
  });
  const settings = await resolveSettings(client, check.organization_id, check.hotel_id, defaults);
  let status: 'pass' | 'fail' | 'error' = 'error';
  let reason = '';
  try {
    const judged = await complete(config, { model: settings.models.helper || answer.model, messages: judgeMessages(check, answer.answer), maxTokens: 200, temperature: 0 });
    const verdict = readJudgement(judged.text);
    status = verdict.pass ? 'pass' : 'fail';
    reason = verdict.reason;
  } catch (err) {
    reason = err instanceof Error ? err.message : String(err);
  }
  must(
    await client
      .from('check_questions')
      .update({ last_status: status, last_answer: answer.answer, last_reason: reason, last_model: answer.model, last_run_at: new Date().toISOString() })
      .eq('id', check.id),
  );
  return { status, reason, answer: answer.answer, model: answer.model, cost: answer.cost };
}

// --- Anonymising stored conversations ----------------------------------------

type StoredMessage = { id: string; hotel_id: string; question: string; answer: string };

// Personal data out, conversation kept. A message is only marked as done when the model
// step worked too; otherwise it is tried again next time.
export async function anonymizeChat(client: SupabaseClient, config: AiConfig | null, defaults: AiDefaults, ids: string[]) {
  if (!ids.length) return { done: 0, failed: 0, errors: [] as string[] };
  const rows = must(
    await client.from('chat_messages').select('id, hotel_id, question, answer').in('id', ids).is('anonymized_at', null),
  ) as StoredMessage[];
  const hotels = new Map<string, Promise<{ name: string; keep: Keep; model: string | null }>>();
  const hotelInfo = (hotelId: string) => {
    if (!hotels.has(hotelId)) {
      hotels.set(
        hotelId,
        (async () => {
          const hotel = await loadHotel(client, hotelId);
          const settings = await resolveSettings(client, hotel.organization_id, hotel.id, defaults);
          return { name: hotel.name, keep: { emails: [hotel.email ?? ''], phones: [hotel.phone ?? ''] }, model: settings.models.helper || null };
        })(),
      );
    }
    return hotels.get(hotelId)!;
  };
  let done = 0;
  const errors: string[] = [];
  const queue = [...rows];
  const worker = async () => {
    for (let row = queue.shift(); row; row = queue.shift()) {
      try {
        const hotel = await hotelInfo(row.hotel_id);
        const result = await anonymize(config, hotel.model, { question: row.question, answer: row.answer, hotelName: hotel.name, keep: hotel.keep });
        if (!result.ai) throw new Error('Kein KI-Modell für die Anonymisierung eingerichtet.');
        must(
          await client
            .from('chat_messages')
            .update({ question: result.question, answer: result.answer, anonymized_at: new Date().toISOString() })
            .eq('id', row.id),
        );
        done += 1;
      } catch (err) {
        errors.push(err instanceof Error ? err.message : String(err));
      }
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  return { done, failed: rows.length - done, errors: [...new Set(errors)].slice(0, 5) };
}
