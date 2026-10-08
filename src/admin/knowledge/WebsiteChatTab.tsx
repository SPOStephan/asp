import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { CONCIERGE_SECTION, conciergeConfig } from '../../lib/concierge';
import type { Rating, SourceRef } from '../../lib/knowledge';
import { supabase } from '../../lib/supabase';
import { formatCost, formatDate, useKnowledge } from './knowledgeScope';
import { AnswerCard, type Answer } from './TestChatTab';

type Row = {
  id: string;
  conversation_id: string;
  question: string;
  answer: string;
  model: string | null;
  sources: SourceRef[];
  gap: boolean;
  cost: number | null;
  created_at: string;
};

type Conversation = { id: string; started: string; messages: Row[]; cost: number };

// The chat on the hotel's website: switch it on, word it, and read and rate what guests asked.
export function WebsiteChatTab() {
  const { scope, version, changed } = useKnowledge();
  const hotelId = scope.hotelId!;
  const [form, setForm] = useState({ enabled: false, name: '', greeting: '', suggestions: '' });
  const [hotelName, setHotelName] = useState('');
  const [domain, setDomain] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [section, hotel, rows] = await Promise.all([
      supabase.from('hotel_sections').select('data').eq('hotel_id', hotelId).eq('section_key', CONCIERGE_SECTION).maybeSingle(),
      supabase.from('hotels').select('name, domains').eq('id', hotelId).maybeSingle(),
      supabase
        .from('chat_messages')
        .select('id, conversation_id, question, answer, model, sources, gap, cost, created_at')
        .eq('hotel_id', hotelId)
        .eq('channel', 'website')
        .order('created_at', { ascending: false })
        .limit(400),
    ]);
    const data = (section.data?.data ?? {}) as Record<string, unknown>;
    const name = (hotel.data?.name as string) ?? '';
    setHotelName(name);
    setDomain(((hotel.data?.domains as string[] | null) ?? []).find((item) => !item.startsWith('admin.') && item.includes('.')) ?? null);
    setForm({
      enabled: data.enabled === true,
      name: typeof data.name === 'string' ? data.name : '',
      greeting: typeof data.greeting === 'string' ? data.greeting : '',
      suggestions: Array.isArray(data.suggestions) ? data.suggestions.join('\n') : '',
    });
    const list = ((rows.data ?? []) as Row[]).reverse();
    const grouped = new Map<string, Conversation>();
    for (const row of list) {
      const item = grouped.get(row.conversation_id) ?? { id: row.conversation_id, started: row.created_at, messages: [], cost: 0 };
      item.messages.push(row);
      item.cost += row.cost ?? 0;
      grouped.set(row.conversation_id, item);
    }
    setConversations([...grouped.values()].sort((a, b) => b.started.localeCompare(a.started)));
    const ids = list.map((row) => row.id);
    if (ids.length) {
      const feedback = await supabase.from('chat_feedback').select('message_id, rating').in('message_id', ids);
      setRatings(Object.fromEntries((feedback.data ?? []).map((item) => [item.message_id, item.rating as Rating])));
    }
  }, [hotelId]);

  useEffect(() => {
    void load();
  }, [load, version]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    const data = {
      enabled: form.enabled,
      name: form.name.trim(),
      greeting: form.greeting.trim(),
      suggestions: form.suggestions.split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 4),
    };
    const { error: saveError } = await supabase
      .from('hotel_sections')
      .upsert({ hotel_id: hotelId, section_key: CONCIERGE_SECTION, data }, { onConflict: 'hotel_id,section_key' });
    if (saveError) setError(saveError.message);
    else {
      setSaved(true);
      changed();
    }
  }

  const defaults = conciergeConfig({}, hotelName);
  const total = conversations.reduce((sum, item) => sum + item.cost, 0);

  return (
    <>
      <form className="admin-form admin-form--wide admin-card kn-form" onSubmit={(event) => void save(event)}>
        <label className="admin-choice">
          <input type="checkbox" checked={form.enabled} disabled={!scope.canEdit} onChange={(event) => setForm({ ...form, enabled: event.target.checked })} />
          Chat auf der Website von {hotelName} einschalten
        </label>
        <p className="admin-muted">
          Ausgeschaltet zeigt das Chat-Symbol nur E-Mail und Telefon. Vor dem Einschalten im Testchat prüfen und die
          Datenschutzerklärung um den KI-Chat ergänzen.
        </p>
        <label>
          Name des Assistenten
          <input value={form.name} disabled={!scope.canEdit} placeholder={defaults.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label>
          Begrüßung
          <textarea rows={2} value={form.greeting} disabled={!scope.canEdit} placeholder={defaults.greeting} onChange={(event) => setForm({ ...form, greeting: event.target.value })} />
        </label>
        <label>
          Vorschläge zum Antippen (eine Frage pro Zeile, höchstens 4)
          <textarea
            rows={4}
            value={form.suggestions}
            disabled={!scope.canEdit}
            placeholder={'Darf ich meinen Hund mitbringen?\nWann ist das Spa geöffnet?\nWie komme ich mit der Bahn an?'}
            onChange={(event) => setForm({ ...form, suggestions: event.target.value })}
          />
        </label>
        {error ? <p className="admin-error">{error}</p> : null}
        {saved ? <p className="admin-muted">Gespeichert – auf der Website nach dem nächsten Laden sichtbar.</p> : null}
        <div className="admin-actions">
          {scope.canEdit ? <button type="submit" className="admin-btn">Speichern</button> : null}
          {domain ? (
            <a className="admin-btn admin-btn--ghost" href={`https://${domain}`} target="_blank" rel="noopener noreferrer">
              Website öffnen
            </a>
          ) : null}
        </div>
      </form>

      <h3>Gespräche auf der Website</h3>
      <p className="admin-muted">
        {conversations.length} Gespräche der letzten Zeit{total ? ` · Kosten ${formatCost(total)}` : ''}. Antworten lassen
        sich genau wie im Testchat bewerten; Red Flags korrigieren den Chat sofort.
      </p>
      <div className="kn-conversations">
        {conversations.map((conversation) => {
          const unrated = conversation.messages.filter((message) => !ratings[message.id]).length;
          const gaps = conversation.messages.filter((message) => message.gap).length;
          return (
            <article key={conversation.id} className="admin-card kn-conversation">
              <button type="button" className="kn-conversation__head" onClick={() => setOpen(open === conversation.id ? null : conversation.id)}>
                <strong>{conversation.messages[0]?.question}</strong>
                <span className="admin-muted">
                  {formatDate(conversation.started)} · {conversation.messages.length} Frage{conversation.messages.length === 1 ? '' : 'n'}
                  {gaps ? ` · ${gaps} Lücke${gaps === 1 ? '' : 'n'}` : ''}
                  {unrated ? ` · ${unrated} unbewertet` : ' · bewertet'}
                </span>
              </button>
              {open === conversation.id ? (
                <div className="kn-turns">
                  {conversation.messages.map((message) => {
                    const answer: Answer = {
                      id: message.id,
                      answer: message.answer,
                      gap: message.gap,
                      sources: message.sources ?? [],
                      model: message.model ?? '',
                      cost: message.cost,
                      rated: ratings[message.id],
                    };
                    return (
                      <div key={message.id} className="kn-turn">
                        <div className="kn-question">{message.question}</div>
                        <AnswerCard
                          question={message.question}
                          answer={answer}
                          onRated={(rating) => setRatings((current) => ({ ...current, [message.id]: rating }))}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </article>
          );
        })}
        {!conversations.length ? <p className="admin-muted">Noch keine Gespräche.</p> : null}
      </div>
    </>
  );
}
