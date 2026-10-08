import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { chunkText } from '../../lib/knowledge';
import { supabase } from '../../lib/supabase';
import { formatDate, hotelName, useKnowledge } from './knowledgeScope';

type Feedback = {
  id: string;
  message_id: string;
  hotel_id: string;
  rating: 'good' | 'improve' | 'wrong';
  comment: string | null;
  wrong_text: string | null;
  correct_text: string | null;
  group_wide: boolean;
  status: 'open' | 'resolved' | 'done';
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  message: { question: string; answer: string; model: string | null; sources: Array<{ title: string; cited: boolean; source_id: string }> } | null;
};

type Gap = { id: string; hotel_id: string; question: string; answer: string; created_at: string; channel: string };

type View = 'flags' | 'improve' | 'good' | 'gaps';

export function FeedbackTab() {
  const { scope, version, changed } = useKnowledge();
  const [view, setView] = useState<View>('flags');
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [showResolved, setShowResolved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    let feedbackQuery = supabase
      .from('chat_feedback')
      .select('*, message:chat_messages(question, answer, model, sources)')
      .order('created_at', { ascending: false })
      .limit(300);
    let gapQuery = supabase
      .from('chat_messages')
      .select('id, hotel_id, question, answer, created_at, channel')
      .eq('gap', true)
      .is('gap_resolved_at', null)
      .neq('channel', 'check')
      .order('created_at', { ascending: false })
      .limit(200);
    feedbackQuery = scope.hotelId ? feedbackQuery.eq('hotel_id', scope.hotelId) : feedbackQuery.eq('organization_id', scope.orgId);
    gapQuery = scope.hotelId ? gapQuery.eq('hotel_id', scope.hotelId) : gapQuery.eq('organization_id', scope.orgId);
    const [feedbackResult, gapResult] = await Promise.all([feedbackQuery, gapQuery]);
    if (feedbackResult.error || gapResult.error) setError((feedbackResult.error ?? gapResult.error)!.message);
    setFeedback((feedbackResult.data ?? []) as Feedback[]);
    setGaps((gapResult.data ?? []) as Gap[]);
  }, [scope.hotelId, scope.orgId]);

  useEffect(() => {
    void load();
  }, [load, version]);

  const flags = feedback.filter((item) => item.rating === 'wrong' && (showResolved || item.status === 'open'));
  const counts = {
    flags: feedback.filter((item) => item.rating === 'wrong' && item.status === 'open').length,
    improve: feedback.filter((item) => item.rating === 'improve').length,
    good: feedback.filter((item) => item.rating === 'good').length,
    gaps: gaps.length,
  };
  const labels: Record<View, string> = {
    flags: `🚩 Red Flags (${counts.flags} offen)`,
    improve: `👎 Verbesserungen (${counts.improve})`,
    good: `👍 Gute Antworten (${counts.good})`,
    gaps: `Wissenslücken (${counts.gaps})`,
  };

  return (
    <>
      <nav className="kn-subtabs">
        {(Object.keys(labels) as View[]).map((key) => (
          <button key={key} type="button" className={key === view ? 'is-on' : undefined} onClick={() => setView(key)}>
            {labels[key]}
          </button>
        ))}
      </nav>
      {error ? <p className="admin-error">{error}</p> : null}

      {view === 'flags' ? (
        <>
          <label className="admin-choice">
            <input type="checkbox" checked={showResolved} onChange={(event) => setShowResolved(event.target.checked)} />
            Erledigte zeigen
          </label>
          {flags.map((item) => (
            <RedFlag key={item.id} item={item} onChanged={() => void load().then(changed)} />
          ))}
          {!flags.length ? <p className="admin-muted">Keine offenen Red Flags.</p> : null}
        </>
      ) : null}

      {view === 'improve' || view === 'good' ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Frage</th>
              <th>Antwort</th>
              <th>{view === 'improve' ? 'Hinweis' : 'Anmerkung'}</th>
              {!scope.hotelId ? <th>Hotel</th> : null}
              <th>Datum</th>
            </tr>
          </thead>
          <tbody>
            {feedback
              .filter((item) => item.rating === view)
              .map((item) => (
                <tr key={item.id}>
                  <td>{item.message?.question}</td>
                  <td className="kn-cell-long">{item.message?.answer}</td>
                  <td>{item.comment ?? '–'}</td>
                  {!scope.hotelId ? <td>{hotelName(scope, item.hotel_id)}</td> : null}
                  <td>{formatDate(item.created_at)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : null}
      {view === 'improve' ? <p className="admin-muted">Daraus übernommene Regeln stehen unter „Antwortregeln“.</p> : null}

      {view === 'gaps' ? (
        <>
          <p className="admin-muted">
            Fragen, die der Chat mit dem vorhandenen Wissen nicht beantworten konnte. Eine Antwort hier eintragen – ab dann
            weiß er es.
          </p>
          {gaps.map((gap) => (
            <GapItem key={gap.id} gap={gap} onChanged={() => void load().then(changed)} />
          ))}
          {!gaps.length ? <p className="admin-muted">Keine offenen Wissenslücken.</p> : null}
        </>
      ) : null}
    </>
  );
}

function RedFlag({ item, onChanged }: { item: Feedback; onChanged: () => void }) {
  const { scope } = useKnowledge();
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const cited = item.message?.sources.filter((source) => source.cited) ?? [];

  async function resolve(event: FormEvent) {
    event.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error: updateError } = await supabase
      .from('chat_feedback')
      .update({ status: 'resolved', resolution: note || null, resolved_at: new Date().toISOString(), resolved_by: user?.id ?? null })
      .eq('id', item.id);
    if (updateError) setError(updateError.message);
    else onChanged();
  }

  return (
    <article className={`admin-card kn-flag-card${item.status === 'open' ? ' is-red' : ''}`}>
      <header>
        <strong>{item.message?.question}</strong>
        <span className="admin-muted">
          {formatDate(item.created_at)}
          {!scope.hotelId ? ` · ${hotelName(scope, item.hotel_id)}` : ''} · {item.message?.model ?? ''} ·{' '}
          {item.status === 'open' ? 'offen' : `erledigt ${formatDate(item.resolved_at)}`}
        </span>
      </header>
      <dl>
        <dt>Antwort</dt>
        <dd>{item.message?.answer}</dd>
        {item.wrong_text ? (
          <>
            <dt>Falsch</dt>
            <dd className="kn-wrong">{item.wrong_text}</dd>
          </>
        ) : null}
        <dt>Richtig (gilt als Korrektur{item.group_wide ? ' für die ganze Gruppe' : ''})</dt>
        <dd className="kn-right">{item.correct_text}</dd>
        <dt>Zitierte Quellen (zum Prüfen markiert)</dt>
        <dd>{cited.length ? cited.map((source) => source.title).join(' · ') : 'keine – die Antwort hatte keinen Beleg'}</dd>
        {item.resolution ? (
          <>
            <dt>Erledigt mit</dt>
            <dd>{item.resolution}</dd>
          </>
        ) : null}
      </dl>
      {item.status === 'open' ? (
        scope.canManage ? (
          <form className="admin-actions" onSubmit={(event) => void resolve(event)}>
            <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Was wurde berichtigt? (z. B. PDF Gästemappe Seite 4 korrigiert)" />
            <button type="submit" className="admin-btn">Als erledigt markieren</button>
          </form>
        ) : (
          <p className="admin-muted">Schließen können Inhaber und Admins der Organisation.</p>
        )
      ) : null}
      {error ? <p className="admin-error">{error}</p> : null}
    </article>
  );
}

function GapItem({ gap, onChanged }: { gap: Gap; onChanged: () => void }) {
  const { scope } = useKnowledge();
  const [answer, setAnswer] = useState('');
  const [groupWide, setGroupWide] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const { data, error: sourceError } = await supabase
      .from('knowledge_sources')
      .insert({ organization_id: scope.orgId, hotel_id: groupWide ? null : gap.hotel_id, kind: 'text', title: gap.question.slice(0, 140), meta: { gap_message_id: gap.id } })
      .select('id')
      .single();
    if (sourceError) return setError(sourceError.message);
    const id = (data as { id: string }).id;
    const { error: chunkError } = await supabase
      .from('knowledge_chunks')
      .insert(chunkText(answer).map((content, position) => ({ source_id: id, position, heading: gap.question, content })));
    if (chunkError) return setError(chunkError.message);
    await supabase.from('chat_messages').update({ gap_resolved_at: new Date().toISOString() }).eq('id', gap.id);
    onChanged();
  }

  async function dismiss() {
    const { error: updateError } = await supabase.from('chat_messages').update({ gap_resolved_at: new Date().toISOString() }).eq('id', gap.id);
    if (updateError) setError(updateError.message);
    else onChanged();
  }

  return (
    <form className="admin-card admin-form admin-form--wide kn-gap" onSubmit={(event) => void save(event)}>
      <strong>{gap.question}</strong>
      <span className="admin-muted">
        {formatDate(gap.created_at)} · {gap.channel === 'test' ? 'Testchat' : 'Website'}
        {!scope.hotelId ? ` · ${hotelName(scope, gap.hotel_id)}` : ''}
      </span>
      <label>
        Antwort
        <textarea rows={3} value={answer} onChange={(event) => setAnswer(event.target.value)} required />
      </label>
      <label>
        Gilt für
        <select value={groupWide ? 'group' : 'hotel'} onChange={(event) => setGroupWide(event.target.value === 'group')}>
          <option value="hotel">nur {hotelName(scope, gap.hotel_id)}</option>
          <option value="group" disabled={!scope.canManage}>
            ganze Gruppe{scope.canManage ? '' : ' – nur Inhaber/Admins'}
          </option>
        </select>
      </label>
      {error ? <p className="admin-error">{error}</p> : null}
      <div className="admin-actions">
        <button type="submit" className="admin-btn" disabled={!answer.trim()}>
          Antwort ins Wissen übernehmen
        </button>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void dismiss()}>
          Keine Lücke (ignorieren)
        </button>
      </div>
    </form>
  );
}
