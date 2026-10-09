import { listModels, type AiConfig } from './provider';
import type { AiDefaults } from './knowledgeServer';

// Models that work without anyone choosing: per task the first one the provider offers.
// AI_CHAT_MODEL / AI_EXTRACT_MODEL / AI_HELPER_MODEL on the server and the choice in the
// admin area (organisation, hotel) still win over these.
const CANDIDATES: Record<keyof AiDefaults, string[]> = {
  // Guest answers: reliable, multilingual, fast and inexpensive.
  chat: ['google/gemini-2.5-flash', 'openai/gpt-4.1-mini', 'openai/gpt-4o-mini', 'anthropic/claude-haiku-4.5'],
  // Reading scans and PDFs: needs to see images.
  extract: ['google/gemini-2.5-flash', 'openai/gpt-4.1-mini', 'openai/gpt-4o-mini'],
  // Small helper jobs (search words, e-mail Q&A, anonymising): the cheapest good one.
  helper: ['google/gemini-2.5-flash-lite', 'google/gemini-2.5-flash', 'openai/gpt-4.1-nano', 'openai/gpt-4o-mini'],
};

const LIST_TTL = 6 * 60 * 60 * 1000;
let cached: { baseUrl: string; ids: string[]; at: number } | null = null;

async function offeredModels(config: AiConfig) {
  if (cached && cached.baseUrl === config.baseUrl && Date.now() - cached.at < LIST_TTL) return cached.ids;
  try {
    const ids = (await listModels(config)).map((model) => model.id);
    cached = { baseUrl: config.baseUrl, ids, at: Date.now() };
    return ids;
  } catch {
    return [];
  }
}

// Also matches providers that name models without the vendor ("gpt-4o-mini").
export function firstOffered(candidates: string[], offered: string[]) {
  if (!offered.length) return candidates[0];
  for (const candidate of candidates) {
    const bare = candidate.split('/').pop() ?? candidate;
    const hit = offered.find((id) => id === candidate || id === bare || id.endsWith(`/${bare}`));
    if (hit) return hit;
  }
  return candidates[0];
}

export async function platformDefaults(config: AiConfig | null, env: (name: string) => string): Promise<AiDefaults> {
  const set = { chat: env('AI_CHAT_MODEL'), extract: env('AI_EXTRACT_MODEL'), helper: env('AI_HELPER_MODEL') };
  if (!config || (set.chat && set.extract && set.helper)) return set;
  const offered = await offeredModels(config);
  return {
    chat: set.chat || firstOffered(CANDIDATES.chat, offered),
    extract: set.extract || firstOffered(CANDIDATES.extract, offered),
    helper: set.helper || firstOffered(CANDIDATES.helper, offered),
  };
}
