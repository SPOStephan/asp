import { useEffect, useState, type FormEvent } from 'react';
import { callAi } from '../../lib/aiClient';
import { supabase } from '../../lib/supabase';
import { useKnowledge } from './knowledgeScope';

type AiModel = { id: string; name: string; context?: number; inputPrice?: number; outputPrice?: number; vision?: boolean };
type Status = { configured: boolean; baseUrl: string | null; defaults: { chat?: string; extract?: string; helper?: string } };

type SettingsRow = {
  id?: string;
  hotel_id: string | null;
  chat_model: string | null;
  extract_model: string | null;
  helper_model: string | null;
  cross_selling: boolean | null;
  tone: string | null;
};

let modelCache: Promise<{ status: Status; models: AiModel[] }> | null = null;

function loadModels() {
  modelCache ??= (async () => {
    const status = await callAi<Status>('status');
    const models = status.configured ? (await callAi<{ models: AiModel[] }>('models').catch(() => ({ models: [] }))).models : [];
    return { status, models };
  })().catch((err) => {
    modelCache = null;
    throw err;
  });
  return modelCache;
}

// The provider's model list and the effective default of this scope (hotel > group > platform).
export function useModels() {
  const { scope, version } = useKnowledge();
  const [models, setModels] = useState<AiModel[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [rows, setRows] = useState<SettingsRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModels()
      .then((result) => {
        setStatus(result.status);
        setModels(result.models);
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  useEffect(() => {
    void supabase
      .from('ai_settings')
      .select('id, hotel_id, chat_model, extract_model, helper_model, cross_selling, tone')
      .eq('organization_id', scope.orgId)
      .then(({ data }) => setRows((data ?? []) as SettingsRow[]));
  }, [scope.orgId, version]);

  const group = rows.find((row) => row.hotel_id === null);
  const hotel = scope.hotelId ? rows.find((row) => row.hotel_id === scope.hotelId) : undefined;
  const pick = (key: 'chat_model' | 'extract_model' | 'helper_model', platform?: string) => hotel?.[key] || group?.[key] || platform || '';
  const chat = pick('chat_model', status?.defaults.chat);
  return {
    models,
    status,
    error,
    group,
    hotel,
    defaults: { chat, extract: pick('extract_model', status?.defaults.extract) || chat, helper: pick('helper_model', status?.defaults.helper) || chat },
  };
}

const ROLES: Array<{ key: 'chat_model' | 'extract_model' | 'helper_model'; label: string; hint: string }> = [
  { key: 'chat_model', label: 'Gästechat', hint: 'Beantwortet die Fragen. Qualität und Ton zählen hier am meisten.' },
  { key: 'extract_model', label: 'PDFs und Scans lesen', hint: 'Muss Bilder lesen können (Vision).' },
  { key: 'helper_model', label: 'Hilfsaufgaben', hint: 'Suchbegriffe, E-Mails anonymisieren, Prüffragen bewerten. Ein günstiges Modell genügt.' },
];

export function SettingsTab() {
  const { scope, changed } = useKnowledge();
  const { models, status, error: loadError, group, hotel } = useModels();
  const own = scope.hotelId ? hotel : group;
  const inherited = scope.hotelId ? group : undefined;
  const [form, setForm] = useState<SettingsRow>({ hotel_id: scope.hotelId, chat_model: '', extract_model: '', helper_model: '', cross_selling: null, tone: '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      hotel_id: scope.hotelId,
      chat_model: own?.chat_model ?? '',
      extract_model: own?.extract_model ?? '',
      helper_model: own?.helper_model ?? '',
      cross_selling: own?.cross_selling ?? (scope.hotelId ? null : true),
      tone: own?.tone ?? '',
    });
  }, [own, scope.hotelId]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    const values = {
      organization_id: scope.orgId,
      hotel_id: scope.hotelId,
      chat_model: form.chat_model?.trim() || null,
      extract_model: form.extract_model?.trim() || null,
      helper_model: form.helper_model?.trim() || null,
      cross_selling: form.cross_selling,
      tone: form.tone?.trim() || null,
    };
    const result = own?.id
      ? await supabase.from('ai_settings').update(values).eq('id', own.id)
      : await supabase.from('ai_settings').insert(values);
    if (result.error) setError(result.error.message);
    else {
      setSaved(true);
      changed();
    }
  }

  const fallback = (key: 'chat_model' | 'extract_model' | 'helper_model') => {
    const platform = key === 'chat_model' ? status?.defaults.chat : key === 'extract_model' ? status?.defaults.extract : status?.defaults.helper;
    // Empty field: the organisation's choice, else a model picked automatically for the task.
    if (inherited?.[key]) return `wie Organisation: ${inherited[key]}`;
    return platform ? `automatisch: ${platform}` : 'automatisch';
  };

  return (
    <>
      <div className="admin-card kn-provider">
        <strong>KI-Anbieter</strong>
        {loadError ? <p className="admin-error">{loadError}</p> : null}
        {status ? (
          status.configured ? (
            <p className="admin-muted">
              Verbunden mit {status.baseUrl} · {models.length} Modelle verfügbar. Anbieter und Schlüssel werden auf dem Server
              festgelegt (AI_BASE_URL, AI_API_KEY) – jeder OpenAI-kompatible Anbieter funktioniert.
            </p>
          ) : (
            <p className="admin-error">Auf dem Server ist noch kein KI-Zugang hinterlegt. In Vercel AI_API_KEY (und optional AI_BASE_URL) setzen.</p>
          )
        ) : (
          <p className="admin-muted">Prüft Verbindung…</p>
        )}
      </div>
      <form className="admin-form admin-form--wide" onSubmit={(event) => void save(event)}>
        <p className="admin-muted">
          {scope.hotelId
            ? `Leere Felder übernehmen die Einstellung der Gruppe ${scope.orgName}.`
            : 'Gilt für alle Hotels der Gruppe, solange ein Hotel nichts Eigenes festlegt.'}
        </p>
        <datalist id="kn-models">
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
              {model.inputPrice !== undefined ? ` · ${model.inputPrice.toFixed(2)} / ${model.outputPrice?.toFixed(2)} $ je Mio. Tokens` : ''}
              {model.vision ? ' · liest Bilder' : ''}
            </option>
          ))}
        </datalist>
        {ROLES.map((role) => (
          <label key={role.key}>
            {role.label}
            <input
              list="kn-models"
              value={form[role.key] ?? ''}
              placeholder={fallback(role.key)}
              disabled={!scope.canManage}
              onChange={(event) => setForm({ ...form, [role.key]: event.target.value })}
            />
            <span className="admin-muted">{role.hint}</span>
          </label>
        ))}
        <label>
          Empfehlungen anderer Hotels der Gruppe (Cross-Selling)
          <select
            value={form.cross_selling === null ? 'inherit' : form.cross_selling ? 'on' : 'off'}
            disabled={!scope.canManage}
            onChange={(event) => setForm({ ...form, cross_selling: event.target.value === 'inherit' ? null : event.target.value === 'on' })}
          >
            {scope.hotelId ? <option value="inherit">wie die Gruppe ({inherited?.cross_selling === false ? 'aus' : 'an'})</option> : null}
            <option value="on">an – passende Hotels der Gruppe empfehlen</option>
            <option value="off">aus</option>
          </select>
        </label>
        <label>
          Tonalität
          <textarea
            rows={3}
            value={form.tone ?? ''}
            disabled={!scope.canManage}
            placeholder={scope.hotelId ? 'zusätzlich zur Gruppe, z. B. „Gäste mit Sie ansprechen, nordisch-herzlich“' : 'z. B. „Gäste mit Sie ansprechen, warm und präzise, keine Emojis“'}
            onChange={(event) => setForm({ ...form, tone: event.target.value })}
          />
        </label>
        {error ? <p className="admin-error">{error}</p> : null}
        {saved ? <p className="admin-muted">Gespeichert.</p> : null}
        {scope.canManage ? (
          <div className="admin-actions">
            <button type="submit" className="admin-btn">Speichern</button>
          </div>
        ) : (
          <p className="admin-muted">Einstellungen ändern Inhaber und Admins der Organisation.</p>
        )}
      </form>
    </>
  );
}
