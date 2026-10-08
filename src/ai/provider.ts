// The only place that talks to a language model. It speaks the OpenAI-compatible chat API,
// which OpenRouter, Mistral, Azure, many EU hosts and self-hosted models offer, so the
// provider is a setting (AI_BASE_URL, AI_API_KEY) and never part of the code.

export type AiContentPart = { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } };
export type AiMessage = { role: 'system' | 'user' | 'assistant'; content: string | AiContentPart[] };
export type AiUsage = { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number; cost?: number };
export type AiConfig = { baseUrl: string; apiKey: string };
export type AiRequest = { model: string; messages: AiMessage[]; maxTokens?: number; temperature?: number };
export type AiResult = { text: string; usage: AiUsage | null; model: string };
export type AiModel = { id: string; name: string; context?: number; inputPrice?: number; outputPrice?: number; vision?: boolean };

export const DEFAULT_AI_BASE_URL = 'https://openrouter.ai/api/v1';

export function aiConfig(read: (name: string) => string): AiConfig | null {
  const apiKey = read('AI_API_KEY');
  if (!apiKey) return null;
  return { apiKey, baseUrl: (read('AI_BASE_URL') || DEFAULT_AI_BASE_URL).replace(/\/+$/, '') };
}

function body(config: AiConfig, request: AiRequest, stream: boolean) {
  const payload: Record<string, unknown> = {
    model: request.model,
    messages: request.messages,
    max_tokens: request.maxTokens ?? 1200,
    temperature: request.temperature ?? 0.2,
    stream,
  };
  if (stream) payload.stream_options = { include_usage: true };
  // OpenRouter reports the price of each call when asked; other providers do not know the field.
  if (config.baseUrl.includes('openrouter.ai')) payload.usage = { include: true };
  return JSON.stringify(payload);
}

function headers(config: AiConfig) {
  return { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' };
}

async function failure(response: Response) {
  const text = await response.text().catch(() => '');
  let message = text.slice(0, 300);
  try {
    const parsed = JSON.parse(text) as { error?: { message?: string } | string; message?: string };
    message = (typeof parsed.error === 'string' ? parsed.error : parsed.error?.message) || parsed.message || message;
  } catch {
    // not JSON: keep the text
  }
  return new Error(`KI-Anbieter antwortet ${response.status}: ${message || response.statusText}`);
}

export async function complete(config: AiConfig, request: AiRequest): Promise<AiResult> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: headers(config),
    body: body(config, request, false),
  });
  if (!response.ok) throw await failure(response);
  const data = (await response.json()) as {
    model?: string;
    usage?: AiUsage;
    choices?: Array<{ message?: { content?: string | null } }>;
    error?: { message?: string };
  };
  if (data.error) throw new Error(`KI-Anbieter: ${data.error.message ?? 'Fehler'}`);
  return { text: data.choices?.[0]?.message?.content ?? '', usage: data.usage ?? null, model: data.model || request.model };
}

// Server-sent events: "data: {...}" lines, ":" comments as keep-alive, "data: [DONE]" at the end.
export async function stream(config: AiConfig, request: AiRequest, onDelta: (text: string) => void): Promise<AiResult> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: headers(config),
    body: body(config, request, true),
  });
  if (!response.ok || !response.body) throw await failure(response);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  let usage: AiUsage | null = null;
  let model = request.model;
  const handle = (line: string) => {
    if (!line.startsWith('data:')) return;
    const value = line.slice(5).trim();
    if (!value || value === '[DONE]') return;
    const event = JSON.parse(value) as {
      model?: string;
      usage?: AiUsage | null;
      error?: { message?: string };
      choices?: Array<{ delta?: { content?: string | null } }>;
    };
    if (event.error) throw new Error(`KI-Anbieter: ${event.error.message ?? 'Fehler'}`);
    if (event.model) model = event.model;
    if (event.usage) usage = event.usage;
    const delta = event.choices?.[0]?.delta?.content;
    if (delta) {
      text += delta;
      onDelta(delta);
    }
  };
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) handle(line.trim());
  }
  if (buffer.trim()) handle(buffer.trim());
  return { text, usage, model };
}

// The model list of the provider (OpenAI-compatible GET /models), prices per million tokens.
export async function listModels(config: AiConfig): Promise<AiModel[]> {
  const response = await fetch(`${config.baseUrl}/models`, { headers: headers(config) });
  if (!response.ok) throw await failure(response);
  const data = (await response.json()) as {
    data?: Array<{
      id: string;
      name?: string;
      context_length?: number;
      pricing?: { prompt?: string; completion?: string };
      architecture?: { input_modalities?: string[] };
    }>;
  };
  const perMillion = (value?: string) => (value && Number.isFinite(Number(value)) ? Number(value) * 1_000_000 : undefined);
  return (data.data ?? [])
    .map((item) => ({
      id: item.id,
      name: item.name || item.id,
      context: item.context_length,
      inputPrice: perMillion(item.pricing?.prompt),
      outputPrice: perMillion(item.pricing?.completion),
      vision: item.architecture?.input_modalities?.includes('image'),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}
